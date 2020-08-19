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
var _procedure = ['upload', 'required', 'optional', 'custom', 'content', 'download'];


// files
var _inputFiles = [];
var _dataPool = [];				// filename(sheetname) >> data of each row in sheet
var _data = [];					// used data in dataPool
var _allowedFileType = ['xls', 'xlsx', 'csv'];


// metadata 
var _custom = ['自訂', '自動產生檔名'];
var _metadata;
$.getJSON('js/meta.json', function(result) {
	_metadata = result;
});


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

	//
	$(function () { $("[data-toggle='tooltip']").tooltip(); });

	// explain
	$('#explainText').load('html/explain.html');
	setTimeout(function(){
		$('#usage').click();
	}, 600);
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
update progress number
INPUT: 1) object, needed information when calculating progress
       2) string, record progress in where
OUTPUT: none, print progress in console
--- */
function updateProgress($info, $type) {
	var percentage;
	if ($type === 'upload') percentage = ($info['fileOrder'] / $info['fileNum'] + ($info['sheetOrder']+1) / $info['sheetNum'] / $info['fileNum']) * 100;
	else if ($type === 'required') percentage = ($info['sheetOrder'] / $info['sheetNum'] + ($info['fileOrder']+1) / $info['fileNum'] / $info['sheetNum']) * 100;
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


/* ---
convert list to string in html form
INPUT: list object that record hint
OUTPUT: html string
--- */
function list2html($list) {
	var html = "<ul>";
	for (let i in $list) html += "<li>" + $list[i] + "</li>";
	html += "</ul>";
	return html;
}

