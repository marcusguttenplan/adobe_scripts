// Reverse

// reverses the order of the anchor points of each selected paths


// test env: Adobe Illustrator CS3, CS6 (Windows)

// Copyright(c) 2004-2013 Hiroyuki Sato
// https://github.com/shspage
// This script is distributed under the MIT License.
// See the LICENSE file for details.

// Wed, 30 Jan 2013 07:09:23 +0900

main();
function main(){
  var paths = [];
  getPathItemsInSelection(1, paths);
  if(paths.length<1) return;

  for(var i = 0; i < paths.length; i++){
    pireverse( paths[i] );
  }

  /*
  // show alert when done
  var str = paths.length == 1 ? " path" : " paths";
  alert( paths.length + str + " reversed" );
  */
}

// -----------------------------------------
function pireverse(pi){
  var p = pi.pathPoints;
  var ps = [];
  var i;
  
  for(i = 0; i < p.length; i++) {
    with(p[i]){
      ps.unshift([anchor, rightDirection, leftDirection, pointType]);
    }
  }
  for(i = 0; i < p.length; i++) {
    with(p[i]){
      anchor         = ps[i][0];
      leftDirection  = ps[i][1];
      rightDirection = ps[i][2];
      pointType      = ps[i][3];
    }
  }
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
