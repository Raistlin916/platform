angular.module('platform')
.controller('Login', function($scope, self){
  $scope.login = function(){
    self.login($scope.username, $scope.pw);
  }
})
.controller('Register', function($scope, models){
  var User = models.User;
  $scope.register = function(){
    var user = new User({username: $scope.username, pw: $scope.pw});
    user.$save();
  }

  $scope.users = User.query();
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