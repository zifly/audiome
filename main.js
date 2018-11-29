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

const tagWriter = require('browser-id3-writer');
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
        console.log(tags);
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
        event.sender.send('mp3url',mp3url,objs);
      }
      else event.sender.send('reply-info','没有权限播放')
      //console.log(obj);
 
      
     }
     
  }
  });

})

ipc.on('play-one-audio',function(event,args){
  audioid=args['id'];
  checkonelocalsong(args);
  
    listfolder=getfullfolder(args);
    mp3file=getfullmp3file(args);
  
      songfile= myfolders.folders['cache']+'data\\'+audioid+'.json'
      if(fs.existsSync(songfile)){
        obj=fs.readFileSync(songfile);
        objs=JSON.parse(obj);
              mp3url=objs['data'][0]['url'];
              
              event.sender.send('mp3url',mp3url);
              //event.sender.send('reply-info',objs);
              if(mp3url!=null){
                coverurl=args['al']['picUrl'];
                event.sender.send("return-audio-cover",coverurl); 
              }
              
      }
      else{
        var options=myserver.search('/song/url?id=' + audioid)
        
        HttpRequest(options,function(obj){
          if(obj){
              objs=JSON.parse(obj);
              mp3url=objs['data'][0]['url'];
              
              event.sender.send('mp3url',mp3url);
              //event.sender.send('reply-info',objs);
              if(mp3url!=null){
                coverurl=args['al']['picUrl'];
                event.sender.send("return-audio-cover",coverurl); 
              }
              
              fs.writeFile(songfile,obj,function(err){

              })
          }
        });
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
    myargs=checkonelocalsong(args);  
    listfolder=getfullfolder(args);

    if(!fs.existsSync(listfolder)){
      fs.mkdirSync(listfolder);
    }
    
    mp3file=getfullmp3file(args);

    coverurl=args['al']['picUrl']
    dopic(listfolder,coverurl);
    
    if(myargs['_localFile']!=''){
      event.sender.send("reply-info","File Exists:"+mp3file);
      event.sender.send("audio-down-finish");
    }
    else{
      //===============================
     
      songfile= myfolders.folders['cache']+'data\\'+audioid+'.json'
      if(fs.existsSync(songfile)){
        //event.sender.send('reply-info',"have data:"+songfile);
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


ipc.on('get-play-list',function(event,playlistid){
  jsfile=myfolders.folders['cache']+"playlists\\"+playlistid+'.json';
  //console.log("newjsfile:"+jsfile)
  if(fs.existsSync(jsfile)){
    //event.sender.send("reply-info","find jsfile:"+jsfile);
    mystr=getfilefromlocal(jsfile);
    objs=JSON.parse(mystr);
    
    playlist=objs['playlist'];
    tracks=playlist['tracks'];
    for(i=0;i<tracks.length;i++){
      arg1=tracks[i];
      tracks[i]=checkonelocalsong(arg1);
      //console.log('get'+tracks[i]['_localFile']);
    }
    objs['playlist']['tracks']=tracks;
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
        objs=JSON.parse(obj);
        code=objs['code'];
        if(code==200){
          fs.writeFile(jsfile,obj,function(err){
  
          });
        }
       
      if(code==200){ 
        playlist=objs['playlist'];
        tracks=playlist['tracks'];
        for(i=0;i<tracks.length;i++){
          arg1=tracks[i];
          tracks[i]=checkonelocalsong(tracks[i]);
         
        }
       objs['playlist']['tracks']=tracks;
       
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
    //event.sender.send("reply-info","find jsfile:"+jsfile);
    mystr=getfilefromlocal(jsfile);
    objs=JSON.parse(mystr);
    
    songs=objs['songs'];
     for(i=0;i<songs.length;i++){
      songs[i]=checkonelocalsong(songs[i]);
     }
     objs['songs']=songs;
    event.sender.send('albumlist-info',objs);
  }
  else{

  var options=myserver.search('/album?id=' + albumlistid)

  HttpRequest(options,function(obj){
    if(obj){
      objs=JSON.parse(obj);
      code=objs['code'];
     if(code==200){
      fs.writeFile(jsfile,obj,function(err){
        if(err){
          console.log(err.message)
        }
      });
     }
      
     objs=JSON.parse(obj);
     code=objs['code'];
     if(code==200){
        songs=objs['songs'];
        for(i=0;i<songs.length;i++){
          songs[i]=checkonelocalsong(songs[i]);
        }
        objs['songs']=songs;
        event.sender.send('albumlist-info',objs);
     }
    
  }
  });
}
})

ipc.on('get-new-lists',function(event,lasttime){
  //console.log('lasttime='+lasttime)
  if(lasttime==''){
    var options=myserver.search("/top/playlist/highquality")
  }
  else{
    var options=myserver.search("/top/playlist/highquality?before="+lasttime)
    
  }

 
ipc.on('output-songs',function(event,args){
 
  //mysongsstr=''
  name1=args['name'];  
  event.sender.send('begin-output',name1)
      song=args;  
      listname=song['_listname'];
      mp3file=song['_localFile'];
      mp3filename=getsongfile(song);
      listfolder=myfolders.folders['zx300']+formatfoldername(listname)+"\\"
      
      if(!fs.existsSync(listfolder)){
        fs.mkdirSync(listfolder);
      }
     
      if(mp3file!=''){
        
        listfile=listfolder+mp3filename;
        coverfolder=getfullfolder(song);
        songcoverstr=coverfolder+"\\cover.jpg";
        if(!fs.existsSync(listfile)){
          savetags2mp3(song,songcoverstr,mp3file,listfile);
          //event.sender.send('reply-info','save mp3:'+ mp3filename)
        }
        else  event.sender.send('reply-info','have mp3:'+ mp3filename)
      }
    
    event.sender.send('finish-output')

})

ipc.on('output-lyric',function(event,arg){
 
      song=arg;  
      listname=song['_listname'];
      mp3filename=getsongfile(song);
      listfolder=myfolders.folders['zx300']+formatfoldername(listname)+"\\"
      
      //-------------lyric--------------------

      songid=song['id'];
      lyricfile=mp3filename.replace('.mp3','.lrc');
      lyricfullfile=listfolder+lyricfile;

      lystr=findlocallyric(songid);
      //console.log('songid='+songid)
      //console.log(lystr);
      if(lystr!=''){
        lyricobj=JSON.parse(lystr);
        savelyric(lyricobj,lyricfullfile);
        event.sender.send('finish-lyric')
      }
      else{
        var options=myserver.search('/lyric?id='+songid);
        console.log("down id="+songid)
        HttpRequest(options,function(obj){
          if(obj){
              lyricfolder=myfolders.folders['lyric'];
              lyricfile=lyricfolder+songid;
              fs.writeFileSync(lyricfile,obj);
              event.sender.send('reply-info',"save id:"+lyricfile)
              lyricobjs=JSON.parse(obj)
              savelyric(lyricobjs,lyricfullfile);
              event.sender.send('finish-lyric')
          }
        });
      }
      //--------------end lyric---------------*/
})


ipc.on('output-m3u',function(event,args){
  listname=args[0]['_listname'];
  listfolder=myfolders.folders['zx300']+formatfoldername(listname)+"\\"
  m3ufile=listfolder+formatfilename(listname)+".m3u";
  m3ustr=""
     for(i=0;i<args.length;i++){
       song=args[i];
       mp3file=song['_localFile'];
       if(mp3file!=''){
        m3uarr=mp3file.split('\\');
        mp3filename=m3uarr[m3uarr.length-1];
        m3ustr=m3ustr+mp3filename+"\r\n";
        //console.log(m3ustr);
      }

     }
     //console.log(m3ustr)
     fs.writeFileSync(m3ufile,m3ustr);
     event.sender.send("finish-m3u",listname);

})

  HttpRequest(options,function(obj){
    if(obj){
     objs=JSON.parse(obj);
     //console.log(objs);
     code=objs['code'];
     if(code==200){
      newlists=objs['playlists'];
      console.log(newlists[0]['name'])
      event.sender.send('return-new-lists',objs);
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
    //songartists=args['ar'];
    
    artist=formatartist(args);

    songname=args['name'];
    songfile1=audioid+"-"+artist+"-"+songname;
    if(songfile1.length>160){
      songfile1=songfile1.substr(0,160)
    }
    songfile1=formatfilename(songfile1);
    thisfile=songfile1+".mp3";
    //console.log('thisfile='+thisfile)
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
  if(s!=null){

  
  s=s.replace(/\:/ig,"-");
  s=s.replace(/\*/ig,"_")
  s=s.replace(/\\/ig,"-")
  s=s.replace(/\//ig,"-")
  s=s.replace(/\|/ig,"-")
  s=s.replace(/\"/ig,"-")
  s=s.replace(/\?/ig,"")
  s=s.replace(/\./ig,"-")
}
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
  console.log("down mp3="+mp3file)
  objs=JSON.parse(obj);
  mp3filetemp=mp3file+'.loading';

  mydate=getnowtime();
  spliter='--------------------------------------------------------------';

         if(objs['code']==200){
            
            mp3url=objs['data'][0]['url'];
            //console.log(mp3url)
            if(mp3url!=null){
                var stream=request(mp3url).pipe(fs.createWriteStream(mp3filetemp));
                    
                    stream.on('finish', function () {
                        mp3size1=fs.statSync(mp3filetemp).size;
                        mp3size2=objs['data'][0]['size'];
                        if(mp3size1==mp3size2){
                            fs.renameSync(mp3filetemp,mp3file)
                            e.sender.send("audio-down-finish");
                        } 
                        else{
                            errorstr='ERR：'+mp3file+'SIZE:'+mp3size1;
                            e.sender.send('reply-info',errorstr);
                            fs.appendFileSync("./errorinfo.log",errorstr+"\r\n"+mydate+"\r\n"+spliter+"\r\n");
                            
                            fs.unlinkSync(mp3filetemp);
                            e.sender.send("audio-down-finish");
                        }
                    });
            }
            else{
              
                  
                  errorstr="Error:没有权限下载-->"+mp3file
                  console.log(errorstr);
                  
                fs.appendFile("./errorinfo.log",errorstr+"\r\n"+mydate+"\r\n"+spliter+"\r\n" , (error)  => {
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
  yeartr=myDate.getFullYear();
  monthtr=myDate.getMonth()+1;
  nowdatetr=myDate.getDate();
  hourtr=myDate.getHours();
  minutetr=myDate.getMinutes();
  secondtr=myDate.getSeconds();
  if(hourtr<10) hourtr='0'+hourtr;
  if(minutetr<10) minutetr='0'+minutetr;
  if(secondtr<10) secondtr='0'+secondtr;
  if(monthtr<10) monthtr='0'+monthtr;
  if(nowdatetr<10) nowdatetr='0'+nowdatetr;

  datestr=yeartr+'-'+monthtr+'-'+nowdatetr+' '+hourtr+':'+minutetr+':'+secondtr;
  return datestr;

}
//-----------------------------
//检查是否有本地音乐文件，添加[localUrl]
//有，localUrl=mp3file
//无，localUrl='';
function checkonelocalsong(arg){
  audioid=arg['id'];
  
  myfolderid=arg['al']['id'];
  myfolder=arg['al']['name'];
  myfoldernew=myfolderid+"_"+myfolder;

    listfolder=myfolders.folders['music']+formatfoldername(myfolder);
    listfoldernew=myfolders.folders['music']+formatfoldername(myfoldernew);
    //console.log(listfoldernew)
    if(fs.existsSync(listfolder) && !fs.existsSync(listfoldernew)) {
      fs.renameSync(listfolder,listfoldernew);
    }
    if(fs.existsSync(listfolder) && fs.existsSync(listfoldernew)) {
      console.log('两个文件夹同时存在！')
      console.log('1.'+listfolder)
      console.log('2.'+listfoldernew);
    }
    listfolder=listfoldernew;
      
   myfile=getfullmp3file(arg)

    if(fs.existsSync(myfile)){
      arg['_localFile']=myfile;
    }
    else{
      arg['_localFile']='';
    }
  
  return arg;

}

function getfullfolder(args){
  myfolderid=args['al']['id'];
  myfolder=args['al']['name'];
  myfolder=myfolderid+"_"+myfolder;
  
  listfolder=myfolders.folders['music']+formatfoldername(myfolder);
  return listfolder
}

function getfullmp3file(args){

  listfolder=getfullfolder(args);

  
  mp3filename=getsongfile(args)  
  mp3file=listfolder+"\\"+mp3filename;
  return mp3file
}


function savetags2mp3(songarr,cover,ofile,dfile){
  songbuffer=fs.readFileSync(ofile);
  coverbuffer=fs.readFileSync(cover);
  songid=songarr['id'];
  title=songarr['name'];
  artists=songarr['ar'];
  var myar=new Array();
  for(i=0;i<artists.length;i++){
      myar[i]=artists[i]['name'];
  }
  albumname=songarr['al']['name']
  albumid=songarr['al']['id']
  
  
  albumyear=formatyear(songarr['publishTime'])
  albumtrack=songarr['no'];
  /*---------------------
  albumfile=myfolders.folders['cache']+"\\albums\\"+albumid+'.json'
  if(fs.existsSync(albumfile)){
    alstr=fs.readFileSync(albumfile);
    alarr=JSON.parse(alstr);
    albumyear=formatyear(alarr['album']['publishTime'])
    alsongs=alarr['songs'];
    for(kk=0;kk<alsongs.length;kk++){
      kid=alsongs[kk]['id'];
      if(songid==kid){
        mysong2=alsongs[kk];
        break;
      }
    }
    albumtrack=mysong2['no'];

  }
    //---------------------*/
  var songwriter=new tagWriter(songbuffer);
  console.log('albumname:'+albumname)
  songwriter.setFrame('TIT2', title)
    .setFrame('TPE1', myar)
    .setFrame('TALB', albumname)
    .setFrame('TRCK',albumtrack)
    .setFrame('TYER',albumyear)
    .setFrame('APIC', {
        type: 3,
        data: coverbuffer,
        description: ''
    });
  songwriter.addTag();

  var taggedSongBuffer = Buffer.from(songwriter.arrayBuffer);
  fs.writeFileSync(dfile, taggedSongBuffer);

  }

  function findlocallyric(id){
    lyricpath=myfolders.folders['lyric'];
    lyricfile=lyricpath+id
    if(fs.existsSync(lyricfile)){
      lystr=fs.readFileSync(lyricfile,'utf-8');
    }
    else lystr=''
    lystr=lystr.toString();
    return lystr;
  }
  function savelyric(objs,sfile){
    
    if(objs['musicId']!=='' && objs['musicId']!==undefined){
        lyricstr=objs['lyric']
    }
    else{
       if(objs['lrc']!=null && objs['lrc']!=undefined){
        lyricstr=objs['lrc']['lyric']
       }
       else lyricstr=""
    }
    
    if(lyricstr!=''){
      lyobj=lyricstr.split(' \[');
      astr=""
    for(i=0;i<lyobj.length;i++){
       if(i>0) lystr="\["+lyobj[i]
       else lystr=lyobj[i];
       lystr=lystr.replace(/\.(\d{2})\d\]/ig,"\.$1\]");
       if(i<lyobj.length-1) lystr=lystr+"\r\n";
       astr=astr+lystr;
    }
    fs.writeFileSync(sfile,astr);
    }
    
  }

  function formatyear(n){
    var date=new Date(n);
    year=date.getFullYear();
    /*
    month=date.getMonth()+1;
    day=date.getDate();
    if(month<10) month='0'+month;
    if(day<10) day="0"+day;
    fullstr=year+'-'+month+'-'+day
    */
    return year;
}
  