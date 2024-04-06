import { Context, Schema } from 'koishi'
import axios from 'axios';

const JX3_API_URL = 'https://www.jx3api.com/data/active/current';//剑三日常API
let gameServer:string[]=["绝代天骄","乾坤一掷","幽月轮","斗转星移","梦江南","剑胆琴心","唯我独尊","长安城","龙争虎斗","蝶恋花","青梅煮酒","飞龙在天","破阵子","天鹅坪"];//区服列表


export const name = 'jx3-flyneverride'
export const usage = '该插件可获取剑三部分信息'

export interface Config {
  默认区服:string       
}

export const Config: Schema<Config> = Schema.object({
  默认区服: Schema.union(gameServer),    //默认区服采用下拉菜单，调用区服数组
})

export function apply(ctx: Context, config: Config) {
  ctx.command('剑三日常 [server] [num]', '查询剑网3指定服务器的日常活动信息')
  .option('server', '-s <server>指定区服名称')
  .option('num', '-n <num>预测时间,0为当天,1为明天',  { fallback: 0 })
  .action(async ({ options }) => {
    const server = options.server || config.默认区服;
    const num = options.num;

    try {
      const response = await axios.post(JX3_API_URL, {
        server: server,
        num: num,
      });

      const data = response.data;
      if (data.code === 200) {

        const dailyInfo = data.data;
        let leaderInfo = dailyInfo.leader ?? "当日无世界BOSS";//判定当日是否有世界BOSS，如果返回值为undefined替换文本
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
          `美人画图：${dailyInfo.draw}\n` +
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
}
