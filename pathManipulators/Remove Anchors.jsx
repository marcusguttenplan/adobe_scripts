// Remove Anchors

// removes selected anchor points


// test env: Adobe Illustrator CS3, CS6 (Windows)

// Copyright(c) 2005-2013 Hiroyuki Sato
// https://github.com/shspage
// This script is distributed under the MIT License.
// See the LICENSE file for details.

// Wed, 30 Jan 2013 07:09:03 +0900

main();
function main(){
  if(documents.length < 1) return;
  
  var s = activeDocument.selection;
  if(!(s instanceof Array) || s.length < 1) return;

  var paths = [];
  extractPaths(s, 0, paths);

  var p, j;
  for(var i = paths.length - 1; i >= 0; i--){
    p = paths[i].pathPoints;
    for(j = p.length - 1; j >= 0; j--){
      if(isSelected(p[j])){
        if(p.length < 2) break;
        p[j].remove();
      }
    }
    if(p.length < 2 && isSelected(p[0])) paths[i].remove();
  }
  redraw();
}

// ----------------------------------------------
function isSelected(p){ // PathPoint
  return p.selected == PathPointSelection.ANCHORPOINT;
}

// --------------------------------------
function extractPaths(s, pp_length_limit, paths){
  for(var i = 0; i < s.length; i++){
    if(s[i].typename == "PathItem"){
      
      if(pp_length_limit > 0
         && s[i].pathPoints.length <= pp_length_limit) continue;
      paths.push( s[i] );
      
    } else if(s[i].typename == "GroupItem"){
      extractPaths( s[i].pageItems, pp_length_limit, paths);
      
    } else if(s[i].typename == "CompoundPathItem"){
      extractPaths( s[i].pathItems, pp_length_limit, paths);
    }
  }
}
