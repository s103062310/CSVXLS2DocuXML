


document.getElementById('uploadInput').addEventListener('change', uploadFile, false);
document.getElementById('fileManager').addEventListener('dragenter', dragFileEnter, false);
document.getElementById('fileManager').addEventListener('dragleave', dragFileLeave, false);
document.getElementById('fileManager').addEventListener('dragover', dragFileOver, false);
document.getElementById('fileManager').addEventListener('drop', dropFile, false);

function load($type, $file, $function) {
	var reader = new FileReader();
	reader.onload = $function;
	if ($type === 'excel') reader.readAsBinaryString($file);
	else if ($type === 'text') reader.readAsText($file);
}

function uploadFile($event) {
	var files = $event.target.files;
	filesHandler(files);
}

function dragFileEnter($event) {
	$event.stopPropagation();
	$event.preventDefault();
	this.classList.add('managerHover');
}

function dragFileLeave($event) {
	$event.stopPropagation();
	$event.preventDefault();
	this.classList.remove('managerHover');
}

function dragFileOver($event) {
	$event.stopPropagation();
	$event.preventDefault();
}

function dropFile($event) {
	$event.stopPropagation();
	$event.preventDefault();
	this.classList.remove('managerHover');

	var dt = $event.dataTransfer;
	var files = dt.files;
	filesHandler(files);
}

function filesHandler($files) {

	// process for each selected file
	for (let i=0; i<$files.length; i++) {

		// filter non-ecxel files
		let fileTypePos = $files[i].name.indexOf('.');
		let fileType = $files[i].name.substring(fileTypePos+1, $files[i].name.length);
		if (!itemInList(fileType, _allowedFileType)) {
			alert("上傳檔案" + $files[i].name + "不符合檔案類型要求，請上傳副檔名為 .xls, .xlsx, .csv 的檔案。");
			return;
		}

		// file hasn't loaded before - load the whole file
		if (!fileInSystem($files[i].name)) {
			load('excel', $files[i], loadFile($files[i], false));

		// file has loaded before
		} else {
			if (confirm("已有相同檔名的檔案匯入本工具，確定繼續上傳" + $files[i].name + "?")) {
				load('excel', $files[i], loadFile($files[i], true));
			}
		}

	}

	console.log(_inputFiles);
	console.log(_data);

}


function loadFile($file, $suffix) {
	return function($event) {

		// get file information
		var filename = ($suffix) ? addSuffix($file.name.split('.')[0]) :$file.name.split('.')[0];
		var data = $event.target.result;
		var wb = XLSX.read(data, {type: 'binary'});

		// record file in system
		_inputFiles[filename] = wb.SheetNames;
		_inputFiles.length++;
		_sheetNum += wb.SheetNames.length;

		// css row
		var rowNum = Math.ceil((_sheetNum+1)/3).toString();
		$('#fileManager').css('grid-template-rows', 'repeat(' + rowNum + ', 15vh)');

		// build data structure and show UI
		for (let i=0; i<wb.SheetNames.length; i++) {

			// parse excel file
			let sheet = filename + '-' + wb.SheetNames[i];
			let header = XLSX.utils.sheet_to_csv(wb.Sheets[wb.SheetNames[i]]).split('\n')[0].split(',');
			let content = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[i]]);

			// save file data in system
			content.splice(0, 0, filterEmpty(header));
			_data[sheet] = content;
			_data.length++;

			// UI
			displayUploadSheet(sheet);
		}

	}
}



function generateTXTData() {

	// construct data container
	_txtData = [], allFiles = [];
	for (let table in _data) {

		// access information
		let filenameSetting = $('#requiredInterface .settingTab[key=\'' + table + '\'] .menu[name=filename] button.text-only');
		let choice = $(filenameSetting)[0].innerText;
		let barIndex = choice.indexOf('|');
		
		// initialize
		_txtData[table] = [];
		_txtData.length++;
		_txtData[table].length += _data[table].length-1;

		// auto generate
		if (barIndex == -1) {
			let inputSetting = $('#requiredInterface .settingTab[key=\'' + table + '\'] .menu[name=filename] input');
			let prefix = $(inputSetting)[0].value;
			for (let i=0; i<_data[table].length-1; i++) _txtData[table][generateFilename(prefix, i+1)] = {};
			
		// header
		} else {
			let header = choice.substring(barIndex + 2, choice.length);
			for (let row in _data[table]) {
				if (row == 0) continue;
				filename = _data[table][row][header].split('.')[0];
				if (allFiles.indexOf(filename) >= 0) {
					alert("檔名不唯一。");
					return false;
				} else {
					_txtData[table][filename] = {};
					allFiles.push(filename);
				}
			}
		}
	}

	console.log(_txtData);
	return true;
}





