var scriptName = "Objects to layers - 1.0";
if (app.documents.length == 0) ErrorExit("Please open a document and try again.", true);

Main();

function Main() {
	var i, currentItem, newLayer,
	doc = app.activeDocument;

	for (i = 0; i < doc.pageItems.length; i++) {
		currentItem = doc.pageItems.item(i);
		newLayer = doc.layers.add();
		currentItem.move(newLayer);
	}

	alert("Finished.", scriptName);
}

function ErrorExit(error, icon) {
	alert(error, scriptName, icon);
	exit();
}