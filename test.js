
var stage = new Stage("canvas-container")

var getActiveBits = function (input) {
	var active = [];
	for (var i = 0; i < input.length; i++) {
		if(input[i] > 0) active.push(i)
	}
	return active;
}



input = input.map(function(inp) {
	return [].concat.apply([], inp);
});





var minOverlap = 5,
	desiredLocalActivity = 20,
	activationThreshold = 5,
	spatialPooler = new SpatialPooler(minOverlap, desiredLocalActivity);
	temporalPooler = new TemporalPooler(activationThreshold);

spatialPooler.initialize(configSpatial);
temporalPooler.initialize(configTemporal);


var drawPool = function (position, size, tempPool, stage) {
	var history = tempPool.getHistory(),
		numCols = temporalPooler.getData().numCols,
		numCells = temporalPooler.getData().numCells,
		hist0 = history[history.length - 1],
		input0 = hist0.activeBits,
		activeCells0 = hist0.activeCells,
		predictedCells0 = hist0.predictedCells,
		predictedColumns0 = hist0.predictedColumns;


	var x, y, color;
	input0.forEach(function (id) {
		color = "rgba(0, 0, 0, 1.0)";
		stage.rect(
			[ position[0] + id*(size[0] + 1), position[1] + 50 ],
			[size[0], size[1]],
			color
		);
	});

	activeCells0.forEach(function (id) {
		color = "rgba(255, 0, 255, 0.5)";
		stage.rect(
			[ position[0] + parseInt(id/numCells)*(size[0] + 1), position[1] + id%numCells*(size[1] + 1) ],
			[size[0], size[1]],
			color
		);
	});

	predictedCells0.forEach(function (id) {
		color = "rgba(5, 225, 255, 0.5)";
		stage.rect(
			[ position[0] + parseInt(id/numCells)*(size[0] + 1), position[1] + id%numCells*(size[1] + 1) ],
			[size[0], size[1]],
			color
		);
	});

}

var draw = function (segments, position, size, color,  stage) {
	var i = 0;
	for( s in segments) {

		if(!(segments instanceof Array)) i = parseInt(s);
		else i = segments[s];

		stage.rect(
			[ i*(size[0] +1) + position[0], position[1]],
			size,
			color
		);
	}
}



var inp,
	sparseInput,
	prediction;

setInterval(function () {
	inp = input.pop();
	sparseInput = spatialPooler.getSparseRepresentation(getActiveBits(inp));
	spatialPooler.learn()
	

	// prediction = temporalPooler.processInput(sparseInput);


	stage.clear();
	
	// draw(spatialPooler.segments,[0,80], [5,30], "rgba(0,0,0,"+ 0.1+")", stage)
	// draw(prediction,[0,200],[2,10], "rgba(255,255,100,"+ 1.0+")", stage)
	// draw(sparseInput,[0,120], [5,10], "rgba(255,0,255,"+ 1.0+")", stage)


	activeCells = temporalPooler.computeActiveCells(sparseInput);
	predictedCells = temporalPooler.computePredictions(activeCells).cells;
	predictedColumns = temporalPooler.computePredictions(activeCells).columns;

	processedInput = temporalPooler.processInput(sparseInput);
	// console.log(activeCells);

	drawPool([10,10], [5,5], temporalPooler, stage)



}, 500);


