angular.module('platform')
.directive('fileUpload', function($http, models){
  return {
    restrict: 'E',
    scope: {model: "="},
    link: function(scope, elem, attr){
      elem = elem[0];
      var fileInput = elem.querySelector('input[type=file]')
      , showcase = elem.querySelector('.showcase')
      , showcaseImg = elem.querySelector('img');

      scope.callUpload = function(){
        fileInput.click();
      }
      scope.$watch('model.imageData', function(n){
        showcase.style.height = n ? showcaseImg.height + 'px' : (0, fileInput.value = null);
      });

      fileInput.onchange = function(e){
        if(e.target.files[0] == undefined){
          return;
        }
        var fileData = e.target.files[0]
        , url = URL.createObjectURL(fileData);
        showcaseImg.onload = function(){
          scope.model.imageData = fileData;
          // http://stackoverflow.com/questions/15344610/angularjs-scope-watch-on-json-object-not-working-inside-directive
          scope.$digest();
        }
        showcaseImg.src = url;
      }
    },
    templateUrl : '/partials/fileUpload.html'
  }
});