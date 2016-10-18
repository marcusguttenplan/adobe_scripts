//DESCRIPTION:Fill shape with packed circles
// A Jongware Script 2-Oct-2010

// Select any outlined object. Text should be
// converted to outlines first.
// Run the script, and it'll fill its outline
// with circles.

if (app.documents.length == 0 || app.selection.length != 1 || !(app.selection[0].constructor.name=="PathItem" || app.selection[0].constructor.name=="CompoundPathItem"))
	alert ("Fill shape with packed circles\r\r"+
			"Select any single outlined object. Text should be\r"+
			"converted to outlines first.\r"+
			"Run the script, and it'll fill the outline\r"+
			"with circles.");
else
{
	swatchGroupList = [ "Black", "White", "Gray", "Red", "Yellow", "Green", "Blue", "-" ];
	for (s=0; s<app.activeDocument.swatchGroups.length; s++)
	{
		if (app.activeDocument.swatchGroups[s].name == '')
			swatchGroupList.push ("[Base swatches]");
		else
			swatchGroupList.push ("["+app.activeDocument.swatchGroups[s].name+"]");
	}
	
	optionsDlg = new Window('dialog', 'Circle Fill');
	optionsDlg.orientation = 'column';
	optionsDlg.alignment = 'right';
	optionsDlg.add('statictext', undefined, "A Jongware Script 13-Sep-2010");
	
	with (optionsDlg.add('group'))
	{
		orientation = 'row';
		add('statictext', undefined, "Max size");
		Ptsz = add('edittext', undefined, "20");
		Ptsz.characters = 6;
		add('statictext', undefined, "% of total size");
	}
	with (optionsDlg.add('group'))
	{
		orientation = 'row';
		add('statictext', undefined, "Min size");
		Ptmsz = add('edittext', undefined, "5");
		Ptmsz.characters = 6;
		add('statictext', undefined, "% of total size");
	}
	with (optionsDlg.add('group'))
	{
		orientation = 'row';
		add('statictext', undefined, "Colors");
		var optionsDdL = add('dropdownlist', undefined, swatchGroupList);
		optionsDdL.selection = 0;
	}
	with (optionsDlg.add('group'))
	{
		orientation = 'row';
		add('button', undefined, "OK");
		add('button', undefined, "Cancel");
	}
	
	if (optionsDlg.show() == 1)
	{
		swatchSet = optionsDdL.selection.index;
		maxCircleSize = Number(Ptsz.text)/100;
		if (maxCircleSize < 0.01 || maxCircleSize > 1)
		{
			maxCircleSize = 0.2;
		}
		minCircleSize = Number(Ptmsz.text)/100;
		if (minCircleSize < 0.01 || minCircleSize > maxCircleSize)
		{
			minCircleSize = maxCircleSize/2;
		}

		object = app.selection[0];
	
		red = new RGBColor();
		red.red = 255;
		red.green = 0;
		red.blue = 0;
		
		black = new GrayColor;
		black.gray = 100;
		gray = new GrayColor;
		gray.gray = 50;
		white = new GrayColor;
		white.gray = 0;
	
	//	Convert curved lines to straight ones.
		innerpaths = [];
		entirePath = null;
		if (object.constructor.name == "CompoundPathItem")
		{
			for (p=0; p<object.pathItems.length; p++)
			{
				if (object.pathItems[p].polarity == PolarityValues.POSITIVE)
					entirePath = flattenPath (object.pathItems[p]);
				else
					innerpaths.push (flattenPath (object.pathItems[p]));
			}
			if (innerpaths.length == 1 && entirePath == null)
			{
				entirePath = innerpaths[0];
				innerpaths = [];
			}
		} else
			entirePath = flattenPath (object);

		if (entirePath == null)
		{
			alert ("Got a bad path. What's going on?");
		} else
		{
			minx = object.geometricBounds[0];
			miny = object.geometricBounds[1];
	
			maxx = object.geometricBounds[2];
			maxy = object.geometricBounds[3];
	
			if (minx > maxx)
			{
				x = minx;
				minx = maxx;
				maxx = x;
			}
			if (miny > maxy)
			{
				y = miny;
				miny = maxy;
				maxy = y;
			}
			maxwide = maxx - minx;
			maxhigh = maxy - miny;
	
			totalArea = Math.abs(object.area);
			filledArea = 0;
	
	/*		r = 1;
			for (p=0; p<entirePath.length; p++)
			{
				app.activeDocument.pathItems.ellipse (entirePath[p][1]+r,entirePath[p][0]-r,2*r,2*r);
				r++;
			} */
	
			Math_Epsilon = 0.0001;
			triangleIndexList = Triangulate (entirePath);
			triangleList = [];
			
			for (p=0; p<triangleIndexList.length; p+=3)
			{
				triangleList.push (
					[	entirePath[triangleIndexList[p]],
						entirePath[triangleIndexList[p+1]],
						entirePath[triangleIndexList[p+2]] ] );
	
			}
	
		/*	// Draw the triangle list
			for (p=0; p<triangleList.length; p++)
			{
				app.activeDocument.pathItems.add().setEntirePath (
					[ triangleList[p][0], triangleList[p][1],
					triangleList[p][1], triangleList[p][2],
					triangleList[p][2], triangleList[p][0] ] );
			} */
	
			areaList = [];
			triArea = 0;
			for (p=0; p<triangleList.length; p++)
			{
				triArea += Math.abs ( Area ( [
					triangleList[p][0], triangleList[p][1],
					triangleList[p][1], triangleList[p][2],
					triangleList[p][2], triangleList[p][0] ] ) );
				areaList.push (triArea);
			}
	
			pointList = [];
			circleList = [];
			radiiList = [ ];
			maxsize = Math.sqrt(maxwide * maxhigh);
			size = maxCircleSize;
			while (1)
			{
				radiiList.push (size*maxsize);
				size *= .667;
				if (size < minCircleSize)
					break;
			}
			for (rad=0; rad<radiiList.length; rad++)
			{
				for (p=0; p<1000; p++)
				{
					a_rnd = Math.random() * triArea;
					for (q=0; q<triangleList.length; q++)
						if (areaList[q] > a_rnd)
							break;
				
					pt = getRandomPoint (triangleList[q]);
					for (ii=0; ii<innerpaths.length; ii++)
						if (pointInsidePoly (pt, innerpaths[ii]))
							break;
					if (ii<innerpaths.length)
						continue;
					d = distanceToClosestEdge (pt, entirePath);
					if (d >= radiiList[rad])
					{
						for (ii=0; ii<innerpaths.length; ii++)
						{
							d = distanceToClosestEdge (pt, innerpaths[ii]);
							if (d < radiiList[rad])
								break;
						}
						if (ii == innerpaths.length)
						{
							for (c=0; c<pointList.length; c++)
							{
								xd = Math.abs (pt[0]-pointList[c][0]);
								yd = Math.abs (pt[1]-pointList[c][1]);
								if (xd <= radiiList[rad]+circleList[c] &&
									yd <= radiiList[rad]+circleList[c])
								{
									d = distanceFromPointToPoint (pt, pointList[c])
									if (d < radiiList[rad]+circleList[c])
										break;
								}
							}
							if (c == pointList.length)
							{
								nrad = radiiList[rad];
								pointList.push ( pt );
								circleList.push (nrad);
							}
						}
					} 
				}
			}
	
			for (p=0; p<pointList.length; p++)
			{
				pt = pointList[p];
				nrad = distanceToClosestEdge (pt, entirePath);
				for (ii=0; ii<innerpaths.length; ii++)
				{
					d = distanceToClosestEdge (pt, innerpaths[ii]);
					if (d < nrad)
						nrad = d;
				}
				for (c=0; c<pointList.length; c++)
				{
					if (c == p)
						continue;
					xd = Math.abs (pt[0]-pointList[c][0]);
					yd = Math.abs (pt[1]-pointList[c][1]);
					if (xd <= nrad+circleList[c] &&
						yd <= nrad+circleList[c])
					{
						nd = distanceFromPointToPoint (pt, pointList[c])-circleList[c];
						if (nd < nrad)
							nrad = nd;
					}
				}
				circleList[p] = nrad;
				e = app.activeDocument.pathItems.ellipse (pt[1]+nrad,pt[0]-nrad,2*nrad,2*nrad);
				e.strokeWidth = 0;
				e.strokeColor = NoColor;
				e.fillColor = randomSwatch (swatchSet);
			}
		}
	}
}

