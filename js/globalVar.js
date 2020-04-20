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
var _requiredMeta = {corpus: '文獻集名稱', filename: '檔名'};
var _optionalMeta = {
	compilation_name: ['文件出處', true], 
	compilation_order: ['文件出處的次序', false], 
	compilation_vol: ['文件出處的冊數', false], 
	title: ['文件標題', false], 
	author: ['文件作者', true], 
	doc_topic_l1: ['文件主題階層一', true], 
	doc_topic_l2: ['文件主題階層二', true], 
	doc_topic_l3: ['文件主題階層三', true], 
	geo_level1: ['文件地域階層一', true], 
	geo_level2: ['文件地域階層二', true], 
	geo_level3: ['文件地域階層三', true], 
	geo_longitude: ['文件所在經度', true], 
	geo_latitude: ['文件所在緯度', true], 
	doc_category_l1: ['文件分類階層一', true], 
	doc_category_l2: ['文件分類階層二', true], 
	doc_category_l3: ['文件分類階層三', true], 
	docclass: ['文件類別', true], 
	docclass_aux: ['文件子類別', false], 
	doctype: ['文件型態', true], 
	doctype_aux: ['文件子型態', false], 
	book_code: ['文件書碼', true], 
	time_orig_str: ['文件時間(字串)', false], 
	time_varchar: ['文件時間(西曆)', false], 
	time_norm_year: ['文件時間(中曆)', true], 
	era: ['文件時間(年號)', true], 
	time_norm_kmark: ['文件時間(帝號)', true], 
	year_for_grouping: ['文件時間(西元年)', true], 
	time_dynasty: ['文件時間(朝代)', true], 
	doc_seq_number: ['文件順序', false], 
	timeseq_not_before: ['文件起始時間', true], 
	timeseq_not_after: ['文件結束時間', true], 
	doc_source: ['文件來源', true], 
	doc_attachment: ['文件圖檔', false]
};
var _customMeta = ['自訂', '自動產生檔名'];


