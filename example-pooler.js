var cla = require('./lib/index');
var NeuroLayer = require("./lib/neuro-layer.js");
var Map = require('./lib/simple-map.js');


var layer = new NeuroLayer().randomInit(15,10,20,15);

// console.log(layer)

var pooler = new cla.TemporalPooler()
          .setNeuroLayer(layer)
          .setActivationThreshold(3);
  
var inputs = [
  [0,1],
  [2,3],
  [4,5]
];

console.log('Without learning');
inputs.map(function (input) {
  pooler.processInput(input);
  pooler.inspectInput();
  pooler.inspectActivity();
  pooler.inspectPrediction();
});

pooler.processInput([]);

console.log('Learn... not showing that though');
for (var i=0; i< 50; i++) {
  // pooler.processInput(inputs[0])
  inputs.slice().map(function (input) {
    pooler.processInput(input);
    pooler.learn()
  })
}

pooler.processInput([]);

console.log('Lets take a look again');
inputs.map(function (input) {
  pooler.processInput(input);
  pooler.inspectInput();
  pooler.inspectActivity();
  pooler.inspectPrediction();
});

console.log('And at this input');
inputs.slice(1).map(function (input) {
  pooler.processInput(input);
  pooler.inspectInput();
  pooler.inspectActivity();
  pooler.inspectPrediction();
});





