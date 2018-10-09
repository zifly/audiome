       var trackBegin=0;
        var phaseContainer="phasearea";
        
        
        //music controler
        
        function repeat(){
            repeatplay();
        }
        function prev(){
            if(trackBegin<2) {
                    
                    trackBegin=0;
                    
                    bgMusic.pause();
                    showres('already begin');
                    }
            else{   
                
                
                    trackBegin--;
                    btime=Track[trackBegin-1];
                    play2play(btime,Track[trackBegin]);
                    showPhase(phaseContainer);
                    //shownowstep();
                    
            }        
        }
        
        
        function goto(){
                 
                if(trackBegin>Track.length-1) {
                    trackBegin++;
                    showPhase(phaseContainer);
                    trackBegin=trackBegin-1;
                    //showres("Music at the end!");
                    }
                    
                else {
                    
                    btime=Track[trackBegin];
                    trackBegin++;
                    showPhase(phaseContainer);
                    play2play(btime,Track[trackBegin]);
                    //shownowstep();
                }
            
        }
        
        //
        function goto2(){
           alert(bgMusic.src);
        }
        
        
        function showPhase(s){
            thisnum=trackBegin;
            o=document.getElementById(s);
            o.innerHTML=Phase[thisnum-1];
            //alert(trackBegin)
        }
        
        
        
        
        /*
           ===============================================
           you must have these objects:
           1. Audio id="bgMusic" (audio object)
           2. tag id="timeCurrent" 
              // to show current time if you wanted
           ===============================================
        */
        
        
        //var oo=setTimeout("isPush()",100);
        
        //===============================================
        //Music Face
        //===============================================
        function showDuration(idname){
            var dobj=document.getElementById(idname);
            dobj.innerText=parseInt(bgMusic.duration);
        }
        function showCurrentTime(){
            //setInterval('showIt()',100);
        }
        
        function showIt(){
            var o=document.getElementById("timeCurrent");
            currtime=parseInt(bgMusic.currentTime);
            if(bgMusic.readyState==4){
                o.innerText=currtime;
            }
        }
        
        function showres(s){
            var o=document.getElementById("resarea");
            ss='<span style="color:#990000;">STATUS: </span>'+s
            o.innerHTML=ss;
        }
        
        function shownowstep(){
            tnum=''+Track.length;
                    nn=tnum.length;
                    tracknumstr=format_int(trackBegin,nn);
                    resstr=tracknumstr+" | "+tnum;
                    showres(resstr);
        }
        //===============================================
        //Music Control
        //===============================================
        
        var starttime;
        var endtime;
        var tracker_pause;
        
        
        
        function play2play(){
            argnum=arguments.length;
            clearInterval(tracker_pause);
            switch(argnum){
                case 0:
                  starttime=0;
                  endtime=bgMusic.duration;
                  break;
                case 1:
                  starttime=arguments[0];
                  endtime=bgMusic.duration;
                  break;
                default:
                    starttime=arguments[0];
                    endtime=arguments[1];
             }
                bgMusic.currentTime=starttime;
                bgMusic.play();
                getCurrent();
        
        }
        
        function repeatplay(){
            play2play(starttime,endtime);
        }
        
        
        
        
        //========================================
        // private functions
        //========================================
        
        
        //  sub _function for play2play()
        //  include: getCurrent()  currentplay()
        //  to pause at the endtime
        
        
        
        function getCurrent(){
                tracker_pause=setInterval("currentplay()",10);
            }
        
        function currentplay(){
                currtime=bgMusic.currentTime;
                
                if(currtime>(endtime-0.5)||currtime==endtime){
                    
                    bgMusic.pause();
                    clearInterval(tracker_pause);
                
                }
            }
        
        // end sub_function for play2play()
        
        function format_int(s,n){
            nstr=''+s;
            nn=nstr.length;
            nx=n-nn;
            
            for(i=0;i<nx;i++){
                nstr='0'+nstr;
            }
            
            return nstr;
        }
        
        function showcover(){
            coverobj=document.getElementById("covertext");
            coverobj.style.visibility="visible";
            imgsrc="../Audible/cue/"+myBookName+"/cover.png"
            
            coverobj.innerHTML="<img src=\""+imgsrc+"\" border=0 height=260 onclick=closecover() >";
            txtobj=document.getElementById("showarea");
            //txtobj.style.display="none";
            txtobj.style.visibility="hidden";
        }
        
        function closecover(){
            coverobj=document.getElementById("covertext");
            //coverobj.style.display="none";
            coverobj.style.visibility="hidden";
            imgsrc="../Audible/cue/"+myBookName+"/cover.png"
            
            coverobj.innerHTML="";
            txtobj=document.getElementById("showarea");
            //txtobj.style.display="";
            txtobj.style.visibility="visible";
        }
        
        
        function isPush(){
            
                //showres("Music is Loaded...");
             //showcover();
              
            if(Phase.length<Track.length){
            mylen=Track.length-Phase.length;
            
            for(i=0;i<mylen;i++){
                Phase.push("");
            }
            
          }
          
        }
    
        


        function openUrl(s){
            window.open(s,"_blank");
        }