function uploadTXT($table, $filename, $tag) {
	$('#singleTXT').attr('target-table', $table);
	$('#singleTXT').attr('target-filename', $filename);
	$('#singleTXT').attr('target-tag', $tag);
	$('#singleTXT').click();
}


function deleteTXT($table, $filename, $tag) {
	delete _txtData[$table][$filename][$tag];
	displayDeleteTXT($table, $filename, $tag);
}


function uploadSingleTXT($event) {
	if ($event.files.length == 0) return;
	var file = $event.files[0];
	
	// fileter non-txt file
	var fileTypePos = file.name.indexOf('.');
	var fileType = file.name.substring(fileTypePos+1, file.name.length);
	if (fileType !== 'txt') {
		alert("上傳檔案" + file.name + "不符合檔案類型要求，請上傳副檔名為 .txt 的檔案。");
		return;
	}

	// make sure user upload the right file
	var filename = $('#singleTXT').attr('target-filename');
	if (file.name.split('.')[0] !== filename) {
		if (confirm("欲上傳的檔案 " + file.name + " 與所選檔名 " + filename + ".txt 不符，要繼續上傳嗎？")) {
			load('text', file, loadTXT());
		}

	// upload directly
	} else {
		load('text', file, loadTXT());
	}

}


function loadTXT() {
	return function($event) {
		var data = $event.target.result;
		var table = $('#singleTXT').attr('target-table');
		var filename = $('#singleTXT').attr('target-filename');
		var tag = $('#singleTXT').attr('target-tag');

		for (let file in _txtData[table]) {
			if (file === filename) {
				_txtData[table][file][tag] = data;
				displayUploadTXT(table, filename, tag);
			}
		}
	}
}







function convertToXML() {

	// reset
	_xml = '<?xml version=\'1.0\'?>\n<ThdlPrototypeExport>\n<documents>\n';
	$('#XMLoutput').empty();

	for (let table in _data) {

		let corpusElement = $('#requiredInterface .settingTab[key=\'' + table + '\'] .menu[name=corpus]');
		let corpusSetting = $(corpusElement).find('button.text-only')[0].innerText;
		let corpusSetType = corpusSetting.split('|')[0].trim();
		let metadataElement = $('#optionalInterface .settingTab[key=\'' + table + '\'] > .menu');

		// writing xml
		for (let file in _data[table]) {
			if (file == 0) continue;

			// extract corpus name
			let corpus = '';
			if (corpusSetType === '自訂') {
				corpus = $(corpusElement).find('input')[0].value;
			} else if (corpusSetType === '檔案名稱' || corpusSetType === '資料表名稱') {
				corpus = corpusSetting.split('|')[1].trim();
			} else if (corpusSetType === '欄位名稱') {
				let header = corpusSetting.split('|')[1].trim();
				corpus = _data[table][file][header];
			}

			if (corpus === '') {
				alert("程式錯誤：未找到 corpus name 的設定。\n請洽詢工程師。");
				return false;
			}

			// extract filename
			let filename = Object.keys(_txtData[table])[file-1];

			if (filename === undefined) {
				alert("程式錯誤：未找到 file name 的設定。\n請洽詢工程師。");
				return false;
			}
			
			_xml += '<document filename="' + filename + '">\n<corpus>' + corpus + '</corpus>\n';

			// extract metadata
			let linkText = '連結', linkHref = '', customMetaXML = '';
			for (let m=0; m<metadataElement.length; m++) {
				let header = $($(metadataElement)[m]).attr('name');
				let metaValue = _data[table][file][header];
				let metaSetting = $($(metadataElement)[m]).find('button.text-only')[0].innerText;
				if (metaSetting === '--- 請選擇 ---') continue;
				
				let metadata = '';
				let metaType = metaSetting.split('|')[0].trim();
				if (metaType === '自訂欄位') {
					metadata = $($(metadataElement)[m]).find('input')[0].value;
					if (!checkStr(metadata)) {
						alert("在 " + header + " 的 metadata 「自訂欄位」設定中，請使用半形英文。");
						return false;
					}
					customMetaXML += '<' + metadata + '>' + metaValue + '</' + metadata + '>\n';
				} else if (metaType === '為自訂欄位加上超連結') {
					let text = $($(metadataElement)[m]).find('input')[0].value;
					linkText = (text == '') ?linkText :text; 
					linkHref = metaValue;
				} else if (metaType === '自訂欄位超連結的文字') {
					linkText = metaValue;
				} else {
					metadata = metaSetting.split('|')[1].trim();
					_xml += '<' + metadata + '>' + metaValue + '</' + metadata + '>\n';
				}
			}

			if (linkHref != '') customMetaXML += '<a href="' + linkHref + '" trget="_blank">' + linkText + '</a>\n';
			if (customMetaXML != '') _xml += '<xml_metadata>\n' + customMetaXML + '</xml_metadata>\n';

			// append document content
			let contentXML = ''
			for (let tag in _contentTags) {
				let source = $('#contentInterface .settingTab[key=\'' + table + '\'] .tagTab[key=\'' + tag + '\'] div[name=contentSource] button.text-only')[0].innerText;
				if (source === '--- 請選擇 ---') continue;
				
				// mapping
				else if (source === 'CSV/Excel 欄位') {
					let mappingElement = $('#contentInterface .settingTab[key=\'' + table + '\'] .tagTab[key=\'' + tag + '\'] .contentMapping .selectObj');
					contentXML += beginTag(tag);
					for (let m=0; m<mappingElement.length; m++) {
						let header = $($(mappingElement)[m]).find('button.text-only')[0].innerText;
						contentXML += _data[table][file][header];
					}
					contentXML += endTag(tag);

				// import
				} else if (source === '匯入純文字檔') {
					let content = _txtData[table][filename][tag];
					if ( content !== undefined) contentXML += beginTag(tag) + content + endTag(tag);
				}
			}

			_xml += '<doc_content>\n' + contentXML + '</doc_content>\n</document>\n';
		}
	}

	_xml += '</documents>\n</ThdlPrototypeExport>\n';

	// display
	$('#XMLoutput').append('<xmp>' + _xml + '</xmp>');
	return true;
}


