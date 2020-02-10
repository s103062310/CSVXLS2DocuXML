/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
This file defined the functions that interact with user.
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */


// * * * * * * * * * * * * * * * * page transition * * * * * * * * * * * * * * * * *


/* ---
click previous page
--- */
$('#prevPage').click(function() {

	// switch limit
	// required -> upload
	if (_current === _procedure[1]) {
		if (!confirm("返回上傳介面將會清空所有設定，確定返回？\n（若想製作一份新文本，請按頁面重整按鈕。）")) return;
		resetUploadData();

	// optional -> required
	} else if (_current === _procedure[2]) {
		if (!confirm("返回必填詮釋資料設定介面將會清空從外部匯入的內文純文字資料，確定返回？\n（若想製作一份新文本，請按頁面重整按鈕。）")) return;
		resetRequiredData();
	}

	// switch
	var index = _procedure.indexOf(_current);
	switchTo(_procedure[index-1], 'prev');
});


/* ---
click next page
--- */
$('#nextPage').click(function() {

	// switch limit
	// upload -> required
	if (_current === _procedure[0]) {
		if (selectTable() == false) return;

		displayTableList();
		displayRequiredPage();
		displayOptionalPage();
		displayContentPage();

		switchTo(_procedure[1], 'next');

	// required -> optional
	} else if (_current === _procedure[1]) {

		if (checkRequiredPage() == false) return;
		if (generateTXTData() == false) return;

		_temp['percentage'] = 0;
		$('#requiredInterface img').show();

		setTimeout(function(){
			displayImportTXT();
			$('#requiredInterface img').hide();
			switchTo(_procedure[2], 'next');
		}, 100);

	// optional -> content
	} else if (_current === _procedure[2]) {
		if (checkOptionalPage() == false) return;
		switchTo(_procedure[3], 'next');

	// content -> download
	} else if (_current === _procedure[3]) {
		_temp['percentage'] = 0;
		$('#contentInterface img').show();

		setTimeout(function(){
			if (convertToXML()) {
				let defaultDBName = now() + '-db';
				$('#databaseName input').attr('value', defaultDBName);
				$('#contentInterface img').hide();
				switchTo(_procedure[4], 'next');
			}
		}, 100);
	}
});


/* ---
switch to specific page
INPUT: 1) string, interface name
       2) string, direction, prev or next
--- */
function switchTo($interface, $dir) {
	
	// don't do anything if we are currently animating
	if ($('.animating').length > 0) return;

	// set panel
	$('#' + _current + 'Interface').attr('class', 'panelWrapper exit ' + $dir);
	$('#' + $interface + 'Interface').attr('class', 'panelWrapper enter ' + $dir);

	// start animation
	setTimeout(function() {
		$('#toolWrapper').addClass('animating');
	}, 0);

	// update progress bar
	if ($dir === 'next') {
		$('#' + _current + ' span').attr('class', 'glyphicon glyphicon-ok');
		$('#' + _current + '-' + $interface).addClass('target');
		$('#' + $interface).addClass('target');
		$('#' + $interface + ' span').addClass('circle');
		$('#' + $interface + ' span').empty();
	} else if ($dir === 'prev') {
		$('#' + _current).removeClass('target');
		$('#' + _current + ' span').removeClass();
		$('#' + _current + ' span').append(_procedure.indexOf(_current) + 1);
		$('#' + $interface + '-' + _current).removeClass('target');
		$('#' + $interface + ' span').attr('class', 'circle');
	}

	// update switch button
	if ($interface === _procedure[_procedure.length-1]) $('#nextPage').css('display', 'none');
	else $('#nextPage').css('display', 'grid');
	if ($interface === _procedure[0]) $('#prevPage').css('display', 'none');
	else $('#prevPage').css('display', 'grid');
	
	// stop animation
	setTimeout(function() {
		$('#' + _current + 'Interface').attr('class', 'panelWrapper');
		$('#' + $interface + 'Interface').attr('class', 'panelWrapper current');
		$('#toolWrapper').removeClass('animating');
		_current = $interface;
	}, 600);
}


// * * * * * * * * * * * * * * * * light box * * * * * * * * * * * * * * * * *


/* ---
click close button in lightbox
--- */
$('#lightbox-close').click(function() {
	if ($('.animating').length > 0) return;	// don't do anything if we are currently animating
	$('#lightbox').css('display', 'none');
});


/* ---
click usage button in right-up screen and show usage document
--- */
$('#usage').click(function() {
	var explainContent = $('#explainText').html();
	showLightBox('使用說明', explainContent);
});


