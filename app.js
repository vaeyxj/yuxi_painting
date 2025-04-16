// app.js
App({
  onLaunch: function () {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        console.log('登录成功:', res)
      }
    })
  },
  globalData: {
    userInfo: null,
    apiBaseUrl: 'https://api.yuxi-painting.com', // 后端API地址，需要替换为实际地址
    imageBaseUrl: 'https://images.yuxi-painting.com', // 图片服务器地址，需要替换为实际地址
  }
}) 