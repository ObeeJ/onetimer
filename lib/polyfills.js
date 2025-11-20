
// Browser compatibility polyfills
if (typeof document !== 'undefined' && !document.adoptedStyleSheets) {
  document.adoptedStyleSheets = [];
}

// Add filter method if missing
if (Array.prototype.filter === undefined) {
  Array.prototype.filter = function(callback) {
    const result = [];
    for (let i = 0; i < this.length; i++) {
      if (callback(this[i], i, this)) {
        result.push(this[i]);
      }
    }
    return result;
  };
}
