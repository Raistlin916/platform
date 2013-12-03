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
  
  var initialData = {micro: null, todoList: [{content: ''}], imageData: null};
  $scope.resetInputData = function(){
    $scope.data = angular.copy(initialData);
  }

  $scope.resetInputData();

  function validPost(data, type){
    if(data.content == null){
      return false;
    }
    switch (type){
      case 'micro':
        return !!data.content.trim().length;
      break;
      case 'todo':
        return data.content.length != 0;
      break;
      default:
        return false;
    }
  }

  function dispatchPost(type){
    switch (type){
      case 'micro':
        return {content: $scope.data.micro, imageData: $scope.data.imageData};
      break;
      case 'todo':
        return {content: angular.toJson($scope.data.todoList)};
      break;
      default:
        return {};
    }
  }

  $scope.submitPost = function(type){
    var data = dispatchPost(type);
    if(!validPost(data, type)){
      return;
    }
    data.gid = $scope.group._id;
    data.type = type;

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

  

  $scope.openInput = function(){
    $scope.coverOther = true;
  }

  $scope.closeInput = function(){
    $scope.resetInputData();
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
      if(post.hasPraised) {
        post.praisedUserList.unshift(self.info);
        post.praisedCount++;
      } else {
        post.praisedCount--;
        post.praisedUserList.forEach(function(item, i, array){
          if(item._id == self.info._id){
            array.splice(i, 1);
          }
        });
      }
      
    }, function(reason){
      $scope.$emit('error', {message: reason.data});
    });
  }

});