
/**
 * Draws a entity model.
 */

function drawEntity(box, entityData) {
	//console.log('drawEntity called with ' + JSON.stringify(entity));
	var main = box.selectAll('div')
	           .data(entityData)
	           .enter()
	           .append('g');
	
	main.each(function(d){
		var box = d3.select(this);
		var lineHeight = 1.2*measureFontHeight();
		var hgap = 10; // px
		var W = measureMaxWidth(d.attributes) + 2*hgap;;
		var H = lineHeight * (d.attributes.length+1);
		console.log('dimension ' + W + 'x' + H);
		box.append('rect')
			.attr('class','entity')
			.attr('width',  W + 'px')
			.attr('height', H + 'px');
		var title = box.append('text')
			.text(d.name)
			.attr('y', '20')
			.attr('x', W/2)
			.attr('text-anchor', 'middle')
			.attr('class', 'entityname');
		var bbox = title.node().getBBox();
		var rect = box.insert('rect', 'text')
		  .attr('x', 0)
		  .attr('y', 0)
		  .attr('width', W)
		  .attr('height', bbox.height)
		  .attr('class', 'entityheader');
		var attrs = box.append('g').attr('transform', 'translate('+hgap+',20)');
		drawAttributes(attrs, d.attributes, lineHeight);
	});
	
	
	
}

/**
 * 
 * @param box enclosing HTML division 
 * @param attributes array of attribute definition with name, type etc.
 * @return
 */
function drawAttributes(box, attributes, lineHeight) {
	//console.log('drawAttributes called with ' + JSON.stringify(attributes));
	
	// create text boxes
	var textBoxes = box.selectAll('div')
    .data(attributes)
    .enter()
    .append('text');
	
	var textAttributes = textBoxes
		.attr("y", function(d,i) {
			return (1+i)*lineHeight;
		})
		.each(function(d){
			d3.select(this).append('tspan')
				.text(d.type)
				.attr('class', 'attrtype');
			d3.select(this).append('tspan')
				.text(d.name)
				.attr('class', 'attrname')
				.attr('dx', '0.2em');
			
		});
	
}


function measureFontHeight() {
	var span = document.createElement('span');
	document.body.appendChild(span);
    span.textContent = 'M';
    var h = span.offsetHeight;
    document.body.removeChild(span);
    return h;
}

function measureTextWidth(txt) {
	
	var span = document.createElement('span');
	document.body.appendChild(span);
    span.textContent = txt;
    var w = span.offsetWidth;
    document.body.removeChild(span);
	console.log('text [' + txt + '] width=' + w + 'px');
    return w;
    
}

function measureMaxWidth(attributes) {
    var maxWidth = 0;
	for (var i = 0; i < attributes.length; i++) {
		var text = attributes[i].type + ' ' + attributes[i].name;
		var w = measureTextWidth(text);
		maxWidth = Math.max(w, maxWidth);
	}
    return maxWidth;
}


    
    
