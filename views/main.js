(function(){
  // hack from here
  var _md5 = md5, cache = {};
  function md5Cache(k){
    if(cache[k]){
      return cache[k];
    } else {
      if(Object.keys(cache).length > 40){
        cache = {};
      }
      return cache[k] = _md5(k);
    }
  }
  window.md5 = md5Cache;
})();

angular.module('platform', ['ngResource', 'infinite-scroll'])
.factory('httpLoadingInterceptor', function($rootScope, $q, $timeout){
    var reqNoResCount = 0
    , atLeast = 1000, tid, d;
    function gettedRes(){
      reqNoResCount--;
      if(!reqNoResCount){
        d.promise.then(function(){
          $rootScope.$broadcast('loadingDone');
        });
      }
    }

    return {
      request: function(req){
        if(!reqNoResCount){
          $rootScope.$broadcast('loading');

          $timeout.cancel(tid);
          d = $q.defer();
          tid = $timeout(function(){
            d.resolve();
          }, atLeast);
        }
        reqNoResCount++;
        return req;
      },
      response: function(res){
        gettedRes();
        return res;
      },
      responseError: function(rejection){
        gettedRes();
        return $q.reject(rejection);
      }
    }
})
.config(function ($httpProvider){
  $httpProvider.interceptors.push('httpLoadingInterceptor');
});


