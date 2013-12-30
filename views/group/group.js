angular.module('platform')
.directive('group', function(){
  return {
    restrict: 'E',
    scope: {},
    controller: 'Group',
    templateUrl : '/partials/group.html'
  }
})
.controller('Group', function($scope, $location, docStore, util){
  $scope.wrapBgImgStyle = util.wrapBgImgStyle;

  $scope.groups = docStore.get('Group');

  $scope.joinGroup = function(group){
    $location.path('/page/groups/' + group._id + '/posts');
  }

});