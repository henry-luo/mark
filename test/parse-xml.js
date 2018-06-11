const test = require('tape');

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

test('Parse XML', function(assert) {
	var src = loadXml();
	var obj = Mark.parse(src, {format:'xml', ignoreSpace:true});  // console.log('parsed xml', Mark.stringify(obj));
	assert.equal(obj.constructor.name, 'catalog', 'Parse xml');
	assert.equal(obj.length(), 12, 'Parse xml');
	assert.equal(obj[0].constructor.name, 'book', 'Parse xml');
	var xml = obj.xml();
	assert.equal(xml.replace(/ |\r|\n/g, ''), src.replace(/ |\r|\n/g, ''), 'Mark to xml');
	// stringify with indentation
	xml = obj.xml({space:'  '});  // console.log(xml);
	assert.equal(xml.replace(/ |\r|\n/g, ''), src.replace(/ |\r|\n/g, ''), 'Mark to xml with indentation');
	assert.end() ;
});
