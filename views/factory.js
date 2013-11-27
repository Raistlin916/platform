angular.module('platform')
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