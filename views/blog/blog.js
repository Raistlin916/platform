angular.module('platform')
.directive('blogEdit', function(models, self, $q){
  return {
    restrict: 'E',
    scope: {},
    link: function(scope, elem, attr){
      scope.saveBlog = function(){
        var newPost = new models.Post({
          content: editor.getValue(),
          title: scope.blogTitle,
          type: 'blog'
        });

        var d = $q.defer();
        d.promise.then(function(){
          close();
          transitionDeferred.promise.then(function(){
            reset();
          });
        }, function(){
          console.log('error');
        });

        d.newPost = newPost;
        scope.$emit('addNewPost', d);
      }
      scope.cancel = function(){
        close();
      }

      var flipContainer = $(".flip-container")
      , transitionDeferred;
      flipContainer.bind('transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd', flipTrans);

      function flipTrans(e){
        if(flipContainer[0] == e.target){
          if($(e.target).hasClass('turnover')){
            transitionDeferred = $q.defer();
            editor.refresh();
          } else {
            transitionDeferred.resolve();
          }
        }
      }

      scope.$on('$destroy', function(){
        flipContainer.unbind('transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd', flipTrans);
      });
      var editor = new Editor();
      editor.render();

      function close(){
        scope.$emit('flip');
      }
      function reset(){
        editor.setValue("");
        scope.blogTitle = "";
      }
      reset();
    },
    templateUrl : '/partials/blog.html'
  }
}).directive('blogViewer', function(){
  return {
    restrict: 'E',
    scope: {blog: '=', total: '@'},
    link: function(scope, elem, attr){
      scope.$watch('blog.content', function(n){
        if(n != null){
          elem.find('.blog-content').html(marked(n));
        }
      });
     
      scope.emitFlip = function(flipBack){
        scope.$emit('flip', flipBack ? {type: 'blogViewer', model: scope.blog} : null);
      }
    },
    templateUrl: "/partials/blogViewer.html"
  }
});