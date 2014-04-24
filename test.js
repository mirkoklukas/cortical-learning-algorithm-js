
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
		data = temporalPooler.getData(),
		hist0 = history[history.length - 1],
		input0,
		activeCells0,
		predictedCells0,
		predictedColumns0;

	var x, y, color;
	input0.forEach(function (id) {
		color = "rgba(0, 0, 0, 1.0)";
		stage.rect(
			[ position[0] + id*(size[0] + 1), position[1]],
			[size[0], size[1]],
			color
		);
	});

	activeCells0.forEach(function (id) {

	});

	predictedCells0.forEach(function (id) {

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
	
	draw(spatialPooler.segments,[0,80], [5,30], "rgba(0,0,0,"+ 0.1+")", stage)
	// draw(prediction,[0,200],[2,10], "rgba(255,255,100,"+ 1.0+")", stage)
	draw(sparseInput,[0,120], [5,10], "rgba(255,0,255,"+ 1.0+")", stage)


	activeCells = temporalPooler.computeActiveCells(sparseInput);
	predictedCells = temporalPooler.computePredictions(activeCells).cells;
	predictedColumns = temporalPooler.computePredictions(activeCells).columns;

	processedInput = temporalPooler.processInput(sparseInput);
	// console.log(activeCells);

	draw(predictedColumns,[0,60],[5,10], "rgba(0,255,255,"+ 1.0+")", stage)
	draw(sparseInput,[0,60], [5,10], "rgba(255,0,255,"+ 1.0+")", stage)

	var x,y;
	for( x in temporalPooler.getData().columns) {
		// debugger
		x = parseInt(x)
		temporalPooler.getData().columns[x].cells.forEach(function (y) {

			y = parseInt(y)
			var color = "rgba(255,0,255," + 0.5 + ")";
			if( activeCells.indexOf(parseInt(y)) > -1) { 
				stage.rect(
					[ x*6 , y%5*6 + 80],
					[5, 5],
					color
				);
			}

			color = "rgba(0,255,255," + 0.5 + ")";
			if( predictedCells.indexOf(parseInt(y)) > -1) { 
				stage.rect(
					[ x*6 , y%5*6 + 80],
					[5, 5],
					color
				);
			}
		})
		 
	}

	// var x, y;
	// for( var s in spatialPooler.synapses) {
	// 	x = parseInt(s);
	// 	for( var c in spatialPooler.synapses[s]) {
	// 		y = parseInt(c);
	// 		var color = "rgba(255,0,255," + spatialPooler.synapses[s][c]["permanence"]*1.4 + ")";
	// 		stage.rect(
	// 			[ x*1 , y*1 + 100],
	// 			[1, 1],
	// 			color
	// 		);

	// 	}
	// }



	inp.forEach(function (val, i) {
		var col =  (val > 0 )? "rgba(0,0,255, " + val/255 + ")": "rgba(255,100,255,0.2)";
		stage.rect([(i%28)*3 + 0,parseInt(i/28) * 3 + 200],[2,2], col);
	}) 




}, 500);


