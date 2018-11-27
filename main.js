const electron = require('electron')

const remote = electron.remote;
//const Menu = remote.Menu;
//const MenuItem = remote.MenuItem;

const { app, BrowserWindow } = require('electron')
const ipc = require('electron').ipcMain;
const fs=require('fs');
const dialog = require('electron').dialog;
const spawn = require('child_process').spawn;
const jsmediatags = require("jsmediatags");
const http=require("http"); 
const request = require('request');
const myfolders=require('./lib/myfolders.js');
const myserver=require('./lib/myserver.js')
var win;


  function createWindow () {  
    electron.Menu.setApplicationMenu(null) 
    let win = new BrowserWindow(
      { 
      width: 1200, 
      height:760,
      title:"Netease Music DownLoader" 
      })
      //win.openDevTools();
      win.loadURL(__dirname + '/htmls/default.html')
     
  }
  
  app.on('ready', createWindow);
  

ipc.on('ac3-flac',function(event) {
  dialog.showOpenDialog({
    title: "Open Audio AC3",
    filters:[
      {name: 'AC3 Files',extensions: ['ac3']},
      {name: 'DTS Files',extensions: ['dts']},
      {name: 'WAV Files',extensions: ['wav']}
    ],
    properties: ['openFile', 'openFile']
  },function(myfiles){
     if(myfiles){
       myfile=myfiles[0];
       console.log("myfile="+myfile);
       //event.sender.send("reply-info","myfile="+myfile)
       cmdstr="c:\\myTools\\MediaTools\\eac3to334\\eac3to.exe";
       flacfile=myfile.substr(0,myfile.length-3)+"flac";
       console.log("flac="+flacfile);
       //event.sender.send("reply-info","flac="+flacfile)
       //=========================
       const ls = spawn(cmdstr, [myfile,flacfile]);
      ls.stdout.on('data', (data) => {
        //console.log(`${data}`);
        datastr=data.toString();
        newstr='';
        for(i=0;i<datastr.length;i++){
          charstr=datastr.substr(i,1);
          codenum=charstr.charCodeAt();
          if(codenum>31 && codenum<127){
            newstr=newstr+charstr;
          }
        }
        console.log(datastr);
        event.sender.send("reply-info",newstr)
      });

      ls.stderr.on('data', (data) => {
         sendstr=data.toString();
         console.log(sendstr);
         event.sender.send("reply-info",sendstr)
      });

      ls.on('close', (data) => {
        sendstr=data.toString();
        console.log(sendstr)
        //event.sender.send("reply-info",sendstr)
          // event.sender.send('save-bookinfo-reply',sendstr);
      });
       //=========================
     }
  });
 


});


var mytitle='';
var myalbum='';

ipc.on('open-audio-file',function(event) {
  dialog.showOpenDialog({
    title: "Open Audio Book",
    filters:[
      {name: 'Audio Files',extensions: ['mp3','m4a']},
      {name: 'Audio Raw Files',extensions: ['wav','flac']},
      {name: 'Audio Raw Files',extensions: ['ac3']}
    ],
    properties: ['openFile', 'openFile']
  },function(myfiles){
    if(myfiles) {
      
      console.log(myfiles);
      myfile=myfiles[0];
      
      new jsmediatags.read(myfile, {
        onSuccess: function(tags) {
        //console.log(tags);
        mytags=tags['tags'];
       mycover=getcoverfromtags(tags);
       event.sender.send("return-audio-cover",mycover);    
       
       mytags['picurl']=mycover;
       event.sender.send('return-file-value',myfile,mytags);    
         
        },
        onError: function(error) {
            console.log(':(', error.type, error.info);
            event.sender.send('reply-info', error.type+': '+error.info)
            console.log('error file='+myfile)
            event.sender.send('reply-info', 'error file='+myfile)
            event.sender.send('return-file-value',myfile,'none');
        }
      });
    
      
    }
  });
  
});

