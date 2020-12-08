/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
This file defined the functions that used to display html page.
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */


// * * * * * * * * * * * * * * * * upload * * * * * * * * * * * * * * * * *


/* ---
block that represents a sheet
INPUT: string, sheet name
OUTPUT: none
--- */
function displayUploadedSheet(sheet) {
	$('.upload-obj').before(`
		<div class="sheet-obj target" name="${ sheet }">
			<div class="normal">
				<i class="fa fa-file" aria-hidden="true"></i>
				<span>${ sheet.replace('|', ' | ') }</span>
			</div>
			<div class="hover">
				<i class="fa fa-trash-o" aria-hidden="true" onclick="deleteSheet('${ sheet }', true);"></i>
				<i class="fa fa-eye" aria-hidden="true" onclick="showSheet('${ sheet }');"></i>
				<i class="fa fa-check" aria-hidden="true" onclick="toggleUsed(this);"></i>
			</div>
		</div>
	`);	
}


// * * * * * * * * * * * * * * * * required * * * * * * * * * * * * * * * * *


/* ---
trigger when back to upload interface - reset all data and UI
--- */
function reset() {
	_fileindex = [];
	_documents = [];
	_corpusSetting = {};
	_buffer = {};
	_notMatch = {};
	$('.main .directory').empty();
	$('.main .content').empty();
}


/* ---
sheet list in required/optional/custom/content interface
--- */
function displaySheetList() {
	_selectedSheet.forEach((sheet, i) => {
		let [filename, sheetname, num] = sheet.split('|');

		// display
		$('section .directory').append(`
			<div class="dir-item${ (i === 0) ?' target' :'' }" key="${ sheet }">
				<span>${ filename }</span>
				<span>|</span>
				<span>${ sheetname + '(' + num + ')' }</span>
			</div>
		`);
	});
}


/* ---
html of button group with custom choices
INPUT: array, choices, (object [type: single or header or multiple, value: string or array(2/3)])
OUTPUT: string, html of button group
--- */
function displayBtnGroup(list) {
	var items = '';

	// choices string
	list.forEach(item => {
		if (item.type === 'header') items += `<div class="dropdown-divider"></div>
				  							  <h6 class="dropdown-header">${ item.value }</h6>
				  							  <div class="dropdown-divider"></div>`;
		else if (item.type === 'single') items += `<a class="dropdown-item" value="${ item.value[1] }">${ item.value[0] }</a>`;
		else items += `<a class="dropdown-item multiple${ (item.value[2]) ?' ' + item.value[2] :'' }" value="${ item.value[1] }">
							<span>${ item.value[0] }</span>
							<span>|</span>
							<span>${ item.value[1] }</span>
						</a>`;
	});

	// button group string
	return `<div class="btn-group">
				<button type="button" class="btn btn-light dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
					--- 請選擇 ---
				</button>
				<div class="dropdown-menu text-center">
					<a class="dropdown-item target" value="reset">--- 請選擇 ---</a>
					${ items }
				</div>
			</div>`;
}


/* ---
content setting of required interface
--- */
function displayRequiredPage() {
	_selectedSheet.forEach((sheet, i) => {
		let corpusItem = [], filenameItem = [];
		let [filename, sheetname, num] = sheet.split('|');

		// corpus basic choices
		corpusItem.push({ type: 'single', value: ['自訂', 'udef'] });
		corpusItem.push({ type: 'multiple', value: ['檔案名稱', filename] });
		corpusItem.push({ type: 'multiple', value: ['資料表名稱', sheetname] });

		// filename basic choices
		filenameItem.push({ type: 'single', value: ['自動產生檔名', 'udef'] });
		
		// common choices
		_dataPool[sheet][0].forEach(header => {
			corpusItem.push({ type: 'multiple', value: ['欄位名稱', header] });
			filenameItem.push({ type: 'multiple', value: ['欄位名稱', header] });
		});

		// display
		$('#required .content').append(`
			<!-- sheet -->
			<div class="setting-sheet${ (i === 0) ?' target' :'' }" name="${ sheet }">
				<h4 class="text-center">${ sheet.replace(/\|/g, ' | ') }</h4>

				<!-- corpus -->
				<div class="required-obj" name="corpus">
					<h5>文獻集名稱 corpus</h5>
					<div class="button-input">
						${ displayBtnGroup(corpusItem) }
						<input type="text" class="form-control" placeholder="請輸入文獻集名稱...">
					</div>
				</div>

				<!-- filename -->
				<div class="required-obj" name="filename">
					<h5>文件唯一編號 filename</h5>
					<div class="button-input">
						${ displayBtnGroup(filenameItem) }
						<input type="text" class="form-control" placeholder="請輸入檔名前綴...">
					</div>
				</div>
			</div>
		`);
	});
}


