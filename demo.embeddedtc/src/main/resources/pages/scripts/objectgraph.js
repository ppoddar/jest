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

const TICK_SIZE = 10;


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
 * Creates jQuery DOM element to represent an attribute
 * 
 * @param data
 *            JSON data for the attribute
 * @param $parent the parent jQuery element           
 * @return the HTML element for an attribute
 */
ObjectGraph.prototype.createAttribute = function(data, $parent) {
	var $attr = $('<div/>').addClass(' attr');
	var $name = $('<span/>').addClass('attr-name').text(data['name']);
	var $type = $('<span/>').addClass('attr-type').text(data['type']);
	$attr.append($name, $type);
	$parent.append($attr);
	return $attr;
}


/**
 * creates a div for given entity. The div contains each attribute div. The class
 * of div is set to 'entity' in CSS.
 * 
 * @param data
 *            data for each attribute and name of the type
 * @return The created div element.
 */

ObjectGraph.prototype.createEntity = function(data, $parent) {
	var $entity = $('<div/>').addClass('entity');

	$entity.name = data['name'];
	$entity.attr('name', data['name'])

	var $header = $('<div/>').addClass('entity-header');
	var $title  = $("<span/>").text(data['name']);
	$header.append($title);
	$entity.append($header);
	var self = this;
	$.each(data['attributes'], function(idx, attr) {
		self.createAttribute(attr, $entity);
	}); 
	
	// IMPORTANT: to get the dimension unless element is added to DOM
	$parent.append($entity);
	
	return $entity;
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
ObjectGraph.prototype.createModel = function(data, $modelDiv) {
	// a model manifests in two HTML elements. The entities are pure
	// HTML divisions rendered and laid out by browser. The links are
	// drawn by the facility as SVG paths.
	$modelDiv.empty();
	
	var $entityContainer = $('<div/>').addClass('model');
	var $linkContainer   = $(document.createElementNS(SVG_NAMESPACE, "svg"));
	
	$modelDiv.append($entityContainer);
	$modelDiv.append($linkContainer);
	
	// two children entityContainer and linkContainer use absolute
	// position. So this parent has relative position.
	$modelDiv.css({position: 'relative'});
	
	$entityContainer.css({position: 'absolute'}); 
	$entityContainer.attr('id', 'entityContainer');
	$linkContainer.css({position: 'absolute', top:0, left:0, 
		width:$modelDiv.width()+'px', height:$modelDiv.height()+'px'}); 
	$linkContainer.attr('id', 'linkContainer');
	
	
	var defs = defineArrowStyles($linkContainer);
	
	var boxes = [];
	var $entities = [];
	var self = this;
	$.each(data['types'] || [], function(idx, type) {
		var $entity = self.createEntity(type, $entityContainer);
		var box = new Box(0, 0, $entity.width(), $entity.height());
		boxes.push(box);
		$entities.push($entity);
	});
	


	// resolve links to box indices for placement algorithm
	var linkIndices = [];
	$.each(data['links'] || [], function(idx, link) {
		var k1 = -1; var k2 = -1;
		for (var j = 0; j < $entities.length; j++) {
			var e = $entities[j];
			if (e.name == link.source) {
				k1 = j;
			}
			if (e.name == link.target) {
				k2 = j;
			}
			if (k1 >= 0 && k2 >= 0) {
				linkIndices.push(new Link(k1, k2, link.type));
			}
		}
	});
	// run placement algorithm
	var boundingBox = new Box(0, 0, $modelDiv.width(), 
			$modelDiv.height());
	var placements = new Placement()
	     .runPlacementAlgorithm(boxes, linkIndices,
	    		 boundingBox, self.options);

	// assign the placement suggestions to HTML elements and add them to DOM
	
	$('.entity').each(function(i,e){
		e.style.left = placements[i].x + 'px'
		e.style.top  = placements[i].y + 'px'
	})
	
	for (var i = 0; i < placements.length; i++) {
		var p = placements[i];
		var b = boxes[i];
		p.x = b.x - TICK_SIZE;
		p.y = b.y - TICK_SIZE;
		p.w = b.w + 2*TICK_SIZE;
		p.h = b.h + 2*TICK_SIZE;
		
/*		console.log('placement[' + i + '] ' + 
				placements[i].x + ' ' + placements[i].y + ' ' + 
				placements[i].w + ' ' + placements[i].h);
		console.log('    boxes[' + i + '] ' + 
				boxes[i].x + ' ' + boxes[i].y + ' ' + 
				boxes[i].w + ' ' + boxes[i].h);
*/
	}
	var links = this.drawLinks(placements, linkIndices, linkContainer);


};

function defineArrowStyles($container) {
	var defs = $(document.createElementNS(SVG_NAMESPACE, "defs"));
	$container.append(defs);
	
	var $markerCircle = $(makeSVG('marker', {id:'markerCircle', 
		markerWidth:8, markerHeight:8, refX:5, refY:5}));
		
	defs.append($markerCircle);
	
	var circle = makeSVG('circle', {cx:5, cy:5, r:3, 
		style:'stroke: none; fill:#000000;'});
	
	$markerCircle.append(circle);
	
	var $markerArrow = $(makeSVG('marker', {id:'markerArrow', 
		markerWidth:13, markerHeight:13, refX:2, refY:6, orient:'auto'}));
	
	defs.append($markerArrow);
	
	var path = makeSVG('path', {d:'M2,2 L2,11 L10,6 L2,2',
		style:'fill: #000000;'});
		
	$markerArrow.append(path);
	
	
	return defs;

}

function makeSVG(tag, attrs) {
    var el= document.createElementNS(SVG_NAMESPACE, tag);
    for (var k in attrs)
        el.setAttribute(k, attrs[k]);
    return el;
}

/**
 * 
 */
ObjectGraph.prototype.drawLinks = function(boxes, links, linkContainer) {
	for ( var i = 0, l = links.length; i < l; i++) {
		var link = links[i];
		this.drawLink(boxes[link.source], boxes[link.target], 
				link, boxes, linkContainer);

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
	var startConnector = new Connector(source, 
			joinPoint(source, target, link), true, TICK_SIZE);
	var endConnector   = new Connector(target, 
			joinPoint(target, source, link), false, TICK_SIZE);
	
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
	var dir = 0;
	if (link.type == 'inheritance') {
		dir = (theta > 0) ? NORTH : SOUTH;
	} else if (link.type == 'relation') {
		dir = (theta > 0 && theta < Math.PI/2) 
		   || (theta < 3*Math.PI/2 && theta > -Math.PI/2) ? EAST: WEST;
	} else {
		throw {message: 'unknown link kind ' + link.type};
	}
	if (q < 0 || q >= joinPoints.length)
		throw {
			message : 'invalid quadrant ' + q + ' should be between (0,8]'
		};

	return dir;//joinPoints[q];
};





/**
 * draws set of boxes on given paper HTML element
 * 
 * @param boxes
 * @param paper
 * @return
 *
/*/
  ObjectGraph.prototype.drawBoxes = function(boxes, paper) { 
	  console.log(' ' + boxes.length + ' boxes'); 
	  
	  var svg = document.createElementNS(SVG_NAMESPACE, "svg"); 
	  
	  paper.appendChild(svg); svg.style.position = 'absolute';
      svg.style.width = paper.offsetWidth; 
      svg.style.height = paper.offsetHeight;
  
     var style; for ( var i = 0; i < boxes.length; i++) { this.drawBox(boxes[i],
     style, svg); 
     } 
  };
 
/**
 * Draws given box in the given svg element
 * 
 * @param box
 * @param style
 *            string of style parameters
 * @param svg
 * @return
 */
  ObjectGraph.prototype.drawBox = function(box, style, svg) { 
	  var rect = makeSVG('rect', {x:box.x, y:box.y, width:box.w, height:box.h});
  
      if (style !== undefined) rect.setAttribute('style', style);
  //"fill:blue;stroke:pink;stroke-width:5;fill-opacity:0.1;stroke-opacity:0.9"); 

	  svg.appendChild(rect);

  };
 





function Connector(box, dir, start, tickSize) {
	var p0 = box.PointAt(dir);
	if (start) {
	if (dir == NORTH) {
		this.basePoint = p0;
		this.joinPoint = p0.shift(0, -tickSize);
	} else if (dir == SOUTH) {
		this.basePoint = p0;
		this.joinPoint = p0.shift(0, +tickSize);
	} else if (dir == EAST) {
		this.basePoint = p0;
		this.joinPoint = p0.shift(+tickSize, 0);
	} else if (dir == WEST) {
		this.basePoint = p0;
		this.joinPoint = p0.shift(-tickSize, 0);
	}
	} else {
		if (dir == NORTH) {
			this.basePoint = p0.shift(0, -tickSize);
			this.joinPoint = p0.shift(0, -tickSize);
		} else if (dir == SOUTH) {
			this.basePoint = p0.shift(0, +tickSize);
			this.joinPoint = p0.shift(0, +tickSize);
		} else if (dir == EAST) {
			this.basePoint = p0.shift(+tickSize, 0);
			this.joinPoint = p0.shift(+tickSize, 0);
		} else if (dir == WEST) {
			this.basePoint = p0.shift(-tickSize, 0);
			this.joinPoint = p0.shift(-tickSize, 0);
		}
	}

}