// hint
var _hint = {
	compilation_name: ['後分類顯示：COMP', '說明：該筆文件出處。'], 
	compilation_order: ['後分類顯示：-', '說明：文件出處的排序編號。', '如未設定，系統將自動給訂。'], 
	compilation_vol: ['後分類顯示：-', '說明：該筆文件出處。如有分冊，為所在冊數。'], 
	title: ['後分類顯示：-', '說明：該筆文件標題。'], 
	author: ['後分類顯示：AU', '說明：該筆文件作者。'], 
	doc_topic_l1: ['後分類顯示：TP', '說明：該筆文件的第一層主題。', '在後分類與其他階層主題一同顯示：主題階層一/主題階層二/主題階層三'], 
	doc_topic_l2: ['後分類顯示：TP', '說明：該筆文件的第二層主題。', '在後分類與其他階層主題一同顯示：主題階層一/主題階層二/主題階層三'], 
	doc_topic_l3: ['後分類顯示：TP', '說明：該筆文件的第三層主題。', '在後分類與其他階層主題一同顯示：主題階層一/主題階層二/主題階層三'], 
	geo_level1: ['後分類顯示：GEO', '說明：該筆文件的第一層地域。', '在後分類與其他階層地域一同顯示：地域階層一/地域階層二/地域階層三'], 
	geo_level2: ['後分類顯示：GEO', '說明：該筆文件的第二層地域。', '在後分類與其他階層地域一同顯示：地域階層一/地域階層二/地域階層三'], 
	geo_level3: ['後分類顯示：GEO', '說明：該筆文件的第三層地域。', '在後分類與其他階層地域一同顯示：地域階層一/地域階層二/地域階層三'], 
	geo_longitude: ['後分類顯示：GEO_XY', '說明：該筆文件所在經度。', '在後分類與緯度一同顯示：（經度 X, 緯度 Y）'], 
	geo_latitude: ['後分類顯示：GEO_XY', '說明：該筆文件所在緯度。', '在後分類與經度一同顯示：（經度 X, 緯度 Y）'], 
	doc_category_l1: ['後分類顯示：CAT', '說明：該筆文件的第一層分類。。', '在後分類與其他階層分類一同顯示：分類階層一/分類階層二/分類階層三'], 
	doc_category_l2: ['後分類顯示：CAT', '說明：該筆文件的第二層分類。。', '在後分類與其他階層分類一同顯示：分類階層一/分類階層二/分類階層三'], 
	doc_category_l3: ['後分類顯示：CAT', '說明：該筆文件的第三層分類。。', '在後分類與其他階層分類一同顯示：分類階層一/分類階層二/分類階層三'], 
	docclass: ['後分類顯示：CLASS', '說明：該筆文件所屬的集合類別。'], 
	docclass_aux: ['後分類顯示：-', '說明：該筆文件所屬的子集合類別。'], 
	doctype: ['後分類顯示：TYPE', '說明：該筆文件的型態。'], 
	doctype_aux: ['後分類顯示：-', '說明：該筆文件的子型態。'], 
	book_code: ['後分類顯示：BC', '說明：該筆文件的書碼編號。'], 
	time_orig_str: ['後分類顯示：-', '說明：該筆文件出現在文本的時間資訊，為文字串形式。'], 
	time_varchar: ['後分類顯示：-', '說明：該筆文件的時間，以西元日期填錄。', '填錄格式：yyyymmdd', '未知的部分請補 0，例如：19870500，為 1987 年 5 月，日期未知。'], 
	time_norm_year: ['後分類顯示：CHNY', '說明：該筆文件的時間，以中曆日期填錄。', '填錄格式：一般為「年號00年00月00日」，但不限，仍可使用「不詳」或加「閏」。'], 
	era: ['後分類顯示：ERA', '說明：該筆文件的中曆時間。', '僅填錄年號，例如：乾隆。'], 
	time_norm_kmark: ['後分類顯示：EMP', '說明：該筆文件的中曆時間。', '僅填錄帝號，例如：清高宗。'], 
	year_for_grouping: ['後分類顯示：ADY', '說明：該筆文件的西元年，僅填年。', '西元前的年份，以「-」標示，例：-272，表示西元前 272 年。', '年份未知或沒有年份，系統將自動給予「9999」的值。'], 
	time_dynasty: ['後分類顯示：DYN', '說明：該筆文件的中曆朝代。', '朝代未知或沒有填錄，系統將自動給予「-」。'], 
	doc_seq_number: ['後分類顯示：-', '說明：該文件標示的時間順序。', '填錄整數，正負數均可。'], 
	timeseq_not_before: ['後分類顯示：TNB', '後分類說明：計算該日期之後的所有文件。', '說明：該文件標示的起始時間。', '填錄格式：yyyymmdd 或 -yyyymmdd。未知或沒有則補 0。'], 
	timeseq_not_after: ['後分類顯示：TNA', '後分類說明：計算該日期之前的所有文件', '說明：該文件標示的結束時間。', '填錄格式：yyyymmdd 或 -yyyymmdd。未知或沒有則補0。'], 
	doc_source: ['後分類顯示：SRC', '說明：該文件的來源，可能為某個文獻集。'], 
	doc_attachment: ['後分類顯示：-', '說明：該文件的附圖。', '允許多圖檔，需以半形「;」區隔。', '填錄圖檔完整的 URI。', '也可填錄圖檔名稱（須含附檔名），但該圖檔需上傳 DocuSky 主機才能顯示。（目前 DocuSky 圖檔上傳功能未開放）']
};


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
filter empty element in array
INPUT: original array
OUTPUT: filtered array
--- */
function filterEmpty($array) {
	for (let item in $array) {
		$array[item] = $array[item].replace(/"/g, '').replace(/'/g, '');
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

