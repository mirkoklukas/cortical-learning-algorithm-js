

var SimpleSet = function () {
	var hash = {};
	var data = [];

	this.add = function (key) {
		hash[key] = true;
		data.push(key);
	};
	this.map = function(_) {
		var args = [].slice.call(arguments)
		data.map.apply(data, args);
	};
	this.forEach = function(_) {
		var args = [].slice.call(arguments)
		data.forEach.apply(data, args);
	};
	this.getArray = function () {
		return data;
	};
	this.getHash = function () {
		return hash;
	};
	this.contains = function (key) {
		return hash(key) === true;
	};

}



;(function (exports) {

var TemporalPooler = function (activationThreshold) { 

	var t = 0;
	var history = [];

	var numCols,
		numCells,
		numSegs,
		activationThreshold = activationThreshold,
		columns = {},
		cells = {},
		segments = {};



	var state = {
		"inactive": 0,
		"active": 1,
		"predictive": 2
	};
	Object.freeze(state);

	this.getHistory = function () {
		return history;
	}
	
	this.getData = function () {
		return {
			"columns": columns,
			"cells": cells,
			"segments": segments,
			"numCols": numCols,
			"numCells": numCells,
			"numSegs": numSegs,
			"numSyns": numSyns
		};
	}

	var getState = function (cell) {
		return cells[cell].state;
	};
	var setState = function (cell, state) {
		cells[cell].state = state;
		return cells[cell];
	};
	var getCells = function (column) {
		var result = [];
		if(column !== undefined) {
			result = columns[column].cells;
		} else {	
			for( id in cells) result.push(id);
		}
		return result;
	};
	var getColumn = function (cell) {
		return  cells[cell]["column"];
	};
	var getListeningCell = function (seg) {
		return segments[seg].listeningCell;
	};
	var getFeedingCells = function (seg) {
		return segments[seg].feedingCells;
	};
	var getListeningSegs = function (cell) {
		return cells[cell].listeningSegs;
	};
	var getFeedingSegs = function (cell) {
		return cells[cell].feedingSegs;
	};


	// takes a list of column id's, and
	// returns a list of active cell id's
	var computeActiveCells = function (activeColumnIds) {
		var columnBeenPredicted = false,
			activeCells = [];
		activeColumnIds.forEach(function(column) {
			columnBeenPredicted = false;


			getCells(column).forEach(function (cell) {
				if( getState(cell) === state["predictive"] ) {

					columnBeenPredicted = true;
					activeCells.push(cell);
				}
			});

			if(columnBeenPredicted === false) {
				activeCells = activeCells.concat(getCells(column));
			}	
		});

		return activeCells;
	}
	this.computeActiveCells = computeActiveCells;


	var computePredictions = function (activeCells) {
		var activationCount = {},
			columns = new SimpleSet(),
			cells = new SimpleSet();	

		// Set the activation count
		activeCells.forEach(function (cell) {
			getListeningSegs(cell).forEach(function (seg) {
				// if ```undefined``` initialize with ```zero```
				activationCount[seg] = activationCount[seg] || 0;
				activationCount[seg] += 1;
			});
		})

		for (seg in activationCount) {
			if(activationCount[seg] >= activationThreshold) {
				columns.add( getColumn(getListeningCell(seg)) );
				cells.add(getListeningCell(seg));
			} 
			
		}

		return {
			"columns": columns.getArray(), 
			"columnsDict": columns,
			"cells": cells.getArray(),
			"cellsDict": cells
		};
	}

	this.computePredictions = computePredictions;

	var processInput= function (activeBits) {
		var activeBits = activeBits,
			activeCells = computeActiveCells(activeBits),
			predictions = computePredictions(activeCells),
			predictedColumns = predictions["columns"],
			predictedCells = predictions["cells"];

		history.push({
			"activeBits": activeBits.slice(),
			"activeCells": activeCells.slice(),
			"predictedCells": predictedCells.slice(),
			"predictedColumns": predictedColumns.slice()
		});

		// clear the cell state
		getCells().forEach(function (cell) {
			setState(cell, 0);
		});
		// enter the current predictions
		predictedCells.forEach(function (cell) {
			setState(cell, 2);
		});

		return activeBits.concat(predictedColumns);
	};

	this.initialize = function(config) {

		columns  = config.columns;
		cells 	 = config.cells;
		segments = config.segs;
		numCols  = config.numCols;
		numCells = config.numCells;
		numSegs  = config.numSegs;
		numSyns  = config.numSyns;

 
	};
	this.processInput = processInput;

}

exports.TemporalPooler = TemporalPooler;

}(this));





