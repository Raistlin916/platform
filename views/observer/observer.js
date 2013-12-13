angular.module('platform')
.directive('observer', function($rootScope){
  return {
    restrict: 'A',
    scope: {ngSrc: '@'},
    link: function(scope, elem, attr){
      elem.click(function(){
        $rootScope.$broadcast('openObserver', scope.ngSrc);
      });
    }
  }
})
.directive('observer', function(){
  return {
    restrict: 'E',
    scope: {},
    link: function(scope, elem, attr){
      scope.$on('openObserver', function(e, src){
        scope.opened = true;
        scope.src = src;
        scope.$digest();
      });
      scope.close = function(){
        scope.opened = false;
      }
    },
    templateUrl: '/partials/observer.html'
  }
});