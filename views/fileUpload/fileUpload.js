angular.module('platform')
.directive('fileUpload', function($http, models){
  return {
    restrict: 'E',
    scope: {model: "="},
    link: function(scope, elem, attr){
      var fileInput = elem.find('input[type=file]')
      , showcase = elem.find('.showcase')
      , showcaseImg = elem.find('img');

      scope.callUpload = function(){
        fileInput.click();
      }
      scope.$watch('model.imageData', function(n){
        if(n != undefined){
          showcase.height(parseInt(showcaseImg.css('marginTop'))+showcaseImg.height());
        } else {
          showcase.height(0);
          fileInput.val(null);
        }
      });

      fileInput.on('change', function(e){
        if(e.target.files[0] == undefined){
          return;
        }
        var fileData = e.target.files[0]
        , url = URL.createObjectURL(fileData);
        showcaseImg.on('load', function(){
          scope.model.imageData = fileData;
          // http://stackoverflow.com/questions/15344610/angularjs-scope-watch-on-json-object-not-working-inside-directive
          scope.$digest();
        });
        showcaseImg.attr('src', url);
      });
    },
    templateUrl : '/partials/fileUpload.html'
  }
});