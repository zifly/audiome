
//#!/usr/bin/env node



var fs=require('fs')
var exists = require('fs').existsSync
const ipc = require('electron').ipcMain;
var jsmediatags = require("jsmediatags");

/*
myargs=process.argv.splice(2);
mymp3=myargs[0];
ofile=mymp3
newstr="";

*/

exports.rename=dochangename;
function dochangename(ofile){
    jsmediatags.read(ofile, {
        onSuccess: function(tags) {
           newname=getname(tags,ofile);
           //----------
           pathstr=getfilepath(ofile);
           fname=getfilename(ofile);
          
           fid=fname.substr(0,fname.length-4);
           newstr=fid+'-'+newname;
           
           newfile=pathstr+newstr;
           console.log(newfile);
           
            fs.renameSync(ofile,newfile);
          
           
        }
        });

}



function getname(tags,ofile){
    if(tags=="") return "";
    mytags=tags['tags'];
    title=mytags['title'];
        artist=mytags['artist'];
        album=mytags['album'];
        newstr=''
        if(artist!='' && artist!=undefined){
            newstr=artist+'-';
        }
        if(title!='' && title!=undefined){
        //title=title.replace("\/","-")
            newstr=newstr+title;
        }
        if(newstr!=''){
           newfile=newstr+".mp3";
           }
        else{
            newfile=ofile;
        }

        return newfile;
}


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
 