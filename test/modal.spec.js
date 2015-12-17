var assert = require('chai').assert;
var modal = require('../modal.js');

describe('factory: modalService', function() {
  var $rootScope;
  var $scope;
  var modalService;

  beforeEach(angular.mock.module(modal));

  beforeEach(inject(function(_$rootScope_, _modalService_) {
    $rootScope = _$rootScope_;
    modalService = _modalService_;
    $scope = $rootScope.$new();
  }));

  describe('modalService', function() {
    it('should get an instance of the modalService', function() {
      assert.ok(modalService);
      assert.isObject(modalService);
      assert.property(modalService, 'show');
    });
  });

  describe('modalService#show()', function () {
    it('should reject if no options provided', function (done) {
      var result = modalService.show();

      result.then(function() {
        done();
      }, function(err) {
        assert.isString(err);
        done();
      });

      $scope.$apply();
    });

    it('should reject if no controller provided', function (done) {
      var result = modalService.show({});

      result.then(function() {
        done();
      }, function(err) {
        assert.isString(err);
        done();
      });

      $scope.$apply();
    });
  });
});