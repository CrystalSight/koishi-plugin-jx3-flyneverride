# koishi-plugin-jx3-flyneverride

[![npm](https://img.shields.io/npm/v/koishi-plugin-jx3-flyneverride?style=flat-square)](https://www.npmjs.com/package/koishi-plugin-jx3-flyneverride)

**该项目已经停止为维护，且短时间内不会重启！！！2024-06-29**<br>
**该项目已经停止为维护，且短时间内不会重启！！！2024-06-29**<br>
**该项目已经停止为维护，且短时间内不会重启！！！2024-06-29**<br>

使用JX3API及魔盒的机器人，免费及大部分VIP接口施工完成(VIP需自行购买权限) <br>
JX3API : https://api.jx3api.com<br>
JX3API新版 : https://www.jx3api.com<br>
魔盒 : https://www.jx3box.com<br><br>
**v1.3.6~v1.3.7**<br>
修复一些降智小问题<br>
**v1.3.5**<br>
新增查询指定心法推荐小药的功能<br>
**v1.3.4**<br>
删除门派图标，因为部分门派会被企鹅屏蔽<br>
**v1.3.3**<br>
新增查询指定心法宏的功能，将返回魔盒宏排行榜首位的链接<br>
**v1.3.2**<br>
重写百战指令，现在可以直接从魔盒获取百战地图啦，无需自行额外配置<br>
**v1.3.1**<br>
规范ctx.database数据库功能依赖声明<br>
为推送消息加入随机元素，大批量推送更安全<br>
**v1.3.0**<br>
经小范围测试，推送能已修复，后期再有问题再改<br>
**v1.2.2**<br>
修复更新推送中无法获取当前版本号的问题。<br>
**v1.2.0**<br>
老版接口中4个免费监听推送功能已完成测试，现添加到正式版插件中；针对不同群号可设定不同区服。<br>
**v1.1.2**<br>
※※※Daliy.html是分离出的html文件，包含全部元素绘图逻辑，需传入参数后使用※※※<br>
指令<日历>:尝试使用原始数据渲染html并输出图片，而非调用现有图片接口；<br>
当前版本实现方法：通过Canvas绘制背景及文本，使用'koishi-plugin-puppeteer'的render接口渲染并返回；<br>
**v1.1.0**<br>
※※※指令<剑三科举>由于接口原因无法使用，保留指令以快速测试是否修复※※※<br>
新增查看黑市物品价格VIP功能；<br>
新增随机搜索贴吧VIP功能；<br>
新增查询烂柯山首领功能；<br>
新增诛恶事件历史记录VIP功能；<br>
新增查看阵营沙盘信息VIP功能；<br>
新增查询指定心法技能详细效果VIP功能；<br>
新增查询指定心法奇穴详细效果VIP功能；<br>
由于不知道干啥用的，暂时不做角色更新VIP功能；<br>
新增查询角色装备属性VIP功能；<br>
新增查询角色成就进度VIP功能；<br>
查询角色详细信息VIP功能由于看不懂返回值暂不提供，后续版本填坑；<br>
查询客户端战功榜与风云录VIP功能暂不提供，后续版本填坑；<br>
动画编辑器物品编号VIP功能由于API维护暂不提供；<br>
新增查询团队招募信息VIP功能；<br>
新增查询门派JJC排行榜VIP功能；<br>
新增查询全服JJC排行榜VIP功能；<br>
新增查询指定角色JJC战绩VIP功能；<br>
新增查询全服奇遇触发情况VIP功能；<br>
新增查询指定区服奇遇触发情况VIP功能；<br>
新增查询指定奇遇触发VIP功能；<br>
新增查询指定玩家奇遇VIP功能；<br>
新增活动日历VIP功能；<br>
新增阵法VIP功能；<br>
新增金价VIP功能；<br>
新增行侠VIP功能；<br>
新增百战查询功能，※注意：由于官方未开放该项目的官方接口服务，此功能需要自行配置后端，并每周手动更新图片！<br>
根据JX3API站点通知，对接口域名进行替换，已全部更新；<br>
修复日常指令只能查询默认区服的问题；<br>
优化代码结构，模块化便于维护；<br>
加入配置数据库，配置项可在文件间及时读取；<br>
**v1.0.0**<br>
新增科举查询功能；<br>
新增家园花价查询功能；<br>
新增器物图谱查询功能；<br>
新增区服详情查询功能；<br>
新增开服查询功能；<br>
新增查询服务器状态功能；<br>
新增获取最新资讯功能；<br>
新增获取最新维护公告功能；<br>
新增获取骚话功能；<br>
新增配置：对于需返回链接的指令，可选择是否开启（由于QQ官方机器人对url的管控，此类指令无法正常使用，关闭可防止产生误会）；<br>
优化无美人图活动时的文本显示；<br>
由于园宅会赛改版，不再支持家具查询功能；<br>
更改部分指令说明使其更易懂；<br>
**v0.0.3**<br>
优化显示方法，返回值更清晰；配置界面新增默认区服选择<br>
**v0.0.1**<br>
添加剑三日常接口，返回值存在问题待修复
