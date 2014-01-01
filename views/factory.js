angular.module('platform')
.factory('models', function($resource){

    var Todo = $resource('/posts/:pid/todo/:tid', {tid: '@_id', pid: '@pid'});
    var Post = $resource('/groups/:gid/posts/:pid', {pid:'@pid', gid: '@gid'}, {
      query: {
        method: 'get',
        transformResponse: function(res){
          res = JSON.parse(res);
          res.data.forEach(function(item){
            item.author.emailHash = md5(item.author.email);
            item.praisedUserList.forEach(function(pu){
              pu.emailHash = md5(pu.email);
            });
            item.todoList = (item.todoList || []).map(function(todo){
              return new Todo(angular.extend(todo, {pid: item._id}));
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

          item.todoList = (item.todoList || []).map(function(todo){
            return new Todo(angular.extend(todo, {pid: item._id}));
          });

          item.author.emailHash = md5(item.author.email);
          return item;
        }
      }
    });

    var User = $resource('/users/:id', {id: '@_id'}, {
      save: {
        method: 'post',
        transformResponse: function(res){
          try {
            res = JSON.parse(res);
            res.emailHash = md5(res.email);
            return res;
          } catch(e){
            return res;
          }
          
          
        }
      }
    });

    return {
      Post: Post,
      User: User,
      Group: $resource('/groups/:id', {id: '@_id'}),
      Praise: $resource('/posts/:pid/praises', {pid:'@pid'}),
      Todo: Todo
    }
  })
.factory('docStore', function(models){
  var store = {};
  return {
    get: function(name){
      return store[name] = store[name] ? store[name] : models[name].query();
    }
  }
})
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
}).factory('self', function($http, $rootScope, models){
  var ins = {};
  function verify(){
    var p = $http.get('/verify')
    p.then(function(res){
      ins.info = new models.User(res.data);
      ins.info.emailHash = md5(res.data.email);
      ins.logging = true;
      $rootScope.self = ins;
    }, function(r){
      ins.info = {};
      ins.logging = false;
    });
  }
  var methods = {
    login: function(username, pw){
      var p = $http.post('/login', {username: username, pw: pw});
      p.then(function(){
        verify();
      }, function(s){
        console.log(s);
      });
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
  function wrapBgImgStyle(url){
    if(!url || !url.length){
      return;
    }
    return {
      'background-image': 'url(/upload/' + url + ')'
    }
  };
  function arrayRemove(array, value) {
    var index = array.indexOf(value);
    if (index >=0)
      array.splice(index, 1);
    return value;
  };
  return {
    arrayRemove: arrayRemove,
    wrapBgImgStyle: wrapBgImgStyle
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
}).directive('accordionBox', function(){
  return {
    restict: 'A',
    link: function(scope, elem, attr){
      var body = elem.find('.box-body')
      , btn = elem.find('.accordion-btn');
      if(attr.accordionBox == 'close'){
        btn.addClass('icon-arrow-down');
        body.hide();
      } else {
        btn.addClass('icon-arrow-up');
      }
      
      elem.find('.accordion-btn').click(function(){
        body.animate({height: 'toggle'});
        if(body.height()){
          btn.removeClass('icon-arrow-up').addClass('icon-arrow-down');
        } else {
          btn.removeClass('icon-arrow-down').addClass('icon-arrow-up');
        }
        
      });
    }
  }
}).filter('ago', function($filter){
  return function(input){
    if(input == null){
      return '';
    }
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