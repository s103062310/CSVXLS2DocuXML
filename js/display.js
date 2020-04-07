/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
This file defined the functions that used to display html page.
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */


// * * * * * * * * * * * * * * * * light box * * * * * * * * * * * * * * * * *


/* ---
show whole sheet
INPUT: string, sheet name
OUTPUT: string, html string
--- */
function displayTable($sheet) {

	var table = "<table border=\"1\"><thead><tr>";

	// table header
	for (let item in _dataPool[$sheet][0]) {
		let oneItem = "<th>" + $array[item] + "</th>";
		table += oneItem;
	}
	table += "</tr></thead><tbody><tr>"

	// table content
	for (let row=1; row<_dataPool[$sheet].length; row++){
		let header = _dataPool[$sheet][0];
		for (let item in header) {
			let text = (_dataPool[$sheet][row][header[item]] === undefined) ?"" :_dataPool[$sheet][row][header[item]];
			table += "<td>" + text + "</td>";
		}
	}
	table += "</tr></tbody></table>";

	return table;
	
}


// * * * * * * * * * * * * * * * * upload * * * * * * * * * * * * * * * * *


/* ---
block that represents one sheet
INPUT: string, sheet name
--- */
function displayUploadSheet($sheet) {
	let fileBlock = "<label class=\"uploadCover fileCover\" style=\"border-color: indianred;\"><div class=\"usualFile\"><span class=\"glyphicon glyphicon-file\"></span><span class=\"coverText\">" + $sheet + "</span></div><div class=\"hoverFile\"><span class=\"glyphicon glyphicon-trash\" onclick=\"deleteUploadSheet(this.parentElement.parentElement, true)\"></span><span class=\"glyphicon glyphicon-eye-open\" onclick=\"showSheet(this)\"></span><span class=\"glyphicon glyphicon-remove\" onclick=\"toggleUsed(this.parentElement.parentElement)\"></span></div></label>";
	$('.emptyCover').before(fileBlock);	
}


/* ---
trigger when back to upload page
reset used data container and html in metadata/content setting
--- */
function resetUploadData() {
	_data = [];
	_data.length = 0;
	$('.tableList ul').empty();
	$('.settingPanel').empty();
	$('#contentInterface .settingPanel').append("<div class=\"txtFilesHeader fixed\"><span>檔名</span><span>狀態</span><span>檢視</span><span>操作</span></div><input id=\"singleTXT\" type=\"file\" accept=\".txt\" onchange=\"uploadSingleTXT(this, undefined, true)\" style=\"display: none;\"/><input id=\"multiTXT\" type=\"file\" accept=\".txt\" onchange=\"uploadMultiTXT(this)\" style=\"display: none;\"/>");
}


// * * * * * * * * * * * * * * * * required * * * * * * * * * * * * * * * * *


/* ---
table list in required/optional/content interface
--- */
function displayTableList() {
	var first = true;
	for (let table in _data) {

		// information
		let info = table.split('-');
		let filename = "<span>" + info[0] + "</span>";
		let splitIcon = "<span> | </span>";
		let tablename = "<span>" + info[1] + "</span>";
		let classname = (first) ?"list-group-item target" :"list-group-item";
		first = false;
		
		// combine
		let tableItem = "<li class=\"" + classname + "\" key=\"" + table + "\" onclick=\"changeTableListItem('" + table + "')\">" + filename + splitIcon + tablename + "</li>";
		$('.tableList ul').append(tableItem);
	}
}


/* ---
trigger when back to required metadata setting
reset txt filename container and table in html
--- */
function resetRequiredData() {
	_txtData = [];
	for (let table in _data) {
		for (let tag in _contentTags) $('#contentInterface .settingTab[key=\'' + table + '\'] .tagTab[key=' + tag + '] .txtFiles').empty();
	}
}


