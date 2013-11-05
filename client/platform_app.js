(function(){
  // hack from here
  var _md5 = md5, cache = {};
  function md5Cache(k){
    if(cache[k]){
      return cache[k];
    } else {
      if(Object.keys(cache).length > 40){
        cache = {};
      }
      return cache[k] = _md5(k);
    }
  }
  window.md5 = md5Cache;
})();

angular.module('platform', ['ngResource', 'ngProgressLite'])
.factory('models', function($resource){
    var Micropost = $resource('/microposts/:id', {id:'@_id'}, {
      query: {
        method: 'get',
        isArray: true,
        transformResponse: function(data){
          return JSON.parse(data).map(function(item){
            item.author.emailHash = md5(item.author.email);
            return item;
          });
        }
      },
      save: {
        method: 'post',
        transformResponse: function(data, resGetrer){
          var item;
          try {
            item = JSON.parse(data);
          } catch(e){
            return data;
          }

          item.author.emailHash = md5(item.author.email);
          return item;
        }
      }
    });
    var GroupUser = $resource('/groups/:gid/users/:uid', {gid: '@gid', uid: '@uid'}, {
      query: {
        method: 'get',
        isArray: true,
        url: '/userGroups/:uid'
      }
    });
    return {
      Micropost: Micropost,
      User: $resource('/users/:id', {id: '@_id'}),
      Group: $resource('/groups/:id', {id: '@_id'}),
      GroupUser: GroupUser
    }
  })
.factory('self', function(models, $http, progressService){
  var state = {};
  function verify(){
    var p = $http.get('/verify')
    p.then(function(res){
      state.info = res.data;
      state.info.emailHash = md5(res.data.email);
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
.directive('avatar', function(){
    return {
      restrict: 'E',
      replace: true,
      scope: {emailHash: '=hash'},
      templateUrl : '/partials/avatar.html'
    }
});
;angular.module('platform')
.directive('dialog', function(){
    var reservedField = ['opened', 'close', 'global', 'data'];
    function verify(target){
      if(reservedField.some(function(k){
        return angular.isDefined(target[k]);
      })){
        throw new Error('used reserved field in dialog controller');
      }
    }
    return {
      restrict: 'E',
      templateUrl: '/partials/dialog.html',
      scope: {controller: "="},
      transclude: true,
      link: function(scope, elem, attr){
        scope.opened = false;
        scope.data = {};
        scope.close = function(){
          scope.opened = false;
        }
        scope.reset = function(){
          scope.data = {};
        }
        scope.$on('openDialog', function(e, data){
          if(data.name == attr.name){
            if(scope.controller){
              verify(scope.controller);
              scope.controller.init && scope.controller.init.call(scope);
            }
            scope.global = attr.global == 'true';
            scope.opened = true;
            angular.extend(scope, scope.controller);
            scope.$digest();
          }
        });
        scope.$on('closeDialog', function(e, data){
          scope.close();
        });
      }
    }
})
.directive('callDialog', function($rootScope){
  return {
    restrict: 'A',
    link: function(scope, elem, attr){
      angular.element(elem).bind('click', function(){
        $rootScope.$broadcast('openDialog', {name: attr.callDialog});
      });
    }
  }
});
;angular.module('platform')
.directive('errorPanel', function($rootScope){
    return {
        restrict: 'E',
        scope: {},
        link: function(scope, elem, attr){
          scope.errorList = [];
          var tid;
          $rootScope.$on('error', function(e, data){
            if(angular.isDefined(data.message)){
              var el = scope.errorList;
              el.push({message: data.message});
              clearTimeout(tid);
              tid = setTimeout(function(){
                el.length = 0;
                scope.$digest();
              }, 2000);
            }
          });
        },
        templateUrl : '/partials/errorPanel.html'
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
.directive('group', function(){
  return {
    restrict: 'E',
    scope: {},
    controller: 'Group',
    templateUrl : '/partials/group.html'
  }
})
.controller('Group', function($scope, models, self){
  $scope.selfState = self.getState();
  $scope.groups = models.Group.query();
  $scope.$watch('selfState.logging', function(n){
    if(n === true){
      var d = models.GroupUser.query({uid: self.getInfo()._id}, function(){
        $scope.groups.forEach(function(item){
          item.joined = d.some(function(data){
            return item._id == data.gid;
          });
        });
      });
    }
    if(n === false){
      $scope.groups.forEach(function(item){
        item.joined = null;
      });
    }
  });  

  $scope.addGroup = {
    ok: function(){
      var newGroup = new models.Group(this.data)
      , that = this;
      newGroup.$save(null, function(){
        newGroup.joined = false;
        $scope.groups.push(newGroup);
        that.reset();
        that.close();
      }, function(){
        $scope.$emit('error', {message: '提交失败'});
      });
    }
  };
  $scope.deleteGroup = function(i){
    $scope.groups[i].$remove(null
      , function(){
      $scope.groups.splice(i, 1);
    }, function(){
      $scope.$emit('error', {message: '删除失败'});
    });
  };
  $scope.joinGroup = function(group){
    new models.GroupUser({gid: group._id}).$save(null
      , function(){
        group.joined = true;
    }, function(reason){
      $scope.$emit('error', {message: reason.data});
    });
  }
  $scope.leaveGroup = function(group){
    new models.GroupUser({gid: group._id, uid: self.getInfo()._id}).$remove(null
      , function(){
        group.joined = false;
    }, function(reason){
      $scope.$emit('error', {message: reason.data});
    });
  }

});
;angular.module('platform')
.directive('microposts', function(){
    return {
        restrict: 'E',
        scope: {},
        templateUrl : '/partials/microposts.html',
        controller: 'Micropost'
    }
})
.controller('Micropost', function($scope, models){
  $scope.open = function(url){
    $scope.$emit('addPort', url);
  };
  var Micropost = models.Micropost;
  $scope.data = {content: ""};
  $scope.addMicropost = function(content){
    if(!content.trim().length){
      return;
    }
    var newPost = new Micropost({content: content});
   
    newPost.$save(null, function(newPost){
      $scope.microposts.push(newPost);
    }, function(){
      $scope.$emit('error', {message: '没权限'});
    });
    $scope.data.content = "";
  };

  $scope.showMicropost = function(){
    Micropost.query(function(posts){
      $scope.microposts = posts;
    });
  }
  $scope.showMicropost();

  $scope.deleteMicropost = function(index){      
    $scope.microposts[index].$remove(null, function(){
      $scope.microposts.splice(index, 1);
    }, function(){
      $scope.$emit('error', {message: '删除失败，没有权限'});
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

  $scope.changeUserInfo = {
    init: function(){
      angular.extend(this, self.getInfo());
    },
    ok: function(){
      var that = this;
      models.User.get({id: that._id}, function(user) {
        if(user.email == that.email){
          that.close();
          return;
        }
        user.email = that.email;
        user.$save().then(function(){
          self.verify();
          that.close();
        }, function(){
          $scope.$emit('error', {message: '修改失败'});
        });
      });
    }
  };


  

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