/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
This file defines:
1. all used data structures and global variables.
2. initialization of the program.
3. getter (get some information).
4. other small tools.
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */


// * * * * * * * * * * * * * * * * variables * * * * * * * * * * * * * * * * *


// docusky
var _docuSkyObj;


// switch pages
const _procedure = ['upload', 'required', 'optional', 'custom', 'content', 'download'];
var _current;


// row data
const _allowedFileType = ['xls', 'xlsx', 'csv'];
var _inputFiles = {};
var _dataPool = [];				// filename(sheetname) >> data of each row in sheet


// selected data
var _selectedSheet = [];
var _fileindex = {};			// corresponded index in _dataPool: index in _documents
var _documents = [];			// data for generate document xml
var _corpusSetting = {};		// setting data for generate corpus metadata xml


// metadata 
const _custom = ['自訂', '自動產生檔名'];
var _metadata;					// data in meta.json


// content
const _contentTags = { doc_content: '內文', MetaTags: '多值欄位', Comment: '註解', Events: '事件' };
var _matching = {};
var _notMatch = {};		// not matching blob


// others
var _sheet;				// target sheet when setting
var _progress;			// progress recorder
var _showFixedY = -1;	// recorded pos that fixed element should appear
var _xml = '';			// final xml string


// * * * * * * * * * * * * * * * * initialization * * * * * * * * * * * * * * * * *


/* ---
trigger initialization until finishing initialization when file is ready
--- */
$(document).ready(function() {

	// load metadata info
	$.getJSON('js/meta.json', function(result) {
		_metadata = result;
	});

	// load explain text and show
	$('.explainDirectory').load('html/explainDir.html');
	$('.explainContent').load('html/explain.html');
	setTimeout(function() {
		$('#usage').click();
	}, 600);

	// active tooltip of tool bar
	$(function() { 
		$("[data-toggle='tooltip']").tooltip();
	});

	// first page
	_current = 'upload';
	$('#prevPage').css('display', 'none');

	// docusky widget TODO
	_docuSkyObj = docuskyManageDbListSimpleUI;
	_docuSkyObj.uploadProgressFunc = function($percentage){
		$('#downloadInterface .progress-bar').attr('style', `width: ${ $percentage }%; display: grid; align-items: center;`);
		$('#downloadInterface .progress-bar span').html(`${ $percentage } %`);
	}
});


// * * * * * * * * * * * * * * * * getter * * * * * * * * * * * * * * * * *


/* ---
get number of all sheets that are in system 
INPUT: none
OUTPUT: int, number of sheets
--- */
function getAllSheetNum() {
	return Object.values(_inputFiles).reduce((a, b) => a+b);
}


/* ---
calculate number of target filename in all filenames (remove string in (num))
INPUT: 1) string, target filename
	   2) array, all filenames
OUTPUT: int, number of target filename
--- */
function getFileNum($filename, $names) {
	var count = 0;

	$names.forEach(name => {
		let filename = name.replace(/\([0-9]+\)/, '');
		if (filename === $filename) count++;
	});

	return count;
}


/* ---
get time now (as unique name)
INPUT: none
OUTPUT: string, time in string form
--- */
function now() {
	let hour = (new Date()).getHours();
	let minute = (new Date()).getMinutes();
	let second = (new Date()).getSeconds();
	let date = (new Date()).toDateString().replace(/\s/g, '_');
	return `${ date }_${ hour }_${ minute }_${ second }`;
}


// * * * * * * * * * * * * * * * * other small tools * * * * * * * * * * * * * * * * *


/* ---
combine string with number (used in repeated filename)
INPUT: 1) string, prefix string
	   2) int, number
	   3) int, padding zero to specific length
	   4) string, style of number's string
OUTPUT: string, prefixstring_numberstring
--- */
function strPlusNum($str, $num, $padding, $style) {

	// padding zero
	var numStr = $num.toString();
	for (let i = numStr.length; i < $padding; i++) numStr = '0' + numStr;

	// complete string
	if ($style === 'bracket') return $str + '(' + numStr + ')';
	else return $str + '_' + numStr;
}


/* ---
generally normalize data
INPUT: string, data string
OUTPUT: string, normalized data
--- */
function normalizeData($data) {
	if ($data === undefined) return '-';
	return filterChar($data.toString().replace(/\n/g, '').trim());
}


/* ---
normalize filename - remove .xxx
INPUT: string, original filename
OUTPUT: string, normalized filename
--- */
function normalizeFilename($filename) {
	let normalized = normalizeData($filename);

	// parse filename
	let filenameParts = normalized.split('.');
	let fileType = filenameParts[filenameParts.length-1];

	return normalized.replace(`.${ fileType }`, '');
}


/* ---
normalize string in tag - space to underline
INPUT: string, tag string
OUTPUT: string, normalized tag
--- */
function normalizeTag($tag) {
	return $tag.trim().replace(/\s+/g, '_');
}


/* ---
normalize doc_content data - replace special char but keep inner tag
INPUT: string, content string
OUTPUT: string, normalized content
--- */
function normalizeContent($content) {
	let tagReg = /<\/?.+?\/?>/g;
	let tags = $content.match(tagReg);
	let str = filterChar($content.replace(tagReg, '▓'));

	// no tags
	if (tags === null) return str;

	// put tag back
	for (let i = 0; i < tags.length; i++) str = str.replace('▓', tags[i]);
	return str;
}


/* ---
normalize items in metatags, comment, events which is split by ;
INPUT: string, content string
OUTPUT: array, normalized items in content
--- */
function normalizeItems($content) {
	let items = $content.split(';');

	// filter empty
	for (let i = length-1; i >= 0; i--) {
		items[i] = filterChar(items[i].trim());
		if (items[i] === '') items.splice(i, 1);
	}

	return items;
}


/* ---
replace special char in xml format
INPUT: string, original string
OUTPUT: string, filtered string
--- */
function filterChar($str) {

	// undefined
	if ($str === undefined) return $str;

	// check type
	if (typeof $str != 'string') $str = $str.toString();

	var str = $str.replace(/&/g, '&amp;')	// This MUST be the 1st replacement.
				  .replace(/'/g, '&apos;')	// The 4 other predefined entities, required.
				  .replace(/"/g, '&quot;')
				  .replace(/</g, '&lt;')
				  .replace(/>/g, '&gt;');
	return str;
}


/* ---
generate string in specific form from array
INPUT: array, string array
OUTPUT: string, array string
--- */
function array2Str($arr) {
	var str = '';
	$arr.forEach(item => {
		str += `- ${ item }\n`;
	});
	return str;
}


/* ---
update progress (data store in _progress) at specific location
INPUT: string, selector that describes progress bar's location
OUTPUT: none, just display progress in progress bar
--- */
function updateProgress($loc) {

	// calculate
	var progresses = Object.values(_progress);
	var percentage = (progresses.length > 0) ?Math.round(progresses.reduce((a, b) => a+b) / progresses.length * 100) :0;
	
	// UI
	var progressBar = $(`${ $loc } .progress-bar`);
	$(progressBar).css('width', `${ percentage }%`);
	$(progressBar).html(`<span>${ percentage } %</span>`);

	// show or hide
	if (checkProgress()) $(`${ $loc } .progress`).hide();
	if (Object.keys(_progress).length <= 0) $(`${ $loc } .progress`).show();
}


