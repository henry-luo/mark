const test = require('tape');
const Mark = require('./../mark.js');
const $pragma = Symbol.for('Mark.pragma');

test('Parse Mark object', function(assert) {
	assert.equal(Mark.parse('{obj}').constructor.name, 'obj', "Mark object constructor.name should be 'obj'");
	assert.equal(Mark.parse('{HTML}').constructor.name, 'HTML', "Mark object constructor.name should be 'HTML'");
	assert.equal(Mark.parse('{this.name}').constructor.name, 'this.name', "Mark object name can have '.'");
	assert.equal(Mark.parse('{data-table}').constructor.name, 'data-table', "Mark object name can have '-'");
	assert.equal(Mark.parse('{"obj":"value"}').constructor.name, "Object", "JSON object constructor should be 'Object'");
	
	// test name
	assert.equal(Mark.parse('{$obj}').constructor.name, '$obj', "Mark object constructor.name should be '$obj'");
	assert.equal(Mark.parse('{obj $length:12}').$length, 12, "Mark object $length should be 12");
	
	// test properties
	assert.equal(Mark.parse('{div width:10}').width, 10, "Object 'width' property should be 10");
	assert.equal(Mark.parse('{div style:{border-width:"10px"}}').style['border-width'], "10px", 'Object {div style:{width:"10px"}}.style["border-width"] should be "10px"');
	assert.equal(Mark.parse('{div style:{width:"10px"}}').style.width, "10px", 'Object {div style:{width:"10px"}}.style.width should be "10px"');
	assert.equal(Mark.parse('{div "class":"large"}').class, "large", 'Object {div "class":"large"}.class should be "large"');
	assert.equal(Mark.parse("{div 'class':'large'}").class, "large", 'Object {div "class":"large"}.class should be "large"');
	assert.equal(Mark.parse("{obj length:100}").length, 100, 'Object {obj length:100}.length should be 100');
	assert.equal(Mark.parse("{obj length:100}").properties.length, 100, 'Object {obj length:100}.properties.length should be 100');
	assert.deepEqual(Object.keys(Mark.parse('{obj}')), [], 'Object {obj}.keys() should be empty');
	assert.deepEqual(Object.keys(Mark.parse('{div class:"test", style:{color:"red"}}')), ['class','style'], 
		'Object {div class:"test", style:{color:"red"}} keys should be ["class","style"]');
	assert.deepEqual(Mark.parse("{path d:['M', 10, 10, 'H', 90, 'V', 90, 'H', 10, 'L', 10, 10]}").d, ['M', 10, 10, 'H', 90, 'V', 90, 'H', 10, 'L', 10, 10], "Path d with array of data");
	assert.deepEqual(Mark.parse("{form id:'test-form', buttons:[{kind:'back'}, 'save', {action:'submit', class:'btn btn-warning'}] }").buttons, 
		[{kind:'back'}, 'save', {action:'submit', class:'btn btn-warning'}] , "form buttons with array of data");
	
	// test content model
	assert.equal(Mark.parse('{obj}').length, 0, "Object {obj}.length should be 0");
	assert.equal(Mark.parse('{div "text"}').length, 1, 'Object {div "text"}.length should be 1');
	assert.equal(Mark.parse('{div "text" {br}}').length, 2, 'Object {div "text" {br}}.length should be 2');
	assert.equal(Mark.parse('{div "text"}')[0], "text", 'Object {div "text"}[0] should be "text"');
	assert.equal(Mark.parse('{div {br}}')[0].constructor.name, "br", 'Object {div {br}}.constructor.name should be "br"');
		
	// test Mark in JSON
	assert.equal(Mark.parse('{obj:{div "text"}}').obj.constructor.name, "div", "Mark object can be embedded in JSON");
	
	// test JSON in Mark
	assert.equal(Mark.parse('{div {width:1}}')[0].width, 1, "JSON object allowed as Mark content");
	assert.equal(Mark.parse('{div {"width":1}}')[0].width, 1, "JSON object allowed as Mark content");
	
	// test Mark pragma
	assert.equal(Mark.parse('{!-- comment --}').constructor.name, "Object", "Mark pragma");
	assert.equal(Mark.parse('{!-- comment --}')[$pragma], "!-- comment --", "Mark pragma as root");
	assert.equal(Mark.parse('{div {!-- comment --} }')[0][$pragma], "!-- comment --", "Mark pragma as content");
	assert.equal(Mark.parse("{'some text' + ' and more'}")[$pragma], "'some text' + ' and more'", "Mark pragma parsing that needs backtracking");
	let pragma = Mark.parse("{div width:'100%' 'text'!}");
	assert.equal(pragma[$pragma], "div width:'100%' 'text'!", "Mark pragma parsing that needs backtracking");
	assert.equal(pragma.constructor.name, "Object", "Mark pragma constructor.name should be 'Object'");
	
	// test multiline text
	assert.equal(Mark.parse('{div "string"\n" 2nd line"\n\t\t" and 3rd"}')[0], "string 2nd line and 3rd", "Mark multiline text");
	
	// test unicode support
	assert.equal(Mark.parse('{div "中文"}')[0], "中文", "Mark unicode support");
	
	assert.end();
});