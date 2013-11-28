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


  
  $scope.joinGroup = function(group){
    /*new models.GroupUser({gid: group._id}).$save(null
      , function(){
      $scope.state = 'in-group';
      $timeout(function(){
        $scope.$broadcast('load', {group: group});
      });
    }, function(reason){
      $scope.$emit('error', {message: reason.data});
    });*/

    $scope.state = 'in-group';
    $timeout(function(){
      $scope.$broadcast('load', {group: group});
    });
  }
  $scope.$on('quitGroup', function(){
    $scope.state = 'choose-group';
  });
  $scope.leaveGroup = function(group){
    new models.GroupUser({gid: group._id, uid: self.getInfo()._id}).$remove(null
      , function(){
      
    }, function(reason){
      $scope.$emit('error', {message: reason.data});
    });
  }

});