angular.module('platform')
.directive('inputBody', function($document){
  // 我尝试了angular-animation, css3动画，经过三天努力，都失败了
  // 最后决定还是用jq做动画，我有罪。
  return {
    restrict: 'E',
    link: function(scope, elem, attr){
      // -1 not open, 0 opening, 1 opened
      var openState = -1;
      $document.delegate('.big-lightbulb', 'click', function(){
        if(openState !== -1) return;
        openState = 0;
        var $content = $('.input-body-content')
        , $nav = $('.input-body-nav')
        , $main = $('.top-input .post-main');

        var initW = $main.width()
        , mainW = $main.width('auto').width();

        console.log(mainW);

        $main.width(initW).animate({
          width: mainW
        }, 300, function(){
          $nav.animate({
            opacity: 0
          }, 300, function(){
            $nav.css({
              display: 'none'
            });
            h = $content.css({display: 'block', height: 'auto'}).height();
            $content.css({
              opacity: 0,
              height: $nav.height()
            }).animate({
              height: h,
            }, 300).animate({
              opacity: 1
            }, 300, function(){
              $content.css({
                height: 'auto'
              });
              openState = 1;
            });
          });
        }).css({overflow: 'visible'});
      })
      .delegate('.close-input', 'click', closeInputAnimation)
      .delegate('.h-submit-input', 'click', closeInputAnimation);

      function closeInputAnimation(){
        if(openState !== 1) return;
        openState = 0;
        var $content = $('.input-body-content')
        , $nav = $('.input-body-nav')
        , $main = $('.top-input .post-main');

        $content.animate({
            opacity: 0
          }, 300).animate({
            height: $nav.height(),
          }, 300, function(){
            $content.css({
              display: 'none'
            });
            $nav.css({
              display: 'block'
            }).animate({
              opacity: 1
            }, 300, function(){
              $main.animate({
                width: 70
              }, 300, function(){
                openState = -1;
              }).css({overflow: 'visible'});
            });
          });
      }
    },
    transclude: true,
    replace: true,
    template: '<div ng-transclude/>'
  }
});