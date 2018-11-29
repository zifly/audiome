        var g_nowplayobj;
        
        /*
           ===============================================
           you must have these objects:
           1. Audio id="bgMusic" (audio object)
           2. tag id="musiccurrent" 
              // to show current time if you wanted
           ===============================================
        */
        
        
        //var oo=setTimeout("isPush()",100);
        
        //===============================================
        //Now Music Face
        //===============================================
        
        dowhenplayend=function(){
            //alert(g_playsongslist.length)
            clearInterval(g_nowplayobj);
            bgMusic.removeEventListener('ended',dowhenplayend,false);
            pobj=document.getElementById("player_play");
            pobj.src="./images/play_1.png";
            
            if(g_playsongslist.length>1){
                if(g_playsongsidx<-1) g_playsongsidx=g_playsongslist.length-2;
                if(g_playsongsidx>g_playsongslist.length-1) g_playsongsidx=-1;
                g_playsongsidx++;
                //alert('g_playsongsidx='+g_playsongsidx)
                playaudioid(g_playsongsidx)
                return;
            }
            
           }


        function bindbgMusic(){
            
            bgMusic.addEventListener('ended', dowhenplayend, false);
        }
        
      

        function goto(){
                nowsongcurtime=parseInt(g_nowsong['dt']/1000);
                mycurrent=parseInt(bgMusic.currentTime);
                if(Math.abs(mycurrent-nowsongcurtime)<3){
 
                    playaudioid(0)
                }
                else{
                  bgMusic.play();
                pobj=document.getElementById("player_play");
                pobj.src="./images/play_2.png";
                bindbgMusic();
                showCurrentTime();
                }
                
           
        }

        function playthis(){
            if(bgMusic.paused) {
                bgMusic.play();
                pobj=document.getElementById("player_play");
                pobj.src="./images/play_2.png";
            }
            else{ bgMusic.pause();
                pobj=document.getElementById("player_play");
                pobj.src="./images/play_1.png";
            }
        }

        function next(){
            //nowsong=g_playsongslist[g_playsongsidx];
            nowsongcurtime=g_nowsong['dt'];
            bgMusic.currentTime=nowsongcurtime-100;
            //alert('stop')
        }
        
        function prev(){
            //nowsong=g_playsongslist[g_playsongsidx];
            nowsongcurtime=g_nowsong['dt'];
            bgMusic.currentTime=nowsongcurtime-1;
            g_playsongsidx=g_playsongsidx-2;
            //if(g_playsongsidx<0) g_playsongsidx=-1
        }

        function showCurrentTime(){
            g_nowplayobj=setInterval('showIt()',500);
        }
        
        function showIt(){
            var o=document.getElementById("musiccurrent");
            currtime=parseInt(bgMusic.currentTime);
            currtime=formattime(currtime);
            if(bgMusic.readyState==4){
                o.innerText=currtime;
            }
            
        }
 

        function formattime(n){
            second=n%60;
            minute=parseInt(n/60);
            if(minute<10) minute='0'+minute;
            if(second<10) second='0'+second;
            ss=minute+":"+second;
            return ss;
        }



        //===============================================
        //end Control
        //===============================================

           //music controler
        
           function repeat(){
            repeatplay();
        }
        
        
        
        function goto2(){
            if(Track.length>0){     
                if(trackBegin>Track.length-1) {
                    trackBegin++;
                    //showPhase(phaseContainer);
                    trackBegin=trackBegin-1;
                    //showres("Music at the end!");
                    }
                    
                else {
                    
                    btime=Track[trackBegin];
                    trackBegin++;
                    //showPhase(phaseContainer);
                    play2play(btime,Track[trackBegin]);
                    //shownowstep();
                }
            }
            else bgMusic.play();
        }
        
        //


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
        
        
        var starttime;
        var endtime;
        var tracker_pause;
        var modifytime=0;
        
        
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
                
                if(currtime>(endtime-modifytime)||currtime==endtime){
                    
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
        
        


        function openUrl(s){
            window.open(s,"_blank");
        }