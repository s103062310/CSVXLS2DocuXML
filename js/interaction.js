/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
This file defined the functions that interact with user.
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */


// * * * * * * * * * * * * * * * * page transition * * * * * * * * * * * * * * * * *


/* ---
click previous page button (some switch limit are defined)
INPUT: none
OUTPUT: none
--- */
$('#prevPage').click(function() {

	// required -> upload
	if (_current === _procedure[1]) {
		if (!confirm("返回上一步將會清空本頁設定，確定返回？\n（若想製作一份新文本，請按頁面重整按鈕。）")) return;
		resetSetting();
	}

	// switch
	var index = _procedure.indexOf(_current);
	switchTo(_procedure[index-1], 'prev');
});


/* ---
click next page button (some switch limit are defined)
INPUT: none
OUTPUT: none
--- */
$('#nextPage').click(function() {
	switch (_current) {

		// upload -> required
		case _procedure[0]:
			if (!checkUploadPage()) return;
			generateXMLContainer();
			displayTableList();
			displayRequiredPage();
			displayOptionalPage();
			displayCustomPage();
			displayContentPage();
			break;

		// required -> optional
		case _procedure[1]:
			if (!checkRequiredPage()) return;
			if (!fillRequiredData()) return;
			displayImportTXT();
			break;

		// optional -> custom
		case _procedure[2]:
			break;

		// custom -> content
		case _procedure[3]:
			if (!checkandSetCustomPage()) return;
			break;

		// content -> download
		case _procedure[4]:
			if (!checkContentPage()) return;
			convertToXML();
			break;
	}

	// switch
	var index = _procedure.indexOf(_current);
	switchTo(_procedure[index+1], 'next');
});


/* ---
switch to an interface
INPUT: 1) string, interface name
	   2) string, direction, prev or next
OUTPUT: none
--- */
function switchTo($interface, $dir) {
	
	// don't do anything if we are currently animating
	if ($('.animating').length > 0) return;

	// set panel
	$(`#${ _current }Interface`).attr('class', 'panelWrapper exit ' + $dir);
	$(`#${ $interface }Interface`).attr('class', 'panelWrapper enter ' + $dir);

	// start animation
	setTimeout(function() {
		$('#toolWrapper').addClass('animating');
	}, 0);

	// update progress bar
	if ($dir === 'next') {
		$(`#${ _current } span`).attr('class', 'glyphicon glyphicon-ok');
		$(`#${ _current }-${ $interface }`).addClass('target');
		$(`#${ $interface }`).addClass('target');
		$(`#${ $interface } span`).addClass('circle');
		$(`#${ $interface } span`).empty();
	} else if ($dir === 'prev') {
		$(`#${ _current }`).removeClass('target');
		$(`#${ _current } span`).removeClass();
		$(`#${ _current } span`).html(_procedure.indexOf(_current) + 1);
		$(`#${ $interface }-${ _current }`).removeClass('target');
		$(`#${ $interface } span`).attr('class', 'circle');
	}

	// update switch button
	if ($interface === _procedure[_procedure.length-1]) $('#nextPage').css('display', 'none');
	else $('#nextPage').css('display', 'grid');
	if ($interface === _procedure[0]) $('#prevPage').css('display', 'none');
	else $('#prevPage').css('display', 'grid');
	
	// stop animation
	setTimeout(function() {
		$(`#${ _current }Interface`).attr('class', 'panelWrapper');
		$(`#${ $interface }Interface`).attr('class', 'panelWrapper current');
		$('#toolWrapper').removeClass('animating');
		_current = $interface;
	}, 600);

	// access target sheet
	_sheet = $(`#${ $interface }Interface .settingTab.target`).attr('name');
}


// * * * * * * * * * * * * * * * * light box * * * * * * * * * * * * * * * * *


/* ---
click usage button in tool bar and show usage document
INPUT: none
OUTPUT: none
--- */
$('#usage').click(function() {
	showLightBox();

	// data
	var name = `使用說明 
				<a href="assets/guide.pdf" download="表格文本轉換工具操作手冊.pdf">
					<span class="glyphicon glyphicon-cloud-download"></span>
				</a>`;
	var text = $('#explainText').html();

	// display
	$('#lightbox-filename > h1').html(name);
	$('#lightbox-text').html(text);
	$('#lightbox-text').addClass('explainInterface');
});


