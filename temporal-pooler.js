



var SimpleSet = function () {
	var hash = {};
	var data = [];

	this.add = function (key) {
		hash[key] = true;
		data.push(el);
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

	var t = 0;
	var history = [];

	var activationThreshold;

	var predictiveCells;

	var cells = {};


	var state = {
		"inactive": 0,
		"active": 1,
		"predictive": 2
	};
	Object.freeze(state);


	// var Cell = function (columnId) {
	// 	this.id;
	// 	this.column = {};
	// 	this.listeningSegs = [];
	// 	this.feedingSegs = [];
	// 	this.state;
	// };

	// var Column = function () {
	// 	this.id;
	// 	this.cells = [];
	// };

	// var Segment = function () {
	// 	this.id;
	// 	this.getFeedingCells = [];
	// 	this.listeningCell = {};
	// 	this.activationCount = 0;
	// };

	var columns = {};
	var cells = {};
	var segements = {};
	

	var getState = function (cell) {
		return cells[cell].state;
	};
	var setState = function (cell, state) {
		cells[cell].state = state;
		return cells[cell];
	};
	var getCells = function (column) {
		return column !== undefined ? column.cells : cells.map(function (cell) { return cell.id; }) ;
	};
	var getColumns = function () {
		return columns.map(function (column) { return column.id; }) ;
	};
	var getListeningCell = function (seg) {
		return segments.listeningCell;
	};
	var getFeedingCells = function (seg) {
		return segments.feedingCells;
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
				activeCells.concat(getCells(column));
			}	
		});

		return activeCells;
	}

	var computePredictions = function (cells) {
		var activationCount = {},
			columns = new SimpleSet(),
			cells = new SimpleSet();	

		// Set the activation count
		cells.forEach(function (cell) {
			getListeningSegs(cell).forEach(function () {
				// if ```undefined``` initialize with ```zero```
				activationCount[seg] = activationCount[seg] || 0;
				activationCount[seg] += 1;
			});
		})

		for (seg in activationCount) {
			if(activationCount[seg] >= activationThreshold) {
				columns.add(getColumn(getListeningCell(seg)));
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

	var processActiveBits = function (activeBits) {
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








}(this));





