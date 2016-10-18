// Metaball (Arc)

// This script may help to create Metaball-like shapes

// USAGE : Draw some circles and select them, then run this script.
// Adjust the optional values in the dialog. Then click OK.
// (it doesn't check in the script whether each path is really a circle)

// # Combining the shapes using Pathfinder may results several overlapping
//   anchor points on the path.  if it occurs, it may help to solve it to
//   use my another script "Merge Overlapped Anchors.js".
//   This is a simple sample script that merges overlapping anchors on the path.


// test env: Adobe Illustrator CC (Win/Mac)

// Copyright(c) 2005-2015 Hiroyuki Sato
// http://shspage.com/aijs/en
// This script is distributed under the MIT License.
// See the LICENSE file for details.

// Tue, 07 Jul 2015 20:08:30 +0900

main();
function main(){
  var conf = {
    center_angle : 90,
    maxSliderValue : 180,
    draw_extra_circles : false
  }

  var paths = [];
  getPathItemsInSelection(1, paths);
  if(paths.length < 2) return;
  
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
        if(conf.center_angle > 0 && conf.center_angle < 180){
            try{
                var v = conf.center_angle * Math.PI / 180;
                var shapes, j;
                for(var i = paths.length - 1; i >= 1; i--){
                    for(j = i - 1; j >= 0; j--){
                        metaball(paths[i], paths[j], v,
                          conf.draw_extra_circles,
                          preview_paths);
                    }
                }
            } finally {
                if( preview_paths.length) previewed = true;
            }
        }
    }

    // show a dialog
    var win = new Window("dialog", "Metaball (Arc)" );
    win.alignChildren = "fill";
    
    win.rateSliderPanel = win.add("panel", undefined, "center angle");
    win.rateSliderPanel.orientation = "row";
    win.rateSliderPanel.alignChildren = "fill";
    win.rateSliderPanel.rateSlider = win.rateSliderPanel.add("slider", undefined, conf.center_angle, 0, conf.maxSliderValue);
    win.rateSliderPanel.txtBox = win.rateSliderPanel.add("edittext", undefined, conf.center_angle);
    win.rateSliderPanel.txtBox.justify = "right";
    win.rateSliderPanel.txtBox.characters = 5;
    win.rateSliderPanel.txtBox.helpTip = "hit TAB to set the input value temporarily";
    
    win.chkGroup = win.add("group");
    win.chkGroup.orientation = "column";
    win.chkGroup.alignment = "center";
    win.chkGroup.extraCircleChk = win.chkGroup.add("checkbox",
     undefined, "draw extra circles");
    win.chkGroup.previewChk = win.chkGroup.add("checkbox", undefined, "preview");
    
    win.btnGroup = win.add("group", undefined );
    win.btnGroup.alignment = "center";
    win.btnGroup.okBtn = win.btnGroup.add("button", undefined, "OK");
    win.btnGroup.cancelBtn = win.btnGroup.add("button", undefined, "Cancel");

    var getValues = function(){
        conf.center_angle = win.rateSliderPanel.txtBox.text;
        conf.draw_extra_circles = win.chkGroup.extraCircleChk.value;
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

    win.chkGroup.extraCircleChk.onClick = function(){
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
function metaball(s0, s1, center_angle, draw_extra_circles, preview_paths){
  var mpi = Math.PI;
  var hpi = mpi/2;

  var arr = getGBCenterWidth(s0);
  var o1 = arr[0];
  var r1 = arr[1] / 2;
  
  arr = getGBCenterWidth(s1);
  var o2 = arr[0];
  var r2 = arr[1] / 2;
  
  if(r1 == 0 || r2 == 0) return;
  
  var d = dist(o1, o2);
  if(d <= Math.abs(r1 - r2)) return;

  var ot1 = getRad(o1, o2);
  var ot2 = ot1 + mpi;

  var cos_ca = Math.cos(center_angle);
  var r = equation2_custom( 2 - 2 * cos_ca, 2 * (1 - cos_ca) * (r1 + r2),
    r1 * r1 + r2 * r2 - d * d - 2 * r1 * r2 * cos_ca);
  if(r == null) return;
  var a = r1 + r;
  var b = r2 + r;

  var t1 = Math.acos((a * a + d * d - b * b) / (2 * a * d));
  var t2 = Math.acos((b * b + d * d - a * a) / (2 * b * d));
  if( isNaN(t1) || isNaN(t2)) return;

  var h = getHandleLengthBase(center_angle) * r;

  var adjustShape = function(s){
    s.closed = true;
    var p = s.pathPoints;
    while(p.length > 4) p[p.length - 1].remove();
    while(p.length < 4) p.add();
    return s;
  };

  var shape = adjustShape( s0.duplicate() );
  preview_paths.push(shape);

  with(shape){
    var p = pathPoints;
    with(p[0]){
      anchor = setPnt(o1, ot1 + t1, r1);
      leftDirection = anchor;
      rightDirection = setPnt(anchor, ot1 + t1 - hpi, h);
    }
    with(p[1]){
      anchor = setPnt(o2, ot2 - t2, r2);
      leftDirection = setPnt(anchor, ot2 - t2 + hpi, h);
      rightDirection = anchor;
    }
    with(p[2]){
      anchor = setPnt(o2, ot2 + t2, r2);
      leftDirection = anchor;
      rightDirection = setPnt(anchor, ot2 + t2 - hpi, h);
    }
    with(p[3]){
      anchor = setPnt(o1, ot1 - t1, r1);
      leftDirection = setPnt(anchor, ot1 - t1 + hpi, h);
      rightDirection = anchor;
    }
  }

  if(draw_extra_circles){
    var o3 = setPnt(o1, ot1 + t1, r1 + r);
    var o4 = setPnt(o1, ot1 - t1, r1 + r);
    
    var copyPathPoints = function(s1, s2){
      var p1 = s1.pathPoints;
      var p2 = s2.pathPoints;
      for(var i = 0; i < p1.length; i++){
        p2[i].anchor = p1[i].anchor;
        p2[i].rightDirection = p1[i].rightDirection;
        p2[i].leftDirection = p1[i].leftDirection;
        p2[i].pointType = p1[i].pointType;
      }
    };

    var ex_shape1 = adjustShape( s0.duplicate() );
    var ex_shape2 = adjustShape( s0.duplicate() );
    
    var pitems = activeDocument.activeLayer.pathItems;
      
    var el1 = pitems.ellipse( o3[1] + r, o3[0] - r, r*2, r*2);
    var el2 = pitems.ellipse( o4[1] + r, o4[0] - r, r*2, r*2);

    copyPathPoints(el1, ex_shape1);
    el1.remove();
    copyPathPoints(el2, ex_shape2);
    el2.remove();
    
    preview_paths.push( ex_shape1 );
    preview_paths.push( ex_shape2 );
  }
}

// ------------------------------------------------
function getGBCenterWidth(pi){
  var gb = pi.geometricBounds; // left, top, right, bottom
  return [[(gb[0] + gb[2]) / 2, (gb[1] + gb[3]) / 2], gb[2] - gb[0]];
}

// ------------------------------------------------
function setPnt(pnt, rad, dis){
  return [pnt[0] + Math.cos(rad) * dis,
          pnt[1] + Math.sin(rad) * dis];
}

// ------------------------------------------------
function dist(p1, p2) {
  return Math.sqrt(Math.pow(p1[0] - p2[0],2) + Math.pow(p1[1] - p2[1],2));
}

// ------------------------------------------------
function getHandleLengthBase(theta){
  return 4 * Math.tan( theta / 4 ) / 3;
}
// ------------------------------------------------
function getRad(p1,p2) {
  return Math.atan2(p2[1] - p1[1], p2[0] - p1[0]);
}

// ----------------------------------------------
function mm2pt(n){  return n * 2.83464567;  }

// --------- -------------------------------------
function equation2_custom(a,b,c) {
    var s;
    if(a == 0){
        if(b == 0){
            return null;
        } else {
            s = -c / b;
            return s > 0 ? s : null;
        }
    }
    a *= 2;
    var d = b * b - 2 * a * c;
    if(d < 0){
        return null;
    }
    
    var rd = Math.sqrt(d);
    if(d > 0){
        var s1 = (-b + rd) / a;
        var s2 = (-b - rd) / a;
        if( s1 > 0 && s2 > 0){
            // I'm not sure if it's ok
            return Math.min( s1, s2 );
        } else if( s1 > 0 ){
            return s1;
        } else if( s2 > 0 ){
            return s2;
        } else {
            return null;
        }
    } else {
        s = -b / a;
        return s > 0 ? s : null;
    }
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