/* ---
required page
--- */
function displayRequiredPage() {

	// corpus
	var corpusHTMLstart = "<div name=\"corpus\" class=\"menu\"><h3>文獻集名稱 corpus</h3><div class=\"btn-group\"><button type=\"button\" class=\"btn btn-default dropdown-toggle text-only\" data-toggle=\"dropdown\" onclick=\"selectClicked(this)\">--- 請選擇 ---</button><button type=\"button\" class=\"btn btn-default dropdown-toggle icon-only\" data-toggle=\"dropdown\" onclick=\"selectClicked(this)\"><span class=\"caret\"></span></button><ul class=\"dropdown-menu\" role=\"menu\"><li role=\"presentation\" onclick=\"selectItem(this)\" class=\"selected\" style=\"display: block;\">--- 請選擇 ---</li><li role=\"presentation\" onclick=\"selectItem(this)\" style=\"display: block;\">自訂</li>";
	var corpusHTMLend = "</ul></div><input type=\"text\" name=\"corpus\" placeholder=\"請輸入文獻集名稱...\"></div>";

	// filename
	var filenameHTMLstart = "<div name=\"filename\" class=\"menu\"><h3>文件檔案名稱 filename</h3><div class=\"btn-group\"><button type=\"button\" class=\"btn btn-default dropdown-toggle text-only\" data-toggle=\"dropdown\" onclick=\"selectClicked(this)\">--- 請選擇 ---</button><button type=\"button\" class=\"btn btn-default dropdown-toggle icon-only\" data-toggle=\"dropdown\" onclick=\"selectClicked(this)\"><span class=\"caret\"></span></button><ul class=\"dropdown-menu\" role=\"menu\"><li role=\"presentation\" onclick=\"selectItem(this)\" class=\"selected\" style=\"display: block;\">--- 請選擇 ---</li><li role=\"presentation\" onclick=\"selectItem(this)\" style=\"display: block;\">自動產生檔名</li>";
	var filenameHTMLend = "</ul></div><input type=\"text\" name=\"filename\" placeholder=\"請輸入檔名前綴...\"></div>";

	// scan all table
	var first = true;
	for (let table in _data) {

		// information
		let info = table.split('-');
		let tablename = "<h2 class=\"text-center\">" + table + "</h2>";
		let classname = (first) ?"settingTab target" :"settingTab";
		first = false;

		// choice
		let filenameItem = "<li role=\"presentation\" onclick=\"selectItem(this)\"><span>檔案名稱</span><span> | </span><span>" + info[0] + "</span></li>";
		let sheenametItem = "<li role=\"presentation\" onclick=\"selectItem(this)\"><span>資料表名稱</span><span> | </span><span>" + info[1] + "</span></li>";
		let listItem = "";
		for (let header in _data[table][0]) listItem += "<li role=\"presentation\" onclick=\"selectItem(this)\"><span>欄位名稱</span><span> | </span><span>" + _data[table][0][header] + "</span></li>";
		
		// combine
		let panel = "<div class=\"" + classname + "\" key=\"" + table + "\">" + tablename + corpusHTMLstart + filenameItem + sheenametItem + listItem + corpusHTMLend + filenameHTMLstart + listItem + filenameHTMLend + "</div>";
		$('#requiredInterface .settingPanel').append(panel);
	}
}


// * * * * * * * * * * * * * * * * optional * * * * * * * * * * * * * * * * *


