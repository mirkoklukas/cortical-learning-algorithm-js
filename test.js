
var stage = new Stage("canvas-container")

var getActiveBits = function (input) {
	var active = [];
	for (var i = 0; i < input.length; i++) {
		if(input[i] > 0) active.push(i)
	}
	return active;
}

// convert 2-dimensional image data into 
// an 1-dimensional vector (array)  
// inputs = inputs.map(function(input) {
// 	return [].concat.apply([], input);
// });

inputs = [];
for (var i=0; i<1000; i++) {
	inputs.push([1,1,1,1,1,0,0,0,0,0]);
	inputs.push([1,1,1,1,1,0,0,0,0,0]);
	inputs.push([0,0,0,0,0,1,1,1,1,1]);
}


var minOverlap = 4,
	desiredLocalActivity = 10,
	activationThreshold  = 5,
	spatialPooler  = new SpatialPooler(minOverlap, desiredLocalActivity).configure(config.spatial),
	temporalPooler = new TemporalPooler(activationThreshold).configure(config.temporal),
	spatialPooler2  = new SpatialPooler(minOverlap, desiredLocalActivity).configure(config2.spatial),
	temporalPooler2 = new TemporalPooler(activationThreshold).configure(config2.temporal),
	input = [],
	sparseInput = [],
	prediction = [];


var drawPool = function (position, size, tempPool, stage) {
	var history  = tempPool.getHistory(),
		numCols  = tempPool.getData().numCols,
		numCells = tempPool.getData().numCells,
		hist0    = history[history.length - 1],
		input0   = hist0.activeBits,
		activeCells0 = hist0.activeCells,
		predictedCells0 = hist0.predictedCells,
		predictedColumns0 = hist0.predictedColumns;


	var x, y, color;
	input0.forEach(function (id) {
		color = "rgba(0, 0, 0, 1.0)";
		x = position[0] + id*(size[0] + 1);
		y = position[1] + numCells*(size[1]+1);
		stage.rect(
			[x, y],
			[size[0], size[1]],
			color
		);
	});

	predictedCells0.forEach(function (id) {
		color = "rgba(5, 225, 255, 0.5)";
		x = position[0] + parseInt(id/numCells)*(size[0] + 1);
		y = position[1] + id%numCells*(size[1] + 1);
		stage.rect(
			[x, y],
			[size[0], size[1]],
			color
		);
	});

	activeCells0.forEach(function (id) {
		color = "rgba(255, 0, 255, 0.7)";
		x = position[0] + parseInt(id/numCells)*(size[0] + 1);
		y = position[1] + id%numCells*(size[1] + 1);
		stage.rect(
			[x, y],
			[size[0], size[1]],
			color
		);
	});

	predictedColumns0.forEach(function (id) {
		color = "rgba(0, 0, 0, 0.5)";
		x = position[0] + id*(size[0] + 1);
		y = position[1] - (size[1]+1);
		stage.rect(
			[x, y],
			[size[0], size[1]],
			color
		);
	});
	input0.forEach(function (id) {
		color = "rgba(0, 0, 0, 0.5)";
		x = position[0] + id*(size[0] + 1);
		y = position[1] - (size[1]+1);
		stage.rect(
			[x, y],
			[size[0], size[1]],
			color
		);
	});
	

}

var drawInput = function (position, size, inputs, stage) {
	var x,z, color, scalar;
	inputs.slice(0,20).forEach(function(input, j) { 
		scalar = 1 - j/20;
		for(var i=0, max=input.length; i<max; i++) {

			color = input[i]===1 ? "rgba(0,0,0, "+ scalar + ")" : "rgba(200, 200, 200, "+ scalar + ")";
			x = position[0] + i*(size[0] + 1);
			y = position[1] + (j - 1)*(size[1]+1);
			stage.rect(
				[x,y],
				size,
				color
			);
		}
	})
}





setInterval(function () {
	stage.clear();
	drawInput([10,150], [5,5], inputs, stage)
	
	input = inputs.shift();
	sparseInput = spatialPooler.getSparseRepresentation(getActiveBits(input));
	spatialPooler.learn()
	


	
	processedInput = temporalPooler.processInput(sparseInput);

	temporalPooler2.processInput(spatialPooler2.getSparseRepresentation(processedInput));
	spatialPooler2.learn()


	drawPool([10,100], [2,2], temporalPooler, stage)
	drawPool([10,10], [2,2], temporalPooler2, stage)



}, 500);


