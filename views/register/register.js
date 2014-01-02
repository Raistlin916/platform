angular.module('platform')
.directive('register', function($q, self, models, $timeout){
  return {
    restrict: 'E',
    scope: {},
    link: function(scope, elem, attr){
      scope.data = {};
      scope.register = function(){
        if(scope.registerForm.$valid){
          saveUser(); 
        }
      }
      function saveUser(){
        var d = $q.defer();
        d.resolve();
        d.promise.then(function(){
          var user = new models.User(angular.extend({}, scope.data));
          return user.$save();
        }).then(function(){
          self.verify();
        }, function(reason){
          console.log(reason);
        });
      }

      scope.$watch(function(){
        return scope.data.pw == scope.data.repw;
      }, function(n){
        var repw = scope.registerForm.repw;
        repw && repw.$setValidity('sameAsPw', n);
      });

    },
    templateUrl : '/partials/register.html'
  }
});