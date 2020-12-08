/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
This file defined the functions that interact with user.
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */


// * * * * * * * * * * * * * * * * page transition * * * * * * * * * * * * * * * * *


/* ---
click previous page button (some switch limit are defined)
--- */
$('#prev-btn').click(function() {

	// required -> upload
	if (_current === _procedure[1]) {
		if (!confirm("返回上一步將會清空本頁設定，確定返回？\n（若想製作一份新文本，請按頁面重整按鈕。）")) return;
		reset();
	}

	// switch
	switchTo('prev');
});


/* ---
click next page button (some switch limit are defined)
--- */
$('#next-btn').click(function() {
	switch (_current) {

		// upload -> required
		case _procedure[0]:
			if (!checkUploadPage()) return;
			generateXMLContainer();
			displaySheetList();
			displayRequiredPage();
			displayOptionalPage();
			displayCustomPage();
			displayContentPage();
			activate();
			break;

		// required -> optional
		case _procedure[1]:
			if (!checkRequiredPage()) return;
			if (!fillRequiredData()) return;
			displayImport();
			break;

		// optional -> custom
		case _procedure[2]:
			pickCorpusMetaSetting();
			break;

		// custom -> content
		case _procedure[3]:
			if (!checkandSetCustomPage()) return;
			break;

		// content -> download
		case _procedure[4]:
			if (!(metatagName = checkContentPage())) return;
			setDocContent(metatagName);
			convertToXML();
			break;
	}

	// switch
	switchTo('next');
});


/* ---
switch to an interface
INPUT: string, direction, prev or next
--- */
function switchTo(dir) {
	var now = _procedure.indexOf(_current);
	var index = (dir === 'prev') ?now-1 :now+1;
	var section = _procedure[index];

	// before animation
	$('#' + section).addClass('target');
	$('#' + section).css('left', `${ (dir === 'prev') ?-100 :100 }vw`);
	$('#' + section).css('right', `${ (dir === 'prev') ?100 :-100 }vw`);

	// section enter
	$('#' + section).animate({
		left: 0,
		right: 0
	}, 300);

	// current exit
	$('#' + _current).animate({
		left: `${ (dir === 'prev') ?100 :-100 }vw`,
		right: `${ (dir === 'prev') ?-100 :100 }vw`
	}, 300);

	// after animation
	setTimeout(function() {
		$('#' + _current).removeClass('target');
		_current = section;
	}, 300);
	
	// update progress bar
	if (dir === 'prev') {
		$('nav .target').last().html(`<span>${ now+1 }</span>`);
		$('nav .target').last().removeClass('target');
		$('nav .target').last().removeClass('target');
		$('nav .target').last().html('<span></span>');

	} else {
		$('nav .target').last().html('<i class="fa fa-check" aria-hidden="true"></i>');
		$('nav .target').last().next().addClass('target');
		$('nav .target').last().next().addClass('target');
		$('nav .target').last().html('<span></span>');
	}

	// update switch button
	if (index === _procedure.length-1) $('#next-btn').hide();
	else $('#next-btn').show();
	if (index === 0) $('#prev-btn').hide();
	else $('#prev-btn').show();

	// access target sheet
	_sheet = $('#' + section + ' .setting-sheet.target').attr('name');
}


// * * * * * * * * * * * * * * * * explain * * * * * * * * * * * * * * * * *


/* ---
click explain button in tool bar and show document
--- */
$('#explain').click(function() {

	// data
	$('#lightbox-label').html('使用說明 <a href="assets/guide.pdf" download="表格文本轉換工具操作手冊.pdf"><i class="fa fa-cloud-download" aria-hidden="true"></i></a>');
	$('#lightbox-body').html(_explain);

	// activate functions
	$('.explain .dir-item').click(function(event) {
		let key = $(event.target).closest('.dir-item').attr('data-key');
		let originY = $('.content [data-key=1]').offset().top;
		let targetY = $(`.content [data-key=${ key }]`).offset().top;

		// move
		$('.explain .content').animate({
			scrollTop: targetY - originY
		}, 600);
	});

	// display
	$('#lightbox').modal('show');
});