// * * * * * * * * * * * * * * * * optional * * * * * * * * * * * * * * * * *


/* ---
content setting of optional interface
--- */
function displayOptionalPage() {
	
	// list of metadata
	var listItem = [];
	for (let name in _metadata.spec) {

		// skip required metadata
		if (name === 'corpus' || name === 'filename') continue;

		// header
		if (name === 'title') listItem.push({ type: 'header', value: '文件資訊' });
		if (name === 'geo_level1') listItem.push({ type: 'header', value: '地理資訊' });
		if (name === 'time_orig_str') listItem.push({ type: 'header', value: '時間資訊' });

		// item
		let value = [_metadata.spec[name].zh, name];
		if (_metadata.spec[name].post) value.push('post');
		listItem.push({ type: 'multiple', value: value });
	}

	var listHtml = displayBtnGroup(listItem);

	// each sheet
	_selectedSheet.forEach((sheet, i) => {
		let objs = '';

		// each header
		_dataPool[sheet][0].forEach(header => {
			objs += `<div class="optional-obj" name="${ header }">
						<h5>${ header }</h5>
						${ listHtml }
					</div>`;
		});

		// display
		$('#optional .content').append(`
			<!-- sheet -->
			<div class="setting-sheet${ (i === 0) ?' target' :'' }" name="${ sheet }">
				<h4 class="text-center">${ sheet.replace(/\|/g, ' | ') }</h4>
				${ objs }
			</div>
		`);
	});
}


// * * * * * * * * * * * * * * * * custom * * * * * * * * * * * * * * * * *


/* ---
content setting of custom interface
--- */
function displayCustomPage() {

	// display each sheet
	_selectedSheet.forEach((sheet, i) => {
		$('#custom .content').append(`
			<!-- sheet -->
			<div class="setting-sheet${ (i === 0) ?' target' :'' }" name="${ sheet }">
				<h4 class="text-center">${ sheet.replace(/\|/g, ' | ') }</h4>
			</div>
		`);
	});

	// display add button
	$('#custom .content').append(`
		<button id="add-cumstom-obj" type="button" class="btn btn-light">
			<i class="fa fa-plus" aria-hidden="true"></i> 新增一項自訂欄位
		</button>
	`);

	// activate button
	$('#add-cumstom-obj').click(function(event) {
		let target = $(event.target).siblings('.target');

		// list of sheet header
		let listItem = [];
		_dataPool[_sheet][0].forEach(header => {
			listItem.push({ type: 'single', value: [header, header] });
		});
		
		// button
		let buttonGroup = displayBtnGroup(listItem);
		
		// display new custom obj
		$(target).append(`
			<div class="custom-obj">
				<div class="obj-item" name="name">
					<span>欄位名稱</span>
					<input type="text" class="form-control">
				</div>

				<div class="obj-item" name="data">
					<span>欄位資料</span>
					${ buttonGroup }
				</div>

				<div class="obj-item" name="link">
					<span>超連結資料</span>
					${ buttonGroup }
					<label class="switch">
						<input type="checkbox">
						<span class="slider"></span>
					</label>
				</div>

				<i class="fa fa-trash" aria-hidden="true" onclick="$(this).closest('.custom-obj').remove();"></i>
			</div>
		`);

		// activate
		activateDropdown($(target).children().last());
	});
}


// * * * * * * * * * * * * * * * * content * * * * * * * * * * * * * * * * *


