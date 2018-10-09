const ipc = require('electron').ipcRenderer;



//open add new book files

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
    
    if(argstr.indexOf('ERROR 9999')>-1){
        
       alert(argstr);
    }
   
    sobj=document.getElementById('popwin');
    sobj.style.visibility="hidden";
});



document.getElementById('newbookimg').onclick=function(){
    arg=getTemplate('audio-new.html');
    sobj=document.getElementById('popwin');
    sobj.innerHTML=arg;
    sobj.style.visibility="visible";
 }

 