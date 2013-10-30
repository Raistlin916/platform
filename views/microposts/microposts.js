angular.module('platform')
.controller('Micropost', function($scope, models){
  var n = 0;
  $scope.open = function(url){
    $scope.$emit('error', {message: 'test' + n++});
    $scope.$emit('addPort', url);
  };
  var Micropost = models.Micropost;
  $scope.addMicropost = function(content){
    if(!content.trim().length){
      return;
    }
    var newPost = new Micropost({content: content});
   
    newPost.$save(function(newPost){
      $scope.microposts.push(newPost);
    });
    $scope.content = "";
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