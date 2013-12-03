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

angular.module('platform', ['ngResource', 'ngProgressLite', 'infinite-scroll'])
.factory('models', function($resource){
    var Post = $resource('groups/:gid/posts/:pid', {pid:'@pid', gid: '@gid'}, {
      query: {
        method: 'get',
        transformResponse: function(res){
          res = JSON.parse(res);
          res.data.forEach(function(item){
            item.author.emailHash = md5(item.author.email);
            item.praisedUserList.forEach(function(pu){
              pu.emailHash = md5(pu.email);
            });
            return item;
          });
          return res;
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
      Post: Post,
      User: $resource('/users/:id', {id: '@_id'}),
      Group: $resource('/groups/:id', {id: '@_id'}),
      GroupUser: GroupUser,
      Praise: $resource('/groups/:gid/posts/:pid/praises', {pid:'@pid', gid: '@gid'})
    }
  })
.factory('docStore', function(models){
  var store = {};
  return {
    get: function(name){
      return store[name] = store[name] ? store[name] : models[name].query();
    }
  }
});

;angular.module('platform')
.directive('admin', function(){
  return {
    restrict: 'E',
    scope: {},
    controller: 'Admin',
    templateUrl : '/partials/admin.html'
  }
}).controller('Admin', function($scope, models, docStore){
  $scope.groups = docStore.get('Group');

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
    confirm('确定删除？') && $scope.groups[i].$remove(null
      , function(){
      $scope.groups.splice(i, 1);
    }, function(){
      $scope.$emit('error', {message: '删除失败'});
    });
  };
});
;angular.module('platform')
.directive('avatar', function(){
    return {
      restrict: 'E',
      replace: true,
      scope: {emailHash: '@hash', title: '@'},
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
}).factory('self', function($http, progressService, $rootScope){
  var ins = {};
  function verify(){
    var p = $http.get('/verify')
    p.then(function(res){
      ins.info = res.data;
      ins.info.emailHash = md5(res.data.email);
      ins.logging = true;
      $rootScope.self = ins;
    }, function(r){
      ins.info = {};
      ins.logging = false;
    });
    progressService.watch(p);
  }
  var methods = {
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
        ins.info = {};
        ins.logging = false;
      }, function(s){
        console.log(s);
      });
    },
    verify: verify
  }
  angular.extend(ins, methods);
  return ins;
}).factory('util', function(){
  function arrayRemove(array, value) {
    var index = array.indexOf(value);
    if (index >=0)
      array.splice(index, 1);
    return value;
  }
  return {
    arrayRemove: arrayRemove
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
}).directive('ngEnter', function(){
  return {
    restict: 'A',
    link: function(scope, elem, attr){
      elem.bind('keypress', function(e){
        if(e.keyCode == 13){
          scope.$apply(function() {
            scope.$eval(attr.ngEnter);
          });
          e.preventDefault();
        }
      });
    }
  }
}).filter('ago', function($filter){
  return function(input){
    var distance = Date.now() - new Date(input)
    , result = '', dih, diy
    , dim = ~~(distance/60000); // distance in minutes
    if(dim < 0){
      result = 'Invalid Date';
    } else if(dim < 1){
      result = '刚刚';
    } else if(dim < 60){
      result = dim + '分钟前';
    } else {
      dih = ~~(dim/60);
      if(dih < 24){
        result = dih + '小时前';
      } else {
        diy = ~~(dih/8760);
        if(diy < 1){
          result = $filter('date')(input, 'MM月dd日 HH:mm');
        } else {
          result = diy + '年前';
        }
      }
    }
    return result;
  }
});
;angular.module('platform')
.directive('fileUpload', function($http, models){
  return {
    restrict: 'E',
    scope: {model: "="},
    link: function(scope, elem, attr){
      var fileInput = elem.find('input[type=file]')
      , showcase = elem.find('.showcase')
      , showcaseImg = elem.find('img');

      scope.callUpload = function(){
        fileInput.click();
      }
      scope.$watch('model.imageData', function(n){
        if(n != undefined){
          showcase.height(parseInt(showcaseImg.css('marginTop'))+showcaseImg.height());
        } else {
          showcase.height(0);
          fileInput.val(null);
        }
      });

      fileInput.on('change', function(e){
        if(e.target.files[0] == undefined){
          return;
        }
        var fileData = e.target.files[0]
        , url = URL.createObjectURL(fileData);
        showcaseImg.on('load', function(){
          scope.model.imageData = fileData;
          // http://stackoverflow.com/questions/15344610/angularjs-scope-watch-on-json-object-not-working-inside-directive
          scope.$digest();
        });
        showcaseImg.attr('src', url);
      });
    },
    templateUrl : '/partials/fileUpload.html'
  }
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
.controller('Group', function($scope, models, self, $timeout, docStore){
  $scope.state = 'choose-group';
  $scope.self = self;
  $scope.groups = docStore.get('Group');


  
  $scope.joinGroup = function(group){
    /*new models.GroupUser({gid: group._id}).$save(null
      , function(){
      $scope.state = 'in-group';
      $timeout(function(){
        $scope.$broadcast('load', {group: group});
      });
    }, function(reason){
      $scope.$emit('error', {message: reason.data});
    });*/

    $scope.state = 'in-group';
    $timeout(function(){
      $scope.$broadcast('load', {group: group});
    });
  }
  $scope.$on('quitGroup', function(){
    $scope.state = 'choose-group';
  });
  $scope.leaveGroup = function(group){
    new models.GroupUser({gid: group._id, uid: self.getInfo()._id}).$remove(null
      , function(){
      
    }, function(reason){
      $scope.$emit('error', {message: reason.data});
    });
  }

});
;angular.module('platform')
.directive('inputBody', function(){
  return {
    restrict: 'E',
    link: function(scope, elem, attr){
      // -1 not open, 0 opening, 1 opened
      var openState = -1;
      elem.delegate('.icon', 'click', function(){
        if(openState !== -1) return;
        openState = 0;
        var target = $(this).data('target');
        var $content = $('.input-body-content').filter(function(){
                    return $(this).data('type') == target;
                  })
        , $nav = $('.input-body-nav')
        , $main = $('.top-input .post-main');

        var initW = $main.width()
        , mainW = $main.width('auto').width();

        $main.width(initW).animate({
          width: mainW
        }, 300, function(){
          $nav.animate({
            opacity: 0
          }, 300, function(){
            $nav.css({
              display: 'none'
            });
            h = $content.css({display: 'block', height: 'auto'}).height();
            h += parseFloat($content.css('padding-top'))+ parseFloat($content.css('padding-bottom'));
            $content.css({
              opacity: 0,
              height: $nav.height()
            }).animate({
              height: h,
            }, 300).animate({
              opacity: 1
            }, 300, function(){
              $content.css({
                height: 'auto'
              });
              openState = 1;
            });
          });
        }).css({overflow: 'visible'});
      })
      .delegate('.close-input', 'click', closeInputAnimation)
      .delegate('.h-submit-input', 'click', closeInputAnimation);

      function closeInputAnimation(){
        if(openState !== 1) return;
        openState = 0;
        var $content = $('.input-body-content')
        , $nav = $('.input-body-nav')
        , $main = $('.top-input .post-main');

        $content.animate({
            opacity: 0
          }, 300).animate({
            height: $nav.height(),
          }, 300, function(){
            $content.css({
              display: 'none'
            });
            $nav.css({
              display: 'block'
            }).animate({
              opacity: 1
            }, 300, function(){
              $main.animate({
                width: 130
              }, 300, function(){
                openState = -1;
              }).css({overflow: 'visible'});
            });
          });
      }
    },
    transclude: true,
    replace: true,
    template: '<div ng-transclude/>'
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
.directive('post', function(){
    return {
        restrict: 'E',
        scope: {},
        templateUrl : '/partials/post.html',
        controller: 'Post'
    }
})
.controller('Post', function($scope, models, self, util){
  
  var Post = models.Post, group;
  $scope.self = self;
  $scope.$on('load', function(e, data){
    $scope.group = data.group;
  });


  $scope.quit = function(){
    $scope.$emit('quitGroup');
  }
  
  var initialData = {micro: null, todoList: [{content: ''}], imageData: null};
  $scope.resetInputData = function(){
    $scope.data = angular.copy(initialData);
  }

  $scope.resetInputData();

  function validPost(data, type){
    if(data.content == null){
      return false;
    }
    switch (type){
      case 'micro':
        return !!data.content.trim().length;
      break;
      case 'todo':
        return data.content.length != 0;
      break;
      default:
        return false;
    }
  }

  function dispatchPost(type){
    switch (type){
      case 'micro':
        return {content: $scope.data.micro, imageData: $scope.data.imageData};
      break;
      case 'todo':
        return {content: angular.toJson($scope.data.todoList)};
      break;
      default:
        return {};
    }
  }

  $scope.submitPost = function(type){
    var data = dispatchPost(type);
    if(!validPost(data, type)){
      return;
    }
    data.gid = $scope.group._id;
    data.type = type;

    var newPost = new Post(data);   
    newPost.$save(null, function(newPost){
      $scope.posts.push(newPost);
      $('.h-submit-input').click();
    }, function(reason){
      $scope.$emit('error', {message: reason.data});
      $('.h-submit-input').click();
    });

    $scope.closeInput();
  };

  

  $scope.openInput = function(){
    $scope.coverOther = true;
  }

  $scope.closeInput = function(){
    $scope.resetInputData();
    $scope.coverOther = false;
  }


  $scope.posts = [];
  $scope.p = -1;
  $scope.loading = false;
  $scope.hasMore = true;
  $scope.loadPage = function(){
    if(!$scope.hasMore){
      return;
    }
    $scope.loading = true;
    Post.query({gid: $scope.group._id, p: $scope.p+1}, function(res){
      $scope.loading = false;
      $scope.posts.push.apply($scope.posts, res.data);
      delete res.data;
      $scope.totalPage = Math.ceil(res.total/res.step);
      $scope.p++;
      $scope.hasMore = $scope.p+1 < $scope.totalPage;
      angular.extend($scope, res);
    });
  }
  

  $scope.deletePost = function(post){
    confirm('确认删除？') && new models.Post(post).$remove({gid: $scope.group._id, pid: post._id}, function(){
      util.arrayRemove($scope.posts, post);
    }, function(reason){
      $scope.$emit('error', {message: reason.data});
    });
  }

  $scope.togglePraise = function(post){
    var data = {
      gid: $scope.group._id,
      pid: post._id
    }

    new models.Praise(data)[post.hasPraised? '$remove': '$save'](null, function(){
      post.hasPraised = !post.hasPraised;
      if(post.hasPraised) {
        post.praisedUserList.unshift(self.info);
        post.praisedCount++;
      } else {
        post.praisedCount--;
        post.praisedUserList.forEach(function(item, i, array){
          if(item._id == self.info._id){
            array.splice(i, 1);
          }
        });
      }
      
    }, function(reason){
      $scope.$emit('error', {message: reason.data});
    });
  }

});
;angular.module('platform')
.directive('todoList', function(){
  return {
    restrict: 'E',
    scope: {model: "=", json: "="},
    link: function(scope, elem, attr){
        if(scope.json){
          scope.todoList = JSON.parse(scope.json);
        }
        scope.edit = scope.model != undefined;
        
        scope.addTodo = function(){
          scope.todoList.push({content: ''});
        }
        scope.remove = function(index){
          scope.todoList.splice(index, 1);
        }
        scope.$watch('model.todoList', function(n){
          if(n == undefined) return;
          scope.todoList = n;
        });
        /*scope.$watch('todoList.length', function(n){
          if(n == undefined) return;
          setTimeout(function(){
            var h = elem.height()
            , naturalH = elem.height('auto').height();
            if(h != 0){
              elem.height(h).animate({height: naturalH}, 300);
            }
          });
        });*/
    },
    templateUrl : '/partials/todoList.html'
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
      angular.extend(this, self.info);
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
  
  $scope.self = self;
  $scope.$watch('self.logging', function(n, o){
    if(n != undefined){
      $scope.state = n? 'in' : 'out';
    }
  });

  self.verify();
});