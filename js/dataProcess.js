/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
This file defined the functions that used file data or setting 
data to dynamicly process output data.
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */


// * * * * * * * * * * * * * * * * upload * * * * * * * * * * * * * * * * *


/* ---
create initialize data in _fileindex, _documents, _corpusSetting
INPUT: none
OUTPUT: none
--- */
function generateXMLContainer() {

	// each sheet
	_selectedSheet.forEach(sheet => {
		_notMatch[sheet] = {};
		_fileindex[sheet] = {};

		// corpus setting
		_corpusSetting[sheet] = {
			corpus: [],
			metadata: {},
			tag: []
		};

		// each document
		for (let i = 1; i < _dataPool[sheet].length; i++) {

			// record index relationship between _dataPool and _documents
			_fileindex[sheet][i] = _documents.length;

			// add an empty document
			_documents.push({
				attr: { filename: '' },
				corpus: '',
				doc_content: { 
					source: 'null',
					doc_content: { mapping: [], import: [''] },
					MetaTags: [],
					Comment: [],
					Events: []
				}
			});
		}
	});
}


// * * * * * * * * * * * * * * * * required * * * * * * * * * * * * * * * * *


/* ---
fill in corpus and filename in each document (filename must be unique in whole xml)
INPUT: none
OUTPUT: boolean, filename legal = true, not legal = false
--- */
function fillRequiredData() {
	var allFilenames = [];
	var serial = {};
	var pass = true;

	// each sheet
	$('#requiredInterface .settingTab').each(function() {
		let sheet = $(this).attr('name');
		let corpusChoice = $(this).find(`.menu[name="corpus"] .text-only`).attr('value');
		let filenameChoice = $(this).find(`.menu[name="filename"] .text-only`).attr('value');
		let corpusInput = $(this).find(`.menu[name="corpus"] input`).val().trim();
		let filenameInput = $(this).find(`.menu[name="filename"] input`).val().trim();
		serial[filenameInput] = 0;
		_corpusSetting[sheet].corpus = [];

		// each document
		for (let i = 1; i < _dataPool[sheet].length; i++) {
			let corpus, filename;
			let index = _fileindex[sheet][i];

			// corpus
			if (itemInList(corpusChoice, _custom)) corpus = corpusInput;						// 自訂
			else if (!itemInList(corpusChoice, _dataPool[sheet][0])) corpus = corpusChoice;		// 檔案名稱 or 資料表名稱
			else corpus = normalizeData(_dataPool[sheet][i][corpusChoice]);						// 欄位名稱

			// corpus setting
			if (!itemInList(corpus, _corpusSetting[sheet].corpus)) _corpusSetting[sheet].corpus.push(corpus);

			// filename
			if (itemInList(filenameChoice, _custom)) {
				serial[filenameInput]++;
				filename = strPlusNum(filenameInput, serial[filenameInput], 4);			// 自動產生檔名
			} else filename = normalizeFilename(_dataPool[sheet][i][filenameChoice]);	// 欄位名稱

			// filename not unique
			if (itemInList(filename, allFilenames)) {
				alert(`資料表「 ${ sheet } 」檔名不唯一。`);
				pass = false;
				return false;	// break

			// record filename
			} else allFilenames.push(filename);

			// document content
			_documents[index].attr.filename = filename;
			_documents[index].corpus = corpus;
		}
	});

	return pass;
}


// * * * * * * * * * * * * * * * * optional * * * * * * * * * * * * * * * * *


/* ---
remove an optional metadata (tag + value) - _documents, _corpusSetting
INPUT: string, metadata name whose setting is cancelled
OUTPUT: none
--- */
function cancelOptionalMetadata($metaname) {
	if ($metaname === 'null') return;

	// corpus setting
	delete _corpusSetting[_sheet].metadata[$metaname];

	// each file in target sheet
	Object.values(_fileindex[_sheet]).forEach(index => {
		delete _documents[index][$metaname];
	});
}


/* ---
create an optional metadata (tag + value) - _documents, _corpusSetting
INPUT: 1) string, metadata name which is setting
	   2) string, setting value that user select
OUTPUT: none
--- */
function setOptionalMetadata($metaname, $header) {
	if ($metaname === 'null') return true;

	// metadata has already set (same metadata cannot choose twice)
	if ($metaname in _documents[_fileindex[_sheet][1]]) {
		let prevMenu;

		// find prev menu which user set the same metadata
		$(`#optionalInterface .settingTab.target .text-only`).each(function() {
			if ($(this).attr('value') === $metaname) {
				prevMenu = this;
				return false;	// break
			}
		});

		// cancel setting in prev menu
		if (confirm(`「 ${ _metadata[$metaname].chinese } 」已被「 ${ $(prevMenu.parentElement.parentElement).attr('name') } 」選擇，確定要覆蓋設定嗎？`)) {
			$(prevMenu).attr('value', 'null');
			$(prevMenu).html($(prevMenu.parentElement).find('li[value="null"]').html());

		// cancel setting this item
		} else return false;
	}

	// corpus setting
	if (_metadata[$metaname].postclass) _corpusSetting[_sheet].metadata[$metaname] = $header;

	// each file in target sheet
	for (let i in _fileindex[_sheet]) {
		let j = _fileindex[_sheet][i];
		_documents[j][$metaname] = normalizeData(_dataPool[_sheet][i][$header]);
	}

	return true;
}


