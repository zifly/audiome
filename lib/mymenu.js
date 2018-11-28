function createMyMenu(idstr){

let txtEditor = document.getElementById(idstr); //获得TextArea文本框的引用 
document.title = "Netease Music DownLoader"; //设置文档标题，影响窗口标题栏名称 //给文本框增加右键菜单 
const contextMenuTemplate=[ { role: 'undo' }, //Undo菜单项
 { role: '播放' }, //Redo菜单项
  { role: '从这里开始播放' }, //分隔线
  { type: 'separator' }, //分隔线
   { role: 'cut' }, //Cut菜单项 
   { role: 'copy' }, //Copy菜单项 
   { role: 'paste' }, //Paste菜单项 
   { role: 'delete' }, //Delete菜单项
    { type: 'separator' }, //分隔线
     { role: 'selectall' } //Select All菜单项 
    ]; 
    const contextMenu=Menu.buildFromTemplate(contextMenuTemplate); 
    txtEditor.addEventListener('contextmenu', (e)=>{ 
        e.preventDefault(); contextMenu.popup(remote.getCurrentWindow()); 
    }); 
}