# CSVXLS2DocuXML
[Develop Weekly Progress](https://hackmd.io/@biXGOo3kRWCSdIteN7NWmg/Hy8191XGH)

> 2019.11.28 | v.1.0  
> 2019.12.19 | v.1.1, add: upload multiple txt at once  
> 2020.02.10 | v.2.0  

## Introduction of Interface (page)
1. **upload** => load csv/excel files
2. **required** => required metadata setting (corpus & filename)
3. **optional** => optional metadata setting (refer to [specification table](https://docs.google.com/spreadsheets/d/1G7UPZv-G1D7Yowwj_r7pO7rZXmr16PrxEZQ22_bqFIw/edit#gid=0))
4. **content** => add something in ```<doc_content></doc_content>```, including metaTags, Comments, and Events
5. **download** => converting to DocuXML

## CSS Files
1. **main-style.css** => for main screen which won't switch as the process progresses
2. **animating-style.css** => for animation, including lightbox and page switching
3. **IO-style.css** => for upload and download interface
4. **setting.css** => for required, optional, and part of content interface, including button-group, select, input, and table list
5. **content-style.css** => for content interface

## Javascripts Files
1. **globalVar.js** =>

> * defined all used data structures and global variables  
> * initialization of the program  
> * getter (get some information) and checker (return a boolean value)  
> * other small tools  

2. **fileLoading.js** => defined the functions that used to load files from computer and parse the data in files
3. **dataProcess.js** => defined the functions that used file data or setting data to process output result, including generating and checking
4. **display.js** => defined the functions that used to display html page
5. **interaction.js** => defined the functions that interact with user


