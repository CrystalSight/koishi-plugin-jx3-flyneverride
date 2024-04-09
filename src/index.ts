import { Context, Schema } from 'koishi'
import axios from 'axios';

const JX3_Current_API_URL = 'https://www.jx3api.com/data/active/current';//剑三日常信息API
const JX3_Answer_API_URL = 'https://www.jx3api.com/data/exam/answer';//剑三科举试题API
const JX3_Flower_API_URL = 'https://www.jx3api.com/data/home/flower';//剑三鲜花价格API
const JX3_Travel_API_URL = 'https://www.jx3api.com/data/home/travel';//剑三器物图谱API
const JX3_Master_API_URL = 'https://www.jx3api.com/data/server/master';//剑三搜索区服API
const JX3_Check_API_URL = 'https://www.jx3api.com/data/server/check';//剑三开服检查API
const JX3_Status_API_URL = 'https://www.jx3api.com/data/server/status';//剑三查看状态API
const JX3_Allnews_API_URL = 'https://www.jx3api.com/data/web/news/allnews';//剑三新闻资讯API
const JX3_Announce_API_URL = 'https://www.jx3api.com/data/web/news/announce';//剑三维护公告API
const JX3_Saohua_API_URL = 'https://www.jx3api.com/data/saohua/random';//剑三撩人骚话API

let gameServer:string[]=["绝代天骄","乾坤一掷","幽月轮","斗转星移","梦江南","剑胆琴心","唯我独尊","长安城","龙争虎斗","蝶恋花","青梅煮酒","飞龙在天","破阵子","天鹅坪"];//区服列表


export const name = 'jx3-flyneverride'
export const usage = '该插件可获取剑三部分信息'

export interface Config {
  默认区服:string
  是否启用链接服务:boolean       
}

export const Config: Schema<Config> = Schema.object({
  默认区服: Schema.union(gameServer),    //默认区服采用下拉菜单，调用区服数组
  是否启用链接服务:Schema.boolean().required(),    //是否启用返回值带链接的指令
})

