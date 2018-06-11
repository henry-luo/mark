const test = require('tape') ;
const Mark = require('./../mark.js');

test('Mark parse error handling ', function(assert) {
	// Mark parser
	assert.throws(function () { Mark.parse(null); }, /Unexpected end of input/, "Mark should throw error with empty source, following JSON.parse");
	assert.throws(function () { Mark.parse(''); }, /Unexpected end of input/, "Mark should throw error with empty source, following JSON.parse");
	assert.throws(function () { Mark.parse('  '); }, /Unexpected character EOF/, "Mark should throw error with empty source, following JSON.parse");
	
	assert.throws(function () { Mark.parse('{div'); }, /Unexpected end of input/, "Missing closing bracket");
	assert.throws(function () { Mark.parse('{div "text"'); }, /Unexpected end of input/, "Missing closing bracket");
	assert.throws(function () { Mark.parse('Infinte'); }, /Unexpected character/, "Unexpected word for number");
	assert.throws(function () { Mark.parse('{div "123":123}'); }, /Numeric key not allowed as Mark property name/, "Number not allowed as key");

	assert.throws(function () { Mark.parse('{a;2}'); }, /Character ';' should be escaped in Mark pragma/, "Character ';' should be escaped in pragma");
	assert.throws(function () { Mark.parse('{obj prop:{a;2}}'); }, /Character ';' should be escaped in Mark pragma/, "Character ';' should be escaped in pragma");
	assert.throws(function () { Mark.parse("{a > b ? true:false}"); }, /Bad object/, "Character ':' should be escaped in pragma");
	assert.throws(function () { Mark.parse("{div 'text' 'text'?}"); }, /Unexpected character/, "This is not a valid pragma");
	
	assert.throws(function () { Mark.parse('[1,,2]'); }, /Missing array element/, "Missing array element");
	
	//assert.throws(function () { Mark.parse('{div prop:trueprop2:123}'); }, /Unexpected character/, "Keyword support");
	
	// property key must be unique
	assert.throws(function () { Mark.parse('{a:1, a:2}'); }, /Duplicate key not allowed: a/, "Property key in JSON must be unique");
	assert.throws(function () { Mark.parse('{obj a:1, a:2}'); }, /Duplicate key not allowed: a/, "Property key in Mark must be unique");
	
	// Mark constructor
	assert.throws(function () { Mark(123); }, /Type name should be a string/, "Type name should be a string");
	
	try {
		Mark.parse('{obj \n p:true 123}');
	} catch (e) {
		assert.equal(e.message.startsWith("Bad object"), true, "Error message");
		assert.equal(e.lineNumber, 2, "Error line number");
		assert.equal(e.columnNumber, 9, "Error column number");
	}
	
	assert.end();
});