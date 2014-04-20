if(typeof Array.sortBy !== 'function') {
	Array.prototype.sortBy = function(attr) {
		return this.sort(function (a,b) { 
			return a[attr] - b[attr];
		});
	};
}

var select = function(key) {
	var args = [].slice.apply(key);
	return function (obj) {
		return args.length === 1 ? obj[key]: args.map(function (key) { 
			return obj[key]; 
		});
	};
};



var Column = function (id) {
	this.id = id;
	this.synapses = [];
	this.neighbours = [];
	this.boostValue = 1.0;
	this.overlap = 0;
};

Column.prototype.computeOverlap = function (input) {
	// 
	this.overlap =  column.synapses.filter(function(synapse) {
			synapse.active = (input[synapse.end] === 1 && synapse.permanence >= 0.2);
			return synapse.active;
	}).length;
	//  
	return this;
}

Columns.prototype.boost = function (minOverlap) {
	// 
	var boostValue = this.boostValue || 1.0;
	// 
	if(overlap < minOverlap) overlap = 0;
	else overlap *= boostValue;
	// 
	return this;
}


var verticalSyapse = function (end, permanence) {
	this.end = end;
	this.active = false;
	this.permanence = permanence || 0.2;
};


var computeOverlap = function (columns, input) {
	return columns.map(function(column) {
		// 
		var overlap = column.synapses.filter(function(synapse) {
			synapse.active = (input[synapse.end] === 1 && synapse.permanence >= 0.2);
			return synapse.active;
		}).length;
		// 
		// if(overlap < minOverlap) overlap = 0;
		// else overlap *= column.boost;
		// 
		return {id: column["id"], overlap: overlap};
	});
};

// ---------
// depends on minOverlap 
// ---------
var boost = function (columns, minOverlap) {
	return cols.map(function (column) {
		// 
		var overlap = column["overlap"];
		// 
		if(overlap < minOverlap) overlap = 0;
		else overlap *= boost[column["id"]];
		// 
		return {id: column["id"], overlap: overlap};
	});
};


var kthOverlapValue = function (columns, k) {

	var count = 0;
	columns.sortBy("overlap");

	for (int i = 1, max = columns.length; i < max; i++) {
		if(columns[i-1].overlap !== columns[i].overlap) { 
			count < k ? count += 1 : break;
		}
	}
	return columns[k-1].overlap;
}

var satOverlapBenchmark = function (minOverlap) {
	return function (column) {
		return column.overlap > 0 && column.overlap >= minOverlap;
	}
} 

var makeSparse = function (input, columns) {
	// 
	var sparseActiveColumns = computeOverlap(columns,input)
								.filter(satOverlapBenchmark(kthOverlapValue(columns, 10)))
								.map(select("id"));
	// 
	return sparseActiveColumns;
};



var learn = function (activeIds, columns, permanenceInc, permanenceDec) {
	var permanenceInc = permanenceInc || 0.5,
	    permanenceDec = permanenceDec || 0.5;
	// 
	activeColumns.forEach(function (id) {
		columns[id].synapses = columns[id].synapses.map(function (synapse) {
			if(synapse.active) {
				synapse.permanence += permanenceInc;
				synapse.permanence = Math.min(1.0, synapse.permanence );
			} else {
				synapse.permanence -= permanenceDec;
				synapse.permanence = Math.min(1.0, synapse.permanence );
			}
			return synapse;
		});
	});
	// 

}







