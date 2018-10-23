let MarkMutate = function(Mark, pushFunc, lenSymbol) {
	let $length = lenSymbol;

	let api = {
		// todo: do content normalization
		push: pushFunc,
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
		
		// similar to Array.slice()
		splice(index, cnt) {
			if (cnt < 0) { cnt = 0; }  // negative cnt treated as zero;
			let len = this[$length];
			if (index < 0) { index = 0; }
			else if (index > len) { index = len; }
			
			// copy out the trailing items
			let trail = [];
			for (let i=index + cnt; i < len; i++) { trail.push(this[i]); }
			// delete the properties
			for (let i=len-1; i >= index; i--) { delete this[i]; }
			this[$length] = index;
			
			// push the new items
			if (arguments.length > 2) {
				for (let i=2; i<arguments.length; i++) {
					this.push(arguments[i]);
				}
			}
			// copy back the trailing items
			if (trail.length) this.push(trail);
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
				index = Math.round(key);
			}
			else { return this; }  // unknown key type
			// set indexed property, i.e. Mark content
			this.splice(index, 1, value);
			return this;
		},
		
		// reset properties and content of this object. assuming obj is a normalized Mark object
		replaceWith: function(obj) {
			let trg = this;
			// console.log('src obj:', obj);
			// reset properties and contents
			for (let p in trg) { if (typeof trg[p] !== 'function') delete trg[p]; }
			for (let i=0, len=trg[$length]; i<len; i++) { delete trg[i]; }  // console.log('obj afte reset:', trg);
			// copy over new constructr, properties and contents
			Object.setPrototypeOf(trg, Object.getPrototypeOf(obj));
			for (let p in obj) { trg[p] = obj[p]; }
			var length = obj[$length];
			for (let i=0; i<length; i++) {
				Object.defineProperty(trg, i, {value:obj[i], writable:true, configurable:true}); // make content item non-enumerable
			}
			trg[$length] = length;  // console.log('obj afte copy:', trg);
			// no change to $parent
			return this;
		}		
	}
	
	// set the APIs
	for (let a in api) {
		// API functions are set to non-enumerable
		Object.defineProperty(Mark.prototype, a, {value:api[a], writable:true, configurable:true});
	}	
};

module.exports = MarkMutate;