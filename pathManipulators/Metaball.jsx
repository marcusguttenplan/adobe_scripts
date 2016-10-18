// Metaball

// This script may help to create Metaball-like shapes

// USAGE : Draw some circles and select them, then run this script.
// Adjust the values in the dialog. Then click OK.
// (it doesn't check in the script whether each path is really a circle)

// # Combining the shapes using Pathfinder may results several overlapping
//   anchor points on the path.  if it occurs, it may help to solve it to
//   use my another script "Merge Overlapped Anchors.js".
//   This is a simple sample script that merges overlapping anchors on the path.


// test env: Adobe Illustrator CC (Win/Mac)

// Copyright(c) 2004-2015 Hiroyuki Sato
// https://github.com/shspage
// This script is distributed under the MIT License.
// See the LICENSE file for details.

// Tue, 07 Jul 2015 20:08:48 +0900

main();
function main(){
    var conf = {
        rate : "50.0",
        maxSliderValue : 100
    }
    
    var paths = [];
    getPathItemsInSelection(1, paths);
    if(paths.length < 2) return;
    
    activateEditableLayer(paths[0]);
    
    var preview_paths = [];
    var previewed = false;
    
    var clearPreview = function(){
        if( previewed ){
            try{
                undo();
                redraw();
            } catch(e){
                alert(e);
            } finally {
                preview_paths = [];
                previewed = false;
            }
        }
    }
    
    var drawPreview = function(){
        if(conf.rate > 0){
            try{
                var v = conf.rate / 100;
                var pitem, j;
                for(var i = paths.length - 1; i >= 1; i--){
                    for(j = i - 1; j >= 0; j--){
                        pitem = metaball(paths[i], paths[j], v);
                        if(pitem != null) preview_paths.push( pitem );
                    }
                }
            } finally {
                previewed = true;
            }
        }
    }

    // show a dialog
    var win = new Window("dialog", "Metaball" );
    win.alignChildren = "fill";
    
    win.rateSliderPanel = win.add("panel", undefined, "rate");
    win.rateSliderPanel.orientation = "row";
    win.rateSliderPanel.alignChildren = "fill";
    win.rateSliderPanel.rateSlider = win.rateSliderPanel.add("slider", undefined, conf.rate, 0, conf.maxSliderValue);
    win.rateSliderPanel.txtBox = win.rateSliderPanel.add("edittext", undefined, conf.rate);
    win.rateSliderPanel.txtBox.justify = "right";
    win.rateSliderPanel.txtBox.characters = 5;
    win.rateSliderPanel.txtBox.helpTip = "hit TAB to set the input value temporarily";
    
    win.chkGroup = win.add("group");
    win.chkGroup.alignment = "center";
    win.chkGroup.previewChk = win.chkGroup.add("checkbox", undefined, "preview");
    
    win.btnGroup = win.add("group", undefined );
    win.btnGroup.alignment = "center";
    win.btnGroup.okBtn = win.btnGroup.add("button", undefined, "OK");
    win.btnGroup.cancelBtn = win.btnGroup.add("button", undefined, "Cancel");

    var getValues = function(){
        conf.rate = win.rateSliderPanel.txtBox.text;  //.text;
    }
    
    var processPreview = function( is_preview ){
        if( ! is_preview || win.chkGroup.previewChk.value){
            win.enabled = false;
            getValues();
            clearPreview();
            drawPreview();
            if( is_preview ) redraw();
            win.enabled = true;
        }
    }

    win.rateSliderPanel.txtBox.onChange = function(){
      var v = parseFloat(this.text);
      
      if(isNaN(v)){
        v = conf.slider_defaultvalue;
      } else if(v < 0){
        v = 0;
      } else if(v > conf.maxSliderValue){
        v = conf.maxSliderValue;
      }
       this.text = v;
       
      win.rateSliderPanel.rateSlider.value = v;
      processPreview( true );
    }

    win.rateSliderPanel.rateSlider.onChanging = function(){
        win.rateSliderPanel.txtBox.text = this.value.toFixed( 1 );
    }
    win.rateSliderPanel.rateSlider.onChange = function(){
        win.rateSliderPanel.txtBox.text = this.value.toFixed( 1 );
        processPreview( true );
    }

    win.chkGroup.previewChk.onClick = function(){
        if( this.value ){
            processPreview( true );
        } else {
            if( previewed ){
                clearPreview();
                redraw();
            }
        }
    }

    win.btnGroup.okBtn.onClick = function(){
        processPreview( false );
        win.close();
    }
    
    win.btnGroup.cancelBtn.onClick = function(){
        win.enabled = false;
        clearPreview();
        win.enabled = true;
        win.close();
    }
    win.show();

    if(previewed) app.activeDocument.selection = paths.concat( preview_paths );
}

