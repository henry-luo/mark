// Convert tape tests to jasmine for browser testing
const Mark = require('./../mark.js');

// Convert from test/parse-mark.js - key tests
describe('Parse Mark object (converted from tape)', function() {
    it('should parse empty string as null', function() {
        expect(Mark.parse("  \t")).toBe(null);
    });
    
    it('should parse infinite numbers', function() {
        expect(Mark.parse("inf")).toBe(Infinity);
        expect(Mark.parse("-inf")).toBe(-Infinity);
        expect(Number.isNaN(Mark.parse("nan"))).toBe(true);
    });
    
    it('should parse literal values', function() {
        expect(Mark.parse("true")).toBe(true);
        expect(Mark.parse("word")).toBe(Symbol.for("word"));
    });
    
    it('should parse multiple values with semicolon', function() {
        expect(Mark.parse("a; 123")).toEqual([Symbol.for("a"), 123]);
    });
    
    it('should throw error for invalid syntax', function() {
        expect(function() { Mark.parse("a 123"); }).toThrow();
    });
    
    it('should parse mark lists', function() {
        expect(Mark.parse("(1, 2, 3)")).toEqual([1, 2, 3]);
        expect(Mark.parse("(1, null, 3)")).toEqual([1, 3]);
    });
    
    it('should parse mark objects', function() {
        var div = Mark.parse('<div style:{width:"10px"}>');
        expect(div.constructor.name).toBe('div');
        expect(div.style.width).toBe('10px');
    });
    
    it('should parse quoted strings', function() {
        expect(Mark.parse('"hello world"')).toBe('hello world');
    });
    
    it('should parse mark elements with content', function() {
        var element = Mark.parse('<div "text">');
        expect(element.constructor.name).toBe('div');
        expect(element.length).toBe(1);
        expect(element[0]).toBe('text');
    });
});

// Convert from test/stringify-mark.js - key tests  
describe('Stringify Mark object (converted from tape)', function() {
    it('should stringify literal values', function() {
        expect(Mark.stringify(true)).toBe('true');
        expect(Mark.stringify(123)).toBe('123');
        expect(Mark.stringify(null)).toBe('null');
    });
    
    it('should stringify symbols', function() {
        expect(Mark.stringify(Symbol.for('test'))).toBe("'test'");
    });
    
    it('should stringify mark objects', function() {
        var div = new Mark('div');
        div.width = '10px';
        expect(Mark.stringify(div)).toBe('<div width:"10px">');
    });
    
    it('should stringify mark elements with content', function() {
        var div = new Mark('div');
        div.push('text');
        expect(Mark.stringify(div)).toBe('<div "text">');
    });
});

// Convert from test/mark-model.js - key tests
describe('Mark object model (converted from tape)', function() {
    it('should create mark objects with correct constructor names', function() {
        var div = new Mark('div');
        expect(div.constructor.name).toBe('div');
    });
    
    it('should handle mark object properties', function() {
        var div = new Mark('div');
        div.width = '10px';
        expect(div.width).toBe('10px');
    });
    
    it('should handle mark object content', function() {
        var div = new Mark('div');
        div.push('text');
        expect(div.length).toBe(1);
        expect(div[0]).toBe('text');
    });
    
    it('should merge text content', function() {
        var div = new Mark('div');
        div.push('hello');
        div.push(' world');
        expect(div.length).toBe(1);
        expect(div[0]).toBe('hello world');
    });
});

// Convert from test/parse-error.js - error handling tests
describe('Mark parse error handling (converted from tape)', function() {
    it('should handle missing closing brackets', function() {
        expect(function() { Mark.parse('[1, 2, 3'); }).toThrow();
        expect(function() { Mark.parse('(1, 2, 3'); }).toThrow();
    });
    
    it('should handle unexpected characters', function() {
        expect(function() { Mark.parse('123abc'); }).toThrow();
    });
    
    it('should handle invalid property keys', function() {
        expect(function() { Mark.parse('{123: "value"}'); }).toThrow();
    });
    
    it('should handle missing array elements', function() {
        expect(function() { Mark.parse('[1, , 3]'); }).toThrow();
    });
    
    it('should handle duplicate property keys', function() {
        expect(function() { Mark.parse('{a: 1, a: 2}'); }).toThrow();
    });
});

// Convert from test/parse-json.js - JSON compatibility tests
describe('Parse JSON compatibility (converted from tape)', function() {
    it('should parse JSON objects', function() {
        var obj = Mark.parse('{"name": "test", "value": 123}');
        expect(obj.name).toBe('test');
        expect(obj.value).toBe(123);
    });
    
    it('should parse JSON arrays', function() {
        expect(Mark.parse('[1, 2, "three"]')).toEqual([1, 2, 'three']);
    });
    
    it('should parse JSON strings', function() {
        expect(Mark.parse('"hello"')).toBe('hello');
    });
    
    it('should parse JSON numbers', function() {
        expect(Mark.parse('123.456')).toBe(123.456);
        expect(Mark.parse('-42')).toBe(-42);
    });
    
    it('should handle empty objects and arrays', function() {
        expect(Mark.parse('{}')).toEqual({});
        expect(Mark.parse('[]')).toEqual([]);
    });
});

