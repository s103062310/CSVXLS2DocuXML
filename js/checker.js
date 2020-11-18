/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
This file defined the check functions (return a boolean value)
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */


// * * * * * * * * * * * * * * * * overall * * * * * * * * * * * * * * * * *


/* ---
check if specific item is in the list
INPUT: 1) string, single list element
       2) array, search in this list
OUTPUT: boolean, in list = true, not in list = false
--- */
function itemInList($item, $list) {
	if ($list.indexOf($item) === -1) return false;
	else return true;
}


/* ---
check if string charactsrs are all half and english character
INPUT: string, original string
OUTPUT: boolean, all half and english = true, otherwise = false
--- */
function checkHalfAndEnglish($str) {
	var result = $str.match(/[A-Za-z_]/g);
	if (result == null || result.length != $str.length) return false;
	else return true;
}


/* ---
check if progress is finished
INPUT: none
OUTPUT: boolean, all finished = true, otherwise = false
--- */
function checkProgress() {
	for (let f in _progress) { if (_progress[f] < 1) return false; }
	return true;
}


// * * * * * * * * * * * * * * * * upload * * * * * * * * * * * * * * * * *


/* ---
check there is selected sheet in upload interface and record it
INPUT: none
OUTPUT: boolean, selected = true, not selected = false
--- */
function checkUploadPage() {

	// no uploaded file
	if (_dataPool.length <= 0) {
		alert("請先上傳 Excel 檔案。");
		return false;
	}

	// pick selected sheet
	_selectedSheet = [];
	$('.fileCover').each( function() {
		if ($(this).is('.chose')) _selectedSheet.push($(this).attr('name'));
	});

	// no selected sheet
	if (_selectedSheet.length <= 0) {
		alert("請至少選擇一份資料表。");
		return false;
	}

	return true;
}


// * * * * * * * * * * * * * * * * required * * * * * * * * * * * * * * * * *


/* ---
check if user fill all blank in required interface
INPUT: none
OUTPUT: boolean, all filled = true, not completed = false
--- */
function checkRequiredPage() {
	let pass = true;

	// each sheet
	$(`#requiredInterface .settingTab`).each(function() {
		let sheet = $(this).attr('name');

		// block of corpus and filename
		$(this).find('.menu').each(function() {
			let metaname = $(this).attr('name');
			let value = $(this).find('.text-only').attr('value');
			
			// not fill required data
			if (value === 'null') {
				alert(`請填寫資料表「 ${ sheet } 」的「 ${ metaname } 」。`);
				pass = false;
				return false;		// break

			// custom required data
			} else if (itemInList(value, _custom)) {
				let str = $(this).find('input').val().trim();

				// not fill custom string of required data
				if (str === '') {
					alert(`請填寫資料表「 ${ sheet } 」自訂之「 ${ metaname } 」。`);
					pass = false;
					return false;	// break
				}
			}
		});

		if (!pass) return false;		// break
	});

	return pass;
}


// * * * * * * * * * * * * * * * * custom * * * * * * * * * * * * * * * * *


/* ---
check if user fills complete information in custom interface and store setting data
INPUT: none
OUTPUT: boolean, filled = true, not completed = false
--- */
function checkandSetCustomPage() {
	let pass = true;

	// reset
	resetCustomMetadata();

	// each sheet
	$('#customInterface .settingTab').each(function() {
		let sheet = $(this).attr('name');
		let customMetadata = {};

		// each custom metadata
		$(this).find('.customObj').each(function(i) {
			let metaname = normalizeTag($(this).find('input[name="metaname"]').val());
			let menuBtn = $(this).find('.text-only');
			
			// not fill the tag name of custom metadata
			if (metaname === '') {
				alert(`請填寫資料表「${ sheet }」第 ${ i+1 } 個自訂詮釋資料的欄位名稱。`);
				pass = false;
				return false;		// break

			// tag name not use half and english character
			} else if (!checkHalfAndEnglish(metaname)) {
				alert(`在資料表「${ sheet }」第 ${ i+1 } 個自訂詮釋資料中，請使用半形英文定義欄位名稱。`);
				pass = false;
				return false;		// break

			// metadata name repeated
			} else if (metaname in customMetadata) {
				alert(`資料表「${ sheet }」第 ${ customMetadata[metaname] } 、${ i+1 } 個自訂詮釋資料名稱同為「 ${ metaname } 」。請取不同的名字。`);
				pass = false;
				return false;		// break

			// legal tag name
			} else customMetadata[metaname] = i + 1;

			// not choose data of custom metadata
			let metachoice = $(menuBtn[0]).attr('value');
			if (metachoice === 'null') {
				alert(`請選擇資料表「${ sheet }」第 ${ i+1 } 個自訂詮釋資料的資料對應欄位。`);
				pass = false;
				return false;		// break
			}

			// not choose data of hyper link
			let haslink = this.querySelector('input[name="link"]').checked;
			let linkchoice = $(menuBtn[1]).attr('value');
			if (haslink && linkchoice === 'null') {
				alert(`請選擇資料表「${ sheet }」第 ${ i+1 } 個自訂詮釋資料的超連結資料。`);
				pass = false;
				return false;	// break
			}

			// set custom metadata
			setCustomMetadata(sheet, metaname, metachoice, haslink, linkchoice);
		});

		if (!pass) return false;	// break
	});

	return pass;
}


// * * * * * * * * * * * * * * * * content * * * * * * * * * * * * * * * * *


