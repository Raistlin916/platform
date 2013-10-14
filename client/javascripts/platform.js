/*! platform - v0.0.1 - 2013-10-14 */
angular.module('platform')
.controller('Micropost', function($scope, models){
  var Micropost = models.Micropost;
  $scope.addMicropost = function(micropostContent){
    if(!micropostContent.trim().length){
      return;
    }
    var newPost = new Micropost({content: micropostContent});
   
    newPost.$save(function(newPost){
      $scope.microposts.push(newPost);
    });
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
angular.module('platform')
.directive('userport', function(){
  return {
    restrict: 'E',
    scope: true,
    templateUrl : '/partials/userport.html',
    controller: 'Userport'
  }
})
.controller('Userport', function($scope, models, self){
  $scope.state = 'out';
  $scope.errorMessage = null;
  $scope.changeState = function(state){
    $scope.state = state;
  }
  $scope.login = function(username, pw){
    self.login(username, pw)
      .then(null, function(res){
        $scope.errorMessage = res.data;
      });
  }
  $scope.logout = function(){
    self.logout();
  }
  $scope.register = function(username, pw, email){
    var user = new models.User({username: username, pw: pw, email: email});
    user.$save(function(res){
      self.verify();
    }, function(res){
      $scope.errorMessage = res.data;
    });
  }
  $scope.$watch('state', function(n){
    if(n == 'in'){
      $scope.errorMessage = null;
    }
  });
  
  $scope.userState = self.getState();
  $scope.$watch('userState.logging', function(n, o){
    $scope.state = n? 'in' : 'out';
  });

});
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
