var expect = require('chai').expect;
var fh = require('../lib/functional-helper.js');
var Map = require('../lib/simple-map.js');

describe('Functional Helper', function () { 

	describe("#add and addN", function () {		
		it('should add things properly', function () {
			expect(fh.add(-1,1)).to.equal(0)
			expect(fh.addN(-1)(1)).to.equal(0)
		});
	});

	describe("#partial", function () {
		var partial = fh.partial;
		var identity = function (_) {
			return [].slice.call(arguments);
		};
		
		it('should fix the first arguments of a function', function () {
			expect(partial(identity)()).to.deep.equal([])
			expect(partial(identity, 1,"two",["III"],{4:[444]})(5)).to.deep.equal([1,"two",["III"],{4:[444]},5])
		});
	});

	describe("#insertWith", function () {
		var insertWith = fh.insertWith;
		var m = new Map([[0,99], ["f", -1]]);

		it('should behave like Haskells \'insertWith\', with permuted signatures though', function () {
			expect(insertWith(fh.add, 1, m, 0).toList()).to.deep.equal([[0,100], ["f", -1]])
			expect(insertWith(fh.addN(1), 999, m, 0).toList()).to.deep.equal([[0,101], ["f", -1]])
			expect(insertWith(fh.add, 33, m, 1).toList()).to.deep.equal([[0,101], ["f", -1], [1,33]])
		});
	});

	describe("#adjuster", function () {
		var adjuster = fh.adjuster;
		var m = new Map([[0,0], [1, 1]]);

		it('should behave like adjuster with fixed mutator and initial value', function () {
			expect(adjuster(fh.add, 100)(m, 2).toList()).to.deep.equal([[0,0], [1, 1], [2,100]])
			expect(adjuster(fh.addN(1), 100)(m, 0).toList()).to.deep.equal([[0,1], [1, 1], [2,100]])
		});
	});

	describe("#concat", function () {
		var a = [1,2]
		var b = [3,4]
		it('should produce the concatenation of TWO functions', function () {
			expect(fh.concat(a,b)).to.include.members([1,2,3,4])

		});
	});

	describe("#compose", function () {

		it('should produce the concatenation of TWO functions', function () {
			expect(fh.compose(fh.addN(2),fh.add)(2, 2)).to.equal(6)

		});
	});

	describe("#combine", function () {
		var combine = fh.combine;
		var result = combine(fh.add, fh.add)(1,1)
		it('should produce the array collected values', function () {
			expect(fh.fst(result)).to.equal(2)
			expect(fh.snd(result)).to.equal(2)

		});
	});

	describe("#byValuesOf", function () {
		it('should compare two objects by their values of the given function', function () {
			expect([[1],[3],[2]].sort(fh.byValuesOf(fh.fst))).to.deep.equal([[1],[2],[3]])
		});
	});

	describe("#argmax", function () {
		it('should return the maximum of an array', function () {
			expect(fh.argmax([1,242,3])).
				to.equal(242);
			expect(fh.argmax([{'val': 1},{'val': 2},{'val': 24}], fh.prop("val"))).
				to.deep.equal({'val': 24});
		});
	});

	describe("#wrapGetter", function () {
		it('should turn a Map into a function', function () {
			var map = new Map([[1,11],[2,22]])
			expect(fh.wrapGetter(map)(2)).to.equal(22)
			expect(fh.wrapGetter(map)(-99)).to.equal(0)
			expect(fh.wrapGetter(map, 100)(-99)).to.equal(100)
		});
	});

	describe("#pickRandom", function () {
		var pickRandom = fh.pickRandom;
		var m = [1,2,3];

		it('should pick random from list', function () {
			expect(m).to.include(pickRandom(m))
		});
	});

	describe("#getProp", function () {
		var getProp = fh.getProp;
		var fst = fh.fst;
		var snd = fh.snd;
		var m = [1,2,3];

		it('should pick element from list', function () {
			expect(fst(m)).to.equal(1)
			expect(snd(m)).to.equal(2)
			expect(getProp(2)(m)).to.equal(3)
		});
	});

	describe("#decision", function () {
		var D = fh.Decision;
		var result = function (x) {
			return function () { return x; };
		};

		var d = D(fh.geq(0), null, 
					D(fh.geq( 10), null, 
						D(null, result(">0, > 10")), 
						D(null, result(">0, < 10"))),
					D(fh.geq(-10), null, 
						D(null, result('<0, >-10')), 
						D(null, result('<0, <-10'))))

		it('should get decision based on condition or mutate values', function () {
			expect(d(2)).to.equal(">0, < 10")
			expect(d(20)).to.equal(">0, > 10")
			expect(d(-2)).to.equal("<0, >-10")
			expect(d(-20)).to.equal("<0, <-10")
		});

	});
	
});
