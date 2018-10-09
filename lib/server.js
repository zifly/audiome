var http = require('http');//导入node提供的http模块
var fs = require('fs'); //导入node提供的filesystem模块，用它的属性来进行文件操作
var server = http.createServer(function(req,res){//创建webserver
    //req是客户端（浏览器）传来的参数，包含method、url、head等一些属性
    //res是服务器对客户端的一些响应
    if(req.method === 'GET' ){
        switch(req.url){
            case '/default.html':
                fs.readFile('./default.html',function(err,data){
                    if(err){
                        throw err;
                    }
                    res.writeHeader(200,{'Content-Type':'text/html'});
                    res.write(data.toString());
                    console.log('default.html');
                    res.end();
                });
                break;
            case '/add.html':
                fs.readFile('../add.html',function(err,data){
                    if(err){
                        throw err;
                    }
                    res.writeHeader(200,{'Content-Type':'text/html'});
                    res.write(data.toString());
                    res.end();
                });
                break;
            case '/remove.html':
                fs.readFile('../remove.html',function(err,data){
                    if(err){
                        throw err;
                    }
                    res.writeHeader(200,{'Content-Type':'text/html'});
                    res.write(data.toString());
                    res.end();
                });
                break;
            case '/find.html':
                fs.readFile('../find.html',function(err,data){
                    if(err){
                        throw err;
                    }
                    res.writeHeader(200,{'Content-Type':'text/html'});
                    res.write(data.toString());
                    res.end();
                });
                break;
            case '/edit.html':
                fs.readFile('../edit.html',function(err,data){
                    if(err){
                        throw err;
                    }
                    res.writeHeader(200,{'Content-Type':'text/html'});
                    res.write(data.toString());
                    res.end();
                });
                break;
            default :
                var html = '<html><head><meta charset="UTF-8"><title></title></head><body>' +
                        '404 not found!</body></html>';
                res.writeHeader(404,{'Content-Type':'text/html'});
                //res.setHeader('Content-Encoding','utf8');
                res.end(html);
        }
    }else{
        console.log('not support!');
    }
}).listen(3088);

console.log('server loading...'+server.listening)

