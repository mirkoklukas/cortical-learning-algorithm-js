
// Import stuff.
var fh = require("./functional-helper.js");
var identity = fh.identity;
var concat = fh.concat;
var result = fh.result;
var combine = fh.combine;
var zip = require('underscore').zip;

/**
 * A neuronal layer, i.e. a network of cells synapses etc.
 * @constructor
 * @class
 */
var NeuroLayer = function (config) {
	var columns  = config? config.columns : {};
	var cells 	 = config? config.cells : {};
	var segments = config? config.segments : {};

	/** 
	 * Initializes a layer.
	 * @function 
	 * @param {Integer} nCols - The number of columns
	 * @param {Integer} nCells - The number of cells per column
	 * @param {Integer} nSegs - The number of segments per cell
	 * @param {Integer} nSyns - The number of listening cells per segment
	 * @return {NeuroLayer} - A self reference
	 */
	this.randomInit = function (nCols, nCells, nSegs, nSyns) {
		var i = 0;
		var j = 0;
		for (; i< nCols; i++ ) {
			this.addColumn(i);
		}

		i=0;
		for (; i< nCols*nCells; i++) {
			this.addCell(i, Math.floor(i/nCells));
		}

		i=0;
		var syns = [];
		for (; i< nCols*nCells*nSegs; i++) {
		  syns = [];
		  for (j=0; j<nSyns; j++) {
		    syns.push(Math.floor(Math.random()*nCols*nCells));
		  }
		  this.addSegment(i, false, Math.floor(i/nSegs), syns);
		}
		return this;
	};

	/** 
	 * Adds a column to the layer
	 * @function 
	 * @param {Integer} id - A unique identifyer
	 * @param {Integer[]} [cells=[]]
	 * @return {NeuroLayer} - A self reference
	 */
	this.addColumn = function (id, cells) {
		if (id in columns) throw "Column id already in use";

		columns[id] = {
			'id': id, 
			'cells': cells || []
		};

		return this;
	};

	/** 
	 * Adds a cell to a column
	 * @function 
	 * @param {Integer} id - A unique identifyer
	 * @param {Integer} column - The id of the column the cell is added to
	 * @param {Boolean} [learning=false] - The initial learining state of the cell
	 * @return {NeuroLayer} - A self reference
	 */
	this.addCell = function (id, column, learning) {
		if(id in cells) throw "Cell id already in use";
		if(!(column in columns)) throw "No such column"
		
		cells[id] = {
			'id': id,
			'column': column,
			'learning': learning || false,
			'feedingSegments': [],
			'listeningSegments': []
		};

		columns[column].cells.push(id);

		return this;
	};

	/** 
	 * Sets the learning state of a cell
	 * @function 
	 * @param {Integer} id - A unique identifyer
	 * @param {Boolean} learning - The new learning status
	 * @return {NeuroLayer} - A self reference
	 */
	this.setCellLearning = function (id, learning) {
		if(!(id in cells)) throw "No such cell: " + id;

		cells[id].learning = learning;

		return this;
	};

	/** 
	 * Adds a segment a layer
	 * @function 
	 * @param {Integer} id - A unique identifyer
	 * @param {Boolean} [sequential=false] - The initial sequential state of the segment
	 * @param {Integer} [listeningCell=null] - The id of the cell the segment is predicting
	 * @param {Integer[]} [feedingCells=[]] - The cells that contribute to the segments score
	 * @return {NeuroLayer} - A self reference
	 */
	this.addSegment = function (id, sequential, listeningCell, feedingCells) {
		if(id in segments) throw "Segment id already in use";

		segments[id] = {
	        "id": id, 
	        "sequential": sequential || false,
	        "feedingCells": feedingCells || [], 
	        "listeningCell": listeningCell !== undefined ? listeningCell : null
		};

		if (feedingCells !== undefined) { 
			feedingCells.map(function(cell) {
				if (!(cell in cells)) throw "Feeding cell doesnt exist: " + cell; 
				cells[cell].listeningSegments.push(id);
			});
		}

		if(listeningCell !== undefined) {
			if(!(listeningCell in cells)) throw "There is no such listening cell";
			cells[listeningCell].feedingSegments.push(id);
		}

		return this;

	};

	/** 
	 * Sets the sequential state of a segment
	 * @function 
	 * @param {Integer} id - A unique identifyer
	 * @param {Boolean} sequential - The new learning status
	 * @return {NeuroLayer} - A self reference
	 */
	this.setSegLearning = function (id, sequential) {
		if(!(id in segments)) throw "No such segment: " + id;

		segments[id].sequential = sequential;

		return this;
	};

	/** 
	 * Adds a feeding cell to a segment.
	 * @param {Integer} seg - A unique identifyer of a segment
	 * @param {Integer} cell - A unique identifyer of the feeding cell
	 * @return {NeuroLayer} - A self reference
	 */
	this.addFeedingCell = function (seg, cell) {
		if(!(seg in segments)) throw "No such segment: " + seg;
		if(!(cell in cells)) throw "No such cell: " + cell;
		
		segments[seg].feedingCells.push(cell);
		cells[cell].listeningSegments.push(seg);

		return this;
	};

	// ==========================
	// Column functions.
	// ==========================
	/** @function */
	this.getColumns = function () {
		return Object.keys(columns).map(function (key) {
			return columns[key].id;
		});
	};

	/** @function */
	this.getCells = function (id) {
		if (id !== undefined) { 
			return columns[id].cells;
		} 
		else {
			var that = this;
			return this.getColumns().map(function (col) {
				return that.getCells(col);
			}).reduce(concat, []);
		}
	};



	// ==========================
	// Cell functions.
	// ==========================
	/** @function */
	this.getColumn = function (id) {

		return cells[id].column;
	};

	/** @function */
	this.getListeningSegments = function (id) {
		return cells[id].listeningSegments;
	};

	/** @function */
	this.getFeedingSegments = function (id) {
		return cells[id].feedingSegments;
	};

	/** @function */
	this.isLearningCell = function (id) {
		return cells[id].learning == true;
	};

	// ==========================
	// Segment functions.
	// ==========================
	/** @function */
	this.getListeningCell = function (id) {
		return segments[id].listeningCell;
	};

	/** @function */
	this.getFeedingCells = function (seg) {
		return segments[seg].feedingCells;
	};

	/** @function */
	this.isSequential = function (id) {
		return segments[id].sequential == true;
	};

	// ==========================
	// Visualize and inspect.
	// ==========================

	/** @function */
	this.getMatrix = function () {

		var cells = this.getCells();
		var that = this;
		var segments = cells.map(this.getFeedingSegments).reduce(concat, []);
		var rowHeader = cells.map(combine(this.getColumn, identity));
		var colHeader = [];
		var matrix = segments.map(function (seg) {
			console.log(seg)
			var listeningCell = that.getListeningCell(seg);
			var listeningCol = 
					listeningCell !== null ? 
						that.getColumn(listeningCell) :  
						null;
			var feedingCells = that.getFeedingCells(seg);
			var row = cells.map(function (cell) {
				return feedingCells.indexOf(cell) < 0? 0 : 1;
			});
			colHeader.push([seg, listeningCell, listeningCol])
			return row;
		});

		return {
			'data': matrix,
			'header': {
				'row': rowHeader,
				'column': colHeader
			}
		};
	};

	/** @function */
	this.getMatrix2 = function () {

		var cells = this.getCells();
		var that = this;
		var segmentsByCells = cells.map(combine(identity, this.getFeedingSegments));
		var rowHeader = cells.map(combine(this.getColumn, identity));
		var colHeader = [];
		var matrix = segmentsByCells.map(function (cellSegs) {
			var cell = cellSegs[0];
			var segments = cellSegs[1]

			return segments.map(function (seg) {
				var listeningCell = that.getListeningCell(seg);
				var listeningCol = 
						listeningCell !== null ? 
							that.getColumn(listeningCell) :  
							null;
				var feedingCells = that.getFeedingCells(seg);
				var row = cells.map(function (cell) {
					return feedingCells.indexOf(cell) < 0? 0 : 1;
				});
				colHeader.push([seg , listeningCell, listeningCol])
				return row;
			});
		}).reduce(concat,[]);

		return {
			'data': matrix,
			'header': {
				'row': rowHeader,
				'column': colHeader
			}
		};
	};

	/** @function */
	this.inspect = function (depth) {
		var matrix = this.getMatrix();
		// console.log(matrix)
		var rowHeader = matrix.header.row;
		var colHeader = matrix.header.column;
		var output = '\n Layer matrix \n\n';

		var size = 3;
		var pad = function (num) {
		    var s = "    " + num;
		    return s.substr(s.length - size);
		};

		output += rowHeader.map(fh.snd).map(pad).join(" , ");
		output += "\n\n"
		output += zip(matrix.data, colHeader).map(function (dataHead, i) {
			// console.log(dataHead)
			var cons = dataHead[0];
			var head = dataHead[1];
			var line = "";
			// line += pad(cell);
			line += cons.map(pad).join(" , ") + "  seg::" + head[0] + " |--> cell::"+ head[1] + " in col::" + head[2] ;
			
			return line
		}).join('\n');

		return output;
	};

};


/** 
 * Exports {@link NeuroLayer} class.
 */
module.exports = NeuroLayer;