function randomSwatch (swatchOrSet)
{
	var allSwatches;
	var color;

	if (swatchOrSet < 8)
	{
		switch (swatchOrSet)
		{
			case 0:	// Black
				return black;
			case 1:	// White
				return white;
			case 2:	// Gray
				return gray;
			case 3:	// Red
				color = new RGBColor();
				color.red = 255;
				break;
			case 4:	// Yellow
				color = new RGBColor();
				color.red = 255;
				color.green = 255;
				break;
			case 5:	// Green
				color = new RGBColor();
				color.green = 255;
				break;
			case 6:	// Blue
				color = new RGBColor();
				color.blue = 255;
				break;
		}
		return color;
	}
	if (swatchOrSet == 8)
		var allSwatches = app.activeDocument.swatches;
	else
		var allSwatches = app.activeDocument.swatchGroups[swatchOrSet-8].getAllSwatches();

	return allSwatches[Math.floor(Math.random()*allSwatches.length)].color;
}

function drawLine (a,b)
{
	var p = app.activeDocument.pathItems.add();
	try {
		p.setEntirePath ([ a,b ]);
		p.strokeWidth = 0.1;
	} catch (e)
	{
		alert ("Bad line:\ra="+a+"\rb="+b);
	}
	return p;
}

function distanceFromPointToPoint (A, B)
{
	return Math.sqrt ( ((A[0]-B[0]) * (A[0]-B[0])) + ((A[1]-B[1]) * (A[1]-B[1])) );
}

