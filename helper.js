// 
//	useful extensions
// 

/* quick access */
if(!Array.prototype.last) {
    Array.prototype.last = function() {
        return this[this.length - 1];
    }
}

/* modulo operation a mathematician is used to */
if(!Number.prototype.mod) { 
    Number.prototype.mod = function (b) {
        return ((this % b) + b) % b;
	};
}

var mod = function (a, b) {
    return ((a % b) + b) % b;
};

/* fix the context a function is executed with respect to*/
var bindThis = function(that, f) {
  return function() {
    return f.apply(that, arguments);
  }
};