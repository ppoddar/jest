/**
 * Calculates position of a set of connected rectangles relative to a bounding box.
 * <p>
 * Each rectangle is specified in terms of immutable width and height. 
 * The rectangle are connected. The connection between rectangle can
 * be of different categories.
 * <p>
 * The task is to calculate top-left position of the rectangles  such that 
 *   i) no two rectangles overlap 
 *  ii) all rectangles remain within the bounding box 
 * iii) the total manhattan distance of the links is minimum 
 *  iv) the spring compression and expansion forces are minimum (see below)
 *
 * 
 * <p>
 * Each pair of rectangle is assumed to be connected with <em>springs</em> --
 * horizontal and vertical. Each spring has a <em>natural length</em>.
 * If the actual distance between two rectangle is longer than
 * <em>natural length</em> of the spring connecting them, then the spring
 * pulls the rectangle closer. Otherwise, the spring pushes them apart.
 * <p>
 * The force-directed algorithm computes spring force on each rectangle exerted by
 * other rectangle. A spring force is exerted even among rectangle that are not linked.
 * The forces cause the rectangle to move unless the movement makes them overlap or
 * cross the bounding box. <br>
 * The force-directed algorithm is applied multiple steps, in each step reducing
 * the force multiplier by a damping factor.
 * 
 * 
 * 
 * 
 */
function Placement() {

}

/**
 * Calculate top-left position of each given rectangle.
 * 
 * @param boxes
 *            an array of rectangle with at least width and height.
 * @param link
 *            an array of links. A link has source and target indices that refer
 *            to index of the rectangle in the first argument array.
 * @param bb
 *            bounding box with width and height. The top-left of a box position
 *            is w.r.t. the bounding box. No box will be placed outside
 *            the bounding box.
 * 
 */
Placement.prototype.runPlacementAlgorithm = function(boxes, links, bb, params) {
	var N = params['initialization-steps'];
	if (N < 0)
		N = 1;
	var minCost = Number.MAX_VALUE;
	var optimalPlacement = null;

	// consider bounding box to be the origin w.r.t boxes are positioned
	bb.x = 0; bb.y = 0;
	for ( var i = 0; i < N; i++) {
		this.assignInitialPosition(boxes, bb);
		var cost = this.calculateCost(boxes, links);
		if (cost < minCost) {
			minCost = cost;
			optimalPlacement = boxes.slice();
			optimalPlacement.forEach(function(box) {
				box.applyChanges();
			});
		}
	}

	var M = params['simulation-steps'];
	for ( var i = 0; i < M; i++) {

	}
	return optimalPlacement;
};

/**
 * Calculate cost of the given rectangle placements.
 * 
 * @param boxes
 *            array of rectangle with top-left coordinate
 * @param links
 *            array of link between them
 */
Placement.prototype.calculateCost = function(boxes, links) {
	var cost = 0;
	for ( var i = 0; links && i < links.length; i++) {
		var source = boxes[links[i].source];
		var target = boxes[links[i].target];
		cost += source.distance(target, true);// consider changes
	}
	return cost;
};

/**
 * Assigns initial position of given set of boxes within given bounding box.
 * Initially, a box is placed randomly in the bounding box region. The rest of
 * the bounding box region is broken into 8 rectangles. The next box is placed
 * in one of those regions. The process repeats for each boxes.
 * 
 * @param e
 *            array of boxes to be placed. Each box must have width, height set
 * 
 * @param bb
 *            a bounding box such that no box after positioning will be outside
 *            the box
 * 
 * @return the input boxes with (x,y) set to the suggested position.
 */
Placement.prototype.assignInitialPosition = function(boxes, bb) {
	var emptyRegions = [ bb ];
	for ( var i = 0; i < boxes.length; i++) {
		var box = boxes[i];
		var emptyRegion = this.findEmptyRegion(emptyRegions, box);
		if (!emptyRegion) {
			throw  { message : "no suitable region found for box " + box };
			
		}
		var newRegions = this.assignRegion(box, emptyRegion);

		// remove the box that got filled
		var k = emptyRegions.indexOf(emptyRegion);
		emptyRegions.splice(k, 1);
		// add the returned new boxes
		emptyRegions = emptyRegions.concat(newRegions);
	}
};

