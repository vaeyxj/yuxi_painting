const app = getApp()
const api = require('../../utils/api.js')
const drawImage = require('./draw-image.js')
const drawHistory = require('./draw-history.js')

Page({
  data: {
    // 用户输入的提示词
    prompt: '',
    // 风格列表
    styles: [
      { id: 'realistic', name: '写实风格', selected: true },
      { id: 'cartoon', name: '卡通风格', selected: false },
      { id: 'ink', name: '水墨风格', selected: false },
      { id: 'oil', name: '油画风格', selected: false },
      { id: 'sketch', name: '素描风格', selected: false },
      { id: 'anime', name: '动漫风格', selected: false },
      { id: 'cyberpunk', name: '赛博朋克', selected: false },
      { id: 'fantasy', name: '奇幻风格', selected: false }
    ],
    // 参数设置
    params: {
      creativity: 75, // 创意度 0-100
      quality: 85,     // 质量 0-100
      ratio: '1:1'    // 默认比例为1:1
    },
    // 是否正在生成图片
    isGenerating: false,
    // 生成的图片
    generatedImage: '',
    // 生成的图片描述
    imageDescription: '',
    // 图片是否正在加载
    isImageLoading: false,
    // 图片是否加载失败
    imageLoadError: false,
    // 生成进度 (0-100)
    generationProgress: 0,
    // 是否显示进度条
    showProgress: false,
    // 生成历史
    history: [],
    // 是否显示历史记录
    showHistory: false
  },

  onLoad: function (options) {
    // 获取历史记录
    this.getHistory()
  },

  onShow: function () {
    // 页面显示时刷新历史记录
    this.getHistory()
    
    // 如果有生成的图片但未确认加载状态，设置为加载中
    if (this.data.generatedImage && !this.data.isImageLoading && !this.data.imageLoadError) {
      this.setData({
        isImageLoading: true
      });
    }
    
    // 处理从首页跳转的情况
    const app = getApp();
    console.log('draw page onShow, drawPageSource:', app.globalData.drawPageSource);
    
    if (app.globalData && app.globalData.drawPageSource === 'homepage') {
      // 清除标记，避免重复处理
      app.globalData.drawPageSource = '';
      
      // 可以设置默认的创作提示或者选择随机的风格
      const randomStyleIndex = Math.floor(Math.random() * this.data.styles.length);
      const styles = this.data.styles.map((style, idx) => {
        return {
          ...style,
          selected: idx === randomStyleIndex
        }
      });
      
      this.setData({ 
        styles,
        prompt: '一幅美丽的画作，展现自然与科技的和谐' // 设置一个默认的创意提示词
      });
    }
  },

  // 输入提示词
  onPromptInput: function (e) {
    this.setData({
      prompt: e.detail.value
    })
  },

  // 选择风格
  selectStyle: function (e) {
    const styleId = e.currentTarget.dataset.id
    const styles = this.data.styles.map(item => {
      return {
        ...item,
        selected: item.id === styleId
      }
    })
    this.setData({ styles })
  },

  // 调整创意度
  onCreativityChange: function (e) {
    this.setData({
      'params.creativity': e.detail.value
    })
  },

  // 调整质量
  onQualityChange: function (e) {
    this.setData({
      'params.quality': e.detail.value
    })
  },

  // 选择图像比例
  selectRatio: function(e) {
    const ratio = e.currentTarget.dataset.ratio
    this.setData({
      'params.ratio': ratio
    })
  },
  
  // 重用历史记录
  reuseHistoryItem: function(e) {
    const index = e.currentTarget.dataset.index;
    const item = this.data.history[index];
    
    drawHistory.reuseHistoryItem(item, this.data.styles, (updateData) => {
      this.setData(updateData);
    });
  },

  // 图片加载成功处理
  onImageLoad: function() {
    console.log('图片加载成功');
    this.setData({
      isImageLoading: false,
      imageLoadError: false
    });
  },
  
  // 图片加载失败处理
  onImageError: function() {
    console.log('图片加载失败');
    this.setData({
      isImageLoading: false,
      imageLoadError: true
    });
  },
  
  // 重试加载图片
  retryLoadImage: function() {
    console.log('重试加载图片');
    // 重置状态
    this.setData({
      isImageLoading: true,
      imageLoadError: false
    });
    
    // 在URL后添加随机参数强制重新加载
    const currentImage = this.data.generatedImage;
    if (currentImage) {
      // 分析URL是否已经有参数
      const separator = currentImage.includes('?') ? '&' : '?';
      const refreshedUrl = `${currentImage}${separator}_t=${Date.now()}`;
      
      // 短暂延迟后重新设置URL
      setTimeout(() => {
        this.setData({
          generatedImage: refreshedUrl
        });
      }, 300);
    }
  },

  // 生成图片
  generateImage: function () {
    drawImage.generateImage({
      prompt: this.data.prompt,
      styles: this.data.styles,
      params: this.data.params,
      isGenerating: this.data.isGenerating,
      history: this.data.history,
      setData: this.setData.bind(this)
    }, {
      onProgress: (progress) => {
        console.log('外部进度回调:', progress);
      }
    });
  },

  // 获取历史记录并格式化时间
  getHistory: function () {
    const formattedHistory = drawHistory.getHistory();
    this.setData({ history: formattedHistory });
  },

  // 切换历史记录显示
  toggleHistory: function () {
    this.setData({
      showHistory: !this.data.showHistory
    });
  },

  // 清空历史记录
  clearHistory: function () {
    drawHistory.clearHistory((emptyHistory) => {
      this.setData({ history: emptyHistory });
    });
  },

  // 保存图片到相册
  saveImage: function () {
    drawImage.saveImage(
      this.data.generatedImage, 
      {
        isImageLoading: this.data.isImageLoading,
        imageLoadError: this.data.imageLoadError
      }
    );
  },

  // 分享到朋友圈
  shareImage: function () {
    if (!this.data.generatedImage) {
      wx.showToast({
        title: '请先生成图片',
        icon: 'none'
      });
      return;
    }

    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
  },

  // 复制提示词
  copyPrompt: function () {
    wx.setClipboardData({
      data: this.data.prompt,
      success: () => {
        wx.showToast({
          title: '提示词已复制',
          icon: 'success'
        });
      }
    });
  },

  // 分享给朋友
  onShareAppMessage: function () {
    return {
      title: '我用AI创作了一幅画',
      path: '/pages/index/index',
      imageUrl: this.data.generatedImage || '/static/images/share_default.jpg'
    };
  },
  
  // 分享到朋友圈
  onShareTimeline: function () {
    return {
      title: '我用AI创作了一幅画',
      imageUrl: this.data.generatedImage || '/static/images/share_default.jpg'
    };
  }
}); 