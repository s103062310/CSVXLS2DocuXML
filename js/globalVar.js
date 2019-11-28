/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
This file's functions:
1. defined all used data structures and global variables.
2. initialization of the program.
3. getter (get some information) and checker (return a boolean value).
4. other small tools.
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */


// docusky
var _docuSkyObj;
var _uploadStatus = false;

// switch pages
var _current;
var _procedure = ['upload', 'required', 'optional', 'content', 'download'];


// files
var _inputFiles = [];
var _data = [];			// filename(sheetname) >> data of each row in sheet
var _sheetNum = 0;
var _allowedFileType = ['xls', 'xlsx', 'csv'];

// metadata
var _requiredMeta = {corpus: '文獻集名稱', filename: '檔名'};
var _optionalMeta = {compilation_name: '文件出處', compilation_order: '文件出處的次序', compilation_vol: '文件出處的冊數', title: '文件標題', author: '文件作者', doc_topic_l1: '文件主題階層一', doc_topic_l2: '文件主題階層二', doc_topic_l3: '文件主題階層三', geo_level1: '文件地域階層一', geo_level2: '文件地域階層二', geo_level3: '文件地域階層三', geo_longitude: '文件所在經度', geo_latitude: '文件所在緯度', doc_category_l1: '文件分類階層一', doc_category_l2: '文件分類階層二', doc_category_l3: '文件分類階層三', docclass: '文件類別', docclass_aux: '文件子類別', doctype: '文件型態', doctype_aux: '文件子型態', book_code: '文件書碼', time_orig_str: '文件時間(字串)', time_varchar: '文件時間(西曆)', time_norm_year: '文件時間(中曆)', time_era: '文件時間(年號)', time_norm_kmark: '文件時間(帝號)', year_for_grouping: '文件時間(西元年)', time_dynasty: '文件時間(朝代)', doc_seq_number: '文件順序', timeseq_not_before: '文件起始時間', timeseq_not_after: '文件結束時間', doc_source: '文件來源', doc_attachment: '文件圖檔'};
var _customMeta = ['自訂', '自動產生檔名', '自訂欄位', '為自訂欄位加上超連結'];

// content
var _contentTags = {doc_content: '內文', MetaTags: '多值欄位', Comment: '註解', Events: '事件'};
var _txtData = [];		// tablename >> filename(.txt) >> content of each tag

// fixed constant
var _headerY = 0;
var _xml = "";


/* ---
trigger initialization until finishing initialization when file is ready
--- */
$(document).ready(function() {
	_current = 'upload';
	$('#prevPage').css('display', 'none');
	_docuSkyObj = docuskyManageDbListSimpleUI;
});


function itemInList($item, $list) {
	if ($list.indexOf($item) === -1) return false;
	else return true;
}

function fileInSystem($filename) {
	if (_inputFiles[$filename] === undefined) return false;
	else return true;
}


function removeFromArray($list, $item) {
	let itemPos = $list.indexOf($item);
	$list.splice(itemPos, 1);
}

function addSuffix($filename) {
	var count = 0;
	for (file in _inputFiles) {
		if (file.split('.csv')[0] === $filename.split('.csv')[0]) count++;
	}
	if (count > 0) return $filename + '(' + count + ')';
	else return $filename;
}


function filterEmpty($array) {
	for (let item in $array) {
		if ($array[item] === "") {
			delete $array[item];
			$array.length--;
		}
	}
	return $array;
}


function generateFilename($prefix, $index) {
	var index = $index.toString();
	if (index.length < 5) {
		for (let i=0; i<5-index.length; i++) index = '0' + index;
	}
	return $prefix + '_' + index;
}


function checkStr($str) {
	var half_english = /[A-Za-z\x00-\xff]/g;
	var result = $str.match(half_english);
    if (result == null || result.length != $str.length) return false;
    else return true;
}





