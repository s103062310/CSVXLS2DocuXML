

function displayUploadSheet($sheet) {

	let fileBlock = "<label class=\"uploadCover fileCover\"><div class=\"usualFile\"><span class=\"glyphicon glyphicon-file\"></span><span class=\"coverText\">" + $sheet + "</span></div><div class=\"hoverFile\"><span class=\"glyphicon glyphicon-trash\" onclick=\"deleteUploadSheet(this)\"></span><span class=\"glyphicon glyphicon-eye-open\" onclick=\"showSheet(this)\"></span></div></label>";
	$('.emptyCover').before(fileBlock);
	
}


function displayTable($sheet) {

	var table = "<table border=\"1\"><thead>";

	// table header
	table += displayTableHeader(_data[$sheet][0]);
	table += "</thead><tbody>"

	// table content
	for (let row=1; row<_data[$sheet].length; row++) table += displayTableRow(_data[$sheet][row], _data[$sheet][0]);
	table += "</tbody></table>";

	return table;
	
}


function displayTableHeader($array) {
	var header = "<tr>";
	for (let item in $array) {
		let oneItem = "<th>" + $array[item] + "</th>";
		header += oneItem;
	}
	header += "</tr>";
	return header;
}


function displayTableRow($array, $header) {
	var oneRow = "<tr>";
	for (let item in $header) {
		let text = ($array[$header[item]] === undefined) ?"" :$array[$header[item]];
		let oneCol = "<td>" + text + "</td>";
		oneRow += oneCol;
	}
	oneRow += "</tr>";
	return oneRow;
}


function resetRequiredData() {
	_txtData = [];
	for (let table in _data) {
		for (let tag in _contentTags) {
			$('#contentInterface .settingTab[key=\'' + table + '\'] .tagTab[key=' + tag + '] .txtFiles').empty();
		}
	}
}


function resetUploadData() {
	$('.tableList ul').empty();
	$('.settingPanel').empty();
	$('#contentInterface .settingPanel').append("<div class=\"txtFilesHeader fixed\"><span>檔名</span><span>狀態</span><span>檢視</span><span>操作</span></div><input id=\"singleTXT\" type=\"file\" accept=\".txt\" onchange=\"uploadSingleTXT(this)\" style=\"display: none;\"/><input id=\"multiTXT\" type=\"file\" accept=\".txt\" onchange=\"test(this)\" style=\"display: none;\"/>");
}


function displayTableList() {
	var first = true;
	for (let table in _data) {
		let info = table.split('-');
		let filename = "<span>" + info[0] + "</span>";
		let splitIcon = "<span> | </span>";
		let tablename = "<span>" + info[1] + "</span>";
		let classname = (first) ?"list-group-item target" :"list-group-item";
		let tableItem = "<li class=\"" + classname + "\" key=\"" + table + "\" onclick=\"changeTableListItem('" + table + "')\">" + filename + splitIcon + tablename + "</li>";
		$('.tableList ul').append(tableItem);
		first = false;
	}
}


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
		let info = table.split('-');
		let tablename = "<h2 class=\"text-center\">" + table + "</h2>";
		let filenameItem = "<li role=\"presentation\" onclick=\"selectItem(this)\"><span>檔案名稱</span><span> | </span><span>" + info[0] + "</span></li>";
		let sheenametItem = "<li role=\"presentation\" onclick=\"selectItem(this)\"><span>資料表名稱</span><span> | </span><span>" + info[1] + "</span></li>";
		let listItem = "";
		for (let header in _data[table][0]) {
			listItem += "<li role=\"presentation\" onclick=\"selectItem(this)\"><span>欄位名稱</span><span> | </span><span>" + _data[table][0][header] + "</span></li>";
		}
		let classname = (first) ?"settingTab target" :"settingTab";
		let panel = "<div class=\"" + classname + "\" key=\"" + table + "\">" + tablename + corpusHTMLstart + filenameItem + sheenametItem + listItem + corpusHTMLend + filenameHTMLstart + listItem + filenameHTMLend + "</div>";
		$('#requiredInterface .settingPanel').append(panel);
		first = false;
	}
	
}