/**
 * places given box into an empty region. Once the box occupies a position, the
 * rest of the region is rectangularized to find 8 other empty regions. These
 * empty regions are returned.
 * 
 * The displacement is tentative. The changes in position is held in the box but
 * is not applied to its positions.
 * 
 * @param region
 *            the empty region
 * @param e
 *            the box to be placed
 */
Placement.prototype.assignRegion = function(box, region) {
	if (!region.isLarger(box))
		throw {
			message : 'enclosing region ' + box + ' is not larger than ' + box
		};
	var x = Math.random() * (region.w - box.w);
	var y = Math.random() * (region.h - box.h);

	box.dx = region.x + x - box.x;
	box.dy = region.y + y - box.y;

	var emptyRegions = [];
	// -----------------------------------------------------------------
	// x y w h
	// -----------------------------------------------------------------
	// first row: boxes have same y and height
	emptyRegions.push(new Box(region.x, region.y, x, y));
	emptyRegions.push(new Box(region.x + x, region.y, box.w, y));
	emptyRegions.push(new Box(region.x + x + box.w, region.y, region.w - x
			- box.w, y));
	// middle row: boxes have same y and height
	emptyRegions.push(new Box(region.x, region.y + y, x, box.h));
	emptyRegions.push(new Box(region.x + x + box.w, region.y + y, region.w - x
			- box.w, box.h));
	// middle row: boxes have same y and height
	emptyRegions.push(new Box(region.x, region.y + y + box.h, x, region.h - y
			- box.h));
	emptyRegions.push(new Box(region.x + x, region.y + y + box.h, box.w,
			region.h - y - box.h));
	emptyRegions.push(new Box(region.x + x + box.w, region.y + y + box.h,
			region.w - x - box.w, region.h - y - box.h));

	return emptyRegions;
};

/**
 * finds a box among the given regions which can fit the given box.
 * 
 */
Placement.prototype.findEmptyRegion = function(emptyRegions, e) {
	for ( var i = 0; i < emptyRegions.length; i++) {
		if (emptyRegions[i].isLarger(e))
			return emptyRegions[i];
	}
	return null;
};

/**
 * Calculates top-left position of boxes connected by spring.
 * 
 * @param boxes
 * @param links
 * @return
 */
Placement.prototype.calculateForceDirectedPosition = function(boxes, links,
		params) {
	links.forEach(function(link) {
		accumulatePositionChange(boxes[link.source], boxes[link.target],
				link.type, params);
	});

	// calculate spring force across every pair of boxes even if
	// they are not linked.
	for ( var i = 0, l = boxes.length; i < l; i++) {
		for ( var j = i + 1; j < l; j++) {
			accumulatePositionChange(boxes[i], boxes[j], null, params);
		}
	}

	// apply accumulated changes
	for ( var i = 0, l = boxes.length; i < l; i++) {
		move(boxes[i], params);
	}
};

Placement.prototype.move = function(box, params) {
	var m = 1.0;// Math.sqrt(box.area());
	var dampingConstant = params['damping'];
	var boundingBox = params['bounding-box'];

	var dx = dampingConstant * box.dx / mass;
	var dy = dampingConstant * box.dy / mass;

	var newBox = new Box(box.x + dx, box.y + dy, box.w, box.h);

	if (newBox.inside(boundingBox)) {
		box.x = newBox.x;
		box.y = newBox.y;
	}
	console.log('after change: ' + box);
};

/**
 * calculate spring force between the boxes and accumulate the displacement
 * 
 * @param e1
 * @param e2
 * @param linkType
 * @param params
 * @return
 */
Placement.prototype.accumulatePositionChange = function(e1, e2, linkType,
		params) {
	var fx = calculateSpringForce(e1, e2, linkType, params, X_AXIS);
	applySpringForce(e1, e2, fx, X_AXIS);
	var fy = calculateSpringForce(e1, e2, linkType, params, Y_AXIS);
	applySpringForce(e1, e2, fy, Y_AXIS);

};

Placement.prototype.clearChanges = function(entities, params) {
	var dampingFactor = params['damping-factor'];
	var damping = params['damping'] * dampingFactor;
	params['damping'] = damping;

	for ( var i = 0, l = entities.length; i < l; i++) {
		entities[i].dx = 0;
		entities[i].dy = 0;
	}
};

