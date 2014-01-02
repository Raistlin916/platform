angular.module('platform')
.directive('userport', function(){
  return {
    restrict: 'E',
    scope: {},
    templateUrl : '/partials/userport.html',
    controller: 'Userport'
  }
})
.directive('userInfo', function($routeParams, models, $window){
  return {
    restrict: 'E',
    scope: {},
    templateUrl: '/partials/userInfo.html',
    controller: function($scope){
      var uid = $routeParams.uid;
      $scope.user = models.User.get({id: uid});
      $scope.back = function(){
        $window.history.back();
      }
    }
  }
})
.directive('settings', function(self, models, $location){
  return {
    restrict: 'E',
    scope: {},
    templateUrl : '/partials/settings.html',
    link: function(scope, elem, attr){
      scope.self = self;
      scope.save = function(){
        if(scope.settingsFrom.$dirty){
          self.info.$save();
        }
      }
      scope.$watch('self.logging', function(n){
        if(n == false){
          $location.path('/page/ground');
        }
      });

    }
  }
})
.controller('Userport', function($scope, models, self, $q, FieldTester, $location){
  
  $scope.self = self;
  $scope.data = {};
  $scope.state = "";
  $scope.errorMessage = null;

  

  function error(info){
    $scope.errorMessage = info;
  }

  $scope.changeState = function(state){
    $scope.data = {};
    $scope.state = state;
    error(null);
    if(state == 'register'){
      $location.path('/page/register');
      return;
    }
  }
  $scope.login = function(){
    var data = $scope.data
    , tester = new FieldTester(data)
    , d = $q.defer();
    d.resolve();
    d.promise.then(function(){
      return tester.run(['username', 'pw'], emptyString, '用户名|密码:不能为空');
    }).then(function(){
      return tester.run(['username', 'pw'], longEnough, '登录失败');
    }).then(function(){
      return self.login(data.username, data.pw);
    }).then(null, function(e){
      error(e.message || e.data);
    });
  }
  $scope.logout = function(){
    confirm('确认要退出吗？') && self.logout();
  }

  function emptyString(v){
    return angular.isDefined(v) && v.trim().length;
  }

  function longEnough(v){
    return v.trim().length >= 6;
  }

  function emailFormat(v){
    return /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/.test(v);
  }

  function equal(v1, v2){
    return v1 == v2;
  }
  
  $scope.self = self;

  function judgeState(){
    if($location.path() == '/page/register'){
      $scope.state = 'register';
      if(self.logging){
        $location.path('/page/ground');
      }
    } else {
      $scope.state = '';
    }
    
  }
  $scope.$watch('self.logging', function(n){
    judgeState();
  });

  $scope.$on('$locationChangeSuccess', function(e, url){
    judgeState();
  });

  self.verify();
});