// * * * * * * * * * * * * * * * * upload * * * * * * * * * * * * * * * * *


/* ---
click select all button in tool bar
--- */
$('#select-all').click(function() {
	$('.sheet-obj').each(function() {
		if (!$(this).is('.target')) toggleUsed($(this).find('.hover i').last());
	});
});


/* ---
click select reverse button in tool bar
--- */
$('#select-reverse').click(function() {
	$('.sheet-obj').each(function() {
		toggleUsed($(this).find('.hover i').last());
	});
});


/* ---
click delete all button in tool bar
--- */
$('#delete-all').click(function() {
	if (!confirm("確定刪除所有資料嗎？")) return;
	
	// delete
	_dataPool = [];
	_dataPool.length = 0;
	$('.sheet-obj').remove();
});


/* ---
click delete select button in tool bar
--- */
$('#delete-select').click(function() {
	if (!confirm("確定刪除所有已選取的資料嗎？")) return;
	
	// delete
	$('.sheet-obj').each(function() {
		if ($(this).is('.target')) deleteSheet($(this).attr('name'), false);
	});
});


/* ---
toggle sheet, used or not used
INPUT: jquery, html element of toggle icon
--- */
function toggleUsed(span) {
	$(span).closest('.sheet-obj').toggleClass('target');
	$(span).toggleClass('fa-check');
	$(span).toggleClass('fa-remove');
}


/* ---
delete uploaded sheet
INPUT: 1) string, sheet ID
       2) boolean, if need confirm
--- */
function deleteSheet(sheet, ask) {
	
	// pop out confirm
	if (ask) {
		if (!confirm(`確定刪除資料表「${ sheet }」嗎？`)) return;
	}

	// remove
	$(`.sheet-obj[name="${ sheet }"]`).remove();
	delete _dataPool[sheet];
	_dataPool.length--;
}


/* ---
show the content of a sheet
INPUT: string, sheet ID
--- */
function showSheet(sheet) {

	// data
	$('#lightbox-label').html(sheet);
	$('#lightbox-body').html(`
		<div style="height: 100%; padding: 1rem; overflow: scroll;">
			<table border="1">
				<thead></thead>
				<tbody></tbody>
			</table>
		</div>
	`);

	// display
	$('#lightbox').modal('show');

	// worker
	var worker = new Worker('js/worker.js');

	// receive
	worker.addEventListener('message', function($event) {

		/* data structure {
			loc: location,
			html: html in thead or tbody
		} */

		$('#lightbox-body ' + $event.data.loc).append($event.data.html);

	}, false);

	// send
	worker.postMessage({ 
		func: 'showsheet',
		content: _dataPool[sheet]
	});
}


// * * * * * * * * * * * * * * * * activation * * * * * * * * * * * * * * * * *


/* ---
activate UI interacted functions
--- */
function activate() {

	// sheet navigation
	$('.dir-item').click(function(event) {
		changeToSheet($(event.target).closest('.dir-item').attr('key'));
	});

	// tab navigation
	$('.tab-nav-item').click(function(event) {
		changeToTab($(event.target).closest('.tab-nav-item'));
	});

	// hintbox
	$('#optional .dropdown-item').hover(function(event) {
		hoverMetadata($(event.target).closest('.dropdown-item').attr('value'));
	});

	// import - delete all
	$('.delete-txt-all').click(function() {
		deleteTxtAll();
	});

	// import - upload multiple
	$('.upload-txt-multiple').click(function() {
		$('#txt-multiple').click();
	});

	// import - delete all
	$('.upload-txt-whole').click(function() {
		$('#txt-whole').click();
	});

	// dropdown
	activateDropdown('body');
}


