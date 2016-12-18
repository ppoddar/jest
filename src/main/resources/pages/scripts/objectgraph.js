/**
 * Default options
 */
const
defaults = {
	'initialization-steps' : 10, // no of steps for initial placement
	'simulation-steps' : 10, // no of steps for force-directed placement
	'damping-factor' : 0.9, // damping factor for force-directed placement
	// each link type has a spring constants and two natural length
	// for X- and Y axis.
	'spring-constants' : {
		// link-type constant natural lengths
		// X Y
		'inheritance' : [ 0.2, 0, 200 ],
		'relation' : [ 0.1, 100, 0 ],
		'none' : [ 1.0, 100, 100 ]
	}
}
var SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

const
X_AXIS = 1; // X-axis
const
Y_AXIS = 2; // Y-axis

const
NORTH = 0;
const
SOUTH = 1;
const
EAST = 2;
const
WEST = 3;

/**
 * A facility to display an object graph given an entity model. The input is an
 * object model of persistent entities. A persistent entity is described in
 * terms of its attributes and connectivity between entities. An object model is
 * expressed in JSON. <br>
 * This facility creates HTML elements for entities of the input object model.
 * And appends these HTML elements to a given HTML div element. The facility
 * calculate position for HTML elements for an aesthetic graph (see Placement
 * class for details). <br>
 * The connections between entities are drawn as SVG paths. A maze-running
 * algorithm finds connection paths.
 * <p>
 * Styling: the style information for HTML element is supplied via a CSS
 * stylesheet. The CSS rules account for different object model element type
 * such as attribute name (attr-name), attribute type (attr-type), as well as
 * different categories of link type e.g 'inheritance', 'relation'
 * 
 * @param options
 *            the options to placement algorithm and other. If null, default
 *            options are taken.
 */
function ObjectGraph(options) {
	this.options = options == null ? defaults : Object
			.assign(options, defaults);
}

/**
 * Creates DOM element to represent an attribute
 * 
 * @param data
 *            JSON data for the attribute
 * @param parent
 *            div to which the created attribute element is appended
 * 
 * @return the HTML element for an attribute
 */
ObjectGraph.prototype.createAttribute = function(data, parent) {
	var attr = document.createElement('div');

	this.createTextNode(data['name'], 'attr-name', attr);
	this.createTextNode(data['type'], 'attr-type', attr);

	parent.appendChild(attr);

	return attr;
}

/**
 * Creates a text node inside a span and styles the parent span.
 * 
 * @param text
 *            the text content
 * @param cls
 *            the class of the span to style it
 * @return the span node enclosing a text node
 */
ObjectGraph.prototype.createTextNode = function(text, cls, parent) {
	var span = document.createElement('span');
	var text = document.createTextNode(text);
	span.appendChild(text);
	span.className += cls;

	parent.appendChild(span);

	return span;
}

/**
 * creates a div for given type. The div contains each attribute div. The class
 * of div is set to 'entity' is CSS.
 * 
 * @param data
 *            data for each attribute and name of the type
 * @param parent
 *            the parent DIV to add the created div.
 * @return The created div element.
 */

ObjectGraph.prototype.createEntity = function(data, parent) {
	var attrs = data['attributes'];
	var entity = document.createElement('div');
	parent.appendChild(entity);

	entity.className += ' entity';
	entity.name = data['name'];
	entity.setAttribute('entity', data['name'])

	this.createEntityHeader(entity.name, 'entity-header', entity);

	for ( var i = 0; i < attrs.length; i++) {
		var attrDiv = this.createAttribute(attrs[i], entity);
	}

	return entity;
}

ObjectGraph.prototype.createEntityHeader = function(name, cls, parent) {
	var header = document.createElement('div');
	header.className += cls;
	var title = this.createTextNode(name, cls, header);

	parent.appendChild(header);

	return header;
}

/**
 * Creates div for each entity in the given model. Computes their absolute
 * position. Draws link between them.
 * 
 * @param data
 *            describes each type and its attributes
 * @param model
 *            an existing DOM element where the DOM element for the types will
 *            be added. The model (container) uses 'relative' position and all
 *            child type elements use 'absolute' position.
 * @return
 */
