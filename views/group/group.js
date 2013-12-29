angular.module('platform')
.directive('group', function(){
  return {
    restrict: 'E',
    scope: {},
    controller: 'Group',
    templateUrl : '/partials/group.html'
  }
})
.controller('Group', function($scope, self, $timeout, docStore, $rootScope, util){
  $scope.state = 'choose-group';
  $scope.self = self;
  $scope.groups = docStore.get('Group');

  $scope.wrapBgImgStyle = util.wrapBgImgStyle;


  $scope.joinGroup = function(group){
    $scope.state = 'in-group';
    $timeout(function(){
      $rootScope.$broadcast('joinGroup', {group: group});
    });
  }
  $scope.$on('quitGroup', function(){
    $scope.state = 'choose-group';
  });

});