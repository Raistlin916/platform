angular.module('platform', ['ngResource', 'ngProgressLite'])
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
}).factory('progressService', function($q, ngProgressLite){
  return {
    watch: function(p){
      ngProgressLite.start();
      $q.when(p, function(){
        ngProgressLite.done();
      }, function(){
        
        ngProgressLite.done();
        ngProgressLite.remove();
      });
    }
  }
});

;angular.module('platform')
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
;angular.element.prototype.before = function(el) {
  if (typeof el === 'string') el = angular.element(el);
  if (this.length > 0) {
    this[0].parentNode.insertBefore(el[0], this[0]);
  }
}

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
  $scope.data = {};
  $scope.state = 'out';
  $scope.errorMessage = null;
  $scope.changeState = function(state){
    $scope.data = {};
    $scope.state = state;
  }
  $scope.login = function(){
    var data = $scope.data;
    self.login(data.username, data.pw)
      .then(null, function(res){
        $scope.errorMessage = res.data;
      });
  }
  $scope.logout = function(){
    self.logout();
  }
  $scope.register = function(){
    var data = $scope.data;
    var user = new models.User({username: data.username, pw: data.pw, email: data.email});
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

})
.directive('floatPlaceholder', function(){
  return {
    restrict: 'C',
    scope: {},
    transclude: true,
    replace: true,
    compile: function compile(tElement, tAttrs, transclude) {
      return {
        pre: function(scope, elems) {
          transclude(scope, function(clone) {
            scope.placeholder = clone[0] && clone[0].placeholder;
          });
        },
        post: function(scope, elems) {
          scope.showPh = false;
          scope.blur = false;
          var input = elems[0].querySelector('input');
          if(angular.isUndefined(input)) return;
          function checkContent(){
            scope.showPh = input.value.length > 0;
            scope.$digest();
          }
          angular.element(input).on('focus blur keyup', checkContent)
            .on('blur', function(){
              scope.blur = true;
              scope.$digest();
            }).on('focus', function(){
              scope.blur = false;
              scope.$digest();
            });
        }
      }
    },
    template: '<div><label ng-if="showPh" ng-class="{blur: blur}">{{placeholder}}</label><label ng-if="!showPh">&nbsp</label><div ng-transclude></div></div>',
  }
});