
/**
 * A naive implementation of a Map.
 * @constructor
 * @class
 */
var SimpleMap = function (keyVals) {

	var hash = {};
	var data = [];

	// Initializing
	(keyVals || []).map(function (pair, i) {
		var key = pair[0];
		var val = pair[1];

		hash[key] = { 
			"value": val, 
		 	"index": data.length
		};
		data.push([key, val]);
	})

	/** @function */
	this.set = function (key, value) {
		if (key in hash) {
			hash[key].value = value;
			data[hash[key].index][1] = value;
		} else {
			hash[key] = { 
				"value": value, 
			 	"index": data.length
			};   
			data.push([key, value]);
		}
		return this;
	};

	/** @function */
	this.get = function (key) {
		return this.has(key) ? hash[key].value : undefined;
	};

	/** @function */
	this.entries = function () {
		return data;
	};

	/** @function */
	this.has = function (key) {
		return key in hash;
	};

	/** @function */
	this.toList = function () {
		return data;
	};

	/** @function */
	this.toDict = function () {
		return hash;
	};

};

/** 
 * Exports {@link SimpleMap} class.
 */
module.exports = SimpleMap;



