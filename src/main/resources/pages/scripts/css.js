	/**
	 * get the rules matching given CSS selector pattern in the given 
	 * stylesheet
	 * 
	 * @param stylesheet
	 * @param selector
	 * @return
	 */
	function getCSSRule(css, selector) {
		var styleSheet = findCSS(css);
		if (styleSheet == null) {
			console.log('not found ' + css);
			return;
		}
		console.log('css      :' + styleSheet.href);
		console.log('css type :' + styleSheet.constructor);
		console.log('css rules:' + styleSheet.cssRules);
	}
	
	function findCSS(css) {
		var url = window.location.href;
		var cssURL = resolve(url, css);
		var styleSheets = window.document.styleSheets;
		for (var i = 0; i < styleSheets.length; i++) {
			if (styleSheets[i].href == cssURL) {
				return styleSheets[i];
			}
		}
	}
	
	function resolve(base, path) {
		var tokens = base.split('/');
		var paths = path.split('/');
		var result = tokens.slice(0,tokens.length-1);
		var k = result.length - 1;
		for (var i=0; i < paths.length; i++) {
			var token = paths[i];
			if (token == '.') { continue;}
			if (token == '..') { result.pop(); continue;}
			result.push(token);
		}
		return result.join('/');
	}
