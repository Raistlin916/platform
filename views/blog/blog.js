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
      , positiveSide = flipContainer.find('.box.post-box')
      , transitionDeferred;
      flipContainer.bind('transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd', function(e){
        if(flipContainer[0] == e.target){
          if($(e.target).hasClass('turnover')){
            transitionDeferred = $q.defer();
            flipContainer.find('.box.post-box').css('display', 'none');
            editor.refresh();
          } else {
            transitionDeferred.resolve();
          }
        }
      });
      var editor = new Editor();
      editor.render();

      function close(){
        flipContainer.removeClass('turnover');
        positiveSide.css('display', 'block');
      }
      function reset(){
        editor.setValue("");
        scope.blogTitle = "";
      }
      reset();
    },
    templateUrl : '/partials/blogEdit.html'
  }
}).directive('blogViewer', function(){
  return {
    restrict: 'E',
    scope: {blog: '='},
    link: function(scope, elem, attr){
      scope.$watch('blog.content', function(n){
        if(n != null){
          elem.find('.blog-content').html(marked(n));
        }
      });
    },
    templateUrl: "/partials/blogViewer.html"
  }
});