/* ---
optional page
--- */
function displayOptionalPage() {

	// list
	var choiceList = "<ul class=\"dropdown-menu\" role=\"menu\"><li role=\"presentation\" onclick=\"selectItem(this)\" class=\"selected\" style=\"display: block;\">--- 請選擇 ---</li><li role=\"presentation\" onclick=\"selectItem(this)\" style=\"display: block;\">自訂欄位</li><li role=\"presentation\" onclick=\"selectItem(this)\" style=\"display: block;\">為自訂欄位加上超連結</li><li role=\"presentation\" onclick=\"selectItem(this)\" style=\"display: block;\">自訂欄位超連結的文字</li>";
	for (let meta in _optionalMeta) {
		let classofPost = (_optionalMeta[meta][1]) ?"class=\"postClass\" " :""
		choiceList += "<li " + classofPost + "role=\"presentation\" onclick=\"selectItem(this)\"><span>" + _optionalMeta[meta][0] + '</span><span> | </span><span>' + meta + "</span></li>";
	}
	choiceList += "</ul>";

	// button
	var buttonGroup = "<div class=\"btn-group\"><button type=\"button\" class=\"btn btn-default dropdown-toggle text-only\" data-toggle=\"dropdown\" onclick=\"selectClicked(this)\">--- 請選擇 ---</button><button type=\"button\" class=\"btn btn-default dropdown-toggle icon-only\" data-toggle=\"dropdown\" onclick=\"selectClicked(this)\"><span class=\"caret\"></span></button>" + choiceList + "</div><input type=\"text\">";

	// scan all table
	var first = true;
	for (let table in _data) {

		// information
		let info = table.split('-');
		let tablename = "<h2 class=\"text-center\">" + table + "</h2>";
		let classname = (first) ?"settingTab target" :"settingTab";
		first = false;

		// setting items
		let blocks = "";
		for (let header in _data[table][0]) blocks += "<div name=\"" + _data[table][0][header] + "\" class=\"menu\"><h3>" + _data[table][0][header] + "</h3>" + buttonGroup + "</div>";

		// combine
		let panel = "<div class=\"" + classname + "\" key=\"" + table + "\">" + tablename + blocks + "</div>";
		$('#optionalInterface .settingPanel').append(panel);
	}
}


// * * * * * * * * * * * * * * * * content * * * * * * * * * * * * * * * * *