function flattenPath (obj)
{
	var newpath = new Array();
	var curveList;
	var pt, nextpt;
	var isFlattened = false;

	if (!obj.hasOwnProperty ("pathPoints"))
		return null;

	for (pt=0; pt<obj.pathPoints.length; pt++)
	{
		nextpt = pt+1;
		if (nextpt == obj.pathPoints.length)
			nextpt = 0;
		if (obj.pathPoints[pt].anchor[0] == obj.pathPoints[pt].rightDirection[0] && obj.pathPoints[pt].anchor[1] == obj.pathPoints[pt].rightDirection[1] &&
			obj.pathPoints[nextpt].anchor[0] == obj.pathPoints[nextpt].leftDirection[0] && obj.pathPoints[nextpt].anchor[1] == obj.pathPoints[nextpt].leftDirection[1])
		{
			newpath.push (obj.pathPoints[pt].anchor);
		} else
		{
			isFlattened = true;
			curveList = curve4 (obj.pathPoints[pt].anchor[0],obj.pathPoints[pt].anchor[1],
					obj.pathPoints[pt].rightDirection[0],obj.pathPoints[pt].rightDirection[1],
					obj.pathPoints[nextpt].leftDirection[0],obj.pathPoints[nextpt].leftDirection[1],
					obj.pathPoints[nextpt].anchor[0],obj.pathPoints[nextpt].anchor[1],
				4);
			newpath = newpath.concat (curveList);
		}
	}
//	Make path round
//	newpath.push (newpath[0]);
	return newpath;
}


