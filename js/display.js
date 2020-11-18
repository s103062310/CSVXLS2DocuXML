/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
This file defined the functions that used to display html page.
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */


// * * * * * * * * * * * * * * * * upload * * * * * * * * * * * * * * * * *


/* ---
block that represents a sheet
INPUT: string, sheet name
OUTPUT: none
--- */
function displayUploadSheet($sheet) {
	let fileBlock = `<label class="uploadCover fileCover chose" name="${ $sheet }">
						<div class="usualFile">
							<span class="glyphicon glyphicon-file"></span>
							<span class="coverText">${ $sheet }</span>
						</div>
						<div class="hoverFile">
							<span class="glyphicon glyphicon-trash" onclick="deleteSheet('${ $sheet }', true)"></span>
							<span class="glyphicon glyphicon-eye-open" onclick="showSheet('${ $sheet }')"></span>
							<span class="glyphicon glyphicon-ok" onclick="toggleUsed(this.parentElement.parentElement)"></span>
						</div>
					</label>`;
	$('.emptyCover').before(fileBlock);	
}


// * * * * * * * * * * * * * * * * required * * * * * * * * * * * * * * * * *


/* ---
trigger when back to upload interface - reset all data and UI
INPUT: none
OUTPUT: none
--- */
function resetSetting() {
	_fileindex = [];
	_documents = [];
	_corpusSetting = {};
	_notMatch = {};
	$('#topContainer .tableList ul').empty();
	$('.settingPanel').empty();
}


/* ---
table list in required/optional/custom/content interface
INPUT: none
OUTPUT: none
--- */
function displayTableList() {
	_selectedSheet.forEach((sheet, i) => {

		// information
		let [filename, sheetname] = sheet.split('--');
		let classname = (i === 0) ?'list-group-item target' :'list-group-item';
		
		// html
		let tableItem = `<li class="${ classname }" key="${ sheet }" onclick="changeToSheet('${ sheet }')">
							<span>${ filename }</span>
							<span> | </span>
							<span>${ sheetname }</span>
						</li>`;

		// display
		$('#topContainer .tableList ul').append(tableItem);
	});
}


/* ---
html of button group with custom choices
INPUT: string, html of choices
OUTPUT: string, html of button group
--- */
function displayBtnGroup($listItem) {
	return `<div class="btn-group">
				<button type="button" class="btn btn-default dropdown-toggle text-only" data-toggle="dropdown" onclick="clickMenuBtn(this)" value="null">
					--- 請選擇 ---
				</button>

				<button type="button" class="btn btn-default dropdown-toggle icon-only" data-toggle="dropdown" onclick="clickMenuBtn(this)">
					<span class="caret"></span>
				</button>

				<ul class="dropdown-menu" role="menu">
					<li role="presentation" onclick="selectMenuItem(this)" value="null" class="selected" style="display: block;">--- 請選擇 ---</li>
					${ $listItem }
				</ul>
			</div>`;
}


/* ---
content setting of required interface
INPUT: none
OUTPUT: none
--- */
function displayRequiredPage() {
	_selectedSheet.forEach((sheet, i) => {

		// information
		let [filename, sheetname] = sheet.split('--');
		let classname = (i === 0) ?'settingTab target' :'settingTab';

		// corpus basic choices
		let corpusItem =   `<li role="presentation" onclick="selectMenuItem(this)" value="自訂" style="display: block;">
								自訂
							</li>
										
							<li role="presentation" onclick="selectMenuItem(this)" value="${ filename }">
								<span>檔案名稱</span>
								<span> | </span>
								<span>${ filename }</span>
							</li>

							<li role="presentation" onclick="selectMenuItem(this)" value="${ sheetname }">
								<span>資料表名稱</span>
								<span> | </span>
								<span>${ sheetname }</span>
							</li>`;

		// filename basic choices
		let filenameItem = `<li role="presentation" onclick="selectMenuItem(this)" value="自動產生檔名" style="display: block;">自動產生檔名</li>`;

		// choices
		let listItem = '';
		_dataPool[sheet][0].forEach(key => {
			listItem += `<li role="presentation" onclick="selectMenuItem(this)" value="${ key }">
							<span>欄位名稱</span>
							<span> | </span>
							<span>${ key }</span>
						</li>`;
		});

		// html
		let panel = `<div class="${ classname }" name="${ sheet }">
						<h2 class="text-center">${ sheet }</h2>
						
						<!-- corpus -->
						<div class="menu" name="corpus">
							<h3>文獻集名稱 corpus</h3>
							${ displayBtnGroup(corpusItem + listItem) }
							<input type="text" placeholder="請輸入文獻集名稱...">
						</div>

						<!-- filename -->
						<div class="menu" name="filename">
							<h3>文件唯一編號 filename</h3>
							${ displayBtnGroup(filenameItem + listItem) }
							<input type="text" placeholder="請輸入檔名前綴...">
						</div>
					</div>`;

		// display
		$('#requiredInterface .settingPanel').append(panel);
	});
}


