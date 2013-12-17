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
        reqNoResCount--;
        if(!reqNoResCount){
          d.promise.then(function(){
            $rootScope.$broadcast('loadingDone');
          });
        }

        return res;
      }
    }
})
.config(function ($httpProvider){
  $httpProvider.interceptors.push('httpLoadingInterceptor');
})
.factory('models', function($resource){

    var Todo = $resource('/posts/:pid/todo/:tid', {tid: '@_id', pid: '@pid'});
    var Post = $resource('/groups/:gid/posts/:pid', {pid:'@pid', gid: '@gid'}, {
      query: {
        method: 'get',
        transformResponse: function(res){
          res = JSON.parse(res);
          res.data.forEach(function(item){
            item.author.emailHash = md5(item.author.email);
            item.praisedUserList.forEach(function(pu){
              pu.emailHash = md5(pu.email);
            });
            item.todoList = (item.todoList || []).map(function(todo){
              return new Todo(angular.extend(todo, {pid: item._id}));
            });
            return item;
          });
          return res;
        }
      },
      save: {
        method: 'post',
        transformResponse: function(data, resGetrer){
          var item;
          try {
            item = JSON.parse(data);
          } catch(e){
            return data;
          }

          item.todoList = (item.todoList || []).map(function(todo){
            return new Todo(angular.extend(todo, {pid: item._id}));
          });

          item.author.emailHash = md5(item.author.email);
          return item;
        }
      }
    });
    var GroupUser = $resource('/groups/:gid/users/:uid', {gid: '@gid', uid: '@uid'}, {
      query: {
        method: 'get',
        isArray: true,
        url: '/userGroups/:uid'
      }
    });
    return {
      Post: Post,
      User: $resource('/users/:id', {id: '@_id'}),
      Group: $resource('/groups/:id', {id: '@_id'}),
      GroupUser: GroupUser,
      Praise: $resource('/posts/:pid/praises', {pid:'@pid'}),
      Todo: Todo
    }
  })
.factory('docStore', function(models){
  var store = {};
  return {
    get: function(name){
      return store[name] = store[name] ? store[name] : models[name].query();
    }
  }
});