ObjectGraph.prototype.createModel = function(data, modelDiv) {
	modelDiv.className += ' model';
	modelDiv.style.position = 'relative';

	var types = data['types'] || [];

	for ( var i = 0; i < types.length; i++) {
		var entity = this.createEntity(types[i], modelDiv);
	}

	// converts HTML elements to boxes for placement algorithm
	var entities = modelDiv.querySelectorAll('.entity');
	var boxes = [];
	entities.forEach(function(e) {
		// use offset parameters for numeric data
			var box = new Box(e.offsetLeft, e.offsetTop, e.offsetWidth,
					e.offsetHeight);
			boxes.push(box);
		});

	// this.drawBoxes(boxes, modelDiv);

	// resolve links to box indices for placement algorithm
	var links = data['links'] || [];
	var linkIndices = [];
	var self = this;
	links.forEach(function(link) {
		var source = self.findEntity(link.source);
		var target = self.findEntity(link.target);
		if (source == null || target == null)
			return;
		var k1 = [].indexOf.call(entities, source);
		var k2 = [].indexOf.call(entities, target);
		if (k1 >= 0 && k2 >= 0) {
			linkIndices.push(new Link(k1, k2, link.type));
		}
	});
	// run placement algorithm
	var placements = new Placement().runPlacementAlgorithm(boxes, linkIndices,
			new Box(modelDiv.offsetLeft, modelDiv.offsetTop,
					modelDiv.offsetWidth, modelDiv.offsetHeight), self.options);

	// assign the placement suggestions to HTML elements
	for ( var i = 0; i < entities.length; i++) {
		entities[i].style.left = '' + placements[i].x + 'px';
		entities[i].style.top = '' + placements[i].y + 'px';

	}
	// recompute box locations

	boxes = [];
	entities.forEach(function(e) {
		// use offset parameters for numeric data
			var box = new Box(e.offsetLeft, e.offsetTop, e.offsetWidth,
					e.offsetHeight);
			boxes.push(box);
		});
	// this.drawBoxes(boxes, modelDiv);

	var links = this.drawLinks(boxes, linkIndices, modelDiv);

	// var nodes = document.querySelectorAll('.entity');
	// nodes.forEach(function(node) {
	// node.addEventListener('click', handleEvent, true);
	// node.addEventListener('drag', handleEvent, true);
	// node.addEventListener('dragstart', handleEvent, true);
	// node.addEventListener('dragend', handleEvent, true);
	// });

	return modelDiv;
};

/**
 * draws set of boxes on given paper HTML element 
 * @param boxes
 * @param paper
 * @return
 */
ObjectGraph.prototype.drawBoxes = function(boxes, paper) {
	console.log(' ' + boxes.length + ' boxes');
	var svg = document.createElementNS(SVG_NAMESPACE, "svg");
	paper.appendChild(svg);
	svg.style.position = 'absolute';
	svg.style.width = paper.offsetWidth;
	svg.style.height = paper.offsetHeight;
	
	var style;
	for ( var i = 0; i < boxes.length; i++) {
		this.drawBox(boxes[i], style, svg);
	}
};

/**
 * Draws given box in the given svg element
 * @param box
 * @param style string of style parameters
 * @param svg
 * @return
 */
ObjectGraph.prototype.drawBox = function(box, style, svg) {
	var rect = document.createElementNS(SVG_NAMESPACE, "rect");
	svg.appendChild(rect);

	rect.setAttribute('x', box.x);
	rect.setAttribute('y', box.y);
	rect.setAttribute('width', box.w);
	rect.setAttribute('height', box.h);
	if (style !== undefined)
	rect.setAttribute('style', style);
						//"fill:blue;stroke:pink;stroke-width:5;fill-opacity:0.1;stroke-opacity:0.9");
	
};



/**
 * 
 */
ObjectGraph.prototype.drawLinks = function(boxes, links, paper) {
	var svg = document.createElementNS(SVG_NAMESPACE, "svg");
	paper.appendChild(svg);
	svg.style.position = 'absolute';
	svg.style.width = paper.offsetWidth;
	svg.style.height = paper.offsetHeight;
	for ( var i = 0, l = links.length; i < l; i++) {
		var link = links[i];
		var source = boxes[link.source];
		var target = boxes[link.target];
		console.log('draw link from ' + source + '->' + target + ' of '
				+ link.type);

		this.drawLink(source, target, link, boxes, svg);

	}

}

/**
 * Draws a line from source to target element. Adds the line to given svg
 * element.
 * 
 * @param source
 *            box
 * @param target
 *            box
 * @param link
 * @param svg
 *            parent svg element to which we will add a path
 * @return
 */
