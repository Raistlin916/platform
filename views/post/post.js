angular.module('platform')
.directive('post', function(){
    return {
        restrict: 'E',
        scope: {},
        templateUrl : '/partials/post.html',
        controller: 'Post'
    }
})
.controller('Post', function($scope, models, self, util){
  var Post = models.Post, group;
  $scope.userState = self.getState();
  $scope.$on('load', function(e, data){
    load(data.group);
  });


  $scope.quit = function(){
    $scope.$emit('quitGroup');
  }
  
  $scope.data = {content: ""};

  $scope.addPost = function(){
    var data = angular.extend({}, $scope.data);
    if(!data.content.trim().length){
      return;
    }
    data.gid = $scope.group._id;
    var newPost = new Post(data);
   
    newPost.$save(null, function(newPost){
      $scope.posts.push(newPost);
    }, function(reason){
      $scope.$emit('error', {message: reason.data});
    });

    $scope.data.content = "";
    $scope.data.imageData = null;
  };

  function load(group){
    $scope.group = group;
    Post.query({gid: $scope.group._id}, function(posts){
      $scope.posts = posts;
    });
  }
  

  $scope.deletePost = function(post){
    post.$remove({gid: $scope.group._id, pid: post._id}, function(){
      util.arrayRemove($scope.posts, post);
    }, function(reason){
      $scope.$emit('error', {message: reason.data});
    });
  }

  $scope.togglePraise = function(post){
    var data = {
      gid: $scope.group._id,
      pid: post._id
    }

    new models.Praise(data)[post.hasPraised? '$remove': '$save'](null, function(){
      post.hasPraised = !post.hasPraised;
      var selfInfo = self.getInfo();
      if(post.hasPraised) {
        post.praisedUserList.unshift(selfInfo);
      } else {
        post.praisedUserList.forEach(function(item, i, array){
          if(item._id == selfInfo._id){
            array.splice(i, 1);
          }
        });
      }
      
    }, function(reason){
      $scope.$emit('error', {message: reason.data});
    });
  }

});