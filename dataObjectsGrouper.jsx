//20.12.2013
//zmeyemz@gmail.com

#target illustrator
if(app.documents.length > 0)
{
    var aDoc = app.activeDocument;
    var aSel = aDoc.selection;

    var nSel = aSel.length;

    if(nSel==0)
    {
            alert("Select objects first");
    }
    else
    {
            var dlg = new Window('dialog', 'objectsGrouper',{x:100,y:100,width:300,height:370},{resizeable:false,closeButton:true,maximizeButton:false,minimizeButton:false});

            dlg.nDivs = 5;

            dlg.staticNDivs = dlg.add('statictext', {x: 10, y:10, width:100, height:20}, 'quantity of areas');
            dlg.editNDivs = dlg.add('edittext', {x: 110, y:10, width:50, height:20},dlg.nDivs);
            
            dlg.chColor = dlg.add('checkbox', {x: 180, y:10, width:100, height:20}, 'recolor');
            dlg.chColor.value = 1;

            dlg.static1 = dlg.add('statictext', {x: 20, y:35, width:50, height:20}, '#');
            dlg.static2 = dlg.add('statictext', {x: 70, y:35, width:50, height:20}, '"value"');
            dlg.static3 = dlg.add('statictext', {x: 140, y:35, width:50, height:20}, '%');            
            
            dlg.static4 = dlg.add('statictext', {x: 160, y:325, width:150, height:50}, 'selected objects:\n'+nSel, {multiline:true});     

            dlg.sb1 = dlg.add('scrollbar', {x: 250, y:55, width:15, height:260}, 0, 0, 1);
            dlg.sb1.onChange = function()
            {
                 for(var i=0; i<10; i++)
                 {
                     dlg.gr1.aStaticNum[i].arrayIndex = Math.floor(dlg.sb1.value)+i;
                     dlg.gr1.aStaticNum[i].text = dlg.gr1.aStaticNum[i].arrayIndex+1;
                     dlg.gr1.aEditNum[i].arrayIndex = Math.floor(dlg.sb1.value)+i;
                     dlg.gr1.aEditNum[i].text = dlg.gr1.aNum[dlg.gr1.aEditNum[i].arrayIndex];
                     dlg.gr1.aEditPerc[i].arrayIndex = Math.floor(dlg.sb1.value)+i;
                     dlg.gr1.aEditPerc[i].text = Math.floor(dlg.gr1.aPerc[dlg.gr1.aEditPerc[i].arrayIndex]*10000)/10000+'%';                     
                 }
            }
            dlg.sb1.onChanging = dlg.sb1.onChange;

            dlg.gr1= dlg.add('panel', {x: 10, y:55, width:240, height:260}, '');
            dlg.gr1.nDivs = 0;
            dlg.gr1.aStaticNum = new Array();
            dlg.gr1.aEditNum = new Array();
            dlg.gr1.aEditPerc = new Array();
            dlg.gr1.aNum = new Array();
            dlg.gr1.aPerc = new Array();            

            dlg.gr1.setNDivs = function(setN)
            {
                if(setN > dlg.gr1.nDivs)
                {
                    for(var i=dlg.gr1.nDivs; i<setN; i++)
                    {
                         dlg.gr1.aNum.push(10);
                         dlg.gr1.aPerc.push(1);
                    }
                
                    if(dlg.gr1.nDivs < 10)
                    {
                         for(var i=dlg.gr1.nDivs; i<setN; i++)
                         {
                             if(i>=10)
                                break;
                             dlg.gr1.aStaticNum[i].visible = true;
                             dlg.gr1.aEditNum[i].visible = true;
                             dlg.gr1.aEditPerc[i].visible = true;
                         }
                    }
                }
            
                if(setN < dlg.gr1.nDivs)
                {
                    for(var i=dlg.gr1.nDivs-1; i>=setN; i--)
                    {
                      dlg.gr1.aNum.pop();
                      dlg.gr1.aPerc.pop();
                    }
                
                    if(setN < 10)
                    {
                         for(var i=setN; i<10; i++)
                         {
                             dlg.gr1.aStaticNum[i].visible = false;
                             dlg.gr1.aEditNum[i].visible = false;
                             dlg.gr1.aEditPerc[i].visible = false;
                         }
                    }
                }
            
               
            
                dlg.gr1.nDivs = setN;
                  
                RecalcPercents();
                  
                if((setN-10)<0)
                    dlg.sb1.maxvalue = 0;
                else
                    dlg.sb1.maxvalue = setN-10;
                    
                if(dlg.sb1.value > dlg.sb1.maxvalue)
                {
                    dlg.sb1.value = dlg.sb1.maxvalue;
                }

                dlg.sb1.onChange();
            
                dlg.sb1.jumpdelta = 10;
            }
        
            for(var i=0; i<10; i++)
            {
                dlg.gr1.aStaticNum.push(0);
                dlg.gr1.aStaticNum[i].arrayIndex = i;                
                dlg.gr1.aStaticNum[i] = dlg.gr1.add('statictext', {x: 5, y:5+25*i, width:40, height:20}, i+1);

                dlg.gr1.aEditNum.push(0);
                dlg.gr1.aEditNum[i].arrayIndex = i;                
                dlg.gr1.aEditNum[i] = dlg.gr1.add('edittext', {x: 55, y:5+25*i, width:50, height:20}, '');
                
                
                dlg.gr1.aEditPerc.push(0);
                dlg.gr1.aEditPerc[i].arrayIndex = i;                
                dlg.gr1.aEditPerc[i] = dlg.gr1.add('edittext', {x: 125, y:5+25*i, width:100, height:20}, '',{readonly: true});
                
                dlg.gr1.aEditNum[i].onChange = function()
                {

                    var currNum = Number(this.text);

                    if(isNaN(currNum))
                    {
                       currNum = dlg.gr1.aNum[this.arrayIndex];
                    }

                    if(currNum < 0)
                    {
                        currNum = dlg.gr1.aNum[this.arrayIndex];
                    }
                
                    dlg.gr1.aNum[this.arrayIndex] = currNum;
                    this.text = currNum;
      
                    RecalcPercents();
                }
                
                if(i<dlg.gr1.nDivs)
                {
                     dlg.gr1.aEditNum[i].text = dlg.gr1.aNum[i];
                }
                else
                {
                    dlg.gr1.aStaticNum[i].visible = false;
                    dlg.gr1.aEditNum[i].visible = false;
                    dlg.gr1.aEditPerc[i].visible = false;
                }
            }      
        
            dlg.gr1.setNDivs(dlg.nDivs);
            
      
            
            dlg.editNDivs.onChange = function ()
            {
                var currNDivs = Number(dlg.editNDivs.text);

                if(isNaN(currNDivs))
                {
                   currNDivs = dlg.nDivs;
                }

                if(currNDivs < 1 || currNDivs > 1000)
                {
                    currNDivs = dlg.nDivs;
                }
            
                dlg.nDivs = currNDivs;
                dlg.editNDivs.text = currNDivs;
                
                dlg.gr1.setNDivs(dlg.nDivs);
            }       

            function RecalcPercents()
            {
                var sumNum = 0;
                for(var i=0; i<dlg.gr1.nDivs; i++)
                {
                    sumNum+=dlg.gr1.aNum[i];
                }
                for(var i=0; i<dlg.gr1.nDivs; i++)
                {
                    dlg.gr1.aPerc[i] = 100*dlg.gr1.aNum[i]/sumNum;
                }
            
                dlg.sb1.onChange();
            }
        
            dlg.btnOK =  dlg.add('button', {x: 10, y:325, width:140, height:30}, 'Run'); 
            dlg.btnOK.onClick = function()
            {
                var aNum = new Array();
                var sumNum = 0;
                for(var i=0; i<dlg.gr1.nDivs; i++)
                {
                    if(dlg.gr1.aNum[i]>0)
                    {
                        aNum.push(dlg.gr1.aNum[i]);
                        sumNum+=dlg.gr1.aNum[i];
                    }
                }
                var nDivs = aNum.length;
             
                var aPoses1 = new Array();      
                var currSum = 0;
                aPoses1.push(0);
                for(var i=0; i<nDivs-1; i++)
                {
                    aPoses1.push(Math.floor(nSel*(aNum[i]+currSum)/sumNum));
                    currSum+=aNum[i];
                }
            
                var aPoses = new Array();
                aPoses.push(aPoses1[0]);
                for(var i=1; i<aPoses1.length; i++)
                {
                    if(aPoses1[i]!=aPoses1[i-1])
                        aPoses.push(aPoses1[i]);
                }

                var color1 = new RGBColor();
                color1.red = 255;
                color1.green = 0;
                color1.blue = 0;
                var color2 = new RGBColor();
                color2.red = 0;
                color2.green = 255;
                color2.blue = 0;
                var color3 = new RGBColor();
                color3.red = 0;
                color3.green = 0;
                color3.blue = 255;
                var aColors = new Array(color1, color2, color3);

                var iCurrPos = 0;
                var currGroup = 0;
                var prevGroup = 0;
                for(var iSel=0; iSel<nSel; iSel++)
                {
                    if(iSel == aPoses[iCurrPos])
                    {
                        currGroup = aDoc.groupItems.add();
                        if(iCurrPos!=0)
                        {
                           currGroup.move(prevGroup, ElementPlacement.PLACEAFTER);
                        }
                        prevGroup = currGroup;
                        iCurrPos++;
                    }
                    aSel[iSel].move(currGroup, ElementPlacement.PLACEATEND);
                    
                    if(dlg.chColor.value == 1)
                    {
                        if(aSel[iSel].typename=="PathItem")
                        {
                              aSel[iSel].fillColor =  aColors[iCurrPos%3];
                        }
                        if(aSel[iSel].typename=="CompoundPathItem")
                        {
                              aSel[iSel].pathItems[0].fillColor =  aColors[iCurrPos%3];
                        }          
                    }
                }
            
                dlg.close();
            }
        
            RecalcPercents();
            
            dlg.show();
    }
}

/*
var nDivs = Number(prompt ("Число зон", 5));

if(nDivs > 0)
{
    var aPoses = new Array();
    for(var iDiv=0; iDiv<nDivs; iDiv++)
    {
        aPoses.push(Math.floor(iDiv*nSel/nDivs));
    }

    var color1 = new RGBColor();
    color1.red = 255;
    color1.green = 0;
    color1.blue = 0;
    var color2 = new RGBColor();
    color2.red = 0;
    color2.green = 255;
    color2.blue = 0;
    var color3 = new RGBColor();
    color3.red = 0;
    color3.green = 0;
    color3.blue = 255;
    var aColors = new Array(color1, color2, color3);

    var iCurrPos = 0;
    var currGroup = 0;
    for(var iSel=0; iSel<nSel; iSel++)
    {
        if(iSel == aPoses[iCurrPos])
        {
            currGroup = aDoc.groupItems.add();
            iCurrPos++;
        }
        aSel[iSel].move(currGroup, ElementPlacement.INSIDE);
        if(aSel[iSel].typename=="PathItem")
        {
              aSel[iSel].fillColor =  aColors[iCurrPos%3];
        }
    }
}

*/