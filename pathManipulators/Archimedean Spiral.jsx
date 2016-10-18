// uzumaki (mosquito coil type)

// draws an (approximate) archimedes' spiral

// test env: Adobe Illustrator CS3, CS6 (Windows)

// Copyright(c) 2009-2013 Hiroyuki Sato
// https://github.com/shspage
// This script is distributed under the MIT License.
// See the LICENSE file for details.

// Mon, 11 Feb 2013 19:00:17 +0900

var mpi = Math.PI; // Math.PI
var hpi = mpi / 2;
// Settings  ============================

var radius_increment = 5; // radius-increment per round (point)

var uzu_angle = 15 /180 * mpi; // unit of rounding angle (radian)

var uzu_roundtime = 10; // rounding times

// =================================
var han = 4 / 3 * (1 - Math.cos( uzu_angle / 2 )) / Math.sin( uzu_angle / 2 );
var ver15_or_later = parseFloat(version.substr(0, 2)) >= 15;

// ---------------------------------------------------------
// A fix for the change of the document origin in CS5,
// and for the multi-artboard in CS4 or later.
// This function locates the active artboard's origin on the
// bottom left at first, and restores it at the end.
//
// USAGE:
// var g_origin = Origin();
// ... (do something in legacy style)
// g_origin.restore();

function Origin(){
    var ver15_or_later = (parseFloat(version.substr(0, 2)) >= 15); // CS5 or later
    var ver14 = (version.substr(0, 2) == "14"); // CS4
  
    if(ver15_or_later){
        var saved_coord_system = app.coordinateSystem;
        app.coordinateSystem = CoordinateSystem.ARTBOARDCOORDINATESYSTEM;

        var idx  = app.activeDocument.artboards.getActiveArtboardIndex();
        var ab  = app.activeDocument.artboards[idx];
        
        var o   = ab.rulerOrigin;
        var r   = ab.artboardRect;
        var saved_origin = [o[0], o[1]];
        ab.rulerOrigin = [0, r[1] - r[3]];
        
    } else if(ver14){
        var o = app.activeDocument.rulerOrigin;
        var saved_origin = [o[0], o[1]];
        app.activeDocument.rulerOrigin = [0, 0];
    }

    this.restore = function(){
        if(ver15_or_later){
            ab.rulerOrigin = saved_origin;
            app.coordinateSystem = saved_coord_system;
            
        } else if(ver14){
            app.activeDocument.rulerOrigin = saved_origin;
        }
    };
    
    return this;
}
// ---------------------------------------------------------

var g_origin = Origin();
uzumaki();
g_origin.restore();

// ----------------------------------------------
function uzumaki(){
  if(documents.length < 1) return;
  var lay = activeDocument.activeLayer;
  
  if(lay.locked || !lay.visible){
    alert("Please select an unlocked and visible layer,\nthen run this script again.");
    return;
  }
  
  var angle_rate = Math.abs(uzu_angle / (2 * mpi));
  radius_increment *= angle_rate;
  uzu_roundtime = uzu_roundtime / angle_rate + 2;

  // makes an array for anchors
  var wi;
  var pnts = [[0,0]];
  var hans = [0];
  
  for(var i = 1; i < uzu_roundtime; i++){
    wi = radius_increment * i;
    pnts.push( pnt4angle(uzu_angle * i, wi) );
    hans.push( wi * han );
  }

  // creates a path
  var pi = lay.pathItems.add();
  with(pi){
    // properties of the spiral
    closed = false;
    filled = false;
    stroked = true;
    strokeWidth = 1;
    //    strokeColor ...
  }
  pi.setEntirePath(pnts);
  var p = pi.pathPoints;
  p[p.length-1].remove();
  uzu_roundtime -= 1;
  
  // specifies handles
  var ti, hPnt;
  
  for(i = 1; i < uzu_roundtime; i++){
    ti = getRad(pnts[i-1], pnts[i+1]);
    hPnt = pnt4angle(ti, hans[i]);
    with(p[i]){
      rightDirection = addPnt(pnts[i], hPnt);
      leftDirection  = subPnt(pnts[i], hPnt);
      pointType = PointType.SMOOTH;
    }
  }
  
  // translate
    pi.translate(activeDocument.width / 2, activeDocument.height / 2);
}
// ----------------------------------------------
function getRad(p1, p2) {
  return Math.atan2(p2[1] - p1[1], p2[0] - p1[0]);
}
// ----------------------------------------------
function pnt4angle(t, m){
  return [Math.cos(t) * m, Math.sin(t) * m];
}
// ----------------------------------------------
function addPnt(p1, p2){
  return [p1[0] + p2[0], p1[1] + p2[1]];
}
// ----------------------------------------------
function subPnt(p1, p2){
  return [p1[0] - p2[0], p1[1] - p2[1]];
}
