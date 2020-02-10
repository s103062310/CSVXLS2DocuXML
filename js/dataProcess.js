/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
This file defined the functions that used file data or setting 
data to process output result, including generating and checking.
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */


// * * * * * * * * * * * * * * * * upload * * * * * * * * * * * * * * * * *


/* ---
select target sheet from dataPool into data (used)
INPUT: none
OUTPUT: boolean, valid = true, no select sheet = false
--- */
function selectTable() {

	// no upload file
	var sheetNum = $('.fileCover').length;
	if (sheetNum == 0) {
		alert("請先上傳 Excel 檔案。");
		return false;
	}

	// select green border sheet
	for (let i = 0; i < $('.fileCover').length; i++) {
		let tableName = $($('.fileCover')[i]).find('.coverText')[0].innerText;
		let color = $($('.fileCover')[i]).attr('style').split(' ')[1].split(';')[0];
		if (color === 'limegreen') {
			_data[tableName] = _dataPool[tableName];
			_data.length++;
		}
	}

	// no select sheet
	if (_data.length === 0) {
		alert("請至少選擇一份資料表。");
		return false;
	}

	console.log(_data);
	return true;
}


// * * * * * * * * * * * * * * * * required * * * * * * * * * * * * * * * * *


/* ---
check if user fill all blank in required metadata setting page
INPUT: none
OUTPUT: boolean, all filled = true, not completed = false
--- */
function checkRequiredPage() {
	for (let table in _data) {

		// corpus
		let corpus = $('#requiredInterface .settingTab[key=\'' + table + '\'] .menu[name=corpus] button.text-only')[0].innerText;
		if (corpus === '--- 請選擇 ---') {
			alert("請填寫資料表「" + table + "」的「文獻集名稱」。");
			return false;
		} else if (corpus === '自訂') {
			let value = $('#requiredInterface .settingTab[key=\'' + table + '\'] .menu[name=corpus] input')[0].value;
			if (value === '') {
				alert("請填寫資料表「" + table + "」自訂之「文獻集名稱」。");
				return false;
			}
		}

		// filename
		let filename = $('#requiredInterface .settingTab[key=\'' + table + '\'] .menu[name=filename] button.text-only')[0].innerText;
		if (filename === '--- 請選擇 ---') {
			alert("請填寫資料表「" + table + "」的「文件檔案名稱」。");
			return false;
		} else if (filename === '自動產生檔名') {
			let value = $('#requiredInterface .settingTab[key=\'' + table + '\'] .menu[name=filename] input')[0].value;
			if (value === '') {
				alert("請填寫資料表「" + table + "」自訂之「文件檔案名稱」。");
				return false;
			}
		}
	}

	return true;
}


/* ---
generate filenames according to required metadata setting
INPUT: none
OUTPUT: boolean, filename legal = true, not legal = false
--- */
function generateTXTData() {

	// construct data container
	_txtData = [];
	var allFiles = [], index = [];
	for (let table in _data) {

		// access information
		let filenameSetting = $('#requiredInterface .settingTab[key=\'' + table + '\'] .menu[name=filename] button.text-only');
		let choice = $(filenameSetting)[0].innerText;
		let barIndex = choice.indexOf('|');
		
		// initialize
		_txtData[table] = [];
		_txtData.length++;
		_txtData[table].length += _data[table].length-1;

		// auto generate
		if (barIndex == -1) {
			let inputSetting = $('#requiredInterface .settingTab[key=\'' + table + '\'] .menu[name=filename] input');
			let prefix = $(inputSetting)[0].value;
			if (!(prefix in index)) index[prefix] = 1;
			for (let i=0; i<_data[table].length-1; i++) {
				_txtData[table][generateFilename(prefix, index[prefix])] = {};
				index[prefix]++;
			}
			
		// header
		} else {
			let header = choice.substring(barIndex + 2, choice.length);
			for (let row in _data[table]) {
				if (row == 0) continue;

				// filename process
				let filename = _data[table][row][header]
				if (typeof filename == "string") filename = filename.split('.')[0];
				else filename = filename.toString();

				// check if filename legal
				if (allFiles.indexOf(filename) >= 0) {
					alert("檔名不唯一。");
					return false;
				} else {
					_txtData[table][filename] = {};
					allFiles.push(filename);
				}
			}
		}
	}

	console.log(_txtData);
	return true;
}


