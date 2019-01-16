const test = require('tape') ;
const Mark = require('./../mark.js');

test('Mark parse error handling ', function(assert) {
	assert.throws(function () { Mark(); }, /Type name should be a string/, "Mark construction needs type name");
	
	assert.throws(function () { Mark.parse(null); }, /Unexpected end of input/, "Mark throws error with empty source, following JSON.parse");
	assert.throws(function () { Mark.parse(''); }, /Unexpected end of input/, "Mark throws error with empty source, following JSON.parse");
	assert.throws(function () { Mark.parse('  '); }, /Unexpected character EOF/, "Mark throws error with empty source, following JSON.parse");
	
	assert.throws(function () { Mark.parse('{div'); }, /Unexpected end of input/, "Missing closing bracket");
	assert.throws(function () { Mark.parse('{div "text"'); }, /Unexpected end of input/, "Missing closing bracket");
	assert.throws(function () { Mark.parse('Infinte!'); }, /Expect end of input/, "Unexpected character");
	assert.throws(function () { Mark.parse('{div "123":123}'); }, /Numeric key not allowed as Mark property name/, "Number not allowed as key");
	
	assert.throws(function () { Mark.parse('[1,,2]'); }, /Missing array element/, "Missing array element");
	
	//assert.throws(function () { Mark.parse('{div prop:trueprop2:123}'); }, /Unexpected character/, "Keyword support");
	
	// property key must be unique
	assert.throws(function () { Mark.parse('{a:1, a:2}'); }, /Duplicate key not allowed: a/, "Property key in JSON must be unique");
	assert.throws(function () { Mark.parse('{obj a:1, a:2}'); }, /Duplicate key not allowed: a/, "Property key in Mark must be unique");
	
	// Mark constructor
	assert.throws(function () { Mark(123); }, /Type name should be a string/, "Type name should be a string");
	
	// pragma escape
	assert.throws(function () { Mark.parse('(? pragma unescaped? ?)'); }, /'\?' should be escaped in Mark pragma/, "'?' should be escaped");
	
	try {
		Mark.parse('{obj \n p:true 123}');
	} catch (e) {
		console.log(e.message);
		assert.equal(e.message.lastIndexOf("Unexpected character") === 0, true, "Error message");
		assert.equal(e.lineNumber, 2, "Error line number");
		assert.equal(e.columnNumber, 9, "Error column number");
	}
	
	// Mark binary
	assert.throws(function () { Mark.parse('{:abc'); }, /Missing base64 end delimiter/, "Based64 character error");
	assert.throws(function () { Mark.parse('{:abc-}'); }, /Invalid base64 character/, "Based64 character error");
	assert.throws(function () { Mark.parse('{:abcd=}'); }, /Invalid base64 stream length/, "Based64 length error");	
	assert.throws(function () { Mark.parse('{:abcde}'); }, /Invalid base64 stream length/, "Based64 length error");	
	
	assert.throws(function () { Mark.parse('{:~abc}'); }, /Missing ascii85 end delimiter/, "Based64 character error");
	assert.throws(function () { Mark.parse('{:~abcv~}'); }, /Invalid ascii85 character/, "Based64 character error");
	assert.throws(function () { Mark.parse('{:~abcdef~}'); }, /Invalid ascii85 stream length/, "Based64 length error");	

	assert.end();
});