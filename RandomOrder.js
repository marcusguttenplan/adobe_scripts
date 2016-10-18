aDoc = app.activeDocument;
cSel = aDoc.selection;
nSel = cSel.length;

for(i=0; i<nSel; i++)
{
	cIndex = Math.floor(Math.random()*(nSel - i));
	cSel[cIndex].zOrder(ZOrderMethod.SENDTOBACK);
	cSel = aDoc.selection;
}
