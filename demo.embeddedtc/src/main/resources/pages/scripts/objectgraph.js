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

const X_AXIS = 1; // X-axis
const Y_AXIS = 2; // Y-axis

const NORTH = 0;
const SOUTH = 1;
const EAST = 2;
const WEST = 3;

// approximate width and height of each character.
var ch = 20;
var cw = 12;
var margin = 10;
var h_space = 4*cw;
var v_space = 1.2*ch;


/**
 * A facility to display an object graph given an entity model. The input is an
 * object model of persistent entities. A persistent entity model is described in
 * terms of entity attributes and connectivity between entities. An object model is
 * expressed in JSON. <br>
 * This facility creates HTML elements for entities of the input object model.
 * And appends these HTML elements to a given HTML div element. 
 * The facility
 * calculate absolute position for HTML elements for a graph using a Placement
 * algorithm. The browser renders the HTML elements  given their positions 
 * as calculated by Placement algorithm.
 * The placement algorithm requires dimension of the elements. However, the
 * width and height of an HTML element as calculated by browser is available
 * after an element is added to DOM. 
 * Hence, an approximate width and height of the elements are calculated
 * based on character width and height before presenting to Placement algorithm. 
 * <br> 
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
 * @return the HTML element for an attribute
 */
ObjectGraph.prototype.createAttribute = function(data) {
	var attr = document.createElement('div');
	attr.className += ' attr';
	var name = this.createTextNode(data['name'], 'attr-name');
	var type = this.createTextNode(data['type'], 'attr-type');
	attr.appendChild(name);
	attr.appendChild(type);
	
	setDimension(attr, name.w + type.w + 2*margin + h_space, Math.max(name.h, type.h));
	
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
ObjectGraph.prototype.createTextNode = function(s, cls) {
	var span = document.createElement('span');
	var text = document.createTextNode(s);
	span.appendChild(text);
	span.className += cls;
	console.log('width [' + s + ']=' + text.length*cw);
	setDimension(span, s.length * cw, ch);

	
	return span;
};



/**
 * creates a div for given type. The div contains each attribute div. The class
 * of div is set to 'entity' is CSS.
 * 
 * @param data
 *            data for each attribute and name of the type
 * @return The created div element.
 */

ObjectGraph.prototype.createEntity = function(data) {
	var entity = document.createElement('div');

	entity.className += ' entity';
	entity.name = data['name'];
	entity.setAttribute('entity', data['name'])

	var header = this.createEntityHeader(entity.name, 'entity-header');
	entity.appendChild(header);
	var w = header.w; var h = header.h;

	var attrs = data['attributes'];
	for ( var i = 0; i < attrs.length; i++) {
		var attrDiv = this.createAttribute(attrs[i], entity);
		entity.appendChild(attrDiv);
		w = Math.max(w, attrDiv.w);
		h += attrDiv.h;
	}
	setDimension(entity, w,h)
	console.log('entity ' + entity.name + ' w=' + entity.w + ' h=' + entity.h);
	 
	return entity;
}

/**
 * sets width and height of given element.
 * The element attribute 'w' and 'h' is set.
 * Also el.style.width and el.style.height
 * 
 * @param el an HTML element.
 * @param w width a number in pixel
 * @param h height a number in pixel
 * @return
 */
function setDimension(el, w, h) {
	el.setAttribute('w', w);
	el.setAttribute('h', h);
	el.w = w; el.h = h;
	
	el.style.width  = w + 'px';
	el.style.height = h + 'px';
}

ObjectGraph.prototype.createEntityHeader = function(name, cls) {
	var header = document.createElement('div');
	header.className += cls;
	var title = this.createTextNode(name, cls, header);
	header.appendChild(title);
	header.w = title.w; header.h = title.h;
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
	// a model manifests in two HTML elements. The entities are pure
	// HTML divisions rendered and laid out by browser. The links are
	// drawn by the facility as SVG paths.
	
	var entityContainer = document.createElement('div');
	var linkContainer   = document.createElementNS(SVG_NAMESPACE, "svg");
	

	modelDiv.className += ' model';
	
	// two children entityContainer and linkContainer use absolute
	// position. So this parent has relative position.
	modelDiv.style.position = 'relative';
	
	entityContainer.style.position = 'absolute';
	entityContainer.id='entityContainer';
	linkContainer.style.position   = 'absolute';
	linkContainer.id='linkContainer';
	
	
	
	var defs = defineArrowStyles();
	linkContainer.appendChild(defs);
    
	modelDiv.appendChild(entityContainer);
	modelDiv.appendChild(linkContainer);
	
	
	var types = data['types'] || [];

	for ( var i = 0; i < types.length; i++) {
		var entity = this.createEntity(types[i], entityContainer);
		entityContainer.appendChild(entity);
	}

	// converts HTML elements to boxes for placement algorithm
	// the HTML elements must have width/dimension for placement algorithm
	// and hence must added to DOM by now
	var entities = modelDiv.querySelectorAll('.entity');
	var boxes = [];
	entities.forEach(function(e) {
			var box = new Box(0, 0, e.w, e.h);
			boxes.push(box);
		});


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
	var boundingBox = new Box(0, 0, modelDiv.offsetWidth, 
			modelDiv.offsetHeight);
	var placements = new Placement()
	     .runPlacementAlgorithm(boxes, linkIndices,
	    		 boundingBox, self.options);

	// assign the placement suggestions to HTML elements and add them to DOM
	for ( var i = 0; i < entities.length; i++) {
		entities[i].style.left = '' + placements[i].x + 'px';
		entities[i].style.top = ''  + placements[i].y + 'px';
	}
	console.log('width of element after adding ' + entity.w);


	var links = this.drawLinks(boxes, linkIndices, linkContainer);


};

function defineArrowStyles() {
	var defs = document.createElementNS(SVG_NAMESPACE, "defs");
	
	var marker = document.createElementNS(SVG_NAMESPACE, "marker");
	
	marker.id='markerCircle';
	marker.markerWidth=8;
	marker.markerHeight=8;
	marker.refX=5;
	marker.refY=5;
	var circle = document.createElementNS(SVG_NAMESPACE, "circle");
	circle.cx = 5; circle.cy = 5; circle.r = 3;
	circle.style = 'stroke: none; fill:#000000;';
	marker.appendChild(circle);
	
	defs.appendChild(marker);
	
	marker = document.createElementNS(SVG_NAMESPACE, "marker");
	marker.id='markerArrow';
	marker.markerWidth=13;
	marker.markerHeight=13;
	marker.refX=2;
	marker.refY=6;
	marker.orient='auto';
	var path = document.createElementNS(SVG_NAMESPACE, "circle");
	path.d = 'M2,2 L2,11 L10,6 L2,2';
	path.style = 'fill: #000000;';
	marker.appendChild(path);
	
	defs.appendChild(marker);
	
	return defs;

}

/**
 * draws set of boxes on given paper HTML element
 * 
 * @param boxes
 * @param paper
 * @return
 */
/*
 * ObjectGraph.prototype.drawBoxes = function(boxes, paper) { console.log(' ' +
 * boxes.length + ' boxes'); var svg = document.createElementNS(SVG_NAMESPACE,
 * "svg"); paper.appendChild(svg); svg.style.position = 'absolute';
 * svg.style.width = paper.offsetWidth; svg.style.height = paper.offsetHeight;
 * 
 * var style; for ( var i = 0; i < boxes.length; i++) { this.drawBox(boxes[i],
 * style, svg); } };
 */
/**
 * Draws given box in the given svg element
 * 
 * @param box
 * @param style
 *            string of style parameters
 * @param svg
 * @return
 */
/*
 * ObjectGraph.prototype.drawBox = function(box, style, svg) { var rect =
 * document.createElementNS(SVG_NAMESPACE, "rect"); svg.appendChild(rect);
 * 
 * rect.setAttribute('x', box.x); rect.setAttribute('y', box.y);
 * rect.setAttribute('width', box.w); rect.setAttribute('height', box.h); if
 * (style !== undefined) rect.setAttribute('style', style);
 * //"fill:blue;stroke:pink;stroke-width:5;fill-opacity:0.1;stroke-opacity:0.9"); };
 */


/**
 * 
 */
ObjectGraph.prototype.drawLinks = function(boxes, links, linkContiner) {
	for ( var i = 0, l = links.length; i < l; i++) {
		var link = links[i];
		this.drawLink(boxes[link.source], boxes[link.target], 
				link, boxes, linkContiner);

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

	var connectors = findJoints(source, target, link);

	
	var startPoint = connectors[0].joinPoint;
	var endPoint   = connectors[1].joinPoint;
	
	var astar = new AStar(startPoint, endPoint);
	var path = astar.findPath(obstacles);
	if (path == null || path.length == 0) {
		console.log('***ERROR: A* path not found');
		return;
	}
	var svgPath = '';
	svgPath = 'M' + connectors[0].basePoint.x + ' ' + connectors[0].basePoint.y 
	        + ' L' + connectors[0].joinPoint.x + ' ' + connectors[0].joinPoint.y;
	for (var i = 0; i < path.length; i++) {
		svgPath +=  ' L' + path[i].x + ' ' + path[i].y;
	}
	svgPath += ' L' + connectors[1].basePoint.x + ' ' + connectors[1].basePoint.y;
	
	line.setAttribute('d', svgPath);
	// Use CSS style defined as line[type='xxx'] where xxx is the link type
	line.setAttribute('type', link.type);
	
	svg.appendChild(line);
};

/**
 * given two boxes and a directed link, find the coordinates on the source and
 * target box where the link should start and terminate.
 * 
 * The slope of the link is calculated using arctan function. Then the arctan
 * function value is quantized to one of 8 quadrant w.r.t. source. Based on the
 * quadrant, the connection will exit source box via one of NORTH, SOUTH EAST or
 * WEST direction.
 * 
 * 
 * 
 * @param source
 *            the box for source HTML element. Must have top-left and width
 *            height.
 * @param target
 *            the box for target HTML element. Must have top-left and width
 *            height.
 * 
 * @return an array of 2 Points
 */
var findJoints = function(source, target, link) {
	var TICK_SIZE = 10;
	var startConnector = new Connector(source, joinPoint(source, target, link), TICK_SIZE);
	var endConnector   = new Connector(target, joinPoint(target, source, link), TICK_SIZE);
	
	return [ startConnector, endConnector ];
};

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
};

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
};


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

Element.prototype.getElementWidth = function() {
	if (typeof this.clip !== "undefined") {
		return this.clip.width;
	} else {
		if (this.style.pixelWidth) {
			return this.style.pixelWidth;
		} else {
			return this.offsetWidth;
		}
	}
};
Element.prototype.getElementHeight = function() {
	if (typeof this.clip !== "undefined") {
		return this.clip.height;
	} else {
		if (this.style.pixelHeight) {
			return this.style.pixelHeight;
		} else {
			return this.offsetHeight;
		}
	}
};

