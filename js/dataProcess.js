/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
This file defined the functions that used file data or setting 
data to dynamicly process output data.
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */


// * * * * * * * * * * * * * * * * upload * * * * * * * * * * * * * * * * *


/* ---
check there is selected sheet in upload interface and record it
OUTPUT: boolean, selected = true, not selected = false
--- */
function checkUploadPage() {

	// no uploaded file
	if (_dataPool.length <= 0) {
		alert("請先上傳 Excel 檔案。");
		return false;
	}

	// pick selected sheet
	_selectedSheet = [];
	$('.sheet-obj').each(function() {
		if ($(this).is('.target')) _selectedSheet.push($(this).attr('name'));
	});

	// no selected sheet
	if (_selectedSheet.length <= 0) {
		alert("請至少選擇一份資料表。");
		return false;
	}

	return true;
}


/* ---
create initialize data in _fileindex, _documents, _corpusSetting
--- */
function generateXMLContainer() {
	_selectedSheet.forEach(sheet => {
		_fileindex[sheet] = {};
		_buffer[sheet] = new txtBuffer();
		_notMatch[sheet] = {};

		for (let i = 1; i < _dataPool[sheet].length; i++) {		
			_fileindex[sheet][i] = _documents.length;		// record index relationship between _dataPool and _documents
			_documents.push(new Document());				// add an empty document
		}
	});
}


// * * * * * * * * * * * * * * * * required * * * * * * * * * * * * * * * * *


/* ---
check if user fill all blank in required interface
OUTPUT: boolean, all filled = true, not completed = false
--- */
function checkRequiredPage() {
	let pass = true;

	// each sheet
	$(`#required .setting-sheet`).each(function() {
		let sheet = $(this).attr('name');

		// block of corpus and filename
		$(this).find('.required-obj').each(function() {
			let name = $(this).attr('name');
			let value = $(this).find('.dropdown-item.target').attr('value');
			
			// not fill required data
			if (value === 'reset') {
				alert(`請填寫資料表「 ${ sheet } 」的「 ${ name } 」。`);
				pass = false;
				return false;		// break

			// not fill custom string of required data
			} else if (value === 'udef') {
				if ($(this).find('input').val().trim() === '') {
					alert(`請填寫資料表「 ${ sheet } 」自訂之「 ${ name } 」。`);
					pass = false;
					return false;	// break
				}
			}
		});

		if (!pass) return false;		// break
	});

	return pass;
}


/* ---
fill in corpus and filename in each document (filename must be unique in whole xml)
OUTPUT: bool, filename legal = true, not legal = false
--- */
function fillRequiredData() {
	var allFilenames = {};
	var serial = {};
	var corpusNotFill = [];
	var filenameNotFill = [];
	var filenameNotUnique = [];

	// each sheet
	$('#required .setting-sheet').each(function() {
		let sheet = $(this).attr('name');
		let corpusChoice = $(this).find('.required-obj[name="corpus"] .dropdown-item.target').attr('value');
		let filenameChoice = $(this).find('.required-obj[name="filename"] .dropdown-item.target').attr('value');
		let corpusInput = $(this).find('.required-obj[name="corpus"] input').val().trim();
		let filenameInput = $(this).find('.required-obj[name="filename"] input').val().trim();
		if (!(filenameInput in serial)) serial[filenameInput] = 0;

		// each document
		for (let i = 1; i < _dataPool[sheet].length; i++) {
			let corpus, filename;
			let index = _fileindex[sheet][i];

			// corpus
			if (corpusChoice === 'udef') corpus = corpusInput;													// 自訂
			else if (!_dataPool[sheet][0].has(corpusChoice)) corpus = corpusChoice;								// 檔案名稱 or 資料表名稱
			else if (data = _dataPool[sheet][i][corpusChoice]) corpus = data.toString().normalize('metadata');	// 欄位名稱
			else corpusNotFill.push(`資料表「${ sheet }」第 ${ i } 筆`);

			// corpus setting
			if (corpus && !(corpus in _corpusSetting)) _corpusSetting[corpus] = new CorpusMetadata();

			// filename
			if (filenameChoice === 'udef') {																	// 自動產生檔名
				serial[filenameInput]++;
				filename = filenameInput.suffix(serial[filenameInput], 4);		
			} else if (data = _dataPool[sheet][i][filenameChoice]) filename = data.toString().normalize('filename'); // 欄位名稱
			else filenameNotFill.push(`資料表「${ sheet }」第 ${ i } 筆`);

			// filename not unique or record filename
			if (filename) {
				if (filename in allFilenames) filenameNotUnique.push(`資料表「${ sheet }」第 ${ allFilenames[filename] } / ${ i } 筆 (${ filename })`);
				else allFilenames[filename] = i;
			}

			// document content
			_documents[index].filename = filename;
			_documents[index].corpus = corpus;
		}
	});

	// error message
	var msg = '';

	if (corpusNotFill.length > 0) {
		msg = '以下資料的文獻集名稱未填寫：\n';
		corpusNotFill.forEach(row => {
			msg += '- ' + row + '\n';
		});
		alert(msg);
	}

	if (filenameNotFill.length > 0) {
		msg = '以下資料的文件唯一編號未填寫：\n';
		corpusNotFill.forEach(row => {
			msg += '- ' + row + '\n';
		});
		alert(msg);
	}

	if (filenameNotUnique.length > 0) {
		msg = '以下資料包含重複檔名：\n';
		filenameNotUnique.forEach(row => {
			msg += '- ' + row + '\n';
		});
		alert(msg);
	}

	return msg === '';
}


