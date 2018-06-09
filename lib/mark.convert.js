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
	
	var htmlEscapes = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;', 
		"'": '&#x27;',  // &apos; is not defined in HTML4
	};
	var htmlEscaper = /[&<>"']/g;
	
	// escape unsafe chars in the string into HTML/XML entities
	function escapeStr(str) {
		return ('' + str).replace(htmlEscaper, function(match) {
			return htmlEscapes[match];
		});
	}
	
	// convert Mark into HTML
	MarkConvert.toHtml = function(object) {
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
		
		function htm(obj) {
			if (typeof obj !== 'object') { return ''; } // skip invalid object
			var pragma = obj.pragma();
			if (pragma) { // html comment
				return (pragma.substr(0, 3)==='!--' ? '<':'<!--') + pragma +'-->';
			}
			
			// print opening tag
			var buffer = "<"+ obj.constructor.name;
			// print object attributes
			for (var prop in obj) {
				var value = obj[prop];
				// https://stackoverflow.com/questions/2647867/how-to-determine-if-variable-is-undefined-or-null
				if (value != null && typeof value !== 'function') { // exclude null, undefined and function
					// todo: ensure 'prop' is proper html name
					buffer += ' '+ prop +'="'+ escapeStr(value) +'"';
				}
			}
			buffer += ">";
			// print object content
			for (var item of obj) {
				if (typeof item === "string") { buffer += escapeStr(item); }
				else if (typeof item === "object") { buffer += htm(item); }
				else { console.log("unknown object", item); }
			}

			// print closing tag for non-empty element
			if (!emptyTags[obj.constructor.name]) {
				buffer += "</"+ obj.constructor.name +">";
			}
			return buffer;
		}
		
		var html = htm(object);
		if (html && object.constructor.name == 'html') { 
			return "<!DOCTYPE html>"+html;  // return full html
		} else {
			return html;  // return html fragment
		}
	};

	// MarkConvert.indent() is passed down from parent
	
	// convert Mark into XML
	MarkConvert.toXml = function(object, options) {
		function xml(obj, level = 0) {
			if (typeof obj !== 'object') { return ''; } // skip invalid object
			if (obj.pragma()) { // opening comments or PIs
				var pragma = obj.pragma();
				return pragma.startsWith('!--') ? ('<' + pragma + '-->') // comment
					:('<?' + pragma + '?>');  // processing instruction
			}
			
			// print opening tag
			var buffer = (options.space ? MarkConvert.indent(level):'') + "<"+ obj.constructor.name;
			// print object attributes
			for (var prop in obj) {
				var value = obj[prop];
				// https://stackoverflow.com/questions/2647867/how-to-determine-if-variable-is-undefined-or-null
				if (value != null && typeof value !== 'function') { // exclude null, undefined and function
					// todo: ensure 'prop' is proper xml name
					buffer += ' '+ prop +'="'+ escapeStr(value) +'"';
				}
			}
			if (obj[0]) {
				buffer += ">";
				// print object content
				let hasElmt = false;
				for (var item of obj) {
					if (typeof item === "string") { buffer += escapeStr(item); }
					else if (typeof item === "object") { buffer += xml(item, level+1);  hasElmt = true; }
					else { console.log("unknown object", item); }
				}
				// print closing tag
				buffer += (hasElmt && options.space ? MarkConvert.indent(level) : '') + "</"+ obj.constructor.name +">";
				if (options.space) { buffer += "\n"; }
			} else {
				buffer += "/>";
			}
			return buffer;
		}
		
		// no fragment support
		var result = xml(object);
		return '<?xml version="1.0" encoding="UTF-8"?>'+result;
	}	
	return MarkConvert;
}

if (typeof module === 'object') module.exports = MarkConvert;