// As found on http://jsfromhell.com/math/is-point-in-poly
// No idea what this all means :-) [fortunately, I don't have to!]
function pointInsidePoly(pt, poly)
{
    for(var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i)
        ((poly[i][1] <= pt[1] && pt[1] < poly[j][1]) || (poly[j][1] <= pt[1] && pt[1] < poly[i][1]))
        && (pt[0] < (poly[j][0] - poly[i][0]) * (pt[1] - poly[i][1]) / (poly[j][1] - poly[i][1]) + poly[i][0])
        && (c = !c);

    return c;
}

function getWinding (path)
{
//    Return area of a simple (ie. non-self-intersecting) polygon.
//    Will be negative for counterclockwise winding.
	var i,next;
    var accum = 0;
    for (i=0; i<path.length-1; i++)
    {
    	next = i+1;
        accum += path[next][0] * path[i][1] - path[i][0] * path[next][1];
    }
    next = 0;
	accum += path[next][0] * path[i][1] - path[i][0] * path[next][1];
    return accum / 2;
}

// Code adapted from Maxim Shemanarev's AntiGrain
//	http://www.antigrain.com/research/bezier_interpolation/

function curve4(x1, y1,   //Anchor1
            x2, y2,   //Control1
            x3, y3,   //Control2
            x4, y4,   //Anchor2
            nSteps   // Flattening value
		)
{
	var pointList = new Array();
    var dx1 = x2 - x1;
    var dy1 = y2 - y1;
    var dx2 = x3 - x2;
    var dy2 = y3 - y2;
    var dx3 = x4 - x3;
    var dy3 = y4 - y3;

    var subdiv_step  = 1.0 / (nSteps + 1);
    var subdiv_step2 = subdiv_step*subdiv_step;
    var subdiv_step3 = subdiv_step*subdiv_step*subdiv_step;

    var pre1 = 3.0 * subdiv_step;
    var pre2 = 3.0 * subdiv_step2;
    var pre4 = 6.0 * subdiv_step2;
    var pre5 = 6.0 * subdiv_step3;

    var tmp1x = x1 - x2 * 2.0 + x3;
    var tmp1y = y1 - y2 * 2.0 + y3;

    var tmp2x = (x2 - x3)*3.0 - x1 + x4;
    var tmp2y = (y2 - y3)*3.0 - y1 + y4;

    var fx = x1;
    var fy = y1;

    var dfx = (x2 - x1)*pre1 + tmp1x*pre2 + tmp2x*subdiv_step3;
    var dfy = (y2 - y1)*pre1 + tmp1y*pre2 + tmp2y*subdiv_step3;

    var ddfx = tmp1x*pre4 + tmp2x*pre5;
    var ddfy = tmp1y*pre4 + tmp2y*pre5;

    var dddfx = tmp2x*pre5;
    var dddfy = tmp2y*pre5;

    var step = nSteps;

	pointList.push ([x1, y1]);	// Start Here
    while(step--)
    {
        fx   += dfx;
        fy   += dfy;
        dfx  += ddfx;
        dfy  += ddfy;
        ddfx += dddfx;
        ddfy += dddfy;
        pointList.push ([fx, fy]);
    }
//    pointList.push ([x4, y4]); // Last step must go exactly to x4, y4
    return pointList;
}


// Javascript version of
// http://www.unifycommunity.com/wiki/index.php?title=Triangulator
//	by runevision

