angular.module('platform')
.directive('groupDockMenu', function(docStore, util, $location){
  return {
    restrict: 'E',
    scope: {},
    link: function(scope, elem, attr){
      scope.groups = docStore.get('Group');
      scope.wrapBgImgStyle = util.wrapBgImgStyle;
      elem.css('left', -150);

      function show(){
        elem.animate({left: 0}, 800);
      }

      function hide(){
        elem.animate({left: -150}, 800);
      }

      function lookOut(path){
        return path.indexOf('/page/groups')!= -1 && path.indexOf('/posts')!= -1;
      }

      lookOut($location.path()) && show();


      scope.joinGroup = function(group){
        $location.path('/page/groups/' + group._id + '/posts');
      };

      scope.$on('$locationChangeSuccess', function(e, url){
        lookOut(url) ? show() : hide();
      });

      var cacheList, icons
      , list = elem.find('.dock-menu-list');
      function resetAndGetIcons(){
        list.css('marginTop', '');
        return elem.find('.dock-menu-icon').css({width: '', height: '', marginBottom: ''});
      }

      

      function saveIconsCacheList(){
        var parentOffset = elem.offset();
        cacheList = icons.map(function(){
          var item = $(this), offset = item.offset();
          return {x: offset.left + item.width()/2 - parentOffset.left, y: offset.top + item.height()/2 - parentOffset.top, w: item.width(), h: item.height()};
        });
      }

      function keepCenter(){
        list.css('top', (elem.height()- list.height())/2);
      }

      function initList(){
        icons = resetAndGetIcons();
        keepCenter();
        saveIconsCacheList();
      }

      $(window).on("resize", function(event){
        initList();
      });
      elem.on('DOMNodeInserted', function(e){
        initList();
      }).on('mouseleave', function(){
        resetAndGetIcons();
        keepCenter();
      }).on('mousemove', function(e){
        var x = e.clientX, y = e.clientY
        , n = cacheList.length
        , rect = {}, dx, dy, dirt, target, enlarge;
        while(n--){
          rect = cacheList[n];
          dx = rect.x - x;
          dy = rect.y - y;

          dirt = ~~Math.sqrt(dx*dx+dy*dy);
          target = icons.slice(n, n+1);

          if(dirt < 100){
            enlarge = 80*Math.cos(.005*Math.PI*dirt);
          } else {
            enlarge = 0;
          }

          target.css('marginBottom', enlarge*.3);
          target.width(rect.w + enlarge);
          target.height(rect.h + enlarge);
        }

        keepCenter();
      });
    },
    templateUrl : '/partials/dockMenu.html'
  }
});