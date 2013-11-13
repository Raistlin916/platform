angular.module('platform')
.directive('avatar', function(){
    return {
      restrict: 'E',
      replace: true,
      scope: {emailHash: '@hash', title: '@'},
      templateUrl : '/partials/avatar.html'
    }
});