/* ---
activate dropdown functions
INPUT: jquery/string, selector of activated range
--- */
function activateDropdown(span) {
	$(span).find('.dropdown-item').click(function(event) {
		selectMenuItem($(event.target).closest('.dropdown-item'));
	});
}


/* ---
activate mapping UI (content)
INPUT: jquery/string, selector of activated range
--- */
function activateMapping(span) {

	// dropdown
	activateDropdown(span);

	// remove
	$(span).find('.mapping-trash').click(function(event) {
		deleteMapping($(event.target).closest('.obj-item'));		
	});
}


/* ---
activate import txt table UI (content)
INPUT: 1) jquery/string, selector of activated range
	   2) array(string), id of activated item
	   3) bool, if need to activate drag function
--- */
function activateImport(span, items, drag) {
	items.forEach(id => {
		let target = $(span).find('.fa-' + id);

		// clear
		$(target).prop('onclick', null).off('click');

		// bind
		$(target).click(function(event) {
			_file = $(event.target).closest('.txt-td').attr('data-index');
			let j = _fileindex[_sheet][_file];
			if (id === 'eye') showTxt(_documents[j].filename, _buffer[_sheet].getImport(_file));
			else if (id === 'upload') $('#txt-single').click();
			else if (id === 'trash') deleteTxt(_documents[j].filename, true);
		});
	});

	if (drag) {
		let targets = $('#content .txt-td');

		// drag over
		$(targets).on('dragover', function(event) {
			event.preventDefault();
			event.stopPropagation();
			$(event.target).closest('.txt-td').addClass('hover');
		});

		// drag leave
		$(targets).on('dragleave', function(event) {
			event.preventDefault();
			event.stopPropagation();
			$(event.target).closest('.txt-td').removeClass('hover');
		});

		// drop
		$(targets).on('drop', function(event) {
			event.preventDefault();
			event.stopPropagation();
			let target = $(event.target).closest('.txt-td');
			$(target).removeClass('hover');
			_file = $(target).attr('data-index');
			dropNotMatchFile(event.originalEvent.dataTransfer.getData('text/plain'));
		});
	}
}


/* ---
activate new added not matching file (content)
INPUT: jquery/string, html element of not matching file
--- */
function activateNotMatchFile(span) {

	// click
	$(span).click(function(event) {
		let fileID = $(span).attr('key');
		showTxt(fileID.replace(/\|.+/, ''), _notMatch[_sheet][fileID]);
	});

	// drag
	$(span).on('dragstart', function(event) {
		event.originalEvent.dataTransfer.setData('text/plain', $(span).attr('key'));
	});
}


// * * * * * * * * * * * * * * * * setting * * * * * * * * * * * * * * * * *


/* ---
switch to specific sheet
INPUT: string, sheet ID
--- */
function changeToSheet(id) {
	var panel = $('#' + _current);

	// clear
	$(panel).find('.dir-item.target').removeClass('target');
	$(panel).find('.setting-sheet.target').removeClass('target');

	// find target
	$(panel).find(`.dir-item[key="${ id }"]`).addClass('target');
	$(panel).find(`.setting-sheet[name="${ id }"]`).addClass('target');

	// fixed buffer in #content 
	if (_current === _procedure[4]) {
		let buffer = $('#content .setting-sheet.target .txt-buffer');

		// copy local html to global area
		$('.txt-buffer.fixed').html($(buffer).html());

		// drag event
		$('.txt-buffer.fixed').children().each(function() {
			activateNotMatchFile(this);
		});
	}

	_sheet = id;
}


/* ---
switch to specific tab (content)
INPUT: jquery, html element of clicked tab navigation item
--- */
function changeToTab(span) {

	// clear
	$(span).siblings('.target').removeClass('target');
	$(span).closest('.tab-nav').siblings('.target').removeClass('target');

	// find target
	$(span).addClass('target');
	$(span).closest('.tab-nav').siblings(`.${ $(span).attr('key') }-obj`).addClass('target');
}


