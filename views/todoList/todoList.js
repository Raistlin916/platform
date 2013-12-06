angular.module('platform')
.directive('todoList', function(){
  return {
    restrict: 'E',
    scope: {model: "=", data: "=", owner: "="},
    link: function(scope, elem, attr){
        if(scope.data){
          scope.todoList = scope.data;
        }
        scope.edit = scope.model != undefined;

        scope.toggleStatus = function(todo){
          if(!scope.owner){
            return;
          }
          todo.hasDone = !todo.hasDone;
          todo.$save();
        }
        
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