// Dup At Selected Anchors

// duplicates the foreground object in the selection
// at the locations of rest of every selected anchor points.


// test env: Adobe Illustrator CS3, CS6 (Windows)

// Copyright(c) 2005-2013 Hiroyuki Sato
// https://github.com/shspage
// This script is distributed under the MIT License.
// See the LICENSE file for details.

// Wed, 30 Jan 2013 07:05:47 +0900

main();
function main(){
  if(documents.length < 1) return;
  
  var s = activeDocument.selection;
  if(!(s instanceof Array) || s.length < 2) return;

  var tgt_item = s[0]; // target object to duplicate
  
  // define the location where to locate at the rest of anchors.
  // if the target is a PathItem and only 1 anchor selected,
  // duplicate to locate this anchor at the rest of anchors.
  var tgt_point = [];

  // check whether only 1 anchor point is selected
  var i;
  if(tgt_item.typename == "PathItem"){
    var p = tgt_item.pathPoints;
    
    for(i = 0; i < p.length; i++){
      if(isSelected(p[i])){
        if(tgt_point.length < 1){
          tgt_point = p[i].anchor;
        } else { // means 2 or more anchors are selected
          tgt_point = [];
          break;
        }
      }
    }
  }
  
  if(tgt_point.length < 1){ // means 2 or more anchors are selected
    // find out the center of the target
    var vb = tgt_item.visibleBounds; // left, top, right, bottom
    tgt_point = [(vb[0] + vb[2]) / 2, (vb[1] + vb[3]) / 2];
  }
  
  var paths = [];
  extractPaths(s.slice(1), 0, paths);
  var j;
  
  for(i = 0; i < paths.length; i++){
    p = paths[i].pathPoints;
    
    for(var j=0; j < p.length; j++){
      if(isSelected(p[j])){
        tgt_item.duplicate().translate(p[j].anchor[0] - tgt_point[0],
                                       p[j].anchor[1] - tgt_point[1]);
      }
    }
  }
}

// -----------------------------------------------
function isSelected(p){
  return p.selected == PathPointSelection.ANCHORPOINT;
}

// --------------------------------------
function extractPaths(s, pp_length_limit, paths){
  for(var i = 0; i < s.length; i++){
    if(s[i].typename == "PathItem"
       && ! s[i].guides
       && ! s[i].clipping){
      
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
