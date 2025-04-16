const app = getApp()

// 基础请求封装
const request = (url, method, data, needToken = true) => {
  return new Promise((resolve, reject) => {
    // 获取基础URL
    const baseUrl = app.globalData.apiBaseUrl || 'https://api.yuxi-painting.com'
    
    // 构建请求头
    const header = {
      'Content-Type': 'application/json'
    }
    
    // 如果需要token，添加到请求头
    if (needToken) {
      const token = wx.getStorageSync('token')
      if (token) {
        header['Authorization'] = `Bearer ${token}`
      }
    }
    
    wx.request({
      url: baseUrl + url,
      method: method,
      data: data,
      header: header,
      success: (res) => {
        // 请求成功，检查业务状态码
        if (res.statusCode >= 200 && res.statusCode < 300) {
          // HTTP状态码正常
          if (res.data.code === 0) {
            // 业务状态码正常
            resolve(res.data.data)
          } else {
            // 业务状态码异常
            showError(res.data.msg || '请求失败')
            reject(res.data)
          }
        } else if (res.statusCode === 401) {
          // 未授权，需要重新登录
          showError('登录已过期，请重新登录')
          // 清除本地token
          wx.removeStorageSync('token')
          // 跳转到登录页
          setTimeout(() => {
            wx.navigateTo({
              url: '/pages/login/login'
            })
          }, 1500)
          reject(res)
        } else {
          // 其他HTTP错误
          showError(`网络错误(${res.statusCode})`)
          reject(res)
        }
      },
      fail: (err) => {
        // 请求失败
        showError('网络连接失败')
        reject(err)
      }
    })
  })
}

// 显示错误提示
const showError = (msg) => {
  wx.showToast({
    title: msg,
    icon: 'none',
    duration: 2000
  })
}

// 导出API方法
module.exports = {
  // 用户相关
  login: (code) => {
    return request('/user/login', 'POST', { code }, false)
  },
  
  getUserInfo: () => {
    return request('/user/info', 'GET')
  },
  
  updateUserInfo: (userInfo) => {
    return request('/user/update', 'POST', userInfo)
  },
  
  // AI绘图相关
  generateImage: (params) => {
    // 判断是否使用模拟数据（没有实际后端服务或明确设置了使用模拟数据）
    const useMockData = !app.globalData.apiBaseUrl || app.globalData.useMockData;
    
    if (useMockData) {
      return new Promise((resolve) => {
        // 模拟网络延迟
        setTimeout(() => {
          // 根据不同风格返回不同的模拟图片
          let imageUrl = '/static/images/sample_generated.jpg';
          
          // 如果有风格参数，返回对应风格的图片
          if (params.style) {
            switch(params.style) {
              case 'realistic':
                imageUrl = '/static/images/samples/realistic.jpg';
                break;
              case 'cartoon':
                imageUrl = '/static/images/samples/cartoon.jpg';
                break;
              case 'ink':
                imageUrl = '/static/images/samples/ink.jpg';
                break;
              case 'oil':
                imageUrl = '/static/images/samples/oil.jpg';
                break;
              case 'anime':
                imageUrl = '/static/images/samples/anime.jpg';
                break;
              default:
                imageUrl = '/static/images/sample_generated.jpg';
            }
          }
          
          // 返回模拟数据
          resolve({
            imageUrl: imageUrl,
            width: params.width,
            height: params.height,
            prompt: params.prompt,
            style: params.style
          })
        }, 2000) // 模拟2秒网络延迟
      })
    }
    
    // 生产环境使用真实API
    return request('/draw/generate', 'POST', params)
  },
  
  getDrawHistory: () => {
    return request('/draw/history', 'GET')
  },
  
  // AI转动漫相关
  generateAnime: (params) => {
    return request('/anime/generate', 'POST', params)
  },
  
  // AI换脸相关
  faceSwap: (params) => {
    return request('/face-swap/generate', 'POST', params)
  },
  
  // AI头像相关
  generateAvatar: (params) => {
    return request('/avatar/generate', 'POST', params)
  },
  
  // 作品相关
  getWorks: (page, size) => {
    return request('/works/list', 'GET', { page, size })
  },
  
  getWorkDetail: (id) => {
    return request('/works/detail', 'GET', { id })
  },
  
  likeWork: (id) => {
    return request('/works/like', 'POST', { id })
  },
  
  // 社区相关
  getCommunityPosts: (page, size) => {
    return request('/community/posts', 'GET', { page, size })
  },
  
  createPost: (post) => {
    return request('/community/post', 'POST', post)
  },
  
  commentPost: (postId, content) => {
    return request('/community/comment', 'POST', { postId, content })
  },
  
  // 会员相关
  getMembershipPlans: () => {
    return request('/membership/plans', 'GET')
  },
  
  createOrder: (planId) => {
    return request('/membership/order', 'POST', { planId })
  },
  
  // 上传图片
  uploadImage: (filePath, progress) => {
    return new Promise((resolve, reject) => {
      const token = wx.getStorageSync('token')
      const baseUrl = app.globalData.apiBaseUrl || 'https://api.yuxi-painting.com'
      
      wx.uploadFile({
        url: baseUrl + '/upload/image',
        filePath: filePath,
        name: 'file',
        header: {
          'Authorization': token ? `Bearer ${token}` : ''
        },
        success: (res) => {
          try {
            const data = JSON.parse(res.data)
            if (data.code === 0) {
              resolve(data.data)
            } else {
              showError(data.msg || '上传失败')
              reject(data)
            }
          } catch (e) {
            showError('上传失败')
            reject(e)
          }
        },
        fail: (err) => {
          showError('上传失败')
          reject(err)
        },
        complete: () => {
          progress && progress(100)
        }
      })
    })
  }
} 