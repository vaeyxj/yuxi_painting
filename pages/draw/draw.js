const app = getApp()
const api = require('../../utils/api.js')

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
      
      // 显示欢迎提示
      // wx.showToast({
      //   title: '欢迎来到AI绘画创作',
      //   icon: 'none',
      //   duration: 2000
      // });
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

  // 格式化时间
  formatTime: function(timestamp) {
    const now = new Date();
    const date = new Date(timestamp);
    
    const diff = Math.floor((now - date) / 1000); // 秒数差
    
    if (diff < 60) {
      return '刚刚';
    } else if (diff < 3600) {
      return Math.floor(diff / 60) + '分钟前';
    } else if (diff < 86400) {
      return Math.floor(diff / 3600) + '小时前';
    } else if (diff < 604800) {
      return Math.floor(diff / 86400) + '天前';
    } else {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  },
  
  // 重用历史记录
  reuseHistoryItem: function(e) {
    const index = e.currentTarget.dataset.index;
    const item = this.data.history[index];
    
    if (!item) return;
    
    // 查找对应的风格
    const styleId = this.data.styles.findIndex(style => style.name === item.style);
    
    // 设置提示词和风格
    const styles = this.data.styles.map((style, idx) => {
      return {
        ...style,
        selected: style.name === item.style // 使用名称匹配更可靠
      }
    });
    
    // 构建需要更新的数据对象
    const updateData = {
      prompt: item.prompt,
      styles,
      generatedImage: item.imageUrl,
      imageDescription: item.description || '', // 添加描述
      isImageLoading: true // 设置图片为加载中状态
    };
    
    // 如果历史记录中有比例信息，也一并恢复
    if (item.ratio) {
      updateData['params.ratio'] = item.ratio;
    }
    
    this.setData(updateData);
    
    // 滚动到顶部
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 300
    });
    
    // 提示用户
    wx.showToast({
      title: '已重用历史记录',
      icon: 'success',
      duration: 1500
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
    // 验证输入
    if (!this.data.prompt.trim()) {
      wx.showToast({
        title: '请输入提示词',
        icon: 'none'
      })
      return
    }

    // 记录开始时间，用于确保进度条至少显示3秒
    const startTime = Date.now();

    // 设置生成状态
    this.setData({
      isGenerating: true,
      generatedImage: '',
      imageDescription: '', // 清空之前的描述
      generationProgress: 0, // 重置进度
      showProgress: true,  // 显示进度条
      isImageLoading: false, // 重置图片加载状态
      imageLoadError: false // 重置图片错误状态
    })
    
    // 设置一个超时保护，确保进度条最终会关闭
    const progressTimeoutId = setTimeout(() => {
      console.log('应用进度条超时保护');
      if (this.data.showProgress) {
        this.setData({
          showProgress: false,
          isGenerating: false
        });
        wx.hideLoading();
        wx.showToast({
          title: '生成超时，请重试',
          icon: 'none'
        });
      }
    }, 30000); // 30秒超时保护
    
    // 获取选中的风格
    const selectedStyle = this.data.styles.find(item => item.selected)
    
    // 处理图像比例
    let width = 512;
    let height = 512;
    
    if (this.data.params.ratio === '4:3') {
      width = 640;
      height = 480;
    } else if (this.data.params.ratio === '3:4') {
      width = 480;
      height = 640;
    } else if (this.data.params.ratio === '16:9') {
      width = 640;
      height = 360;
    } else if (this.data.params.ratio === '9:16') {
      width = 360;
      height = 640;
    }

    // 构建请求参数
    const params = {
      prompt: this.data.prompt,
      style: selectedStyle.name, // 使用风格名称，更具描述性
      creativity: this.data.params.creativity,
      quality: this.data.params.quality,
      width: width,  // 图像宽度
      height: height,  // 图像高度
      ratio: this.data.params.ratio // 添加比例信息
    }

    // 进度回调函数
    const updateProgress = (progress) => {
      console.log('更新进度:', progress);
      
      // 验证progress是否为有效数值
      if (typeof progress !== 'number' || isNaN(progress)) {
        progress = 0;
      }
      
      // 确保progress在0-100范围内
      progress = Math.max(0, Math.min(100, progress));
      
      // 如果已经不在生成状态，直接关闭进度条
      if (!this.data.isGenerating) {
        this.setData({ 
          showProgress: false,
          generationProgress: 0
        });
        return;
      }
      
      // 如果进度到达100%，不立即关闭进度条，等待展示完全
      if (progress >= 100) {
        // 在最后UI更新中不自动关闭进度条，而是在生成完成后统一处理
        console.log('进度已达100%，等待生成完成后统一处理');
      }
      
      this.setData({ generationProgress: progress });
      
      // 当进度到达100%时，显示"处理中..."文本
      const loadingText = progress >= 100 ? '处理中...' : `创作中 ${progress}%`;
      
      // 更新加载提示文本
      wx.showLoading({
        title: loadingText,
        mask: true
      });
    };

    // 显示初始加载提示
    wx.showLoading({
      title: '创作中 0%',
      mask: true
    });

    // 调用后端API生成图片
    api.generateImage(params, updateProgress)
      .then(res => {
        // 清除超时保护
        clearTimeout(progressTimeoutId);
        
        // 计算经过的时间
        const elapsedTime = Date.now() - startTime;
        const minShowTime = 3000; // 进度条最少显示3秒
        
        // 如果经过的时间少于最小显示时间，则延迟关闭
        const delayToClose = Math.max(0, minShowTime - elapsedTime);
        console.log(`经过时间: ${elapsedTime}ms, 延迟关闭: ${delayToClose}ms`);
        
        // 在延迟结束前，先将进度设为100%
        this.setData({ generationProgress: 100 });
        
        // 延迟隐藏加载提示和更新UI
        setTimeout(() => {
          // 隐藏加载提示
          wx.hideLoading();
          
          // 处理成功响应
          const result = {
            success: true,
            imageUrl: res.imageUrl, 
            description: res.description || '基于您的提示词创作的图像',
            timestamp: Date.now()
          }
          
          console.log('生成成功，关闭进度条');
          
          // 更新生成图片和描述，关闭进度显示
          this.setData({
            isGenerating: false,
            generatedImage: result.imageUrl,
            imageDescription: result.description,
            showProgress: false,
            generationProgress: 100,
            isImageLoading: true // 设置为正在加载图片
          });
          
          // 添加到历史记录
          const history = this.data.history;
          const newRecord = {
            id: result.timestamp,
            prompt: this.data.prompt,
            style: selectedStyle.name,
            imageUrl: result.imageUrl,
            description: result.description,
            timestamp: result.timestamp,
            timeStr: '刚刚',
            ratio: this.data.params.ratio // 保存图像比例
          };
          
          history.unshift(newRecord);
          
          // 更新页面数据
          this.setData({ history });
          // 保存到本地存储
          wx.setStorageSync('drawHistory', history);
          
          // 显示成功提示
          wx.showToast({
            title: '创作成功',
            icon: 'success'
          });
          
          // 自动滚动到结果区域
          setTimeout(() => {
            this.scrollToResult();
          }, 500);
        }, delayToClose);
      })
      .catch(err => {
        // 清除超时保护
        clearTimeout(progressTimeoutId);
        
        // 计算经过的时间
        const elapsedTime = Date.now() - startTime;
        const minShowTime = 3000; // 进度条最少显示3秒
        
        // 如果经过的时间少于最小显示时间，则延迟关闭
        const delayToClose = Math.max(0, minShowTime - elapsedTime);
        console.log(`经过时间: ${elapsedTime}ms, 延迟关闭: ${delayToClose}ms`);
        
        setTimeout(() => {
          // 隐藏加载提示
          wx.hideLoading();
          
          console.log('生成失败，关闭进度条');
          
          // 设置生成状态为完成，隐藏进度条
          this.setData({ 
            isGenerating: false,
            showProgress: false,
            generationProgress: 0,
            isImageLoading: false,
            imageLoadError: false // 由于生成失败，所以不设置为图片错误状态
          });
          
          // 显示错误提示
          wx.showToast({
            title: '创作失败，请重试',
            icon: 'none'
          });
          
          // 记录错误日志
          console.error('生成图片失败:', err);
        }, delayToClose);
      });
  },
  
  // 滚动到结果区域
  scrollToResult: function() {
    const query = wx.createSelectorQuery()
    query.select('.result-section').boundingClientRect()
    query.selectViewport().scrollOffset()
    query.exec(function(res) {
      if (res[0] && res[1]) {
        wx.pageScrollTo({
          scrollTop: res[0].top + res[1].scrollTop - 100,
          duration: 300
        })
      }
    })
  },

  // 获取历史记录并格式化时间
  getHistory: function () {
    const history = wx.getStorageSync('drawHistory') || []
    
    // 格式化时间显示
    const formattedHistory = history.map(item => {
      return {
        ...item,
        timeStr: this.formatTime(item.timestamp)
      }
    })
    
    this.setData({ history: formattedHistory })
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
          
          wx.showToast({
            title: '历史记录已清空',
            icon: 'success'
          })
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
      });
      return;
    }
    
    // 检查图片是否正在加载或加载失败
    if (this.data.isImageLoading) {
      wx.showToast({
        title: '图片正在加载中，请稍候',
        icon: 'none'
      });
      return;
    }
    
    if (this.data.imageLoadError) {
      wx.showToast({
        title: '图片加载失败，请重试',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({
      title: '保存中...',
    });

    // 处理网络图片和本地图片的情况
    const isNetworkImage = this.data.generatedImage.startsWith('http');
    
    if (isNetworkImage) {
      // 网络图片先下载再保存
      wx.downloadFile({
        url: this.data.generatedImage,
        success: (res) => {
          if (res.statusCode === 200) {
            this.saveImageToAlbum(res.tempFilePath);
          } else {
            wx.hideLoading();
            wx.showToast({
              title: '下载图片失败',
              icon: 'none'
            });
          }
        },
        fail: (err) => {
          wx.hideLoading();
          wx.showToast({
            title: '下载图片失败',
            icon: 'none'
          });
          console.error('下载图片失败:', err);
        }
      });
    } else {
      // 本地图片直接保存
      this.saveImageToAlbum(this.data.generatedImage);
    }
  },
  
  // 保存图片到相册
  saveImageToAlbum: function(filePath) {
    wx.saveImageToPhotosAlbum({
      filePath: filePath,
      success: () => {
        wx.hideLoading()
        wx.showToast({
          title: '保存成功',
          icon: 'success'
        })
      },
      fail: (err) => {
        wx.hideLoading()
        if (err.errMsg.indexOf('auth deny') >= 0) {
          // 用户拒绝授权
          wx.showModal({
            title: '提示',
            content: '保存图片需要您授权访问相册',
            confirmText: '去授权',
            success: (res) => {
              if (res.confirm) {
                wx.openSetting({
                  success: (settingRes) => {
                    console.log('设置结果:', settingRes)
                  }
                })
              }
            }
          })
        } else {
          wx.showToast({
            title: '保存失败',
            icon: 'none'
          })
        }
        console.error('保存图片失败:', err)
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
  },
  
  // 分享到朋友圈
  onShareTimeline: function () {
    return {
      title: '我用AI创作了一幅画',
      imageUrl: this.data.generatedImage || '/static/images/share_default.jpg'
    }
  }
}) 