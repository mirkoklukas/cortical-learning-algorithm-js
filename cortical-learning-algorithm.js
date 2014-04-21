
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
};

SpatialPooler.prototype.initialize = function (synMatrix) { 
	this.synMatrix = synMatrix;
	var column;

	for (var c = 0; c < synMatrix.length; c++) { 
		var column = new Column(c);
		column.neighbours = this.columns;
		for (var i = 0; i < synMatrix[c].length; i++) {
			if(synMatrix[c][i] > 0) 
				column.synapses.push(new verticalSyapse(i,synMatrix[c][i]));
		}
		this.columns.push(column);
	}

	return this;
};

SpatialPooler.prototype.getSparseRepresentation = function (input) {
	// 
	this.input = input;

	var that = this;
	var kthOverlapValue = function (columns, k) {
		var count = 0;
		that.columns.sortBy("overlap");
		for (var i = 1, max = that.columns.length; i < max; i++) {
			if(that.columns[i-1].overlap !== that.columns[i].overlap) { 
				if(count < k) count += 1;
				else break;
			}
		}

		// console.log(k)
		// console.log(count)
		// console.log(that.columns[k-1].overlap)
		return that.columns[k-1].overlap;

	}

	// 
	var satOverlapBenchmark = function (benchmark) {
		return function (column) {
			return column.overlap > 0 && column.overlap >= benchmark;
		};
	} 

	// 
	this.sparseInput = this.columns.map(function (column) {
			return column.computeOverlap(input).boost(that.minOverlap)
		}).filter(satOverlapBenchmark(kthOverlapValue(that.columns, that.desiredLocalActivity)))
			.map(select("id"));


	return this.sparseInput;

	// return this.columns.map(function (column) {
	// 		return column.computeOverlap(input).boost(that.minOverlap)
	// 	}).sortBy("id").map(function (column) {
	// 		return satOverlapBenchmark(kthOverlapValue(that.columns, that.desiredLocalActivity))? 1 : 0;
	// 	});
};

// --------------------------
// Learning
// --------------------------
SpatialPooler.prototype.learn = function () {
	var permanenceInc =  0.01,
	    permanenceDec =  0.01;
	// 
	var that = this;
	this.sparseInput.forEach(function (id) {
		that.columns[id].synapses.forEach(function (synapse) {
			if(synapse.active) {
				synapse.permanence += permanenceInc;
				synapse.permanence = Math.min(1.0, synapse.permanence );
			} else {
				synapse.permanence -= permanenceDec;
				synapse.permanence = Math.max(0.0, synapse.permanence );
			}
		});
	});

	// Todo: find a better way to do this!!!!
	this.columns.forEach(function (column) {
		column.history["overlap"].push( column.overlap > this.minOverlap ? 1 : 0);
		column.history["activity"].push( that.sparseInput.indexOf(column.id) > -1 ? 1 : 0 );
	});


	this.columns.forEach(function (column) {
		var minDutyCycle = 0.01 * column.neighbours.sortBy("activeDutyCycle")[0]["activeDutyCycle"];
		column.activeDutyCycle = column.history["activity"].slice(-100).sum()/100;
		
		column.boostValue = column.activeDutyCycle > minDutyCycle ? 1.0 : column.boostValue + (minDutyCycle-column.activeDutyCycle)*1;

		column.overlapDutyCycle = column.history["overlap"].slice(-100).sum()/100;
		if( column.overlapDutyCycle < minDutyCycle ) column.permanence = 0.1*that.connectedPerm;
	});

	// for c in columns:
	// 		minDutyCycle(c) = 0.01 * maxDutyCycle(neighbors(c)) 
	// 		activeDutyCycle(c) = updateActiveDutyCycle(c)
	// 		boost(c) = boostFunction(activeDutyCycle(c), minDutyCycle(c))
	// 
	// 		overlapDutyCycle(c) = updateOverlapDutyCycle(c) 
	// 		if overlapDutyCycle(c) < minDutyCycle(c) then
	// 			increasePermanences(c, 0.1*connectedPerm) 
	// inhibitionRadius = averageReceptiveFieldSize()
};



// --------------------------
// The Colum
// --------------------------
var Column = function (id) {
	this.id = id;
	this.synapses = [];
	// this.center;
	this.neighbours = [];
	this.boostValue = 1.0;
	this.overlap = 0;
	this.activeDutyCycle;
	this.overlapDutyCycle;
	this.history = {
		activity: [],
		overlap: []
	};

};

Column.prototype.computeOverlap = function (input) {
	// 
	this.overlap =  this.synapses.filter(function(synapse) {

			synapse.active = (input[synapse.end] !==0 && synapse.permanence >= 0.2);
			return synapse.active;
	}).length;

	//  
	return this;
};

Column.prototype.boost = function (minOverlap) {
	// 
	var boostValue = this.boostValue || 1.0;
	// 
	if(this.overlap < minOverlap) this.overlap = 0;
	else this.overlap *= boostValue;
	// 
	return this;
};



// --------------------------
// 
// --------------------------
var verticalSyapse = function (end, permanence) {
	this.end = end;
	this.active = false;
	this.permanence = permanence || 0.2;
};


// --------------------------
// 
// --------------------------







