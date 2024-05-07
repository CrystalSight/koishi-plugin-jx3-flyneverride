import { Context, h } from 'koishi'
import * as getJx3boxIndex from './jx3boxIndex'; //导入魔盒主页参数，name:getJx3boxIndex
import * as getJx3boxElement from './jx3boxElement';  //导入魔盒元素搜索器参数，name:getJx3boxElement

export const name = 'jx3boxFunction';

export async function apply(ctx: Context) {

  //START 读取数据库并赋值

  //END 读取数据库并赋值

  ctx.command('百战', '获取当周百战图片')  //获取百战异闻录图片
    .usage('获取当周百战图片')
    .action(async ({ }) => {
      try {
        const page = await ctx.puppeteer.page(); //创建页面
        await page.setViewport({  //页面4K大小
          width: 4096,
          height: 2160,
        });
        await page.goto(getJx3boxIndex.JX3BOX_BaiZhan_MAIN_URL, { waitUntil: 'networkidle0' });  //页面前往指定网址，并完全加载
        const baiZhanElementHandle = await page.$(getJx3boxElement.JX3BOX_BaiZhan_Map_Element);  //获取百战地图元素
        const updateDateElementHandle = await page.$(getJx3boxElement.JX3BOX_BaiZhan_UpdateDate_Element);  //获取更新时间元素
        const durationElementHandle = await page.$(getJx3boxElement.JX3BOX_BaiZhan_Duration_Element);  //获取持续时间元素

        const baiZhanbox = await baiZhanElementHandle.boundingBox();  //获取元素范围及定位
        const baiZhanX = baiZhanbox.x  //设定截图点X
        const baiZhanY = baiZhanbox.y  //设定截图点Y
        const baiZhanHeight = baiZhanbox.height  //设定截图高度
        const baiZhanWidth = baiZhanbox.width  //设定截图点宽度
        //截图并采用base64编码↓
        const baiZhanBuffer = await page.screenshot({ encoding: 'base64', clip: { x: baiZhanX, y: baiZhanY, height: baiZhanHeight, width: baiZhanWidth } });
        const baiZhanUrl = `data:image/png;base64,${baiZhanBuffer}`;  //base64编码转换为url

        const updateDate = await page.evaluate(element => element.innerText, updateDateElementHandle);  //获取更新时间
        const duration = await page.evaluate(element => element.innerText, durationElementHandle);  //获取持续时间

        await page.close();  //关闭页面
        return (h('p', h('img', { src: baiZhanUrl }), `${updateDate}\n${duration}`));  //输出url 
      } catch (error) {
        console.error(error);
        return '发生错误，请稍后再试。';
      }
    });

}
