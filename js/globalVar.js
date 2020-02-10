/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
This file's functions:
1. defined all used data structures and global variables.
2. initialization of the program.
3. getter (get some information) and checker (return a boolean value).
4. other small tools.
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */


// * * * * * * * * * * * * * * * * variables * * * * * * * * * * * * * * * * *


// docusky
var _docuSkyObj;


// switch pages
var _current;
var _procedure = ['upload', 'required', 'optional', 'content', 'download'];


// files
var _inputFiles = [];
var _dataPool = [];				// filename(sheetname) >> data of each row in sheet
var _data = [];					// used data in dataPool
var _allowedFileType = ['xls', 'xlsx', 'csv'];


// metadata
var _requiredMeta = {corpus: '文獻集名稱', filename: '檔名'};
var _optionalMeta = {compilation_name: ['文件出處', true], compilation_order: ['文件出處的次序', false], compilation_vol: ['文件出處的冊數', false], title: ['文件標題', false], author: ['文件作者', true], doc_topic_l1: ['文件主題階層一', true], doc_topic_l2: ['文件主題階層二', true], doc_topic_l3: ['文件主題階層三', true], geo_level1: ['文件地域階層一', true], geo_level2: ['文件地域階層二', true], geo_level3: ['文件地域階層三', true], geo_longitude: ['文件所在經度', true], geo_latitude: ['文件所在緯度', true], doc_category_l1: ['文件分類階層一', true], doc_category_l2: ['文件分類階層二', true], doc_category_l3: ['文件分類階層三', true], docclass: ['文件類別', true], docclass_aux: ['文件子類別', false], doctype: ['文件型態', true], doctype_aux: ['文件子型態', false], book_code: ['文件書碼', true], time_orig_str: ['文件時間(字串)', false], time_varchar: ['文件時間(西曆)', false], time_norm_year: ['文件時間(中曆)', true], time_era: ['文件時間(年號)', true], time_norm_kmark: ['文件時間(帝號)', true], year_for_grouping: ['文件時間(西元年)', true], time_dynasty: ['文件時間(朝代)', true], doc_seq_number: ['文件順序', false], timeseq_not_before: ['文件起始時間', true], timeseq_not_after: ['文件結束時間', true], doc_source: ['文件來源', true], doc_attachment: ['文件圖檔', false]};
var _customMeta = ['自訂', '自動產生檔名', '自訂欄位', '為自訂欄位加上超連結'];


// content
var _contentTags = {doc_content: '內文', MetaTags: '多值欄位', Comment: '註解', Events: '事件'};
var _txtData = [];		// tablename >> filename(.txt) >> content of each tag
var _txtBuffer = [];	// not matching blob


// global variables
var _xml = "";
var _temp = {'sheetNum': 0, 'headerY': 0};


// * * * * * * * * * * * * * * * * initialization * * * * * * * * * * * * * * * * *


/* ---
trigger initialization until finishing initialization when file is ready
--- */
$(document).ready(function() {
	_current = 'upload';
	$('#prevPage').css('display', 'none');
	_docuSkyObj = docuskyManageDbListSimpleUI;
	_docuSkyObj.uploadProgressFunc = function($percentage){
		$('#downloadInterface .progress-bar').attr('style', 'width: ' + $percentage + '%; display: grid; align-items: center;');
		$('#downloadInterface .progress-bar span').empty().append($percentage + ' %');
	}
});


// * * * * * * * * * * * * * * * * getter & checker * * * * * * * * * * * * * * * * *


/* ---
getting now time
INPUT: none
OUTPUT: now time in string form
--- */
function now() {
	let hour = (new Date()).getHours();
	let minute = (new Date()).getMinutes();
	let second = (new Date()).getSeconds();
	let date = (new Date()).toDateString().replace(/ /g, '_');
	return date + '-' + hour + '_' + minute + '_' + second;
}


/* ---
check if specific item is in the list
INPUT: 1) single list element
       2) target list
OUTPUT: boolean, in list = true, not in list = false
--- */
function itemInList($item, $list) {
	if ($list.indexOf($item) === -1) return false;
	else return true;
}


