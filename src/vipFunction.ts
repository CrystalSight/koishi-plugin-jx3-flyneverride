import { $, Context, h } from 'koishi'
import axios from 'axios';
import * as getApi from './api'; //导入剑网三API地址，name:getApi

export const name = 'vipFunction'

export async function apply(ctx: Context) {

  //START 读取数据库并赋值
  const tokenMarket_= await ctx.database.get('jx3配置', [0], ['tokenMarket'])  //鉴权令牌
  const tokenMarket = tokenMarket_[0].tokenMarket
  const tokenDaily_= await ctx.database.get('jx3配置', [0], ['tokenDaily']) //推栏令牌
  const tokenDaily = tokenDaily_[0].tokenDaily
  const defaultServer_= await ctx.database.get('jx3配置', [0], ['defaultServer'])  //默认区服
  const defaultServer = defaultServer_[0].defaultServer
  //END 读取数据库并赋值

  ctx.command('行侠', '查询当前及后续行侠事件信息')  //查询当前及后续行侠事件信息
    .usage('查询当前及后续行侠事件信息')  
    .action(async ({ }) => {
      try {  
        const response = await axios.get(getApi.JX3_Celebrities_vipAPI_URL,{
          params:{
            "token": tokenMarket,
            "ticket": tokenDaily
          }
        });  
        const data = response.data;  
  
        if (data.code === 200) { 
          const xingxiaInfo = data.data;
          const message = `当前行侠事件：\n`+  //当前行侠，共6行显示
            `地图：${xingxiaInfo[0].map_name}\n`+  
            `事件名称：${xingxiaInfo[0].event}\n`+
            `${xingxiaInfo[0].desc}\n`+
            `位置：${xingxiaInfo[0].site}\n`+
            `开始时间：${xingxiaInfo[0].time}\n\n`+

            `后续行侠事件：\n`+  //接下来行侠，共6行显示
            `地图：${xingxiaInfo[1].map_name}\n`+
            `事件名称：${xingxiaInfo[1].event}\n`+
            `${xingxiaInfo[1].desc}\n`+
            `位置：${xingxiaInfo[1].site}\n`+
            `开始时间：${xingxiaInfo[1].time}\n`;
          return message;  
        } else {  
          return `查询失败，错误代码：${data.code}，信息：${data.msg}`;  
        } 
      } catch (error) {  
        console.error(error);  
        return '查询行侠事件时出错，请稍后再试。';  
      }  


    
  });

  ctx.command('金价 [server]', '查询指定区服的金币比例信息')  //查询指定区服的金币比例信息
    .usage('查询指定区服的金币比例信息。例如：金价 天鹅坪')
    .option('server', '指定区服名称') 
    .action(async ({}, server) => {  
      try {  
        const response = await axios.get(getApi.JX3_Demon_vipAPI_URL,{
          params:{
            "token": tokenMarket,
            "ticket": tokenDaily
          }
        });  
        const data = response.data;  
  
        if (data.code === 200) {  
          // 如果没有指定区服名称，或者区服名称为空，则返回所有数据  
          if (!server) {  
            return demonMessage(data.data);  
          }  
          // 如果有指定区服名称，则筛选出对应区服的数据  
          const filteredData = data.data.filter((item: any) => item.server === server);  
          if (filteredData.length === 0) {  
            return `没有找到区服“${server}”的金币比例信息。`;  
          }  
          //筛选出相应区服
          return demonMessage(filteredData);  
        } else {  
          return `查询失败，错误代码：${data.code}，信息：${data.msg}`;  
        }  
      } catch (error) {  
        console.error(error);  
        return '查询金币比例时出错，请稍后再试。';  
      }  
    });
    
    ctx.command('阵法 <matrixName>', '查询指定心法的阵法效果')  //查询指定心法的阵法效果
    .usage('查询指定心法的阵法效果，例如：阵法 惊羽诀')  
    .option('matrixName', '指定心法名称，是心法！是心法！是心法！')
    .action(async ({}, matrixName) => {  
      try {  
        // 发起API请求获取心法阵法效果  
        const response = await axios.get(getApi.JX3_Matrix_vipAPI_URL, {  
          params: {
            "token": tokenMarket,
            "ticket": tokenDaily,
            "name": matrixName  //心法名称
          }  
        });  
    
        const data: any = response.data;  
        if (data.code === 200) {  
          const matrixData = data.data;  
          let message = `心法：${matrixData.name}\n` +  
                        `阵法：${matrixData.skillName}\n`;  
          // 遍历效果描述并添加到消息中  
          matrixData.descs.forEach((desc: any) => {  
            if (desc.desc !== "空") {  
              message += `\n${desc.name}：${desc.desc}`;  
            }  
          });  
          return message;  
        } else {  
          return `查询失败，错误代码：${data.code}，信息：${data.msg}`;  
        }  
      } catch (error) {  
        console.error(error);  
        return '查询阵法效果时出错，请稍后再试。';  
      }  
    });

    // ctx.command('日历', '推演未来活动日历')  //推演未来活动日历（图片）[采用自己的转图片方法，此指令停用保留]
    // .usage('推演未来活动日历')   
    // .action(async ({ }) => {   
    //   try {  
    //     const response = await axios.get(getApi.JX3_Calendar_vipAPI_URL,{ 
    //       params:{
    //         token: tokenMarket,
    //         ticket: tokenDaily,
    //         scale: 2,  //设置网页分辨率，越高越大
    //         num: 15,  //预测时间，目前调整没有区别
    //         robot: "https://api.jx3api.com",  //图片底部描述文本
    //         cache: 1  //设置缓存，1为开启，0为关闭
    //       } 
    //     });  
    
    //     const data: any = response.data;  
    //     if (data.code === 200) {  
    //       const imageUrl = data.data.url;  
    //       return (h('img', { src: imageUrl }));  //输出图片消息元素
    //     } else {  
    //       return `推演失败，错误代码：${data.code}，信息：${data.msg}`;  
    //     }  
    //   } catch (error) {  
    //     console.error(error);  
    //     return '推演活动日历时出错，请稍后再试。';  
    //   }  
    // });

    ctx.command('奇遇 <name> <server>', '查询指定角色的奇遇触发记录')  //查询指定玩家奇遇
    .usage('查询指定角色的奇遇触发记录，不保证遗漏，例如：奇遇 XX 天鹅坪')
    .option('name', '指定角色名称')   
    .option('server', '指定区服名称')   
    .action(async ({ }, name, server) => {  
      try {
        server = server ? server : defaultServer; 
        const response = await axios.post(getApi.JX3_Adventure_vipAPI_URL,{  
          server: server,  //区服名称
          name: name,  //角色名称
          scale: 2, // 设置网页分辨率,越高越大
          filter: 1,  //过滤无效的奇遇，1为开启，0为关闭
          robot: "https://api.jx3api.com",  //图片底部文本 
          token: tokenMarket,
          ticket: tokenDaily
        });  
    
        const data= response.data; 
        if (data.code === 200) {  
          return (h('img', { src: data.data.url }));  //输出图片消息元素
        } else {  
          return `查询失败，错误代码：${data.code}，信息：${data.msg}`;  
        }  
      } catch (error) {  
        console.error(error);  
        return '查询奇遇记录时出错，请稍后再试。';  
      }  
    });

    ctx.command('奇遇统计 [name] [server]', '查询指定奇遇触发统计信息')  //查询指定奇遇触发情况
    .usage('查询指定奇遇触发统计信息，例如：奇遇统计 阴阳两界 天鹅坪')  
    .option('server', '指定区服名称')  
    .option('name', '指定奇遇名称')  
    .action(async ({ }, name, server) => {         
      try { 
        server = server ? server : defaultServer;  
        const response = await axios.post(getApi.JX3_Statistical_vipAPI_URL, {    
            server,  //区服名称 
            name,  //奇遇名称  
            scale:2,  // 设置网页分辨率,越高越大
            robot:'https://api.jx3api.com',  //图片底部文本 
            token: tokenMarket, 
            //ticket: tokenDaily
        });  
    
        const data = response.data;  
        if (data.code === 200) {  
          return (h('img', { src: data.data.url }));  //输出图片消息元素
        } else {  
          return `查询失败，错误代码：${data.code}，信息：${data.msg}`;  
        }  
      } catch (error) {  
        return '查询奇遇触发统计时出错，请稍后再试。';  
      }  
    });

    ctx.command('区服奇遇 <server>', '查询指定区服奇遇触发情况')  //查询指定区服奇遇触发情况
    .usage('查询指定区服奇遇触发情况，例如：区服奇遇 长安城')  
    .option('server', '指定区服名称')  
    .action(async ({ }, server) => {  
      try {    
        server = server ? server : defaultServer;     
        const response = await axios.post(getApi.JX3_Collect_vipAPI_URL, {  
          scale: 2, // 设置网页分辨率，根据需求调整  
          server, // 区服名称  
          robot: 'https://api.jx3api.com', //图片底部文本 
          cache: 1, // 开启缓存  
          token: tokenMarket, // 站点标识   
        });  
 
        const data: any = response.data;  
        if (data.code === 200) { 
          return (h('img', { src: data.data.url }));  //输出图片消息元素
        } else {  
          return `查询失败，错误代码：${data.code}，信息：${data.msg}`;  
        }  
      } catch (error) {  
        console.error(error);  
        return '查询奇遇触发统计时出错，请稍后再试。';  
      }  
    });  

    ctx.command('全服奇遇 <name>', '查询全服奇遇触发情况')  //查询全服奇遇触发情况
    .usage('查询全服奇遇触发情况，例如：全服奇遇 阴阳两界')  
    .option('name', '指定奇遇名称')  
    .action(async ({ }, name) => {  
      try {    
        const response = await axios.post(getApi.JX3_allStatistical_vipAPI_URL,{
          scale: 2, // 设置网页分辨率，越大越高 
          name, // 奇遇名称  
          robot: 'https://api.jx3api.com', //图片底部文本 
          token: tokenMarket, // 站点标识  
        });  
  
        const data: any = response.data;  
        if (data.code === 200) {  
          console.log(data.data.url); 
          return (h('img', { src: data.data.url }));  //输出图片消息元素 
        } else {  
          return `查询失败，错误代码：${data.code}，信息：${data.msg}`;  
        }  
      } catch (error) {  
        console.error(error);  
        return '查询全服奇遇触发统计时出错，请稍后再试。';  
      }  
    });  

    ctx.command('战绩 [name] [mode] [server]', '查询指定角色JJC战绩')  //查询指定角色JJC战绩
    .usage('查询指定角色JJC战绩，例如：战绩 XXX 33 梦江南') 
    .option('name', '指定角色名称')  
    .option('mode', '指定模式 55,33,22') 
    .option('server', '指定区服名称')  
    .action(async ({ }, name, mode, server) => {  
      try {  
        server = server ? server : defaultServer;   
        const response = await axios.post(getApi.JX3_Recent_vipAPI_URL,{
          scale: 2, // 设置网页分辨率  
          server, // 区服名称  
          name, // 角色名称  
          mode, // 比赛模式  
          robot: 'https://api.jx3api.com', // 描述文本  
          token: tokenMarket,
          ticket: tokenDaily  
        });  
  
        // 处理响应数据  
        const data: any = response.data;  
        if (data.code === 200) {  
          return (h('img', { src: data.data.url }));  //输出图片消息元素  
        } else if (data.code === 404) {  
          return `未找到角色${name}在${server}区服的战绩记录。`;  
        } else {  
          return `查询失败，错误代码：${data.code}，信息：${data.msg}`;  
        }  
      } catch (error) {  
        console.error(error);  
        return '查询角色近期战绩记录时出错，请稍后再试。';  
      }  
    }); 
    
    ctx.command('全服战绩 <mode>', '查询全服JJC排行榜')  //查询全服JJC排行榜
    .usage('查询全服JJC排行榜，例如：全服战绩 33')
    .option('mode', '指定模式 55,33,22')  
    .action(async ({ }, mode) => {  
      try {  
        const response = await axios.post(getApi.JX3_Awesome_vipAPI_URL, {  
          scale: 2, // 设置网页分辨率  
          mode,  
          robot: 'https://api.jx3api.com', // 描述文本  
          cache: 1,  //开启缓存
          token: tokenMarket,
          ticket: tokenDaily  
        });  
    
        const data: any = response.data;  
        if (data.code === 200) {  
          return (h('img', { src: data.data.url }));  //输出图片消息元素
        } else {  
          return `查询失败，错误代码：${data.code}，信息：${data.msg}`;  
        }  
      } catch (error) {  
        console.error(error);  
        return '查询战绩记录时出错，请稍后再试。';  
      }  
    });

    ctx.command('门派排行 <mode>', '查询门派JJC排行榜')  //查询门派JJC排行榜
    .usage('查询门派JJC排行榜，例如：门派排行 33')
    .option('mode', '指定模式 55,33,22')  
    .action(async ({ }, mode) => {  
      try {  
        const response = await axios.post(getApi.JX3_Schools_vipAPI_URL, { 
          scale: 2, // 设置网页分辨率  
          mode,  
          robot: 'https://api.jx3api.com', // 描述文本  
          cache: 1,  //开启缓存
          token: tokenMarket,
          ticket: tokenDaily  
        });  
    
        const data: any = response.data;  
        if (data.code === 200) {  
          return (h('img', { src: data.data.url }));  //输出图片消息元素
        } else {  
          return `查询失败，错误代码：${data.code}，信息：${data.msg}`;  
        }  
      } catch (error) {  
        console.error(error);  
        return '查询门派排行时出错，请稍后再试。';  
      }  
    });

    ctx.command('招募 <keyword> [server]', '查询团队招募信息')  //查询团队招募信息
    .usage('查询团队招募信息，支持模糊搜索，例如：招募 九老洞')
    .option('server', '指定查询区服')
    .option('name', '指定副本名称')  
    .action(async ({ }, keyword, server) => {  
      try { 
        server = server ? server : defaultServer;  
        const response = await axios.post(getApi.JX3_Recruit_vipAPI_URL, { 
          scale: 2, // 设置网页分辨率 
          server, 
          keyword,  
          robot: 'https://api.jx3api.com', //图片底部文本
          cache: 1,  //开启缓存
          token: tokenMarket,
          ticket: tokenDaily  
        });  
    
        const data: any = response.data; 
        if (data.code === 200) {  
          return (h('img', { src: data.data.url }));  //输出图片消息元素
        } else if(data.code === 404){  
          return `当前无“${keyword}”的招募`;  
        } else{
          return `查询失败，错误代码：${data.code}，信息：${data.msg}`;  
        }
      } catch (error) {  
        console.error(error);  
        return '查询招募时出错，请稍后再试。';  
      }  
    });

    //留个位置：查询动画编辑器物品编号
    //留个位置：查询动画编辑器物品编号

    //留个位置：查询客户端战功榜与风云录
    //留个位置：查询客户端战功榜与风云录

    //留个位置：查询角色详细信息
    //留个位置：查询角色详细信息

    ctx.command('成就 <role> <name> [server]', '查询角色成就进度')  //查询角色成就进度
    .usage('查询查询角色成就进度，例如：成就 XXX 阅历 天鹅坪')
    .option('role', '指定角色名称')
    .option('name', '指定成就名称/类型，例：“阅历” “技艺神农” “家园总览”……') 
    .option('server', '指定查询区服，与默认区服相同即可省略') 
    .action(async ({ }, role, name, server) => {  
      try { 
        server = server ? server : defaultServer;  
        name = name ? name : ''; 
        const response = await axios.post(getApi.JX3_Achievement_vipAPI_URL, { 
          scale: 2, // 设置网页分辨率 
          server, 
          role,
          name,  
          robot: 'https://api.jx3api.com', //图片底部文本
          cache: 1,  //开启缓存
          token: tokenMarket,
          ticket: tokenDaily  
        });  
    
        const data: any = response.data; 
        if (data.code === 200) {  
          return (h('img', { src: data.data.url }));  //输出图片消息元素
        } else{
          return `查询失败，错误代码：${data.code}，信息：${data.msg}`;  
        }
      } catch (error) {  
        console.error(error);  
        return '查询成就时出错，请稍后再试。';  
      }  
    });

    ctx.command('属性 <name> [server]', '查询角色装备属性')  //查询角色装备属性
    .usage('查询角色装备属性，例如：属性 XXX 天鹅坪')
    .option('name', '指定角色名称') 
    .option('server', '指定查询区服，与默认区服相同即可省略') 
    .action(async ({ }, name, server) => {  
      try { 
        server = server ? server : defaultServer;  
        const response = await axios.post(getApi.JX3_Attribute_vipAPI_URL, { 
          scale: 2, // 设置网页分辨率 
          server, 
          name,  
          robot: 'https://api.jx3api.com', //图片底部文本
          cache: 1,  //开启缓存
          token: tokenMarket,
          ticket: tokenDaily  
        });  
    
        const data: any = response.data; 
        if (data.code === 200) {  
          return (h('img', { src: data.data.url }));  //输出图片消息元素
        } else{
          return `查询失败，错误代码：${data.code}，信息：${data.msg}`;  
        }
      } catch (error) {  
        console.error(error);  
        return '查询属性时出错，请稍后再试。';  
      }  
    });

    //留个位置：自动更新角色信息
    //留个位置：自动更新角色信息

    // ctx.command('资历 <school> [server]', '查询游戏资历榜单')  //查询游戏资历榜单,404no such service as /view/school/seniority
    // .usage('查询游戏资历榜单，例如：资历 XXX 天鹅坪')
    // .option('name', '指定门派名称') 
    // .option('server', '指定查询区服') 
    // .action(async ({ }, school, server) => {  
    //   try { 
    //     server = server ? server : defaultServer;  
    //     const response = await axios.post(getApi.JX3_Seniority_vipAPI_URL, { 
    //       scale: 2, // 设置网页分辨率 
    //       school, 
    //       server,  
    //       robot: 'https://api.jx3api.com', //图片底部文本
    //       cache: 1,  //开启缓存
    //       token: tokenMarket,
    //       ticket: tokenDaily  
    //     });  
    
    //     const data: any = response.data; 
    //     if (data.code === 200) {  
    //       return (h('img', { src: data.data.url }));  //输出图片消息元素
    //     } else{
    //       return `查询失败，错误代码：${data.code}，信息：${data.msg}`;  
    //     }
    //   } catch (error) {  
    //     console.error(error);  
    //     return '查询资历榜单时出错，请稍后再试。';  
    //   }  
    // });

    ctx.command('奇穴 [name]', '查询指定心法奇穴详细效果')  //查询指定心法奇穴详细效果
    .usage('查询指定心法奇穴详细效果，例如：奇穴 冰心诀')  
    .option('name', '指定心法名称')  
    .action(async ({session }, name) => {  
      try {  
        const response = await axios.post(getApi.JX3_Force_vipAPI_URL, {  
          name, // 心法名称  
          token: tokenMarket, // 站点标识，检查请求权限  
        });  
    
        const data: any = response.data;  
        if (data.code === 200) { 
          let message = `奇穴总览 - ${name}:\n`;  
          data.data.forEach((levelData: any) => {  
            message += `\n${levelData.level} 层:\n`;  
            levelData.data.forEach((skill: any) => {  
              message += `${skill.name}\n`;  
            });  
          }); 
          await session.send(`${message}\n请在30秒内输入以继续：\n输入层数以详细查看\n输入ALL全部展示\n输入0退出查看`)  //粗略展示名称 
          const promptNum = await session.prompt(30000)  //等待用户反馈
          if (promptNum === undefined || promptNum === '0') {  //超时或退出
            return '已退出查看'
          } else if(promptNum === 'ALL'){  //浏览全部，虽然会刷屏，但得做出来
            let message = `奇穴效果 - ${name}:\n`;  
            data.data.forEach((levelData: any) => {  
              message += `\n${levelData.level} 层:\n`;  
              levelData.data.forEach((skill: any) => {  
                message += `${skill.name} - ${skill.desc}\n`;  
              });  
            });  
            return message; 
          } else {
            let levelData = data.data;
            let message = `奇穴效果 - ${name} ${levelData[parseInt(promptNum, 10) - 1].level} 层:\n`;  //浏览指定层数
            levelData[promptNum].data.forEach((skill: any) => {  
              message += `※ ${skill.name} - ${skill.desc}\n`;  
            });  
            return message;
          } 
        } else if (data.code === 404) {  
          return `未收录该心法：${name}`;  
        } else {  
          return `查询失败，错误代码：${data.code}，信息：${data.msg}`;  
        }  
      } catch (error) {  
        console.error(error);  
        return '查询奇穴效果时出错，请稍后再试。';  
      }  
    });

    ctx.command('技能 [name]', '查询指定心法技能详细效果')  //查询指定心法技能详细效果
    .usage('查询指定心法技能详细效果，例如：技能 冰心诀')  
    .option('name', '指定心法名称')  
    .action(async ({session }, name) => {  
      try {  
        const response = await axios.post(getApi.JX3_Skills_vipAPI_URL, {  
          name, // 心法名称  
          token: tokenMarket, // 站点标识，检查请求权限  
        });  
    
        const data: any = response.data;  
        if (data.code === 200) { 
          let message = `技能总览 - ${name}:\n`;  
          data.data.forEach((classData: any) => {  
            message += `\n※${classData.class}:\n`;  
            classData.data.forEach((skill: any) => {  
              message += `${skill.name} - ${skill.specialDesc}\n`;  
            });  
          });
          await session.send(`${message}\n请在30秒内输入以继续：\n输入技能全称以详细查看\n输入0退出查看`)  //粗略展示名称 
          const skillName = await session.prompt(30000)  //等待用户反馈
          if (skillName === undefined || skillName === '0') {  //超时或退出
            return '已退出查看'
          } else {  //浏览指定技能
            let message = '查询错误';  //防止有人调皮乱写技能，默认报错文本
            let icon = 'https://icon.jx3box.com/icon/109.png';   //剑三魔盒随便搞来的小表情用于报错
            data.data.forEach((classData: any) => {  
              classData.data.forEach((skill: any) => {
                if(skill.name === skillName){
                  icon = skill.icon;
                  message = `${skill.name}:\n`+
                            `※简介：${skill.simpleDesc}\n`+
                            `※详情：${skill.desc}\n`+
                            `※调息时间：${skill.interval}\n`+
                            `※消耗：${skill.consumption}\n`+
                            `※距离：${skill.distance}\n`+
                            `※读条时间：${skill.releaseType}\n`+
                            `※武器类型：${skill.weapon}\n`
                }   
              });  
            });
            return(h('p',h('img', { src:icon}),message)) ;
          } 
        } else if (data.code === 404) {  
          return `未收录该心法：${name}`;  
        } else {  
          return `查询失败，错误代码：${data.code}，信息：${data.msg}`;  
        }  
      } catch (error) {  
        console.error(error);  
        return '查询技能效果时出错，请稍后再试。';  
      }  
    });

    ctx.command('沙盘 [server]', '查看阵营沙盘信息')  //查看阵营沙盘信息
    .usage('查看阵营沙盘信息，例如：沙盘 天鹅坪')
    .option('server', '指定查询区服，与默认区服相同即可省略') 
    .action(async ({ }, server) => {  
      try { 
        server = server ? server : defaultServer;  
        const response = await axios.post(getApi.JX3_Sand_vipAPI_URL, { 
          scale: 2, // 设置网页分辨率 
          server, 
          robot: 'https://api.jx3api.com', //图片底部文本
          cache: 1,  //开启缓存
          //desc: '',  //广告位招租ing
          token: tokenMarket,
          ticket: tokenDaily  
        });  
    
        const data: any = response.data; 
        if (data.code === 200) {  
          return (h('img', { src: data.data.url }));  //输出图片消息元素
        } else{
          return `查询失败，错误代码：${data.code}，信息：${data.msg}`;  
        }
      } catch (error) {  
        console.error(error);  
        return '查询沙盘时出错，请稍后再试。';  
      }  
    });

    ctx.command('阵营', '查看全服阵营大事件')  //查看全服阵营大事件,不知道干啥的，先留着吧
    .usage('查看全服阵营大事件')
    .action(async ({ }) => { 
      try { 
        const response = await axios.post(getApi.JX3_Event_vipAPI_URL, { 
          scale: 2, // 设置网页分辨率 
          robot: 'https://api.jx3api.com', //图片底部文本
          cache: 1,  //开启缓存
          token: tokenMarket,
          ticket: tokenDaily  
        });  
    
        const data: any = response.data; 
        if (data.code === 200) {  
          return (h('img', { src: data.data.url }));  //输出图片消息元素
        } else{
          return `查询失败，错误代码：${data.code}，信息：${data.msg}`;  
        }
      } catch (error) {  
        console.error(error);  
        return '查询沙盘时出错，请稍后再试。';  
      }  
    });

    ctx.command('猪饿', '查询诛恶事件历史记录')  //查询诛恶事件历史记录，改代码的不要轮询！不要轮询！不要轮询！
    .usage('查询诛恶事件历史记录，就是猪饿，我故意的(乐')   
    .action(async ({ }) => {  
      try {  
        const response = await axios.post(getApi.JX3_Antivice_vipAPI_URL, {  
          token: tokenMarket, // 站点标识，检查请求权限  
        });  
    
        const data: any = response.data;  
        if (data.code === 200) { 
          let message = `诛恶历史记录:\n`;  
          data.data.forEach((zhuData: any) => {
            let timeNow = convertUnixTime(zhuData.time);
            message += `\n${zhuData.zone} - ${zhuData.server} - ${zhuData.map_name}\n${timeNow}\n`;    
          }); 
          return message;
        } else {  
          return `查询失败，错误代码：${data.code}，信息：${data.msg}`;  
        }  
      } catch (error) {  
        console.error(error);  
        return '查询诛恶时出错，请稍后再试。';  
      }  
    });

    ctx.command('烂柯山', '查询烂柯山首领状态')  //查询烂柯山首领状态
    .usage('查询烂柯山首领状态')   
    .action(async ({ }) => {  
      try {  
        const response = await axios.post(getApi.JX3_Leader_vipAPI_URL, {  
          token: tokenMarket, // 站点标识，检查请求权限  
        });  
    
        const data: any = response.data;  
        if (data.code === 200) { 
          let message = `烂柯山实况:\n`;  
          data.data.forEach((serverData: any) => {
            message += `\n※${serverData.server}\n`;
            serverData.data.forEach((bossData: any) => {
              let strTime = convertUnixTimeMini(bossData.start_time);
              let endTime = bossData.end_time === 0 ? "" : `~ ${convertUnixTimeMini(bossData.end_time)}`;
              message += `${bossData.castle} - ${bossData.camp_name} - ${bossData.str_status}\n时间：${strTime} ${endTime}\n`;
            });    
          }); 
          return message;
        } else {   
          return `查询失败，错误代码：${data.code}，信息：${data.msg}`;  
        }  
      } catch (error) {  
        console.error(error);  
        return '查询烂柯山实况时出错，请稍后再试。';  
      }  
    });

    ctx.command('贴吧 [server]', '随机搜索贴吧')  //随机搜索贴吧
    .usage('随机搜索贴吧')
    .option('server', '筛选区服，不提供默认不筛选')   
    .action(async ({ session }, server) => {  
      try {
        const tiebaType = ['818', '616', '鬼网三', '鬼网3', '树洞', '记录', '教程', '街拍', '故事', '避雷', '吐槽', '提问']
        let typeMessage = '';
        tiebaType.forEach((tiebaType: string, index:number) =>{
          typeMessage += `${index+1}. ${tiebaType}\n`
        })
        await session.send(`※输入想看帖子类型编号:\n${typeMessage}※请在30秒内输入以继续\n※输入0退出查看`)  //获取帖子类型
        let subclassNum = await session.prompt(30000)  //等待用户反馈
        if (subclassNum === '0' || subclassNum ===undefined) {
          return '已退出查看'
        }
        const subclass = tiebaType[parseInt(subclassNum, 10) - 1];  //确定请求参数
        server = server ? server : '-';  

        const response = await axios.post(getApi.JX3_tiebaRandom_vipAPI_URL, {
          server,
          subclass, //帖子类型
          limit:1,  //默认显示一个
          token: tokenMarket, // 站点标识，检查请求权限  
        });  
    
        const data: any = response.data;  
        if (data.code === 200) {
          const tiebaData =  data.data[0];
          let message = `分类：${tiebaData.subclass}\n`+ 
                        `服务器：${tiebaData.zone}-${tiebaData.server}\n`+ 
                        `${tiebaData.title}\n`+ 
                        `链接：https://tieba.baidu.com/p/${tiebaData.url}\n`+ 
                        `发布日期：${tiebaData.date}\n` 
          return message;
        } else {   
          return `查询失败，错误代码：${data.code}，信息：${data.msg}`;  
        }  
      } catch (error) {  
        console.error(error);  
        return '查询贴吧时出错，请稍后再试。';  
      }  
    });

    ctx.command('物价 <name>', '查看黑市物品价格')  //查看黑市物品价格
    .usage('查看黑市物品价格，例如：物价 二代灰')
    .option('name', '指定外观名称，不可省略') 
    .action(async ({ }, name) => {  
      try { 
        const response = await axios.post(getApi.JX3_Record_vipAPI_URL, { 
          scale: 2, // 设置网页分辨率 
          name, 
          robot: 'https://api.jx3api.com', //图片底部文本
          cache: 1,  //开启缓存
          token: tokenMarket,
          ticket: tokenDaily  
        });  
    
        const data: any = response.data; 
        if (data.code === 200) {  
          return (h('img', { src: data.data.url }));  //输出图片消息元素
        } else{
          return `查询失败，错误代码：${data.code}，信息：${data.msg}`;  
        }
      } catch (error) {  
        console.error(error);  
        return '查询物价时出错，请稍后再试。';  
      }  
    });

    ctx.command('挂件 <name>', '查询挂件的详细属性与效果')  //查询挂件的详细属性与效果
    .usage('查询挂件的详细属性与效果，例如：挂件 夜幕星河')   
    .action(async ({ }, name) => {  
      try {  
        const response = await axios.post(getApi.JX3_Pendant_vipAPI_URL, { 
          name, 
          token: tokenMarket, // 站点标识，检查请求权限  
        });  
    
        const data: any = response.data;  
        if (data.code === 200) { 
          let message = `挂件详情:\n`;  
          data.data.forEach((pendantData: any) => {
            message += `\n※名称：${pendantData.name}\n`+
                       `※位置：${pendantData.class}\n`+
                       `※获取途径：${pendantData.source}\n`+
                       `※详情：${pendantData.desc}\n`   
          }); 
          return message;
        } else {  
          return `查询失败，错误代码：${data.code}，信息：${data.msg}`;  
        }  
      } catch (error) {  
        console.error(error);  
        return '查询挂件时出错，请稍后再试。';  
      }  
    });
  
}

