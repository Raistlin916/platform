angular.module('platform')
.directive('microposts', function(){
    return {
        restrict: 'E',
        scope: {},
        templateUrl : '/partials/microposts.html',
        controller: 'Micropost'
    }
})
.controller('Micropost', function($scope, models){
  $scope.open = function(url){
    $scope.$emit('addPort', url);
  };
  var Micropost = models.Micropost;
  $scope.data = {content: ""};
  $scope.addMicropost = function(content){
    if(!content.trim().length){
      return;
    }
    var newPost = new Micropost({content: content});
   
    newPost.$save(null, function(newPost){
      $scope.microposts.push(newPost);
    }, function(){
      $scope.$emit('error', {message: '没权限'});
    });
    $scope.data.content = "";
  };

  $scope.showMicropost = function(){
    Micropost.query(function(posts){
      $scope.microposts = posts;
    });
  }
  $scope.showMicropost();

  $scope.deleteMicropost = function(index){      
    $scope.microposts[index].$remove(null, function(){
      $scope.microposts.splice(index, 1);
    }, function(){
      $scope.$emit('error', {message: '删除失败，没有权限'});
    });
  }

});