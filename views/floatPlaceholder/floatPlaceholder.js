angular.module('platform').directive('floatPlaceholder', function($timeout){
  return {
    restrict: 'C',
    scope: {},
    transclude: true,
    replace: true,
    compile: function compile(tElement, tAttrs, transclude) {
      return {
        pre: function(scope, elems) {
          transclude(scope, function(clone) {
            angular.forEach(clone, function(item){
              if(item.placeholder){
                scope.placeholder = item.placeholder;
              }
            });
          });
        },
        post: function(scope, elem) {
          var input = elem.find('input');

          scope.showPh = false;
          scope.blur = true;
          if(angular.isUndefined(input)) return;
          function checkContent(){
            scope.showPh = input.val().length > 0;
            if(!$(this).hasClass('ng-invalid')){
              elem.removeClass('error');
            }
            scope.$digest();
          }
          input.on('focus blur keyup paste', checkContent)
            .on('blur', function(){
              scope.blur = true;
              if($(this).hasClass('ng-invalid')){
                elem.addClass('error');
              }
              scope.$digest();
            }).on('focus', function(){
              scope.blur = false;
              scope.$digest();
            });

          scope.$watch('blur', function(n){
            elem.toggleClass('blur', n);
          });

          // 当ngModel改变input的value时怎么监听…
          $timeout(function(){
            checkContent();
          });

        }
      }
    },
    templateUrl: '/partials/floatPlaceholder.html'
  }
})