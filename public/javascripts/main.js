angular.module('platform', ['ngResource'])
.factory('Micropost', function($resource){
    return $resource('/microposts/:postId', {postId:'@_id'});
  })
.factory('util', function(){
  return {
    remove: function(a, i){
      a.splice( a.indexOf(i), 1);
    }
  }
})
.controller('Micropost', function($scope, Micropost, util){

    $scope.addMicropost = function(micropostContent){
      if(!micropostContent.trim().length){
        return;
      }
      var newPost = new Micropost({content: micropostContent});
      $scope.microposts.push(newPost);
      newPost.$save();
      $scope.micropostContent = "";
    };

    $scope.showMicropost = function(){
      Micropost.query(function(posts){
        $scope.microposts = posts;
      });  
    }
    $scope.showMicropost();

    $scope.deleteMicropost = function(index){      
      $scope.microposts[index].$remove(function(){
        $scope.microposts.splice(index, 1);
      });
    }

  });