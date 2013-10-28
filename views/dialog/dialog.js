angular.module('platform')
.directive('dialog', function($rootScope){
    return {
      restrict: 'E',
      templateUrl: '/partials/dialog.html',
      scope: {},
      transclude: true,
      link: function(scope, elem, attr){
        scope.opened = false;
        scope.$on('openDialog', function(e, data){
          scope.global = attr.ngGlobal == 'true';
          scope.opened = true;
          angular.extend(scope, data);
        });
        scope.$on('closeDialog', function(e, data){
          scope.opened = false;
        });
      }
    }
});