
function myserver(spath){
    var options = {  
        'hostname': '192.168.0.100',  
        'port': 3000,
        'path': spath,  
        'method': 'GET'  
        };  
    return options;    
}

exports.path=myserver

