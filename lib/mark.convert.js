const $length = Symbol.for('Mark.length');
const $parent = Symbol.for('Mark.parent');
const $pragma = Symbol.for('Mark.pragma');

var MarkConvert = function(Mark) {
	let m = Mark;  // holding reference to the Mark interface
	
	// convert DOM elment into Mark object
	function toMark(elmt) {
		if (!elmt) return null;
		var obj = m(elmt.tagName.toLowerCase());
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
					obj.push(child.textContent);
				}
				else if (child.nodeType === 1) { // element
					obj.push(toMark(child));
				}
				// all other nodes, like comments are ignored
			}
		}
		return obj;
	} 	
	
	// parse html into Mark objects
	MarkConvert.parse = function(source, options) {
		if (typeof document !== 'undefined') { // in browser environment
			var doc = document.implementation.createHTMLDocument();
			if (source.match(/^\s*(<!doctype|<html)/i)) { // treat as whole doc
				console.log('parse whole doc');
				doc.documentElement.innerHTML = source;  console.log('doc elmt', doc.documentElement);
				return toMark(doc.documentElement);
			} else { // treat as fragment
				console.log('parse doc fragment');
				doc.body.innerHTML = source;
				var children = doc.body.children;
				if (children && children.length > 1) {
					var result = [];
					for (var i=0; i<children.length; i++) {
						result.push(toMark(children[i]));
					}
					return result;
				} else {
					return toMark(doc.body.children);
				}
			}
		} else { // use htmlparser2 to parse
			// console.log('parse doc with htmlparser2');
			var htmlparser = require("htmlparser2");
			var root = null, parent = null, stack=[];
			var opt = {decodeEntities: true};
			if (options) {
				if (options.format == 'xml') { opt.xmlMode = true; }
			}
			var parser = new htmlparser.Parser({
				onopentag: function(name, attribs) {
					var obj = m(name, attribs, null, parent);
					if (parent) { parent.push(obj);  stack.push(parent);  parent = obj; }
					else { parent = obj;  if (!root) root = obj; } // root element
				},
				ontext: function(text) {
					if (/^\s*$/.test(text)) {
						// console.log("skip whitespace text", text);
					} else {
						parent.push(text);
					}
				},
				oncomment: function(comment) {
					var comt = {};  comt[$parent] = parent;  comt[$pragma] = '!--' + comment;
					parent.push(comt);
				},
				onclosetag: function(tagname) {
					parent = stack.pop();
				}
			}, opt);
			parser.write(source.trim());
			parser.end();
			return root;
		}
	}
	return MarkConvert;
}

MarkConvert.toHtml = function(object) {
	var he = require('he'); // HTML entity encoder/decoder
	he.encode.options.useNamedReferences = true;  // override the global default setting
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
	
	function toHtm(obj) {
		if (typeof obj !== 'object') { return ''; } // skip invalid object
		if (obj[$pragma]) { // html comment
			return (obj[$pragma].startsWith('!--') ? '<':'<!--') + obj[$pragma] +'-->';
		}
		
		// print opening tag
		var buffer = "<"+ obj.constructor.name;
		// print object attributes
		for (var prop in obj) {
			var value = obj[prop];
			//if (typeof value !== "undefined" && value !== null) {
				// todo: ensure 'prop' is proper html name
				buffer += ' '+ prop +'="'+ he.encode(value) +'"';
			//}
		}
		buffer += ">";
		// print object content
		var length = obj[$length];
		for (var i = 0; i<length; i++) {
			var item = obj[i];
			if (typeof item === "string") { buffer += he.encode(item); }
			else if (typeof item === "object") {
				buffer += toHtm(item);
			}
			else { console.log("unknown object", item); }
		}

		// print closing tag for non-empty element
		if (!emptyTags[obj.constructor.name]) {
			buffer += "</"+ obj.constructor.name +">";
		}
		return buffer;
	}
	
	var html = toHtm(object);
	if (html && object.constructor.name == 'html') { 
		return "<!DOCTYPE html>"+html;  // return full html
	} else {
		return html;  // return html fragment
	}
};

MarkConvert.toXml = function(object) {
	var he = require('he'); // HTML entity encoder/decoder
	he.encode.options.useNamedReferences = true;  // override the global default setting
	
	function xml(obj) {
		if (typeof obj !== 'object') { return ''; } // skip invalid object
		if (obj[$pragma]) {
			return obj[$pragma].startsWith('!--') ? ('<' + obj[$pragma] + '-->') // comment
				:('<?' + obj[$pragma] + '?>');  // processing instruction
		}
		
		// print opening tag
		var buffer = "<"+ obj.constructor.name;
		// print object attributes
		for (var prop in obj) {
			var value = obj[prop];
			//if (typeof value !== "undefined" && value !== null) {
				// todo: ensure 'prop' is proper xml name
				buffer += ' '+ prop +'="'+ he.encode(value) +'"';
			//}
		}
		var length = obj[$length];
		if (length) {
			buffer += ">";
			// print object content
			for (var i = 0; i<length; i++) {
				var item = obj[i];
				if (typeof item === "string") { 
					buffer += he.encode(item).replace(/&apos;/g, "'").replace(/&quot;/g, '"');
				}
				else if (typeof item === "object") {
					buffer += xml(item);
				}
				else { console.log("unknown object", item); }
			}
			// print closing tag
			buffer += "</"+ obj.constructor.name +">";
		} else {
			buffer += "/>";
		}
		return buffer;
	}
	
	// no fragment support
	var result = xml(object);
	return '<?xml version="1.0" encoding="UTF-8"?>'+result;
}

if (typeof module === 'object') module.exports = MarkConvert;