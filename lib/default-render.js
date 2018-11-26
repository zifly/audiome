const ipc = require('electron').ipcRenderer;
var g_listid;  //歌单的ID号
var g_listname; //歌单或专辑名称
var g_songslist;//歌单列表
var g_listcover;//歌单封面
var g_playsongsidx=-1 //正在播放的歌曲在 g_playsongslist()中的index;
var g_playsongslist=new Array();; //等待播放歌单列表;
var g_downlist=new Array();//下载文件列表


function savebookinfo(frm){
    var dataarr=new Array();
   frmobj=document.getElementById(frm);
   inputobjs=frmobj.getElementsByTagName('input')
   for(var i=0;i<inputobjs.length;i++){
       namestr=inputobjs[i].name;
       if(namestr.substr(0,4)=='book'){
            vals=inputobjs[i].value;
            dataarr.push(vals);
            //alert(vals);
       }
   }
   
   ipc.send('new-bookinfo',dataarr);

}
ipc.on('save-bookinfo-reply',function(event,argdata){
    argstr=argdata.toString();
    //alert(argstr);

        rearr=argstr.split('\n');
        for(i=1;i<rearr.length;i++){
            if(rearr[i].length>5) idxfile=rearr[i]
        }
        //alert(idxfile);
 
    sobj=document.getElementById('popwin');
    sobj.style.visibility="hidden";

    getbookinfo(idxfile);
    
});