ipc.on('change-uc-mp3',function(event) {
  dialog.showOpenDialog({
    title: "Change Netease Music",
    filters:[{name: 'UC Files',extensions: ['uc!']}],
    properties: ['openFile', 'openFile']
  },function(mpfiles){
    if(mpfiles) {
      
      for(i=0;i<mpfiles.length;i++){
        myfile=mpfiles[i];
        console.log("ucfile="+myfile)
        mysize=fs.statSync(myfile).size;
        sizestr=formatfilesize(mysize);
        
        //event.sender.send('reply-info', 'filesize:'+sizestr);
        if(mysize<1024000){
          event.sender.send('reply-info', '<span color="#ff0000">Causion: This Music is Tooooo Short!</span>');  
        }
        else{
          //tempfs=myfile.split("-");
          //fileid=tempfs[0];
          //newfile=fileid+".mp3";
          var cmp3=require("./lib/uc2mp3.js");
          cmp3.tomp3(myfile,1,event,'reply-info');
        }
      
      }
      
      
    }
  });
  
});


ipc.on('change-uc-folder',function(event,ofolder) {
  if(ofolder==""){
    getucfolder(event);
    //
  }
 else{
    myfile=findafile(ofolder,".uc!");
    if(myfile!=null){

          var cmp3=require("./lib/uc2mp3.js");
          mp3file=cmp3.tomp3(myfile,1,event,'reply-info');
          //event.sender.send("replay-info","Change UC file Success!")
     

    }
    else {
      event.sender.send('reply-info',"All uc files have changed into mp3 files");
    }
 }

  
});

ipc.on('push-audio-id',function(event,audioid){
  console.log(audioid)
  var options=myserver.search('/song/url?id=' + audioid)
    
  HttpRequest(options,function(obj){
    
    if(obj){
      
     objs=JSON.parse(obj);
     event.sender.send('reply-info',objs);

     if(objs['code']==200){
      mp3url=objs['data'][0]['url'];
      if(mp3url!=null){
        id=objs['data'][0]['id'];
        mp3file=".\/tempmusic\/"+id+".mp3"
        request(mp3url).pipe(fs.createWriteStream(mp3file))
        event.sender.send('mp3url',mp3url);
      }
      else event.sender.send('reply-info','没有权限播放')
      //console.log(obj);
 
      
     }
     
  }
  });

})

ipc.on('play-one-audio',function(event,args){
  audioid=args['id'];
  myfolderid=args['al']['id'];
  myfolder=args['al']['name'];
  myfoldernew=myfolderid+"_"+myfolder;

    listfolder=myfolders.folders['music']+formatfoldername(myfolder);
    listfoldernew=myfolders.folders['music']+formatfoldername(myfoldernew);
    if(fs.existsSync(listfolder)) {
      fs.renameSync(listfolder,listfoldernew);
      event.sender.send('reply-info',"change foldername:"+listfoldernew)
    }
    listfolder=listfoldernew;

    mp3filename=getsongfile(args);
    mp3file=listfolder+"\\"+mp3filename;
    
    if(fs.existsSync(mp3file)){
      mp3url=mp3file;

      coverurl=listfolder+"\\cover.jpg";
      
      event.sender.send("reply-info","we found the file:"+mp3file)
      event.sender.send('mp3url',mp3url);  
      fs.exists(coverurl,function(ex){
        if(ex) event.sender.send("return-audio-cover",coverurl); 
        else{
          coverurl=args['al']['picUrl'];
          event.sender.send("return-audio-cover",coverurl); 
        }
      })

     }
    else{
      songfile= myfolders.folders['cache']+'data\\'+audioid+'.json'
      if(fs.existsSync(songfile)){
        obj=fs.readFileSync(songfile);
        objs=JSON.parse(obj);
              mp3url=objs['data'][0]['url'];
              
              event.sender.send('mp3url',mp3url);
              event.sender.send('reply-info',objs);

              coverurl=args['al']['picUrl'];
              event.sender.send("return-audio-cover",coverurl); 
      }
      else{
        var options=myserver.search('/song/url?id=' + audioid)
        
        HttpRequest(options,function(obj){
          if(obj){
              objs=JSON.parse(obj);
              mp3url=objs['data'][0]['url'];
              
              event.sender.send('mp3url',mp3url);
              event.sender.send('reply-info',objs);

              coverurl=args['al']['picUrl'];
              event.sender.send("return-audio-cover",coverurl); 
              fs.writeFile(songfile,obj,function(err){

              })
          }
        });
      }
         
  }
  

})

