/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
This file defined the functions that used to upload/download
files to system or DocuSky.
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */


// * * * * * * * * * * * * * * * * excel upload * * * * * * * * * * * * * * * * *


/* ---
trigger when user upload files by input in #upload 
--- */
$('#upload-obj-input').on('change', function(event) {
	loadExcel(event.target.files);
	$('#upload-obj-input').val('');
});


/* ---
trigger when user drag files and cover upload area
--- */
$('#file-manager').on('dragover', function(event) {
	event.stopPropagation();
	event.preventDefault();
	$(event.target).addClass('hover');
});


/* ---
trigger when user drag files and leave upload area - change css
--- */
$('#file-manager').on('dragleave', function(event) {
	event.stopPropagation();
	event.preventDefault();
	$(event.target).removeClass('hover');
});


/* ---
trigger when user drop files in upload area - change css and extract uploaded files
--- */
$('#file-manager').on('drop', function(event) {
	event.stopPropagation();
	event.preventDefault();
	$(event.target).removeClass('hover');
	loadExcel(event.originalEvent.dataTransfer.files);
});


/* ---
load and store excel files after getting its row data
INPUT: blobs, uploaded files
--- */
function loadExcel(files) {
	var wrongtype = [];

	// reset progress bar
	_progress = {};
	updateProgress('#upload');

	// process for each selected file
	for (let i = 0; i < files.length; i++) {
		let file = files[i];
		let filetype = file.name.split('.').pop();
		let filename = file.name.replace('.' + filetype, '');
		let reader = new FileReader();

		// check file type (for dragging)
		if (!_allowedFileType.has(filetype)) {
			wrongtype.push(file.name);
			continue;
		}		

		// callback
		reader.onload = function(event1) {
			let worker = new Worker('js/worker.js');
			_progress[filename] = 0;

			// receive
			worker.addEventListener('message', function(event2) {

				/* data structure {
					func: functions,
					percentage: percentage, (func = progress)
					sheetNum: sheet number of excel file, (func = sheetnum)
					sheetName: one sheet name in excel file, (func = sheetcontent)
					content: content of one sheet in excel file (func = sheetcontent)
				} */

				let func = event2.data.func;

				// display progress bar
				if (func === 'progress') {
					_progress[filename] = event2.data.percentage;
					updateProgress('#upload');
					return;
				
				// receive sheet names - css row
				} else if (func === 'sheetnum') {
					let objnum = _dataPool.length + event2.data.sheetnum + 1;
					let rowNum = Math.ceil(objnum / 3);
					$('#file-manager').css('grid-template-rows', `repeat(${ rowNum }, 15vh)`);
				
				// receive sheet content
				} else if (func === 'sheetcontent') {
					let count = 0;
					let sheetID = filename + '|' + event2.data.sheetname;

					// check id
					Object.keys(_dataPool).forEach(id => {
						if (sheetID === id.replace('|' + id.split('|').pop(), '')) count++;
					});

					// unique id
					sheetID += '|' + (count+1);

					// save file data in system
					_dataPool[sheetID] = event2.data.content;
					_dataPool.length++;

					// UI and next
					displayUploadedSheet(sheetID);

					// last file - hide progress bar
					if (i === files.length-1) {
						_progress = { upload: 1};
						updateProgress('#upload');
					}
				}

			}, false);

			// send
			worker.postMessage({ 
				func: 'parseexcel',
				content: event1.target.result
			});
		};

		// load
		reader.readAsBinaryString(file);
	}

	// show wrong type warning
	if (wrongtype.length > 0) alert(`以下上傳檔案不符合檔案類型要求，請上傳副檔名為 .xls, .xlsx, .csv 的檔案。\n${ wrongtype.toListStr() }`);
}


// * * * * * * * * * * * * * * * * txt upload * * * * * * * * * * * * * * * * *


/* ---
trigger when user upload files by input through row of table of #content
--- */
$('#txt-single').on('change', function(event) {
	loadTxtSingle(event.target.files[0]);
	$('#txt-single').val('');
});


/* ---
trigger when user upload files by input through whole txt button in tool bar of #content
--- */
$('#txt-whole').on('change', function(event) {
	loadTxtWhole(event.target.files[0]);
	$('#txt-whole').val('');
});


/* ---
trigger when user upload files by input through multiple button in tool bar of #content
--- */
$('#txt-multiple').on('change', function(event) {
	loadTxtMultiple(event.target.files);
	$('#txt-multiple').val('');
});


/* ---
load and store a txt file after getting its row data
INPUT: blob, uploaded file
--- */
function loadTxtSingle(file) {
	var reader = new FileReader();
	var j = _fileindex[_sheet][_file];

	// check filename
	console.log()
	if (file.name !== (_documents[j].filename + '.txt') && !confirm(`欲上傳的檔案「 ${ file.name } 」與所選檔名「 ${ _documents[j].filename }.txt 」不符，要繼續上傳嗎？`)) return;

	// callback
	reader.onload = function(event) {
		let data = event.target.result;

		// not well form
		if (!data.isWellform()) {
			alert(`上傳的檔案「 ${ file.name } 」不符合 well form 格式。`);
			return;
		}

		// data
		_buffer[_sheet].setImport(_file, data.normalize());

		// UI
		updateTxtUI();
	};

	// load
	reader.readAsText(file);
}


