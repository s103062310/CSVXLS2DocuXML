/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
This file defined worker scripts to prevent UI blocked.
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */


// include excel module
self.importScripts('https://oss.sheetjs.com/sheetjs/xlsx.full.min.js');


/* ---
receive message from main page
--- */
self.addEventListener('message', function($event) {
	var data = $event.data;
	var result;

	/* data structure {
		func: function
	}*/
	
	// to correspond functions
	switch (data.func) {

		case 'parseexcel':

			/* data structure {
				content: processed data of one sheet
			}*/

			parseSheet(readExcel(data.content));			
			break;

		case 'showsheet':

			/* data structure {
				data: sheet data
			}*/

			generateSheetTableHtml(data.content);
			break;

		case 'convert':

			/* data structure {
				content: documents json,
				corpusSetting: corpus setting json
			}*/

			generateDocuXML(data.content, data.corpusSetting);
			break;

		default:
			console.log(`Func "${ data.func }" not found.`);
			break;
	}
}, false);


// * * * * * * * * * * * * * * * * upload * * * * * * * * * * * * * * * * *


/* ---
read excel content from row data
INPUT: obj, row data
OUTPUT: obj, excel work book
--- */
function readExcel($data) {
	var wb = XLSX.read($data, { type: 'binary' });

	// send progress
	self.postMessage({
		func: 'progress',
		percentage: 0.5
	});

	// send progress
	self.postMessage({
		func: 'sheetnum',
		sheetNum: wb.SheetNames.length
	});

	return wb;
}


/* ---
parse excel data into json format (including header)
INPUT: object, excel work book
OUTPUT: (send) string, sheet name and array, cleared data
--- */
function parseSheet($wb) {

	// each sheet
	$wb.SheetNames.forEach((sheetName, i) => {
		let content = filterEmptyEntryandExtractHeader(XLSX.utils.sheet_to_json($wb.Sheets[sheetName]));
		
		// send progress
		self.postMessage({
			func: 'progress',
			percentage: (i+1) / $wb.SheetNames.length / 2 + 0.5
		});

		// send data
		self.postMessage({
			func: 'sheetcontent',
			sheetName: sheetName,
			content: content
		});
	});

	// send fin
	self.postMessage({
		func: 'progress',
		percentage: 1
	});
}


