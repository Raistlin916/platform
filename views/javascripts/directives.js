angular.element.prototype.before = function(el) {
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
.controller('Userport', function($scope, models, self, $q){
  $scope.data = {};
  $scope.state = 'out';
  $scope.errorMessage = null;

  function error(info){
    $scope.errorMessage = info;
  }
  

  $scope.changeState = function(state){
    $scope.data = {};
    $scope.state = state;
    error(null);
  }
  $scope.login = function(){
    var data = $scope.data;
    self.login(data.username, data.pw)
      .then(null, function(res){
        error(res.data);
      });
  }
  $scope.logout = function(){
    self.logout();
  }

  function testField(data, key, test, msg){
    var d = $q.defer(), root;
    if(!angular.isArray(key)){
      key = [key];
    }
    // 希望改成用正则
    msg = msg.split(':');
    root = msg.pop();
    msg = msg.join().split('|');

    key.some(function(k, i){
      if(!test(data[k])){
        var name = angular.isDefined(msg[i])? msg[i]: '';
        d.reject({message: name + root});
        return true;
      }
    });
    d.resolve(data);
    return d.promise;
  }

  function emptyString(v){
    return angular.isDefined(v) && v.trim().length;
  }

  function longEnough(v){
    return v.trim() >= 6;
  }

  function emailFormat(v){
    return /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/.test(v);
  }

  $scope.register = function(){
    var data = $scope.data;

    var d = $q.defer();
    d.resolve();
    d.promise.then(function(){
      return testField(data, ['username', 'pw', 'email'], emptyString, '用户名|密码|邮箱:不能为空');
    }).then(function(){
      return testField(data, ['username', 'pw'], longEnough, '用户名|密码:不能少于6个字符');
    }).then(function(){
      return testField(data, ['email'], emailFormat, '邮箱格式不正确');
    })/*.then(function(){
      return testField(data, 'pw pwAgain', emailFormat, '两次输入的密码不相同');
    })*/.then(function(){
      var user = new models.User({username: data.username, pw: data.pw, email: data.email});
      return user.$save();
    }).then(function(){
      self.verify();
    }, function(e){
      error(e.message || e.data);
    });
  }
  
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