// Convert from test/mark-dom.js - DOM-like functionality tests
describe('Mark DOM functionality (converted from tape)', function() {
    it('should handle parent-child relationships', function() {
        var div = new Mark('div');
        var span = new Mark('span');
        div.push(span);
        
        expect(Mark.parent(span)).toBe(div);
        expect(div.length).toBe(1);
        expect(div[0]).toBe(span);
    });
    
    it('should handle nested elements', function() {
        var div = Mark.parse('<div <span "text">>');
        expect(div.constructor.name).toBe('div');
        expect(div.length).toBe(1);
        expect(div[0].constructor.name).toBe('span');
        expect(div[0][0]).toBe('text');
    });
    
    it('should handle mixed content', function() {
        var div = Mark.parse('<div "text" <br> "more text">');
        expect(div.constructor.name).toBe('div');
        expect(div.length).toBe(3);
        expect(div[0]).toBe('text');
        expect(div[1].constructor.name).toBe('br');
        expect(div[2]).toBe('more text');
    });
});

// Convert from test/stringify-mark.js - more stringify tests
describe('Stringify Mark advanced (converted from tape)', function() {
    it('should stringify with indentation', function() {
        var div = new Mark('div');
        div.width = '10px';
        var stringified = Mark.stringify(div, null, 2);
        expect(stringified).toContain('div');
        expect(stringified).toContain('width');
    });
    
    it('should stringify nested objects', function() {
        var div = new Mark('div');
        var span = new Mark('span');
        span.push('text');
        div.push(span);
        
        var result = Mark.stringify(div);
        expect(result).toContain('<div');
        expect(result).toContain('<span');
        expect(result).toContain('text');
    });
    
    it('should handle undefined and null values', function() {
        expect(Mark.stringify(undefined)).toBe(undefined);
        expect(Mark.stringify(null)).toBe('null');
    });
    
    it('should stringify arrays', function() {
        expect(Mark.stringify([1, 2, 3])).toBe('[1, 2, 3]');
        expect(Mark.stringify(['a', 'b'])).toBe('["a", "b"]');
    });
});

// Convert from test/parse-mark.js - more parsing tests
describe('Parse Mark advanced (converted from tape)', function() {
    it('should parse datetime values', function() {
        var date = Mark.parse("t'2025-01-01'");
        expect(date instanceof Date).toBe(true);
        expect(date.getFullYear()).toBe(2025);
    });
    
    it('should parse binary data', function() {
        var binary = Mark.parse("b'\\x48656c6c6f'"); // "Hello" in hex
        expect(binary instanceof ArrayBuffer).toBe(true);
        expect(binary.byteLength).toBe(5);
    });
    
    it('should parse base64 data', function() {
        var binary = Mark.parse("b'\\64SGVsbG8='"); // "Hello" in base64
        expect(binary instanceof ArrayBuffer).toBe(true);
        expect(binary.byteLength).toBe(5);
    });
    
    it('should parse complex nested structures', function() {
        var complex = Mark.parse('<div class:"container"; <h1 "Title"> <p "Content">>');
        expect(complex.constructor.name).toBe('div');
        expect(complex.class).toBe('container');
        expect(complex.length).toBe(2);
        expect(complex[0].constructor.name).toBe('h1');
        expect(complex[1].constructor.name).toBe('p');
    });
    
    it('should parse comments', function() {
        var result = Mark.parse('<div //comment\n>');
        expect(result.constructor.name).toBe('div');
        
        var result2 = Mark.parse('<div /*comment*/>');
        expect(result2.constructor.name).toBe('div');
    });
    
    it('should parse multiline text', function() {
        var text = Mark.parse('"line 1\\nline 2\\nline 3"');
        expect(text).toContain('line 1');
        expect(text).toContain('line 2');
        expect(text).toContain('line 3');
    });
});

// Convert from test/mark-model.js - more model tests  
describe('Mark object model advanced (converted from tape)', function() {
    it('should support array-like operations', function() {
        var div = Mark.parse('<div "text" <br> "more" <b "bold"> <\'!--\' "comment">>');
        
        expect(div.length).toBe(5);
        expect(div.indexOf('more')).toBe(2);
        expect(div.includes('more')).toBe(true);
        expect(div.slice(1, 3)).toEqual([div[1], 'more']);
    });
    
    it('should support iteration', function() {
        var div = Mark.parse('<div "a" <br> "b">');
        
        var items = [];
        for (var item of div) {
            items.push(item);
        }
        expect(items.length).toBe(3);
        expect(items[0]).toBe('a');
        expect(items[2]).toBe('b');
    });
    
    it('should handle pop operations', function() {
        var div = new Mark('div');
        div.push('a');
        div.push(new Mark('br')); 
        div.push('c');
        
        var popped = div.pop();
        expect(popped).toBe('c');
        expect(div.length).toBe(2);
    });
    
    it('should support filtering and mapping', function() {
        var div = new Mark('div');
        div.push(1, 2, 3, 4, 5);
        
        var evens = div.filter(function(x) { return x % 2 === 0; });
        expect(evens).toEqual([2, 4]);
        
        var doubled = div.map(function(x) { return x * 2; });
        expect(doubled).toEqual([2, 4, 6, 8, 10]);
    });
    
    it('should handle Mark.list creation', function() {
        var list = Mark.list([1, 2, 3]);
        expect(Array.isArray(list)).toBe(true);
        expect(list).toEqual([1, 2, 3]);
    });
});
