/**
 * 工具函数 - 处理静态资源路径
 */

// 注意：这里不应该在模块顶层使用 getApp()，因为在某些情况下可能在 app 实例化前就被加载
// 改为在函数内部按需获取 app 实例

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
    // 在函数内部获取 app 实例
    const app = getApp();
    if (app && app.globalData && app.globalData.STATIC_DOMAIN) {
      return app.globalData.STATIC_DOMAIN + path;
    } else {
      // 如果无法获取 app 实例或 STATIC_DOMAIN，则返回原路径并打印警告
      console.warn('无法获取 STATIC_DOMAIN，返回原路径: ' + path);
      return path;
    }
  }
  
  return path;
}

module.exports = {
  getStaticUrl
}; 