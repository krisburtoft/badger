'use strict';

const expect = require('chai').expect;
let Injector = require('../src/injector').Injector;
let _ = require('lodash');
describe('injector.js', () => {

  describe('parseArguments', function() {
    it('should parse arguments of a given function', () => {
      const args = Injector.parseArguments((a, b, c) => {});
      expect(args).to.deep.equal(['a','b','c']);
    });
  });

  describe('inject', () => {
    it('should create the required components and inject them to the given function.', () => {
      function lodashTest(lodash) {
        expect(lodash).to.equal(_);
      }
      Injector.inject(lodashTest);
    });
  });
});