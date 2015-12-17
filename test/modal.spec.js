var assert = require('chai').assert;
var modal = require('../modal.js');

describe('factory: modalService', function() {
  var modalService;

  beforeEach(angular.mock.module(modal));
  beforeEach(inject(function(_modalService_) { 
    modalService = _modalService_; 
  }));

  describe('modalService', function() {
    it('should get an instance of the modalService', function() {
      assert.ok(modalService);
      assert.isObject(modalService);
      assert.property(modalService, 'show');
    });
  });
});