// * * * * * * * * * * * * * * * * optional * * * * * * * * * * * * * * * * *


/* ---
content setting of optional interface
INPUT: none
OUTPUT: none
--- */
function displayOptionalPage() {

	// globel fixed hintbox
	var hintbox = `<div class="metahintbox" key="">
						<div class="hinttitle"></div>
						<hr style="margin: 0 5%;">
						<div class="hintcontent"></div>
				   </div>`;
	$('#optionalInterface .settingPanel').append(hintbox);

	// list of metadata
	var listItem = '';
	for (let meta in _metadata) {
		if (_metadata[meta].mustfill) continue;
		let postClass = (_metadata[meta].postclass) ?'postClass' :'';
		listItem += `<li class="${ postClass }" role="presentation" onclick="selectMenuItem(this)" onmouseover="showHint('${ meta }')" value="${ meta }">
						<span>${ _metadata[meta].chinese }</span>
						<span> | </span>
						<span>${ meta }</span>
					 </li>`;
	}

	// each sheet
	_selectedSheet.forEach((sheet, i) => {

		// information
		let classname = (i === 0) ?'settingTab target' :'settingTab';
		let blocks = '';

		// each header
		_dataPool[sheet][0].forEach(header => {
			blocks += `<div class="menu" name="${ header }">
							<h3>${ header }</h3>
							${ displayBtnGroup(listItem) }
							<input type="text">
					   </div>`;
		});

		// html
		let panel = `<div class="${ classname }" name="${ sheet }">
						<h2 class="text-center">${ sheet }</h2>
						${ blocks }
					 </div>`;

		// display
		$('#optionalInterface .settingPanel').append(panel);
	});
}


// * * * * * * * * * * * * * * * * custom * * * * * * * * * * * * * * * * *


/* ---
content setting of custom interface
INPUT: none
OUTPUT: none
--- */
function displayCustomPage() {
	_selectedSheet.forEach((sheet, i) => {

		// information
		let classname = (i === 0) ?'settingTab target' :'settingTab';

		// html
		let panel = `<div class="${ classname }" name="${ sheet }">
						<h2 class="text-center">${ sheet }</h2>
						<div class="newObj" onclick="addCustomSlot(this)">
							<span class="glyphicon glyphicon-plus"></span>
							<span> 新增一項自訂欄位...</span>
						</div>
					 </div>`;

		// display
		$('#customInterface .settingPanel').append(panel);
	});
}


// * * * * * * * * * * * * * * * * content * * * * * * * * * * * * * * * * *


/* ---
content setting of content interface
INPUT: none
OUTPUT: none
--- */
function displayContentPage() {

	// global fixed elements
	let fixed = `<div class="txtFilesHeader fixed">
					<span>檔名</span>
					<span>狀態</span>
					<span>檢視</span>
					<span>操作</span>
				</div>
				<div class="notMatch fixed"></div>
				<input id="singleTXT" type="file" accept=".txt" onchange="uploadSingleTXT(this)" style="display: none;"/>
				<input id="multiTXT" type="file" accept=".txt" onchange="uploadMultiTXT(this)" style="display: none;" multiple/>
				<input id="wholeTXT" type="file" accept=".txt" onchange="uploadWholeTXT(this)" style="display: none;"/>`;
	$('#contentInterface .settingPanel').append(fixed);

	// pagination
	let pagination = '';
	for (let tag in _contentTags) {
		let classname = (tag === 'doc_content') ?'target' :'';
		pagination += `<div key="${ tag }" class="${ classname }" onclick="changeToTab('${ tag }')">
							<span>${ _contentTags[tag] }</span>
							<span>${ tag }</span>
					   </div>`;
	}

	// content mapping
	let contentMapping = `<h3>對應欄位</h3>
						  <div class="newObj" onclick="addNewSelectObj(this)">
						  		<span class="glyphicon glyphicon-plus"></span>
						  		<span> 新增一項對應欄位...</span>
						  </div>`;

	// import txt
	let importTXT = `<div class="importTXT">
						<h3>上傳純文字檔</h3>

						<div>
							<div class="importTXTtoolBar">
								<button type="button" class="btn btn-default" onclick="$('#wholeTXT').click()" style="grid-area: whole;">
									<span class="glyphicon glyphicon-cloud-upload"></span>
									 使用單一文字檔案，並以「空行」分件
								</button>

								<button type="button" class="btn btn-default" onclick="$('#multiTXT').click()" style="grid-area: multi;">
									<span class="glyphicon glyphicon-cloud-upload"></span>
									 批次上傳
								</button>

								<button type="button" class="btn btn-default" onclick="deleteAllTXT()" style="grid-area: delete;">
									<span class="glyphicon glyphicon-trash"></span>
									 刪除全部
								</button>
							</div>
							<div></div>

							<div>
								<div class="txtFilesHeader">
									<span>檔名</span>
									<span>狀態</span>
									<span>檢視</span>
									<span>操作</span>
								</div>
								<div class="txtFiles"></div>
							</div>
							<div class="notMatch"></div>
						</div>
					 </div>`;

	// each sheet
	_selectedSheet.forEach((sheet, i) => {

		// information
		let classname = (i === 0) ?'settingTab target' :'settingTab';

		// content
		let content = '';
		for (let tag in _contentTags) {

			if (tag === 'doc_content') {
				let srcItem = ` <li role="presentation" onclick="selectMenuItem(this)" value="mapping" style="display: block;">CSV/Excel 欄位</li>
								<li role="presentation" onclick="selectMenuItem(this)" value="import" style="display: block;">匯入純文字檔</li>`;

				content += `<div class="tagTab target" name="${ tag }">
								<div class="menu" name="contentSource">
									<h3>來源</h3>
									${ displayBtnGroup(srcItem) }
									<input type="text">
								</div>

								<div class="contentMapping" style="display: none;">${ contentMapping }</div>
								${ importTXT }
							</div>`;

			} else {
				content += `<div class="tagTab" name="${ tag }">
								<div class="contentMapping">${ contentMapping }</div>
							</div>`;
			}
		}

		// html
		let panel = `<div class="${ classname }" name="${ sheet }">
						<h2 class="text-center">${ sheet }</h2>
						<div class="tab">${ pagination }</div>
						${ content }
					 </div>`;

		// display
		$('#contentInterface .settingPanel').append(panel);
	});

	// show metatags input
	$('.tagTab[name="MetaTags"] .selectObj > input').css('display', 'block');
}