ObjectGraph.prototype.drawLink = function(source, target, link, obstacles, svg) {
	if (svg === undefined)
		throw {
			message : 'a parent svg element must be suuplied to draw a link'
		};

	var line = document.createElementNS(SVG_NAMESPACE, "path");
	svg.appendChild(line);

	var connectors = findJoints(source, target, link);

	/*
	var start = joinPoints[0];
	var end = joinPoints[1];
	var c1 = document.createElementNS(SVG_NAMESPACE, "circle");
	var c2 = document.createElementNS(SVG_NAMESPACE, "circle");
	c1.setAttribute('cx', start.x);
	c1.setAttribute('cy', start.y);
	c1.setAttribute('r', 5);
	c1.setAttribute('fill', 'red');
	c2.setAttribute('cx', end.x);
	c2.setAttribute('cy', end.y);
	c2.setAttribute('r', 5);
	c2.setAttribute('fill', 'green');
	svg.appendChild(c1);
	svg.appendChild(c2);
    */
	
	var startPoint = connectors[0].joinPoint;
	var endPoint   = connectors[1].joinPoint;
	
	var astar = new AStar(startPoint, endPoint);
	var path = astar.findPath(obstacles);
	if (path == null || path.length == 0) {
		console.log('***ERROR: A* path not found');
		return;
	}
	var svgPath = '';
	svgPath = 'M ' + connectors[0].basePoint.x + ' ' + connectors[0].basePoint.y 
	        + ' L' + connectors[0].joinPoint.x + ' ' + connectors[0].joinPoint.y;
	for (var i = 0; i < path.length; i++) {
		svgPath +=  ' L ' + path[i].x + ' ' + path[i].y;
	}
	svgPath += ' L ' + connectors[1].joinPoint.x + ' ' + connectors[1].joinPoint.y
             + ' L ' + connectors[1].basePoint.x + ' ' + connectors[1].basePoint.y;
	
	line.setAttribute('d', svgPath);
	// Use CSS style defined as line[type='xxx'] where xxx is the link type
	line.setAttribute('type', link.type);

}

/**
 * given two boxes and a directed link, find the coordinates on the source and
 * target box where the link should start and terminate.
 * 
 * The slope of the link is calculated using arctan function. Then the
 * arctan function value is quantized to one of 8 quadrant w.r.t. source. 
 * Based on the quadrant, the connection will exit source box via one of
 * NORTH, SOUTH EAST or WEST direction.
 * 
 * 
 * 
 * @param source
 *            the box for source HTML element. Must have top-left and width height.
 * @param target
 *            the box for target HTML element. Must have top-left and width height.
 *            
 * @return an array of 2 Points
 */
var findJoints = function(source, target, link) {
	var TICK_SIZE = 10;
	var startConnector = new Connector(source, joinPoint(source, target, link), TICK_SIZE);
	var endConnector   = new Connector(target, joinPoint(target, source, link), TICK_SIZE);
	
	return [ startConnector, endConnector ];
}

/**
 * calculates the points on the periphery of the source which is the join point
 * for a link. The join point depends on direction of target relative to source
 * as one of 4 directions such as north, east, west and south.
 * 
 */
var joinPoint = function(source, target, link) {
	var scx = source.x + source.w / 2;
	var scy = source.y + source.h / 2;
	var tcx = target.x + target.w / 2;
	var tcy = target.y + target.h / 2;
	var dx = tcx - scx;
	var dy = tcy - scy;
	var theta = Math.atan2(-dy, dx); // graphics use inverted Y-axis

	var q = theta > 0 
			? Math.floor((4 * theta) / Math.PI) 
			: 7 + Math.floor((4 * theta) / Math.PI);
			
	var joinPoints = [ EAST, 
	                   NORTH, NORTH, 
	                   WEST, WEST, 
	                   SOUTH, SOUTH, 
	                   EAST ];

	if (q < 0 || q >= joinPoints.legth)
		throw {
			message : 'invalid quadrant ' + q + ' should be between (0,8]'
		};

	return joinPoints[q];
}

/**
 * finds an entity of given name by CSS selector.
 * 
 * @param name
 *            an entity name
 * @return
 */
ObjectGraph.prototype.findEntity = function(name) {
	var selector = '[entity=\'' + name + '\']';
	var e = document.querySelector(selector);
	return e;
}


function Connector(box, dir, tickSize) {
	this.basePoint = box.PointAt(dir);
	if (dir == NORTH) {
		this.joinPoint = this.basePoint.shift(0, -tickSize);
	} else if (dir == SOUTH) {
		this.joinPoint = this.basePoint.shift(0, +tickSize);
	} else if (dir == EAST) {
		this.joinPoint = this.basePoint.shift(+tickSize, 0);
	} else if (dir == WEST) {
		this.joinPoint = this.basePoint.shift(-tickSize, 0);
	}

}
