angular.module('platform')
.directive('portList', function($rootScope, models){
  return {
    restrict: 'E',
    scope: {},
    link: function(scope){
      scope.list = [];
      $rootScope.$on('addPort', function(e, url){
        var id = url.split('/').pop();
        scope.list.push(models.User.get({id: id}));
      });
    },
    templateUrl: '/partials/portList.html'
  }
});