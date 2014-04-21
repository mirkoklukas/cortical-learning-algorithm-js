
var stage = new Stage("canvas-container")

potentialSynapses.forEach(function (row, i) {
	stage.rect([0,i*3],[20,2], "rgba(255,0,255,"+1.+")");
	row.forEach(function (val, j) {
		stage.rect([j*3 + 30,i*3],[2,2], "rgba(0,0,0,"+val+")");
	})
})

potentialSynapses.forEach(function (row, i) {
	row.forEach(function (val, j) {
		stage.rect([j*3 + 30, potentialSynapses.length*3 + 10 ],[2,2], "rgba(0,0,0,"+ 0.01 +")");
	})
})


var spatialPooler = new SpatialPooler(minOverlap, desiredLocalActivity);
spatialPooler.initialize(potentialSynapses);

