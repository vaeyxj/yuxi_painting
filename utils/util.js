/**
 * 日期格式化
 * @param {Date} date 日期对象
 * @param {String} fmt 格式字符串，例如 'yyyy-MM-dd hh:mm:ss'
 * @return {String} 格式化后的日期字符串
 */
const formatTime = (date, fmt = 'yyyy-MM-dd hh:mm:ss') => {
  if (!date) return ''
  if (typeof date === 'string') {
    date = new Date(date.replace(/-/g, '/'))
  }
  if (typeof date === 'number') {
    date = new Date(date)
  }
  
  const o = {
    'M+': date.getMonth() + 1, // 月份
    'd+': date.getDate(), // 日
    'h+': date.getHours(), // 小时
    'm+': date.getMinutes(), // 分
    's+': date.getSeconds(), // 秒
    'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
    'S': date.getMilliseconds() // 毫秒
  }
  
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
  }
  
  for (let k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)))
    }
  }
  
  return fmt
}

/**
 * 格式化显示时间（如：刚刚、x分钟前、x小时前、昨天、前天、yyyy-MM-dd）
 * @param {Date|String|Number} date 日期
 * @return {String} 格式化后的友好时间字符串
 */
const formatFriendlyTime = (date) => {
  if (!date) return ''
  if (typeof date === 'string') {
    date = new Date(date.replace(/-/g, '/'))
  }
  if (typeof date === 'number') {
    date = new Date(date)
  }
  
  const now = new Date()
  const diff = (now - date) / 1000 // 秒数
  
  if (diff < 60) {
    return '刚刚'
  } else if (diff < 3600) {
    return Math.floor(diff / 60) + '分钟前'
  } else if (diff < 86400) {
    return Math.floor(diff / 3600) + '小时前'
  } else if (diff < 86400 * 2) {
    return '昨天'
  } else if (diff < 86400 * 3) {
    return '前天'
  } else {
    return formatTime(date, 'yyyy-MM-dd')
  }
}

/**
 * 生成UUID
 * @return {String} UUID字符串
 */
const generateUUID = () => {
  let d = new Date().getTime()
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
    d += performance.now() // 使用高精度时间
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (d + Math.random() * 16) % 16 | 0
    d = Math.floor(d / 16)
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
  })
}

/**
 * 将小程序内的图片保存到相册
 * @param {String} url 图片路径（网络图片需要先下载）
 * @return {Promise} Promise对象
 */
const saveImageToPhotosAlbum = (url) => {
  return new Promise((resolve, reject) => {
    // 判断是否是网络图片
    if (url.indexOf('http') === 0) {
      wx.showLoading({
        title: '保存中...',
      })
      
      // 下载图片
      wx.downloadFile({
        url: url,
        success: (res) => {
          // 保存到相册
          wx.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success: () => {
              wx.hideLoading()
              resolve()
            },
            fail: (err) => {
              wx.hideLoading()
              if (err.errMsg.indexOf('auth deny') >= 0) {
                wx.showModal({
                  title: '提示',
                  content: '需要您授权保存相册',
                  showCancel: false,
                  success: () => {
                    wx.openSetting()
                  }
                })
              } else {
                wx.showToast({
                  title: '保存失败',
                  icon: 'none'
                })
              }
              reject(err)
            }
          })
        },
        fail: (err) => {
          wx.hideLoading()
          wx.showToast({
            title: '下载失败',
            icon: 'none'
          })
          reject(err)
        }
      })
    } else {
      // 本地图片直接保存
      wx.saveImageToPhotosAlbum({
        filePath: url,
        success: () => {
          resolve()
        },
        fail: (err) => {
          if (err.errMsg.indexOf('auth deny') >= 0) {
            wx.showModal({
              title: '提示',
              content: '需要您授权保存相册',
              showCancel: false,
              success: () => {
                wx.openSetting()
              }
            })
          } else {
            wx.showToast({
              title: '保存失败',
              icon: 'none'
            })
          }
          reject(err)
        }
      })
    }
  })
}

/**
 * 检查用户是否有会员权限（本地模拟版本）
 * @return {Boolean} 是否有会员权限
 */
const checkMemberPermission = () => {
  // 从本地存储获取用户信息
  const userInfo = wx.getStorageSync('userInfo') || {}
  
  // 检查是否有会员到期时间，并且是否未过期
  const hasValidMembership = userInfo.memberExpireTime && new Date(userInfo.memberExpireTime) > new Date()
  
  // 本地模拟版本：添加随机因素，开发测试时有时返回true
  const isDevelopment = __wxConfig && __wxConfig.envVersion !== 'release'
  
  // 生产环境严格检查，开发环境可以随机通过一些会员检查（方便测试）
  return hasValidMembership || (isDevelopment && Math.random() > 0.3)
}

/**
 * 防抖函数
 * @param {Function} fn 要执行的函数
 * @param {Number} delay 延迟时间
 * @return {Function} 防抖后的函数
 */
const debounce = (fn, delay = 500) => {
  let timer = null
  return function() {
    const context = this
    const args = arguments
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      fn.apply(context, args)
    }, delay)
  }
}

/**
 * 节流函数
 * @param {Function} fn 要执行的函数
 * @param {Number} interval 间隔时间
 * @return {Function} 节流后的函数
 */
const throttle = (fn, interval = 500) => {
  let lastTime = 0
  return function() {
    const context = this
    const args = arguments
    const now = Date.now()
    if (now - lastTime >= interval) {
      lastTime = now
      fn.apply(context, args)
    }
  }
}

module.exports = {
  formatTime,
  formatFriendlyTime,
  generateUUID,
  saveImageToPhotosAlbum,
  checkMemberPermission,
  debounce,
  throttle
} 