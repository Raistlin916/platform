import os

def create_directive(name):
    if os.path.isdir(name):
        print name + ' already exits, failed'
    else:
        os.makedirs(name)
        js_file = open(os.path.join(name, name+'.js'), 'w')
        js_file.write(
'''angular.module('platform')
.directive('%s', function(){
    
});''' % name)
        js_file.close()
        jade_file = open(os.path.join(name, name+'.jade'), 'w')
        jade_file.close();
        print name + ' has created'

while 1:
    name = raw_input("input directive name:")
    create_directive(name)
    print '\n'
