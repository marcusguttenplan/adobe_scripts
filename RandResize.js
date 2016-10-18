aDoc = app.activeDocument;
aSel = aDoc.selection;
nSel = aSel.length;

opMin = Number(prompt("min (0-1000%)", 0));
opMax = Number(prompt("max (0-1000%)", 200));

if(opMin > opMax)
{
	temp = opMin;
	opMin = opMax;
	opMax = temp;
}
if(opMin<0)
	opMIn = 0;
if(opMax>1000)
	opMax = 1000;

for(i=0; i<nSel; i++)
{
	resScale = Math.floor(Math.random() * (opMax - opMin + 1)) + opMin;
	aSel[i].resize(resScale, resScale);
}