function displayOptionalPage() {

	// list
	var choiceList = "<ul class=\"dropdown-menu\" role=\"menu\"><li role=\"presentation\" onclick=\"selectItem(this)\" class=\"selected\" style=\"display: block;\">--- 請選擇 ---</li><li role=\"presentation\" onclick=\"selectItem(this)\" style=\"display: block;\">自訂欄位</li><li role=\"presentation\" onclick=\"selectItem(this)\" style=\"display: block;\">為自訂欄位加上超連結</li><li role=\"presentation\" onclick=\"selectItem(this)\" style=\"display: block;\">自訂欄位超連結的文字</li>";
	for (let meta in _optionalMeta) {
		let item = "<li role=\"presentation\" onclick=\"selectItem(this)\"><span>" + _optionalMeta[meta] + '</span><span> | </span><span>' + meta + "</span></li>";
		choiceList += item;
	}
	choiceList += "</ul>";

	// button
	var buttonGroup = "<div class=\"btn-group\"><button type=\"button\" class=\"btn btn-default dropdown-toggle text-only\" data-toggle=\"dropdown\" onclick=\"selectClicked(this)\">--- 請選擇 ---</button><button type=\"button\" class=\"btn btn-default dropdown-toggle icon-only\" data-toggle=\"dropdown\" onclick=\"selectClicked(this)\"><span class=\"caret\"></span></button>" + choiceList + "</div><input type=\"text\" name=\"filename\">";

	// scan all table
	var first = true;
	for (let table in _data) {
		let blocks = "";
		let info = table.split('-');
		let tablename = "<h2 class=\"text-center\">" + table + "</h2>";

		for (let header in _data[table][0]) {
			let block = "<div name=\"" + _data[table][0][header] + "\" class=\"menu\"><h3>" + _data[table][0][header] + "</h3>" + buttonGroup + "</div>";
			blocks += block;
		}

		let classname = (first) ?"settingTab target" :"settingTab";
		let panel = "<div class=\"" + classname + "\" key=\"" + table + "\">" + tablename + blocks + "</div>";
		$('#optionalInterface .settingPanel').append(panel);
		first = false;
	}

}


function displayContentPage() {

	// choose source
	var sourceHTML = "<div name=\"contentSource\" class=\"menu\"><h3>來源</h3><div class=\"btn-group\"><button type=\"button\" class=\"btn btn-default dropdown-toggle text-only\" data-toggle=\"dropdown\" onclick=\"selectClicked(this)\">--- 請選擇 ---</button><button type=\"button\" class=\"btn btn-default dropdown-toggle icon-only\" data-toggle=\"dropdown\" onclick=\"selectClicked(this)\"><span class=\"caret\"></span></button><ul class=\"dropdown-menu\" role=\"menu\"><li role=\"presentation\" onclick=\"selectItem(this)\" class=\"selected\">--- 請選擇 ---</li><li role=\"presentation\" onclick=\"selectItem(this)\">CSV/Excel 欄位</li><li role=\"presentation\" onclick=\"selectItem(this)\">匯入純文字檔</li></ul></div><input type=\"text\" name=\"contentSource\"></div>";

	// scan all table
	var first = true;
	for (let table in _data) {
		let tablename = "<h2 class=\"text-center\">" + table + "</h2>";

		// pagination
		let second = true;
		let pagination = "<div class=\"tab\">";
		for (let tag in _contentTags) {
			let classname = (second) ?" class=\"target\"" :"";
			let item = "<div key=\"" + tag + "\"" + classname + " onclick=\"changeTab('" + tag + "')\"><span>" + _contentTags[tag] + "</span><span>" + tag + "</span></div>";
			pagination += item;
			second = false;
		}
		pagination += "</div>";

		// list
		let choiceList = "<ul class=\"dropdown-menu\" role=\"menu\"><li role=\"presentation\" onclick=\"selectItem(this)\" class=\"selected\" style=\"display: block;\">--- 請選擇 ---</li>";
		for (let header in _data[table][0]) {
			let item = "<li role=\"presentation\" onclick=\"selectItem(this)\" style=\"display: block;\">" + _data[table][0][header] + "</li>";
			choiceList += item;
		}
		choiceList += "</ul>";

		// button
		let buttonGroup = "<div class=\"btn-group\"><button type=\"button\" class=\"btn btn-default dropdown-toggle text-only\" data-toggle=\"dropdown\" onclick=\"selectClicked(this)\">--- 請選擇 ---</button><button type=\"button\" class=\"btn btn-default dropdown-toggle icon-only\" data-toggle=\"dropdown\" onclick=\"selectClicked(this)\"><span class=\"caret\"></span></button>" + choiceList + "</div>";

		// content mapping
		let contentMapping = "<div class=\"contentMapping\"><h3>對應欄位</h3><div class=\"selectObj\">" + buttonGroup + "</div><div class=\"newSelect\" onclick=\"addNewSelect(this)\"><span class=\"glyphicon glyphicon-plus\"></span><span>新增一項對應欄位...</span></div></div>";

		// header
		let header = "<div class=\"txtFilesHeader\"><span>檔名</span><span>狀態</span><span>檢視</span><span>操作</span></div>";

		// file status
		let fileStatus = "<div>" + header + "<div class=\"txtFiles\"></div></div>";

		// files
		let files = "<div>" + fileStatus + "<div class=\"notMatch\"></div></div>";

		// import txt
		let importTXT = "<div class=\"importTXT\"><h3>上傳純文字檔</h3>" + files + "</div>";

		// content elements
		let content = "";
		let third = true;
		for (let tag in _contentTags) {
			let classname = (third) ?"tagTab target" :"tagTab";
			let tagTab = "<div key=\"" + tag + "\" name=\"" + tag + "\" class=\"" + classname + "\">" + sourceHTML + contentMapping + importTXT + "</div>";
			content += tagTab;
			third = false;
		}

		let classname = (first) ?"settingTab target" :"settingTab";
		let panel = "<div class=\"" + classname + "\" key=\"" + table + "\">" + tablename + pagination + content + "</div>";
		$('#contentInterface .settingPanel').append(panel);
		first = false;
	}

}


