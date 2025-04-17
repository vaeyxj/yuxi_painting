// app.js
//const { getStaticUrl } = require('./utils/common.js');

/**
 * 获取静态资源完整路径
 * @param {string} path - 资源路径，以 /static/images/ 开头
 * @returns {string} 完整的静态资源URL
 */
function getStaticUrl(path) {
  if (!path) return '';
  
  // 如果路径已经是完整URL，直接返回
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // 替换开头的/static/为静态域名+/static/
  if (path.startsWith('/static/')) {
    return 'https://yuxi-painting.tos-cn-beijing.volces.com' + path;
  }
  
  return path;
}

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
    
    // 直接调用初始化工具函数
    this.initUtils();
  },
  
  // 初始化工具函数
  initUtils() {
    // 将 getStaticUrl 设置为全局函数
    this.getStaticUrl = getStaticUrl;
    
    // 处理数组或对象中的静态资源路径
    this.processStaticPaths = (data, keys) => {
      if (!data || !keys || !keys.length) return data;
      
      // 如果是数组，则遍历处理每个元素
      if (Array.isArray(data)) {
        return data.map(item => this.processStaticPaths(item, keys));
      }
      
      // 如果是对象，则处理特定键
      if (typeof data === 'object') {
        const result = { ...data };
        
        // 处理指定的键
        keys.forEach(key => {
          if (result[key] && typeof result[key] === 'string' && result[key].startsWith('/static/')) {
            result[key] = getStaticUrl(result[key]);
          }
        });
        
        return result;
      }
      
      return data;
    };
    
    // 页面增强函数，在 app 实例中直接提供
    this.enhancePage = (pageConfig) => {
      // 确保存在data对象
      if (!pageConfig.data) {
        pageConfig.data = {};
      }
      
      // 注入getStaticUrl函数到data
      pageConfig.data.getStaticUrl = getStaticUrl;
      
      // 保存原始onLoad函数
      const originalOnLoad = pageConfig.onLoad;
      
      // 包装onLoad函数
      pageConfig.onLoad = function(options) {
        console.log('页面加载，已注入静态资源处理函数');
        
        // 执行页面原有的onLoad
        if (originalOnLoad) {
          originalOnLoad.call(this, options);
        }
      };
      
      return pageConfig;
    };
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
    STATIC_DOMAIN: 'https://yuxi-painting.tos-cn-beijing.volces.com', // 静态资源域名
    drawPageSource: '', // 记录AI绘画页面的来源
    lastPage: '', // 记录上一次访问的页面路径
    useMockData: false // 是否使用模拟数据，开发时设为true，上线时设为false
  }
}) 