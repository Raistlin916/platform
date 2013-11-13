angular.module('platform')
.directive('microposts', function(){
    return {
        restrict: 'E',
        scope: {},
        templateUrl : '/partials/microposts.html',
        controller: 'Micropost'
    }
})
.controller('Micropost', function($scope, models, self){
  var Micropost = models.Micropost, group;
  $scope.userState = self.getState();
  $scope.$on('load', function(e, data){
    load(data.group);
  });

  $scope.open = function(url){
    $scope.$emit('addPort', url);
  };

  $scope.quit = function(){
    $scope.$emit('quitGroup');
  }
  
  $scope.data = {content: ""};

  $scope.addMicropost = function(){
    var data = angular.extend({}, $scope.data);
    if(!data.content.trim().length){
      return;
    }
    data.gid = $scope.group._id;
    var newPost = new Micropost(data);
   
    newPost.$save(null, function(newPost){
      $scope.microposts.push(newPost);
    }, function(reason){
      $scope.$emit('error', {message: reason.data});
    });


    $scope.data.content = "";
    $scope.data.imageData = null;
  };

  function load(group){
    $scope.group = group;
    Micropost.query({gid: $scope.group._id}, function(posts){
      $scope.microposts = posts;
    });
  }
  

  $scope.deleteMicropost = function(post){
    post.$remove({gid: $scope.group._id, pid: post._id}, function(){
      $scope.microposts.splice($scope.microposts.indexOf(post), 1);
    }, function(reason){
      $scope.$emit('error', {message: reason.data});
    });
  }

});