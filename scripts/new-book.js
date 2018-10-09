

//#!/usr/bin/env node


var fs=require('fs')
var exists = require('fs').existsSync

root1=process.cwd()

storename='bookstore';
bookroot=root1+"\\"+storename;
console.log(bookroot);
if(!exists(bookroot)){
    createfolder(root1,storename);
}
idxname="idx";
bookidx=bookroot+"\\"+idxname;
if(!exists(bookidx)){
    createfolder(bookroot,idxname);
}

myargs=process.argv.splice(2);
mystr=myargs[0];
myarg=mystr.split('**');
bookname=myarg[0];
bookfolder=myarg[1];

if(bookfolder==''){
    bookfolder=foldername(bookname);
    createfolder(bookroot,bookfolder);
}
bookfolderpath=bookroot+"\\"+bookfolder+"\\";
myarg[1]=bookfolder;
bookjsonstr=getbookjson(myarg);
idxfile=bookidx+'\\book_'+bookfolder+'.json';
if(exists(idxfile)){
    errstr="Exists this book :"+bookname
    err=new Error(errstr);
}
else{
    fs.writeFile(idxfile,bookjsonstr,function(err){
       // if(err) { errstr=err }
    });
}

if(err){
    console.log("Error 9999:"+err.message);
}


//=============================================================
// followings private function

function createfolder(p,s){
    ff=p+'\\'+foldername(s);
 
    if(exists(ff)==false){
        fs.mkdirSync(ff);
        console.log("Create folder:  \x1B[33m"+ff+"\x1B[37m");
        return ff;
    }
    else{
        console.log("Exists Folder: \x1B[33m"+ff+"\x1B[37m");
        return "";
    }
}

function getbookjson(labvalues){
    var labarr=new Array(
        'title',
        'folder',
        'author',
        'reader',
        'length',
        'releasedate',
        'language',
        'publisher'
    );

    
    console.log("\r\nbook Info:")
    console.log("=================================");
    
    str='   {\r\n';
    for(ilab=0;ilab<labarr.length;ilab++){
       
        strelement='        "'+labarr[ilab]+'":"'+labvalues[ilab]+'"';
        if(ilab<labarr.length-1) strelement=strelement+',\r\n';
        else strelement=strelement+'\r\n';
        str=str+strelement;
        console.log(labarr[ilab]+': '+labvalues[ilab]);
    }
    str=str+'   }\r\n';
    
    console.log("=================================");
    
    return str;
}

function foldername(s){
    s=s.replace(/\\/ig,"_");
    s=s.replace(/\*/ig,"_");
    s=s.replace(/\?/ig,"_");
    s=s.replace(/\"/ig,"");
    s=s.replace(/\|/ig,"_");
    s=s.replace(/\s/ig,"_");
    s=s.replace(/\:/ig,"_");
    s=s.replace(/\</ig,"_");
    s=s.replace(/\>/ig,"_");
    return s;
    
}

