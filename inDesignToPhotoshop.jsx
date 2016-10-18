// September 14 2011
// Written by Kasyan Servetsky
// http://www.kasyan.ho.com.ua
// e-mail: askoldich@yahoo.com
//==================================================================
#target indesign
if (app.documents.length == 0) ErrorExit("Please open a document and try again.");

const gScriptName = "Export from InDesign to Photoshop"; // Name of the script
const gScriptVersion = "1.1"; // Version

var gTempFolderPath, gTempFolder;
var gDoc = app.activeDocument;
var gActPage = app.activeWindow.activePage;

CreateDialog();
//~ Main();

//===================================== FUNCTIONS  ======================================
function Main() {
	var docPath = gDoc.filePath.absoluteURI + "/";
	var baseName = GetFileName(gDoc.name) + " - " + gActPage.name;
	gTempFolderPath = docPath + "Temp - " + baseName + "/";
	gTempFolder = new Folder(gTempFolderPath);
	if (!gTempFolder.exists) gTempFolder.create();
	var pdfPresetName = "ExportToPS_bleedmarks";
	var pdfPreset = app.pdfExportPresets.itemByName(pdfPresetName);
	if (!pdfPreset.isValid) ErrorExit("Pdf-preset \"" + pdfPresetName + "\" doesn't exist.", true);
	
	// Save open file as temp.indd file
	gDoc.save(new File(docPath + baseName + ".indd"));
	gDoc = app.activeDocument;
	gDoc.viewPreferences.horizontalMeasurementUnits = MeasurementUnits.MILLIMETERS;
	gDoc.viewPreferences.verticalMeasurementUnits = MeasurementUnits.MILLIMETERS;

for (var p = gDoc.pages.length-1; p >= 0; p--) {
	if (gDoc.pages[p] != gActPage) gDoc.pages[p].remove();
}
	var includeMaster = true; // TEMP false true
	
	UnlockLayers();
	RemovePasteboardItems(gDoc);
	if (includeMaster) { // If "Include master" is chose, override all master page items for the first page.
		var masterSpreads = gDoc.masterSpreads;
		for (var i = 0; i < masterSpreads.length; i++) {
			OverrideMasterItems(masterSpreads[i].pages[0]);
		}
		OverrideMasterItems(gDoc.pages[0]);
	}
	UnlockAllObjects();
	ReleaseMultistateObjects();
	ConvertButtonsToObjects(); 
	MoveToLayer();
	LabelStackOrder();
	CreateLayersFromObjects();
	gDoc.layers.itemByName("Merged").remove();
	
	var obj = {}
	var backgroundPdfFile = new File(gTempFolderPath + gDoc.name.replace(/\.indd$/i, "_background.pdf"));
	obj.backgroundPdfFile = backgroundPdfFile;
	obj.psdFilePath = gDoc.fullName.fsName.replace(/\.indd$/i, "_Test.psd");
	
	gDoc.exportFile(ExportFormat.PDF_TYPE, backgroundPdfFile, false, pdfPreset); // "[High Quality Print]" "ExportToPS_bleedmarks" Kas1 ExportToPS_bleedmarks ExportToPS_useDocumentBleedSettings
	CreateBridgeTalkMessage2(obj.toSource());
	
	ExportPdfs(pdfPreset);
	
	CreateBridgeTalkMessage4();
	gDoc.save();
	
	alert("Finished", gScriptName + " - " + gScriptVersion);
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------
function ConvertButtonsToObjects() {
	var buttons = gActPage.buttons;
	for (var i = buttons.length-1; i >= 0; i--) {
		//$.writeln(i + " - " + buttons[i].id + " - " + buttons[i].constructor.name);
		buttons[i].convertToObject();
	}
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------
function ExportPdfs(pdfPreset) {
	var pdfFile, pdfFileName, pdfFilePath, layer;
	var layers = gDoc.layers;
	
	for (var i = layers.length-1; i >= 0; i--) {
		layers.everyItem().visible = false;
		layer = layers[i];
		layer.visible = true;
		//$.writeln(i + " - " + layer.name);
		
		if (layer.name.match(/-text$/) !=null) {
			try {
				var textFrames = gDoc.textFrames;
				for (var t = 0; t < textFrames.length; t++) {
					textFrame = textFrames[t];
					if (textFrame.itemLayer == layer && textFrame.appliedObjectStyle == gDoc.objectStyles.itemByName("-text") && textFrame.contents != "") {
						SetDisplayDialogs("NO");
						var textObj = GetTextData(textFrame);
						var serObj = textObj.toSource();
						CreateBridgeTalkMessage(serObj);
						SetDisplayDialogs("YES");
					}
				}
			}
			catch (err) {
				$.writeln(i + " - " + layer.name + " - " + err.line + "/" + err.description);
			}
		}
		else {
			pdfFileName = layer.name + ".pdf";
			pdfFilePath = gTempFolderPath + pdfFileName;
			pdfFile = new File(pdfFilePath);
			gDoc.exportFile(ExportFormat.PDF_TYPE, pdfFile, false, pdfPreset);
			CreateBridgeTalkMessage3(pdfFilePath);
		}
	}

	layers.everyItem().visible = true;
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------
function CreateBridgeTalkMessage4() {
	var bt = new BridgeTalk();
	bt.target = "photoshop";
	var script = CropAndSave.toString() + '\r';
	script += 'CropAndSave();';
	bt.body = script;
//~ 	$.write(script);
//~ 	exit();
	bt.onResult = function(resObj) {} 
	bt.onError = function(resObj) {
		alert(resObj.body);
	}
	bt.send(100);
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------
function CropAndSave() {
	var doc = app.activeDocument;
	var h = doc.height;
	var w = doc.width;
	var shift = new UnitValue (7.40833333333333, "mm");
	doc.crop([ shift, shift, w-shift, h-shift ]);
	doc.save();
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------
function CreateBridgeTalkMessage3(filePath) {
	var bt = new BridgeTalk();
	bt.target = "photoshop";
	var script = PlacePdf.toString() + '\r';
	script += 'PlacePdf("' + filePath + '");';
	bt.body = script;
//~ 	$.write(script);
//~ 	exit();
	bt.onResult = function(resObj) {} 
	bt.onError = function(resObj) {
		alert(resObj.body);
	}
	bt.send(100);
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------
function PlacePdf(filePath) {
	var idPlc = charIDToTypeID( "Plc " );
	var desc2 = new ActionDescriptor();
	var idAs = charIDToTypeID( "As  " );
	var desc3 = new ActionDescriptor();
	var idfsel = charIDToTypeID( "fsel" );
	var idpdfSelection = stringIDToTypeID( "pdfSelection" );
	var idpage = stringIDToTypeID( "page" );
	desc3.putEnumerated( idfsel, idpdfSelection, idpage );
	var idPgNm = charIDToTypeID( "PgNm" );
	desc3.putInteger( idPgNm, 1 );
	var idCrop = charIDToTypeID( "Crop" );
	var idcropTo = stringIDToTypeID( "cropTo" );
	var idcropBox = stringIDToTypeID( "cropBox" );
	desc3.putEnumerated( idCrop, idcropTo, idcropBox );
	var idPDFG = charIDToTypeID( "PDFG" );
	desc2.putObject( idAs, idPDFG, desc3 );
	var idnull = charIDToTypeID( "null" );
	desc2.putPath( idnull, new File( filePath ) );
	var idFTcs = charIDToTypeID( "FTcs" );
	var idQCSt = charIDToTypeID( "QCSt" );
	var idQcsa = charIDToTypeID( "Qcsa" );
	desc2.putEnumerated( idFTcs, idQCSt, idQcsa );
	var idOfst = charIDToTypeID( "Ofst" );
	var desc4 = new ActionDescriptor();
	var idHrzn = charIDToTypeID( "Hrzn" );
	var idRlt = charIDToTypeID( "#Rlt" );
	desc4.putUnitDouble( idHrzn, idRlt, 0.000000 );
	var idVrtc = charIDToTypeID( "Vrtc" );
	var idRlt = charIDToTypeID( "#Rlt" );
	desc4.putUnitDouble( idVrtc, idRlt, 0.000000 );
	var idOfst = charIDToTypeID( "Ofst" );
	desc2.putObject( idOfst, idOfst, desc4 );
	var idAntA = charIDToTypeID( "AntA" );
	desc2.putBoolean( idAntA, true );
	try {
		executeAction( idPlc, desc2, DialogModes.NO );
		app.activeDocument.activeLayer.rasterize(RasterizeType.ENTIRELAYER);
	}
	catch(err) {
		$.writeln(err);
	}
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------
function CreateBridgeTalkMessage2(obj) {
	var bt = new BridgeTalk();
	bt.target = "photoshop";
	var script = RasterizePdfInPS.toString() + '\r';
	script += 'RasterizePdfInPS(' + obj + ');';
	bt.body = script;
//~ 	$.write(script);
//~ 	exit();
	bt.onResult = function(resObj) {} 
	bt.onError = function(resObj) {
		alert(resObj.body);
	}
	bt.send(100);
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------
function RasterizePdfInPS(obj) {
	app.displayDialogs = DialogModes.NO;
	if (obj.backgroundPdfFile.exists) {
		var pdfOpenOptions = new PDFOpenOptions;
		pdfOpenOptions.mode = OpenDocumentMode.RGB;
		pdfOpenOptions.resolution = 72;
		pdfOpenOptions.cropPage = CropToType.CROPBOX;
		pdfOpenOptions.usePageNumber = true;
		try {
			var photoshopDoc = app.open(obj.backgroundPdfFile, pdfOpenOptions);
		}
		catch(e) {
			$.writeln("1" + e);
		}
		photoshopDoc.flatten();
		var psdFile = new File(obj.psdFilePath);
		var photoshopSaveOptions = new PhotoshopSaveOptions();
		photoshopSaveOptions.layers = true;
		photoshopDoc.saveAs( psdFile, photoshopSaveOptions, false );
		app.displayDialogs = DialogModes.ALL;
	}
	else {
		alert("myIdPdfFile doesn't exist");
	}
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------
function CreateDialog() {
	var win = new Window("dialog", gScriptName + " - " + gScriptVersion);
	
	// get list of pages
	var pages = gDoc.pages.everyItem().getElements();
	var pageNames = [];
	for (var i = 0; i < pages.length; i++) {
		pageNames.push(pages[i].name);
	}
	//-------------------------------------------------
	win.p1 = win.add("panel", undefined, "What?");
	win.p1.alignChildren = "left";
	win.p1.alignment = "fill";
	
	win.p1.g1 = win.p1.add("group");
	win.p1.g1.orientation = "row";
	win.p1.g1.alighnChildren = "right";
	win.p1.g1.rb = win.p1.g1.add("radiobutton", undefined, "Complete page:");
	win.p1.g1.rb.value  = true;
	win.p1.g1.ddl = win.p1.g1.add("dropdownlist", undefined, pageNames);
	win.p1.g1.ddl.selection = 0;
	
	win.p1.g2 = win.p1.add("group");
	win.p1.g2.orientation = "row";
	win.p1.g2.alighnChildren = "right";
	win.p1.g2.rb = win.p1.g2.add("radiobutton", undefined, "Selected object(s)");	
	//-------------------------------------------------	
	win.p2 = win.add("panel", undefined, "Where?");
	win.p2.alignChildren = "left";
	win.p2.alignment = "fill";
	
	win.p2.g1 = win.p2.add("group");
	win.p2.g1.orientation = "row";
	win.p2.g1.alighnChildren = "right";
	win.p2.g1.rb = win.p2.g1.add("radiobutton", undefined, "New psd");
	win.p2.g1.rb.value  = true;
	
	win.p2.g2 = win.p2.add("group");
	win.p2.g2.orientation = "row";
	win.p2.g2.alighnChildren = "right";
	win.p2.g2.rb = win.p2.g2.add("radiobutton", undefined, "Add to open psd");		
	//-------------------------------------------------	
	win.p3 = win.add("panel", undefined, "Options");
	win.p3.alignChildren = "left";
	win.p3.alignment = "fill";
	
	win.p3.cb1 = win.p3.add("checkbox", undefined, "Create or add to existing layer comp:");
	win.p3.cb1.value = true;
	
	win.p3.g = win.p3.add("group");
	win.p3.g.orientation = "row";
	win.p3.g.alighnChildren = "right";
	win.p3.g.st = win.p3.g.add("statictext", undefined, "Name:");
	win.p3.g.et = win.p3.g.add("edittext", undefined, "");
	win.p3.g.et.preferredSize.width = 200;
	
	win.p3.cb2 = win.p3.add("checkbox", undefined, "Include master");
	win.p3.cb2.value = true;

	//-------------------------------------------------
	// Buttons
	win.buttons = win.add("group");
	win.buttons.orientation = "row";   
	win.buttons.alignment = "center";
	win.buttons.ok = win.buttons.add("button", undefined, "Start", {name:"ok" });
	win.buttons.cancel = win.buttons.add("button", undefined, "Cancel", {name:"cancel"});
	
	var showDialog = win.show();
	
	if (showDialog == 1) {
	//	gSet.selectedItem = win.panel.ddl.selection.index;
		Main();
	}
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------
function OverrideMasterItems(page) {
	if (page.appliedMaster != null) {
		var i,
		allPageItems = page.appliedMaster.pageItems.everyItem().getElements();
		
		for (i = 0; i < allPageItems.length; i++) {
			try{
//~ 					$.writeln(i + " - " + allPageItems[i].id + " - " + allPageItems[i].constructor.name);
					allPageItems[i].override(page);
			}
			catch(e) {
//~ 				$.writeln(i + " - " + e.line + " - " + e.description);
			}
		}
	}
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------
function UnlockLayers() {
	var layer, i;
	var layers = gDoc.layers;
	for (i = 0; i < layers.length; i++) {
		layer = layers[i];
		if (layer.locked == true) layer.locked = false;
	}
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------
function UnlockAllObjects() {
	var allPageItems, item, i;
	allPageItems = gDoc.allPageItems;
	for (i = 0; i < allPageItems.length; i++) {
		item = allPageItems[i];
		if (item.locked == true) item.locked = false;
	}
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------
function MoveToLayer() {
	var layers = gDoc.layers.everyItem().getElements();
	var layerMerged;
	if (gDoc.layers.itemByName("Merged") != null) {
		layerMerged = gDoc.layers.itemByName("Merged");
	}
	else {
		layerMerged = gDoc.layers.add({name:"Merged"});
	}
	layerMerged.merge(layers);
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------
function ReleaseMultistateObjects() {
	var multiStateObjects = gActPage.multiStateObjects;
	for (var i = multiStateObjects.length-1; i >= 0; i--) {
//~ 		$.writeln(i + " - " + multiStateObjects[i].id + " - " + multiStateObjects[i].constructor.name);
//~ 		app.select(multiStateObjects[i]);
		multiStateObjects[i].releaseAsObjects();
	}
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------
function LabelStackOrder() {
	var currentItem;
	app.select(NothingEnum.NOTHING);
	app.menuActions.itemByID(11289).invoke(); // First Object Above
	var sel = app.selection[0];
//~ 	$.writeln("Top item - " + sel.constructor.name +  ", " + sel.index);
	var items = gDoc.pageItems.everyItem().getElements();
	var count = items.length;
	
	for (var i = 0; i < count; i++) {
		if ( i != 0 ) app.menuActions.itemByID(11288).invoke();
		currentItem = app.selection[0];
		//currentItem.label = String(i);
		currentItem.insertLabel("stackOrder", String(i));
//~ 		$.writeln("i = " + i + ", " + currentItem.constructor.name +  ", " + currentItem.index);
	}
}

//--------------------------------------------------------------------------------------------------------------------------------------------------------
function CreateLayersFromObjects() {
	var currentItem, newLayer, newLayerName;
	var counter = 1;
	var items = gDoc.pageItems.everyItem().getElements();
	for (var i = items.length; i >= 0; i--) {
		currentItem = GetItem(String(i));
		if (currentItem != null) {
//~ 			$.writeln("i = " + i + ", " + currentItem.constructor.name +  ", " + currentItem.index);
			newLayer = gDoc.layers.add();
			
			if (currentItem.label != "") {
				newLayerName = currentItem.label;

			}
			else {
				newLayerName = "object" + counter;
				counter++;
				if (currentItem.appliedObjectStyle == gDoc.objectStyles.itemByName("-text")) newLayerName = newLayerName + "-text";
			}
		
			newLayer.name = newLayerName;
			currentItem.move(newLayer);
		}
	}
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------
function GetItem(label) {
	var currentItem;
	var items = gDoc.pageItems.everyItem().getElements();
	
	for (var i = 0; i < items.length; i++) {
		currentItem = items[i];
		if (currentItem.extractLabel("stackOrder") == label) {
			return currentItem;
		}
	}

	return null;
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------
function RemovePasteboardItems(doc) {
	var items = doc.pageItems.everyItem().getElements();
	var t = null;
	while (t = items.pop()) t.parentPage || RemoveItem(t);
	t = items = null;
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------
function RemoveItem(item) {
	try {
		item.locked = false;
		item.remove();
	}
	catch(err) {}
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------
function ErrorExit(error, icon) {
	alert(error, gScriptName + " - " + gScriptVersion, icon);
	exit();
}
//============================== FUNCTIONS  EDITABLE TEXT =================================
function CreateBridgeTalkMessage(serObj) {
	var bt = new BridgeTalk();
	bt.target = "photoshop";
	
	var script = '//@includepath "/c/Program Files/Adobe/xtools;/Developer/xtools;/Applications/Adobe Photoshop CS5/xtools"\r';
	script += '//@include "xlib/stdlib.js"\r';
	script += '//@include "xlib/Text.jsx"\r';
	script += 'ProcessInPS = ' + ProcessInPS.toSource() + '\r';
	script += 'ProcessInPS(' + serObj + ');';
	bt.body = script;
//~ 	$.write(script);
//~ 	exit();
	bt.onError = function(errObj) {
		$.writeln("Error: " + errObj.body);
	}
	bt.onResult = function(resObj) {} 
	bt.send(100);
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------
function ProcessInPS(obj) {
	var doc, tsr, s;
	var r = String.fromCharCode(13);
	var tsrs = obj.textRanges;
	tsr = tsrs[0];
	var opts = new TextOptions(obj.contents.replace(/_/g, r));
	var width = new UnitValue(obj.frameWidth,'mm');
	var height = new UnitValue(obj.frameHeight,'mm');
	if (app.documents.length == 0) {
		doc = app.documents.add(width, height, 72, "Text test", NewDocumentMode.RGB);
	}
	else {
		doc = app.activeDocument;
	}
	var textLayer = doc.artLayers.add();
	textLayer.kind = LayerKind.TEXT;
	var solidColorRef = new SolidColor();
	solidColorRef.rgb.red = tsr.color[0];
	solidColorRef.rgb.green = tsr.color[1];
	solidColorRef.rgb.blue = tsr.color[2];
	var ti = textLayer.textItem;
	ti.contents = obj.contents.replace(/_/g, r);
	ti.kind = TextType.PARAGRAPHTEXT;
	ti.width = width;
	ti.height = height;
	ti.position = [new UnitValue(obj.position[0], 'mm'), new UnitValue(obj.position[1], 'mm')];
	ti.font = tsr.font;
	ti.size = new UnitValue(tsr.size, 'pt');
	ti.color = solidColorRef;
	ti.justification = eval(obj.justification);
	textLayer.name = obj.layerName;
	var ranges = new TextStyleRanges();
	for (var i = 0; i < tsrs.length; i++) {
		tsr = tsrs[i];
		tsr.contents = tsr.contents.replace(/_/g, r);
		s = new TextStyle(tsr.font, tsr.size, Text.toRGBColor(tsr.color[0], tsr.color[1], tsr.color[2]));
		ranges.add(new TextStyleRange(tsr.from, tsr.to, s));	
	}
	opts.ranges = ranges;
	Text.modifyTextLayer(doc, opts, doc.activeLayer);
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------
function GetTextData(tf) {
	var obj, tsr;
	var textRanges = [];
	var txtObj = {}
	var doc = app.activeDocument;
	var docPref = doc.documentPreferences;
	var topSlug = docPref.slugTopOffset;
	var leftSlug = docPref.slugInsideOrLeftOffset;
	var gb = tf.geometricBounds;
	var width = gb[3] - gb[1];
	var height = gb[2] - gb[0];
	var txt = tf.texts[0];
	var cont = txt.contents.replace(/(\r|\n)/g, "_");
	var tsrs = txt.textStyleRanges;
	
	for (var i = 0; i < tsrs.length; i++) {
		tsr = tsrs[i];
		obj = {
			contents : tsr.contents.replace(/(\r|\n)/g, "_"),
			color : tsr.fillColor.colorValue,
			font : tsr.appliedFont.postscriptName,
			size : tsr.pointSize,
			length : tsr.characters.length,
			from : tsr.characters.firstItem().index,
			to : tsr.characters.lastItem().index +1
		}
	
		textRanges.push(obj);
	}

	txtObj.textRanges = textRanges;
	txtObj.position = [ gb[1]+7.4, gb[0]+7.8 ];
	txtObj.frameWidth = width;
	txtObj.frameHeight = height;
	txtObj.contents = cont;
	txtObj.layerName = tf.itemLayer.name;
	
	switch(txt.justification) {
		case Justification.LEFT_ALIGN:
			txtObj.justification = "Justification.LEFT";
			break;
		case Justification.CENTER_ALIGN:
			txtObj.justification = "Justification.CENTER";
			break;
		case Justification.RIGHT_ALIGN:
			txtObj.justification = "Justification.RIGHT";
			break;
		case Justification.LEFT_JUSTIFIED:
			txtObj.justification = "Justification.LEFTJUSTIFIED";
			break;		
		case Justification.RIGHT_JUSTIFIED:
			txtObj.justification = "Justification.RIGHTJUSTIFIED";
			break;
		case Justification.CENTER_JUSTIFIED:
			txtObj.justification = "Justification.CENTERJUSTIFIED";
			break;
		case Justification.FULLY_JUSTIFIED:
			txtObj.justification = "Justification.FULLYJUSTIFIED";
			break;			
		default:
			txtObj.justification = "Justification.LEFT";
	}
	
	return txtObj;
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------
function SetDisplayDialogs(mode) {
	var bt = new BridgeTalk;
	bt.target = "photoshop";
	var script = 'app.displayDialogs = DialogModes.' + mode + ';';
	bt.body = script;
	bt.send();
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------
function GetFileName(fileName) {
	var str = "";
	var res = fileName.lastIndexOf(".");
	if (res == -1) {
		str = fileName;
	}
	else {
		str = fileName.substr(0, res);
	}
	return str;
}
//--------------------------------------------------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------------------------------------------