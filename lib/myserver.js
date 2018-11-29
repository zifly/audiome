
function myserver(spath){
    var options = {  
        'hostname': '192.168.0.100',  
        'port': 3000,
        'path': spath,  
        'method': 'GET'  
        };  
    return options;    
}

//exports.path=myserver
exports.search=myserver;

var searchpath={
    'playlist':'/playlist/detail?id=',          //歌单列表
    'song':'/song/url?id=',                     //歌曲详情 含mp3文件地址
    'album':'/album?id=',                       //专辑列表
    'highquality':'/top/playlist/highquality',  //精品歌单(默认50个)
}