ipc.on('down-list-cover',function(event,coverstr,listid){
  listfile=myfolders.folders['playlist']+"cover-"+listid;
  
 
  imgsuff=coverstr.substr(coverstr.length-4,4);
  coverfile=listfile+imgsuff;
  if(!fs.existsSync(coverfile)){
    request(coverstr).pipe(fs.createWriteStream(coverfile))
  }
  
})


ipc.on('audio-down',function(event,args){
  audioid=args['id'];
  myfolderid=args['al']['id'];
  myfolder=args['al']['name'];
  myfoldernew=myfolderid+"_"+myfolder;

    listfolder=myfolders.folders['music']+formatfoldername(myfolder);
    listfoldernew=myfolders.folders['music']+formatfoldername(myfoldernew);
    if(fs.existsSync(listfolder)) {
      fs.renameSync(listfolder,listfoldernew);
    }
    listfolder=listfoldernew;

    if(!fs.existsSync(listfolder)){
      fs.mkdirSync(listfolder);
    }
    
    coverurl=args['al']['picUrl']
    dopic(listfolder,coverurl);
    
    //console.log(songfile)
    mp3filename=getsongfile(args)    
    mp3file=listfolder+"\/"+mp3filename;
    if(fs.existsSync(mp3file)){
      event.sender.send("reply-info","File Exists:"+mp3filename);
      event.sender.send("audio-down-finish");
    }
    else{
      //===============================
      songfile= myfolders.folders['cache']+'data\\'+audioid+'.json'
      if(fs.existsSync(songfile)){
        event.sender.send('reply-info',"have data:"+songfile);
        obj=fs.readFileSync(songfile);
        dodown(obj,event,mp3file);
      }
      else{

        var options=myserver.search('/song/url?id=' + audioid)
      
      HttpRequest(options,function(obj){
        if(obj){
         dodown(obj,event,mp3file);
        }   
         else {
          errorstr="Error:return from server------>"+mp3file;
          console.log(errorstr);
          event.sender.send('reply-info',errorstr);
          event.sender.send("audio-down-finish");
         }  
      });

    }
    //======================================
    }
    

})


ipc.on('netease-login',function(event){
  var options=myserver.search('/login?email=zifly77@163.com&password=lelecx0124')
  
  HttpRequest(options,function(obj){
    if(obj){
     objs=JSON.parse(obj);
    
    // event.sender.send('reply-info',objs);
  }
  });

})

ipc.on('get-play-list',function(event,playlistid){
  jsfile=myfolders.folders['cache']+"playlists\\"+playlistid+'.json';
  //console.log("newjsfile:"+jsfile)
  if(fs.existsSync(jsfile)){
    event.sender.send("reply-info","find jsfile:"+jsfile);
    mystr=getfilefromlocal(jsfile);
    objs=JSON.parse(mystr);
    playlist=objs['playlist'];
    event.sender.send('playlist-info',objs);
    coverurl=playlist['coverImgUrl'];
    coverfile=myfolders.folders['playlist']+"cover-"+playlistid+".jpg";
    fs.exists(coverfile,function(ex){
      if(!ex){
        request(coverurl).pipe(fs.createWriteStream(coverfile))
      }
    });

  }
  else{
    //-----------------------------------------
    var options=myserver.search('/playlist/detail?id=' + playlistid)
    
    HttpRequest(options,function(obj){
      if(obj){
        fs.writeFile(jsfile,obj,function(err){
  
        });
       objs=JSON.parse(obj);
       code=objs['code'];
       if(code==200){
            event.sender.send('playlist-info',objs);
            coverurl=objs['playlist']['coverImgUrl'];
            coverfile=myfolders.folders['playlist']+"cover-"+playlistid+".jpg";
            request(coverurl).pipe(fs.createWriteStream(coverfile))
            

          }
      }
    });
    //-----------------------------------------
  }
  

})

