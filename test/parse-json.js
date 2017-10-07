const test = require('tape') ;
const Mark = require('./../mark.js');

test('Parse JSON object', function(assert) {
	assert.deepEqual(Mark.parse('{"obj":123}'), {"obj":123}, 'Parse object {"obj":123}');
	assert.deepEqual(Mark.parse('{"obj":123, "":"empty key"}'), {"obj":123, "":"empty key"}, 'JSON object accepts empty key');
	assert.deepEqual(Mark.parse('[123, "string", true]'), [123, "string", true], 'Parse array [123, "string", true]');
	assert.equal(Mark.parse('"string"'), "string", 'Parse "string"');
	assert.equal(Mark.parse('123.456'), 123.456, 'Parse number 123.456');	
	assert.end() ;
});