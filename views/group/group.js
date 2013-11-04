angular.module('platform')
.directive('group', function(){
  return {
    restrict: 'E',
    scope: {},
    controller: 'Group',
    templateUrl : '/partials/group.html'
  }
})
.controller('Group', function($scope, models, self){
  $scope.selfState = self.getState();
  $scope.$watch('selfState.logging', function(n){
    if(n!= undefined){
      $scope.groups = models.Group.query();
    }
  });  

  $scope.addGroup = {
    ok: function(){
      var newGroup = new models.Group(this.data)
      , that = this;
      newGroup.$save(null, function(){
        $scope.groups.push(newGroup);
        that.reset();
        that.close();
      }, function(){
        $scope.$emit('error', {message: '提交失败'});
      });
    }
  };
  $scope.deleteGroup = function(i){
    $scope.groups[i].$remove(null
      , function(){
      $scope.groups.splice(i, 1);
    }, function(){
      $scope.$emit('error', {message: '删除失败'});
    });
  };
  $scope.joinGroup = function(group){
    new models.GroupUsers({gid: group._id}).$save(null
      , function(){
        group.joined = true;
    }, function(reason){
      $scope.$emit('error', {message: reason.data});
    });
  }
  $scope.leaveGroup = function(group){
    new models.GroupUsers({gid: group._id, uid: self.getInfo()._id}).$remove(null
      , function(){
        group.joined = false;
    }, function(reason){
      $scope.$emit('error', {message: reason.data});
    });
  }

});