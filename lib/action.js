function getTextFile(fname){
    
    //ranstr=Math.random().toString(36).substr(2);
    //tempUrl=tempUrl+'?ref='+ranstr;
    //tempUrl="../htmls/"+fname;
    $.ajax({
			
                 url: fname,
                 type: 'GET',
                 dataType: 'html',
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
                    myContents=result;			         
                 	     
                          } 
                                        
                });
    
   return myContents;

}

function showpopwin(alertstr,dtime){
    iobj=document.getElementById("popinfo");
    iobj.innerHTML=alertstr;
    
    wobj=document.getElementById('popwin');
    wobj.style.visibility='visible';
    if(dtime>0)  setTimeout(function(){
        wobj=document.getElementById('popwin');
        wobj.style.visibility='hidden';
    },dtime);
   
}
function closepopwin(){
    wobj=document.getElementById('popwin');
    wobj.style.visibility='hidden';
}