/* ---
click/select specific item in pop-out menu of button group
INPUT: jquery, html element of clicked list item
--- */
function selectMenuItem(span) {
	var btn = $(span).closest('.btn-group').find('button');
	var target = $(span).closest('.dropdown-item');
	var value = $(target).attr('value');
	var prevTarget = $(target).siblings('.target');
	var prevValue = $(prevTarget).attr('value');
	var select = true;

	// for each step
	switch (_current) {

		// required - show input UI
		case _procedure[1]:
			let input = $(span).closest('.button-input').find('input');
			if (value === 'udef') $(input).show();
			else $(input).hide();
			break;

		// optional
		case _procedure[2]:
			let header = $(span).closest('.optional-obj').attr('name');
			cancelOptionalMetadata(prevValue);							// clear previous setting
			select = setOptionalMetadata(value, header);				// new setting
			break;

		// content
		case _procedure[4]:
			let obj = $(span).closest('.obj-item');
			let name = $(obj).attr('name');
			let index = $(obj).attr('data-index');
			
			// show setting according to source
			if (name === 'source') {
				$(obj).siblings('.target').removeClass('target');
				if (value !== 'reset') $(obj).siblings(`.${ value }-obj`).addClass('target');

			// extract mapping content
			} else select = setContentByMapping(name, index, value);
			
			break;
	}

	// display
	if (select) {
		$(btn).html($(target).html());
		$(prevTarget).removeClass('target');
		$(target).addClass('target');
	}
}


/* ---
hover specific item in pop-out metadata menu (optional)
INPUT: string, metadata name
--- */
function hoverMetadata(name) {
	if (name === 'reset') return;

	// list of hints
	var listHtml = '';
	_metadata.spec[name].hint.forEach(item => {
		listHtml += `<li>${ item }</li>`;
	});

	// content
	$('#hint-title').html(`${ _metadata.spec[name].zh} | ${ name }`);
	$('#hint-content').html(`<ul>${ listHtml }</ul>`);

	// position
	var containerH = $('#optional .content').height();
	var boxH = $('#metadata-hintbox').height();
	var boxY = (containerH - boxH) / 2;
	$('#metadata-hintbox').css('top', `${ boxY }px`);
}


/* ---
delete a mapping setting (content)
INPUT: jquery, html element of clicked mapping
--- */
function deleteMapping(span) {
	let name = $(span).attr('name');
	let index = $(span).attr('data-index');
	_buffer[_sheet].removeMapping(name, index);
	$(span).remove();
}


/* ---
update UI of txt-td (content)
--- */
function updateTxtUI() {
	var target = $(`#content .setting-sheet.target .txt-td[data-index="${ _file }"]`);

	// status
	var exist = _buffer[_sheet].getImport(_file);
	$(target).find('*:nth-child(2)').html((exist) ?'<i class="fa fa-check" aria-hidden="true"></i>' :'<span>無</span>');

	// manipulate
	var funcs = (exist) ?'trash' :'upload';
	$(target).children().last().attr('class', 'fa fa-' + funcs);

	// activate
	activateImport(target, [funcs], false);
}


/* ---
delete txt data (content)
INPUT: 1) string, file name of deleted txt
	   2) bool, if need double check with user
--- */
function deleteTxt(filename, check) {

	// check with user before delete
	if (check && !confirm(`確定刪除 ${ filename }.txt 嗎？`)) return;
	
	// data
	_buffer[_sheet].removeImport(_file);

	// UI
	updateTxtUI();
}


/* ---
show txt data in modal (content)
INPUT: 1) string, showed txt name
	   2) string, txt content
--- */
function showTxt(filename, body) {

	// see if have uploaded
	if (!body) {
		alert("請先上傳檔案。");
		return;
	}

	// data
	$('#lightbox-label').html(filename + '.txt');
	$('#lightbox-body').html(`<div style="height: 100%; padding: 1rem; overflow-y: scroll;">${ body.replace(/\n/g, '<br>') }</div>`);

	// display
	$('#lightbox').modal('show');
}


