const axios = require('axios')
const crypto = require("crypto")
const timestamp = ~~((new Date().getTime()) / 1000)

const secretKey = process.env.FEISHU_SIGN
const webhookUrl = process.env.FEISHU_WEBHOOK

const hmac = crypto.createHmac('sha256', timestamp + '\n' + secretKey)
const up = hmac.update("")

// =============================================================================

if (!process.env.GITHUB) {
  return console.error('没有获取到 github 构建数据。')
}

if (JSON.parse(process.env.GITHUB).event_name !== 'release') {
  return console.warn('此消息通知仅支持 release 事件。')
}

const { repository, actor, event } = JSON.parse(process.env.GITHUB)

// 卡片消息结构
const content = {
  "post": {
    "zh_cn": {
      "title": '',
      "content": [
        [
          { "tag": "at", "user_id": "all" },
        ],
        [
          { "tag": "text", "text": `${repository} ${event.release.name} 版本已发布。`, "style": "" }
        ],
        [
          { "tag": "text", "text": '提交人：' },
          { "tag": "text", "text": actor }
        ],
        [
          { "tag": "text", "text": '版本描述信息：\n' },
          { "tag": "text", "text": event.release.body }
        ],
        [
          { "tag": "a", "href": event.release.html_url, "text": "查看详细信息" }
        ]
      ]
    }
  },
}

axios.post(webhookUrl, {
  "timestamp": timestamp,
  "sign": up.digest('base64'),
  "msg_type": "post",
  "content": JSON.stringify(content)
}).then((data) => {
  console.info('>> send ok <<', data.data)
}).catch(err => {
  console.error(">> error:", err);
})