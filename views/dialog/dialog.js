angular.module('platform')
.directive('dialog', function(){
    var reservedField = ['opened', 'close', 'global', 'data'];
    function verify(target){
      if(reservedField.some(function(k){
        return angular.isDefined(target[k]);
      })){
        throw new Error('used reserved field in dialog controller');
      }
    }
    return {
      restrict: 'E',
      templateUrl: '/partials/dialog.html',
      scope: {controller: "="},
      transclude: true,
      link: function(scope, elem, attr){
        scope.opened = false;
        scope.data = {};
        scope.close = function(){
          scope.opened = false;
        }
        scope.reset = function(){
          scope.data = {};
        }
        scope.$on('openDialog', function(e, data){
          if(data.name == attr.name){
            if(scope.controller){
              verify(scope.controller);
              scope.controller.init && scope.controller.init.call(scope);
            }
            scope.global = attr.global == 'true';
            scope.opened = true;
            angular.extend(scope, scope.controller);
            scope.$digest();
          }
        });
        scope.$on('closeDialog', function(e, data){
          scope.close();
        });
      }
    }
})
.directive('callDialog', function($rootScope){
  return {
    restrict: 'A',
    link: function(scope, elem, attr){
      angular.element(elem).bind('click', function(){
        $rootScope.$broadcast('openDialog', {name: attr.callDialog});
      });
    }
  }
});