/* ---
content page
--- */
function displayContentPage() {

	// choose source
	var sourceHTML = "<div name=\"contentSource\" class=\"menu\"><h3>來源</h3><div class=\"btn-group\"><button type=\"button\" class=\"btn btn-default dropdown-toggle text-only\" data-toggle=\"dropdown\" onclick=\"selectClicked(this)\">--- 請選擇 ---</button><button type=\"button\" class=\"btn btn-default dropdown-toggle icon-only\" data-toggle=\"dropdown\" onclick=\"selectClicked(this)\"><span class=\"caret\"></span></button><ul class=\"dropdown-menu\" role=\"menu\"><li role=\"presentation\" onclick=\"selectItem(this)\" class=\"selected\" style=\"display: block;\">--- 請選擇 ---</li><li role=\"presentation\" onclick=\"selectItem(this)\" style=\"display: block;\">CSV/Excel 欄位</li><li role=\"presentation\" onclick=\"selectItem(this)\" style=\"display: block;\">匯入純文字檔</li></ul></div><input type=\"text\" name=\"contentSource\"></div>";

	// scan all table
	var first = true;
	for (let table in _data) {

		// pagination
		let second = true;
		let pagination = "<div class=\"tab\">";
		for (let tag in _contentTags) {
			let classname = (second) ?" class=\"target\"" :"";
			pagination += "<div key=\"" + tag + "\"" + classname + " onclick=\"changeTab('" + tag + "')\"><span>" + _contentTags[tag] + "</span><span>" + tag + "</span></div>";
			second = false;
		}
		pagination += "</div>";

		// list
		let choiceList = "<ul class=\"dropdown-menu\" role=\"menu\"><li role=\"presentation\" onclick=\"selectItem(this)\" class=\"selected\" style=\"display: block;\">--- 請選擇 ---</li>";
		for (let header in _data[table][0]) choiceList += "<li role=\"presentation\" onclick=\"selectItem(this)\" style=\"display: block;\">" + _data[table][0][header] + "</li>";
		choiceList += "</ul>";

		// button
		let buttonGroup = "<div class=\"btn-group\"><button type=\"button\" class=\"btn btn-default dropdown-toggle text-only\" data-toggle=\"dropdown\" onclick=\"selectClicked(this)\">--- 請選擇 ---</button><button type=\"button\" class=\"btn btn-default dropdown-toggle icon-only\" data-toggle=\"dropdown\" onclick=\"selectClicked(this)\"><span class=\"caret\"></span></button>" + choiceList + "</div>";

		// content mapping
		let contentMapping = "<div class=\"contentMapping\"><h3>對應欄位</h3><div class=\"selectObj\">" + buttonGroup + "</div><div class=\"newSelect\" onclick=\"addNewSelect(this)\"><span class=\"glyphicon glyphicon-plus\"></span><span>新增一項對應欄位...</span></div></div>";

		// content elements
		let content = "";
		let third = true;
		for (let tag in _contentTags) {

			// tool bar
			let wholeUpload = "<button type=\"button\" class=\"btn btn-default\" onclick=\"uploadTXT('" + table + "', undefined, '" + tag + "', 'whole')\" style=\"grid-area: whole;\"><span class=\"glyphicon glyphicon-cloud-upload\"></span> 使用單一文字檔案，並以「空行」分件</button>";
			let multiUpload = "<button type=\"button\" class=\"btn btn-default\" onclick=\"uploadTXT('" + table + "', undefined, '" + tag + "', 'multi')\" style=\"grid-area: multi;\"><span class=\"glyphicon glyphicon-cloud-upload\"></span> 批次上傳</button>";
			let deleteAll = "<button type=\"button\" class=\"btn btn-default\" onclick=\"deleteAllTXT('" + table + "', '" + tag + "')\" style=\"grid-area: delete;\"><span class=\"glyphicon glyphicon-trash\"></span> 刪除全部</button>";
			let toolBar = "<div class=\"importTXTtoolBar\">" + wholeUpload + multiUpload + deleteAll + "</div><div></div>";

			// header
			let header = "<div class=\"txtFilesHeader\"><span>檔名</span><span>狀態</span><span>檢視</span><span>操作</span></div>";

			// import txt
			let importTXT = "<div class=\"importTXT\"><h3>上傳純文字檔</h3><div>" 
			+ toolBar + "<div>" + header + "<div class=\"txtFiles\"></div></div><div class=\"notMatch\"></div></div></div>";

			// information
			let classname = (third) ?"tagTab target" :"tagTab";
			third = false;

			// content of one tag
			content += "<div key=\"" + tag + "\" name=\"" + tag + "\" class=\"" + classname + "\">" + sourceHTML + contentMapping + importTXT + "</div>";
		}

		// information
		let tablename = "<h2 class=\"text-center\">" + table + "</h2>";
		let classname = (first) ?"settingTab target" :"settingTab";
		first = false;
		
		// combine
		let panel = "<div class=\"" + classname + "\" key=\"" + table + "\">" + tablename + pagination + content + "</div>";
		$('#contentInterface .settingPanel').append(panel);
	}
}


/* ---
import txt tables in content page
--- */
function displayImportTXT() {
	
	var info = {'sheetOrder': 0, 'sheetNum': _txtData.length, 'tagNum': 4};
	for (let table in _txtData) {

		info['tagOrder'] = 0;
		for (let tag in _contentTags) {

			// filenames
			info['fileOrder'] = 0;
			info['fileNum'] = _txtData[table].length;
			for (let filename in _txtData[table]) {

				// one file
				let row = "<div name=\"" + filename + "\" class=\"rowFile\"><span func=\"name\">" + filename + ".txt</span><span func=\"status\">無</span><span func=\"view\" class=\"glyphicon glyphicon-eye-open\" onclick=\"showTXT(this)\"></span><span func=\"manipulate\" class=\"glyphicon glyphicon-cloud-upload\" onclick=\"uploadTXT('" + table + "', '" + filename + "', '" + tag + "', 'single')\"></span></div>";
				$('#contentInterface .settingTab[key=\'' + table + '\'] .tagTab[key=' + tag + '] .txtFiles').append(row);

				// add drag and drop listener
				let dropTarget = document.querySelector('#contentInterface .settingTab[key=\'' + table + '\'] .tagTab[key=' + tag + '] .rowFile[name=\'' + filename + '\']');
				dropTarget.addEventListener('drop', dropNotMatchFile);
				dropTarget.addEventListener('dragenter', dragNotMatchFileEnter);
				dropTarget.addEventListener('dragover', dragNotMatchFileOver);
				dropTarget.addEventListener('dragleave', dragNotMatchFileLeave);
				
				// progress
				updateProgress(info, 'required');
				info['fileOrder']++;
			}

			info['tagOrder']++;
		}

		info['sheetOrder']++;
	}
}