function beginTag($tag) {
	if ($tag === 'doc_content') return '';
	else if ($tag === 'MetaTags') return '<MetaTags NoIndex="1">\n';
	else if ($tag === 'Comment') return '<Comment>\n';
	else if ($tag === 'Events') return '<Events NoTagAnalysis="1">\n';
}


function endTag($tag) {
	if ($tag === 'doc_content') return '\n';
	else if ($tag === 'MetaTags') return '\n</MetaTags>\n';
	else if ($tag === 'Comment') return '\n</Comment>\n';
	else if ($tag === 'Events') return '\n</Events>\n';
}



function checkRequirePage() {
	for (let table in _data) {

		// corpus
		let corpus = $('#requiredInterface .settingTab[key=\'' + table + '\'] .menu[name=corpus] button.text-only')[0].innerText;
		if (corpus === '--- 請選擇 ---') {
			alert("請填寫資料表「" + table + "」的「文獻集名稱」。");
			return false;
		} else if (corpus === '自訂') {
			let value = $('#requiredInterface .settingTab[key=\'' + table + '\'] .menu[name=corpus] input')[0].value;
			if (value === '') {
				alert("請填寫資料表「" + table + "」自訂之「文獻集名稱」。");
				return false;
			}
		}

		// filename
		let filename = $('#requiredInterface .settingTab[key=\'' + table + '\'] .menu[name=filename] button.text-only')[0].innerText;
		if (filename === '--- 請選擇 ---') {
			alert("請填寫資料表「" + table + "」的「文件檔案名稱」。");
			return false;
		} else if (filename === '自動產生檔名') {
			let value = $('#requiredInterface .settingTab[key=\'' + table + '\'] .menu[name=filename] input')[0].value;
			if (value === '') {
				alert("請填寫資料表「" + table + "」自訂之「文件檔案名稱」。");
				return false;
			}
		}
	}
	return true;
}



function uploadXML2DocuSky($dbTitle) {
	
	_uploadStatus = false;

	// xml info
	var formData = { dummy: {name: 'dbTitleForImport', value: $dbTitle }, file: {value: _xml, filename: $dbTitle + '.xml', name: 'importedFiles[]'}};

	_docuSkyObj.uploadMultipart(formData, succUploadFun);

	setTimeout(function() {
		if (_uploadStatus) alert("已成功上傳檔案至 DocuSky。");
		else alert("上傳失敗，建議將已製作完畢檔案先下載至本機。");
	}, 600);
}


function succUploadFun() {
	_docuSkyObj.hideWidget();
	_uploadStatus = true;
}






