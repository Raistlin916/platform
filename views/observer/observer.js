angular.module('platform')
.directive('observer', function($rootScope){
  return {
    restrict: 'A',
    scope: {ngSrc: '@'},
    link: function(scope, elem, attr){
      elem.click(function(){
        $rootScope.$broadcast('openObserver', scope.ngSrc);
      });
    }
  }
})
.directive('observer', function($q){
  return {
    restrict: 'E',
    scope: {},
    link: function(scope, elem, attr){
      var tid;
      scope.$on('openObserver', function(e, src){
        
        scope.opened = true;
        scope.src = src;
        
        scope.$digest();

        var d = $q.defer()
        , d2 = $q.defer();

        tid = setTimeout(function(){
          d.resolve();
        }, 700);

        elem.find('img').on('load', function(){
          d2.resolve();
        });

        d.promise.then(function(){
          return d2.promise;
        }).then(function(){
          scope.loaded = true;
        });

      });

      scope.close = function close(){
        scope.opened = false;
        scope.loaded = false;
        clearTimeout(tid);
      }

      close();
    },
    templateUrl: '/partials/observer.html'
  }
});