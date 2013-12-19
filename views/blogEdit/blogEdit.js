angular.module('platform')
// http://docs.angularjs.org/api/ng.directive:ngModel.NgModelController
.directive('contenteditable', function() {
  return {
    restrict: 'A',
    require: '?ngModel',
    link: function(scope, element, attrs, ngModel) {
      if(!ngModel) return; 

      ngModel.$render = function() {
        element.html(ngModel.$viewValue || '');
      };

      element.on('blur keyup change', function() {
        scope.$apply(read);
      });
      read(); 

      function read() {
        var html = element.html();
        if( attrs.stripBr && html == '<br>' ) {
          html = '';
        }
        ngModel.$setViewValue(html);
      }
    }
  };
})
.directive('blogEdit', function(models, self, $q){
  return {
    restrict: 'E',
    scope: {},
    link: function(scope, elem, attr){
      scope.saveBlog = function(){
        
        var newPost = new models.Post({
          content: scope.blogContent,
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
          } else {
            transitionDeferred.resolve();
          }
        }
      });

      function close(){
        flipContainer.removeClass('turnover');
      }
      function reset(){
        scope.blogContent = "";
        scope.blogTitle = "";
      }
      reset();
    },
    templateUrl : '/partials/blogEdit.html'
  }
});