/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
This file defined the functions that used to upload/download
files to system or DocuSky.
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */


/* ---
select API for loading single file
INPUT: 1) string, file type, excel or text
       2) object, uploaded file 
       3) function, callback
OUTPUT: none
--- */
function load($type, $file, $function) {
	var reader = new FileReader();
	reader.onload = $function;
	if ($type === 'excel') reader.readAsBinaryString($file);
	else if ($type === 'text') reader.readAsText($file);
}


// * * * * * * * * * * * * * * * * excel upload * * * * * * * * * * * * * * * * *


// listener for loading files
document.getElementById('uploadInput').addEventListener('change', uploadFile, false);
document.getElementById('fileManager').addEventListener('dragenter', dragFileEnter, false);
document.getElementById('fileManager').addEventListener('dragleave', dragFileLeave, false);
document.getElementById('fileManager').addEventListener('dragover', dragFileOver, false);
document.getElementById('fileManager').addEventListener('drop', dropFile, false);


/* ---
trigger when user upload files by input element in upload interface 
- extract uploaded files and update used input by new input
INPUT: object, event
OUTPUT: none
--- */
function uploadFile($event) {
	var files = $event.target.files;
	filesHandler(files);

	// update input
	$('#fileManager input').replaceWith('<input id="uploadInput" type="file" name="uploadInput" accept=".csv, .xls, .xlsx" multiple/>');
	document.getElementById('uploadInput').addEventListener('change', uploadFile, false);
}


/* ---
trigger when user drag files and enter upload area - change css
INPUT: object, event
OUTPUT: none
--- */
function dragFileEnter($event) {
	$event.stopPropagation();
	$event.preventDefault();
	this.classList.add('managerHover');
}


/* ---
trigger when user drag files and leave upload area - change css
INPUT: object, event
OUTPUT: none
--- */
function dragFileLeave($event) {
	$event.stopPropagation();
	$event.preventDefault();
	this.classList.remove('managerHover');
}


/* ---
trigger when user drag files and cover upload area
INPUT: object, event
OUTPUT: none
--- */
function dragFileOver($event) {
	$event.stopPropagation();
	$event.preventDefault();
}


/* ---
trigger when user drop files in upload area - change css and extract uploaded files
INPUT: object, event
OUTPUT: none
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
INPUT: object, uploaded files
OUTPUT: none
--- */
function filesHandler($files) {

	// reset progress bar
	_progress = {};
	updateProgress('#uploadInterface');

	// process for each selected file
	for (let i = 0; i < $files.length; i++) {
		let file = $files[i];

		// parse filename
		let filenameParts = file.name.split('.');
		let fileType = filenameParts[filenameParts.length-1];
		let filename = file.name.replace(`.${ fileType }`, '');

		// filter non-ecxel files
		if (!itemInList(fileType, _allowedFileType)) {
			alert("上傳檔案" + file.name + "不符合檔案類型要求，請上傳副檔名為 .xls, .xlsx, .csv 的檔案。");
			return;
		}

		// file hasn't loaded before - load the whole file
		if (!(filename in _inputFiles)) {
			load('excel', file, loadExcel(filename));

		// file has loaded before
		} else {
			if (confirm("已有相同檔名的檔案匯入本工具，確定繼續上傳" + file.name + "？")) {
				load('excel', file, loadExcel(strPlusNum(filename, getFileNum(filename, Object.keys(_inputFiles)), 0, 'bracket')));
			}
		}
	}
}


/* ---
load and store a excel file after getting its row data
INPUT: string, filename of excel
OUTPUT: none
--- */
function loadExcel($filename) {
	return function($event1) {
		var worker = new Worker('js/worker.js');
		_progress[$filename] = 0;

		// receive
		worker.addEventListener('message', function($event2) {

			/* data structure {
				func: functions,
				percentage: percentage, (func = progress)
				sheetNum: sheet number of excel file, (func = sheetnum)
				sheetName: one sheet name in excel file, (func = sheetcontent)
				content: content of one sheet in excel file (func = sheetcontent)
			} */

			let func = $event2.data.func;

			// display progress bar
			if (func === 'progress') {
				_progress[$filename] = $event2.data.percentage;
				updateProgress('#uploadInterface');
				return;
			
			// receive sheet names
			} else if (func === 'sheetnum') {

				// record file in system
				_inputFiles[$filename] = $event2.data.sheetNum;

				// css row
				let rowNum = Math.ceil((getAllSheetNum() + 1) / 3);
				$('#fileManager').css('grid-template-rows', `repeat(${ rowNum }, 15vh)`);
			
			// receive sheet content
			} else if (func === 'sheetcontent') {
				let sheetID = $filename + '--' + $event2.data.sheetName;

				// save file data in system
				_dataPool[sheetID] = $event2.data.content;
				_dataPool.length++;

				// UI and next
				displayUploadSheet(sheetID);
			}

		}, false);

		// send
		worker.postMessage({ 
			func: 'parseexcel',
			content: $event1.target.result
		});
	}
}


