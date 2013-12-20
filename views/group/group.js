angular.module('platform')
.directive('group', function(){
  return {
    restrict: 'E',
    scope: {},
    controller: 'Group',
    templateUrl : '/partials/group.html'
  }
})
.controller('Group', function($scope, models, self, $timeout, docStore){
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
  
  var groupBg = $('.group-bg');

  $scope.joinGroup = function(group){
    $scope.state = 'in-group';
    $timeout(function(){
      $scope.$broadcast('load', {group: group});
      groupBg.css($scope.getBg(group)).addClass('in-group');
    });
  }
  $scope.$on('quitGroup', function(){
    $scope.state = 'choose-group';
    groupBg.removeClass('in-group');
  });

});