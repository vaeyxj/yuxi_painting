const api = require('../../utils/api.js')
const drawUtil = require('./draw-util.js')

// 图片生成和处理模块
const drawImage = {
  /**
   * 生成图片
   * @param {Object} params 参数对象
   * @param {Function} callbacks 回调函数集合，包含onProgress、onSuccess、onError等
   */
  generateImage: function(params, callbacks) {
    const { 
      prompt, 
      styles, 
      params: imageParams, 
      setData,
      history
    } = params;
    
    const {
      onProgress,
      onSuccess,
      onError
    } = callbacks || {};
    
    // 验证输入
    if (!prompt || !prompt.trim()) {
      wx.showToast({
        title: '请输入提示词',
        icon: 'none'
      })
      return
    }
    
    // 记录开始时间，用于确保进度条至少显示3秒
    const startTime = Date.now();
    
    // 记录模拟进度更新的计时器ID，便于清理
    let simulateProgressTimer = null;
    
    // 设置生成状态
    setData({
      isGenerating: true,
      generatedImage: '',
      imageDescription: '', // 清空之前的描述
      generationProgress: 0, // 重置进度
      showProgress: true,  // 显示进度条
      isImageLoading: false, // 重置图片加载状态
      imageLoadError: false // 重置图片错误状态
    });
    
    // 清理函数，确保所有计时器都被清除
    const cleanup = () => {
      if (progressTimeoutId) {
        clearTimeout(progressTimeoutId);
      }
      if (simulateProgressTimer) {
        clearTimeout(simulateProgressTimer);
      }
    };
    
    // 设置一个超时保护，确保进度条最终会关闭
    const progressTimeoutId = setTimeout(() => {
      console.log('应用进度条超时保护');
      cleanup();
      setData({
        showProgress: false,
        isGenerating: false
      });
      
      wx.showToast({
        title: '生成超时，请重试',
        icon: 'none'
      });
    }, 30000); // 30秒超时保护
    
    // 获取选中的风格
    const selectedStyle = styles.find(item => item.selected)
    
    // 处理图像比例
    let width = 512;
    let height = 512;
    
    if (imageParams.ratio === '4:3') {
      width = 640;
      height = 480;
    } else if (imageParams.ratio === '3:4') {
      width = 480;
      height = 640;
    } else if (imageParams.ratio === '16:9') {
      width = 640;
      height = 360;
    } else if (imageParams.ratio === '9:16') {
      width = 360;
      height = 640;
    }
    
    // 构建请求参数
    const requestParams = {
      prompt: prompt,
      style: selectedStyle.name, // 使用风格名称，更具描述性
      creativity: imageParams.creativity,
      quality: imageParams.quality,
      width: width,  // 图像宽度
      height: height,  // 图像高度
      ratio: imageParams.ratio // 添加比例信息
    }
    
    // 使用模拟进度更新，确保视觉平滑
    let lastProgress = 0;
    let isGenerationCompleted = false;
    
    const simulateProgress = () => {
      // 如果生成已完成，不再继续模拟
      if (isGenerationCompleted) {
        return;
      }
      
      // 模拟进度逐步增加
      simulateProgressTimer = setTimeout(() => {
        if (lastProgress < 95 && !isGenerationCompleted) {
          // 不同阶段，增长速度不同
          const increment = lastProgress < 30 ? 5 : (lastProgress < 60 ? 3 : (lastProgress < 85 ? 2 : 1));
          lastProgress += increment;
          
          // 更新UI
          setData({
            generationProgress: lastProgress,
            showProgress: true
          });
          
          // 继续模拟进度
          simulateProgress();
        }
      }, 300);
    };
    
    // 开始模拟进度更新
    simulateProgress();
    
    // 进度回调函数，处理实际进度更新
    const updateProgress = (progress) => {
      console.log('API实际进度:', progress);
      
      // 如果有外部传入的进度回调，先调用
      if (typeof onProgress === 'function') {
        onProgress(progress);
      }
      
      // 验证progress是否为有效数值
      if (typeof progress !== 'number' || isNaN(progress)) {
        progress = 0;
      }
      
      // 确保progress在0-100范围内
      progress = Math.max(0, Math.min(100, progress));
      
      // 如果已经不在生成状态，直接关闭进度条
      if (!params.isGenerating || isGenerationCompleted) {
        cleanup();
        setData({ 
          showProgress: false,
          generationProgress: 0
        });
        return;
      }
      
      // 如果实际进度大于模拟进度，则更新
      if (progress > lastProgress) {
        lastProgress = progress;
        
        // 强制立即更新UI，不等待模拟进度
        setData({
          showProgress: true,
          generationProgress: Math.floor(progress)
        });
      }
      
      // 如果进度到达100%，标记生成完成
      if (progress >= 100) {
        isGenerationCompleted = true;
      }
    };
    
    // 调用后端API生成图片
    api.generateImage(requestParams, updateProgress)
      .then(res => {
        // 标记生成已完成
        isGenerationCompleted = true;
        
        // 清除所有计时器
        cleanup();
        
        // 计算经过的时间
        const elapsedTime = Date.now() - startTime;
        const minShowTime = 3000; // 进度条最少显示3秒
        
        // 如果经过的时间少于最小显示时间，则延迟关闭
        const delayToClose = Math.max(0, minShowTime - elapsedTime);
        console.log(`经过时间: ${elapsedTime}ms, 延迟关闭: ${delayToClose}ms`);
        
        // 在延迟结束前，先将进度设为100%
        setData({ 
          generationProgress: 100,
          showProgress: true
        });
        
        // 延迟更新UI
        setTimeout(() => {
          // 处理成功响应
          const result = {
            success: true,
            imageUrl: res.imageUrl, 
            description: res.description || '基于您的提示词创作的图像',
            timestamp: Date.now()
          }
          
          console.log('生成成功，关闭进度条');
          
          // 确保关闭进度条
          const completeUpdate = {
            isGenerating: false,
            generatedImage: result.imageUrl,
            imageDescription: result.description,
            showProgress: false,  // 明确设置为false
            generationProgress: 100,
            isImageLoading: true // 设置为正在加载图片
          };
          
          // 更新生成图片和描述，关闭进度显示
          setData(completeUpdate);
          
          // 再次确保进度条关闭（双重保障）
          setTimeout(() => {
            setData({
              showProgress: false
            });
          }, 200);
          
          // 添加到历史记录
          const newHistory = history ? [...history] : [];
          const newRecord = {
            id: result.timestamp,
            prompt: prompt,
            style: selectedStyle.name,
            imageUrl: result.imageUrl,
            description: result.description,
            timestamp: result.timestamp,
            timeStr: '刚刚',
            ratio: imageParams.ratio // 保存图像比例
          };
          
          newHistory.unshift(newRecord);
          
          // 更新页面数据
          setData({ history: newHistory });
          // 保存到本地存储
          wx.setStorageSync('drawHistory', newHistory);
          
          // 显示成功提示
          wx.showToast({
            title: '创作成功',
            icon: 'success'
          });
          
          // 自动滚动到结果区域
          setTimeout(() => {
            drawUtil.scrollToResult();
          }, 500);
          
          // 如果有成功回调，调用
          if (typeof onSuccess === 'function') {
            onSuccess(result);
          }
        }, delayToClose);
      })
      .catch(err => {
        // 标记生成已完成
        isGenerationCompleted = true;
        
        // 清除所有计时器
        cleanup();
        
        // 计算经过的时间
        const elapsedTime = Date.now() - startTime;
        const minShowTime = 3000; // 进度条最少显示3秒
        
        // 如果经过的时间少于最小显示时间，则延迟关闭
        const delayToClose = Math.max(0, minShowTime - elapsedTime);
        console.log(`经过时间: ${elapsedTime}ms, 延迟关闭: ${delayToClose}ms`);
        
        setTimeout(() => {
          console.log('生成失败，关闭进度条');
          
          // 设置生成状态为完成，隐藏进度条
          setData({ 
            isGenerating: false,
            showProgress: false,
            generationProgress: 0,
            isImageLoading: false,
            imageLoadError: false // 由于生成失败，所以不设置为图片错误状态
          });
          
          // 再次确保进度条关闭（双重保障）
          setTimeout(() => {
            setData({
              showProgress: false
            });
          }, 200);
          
          // 显示错误提示
          wx.showToast({
            title: '创作失败，请重试',
            icon: 'none'
          });
          
          // 记录错误日志
          console.error('生成图片失败:', err);
          
          // 如果有错误回调，调用
          if (typeof onError === 'function') {
            onError(err);
          }
        }, delayToClose);
      });
  },
  
  /**
   * 保存图片到相册
   * @param {String} imageUrl 图片URL
   */
  saveImage: function(imageUrl, { isImageLoading, imageLoadError }) {
    if (!imageUrl) {
      wx.showToast({
        title: '请先生成图片',
        icon: 'none'
      });
      return;
    }
    
    // 检查图片是否正在加载或加载失败
    if (isImageLoading) {
      wx.showToast({
        title: '图片正在加载中，请稍候',
        icon: 'none'
      });
      return;
    }
    
    if (imageLoadError) {
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
    const isNetworkImage = imageUrl.startsWith('http');
    
    if (isNetworkImage) {
      // 网络图片先下载再保存
      wx.downloadFile({
        url: imageUrl,
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
      this.saveImageToAlbum(imageUrl);
    }
  },
  
  /**
   * 保存图片到相册
   * @param {String} filePath 文件路径
   */
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
  }
}

module.exports = drawImage; 