export function apply(ctx: Context, config: Config) {
  ctx.command('剑三日常 [server] [num]', '查询剑网3指定服务器的日常活动信息')  //指令：查询日常
  .usage('查询剑网3指定服务器的日常活动信息，区服和数字可省略采用默认值，例如：剑三日常 天鹅坪 0')
  .option('server', '指定区服名称')
  .option('num', '预测时间,0为当天,1为明天',{ fallback: 0 })
  .action(async ({ options }) => {
    const server = options.server || config.默认区服;
    const num = options.num;

    try {
      const response = await axios.post(JX3_Current_API_URL, {
        server: server,
        num: num,
      });

      const data = response.data;
      if (data.code === 200) {

        const dailyInfo = data.data;
        let leaderInfo = dailyInfo.leader ?? "当日无世界BOSS";//判定当日是否有世界BOSS，如果返回值为undefined替换文本
        let drawInfo = dailyInfo.draw ?? "当日无美人图活动";//判定当日是否有美人图活动，如果返回值为undefined替换文本
        let publicTasksInfo:string[] = dailyInfo.team[0].split(";");//拆分返回值并存为数组，武林通鉴·公共任务（共2个）
        let dungeonInfo:string[] = dailyInfo.team[1].split(";");//拆分返回值并存为数组，武林通鉴·秘境（共3个）
        let groupDungeonInfo:string[] = dailyInfo.team[2].split(";");//拆分返回值并存为数组，团队秘境（共3个）
        const message = `区服：${server}\n` +
          `日期：${dailyInfo.date}\n` +
          `星期：${dailyInfo.week}\n` +
          `大战：${dailyInfo.war}\n` +
          `战场：${dailyInfo.battle}\n` +
          `矿车：${dailyInfo.orecar}\n` +
          `世界首领：${leaderInfo}\n` +
          `门派任务：${dailyInfo.school}\n` +
          `驰援任务：${dailyInfo.rescue}\n` +
          `美人画图：${drawInfo}\n` +
          `福缘宠物：${dailyInfo.luck.join(', ')}\n` +
          `声望加倍卡：${dailyInfo.card.join(', ')}\n\n` +
          `※武林通鉴·公共任务:\n` +             //武林通鉴·公共任务分三行显示
          `${publicTasksInfo[0]}\n` +
          `${publicTasksInfo[1]}\n\n` +
          `※武林通鉴·秘境:\n` +             //武林通鉴·秘境分四行显示
          `${dungeonInfo[0]}\n` +
          `${dungeonInfo[1]}\n` +
          `${dungeonInfo[2]}\n\n` +
          `※团队秘境:\n` +             //团队秘境分四行显示
          `${groupDungeonInfo[0]}\n` +
          `${groupDungeonInfo[1]}\n` +
          `${groupDungeonInfo[2]}\n`
          ;
        return(message);
      } else {
        return(`查询失败，错误代码：${data.code}，信息：${data.msg}`);
      }
    } catch (error) {
      return('查询日常活动时出错，请稍后再试。');
    }
  });

  ctx.command('剑三科举 <query>', '查询科举试题答案')  //指令：查询科举答案 
    .usage('查询科举试题的答案，例如：剑三科举 古琴有几根弦')
    .option('query', '科举试题，支持首字母，支持模糊查询')
    .action(async ({ }, query) => {  
      try {  
        const response = await axios.get(JX3_Answer_API_URL, {  
          params: {  
            match: query,  
            limit: 10 // 可以根据需要进行调整，暂不清楚有什么用，待定是否加入自定义配置 
          }  
        });  
          
        const data = response.data.data[0];  
        if (data.code==200) {  
          return `科举试题答案：${data.answer}`;  
        } else {  
          return '未找到相关科举试题答案';  
        }  
      } catch (error) {  
        console.error(error);  
        return '查询科举试题答案时出错';  
      }  
    });

    ctx.command('剑三花价 <server> <flower> [map]', '查询家园鲜花最高价格线路')  //指令：查询花价
    .usage('查询指定区服、鲜花和地图的家园鲜花价格线路，例如：剑三花价 梦江南 绣球花 九寨沟·镜海')  
    .option('sever', '服务器')
    .option('flower', '鲜花名称')
    .option('map', '家园地图')
    .action(async ({ }, server, flower, map) => {  
      try {  
        const response = await axios.get(JX3_Flower_API_URL, {  
          params: {  
            server,  
            flower,  
            map,  
          }  
        });  
          
        const data = response.data.data;  
        let result = '';  
        if (map) {  
          // 如果指定了地图，则只显示该地图的数据  
          if (data[map]) {  
            data[map].forEach(flowerData => {
              if (flowerData.name.includes(flower)){  //根据鲜花过滤
                result += `${flowerData.name}: 价格${flowerData.price}，线路[${flowerData.line.join(', ')}]\n`; 
              }
            });  
          } else {  
            result = '该地图没有鲜花数据。';  
          }  
        } else {  
          // 如果没有指定地图，则遍历所有数据并显示  
          for (const mapName in data) {  
            result += `${mapName}:\n`;  
            data[mapName].forEach(flowerData => {  
              if (flowerData.name.includes(flower)){  //根据鲜花过滤
                result += `${flowerData.name}: 价格${flowerData.price}，线路[${flowerData.line.join(', ')}]\n`; 
              }
            });  
          }  
        }  
        return result;  
      } catch (error) {  
        console.error(error);  
        return '查询家园鲜花价格线路时出错';  
      }  
    });  

    ctx.command('器物图谱 <name>', '查询地图器物图谱')  //指令：查询地图器物图谱
    .usage('查询地图器物图谱, 例如：器物图谱 七秀')
    .option('name','地图名称')
    .action(async ({ }, name) => {  
      try {  
        const response = await axios.get(JX3_Travel_API_URL, {  
          params: { name },  
        });  
          
        if (response.data.code === 200) {  
          const items = response.data.data.map(item => {  //新建一个items数组，将返回值数组遍历后存入
            return `${item.name} (${item.produce})`;  
          });  
          return items.join('\n');  //将items数组内容连接后输出
        } else {  
          return '查询失败，请检查输入的地图名称是否正确。';  
        }  
      } catch (error) {  
        console.error(error);  
        return '发生错误，请稍后再试。';  
      }  
    });  

    ctx.command('剑三区服 <name>','查询服务器详情')  //指令：查询服务器详情
    .usage('查询服务器详情, 例如：剑三区服 天鹅坪')
    .option('name', '区服名称')
    .action(async ({ }, name) => {  
      try {  
        const response = await axios.get(JX3_Master_API_URL, {  
          params: { name },  
        });  
          
        if (response.data.code === 200) {  
          const serverData = response.data.data;  
          const message = [  
            `服务器ID: ${serverData.id}`,  
            `大区: ${serverData.zone}`,  
            `类型: ${serverData.type}`,  
            `主服务器名: ${serverData.name}`,  
            `简称: ${serverData.abbreviation.join(', ')}`,  
            `次服务器: ${serverData.subordinate.join(', ')}`,  
          ].join('\n');  
          return message;  
        } else {  
          return '未找到指定的服务器信息。';  
        }  
      } catch (error) {  
        console.error(error);  
        return '查询服务器信息时出错，请稍后再试。';  
      }  
    });  

    ctx.command('开服 <server>', '查询服务器开服状态')  //查询服务器开服状态
    .usage('查询服务器开服状态, 例如：开服 天鹅坪')
    .option('server', '要查询状态的服务器名称')  
    .action(async ({ }, server) => {  
      try {  
        const response = await axios.get(JX3_Check_API_URL, {  
          params: { server },  
        });  
    
        if (response.data.code === 200) {  
          if (server) {  
            // 如果指定了服务器名称  
            const serverData = response.data.data;  
            const statusText = serverData.status === 1 ? '已开服' : '维护中';  
            return `服务器 ${serverData.server} 当前状态：${statusText}`;  
          } else {  
            // 如果没有指定服务器名称，返回全部区服的状态数据  
            const serversStatus = response.data.data.map(serverData => {  //新建数组serversStatus存储返回值遍历数据
              const statusText = serverData.status === 1 ? '已开服' : '维护中';  
              return `服务器 ${serverData.server} 当前状态：${statusText}`;  
            });  
            return serversStatus.join('\n');  //连接serversStatus数组内容并输出
          }  
        } else {  
          return '无法获取服务器状态信息。';  
        }  
      } catch (error) {  
        console.error(error);  
        return '查询服务器状态时出错，请稍后再试。';  
      }  
    });  

    ctx.command('服务器 <server>', '查看指定服务器的状态')  //查询服务器状态
    .usage('查询服务器状态, 例如：服务器 天鹅坪')
    .option('server', '要查询状态的服务器名称')
    .action(async ({ }, server) => {  
      try {  
        const response = await axios.post(JX3_Status_API_URL, {  
          server, 
        });  
        const data = response.data;  
        if (data.code === 200) {  
          return `${data.data.zone}的${data.data.server}服务器当前状态为：${data.data.status}`;  
        } else {  
          return '无法获取服务器状态，请稍后再试。';  
        }  
      } catch (error) {  
        console.error(error);  
        return '发生错误，无法获取服务器状态。';  
      }  
    });  

    ctx.command('公告 [limit]', '获取官方最新公告及新闻')  //获取剑网三最新资讯
    .usage('获取剑网三最新资讯, 例如：公告 2')
    .option('limit', '获取咨询数量，默认值：2', {fallback:2})
    .action(async ({ options }) => { 
      const A = config.是否启用链接服务; 
      const limit = options.limit;

      if (!A) {  
        return '该功能未开启';  //判断是否启用该功能
      }

      try {  
        const response = await axios.get(JX3_Allnews_API_URL, {  
          params: { limit: limit }  
        });  
        const data = response.data.data;  
        if (data && data.length > 0) {  
          const newsItems = data.map(newsItem => {  //新建数组newsItems存储返回值遍历数据
            return `${newsItem.type}: ${newsItem.title} (${newsItem.date}) - ${newsItem.url}`;  
          });  
          return newsItems.join('\n');  //连接newsItems数组内容并输出
        } else {  
          return '当前没有最新公告或新闻。';  
        }  
      } catch (error) {  
        console.error(error);  
        return '发生错误，无法获取最新公告及新闻。';  
      }  
    });  

    ctx.command('维护 [limit]', '获取官方最新公告')  //获取剑网三最新维护公告
    .usage('获取剑网三最新维护公告, 例如：维护 2')
    .option('limit', '获取维护公告数量，默认值：2', {fallback:2})
    .action(async ({ options }) => {  
      const A = config.是否启用链接服务; 
      const limit = options.limit;

      if (!A) {  
        return '该功能未开启';  //判断是否启用该功能
      }

      try {  
        const response = await axios.get(JX3_Announce_API_URL, {  
          params: { limit: limit }  
        });  
          
        if (response.data.code === 200) {  
          const announcements = response.data.data.map(announcement => {  //新建announcements数组，存放返回值遍历内容
            return `${announcement.type}: ${announcement.title} (${announcement.date}) - ${announcement.url}`;  
          });  
          return announcements.join('\n');  //链接announcements数组内容并输出
        } else {  
          return '无法获取最新公告。';  
        }  
          
      } catch (error) {  
        console.error(error);  
        return '发生错误，请稍后再试。';  
      }  
    }); 
    
    ctx.command('骚话', '获取骚话')  //获取随机骚话
    .usage('获取随机骚话')
    .action(async ({ }) => {  
      try {  
        const response = await axios.get(JX3_Saohua_API_URL);  
          
        if (response.data.code === 200) {  
          return response.data.data.text;  
        } else {  
          return '无法获取骚话。';  
        }  
          
      } catch (error) {  
        console.error(error);  
        return '发生错误，请稍后再试。';  
      }  
    });  
  
  
}
