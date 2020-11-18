# CSVXLS2DocuXML
[Develop Weekly Progress](https://hackmd.io/N1x-sTgeQGucbKUmJMZu5g)

> 2019.11.28 | v.1.0  
> 2019.12.19 | v.1.1, add: upload multiple txt at once  
> 2020.02.10 | v.2.0  
> 2020.04.08 | v.2.1, add: functions in upload .xls and .txt  
> 2020.07.03 | v.2.2, fix: bugs and update explanation, add: some functions in setting  
> 2020.07.14 | v.2.3, fix: hintbox, default adjust, and json file  
> 2020.09.04 | v.2.4, fix: bugs & some UI  
> 2020.11.18 | v.3.0

## Introduction of Interface (page)
1. **upload** => load csv/excel files
2. **required** => required metadata setting (corpus & filename)
3. **optional** => optional metadata setting (refer to [specification table](https://docs.google.com/spreadsheets/d/1G7UPZv-G1D7Yowwj_r7pO7rZXmr16PrxEZQ22_bqFIw/edit#gid=0))
4. **custom** => define personal used metadata
5. **content** => add something in ```<doc_content></doc_content>```, including metaTags, Comments, and Events
6. **download** => converting to DocuXML

## HTML File
1. **explain.html** => explanation of the tool
2. **explainDir.html** => directory of explanation

## CSS Files
1. **main-style.css** => for main screen which won't switch as the process progresses
2. **animating-style.css** => for animation, including lightbox and page switching
3. **IO-style.css** => for upload and download interface
4. **setting.css** => for required, optional, and part of content interface, including button-group, select, input, and table list
5. **content-style.css** => for content interface

## Javascripts Files
1. **globalVar.js** =>
* all used data structures and global variables
* initialization of the program
* getter (get some information)
* other small tools
2. **checker.js** => check functions (return a boolean value)
3. **fileLoading.js** => functions that used to upload/download files to system or DocuSky
4. **dataProcess.js** => functions that used file data or setting data to dynamicly process output data
5. **display.js** => functions that used to display html page
6. **interaction.js** => functions that interact with user
7. **worker.js** => worker scripts to prevent UI blocked
8. **meta.json** => metadata standard in json format