/**
 * 
 * //randomizePosition(entities, modelDiv.offsetWidth, modelDiv.offsetHeight);
 * 
 * var params = {}; params['simulation-steps'] =
 * this.options['simulation-steps']; params['spring-constants'] =
 * this.options['spring-constants']; params['damping-factor'] =
 * this.options['damping-factor']; params['bounding-box'] =
 * canvas.getBoundingClientRect(); params['daming-constant'] = 1.0; for ( var i =
 * 0; i < 0; i++) {
 * 
 * //for ( var i = 0; i < params['simulation-steps']; i++) {
 * calculateForceDirectedPosition(entities, data['links'], params);
 * clearChanges(entities, params); }
 * 
 * 
 */

/**
 * 
 */
Placement.prototype.applySpringForce = function(source, target, force, dir) {
	if (dir == X_AXIS) {
		if (source.x < target.x) {
			left = source;
			right = target;
		} else {
			right = source;
			left = target;
		}
		left.dx += force;
		right.dx -= force;

	} else if (dir == Y_AXIS) {
		if (source.y < target.y) {
			lower = source;
			uppper = target;
		} else {
			uppper = source;
			lower = target;
		}
		lower.dy -= force;
		uppper.dy += force;
	} else {
		throw {
			message : 'invalid direction ' + dir
		};
	}
	;

	/**
	 * a spring force is either positive (pull) or negative (push) between two
	 * rectangles.
	 * 
	 * It is computed for x and y axis separately
	 * 
	 * @param source
	 *            source component
	 * @param target
	 *            target component
	 * @param naturalLength
	 * @param sc
	 *            sprint constant
	 * @param dir
	 *            x or y axis
	 * 
	 * @return positive (pull) or negative (push) value
	 */
	Placement.prototype.calculateSpringForce = function(source, target,
			linkType, options, dir) {
		var length = distance(source, target, dir);

		var springConstants = options['spring-constants'][linkType];
		var naturalLength = springConstants[1 + dir];
		var sc = springConstants[0];
		var dL = length - naturalLength;
		var force = dL * sc;
		return force;
	};

};

/**
 * all numebrs are inegers
 * 
 * A box may contain top-left coordinate x and y w.r.t some other origin, but
 * must have non-zero, immutable width and height.
 * 
 * A box maintains the changes top-left position as calculated by placement
 * algorithm but the changes are not applied to the position.
 * 
 * @param x
 *            left position w.r.t some other coordinate system
 * @param y
 *            top position w.r.t some other coordinate system
 * @param w
 *            width. immutable, never negative
 * @param h
 *            height. immutable, never negative
 * @return
 */
function Box(x, y, w, h) {
	if (w < 0)
		throw {
			'message' : 'invalid width ' + w
		};
	if (h < 0)
		throw {
			'message' : 'invalid height ' + h
		};
	this.x = Math.round(x);
	this.dx = 0;
	this.y = Math.round(y);
	this.dy = 0;
	this.w = Math.round(w);
	this.h = Math.round(h);
}

/**
 * Apply changes to position.
 * 
 * @returns {}
 */
Box.prototype.applyChanges = function() {
	this.x = Math.round(this.x + this.dx);
	this.y = Math.round(this.y + this.dy);
};

/**
 * Resets changes.
 * 
 * @returns {}
 */
Box.prototype.clearChanges = function() {
	this.dx = 0;
	this.dy = 0;
};

/**
 * L1 distance between top-left position of this box and another boxes.
 * 
 * @param b
 *            another box.
 * @param changes
 *            if true accumulated changes are considered without being applied
 *            to calculate the distance between top-left positions.
 * @return L1 distance
 */
Box.prototype.distance = function(b, changes) {
	return distance(b, X_AXIS, changes) + distance(b, Y_AXIS, changes);
};

/**
 * distance of given box from this box along given direction.
 * 
 * @param {Box}
 *            b the other box.
 * @param {int}
 *            dir direction is X_AXIS or Y_AXIS
 * @param {bool}
 *            changes
 * @returns {}
 */
