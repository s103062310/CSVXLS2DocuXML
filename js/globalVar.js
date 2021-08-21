/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
This file defines:
1. all used data structures and global variables.
2. initialization of the program.
3. overwirte class prototype.
4. other small tools.
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */


class txtBuffer {
 	constructor() {
 		this.content = {
 			mapping: [],		// index: txt object [index(sheet): txt]
 			import: {}			// index(sheet): txt
 		};

 		this.metatag = {
 			mapping: []
 		};

 		this.comment = {
 			mapping: []
 		};

 		this.event = {
 			mapping: []
 		};
 	}

 	addNewMapping(name) {
 		this[name].mapping.push({});
 		return this[name].mapping.length-1;
 	}

 	setMapping(name, index, id, data) {
 		this[name].mapping[index][id] = data;
 	}

 	removeMapping(name, index) {
 		this[name].mapping[index] = undefined;
 	}

 	getMapping(name) {
 		return this[name].mapping;
 	}

 	setImport(id, data) {
 		this.content.import[id] = data;
 	}

 	removeImport(id) {
 		delete this.content.import[id];
 	}

 	getImport(id) {
 		if (id) return this.content.import[id];
 		return this.content.import;
 	}
 }


// * * * * * * * * * * * * * * * * variables * * * * * * * * * * * * * * * * *


// docusky
var _docuSkyObj;


// switch pages
const _procedure = ['upload', 'required', 'optional', 'custom', 'content', 'download'];
var _current = _procedure[0];
var _sheet;						// target sheet when setting
var _file;						// target file index when uploading txt


// data
const _allowedFileType = ['xls', 'xlsx', 'csv'];
var _dataPool = [];				// row data: sheet id >> data of each row in sheet
var _selectedSheet = [];		// selected sheet id
var _fileindex = {};			// corresponded index in _dataPool: index in _documents
var _documents = [];			// array of Documents (docuxml.js)
var _corpusSetting = {};		// CorpusMetadata (docuxml.js)


// metadata 
var _metadata = new MetadataSpec();


// content
const _contentTags = { 
	content: {
		name: 'doc_content',
		zh: '內文'
	}, metatag: {
		name: 'MetaTags',
		zh: '多值欄位'
	}, comment: {
		name: 'Comment',
		zh: '註解'
	}, event: {
		name: 'Events',
		zh: '事件' 
	}
};
var _buffer = {};						// txtBuffer, sheet id: content buffer
var _notMatch = {};						// sheet id: not matching blob [file id: text]


// convert
var _xml = '';							// final xml string


// others
var _explain = '';						// html of explain page
var _progress = {};						// progress recorder


// * * * * * * * * * * * * * * * * initialization * * * * * * * * * * * * * * * * *


// google analytics
if (typeof gtagEventLog == 'function') {
	gtagEventLog({
		action: 'view',
		category: 'tool',
		label: '表格文本轉換工具'
	});
}


/* ---
trigger initialization until finishing initialization when file is ready
--- */
$(document).ready(function() {

	// load explain text and show
	$.get('explain.html', function(result) {
		_explain = result;
	});

	// first page
	$('#prev-btn').css('display', 'none');

	// docusky widget TODO
	_docuSkyObj = docuskyManageDbListSimpleUI;
	_docuSkyObj.uploadProgressFunc = function(percentage){
		$('#download .main .progress-bar').attr('style', `width: ${ percentage }%;`);
		$('#download .main .progress-bar').html(`${ percentage } %`);
	};

	// data
	_dataPool.length = 0;
});


// * * * * * * * * * * * * * * * * prototype * * * * * * * * * * * * * * * * *


/* ---
check if specific item is in array
INPUT: any, searched element
OUTPUT: boolean, in = true, not in = false
--- */
Array.prototype.has = function(item) {
	return this.indexOf(item) >= 0;
}


