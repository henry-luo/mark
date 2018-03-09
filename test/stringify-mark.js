const test = require('tape');
const Mark = require('./../mark.js');

test('Stringify JSON object', function(assert) {
	assert.equal(Mark.stringify(Mark.parse("{a:12.4, b:true, c:false, d:'str', e:null, g:1, h:[1,2,3], i:-12, j:[], k:{}, l:'', m:\"\", n:0, p:1e-2}")), 
		"{a:12.4, b:true, c:false, d:\"str\", e:null, g:1, h:[1,2,3], i:-12, j:[], k:{}, l:\"\", m:\"\", n:0, p:0.01}", "Stringify JSON object");
	assert.end() ;
});

test('Stringify Mark object', function(assert) {
	assert.equal(Mark.stringify(Mark.parse('{obj}')), '{obj}', "Stringify {obj}");
	assert.equal(Mark.stringify(Mark.parse('{div width:10}')), '{div width:10}', "Stringify {div width:10}");
	assert.equal(Mark.stringify(Mark.parse('{div "text"}')), '{div "text"}', 'Stringify {div "text"}');
	assert.equal(Mark.stringify(Mark.parse("{div 'text'}")), '{div "text"}', "Stringify {div 'text'}");
	assert.equal(Mark.stringify(Mark.parse('{div {br}}')), '{div {br}}', "Stringify {div {br}}");
	assert.equal(Mark.stringify(Mark.parse('{div width:null}')), '{div width:null}', "Stringify property with null value}");
	var t = {obj:undefined};
	assert.equal(Mark.stringify(t), '{}', "Stringify undefined property");
	assert.equal(Mark.stringify([1, null, undefined]), '[1,null,null]', "Stringify undefined value in array");
	// JSON inside Mark
	assert.equal(Mark.stringify(Mark.parse('{div {width:10}}')), '{div {width:10}}', "Stringify {div {width:10}}");
	// stringify with identation
	assert.equal(Mark.stringify(Mark.parse('{div width:10 {!--comment--} "test" {br}}'), {space:'  '}), '{div width:10 \n  {!--comment--} \n  "test" \n  {br}\n}', "Stringify with identation");
	// stringify omit comma
	assert.equal(Mark.stringify(Mark.parse('{div width:10 height:"15px" margin:[5 10 10 5]}'), {omitComma:true}), '{div width:10 height:"15px" margin:[5 10 10 5]}', "Stringify without comma");
	assert.end();
});