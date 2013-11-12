angular.module('platform')
.directive('fileUpload', function(){
  return {
    restrict: 'E',
    scope: {},
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
        var url = URL.createObjectURL(e.target.files[0]);
        showcaseImg.onload = function(){
          showcase.style.height = this.height + 'px';
        }
        showcaseImg.src = url;

      }
    },
    templateUrl : '/partials/fileUpload.html'
  }
});