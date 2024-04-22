import { Context, Schema, h, } from 'koishi'
import axios from 'axios';
// import * as getApi from './api'; //导入剑网三API地址，name:getApi
import * as freeFunction from './freeFunction';
import * as customFunction from './customFunction';
import * as vipFunction from './vipFunction';
import * as canvasVipFunction from './canvasVipFunction';

let gameServer:string[]=["绝代天骄","乾坤一掷","幽月轮","斗转星移","梦江南","剑胆琴心","唯我独尊","长安城","龙争虎斗","蝶恋花","青梅煮酒","飞龙在天","破阵子","天鹅坪"];//区服列表


export const name = 'jx3-flyneverride'
export const usage = '该插件可获取剑三部分信息'

declare module 'koishi' {  //数据库新建表"Configuration"
  interface Tables {
    jx3配置: Schedule
  }
}

export interface Config {  //配置界面复杂，不会写接口类型，开摆！
  [x: string]: any;      
}

// 这里是新增表的接口类型
export interface Schedule {
  id : number
  defaultServer: string
  linkService: number
  enabledVip: number
  tokenMarket: string
  tokenDaily: string
  enabledBaizhan: number
  urlAPI: string
}


export const Config: Schema<Config> = Schema.intersect([  //配置界面
  //START 通用设定
  Schema.object({
    defaultServer: Schema.union(gameServer).required().description('默认区服'),    //默认区服采用下拉菜单，调用区服数组
    linkService:Schema.boolean().required().description('是否启用链接服务'),    //是否启用返回值带链接的指令
  }).description('通用设定'),

  //START VIP接口
  Schema.object({  
    enabledVip: Schema.boolean().default(false).description('是否启动VIP接口')  //是否启用VIP 接口
  }).description('VIP接口'),
  Schema.union([
    Schema.object({
      enabledVip: Schema.const(true).required().description('是否启动VIP接口'),
      tokenMarket: Schema.string().required().description('API鉴权token'),  //商城购买的token
      tokenDaily: Schema.string().required().description('推栏身份识别token'),  //推栏身份识别token
    }),
    Schema.object({}),
  ]),

  //START 百战异闻录
  Schema.object({
    enabledBaizhan:Schema.boolean().required().description('是否启用百战异闻录查询服务'),    //是否启用百战异闻录查询的指令
  }).description('百战异闻录'),
  Schema.union([
    Schema.object({
      enabledBaizhan:Schema.const(true).required().description('是否启用百战图片服务'),
      urlAPI: Schema.string().required().description('自定义的API接口'),  //提供图片查询服务的自定义接口位置
    }),
    Schema.object({}),
  ]),
])


export function apply(ctx: Context, config:Config) {

  ctx.model.extend('jx3配置', {  // 各字段的类型声明
    id: 'unsigned',  //索引
    defaultServer: 'string',  //默认区服
    linkService: 'unsigned',  //是否启用链接服务
    enabledVip: 'unsigned',  //是否启用VIP接口
    tokenMarket: 'string',  //鉴权令牌
    tokenDaily: 'string',  //身份识别令牌
    enabledBaizhan: 'unsigned',  //是否启用百战异闻录查询
    urlAPI: 'string',  //百战查询自定义接口位置
  })

  ctx.database.upsert('jx3配置',(row) => [  //将配置录入数据库
    {
      id: 0,  //索引
      defaultServer: config.defaultServer,  //默认区服
      linkService: config.linkService,  //是否启用链接服务
      enabledVip: config.enabledVip,  //是否启用VIP接口
      tokenMarket: config.tokenMarket,  //鉴权令牌
      tokenDaily: config.tokenDaily,  //身份识别令牌
      enabledBaizhan: config.enabledBaizhan,  //是否启用百战异闻录查询
      urlAPI: config.urlAPI,  //百战查询自定义接口位置
    }
  ])
  //console.log(config.defaultServer);  //测试数据库用
  

  ctx.plugin(freeFunction);  //默认调用免费功能freeFunction

  if (config.enabledBaizhan) {  //如果配置界面开启百战异闻录功能，则调用自定义功能customFunction
    ctx.plugin(customFunction);
  }

  if (config.enabledVip) {  //如果配置界面开启VIP接口功能，则调用自定义功能vipFunction
    ctx.plugin(vipFunction);
    ctx.plugin(canvasVipFunction);  //基于canvas的转图片方法；包含指令:[日历]
  }

  
}

