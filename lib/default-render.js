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
   
   ipc.send('save-bookinfo',dataarr);

}
ipc.on('save-bookinfo-reply',function(event,argdata){
    
    
    if(argdata.indexOf('Error 9999')>-1){
        //argstr=arg.substring(10,arg.length-11);
        //alert(typeof(argdata));
       alert(argdata);
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

 