/* ---
auto generate filenames according to prefix
INPUT: 1) string, prefix
       2) int, index
OUTPUT: string, filename e.g. - prefix_0001
--- */
function generateFilename($prefix, $index) {
	var index = $index.toString();
	var oriLen = index.length;
	if (index.length < 4) {
		for (let i=0; i<4-oriLen; i++) index = '0' + index;
	}
	return $prefix + '_' + index;
}


// * * * * * * * * * * * * * * * * optional * * * * * * * * * * * * * * * * *


/* ---
check if user select the same metadata in optional setting page
INPUT: none
OUTPUT: boolean, valid = true, repeated = false
--- */
function checkOptionalPage() {
	for (let table in _data) {

		// check for each table
		let selectMeta = {}, customMeta = {};
		let blocks = $('#optionalInterface .settingTab[key=\'' + table + '\'] > div');
		for (let i=0; i<blocks.length; i++) {

			// information for each block
			let blockName = $(blocks[i]).attr('name');
			let metadata = $(blocks[i]).find('.text-only')[0].innerText;
			if (metadata == '--- 請選擇 ---') continue;

			// custom => metadata format & unique
			else if (metadata == '自訂欄位') {
				let meta = $(blocks[i]).find('input')[0].value;

				// format
				if (!checkStr(meta)) {
					alert("在「" + blockName + "」的 metadata 「自訂欄位」設定中，請使用半形英文。");
					return false;

				// unique
				} else if (meta in customMeta) {
					alert("「" + customMeta[meta] + "」與「" + blockName + "」皆為自訂欄位「" + meta + "」。\n自訂欄位請取不同的名字。");
					return false;

				} else customMeta[meta] = blockName;

			// normal => unique
			} else if (metadata in selectMeta) {
				alert("「" + selectMeta[metadata] + "」與「" + blockName + "」皆被選為「" + metadata + "」。\n每種 Metadata 只能被選擇一次。");
				return false;

			} else selectMeta[metadata] = blockName;
		}
	}
	
	return true;
}


// * * * * * * * * * * * * * * * * content * * * * * * * * * * * * * * * * *


