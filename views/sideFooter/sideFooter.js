angular.module('platform')
.directive('sideFooter', function(){
  return {
    restrict: 'E',
    scope: {},
    link: function(scope, elem, attr){
        scope.list = [{
          title: 'github',
          url: 'https://github.com/Raistlin916/platform'
        }, {
          title: '反馈',
          url: '/report'
        }, {
          title: '关于',
          url: '/about'
        }];
    },
    templateUrl : '/partials/sideFooter.html'
  }
});