// * * * * * * * * * * * * * * * * txt upload * * * * * * * * * * * * * * * * *


/* ---
trigger when user upload files by input element through row of table of content interface
- extract uploaded files and update used input by new input
INPUT: object, event
OUTPUT: none
--- */
function uploadSingleTXT($event) {
	if ($event.files.length <= 0) return;	// do not choose file

	// check filename format and load
	var filename = $event.files[0].name;
	if (checkTXTFilename([filename], 'single')) load('text', $event.files[0], loadTXT(_matching[0], filename));

	// update
	$('#singleTXT').replaceWith('<input id="singleTXT" type="file" accept=".txt" onchange="uploadSingleTXT(this)" style="display: none;"/>');
	$('#contentInterface .settingTab.target .rowFile.target').removeClass('target');
}


/* ---
trigger when user upload files by input element through multiple button in tool bar of content interface
- extract uploaded files and update used input by new input
INPUT: object, event
OUTPUT: none
--- */
function uploadMultiTXT($event) {
	if ($event.files.length <= 0) return;	// do not choose file

	// get all uploaded filenames
	var allFilenames = [];
	for (let i = 0; i < $event.files.length; i++) {
		allFilenames.push($event.files[i].name);
	}

	// check filename format and load
	if (checkTXTFilename(allFilenames, 'multi')) {
		for (let i = 0; i < $event.files.length; i++) {
			if (_matching[i] === undefined) addNotMatchTXT($event.files[i]);
			else load('text', $event.files[i], loadTXT(_matching[i], $event.files[i].name));
		}
	}

	// update input
	$('#multiTXT').replaceWith('<input id="multiTXT" type="file" accept=".txt" onchange="uploadMultiTXT(this)" style="display: none;" multiple/>');
}


/* ---
trigger when user upload files by input element through whole txt button in tool bar of content interface
- extract uploaded files and update used input by new input
INPUT: object, event
OUTPUT: none
--- */
function uploadWholeTXT($event) {
	if ($event.files.length == 0) return;	// do not choose file

	// check filename format and load
	if (checkTXTFilename([$event.files[0].name], 'whole')) load('text', $event.files[0], loadWholeTXT());

	// update input
	$('#wholeTXT').replaceWith('<input id="wholeTXT" type="file" accept=".txt" onchange="uploadWholeTXT(this)" style="display: none;"/>');
}


/* ---
load and store a txt file after getting its row data
INPUT: 1) int/string, file unique index in system
	   2) string, filename of txt
OUTPUT: none
--- */
function loadTXT($index, $filename) {
	return function($event) {
		var content = $event.target.result;

		// content not wellform
		if (!checkWellForm(content)) {
			alert(`上傳的檔案「 ${ $filename } 」不符合 well form 格式。`);
			return;
		}

		_documents[$index].doc_content.doc_content.import[0] = normalizeContent(content);
		$(`#contentInterface .settingTab.target .rowFile[key="${ $index }"]`).html(displayTXTFile($index));
	}
}


/* ---
load a txt file in specific format, and then process and store
INPUT: none
OUTPUT: none
--- */
function loadWholeTXT() {
	return function($event) {
		var data = $event.target.result.split(/\n\s{0,}\n/g);
		var notpass = [];

		// store each document content
		$(`#contentInterface .settingTab.target .rowFile`).each(function(i) {
			let j = $(this).attr('key');
			let content = data[i];

			// data
			if (content === undefined || content.trim() === '-') _documents[j].doc_content.doc_content.import[0] = '';
			else if (checkWellForm(content)) _documents[j].doc_content.doc_content.import[0] = normalizeContent(content);
			else {
				notpass.push(`${ i }: ${ _documents[j].attr.filename }.txt`);
				_documents[j].doc_content.doc_content.import[0] = '';
			}

			// display
			$(this).html(displayTXTFile(j));
		});

		// show warning
		if (notpass.length > 0) alert(`上傳檔案的某些件數不符合 well form 格式：\n${ array2Str(notpass) }`);
	}
}


