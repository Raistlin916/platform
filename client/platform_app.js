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
    getInfo: function(){
      return state.info;
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
.factory('FieldTester', function($q){
  function FieldTester(data){
    this.field = data;
  }
  FieldTester.prototype = {
    run: function(key, test, msg){
      var d = $q.defer(), root, data = this.field;
      if(angular.isUndefined(data)){
        return;
      } 
      if(!angular.isArray(key)){
        key = [key];
      }
      // 希望改成用正则

      // 以|为标记拆成数组，与key值的数组对位
      // 将:后的字符串提取为公用部分
      msg = msg.split(':');
      root = msg.pop();
      msg = msg.join().split('|');

      key.some(function(k, i){
        // 将key值以空格为标记限拆成数组放入test的参数中
        var values = k.split(' ').map(function(item){
          return data[item];
        });
        if(!test.apply(null, values)){
          var name = angular.isDefined(msg[i])? msg[i]: '';
          d.reject({message: name + root});
          return true;
        }
      });
      d.resolve(data);
      return d.promise;
    }
  }


  return FieldTester;
});
;angular.module('platform').directive('floatPlaceholder', function(){
  return {
    restrict: 'C',
    scope: {},
    transclude: true,
    replace: true,
    compile: function compile(tElement, tAttrs, transclude) {
      return {
        pre: function(scope, elems) {
          transclude(scope, function(clone) {
            angular.forEach(clone, function(item){
              if(item.placeholder){
                scope.placeholder = item.placeholder;
              }
            });
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
    templateUrl: '/partials/floatPlaceholder.html'
  }
})
;angular.module('platform')
.controller('Micropost', function($scope, $rootScope, models){
  $scope.open = function(url){
    $rootScope.$broadcast('addPort', url);
  };
  var Micropost = models.Micropost;
  $scope.addMicropost = function(content){
    if(!content.trim().length){
      return;
    }
    var newPost = new Micropost({content: content});
   
    newPost.$save(function(newPost){
      $scope.microposts.push(newPost);
    });
    $scope.content = "";
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
;angular.module('platform')
.directive('portList', function($rootScope, models){
  function getDoc(url){
    var temp = url.split('/')
    , id = temp.pop()
    , modelName = temp.pop()
    , model, key, orgKey;
    for(orgKey in models){
      key = orgKey.toLowerCase();
      if(key == modelName || key+'s' == modelName){
        model = models[orgKey];
      }
    }

    return model.get({id: id});
  }
  return {
    restrict: 'E',
    scope: {},
    link: function(scope){
      scope.list = [];
      $rootScope.$on('addPort', function(e, url){
        scope.list.push(getDoc(url));
      });
    },
    templateUrl: '/partials/portList.html'
  }
});
;angular.module('platform')
.directive('test', function(){

})
;angular.module('platform')
.directive('userport', function(){
  return {
    restrict: 'E',
    scope: true,
    templateUrl : '/partials/userport.html',
    controller: 'Userport'
  }
})
.controller('Userport', function($scope, models, self, $q, FieldTester){
  
  $scope.data = {};
  $scope.state = null;
  $scope.errorMessage = null;

  function error(info){
    $scope.errorMessage = info;
  }

  $scope.openSetting = function(){
   
  }

  $scope.changeState = function(state){
    $scope.data = {};
    $scope.state = state;
    error(null);
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
    self.logout();
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

  $scope.register = function(){
    var data = $scope.data
    , tester = new FieldTester(data)
    , d = $q.defer();
    d.resolve();
    d.promise.then(function(){
      return tester.run(['username', 'pw', 'email'], emptyString, '用户名|密码|邮箱:不能为空');
    }).then(function(){
      return tester.run(['username', 'pw'], longEnough, '用户名|密码:不能少于6个字符');
    }).then(function(){
      return tester.run(['email'], emailFormat, '邮箱格式不正确');
    }).then(function(){
      return tester.run('pw pwAgain', equal, '两次输入的密码不相同');
    }).then(function(){
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
    if(n != undefined){
      $scope.state = n? 'in' : 'out';
    }
  });

  self.verify();
});