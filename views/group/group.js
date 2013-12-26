angular.module('platform')
.directive('group', function(){
  return {
    restrict: 'E',
    scope: {},
    controller: 'Group',
    templateUrl : '/partials/group.html'
  }
})
.controller('Group', function($scope, self, $timeout, docStore, $rootScope){
  $scope.state = 'choose-group';
  $scope.self = self;
  $scope.groups = docStore.get('Group');

  $scope.getBg = function(group){
    if(group.bgPath == null || group.bgPath.length == 0){
      return;
    } else {
      return {'background-image': 'url(upload/'+group.bgPath+')' };
    }
  }
  


  $scope.joinGroup = function(group){
    $scope.state = 'in-group';
    $timeout(function(){
      $rootScope.$broadcast('joinGroup', {group: group});
      $rootScope.$broadcast('groupBgChange', $scope.getBg(group));
    });
  }
  $scope.$on('quitGroup', function(){
    $scope.state = 'choose-group';
    $rootScope.$broadcast('groupBgChange', null);
  });

}).directive('groupBg', function(){
  return {
    restrict: 'C',
    link: function(scope, elem, attr){
      scope.$on('groupBgChange', function(e, bg){
        if(bg == null){
          scope.inGroup = false;
        } else {
          scope.bg = bg;
          scope.inGroup = true;
        }
      });
    }
  }
});