function Triangulate (m_points)
{
	var indices = new Array();
	
	var n = m_points.length;
	if (n < 3)
		return indices;

	var V = new Array(n);
	if (Area(m_points) > 0)
	{
		for (var v = 0; v < n; v++)
			V[v] = v;
	} else
	{
		for (var v = 0; v < n; v++)
			V[v] = (n - 1) - v;
	}

	
	var nv = n;
	var count = 2 * nv;
	for (var m = 0, v = nv - 1; nv > 2; )
	{
		if ((count--) <= 0)
			return indices;
		
		var u = v;
		if (nv <= u)
			u = 0;
		v = u + 1;
		if (nv <= v)
			v = 0;
		var w = v + 1;
		if (nv <= w)
			w = 0;
		
		if (Snip(u, v, w, nv, V, m_points))
		{
			var a, b, c, s, t;
			a = V[u];
			b = V[v];
			c = V[w];
			indices.push(a);
			indices.push(b);
			indices.push(c);
			m++;
			for (s = v, t = v + 1; t < nv; s++, t++)
				V[s] = V[t];
			nv--;
			count = 2 * nv;
		}
	}
	
	indices.reverse();
	return indices;
}

function Area (m_points)
{
	var n = m_points.length;
	var A = 0.0;
	for (var p = n - 1, q = 0; q < n; p = q++)
	{
		var pval = m_points[p];
		var qval = m_points[q];
		A += pval[0] * qval[1] - qval[0] * pval[1];
	}
	return (A * 0.5);
}

function Snip (u, v, w, n, V, m_points)
{
	var p;
	var A = m_points[V[u]];
	var B = m_points[V[v]];
	var C = m_points[V[w]];
	if (Math_Epsilon > (((B[0] - A[0]) * (C[1] - A[1])) - ((B[1] - A[1]) * (C[0] - A[0]))))
		return false;
	for (p = 0; p < n; p++) {
		if ((p == u) || (p == v) || (p == w))
			continue;
		var P = m_points[V[p]];
		if (InsideTriangle(A, B, C, P))
			return false;
	}
	return true;
}

function InsideTriangle (A, B, C, P)
{
	var ax, ay, bx, by, cx, cy, apx, apy, bpx, bpy, cpx, cpy;
	var cCROSSap, bCROSScp, aCROSSbp;
	
	ax = C[0] - B[0]; ay = C[1] - B[1];
	bx = A[0] - C[0]; by = A[1] - C[1];
	cx = B[0] - A[0]; cy = B[1] - A[1];
	apx = P[0] - A[0]; apy = P[1] - A[1];
	bpx = P[0] - B[0]; bpy = P[1] - B[1];
	cpx = P[0] - C[0]; cpy = P[1] - C[1];
	
	aCROSSbp = ax * bpy - ay * bpx;
	cCROSSap = cx * apy - cy * apx;
	bCROSScp = bx * cpy - by * cpx;
	
	return ((aCROSSbp >= 0.0) && (bCROSScp >= 0.0) && (cCROSSap >= 0.0));
}


/*	For later use:
	Random Point In Triangle
	One way to choose a random point in a triangle is based on
	Barycentric_Coordinates. Let A, B, C be the three vertices of your
	triangle. Any point P inside can be expressed uniquely as P = aA +
	bB + cC, where a+b+c=1 and a,b,c are each >= 0. Knowing a and b
	permits you to calculate c=1-a-b. So if you can generate two random
	numbers a and b, each in [0,1], such that their sum <= 1, you've got
	a random point in your triangle. One way to do this is to generate
	random a and b independently and uniformly in [0,1] (just divide the
	standard C rand() by its max value to get such a random number.) If
	a+b>1, replace a by 1-a, b by 1-b. Let c=1-a-b. Then aA + bB + cC is
	uniformly distributed in triangle ABC: the reflection step a=1-a;
	b=1-b gives a point (a,b) uniformly distributed in the triangle
	(0,0)(1,0)(0,1), which is then mapped affinely to ABC. Now you have
	barycentric coordinates a,b,c. Compute your point P = aA + bB + cC.
	[wikipedia]
*/
function plotRandomPoint (triangle)
{
	var Ax,Ay,Bx,By,Cx,Cy, a,b,c, Px,Py;

	Ax = triangle[0][0];
	Ay = triangle[0][1];
	Bx = triangle[1][0];
	By = triangle[1][1];
	Cx = triangle[2][0];
	Cy = triangle[2][1];

	a = Math.random();
	b = Math.random()*(1-a);
	c = 1-a-b;
	Px = a*Ax + b*Bx + c*Cx;
	Py = a*Ay + b*By + c*Cy;

	app.activeDocument.pathItems.ellipse (Py+1,Px-1,2,2);
}