/* ---
check if specific file is in the system
INPUT: string, source filename
OUTPUT: boolean, in system = true, not in system = false
--- */
function fileInSystem($filename) {
	if (_inputFiles[$filename.split('.')[0]] === undefined) return false;
	else return true;
}


/* ---
check if string charactsrs are all half and english character
INPUT: string
OUTPUT: boolean, all half and english = true, otherwise = false
--- */
function checkStr($str) {
	var half_english = /[A-Za-z\x00-\xff]/g;
	var result = $str.match(half_english);
	if (result == null || result.length != $str.length) return false;
	else return true;
}


// * * * * * * * * * * * * * * * * other small tools * * * * * * * * * * * * * * * * *


/* ---
add suffix for files that have the same filename
INPUT: string, filename
OUTPUT: string, filename that adds suffix
--- */
function addSuffix($filename) {
	var count = 0;
	for (file in _inputFiles) {
		if (file.split('(')[0] === $filename) count++;
	}
	if (count > 0) return $filename + '(' + count + ')';
	else return $filename;
}


/* ---
filter empty element in array
INPUT: original array
OUTPUT: filtered array
--- */
function filterEmpty($array) {
	for (let item in $array) {
		if ($array[item] === "") {
			delete $array[item];
			$array.length--;
		}
	}
	return $array;
}


/* ---
update progress number
INPUT: 1) object, needed information when calculating progress
       2) string, record progress in where
OUTPUT: none, print progress in console
--- */
function updateProgress($info, $type) {
	var percentage;
	if ($type === 'upload') percentage = ($info['fileOrder'] / $info['fileNum'] + ($info['sheetOrder']+1) / $info['sheetNum'] / $info['fileNum']) * 100;
	else if ($type === 'required') percentage = ($info['sheetOrder'] / $info['sheetNum'] + $info['tagOrder'] / $info['tagNum'] / $info['sheetNum'] + ($info['fileOrder']+1) / $info['fileNum'] / $info['tagNum'] / $info['sheetNum']) * 100;
	else if ($type === 'content') percentage = ($info['sheetOrder'] / $info['sheetNum'] + ($info['fileOrder']+1) / $info['fileNum'] / $info['sheetNum']) * 100;
	else if ($type === 'table') percentage = ($info['rowOrder'] / $info['rowNum']) * 100;
	if (percentage - _temp['percentage'] >= 1) {
		console.log($type + ':' + percentage.toFixed(0).toString() + '%');
		_temp['percentage'] = percentage;
	}
}


/* ---
trigger when user start to drag not match file in buffer area
INPUT: event object
--- */
function dragNotMatchFileStart($event) {
	$event.dataTransfer.setData('text/plain', $event.target.innerText.split('.')[0]);
}


/* ---
trigger when user drag not match file and enter files table row (change css)
INPUT: event object
--- */
function dragNotMatchFileEnter ($event) {
	$event.preventDefault();
	$event.stopPropagation();
	this.classList.add('notMatchHover');
}


/* ---
trigger when user drag not match file and cover files table row
INPUT: event object
--- */
function dragNotMatchFileOver ($event) {
	$event.preventDefault();
	$event.stopPropagation();
}


/* ---
trigger when user drag not match file and leave files table row (change css)
INPUT: event object
--- */
function dragNotMatchFileLeave ($event) {
	$event.preventDefault();
	$event.stopPropagation();
	this.classList.remove('notMatchHover');
}


/* ---
trigger when user drop not match file in table row of a file
change css and extract uploaded file
INPUT: event object
--- */
function dropNotMatchFile($event) {
	$event.preventDefault();
	$event.stopPropagation();
	this.classList.remove('notMatchHover');

	// access data
	var filename = $event.dataTransfer.getData('text/plain');
	var table = $(this.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement).attr('key');
	var tag = $(this.parentElement.parentElement.parentElement.parentElement.parentElement).attr('key');

	// load txt
	$('#singleTXT').attr('target-table', table);
	$('#singleTXT').attr('target-tag', tag);
	load('text', _txtBuffer[filename], loadTXT($(this).attr('name')));

	// remove html
	$('#contentInterface .settingTab[key=\'' + table + '\'] .tagTab[key=' + tag + '] .notMatch div[name=' + filename + ']').remove();
	delete _txtBuffer[filename];
}