/* ---
check and filter empty data cell, extract and add header
INPUT: array, parsed excel data (an element is a row in excel)
OUTPUT: array, cleared excel data
--- */
function filterEmptyEntryandExtractHeader($content) {
	var header = [];

	for (let i = $content.length-1; i >= 0; i--) {

		// check each entry
		Object.keys($content[i]).forEach(key => {
			let value = $content[i][key].toString().trim();

			// delete empty entry
			if (value === '') delete $content[i][key];

			// uniform key
			else {

				// correct key
				let newKey = key.toString().replace(/[\s'"]/g, '');
				if (header.indexOf(newKey) < 0) header.push(newKey);

				// sync key and data
				if (newKey !== key) {
					$content[i][newKey] = value;
					delete $content[i][key];
				}
			}
		});

		// delete empty line
		if (Object.keys($content[i]).length <= 0) delete $content[i];
	}

	$content.splice(0, 0, header);
	return $content;
}


/* ---
check and filter empty data cell, extract and add header
INPUT: array, sheet data (an element is a row in sheet)
OUTPUT: (send) string, <table> html
--- */
function generateSheetTableHtml($data) {

	$data.forEach((file, i) => {
		let html = '';

		// header
		if (i === 0) {
			file.forEach(val => {
				html += `<th>${ val }</th>`;
			});

		// content
		} else {
			$data[0].forEach(key => {
				html += `<td>${ file[key] }</td>`;
			});
		}

		// send html
		self.postMessage({
			loc: (i === 0) ?'thead' :'tbody',
			html: '<tr>' + html + '</tr>'
		});
	});
}


// * * * * * * * * * * * * * * * * convert * * * * * * * * * * * * * * * * *


/* ---
check and filter empty data cell, extract and add header
INPUT: 1) array, documents data
	   2) object, corpus metadata setting data
OUTPUT: (send) string, converted DocuXML
--- */
function generateDocuXML($data, $corpusSetting) {
	var corpus = '';
	var docs = '';

	// each corpus
	for (let corpusname in $corpusSetting) {
		corpus += `<corpus name="${ corpusname }">
						${ generateXML('metadata_field_settings', $corpusSetting[corpusname].metadata, true) }
						${ generateTagSetting($corpusSetting[corpusname].tag) }
					</corpus>`;
	}

	// each document
	$data.forEach((docObj, i) => {
		docs += `<document${ generateAttr(docObj.attr) }>
					${ generateMetadata(docObj) }
					${ generateDocContent(docObj.doc_content) }
				</document>\n`;

		// send progress
		self.postMessage({
			func: 'progress',
			percentage: (i+1) / $data.length
		});
	});

	// whole xml
	var xml = `<?xml version="1.0"?>
				<ThdlPrototypeExport>
					${ corpus }
					<documents>${ docs }</documents>
				</ThdlPrototypeExport>`.replace(/\s{2,}/g, '\n');

	// send data
	self.postMessage({
		func: 'finish',
		content: xml
	});

	// send fin
	self.postMessage({
		func: 'progress',
		percentage: 1
	});
}


/* ---
generate xml attribute string from attribute object
INPUT: object, attribute name and its value
OUTPUT: string, xml attribute string
--- */
function generateAttr($attr) {
	let attrStr = '';
	for (let name in $attr) attrStr += ` ${ name }="${ $attr[name] }"`;
	return attrStr;
}


/* ---
generate basic xml string
INPUT: 1) string, tag name
	   2) string/object, tag value
	   3) boolean, if need to change line between tag and value
OUTPUT: string, xml string
--- */
function generateXML($tagname, $value, $br) {
	let xml = '', attr = '';

	// to leaf
	if (typeof $value === 'string') xml = $value;

	// value is still an object
	else {
		for (let tagname in $value) {
			let br = (typeof $value[tagname] === 'object' && 'a' in $value[tagname]) ?true : false;
			if (tagname === 'attr') attr = generateAttr($value[tagname]);
			else if (tagname === 'value') xml += $value[tagname];
			else xml += generateXML(tagname, $value[tagname], br);
		}
	}
	
	if ($br) return `<${ $tagname }${ attr }>\n${ xml }\n</${ $tagname }>\n`;
	else return `<${ $tagname }${ attr }>${ xml }</${ $tagname }>\n`;
}


/* ---
generate tag setting xml string from tags object
INPUT: object, tag name and its value
OUTPUT: string, xml string of tag setting
--- */
function generateTagSetting($tags) {
	let tagXML = '';
	let index = 1;

	for (let tagname in $tags) {
		let value = $tags[tagname];
		tagXML +=  `<spotlight category="${ tagname }" sub_category="-" display_order="${ index }" title="${ value }"/>\n
					<tag type="contentTagging" name="${ tagname }" default_category="${ tagname }" default_sub_category="-"/>`;
		index++;
	}

	return generateXML('feature_analysis', tagXML, true);
}


/* ---
generate metadata xml string from document object
INPUT: object, a whole document
OUTPUT: string, xml string of all metadata
--- */
function generateMetadata($docObj) {
	let metaStr = '';

	// each metadata
	for (let tag in $docObj) {
		if (tag === 'attr' || tag === 'doc_content') continue;
		let br = (tag === 'xml_metadata') ?true : false;
		metaStr += generateXML(tag, $docObj[tag], br);
	}

	return metaStr;
}


/* ---
generate doc_content xml string from content object
INPUT: object, doc_content
OUTPUT: string, xml string of doc_content
--- */
function generateDocContent($contentObj) {
	let XML = '';

	// each tab: doc_content, MetaTags, Comment, Events
	for (let tab in $contentObj) {
		if (tab === 'source') continue;
		if (tab === 'doc_content' && $contentObj.source === 'null') continue;

		let tabXML = '';
		let data = (tab === 'doc_content') ?[ $contentObj[tab][$contentObj.source] ] :$contentObj[tab];

		// each select object (setting)
		data.forEach(obj => {
			let objArr = (tab === 'MetaTags') ? obj.data : obj;
			let xml = '';

			// each value in a setting (;)
			clearEmpty(objArr).forEach(value => {
				if (tab === 'doc_content' && objArr.length === 1) xml += value + '\n';
				else if (tab === 'doc_content') xml += generateXML('Paragraph', value, false);
				else if (tab === 'MetaTags') xml += generateXML(obj.tagname, value, false);
				else if (tab === 'Comment') xml += generateXML('CommentItem', { attr: { Category: '' }, value: value }, false);
				else if (tab === 'Events') xml += generateXML('Event', { attr: { Title: '' }, value: value }, false);
			});

			// xml of a setting
			if (xml !== '') {
				if (tab === 'Comment' || tab === 'Events') tabXML += generateXML(tab, xml, true);
				else tabXML += xml;
			}
		});

		// xml of a tab
		if (tab === 'MetaTags' && tabXML.length > 0) XML += generateXML(tab, { attr: { NoIndex: '1' }, value: tabXML }, true);
		else XML += tabXML;
	}

	return generateXML('doc_content', { value: XML }, true);
}


/* ---
remove empty element in array
INPUT: array, original array
OUTPUT: array, cleared array
--- */
function clearEmpty($arr) {
	for (let i = $arr.length-1; i >= 0; i--) {
		if ($arr[i] === '') $arr.splice(i, 1);
	}
	return $arr;
}