// * * * * * * * * * * * * * * * * custom * * * * * * * * * * * * * * * * *


/* ---
clear all custom metadata in _documents
INPUT: none
OUTPUT: none
--- */
function resetCustomMetadata() {
	for (let i = 0; i < _documents.length; i++) delete _documents[i].xml_metadata;
}


/* ---
create a custom metadata - _documents
INPUT: 1) string, sheet name
	   2) string, custom metadata name
	   3) string, data setting value that user select
	   4) boolean, if the metadata have a link
	   5) string, (if has link) link data setting value that user select
OUTPUT: none
--- */
function setCustomMetadata($sheet, $metaname, $metachoice, $haslink, $linkchoice) {

	// each document
	for (let i in _fileindex[$sheet]) {
		let j = _fileindex[$sheet][i];
		let data = normalizeData(_dataPool[$sheet][i][$metachoice]);

		// create xml_metadata
		if (!('xml_metadata' in _documents[j])) _documents[j].xml_metadata = {};

		// add link
		if ($haslink) {
			data = {
				a: {
					attr: {
						target: '_blank',
						href: normalizeData(_dataPool[$sheet][i][$linkchoice])
					},
					value: data
				}
			};
		}

		// add a custom metadata
		_documents[j].xml_metadata['Udef_' + $metaname] = data;
	}
}


// * * * * * * * * * * * * * * * * content * * * * * * * * * * * * * * * * *


/* ---
update doc_content source - _documents
INPUT: string, doc_content data source, mapping or import
OUTPUT: none
--- */
function setDocContentSource($value) {
	for (let i in _fileindex[_sheet]) {
		let j = _fileindex[_sheet][i];
		_documents[j].doc_content.source = $value;
	}
}


/* ---
update corresponding mapping data - _document[j].doc_content, _corpusSetting[sheet].tag
INPUT: 1) int, xth mapping object in UI
	   2) string, data setting value that user select
OUTPUT: boolean, success = true, fail = false, success will influence if UI to change
--- */
function setDocContent($index, $header) {
	let tag = $('#contentInterface .settingTab.target .tagTab.target').attr('name');

	// corpus setting
	if (tag === 'MetaTags') _corpusSetting[_sheet].tag[$index].title = $header;

	// each document
	for (let i in _fileindex[_sheet]) {
		let j = _fileindex[_sheet][i];
		let content = ($header in _dataPool[_sheet][i]) ?_dataPool[_sheet][i][$header] :'';
		content = content.toString().trim();

		// document content
		if (tag === 'doc_content') {

			// content not wellform
			if (!checkWellForm(content)) {
				alert(`資料表「 ${ _sheet } 」的第 ${ i } 筆資料內容 (${ _documents[j].attr.filename }) 不符合 well form 格式。`);
				return false;
			}

			_documents[j].doc_content.doc_content.mapping[$index] = normalizeContent(content);

		// metatags
		} else if (tag === 'MetaTags') _documents[j].doc_content.MetaTags[$index].data = normalizeItems(content);

		// comment & events
		else _documents[j].doc_content[tag][$index] = normalizeItems(content);
	}

	return true;
}


/* ---
convert json (_documents) to DocuXML
INPUT: none
OUTPUT: none
--- */
function convertToXML() {
	var worker = new Worker('js/worker.js');

	// reset progress bar
	_progress = {};
	updateProgress('#downloadInterface .explainPanel');

	// receive
	worker.addEventListener('message', function($event) {

		/* data structure {
			func: functions,
			percentage: percentage, (func = progress)
			content: xml string (func = finish)
		} */

		let func = $event.data.func;

		// display progress bar
		if (func === 'progress') {
			_progress.xml = $event.data.percentage;
			updateProgress('#downloadInterface .explainPanel');
			return;
		
		// receive convert result
		} else if (func === 'finish') {
			_xml = $event.data.content;
			$('#XMLoutput').html(`<xmp>${ _xml }</xmp>`);
		}

	}, false);

	// send
	worker.postMessage({ 
		func: 'convert',
		content: _documents,
		corpusSetting: flatCorpusSetting()
	});

	// name
	$('#outputFilename input').val('我的文獻集-' + now());
	$('#databaseName input').val('DB-' + now());
}


/* ---
convert _corpusSetting to specific format (easy to convert to DocuXML)
INPUT: none
OUTPUT: object, flatted _corpusSetting
--- */
function flatCorpusSetting() {
	var setting = {};

	// each sheet setting
	for (let sheet in _corpusSetting) {
		let sheetObj = _corpusSetting[sheet];

		// each corpus
		sheetObj.corpus.forEach(corpusname => {

			// new corpus
			if (!(corpusname in setting)) setting[corpusname] = { metadata: {}, tag: {} };
			
			// metadata
			for (let meta in sheetObj.metadata) {
				setting[corpusname].metadata[meta] = {
					attr: {
						show_spotlight: 'Y',
						display_order: '999'
					},
					value: sheetObj.metadata[meta]
				};
			}

			// tag
			_corpusSetting[sheet].tag.forEach(tagObj => {
				setting[corpusname].tag[tagObj.name] = tagObj.title;
			});
		});
	}

	return setting;
}