/* ---
delete all txt data (content)
--- */
function deleteTxtAll() {
	if (confirm('確定刪除所有檔案嗎？')) {
		let buff = _buffer[_sheet].getImport();
		for (let index in buff) {
			if (buff[index]) {
				_file = index;
				deleteTxt(false);
			}
		}
	}
}


/* ---
trigger when user drop not match file in table row of a file
INPUT: string, id of not matching file
--- */
function dropNotMatchFile(fileID) {
	var j = _fileindex[_sheet][_file];

	// check cover
	if (_buffer[_sheet].getImport(_file)) {
		if (!confirm(`所選檔名「${ _documents[j].filename }.txt」已有資料，確定要配對嗎？`)) return;
	}

	// match
	_buffer[_sheet].setImport(_file, _notMatch[_sheet][fileID]);
	updateTxtUI();

	// remove not matching file
	$(`#content .setting-sheet.target .txt-buffer-item[key="${ fileID }"]`).remove();
	$(`.txt-buffer.fixed .txt-buffer-item[key="${ fileID }"]`).remove();
	delete _notMatch[_sheet][fileID];
}


/* ---
trigger when scroll the panel in content interface - show table header when header scroll out of screen
--- */
$('#content .content').scroll(function() {
	var contentL = $(this).offset().left;
	var contentT = $(this).offset().top;
	var contentH = $(this).css('height');

	// fixed header
	var headerT = $(this).find('.setting-sheet.target .txt-table').offset().top;
	var headerW = $(this).find('.setting-sheet.target .txt-table').css('width');
	$('.txt-table.fixed').css('width', headerW);
	$('.txt-table.fixed').css('left', contentL + 'px');
	$('.txt-table.fixed').css('top', contentT + 'px');

	// fixed buffer
	var bufferL = $(this).find('.setting-sheet.target .txt-buffer').offset().left;
	var bufferW = $(this).find('.setting-sheet.target .txt-buffer').css('width');
	$('.txt-buffer.fixed').css('left', bufferL + 'px');
	$('.txt-buffer.fixed').css('top', contentT + 'px');
	$('.txt-buffer.fixed').css('width', bufferW);
	$('.txt-buffer.fixed').css('height', contentH);

	// show fixed or not
	if ($(this).find('.setting-sheet.target .import-obj.target').length <= 0) visibilityOfFixed(false);
	else visibilityOfFixed(headerT < contentT);
});


/* ---
show or hide fixed element
INPUT: bool, if show
--- */
function visibilityOfFixed(show) {
	if (show) {
		$('.txt-table.fixed').show();
		$('.txt-buffer.fixed').show();
	} else {
		$('.txt-table.fixed').hide();
		$('.txt-buffer.fixed').hide();
	}
}


// * * * * * * * * * * * * * * * * download * * * * * * * * * * * * * * * * *


/* ---
download DocuXML to computer
--- */
$('#output-filename button').click(function() {

	// data
	var textFileAsBlob = new Blob([_xml], { type: 'text/xml' });
	var filename = $('#output-filename input').val().trim();
	if (filename === '') filename = '我的文獻集-' + now();

	// download
	var downloadLink = document.createElement("a");
	downloadLink.download = filename.split('.')[0];
	downloadLink.innerHTML = "Download File";

	// Chrome allows the link to be clicked without actually adding it to the DOM.
	if (window.webkitURL != null) { 
		downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
	
	// Firefox requires the link to be added to the DOM before it can be clicked.
	} else {
		downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
		downloadLink.onclick = destroyClickedElement;
		downloadLink.style.display = "none";
		document.body.appendChild(downloadLink);
	}

	downloadLink.click();
});


/* ---
upload DocuXML to DocuSky directly
--- */
$('#output-dbname button').click(function(event) {
	_docuSkyObj.manageDbList(event, uploadXML2DocuSky);
});