// * * * * * * * * * * * * * * * * optional * * * * * * * * * * * * * * * * *


/* ---
remove an optional metadata
INPUT: string, metadata name whose setting is cancelled
--- */
function cancelOptionalMetadata(name) {
	if (name === 'reset') return;
	Object.values(_fileindex[_sheet]).forEach(index => {
		_documents[index].removeByName('metadata', name);
	});
}


/* ---
create an optional metadata
INPUT: 1) string, metadata name which is setting
	   2) string, user set value for which item
OUTPUT: bool, if executing this setting finally
--- */
function setOptionalMetadata(name, header) {
	if (name === 'reset') return true;

	// metadata has already set (same metadata cannot choose twice)
	if (_documents[_fileindex[_sheet][1]].metadata.hasName(name)) {
		let prevSetting;

		// find prev menu which user set the same metadata
		$(`#optional .setting-sheet.target .dropdown-item.target`).each(function() {
			if ($(this).attr('value') === name) {
				prevSetting = $(this).closest('.optional-obj');
				return false;	// break
			}
		});

		// cancel setting in prev menu
		if (confirm(`「 ${ _metadata.spec[name].zh } 」已被「 ${ $(prevSetting).attr('name') } 」選擇，確定要覆蓋設定嗎？`)) {
			selectMenuItem($(prevSetting).find('.dropdown-item[value="reset"]'));

		// cancel setting this item
		} else return false;
	}

	// each file in target sheet
	for (let i in _fileindex[_sheet]) {
		let j = _fileindex[_sheet][i];
		let value = _dataPool[_sheet][i][header];
		_documents[j].setMetadata(name, header.trim(), (value) ?value.toString().normalize('metadata') :'-');
	}

	return true;
}


/* ---
generate corpus metadata of system defined metadata
--- */
function pickCorpusMetaSetting() {

	// reset
	for (let corpus in _corpusSetting) _corpusSetting[corpus].metadata = [];

	// each sheet
	_selectedSheet.forEach(sheet => {
		let corpus = '';

		// each document
		Object.values(_fileindex[sheet]).forEach(index => {

			// if there is new corpus in a sheet
			if (_documents[index].corpus !== corpus) {
				corpus = _documents[index].corpus;
				_documents[index].metadata.forEach(entry => {
					_corpusSetting[corpus].addMetaSetting(entry.name, entry.zhname);
				});
			}
		});
	});
}


// * * * * * * * * * * * * * * * * custom * * * * * * * * * * * * * * * * *


/* ---
clear all custom metadata in _documents
--- */
function resetCustomMetadata() {
	_documents.forEach(docObj => {
		docObj.udefmetadata = [];
	});
}


