const $parent = Symbol.for('Mark.parent'),
$length = Symbol.for('Mark.length');

let MarkMutate = function(Mark, pushFunc) {
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
		
		// similar to Array.slice(), but with content normalization
		splice(index, cnt) {
			if (cnt < 0) { cnt = 0; }  // negative cnt treated as zero;
			let len = newlen = this[$length];
			if (index < 0) { index = 0; }
			else if (index > len) { index = len; }
			cnt = Math.min(cnt, len - index);
			
			let trailing = len - (index + cnt);
			// delete the properties
			if (cnt) {
				for (let i=index; i<index+cnt; i++) { delete this[i]; }
				newlen -= cnt;
			}
			
			// insert new items
			if (arguments.length > 2 || trailing) {
				// create a temp Mark object
				let items = Mark('Object');
				// insert new items
				for (let i=2; i<arguments.length; i++) {
					items.push(arguments[i]);
				}
				// insert trailing items if any
				if (trailing) {
					for (let i=0; i<trailing; i++) { items.push(this[index+cnt+i]); }
				}
				// copy items back to this object
				let extra = Mark.lengthOf(items);
				if (extra) {
					let i = 0;  newlen = index + extra;
					// merge first text node if needed
					if (typeof items[0] === 'string' && index-1 >= 0 && typeof this[index-1] === 'string') { 
						this[index-1] = this[index-1] + items[0];  i++;  index--;  newlen--;
					}
					for (; i<extra; i++) {
						Object.defineProperty(this, index+i, {value:items[i], writable:true, configurable:true}); // make content item non-enumerable
						if (typeof items[i] === 'object') { this[index+i][$parent] = this; }
					}
				}
			}
			// delete trailing items if needed
			if (newlen < len) { 
				for (let i=0; i<len - newlen; i++) { delete this[newlen+i]; } 
			}
			this[$length] = newlen;
			return this; // for call chaining
		},
		
		// to set an indexed or named property
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
		}		
	}
	
	// expand Mark APIs with the mutative functions
	for (let a in api) {
		// API functions are set to non-enumerable
		Object.defineProperty(Mark.prototype, a, {value:api[a], writable:true, configurable:true});
	}
};

module.exports = MarkMutate;