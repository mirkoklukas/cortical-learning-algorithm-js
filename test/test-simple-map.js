var expect = require('chai').expect;
var Map = require('../lib/simple-map.js');

describe('Simple Map', function () { 
	var map = new Map([[1,11],[2,22]]);

	it('should turn a Map into dictionary', function () {
		var dict = map.toDict();
		expect(dict).to.have.all.keys('1','2')
		expect(dict).to.deep.equal({ 1: { value: 11, index: 0}, 2: { value: 22, index: 1} })
	});

	it('should turn a Map into list', function () {
		var list = map.toList();
		expect(list.length).to.equal(2)
		expect(list).to.deep.equal([[1,11],[2,22]])
	});

	it('should check if Map has value from key', function () {
		expect(map.has(1)).to.equal(true)
		expect(map.has(0)).to.equal(false)
	});

	it('should return entries data', function () {
		expect(map.entries()).to.deep.equal([[1,11],[2,22]])
	});

	it('should set and get data', function () {
		expect(map.set(3,33).get(3)).to.equal(33)
		expect(map.entries()).to.deep.equal([[1,11],[2,22],[3,33]])
	});
});