function displayImportTXT() {
	for (let table in _txtData) {
		for (let tag in _contentTags) {

			// filenames
			let filenames = "";
			for (let filename in _txtData[table]) {
				let row = "<div name=\"" + filename + "\" class=\"rowFile\"><span func=\"name\">" + filename + ".txt</span><span func=\"status\">無</span><span func=\"view\" class=\"glyphicon glyphicon-eye-open\" onclick=\"showTXT(this)\"></span><span func=\"manipulate\" class=\"glyphicon glyphicon-cloud-upload\" onclick=\"uploadTXT('" + table + "', '" + filename + "', '" + tag + "')\"></span></div>";
				filenames += row;
			}

			$('#contentInterface .settingTab[key=\'' + table + '\'] .tagTab[key=' + tag + '] .txtFiles').append(filenames);
		}
	}
}


function addNewSelect($this) {

	// copy UI
	var selectObj = $($this.parentElement).find('.selectObj')[0]
	var block = "<div class=\"selectObj\">" + $(selectObj).html() + "<span class=\"glyphicon glyphicon-trash\" onclick=\"deleteSelectObj(this)\"></span></div>";
	$($this).before(block);

	// reset
	var resetIndex = $($this.parentElement).find('.selectObj').length - 1;
	var resetObj = $($this.parentElement).find('.selectObj')[resetIndex];
	selectItem($(resetObj)[0].children[0].children[2].children[0]);
}


function displayUploadTXT($table, $filename, $tag) {
	var row = $('#contentInterface .settingTab[key=\'' + $table + '\'] .tagTab[key=\'' + $tag + '\'] .rowFile[name=\'' + $filename + '\']');
	var status = $(row).find('span[func=status]');
	var manipulate = $(row).find('span[func=manipulate]');

	$(status).addClass('glyphicon glyphicon-ok');
	$(status).attr('style', 'color: limegreen;');
	$(status).empty();

	$(manipulate).attr('class', 'glyphicon glyphicon-trash');
	$(manipulate).attr('onclick', 'deleteTXT(\'' + $table + '\', \'' + $filename + '\', \'' + $tag + '\');');
}


function displayDeleteTXT($table, $filename, $tag) {
	var row = $('#contentInterface .settingTab[key=\'' + $table + '\'] .tagTab[key=\'' + $tag + '\'] .rowFile[name=\'' + $filename + '\']');
	var status = $(row).find('span[func=status]');
	var manipulate = $(row).find('span[func=manipulate]');

	$(status).removeClass();
	$(status).attr('style', '');
	$(status).append('無');

	$(manipulate).attr('class', 'glyphicon glyphicon-cloud-upload');
	$(manipulate).attr('onclick', 'uploadTXT(\'' + $table + '\', \'' + $filename + '\', \'' + $tag + '\');');
}


