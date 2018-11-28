
const tagWriter = require('browser-id3-writer');
const fs=require('fs');

//TIT2=标题 表示内容为这首歌的标题，下同
//TPE1=作者
//TALB=专集
//TRCK=音轨 格式：N/M 其中N为专集中的第N首，M为专集中共M首，N和M为ASCII码表示的数字
//TYER=年代 是用ASCII码表示的数字
//TCON=类型 直接用字符串表示

//songarr 网易返回的歌曲json数组(playlist和album取得的数组，不是歌曲ID得到的数组)

function savetags2mp3(songarr,cover,ofile,dfile){
    songbuffer=fs.readFileSync(mp3file);
    coverbuffer=fs.readFileSync(cover);
    title=songarr['name'];
    aritsts=songarr['ar'];
    var myar=new Array()
    for(i=0;i<artists.length;i++){
        myar[i]=artists[i]['name'];
    }
    album=songarr['al']['name']
    var songwriter=new tagwriter(songbuffer);

    songwriter.setFrame('TIT2', title)
      .setFrame('TPE1', myar)
      .setFrame('TALB', album)
      .setFrame('APIC', {
          type: 3,
          data: coverBuffer,
          description: ''
      });
    songwriter.addTag();

    var taggedSongBuffer = Buffer.from(writer.arrayBuffer);
    fs.writeFileSync(dfile, taggedSongBuffer);

}