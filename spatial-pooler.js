
// --------------------------
// Some Helper... yeah shouldn't touch the Array.prototype....
// --------------------------
if(typeof Array.sortBy !== 'function') {
	Array.prototype.sortBy = function(attr) {
		return this.sort(function (a,b) { 
			return b[attr] - a[attr];
		});
	};
}

if(typeof Array.sum !== 'function') {
	Array.prototype.sum = function() {
		return this.reduce(function(a, b) { return a + b; }, 0);
	};
}

// 'select("key")' is a function that can be handed to Array.map...
var select = function(key) {
	var args = [].slice.apply(arguments);
	return function (obj) {
		return args.length === 1 ? obj[args[0]]: args.map(function (key) { 
			return obj[key]; 
		});
	};
};

var swap= function (a, i, j) {
	var temp = a[i];
	a[i] = a[j];
	a[j] = temp;
	return a;
}

var firstKLargest = function (a, access, k) {
	var max = 0, i = 0, j = 0, temp = 0;

	for (i = 0; i < k; i++) {
		max = access(a[i]);
		for ( j = i+1; j < a.length; j++) {
			if( access(a[j]) >= max) {
				// This line makes sure you dont count double values, e.g. 
				// 2nd largests of [3,3,1] is 1, without that line it would be 3
				// if(access(a[j]) === max) k = Math.min(k+1, a.length); 
				max = access(a[j])
				swap(a, i, j);
			}
		} 
	}
	return a.slice(0,k);
};

var getKeyForMaxProperty = function (dict, property) {
	var max = null;
	for( var key in dict ) {
		max = max === null ? key : max;
		if(dict[key][property] > dict[max][property]) max = key;
	}
	return max;

}


;(function (exports) { 
	// --------------------------
	// The 'Spatial Pooler transforms a binary input 
	// into a "sparse" representation
	// --------------------------
	var SpatialPooler = function (minOverlap, desiredLocalActivity) {
		this.columns = [];
		this.minOverlap = minOverlap || 10;
		this.connectedPerm = 0.2;
		this.desiredLocalActivity = desiredLocalActivity;
		this.input;
		this.sparseInput;
		this.synMatrix;

		this.numCols;
        this.numBits;
        this.numSyns;
		this.segments = {};
		this.cells = {};
		this.synapses = {};
		this.history = [];
	};


	SpatialPooler.prototype.getListeningSegments = function (cell) {
		return this.cells[cell]["listeningSegs"];
	};

	SpatialPooler.prototype.getFeedingCells = function (seg) {
		return this.segments[seg]["feedingCells"];
	};

	SpatialPooler.prototype.getBoost = function (seg) {
		return this.segments[seg]["boost"];
	};

	SpatialPooler.prototype.isActiveSynapse = function (seg, cell) {
		return this.synapses[seg][cell]["permanence"] >= 0.2;
	};

	SpatialPooler.prototype.initialize = function (config) {
		this.numCols = config["numCols"];
		this.numBits = config["numBits"];
		this.numSyns = config["numSyns"];
		this.segments = config["segs"];


		this.cells = config["cells"]
		this.synapses = config["synapses"];

		return this;
	};

	SpatialPooler.prototype.getSparseRepresentation = function (activeCells) {
		// 
		var overlap = this.computeOverlap(activeCells),
			boosted = this.boost(overlap, minOverlap),
			filtered = this.filter(boosted, this.desiredLocalActivity);

		this.history.push({
			"input": activeCells,
			"overlap": boosted,
			"output": filtered
		});

		return filtered;
	};

	SpatialPooler.prototype.computeOverlap = function (activeCells) {
		// 
		var dict = {};

		var that = this;
		activeCells.forEach(function (cell) {
			that.getListeningSegments(cell).forEach(function (seg) {
				if(that.synapses[seg][cell]["permanence"] >= 0.2) {
					dict[seg] = dict[seg] || 0;
					dict[seg] += 1;
				}

			});
		});
		return dict;
	};

	SpatialPooler.prototype.boost = function (overlapDict, minOverlap) {
		// 
		var boosted = [];
		for(seg in overlapDict) {

			if(overlapDict[seg] >= minOverlap) {
				boosted.push({"id": seg, "overlap": overlapDict[seg]*this.getBoost(seg)});
			}
		}
		return boosted;	
	};


	SpatialPooler.prototype.filter = function (overlap, k) {
		return firstKLargest(overlap, function(obj) { 
			return obj["overlap"]; 
		}, k);
	}

	// --------------------------
	// Learning
	// --------------------------
	SpatialPooler.prototype.learn = function () {
		var permanenceInc =  0.01,
		    permanenceDec =  0.01,
		    input = this.history[this.history.length - 1]["input"],
		    output = this.history[this.history.length - 1]["output"],
		    overlap = this.history[this.history.length - 1]["overlap"];
		// 
		var that = this;

		output.forEach(function (seg) {
			var seg = seg.id

			that.getFeedingCells(seg).forEach(function (cell) {
				if( that.synapses[seg][cell]["permanence"] >= 0.2 ) { 
					that.synapses[seg][cell]["permanence"] += permanenceInc;
					that.synapses[seg][cell]["permanence"] = Math.min(1.0, that.synapses[seg][cell]["permanence"] );
				} else {
					that.synapses[seg][cell]["permanence"] -= permanenceDec;
					that.synapses[seg][cell]["permanence"] = Math.max(0.0, that.synapses[seg][cell]["permanence"] );
				}
			})
		})

		// Todo: find a better way to do this!!!!
		this.columns.forEach(function (column) {
			column.history["overlap"].push( column.overlap > this.minOverlap ? 1 : 0);
			column.history["activity"].push( that.sparseInput.indexOf(column.id) > -1 ? 1 : 0 );
		});

		for ( var seg in  this.segments) {
			this.segments[seg]["history"]["overlap"].push( 0 );
			this.segments[seg]["history"]["activity"].push( 0 );
		}
		for ( var i in overlap ) {
			this.segments[seg]["history"]["overlap"][this.segments[seg]["history"]["overlap"].length-1] = 1;
		}
		for ( var j in output ) {
			this.segments[seg]["history"]["activity"][this.segments[seg]["history"]["activity"].length-1] = 1;
		}


		for ( var seg in  this.segments) {

			this.segments[seg]["activeDutyCycle"] = this.segments[seg]["history"]["activity"].slice(-100).sum()/100;
			var max = getKeyForMaxProperty(this.segments, "activeDutyCycle");
			var minDutyCycle = 0.01 * this.segments[max]["activeDutyCycle"];

			if(this.segments[seg]["activeDutyCycle"] > minDutyCycle) {
				this.segments[seg]["boost"] = 1.0;
			} else {
				this.segments[seg]["boost"] = 1.0 + (minDutyCycle - this.segments[seg]["activeDutyCycle"]);
			}
			var overlapDutyCycle = this.segments[seg]["history"]["overlap"].slice(-100).sum()/100
			if(overlapDutyCycle < minDutyCycle) {
				this.getFeedingCells(seg).forEach(function (cell) {
					that.synapses[seg][cell]["permanence"] += 0.1 * that.connectedPerm;
				})
			}

		}

	};

	exports.SpatialPooler = SpatialPooler;

}(this));