ipc.on('get-album-list',function(event,albumlistid){
  
  jsfile=myfolders.folders['cache']+"albums\\"+albumlistid+'.json';
  if(fs.existsSync(jsfile)){
    event.sender.send("reply-info","find jsfile:"+jsfile);
    mystr=getfilefromlocal(jsfile);
    objs=JSON.parse(mystr);
    event.sender.send('albumlist-info',objs);
  }
  else{

  var options=myserver.search('/album?id=' + albumlistid)

  HttpRequest(options,function(obj){
    if(obj){
      fs.writeFile(jsfile,obj,function(err){
        if(err){
          console.log(err.message)
        }
      });
     objs=JSON.parse(obj);
     code=objs['code'];
     if(code==200){
      event.sender.send('albumlist-info',objs);
     }
    
  }
  });
}
})

ipc.on('get-new-lists',function(event){
  pfolder=myfolders.folders['cache']+"playlists";
  console.log('path='+pfolder)

  var options=myserver.search("/top/playlist/highquality")
 
  HttpRequest(options,function(obj){
    if(obj){
     objs=JSON.parse(obj);
     code=objs['code'];
     if(code==200){
      newlists=objs['playlists'];
      event.sender.send('return-new-lists',newlists);
     }
    
  }
  });
})


//=======================================================
//private functions

function getfilepath(s){
  //s: file's full name - include full path and file name
    ss=s.split("\\");
    rr=ss.pop();
    //console.log("removed: "+rr);
    spath=ss.join("\\")+"\\";
    return spath;
}
function getfilenamefromurl(s){
  //s: file's full name - include full url and file name
    ss=s.split("\/");
    rr=ss.pop();
    
    return rr;
}

function HttpRequest(option,callback){  //option设置请求的请求头，callback请求数据回调函数

    var con='';  //存放请求后的数据
    var req=http.request(option,function(res){  //http。request方法用于获取数据
        res.setEncoding('utf-8');  //设置响应字符集
        var resListener=setTimeout(function(){  //添加响应监听，20s后没有响应信息返回自动结束响应，并返回空数据
            res.destroy(); //结束响应
            con='';
            callback(con);
        },20000);

        res.on('data',function(chuck){ //响应返回数据，并接受
            if(chuck) con+=chuck;    
        }).on('end',function(){ //数据返回完毕
            clearTimeout(resListener);
            callback(con);
        });

    });

    req.on('error',function(e){ //响应出错调用函数
        console.log('错误为：'+e.message);
    });

    req.write(''); //发送请求

    req.end(); //结束请求

}

function getucfolder(e){
  dialog.showOpenDialog({
    title: "Change Netease Music",
    //filters:[{name: 'UC Folder',extensions: ['uc!']}],
    properties: ['Select Folder', 'openDirectory']
  },function(myfolders){
    if(myfolders) {
      myfolder=myfolders[0]
      console.log(myfolder)
      e.sender.send('get-uc-folder',myfolder); 
      return myfolder;
    }
  })
}

function getsongfile(args){
    audioid=args['id'];
    songartists=args['ar'];
    
    artist=formatartist(args);

    songname=args['name'];
    songfile1=audioid+"-"+artist+"-"+songname;
    if(songfile1.length>160){
      songfile1=songfile1.substr(0,160)
    }
    songfile1=formatfilename(songfile1);
    thisfile=songfile1+".mp3";
    return thisfile;
}

function findafile(path,suff){
  //var suff=suff.toLowercase;
  getnum=-1;
  console.log('suff='+suff)
  var files = fs.readdirSync(path);
  for(i=0;i<files.length;i++){
    afile=files[i];
    afilestr=afile.replace("\!","\\!");

      firstnum=afilestr.length-5;
      suffstr=afile.substr(firstnum,4);
      console.log("suffstr="+suffstr+"-->"+suff)
      if(suffstr==suff){
        myfile=path+"\\"+afile;
        getnum=1;
        console.log(myfile);
        
        return myfile;

  }

  }
	
}


 
function getcoverfromtags(tags){
  root1=process.cwd();
mytags=tags['tags'];
imgs=mytags['picture'];
     if(imgs){
         if(imgs && imgs!='undefined') imgdata=imgs['data'];
         else imgdata='';
         }
     else imgdata='';
     
     if(imgdata==''){
         imgs=mytags['APIC'];
         if(imgs){
             imgdatas=imgs['data'];
             //console.log(imgdatas);
             imgformat=imgdatas['format'];
             imgdata=imgdatas['data'];
         }
     
     }

 if(imgdata && imgdata!=''){
     mybuff=new Buffer(imgdata,'binary');
     
     pictitle=mytags['title'];
     if(pictitle=='') pictitle='temp';
     coverfile=root1+"\\temp\\"+pictitle+".jpg"
     fs.writeFileSync(coverfile, mybuff)
 }
 else{
     coverfile=root1+"\\htmls\\images\\audio-logo.png"
 }
 return coverfile;
}

