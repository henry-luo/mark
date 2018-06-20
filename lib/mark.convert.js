var MarkConvert = function(Mark) {
	let m = Mark;  // holding reference to the Mark interface
	
	// convert DOM elment into Mark object
	function toMark(elmt, options) {
		if (!elmt) return null;
		var obj = m(options.format === 'xml' ? elmt.tagName:elmt.tagName.toLowerCase());
		if (elmt.hasAttributes()) {
			var attrs = elmt.attributes;
			for (var i = 0; i < attrs.length; i++) {
				var attr = attrs[i];
				if (attr.specified) obj[attr.name] = attr.value;
			}
		}
		if (elmt.hasChildNodes()) {
			for (var i=0; i<elmt.childNodes.length; i++) {
				var child = elmt.childNodes[i];
				if (child.nodeType === 3) { // text node
					if (options.ignoreSpace && /^\s*$/.test(child.textContent)) {
						// console.log("skip whitespace text", text);
					} else {
						obj.push(child.textContent);
					}
				}
				else if (child.nodeType === 1) { // element
					obj.push(toMark(child, options));
				}
				else if (child.nodeType === 8) { // comment
					// '!--' is kept to differentiate with PI
					obj.push(m.pragma('!--' + child.nodeValue, obj));
				}
				// todo: other node types are ignore
			}
		}
		return obj;
	} 	
	
	// parse html into Mark objects
	MarkConvert.parse = function(source, options) {
		if (!options) { options = {ignoreWhitespace:false}; }
		// console.log('options:', options);
		if (typeof document !== 'undefined') { // in browser environment
			if (source.match(/^\s*(<!doctype|<html)/i)) { // treat as whole doc
				// console.log('parse html doc');
				// doc.documentElement.innerHTML = source; // innerHTML is insufficient, as global attributes on root html element will be ignored
				var parser = new DOMParser();
				var doc = parser.parseFromString(source, "text/html");  // console.log('doc elmt', doc.documentElement);
				// todo: error handling
				return toMark(doc.documentElement, options);
			} 
			else if (source.match(/^\s*(<\?xml)/i)) {
				var parser = new DOMParser();  // console.log('parse xml', source);
				var doc = parser.parseFromString(source, "text/xml");
				// todo: error handling - dump(oDOM.documentElement.nodeName == "parsererror" ? "error while parsing" : oDOM.documentElement.nodeName);
				return toMark(doc.documentElement, options);
			}
			else { // treat as html fragment
				// console.log('parse html fragment');
				var doc = document.implementation.createHTMLDocument(null);
				doc.body.innerHTML = source;
				var children = doc.body.children;
				if (!children) return null;
				if (children.length > 1) {
					var result = [];
					for (var i=0; i<children.length; i++) {
						result.push(toMark(children[i], options));
					}
					return result;
				} else {
					return toMark(doc.body.children[0], options);
				}
			}
		} else { // use htmlparser2 to parse
			// console.log('parse doc with htmlparser2');
			
			// setup the parser
			var htmlparser = require("htmlparser2");
			var parent = [], stack=[];
			var opt = {decodeEntities: true};
			if (options.format == 'xml') { opt.xmlMode = true; }
			var parser = new htmlparser.Parser({
				onopentag: function(name, attribs) {
					var obj = m(name, attribs, null, parent);
					if (parent) { parent.push(obj);  stack.push(parent);  parent = obj; }
					else { parent = obj; }
				},
				ontext: function(text) {
					if (options.ignoreSpace && /^\s*$/.test(text)) {
						// console.log("skip whitespace text", text);
					} else {
						parent.push(text);
					}
				},
				oncomment: function(comment) {
					parent.push(Mark.pragma('!--' + comment, parent));
				},
				onclosetag: function(tagname) {
					parent = stack.pop();
				}
				// todo: onprocessinginstruction
			}, opt);
			
			// start parsing
			parser.write(source.trim());
			parser.end();
			// result might be an array
			return (parent.length == 1) ? parent[0]:parent;
		}
	}
	
	var sgmlEscapes = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;', 
		"'": '&#x27;',  // &apos; is not defined in HTML4
	};
	var sgmlEscaper = /[&<>"']/g;
	
	// escape unsafe chars in the string into HTML/XML entities
	function escapeStr(str) {
		return ('' + str).replace(sgmlEscaper, function(match) {
			return sgmlEscapes[match];
		});
	}

	// ref: https://github.com/mixu/htmlparser-to-html
	var emptyTags = {
		"area": 1,
		"base": 1,
		"basefont": 1,
		"br": 1,
		"col": 1,
		"frame": 1,
		"hr": 1,
		"img": 1,
		"input": 1,
		"isindex": 1,
		"link": 1,
		"meta": 1,
		"param": 1,
		"embed": 1,
	};
	  
	// stringify Mark as HTML or XML
	// note: stringify with indentation space, may distort the HTML/XML content
	MarkConvert.toSgml = function(object, options) {
		let buffer = '', hasSpace = options.space, isXml = options.format === 'xml';
		if (typeof object !== 'object') { return null; } // skip invalid object

		// opening signature
		if (isXml) {
			buffer += '<?xml version="1.0" encoding="UTF-8"?>'
		}
		else {
			if (object.constructor.name == 'html') { 
				buffer += "<!DOCTYPE html>";  // full html
			} 
			// else treat as html fragment
		}
		
		function markup(obj, level = 0) {
			var pragma = obj.pragma();
			if (pragma) { // XML/HTML comment or PI
				buffer += pragma.lastIndexOf('!--', 0) === 0 ? ('<' + pragma + '-->') // comment
					:('<?' + pragma + '?>');  // processing instruction
				return;
			}

			// MarkConvert.indent() is set by Mark
			// print opening tag
			buffer += (hasSpace ? MarkConvert.indent(level):'') + "<"+ obj.constructor.name;

			// print object attributes
			for (var prop in obj) {
				var value = obj[prop];
				// https://stackoverflow.com/questions/2647867/how-to-determine-if-variable-is-undefined-or-null
				if (value != null && typeof value !== 'function') { // exclude null, undefined and function
					// todo: ensure 'prop' is proper html name
					buffer += ' '+ prop +'="'+ escapeStr(value) +'"';
				}
			}
			
			// print object content
			if (isXml && !obj[0]) {
				buffer += "/>";
			}
			else {
				buffer += ">";
				let hasElmt = false;
				for (var item of obj) {
					if (typeof item === "string") { buffer += escapeStr(item); }
					else if (typeof item === "object") { markup(item, level+1);  hasElmt = true; }
					else { console.trace("unknown object", item); }
				}
				
				// print closing tag for XML and non-empty HTML element
				if (isXml || !emptyTags[obj.constructor.name]) {
					buffer += (hasElmt && hasSpace ? MarkConvert.indent(level) : '') + "</"+ obj.constructor.name +">";
				}
			}
		}

		markup(object);
		return buffer;
	}
	
	return MarkConvert;
}

if (typeof module === 'object') module.exports = MarkConvert;
