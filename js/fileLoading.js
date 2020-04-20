/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
This file defined the functions that used to load files from
computer and parse the data in files.
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */


 // * * * * * * * * * * * * * * * * excel upload * * * * * * * * * * * * * * * * *


// listener for loading files
document.getElementById('uploadInput').addEventListener('change', uploadFile, false);
document.getElementById('fileManager').addEventListener('dragenter', dragFileEnter, false);
document.getElementById('fileManager').addEventListener('dragleave', dragFileLeave, false);
document.getElementById('fileManager').addEventListener('dragover', dragFileOver, false);
document.getElementById('fileManager').addEventListener('drop', dropFile, false);


/* ---
trigger when user upload files by input element in upload interface
extract uploaded files and update used input by new input
INPUT: event object
--- */
function uploadFile($event) {
	var files = $event.target.files;
	filesHandler(files);

	// update input
	$('#fileManager input').replaceWith('<input id="uploadInput" type="file" name="uploadInput" accept=".csv, .xls, .xlsx" multiple/>');
	document.getElementById('uploadInput').addEventListener('change', uploadFile, false);
}


/* ---
trigger when user drag files and enter upload area (change css)
INPUT: event object
--- */
function dragFileEnter($event) {
	$event.stopPropagation();
	$event.preventDefault();
	this.classList.add('managerHover');
}


/* ---
trigger when user drag files and leave upload area (change css)
INPUT: event object
--- */
function dragFileLeave($event) {
	$event.stopPropagation();
	$event.preventDefault();
	this.classList.remove('managerHover');
}


/* ---
trigger when user drag files and cover upload area
INPUT: event object
--- */
function dragFileOver($event) {
	$event.stopPropagation();
	$event.preventDefault();
}


/* ---
trigger when user drop files in upload area
change css and extract uploaded files
INPUT: event object
--- */
function dropFile($event) {
	$event.stopPropagation();
	$event.preventDefault();
	this.classList.remove('managerHover');

	var dt = $event.dataTransfer;
	var files = dt.files;
	filesHandler(files);
}


/* ---
give appropriate way to process uploaded files
INPUT: file object
--- */
function filesHandler($files) {

	// reset progress bar
	_temp['percentage'] = 0;
	$('#uploadInterface img').show();

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
			load('excel', $files[i], loadFile($files[i], false, {'fileOrder': i, 'fileNum': $files.length}));

		// file has loaded before
		} else {
			if (confirm("已有相同檔名的檔案匯入本工具，確定繼續上傳" + $files[i].name + "?")) {
				load('excel', $files[i], loadFile($files[i], true, {'fileOrder': i, 'fileNum': $files.length}));
			}
		}

	}

	console.log(_inputFiles);
	console.log(_dataPool);

}


/* ---
select API for loading single file
INPUT: 1) string, file type, excel or text
       2) file object
       3) callback function
--- */
function load($type, $file, $function) {
	var reader = new FileReader();
	reader.onload = $function;
	if ($type === 'excel') reader.readAsBinaryString($file);
	else if ($type === 'text') reader.readAsText($file);
}


/* ---
process single file data
INPUT: 1) file object
       2) string, filename suffix
       3) object, progress info
--- */
function loadFile($file, $suffix, $info) {
	return function($event) {

		// get file information
		var filename = ($suffix) ? addSuffix($file.name.split('.')[0]) :$file.name.split('.')[0];
		var data = $event.target.result;
		var wb = XLSX.read(data, {type: 'binary'});

		// record file in system
		_inputFiles[filename] = wb.SheetNames;
		_inputFiles.length++;
		_temp['sheetNum'] += wb.SheetNames.length;
		$info['sheetNum'] = wb.SheetNames.length;

		// css row
		var rowNum = Math.ceil((_temp['sheetNum']+1)/3).toString();
		$('#fileManager').css('grid-template-rows', 'repeat(' + rowNum + ', 15vh)');

		// build data structure and show UI
		for (let i=0; i<wb.SheetNames.length; i++) {

			// parse excel file
			let sheet = filename + '--' + wb.SheetNames[i];
			let header = XLSX.utils.sheet_to_csv(wb.Sheets[wb.SheetNames[i]]).split('\n')[0].split(',');
			let content = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[i]]);

			// save file data in system
			content.splice(0, 0, filterEmpty(header));
			_dataPool[sheet] = content;
			_dataPool.length++;

			// UI
			$info['sheetOrder'] = i;
			updateProgress($info, 'upload');
			displayUploadSheet(sheet);
		}

		if ($info['fileOrder']==$info['fileNum']-1) $('#uploadInterface img').hide();

	}
}


// * * * * * * * * * * * * * * * * txt upload * * * * * * * * * * * * * * * * *


/* ---
process single file data
--- */
function loadTXT($filename) {
	return function($event) {
		var data = $event.target.result;
		var table = _temp['target-table'];
		var tag = _temp['target-tag'];
		console.log(data);

		for (let file in _txtData[table]) {
			if (file === $filename) {
				_txtData[table][file][tag] = data;
				displayUploadTXT(table, $filename, tag);
				return;
			}
		}
	}
}


