import { Context} from 'koishi'
import axios from 'axios';
import * as getApi from './api'; //导入剑网三API地址，name:getApi
import * as puppeteer from 'koishi-plugin-puppeteer'

export const inject = {
  required: ['http'],
  optional: ['puppeteer']
}

export const name = 'canvasPlugin'

export function getTime():string {  //获取北京日期
  const date = Date.parse(new Date().toUTCString());  //取UTC+0时间，并转化为时间戳 
  console.log(date); 
  const beijingDate = new Date(date + 8 * 60 * 60 * 1000);  // 转换为北京时间（东八区，UTC+8）
  console.log(beijingDate);

  const year = beijingDate.getUTCFullYear();
  const month = ('0' + (beijingDate.getUTCMonth() + 1)).slice(-2);
  const day = ('0' + beijingDate.getUTCDate()).slice(-2);
  console.log(day)
  const formattedBeijingDate = `${year}-${month}-${day}`;

  return formattedBeijingDate;
}


export async function apply(ctx: Context, ) { //主函数

  //START 读取数据库并赋值
  const tokenMarket_= await ctx.database.get('jx3配置', [0], ['tokenMarket'])  //鉴权令牌
  const tokenMarket = tokenMarket_[0].tokenMarket
  const tokenDaily_= await ctx.database.get('jx3配置', [0], ['tokenDaily']) //推栏令牌
  const tokenDaily = tokenDaily_[0].tokenDaily
  const defaultServer_= await ctx.database.get('jx3配置', [0], ['defaultServer'])  //默认区服
  const defaultServer = defaultServer_[0].defaultServer
  //END 读取数据库并赋值

  ctx.command('日历', '推演未来活动日历')
    .usage('推演未来活动日历，比较丑懒得美化了')
    .action(async ({ }) => {
      try {
        const response = await axios.post(getApi.JX3_Calendar_vipAPI_URL, {
          num: 15,
          token: tokenMarket
        });

        const responseJson = JSON.stringify(response.data.data.data);
        return await ctx.puppeteer.render(generateHtml(responseJson, getTime()));

      } catch (error) {
        console.error('Error fetching and generating activity calendar:', error);
        return '发生错误，无法获取活动月历。';
      }
    });


  // write your plugin here
}

export function generateHtml(data: any,getBeijingDate:string): string {
  // 假设你的参数是data中的一个属性  
  const myData = data;
  console.log(getBeijingDate);

  // 构建HTML字符串，包括外部JS的引用和参数设置  
  const htmlContent = `  
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <script>
      function draw() {
        var canvas = document.getElementById("tutorial");
        if (canvas.getContext) {
          calendarBack();

          loopTextDate('date', 40, ${myData}, "27px black");
          loopTextDate('war', 80, ${myData}, "27px black");
          loopTextDate('battle', 120, ${myData}, "27px black");
          loopTextDate('orecar', 160, ${myData}, "27px black");
          loopTextDate('school', 200, ${myData}, "27px black");
          loopTextDate('rescue', 240, ${myData}, "27px black");
          loopTextDate('luck', 280, ${myData}, "19px black");


 
        }
      }

      function calendarBack() {  //封装日历背景框函数
        console.log('背景生成');
        var canvas = document.getElementById("tutorial");
        var ctx = canvas.getContext("2d");
        var canvasWidth = canvas.width;
        ctx.imageSmoothingEnabled = "true";

        let loopWidth = 10;
        let loopHeight = 10;
        for (let i = 0; i < 7; i++) {
          for (let n = 0; n < 7; n++) {
            roundedRect(ctx, loopWidth, loopHeight, (canvasWidth - 140) / 7, 300, 30, 5);
            loopWidth += (canvasWidth - 140) / 7 + 20; // 每次循环长度增加190  
          }
          loopWidth = 10;  //长度回到默认值
          loopHeight += 320; // 每次循环宽度增加320 
        }
      }

      async function loopTextDate(key, iniPosition, getData_, font) {  //封装文本输出函数
        console.log('调用一次')
        var canvas = document.getElementById("tutorial");
        var canvasWidth = canvas.width;
        var ctx = canvas.getContext("2d");
        ctx.textAlign = "center"
        ctx.font = font;

        const getData = getData_;
        const weekMap = ["日", "一", "二", "三", "四", "五", "六"]; //转化字段
        let weekindex = weekMap.indexOf(getData[0].week)
        let loopWidth = canvasWidth / 14; //横向初始位置固定第一列中心
        let loopHeight = iniPosition;  //纵向初始位置由传入参数决定
        for (let i = 0; i < 7; i++) {
          for (let n = 0; n < 7; n++) {
            if (n < weekindex && i == 0) {  //实现日历效果，使星期固定位置
              loopWidth += (canvasWidth - 140) / 7 + 20; // 增加宽度，以匹配接下来的列  
              continue; // 跳过当前循环的剩余部分，进入下一次循环  
            }
              if (getData[n - weekindex + i * 7].date === "${getBeijingDate}") {
                ctx.fillStyle = '#66ccff'; //  确认当天日期，临时切换蓝色
              }
            ctx.fillText(getData[n - weekindex + i * 7][key], loopWidth, loopHeight);
            loopWidth += (canvasWidth - 140) / 7 + 20; // 每次循环长度增加190 
            ctx.fillStyle = 'black';  //当天内容结束，切换回黑色
          }
          loopWidth = canvasWidth / 14;  //回到初始长度
          loopHeight += 320; // 每次循环高度增加320  
        }
      }



      function roundedRect(ctx, x, y, width, height, radius, n) {  //封装的一个用于绘制圆角矩形的函数。
        ctx.lineWidth = n;
        ctx.beginPath();
        ctx.moveTo(x, y + radius);
        ctx.lineTo(x, y + height - radius);
        ctx.quadraticCurveTo(x, y + height, x + radius, y + height);
        ctx.lineTo(x + width - radius, y + height);
        ctx.quadraticCurveTo(x + width, y + height, x + width, y + height - radius);
        ctx.lineTo(x + width, y + radius);
        ctx.quadraticCurveTo(x + width, y, x + width - radius, y);
        ctx.lineTo(x + radius, y);
        ctx.quadraticCurveTo(x, y, x, y + radius);
        ctx.stroke();
      }




    </script>

  </head>

  <body style="display: inline-block" onload="draw();">
    <canvas id="tutorial" width="1920" height="1920 "></canvas>
  </body>

  </html>
  `;

  return htmlContent;
}