/* ---
click close button in lightbox
INPUT: none
OUTPUT: none
--- */
$('#lightbox-close').click(function() {
	if ($('.animating').length > 0) return;	// don't do anything if we are currently animating
	$('#lightbox-text').removeClass('explainInterface');
	$('#lightbox').css('display', 'none');
});


/* ---
pop out lightbox with animation
INPUT: none
OUTPUT: none
--- */
function showLightBox() {

	// don't do anything if we are currently animating
	if ($('.animating').length > 0) return;

	// show up
	$('#lightbox').css('display', 'block');
	$('#lightbox-bg').attr('class', 'popOut fade');
	$('#lightbox-content').attr('class', 'popOut scale');

	// start animation
	setTimeout(function() {
		$('#lightbox').addClass('animating');
	}, 0);

	// stop animation
	setTimeout(function() {
		$('#lightbox-bg').removeClass();
		$('#lightbox-content').removeClass();
		$('#lightbox').removeClass('animating');
	}, 600);
}


/* ---
scroll to correspond explain section
INPUT: string, selector of target that want to scroll to
OUTPUT: none
--- */
function jumpToSection($selector) {
	var originY = $('#lightbox h2[key=1]').offset().top;
	var targetY = $($selector).offset().top;

	// move
	$('#lightbox .explainContent').animate({
		scrollTop: targetY - originY
	}, 600);
}


// * * * * * * * * * * * * * * * * upload * * * * * * * * * * * * * * * * *


/* ---
click select all button in tool bar
INPUT: none
OUTPUT: none
--- */
$('#selectAll').click(function() {
	$('.fileCover').each( function(i) {
		if (!$(this).is('.chose')) toggleUsed(this);
	});
});


/* ---
click select reverse button in tool bar
INPUT: none
OUTPUT: none
--- */
$('#selectReverse').click(function() {
	$('.fileCover').each( function(i) {
		toggleUsed(this);
	});
});


/* ---
click delete all button in tool bar
INPUT: none
OUTPUT: none
--- */
$('#deleteAll').click(function() {
	if (!confirm("確定刪除所有資料嗎？")) return;
	
	// delete
	_dataPool = [];
	_dataPool.length = 0;
	_inputFiles = []
	$('.fileCover').remove();
});


/* ---
click delete select button in tool bar
INPUT: none
OUTPUT: none
--- */
$('#deleteSelect').click(function() {
	if (!confirm("確定刪除所有已選取的資料嗎？")) return;
	
	// delete
	$('.fileCover').each( function(i) {
		if ($(this).is('.chose')) deleteSheet($(this).attr('name'), false);
	});
});


/* ---
toggle sheet, used or not used
INPUT: object, html element of sheet block
OUTPUT: none
--- */
function toggleUsed($this) {

	// ok -> remove
	if ($($this).is('.chose')) {
		$($this).removeClass('chose');
		$($this).find('.glyphicon-ok').attr('class', 'glyphicon glyphicon-remove');

	// remove -> ok
	} else {
		$($this).addClass('chose');
		$($this).find('.glyphicon-remove').attr('class', 'glyphicon glyphicon-ok');
	}
}


/* ---
delete uploaded sheet
INPUT: 1) string, sheet ID
       2) boolean, if need confirm
OUTPUT: none
--- */
function deleteSheet($sheet, $confirm) {
	
	// pop out confirm
	if ($confirm) {
		if (!confirm(`確定刪除 ${ $sheet } ？`)) return;
	}

	// get filename
	var filename = $sheet.split('--')[0];

	// remove
	delete _dataPool[$sheet];
	_dataPool.length--;
	_inputFiles[filename]--;
	$(`.fileCover[name="${ $sheet }"]`).remove();

	// check input files
	if (_inputFiles[filename] === 0) delete _inputFiles[filename];
}


/* ---
show the content of a sheet
INPUT: string, sheet ID
OUTPUT: none
--- */
function showSheet($sheet) {
	showLightBox();

	var table = `<table border="1">
					<thead></thead>
					<tbody></tbody>
				</table>`;

	// display
	$('#lightbox-filename > h1').html($sheet);
	$('#lightbox-text').html(table);

	// worker
	var worker = new Worker('js/worker.js');

	// receive
	worker.addEventListener('message', function($event) {

		/* data structure {
			loc: location,
			html: html in thead or tbody
		} */

		$(`#lightbox-text ${ $event.data.loc }`).append($event.data.html);

	}, false);

	// send
	worker.postMessage({ 
		func: 'showsheet',
		content: _dataPool[$sheet]
	});
}


