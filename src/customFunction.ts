import { Context, h } from 'koishi'
import axios from 'axios';

export const name = 'customFunction';

export async function apply(ctx: Context) {

  //START 读取数据库并赋值
  const urlAPI_= await ctx.database.get('jx3配置', [0], ['urlAPI']) //百战查询自定义接口位置
  const urlAPI = urlAPI_[0].urlAPI
  //END 读取数据库并赋值

  ctx.command('百战', '获取当周百战图片')  //获取百战异闻录图片
    .usage('获取当周百战图片')
    .action(async ({ }) => {  
      try {  
        const response = await axios.get(urlAPI);
        let imageUrl = response.data.url;
        //return imageUrl;
        return (h('img', { src: imageUrl }));  
      } catch (error) {  
        console.error(error);  
        return '发生错误，请稍后再试。';  
      }  
    }); 
  
}
