const electron = require('electron')
const { app, BrowserWindow } = require('electron')
const ipc = require('electron').ipcMain;
const fs=require('fs')
const spawn = require('child_process').spawn;



  
  function createWindow () {  
    electron.Menu.setApplicationMenu(null)    //hide electron Menu

    win = new BrowserWindow({ width: 1024, height:760 })
    //win.openDevTools();

      win.loadURL(__dirname + '/htmls/default.html')
  }
  
  app.on('ready', createWindow);

  //listening the channel create a new book and write info to json
  ipc.on('new-bookinfo',function(event,arg) {
   
    runpath=process.cwd()+"\\scripts\\bookinfo.js";
    argstr=arg.join("**");
    var sendstr="OK";

    const ls = spawn('node', [runpath,1,argstr]);
      ls.stdout.on('data', (data) => {
        console.log(`${data}`);
        datastr=data.toString();
        if(datastr.indexOf('ERROR 9999:')>-1){
          sendstr=datastr;
        }
      });

      ls.stderr.on('data', (data) => {
         sendstr=data;
      });

      ls.on('close', (code) => {
           event.sender.send('save-bookinfo-reply',sendstr);
      });
      
  
});