Box.prototype.distance = function(b, dir, changes) {
	var dx1 = changes ? this.dx : 0;
	var dx2 = changes ? b.dx : 0;
	var dy1 = changes ? this.dy : 0;
	var dy2 = changes ? b.dy : 0;
	if (dir == X_AXIS) {
		return Math.abs(this.x + dx1 - b.x - dx2);
	} else if (dir == Y_AXIS) {
		return Math.abs(this.y + dy1 - b.y - dy2);
	} else {
		throw {
			message : 'wrong direction ' + dir
		};
	}
};

/**
 * affirms if this box is larger in width and height than the other.
 */
Box.prototype.isLarger = function(b) {
	return (this.w >= b.w && this.h >= b.h);
};



/**
 * Affirms if this box overlaps with other box.
 */
Box.prototype.overlaps = function(b2) {
	return b2.inside(this.x, this.y) || b2.inside(this.x, this.y + this.h)
			|| b2.inside(this.x + this.w, this.y)
			|| b2.inside(this.x + this.w, this.y + this.h);
};

/**
 * Affirms if given point (x,y) lie inside this box.
 */
Box.prototype.inside = function(x, y) {
	return x > this.x && x < this.x + this.w && y > this.y
			&& y < this.y + this.h;
};

/**
 * Affirms if this box lie completely inside the given box.
 */
Box.prototype.inside = function(b) {
	return b.inside(this.x, this.y) && b.inside(this.x, this.y + this.h)
			&& b.inside(this.x + this.w, this.y)
			&& b.inside(this.x + this.w, this.y + this.h);

};

Box.prototype.toString = function() {
	return '' + this.x + ',' + this.y + ' [' + this.w + ' x ' + this.h + ']';
};

Box.prototype.PointAt = function(dir) {
	if (dir == NORTH) return new Point(this.x+this.w/2, this.y);
	if (dir == SOUTH) return new Point(this.x+this.w/2, this.y+this.h);
	if (dir == EAST)  return new Point(this.x+this.w,   this.y + this.h/2);
	if (dir == WEST)  return new Point(this.x,          this.y + this.h/2);

};

/**
 * A point equal by value.
 */
function Point(x, y) {
	this.x = Math.round(x);
	this.y = Math.round(y);
}

Point.prototype.toString = function() {
//	return '(' + this.x + ',' + this.y + ')' + (this.inOpenSet ? 'open' : '')
//			+ (this.inClosedSet ? 'closed' : '') + " g=" + this.gScore + ' f='
//			+ this.fScore;
	
	return '(' + this.x + ',' + this.y + ')';

};
Point.prototype.equals = function(p) {
	return this.x == p.x && this.y == p.y;
};


Point.prototype.shift = function(dx,dy) {
	return new Point(this.x+dx, this.y+dy);
};


/**
 * Finds a path between two pints in a 2-D plane avoiding obstacles.
	 * @param {Point}
	 *            start location w.r.t some coordinate system X.
	 * @param {Point}
	 *            end location w.r.t some coordinate system Y.
 */
