var doc = app.activeDocument;
for(var i = 0; i < doc.layers.length; i++){
    doc.activeLayer = doc.layers[i];
    app.doAction("selectwhite", "Custom");
    doc.activeLayer.visible = false;
}
