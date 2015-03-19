
// Import stuff.
var Map = require("./simple-map.js");
var NeuroLayer = require("./neuro-layer.js");
var fh = require("./functional-helper.js");
var _ = require("underscore");
var partial = fh.partial;
var add = fh.add;
var addN =fh.addN;
var adjuster = fh.adjuster;
var getProp = fh.getProp;
var byValuesOf = fh.byValuesOf;
var pickRandom = fh.pickRandom;
var fst = fh.fst;
var snd = fh.snd;
var geq = fh.geq;
var eq = fh.eq;
var argmax = fh.argmax;
var result = fh.result;
var wrapGetter = fh.wrapGetter;
var concat = fh.concat;
var compose = fh.compose;
var logger = require('winston');
logger.setLevels({debug:0,info: 1,silly:2,warn: 3,error:4, flow: 5});
logger.addColors({debug: 'green',info:  'cyan',silly: 'magenta',warn:  'yellow',error: 'red', flow: 'cyan'});
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, { level: 'info', colorize:true });

/**
 * The temporal pooler.
 * @constructor
 * @class
 */
var TemporalPooler = function (layer) {
    this.layer = layer; 
    this.activationThreshold;
    this.scores = {
        'active': [],
        'learning': [],
        'sequential': []
    };
    this.inputs = [];
    this.predictions = [];
    this.sequentialPredictions = [];
    this.activity = [];
    this.outputs = [];
};

/** 
 * Sets the neuronal layer of the pooler.
 * @function
 * @param  {NeuroLayer} layer - The actual network.
 * @return {TemporalPooler} - A self reference.
 */
TemporalPooler.prototype.setNeuroLayer = function (layer) {
    this.layer = layer;
    return this;
};

/** 
 * Sets the activation threshold of the pooler.
 * @function
 * @param  {Number} a - The new activation threshold.
 * @return {TemporalPooler} - A self reference.
 */
TemporalPooler.prototype.setActivationThreshold = function (a) {
    this.activationThreshold = a;
    return this;
};

/** 
 * Resets the pooler.
 * @function
 */
TemporalPooler.prototype.reset = function () {
    this.scores = {
        'active': [],
        'learning': [],
        'sequential': []
    };
    this.inputs = [];
    this.predictions = [];
    this.activity = [];

    return this
};

/** 
 * Processes a given input. 
 * @function
 * @param  {Integer[]} input - A list of active column ids.
 * @return {Integer[]} - A list of active column ids.
 */
TemporalPooler.prototype.processInput = function (input) {
    logger.debug('process input', input);
    var lastPrediction = this.predictions[this.predictions.length -1] || new Map();

    // Activity
    var activeCells = this.computeActiveCells(this.layer, lastPrediction, input);
    var activeLearningCells = activeCells.filter(this.layer.isLearningCell);
    
    // Scores
    var activeScore = this.computeSegmentScores(this.layer, activeCells);
    var learningScore = this.computeSegmentScores(this.layer, activeLearningCells);
    var sequentialScore = new Map(learningScore.toList().filter(
                                compose(this.layer.isSequential, fst)));

    // Prediction
    var nextPrediction = this.computePredictionMap(this.layer, this.activationThreshold, sequentialScore);

    // Result
    var output = this.computeOutput(input, nextPrediction);

    // Update the history
    this.inputs.push(input);
    this.activity.push(activeCells);
    this.scores.active.push(activeScore);
    this.scores.learning.push(learningScore);
    this.scores.sequential.push(sequentialScore);
    this.predictions.push(nextPrediction);      
    this.outputs.push(output);

    return output;
};

/**
 * Computes active cells given active columns and a prediction map.
 * @function
 * @param  {NeuroLayer} layer - ...
 * @param  {Map} prediction - A Map whose keys are ids of columns, 
 *      and values are ids of predicted cells. If a key is not present, 
 *      this implies that no cell has been predicted within the column.
 * @param  {Integer[]} input - A list of ids of active columns. 
 * @return {Integer[]} - A list of ids of active cells.
 */
TemporalPooler.prototype.computeActiveCells = function (layer, prediction, input)  {
    var activeCells = input.
            map(function (col) {
                return prediction.has(col) ? prediction.get(col) : layer.getCells(col);
            }).
            reduce(concat, []);  
    logger.debug("Active cells:", activeCells)
    return activeCells;
};

/**
 * Computes the scores for each segments based on a list of active cells.
 * @function
 * @param  {NeuroLayer} layer - ...
 * @param  {Integer[]} activeCells - A list of active cells.
 * @return {Map} - A Map whose entries are ids of segments with scores > 0, 
 *      the values are the actual scores.
 */
