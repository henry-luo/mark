const test = require('tape') ;
const Mark = require('./../mark.js');

test('Parse JSON object', function(assert) {
	assert.deepEqual(Mark.parse('{"obj":123}'), {"obj":123}, 'Parse object {"obj":123}');
	assert.deepEqual(Mark.parse('{"obj":123, "":"empty key"}'), {"obj":123, "":"empty key"}, 'JSON object accepts empty key');
	assert.deepEqual(Mark.parse('{"obj":123, "1":1, "2.2":2.2}'), {"obj":123, "1":1, "2.2":2.2}, 'JSON object should accept numeric keys');
	assert.deepEqual(JSON.stringify(Mark.parse('[123, "string", true, false, null]')), '[123,"string",true,false,null]', 'Parse array of literal values');
	assert.equal(Mark.parse('"string"'), "string", 'Parse "string"');
	assert.equal(Mark.parse('123.456'), 123.456, 'Parse number 123.456');
	assert.equal(JSON.stringify(Mark.parse('{"a":"", "b":[""]}')), '{"a":"","b":[""]}', 'Parse zero-length string');	
	
	// Mark no longer supports JSON reviver
	/*
	var book = Mark.parse('{"title":"JavaScript: The Definitive Guide", "author":"David Flanagan", "edition":6}', function(name, value) {
        if (name === 'edition') { return undefined; }
        // otherwise return value
        return value; 
    });
	assert.deepEqual(book, {"title":"JavaScript: The Definitive Guide", "author":"David Flanagan"}, 'Parse with reviver');	
	*/
	
	assert.deepEqual(Mark.stringify(Mark.parse('{Object}')), "{Object}", '{Object} is not JSON');
	assert.end() ;
});