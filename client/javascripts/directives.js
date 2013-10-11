angular.module('platform')
.directive('userport', function(){
  return {
    restrict: 'E',
    templateUrl : '/partials/userport.html',
    controller: 'Userprot'
  }
});