/* ---
generate string in specific form
INPUT: string, suffix of each item
OUTPUT: string, array string
--- */
Array.prototype.toListStr = function(suffix) {
	var str = '';
	this.forEach(item => {
		str += '- ' + item + ((suffix) ?suffix :'') + '\n';
	});
	return str;
}


/* ---
check if string is well form
OUTPUT: bool, well form = true, not = false
--- */
String.prototype.isWellform = function() {
	if (!this.hasTag()) return true;
	return $(new DOMParser().parseFromString(this, 'text/xml')).find('parsererror').length === 0;
}


/* ---
add suffix to string (used in auto generate filename)
INPUT: 1) int/string, number/suffix
	   2) int, padding zero to specific length
OUTPUT: string, prefixstring_numberstring
--- */
String.prototype.suffix = function(num, padding) {

	// padding zero
	var numStr = num.toString();
	for (let i = numStr.length; i < padding; i++) numStr = '0' + numStr;

	// complete string
	return this + '_' + numStr;
}


/* ---
normaliza string to specific format
INPUT: string, process mode
OUTPUT: string, normalized string
--- */
String.prototype.normalize = function(mode) {
	if (mode === 'filename') return this.normalize().replace('.txt', '').trim();
	else if (mode === 'tag') return this.trim().replace(/\s+/g, '_');
	else if (mode === 'metadata') return this.replace(/\n/g, '').trim().toxml();
	else if (mode === 'content') {
		let tagReg = /<\/?.+?\/?>/g;
		let tags = this.match(tagReg);
		let str = this.replace(tagReg, '▓').toxml();
		if (tags === null) return str;	// no tags
		for (let i = 0; i < tags.length; i++) str = str.replace('▓', tags[i]);	// put tag back
		return str;
	} else return this.toxml();
}


/* ---
replace special char in xml format
OUTPUT: string, filtered string
--- */
String.prototype.toxml = function() {
	return  this.replace(/&/g, '&amp;')		// This MUST be the 1st replacement.
				.replace(/'/g, '&apos;')	// The 4 other predefined entities, required.
				.replace(/"/g, '&quot;')
				.replace(/</g, '&lt;')
				.replace(/>/g, '&gt;');
}


// * * * * * * * * * * * * * * * * other small tools * * * * * * * * * * * * * * * * *


/* ---
check if string charactsrs are all half and english character
INPUT: string, original string
OUTPUT: boolean, all half and english = true, otherwise = false
--- */
function checkHalfAndEnglish(str) {
	var result = str.match(/[A-Za-z0-9_]/g);
	if (result == null || result.length != str.length) return false;
	else return true;
}


/* ---
get time now (as unique name)
OUTPUT: string, time in string form
--- */
function now() {
	let hour = (new Date()).getHours();
	let minute = (new Date()).getMinutes();
	let second = (new Date()).getSeconds();
	let date = (new Date()).toDateString().replace(/\s/g, '_');
	return `${ date }_${ hour }_${ minute }_${ second }`;
}


/* ---
update progress (data store in _progress) at specific location
INPUT: string, selector that describes progress bar's location
OUTPUT: none, just display progress in progress bar
--- */
function updateProgress(loc) {

	// calculate
	var progresses = Object.values(_progress);
	var percentage = (progresses.length > 0) ?Math.round(progresses.reduce((a, b) => a+b) / progresses.length * 100) :0;
	
	// UI
	var progressBar = $(loc + ' .progress-bar');
	$(progressBar).css('width', percentage + '%');
	$(progressBar).html(percentage + '%');

	// show or hide
	if (checkProgress()) $(loc + ' .progress').hide();
	else $(loc + ' .progress').show();
}


/* ---
check if progress is finished
OUTPUT: boolean, all finished = true, otherwise = false
--- */
function checkProgress() {
	if (Object.keys(_progress).length <= 0) return false;
	for (let f in _progress) { if (_progress[f] < 1) return false; }
	return true;
}