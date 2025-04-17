const drawUtil = require('./draw-util.js')

// 历史记录处理模块
const drawHistory = {
  /**
   * 获取历史记录并格式化时间
   * @return {Array} 格式化后的历史记录
   */
  getHistory: function() {
    const history = wx.getStorageSync('drawHistory') || [];
    
    // 格式化时间显示
    return history.map(item => {
      return {
        ...item,
        timeStr: drawUtil.formatTime(item.timestamp)
      };
    });
  },
  
  /**
   * 清空历史记录
   * @param {Function} callback 清空成功后的回调函数
   */
  clearHistory: function(callback) {
    wx.showModal({
      title: '提示',
      content: '确定要清空历史记录吗？',
      success: (res) => {
        if (res.confirm) {
          // 清空本地存储
          wx.setStorageSync('drawHistory', []);
          
          // 提示用户
          wx.showToast({
            title: '历史记录已清空',
            icon: 'success'
          });
          
          // 执行回调
          if (typeof callback === 'function') {
            callback([]);
          }
        }
      }
    });
  },
  
  /**
   * 重用历史记录项
   * @param {Object} item 历史记录项
   * @param {Array} styles 风格列表
   * @param {Function} callback 设置数据的回调函数
   */
  reuseHistoryItem: function(item, styles, callback) {
    if (!item) return;
    
    // 设置提示词和风格
    const updatedStyles = styles.map((style) => {
      return {
        ...style,
        selected: style.name === item.style // 使用名称匹配更可靠
      };
    });
    
    // 构建需要更新的数据对象
    const updateData = {
      prompt: item.prompt,
      styles: updatedStyles,
      generatedImage: item.imageUrl,
      imageDescription: item.description || '', // 添加描述
      isImageLoading: true // 设置图片为加载中状态
    };
    
    // 如果历史记录中有比例信息，也一并恢复
    if (item.ratio) {
      updateData['params.ratio'] = item.ratio;
    }
    
    // 执行回调，更新数据
    if (typeof callback === 'function') {
      callback(updateData);
    }
    
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
  }
};

module.exports = drawHistory; 