/* ---
check if user fills complete information in custom interface and store setting data
OUTPUT: boolean, filled = true, not completed = false
--- */
function checkandSetCustomPage() {
	let pass = true;

	// reset 
	resetCustomMetadata();

	// each sheet
	$('#custom .setting-sheet').each(function() {
		let sheet = $(this).attr('name');
		let temp = {};

		// each custom metadata
		$(this).find('.custom-obj').each(function(i) {
			let name = $(this).find('[name="name"] input').val().normalize('tag');
			
			// not fill the tag name of custom metadata
			if (name === '') {
				alert(`請填寫資料表「${ sheet }」第 ${ i+1 } 個自訂詮釋資料的欄位名稱。`);
				pass = false;
				return false;		// break

			// tag name not use half and english character
			} else if (!checkHalfAndEnglish(name)) {
				alert(`在資料表「${ sheet }」第 ${ i+1 } 個自訂詮釋資料中，請使用半形英文與數字定義欄位名稱。`);
				pass = false;
				return false;		// break

			// metadata name repeated
			} else if (name in temp) {
				alert(`資料表「${ sheet }」第 ${ temp[name] } 、${ i+1 } 個自訂詮釋資料名稱同為「 ${ name } 」。請取不同的名字。`);
				pass = false;
				return false;		// break

			// legal tag name
			} else temp[name] = i + 1;

			// not choose data of custom metadata
			let dataHeader = $(this).find('[name="data"] .dropdown-item.target').attr('value');
			if (dataHeader === 'reset') {
				alert(`請選擇資料表「${ sheet }」第 ${ i+1 } 個自訂詮釋資料的資料對應欄位。`);
				pass = false;
				return false;		// break
			}

			// not choose data of hyper link
			let haslink = this.querySelector('[name="link"] input').checked;
			let linkHeader = $(this).find('[name="link"] .dropdown-item.target').attr('value');
			if (haslink && linkHeader === 'reset') {
				alert(`請選擇資料表「${ sheet }」第 ${ i+1 } 個自訂詮釋資料的超連結資料。`);
				pass = false;
				return false;	// break
			}

			// set custom metadata
			setCustomMetadata(sheet, name, dataHeader, haslink, linkHeader);
		});

		if (!pass) return false;	// break
	});

	return pass;
}


/* ---
create a custom metadata - _documents
INPUT: 1) string, sheet id
	   2) string, custom metadata name
	   3) string, data setting value that user select
	   4) bool, if the metadata have a link
	   5) string, (if has link) link data setting value that user select
--- */
function setCustomMetadata(sheet, name, dataHeader, haslink, linkHeader) {
	for (let i in _fileindex[sheet]) {
		let j = _fileindex[sheet][i];
		let data = _dataPool[sheet][i];
		let value = ((data[dataHeader]) ?data[dataHeader].toString() :'-').normalize('metadata');
		let link = (haslink) ?((data[linkHeader]) ?data[linkHeader].toString().normalize('metadata') :'-') :undefined;
		_documents[j].setUdefMetadata(((name.indexOf('Udef_') < 0) ?'Udef_' :'') + name, value, link);
	}
}


// * * * * * * * * * * * * * * * * content * * * * * * * * * * * * * * * * *


/* ---
set mapping data
INPUT: 1) string, setting mapping for which tab
	   2) string, serial number of setting in buffer
	   3) string, user selected mapping value
OUTPUT: bool, success = true, fail = false, success will influence if UI to change
--- */
function setContentByMapping(name, index, header) {
	var error = [];

	// each document
	for (let i in _fileindex[_sheet]) {
		let j = _fileindex[_sheet][i];
		let filename = _documents[j].filename;
		let data = (header === 'reset') ?undefined :_dataPool[_sheet][i][header];

		// check and normalize
		if (data) {

			// content: string
			if (name === 'content') {
				let str = data.toString();

				// not well form
				if (!str.isWellform()) error.push(`資料表「 ${ _sheet } 」第 ${ i } 筆 (${ filename })`);

				// set
				else _buffer[_sheet].setMapping(name, index, i, str.normalize());

			// metatag, comment, event: array
			} else {
				let items = data.toString().split(';');
				let passData = [];

				// check
				for(let k = 0; k < items.length; k++) {
					let item = items[k].trim();

					// empty
					if (item === '') continue; 

					// metatag: cannot include tag
					if (name === 'metatag' && item.hasTag()) error.push(`資料表「 ${ _sheet } 」第 ${ i } 筆 (${ filename })`);						

					// comment & event: not well form
					else if (name !== 'metatag' && !item.isWellform()) error.push(`資料表「 ${ _sheet } 」第 ${ i } 筆 (${ filename })`);

					// pass check
					else passData.push(item.normalize());
				}

				// set
				_buffer[_sheet].setMapping(name, index, i, { values: passData, header: header });
			}

		// data === undefined
		} else _buffer[_sheet].setMapping(name, index, i, data);
	}

	// error message
	var msg = '';

	if (error.length > 0) {
		if (name === 'metatag') msg = '以下資料不符合 well form 格式：\n';
		else msg = '以下資料不得包含 </> 標籤：\n';
		error.forEach(row => {
			msg += '- ' + row + '\n';
		});
		alert(msg);
	}

	return msg === '';
}


