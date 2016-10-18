aDoc = app.activeDocument;
aSel = aDoc.selection;
nSel = aSel.length;

opMin = Number(prompt("min (0-100)", 0));
opMax = Number(prompt("max (0-100)", 100));

if(opMin > opMax)
{
	temp = opMin;
	opMin = opMax;
	opMax = temp;
}
if(opMin<0)
	opMIn = 0;
if(opMax>100)
	opMax = 100;

for(i=0; i<nSel; i++)
{
	aSel[i].opacity = Math.floor(Math.random() * (opMax - opMin + 1)) + opMin;
}