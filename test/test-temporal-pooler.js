var expect = require('chai').expect;
var TemporalPooler = require('../lib/temporal-pooler.js');
var NeuroLayer = require("../lib/neuro-layer.js");
var Map = require('../lib/simple-map.js');
var tempPooler = new TemporalPooler();
var computeActiveCells = tempPooler.computeActiveCells;
var computeSegmentScores = tempPooler.computeSegmentScores;
var computePredictionMap = tempPooler.computePredictionMap;
var computeNonPredictedColumns = tempPooler.computeNonPredictedColumns;
var computeOutput = tempPooler.computeOutput;
var Set = require('es6-set');


describe('Temporal Pooler', function () { 

	var layer = new NeuroLayer({
		'columns': {
	  			1: { 'cells': [1,2,3]},
	  			2: { 'cells': [4,5,6]},
	  			3: { 'cells': [7,8,9]}
	  	},
		'cells': {
	  			1: { 'listeningSegments': ["s1"], 'feedingSegments': [], 'column': 1},
	  			2: { 'listeningSegments': ["s2"], 'feedingSegments': [], 'column': 1},
	  			3: { 'listeningSegments': ["s1", "s2"], 'feedingSegments': [], 'column': 1},
	  			4: { 'listeningSegments': ["s1"], 'feedingSegments': [], 'column': 2},
	  			5: { 'listeningSegments': [], 'feedingSegments': [], 'column': 2},
	  			6: { 'listeningSegments': [], 'feedingSegments': [], 'column': 2},
	  			7: { 'listeningSegments': [], 'feedingSegments': ['s1'], 'column': 3},
	  			8: { 'listeningSegments': [], 'feedingSegments': ['s2'], 'column': 3},
	  			9: { 'listeningSegments': [], 'feedingSegments': ['s3'], 'column': 3}

	  	},
	  	'segments': {
	  		's1': { 'listeningCell': 7},
	  		's2': { 'listeningCell': 8},
	  		's3': { 'listeningCell': 9},
	  	}
	});

	var prediction = new Map([
	  	[1, [2]],
	  	[2, [4, 6]]
	]);

	var scores = new Map([
		["s1", 3],
		["s2" , 2], 
		["s3", 1]
	]);

	var inputs = [
		[1],
		[2],
		[1],
		[2],
		[1]
	];

	tempPooler.setNeuroLayer(layer);
	tempPooler.setActivationThreshold(3)


	describe('#computeActiveCells', function() {
		it('computes active cells given active columns', function() {
			expect(new Set(computeActiveCells(layer, prediction, []))).
				to.deep.equal(new Set([]));
		    expect(new Set(computeActiveCells(layer, prediction, [2]))).
		    	to.deep.equal(new Set([4,6]));
		    expect(new Set(computeActiveCells(layer, prediction, [3]))).
		    	to.deep.equal(new Set([9,8,7]));
		   	expect(new Set(computeActiveCells(layer, prediction, [1,2,3]))).
		   		to.deep.equal(new Set([2,4,6,9,8,7]));
		});
	});

	describe('#computeSegmentScores', function() {
		it('computes the scores for each segments based on a list of active cells', function() {
			expect(computeSegmentScores(layer, []).toList()).
				to.deep.equal([]);
	  		expect(computeSegmentScores(layer, [1,2,3,4]).toList()).
	  			to.deep.equal([["s1", 3],["s2" , 2]]);
	 	});

	});

	describe('#computePredictionMap', function() {
		it('computes the predictive states for each cell.', function() {
			expect(computePredictionMap(layer, 5, new Map()).toList()).to.deep.equal([])
			expect(computePredictionMap(layer, 5, scores).toList()).to.deep.equal([])
			expect(computePredictionMap(layer, 2, scores).toList()).to.deep.equal([[3, [7,8]]])
	  	});
	});

	describe('#computeNonPredictedColumns', function () {
		it('should return input entries that are not predicted', function () {
			expect(computeNonPredictedColumns([1,2,3,4], prediction)).to.deep.equal([3, 4]);
		});
	});

	describe('#computeOutput', function () {
		it('should return the union of the input and predicted columns', function () {
			expect(Set(tempPooler.computeOutput([1,3,4], prediction)) ).to.deep.equal(Set([1, 2, 3, 4]));
		});
	});

	describe('#processInput', function () {
		it('is pending')
		it('should process the input based on the previous inputs accordingly', function () {
			// tempPooler.processInput()
		});
	});

	describe('#suggestLearningUpdates', function () {
		it('is pending')

	});

	describe('#updateNeuroLayer', function () {
		it('is pending')
	});

});



















