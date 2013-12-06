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

angular.module('platform', ['ngResource', 'ngProgressLite', 'infinite-scroll'])
.factory('models', function($resource){
    var Todo = $resource('groups/:gid/posts/:pid/todo/:tid', {pid:'@pid', gid: '@gid', tid: '@tid'});
    var Post = $resource('groups/:gid/posts/:pid', {pid:'@pid', gid: '@gid'}, {
      query: {
        method: 'get',
        transformResponse: function(res){
          res = JSON.parse(res);
          res.data.forEach(function(item){
            item.author.emailHash = md5(item.author.email);
            item.praisedUserList.forEach(function(pu){
              pu.emailHash = md5(pu.email);
            });
            item.todoList = item.todoList.map(function(todo){
              return new Todo(angular.extend(todo, {gid: res.gid, pid: item._id, tid: todo._id}));
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

          item.todoList = item.todoList.map(function(todo){
            return new Todo(angular.extend(todo, {pid: item._id, tid: todo._id}));
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
      Praise: $resource('/groups/:gid/posts/:pid/praises', {pid:'@pid', gid: '@gid'})
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
