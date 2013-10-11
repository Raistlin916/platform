angular.module('platform')
.controller('Userprot', function($scope, models, self){
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
  $scope.register = function(username, pw){
    var user = new models.User({username: username, pw: pw});
    user.$save(function(res){
      self.valid();
    });
  }
  
  $scope.userState = self.getState();
  $scope.$watch('userState.logging', function(n, o){
    if(n){
      $scope.state = 'in';
    } else {
      $scope.state = 'out';
    }
  });

})
.controller('Micropost', function($scope, models){
  var Micropost = models.Micropost;
  $scope.addMicropost = function(micropostContent){
    if(!micropostContent.trim().length){
      return;
    }
    var newPost = new Micropost({content: micropostContent});
    $scope.microposts.push(newPost);
    newPost.$save();
    $scope.micropostContent = "";
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