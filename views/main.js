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

angular.module('platform', ['ngResource', 'infinite-scroll', 'ngRoute'])
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
.config(function ($httpProvider, $routeProvider, $locationProvider){
  $httpProvider.interceptors.push('httpLoadingInterceptor');

  $locationProvider.html5Mode(true);
  // /page 意味着页面，区分数据接口
  $routeProvider
      .when('/', {
        template: '<group/>'
      })
      .when('/page/error', {
        template: '<error/>'
      })
      .when('/page/groups/:gid/posts', {
        template: '<post/>'
      })
      .when('/page/ground', {
        template: '<group/>'
      })
      .when('/page/register', {
        template: '<register/>'
      })
      .when('/page/blogs', {
        template: '<p>开发中…</p><p><a href="/page/ground">返回广场</a></p>'
      })
      .when('/page/settings', {
        template: '<settings/>'
      })
      .when('/page/users/:uid', {
        template: '<user-info/>'
      })
      .otherwise({
        template: '<p>404.</p><p>you shall not pass.</p>'
      });
})
.run(function($rootScope){
  var scrollTopCache = {}
  , $body = $(document.body);
  $rootScope.$on('$locationChangeStart', function(e, newUrl, oldUrl){
    scrollTopCache[oldUrl] = $body.scrollTop();
  });
  $rootScope.$on('$locationChangeSuccess', function(e, newUrl, oldUrl){
    $(document.body).scrollTop(scrollTopCache[newUrl] || 0);
  });
});


