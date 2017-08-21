const test = require('tape');
const fs = require('fs');
const Mark = require('./../mark.js');

test('Parse XML', function(assert) {
	var src = fs.readFileSync('./test/data/book.xml').toString(); 
	var obj = Mark.parse(src, {format:'xml'});
	assert.equal(obj.constructor.name, 'catalog', 'Parse xml');
	assert.equal(obj.length, 12, 'Parse xml');
	assert.equal(obj[0].constructor.name, 'book', 'Parse xml');
	
	assert.end() ;
});