const electron = require('electron')
const { app, BrowserWindow } = require('electron')
const ipc = require('electron').ipcMain;
const fs=require('fs')
const spawn = require('child_process').spawn;



  
  function createWindow () {  
    electron.Menu.setApplicationMenu(null)    //hide electron Menu
   
    // 创建浏览器窗口
    win = new BrowserWindow({ width: 1024, height:760 })
    win.openDevTools();

    // 然后加载应用的 html.html 
    //__dirname,表示main.js所在的目录路径

    win.loadURL(__dirname + '/htmls/default.html')
  }
  
  app.on('ready', createWindow);


  ipc.on('audio-new',function(event,arg) {
      console.log(arg);
      nfile="./htmls/"+arg;
      fs.readFile(nfile, 'utf-8', function (err, data) {
        if (err) {
           } 
        else { 
          event.sender.send('audio-new-reply',data)
        }
      });
    
  });

  ipc.on('save-bookinfo',function(event,arg) {
    console.log(arg);
    runpath=process.cwd()+"\\scripts\\new-book.js";
    console.log('runpath='+runpath)
    argstr=arg.join("**");
    var sendstr="OK";

    const ls = spawn('node', [runpath, argstr]);
      ls.stdout.on('data', (data) => {
        console.log(`${data}`);
        if(data.indexOf('Error 9999:')>-1){
          //datastr=data;
          //estr=datastr.split('Error 9999:');
          sendstr=data;
        }
      });

      ls.stderr.on('data', (data) => {
        
        //sendstr=data;
        //console.log(sendstr);
      });

      ls.on('close', (code) => {
          //console.log(`child process exited with code ${code}`);
          //console.log('errstr='+sendstr);
          event.sender.send('save-bookinfo-reply',sendstr);
      });
      
  
});

