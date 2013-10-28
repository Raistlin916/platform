angular.module('platform')
.directive('errorPanel', function($rootScope){
    return {
        restrict: 'E',
        scope: {},
        link: function(scope, elem, attr){
          $rootScope
        },
        templateUrl : '/partials/errorPanel.html'
    }
});