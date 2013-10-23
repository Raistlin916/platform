angular.module('platform')
.controller('Micropost', function($scope, $rootScope, models){
  $scope.open = function(url){
    $rootScope.$broadcast('addPort', url);
  };
  var Micropost = models.Micropost;
  $scope.addMicropost = function(micropostContent){
    if(!micropostContent.trim().length){
      return;
    }
    var newPost = new Micropost({content: micropostContent});
   
    newPost.$save(function(newPost){
      $scope.microposts.push(newPost);
    });
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