/* ---
create a not match file, including data and UI
INPUT: object, uploaded file
OUTPUT: none
--- */
function addNotMatchTXT($file) {
	let name = $file.name;
	let filenum = getFileNum(name, Object.keys(_notMatch[_sheet]));
	let filename = (filenum > 0) ?strPlusNum(name, filenum, 0, 'bracket') :name;
	_notMatch[_sheet][filename] = $file;
	displayNotMatchTXT(filename);
}


/* ---
trigger when user start to drag not match file in buffer area
INPUT: object, event
OUTPUT: none
--- */
function dragNotMatchFileStart($event) {
	$event.dataTransfer.setData('text/plain', $($event.target).attr('name'));
}


/* ---
trigger when user drag not match file and enter files table row - change css
INPUT: object, event
OUTPUT: none
--- */
function dragNotMatchFileEnter ($event) {
	$event.preventDefault();
	$event.stopPropagation();
	this.classList.add('notMatchHover');
}


/* ---
trigger when user drag not match file and cover files table row
INPUT: object, event
OUTPUT: none
--- */
function dragNotMatchFileOver ($event) {
	$event.preventDefault();
	$event.stopPropagation();
}


/* ---
trigger when user drag not match file and leave files table row - change css
INPUT: object, event
OUTPUT: none
--- */
function dragNotMatchFileLeave ($event) {
	$event.preventDefault();
	$event.stopPropagation();
	this.classList.remove('notMatchHover');
}


/* ---
trigger when user drop not match file in table row of a file - change css and extract uploaded file
INPUT: object, event
OUTPUT: none
--- */
function dropNotMatchFile($event) {
	$event.preventDefault();
	$event.stopPropagation();
	this.classList.remove('notMatchHover');

	// access data
	var key = $(this).attr('key');
	var filename = _documents[key].attr.filename;
	var uploaded = $event.dataTransfer.getData('text/plain');

	// check cover
	if ($(this).find('span[func="status"]').attr('class') !== undefined) {
		if (!confirm(`所選檔名「 ${ filename } 」已有資料，確定要配對嗎？`)) return;
	}

	// save
	load('text', _notMatch[_sheet][uploaded], loadTXT(key, uploaded));

	// remove html and data
	$(`#contentInterface .settingTab.target .notMatchFile[name="${ uploaded }"]`).remove();
	$(`.notMatch.fixed .notMatchFile[name="${ uploaded }"]`).remove();
	delete _notMatch[_sheet][uploaded];
}


 // * * * * * * * * * * * * * * * * download * * * * * * * * * * * * * * * * *


/* ---
callback function of widget function manageDbList() - upload converted DocuXML to DocuSky directly
INPUT: none
OUTPUT: none
--- */
function uploadXML2DocuSky() {
	
	// hide UI
	_docuSkyObj.hideWidget();

	// info
	var dbTitle = $("#databaseName input").val().trim();
	if (dbTitle === '') dbTitle = 'DB-' + now();
	var formData = { 
		dummy: {
			name: 'dbTitleForImport', 
			value: dbTitle 
		}, 
		file: {
			value: _xml, 
			filename: dbTitle + '.xml', 
			name: 'importedFiles[]'
		}
	};

	// progress bar
	_progress = _docuSkyObj.uploadProgressId;
	_docuSkyObj.uploadProgressId = 'myUploadProgressId';
	$("#downloadInterface .contentPanel .progress").show();

	// upload
	_docuSkyObj.uploadMultipart(formData, succUploadFunc, failUploadFunc);
}


/* ---
success function of uploadXML2DocuSky()
INPUT: none
OUTPUT: none
--- */
function succUploadFunc() {
	
	// progress bar
	_docuSkyObj.uploadProgressId = _progress;
	$("#downloadInterface .contentPanel .progress").hide();

	// message
	alert("已成功上傳檔案至 DocuSky。");
}


/* ---
fail function of uploadXML2DocuSky()
INPUT: none
OUTPUT: none
--- */
function failUploadFunc() {
	alert("上傳失敗，建議將已製作完畢檔案先下載至本機。");
}