/* ---
check if string is well form format
INPUT: string, content string
OUTPUT: boolean, well form = true, not well form = false
--- */
function checkWellForm($content) {
	let tags = $content.match(/<\/?.+?\/?>/g);
	let stack = [];

	// no tag
	if (tags === null) return true;

	// each tag
	for (let i = 0; i < tags.length; i++) {
		let strL = tags[i].length;

		// <xxxxx/>
		if (tags[i][strL-2] === '/') continue;

		// </xxxxx>
		else if (tags[i][1] === '/') {
			if (stack.length <= 0) return false;				// no element can match in stack
			let tagnameS = stack.splice(stack.length-1, 1)[0];
			let tagnameE = tags[i].replace(/[</>]/g, '');
			if (tagnameS !== tagnameE) return false;			// not matched
		}

		// <xxxxx>
		else stack.push(tags[i].replace(/[<>]/g, '').split(/\s/)[0]);
	}

	// there are tags not matched
	if (stack.length > 0) return false;

	return true;
}


/* ---
check if filename of uploaded txt is legal
INPUT: 1) array, filename array
	   2) string, condition mode
OUTPUT: boolean, continue upload = true, do not upload = false
--- */
function checkTXTFilename($filenames, $mode) {
	var cover = [];			// same filename will cover old data
	var wrongType = [];		// non-txt file
	var notMatch = [];		// filename user select
	var targetFiles = {};	// filename that user selected

	// extract target filenames
	if ($mode === 'single') {
		let key = $('#contentInterface .settingTab.target .rowFile.target').attr('key');
		targetFiles[_documents[key].attr.filename] = key;
	} else if ($mode === 'multi') {
		$('#contentInterface .settingTab.target .rowFile').each(function() {
			let key = $(this).attr('key');
			targetFiles[_documents[key].attr.filename] = key;
		});
	}

	// check each uploaded filename
	$filenames.forEach((filename, i) => {

		// reset matching
		_matching[i] = undefined;

		// parse filename
		let filenameParts = filename.split('.');
		let fileType = filenameParts[filenameParts.length-1];
		let normalized = filename.replace(`.${ fileType }`, '');		

		// filter non-txt file
		if (fileType !== 'txt') wrongType.push(filename);

		// make sure user upload the right file
		if (normalized in targetFiles) _matching[i] = targetFiles[normalized];
		else notMatch.push(filename);

		// see if there already has text
		if (normalized in targetFiles) {
			let status = $(`#contentInterface .settingTab.target .rowFile[key="${ targetFiles[normalized] }"]`).find('span[func="status"]').attr('class');
			if (status !== undefined) cover.push(filename);
		} 
	});

	// confirm if cover
	let uploadedNum = $(`#contentInterface .settingTab.target span[func="status"].glyphicon`).length;
	if ($mode === 'whole' && uploadedNum > 0) {
		if (!confirm(`已有上傳的檔案，確定要繼續並覆蓋此上傳表內所有資料嗎？`)) return false;
	} else if ($mode === 'multi' && cover.length > 0) {
		if (!confirm(`欲上傳的檔案\n${ array2Str(cover) }將會覆蓋舊有資料，要繼續上傳嗎？`)) return false;
	}

	// see if there is wrong file type
	if (wrongType.length > 0) {
		alert(`欲上傳的檔案\n${ array2Str(wrongType) }不符合檔案類型要求，請上傳副檔名為 .txt 的檔案。`);
		return false;
	}

	// see if there is not match file
	if (notMatch.length > 0) {
		if ($mode === 'single') {
			if (!confirm(`欲上傳的檔案「 ${ $filenames[0] } 」與所選檔名「 ${ Object.keys(targetFiles)[0] }.txt 」不符，要繼續上傳嗎？`)) return false;
		} else if ($mode === 'multi') {
			if (!confirm(`欲上傳的檔案\n${ array2Str(notMatch) }不在檔名列表內，要繼續上傳嗎？`)) return false;
		}
	}

	return true;
}


/* ---
check if user fill all information in content interface
INPUT: none
OUTPUT: boolean, filled = true, not completed = false
--- */
function checkContentPage() {
	let pass = true;

	// each sheet
	$(`#contentInterface .settingTab`).each(function() {
		let sheet = $(this).attr('name');

		// each tab
		$(this).find(`.tagTab`).each(function() {
			let tag = $(this).attr('name');

			// each mapping setting
			$(this).find(`.selectObj`).each(function(k) {
				let choice = $(this).find('.text-only').attr('value');
				let input = normalizeTag($(this).find('input').val());
				let tagname = 'Udef_' + input;

				// not choose
				if (choice === 'null') {
					alert(`請選擇資料表「 ${ sheet } 」 ${ tag } 的第 ${ k+1 } 個對應欄位。`);
					pass = false;
					return false;						// break
				}

				if (tag !== 'MetaTags') return true;	// continue

				// not fill tag name
				if (input === '') {
					alert(`請填寫資料表「 ${ sheet } 」 MetaTags 的第 ${ k+1 } 個標籤名稱。`);
					pass = false;
					return false;						// break
				}

				// format not correct
				if (!checkHalfAndEnglish(input)) {
					alert(`請使用半形英文填寫資料表「 ${ sheet } 」的第 ${ k+1 } 個 MetaTags 標籤名稱。`);
					pass = false;
					return false;						// break
				}

				// corpus seeting
				_corpusSetting[sheet].tag[k].name = tagname;

				// store tag name
				for (let i in _fileindex[sheet]) {
					let j = _fileindex[sheet][i];
					_documents[j].doc_content.MetaTags[k].tagname = tagname;
				}
			});

			if (!pass) return false;					// break
		});

		if (!pass) return false;						// break
	});

	return pass;
}