export function demonMessage(data: any[]) {  //金价信息处理函数
  let message: string  = '';
  data.forEach((item) => { 
    message += `${item.zone}-${item.server}\n`+
              `贴吧：${item.tieba}\n`+
              `万宝楼：${item.wanbaolou}\n`+
              `DD373：${item.dd373}\n`+
              `UU898：${item.uu898}\n`+
              `5173：${item['5173']}\n`+
              `7881：${item['7881']}\n`+
              `日期：${item.date}\n\n`;
  });  
  return message;  
}

export function convertUnixTime(timestamp: number): string {  //[年月日时分秒]Unix时间戳转换转换函数
  const date = new Date(timestamp * 1000); // 乘以1000，因为JavaScript Date需要毫秒级时间戳  
  const year = date.getFullYear();  
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // 月份从0开始，所以需要+1，并且补零  
  const day = date.getDate().toString().padStart(2, '0'); // 日期补零  
  const hours = date.getHours().toString().padStart(2, '0'); // 小时补零  
  const minutes = date.getMinutes().toString().padStart(2, '0'); // 分钟补零  
  const seconds = date.getSeconds().toString().padStart(2, '0'); // 秒补零  
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;  
}

export function convertUnixTimeMini(timestamp: number): string {  //[时分秒]Unix时间戳转换转换函数
  const date = new Date(timestamp * 1000); // 乘以1000，因为JavaScript Date需要毫秒级时间戳  
  const year = date.getFullYear();  
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // 月份从0开始，所以需要+1，并且补零  
  const day = date.getDate().toString().padStart(2, '0'); // 日期补零  
  const hours = date.getHours().toString().padStart(2, '0'); // 小时补零  
  const minutes = date.getMinutes().toString().padStart(2, '0'); // 分钟补零  
  const seconds = date.getSeconds().toString().padStart(2, '0'); // 秒补零  
  
  return `${hours}:${minutes}:${seconds}`;  
}