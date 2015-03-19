// =============================================================================
//  Need some helper to write functional code?
// =============================================================================

/** 
 * Identity function.
 * @function
 * @param  {Anything} x 
 * @return {Anything} - x
 */
var identity = function (x) { return x; };

/** 
 * Partial function application.
 * @function
 * @param  {function} f - A function which takes several arguments.
 * @param  {...object} args - Placeholder several, n say, arguments.
 * @return {function} - Returns the given function with the first n arguments fixed.
 */
var partial = function (f, _) { 
	var fixedArgs = Array.prototype.slice.call(arguments,1);
	return function (_) {
		var args = Array.prototype.slice.call(arguments);
		return f.apply(this, fixedArgs.concat(args));
	};
};

/** 
 * Addition.
 * @function
 * @param  {Number} a - A number.
 * @param  {Number} b - A number.
 * @return {Number} - Returns the sum of the arguments.
 */
var add =  function (a, b) { return a + b;};

/** 
 * Add a certain value.
 * @function
 * @param  {Number} n - A number.
 * @return {function} - A function that adds n to what ever argument is fed to it.
 */
var addN = function (n) { return partial(add, n); };

/** 
 * Produces a compare function that can be fed to Array.sort.
 * @function
 * @param  {function} f - A function {obj} a -> {Number} f(a).
 * @return {function} - A function (a,b) => f(a) - f(b).
 */
var byValuesOf = function (f) {
	return function (a, b) {
		return f(a) - f(b);
	};
};

/** 
 * Produces a function that collects results in an array.
 * @function
 * @param  {function} f - Any function.
 * @param  {function} g - Any function.
 * @return {function} - A function (...args) => [f(...args), g(...args)].
 */
var combine = function (f, g) {
	return function (_) {
		return [f.apply(this, arguments), g.apply(this, arguments)];
	};
};

/** 
 * Finds a points of the given list for which the given function attains its maximum value.
 * @function
 * @param  {Object[]} list - A list of arguments.
 * @param  {function} mutator - A function.
 * @return {Object} - An object for which the given function attains its maximum value.
 */
var argmax = function (list, mutator) {

	var i = list.length - 2;
	var max = list.length - 1;
	if (mutator === undefined) { 
		for (; i >= 0; i--) {
			if(list[i] >= list[max]) max = i;
		}
	} else {
		for (; i >= 0; i--) {
			if(mutator(list[i]) >= mutator(list[max])) max = i;
		}
	}
	return list[max];
};

/** 
 * Picks a random element from a list.
 * @function
 * @param  {Object[]} list - A list of elements.
 * @return {Object} - A randomly picked element from the list.
 */
var pickRandom = function (list) {
	return list[Math.floor(Math.random()*(list.length-1))];
};

/** 
 * ...
 * @function
 * @param  {} map - 
 * @return {} - .
 */
var wrapGetter= function (map, alt) {
	var alt = alt === undefined ? 0 : alt;
	return function (key) {
		return map.has(key) ? map.get(key) : alt;
	};
};

var geq = function (n) {
	return function (x) {
		return x >= n;
	}
};

var eq = function (n) {
	return function (x) {
		return x == n;
	};
};


// Haskells insertWith, with permuted signatures.
var insertWith = function (mutator, initialValue, map, key) {
	var newValue = map.has(key) ? mutator(map.get(key), initialValue) : initialValue;
	map.set(key, newValue);
	return map
};

var makeInserWithable = function (obj) {
	if(obj.hasOwnProperty("insertWith")) throw "Overwriting adjust method.";
	obj.insertWith = function (mutator, initialValue, key) {
		return insertWith(mutator, initialValue, obj, key);
	};
};

// Should behave like insertWith with fixed mutator and initial value.
// Can be fed to Array.reduce
var adjuster = function (mutator, initialValue) {
	return partial(insertWith, mutator, initialValue);
};

// var adjuster = function (mutator, initialValue) {
// 	return function (map, key) {
// 		var newValue = map.has(key) ? mutator(map.get(key)) : initialValue;
// 		map.set(key, newValue);
// 		return map;
// 	};
// };

var getProp = function (name) {
	return function (obj) {
		return obj[name];
	};
};

var fst = getProp(0);
var	snd = getProp(1);



var concat = function (a, b) {
	return a.concat(b);
};

var compose= function (f, g) {
	return function () {
		var args = Array.prototype.slice.call(arguments);
		return f.call(this, g.apply(this, args));
	};
};

var dettachMethodFromObject  = function (name, object) {
	return function (_) {
		var args = Array.prototype.slice.call(arguments);
		return object[name].apply(object, args);
	};
};

var ifThenElse = function (f, g, h) {
	return function (x) {
		return f(x) ? g(x) : h(x);
	};
};


var Decision = function (condition, mutate, yes, no ) {
	var mutate = mutate || function (_) { 
		return [].slice.call(arguments);
	};

	return function (x) {
		if (condition === null) return mutate(x);

		if(condition(x))
			return yes !== undefined ? yes(mutate(x)) : mutate(x);
		else
			return no !== undefined ? no(mutate(x)) : mutate(x);
	};
};

var result = function (x) {
	return function () {
		return x;
	};
};

/** 
 * Exports a bunch of helper functions.
 */
module.exports = {
	'partial': partial,
	'add': add,
	'addN': addN,
	'insertWith': insertWith,
	'adjuster': adjuster,
	'argmax': argmax,
	'wrapGetter': wrapGetter,
	'pickRandom': pickRandom,
	'getProp': getProp,
	'prop': getProp,
	'byValuesOf': byValuesOf,
	'fst': fst,
	'snd': snd,
	'geq': geq,
	'eq': eq,
	'concat': concat,
	'compose': compose,
	'combine': combine,
	'Decision': Decision,
	'identity': identity,
	'result': result
};







