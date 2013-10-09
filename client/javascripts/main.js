angular.module('platform', ['ngResource', 'ngRoute'])
.factory('models', function($resource){
    return {
      Micropost: $resource('/microposts/:postId', {postId:'@_id'}),
      User: $resource('/users/:uid', {uid: '@_id'})
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
        templateUrl: '/partials/login.html'
      }).
      when('/microposts', {
        templateUrl: '/partials/microposts.html',
        controller: 'Micropost'
      }).
      when('/register', {
        templateUrl: '/partials/register.html',
        controller: 'Register'
      });
})
.controller('Register', function($scope, models){
  var User = models.User;
  $scope.register = function(){
    var user = new User({username: $scope.username, pw: $scope.pw});
    user.$save();
  }

  $scope.users = User.query();
})
.controller('Micropost', function($scope, models){
  var Micropost = models.Micropost;
  $scope.addMicropost = function(micropostContent){
    if(!micropostContent.trim().length){
      return;
    }
    var newPost = new Micropost({content: micropostContent});
    $scope.microposts.push(newPost);
    newPost.$save();
    $scope.micropostContent = "";
  };

  $scope.showMicropost = function(){
    Micropost.query(function(posts){
      $scope.microposts = posts;
    });
  }
  $scope.showMicropost();

  $scope.deleteMicropost = function(index){      
    $scope.microposts[index].$remove(function(){
      $scope.microposts.splice(index, 1);
    });
  }

});