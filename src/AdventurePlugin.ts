import { Context } from 'koishi'
import WebSocket from 'ws'
import axios from 'axios';
import * as getApi from './api'; //导入剑网三API地址，name:getApi

let existingConnection: WebSocket | null = null; //全局控制WS连接

export async function getSaoHua() {  //获取“剑三随机数”
  try {
    const response = await axios.get(getApi.JX3_Saohua_API_URL);

    if (response.data.code === 200) {
      return response.data.data.text;
    } else {
      return '无法获取骚话。';
    }

  } catch (error) {
    console.error(error);
    return '发生错误，请稍后再试。';
  }
}


export async function pushAdministFunction(axios, ctx: Context, getmessage) {  //管理员推送事件处理函数
  //START 读取数据库并赋值
  const endPointSatori_ = await ctx.database.get('jx3推送', [0], ['endPointSatori'])  //Satori接口地址
  const endPointSatori = endPointSatori_[0].endPointSatori
  const administratorId_ = await ctx.database.get('jx3推送', [0], ['administratorId'])  //管理员ID，即QQ号
  const administratorId = administratorId_[0].administratorId
  const tokenSatori_ = await ctx.database.get('jx3推送', [0], ['tokenSatori'])  //Satori鉴权令牌
  const tokenSatori = tokenSatori_[0].tokenSatori
  // const functionList_ = await ctx.database.get('jx3推送', [0], ['functionList'])  //功能列表
  // const functionList = functionList_[0].functionList
  // const guildId_ = await ctx.database.get('jx3推送', [0], ['guildId'])  //频道ID，即QQ群号
  // const guildId = guildId_[0].guildId
  // const defaultServerListen_ = await ctx.database.get('jx3推送', [0], ['defaultServerListen'])  //QQ群对应默认区服
  // const defaultServerListen = defaultServerListen_[0].defaultServerListen
  //END 读取数据库并赋值

  const pushurl = endPointSatori;
  const channel_id = 'private:' + administratorId;
  const token = 'Bearer ' + tokenSatori;

  let pushmessage = {
    "channel_id": channel_id,
    "content": `${getmessage}\n\n${await getSaoHua()}`
  };

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': token
  };
  axios.post(pushurl, pushmessage, { headers });
}