ipc.on('reply-info',function(event,data){
    sobj=document.getElementById('replyinfo');
    ostr=sobj.innerHTML;
    //datastr=data.toString();
   typstr=typeof(data);
   ddstr='test'
   if(typstr=='object'){
       
    ddstr=JSON.stringify(data);
    ddstr="<pre>"+ddstr+"</pre>";
    
    ddstr=ddstr.replace(/\:\{/ig,":<br>{")
    ddstr=ddstr.replace(/\{/ig,"{<br>");
    ddstr=ddstr.replace(/\s/ig,"&nbsp;");
    ddstr=ddstr.replace(/,/ig,",<br>");
    ddstr=ddstr.replace(/\}/ig,"}<br>"); 
   }
   else{ddstr=data}
    newstr=ostr+'<br>'+ddstr;
    sobj.innerHTML=newstr;
})


function getnewaudiolist(){
    ipc.send('get-new-list',3)
}


/*
document.getElementById('newbookimg').onclick=function(){
    arg=getTextFile('../htmls/audio-new.html','html');
    sobj=document.getElementById('popwin');
    sobj.innerHTML=arg;
    sobj.style.visibility="visible";
 }
 
*/
document.getElementById('showbugwin').onclick=function(){
    
    o=document.getElementById('replyinfo');

    if(o.style.zIndex==-1) o.style.zIndex=99999;
    else o.style.zIndex=-1
 }
 document.getElementById('openaudiobook').onclick=function(){
    ipc.send('open-audio-file');
    clearreplyarea();
    clearcoverarea();
 }

 document.getElementById('changeuc2mp3').onclick=function(){
    ipc.send('change-uc-mp3');
    clearreplyarea();
 }

 document.getElementById('changeuc2folder').onclick=function(){
    ipc.send('change-uc-folder',"");
    clearreplyarea();
 }

 document.getElementById('ac3toflac').onclick=function(){
    ipc.send('ac3-flac')
    clearreplyarea();
 }

 document.getElementById('getnetease').onclick=function(){
        idnum=document.getElementById('audioid').value;
        ipc.send('push-audio-id',idnum)
 }

 document.getElementById('getplaylist').onclick=function(){
    
    idnum=document.getElementById('audiolistid').value;
    clearreplyarea();
    ipc.send('get-play-list',idnum)
 }

 document.getElementById('neteaselogin').onclick=function(){
    
    idnum=document.getElementById('audiolistid').value;
    clearreplyarea();
    ipc.send('netease-login',idnum)
 }

 document.getElementById('getalbumlist').onclick=function(){
    
    idnum=document.getElementById('audioalbumid').value;
    clearreplyarea();
    ipc.send('get-album-list',idnum)
 }

 document.getElementById('testpop').onclick=function(){
    
    wobj=document.getElementById('popwin');
   
            alertstr="《我爱你不爱你还是你》歌单下载完成！<br><br>开始下载歌单《那个认识你》"
            
            showpopwin(alertstr,2000);
    
 }


 ipc.on("return-file-value",function(event,sfile,stags){
     myfile=sfile;
     mytitle="";
     sobj=document.getElementById('bgMusic');
     //alert("we received the file:"+myfile);
     sobj.src=myfile;
     goto();
     
     if(stags!='none'){
        mytitle=stags['title'];
        myalbum=stags['album'];
        if(myalbum!=undefined && mytitle!=undefined) mytitle=myalbum+" - "+mytitle;
     }
     else{
            mytitle=''
        }
   if(mytitle==''){
     mytitle=getfilename(myfile);
     mytitle=mytitle.substr(0,mytitle.length-4);
   }
     sobj2=document.getElementById('musictitle');
     sobj2.innerHTML=mytitle;
     
 })



ipc.on("return-audio-cover",function(event,picurl){
    cobj=document.getElementById('audiocover');
    cobj.src=picurl;
})

ipc.on("mp3url",function(event,url){
    //alert(url)
    if(url!=null){
        sobj=document.getElementById('bgMusic');
        sobj.src=url;
        goto();
    }
    else{
        g_playsongsidx++;
        pushaudioid(g_playsongsidx)
    }
})

ipc.on("get-uc-folder",function(event,ofolder){
    ipc.send("change-uc-folder",ofolder)
    
})



ipc.on("playlist-info",function(event,objs){
    listobj=objs['playlist'];
    g_listid=listobj['id'];
    //console.log(g_listid)
    listobj=objs['playlist'];
    listname=listobj['name'];
    g_listname=listname;
    listimg=listobj['coverImgUrl'];
    g_listcover=listimg;
    listtime=listobj['createTime']
    createtime=formatdate(listtime);
    description=listobj['description'];
    if(description!=null)  description=description.replace(/\n/ig,"<p>");
    else description="";
    mycon=getTextFile("../htmls/playlist-detail.html","HTML")
    mycon=mycon.replace("[playlistcover]",listimg);
    mycon=mycon.replace("[playlistname]",listname);
    mycon=mycon.replace("[playlistcreatetime]",createtime);
    mycon=mycon.replace("[description]",description);
    
    
    //creator=listobj['creator'];
    tracks=listobj['tracks'];
    g_songslist=tracks;

    totalsongs=tracks.length;
    //alert(totalsongs)
    mycon=mycon.replace("[totalsongs]",totalsongs);
    songliststr=getsongslist(tracks);
    mycon=mycon.replace("[songlist]",songliststr);
    pageobj=document.getElementById("maindo2");
    pageobj.innerHTML=mycon;
    
})

ipc.on("albumlist-info",function(event,listobj){
    myinfos=listobj['album'];
    
    listname=myinfos['name'];
    g_listname=listname;
   // alert(listname)
    listimg=myinfos['picUrl'];
    g_listcover=listimg;
   // alert(listimg);
    listtime=myinfos['publishTime']
    createtime=formatdate(listtime);
    description=myinfos['description'];
    if(description==null) description=""; 
    description=description.replace(/\n/ig,"<p>");
    songnum=myinfos['size']
    mycon=getTextFile("../htmls/playlist-detail.html","HTML")
    mycon=mycon.replace("[playlistcover]",listimg);
    mycon=mycon.replace("[playlistname]",listname);
    mycon=mycon.replace("[playlistcreatetime]",createtime);
    if(description!=null)  mycon=mycon.replace("[description]",description);
    mycon=mycon.replace("[totalsongs]",songnum);

    creator=listobj['creator'];
    songs=listobj['songs'];
    for(snum=0;snum<songs;snum++){
        songs[snum]['listname']=listname;
    }
    g_songslist=songs;

    //alert(songs.length)
    songliststr=getsongslist(songs);
    mycon=mycon.replace("[songlist]",songliststr);
    pageobj=document.getElementById("maindo2");
    pageobj.innerHTML=mycon;
    
})

ipc.on("audio-down-finish",function(event){
    if(g_downlist.length>1){
        arr1=g_downlist[0];
        arr2=g_downlist[1];
        if(arr1['listname']!=arr2['listname']){
            alertstr="歌单《"+arr1['listname']+"》下载完成<br><br>";
            alertstr=alertstr+"开始下载歌单《"+arr2['listname']+"》";

            showpopwin(alertstr,3000);
            sobj=document.getElementById('replyinfo');
            ostr=sobj.innerHTML+"<br>"+alertstr;
            var myDate = new Date();
            myDate.toLocaleTimeString(); 
            sobj.innerHTML=ostr+"<br>"+myDate;
        }
    }
    g_downlist=g_downlist.slice(1);
    dobj=document.getElementById('downwin');
    dobj.innerText="downing->"+g_downlist.length;
    if(g_downlist.length>0){
        setTimeout("sendipc()",10);
    }
    else{
        alertstr="所有下载已经完成";
        showpopwin(alertstr,3000);
        sobj=document.getElementById('replyinfo');
        ostr=sobj.innerHTML+"<br>-----------------------------<br>"+alertstr;
            sobj.innerHTML=ostr;
    }
    
})

function sendipc(){
    ipc.send("audio-down",g_downlist[0]);
}

function downallsongs(){
    dnum=g_songslist.length;
    tdnum=g_downlist.length+dnum;
        alertstr="歌单《"+g_listname+"》添加到下载队列<br><br>";
        alertstr=alertstr+"共有 "+tdnum+" 首歌等待下载";
        showpopwin(alertstr,3000);
        
    if(g_downlist.length==0){
        g_downlist=g_songslist;
        
        ipc.send("audio-down",g_downlist[0]);
    }
    else g_downlist=g_downlist.concat(g_songslist);
    dobj=document.getElementById('downwin');
    dobj.innerText="downing->"+g_downlist.length;
 }


//===============================================================
//  private functions
function getfilename(s){
    ss=s.split("\\");
      rr=ss.pop();
      return rr;
  }

function formatdate(n){
    var date=new Date(n);
    year=date.getFullYear();
    month=date.getMonth()+1;
    day=date.getDate();
    if(month<10) month='0'+month;
    if(day<10) day="0"+day;
    fullstr=year+'-'+month+'-'+day
    return fullstr;
}


function clearreplyarea(){
    sobj=document.getElementById('replyinfo');
    sobj.innerHTML='';
}  

function clearcoverarea(){
    cobj=document.getElementById('audiocover');
    cobj.src='./images/coverbg.jpg';
}

function songsdownok(onesong){
    sid=onesong['id'];
    sname=onesong['name']

}

function getsongslist(songs){
    liststr="";
    mdlist=getTextFile("../htmls/songlist.html","HTML")
for(i=0;i<songs.length;i++){
    styleid=i%2;
    songid=songs[i]['id'];
    songname=songs[i]['name'];
    songartists=songs[i]['ar'];
    artist=""
    
    artnum=songartists.length;
    if(artnum>2) artnum=2
    for(rn=0;rn<artnum;rn++){
        artstr=songartists[rn]['name'];
        if(rn<songartists.length-1) artstr=artstr+";";
        artist=artist+artstr;
    }
    if(songartists.length>2) artist=artist+" etc."


    songtime=parseInt(songs[i]['dt']/1000);
    songtime=formattime(songtime);
    songs[i]['listname']=g_listname;
    
    divstr=mdlist.replace('[sid]',styleid);
    divstr=divstr.replace('[index]',i+1)
    divstr=divstr.replace('[songtitle]',songname)
    divstr=divstr.replace('[songduration]',songtime)
    divstr=divstr.replace('[songartist]',artist)
    divstr=divstr.replace('[songid]',i)
    //divstr=divstr.replace('[pushid]',songid)
    divstr=divstr.replace('[idx]',i)
    liststr=liststr+divstr;
}
g_songslist=songs;
return liststr;
}



function audiodown(idx){
    mysong=g_songslist[idx];
    g_downlist.push(mysong);

    alertstr="歌曲 "+mysong['name']+" 已经添加到下载队列";
    showpopwin(alertstr,2000);

    if(g_downlist.length==1){
        ipc.send("audio-down",g_downlist[0]);
    }
}

//直接点一首歌播放
function pushaudioid(idx){
    //alert(idx)
    if(idx<g_songslist.length){
        mytitle=g_songslist[idx]['name'];
        otitle=document.getElementById('musictitle');
        otitle.innerText=mytitle;

        songtime=parseInt(g_songslist[idx]['dt']/1000);
        songtime=formattime(songtime);
        var dobj=document.getElementById('musicduration');
        dobj.innerText=songtime;

        //g_playsongsidx=idx;
        //alert(g_playsongsidx);
        //alert(g_songslist[idx]['name'])
        ipc.send('play-one-audio',g_songslist[idx]);
    }
    
}

function playaudioid(idx){
    
    if(idx==g_playsongslist.length) idx=0;
        g_playsongsidx=idx;
        mytitle=g_playsongslist[idx]['name'];
        otitle=document.getElementById('musictitle');
        otitle.innerText=mytitle;

        songtime=parseInt(g_playsongslist[idx]['dt']/1000);
        songtime=formattime(songtime);
        var dobj=document.getElementById('musicduration');
        dobj.innerText=songtime;

        
        //alert(g_playsongsidx);
        //alert(g_playsongslist[idx]['name'])
        ipc.send('play-one-audio',g_playsongslist[idx]);
   
    
    
}

function playallsongs(){
    g_playsongslist=g_playsongslist.concat(g_songslist);
    alertstr=g_songslist.length+" 首歌已经添加到播放列表";
    showpopwin(alertstr,1000);

        if(g_playsongsidx==-1){
            g_playsongsidx=0;
        }
        if(bgMusic.src==''){
            playaudioid(g_playsongsidx)
        }

}


function clearplaysongslist(){

    g_playsongslist.length=0;
    g_playsongsidx=-1;

    alertstr="播放列表已经清空";
    showpopwin(alertstr,1000);
}
 