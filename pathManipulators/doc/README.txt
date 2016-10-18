Scripts for Adobe Illustrator
=========

This archive includes the script files for Adobe Illustrator written in JavaScript.  
Tested with Adobe Illustrtor CC (Win/Mac)  

For the description of each script, please refer to the following page.  
http://shspage.com/aijs/en/


## General Note For Usage

### How to Use the Scripts

Choose File>Scripts>Browse, and open the script to run. Or place the 
script in the directory "Adobe Illustrator CS?\Presets\ *locale* \Scripts", 
then restart Illustrator.

Download the PDF documents for more information.  
http://www.google.com/search?q=site:www.adobe.com+illustrator+javascript+reference

- "Illustrator CS? JavaScript Scripting Reference"
- "Illustrator CS? Scripting Guide"

### Selection of part of a path

Some scripts work only for selected anchor points or sides (= lines, 
bezier curve segments). A side (= a line, a bezier curve segment) means 
one of each line segment drawn to connect a couple of anchor points. In 
other words, selected parts means targets for Cut or Copy command. 
Regular (or Group) Select Tool selects whole of a path.

### A Compound Path Issue

Some scripts don't work for some part of compound paths. When this 
occurs, please select part of the compound path or release the compound 
path and select them, then run script again. I still have not figured 
out how to get properties from grouped paths inside a compound path.

### Illustrator 10 Issue

All the scripts was written to be compatible with AI 10 through CC (or 
later?). (Excludes some scripts using scriptUI that requires CS3 or 
later.) Only problem is AI 10 lacks a prompt dialog that users can 
specify the optional values. For now, one of the solution for this is to 
edit the scripts manually to change the default value of these varibles. 
They are most often placed in the beginning of the scripts with the 
appropriate comments.

### Other Notes

If you edit the scripts with Notepad.exe, please convert the newline 
characters using "jsx_converter.vbs" that is in the "doc" folder.

### License

Copyright(c) 2013 Hiroyuki Sato, All Rights Reserved.  
These scripts are distributed under the MIT License.
Free to use and distribute.  
See the LICENSE.txt included in the archive for details.

### Contact

Email form via http://shspage.com/aijs/en/
Twitter: [@shspage_en]

[@shspage_en]:http://twitter.com/shspage_en
