/**
 * 格式化时间显示
 * @param {Number} timestamp 时间戳
 * @return {String} 友好的时间显示，如"刚刚"、"5分钟前"等
 */
const formatTime = function(timestamp) {
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
}

/**
 * 滚动到结果区域
 */
const scrollToResult = function() {
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
}

module.exports = {
  formatTime,
  scrollToResult
} 