angular.module('platform')
.directive('todoList', function(models, $http){
  var Todo = models.Todo;
  return {
    restrict: 'E',
    scope: {model: "=", data: "=", owner: "=", pid: "="},
    link: function(scope, elem, attr){
        if(scope.data){
          scope.todoList = scope.data;
        }
        scope.edit = scope.model != undefined;

        scope.toggleHasDone = function(todo){
          if(!scope.owner){
            return;
          }
          todo.hasDone = !todo.hasDone;
          todo.$save({pid: scope.pid});
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

        scope.toggleEdit = function(){
          if(scope.edit){
            var todoList = scope.todoList.filter(function(item){
              item.content = item.content.trim();
              if(!item.content.length){
                return false;
              }
              return true;
            });
            scope.todoList = todoList;

            $http.post('/posts/'+scope.pid+'/todo', {todoList: todoList})
              .then(function(res){
                scope.todoList = res.data.todoList.map(function(item){
                  return new Todo(angular.extend(item, {pid: scope.pid}));
                });
              })
              .then(null, function(res){
                  console.log(res);
                }); 
          }
          scope.edit = !scope.edit;
        }
    },
    templateUrl : '/partials/todoList.html'
  }
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