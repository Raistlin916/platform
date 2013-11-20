angular.module('platform')
.directive('inputBody', function($document){
  // 我尝试了angular-animation, 单纯的css3动画，经过三天努力，都失败了
  // 最后决定还是用jq做动画，我有罪。
  return {
    restrict: 'E',
    link: function(scope, elem, attr){
      var opened = false;
      $document.delegate('.big-lightbulb', 'click', function(){
        if(opened) return;
        opened = true;
        var $content = $('.input-body-content')
        , $nav = $('.input-body-nav')
        , $main = $('.top-input .post-main');

        var initW = $main.width()
        , mainW = $main.width('auto').width();

        $main.width(initW).animate({
          width: mainW
        }, 500, function(){
          $nav.animate({
            opacity: 0
          }, 500, function(){
            $nav.css({
              display: 'none'
            });
            h = $content.css({height: 'auto'}).height();
            $content.css({
              opacity: 0,
              height: $nav.height(),
              display: 'block'
            }).animate({
              height: h,
            }, 600).animate({
              opacity: 1
            }, 600, function(){
              $content.css({
                height: 'auto'
              });
            });
          });
        }).css('overflow', 'visible');
      })
      .delegate('.close-input', 'click', closeInputAnimation)
      .delegate('.submit-input', 'click', closeInputAnimation);

      function closeInputAnimation(){
        if(!opened){
          return;
        }
        opened = false;
        var $content = $('.input-body-content')
        , $nav = $('.input-body-nav')
        , $main = $('.top-input .post-main');

        $content.animate({
            opacity: 0
          }, 600).animate({
            height: $nav.height(),
          }, 600, function(){
            $content.css({
              display: 'none'
            });
            $nav.css({
              display: 'block'
            }).animate({
              opacity: 1
            }, 500, function(){
              $main.animate({
                width: 70
              }, 500).css('overflow', 'visible');
            });
          });
      }
    },
    transclude: true,
    replace: true,
    template: '<div ng-transclude/>'
  }
});