/* ---
all table in import txt section
INPUT: none
OUTPUT: none
--- */
function displayImportTXT() {
	_selectedSheet.forEach(sheet => {
		displayTXTTable(sheet);
	});
}


/* ---
a table in import txt section
INPUT: none
OUTPUT: none
--- */
function displayTXTTable($sheet) {

	// reset table
	$(`#contentInterface .settingTab[name="${ $sheet }"] .txtFiles`).empty();

	// each document
	for (let i in _fileindex[$sheet]) {
		let j = _fileindex[$sheet][i];

		// row of a file
		let row = `<div class="rowFile" key="${ j }">
						${ displayTXTFile(j) }
					</div>`;

		// display
		$(`#contentInterface .settingTab[name="${ $sheet }"] .txtFiles`).append(row);

		// add drag and drop listener
		let dropTarget = document.querySelector(`#contentInterface .settingTab[name="${ $sheet }"] .rowFile[key="${ j }"]`);
		dropTarget.addEventListener('drop', dropNotMatchFile);
		dropTarget.addEventListener('dragenter', dragNotMatchFileEnter);
		dropTarget.addEventListener('dragover', dragNotMatchFileOver);
		dropTarget.addEventListener('dragleave', dragNotMatchFileLeave);
	}
}


/* ---
a row in import txt table
INPUT: int/string, file unique index in system
OUTPUT: string, html in a row of table
--- */
function displayTXTFile($index) {
	let hasContent = !(_documents[$index].doc_content.doc_content.import[0] === '');
	let filename = _documents[$index].attr.filename;
	let status, manipulate;

	if (hasContent) {
		status = `<span func="status" class="glyphicon glyphicon-ok" style="color: limegreen;"></span>`;
		manipulate = `<span func="manipulate" class="glyphicon glyphicon-trash" onclick="clickDeleteTXT(this)"></span>`;
	} else {
		status = `<span func="status">無</span>`;
		manipulate = `<span func="manipulate" class="glyphicon glyphicon-cloud-upload" onclick="clickUploadTXT(this)"></span>`;
	}

	return `<span func="name">${ filename }.txt</span>
			${ status }
			<span func="view" class="glyphicon glyphicon-eye-open" onclick="showTXT(this)"></span>
			${ manipulate }`;
}


/* ---
create an UI of not match file
INPUT: string, name of not match file
OUTPUT: none
--- */
function displayNotMatchTXT($filename) {
	var notMtachFile = `<div name="${ $filename }" class="notMatchFile" draggable="true">${ $filename }</div>`;

	// display
	$('#contentInterface .settingTab.target .notMatch').append(notMtachFile);
	$('.notMatch.fixed').append(notMtachFile);
	
	// drag listener
	document.querySelector(`#contentInterface .settingTab.target .notMatchFile[name="${ $filename }"]`).addEventListener('dragstart', dragNotMatchFileStart);
	document.querySelector(`.notMatch.fixed .notMatchFile[name="${ $filename }"]`).addEventListener('dragstart', dragNotMatchFileStart);
}

