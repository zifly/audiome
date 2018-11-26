//#!/usr/bin/env node

var readline = require('readline');
var fs=require('fs')
var exists = require('fs').existsSync
var ipc = require('electron').ipcMain;
var jsmediatags = require("jsmediatags");
const renamefromtags=require('./renamefromtags.js')
//myargs=process.argv.splice(2);
//mymp3=myargs[0];
exports.tomp3=getmp3file;
/*参数说明
  ofile: uc文件
  flag: 判断是否删除uc!file 和相应的idx!file 1=delete
  e: sender事件
  channelname:通过e发送消息的channel名称
*/
function getmp3file(ofile,flag,e,channelname){
        
    mysize=fs.statSync(myfile).size;
    sizestr=formatfilesize(mysize);
    doit=-1
      e.sender.send('reply-info', 'filesize:'+sizestr);
      if(mysize>1024000){
        doit=1;
      }

    if(doit==1){
        tempfs=ofile.split("-");
        fileid=tempfs[0];
        dfile=fileid+".mp3";
    console.log("read uc file...");
    fs.readFile(ofile,"binary",function(err,filedata){
        if(err){
            console.log(err);
            return;
        }
        else{
            mybuff=new Buffer(filedata,'binary');
            console.log("Changing uc file to mp3...");
            for(i=0;i<mybuff.length;i++){
                buf=mybuff[i];
                newbuf=buf^0xa3;
                mybuff[i]=newbuf;

            }
            
            fs.writeFileSync(dfile,mybuff);
            sstr="save mp3 file :"+dfile+" success";
                    console.log(sstr);
                    //renamefromtags.rename(dfile);
                    if(flag==1){
                        fs.unlinkSync(ofile);
                        dstr='deleted the ucfile :'+ofile+' '
                        nfile=ofile.substr(0,ofile.length-3)+"idx!";
                        fs.unlink(nfile,function(err){
                            if(err) console.log("not find idx file");
                            else{
                                estr="deleted idx file - "+nfile;
                                //e.sender.send(channelname,estr);
                                console.log(estr)
                            }
                        })
                    
                    }
                    e.sender.send('get-uc-folder',getfilepath(dfile)); 
                    return dfile;
                }
            })
    }
    else{
        fs.unlinkSync(ofile);
            dstr='deleted the ucfile :'+ofile+' '
            nfile=ofile.substr(0,ofile.length-3)+"idx!";
            fs.unlink(nfile,function(err){
            if(err) console.log("not find idx file");
                else{
                    estr="deleted idx file - "+nfile;
                    //e.sender.send(channelname,estr);
                    console.log(estr)
                }
            });
        e.sender.send('get-uc-folder',getfilepath(dfile));                   
    }      
 
}
/*
fs.unlinkSync = function(path) {
    nullCheck(path);
    return binding.unlink(pathModule._makeLong(path));
  };
*/
function getfilepath(s){
    //s: file's full name - include full path and file name
      ss=s.split("\\");
      rr=ss.pop();
      //console.log("removed: "+rr);
      spath=ss.join("\\")+"\\";
      return spath;
  }
function getfilename(s){
    //s: file's full name - include full path and file name
      ss=s.split("\\");
      rr=ss.pop();
      
      return rr;
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
  