// * * * * * * * * * * * * * * * * setting * * * * * * * * * * * * * * * * *


/* ---
switch to specific sheet (for required/optional/custom/content interface)
INPUT: string, sheet ID
OUTPUT: none
--- */
function changeToSheet($sheet) {
	var interface = $(`#${ _current }Interface`);

	// clear
	$(interface).find('.tableList .target').removeClass('target');
	$(interface).find('.settingTab.target').removeClass('target');

	// find target
	$(interface).find(`.tableList li[key="${ $sheet }"]`).addClass('target');
	$(interface).find(`.settingTab[name="${ $sheet }"]`).addClass('target');

	// fixed not match element in content interface
	if (_current === _procedure[4]) {
		let notMatch = $('#contentInterface .settingTab.target .notMatch');

		// copy local html to global area
		$('.notMatch.fixed').html($(notMatch).html());

		// drag event
		$(notMatch).find('.notMatchFile').each(function() {
			document.querySelector(`.notMatch.fixed .notMatchFile[name="${ $(this).attr('name') }"]`).addEventListener('dragstart', dragNotMatchFileStart);
		});
	}

	_sheet = $sheet;
}


/* ---
click button group and pop-out a dropdown/dropup menu
INPUT: object, html element of clicked button group
OUTPUT: none
--- */
function clickMenuBtn($this) {
	var containerY = $(`#${ _current }Interface .settingPanel`).offset().top;
	var containerH = $(`#${ _current }Interface .settingPanel`).height();
	var clickedY = $($this).offset().top;
	var clickedH = $($this).height();
	var menuH = (containerH - clickedH) / 2;

	// set menu height
	$($this.parentElement).find('ul').css('max-height', `${ menuH }px`);

	// modify direction of popped out menu to up
	if (containerY + containerH - clickedY - clickedH < menuH) $($this.parentElement).addClass('dropup');
	else $($this.parentElement).removeClass('dropup');
}


/* ---
click/select specific item in pop-out menu of button group
INPUT: object, html element of clicked list item
OUTPUT: none
--- */
function selectMenuItem($this) {

	// get information
	var prevValue = $($this.parentElement.parentElement).find('.text-only').attr('value');
	var itemName = $($this.parentElement.parentElement.parentElement).attr('name');
	var value = $($this).attr('value');
	var select = true;

	// for each interface
	switch (_current) {

		// required
		case _procedure[1]:

			// show input UI
			let input = $($this.parentElement.parentElement.parentElement).find('input');
			if (itemInList(value, _custom)) $(input).css('display', 'block');
			else $(input).css('display', 'none');

			break;

		// optional
		case _procedure[2]:
			cancelOptionalMetadata(prevValue);				// clear previous setting
			select = setOptionalMetadata(value, itemName);	// new setting
			break;

		// content
		case _procedure[4]:
			
			// source
			if (itemName === 'contentSource') {
				showContentSetting(value);
				setDocContentSource(value);
			}

			// extract content of doc_content, Metatags, Comment, Events
			else {
				let index = $($this.parentElement.parentElement.parentElement).attr('key');
				select = setDocContent(index, value);
			}
			
			break;
	}

	// display
	if (select) {
		$($this.parentElement.parentElement).find('.text-only').attr('value', value);
		$($this.parentElement.parentElement).find('.text-only').html($this.innerText);
		$($this.parentElement).find('.selected').removeClass('selected');
		$($this).addClass('selected');
	}
}


/* ---
trigger when mouse is over a optional metadata item and put hint information in hintbox
INPUT: string, metadata name
OUTPUT: none
--- */
function showHint($metaname) {

	// list of hints
	var listHtml = '';
	_metadata[$metaname].hint.forEach(item => {
		listHtml += `<li>${ item }</li>`;
	});

	// content
	$('.hinttitle').html(`${ _metadata[$metaname].chinese} | ${ $metaname }`);
	$('.hintcontent').html(`<ul>${ listHtml }</ul>`);

	// position
	var containerH = $('#optionalInterface .settingPanel').height();
	var boxH = $('.metahintbox').height();
	var boxY = (containerH - boxH) / 2;
	$('.metahintbox').css('margin-top', `${ boxY }px`);
}


