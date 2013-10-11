angular.module('platform', ['ngResource', 'ngRoute'])
.factory('models', function($resource){
    return {
      Micropost: $resource('/microposts/:id', {id:'@_id'}),
      User: $resource('/users/:id', {id: '@_id'})
    }
  })
.factory('self', function(models, $http){
  var state = {};
  function valid(){
    $http.get('/valid')
    .then(function(v){
      state.logging = true;
    }, function(r){
      state.logging = false;
    });
  }
  valid();
  return {
    login: function(username, pw){
      var p = $http.post('/login', {username: username, pw: pw});
      p.then(function(v){
        state.logging = true;
      }, function(s){
        console.log(s);
      });
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
    valid: valid
  }
});
