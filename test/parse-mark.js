const test = require('tape');
const Mark = require('./../mark.js');

test('Parse Mark object', function(assert) {
	// test literal values
	assert.equal(Mark.parse("  \t"), null, "Empty string");
	assert.equal(Mark.parse("inf"), Infinity, "Infinite number");
	assert.equal(Mark.parse("infinity"), Symbol.for("infinity"), "Infinite string");
	assert.equal(Mark.parse("-inf"), -Infinity, "Negative infinite number");
	assert.ok(Number.isNaN(Mark.parse("nan")), 'Not a number');
	assert.equal(Mark.parse("true"), true, "True value");
	assert.equal(Mark.parse("word"), Symbol.for("word"), "Unquoted identifier as string value");
	assert.deepEqual(Mark.parse("a; 123"), [Symbol.for("a"), 123], "Multiple top-level values");
	assert.throws(() => Mark.parse("a 123"), /SyntaxError/, "Expected ';' or line breakafter value");

	// test array
	assert.deepEqual(Mark.parse("[1, true, 'text']"), [1, true, Symbol.for('text')], "Mark array");
	assert.deepEqual(Mark.parse("[1, true, 'yellow']"), [1, true, Symbol.for('yellow')], "Unquoted identifier as string value in Mark array");
	assert.throws(() => Mark.parse("[1 true, 'text']"), /Unexpected character/, "Comma is not optional in Mark array");
	
	// test name
	assert.equal(Mark.parse('<HTML>').constructor.name, 'HTML', "Mark object constructor.name should be 'HTML'");
	assert.throws(() => Mark.parse('<this.name>'), /SyntaxError/, "Mark object name cannot have '.'");
	assert.throws(() => Mark.parse('<this-name>'), /SyntaxError/, "Mark object name cannot have '-'");
	assert.throws(() => Mark.parse('<data-table>'), /SyntaxError/, "Mark object name cannot have '-'");
	assert.equal(Mark.parse('{"obj":"value"}').constructor.name, "Object", "JSON object constructor should be 'Object'");
	assert.equal(Mark.parse('<$obj_name>').constructor.name, '$obj_name', "Mark object constructor.name should be '$obj_name'");
	assert.equal(Mark.parse('<obj $length:12>').$length, 12, "Mark object $length should be 12");
	assert.equal(Mark.parse("<'quoted name'>").constructor.name, 'quoted name', "Mark object constructor.name should be 'quoted name'");
	
	// test properties
	assert.deepEqual(Mark.parse("<div style:{color:red, width:'100px', height:50}>").style,
		{color: Symbol.for('red'), width: Symbol.for('100px'), height: 50}, "Map as element attribute");
	assert.equal(Mark.parse('<div margin:-10>').margin, -10, "Element margin should be -10");
	assert.equal(Mark.parse('<div margin:+10>').margin, +10, "Element margin should be +10");
	assert.equal(Mark.parse("<div style:{'border-width':'10px'}>").style['border-width'], Symbol.for('10px'), 'Element style["border-width"] should be "10px"');
	assert.equal(Mark.parse('<div style:{width:"10px"}>').style.width, "10px", 'Element div.style.width should be "10px"');
	assert.equal(Mark.parse('<div class:"large">').class, "large", 'Element class should be "large"');
	assert.deepEqual(Object.keys(Mark.parse('<obj>')), [], 'Element keys() should be empty');
	assert.deepEqual(Object.keys(Mark.parse('<div class:"test", style:{color:"red"}>')), ['class','style'], 
	 	'Element keys should be ["class","style"]');
	assert.deepEqual(Mark.parse("<path d:['M', 10, 10, 'H', 90, 'V', 90, 'H', 10, 'L', 10, 10]>").d, 
		[Symbol.for('M'), 10, 10, Symbol.for('H'), 90, Symbol.for('V'), 90, Symbol.for('H'), 10, Symbol.for('L'), 10, 10], "Path d with array of data");
	assert.deepEqual(Mark.parse("<form id:'test-form', buttons:[{kind:'back'}, 'save', {action:'submit', class:'btn btn-warning'}]>").buttons, 
	 	[{kind: Symbol.for('back')}, Symbol.for('save'), {action: Symbol.for('submit'), class: Symbol.for('btn btn-warning')}], "form buttons with array of data");
	assert.deepEqual(Object.keys(Mark.parse("<obj map:1, every:2, constructor:3>")), 
	 	["map", "every", "constructor"], "properties should not conflict with Mark API functions");

	// test content model
	assert.equal(Mark.parse('<obj>').length, 0, "Element <obj>.length should be 0");
	assert.equal(Mark.parse('<div "text">').length, 1, 'Element <div "text">.length should be 1');
	assert.equal(Mark.parse('<div "text" <br>>').length, 2, 'Element <div "text" <br>>.length should be 2');
	assert.equal(Mark.parse('<div "text">')[0], "text", 'Element <div "text">[0] should be "text"');
	assert.equal(Mark.parse('<div "text" "" "merged">')[0], "textmerged", 'Element text merged');
	assert.throws(() => Mark.parse('<div "">'), /SyntaxError/, 'Empty text not allowed');
	assert.throws(() => Mark.parse("<div ''>"), /SyntaxError/, 'Empty symbol not allowed');

	assert.equal(Mark.parse('<div <br>>')[0].constructor.name, "br", 'Element <div <br>>.constructor.name should be "br"');

	// test element in map
	assert.equal(Mark.parse('{obj:<div "text">}').obj.constructor.name, "div", "Element can be embedded in map");
	
	// test map in element
	assert.equal(Mark.parse('<div {width:1}>')[0].width, 1, "map allowed as element content");
	assert.equal(Mark.parse('<div {"width":1}>')[0].width, 1, "map allowed as element content");

	// test multiline text
	assert.equal(Mark.parse('<div "string"\n" 2nd line"\n\t\t" and 3rd">')[0], "string 2nd line and 3rd", "Mark multiline text");
	// test text escape
	assert.equal(Mark.parse('"\\u002B\\r\\n\\t"'), "+\r\n\t", "Mark text escape");
	assert.equal(Mark.parse('"text\\\rcombined\\\r\ntogether"'), "textcombinedtogether", "Mark text with escaped line end");
	// test Unicode support
	assert.equal(Mark.parse('<div "中文">')[0], "中文", "Mark Unicode support");
	
	// test comment
	assert.equal(Mark.parse('<div //comment\n>').constructor.name, "div", "Mark with line comment");
	assert.equal(Mark.parse('<div /*comment*/>').constructor.name, "div", "Mark with block comment");
	assert.equal(Mark.parse('<div /*comment /*nested*/ */>').constructor.name, "div", "Mark with nested block comment");

	// test shorthand
	assert.equal(Mark('<div "text">').constructor.name, "div", "Mark() shorthand");
	assert.throws(() => Mark(' <div "text">'), /Invalid Mark type name/, "Mark() shorthand should not start with space");
	assert.deepEqual(Mark('[123, "text"]'), [123, "text"], "Mark() shorthand starting with []");
	
	assert.end();
});