/* ---
check if user fill all information in #content
OUTPUT: array(string)/false, metatags' name
--- */
function checkContentPage() {
	var metatagName = {};
	var pass = true;
	
	// each sheet
	$('#content .setting-sheet').each(function() {
		let sheet = $(this).attr('name');
		metatagName[sheet] = {};

		// each metatag input
		$(this).find('input').each(function(i) {
			let value = $(this).val().normalize('tag');

			// Udef prefix
			if (value.indexOf('Udef_') < 0) value = 'Udef_' + value;

			// check format
			if (!checkHalfAndEnglish(value)) {
				alert(`請使用半形英文與數字填寫資料表「 ${ sheet } 」的第 ${ i+1 } 個 MetaTags 標籤名稱。`);
				pass = false;
				return false;		// break
			}

			let index = $(this).closest('.obj-item').attr('data-index');
			metatagName[sheet][index] = value;
		});

		if (!pass) return false;	// break
	});

	return ((pass) ?metatagName :false);
}


/* ---
put data from _buffer to _documents
INPUT: array(string), metatags' name
--- */
function setDocContent(metatagName) {
	var xmlFormer = new DocuxmlFormer();

	// each sheet
	for (let sheet in _buffer) {

		// content source
		let source = $(`#content .setting-sheet[name="${ sheet }"] .obj-item[name="source"] .dropdown-item.target`).attr('value');
		let content = _buffer[sheet].content[source];

		// each document
		for (let i in _fileindex[sheet]) {
			let j = _fileindex[sheet][i];

			// each tab
			for (let tab in _contentTags) {

				// content
				if (tab === 'content') {
					let combineMapping = function() {
						let paragraph = [];
						let xml = '';

						// collect text - ignore undefined
						if (content) {
							content.forEach(setting => {
								if (setting && setting[i]) paragraph.push(setting[i]);
							});
						}

						// xml
						paragraph.forEach(str => {
							xml += xmlFormer.generateXML({
								name: 'Paragraph', 
								value: str, 
								br: false, 
								single: false
							});
						});

						if (paragraph.length === 0) return '';
						//else if (paragraph.length === 1) return paragraph[0] + '\n';
						else return xml;
					}

					let text = (source === 'import') ?content[i] :combineMapping();
					_documents[j].setDocContent((text) ?(text + ((source === 'import') ?'\n' :'')) :'');

				// metatag, comment, event
				} else {

					// clear
					_documents[j].reset(tab + 's');

					// each mapping
					_buffer[sheet].getMapping(tab).forEach((setting, k) => {

						// ignore undefined
						if (setting && setting[i]) {

							// create entry
							if (tab === 'comment') index = _documents[j].addCommentEntry();
							else if (tab === 'event') index = _documents[j].addEventsEntry();

							// set items
							setting[i].values.forEach(value => {
								if (tab === 'metatag') _documents[j].setMetaTag(metatagName[sheet][k], value);
								else if (tab === 'comment') _documents[j].setCommentItem(index, value);
								else if (tab === 'event') _documents[j].setEvent(index, value);
							});

							// corpus metadata
							if (tab === 'metatag') _corpusSetting[_documents[j].corpus].addTagSetting(metatagName[sheet][k], setting[i].header);
						}
					});
				}
			}
		}
	}
}


// * * * * * * * * * * * * * * * * download * * * * * * * * * * * * * * * * *


/* ---
convert _documents to DocuXML
--- */
function convertToXML() {
	var worker = new Worker('js/worker.js');

	// progress bar
	_progress.convert = 0;
	updateProgress('#download .board');

	// receive
	worker.addEventListener('message', function(event) {

		/* data structure {
			func: functions,
			percentage: percentage, (func = progress)
			result: converted xml string, (func = result)
		} */

		// show xml
		if (event.data.func === 'result') {
			_xml = event.data.result;
			$('#XMLoutput').html(_xml);
		}

		// display progress bar
		_progress.convert = event.data.percentage;
		updateProgress('#download .board');

	}, false);

	// send
	worker.postMessage({ 
		func: 'convert',
		docs: _documents,
		setting: _corpusSetting
	});

	// name
	$('#output-filename input').val('我的文獻集-' + now());
	$('#output-dbname input').val('DB-' + now());
}

