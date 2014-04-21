
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

var input = input.map(function(inp) {
	return [].concat.apply([], inp);
});

var spatialPooler = new SpatialPooler(minOverlap, desiredLocalActivity);
spatialPooler.initialize(potentialSynapses);


spatialPooler.columns.forEach(function (col, i) {
	stage.rect([(col["id"]%100)*3,parseInt(col["id"]/100) * 3],[2,2], "rgba(0,0,0,"+0.1+")");
}) 

input[3].forEach(function (val, i) {
	var col =  (val > 0 )? "rgba(0,0,255, 1.0)": "rgba(255,100,255,0.3)";
	stage.rect([(i%28)*3 + 400,parseInt(i/28) * 3],[2,2], col);
}) 


// console.log( spatialPooler.columns.map(function (col) {
//	 return col.overlap;
// }) )

// console.log(sparseInput)


var inp,
	sparseInput;
setInterval(function () {
	inp = input.pop()
	sparseInput = spatialPooler.getSparseRepresentation(inp);
	// spatialPooler.learn()
	stage.clear();


	spatialPooler.columns.forEach(function (col, i) {
		stage.rect([(col["id"]%100)*3,parseInt(col["id"]/100) * 3],[2,2], "rgba(0,0,0,"+0.1+")");
	}) 
	sparseInput.forEach(function (col) {
		stage.rect([(col%100)*3,parseInt(col/100) * 3],[2,2], "rgba(255,0,255,"+1.0+")");
	})

	inp.forEach(function (val, i) {
		var col =  (val > 0 )? "rgba(0,0,255, " + val/255 + ")": "rgba(255,100,255,0.1)";
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