function stringArrayBuffer(str) {
    var buffer = new ArrayBuffer(str.length);
    var bytes = new Uint8Array(buffer);
    str.split('').forEach(function(str, i) {
      bytes[i] = str.charCodeAt(0);
    });
    return buffer;
}

function compareArrayBuffers(buffer1, buffer2) {
    var len1 = buffer1.byteLength;
    var len2 = buffer2.byteLength;
    var view1 = new Uint8Array(buffer1);
    var view2 = new Uint8Array(buffer2);

    if (len1 !== len2) {
      return false;
    }

    for (var i = 0; i < len1; i++) {
      if (!view1[i] || view1[i] !== view2[i]) {
        return false;
      }
    }
    return true;
}

test('Parse Mark binary value', function(assert) {
 	// test base64 parsing
 	assert.throws(() => Mark.parse("b'\\n'"), /Invalid binary/, "empty binary is invalid");
	bin = Mark.parse("b'\\64 QXJ0'");  console.log("byte length:", bin.byteLength);
	assert.equal(compareArrayBuffers(bin, stringArrayBuffer("Art")), true, "Parse base64 of 'Art'");
	assert.equal(bin instanceof ArrayBuffer, true, "Mark base64 is instance of ArrayBuffer");
	assert.equal(bin.byteLength, 3, "byteLength of 'Art' is 3");
	assert.equal(compareArrayBuffers(Mark.parse("b'\\64 SGVs bG8 gd29 ybGQ='"), 
		stringArrayBuffer("Hello world")), true, "Parse base64 of 'Hello world'");
	assert.equal(compareArrayBuffers(Mark.parse("b'\\64 SGVsb \t G8gd29 \r\n ybGRzIQ=='"), 
		stringArrayBuffer("Hello worlds!")), true, "Parse base64 of 'Hello worlds!'");
	
// 	var doc = Mark("{doc mime:'text/html' data:[#PGgxPkhlbGxvLCBXb3JsZCE8L2gxPg==]}");
// 	assert.equal(compareArrayBuffers(doc.data, stringArrayBuffer("<h1>Hello, World!</h1>")), true, "Parse base64 of '<h1>Hello, World!</h1>'");
	
// 	// test base85 parsing
// 	bin = Mark('[#~ \n ~]');
// 	assert.equal(compareArrayBuffers(bin, new ArrayBuffer(0)), true, "zero-length base85 binary");
// 	assert.equal(bin.byteLength, 0, "zero-length base85 binary");	
// 	bin = Mark("[#~@ps7tD.7's~]");
// 	assert.equal(compareArrayBuffers(bin, stringArrayBuffer("canumber")), true, "Parse base85 of 'canumber'");
// 	assert.equal(bin instanceof ArrayBuffer, true, "Mark base85 is instance of ArrayBuffer");
// 	assert.equal(bin.byteLength, 8, "byteLength of 'canumber' is 8");
// 	assert.equal(compareArrayBuffers(Mark("[#~BOu! \t \n rDZ~]"), stringArrayBuffer("hello")), true, "Parse base85 of 'hello'");
// 	assert.equal(compareArrayBuffers(Mark("[#~\n@p\ns7\ntD.3~]"), stringArrayBuffer("canumb")), true, "Parse base85 of 'canumb'");
// 	assert.equal(compareArrayBuffers(Mark("[#~ @<5pm \rBfIs ~]"), stringArrayBuffer("ascii85")), true, "Parse base85 of 'ascii85'");
	
 	assert.end();
});