/* ---
add a new slot in content mapping
INPUT: add button html element
--- */
function addNewSelect($this) {

	// copy UI
	var selectObj = $($this.parentElement).find('.selectObj')[0]
	var block = "<div class=\"selectObj\">" + $(selectObj).html() + "<span class=\"glyphicon glyphicon-trash\" onclick=\"deleteSelectObj(this)\"></span></div>";
	$($this).before(block);

	// reset new slot
	var resetIndex = $($this.parentElement).find('.selectObj').length - 1;
	var resetObj = $($this.parentElement).find('.selectObj')[resetIndex];
	selectItem($(resetObj)[0].children[0].children[2].children[0]);
}


/* ---
delete a slot in content mapping
INPUT: delete button html element
--- */
function deleteSelectObj($this) {
	$($this.parentElement).remove();
}


/* ---
trigger after upload a txt file
INPUT: 1) string, table name
       2) string, filename
       3) string, tag name
--- */
function displayUploadTXT($table, $filename, $tag) {
	var row = $('#contentInterface .settingTab[key=\'' + $table + '\'] .tagTab[key=\'' + $tag + '\'] .rowFile[name=\'' + $filename + '\']');
	var status = $(row).find('span[func=status]');
	var manipulate = $(row).find('span[func=manipulate]');

	// modify status icon
	$(status).addClass('glyphicon glyphicon-ok');
	$(status).attr('style', 'color: limegreen;');
	$(status).empty();

	// modify manipulate function
	$(manipulate).attr('class', 'glyphicon glyphicon-trash');
	$(manipulate).attr('onclick', 'deleteTXT(\'' + $table + '\', \'' + $filename + '\', \'' + $tag + '\', true);');
}


/* ---
trigger after delete a txt file
INPUT: 1) string, table name
       2) string, filename
       3) string, tag name
--- */
function displayDeleteTXT($table, $filename, $tag) {
	var row = $('#contentInterface .settingTab[key=\'' + $table + '\'] .tagTab[key=\'' + $tag + '\'] .rowFile[name=\'' + $filename + '\']');
	var status = $(row).find('span[func=status]');
	var manipulate = $(row).find('span[func=manipulate]');

	// modify status icon
	$(status).removeClass();
	$(status).attr('style', '');
	$(status).empty();
	$(status).append('無');

	// modify manipulate function
	$(manipulate).attr('class', 'glyphicon glyphicon-cloud-upload');
	$(manipulate).attr('onclick', 'uploadTXT(\'' + $table + '\', \'' + $filename + '\', \'' + $tag + '\', \'single\');');
}


/* ---
trigger after delete a txt file and add new listener
INPUT: 1) string, filename
       2) string, table name
       3) string, tag name
--- */
function displayNotMatchTXT($filename, $table, $tag) {
	var notMtachFiles = "<div name=\"" + $filename + "\" class=\"notMatchFile\" draggable=\"true\">" + $filename + ".txt</div>";
	$('#contentInterface .settingTab[key=\'' + $table + '\'] .tagTab[key=' + $tag + '] .notMatch').append(notMtachFiles);
	document.querySelector('#contentInterface .settingTab[key=\'' + $table + '\'] .tagTab[key=' + $tag + '] .notMatch div[name=\'' + $filename + '\']').addEventListener('dragstart', dragNotMatchFileStart);
}