/* ---
trigger when user upload files by input element in row of table of content interface
extract uploaded files and update used input by new input
INPUT: 1) event object
       2) boolean, if input element need to update
--- */
function uploadSingleTXT($event, $update) {
	if ($event.files.length == 0) return;
	var file = $event.files[0];
	
	// fileter non-txt file
	var fileTypePos = file.name.indexOf('.');
	var fileType = file.name.substring(fileTypePos+1, file.name.length);
	if (fileType !== 'txt') {
		alert("上傳檔案 " + file.name + " 不符合檔案類型要求，請上傳副檔名為 .txt 的檔案。");
		return;
	}

	// make sure user upload the right file
	var filename = _temp['target-filename'];
	if (file.name.split('.')[0] !== filename) {
		if (confirm("欲上傳的檔案 " + file.name + " 與所選檔名 " + filename + ".txt 不符，要繼續上傳嗎？")) {
			load('text', file, loadTXT(filename));
		}

	// upload directly
	} else {
		load('text', file, loadTXT(filename));
	}

	// update input
	if ($update) {
		$('#singleTXT').replaceWith('<input id="singleTXT" type="file" accept=".txt" onchange="uploadSingleTXT(this, undefined, true)" style="display: none;"/>');
	}
}


/* ---
trigger when user upload files by input element in header of table of content interface
extract uploaded files and update used input by new input
INPUT: event object
--- */
function uploadMultiTXT($event) {

	// process for each files
	for (let i=0; i<$event.files.length; i++) {
		let event = {'files': { 'length': 1, 0: $event.files[i] } };
		let table = _temp['target-table'];
		let tag = _temp['target-tag'];
		let filename = $event.files[i].name.split('.')[0];
		_temp['target-filename'] = filename;

		// see if uploaded filename match with the one excel provided
		if (filename in _txtData[table]) uploadSingleTXT(event, false);
		else {
			alert("上傳檔案 " + filename + ".txt 不在檔名列表內。");
			_txtBuffer[filename] = $event.files[i];
			displayNotMatchTXT(filename, table, tag);
		}
	}

	// update input
	$('#multiTXT').replaceWith('<input id="multiTXT" type="file" accept=".txt" onchange="uploadMultiTXT(this)" style="display: none;" multiple/>');
}


/* ---
trigger when user upload files by 'single file for whole database' button
extract uploaded files and update used input by new input
INPUT: event object
--- */
function uploadWholeTXT($event) {
	if ($event.files.length == 0) return;
	var file = $event.files[0];

	// fileter non-txt file
	var fileTypePos = file.name.indexOf('.');
	var fileType = file.name.substring(fileTypePos+1, file.name.length);
	if (fileType !== 'txt') {
		alert("上傳檔案 " + file.name + " 不符合檔案類型要求，請上傳副檔名為 .txt 的檔案。");
		return;
	}

	// load
	load('text', file, loadWholeTXT());

	// update input
	$('#wholeTXT').replaceWith('<input id="wholeTXT" type="file" accept=".txt" onchange="uploadWholeTXT(this)" style="display: none;"/>');
}


/* ---
process data of single file for whole database
--- */
function loadWholeTXT() {
	return function($event) {
		var re = new RegExp(String.fromCharCode(13), 'g');
		var table = _temp['target-table'];
		var tag = _temp['target-tag'];
		var data = $event.target.result.replace(re, '').trim().split('\n\n');
		var i = 0;
		for (let c=0; c<30; c++) {
			console.log($event.target.result[c]);
			console.log($event.target.result[c].charCodeAt());

		}

		for (let file in _txtData[table]) {
			let dataStr = data[i].trim();
			if (dataStr !== '-') {
				_txtData[table][file][tag] = dataStr;
				displayUploadTXT(table, file, tag);
			}

			if (i >= data.length-1) break;
			i++;
		}
	}
}


 // * * * * * * * * * * * * * * * * download * * * * * * * * * * * * * * * * *


/* ---
callback function of widget function manageDbList()
upload converted DocuXML to DocuSky directly
--- */
function uploadXML2DocuSky() {
	
	// hide UI
	_docuSkyObj.hideWidget();

	// info
	var dbTitle = $("#databaseName input").val().trim();
	var formData = { dummy: {name: 'dbTitleForImport', value: dbTitle }, file: {value: _xml, filename: dbTitle + '.xml', name: 'importedFiles[]'}};

	// progress bar
	_temp['progressID'] = _docuSkyObj.uploadProgressId;
	_docuSkyObj.uploadProgressId = 'myUploadProgressId';
	$("#downloadInterface .progress").show();

	// upload
	_docuSkyObj.uploadMultipart(formData, succUploadFunc, failUploadFunc);
}


/* ---
success function of uploadXML2DocuSky()
--- */
function succUploadFunc() {
	
	// progress bar
	_docuSkyObj.uploadProgressId = _temp['progressID'];
	$("#downloadInterface .progress").hide();

	// message
	alert("已成功上傳檔案至 DocuSky。");
}


/* ---
fail function of uploadXML2DocuSky()
--- */
function failUploadFunc() {
	alert("上傳失敗，建議將已製作完畢檔案先下載至本機。");
}
