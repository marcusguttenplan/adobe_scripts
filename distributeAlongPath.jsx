// distributeOnThePath.jsx

// distributes the selected objects
// in the equal distance on the foreground path in the selection.
// USAGE: select the objects and run this script.

// test env: Adobe Illustrator CC (Win/Mac)

// Copyright(c) 2014 Hiroyuki Sato
// http://shspage.blogspot.jp/
// This script is distributed under the MIT License.
// See the LICENSE file for details.

// Fri, 14 Feb 2014 21:08:19 +0900

function main(){
    // settings:
    // invert: inverts the direction of the distribution  (checkbox value)
    // extract_groups: rotates each item in the groups, otherwise rotates each groups  (checkbox value)
    var conf = {
        invert: false,
        extract_groups: false
    }
    
    if(documents.length < 1) return;
    
    var sels = activeDocument.selection;
    if( sels.length < 2 ) return;
    
    // gets the foreground object (it must be a pathItem)
    // the other objects are placed on this path
    var target_path = sels[0];
    if( target_path.typename != "PathItem" ){
        alert("The foreground object is not a path.\r"
              + "A path to distribution must be at the foreground in the selection.");
        return;
    }

    var previewed = false;
    
    var clearPreview = function(){
        if(previewed){
            undo();
            previewed = false;
        }
    }
    
    var drawPreview = function(){
        try{
            distributreOnThePath( sels, conf );
            previewed = true;
        }catch(e){
            alert(e);
        }
    }
    
    var win = new Window("dialog", "distributeOnThePath");
    win.alignChildren = "fill";
    
    win.invertChk = win.add("checkbox", undefined, "invert path direction");
    win.ExtractChk = win.add("checkbox", undefined, "extract groups");
    win.previewChk = win.add("checkbox", undefined, "preview");

    win.btnGroup = win.add("group", undefined );
    win.btnGroup.alignment = "center";
    win.btnGroup.okBtn = win.btnGroup.add("button", undefined, "OK");
    win.btnGroup.cancelBtn = win.btnGroup.add("button", undefined, "Cancel");

    var getValues = function(){
        conf.invert = win.invertChk.value;
        conf.extract_groups = win.ExtractChk.value;
    }

    var processPreview = function( is_preview ){
        if( ! is_preview || win.previewChk.value){
            win.enabled = false;
            getValues();
            clearPreview();
            drawPreview();
            if( is_preview ) redraw();
            win.enabled = true;
        }
    }
    
    win.previewChk.onClick = function(){
        if( win.previewChk.value ){
            processPreview( true );
        } else {
            if(previewed){
                clearPreview();
                redraw();
            }
        }
    }
    win.invertChk.onClick = function(){
        win.previewChk.onClick();
    }
    win.ExtractChk.onClick = function(){
        win.previewChk.onClick();
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
}

function distributreOnThePath( sels, conf ){
    // gets the foreground object (it must be a pathItem)
    // the other objects are placed on this path
    var target_path = sels[0];

    var objs;
    if( conf.extract_groups ){
        objs = extractGroup( sels.slice(1) );
    } else {
        objs = sels.slice(1);
    }

    var sortfunc = conf.invert
        ? function(a,b){ return b.left - a.left }
        : function(a,b){ return a.left - b.left };
        
    // creates an array of objects sorted by their positions
    objs = objs.sort( sortfunc );

    // gets the distance between the objects
    var d = target_path.length / (objs.length - (target_path.closed ? 0 : 1));
    if( d == 0 ) return;

    // gets the points to place the objects
    var points = getPointsForDistribution( target_path, d );

    // fixing for the end point of the open path ( rough solution )
    if( points.length < objs.length ){
        points.push( new Point().setr(
            target_path.pathPoints[ target_path.pathPoints.length - 1 ].anchor));
    }

    // places the objects
    var i;
    for(i = 0; i < points.length; i++){
        moveToPoint( objs[i], getCenter( objs[i] ), points[i].toArray() );
    }

    // brings objects above of the target_path
    for(i = 1; i < sels.length; i++){
        sels[i].move( target_path, ElementPlacement.PLACEBEFORE );
    }

    // sometimes the selection state changes after execution.
    // I don't know why it happens. fixes it anyway.
    activeDocument.selection = sels;
}

// -----------------------------------------------
function moveToPoint(obj, p1, p2){
    obj.translate( p2[0] - p1[0], p2[1] - p1[1],
                   true, true, true, true);
}

// -----------------------------------------------
function getCenter(p){
    return [p.left + p.width / 2,
            p.top - p.height / 2];
}

// -----------------------------------------------
function getPointsForDistribution( path, d ){ // path:PathItem, d:desired length
    var p = path.pathPoints;
    var spec = { pnts:[], d:d, ini_d:0 };
    
    for(var i=0; i < p.length; i++){
        var next_idx = parseIdx(p, i + 1);
        if( next_idx < 0 ) break;

        var cv = new Curve(path, i, next_idx);

        cv.getEquallySpacedPoints( spec );
    }
    return spec.pnts;
}

// -----------------------------------------------
var Point = function(){
    this.x = 0;
    this.y = 0;
}
Point.prototype = {
    set : function(x, y){
        this.x = x;
        this.y = y;
        return this;
    },
    setr : function(xy){ // set with an array
        this.x = xy[0];
        this.y = xy[1];
        return this;
    },
    setp : function(p){ // set with a Point
        this.x = p.x;
        this.y = p.y;
        return this;
    },
    addp : function(p){
        return new Point().set( this.x + p.x, this.y + p.y );
    },
    subp : function(p){
        return new Point().set( this.x - p.x, this.y - p.y );
    },
    mul : function(m){
        return new Point().set( this.x * m, this.y * m );
    },
    rotate : function(rad){
        var s = Math.sin(rad);
        var c = Math.cos(rad);
        return new Point().set( this.x * c - this.y * s, this.x * s + this.y * c );
    },
    getAngle : function(){
        return Math.atan2( this.y, this.x ); // radian
    },
    normalize : function(){
        var d = Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
        var p = new Point();
        if( d == 0 ){
            p.set(0,0);
        } else {
            p.set(this.x / d, this.y / d);
        }
        return p;
    },
    toArray : function(){
        return [this.x, this.y];
    }
}

// -----------------------------------------------
var Curve = function(path, idx1, idx2){
    var pts = path.pathPoints;
    
    this.p1 = new Point().setr(pts[idx1].anchor);
    this.rdir = new Point().setr(pts[idx1].rightDirection);
    this.ldir = new Point().setr(pts[idx2].leftDirection);
    this.p2 = new Point().setr(pts[idx2].anchor);
    
    this.q = [this.p1, this.rdir, this.ldir, this.p2];
    this.params = null;
    this.length = null;
}
Curve.prototype = {
    bezier : function(t){
        var u = 1 - t;
        return new Point().set(
            u*u*u * this.p1.x + 3*u*t*(u* this.rdir.x + t* this.ldir.x) + t*t*t * this.p2.x,
            u*u*u * this.p1.y + 3*u*t*(u* this.rdir.y + t* this.ldir.y) + t*t*t * this.p2.y);
    },
    setParams : function(){
        var m = [this.p2.x - this.p1.x + 3 * (this.rdir.x - this.ldir.x),
                 this.p1.x - 2 * this.rdir.x + this.ldir.x,
                 this.rdir.x - this.p1.x];
        var n = [this.p2.y - this.p1.y + 3 * (this.rdir.y - this.ldir.y),
                 this.p1.y - 2 * this.rdir.y + this.ldir.y,
                 this.rdir.y - this.p1.y];
        
        this.params = [ m[0] * m[0] + n[0] * n[0],
                        4 * (m[0] * m[1] + n[0] * n[1]),
                        2 * ((m[0] * m[2] + n[0] * n[2]) + 2 * (m[1] * m[1] + n[1] * n[1])),
                        4 * (m[1] * m[2] + n[1] * n[2]),
                        m[2] * m[2] + n[2] * n[2]];
    },
    getLength : function(t){
        //if( !this.params ) this.setParams();
        var k = this.params;
    
        var h = t / 128;
        var hh = h * 2;
        
        var fc = function(t, k){
            return Math.sqrt(t * (t * (t * (t * k[0] + k[1]) + k[2]) + k[3]) + k[4]) || 0 };
        
        var total = (fc(0, k) - fc(t, k)) / 2;
        
        for(var i = h; i < t; i += hh){
            total += 2 * fc(i, k) + fc(i + h, k);
        }
        
        return total * hh;
    },
    getTforLength : function(len){
        //if( !this.params ) this.setParams();
        var k = this.params;

        //if( !this.length) this.length = this.getLength(1);
        if(len <= 0){
            return 0;
        } else if(len > this.length){
            return -1;
        }
        
        var t, d;
        var t0 = 0;
        var t1 = 1;
        var torelance = 0.001;
        
        for(var h = 1; h < 30; h++){
            t = t0 + (t1 - t0) / 2;
            d = len - this.getLength(t);
            
            if(Math.abs(d) < torelance) break;
            else if(d < 0) t1 = t;
            else t0 = t;
        }
        
        return Math.min(1, t);
    },
    getEquallySpacedPoints : function( spec ){
        // spec = { pnts:pnts, d:d, ini_d:0 }
        if( !this.params ) this.setParams();
        if( !this.length ) this.length = this.getLength(1);

        var total_d = spec.ini_d;
        var t;
        
        if( total_d < this.length ){
            while( 1 ){
                t = this.getTforLength( total_d );
                if( t < 0 ) break;
                spec.pnts.push( this.bezier(t) );
                total_d += spec.d;
            }
            spec.ini_d = total_d - this.length;
        } else {
            spec.ini_d -= this.length;
        }
    }
}

// ----------------------------------------------
// return the index of pathpoint. when the argument is out of bounds,
// fixes it if the path is closed (ex. next of last index is 0),
// or return -1 if the path is not closed.
function parseIdx(p, n){ // PathPoints, number for index
  var len = p.length;
  if( p.parent.closed ){
    return n >= 0 ? n % len : len - Math.abs(n % len);
  } else {
    return (n < 0 || n > len - 1) ? -1 : n;
  }
}
// ----------------------------------------------
function extractGroup( s, r ){
    if( r == undefined ) r = [];
    
    for( var i = 0; i < s.length; i++){
        if( s[i].typename == "GroupItem" ){
            extractGroup( s[i].pageItems, r );
        } else {
            r.push( s[i] );
        }
    }
    
    return r;
}
main();
