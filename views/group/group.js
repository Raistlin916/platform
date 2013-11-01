angular.module('platform')
.directive('group', function(){
  return {
    restrict: 'E',
    scope: {},
    controller: 'Group',
    templateUrl : '/partials/group.html'
  }
})
.controller('Group', function($scope){
  $scope.groups = [{name: 'name1', desc: 'desc1'},{name: 'name2', desc: 'desc2'},{name: 'name3', desc: 'desc3'}];
  $scope.addGroup = {
    ok: function(){
        this.close();
      }
    };
});