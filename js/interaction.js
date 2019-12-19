



$('#contentInterface .settingPanel').scroll(function() {
	if ($(this).scrollTop() > _headerY) $('.txtFilesHeader.fixed').css('opacity', '1');
	else $('.txtFilesHeader.fixed').css('opacity', '0');
});


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


$('#prevPage').click(function() {

	// switch limit
	if (_current === _procedure[1]) {
		if (!confirm("返回上傳介面將會清空所有設定，確定返回？\n（若想製作一份新文本，請按頁面重整按鈕。）")) return;
		resetUploadData();
	} else if (_current === _procedure[2]) {
		if (!confirm("返回必填詮釋資料設定介面將會清空從外部匯入的內文純文字資料，確定返回？\n（若想製作一份新文本，請按頁面重整按鈕。）")) return;
		resetRequiredData();
	}

	// switch
	var interfacePos = _procedure.indexOf(_current);
	if (interfacePos === 0) return;
	else switchTo(_procedure[interfacePos-1], 'prev');

});


$('#nextPage').click(function() {

	// switch limit
	if (_current === _procedure[0]) {
		if (_inputFiles.length == 0) {
			alert("請先上傳 Excel 檔案。");
			return;
		}
		displayTableList();
		displayRequiredPage();
		displayOptionalPage();
		displayContentPage();
	} else if (_current === _procedure[1]) {
		if (checkRequirePage() == false) return;
		if (generateTXTData() == false) return;
		displayImportTXT();
	} else if (_current === _procedure[3]) {
		if (convertToXML() == false) return;
		let date = (new Date()).toDateString().replace(/ /g, '_');
		let defaultDBName = date + '-db';
		$('#databaseName input').attr('value', defaultDBName);
	}

	// switch
	var interfacePos = _procedure.indexOf(_current);
	if (interfacePos === _procedure.length-1) return;
	else switchTo(_procedure[interfacePos+1], 'next');

});


$('#usage').click(function() {
	var explainContent = $('#explainText').html();
	showLightBox('使用說明', explainContent);
});


$('#lightbox-close').click(function() {

	// don't do anything if we are currently animating
	if ($('.animating').length > 0) return;

	$('#lightbox').css('display', 'none');
});


$('#ouputFilename button').click(function() {
	var filename = $('#ouputFilename input').val();
	if (filename === '') filename = '我的文獻集';
	var textFileAsBlob = new Blob([_xml], {type: 'text/xml'});

	var downloadLink = document.createElement("a");
	downloadLink.download = filename.split('.')[0];
	downloadLink.innerHTML = "Download File";

	if (window.webkitURL != null) {
		// Chrome allows the link to be clicked
        // without actually adding it to the DOM.
        downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
	} else {
		// Firefox requires the link to be added to the DOM
        // before it can be clicked.
        downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
        downloadLink.onclick = destroyClickedElement;
        downloadLink.style.display = "none";
        document.body.appendChild(downloadLink);
	}

	downloadLink.click();

});


$('#databaseName button').click(function($event) {
	var dbTitle = $("#databaseName input").val().trim();
	if (dbTitle === '') {
		alert("請輸入資料庫名稱。");
		return;
	}
	_docuSkyObj.manageDbList($event, uploadXML2DocuSky(dbTitle));
});


function changeTableListItem($tableKey) {
	$('#' + _current + 'Interface .tableList .target').removeClass('target');
	$('#' + _current + 'Interface .settingTab.target').removeClass('target');
	$('#' + _current + 'Interface .tableList li[key=\'' + $tableKey + '\']').addClass('target');
	$('#' + _current + 'Interface .settingTab[key=\'' + $tableKey + '\']').addClass('target');
}


function changeTab($tabKey) {
	$('#contentInterface .settingTab.target .tab div.target').removeClass('target');
	$('#contentInterface .settingTab.target div.target').removeClass('target');
	$('#contentInterface .settingTab.target .tab div[key=\'' + $tabKey + '\']').addClass('target');
	$('#contentInterface .settingTab.target div[key=\'' + $tabKey + '\']').addClass('target');
}


function selectClicked($this) {
	var clickedY = $($this).offset().top;
	var screenHeight = $(document).height();
	if (clickedY > 0.6 * screenHeight) $($this.parentElement).addClass('dropup');
	else $($this.parentElement).removeClass('dropup');
}


function deleteUploadSheet($this) {

	// get sheet information
	var sheetObj = $this.parentElement.parentElement;
	var sheet = $(sheetObj).find('.coverText')[0].innerText;
	var pos = sheet.indexOf('-');
	var filename = sheet.substring(0, pos);
	var sheetName = sheet.substring(pos + 1, sheet.length-1);

	// pop out confirm box
	if (confirm("確定刪除" + sheet + "?")) {

		// remove
		delete _data[sheet];
		_data.length--;
		removeFromArray(_inputFiles[filename], sheetName);
		$(sheetObj).remove();

		// check input files
		if (_inputFiles[filename].length === 0) {
			delete _inputFiles[filename];
			_inputFiles.length--;
		}
	}

	//console.log(_inputFiles);
	//console.log(_data);
	
}


function showSheet($this) {
	var sheetObj = $this.parentElement.parentElement;
	var sheet = $(sheetObj).find('.coverText')[0].innerText;
	var text = displayTable(sheet);
	showLightBox(sheet, text);
}


function showTXT($this) {
	var filename = $($this.parentElement).attr('name');
	var tag = $($this.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement).attr('key');
	var table = $($this.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement).attr('key');

	// see if have uploaded
	var status = $($this.parentElement).find('span[func=status]');
	if ($(status)[0].innerText == '無') alert("請先上傳檔案。");
	else showLightBox(filename, _txtData[table][filename][tag]);
}


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
		if (choice === 'CSV/Excel 欄位') $(tab).find('.contentMapping').css('display', 'grid');
		else if (choice === '匯入純文字檔') {
			$(tab).find('.importTXT').css('display', 'grid');
			_headerY = $(tab).find('.txtFilesHeader')[0].offsetTop;
		}
	}

}


function deleteSelectObj($this) {
	$($this.parentElement).remove();
}







