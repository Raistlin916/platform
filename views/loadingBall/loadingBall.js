angular.module('platform')
.directive('loadingBall', function(){
  return {
    restrict: 'E',
    scope: {},
    link: function(scope, elem, attr){
      scope.$on('loading', function(){
        scope.loading = true;
      });
      scope.$on('loadingDone', function(){
        scope.loading = false;
      });
    },
    template: '<div ng-if="loading"><div class="ball"></div><div class="ball-inner"></div></div>'
  }
});