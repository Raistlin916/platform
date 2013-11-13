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
      scope.fileUploaded = true;

      scope.callUpload = function(){
        fileInput.click();
      }
      fileInput.onchange = function(e){
        if(e.target.files[0] == undefined){
          return;
        }
        var fileData = e.target.files[0]
        , url = URL.createObjectURL(fileData);
        showcaseImg.onload = function(){
          showcase.style.height = this.height + 'px';

          scope.model.imageData = fileData;
        }
        showcaseImg.src = url;

      }
    },
    templateUrl : '/partials/fileUpload.html'
  }
});