// ---------------------------------------------
function metaball(s0, s1, v){
  var arr = getGBCenterWidth(s0);
  o1 = arr[0];      // o:center, r:radius
  r1 = arr[1] / 2;
  
  arr = getGBCenterWidth(s1);
  o2 = arr[0];
  r2 = arr[1] / 2;

  if(r1 == 0 || r2 == 0) return;
  
  var pi2 = Math.PI / 2;
  
  var d = dist(o1, o2);

  var u1, u2;
  if(d <= Math.abs(r1 - r2)){
    return;
  } else if(d < r1 + r2){ // case circles are overlapping
    u1 = Math.acos((r1 * r1 + d * d - r2 * r2) / (2 * r1 * d));
    u2 = Math.acos((r2 * r2 + d * d - r1 * r1) / (2 * r2 * d));
  } else {
    u1 = 0;
    u2 = 0;
  }

  var t1 = getRad(o1, o2);
  var t2 = Math.acos((r1 - r2) / d);
  
  var t1a = t1 + u1 + (t2 - u1) * v;
  var t1b = t1 - u1 - (t2 - u1) * v;
  var t2a = t1 + Math.PI - u2 - (Math.PI - u2 - t2) * v;
  var t2b = t1 - Math.PI + u2 + (Math.PI - u2 - t2) * v;
  
  var p1a = setPnt(o1, t1a, r1);
  var p1b = setPnt(o1, t1b, r1);
  var p2a = setPnt(o2, t2a, r2);
  var p2b = setPnt(o2, t2b, r2);

  // define handle length by the distance between both ends of the curve to draw
  var handle_len_rate = 2;
  var d2 = Math.min(v * handle_len_rate, dist(p1a, p2a) / (r1 + r2));
  d2 *= Math.min(1, d * 2 / (r1 + r2)); // case circles are overlapping
  r1 *= d2;
  r2 *= d2;
  
  var pitem = s0.duplicate();
  with(pitem){
    var pt = pathPoints;
    while( pt.length < 4 ) pt.add();
    while( pt.length > 4 ) pt[ pt.length - 1 ].remove();
      
    with(pt[0]){
      anchor = p1a;
      leftDirection = anchor;
      rightDirection = setPnt(p1a, t1a - pi2, r1);
      pointType = PointType.CORNER;
    }
    with(pt[1]){
      anchor = p2a;
      rightDirection = anchor;
      leftDirection = setPnt(p2a, t2a + pi2, r2);
      pointType = PointType.CORNER;
    }
    with(pt[2]){
      anchor = p2b;
      leftDirection = anchor;
      rightDirection = setPnt(p2b, t2b - pi2, r2);
      pointType = PointType.CORNER;
    }
    with(pt[3]){
      anchor = p1b;
      rightDirection = anchor;
      leftDirection = setPnt(p1b, t1b + pi2, r1);
      pointType = PointType.CORNER;
    }
    closed = true;
  }
  return pitem;
}

// ------------------------------------------------
function getGBCenterWidth(pi){
  var gb = pi.geometricBounds; // left, top, right, bottom
  var w = gb[2] - gb[0];
  var h = gb[1] - gb[3];
  return [[gb[0] + w / 2, gb[3] + h / 2], w];
}

// ------------------------------------------------
function setPnt(pnt, rad, dis){
  return [pnt[0] + Math.cos(rad) * dis,
          pnt[1] + Math.sin(rad) * dis];
}

// ------------------------------------------------
function dist(p1, p2) {
  return Math.sqrt(Math.pow(p1[0] - p2[0], 2)
                   + Math.pow(p1[1] - p2[1], 2));
}

// ------------------------------------------------
function getRad(p1,p2) {
  return Math.atan2(p2[1] - p1[1],
                    p2[0] - p1[0]);
}

// ----------------------------------------------
function activateEditableLayer(pi){
  var lay = activeDocument.activeLayer;
  if(lay.locked || ! lay.visible) activeDocument.activeLayer = pi.layer;
}

// ------------------------------------------------
// extract PathItems from the selection which length of PathPoints
// is greater than "n"
function getPathItemsInSelection(n, paths){
  if(documents.length < 1) return;
  
  var s = activeDocument.selection;
  
  if (!(s instanceof Array) || s.length < 1) return;

  extractPaths(s, n, paths);
}

// --------------------------------------
// extract PathItems from "s" (Array of PageItems -- ex. selection),
// and put them into an Array "paths".  If "pp_length_limit" is specified,
// this function extracts PathItems which PathPoints length is greater
// than this number.
function extractPaths(s, pp_length_limit, paths){
  for(var i = 0; i < s.length; i++){
    if(s[i].typename == "PathItem"
       && !s[i].guides && !s[i].clipping){
      if(pp_length_limit
         && s[i].pathPoints.length <= pp_length_limit){
        continue;
      }
      paths.push(s[i]);
      
    } else if(s[i].typename == "GroupItem"){
      // search for PathItems in GroupItem, recursively
      extractPaths(s[i].pageItems, pp_length_limit, paths);
      
    } else if(s[i].typename == "CompoundPathItem"){
      // searches for pathitems in CompoundPathItem, recursively
      // ( ### Grouped PathItems in CompoundPathItem are ignored ### )
      extractPaths(s[i].pathItems, pp_length_limit , paths);
    }
  }
}