export async function pushFunction(axios, ctx: Context, getmessage) {  //普通推送事件处理函数
  //START 读取数据库并赋值
  const endPointSatori_ = await ctx.database.get('jx3推送', [0], ['endPointSatori'])  //Satori接口地址
  const endPointSatori = endPointSatori_[0].endPointSatori
  // const administratorId_ = await ctx.database.get('jx3推送', [0], ['administratorId'])  //管理员ID，即QQ号
  // const administratorId = administratorId_[0].administratorId
  const tokenSatori_ = await ctx.database.get('jx3推送', [0], ['tokenSatori'])  //Satori鉴权令牌
  const tokenSatori = tokenSatori_[0].tokenSatori
  // const functionList_ = await ctx.database.get('jx3推送', [0], ['functionList'])  //功能列表
  // const functionList = functionList_[0].functionList
  const guildId_ = await ctx.database.get('jx3推送', [0], ['guildId'])  //频道ID，即QQ群号
  const guildId = guildId_[0].guildId
  // const defaultServerListen_ = await ctx.database.get('jx3推送', [0], ['defaultServerListen'])  //QQ群对应默认区服
  // const defaultServerListen = defaultServerListen_[0].defaultServerListen
  //END 读取数据库并赋值
  const pushurl = endPointSatori;
  const token = 'Bearer ' + tokenSatori;

  guildId.forEach(async (Element: string) => {
    let pushmessage = {
      "channel_id": Element,
      "content": `${getmessage}\n\n${await getSaoHua()}`
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

export async function handleAdventureMessage(ctx: Context, message: any) {  //message事件处理函数
  //START 读取数据库并赋值
  const endPointSatori_ = await ctx.database.get('jx3推送', [0], ['endPointSatori'])  //Satori接口地址
  const endPointSatori = endPointSatori_[0].endPointSatori
  // const administratorId_ = await ctx.database.get('jx3推送', [0], ['administratorId'])  //管理员ID，即QQ号
  // const administratorId = administratorId_[0].administratorId
  const tokenSatori_ = await ctx.database.get('jx3推送', [0], ['tokenSatori'])  //Satori鉴权令牌
  const tokenSatori = tokenSatori_[0].tokenSatori
  const functionList_ = await ctx.database.get('jx3推送', [0], ['functionList'])  //功能列表
  const functionList = functionList_[0].functionList
  const guildId_ = await ctx.database.get('jx3推送', [0], ['guildId'])  //频道ID，即QQ群号
  const guildId = guildId_[0].guildId
  const defaultServerListen_ = await ctx.database.get('jx3推送', [0], ['defaultServerListen'])  //QQ群对应默认区服
  const defaultServerListen = defaultServerListen_[0].defaultServerListen
  //END 读取数据库并赋值


  if (message.action === 2001) {  //开服监控
    const { server, status } = message.data;
    let nowDate = getNowDate();
    let getmessage = `服务器 ${server} 的状态已更新为 ${status ? '开服' : '维护'}\n${nowDate}`;

    const pushurl = endPointSatori;
    const token = 'Bearer ' + tokenSatori;
    if (functionList.includes('开服监控')) {
      guildId.forEach(async (Element: string, index) => {
        let pushmessage = {
          "channel_id": Element,
          "content": `${getmessage}\n\n${await getSaoHua()}`
        };

        const headers = {
          'Content-Type': 'application/json',
          'Authorization': token
        };

        if (defaultServerListen[index] === server) {
          axios.post(pushurl, pushmessage, { headers })
        }
      });
    }
  }

  if (message.action === 2002) {  //新闻资讯
    const { type, title, url, date } = message.data;
    let getmessage = `新闻资讯：${title}\n详情链接：${url}\n发布日期：${date}`;
    if (functionList.includes('新闻资讯')) {
      pushFunction(axios, ctx, getmessage);  //当action2002时，向用户端推送 新闻资讯 消息 
    }


  }

  if (message.action === 2003) {  //游戏更新
    const { now_version, new_version, package_num, package_size } = message.data;
    let nowDate = getNowDate();
    let getmessage = `客户端版本已更新！\n旧版本：${now_version}\n新版本：${new_version}\n更新包数量：${package_num}\n更新包大小：${package_size}\n${nowDate}`;
    if (functionList.includes('游戏更新')) {
      pushFunction(axios, ctx, getmessage);  //当action2003时，向用户端推送 更新 消息
    }


  }

  if (message.action === 2004) {  //八卦速报
    const { subclass, server, name, title, url, date } = message.data;
    let getmessage = `百度贴吧818速报：\n子类：${subclass}\n服务器：${server}\n版块：${name}\n标题：${title}\n链接：${url}\n日期：${date}`;
    if (functionList.includes('贴吧速报')) {
      pushFunction(axios, ctx, getmessage);  //当action2004时，向用户端推送 818 消息  
    }
  }
}

export async function transferAdventurePlugin(ctx: Context) {  //封装监听函数中转，控制断开
  if (existingConnection) {
    existingConnection.close(); // 关闭现有的连接 
    existingConnection = null;
  }

  try {
    existingConnection = await AdventurePlugin(ctx); // 创建新的连接并保存引用 
  } catch (error) {
    console.error('Failed to create WebSocket connection:', error);
  }

}

export const AdventurePlugin = async (ctx: Context): Promise<WebSocket> => {  //监听函数 
  //START 读取数据库并赋值
  // const endPointSatori_ = await ctx.database.get('jx3推送', [0], ['endPointSatori'])  //Satori接口地址
  // const endPointSatori = endPointSatori_[0].endPointSatori
  // const administratorId_ = await ctx.database.get('jx3推送', [0], ['administratorId'])  //管理员ID，即QQ号
  // const administratorId = administratorId_[0].administratorId
  // const tokenSatori_ = await ctx.database.get('jx3推送', [0], ['tokenSatori'])  //Satori鉴权令牌
  // const tokenSatori = tokenSatori_[0].tokenSatori
  const functionList_ = await ctx.database.get('jx3推送', [0], ['functionList'])  //功能列表
  const functionList = functionList_[0].functionList
  // const guildId_ = await ctx.database.get('jx3推送', [0], ['guildId'])  //频道ID，即QQ群号
  // const guildId = guildId_[0].guildId
  // const defaultServerListen_ = await ctx.database.get('jx3推送', [0], ['defaultServerListen'])  //QQ群对应默认区服
  // const defaultServerListen = defaultServerListen_[0].defaultServerListen
  // const enabledListen_ = await ctx.database.get('jx3推送', [0], ['enabledListen'])  //是否启用推送功能
  // const enabledListen = enabledListen_[0].enabledListen
  //END 读取数据库并赋值

  // WebSocket连接配置
  const wsUrl = getApi.JX3_webSocket_URL;
  const ws = new WebSocket(wsUrl);

  ws.on('open', async () => {  //连接成功
    const enabledListen_ = await ctx.database.get('jx3推送', [0], ['enabledListen'])  //是否启用推送功能
    const enabledListen = enabledListen_[0].enabledListen

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
    if (enabledListen) {
      pushAdministFunction(axios, ctx, getmessage);  //当连接成功时调用（向管理员账户发送信息）
    } else {
      ws.close();
    }

  });

  ws.on('message', async (data) => {
    const enabledListen_ = await ctx.database.get('jx3推送', [0], ['enabledListen'])  //是否启用推送功能
    const enabledListen = enabledListen_[0].enabledListen

    const message = JSON.parse(data.toString());

    if (enabledListen) {
      handleAdventureMessage(ctx, message);
    } else {
      ws.close();
    }

  });

  ws.on('close', () => {  //断开连接
    let nowDate = getNowDate();
    console.log('WebSocket connection closed');
    let getmessage = `连接断开 \n${nowDate}`;
    pushAdministFunction(axios, ctx, getmessage);
    //setTimeout(transferAdventurePlugin, 5000);     //处理重连逻辑，如果需要的话
  });

  ws.on('error', (error) => {  //连接错误
    let nowDate = getNowDate();
    console.error('WebSocket error:', error);
    let getmessage = `连接错误 \n${nowDate}`;
    pushAdministFunction(axios, ctx, getmessage);  //当连接错误时调用（向管理员账户发送信息） 
    // 处理错误逻辑  
  });

  return ws;


}