function formatfoldername(s){
  s=s.replace(/\:/ig,"-");
  s=s.replace(/\*/ig,"_")
  s=s.replace(/\\/ig,"-")
  s=s.replace(/\//ig,"-")
  s=s.replace(/\|/ig,"-")
  s=s.replace(/\"/ig,"-")
  s=s.replace(/\?/ig,"")
  s=s.replace(/\./ig,"-")
  
  return s;

}


function formatfilename(s){
  s=s.replace(/\:/ig,"-");
  s=s.replace(/\*/ig,"_")
  s=s.replace(/\\/ig,"-")
  s=s.replace(/\//ig,"-")
  s=s.replace(/\|/ig,"-")
  s=s.replace(/\"/ig,"-")
  s=s.replace(/\?/ig,"")
  
  return s;

}  

function formatfilesize(bytenum){
  knum=parseInt(bytenum/1024);
  if(knum>1024){
    mnum=parseInt(knum/1024*100);
    mnum=mnum/100;
    sizestr=mnum+"M";
  }
  else{
    sizestr=knum+"K";
  }
  return sizestr;
}


function formatartist(args){
  songartists=args['ar'];
    artist=""
    artnum=songartists.length;
    if(artnum>2) artnum=2
    for(rn=0;rn<artnum;rn++){
        artstr=songartists[rn]['name'];
        if(rn<songartists.length-1) artstr=artstr+";";
        artist=artist+artstr;
    }
    if(songartists.length>2) artist=artist+" etc."
    return artist;
}



function getfilefromlocal(sfile){
  myfilestr=fs.readFileSync(sfile);
  return myfilestr;
}

function dopic(picpath,surl){
  if(surl!=null){
    imgsuff=surl.substr(surl.length-4,4);
  coverfile=picpath+"\/cover"+imgsuff;
  fs.exists(coverfile,function(ex){
      if(!ex){
        request(surl).pipe(fs.createWriteStream(coverfile))
      }
    }
  );
  }
  
  else{
    console.log("not find a cover:"+picpath);
  }

}

function dodown(obj,e,mp3file){
  objs=JSON.parse(obj);
         if(objs['code']==200){
            
            mp3url=objs['data'][0]['url'];
            //console.log(mp3url)
            if(mp3url!=null){
                var stream=request(mp3url).pipe(fs.createWriteStream(mp3file));
                    stream.on('finish', function () {
                    e.sender.send("audio-down-finish");
                    });
            }
            else{
              
                  mydate=getnowtime();
                  errorstr="Error:没有权限下载------>"+mp3file
                  console.log(errorstr);
              fs.appendFile("./errorinfo.log",errorstr+"\r\n"+mydate+"\r\n--------------------------------------------------------------\r\n" , (error)  => {
                if (error) return console.log("追加信息失败" + error.message);
                
                });
               
              e.sender.send('reply-info',errorstr);
              e.sender.send("audio-down-finish");
            }
         }
         else{
          errorstr="Error:"+objs['code']+"------>"+mp3file;
          console.log(errorstr);
          e.sender.send('reply-info',errorstr);
          e.sender.send("audio-down-finish");
         }
}

function getnowtime(){
  var myDate = new Date();
  year=myDate.getFullYear;
  month=myDate.getMonth+1;
  nowdate=myDate.getDate;
  hour=myDate.getHours;
  minute=myDate.getMinutes;
  second=myDate.getSeconds;
  if(hour<10) hour='0'+hour;
  if(minute<10) minute='0'+minute;
  if(second<10) second='0'+second;
  if(monthr<10) month='0'+month;
  if(nowdate<10) nowdate='0'+nowdater;

  datestr=year+'-'+month+'-'+'nowdate'+' '+hour+':'+'minute'+':'+second;
  return datestr;

}