/* ---
content setting of content interface
--- */
function displayContentPage() {
	
	// tab navigation
	var tabNav = '';
	for (let tag in _contentTags) {
		tabNav += `<div class="tab-nav-item${ (tag === 'content') ?' target' :'' }" key="${ tag }">
						<span>${ _contentTags[tag].zh }</span>
						<span>${ _contentTags[tag].name }</span>
					</div>`;
	}

	// source item list
	let sourceItem = [];
	sourceItem.push({ type: 'single', value: ['對應資料表欄位', 'mapping'] });
	sourceItem.push({ type: 'single', value: ['匯入純文字檔案', 'import'] });

	// source
	let source = `<!-- source -->
					<div class="obj-item" name="source">
						<h5 style="margin-left: 0;">來源</h5>
						${ displayBtnGroup(sourceItem) }
					</div>`;

	// mapping
	let mapping = `<!-- mapping -->
					<div class="mapping-obj">
						<h5>對應欄位</h5>
						<button type="button" class="btn btn-light add-mapping-btn">
							<i class="fa fa-plus" aria-hidden="true"></i> 新增一項對應欄位
						</button>
					</div>`;

	// import txt
	let importtxt = `<!-- import -->
					<div class="import-obj dy-obj">
						<h5>上傳純文字檔</h5>

						<!-- tool bar -->
						<div class="obj-item">
							<button type="button" class="btn btn-light delete-txt-all">
								<i class="fa fa-trash" aria-hidden="true"></i> 刪除全部
							</button>
							<button type="button" class="btn btn-light upload-txt-multiple">
								<i class="fa fa-upload" aria-hidden="true"></i> 批次上傳
							</button>
							<button type="button" class="btn btn-light upload-txt-whole">
								<i class="fa fa-upload" aria-hidden="true"></i> 使用單一文字檔案，並以「空行」分件
							</button>
						</div>

						<!-- txt manipulate -->
						<div class="txt-board">

							<!-- txt record table -->
							<div class="txt-table">
								<div class="txt-th">
									<span>檔名</span>
									<span>狀態</span>
									<span>檢視</span>
									<span>操作</span>
								</div>
							</div>

							<!-- not match buffer -->
							<div class="txt-buffer"></div>
						</div>
					</div>`;

	// each sheet
	_selectedSheet.forEach((sheet, i) => {
		let panel = $('#content .content');

		// display sheet
		$(panel).append(`
			<!-- sheet -->
			<div class="setting-sheet${ (i === 0) ?' target' :'' }" name="${ sheet }">
				<h4 class="text-center">${ sheet.replace(/\|/g, ' | ') }</h4>
				
				<!-- tab navigation -->
				<div class="tab-nav">${ tabNav }</div>
			</div>
		`);

		// display tab
		let sheetPanel = $(panel).children().last();
		for (let tag in _contentTags) {
			$(sheetPanel).append(`
				<div class="dy-obj ${ tag }-obj${ (tag === 'content') ?' target' :'' }">
					${ (tag === 'content')
						? source + mapping + importtxt
						: mapping }
				</div>
			`);
		}		

		// display txt table
		let tablePanel = $(sheetPanel).find('.txt-table');
		Object.keys(_fileindex[sheet]).forEach(index => {
			$(tablePanel).append(`
				<div class="txt-td" data-index="${ index }">
					<span></span>
					<span>無</span>
					<i class="fa fa-eye" aria-hidden="true"></i>
					<i class="fa fa-upload" aria-hidden="true"></i>
				</div>
			`);
		});
	});

	// other display setting
	$('.content-obj .mapping-obj').addClass('dy-obj');
	for (let tag in _contentTags) $(`.${ tag }-obj .add-mapping-btn`).attr('data-type', tag);

	// activate add mapping button
	$('.add-mapping-btn').click(function(event) {
		let btn = $(event.target).closest('button');
		let id = $(btn).attr('data-type');

		// list of sheet header
		let listItem = [];
		_dataPool[_sheet][0].forEach(header => {
			listItem.push({ type: 'single', value: [header, header] });
		});

		// display
		$(btn).before(`
			<div class="obj-item" name="${ id }" data-index="${ _buffer[_sheet].addNewMapping(id) }">
				${ displayBtnGroup(listItem) }
				${ (id === 'metatag') 
					? '<input type="text" class="form-control" placeholder="請輸入標籤名稱...">'
					: '' }
				<i class="fa fa-trash mapping-trash" aria-hidden="true"></i>
			</div>
		`);

		// activate
		activateMapping($(btn).prev());
	});

	// activate table functions
	activateImport('body', ['eye', 'upload'], true);
}


/* ---
filename in txt table
--- */
function displayImport() {
	_selectedSheet.forEach(sheet => {
		$(`#content .setting-sheet[name="${ sheet }"] .txt-td`).each(function() {
			let i = $(this).attr('data-index');
			let j = _fileindex[sheet][i];
			$(this).children().first().html(_documents[j].filename + '.txt');
		});
	});
}


/* ---
create an UI of not match file
INPUT: string, id of not match file
--- */
function displayTxtBuffItem(fileID) {
	var item = `<span class="txt-buffer-item" key="${ fileID }" draggable="true">${ fileID.replace('|', ' | ') }</span>`;
	var display = function(buf) {
		$(buf).append(item);
		activateNotMatchFile($(buf).children().last());
	};
	display($('#content .setting-sheet.target .txt-buffer'));
	display($('.txt-buffer.fixed'));
}


