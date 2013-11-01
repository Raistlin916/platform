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
  $scope.groups = [];
  $scope.addGroup = {
    ok: function(){
        $scope.groups.push({name: '123', desc: 'bbb'});
        this.close();
      }
    };
});