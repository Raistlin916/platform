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
  $scope.self = self;
  $scope.$on('load', function(e, data){
    $scope.group = data.group;
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
      $('.h-submit-input').click();
    }, function(reason){
      $scope.$emit('error', {message: reason.data});
      $('.h-submit-input').click();
    });

    $scope.closeInput();
  };

  $scope.clearInputData = function(){
    $scope.data.content = "";
    $scope.data.imageData = null;
  }

  $scope.openInput = function(){
    $scope.coverOther = true;
  }

  $scope.closeInput = function(){
    $scope.clearInputData();
    $scope.coverOther = false;
  }


  $scope.posts = [];
  $scope.p = -1;
  $scope.loading = false;
  $scope.hasMore = true;
  $scope.loadPage = function(){
    if(!$scope.hasMore){
      return;
    }
    $scope.loading = true;
    Post.query({gid: $scope.group._id, p: $scope.p+1}, function(res){
      $scope.loading = false;
      $scope.posts.push.apply($scope.posts, res.data);
      delete res.data;
      $scope.totalPage = Math.ceil(res.total/res.step);
      $scope.p++;
      $scope.hasMore = $scope.p+1 < $scope.totalPage;
      angular.extend($scope, res);
    });
  }
  

  $scope.deletePost = function(post){
    confirm('确认删除？') && new models.Post(post).$remove({gid: $scope.group._id, pid: post._id}, function(){
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