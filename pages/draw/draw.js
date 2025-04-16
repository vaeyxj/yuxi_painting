const app = getApp()

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
      quality: 85     // 质量 0-100
    },
    // 是否正在生成图片
    isGenerating: false,
    // 生成的图片
    generatedImage: '',
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
    // 页面显示时执行
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

  // 生成图片
  generateImage: function () {
    // 验证输入
    if (!this.data.prompt.trim()) {
      wx.showToast({
        title: '请输入提示词',
        icon: 'none'
      })
      return
    }

    // 设置生成状态
    this.setData({
      isGenerating: true,
      generatedImage: ''
    })

    // 获取选中的风格
    const selectedStyle = this.data.styles.find(item => item.selected)

    // 构建请求参数
    const params = {
      prompt: this.data.prompt,
      style: selectedStyle.id,
      creativity: this.data.params.creativity,
      quality: this.data.params.quality
    }

    // 调用后端API生成图片
    // 这里使用模拟数据，实际项目中需要调用真实的AI绘图API
    setTimeout(() => {
      // 模拟API返回数据
      const result = {
        success: true,
        imageUrl: '/static/images/sample_generated.jpg', // 这里应该是API返回的图片URL
        timestamp: Date.now()
      }

      if (result.success) {
        // 更新生成图片
        this.setData({
          isGenerating: false,
          generatedImage: result.imageUrl
        })

        // 添加到历史记录
        const history = this.data.history
        history.unshift({
          id: Date.now(),
          prompt: this.data.prompt,
          style: selectedStyle.name,
          imageUrl: result.imageUrl,
          timestamp: result.timestamp
        })

        this.setData({ history })
        wx.setStorageSync('drawHistory', history)
      } else {
        this.setData({ isGenerating: false })
        wx.showToast({
          title: '生成失败，请重试',
          icon: 'none'
        })
      }
    }, 3000) // 模拟3秒的生成时间
  },

  // 获取历史记录
  getHistory: function () {
    const history = wx.getStorageSync('drawHistory') || []
    this.setData({ history })
  },

  // 切换历史记录显示
  toggleHistory: function () {
    this.setData({
      showHistory: !this.data.showHistory
    })
  },

  // 清空历史记录
  clearHistory: function () {
    wx.showModal({
      title: '提示',
      content: '确定要清空历史记录吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({ history: [] })
          wx.setStorageSync('drawHistory', [])
        }
      }
    })
  },

  // 保存图片到相册
  saveImage: function () {
    if (!this.data.generatedImage) {
      wx.showToast({
        title: '请先生成图片',
        icon: 'none'
      })
      return
    }

    wx.showLoading({
      title: '保存中...',
    })

    // 下载图片
    wx.downloadFile({
      url: this.data.generatedImage,
      success: (res) => {
        // 保存到相册
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: () => {
            wx.hideLoading()
            wx.showToast({
              title: '保存成功',
              icon: 'success'
            })
          },
          fail: () => {
            wx.hideLoading()
            wx.showToast({
              title: '保存失败',
              icon: 'none'
            })
          }
        })
      },
      fail: () => {
        wx.hideLoading()
        wx.showToast({
          title: '下载失败',
          icon: 'none'
        })
      }
    })
  },

  // 分享到朋友圈
  shareImage: function () {
    if (!this.data.generatedImage) {
      wx.showToast({
        title: '请先生成图片',
        icon: 'none'
      })
      return
    }

    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
  },

  // 复制提示词
  copyPrompt: function () {
    wx.setClipboardData({
      data: this.data.prompt,
      success: () => {
        wx.showToast({
          title: '提示词已复制',
          icon: 'success'
        })
      }
    })
  },

  // 分享给朋友
  onShareAppMessage: function () {
    return {
      title: '我用AI创作了一幅画',
      path: '/pages/index/index',
      imageUrl: this.data.generatedImage || '/static/images/share_default.jpg'
    }
  }
}) 