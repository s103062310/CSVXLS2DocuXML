# CSVXLS2DocuXML
[Develop Weekly Progress](https://hackmd.io/@DocuSky/Hy8191XGH)

> 2019.11.28 | v.1.0  
> 2019.12.19 | v.1.1, add: upload multiple txt at once  
> 2020.02.10 | v.2.0  
> 2020.04.08 | v.2.1, add: functions in upload .xls and .txt  
> 2020.07.03 | v.2.2, fix: bugs and update explanation, add: some functions in setting  
> 2020.07.14 | v.2.3, fix: hintbox, default adjust, and json file  
> 2020.09.04 | v.2.4, fix: bugs & some UI  
> 2020.11.18 | v.3.0  
> 2021.03.03 | v.3.1, fix: update bootstrap and apply docuxml.js  
> 2021.04.08 | V.3.2, mod: show all detecting error at once  
> 2021.04.23 | v.3.3, fix: bugs of & => &amp;  
> 2021.04.30 | v.3.4, fix: csv encoding  
> 2021.05.19 | v.3.5, fix: update new links  
> 2021.05.28 | v.3.6, fix: bugs and scheme  
> 2021.08.21 | v.3.7, mod: remove event section  
> 2023.04.22 | v.3.8, mod: allow tag content  

## Introduction of Interface (page)
1. **upload** => load csv/excel files
2. **required** => required metadata setting (corpus & filename)
3. **optional** => optional metadata setting (refer to [specification table](https://docs.google.com/spreadsheets/d/1G7UPZv-G1D7Yowwj_r7pO7rZXmr16PrxEZQ22_bqFIw/edit#gid=0))
4. **custom** => define personal used metadata
5. **content** => add something in ```<doc_content></doc_content>```, including metaTags, Comments, and Events
6. **download** => converting to DocuXML

## HTML File
1. **index.html** => tool main page
2. **explain.html** => explanation page

## CSS Files
1. **main.css** => for main screen which won't change as the process progresses
3. **io.css** => for upload and download page
4. **setting.css** => for required, optional, custom, and part of content page
5. **content.css** => for detail of content page

## Javascripts Files
1. **globalVar.js** =>
* all used data structures and global variables
* initialization of the program
* overwirte class prototype.
* other small tools
2. **fileLoading.js** => functions that used to upload/download files to system or DocuSky
3. **dataProcess.js** => functions that used file data or setting data to dynamicly process output data
4. **display.js** => functions that used to display html page
5. **interaction.js** => functions that interact with user
6. **worker.js** => worker scripts to prevent UI blocked


