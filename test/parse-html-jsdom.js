const test = require('tape') ;
const jsdom = require('jsdom');
const JSDOM = jsdom.JSDOM;
const Mark = require('./../mark.js');

test('Parse HTML under JSDOM', function(assert) {
	if (typeof window === 'undefined') { 
		// setup 
		global.window = (new JSDOM(``)).window;
		global.document = window.document;
		global.DOMParser = window.DOMParser;

		var obj = Mark.parse('<html lang="en"><!-- comment --><head></head><body width="100%"><p class="main"><span title="Good &amp; bad">hello</span> world</p><br></body></html>', {format:'html'});
		assert.equal(Mark.stringify(obj), '{html lang:"en" {!-- comment } {head} {body width:"100%" {p class:"main" {span title:"Good & bad" "hello"} " world"} {br}}}', 'Parse html');
		assert.equal(obj.html(), '<!DOCTYPE html><html lang="en"><!-- comment --><head></head><body width="100%"><p class="main"><span title="Good &amp; bad">hello</span> world</p><br></body></html>', 'Parse and toHtml()'),
		// todo: entity is like 'hello &lt world' is not working
		
		// assert.equal(obj.html('<div></div>').source(), '{div}', "Test set html()");
		
		// tear down
		global.window = global.document = global.DOMParser = undefined;
	}
	// else skip test under browser
	assert.end();
});