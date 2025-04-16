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
    
    // 记录用户上一次访问的页面路径
    this.globalData.lastPage = '';
  },
  
  // 应用显示时触发
  onShow: function(options) {
    console.log('App onShow', options);
    
    // 在这里监听页面切换
    setTimeout(() => {
      const currentPage = getCurrentPages();
      if (currentPage && currentPage.length > 0) {
        const page = currentPage[currentPage.length - 1];
        const route = page.route;
        console.log('当前页面路径:', route);
        
        // 如果从其他页面跳转到AI绘画页面
        if (route === 'pages/draw/draw' && this.globalData.lastPage !== 'pages/draw/draw') {
          // 如果不是从AI绘画页面跳转过来的，则视为从首页跳转
          if (this.globalData.lastPage && this.globalData.lastPage !== 'pages/index/index') {
            this.globalData.drawPageSource = 'other';
          }
        }
        
        // 更新上一次访问的页面路径
        this.globalData.lastPage = route;
      }
    }, 100); // 短暂延迟，确保页面栈已更新
  },
  
  globalData: {
    userInfo: null,
    apiBaseUrl: 'https://api.yuxi-painting.com', // 后端API地址，需要替换为实际地址
    imageBaseUrl: 'https://images.yuxi-painting.com', // 图片服务器地址，需要替换为实际地址
    drawPageSource: '', // 记录AI绘画页面的来源
    lastPage: '', // 记录上一次访问的页面路径
    useMockData: true // 是否使用模拟数据，开发时设为true，上线时设为false
  }
}) 