/* ---
add a new slot in custom metadata
INPUT: object, html element of add button
OUTPUT: none
--- */
function addCustomSlot($this) {

	// list of sheet header
	var listItem = '';
	_dataPool[_sheet][0].forEach(key => {
		listItem += `<li role="presentation" onclick="selectMenuItem(this)" value="${ key }" style="display: block;">
						${ key }
					</li>`;
	});
	
	// button
	var buttonGroup = displayBtnGroup(listItem);

	// custom metadata block
	var block = `<div class="customObj">
					<span>欄位名稱</span>
					<input type="text" name="metaname">
					<span><span class="glyphicon glyphicon-trash" onclick="deleteCustomSlot(this)"></span></span>
					
					<span>欄位資料</span>
					${ buttonGroup }
					<div></div>
					
					<span>超連結資料</span>
					${ buttonGroup }
					<label class="switch"><input type="checkbox" name="link"><span class="slider"></span></label>
				</div>`;
	
	// display
	$($this).before(block);
}


/* ---
delete a slot in custom metadata
INPUT: object, html element of delete button
OUTPUT: none
--- */
function deleteCustomSlot($this) {
	$($this.parentElement.parentElement).remove();
}


// * * * * * * * * * * * * * * * * content * * * * * * * * * * * * * * * * *


/* ---
switch to specific tab (for content interface)
INPUT: string, key of table
OUTPUT: none
--- */
function changeToTab($tabKey) {
	let settingTab = $('#contentInterface .settingTab.target');

	// clear
	$(settingTab).find('.tab div.target').removeClass('target');
	$(settingTab).find('.tagTab.target').removeClass('target');

	// find target
	$(settingTab).find(`.tab div[key="${ $tabKey }"]`).addClass('target');
	$(settingTab).find(`.tagTab[name="${ $tabKey }"]`).addClass('target');
}


/* ---
trigger when select a choice in 'content source' button group - show corresponding UI
INPUT: string, setting value that user selected
OUTPUT: none
--- */
function showContentSetting($type) {
	let target = $('#contentInterface .settingTab.target .tagTab.target');

	// reset
	$(target).find('.contentMapping').css('display', 'none');
	$(target).find('.importTXT').css('display', 'none');

	// from sheet
	if ($type === 'mapping') {
		$(target).find('.contentMapping').css('display', 'grid');
		_showFixedY = -1;

	// from txt
	} else if ($type === 'import') {
		$(target).find('.importTXT').css('display', 'grid');
		let headerY = $(target).find('.txtFilesHeader').offset().top;
		let containerY = $(target[0].parentElement).offset().top;
		_showFixedY = headerY - containerY;
	}
}


/* ---
add a new select slot in content mapping
INPUT: object, html element of add button
OUTPUT: none
--- */
function addNewSelectObj($this) {

	// list of header
	let listItem = '';
	_dataPool[_sheet][0].forEach(header => {
		listItem += `<li role="presentation" onclick="selectMenuItem(this)" value="${ header }" style="display: block;">${ header }</li>`;
	});

	// display UI
	var tag = $('#contentInterface .settingTab.target .tagTab.target').attr('name');
	var show = (tag === 'MetaTags') ?' style="display: block;"' :'';
	var block = `<div class="selectObj" key="${ $($this.parentElement).find('.selectObj').length }">
					${ displayBtnGroup(listItem) }
					<input type="text" placeholder="請輸入標籤名稱（半形英文）"${ show }>
					<span class="glyphicon glyphicon-trash" onclick="deleteSelectObj(this)"></span>
				</div>`;
	$($this).before(block);

	// corpus seeting
	if (tag === 'MetaTags') _corpusSetting[_sheet].tag.push({ name: '', title: '' });

	// data container
	for (let i in _fileindex[_sheet]) {
		let j = _fileindex[_sheet][i];
		if (tag === 'doc_content') _documents[j].doc_content.doc_content.mapping.push('');
		else if (tag === 'MetaTags') _documents[j].doc_content.MetaTags.push({ tagname: '', data: [] });
		else _documents[j].doc_content[tag].push([]);
	}
}


/* ---
delete a slot in content mapping
INPUT: object, html element of delete button
OUTPUT: none
--- */
function deleteSelectObj($this) {
	let tag = $('#contentInterface .settingTab.target .tagTab.target').attr('name');
	let index = parseInt($($this.parentElement).attr('key'));

	// delete corpus setting
	if (tag === 'MetaTags') _corpusSetting[_sheet].tag.splice(index, 1);

	// delete corresponded content
	for (let i in _fileindex[_sheet]) {
		let j = _fileindex[_sheet][i];
		if (tag === 'doc_content') _documents[j].doc_content.doc_content.mapping.splice(index, 1);
		else _documents[j].doc_content[tag].splice(index, 1);
	}

	// delete UI
	$($this.parentElement).remove();

	// modify UI key
	$('#contentInterface .settingTab.target .tagTab.target .selectObj').each(function(i) {
		$(this).attr('key', i);
	});
}


