angular.module('platform')
.directive('inputBody', function(){
  return {
    restrict: 'E',
    link: function(scope, elem, attr){
      // -1 not open, 0 opening, 1 opened
      var openState = -1;
      elem.delegate('.icon', 'click', function(){
        if(openState !== -1) return;
        openState = 0;
        var target = $(this).data('target');
        var $content = $('.input-body-content').filter(function(){
                    return $(this).data('type') == target;
                  })
        , $nav = $('.input-body-nav')
        , $main = $('.top-input .post-main');

        if(target == 'blog'){
          $(this).parents('.flip-container').toggleClass('turnover');
        }

        if(!$content.length){
          openState = -1;
          return;
        }

        $('post').removeClass('flip-util');

        var initW = $main.width()
        , mainW = $main.width('auto').width();

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
            h += parseFloat($content.css('padding-top'))+ parseFloat($content.css('padding-bottom'));
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
                width: 170
              }, 300, function(){
                openState = -1;
                $('post').addClass('flip-util');
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