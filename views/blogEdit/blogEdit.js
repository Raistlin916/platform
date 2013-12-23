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
      flipContainer.bind("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", function(e){
        if(flipContainer[0] == e.target){
          if($(e.target).hasClass('turnover')){
            transitionDeferred = $q.defer();
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
      }
      function reset(){
        editor.setValue("");
        scope.blogTitle = "";
      }
      reset();
    },
    templateUrl : '/partials/blogEdit.html'
  }
});