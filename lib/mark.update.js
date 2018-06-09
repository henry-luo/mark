var MarkUpdate = function(Mark, lenSymbol) {
	let $length = lenSymbol;
	
	var api = {
		// todo: do content normalization
		push: function() {
			// copy the arguments
			let length = this[$length];
			for (let i=0; i<arguments.length; i++) {
				Object.defineProperty(this, length+i, {value:arguments[i], writable:true, configurable:true}); // make content item non-enumerable
			}
			length += arguments.length;
			this[$length] = length;
			return length;
		},
		pop: function() {
			let length = this[$length];
			if (length > 0) {
				let item = this[length-1];  delete this[length-1];
				this[$length] = length - 1;
				return item;
			} else {
				return undefined;
			}
		},
		// insert item(s) at the given index  // todo: do content normalization
		insert: function(item, index) {
			index = index || 0;
			let length = this[$length];
			if (index < 0 || index > length) { throw "Invalid index"; }
			let offset = item instanceof Array ? item.length:1;
			// shift items after index
			for (let i=length-1; i>=index; i--) {
				Object.defineProperty(this, i+offset, {value:this[i], writable:true, configurable:true});  // make content item non-enumerable
			}
			// insert items
			if (offset > 1) {
				for (let i=0; i<offset; i++) {
					Object.defineProperty(this, index+i, {value:item[i], writable:true, configurable:true});  // make content item non-enumerable
				}
			} else {
				Object.defineProperty(this, index, {value:item, writable:true, configurable:true});  // make content item non-enumerable
			}
			this[$length] = length + offset;
			return this; // for call chaining
		},
		// can consider support 2nd param of cnt (for no. of items to remove)
		// consider remove self
		remove: function(index) {
			if (arguments.length) {
				// shift the items
				var length = this[$length];
				if (index >=0 && index < length) {
					for (var i = index; i < length - 1; i++) { this[i] = this[i+1]; }
					this[$length] = length - 1;
				}
				// else invalid index
			}
			return this; // for call chaining
		},
		
		// to set or get an indexed or named property
		// todo: content normalization
		set: function(key, value) {
			var index;
			if (typeof key === 'string') { 
				if (isNaN(key*1)) { // set named property
					this[key] = value;  
					return this; // returns this, so that the call can be chained
				} 
				index = key*1;	// cast to number	
			}
			else if (typeof key === 'number') {
				index = key;
			}
			else { return this; }  // unknown key type
			// set indexed property, i.e. Mark content
			if (Math.round(index) === index) { // Mark only supports integer key
				// unlike array, Mark content does not allow holes
				if (0 <= index && index < this[$length]) { 
					this[index] = value;
				}
				else if (index === this[$length]) { // push as the last item
					this[index] = value;
					this[$length]
				}
				// index > this[$length], not allowed
			}
			return this;
		},	
	}
	
	// set the APIs
	for (let a in api) {
		// Mark.prototype[a] = api[a];  // direct assignment will make the API functions enumerable
		Object.defineProperty(Mark.prototype, a, {value:api[a], writable:true, configurable:true});  // make API functions non-enumerable

	}	
};

if (typeof module === 'object') module.exports = MarkUpdate;