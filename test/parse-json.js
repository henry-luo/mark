const test = require('tape') ;
const Mark = require('./../mark.js');

test('Parse JSON5 object', function(assert) {
	assert.deepEqual(Mark.parse('{obj:123}'), {obj:123}, 'Parse object {obj:123}');
	assert.deepEqual(Mark.parse("{'obj':123}"), {'obj':123}, "Parse object {'obj':123}");
	assert.deepEqual(Mark.parse("{'obj':123,}"), {'obj':123,}, "Parse object {'obj':123,}");
	assert.deepEqual(Mark.parse("{'obj':123,/*comment*/}"), {'obj':123,/*comment*/}, "Parse object {'obj':123,/*comment*/}");
	
	assert.end() ;
});