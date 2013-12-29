angular.module('platform')
.directive('groupDockMenu', function(docStore, $rootScope, util){
  return {
    restrict: 'E',
    scope: {},
    link: function(scope, elem, attr){
      scope.groups = docStore.get('Group');

      scope.wrapBgImgStyle = util.wrapBgImgStyle;

      scope.$on('joinGroup', function(){
        elem.animate({left: 0}, 800, function(){
          initList();
        });
      });

      scope.$on('quitGroup', function(){
        elem.animate({left: -150}, 800, function(){
          initList();
        });
      });

      scope.switchGroup = function(group){
        $rootScope.$broadcast('switchGroup', {group: group});
      };

      var cacheList, icons
      , list = elem.find('.dock-menu-list');
      function resetAndGetIcons(){
        list.css('marginTop', '');
        return elem.find('.dock-menu-icon').css({width: '', height: '', marginBottom: ''});
      }

      elem.css('left', -150);

      function saveIconsCacheList(){
        cacheList = icons.map(function(){
          var item = $(this), offset = item.offset();
          return {x: offset.left + item.width()/2, y: offset.top + item.height()/2, w: item.width(), h: item.height()};
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