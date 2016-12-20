/*
 * @license
 * angularjs-modal v1.0.1
 * (c) 2015 Shawn Adrian <shawn@inputlogic.ca> http://inputlogic.ca
 * (c) 2015 Adrian Unger <adrian@inputlogic.ca> http://inputlogic.ca
 * License: MIT
 */

(function (root, factory) {
  'use strict';
  if (typeof define === 'function' && define.amd) {
    define(['angular'], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require('angular'));
  } else {
    return factory(root.angular);
  }
}(this, function (angular) {
  'use strict';

  var moduleName = 'modal';

  angular
    .module(moduleName, [])
    .factory('modalService', modalService);

  modalService.$inject = [
    '$document',
    '$compile',
    '$controller',
    '$http',
    '$rootScope',
    '$q',
    '$timeout',
    '$templateCache'
  ];

  function modalService($document, $compile, $controller, $http, $rootScope, $q, $timeout, $templateCache) {

    // get the body of the document, we'll add the modal to it
    var body = $document.find('body');
    var $ = angular.element;

    return new ModalInstance();

    function ModalInstance() {
      this.show = function(options) {
        // create a deferred we'll resolve when the modal is ready.
        var deferred = $q.defer();

        // validate the input parameters.
        if (!options) {
          deferred.reject("No options have been specified.");
          return deferred.promise;
        }

        var controller = options.controller;
        if (!controller) {
          deferred.reject("No controller has been specified.");
          return deferred.promise;
        }

        // get the actual html of the template.
        getTemplate(options.template, options.templateUrl)
          .then(function(template) {

            // create a new scope for the modal.
            var modalScope = $rootScope.$new();

            // Create the inputs object to the controller - this will include the scope,
            // as well as all inputs provided. We will also create a deferred that is
            // resolved with a provided close function. The controller can then call
            // 'close(result)'. The controller can also provide a delay for closing -
            // this is helpful if there are closing animations which must finish first.
            var closeDeferred = $q.defer();
            var inputs = {
              $scope: modalScope,
              close: function(result, delay) {
                delay = delay || 0;
                $timeout(function () {
                  closeDeferred.resolve(result);
                }, delay);
                return closeDeferred.promise;
              }
            };

            // If we have provided any inputs, pass them to the controller.
            if (options.inputs) {
              for (var inputName in options.inputs) {
                inputs[inputName] = options.inputs[inputName];
              }
            }

            // Parse the modal HTML into a DOM element (in template form).
            var modalElementTemplate = angular.element(template);

            // Compile then link the template element, building the actual element.
            // Set the $element on the inputs so that it can be injected if required.
            var linkFn = $compile(modalElementTemplate);
            var modalElement = linkFn(modalScope);
            inputs.$element = modalElement;

            // Create the controller, explicitly specifying the scope to use.
            var modalController = $controller(controller, inputs);

            // Finally, append the modal to the dom.
            body.append(modalElement);

            // Add 'on' class after timeout so transition happens
            $timeout(function(){
              $(modalElement).addClass('on');
            }, 100);

            // We now have a modal object.
            var modal = {
              controller: modalController,
              scope: modalScope,
              element: modalElement,
              close: closeDeferred.promise
            };

            // close modal on ESC key
            body.bind('keydown', function(event) {
              if(event.keyCode === 27) {
                closeDeferred.resolve();
              }
            });

            var $overlay = $(modalElement).find('.modal-overlay');
            if ($overlay.length) {
              $overlay.click(function(event) {
                event.preventDefault();
                closeDeferred.resolve();
              });
            }

            // When close is resolved, we'll clean up the scope and element.
            modal.close.then(function() {
              // Clean up the scope
              modalScope.$destroy();

              // Remove the element from the dom.
              $(modalElement).removeClass('on');
              $timeout(function(){
                modalElement.remove();
              }, 500);
            });

            deferred.resolve(modal);

          })
          .catch(function(error) {
            deferred.reject(error);
          });

        return deferred.promise;
      };

      // returns a promise which gets the template, either from the template parameter
      // or via a request to the template url parameter.
      function getTemplate(template, templateUrl) {
        var deferred = $q.defer();

        if (template) {
          deferred.resolve(template);
        } else if(templateUrl) {
          // Load the cached template or request it for the first time
          var cachedTemplate = $templateCache.get(templateUrl);

          if (cachedTemplate !== undefined) {
            deferred.resolve(cachedTemplate);
          } else {
            $http({
              method: 'GET',
              url: templateUrl,
              cache: true
            })
            .then(function(result) {
              // save template into the cache and return the template
              $templateCache.put(templateUrl, result.data);
              deferred.resolve(result.data);
            })
            .catch(function(error) {
              deferred.reject(error);
            });
          }
        } else {
          deferred.reject("No template or templateUrl has been specified.");
        }

        return deferred.promise;
      }
    }
  }

  return moduleName;
}));
