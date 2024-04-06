import { Context, Schema } from 'koishi'
import axios from 'axios';

const JX3_API_URL = 'https://www.jx3api.com/data/active/current';

export const name = 'jx3-flyneverride'

export interface Config {}

export const Config: Schema<Config> = Schema.object({})

export function apply(ctx: Context) {
  ctx.command('剑三日常 [server] [num]', '查询剑网3指定服务器的日常活动信息')
  .option('server', '-s <server>指定区服名称')
  .option('num', '-n <num>预测时间,0为当天,1为明天',  { fallback: 0 })
  .action(async ({ options }) => {
    const server = options.server || '天鹅坪';
    const num = options.num;

    try {
      const response = await axios.post(JX3_API_URL, {
        server: server,
        num: num,
      });

      const data = response.data;
      if (data.code === 200) {
        const dailyInfo = data.data;
        const message = `区服：${server}\n` +
          `日期：${dailyInfo.date}\n` +
          `星期：${dailyInfo.week}\n` +
          `战场：${dailyInfo.war}（攻防）, ${dailyInfo.battle}（竞技场）\n` +
          `矿车：${dailyInfo.orecar}\n` +
          `世界首领：${dailyInfo.leader}\n` +
          `门派任务：${dailyInfo.school}\n` +
          `驰援任务：${dailyInfo.rescue}\n` +
          `美人画图：${dailyInfo.draw}\n` +
          `福缘宠物：${dailyInfo.luck.join(', ')}\n` +
          `声望加倍卡：${dailyInfo.card.join(', ')}\n` +
          `团队周常：${dailyInfo.team.join(', ')}`;
        return(message);
      } else {
        return(`查询失败，错误代码：${data.code}，信息：${data.msg}`);
      }
    } catch (error) {
      return('查询日常活动时出错，请稍后再试。');
    }
  });
}