/* ---
convert excel to DocuXML according to settings in the tool
INPUT: none
OUTPUT: boolean, convert success = true, fail = false
--- */
function convertToXML() {

	// reset
	let info = {'sheetOrder': 0, 'sheetNum': _data.length};
	_xml = '<?xml version=\'1.0\'?>\n<ThdlPrototypeExport>\n<documents>\n';
	$('#XMLoutput').empty();

	// process for each table
	for (let table in _data) {
		let corpusElement = $('#requiredInterface .settingTab[key=\'' + table + '\'] .menu[name=corpus]');
		let corpusSetting = $(corpusElement).find('button.text-only')[0].innerText;
		let corpusSetType = corpusSetting.split('|')[0].trim();
		let metadataElement = $('#optionalInterface .settingTab[key=\'' + table + '\'] > .menu');

		// progress info
		info['fileOrder'] = 0;
		info['fileNum'] = _data[table].length;

		// writing xml
		for (let file in _data[table]) {
			if (file == 0) continue;

			// extract corpus name
			let corpus = '';
			if (corpusSetType === '自訂') {
				corpus = $(corpusElement).find('input')[0].value;
			} else if (corpusSetType === '檔案名稱' || corpusSetType === '資料表名稱') {
				corpus = corpusSetting.split('|')[1].trim();
			} else if (corpusSetType === '欄位名稱') {
				let header = corpusSetting.split('|')[1].trim();
				corpus = _data[table][file][header];
			}

			if (corpus === '') {
				alert("程式錯誤：未找到 corpus name 的設定。\n請洽詢工程師。");
				return false;
			}

			// extract filename
			let filename = Object.keys(_txtData[table])[file-1];

			if (filename === undefined) {
				alert("程式錯誤：未找到 file name 的設定。\n請洽詢工程師。");
				return false;
			}
			
			_xml += '<document filename="' + filename + '">\n<corpus>' + corpus + '</corpus>\n';

			// extract metadata
			let linkText = '連結', linkHref = '', customMetaXML = '';
			for (let m=0; m<metadataElement.length; m++) {
				let header = $($(metadataElement)[m]).attr('name');
				let metaValue = _data[table][file][header];
				let metaSetting = $($(metadataElement)[m]).find('button.text-only')[0].innerText;
				if (metaSetting === '--- 請選擇 ---') continue;
				
				// single metadata
				let metadata = '';
				let metaType = metaSetting.split('|')[0].trim();
				
				if (metaType === '自訂欄位') {
					metadata = $($(metadataElement)[m]).find('input')[0].value;
					customMetaXML += '<' + metadata + '>' + metaValue + '</' + metadata + '>\n';
				
				} else if (metaType === '為自訂欄位加上超連結') {
					let text = $($(metadataElement)[m]).find('input')[0].value;
					linkText = (text != '') ?text : linkText; 
					linkHref = metaValue;
				
				} else if (metaType === '自訂欄位超連結的文字') {
					linkText = metaValue;
				
				} else {
					metadata = metaSetting.split('|')[1].trim();
					_xml += '<' + metadata + '>' + metaValue + '</' + metadata + '>\n';
				}
			}

			if (linkHref != '') customMetaXML += '<a href="' + linkHref + '" trget="_blank">' + linkText + '</a>\n';
			if (customMetaXML != '') _xml += '<xml_metadata>\n' + customMetaXML + '</xml_metadata>\n';

			// append document content
			let contentXML = ''
			for (let tag in _contentTags) {
				let source = $('#contentInterface .settingTab[key=\'' + table + '\'] .tagTab[key=\'' + tag + '\'] div[name=contentSource] button.text-only')[0].innerText;
				if (source === '--- 請選擇 ---') continue;
				
				// mapping
				else if (source === 'CSV/Excel 欄位') {
					let mappingElement = $('#contentInterface .settingTab[key=\'' + table + '\'] .tagTab[key=\'' + tag + '\'] .contentMapping .selectObj');
					let content = "";

					// concate content text
					for (let m=0; m<mappingElement.length; m++) {
						let header = $($(mappingElement)[m]).find('button.text-only')[0].innerText;
						let text = _data[table][file][header];
						if (text !== undefined) {
							if (mappingElement.length > 1 && tag === 'doc_content') content += '<Paragraph>' + text + '</Paragraph>\n';
							else content += text + '\n';
						}
					}

					// check well form
					if (content !== "") {
						if (checkWellForm(content)) contentXML += beginTag(tag) + content + endTag(tag);
						else {
							alert("內文需是 well-form 格式。（位置：資料表 -> " + table + "；文件 -> " + file + "；內容 -> " + tag + "）");
							return false;
						}
						
					}

				// import
				} else if (source === '匯入純文字檔') {
					let content = _txtData[table][filename][tag];
					if ( content !== undefined) {
						if (checkWellForm(content)) contentXML += beginTag(tag) + content + endTag(tag);
						else {
							alert("內文需是 well-form 格式。（位置：資料表 -> " + table + "；文件 -> " + file + "；內容 -> " + tag + "）");
							return false;
						}
					}
				}
			}

			_xml += '<doc_content>\n' + contentXML + '</doc_content>\n</document>\n';
			updateProgress(info, 'content');
			info['fileOrder']++;
		}

		info['sheetOrder']++;
	}

	_xml += '</documents>\n</ThdlPrototypeExport>\n';

	// display
	$('#XMLoutput').append('<xmp>' + _xml + '</xmp>');
	return true;
}


/* ---
generate begin segment of specific tag
INPUT: string, tag type
OUTPUT: string, corresponsed begin segment
--- */
function beginTag($tag) {
	if ($tag === 'doc_content') return '';
	else if ($tag === 'MetaTags') return '<MetaTags NoIndex="1">\n';
	else if ($tag === 'Comment') return '<Comment>\n';
	else if ($tag === 'Events') return '<Events NoTagAnalysis="1">\n';
}


/* ---
generate end segment of specific tag
INPUT: string, tag type
OUTPUT: string, corresponsed end segment
--- */
function endTag($tag) {
	if ($tag === 'doc_content') return '';
	else if ($tag === 'MetaTags') return '</MetaTags>\n';
	else if ($tag === 'Comment') return '</Comment>\n';
	else if ($tag === 'Events') return '</Events>\n';
}


/* ---
check if content text is well form
INPUT: string, content text
OUTPUT: boolean, well form = true, not well form = false
--- */
function checkWellForm($content) {
	var stack = [];
	var i = $content.indexOf('<', 0);

	// go through whole 
	while (i < $content.length && i !== -1) {
		let tagPosEnd = $content.indexOf('>', i);
		let tagStr = $content.substring(i + 1, tagPosEnd).trim();
		let tagName = tagStr.split(' ')[0];
		i = $content.indexOf('<', tagPosEnd);

		// <xxx/>
		if (tagStr[tagStr.length-1] !== '/') {
			
			// </xxx>
			if (tagName[0] === '/') {
				let tag = stack.pop();
				if ('/'+tag !== tagName) return false;
			
			// <xxx>
			} else stack.push(tagName);
		}
	}

	return true;
}

