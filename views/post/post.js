angular.module('platform')
.directive('post', function(){
    return {
        restrict: 'E',
        scope: {},
        templateUrl : '/partials/post.html',
        controller: 'Post'
    }
})
.controller('Post', function($scope, models, self, util, $q){
  // 为了解决翻转和遮罩的冲突
  // 在inputBody中也需要操作flip-util
  $('post').addClass('flip-util');
  
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

  function validPost(post){
    var d = $q.defer();
    if(post.content == null){
      d.reject('');
      return d.promise;
    }
    if(post.type == 'micro'){
      if(!post.content.trim().length){
        d.reject();
      }
    } else if(post.type == 'todo'){
      if(!post.todoList.length){
        d.reject();
      }
    } else if(post.type == 'blog'){
      if(!post.content.trim().length){
        d.reject();
      }
    }

    d.resolve();
    return d.promise;
  }

  function dispatchPost(type){
    var data, d;

    d = $q.defer();
    d.promise.then(function(){
      $scope.closeInput();
      $('.h-submit-input').click();
    }, function(reason){
      console.log(reason);
      $scope.$emit('error', {message: reason});
    });

    switch (type){
      case 'micro':
        data = {content: $scope.data.micro, imageData: $scope.data.imageData};
      break;
      case 'todo':
        data = {  
                content: "", 
                todoList: $scope.data.todoList.filter(function(item){
                  return item.content.trim().length > 0;
                })
              };
      break;
      default:
        return d.reject('未知类型');
      break;
    }
    data.type = type;

    d.newPost = new models.Post(data);
    $scope.$emit('addNewPost', d);
  }

  $scope.$on('addNewPost', function(e, deferred){
    var newPost = deferred.newPost;

    validPost(newPost).then(function(){
      newPost.gid = $scope.group._id;
      newPost.$save(function(newPost){
        $scope.posts.push(newPost);
        deferred.resolve();
      });
    }, function(reason){
      deferred.reject(reason);
    });

  });

  $scope.submitPost = function(type){
    dispatchPost(type);
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
    var d1 = $q.defer()
    , d2 = $q.defer();

    setTimeout(function(){
      d1.resolve();
    }, 300);

    $scope.loading = true;
    Post.query({gid: $scope.group._id, p: $scope.p+1}, function(res){
      d2.resolve(res);
    });

    d1.promise.then(function(){
      return d2.promise;
    }).then(function(res){

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

}).directive('flipContainer', function(){
  return {
    restrict: 'C',
    link: function(scope, elem, attr){
      var backSide = elem.find('.flip-back')
      , $body = $(document.body);
      scope.flip = function(type, model){
        elem.toggleClass('turnover');
        if(type){
          scope.flipBackType = type;
        }
        if(model){
          scope.flipBackModel = model;
        }
        if(elem.hasClass('turnover')){
          backSide.css('top', $body.scrollTop());
        }
      }
      scope.$on('flip', function(e, data){
        data = data || {};
        scope.flip(data.type, data.model);
      });

    }
  }
});