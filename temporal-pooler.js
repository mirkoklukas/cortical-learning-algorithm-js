

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

	var getHistory = this.getHistory = function () {
		return history;
	};
	
	var getData = this.getData = function () {
		return {
			"columns": columns,
			"cells": cells,
			"segments": segments,
			"numCols": numCols,
			"numCells": numCells,
			"numSegs": numSegs,
			"numSyns": numSyns
		};
	};

	var getState = function (cell, t) {
		return cells[cell]["state"][t] === undefined ? 0 : cells[cell]["state"][t];
	};
	var setState = function (cell, state, t) {
		cells[cell]["state"][t] = state;
		return cells[cell];
	};
	var isActive = function (cell, t) {
		return cells[cell].state === 1;
	};
	var isLearning = function (cell) {
		return cells[cell].learning === true;
	};
	var isPredicted = function (cell, t) {
		return getState(cell, t) === state["predictive"];
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
	var isActiveSegment = function (seg, mode, t) {
		mode = mode === "learningScore" ? "learningScore" : "score";
		return segments[seg][mode][t] > activationThreshold;
	};
	var getPredictingSegment = function (cell, t) {
		if(isPredicted(cell, t)) {
			return cells[cell]["predictingSegement"][t] || null;
		} else {
			throw "Trying to access the predicting segment " + 
				"of a cell that is not in predictive state...";
		}
	};
	var setPredictingSegment = function (cell, seg, t) {
		cells[cell]["predictingSegement"][t] = seg;
	};
	// var getScore = function (seg) {
	// 	var score = 0;
	// 	getFeedingCells(seg).forEach(function (cell) {
	// 		if (isActive(cell)) score += 1; 
	// 	});
	// 	return score;
	// }
	var getScore = function (seg, t) {
		return segments[seg]["score"][t] || 0;
	}
	var setScore = function (seg, t, score) {
		segments[seg]["score"][t] = score;
	}
	var getLearningScore = function (seg, t) {
		return segments[seg]["learningScore"][t] || 0;
	}
	var setLearningScore = function (seg, t, score) {
		segments[seg]["learningScore"][t] = score;
	}
	var getBestMatch = function (column, t) {
		var maxSeg  = 0,
			maxCell = 0,
			idCell  = null,
			idSeg   = null;

		getCells(column).forEach(function (cell) {
			getFeedingSegs(cell).forEach(function (seg) {
				if(getScore(seg, t) >= maxSeg) {
					idSeg  = seg;
					maxSeg = getScore(seg, t);
				}
			});

			if(maxSeg >= maxCell) {
				maxCell = maxSeg;
				idCell  = cell;
			}
		});

		return [idCell, idSeg];
	};

	var isSequential = function (seg) {
		return segments[seg]["sequential"] === true;
	};


	// takes a list of column id's, and
	// returns a list of active cell id's
	var computeActiveCells = function (activeColumnIds, t) {
		var columnBeenPredicted = false,
			learnigCellChosen   = false, 
			activeCells         = [],
			updates             = [];

		activeColumnIds.forEach(function(column) {
			columnBeenPredicted = false;
			learnigCellChosen 	= false;

			// 
			getCells(column).forEach(function (cell) {
				if (isPredicted(cell, t-1) && isSequential(getPredictingSegment(cell, t-1))) {

					columnBeenPredicted     = true;
					cells[cell]["state"][t] = 1;
					activeCells.push(cell);

					if (isActiveSegment(getPredictingSegment(cell, t-1), "learningScore", t-1)) {
						// console.log(cell + " active with respect to learning...")
						learnigCellChosen       = true;
						cells[cell]["learning"] = true;
					}
				}
			});

			// 
			if(columnBeenPredicted === false) {
				getCells(column).forEach(function (cell) { 
					cells[cell]["state"][t] = 1;
					activeCells.push(cell);
				});
			}	

			// 
			if (learnigCellChosen === false) {
				var bestCell    = getBestMatch(column, t)[0],
					bestSegment = getBestMatch(column, t)[1];

				// activateLearning(bestCell);
				// console.log(bestCell + " now learning... ")
				cells[bestCell]["learning"] = true;
				segments[bestSegment]["sequential"] = true;
				// updates.push(bestSegment);
			}

		});

		return activeCells;
	}
	this.computeActiveCells = computeActiveCells;


	var computePredictions = function (activeCells, t) {
		var activationCount = {},
			columns = new SimpleSet(),
			cells   = new SimpleSet();

		// Set the activation count
		activeCells.forEach(function (cell) {
			getListeningSegs(cell).forEach(function (seg) {
				// if ```undefined``` initialize with ```zero```
				activationCount[seg] = activationCount[seg] || 0;
				activationCount[seg] += 1;

				setScore(seg, t, getScore(seg, t) + 1);
				if(isLearning(cell))
					setLearningScore(seg, t, getLearningScore(seg, t) + 1);
			});
		});

		for (seg in activationCount) {
			if(activationCount[seg] >= activationThreshold) {
				
				setState(getListeningCell(seg), 2, t);

				columns.add( getColumn( getListeningCell(seg) ) );
				cells.add( getListeningCell(seg) );
				setPredictingSegment( getListeningCell(seg), seg, t);
				// Todo: Reward the synapses involved?
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

		var activeBits  = activeBits,
			activeCells = computeActiveCells(activeBits, t),
			predictions = computePredictions(activeCells, t),
			predictedColumns = predictions["columns"],
			predictedCells   = predictions["cells"];
			
		history.push({
			"activeBits" : activeBits.slice(),
			"activeCells": activeCells.slice(),
			"predictedCells"  : predictedCells.slice(),
			"predictedColumns": predictedColumns.slice()
		});

		// Todo: this screams for a better solution
		// clear the cell state
		getCells().forEach(function (cell) {
			setState(cell, 0);
		});
		// enter the current predictions
		predictedCells.forEach(function (cell) {
			setState(cell, 2);
		});

		t += 1;

		return activeBits.concat(predictedColumns);
	};

	this.configure = function(config) {
		columns  = config.columns;
		cells 	 = config.cells;
		segments = config.segs;
		numCols  = config.numCols;
		numCells = config.numCells;
		numSegs  = config.numSegs;
		numSyns  = config.numSyns;
		return this;
	};
	
	this.processInput = processInput;

}

exports.TemporalPooler = TemporalPooler;

}(this));





