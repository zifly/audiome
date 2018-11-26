
var fs=require('fs')
var exists = require('fs').existsSync

root1=process.cwd()

storename='bookstore';
bookroot=root1+"\\"+storename;

if(!exists(bookroot)){
    createfolder(root1,storename);
}
idxname="idxfiles";
bookidx=bookroot+"\\"+idxname;
if(!exists(bookidx)){
    createfolder(bookroot,idxname);
}

myargs=process.argv.splice(2);

mystyle=parseInt(myargs[0]);// save json 的状态,1 =new 如有文件存在就报错; 0=modify 文件存在则覆盖

mystr=myargs[1];
myarg=mystr.split('**');
bookname=myarg[0];
bookfolder=myarg[1];

if(bookfolder==''){
    bookfolder=formatfoldername(bookname);
    createfolder(bookroot,bookfolder);
}
bookfolderpath=bookroot+"\\"+bookfolder+"\\";
myarg[1]=bookfolder;

idxfile=bookidx+'\\book_'+bookfolder+'.json';
console.log('bookinfo='+idxfile);
if(exists(idxfile) && mystyle==1){
    str1="ERROR 9999: Exists this book: book name = " +bookname;
    console.log(str1);

}
else{
    bookjsonstr=getbookjson(myarg);
    fs.writeFile(idxfile,bookjsonstr,function(err){
         if(err){ throw err }
        }
    );
}


    function createfolder(p,s){
        ff=p+'\\'+formatfoldername(s);
     
        if(exists(ff)==false){
            fs.mkdirSync(ff);
            console.log("Create folder:  \x1B[33m"+ff+"\x1B[37m");
            return ff;
        }
        else{
            console.log("Exists Folder: \x1B[31m"+ff+"\x1B[37m");
            return ff;
        }
    }

    function formatfoldername(s){
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



    function getbookjson(labvalues){
        var labarr=new Array(
            'title',
            'folder',
            'author',
            'reader',
            'length',
            'releasedate',
            'cover',
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
    