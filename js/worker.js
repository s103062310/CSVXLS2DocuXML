/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
This file defined worker scripts to prevent UI blocked.
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */


// include module
self.importScripts('https://oss.sheetjs.com/sheetjs/xlsx.full.min.js');
self.importScripts('../../../packages/self-defined/docuxml.js');


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
				format: csv or excel
				content: processed data of one sheet
			}*/
		
			if (data.format === 'csv') parseCSV(data.content); 
			else readAndParseExcel(data.content);
			break;

		case 'showsheet':

			/* data structure {
				data: sheet data
			}*/

			generateSheetTableHtml(data.content);
			break;

		case 'convert':

			/* data structure {
				docs: Documents,
				setting: corpusMetaSetting
			}*/

			generateDocuXML(data.docs, data.setting);
			break;

		default:
			console.log(`Func "${ data.func }" not found.`);
			break;
	}
}, false);


// * * * * * * * * * * * * * * * * upload * * * * * * * * * * * * * * * * *


/* --- now not used (merge in excel parser package)
parse csv data into json format (including header)
INPUT: string, csv string
OUTPUT: (send) string, sheet name and array, cleared data
--- */
function parseCSV(data) {

	// send sheet num
	self.postMessage({
		func: 'sheetnum',
		sheetnum: 1
	});

	var content = [];
	var rows = data.split('\r');

	// header
	content.push(rows[0].split(','));

	// content
	for (let i = 1; i < rows.length; i++) {

		// send progress
		self.postMessage({
			func: 'progress',
			percentage: i / rows.length
		});

		// filter empty row
		if (rows[i].indexOf(',') < 0) continue;

		let parsed = rows[i].split(',');
		let row = {};
		let quot = false;
		let temp;
		let j = 0;

		parsed.forEach(substr => {
			if (!quot && substr[0] !== '"') {
				row[content[0][j]] = substr.trim('\n').trim();
				j++;

			} else {

				// open
				if (!quot) {
					temp = substr.replace(/"/g, '');
					if (substr[substr.length-1] !== '"') quot = !quot;

				// close
				} else if (quot && substr[substr.length-1] === '"') {
					temp += ',' + substr.replace('"', '');
					row[content[0][j]] = temp;
					j++;
					quot = !quot;

				// middle in quot
				} else temp += ',' + substr;
			}
		});

		content.push(row);
	}

	// send data
	self.postMessage({
		func: 'sheetcontent',
		sheetname: 'csv sheet',
		content: content
	});

	// send fin
	self.postMessage({
		func: 'progress',
		percentage: 1
	});
}


/* ---
read excel content from row data and parse excel data into json format (including header)
INPUT: object, row data
OUTPUT: (send) string, sheet name and array, cleared data
--- */
function readAndParseExcel(data) {
	var wb = XLSX.read(data, { type: 'binary' });

	// send progress
	self.postMessage({
		func: 'progress',
		percentage: 0.5
	});

	// send sheet num
	self.postMessage({
		func: 'sheetnum',
		sheetnum: wb.SheetNames.length
	});

	// each sheet
	wb.SheetNames.forEach((sheetname, i) => {
		let content = filterEmptyEntryandExtractHeader(XLSX.utils.sheet_to_json(wb.Sheets[sheetname]));
		
		// send progress
		self.postMessage({
			func: 'progress',
			percentage: (i+1) / wb.SheetNames.length / 2 + 0.5
		});

		// send data
		self.postMessage({
			func: 'sheetcontent',
			sheetname: sheetname,
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
function filterEmptyEntryandExtractHeader(content) {
	var header = [];

	for (let i = content.length-1; i >= 0; i--) {

		// check each entry
		Object.keys(content[i]).forEach(key => {
			let value = content[i][key].toString().trim();

			// delete empty entry
			if (value === '') delete content[i][key];

			// uniform key
			else {

				// correct key
				let newKey = key.toString().replace(/[\s'"]/g, '');
				if (header.indexOf(newKey) < 0) header.push(newKey);

				// sync key and data
				if (newKey !== key) {
					content[i][newKey] = value;
					delete content[i][key];
				}
			}
		});

		// delete empty line
		if (Object.keys(content[i]).length <= 0) delete content[i];
	}

	content.splice(0, 0, header);
	return content;
}


/* ---
check and filter empty data cell, extract and add header
INPUT: array, sheet data (an element is a row in sheet)
OUTPUT: (send) string, <table> html
--- */
function generateSheetTableHtml(data) {

	data.forEach((file, i) => {
		let html = '';

		// header
		if (i === 0) {
			file.forEach(val => {
				html += `<th>${ val }</th>`;
			});

		// content
		} else {
			data[0].forEach(key => {
				html += `<td>${ (file[key]) ?file[key] :'' }</td>`;
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


function generateDocuXML(docs, setting) {
	var xmlFormer = new DocuxmlFormer();
	var xml_docs = '', xml_corpus = '';

	// each document
	docs.forEach((docObj, i) => {
		xml_docs += xmlFormer.formDoc(docObj, i);

		// send progress
		self.postMessage({
			func: 'progress',
			percentage: (i+1) / (docs.length+1)
		});
	});

	// each corpus
	for (let name in setting) {
		xml_corpus += xmlFormer.formCorpusMeta(name, setting[name]);
	}

	// send result
	self.postMessage({
		func: 'result',
		percentage: 1,
		result: '<?xml version="1.0"?>\n' + 
				xmlFormer.generateXML({
					name: 'ThdlPrototypeExport',
					br: true,

					value: xml_corpus + xmlFormer.generateXML({
							name: 'documents',
							br: true,
							value: xml_docs
						})
				})
	});
}