/* ---
click upload cloud icon in import txt table - upload corresponding txt file
INPUT: object, html element of upload span
OUTPUT: none
--- */
function clickUploadTXT($this) {

	// set target file
	$($this.parentElement).addClass('target');

	// click input
	$('#singleTXT').click();
}


/* ---
click trash can icon in import txt table - delete corresponding txt file
INPUT: object, html element of delete span
OUTPUT: none
--- */
function clickDeleteTXT($this) {
	var j = $($this.parentElement).attr('key');
	var filename = _documents[j].attr.filename;

	// check with user before delete
	if (!confirm("確定刪除 " + filename + ".txt 嗎？")) return;
	
	// delete
	_documents[j].doc_content.doc_content.import = [''];
	$($this.parentElement).html(displayTXTFile(j));
}


/* ---
click eye icon in import txt table - show the content of a txt file
INPUT: object, html element of show span
OUTPUT: none
--- */
function showTXT($this) {
	var hasContent = ($($this.parentElement).find('span[func="status"]').html() === '');
	var j = $($this.parentElement).attr('key');
	var filename = _documents[j].attr.filename;

	// see if have uploaded
	if (!hasContent) {
		alert("請先上傳檔案。");
		return;
	}

	// display
	showLightBox();
	$('#lightbox-filename > h1').html(filename);
	$('#lightbox-text').html(`<xmp style="white-space: pre-wrap;">${ _documents[j].doc_content.doc_content.import[0] }</xmp>`);
}


/* ---
click delete all button in tool bar in import txt table - delete all txt file
INPUT: none
OUTPUT: none
--- */
function deleteAllTXT() {
	if (confirm("確定刪除所有檔案嗎？")) {
		for (let i in _fileindex[_sheet]) {
			let j = _fileindex[_sheet][i];
			_documents[j].doc_content.doc_content.import = [''];
			$(`#contentInterface .settingTab.target .rowFile[key="${ j }"]`).html(displayTXTFile(j));
		}
	}
}


/* ---
trigger when scroll the panel in content interface - show table header when header scroll out of screen
INPUT: none
OUTPUT: none
--- */
$('#contentInterface .settingPanel').scroll(function() {

	// fixed header style
	var headerW = $(this).find('.settingTab.target .txtFilesHeader').width();
	var headerX = $(this).find('.settingTab.target .txtFilesHeader').offset().left;
	$('.txtFilesHeader.fixed').width(headerW);
	$('.txtFilesHeader.fixed').css('left', headerX.toString() + 'px');

	// not match block style
	var containerH = $(this).height();
	var containerW = $(this).find('.settingTab.target').width();
	var notmatchX = $(this).find('.settingTab.target .notMatch').offset().left;
	var notmatchW = (containerW * 0.98 - 5) / 3;
	$('.notMatch.fixed').css('height', containerH.toString() + 'px');
	$('.notMatch.fixed').css('width', notmatchW.toString() + 'px');
	$('.notMatch.fixed').css('left', notmatchX.toString() + 'px');
	$(this).find('.settingTab.target .notMatch').css('height', containerH.toString() + 'px');

	// show fixed header or not
	if (_showFixedY >= 0 && $(this).scrollTop() > _showFixedY) {
		$('.txtFilesHeader.fixed').css('display', 'grid');
		$('.notMatch.fixed').css('display', 'block');
	} else {
		$('.txtFilesHeader.fixed').css('display', 'none');
		$('.notMatch.fixed').css('display', 'none');
	}
});


// * * * * * * * * * * * * * * * * download * * * * * * * * * * * * * * * * *


/* ---
download DocuXML to computer
INPUT: none
OUTPUT: none
--- */
$('#outputFilename button').click(function() {

	// data
	var textFileAsBlob = new Blob([_xml], { type: 'text/xml' });
	var filename = $('#outputFilename input').val().trim();
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
INPUT: none
OUTPUT: none
--- */
$('#databaseName button').click(function($event) {
	_docuSkyObj.manageDbList($event, uploadXML2DocuSky);
});

