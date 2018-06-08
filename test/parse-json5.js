const test = require('tape') ;
const Mark = require('./../mark.js');

test('Parse JSON5 object', function(assert) {
	assert.deepEqual(Mark.parse('{obj:123}'), {obj:123}, 'Parse object {obj:123}');
	assert.deepEqual(Mark.parse("{'obj':123}"), {'obj':123}, "Parse object {'obj':123}");
	assert.deepEqual(Mark.parse("{'obj':123,}"), {'obj':123,}, "Parse object {'obj':123,}");
	assert.deepEqual(Mark.parse("{'obj':123,/*comment*/}"), {'obj':123,/*comment*/}, "Parse object {'obj':123,/*comment*/}");
	
	assert.deepEqual(Mark.parse("{a:12.4, b:true, c:false, d:'str', e:null, g:1, h:[1,2,3], i:-12, j:[], k:{}, l:'', m:\"\", n:0, o:1E12, p:1e-2}"), 
		{a:12.4, b:true, c:false, d:'str', e:null, g:1, h:[1,2,3], i:-12, j:[], k:{}, l:'', m:"", n:0, o:1E12, p:1e-2}, 'Parse object with literal values');
	assert.equal(isNaN(Mark.parse("{a:NaN}").a), true, 'Parse object {a:NaN}');
	assert.equal(isFinite(Mark.parse("{a:Infinity}").a), false, 'Parse object {a:Infinity}');
	assert.equal(isNaN(Mark.parse("-NaN")), true, 'Parse value -NaN');
	assert.equal(isFinite(Mark.parse("-Infinity")), false, 'Parse value -Infinity');
	
	// check JSON model
	var obj = Mark.parse('{obj:123}');
	assert.deepEqual(obj.constructor.name, 'Object', 'JSON constructor.name');
	
	assert.end() ;
});