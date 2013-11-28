angular.module('platform')
.directive('errorPanel', function($rootScope){
    return {
        restrict: 'E',
        scope: {},
        link: function(scope, elem, attr){
          scope.errorList = [];
          var tid;
          $rootScope.$on('error', function(e, data){
            if(angular.isDefined(data.message)){
              var el = scope.errorList;
              el.push({message: data.message});
              clearTimeout(tid);
              tid = setTimeout(function(){
                el.length = 0;
                scope.$digest();
              }, 2000);
            }
          });
        },
        templateUrl : '/partials/errorPanel.html'
    }
});