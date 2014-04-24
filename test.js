
var stage = new Stage("canvas-container")

// potentialSynapses.forEach(function (row, i) {
// 	stage.rect([0,i*2 + 10],[20,1], "rgba(255,0,255,"+1.+")");
// 	row.forEach(function (val, j) {
// 		stage.rect([j*2 + 30,i*2 + 10],[1,1], "rgba(0,0,0,"+val+")");
// 	})
// })

// potentialSynapses.forEach(function (row, i) {
// 	row.forEach(function (val, j) {
// 		stage.rect([j*2 + 30, 0], [1,1], "rgba(0,0,0,"+ 0.01 +")");
// 	})
// })


var getActiveBits = function (input) {
	var active = [];
	for (var i = 0; i < input.length; i++) {
		if(input[i] > 0) active.push(i)
	}
	return active;
}

var input = input.map(function(inp) {
	return [].concat.apply([], inp);
});





var minOverlap = 5;
var desiredLocalActivity = 20;

var spatialPooler = new SpatialPooler(minOverlap, desiredLocalActivity);
spatialPooler.initialize(configSpatial);


var inp,
	sparseInput;

setInterval(function () {
	inp = input.pop();
	sparseInput = spatialPooler.getSparseRepresentation(getActiveBits(inp));
	spatialPooler.learn()
	

	stage.clear();
	

	sparseInput.forEach(function (col, i) {
		stage.rect([(col["id"]%28)*3,parseInt(col["id"]/28) * 3],[3,3], "rgba(255,0,255,"+1.0+")");
	}) 

	inp.forEach(function (val, i) {
		var col =  (val > 0 )? "rgba(0,0,255, " + val/255 + ")": "rgba(255,100,255,0.2)";
		stage.rect([(i%28)*3 + 400,parseInt(i/28) * 3],[2,2], col);
	}) 

}, 1000);

// var drawInput = function (input) {

// 	var sparseInput = spatialPooler.getSparseRepresentation(input);



// 	sparseInput.forEach(function (col) {
// 		stage.rect([(col%100)*3,parseInt(col/100) * 3],[2,2], "rgba(255,0,255,"+1.0+")");
// 	})
// }

// drawInput(input[0])
