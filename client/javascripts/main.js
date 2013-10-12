angular.module('platform', ['ngResource', 'ngRoute'])
.factory('models', function($resource){
    return {
      Micropost: $resource('/microposts/:id', {id:'@_id'}),
      User: $resource('/users/:id', {id: '@_id'})
    }
  })
.factory('self', function(models, $http, $rootScope, progressService){
  var state = {};
  function verify(){
    var p = $http.get('/verify')
    p.then(function(res){
      state.info = res.data;
      state.logging = true;
    }, function(r){
      state.logging = false;
    });
    progressService.watch(p);
  }
  verify();

  return {
    login: function(username, pw){
      var p = $http.post('/login', {username: username, pw: pw});
      p.then(function(){
        verify();
      }, function(s){
        console.log(s);
      });
      progressService.watch(p);
      return p;
    },
    logout: function(){
      $http.post('/logout')
      .then(function(){
        state.logging = false;
      }, function(s){
        console.log(s);
      });
    },
    getState: function(){
      return state;
    },
    verify: verify
  }
}).factory('progressService', function($q){
  return {
    watch: function(p){
      NProgress.start();
      $q.when(p, function(){
        NProgress.done();
      }, function(){
        
        NProgress.done();
        NProgress.remove();
      });
    }
  }
});
