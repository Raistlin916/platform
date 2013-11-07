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
  var Micropost = models.Micropost, group;
  $scope.$on('load', function(e, data){
    load(data.group);
  });

  $scope.open = function(url){
    $scope.$emit('addPort', url);
  };

  $scope.quit = function(){
    $scope.$emit('quitGroup');
  }

  $scope.test = function(){
    console.log(arguments);
  }
  
  $scope.data = {content: ""};

  $scope.addMicropost = function(content){
    if(!content.trim().length){
      return;
    }
    var newPost = new Micropost({content: content, gid: $scope.group._id});
   
    newPost.$save(null, function(newPost){
      $scope.microposts.push(newPost);
    }, function(reason){
      $scope.$emit('error', {message: reason.data});
    });
    $scope.data.content = "";
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