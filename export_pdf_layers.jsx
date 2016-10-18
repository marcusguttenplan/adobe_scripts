/*
* Description: An Adobe Illustrator script that export each layer as a separate PDF file
* Usage: Layer name is the PDF file name. Rename layers if necessary.
* This is an early version that has not been sufficiently tested. Use at your own risks.
* License: GNU General Public License Version 3. (http://www.gnu.org/licenses/gpl-3.0-standalone.html)
*
* Copyright (c) 2009. William Ngan.
* http://www.metaphorical.net

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.

*/


var doc = app.activeDocument;

// prepare layers
for(var i=0; i<doc.layers.length; i++) {
		doc.layers[i].visible = false;
}


// go through each layers
for(var i=0; i<doc.layers.length; i++) {
	doc.layers[i].visible = true;
	if (i>0) doc.layers[i-1].visible = false;

	var fpath = doc.path; // save to document's folder
	fpath.changePath( doc.layers[i].name+'.pdf');
	savePDF( fpath );
}



/**
	* Save PDF file
	* @param file File object
*/
function savePDF( file ) {
	
	var saveOpts = new PDFSaveOptions();
	saveOpts.compatibility = PDFCompatibility.ACROBAT6;
	saveOpts.generateThumbnails = true;
	saveOpts.preserveEditability = false;
				
	doc.saveAs( file, saveOpts );
}