function getRandomPoint (triangle)
{
	var Ax,Ay,Bx,By,Cx,Cy, a,b,c, Px,Py;

	Ax = triangle[0][0];
	Ay = triangle[0][1];
	Bx = triangle[1][0];
	By = triangle[1][1];
	Cx = triangle[2][0];
	Cy = triangle[2][1];

	do
	{
		a = Math.random();
		b = Math.random();
	} while (a + b >= 1);
/*	if (a+b >= 1)
	{
		a = 1 - a;
		b = 1 - b;
	} */
	c = 1-a-b;
	Px = a*Ax + b*Bx + c*Cx;
	Py = a*Ay + b*By + c*Cy;

	return [Px,Py];
}


function getCircleThru (v1, v2, v3)
{
	var x1 = v1[0]; var y1 = v1[1];
	var x2 = v2[0]; var y2 = v2[1];
	var x3 = v3[0]; var y3 = v3[1];

	var s = 0.5*((x2 - x3)*(x1 - x3) - (y2 - y3)*(y3 - y1));
	var sUnder = (x1 - x2)*(y3 - y1) - (y2 - y1)*(x1 - x3);
	
	if (Math.abs(sUnder) < 0.001)
		return null; //insufficient data to calculate center
	
	s /= sUnder;
	
	var xc = 0.5*(x1 + x2) + s*(y2 - y1); // center x coordinate
	var yc = 0.5*(y1 + y2) + s*(x1 - x2); // center y coordinate

	var radius = Math.sqrt((xc-x1)*(xc-x1)+(yc-y1)*(yc-y1));
	
	return [ xc, yc, radius ];
}

function distanceToClosestEdge (pt, edgelist)
{
	var d;
	var p, d2;
	
	d = ClosestPointOnLine (pt, [ edgelist[0], edgelist[edgelist.length-1] ]);
	d = d[1];
	for (p=0; p<edgelist.length-1; p++)
	{
		d2 = ClosestPointOnLine (pt, [ edgelist[p], edgelist[p+1] ]);
		if (d2[1] < d)
			d = d2[1];
	}
	return d;
}

//Compute the distance from segment Line to Pt
function ClosestPointOnLine (pt, line)
{
	var X1 = line[0][0], Y1 = line[0][1];
	var X2 = line[1][0], Y2 = line[1][1];
	var px = pt[0], py = pt[1];

	var dx = X2 - X1;
	var dy = Y2 - Y1;
	
	var nx,ny;

	if (dx == 0 && dy == 0)
	{
		// It's a point not a line segment.
		// dx = px - X1
		// dy = py - Y1
		// distance = Sqr(dx * dx + dy * dy)
		nx = X1;
		ny = Y1;
	} else
	{
		// Calculate the t that minimizes the distance.
		var t = ((px - X1) * dx + (py - Y1) * dy) / (dx * dx + dy * dy);
		
		// See if this represents one of the segment's
		// end points or a point in the middle.
		if (t <= 0)
		{
			nx = X1;
			ny = Y1;
		} else if (t >= 1)
		{
			nx = X2;
			ny = Y2;
		} else
		{
			nx = X1 + t * dx;
			ny = Y1 + t * dy;
		}
	}

	dx = px - nx;
	dy = py - ny;

	return [ [nx, ny], Math.sqrt (dx * dx + dy * dy) ];
}

function point (arr)
{
	this.x = arr[0];
	this.y = arr[1];
	this.distance = function (pt) { return Math.sqrt ( (this.x-pt.x)*(this.x-pt.x) + (this.y-pt.y)*(this.y-pt.y) ) };
}
