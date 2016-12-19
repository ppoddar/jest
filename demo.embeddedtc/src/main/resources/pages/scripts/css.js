function css() {

	/**
	 * get the rules matching given CSS selector pattern in the given stylesheet
	 * 
	 * @param stylesheet
	 * @param selector
	 * @return
	 */
	this.getCSSRule = function(styleSheetName, selector) {
		var styleSheet = this.findCSS(styleSheetName);
		if (styleSheet == null) {
			console.log('not found ' + styleSheetName);
			return;
		}
		console.log('css      :' + styleSheet.href);
		console.log('css type :' + styleSheet.constructor);
		console.log('css rules:' + styleSheet.rules);
		console.log('css cssRules:' + styleSheet.cssRules);
	};

	this.findCSS = function(styleSheetName) {
		var url = window.location.href;
		var cssURL = this.resolvePath(url, styleSheetName);
		var styleSheets = window.document.styleSheets;
		for ( var i = 0; i < styleSheets.length; i++) {
			if (styleSheets[i].href == cssURL) {
				return styleSheets[i];
			}
		}
	};

	this.resolvePath = function(base, path) {
		var tokens = base.split('/');
		var paths = path.toString().split('/');
		var result = tokens.slice(0, tokens.length - 1);
		var k = result.length - 1;
		for ( var i = 0; i < paths.length; i++) {
			var token = paths[i];
			if (token == '.') {
				continue;
			}
			if (token == '..') {
				result.pop();
				continue;
			}
			result.push(token);
		}
		return result.join('/');
	};
}