TemporalPooler.prototype.computeSegmentScores = function (layer, activeCells) {
    var scores = activeCells.                                       
            map(layer.getListeningSegments).            
            reduce(concat, []).                                         
            reduce(adjuster(addN(1), 1), new Map());    
    logger.debug("Scores:", scores.toList())
    return scores;
};

/**
 * Computes the predictive states for each cell.
 * @function
 * @param  {NeuroLayer} layer - ...
 * @param  {Number} threshold - The threshold a segment score has to exceed to trigger 
 *      the predictive state of its listening cell. 
 * @param  {Map} segmentScores - A Map whose entries are ids of segments with scores > 0, 
 *      the values are the actual scores.
 * @return {Map} - A prediction Map.
 */
TemporalPooler.prototype.computePredictionMap = function (neuroLayer, threshold, segmentScores) {

    var prediction = segmentScores.toList().                
            filter(compose(geq(threshold), snd)).       
            map(compose(neuroLayer.getListeningCell, fst)).         
            reduce(function (map, cellId) {
                var key = neuroLayer.getColumn(cellId);
                var newValue = (map.get(key) || []).concat([cellId]);
                map.set(key, newValue);
                return map;
            }, new Map());
    logger.debug("Prediction:", prediction.toList())
    return prediction;
};

/**
 * Returns the input that has not been predicted.
 * @function
 * @param  {Integer[]} input - A list of ids of active columns. 
 * @param  {Map} prediction - A Map whose keys are ids of columns, 
 *      and values are ids of predicted cells. Predictions values must not be the empty list '[]'.
 * @return {Integer[]} - A list of ids of columns that have not been predicted.
 */
TemporalPooler.prototype.computeNonPredictedColumns = function (input, prediction) {
    return input.filter(function (column) {
        return !prediction.has(column);
    });
};

/**
 * Computes the output of a layer.
 * @function
 * @param  {Integer[]} input - A list of ids of active columns. 
 * @param  {Map} prediction - A Map whose keys are ids of columns, 
 *      and values are ids of predicted cells. Predictions values must not be the empty list '[]'.
 * @return {Integer[]} - A list of ids of columns.
 */
TemporalPooler.prototype.computeOutput = function (input, predictionMap) {
    return this.computeNonPredictedColumns(input, predictionMap).concat(predictionMap.entries());
};

var PROMOTE_LISTENING_CELL = 1;
var PROMOTE_SEGMENT= 2;
var IMPROVE_SCORE= 3;
var ADD_SEGMENT= 4;

/**
 * Suggests learning updates for a column of the neuronal layer. 
 * @function
 */
TemporalPooler.prototype.suggestLearningUpdates = function (col, t) {
    // @todo Check the time, i.e. is all necessary information present.
    var layer = this.layer;
    var scores = this.scores;
    var inputs = this.inputs;
    var a = this.activationThreshold;
    var t = t !== undefined ? t : Math.max(scores.active.length - 1, 0);
    var activeScore = wrapGetter(scores.active[t]);
    var learningScore = wrapGetter(scores.learning[t]);
    var updates = [];
    var cells = layer.getCells(col);
    var segments = cells.
                     map(layer.getFeedingSegments).
                     reduce(concat, []);
                    
    // ==========================
    // Worst case: there is no segment at all
    // ==========================
    if(segments.length <= 0) {
        updates.push([
            [ADD_SEGMENT],
            [pickRandom(cells)]
        ]);
        return updates;
    }

    // ==========================
    // First check for candidates with 
    // respect to learning score ...
    // ==========================
    var candidates = segments.
                        filter(compose(geq(a),learningScore)).
                        filter(layer.isSequential); 
    // @todo We don't have to promote those cells 
    //  who are already learning cells
    if (candidates.length > 0) {
        updates.push([ 
            [PROMOTE_LISTENING_CELL],
            candidates
        ]);
        return updates;
    } 

    // ==========================
    // Choose candidates with respect 
    // to active score ...
    // ==========================
    var bestSeg = argmax(segments, activeScore);
    var maxScore = activeScore(bestSeg);
    if (maxScore <= 0) {
        updates.push([
            [IMPROVE_SCORE, PROMOTE_LISTENING_CELL, PROMOTE_SEGMENT],
            [pickRandom(segments)]
        ]);
    } 
    else {
        candidates = segments.filter(compose(eq(maxScore),activeScore));
        seqCandidates = candidates.filter(layer.isSequential);
        
        if(seqCandidates.length > 0) {
            updates.push([
                [IMPROVE_SCORE, PROMOTE_LISTENING_CELL, PROMOTE_SEGMENT],
                [pickRandom(seqCandidates)]
            ]);
        } 
        else {
            updates.push([
                [IMPROVE_SCORE, PROMOTE_LISTENING_CELL, PROMOTE_SEGMENT],
                [candidates[candidates.length-1]]
            ])
        }
    }
    return updates;
};

