var assert = require('chai').assert;
var modal = require('../modal.js');

describe('factory: modalService', function() {
  var $rootScope;
  var $scope;
  var $q;
  var $timeout;
  var modalService;

  beforeEach(angular.mock.module(modal));

  beforeEach(inject(function(_$rootScope_, _$q_, _$timeout_, _modalService_) {
    $rootScope = _$rootScope_;
    $q = _$q_;
    $timeout = _$timeout_;
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

    it('should show with a template string', function(done) {
      modalService.show({
        controller: function() {},
        template: '<h1 id="myModal">OKOKOKOK</h1>'
      })
      .then(function(modal) {
        assert.isOk(document.getElementById('myModal'));
        done();
      })
      .catch(done);

      $scope.$apply();
    });

    it('should close modal after showing', function(done) {
      var modalResult = 'result';

      modalService.show({
        controller: function($scope, close) {
          close(modalResult, 0).then(function(result) {
            assert.equal(result, modalResult);
          });
        },
        template: '<h1 id="myModal">OKOKOKOK</h1>'
      })
      .then(function(modal) {
        $q.when(modal.close, function(result) {
          assert.equal(result, modalResult);
          done();
        });
      })
      .catch(done);

      $scope.$apply();
      $timeout.flush();
    });

  });
});