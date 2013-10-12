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