import { Context } from 'koishi'
import WebSocket from 'ws'
import axios from 'axios';


export function pushAdministFunction(axios, getInfo: { endPointSatori: string; administratorId: any; tokenSatori: any; guildId: any; defaultServerListen: any; }, getmessage) {  //管理员推送事件处理函数
  const pushurl = getInfo.endPointSatori;
  const channel_id = 'private:' + getInfo.administratorId;
  const token = 'Bearer ' + getInfo.tokenSatori;

  let pushmessage = {
    "channel_id": channel_id,
    "content": getmessage
  };

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': token
  };
  axios.post(pushurl, pushmessage, { headers });
}

export function pushFunction(axios, getInfo, getmessage) {  //普通推送事件处理函数
  const pushurl = getInfo.endPointSatori;
  const token = 'Bearer ' + getInfo.tokenSatori;

  getInfo.guildId.forEach((Element: string) => {
    let pushmessage = {
      "channel_id": Element,
      "content": getmessage
    };

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': token
    };

    axios.post(pushurl, pushmessage, { headers })
  });
}
export function getNowDate() {  //获取当前时间
  let date = new Date();
  let nowDate = new Intl.DateTimeFormat('zh-CN', {
    dateStyle: 'full',
    timeStyle: 'full',
    timeZone: 'Asia/shanghai',
  }).format(date)

  return nowDate;
}



export const AdventurePlugin = (ctx: Context, getInfo: { endPointSatori: string; administratorId: any; tokenSatori: any; functionList: any; guildId: any; defaultServerListen: any; }) => {  //监听函数 
  // WebSocket连接配置
  const wsUrl = 'wss://socket.nicemoe.cn';
  const ws = new WebSocket(wsUrl);
  const functionList = getInfo.functionList;
  //console.log(functionList);


  ws.on('open', () => {  //连接成功
    let nowDate = getNowDate();
    console.log('WebSocket connection');
    let getmessage = `连接成功 \n` +
      `开服监控：${functionList.includes('开服监控')}\n` +
      `新闻资讯：${functionList.includes('新闻资讯')}\n` +
      `游戏更新：${functionList.includes('游戏更新')}\n` +
      `贴吧速报：${functionList.includes('贴吧速报')}\n` +
      `关隘预告：${functionList.includes('关隘预告')}\n` +
      `云从预告：${functionList.includes('云从预告')}\n` +
      `${nowDate}`;
    pushAdministFunction(axios, getInfo, getmessage);  //当连接成功时调用（向管理员账户发送信息）
    pushFunction(axios, getInfo, "1");
  });

  ws.on('message', (data) => {
    const message = JSON.parse(data.toString());
    handleAdventureMessage(ctx, message, getInfo);
  });

  ws.on('close', () => {  //断开连接
    let nowDate = getNowDate();
    console.log('WebSocket connection closed');
    let getmessage = `连接断开 \n${nowDate}`;
    pushAdministFunction(axios, getInfo, getmessage);  //当断开连接时调用（向管理员账户发送信息）
    setTimeout(pushAdministFunction, 5000);     //处理重连逻辑，如果需要的话 

  });

  ws.on('error', (error) => {  //连接错误
    let nowDate = getNowDate();
    console.error('WebSocket error:', error);
    let getmessage = `连接错误 \n${nowDate}`;
    pushAdministFunction(axios, getInfo, getmessage);  //当连接错误时调用（向管理员账户发送信息） 
    // 处理错误逻辑  
  });

  function handleAdventureMessage(ctx: Context, message: any, getInfo: { endPointSatori: string; administratorId: any; functionList: any, tokenSatori: any; guildId: any; defaultServerListen: any; }) {  //message事件处理函数
    const serverStatus: Record<string, number> = {};  //定义对象存放开服维护信息（开服监控API）
    if (message.action === 2001) {  //开服监控
      const { server, status } = message.data;
      serverStatus[server] = status;
      let nowDate = getNowDate();
      let getmessage = `服务器 ${server} 的状态已更新为 ${status ? '开服' : '维护'}\n${nowDate}`;

      const pushurl = getInfo.endPointSatori;
      const token = 'Bearer ' + getInfo.tokenSatori;
      if (functionList.includes('开服监控')) {
        getInfo.guildId.forEach((Element: string, index) => {
          let pushmessage = {
            "channel_id": Element,
            "content": getmessage
          };

          const headers = {
            'Content-Type': 'application/json',
            'Authorization': token
          };

          if (getInfo.defaultServerListen[index] === server) {
            axios.post(pushurl, pushmessage, { headers })
          }
        });
      }
    }

    if (message.action === 2002) {  //新闻资讯
      const { type, title, url, date } = message.data;
      let getmessage = `新闻资讯：${title}\n详情链接：${url}\n发布日期：${date}`;
      if (functionList.includes('新闻资讯')) {
        pushFunction(axios, getInfo, getmessage);  //当action2002时，向用户端推送 新闻资讯 消息 
      }


    }

    if (message.action === 2003) {  //游戏更新
      const { now_version, new_version, package_num, package_size } = message.data;
      let nowDate = getNowDate();
      let getmessage = `客户端版本已更新！\n旧版本：${now_version}\n新版本：${new_version}\n更新包数量：${package_num}\n更新包大小：${package_size}\n${nowDate}`;
      if (functionList.includes('游戏更新')) {
        pushFunction(axios, getInfo, getmessage);  //当action2003时，向用户端推送 更新 消息
      }


    }

    if (message.action === 2004) {  //八卦速报
      const { subclass, server, name, title, url, date } = message.data;
      let getmessage = `百度贴吧818速报：\n子类：${subclass}\n服务器：${server}\n版块：${name}\n标题：${title}\n链接：${url}\n日期：${date}`;
      if (functionList.includes('贴吧速报')) {
        pushFunction(axios, getInfo, getmessage);  //当action2004时，向用户端推送 818 消息  
      }
    }
  }

  // 可以在此添加其他Koishi事件处理逻辑 

}


