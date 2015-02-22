// =============================================================================
//  Need some helper to write functional code?
// =============================================================================


var identity = function (x) { return x};
// Partial function application
var partial = function (f, _) { 
	var fixedArgs = Array.prototype.slice.call(arguments,1);
	return function (_) {
		var args = Array.prototype.slice.call(arguments);
		return f.apply(this, fixedArgs.concat(args));
	};
};

// Addition.
var add =  function (a, b) { return a + b;};
var addN = function (n) { return partial(add, n); };

// Produces a compare function that can be fed to Array.sort
var byValuesOf = function (f) {
	return function (a, b) {
		return f(a) - f(b);
	};
};

var combine = function (f, g) {
	return function (_) {
		return [f.apply(this, arguments), g.apply(this, arguments)];
	};
};

// @todo find better name for max
var max = function (list, mutator) {

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

var pickRandom = function (list) {
	return list[Math.floor(Math.random()*(list.length-1))];
};

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
	'max': max,
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







