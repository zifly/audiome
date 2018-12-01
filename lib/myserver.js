
function myserver(p,s){
    var spath=p+s;
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
    'catlist':"/playlist/catlist",
    'playlist':'/playlist/detail?id=',          //歌单列表
    'song':'/song/url?id=',                     //歌曲详情 含mp3文件地址
    'album':'/album?id=',                       //专辑列表
    'highquality':'/top/playlist/highquality',  //精品歌单(默认50个)
    'toplist':'/top/playlist?cat=',             //分类歌单
    'lyric':'/lyric?id='
}

exports.path=searchpath

//var catlist=['流行','欧美','华语','怀旧','经典','学习'];

                


