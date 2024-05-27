import { Context, Schema, } from 'koishi'
// import * as getApi from './api'; //导入剑网三API地址，name:getApi
import * as freeFunction from './freeFunction';
import * as jx3boxFunction from './jx3boxFunction';
import * as vipFunction from './vipFunction';
import * as canvasVipFunction from './canvasVipFunction';
import { transferAdventurePlugin } from './AdventurePlugin';

let gameServer: string[] = ["绝代天骄", "乾坤一掷", "幽月轮", "斗转星移", "梦江南", "剑胆琴心", "唯我独尊", "长安城", "龙争虎斗", "蝶恋花", "青梅煮酒", "飞龙在天", "破阵子", "天鹅坪"];//区服列表


export const name = 'jx3-flyneverride'
export const usage = '该插件可获取剑三部分信息'

export const inject = {
  required: ['database','puppeteer'],
  optional: []
}

declare module 'koishi' {  //数据库新建表"Configuration"
  interface Tables {
    jx3配置: ScheduleJX3Config
    jx3推送: ScheduleJX3Listen
  }
}

interface Receiver {  //设定推送列表数组内容
  platform: string
  guildName: string
  defaultServerListen: string
  guildId: string
}

const Receiver: Schema<Receiver> = Schema.object({  //列表形式数组
  platform: Schema.string().required().description('平台名称'),
  guildName: Schema.string().required().description('组群 名称'),
  defaultServerListen: Schema.string().required().description('默认区服'),
  guildId: Schema.string().description('群组 ID')
})

export interface Config {  //配置界面复杂，不会写接口类型，开摆！
  [x: string]: any;
}

// 这里是新增数据库表的接口类型
export interface ScheduleJX3Config {  //JX3配置
  id: number
  defaultServer: string
  linkService: number
  enabledVip: number
  tokenMarket: string
  tokenDaily: string
}
export interface ScheduleJX3Listen {  //JX3推送
  id: number
  endPointSatori: string
  administratorId: string
  tokenSatori: string
  functionList: string[]
  guildId: string[]
  defaultServerListen: string[]
  enabledListen: number
}


export const Config: Schema<Config> = Schema.intersect([  //配置界面
  //START 通用设定
  Schema.object({
    defaultServer: Schema.union(gameServer).required().description('默认区服'),    //默认区服采用下拉菜单，调用区服数组
    linkService: Schema.boolean().required().description('是否启用链接服务'),    //是否启用返回值带链接的指令
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

  //START 监听推送
  Schema.object({
    enabledListen: Schema.boolean().required().description('是否启用监听推送服务'), //是否启用监听推送服务
  }).description('监听功能'),
  Schema.union([
    Schema.object({
      enabledListen: Schema.const(true).required(),
      endPointSatori: Schema.string().required().description('API地址'),
      tokenSatori: Schema.string().required().description('鉴权令牌'),
      administratorId: Schema.string().description('管理员ID，将连接状态实时推送至该账号，可自行选择是否启用'),
      functionList: Schema
        .array(Schema.union(['开服监控', '新闻资讯', '游戏更新', '贴吧速报', '关隘预告', '云从预告']))
        .default(['开服监控', '新闻资讯', '游戏更新'])
        .role('checkbox')
        .description('选择需要开启的监听功能,最后两个功能后续版本填坑'),
      rules: Schema.array(Receiver).role('table').description('推送规则列表。')
    }),
    Schema.object({}),
  ]),
])


export function apply(ctx: Context, config: Config) {
  //START 数据库JX3配置
  ctx.model.extend('jx3配置', {  // 各字段的类型声明
    id: 'unsigned',  //索引
    defaultServer: 'string',  //默认区服
    linkService: 'unsigned',  //是否启用链接服务
    enabledVip: 'unsigned',  //是否启用VIP接口
    tokenMarket: 'string',  //鉴权令牌
    tokenDaily: 'string',  //身份识别令牌
  })

  ctx.database.upsert('jx3配置', (row) => [  //将配置录入数据库
    {
      id: 0,  //索引
      defaultServer: config.defaultServer,  //默认区服
      linkService: config.linkService,  //是否启用链接服务
      enabledVip: config.enabledVip,  //是否启用VIP接口
      tokenMarket: config.tokenMarket,  //鉴权令牌
      tokenDaily: config.tokenDaily,  //身份识别令牌
    }
  ])

  //START 数据库JX3推送
  ctx.model.extend('jx3推送', {  // 各字段的类型声明
    id: 'unsigned',  //索引
    endPointSatori: 'string',  //Satori接口地址
    administratorId: 'string',  //管理员ID，即QQ号
    tokenSatori: 'string',  //Satori鉴权令牌
    functionList: 'list',  //功能列表
    guildId: 'list',  //频道ID，即QQ群号
    defaultServerListen: 'list',  //QQ群对应默认区服
    enabledListen: 'unsigned',  //是否启用推送功能
  })

  let guildId = config.rules.map(rules => {  //新建一个guildId数组，将群号遍历后存入
    return `${rules.guildId}`;
  });
  let defaultServerListen = config.rules.map(rules => {  //新建一个defaultServerListen数组，将默认区服遍历后存入
    return `${rules.defaultServerListen}`;
  });
  ctx.database.upsert('jx3推送', (row) => [  //将配置录入数据库
    {
      id: 0,  //索引
      endPointSatori: config.endPointSatori + '/v1/message.create',  //Satori接口地址
      administratorId: config.administratorId,  //管理员ID，即QQ号
      tokenSatori: config.tokenSatori,  //Satori鉴权令牌
      functionList: config.functionList,  //功能列表
      guildId: guildId,  //频道ID，即QQ群号
      defaultServerListen: defaultServerListen,  //QQ群对应默认区服
      enabledListen: config.enabledListen,  //是否启用推送功能
    }
  ])


  //START 监听图推送配置项



  transferAdventurePlugin(ctx);  //调用监听中转插件AdventurePlugin

  ctx.plugin(freeFunction);  //默认调用免费功能freeFunction
  ctx.plugin(jx3boxFunction);  //默认调用jx3box功能jx3boxFunction

  if (config.enabledVip) {  //如果配置界面开启VIP接口功能，则调用自定义功能vipFunction
    ctx.plugin(vipFunction);
    ctx.plugin(canvasVipFunction);  //基于canvas的转图片方法；包含指令:[日历]
  }






}

