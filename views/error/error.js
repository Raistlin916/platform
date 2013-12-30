angular.module('platform')
.directive('error', function($routeParams){
  return {
    restrict: 'E',
    scope: {},
    link: function(scope, elem, attr){
      scope.msg = $routeParams.msg;
    },
    templateUrl : '/partials/error.html'
  }
});