function AStar(start, goal) {
	if (start === undefined) throw {message:'undefined start point'}
	if (goal  === undefined) throw {message:'undefined end point'}
	
	var margin = 5;
	
	this.start = start;
	this.goal = goal;
	// original coordinate system point corresponding to grid origin
	this.x0 = Math.min(start.x, goal.x) - margin;;
	this.y0 = Math.min(start.y, goal.y) - margin;;
	// width and height of 'real' axis
	this.w = Math.abs(start.x - goal.x) + 2*margin;
	this.h = Math.abs(start.y - goal.y) + 2*margin;

	// Grid size is coarser than 'real' coordinate which represent each
	// pixel. 
	var SCALE_FACTOR = 5;
	this.n = Math.round(this.w/SCALE_FACTOR);
	this.m = Math.round(this.h/SCALE_FACTOR);
	this.dw = this.w/this.n;
	this.dh = this.h/this.m;
	
	

	/**
	 * Finds a path.
	 * 
	 * @parm {Box[]} obstacles
	 * @returns {Point} the end point with chain of backpointer to start point.
	 *          Or null if path is not found.
	 */
	this.findPath = function(obstacles) {
		// declare nxm grid of integer points. Each grid point represents
		// a rectangular area of dwxdh in 'real' plane. The rectangular area is
		// determined by grid size n and m. Purpose is to reduce computation
		this.grid = new Array(this.n);
		for (var i = 0; i < this.n; i++) this.grid[i] = new Array(this.m);
		for ( var i = 0; i < this.n; i++) {
			for ( var j = 0; j < this.m; j++) {
				this.grid[i][j] = new Point(this.mapGrid2X(i), this.mapGrid2Y(j));
			}
		}
		var nBlocks = obstacles ? obstacles.length : 0;
		console.log('find path start=' + start + ' goal=' + goal + ' with ' + nBlocks + ' obstacles ');
		// all points within obstacles are blocked
		var nBlocked = 0;
		for ( var i = 0; i < nBlocks; i++) {
			var obstacle = obstacles[i];
			for ( var j = 0; j < obstacle.w; j++) {
				for ( var k = 0; k < obstacle.h; k++) {
					var g = this.mapReal2Grid(obstacle.x + j, obstacle.y + k);
					// obstacles can be outside grid
					if (g === undefined) continue;
					g.blocked = true;
					nBlocked += 1;
				}
			}
		}
		console.log('Serach in ' + this.w + ' x ' + this.h + ' point grid with ' 
				+ nBlocked + ' blocked');
		var maxTrial = 1000*1000;//(w*h - nBlocked)*1000;
		var trial = 0;
		// begin with adding start point to open set, its gScore is 0
		//
		// gScore is the minumum cost of reaching a point from start
		// hCost is a heuriastic cost from a point to end point
		// fCost is sum of gCost and hCost
		var g = this.mapReal2Grid(this.start.x, this.start.y); 
		g.inOpenSet = true;
		g.gScore = 0; 
		g.fScore = g.gScore + heuristic_cost_estimate(this.start, this.goal);
		
		var current = start;
		while (this.countOpenSet() > 0 && trial < maxTrial) {
			trial += 1;
			current = this.findLowestPoint(); // 
			if (this.mapReal2Grid(current.x, current.y) === 
				this.mapReal2Grid(this.goal.x, this.goal.y)) {
				 console.log('found goal ' + current + ' after ' + trial);
				 return retrace_path(current);
			}
			current.inOpenSet   = false;
			current.inClosedSet = true;
			var neighbours = this.selectNeighbours(current);
			for ( var k = 0; k < neighbours.length; k++) {
				var neighbour = neighbours[k];
				if (neighbour.blocked || neighbour.inClosedSet) {
					continue; // Ignore the neighbor which is blocked.
				}
				// The distance from start to a neighbor
				var tentative_gScore = current.gScore
						+ distance_between(current, neighbour);
				if (!neighbour.inOpenSet) { // Discover a new point
					neighbour.inOpenSet = true;
//					console.log('added ' + neighbour + ' to openset + cuurent openset has ' +
//							this.countOpenSet() + ' nodes');
				}
				if (neighbour.gScore === undefined 
				 || neighbour.gScore < tentative_gScore) {
					// This path is the best until now. Record it!
					
					neighbour.cameFrom = current;
					neighbour.gScore = tentative_gScore;
					neighbour.fScore = neighbour.gScore
							+ heuristic_cost_estimate(neighbour, this.goal);
					}

			}
		}
		 console.log('return current ' + current + ' after ' + trial
				 + ' trials. Goal is ' + distance_between(current,goal) + ' away'
				 + ' opeset has ' + this.countOpenSet() + ' nodes');
		return retrace_path(current);
	}; // end of findPath

	var retrace_path = function(current) {
		var path = [];
		while (current !== undefined) {
			path.unshift(current);
			current = current.cameFrom;
		}
		return path;
	}
	/**
	 * an approximate distance between two pints
	 */
	var heuristic_cost_estimate = function(p1, p2) {
		return distance_between(p1, p2);
	};
	
	var distance_between = function(p1, p2) {
		return Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y);
	};

	/**
	 * neighbours of a point within a grid
	 * 
	 * point is in 'real' coordinate system
	 * the neighbours too
	 * 
	 * just make sure that the points are in grid
	 * 
	 */
	this.selectNeighbours = function(p) {
		var group = [];
		// translate into grid coordinate
		var i = this.mapX2Grid(p.x);
		var j = this.mapY2Grid(p.y);
		if (i - 1 >= 0) {
			group.push(this.grid[i - 1][j]);
		}
		if (i + 1 < this.n)
			group.push(this.grid[i + 1][j]);
			
		if (j - 1 >= 0)
			group.push(this.grid[i][j-1]);
			
		if (j + 1 < this.m)
			group.push(this.grid[i][j+1]);
			
		return group;
	};
	
	/**
	 * maps 'real' x-coordinate to integer grid coordinate 
	 */
	this.mapX2Grid = function(px) {
		return Math.round((px - this.x0)/this.dw);
	};
	
	/**
	 * maps 'real' y-coordinate to integer grid coordinate
	 */
	this.mapY2Grid = function(py) {
		return Math.round((py - this.y0)/this.dh);
	};
	
	/**
	 * maps 'real' point to grid point
	 */
	this.mapReal2Grid = function(x,y) {
		var i = this.mapX2Grid(x);
		var j = this.mapY2Grid(y);
		return (i >= 0 && i < this.n && j >= 0 && j < this.m) ? 
				this.grid[i][j] : undefined;
	};


	
	/**
	 * Returns real x-coordinate for an integer grid row index
	 */
	this.mapGrid2X = function(i) {
		return (i * this.dw) + this.x0;
	};
	
	/**
	 * Returns real y-coordinate for an integer grid column index
	 */
	this.mapGrid2Y = function(j) {
		return (j * this.dh) + this.y0;
	};
	
	this.mapGrid2Real = function(i, j) {
		return this.grid[i][j];
	};


	
	/**
	 * because of rounding some grid points are not defined.
	 * given an (i,j) index find nearest defined grid point 
	 */
	var snapToGrid = function (px, py, x0, y0, w, h, n, m, grid) {
		var i = -1, j   = -1;
		var rx = w/n; var ry = h/m;
		for (var d = -rx; i < +rx; d++) {
			i = mapX2Grid(px+d, x0, w, n);
			if (grid[i] === undefined) continue; else break;
		}
		if (grid[i] === undefined) {
			console.log('can not snap (' + px + ',' + py + ') to grid point'
					+ ' rx=' + rx + ' ry='+ ry);
		}
		for (var d = -ry; d < +ry; d++) {
			j = mapY2Grid(py+d, y0, h, m);
			if (grid[i][j] === undefined) continue; else break;
		}
		if (grid[i][j] === undefined) {
			console.log('can not snap (' + px + ',' + py + ') to grid point'
					+ ' rx=' + rx + ' ry='+ ry);
		}
		return grid[i][j];

	}
	

	/**
	 * Find the point with lowest fScore which has not been visited
	 * 
	 * @param grid
	 * @return
	 */
	this.findLowestPoint = function() {
		var min = Number.MAX_VALUE;
		var minPoint = null;
		for ( var i = 0; i < this.n; i++)
			for ( var j = 0; j < this.m; j++) {
				var p = this.grid[i][j];
				// console.log('findLowestPoint ' + p);
				if (p.inOpenSet && p.gScore < min) {
					min = p.gScore;
					minPoint = p;
				}
			}
		// console.log('found point with lowest gScore in openSet ' + minKey);
		return minPoint;
	};

	/**
	 * counts the points of the grid which are in openset
	 */
	this.countOpenSet = function() {
		var count = 0;
		for ( var i = 0; i < this.n; i++) {
			for ( var j = 0; j < this.m; j++) {
				var p = this.grid[i][j];
				if (p.inOpenSet) {
					count += 1;
				}
			}
		}
		//console.log(''+count + ' points in openset');
		return count;
	};

	/**
	 * Find index of given key in an array. Assumes equals method on item type.
	 * 
	 * @param {}
	 *            array
	 * @param {}
	 *            item
	 * @returns {int} -1 if item can not be found
	 */
	var indexOf = function(array, item) {
		for ( var i = 0, N = array.length; i < N; i++) {
			if (array[i].equals(item))
				return i;
		}
		return -1;
	};

	var arrayIncludes = function(array, item) {
		return this.indexOf(array, item) >= 0;
	};
};


function Link (s, t, type) {
	this.source = s;
	this.target = t;
	this.type = type;

};
