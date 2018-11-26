//audio-new.html actions
function dobar(n){
    s1='bar1';
    s2='bar2';
    obj1=document.getElementById(s1);
    obj2=document.getElementById(s2);
    obj=document.getElementById('bar'+n);
    sobj1=document.getElementById('newform1');
    sobj2=document.getElementById('newform2');
    cname=obj.className;
    
    if(cname=='baroff'){
        switch(n){
            case 1:
            
                obj1.className='baron';
                obj2.className='baroff';
                sobj1.style.display='';
                sobj2.style.display='none';
                
            break;
            case 2:
            
                 obj2.className='baron';
                 obj1.className='baroff';
                 sobj2.style.display='';
                 sobj1.style.display='none';
             
            break;
        } 
    } 
    
}

function getaudibleinfo(s){
    subtitle="";
    tags="";
    title="";
    publisher="";
    writer="";
    reader="";
 

    myValue=s;
    myarr=myValue.split("\n");
    tags=myarr[0].replace("  ",";"); 
    tags=$.trim(tags);                           // z.cn category
    title=$.trim(myarr[3]);                       // z.cn title
    arr4=myarr[4];
    //alert(arr4);
    nn=4;
    if(arr4.indexOf("By: ")>-1){
    }
    else{
        subtitle=$.trim(arr4);
        nn++;
    }
    writer=myarr[nn].replace("By: ","");
    writer=$.trim(writer);
    writer=formatstr(writer);
      nn++;
      
    reader=myarr[nn].replace("Narrated by: ","");
    reader=$.trim(reader);
      nn++;
 
     arr5=myarr[nn];
    if(arr5.indexOf("Length: ")>-1){
     }
    else{
        nn++;
    }
    duration=myarr[nn].replace("Length: ","");
    duration=$.trim(duration);
    duration=duration.replace(" hrs",":");
    duration=duration.replace(" and ","");
    duration=duration.replace(" mins",":");
    //duration=duration+"00";
    
    durarr=duration.split(":");
    hrs=parseInt($.trim(durarr[0]));
    if(hrs<10) hrs='0'+hrs;
    mins=parseInt($.trim(durarr[1]));
    if(mins<10) mins='0'+mins;
    duration=hrs+":"+mins+":00";
    nn=nn+2;
    
    release=myarr[nn].replace("Release date: ","");
    release=$.trim(release);
    datearr=release.split("-");
    year="20"+datearr[2];
    month=parseInt(datearr[0]);
    if(month<10) month="0"+month;
    day=parseInt(datearr[1]);
    if(day<10) day="0"+day;
    release=year+"-"+month+"-"+day;
    
    publisher=myarr[nn+2].replace("Publisher: ","");
    publisher=$.trim(publisher);
    newfrm.bookname.value=title;
    newfrm.bookauthor.value=writer;
    newfrm.bookreader.value=reader;
    newfrm.booklength.value=duration;
    newfrm.bookrelease.value=release;
    newfrm.bookpublisher.value=publisher;
    dobar(1);
}

function getbookinfo(sfile){
    alert(sfile);
   var mybook=getTextFile(sfile,'json');
   alert(mybook.title);
}




function getTextFile(fname,stype){
    
    //ranstr=Math.random().toString(36).substr(2);
    //tempUrl=tempUrl+'?ref='+ranstr;
    //tempUrl="../htmls/"+fname;
    $.ajax({
			
                 url: fname,
                 type: 'GET',
                 dataType: stype,
                   data:'',
                  async:false,
                  error: function(XMLHttpRequest, textStatus, errorThrown){
				     errornum=XMLHttpRequest.readyState + XMLHttpRequest.status;
					 if(errornum==204){	
					    var jcontent = XMLHttpRequest.responseText.replace(/\\/g, "\\\\");
						myContents=jcontent.replace(/\s{4}/g,'')
					 }
                   	  else {
					    myContents=XMLHttpRequest.responseText;
					    alert('error Code:'+XMLHttpRequest.readyState + "-"+XMLHttpRequest.status);
					    }
                  },
                 success: function(result){
                     
                     if(stype=='json') result=parseJSON(result);
				         myContents=result;			         
                 	     
                          } 
                                        
                });
    
   return myContents;

}


function closepop(){
    wobj=document.getElementById('popwin');
    wobj.style.visibility='hidden';
}


function showpopwin(str,dtime){
    iobj=document.getElementById("popinfo");
    iobj.innerHTML=alertstr;
    
    wobj=document.getElementById('popwin');
    wobj.style.visibility='visible';
    

    setTimeout("closepop()",dtime);
}


function formatstr(s){
    s=s.replace(/\'/ig,"\\'");
    s=s.replace(/\"/ig,'\\"');

    return s;
}
function formatfoldername(s){
    s=s.replace(/\:/ig,"-");
    s=s.replace(/\*/ig,"_")
    s=s.replace(/\\/ig,"-")
    s=s.replace(/\//ig,"-")
    s=s.replace(/\|/ig,"-")
    s=s.replace(/\"/ig,"-")
    s=s.replace(/\?/ig,"")
    return s;

}