const test = require('tape') ;
const Mark = require('./../mark.js');

test('Parse and Stringify HTML', function(assert) {
	var obj = Mark.parse('<html lang="en"><!-- comment --><head></head><body width="100%"><p class="main"><span title="Good &amp; bad">hello</span> world</p><br></body></html>', {format:'html'});
	assert.equal(Mark.stringify(obj), '{html lang:"en" (!-- comment ) {head} {body width:"100%" {p class:"main" {span title:"Good & bad" "hello"} " world"} {br}}}', 'Parse html');
	assert.equal(obj.html(), '<!DOCTYPE html><html lang="en"><!-- comment --><head></head><body width="100%"><p class="main"><span title="Good &amp; bad">hello</span> world</p><br></body></html>', 'Parse and toHtml()'),
	assert.equal(obj.html({space:' '}), '<!DOCTYPE html>\n<html lang="en"><!-- comment -->\n <head></head>\n <body width="100%">\n  <p class="main">\n   <span title="Good &amp; bad">hello</span> world\n  </p>\n  <br>\n </body>\n</html>', 'Stringify html with indentation');
	// console.log(obj.html({space:' '}));
	assert.end();
});