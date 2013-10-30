angular.module('platform')
.directive('errorPanel', function($rootScope, $timeout){
    return {
        restrict: 'E',
        scope: {},
        link: function(scope, elem, attr){
          scope.errorList = [];
          $rootScope.$on('error', function(e, data){
            if(angular.isDefined(data.message)){
              scope.errorList.push({message: data.message});
              $timeout(function(){
                scope.errorList.shift();
              }, 2000);
            }
          });
        },
        templateUrl : '/partials/errorPanel.html'
    }
});