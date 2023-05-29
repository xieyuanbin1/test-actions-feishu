const axios = require('axios')
const crypto = require("crypto")
const timestamp = ~~((new Date().getTime()) / 1000)
// console.log('>> time:', timestamp)
// console.log('LOG::', process.env.GITHUB)

let text = ''
if (process.env.GITHUB && JSON.parse(process.env.GITHUB).event_name === 'release') {
  const { repository, actor, event } = JSON.parse(process.env.GITHUB)
  text += `${repository} ${event.release.name} 版本已发布 \n`
  text += `提交人: ${actor} \n`
  text += `内容: ${event.release.body}`
}

const secretKey = process.env.FEISHU_SIGN
const webhookUrl = process.env.FEISHU_WEBHOOK

const hmac = crypto.createHmac('sha256', timestamp + '\n' + secretKey)
const up = hmac.update("")

function sendText() {
  axios.post(webhookUrl, {
    "timestamp": timestamp,
    "sign": up.digest('base64'),
    "msg_type": "text",
    "content": {
      "text": `<at user_id="all"></at> \n ${text || '有新的发布版本'}`
    }
  }
  ).then(data => {
    console.log(">> data:", data.data);
  }).catch(err => {
    console.log(">> error:", err);
  })
}
// sendText()

// 卡片消息结构
const card = {
  // 用于描述卡片的功能属性
  config: {
    enable_forward: false, // 是否允许卡片被转发 默认 true
    update_multi: true, // 是否为共享卡片 是/更新卡片的内容对所有收到这张卡片的人员可见 否/仅操作用户可见卡片的更新内容
    wide_screen_mode: true
  },
  // 用于配置卡片标题内容
  header: {
    // 配置卡片标题内容
    title: {
      tag: 'plain_text', // 固定的 plain_text
      content: '标题2' // 卡片标题文案内容
    },
    template: 'blue' // 控制标题背景颜色 blue/wathet/turquoise/green/yellow/orange/red/carmine/violet/purple/indigo/grey
  },
  // 用于定义卡片正文内容 i18n_elements 用于国际化
  elements: [
    {
      "tag": "at"
    },
    {
      "tag": "div",
      "text": {
        "tag": "plain_text",
        "content": "通知：下午两点，向美国白宫发射东风快递！"
      }
    }
  ]
}
function sendCard() {
  const ins = axios.post(webhookUrl, {
    "timestamp": timestamp,
    "sign": up.digest('base64'),
    "msg_type": "interactive",
    "card": card
  })
}
// sendCard()
// sendText()

if (process.env.GITHUB && JSON.parse(process.env.GITHUB).event_name === 'release') {
  const { repository, actor, event } = JSON.parse(process.env.GITHUB)
  text += `${repository} ${event.release.name} 版本已发布 \n`
  text += `提交人: ${actor} \n`
  text += `内容: ${event.release.body}`

  // 卡片消息结构
  const card = {
    // 用于描述卡片的功能属性
    config: {
      enable_forward: false, // 是否允许卡片被转发 默认 true
      update_multi: true, // 是否为共享卡片 是/更新卡片的内容对所有收到这张卡片的人员可见 否/仅操作用户可见卡片的更新内容
      wide_screen_mode: true
    },
    // 用于配置卡片标题内容
    header: {
      // 配置卡片标题内容
      title: {
        tag: 'plain_text', // 固定的 plain_text
        content: `${repository} ${event.release.name} 版本已发布` // 卡片标题文案内容
      },
      template: 'blue' // 控制标题背景颜色 blue/wathet/turquoise/green/yellow/orange/red/carmine/violet/purple/indigo/grey
    },
    // 用于定义卡片正文内容 i18n_elements 用于国际化
    elements: [
      {
        "tag": "at"
      },
      {
        "tag": "markdown",
        "content": `${event.release.body}`
      }
    ]
  }

  axios.post(webhookUrl, {
    "timestamp": timestamp,
    "sign": up.digest('base64'),
    "msg_type": "interactive",
    "card": card
  }).then((data) => {
    console.info('>> send ok <<', data)
  }).catch(err => {
    console.error(">> error:", err);
  })
}