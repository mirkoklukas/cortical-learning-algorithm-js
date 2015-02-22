var cla = require('./lib/index');
var NeuroLayer = require("./lib/neuro-layer.js");
var Map = require('./lib/simple-map.js');


var layer = new NeuroLayer().randomInit(10,4,2,4);

// console.log(layer)

var pooler = new cla.TemporalPooler()
					.setNeuroLayer(layer)
					.setActivationThreshold(3);
					

          
var inputs = [
  [0,1,2],
  [3,4,5],
  [0,1,2],
  [3,4,5],
  [0,1,2],
  [3,4,5],
  [0,1,2],
  [3,4,5],
  [0,1,2],
  [3,4,5],
  [0,1,2],
  [3,4,5],
  [0,1,2],
  [3,4,5],
  [0,1,2],
  [3,4,5],
  [0,1,2],
  [3,4,5],
  [0,1,2],
  [3,4,5],
  [0,1,2],
  [3,4,5],
  [0,1,2],
  [3,4,5],
  [0,1,2]
];

inputs.map(function (input) {
  // console.log('---------------------------')
  pooler.processInput(input);
  // pooler.inspectPrediction(-1);
  pooler.inspectInput();
  pooler.inspectActivity();
  pooler.inspectPrediction();
  pooler.learn()
})

console.log('---------------------------')
inputs.slice(0,4).map(function (input) {
  pooler.processInput(input);
  // pooler.inspectPrediction(-1);
  pooler.inspectInput();
  pooler.inspectActivity();
  pooler.inspectPrediction();
  // pooler.learn()
})

module.exports = pooler;



