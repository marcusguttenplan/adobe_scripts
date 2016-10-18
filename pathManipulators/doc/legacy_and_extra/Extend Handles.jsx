// Extend Handles

// dxtends all handles of selected anchor points with specified rate.
// 100 : original size
// 120 : extend 20%
//  80 : shorten 20%
//   0 : remove handles
// -100 : reverse handles


// test env: Adobe Illustrator CS3, CS6 (Windows)

// Copyright(c) 2004-2013 Hiroyuki Sato
// https://github.com/shspage
// This script is distributed under the MIT License.
// See the LICENSE file for details.

// Wed, 30 Jan 2013 07:06:09 +0900

var ver10 = (version.indexOf('10') == 0);

extendHandles();
// ------------------------------------------------
function extendHandles() {
  var paths = [];
  getPathItemsInSelection(0, paths);
  if(paths.length < 1) return;

  // setting ----------------------------
  
  var m = 200; // extend rate in percentage
  
  //-------------------------------------
  // CS : input the extend rate in percentage
  if(! ver10){
    m = prompt("extend rate in percentage", m);
    if(!m || isNaN(m)) return;
  }
  m = (m - 0) / 100;

  var j, p;
  for(var i = 0; i < paths.length; i++){
    p = paths[i].pathPoints;
    for(j = 0; j < p.length; j++){
      if(isSelected(p[j])) adjHan(p[j], m);
    }
  }
}

// ------------------------------------------------
function adjHan(p, m){
  with(p){
    rightDirection = [anchor[0] + (rightDirection[0] - anchor[0]) * m,
                      anchor[1] + (rightDirection[1] - anchor[1]) * m];
    leftDirection = [anchor[0] + (leftDirection[0] - anchor[0]) * m,
                     anchor[1] + (leftDirection[1] - anchor[1]) * m];
  }
}

// -----------------------------------------------
function isSelected(p){
  return p.selected == PathPointSelection.ANCHORPOINT;
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
    if(s[i].typename == "PathItem"){
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
