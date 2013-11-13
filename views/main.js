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

angular.module('platform', ['ngResource', 'ngProgressLite'])
.factory('models', function($resource){
    var Post = $resource('groups/:gid/posts/:pid', {pid:'@pid', gid: '@gid'}, {
      query: {
        method: 'get',
        isArray: true,
        transformResponse: function(data){
          return JSON.parse(data).map(function(item){
            item.author.emailHash = md5(item.author.email);
            return item;
          });
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
      GroupUser: GroupUser
    }
  });