/* ---
load a txt file in specific format, then process and store
INPUT: blob, uploaded file
--- */
function loadTxtWhole(file) {
	var reader = new FileReader();

	// check if cover
	if (Object.keys(_buffer[_sheet].getImport()).length > 0) {
		if (!confirm('已有上傳的檔案，確定要繼續並覆蓋此上傳表內所有資料嗎？')) return;
	}

	// callback
	reader.onload = function(event) {
		let data = event.target.result.split(/\n\s{0,}\n/g);
		let notpass = [];		// not pass file
		let index = 0;

		// each document
		$(`#content .setting-sheet.target .txt-td`).each(function() {
			_file = $(this).attr('data-index');
			let j = _fileindex[_sheet][_file];
			let text = data[index];

			// no data or content
			if (!text || text.trim() === '-') _buffer[_sheet].removeImport(_file);
			
			// well form
			else if (text.isWellform()) _buffer[_sheet].setImport(_file, text.normalize());
			
			// not well form
			else {
				_buffer[_sheet].removeImport(_file);
				notpass.push(`${ _file }: ${ _documents[j].filename }.txt`);
			}

			// UI
			updateTxtUI();
			index++;
		});

		// show warning
		if (notpass.length > 0) alert(`以下件數不符合 well form 格式：\n${ notpass.toListStr() }`);
	};

	// load
	reader.readAsText(file);
}


/* ---
load, process, and store txt files
INPUT: blob, uploaded files
--- */
function loadTxtMultiple(files) {
	var notpass = [];		// not load, show warning
	var covered = {};		// load, ask

	// file index mapping
	var fileindex = {};
	for (let i in _fileindex[_sheet]) {
		let j = _fileindex[_sheet][i];
		fileindex[_documents[j].filename] = i;
	}

	// each uploaded file
	var last = files.length - 1;
	for (let f = 0; f < files.length; f++) {
		let file = files[f];
		let reader = new FileReader();

		// callback
		reader.onload = function(event) {
			let data = event.target.result;
			let filename = file.name.replace('.txt', '');

			// not well form
			if (!data.isWellform()) {
				notpass.push(file.name);
				return;
			}

			// find the same filename
			if (Object.keys(fileindex).has(filename)) {

				// already exist
				if (_buffer[_sheet].getImport(fileindex[filename])) covered[filename] = data.normalize('content');

				// still empty
				else {
					_buffer[_sheet].setImport(fileindex[filename], data.normalize('content'));

					// UI
					_file = fileindex[filename];
					updateTxtUI();
				}

			// not matching any filename
			} else {
				let count = 0;

				// check id
				Object.keys(_notMatch[_sheet]).forEach(id => {
					if (filename === id.replace('|' + id.split('|').pop(), '')) count++;
				});

				// unique id
				let id = filename + '|' + (count+1);
				_notMatch[_sheet][id] = data.normalize('content');

				// UI
				displayTxtBuffItem(id);
			}

			// last file
			if (f === last) {
				
				// not pass warning
				if (notpass.length > 0) alert(`以下件數不符合 well form 格式：\n${ notpass.toListStr() }`);

				// cover
				if (Object.keys(covered).length > 0) {

					// check if cover
					if (confirm(`以下檔案將覆蓋舊有資料，要繼續上傳嗎？\n${ Object.keys(covered).toListStr('.txt') }`)) {

						// cover by new data
						for (let filename in covered) _buffer[_sheet].setImport(fileindex[filename], covered[filename]);
					}
				}
			}
		}

		// load
		reader.readAsText(file);
	}
}


 // * * * * * * * * * * * * * * * * download * * * * * * * * * * * * * * * * *


/* ---
callback function of widget function manageDbList() - upload converted DocuXML to DocuSky directly
--- */
function uploadXML2DocuSky() {
	
	// hide UI
	_docuSkyObj.hideWidget();

	// info
	var dbTitle = $("#output-dbname input").val().trim();
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
	$("#download .progress").show();

	// upload
	_docuSkyObj.uploadMultipart(formData, succUploadFunc, failUploadFunc);
}


/* ---
success function of uploadXML2DocuSky()
--- */
function succUploadFunc() {
	
	// progress bar
	_docuSkyObj.uploadProgressId = _progress;
	$("#download .progress").hide();

	// message
	alert("已成功上傳檔案至 DocuSky。");
}


/* ---
fail function of uploadXML2DocuSky()
--- */
function failUploadFunc() {
	alert("上傳失敗，建議將已製作完畢檔案先下載至本機。");
}