/* ---
show the content of a sheet
INPUT: show button html element
--- */
function showSheet($this) {
	var sheetObj = $this.parentElement.parentElement;
	var sheet = $(sheetObj).find('.coverText')[0].innerText;
	var text = displayTable(sheet);
	showLightBox(sheet, text);
}


/* ---
show the content of a text file
INPUT: show button html element
--- */
function showTXT($this) {
	var filename = $($this.parentElement).attr('name');
	var tag = $($this.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement).attr('key');
	var table = $($this.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement).attr('key');

	// see if have uploaded
	var status = $($this.parentElement).find('span[func=status]');
	if ($(status)[0].innerText == '無') alert("請先上傳檔案。");
	else showLightBox(filename, _txtData[table][filename][tag]);
}


/* ---
pop out lightbox with animation
INPUT: 1) string, title
       2) string, content
--- */
function showLightBox($name, $text) {

	// don't do anything if we are currently animating
	if ($('.animating').length > 0) return;

	// update sheet name
	$('#lightbox-filename > h1').empty();
	$('#lightbox-filename > h1').append($name);

	// update sheet text
	$('#lightbox-text').empty();
	$('#lightbox-text').append($text);

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


// * * * * * * * * * * * * * * * * upload * * * * * * * * * * * * * * * * *


/* ---
select all button in tool bar of upload interface
--- */
$('#selectAll').click(function() {
	for (let i = 0; i < $('.fileCover').length; i++) {
		let color = $($('.fileCover')[i]).attr('style').split(' ')[1].split(';')[0];
		if (color === 'indianred') toggleUsed($($('.fileCover')[i]));
	}
});


/* ---
select reverse button in tool bar of upload interface
--- */
$('#selectReverse').click(function() {
	for (let i = 0; i < $('.fileCover').length; i++) toggleUsed($($('.fileCover')[i]));
});


/* ---
toggle sheet item
INPUT: sheet item html element
--- */
function toggleUsed($this) {
	var ok = $($this).find('.glyphicon-ok')[0];
	var remove = $($this).find('.glyphicon-remove')[0];

	// ok -> remove
	if (ok != undefined) {
		$($this).attr('style', 'border-color: indianred;');
		$(ok).attr('class', 'glyphicon glyphicon-remove');

	// remove -> ok
	} else {
		$($this).attr('style', 'border-color: limegreen;');
		$(remove).attr('class', 'glyphicon glyphicon-ok');
	}
}


/* ---
delete uploaded sheet
INPUT: deleted html element
--- */
function deleteUploadSheet($this) {

	// get sheet information
	var sheetObj = $this.parentElement.parentElement;
	var sheet = $(sheetObj).find('.coverText')[0].innerText;
	var pos = sheet.indexOf('-');
	var filename = sheet.substring(0, pos);
	var sheetName = sheet.substring(pos + 1, sheet.length);

	// pop out confirm box
	if (confirm("確定刪除" + sheet + "?")) {

		// remove
		delete _dataPool[sheet];
		_dataPool.length--;
		let itemPos = _inputFiles[filename].indexOf(sheetName);
		if (itemPos >= 0) _inputFiles[filename].splice(itemPos, 1);
		$(sheetObj).remove();

		// check input files
		if (_inputFiles[filename].length === 0) {
			delete _inputFiles[filename];
			_inputFiles.length--;
		}
	}

	//console.log(_inputFiles);
	//console.log(_dataPool);
}


// * * * * * * * * * * * * * * * * setting * * * * * * * * * * * * * * * * *


/* ---
switch to specific table (for required/optional/content interface)
INPUT: string, key of table
--- */
function changeTableListItem($tableKey) {
	$('#' + _current + 'Interface .tableList .target').removeClass('target');
	$('#' + _current + 'Interface .settingTab.target').removeClass('target');
	$('#' + _current + 'Interface .tableList li[key=\'' + $tableKey + '\']').addClass('target');
	$('#' + _current + 'Interface .settingTab[key=\'' + $tableKey + '\']').addClass('target');

	// global uploader
	if (_current === _procedure[3]) {
		let tag = $('#contentInterface .settingTab[key=\'' + $tableKey + '\'] .tab .target').attr('key');
		$('.txtFilesHeader.fixed .glyphicon').attr('onclick', "uploadTXT('" + $tableKey + "', undefined, '" + tag + "', false)");
	}
}


/* ---
switch to specific tab (tag for content interface)
INPUT: string, key of table
--- */
function changeTab($tabKey) {
	$('#contentInterface .settingTab.target .tab div.target').removeClass('target');
	$('#contentInterface .settingTab.target div.target').removeClass('target');
	$('#contentInterface .settingTab.target .tab div[key=\'' + $tabKey + '\']').addClass('target');
	$('#contentInterface .settingTab.target div[key=\'' + $tabKey + '\']').addClass('target');
	
	// global uploader
	let table = $('#contentInterface .settingTab.target').attr('key');
	$('.txtFilesHeader.fixed .glyphicon').attr('onclick', "uploadTXT('" + table + "', undefined, '" + $tabKey + "', false)");
}


/* ---
click specific dropdown menu
INPUT: select html element
--- */
function selectClicked($this) {
	var clickedY = $($this).offset().top;
	var screenHeight = $(document).height();
	if (clickedY > 0.65 * screenHeight) $($this.parentElement).addClass('dropup');
	else $($this.parentElement).removeClass('dropup');
}


/* ---
select specific item in menu list
INPUT: item html element
--- */
function selectItem($this) {

	// get information
	var choice = $this.innerText;
	var result = $($this.parentElement.parentElement).find('.text-only');
	var selected = $($this.parentElement).find('.selected');
	var input = $($this.parentElement.parentElement.parentElement).find('input');
	var name = $($this.parentElement.parentElement.parentElement).attr('name');
	var tab = $this.parentElement.parentElement.parentElement.parentElement;

	// display
	$(result).empty();
	$(result).append(choice);
	$(selected).removeClass('selected');
	$($this).addClass('selected');

	// show input UI
	var pos = _customMeta.indexOf(choice);
	if (pos >= 0) {
		$(input).css('display', 'block');
		if (pos === 2) $(input).attr('placeholder', '請輸入自訂欄位名稱...');
		else if (pos === 3) $(input).attr('placeholder', '請輸入自訂欄位中超連結的文字...');
	} else {
		$(input).css('display', 'none');
	}

	// show content setting
	if (name === 'contentSource') {
		$(tab).find('.contentMapping').css('display', 'none');
		$(tab).find('.importTXT').css('display', 'none');

		if (choice === 'CSV/Excel 欄位') {
			$(tab).find('.contentMapping').css('display', 'grid');
			_temp['headerY'] = 10000;
		} else if (choice === '匯入純文字檔') {
			$(tab).find('.importTXT').css('display', 'grid');
			_temp['headerY'] = $(tab).find('.txtFilesHeader')[0].offsetTop;
		}
	}
}


// * * * * * * * * * * * * * * * * content * * * * * * * * * * * * * * * * *


/* ---
trigger when scroll the panel in content interface
show table header when header scroll out of screen
--- */
$('#contentInterface .settingPanel').scroll(function() {
	if ($(this).scrollTop() > _temp['headerY']) $('.txtFilesHeader.fixed').css('opacity', '1');
	else $('.txtFilesHeader.fixed').css('opacity', '0');
});


/* ---
upload a txt file to content (onclick)
INPUT: 1) string, table name
       2) string, filename
       3) string, tag name
       4) boolean, single txt = true, multi txt = false
--- */
function uploadTXT($table, $filename, $tag, $single) {
	$('#singleTXT').attr('target-table', $table);
	$('#singleTXT').attr('target-filename', $filename);
	$('#singleTXT').attr('target-tag', $tag);
	if ($single) $('#singleTXT').click();
	else $('#multiTXT').click();
}


/* ---
delete a txt file in content (onclick)
INPUT: 1) string, table name
       2) string, filename
       3) string, tag name
--- */
function deleteTXT($table, $filename, $tag) {
	delete _txtData[$table][$filename][$tag];
	displayDeleteTXT($table, $filename, $tag);
}


// * * * * * * * * * * * * * * * * download * * * * * * * * * * * * * * * * *


/* ---
download DocuXML to computer
--- */
$('#ouputFilename button').click(function() {

	// data
	var textFileAsBlob = new Blob([_xml], {type: 'text/xml'});
	var filename = $('#ouputFilename input').val();
	if (filename === '') filename = '我的文獻集';

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
$('#databaseName button').click(function($event) {
	var dbTitle = $("#databaseName input").val().trim();
	if (dbTitle === '') {
		alert("請輸入資料庫名稱。");
		return;
	}
	_docuSkyObj.manageDbList($event, uploadXML2DocuSky);
});

