const test = require('tape') ;
const Mark = require('./../mark.js');

test('Parse HTML', function(assert) {
	var obj = Mark.parse('<html lang="en"><!-- comment --><head></head><body width="100%"><p class="main"><span title="Good &amp; bad">hello</span> world</p><br></body></html>', {format:'html'});
	assert.equal(Mark.stringify(obj), '{html lang:"en" {!-- comment } {head} {body width:"100%" {p class:"main" {span title:"Good & bad" "hello"} " world"} {br}}}', 'Parse html');
	assert.equal(obj.html(), '<!DOCTYPE html><html lang="en"><!-- comment --><head></head><body width="100%"><p class="main"><span title="Good &amp; bad">hello</span> world</p><br></body></html>', 'Parse and toHtml()'),
	// todo: entity is like 'hello &lt world' is not working
	
	// assert.equal(obj.html('<div></div>').source(), '{div}', "Test set html()");
	assert.end();
});