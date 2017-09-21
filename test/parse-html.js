const test = require('tape') ;
const Mark = require('./../mark.js');

test('Parse HTML', function(assert) {
	var obj = Mark.parse('<html lang="en"><!-- comment --><body width="100%"><p style="color:red" class="main" title="Good &amp; bad">hello world</p><br></body></html>');
	assert.equal(Mark.stringify(obj), '{html lang:"en" {{!-- comment }} {body width:"100%" {p style:"color:red", class:"main", title:"Good & bad" "hello world"} {br}}}', 'Parse html');
	assert.equal(obj.toHtml(), '<!DOCTYPE html><html lang="en"><!-- comment --><body width="100%"><p style="color:red" class="main" title="Good &amp; bad">hello world</p><br></body></html>', 'Parse and toHtml()'),
	// todo: entity is like 'hello &lt world' is not working
	
	assert.end();
});