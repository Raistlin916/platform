angular.module('platform')
.directive('admin', function(){
  return {
    restrict: 'E',
    scope: {},
    controller: 'Admin',
    templateUrl : '/partials/admin.html'
  }
}).controller('Admin', function($scope, models, docStore){
  $scope.groups = docStore.get('Group');

  $scope.addGroup = {
    ok: function(){
      var newGroup = new models.Group(this.data)
      , that = this;
      newGroup.$save(null, function(){
        newGroup.joined = false;
        $scope.groups.push(newGroup);
        that.reset();
        that.close();
      }, function(){
        // catch err
      });
    }
  };
  $scope.updateGroup = {
    ok: function(){
      this.model.$save();
      this.close();
    }
  }
  $scope.deleteGroup = function(i){
    confirm('确定删除？') && $scope.groups[i].$remove(null
      , function(){
      $scope.groups.splice(i, 1);
    }, function(){
      // catch err
    });
  };


});