/**
 * Carries out the suggested learning updates.
 * @function 
 * @todo Annotate
 */
TemporalPooler.prototype.updateNeuroLayer = function (suggestions) {
    var that = this;
    var carryOutUpdate = function (layer, type, candidates) {
        
        switch(type) {

            case PROMOTE_LISTENING_CELL:
                // Candidates should be a list of segment ids 
                candidates.forEach(function (seg) {
                    var listeningCell = layer.getListeningCell(seg);
                    layer.setCellLearning(listeningCell, true);
                });
                break

            case PROMOTE_SEGMENT:
                // Candidates should be a list of segment ids 
                candidates.forEach(function (seg) {
                    layer.setSegLearning(seg, true);
                });
                break

            case IMPROVE_SCORE:
                // @todo improve
                // Candidates should be a list of segment ids 
                var activeCells = that.activity[that.activity.length - 2] || [];
                if (activeCells.length > 0) { 
                    candidates.forEach(function (seg) {
                        var i = Math.floor(Math.random()*activeCells.length);
                        layer.addFeedingCell(seg, activeCells[i]);
                    });
                }
                break

            case ADD_SEGMENT:
                // @todo Implement
                // Candidates should be a list of cells
                break

            default:
                throw new TypeError("Unknown update type:" + type);
        }
    };

    suggestions.map(function (suggestion) {
        var candidates = suggestion[1];
        var types = suggestion[0];
        var layer = that.layer;
        return types.map(function (type) {
            return carryOutUpdate(layer, type, candidates)
        });
    });
};

/**
 * @function 
 * @todo Annotate
 */
TemporalPooler.prototype.learn = function () {
    // @todo Should check if any input has been processed yet
    var layer = this.layer;
    var input = this.inputs[this.inputs.length - 1] || [];
    var that = this;

    // Learning I.
    var suggestions = input.
                        map(this.suggestLearningUpdates, this).
                        reduce(concat, []);

    // Learning II.
    // @todo what to do with cells that wrongly predicted something?

    return this.updateNeuroLayer(suggestions);
};

// ==========================
// Visualize and inspect.
// ==========================
/**
 * @function 
 * @todo Annotate
 */
TemporalPooler.prototype.inspectCells = function () {
    console.log(this.layer.getCells(), "Cell Ids");
};

/**
 * @function 
 * @todo Annotate
 */
TemporalPooler.prototype.inspectActivity = function (offset) {
    var offset = offset === undefined ? 0 : offset;
    var t = this.activity.length - 1 + offset;
    var activeCells = this.activity[t] || [];
    var layer = this.layer;
    var activity = layer.getColumns().map(function (col) {
        var row = layer.getCells(col).map(function (cell) {
            return activeCells.indexOf(cell) < 0 ? " " : "A";
        }).join(" ");

        return row
    });
    console.log("| " + activity.join(" | ") + " |" , "Activity", t);

};

/**
 * @function 
 * @todo Annotate
 */
TemporalPooler.prototype.inspectInput = function (offset) {
    var offset = offset === undefined ? 0 : offset;
    var t = this.inputs.length - 1 + offset;
    var input = this.inputs[t] || [];

    var layer = this.layer;
    var affectedCells = layer.getColumns().map(function (col) {
        var cells = layer.getCells(col);
        var output = '';
        if(input.length > 0) {
            output = input.indexOf(col) < 0 ? cells.map(result(' ')).join(" ") : cells.map(result('X')).join("X")
        }
        else {
            output = cells.map(result(' ')).join(" ")
            // output = "empty input"
        }
        return output;
    });
    console.log("| " + affectedCells.join(" | ") + " |", 'Triggered Cols', t)
};


/**
 * @function 
 * @todo Annotate
 */
TemporalPooler.prototype.inspectLayer = function () {
    var matrix = this.layer.getMatrix();
    console.log(matrix.data, 'Layer matrix')
};

/**
 * @function 
 * @todo Annotate
 */
TemporalPooler.prototype.inspectPrediction = function (offset) {
    var offset = offset === undefined ? 0 : offset;
    var layer = this.layer;
    var t = this.predictions.length - 1 + offset;
    var prediction = this.predictions[t] || new Map();
    var predictedCells = layer.getColumns().map(function (col) {
        var row = layer.getCells(col).map(function (cell) {
            return (prediction.get(col) ||  []).indexOf(cell) < 0 ? " " : "P";
        }).join(" ");

        return row;
    });
    console.log("| " + predictedCells.join(" | ") + " |", "Predicted Cells", t);
};

// /**
//  * @function 
//  * @todo Annotate
//  */
// TemporalPooler.prototype.inspect = function () {
//  var output = '';
// };

/** 
 * Exports {@link TemporalPooler} class.
 */
module.exports = TemporalPooler;







