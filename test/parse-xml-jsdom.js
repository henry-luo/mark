const test = require('tape');
const jsdom = require('jsdom');
const JSDOM = jsdom.JSDOM;
const Mark = require('./../mark.js');

function loadXml() {
	if (typeof document !== 'undefined') { // in browser environment
		// make sync AJAX call
		var xhReq = new XMLHttpRequest();
		xhReq.open("GET", "base/test/data/book.xml", false);
		xhReq.send(null);
		var xml = xhReq.responseText;  // console.log('xml:', xml);
		return xml;
	} else {
		const fs = require('fs');
		return fs.readFileSync('./test/data/book.xml').toString(); 
	}
}

test('Parse XML under JSDOM', function(assert) {
	var src = loadXml();
	
	// setup 
	global.window = (new JSDOM(``)).window;
	global.document = window.document;
	global.DOMParser = window.DOMParser;

	var obj = Mark.parse(src, {format:'xml', ignoreSpace:true});  // console.log('parsed xml', Mark.stringify(obj));
	assert.equal(obj.constructor.name, 'catalog', 'Parse xml');
	assert.equal(obj.length(), 12, 'Parse xml');
	assert.equal(obj[0].constructor.name, 'book', 'Parse xml');
	var xml = obj.xml();
	assert.equal(xml.replace(/ |\r|\n/g, ''), src.replace(/ |\r|\n/g, ''), 'Mark to xml');
	
	assert.equal(obj.xml('<?xml version="1.0" encoding="UTF-8"?><div><p>text</p></div>').source(), '{div {p "text"}}', "Test set xml()");
	
	// tear down
	global.window = global.document = global.DOMParser = undefined;	
	assert.end() ;
});