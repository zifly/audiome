
var readline = require('readline');
var fs=require('fs')
var exists = require('fs').existsSync

bookroot=process.cwd();

function servertemplates(sf){
    var myfilestr="";
    sfile="../htmls/"+sf;
    if(exists(sfile)){
        myfilestr=readfile(sfile);
      }
    return myfilestr;
}



//=============================================================
// followings private function

function readfile(s){
    fs.readFile(s, 'utf-8', function (err, data) {
        if (err) {
            return err;
        } else {
            return data;
        }
    });
    
    
}


function createfolder(p,s){
    s=foldername(s);
    ff=p+'\\'+s;
    if(exists(ff)==false){
        fs.mkdirSync(ff);
        //console.log("Create folder:  \x1B[33m"+ff+"\x1B[37m");
        
        return ff;
    }
    else{
        //console.log("Exists Folder: \x1B[33m"+ff+"\x1B[37m");
        return "";
    }
}

function getbookjson(arr){
    var labarr=new Array(
        'title',
        'creator',
        'language',
        'encoding',
        'doctype',
        'contributor',
        'identifier'
    );
    var labvalues=new Array(
        '',
        '',
        'zh',
        'utf-8',
        'EBOK',
        'ZFiBook',
        ''
    );
    
    console.log("\r\nbook Info:")
    console.log("=================================");
    
    str='   {\r\n';
    for(ilab=0;ilab<labarr.length;ilab++){
        if(ilab<arr.length){
            labvalues[ilab]=arr[ilab]
        }
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

