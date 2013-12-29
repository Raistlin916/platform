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

      var transitionDeferred;

      scope.$on('flipTransEnd', function(e, side){
        if(side == 'down'){
          transitionDeferred = $q.defer();
          editor.refresh();
        }
        if(side == 'up'){
          transitionDeferred.resolve();
        }
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
}).directive('blogViewer', function($filter){
  return {
    restrict: 'E',
    scope: {blog: '=', total: '@'},
    link: function(scope, elem, attr){
      scope.$watch('blog.content', function(n){
        if(n != null){
          elem.find('.blog-content').html(marked(n));
        }
      });

      scope.getTitle = function(){
        if(scope.blog.title == '' || scope.blog.title == null){
          return '发表于' + $filter('date')(scope.blog.date, 'yy年MM月dd日 HH时');
        }
        return scope.blog.title;
      }
     
      scope.emitFlip = function(flipBack){
        scope.$emit('flip', flipBack ? {type: 'blogViewer', model: scope.blog} : null);
      }
    },
    templateUrl: "/partials/blogViewer.html"
  }
});