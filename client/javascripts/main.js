angular.module('platform', ['ngResource', 'ngRoute'])
.factory('models', function($resource){
    return {
      Micropost: $resource('/microposts/:id', {id:'@_id'}),
      User: $resource('/users/:id', {id: '@_id'})
    }
  })
.factory('self', function(models, $http){
  return {
    login: function(username, pw){
      $http.post('/login', {username: username, pw: pw})
      .then(function(v){
        console.log(v);
      }, function(s){
        console.log(s);
      });
    }
  }
})
.factory('util', function(){
  return {
    remove: function(a, i){
      a.splice( a.indexOf(i), 1);
    }
  }
})
.config(function($routeProvider, $locationProvider){
  $routeProvider.
      when('/', {
        templateUrl: '/partials/login.html',
        controller: 'Login'
      }).
      when('/main', {
        templateUrl: '/partials/microposts.html',
        controller: 'Micropost'
      }).
      when('/register', {
        templateUrl: '/partials/register.html',
        controller: 'Register'
      });
})
