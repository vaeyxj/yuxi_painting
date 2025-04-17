const app = getApp()

/**
 * 显示错误提示
 * @param {String} msg 错误信息
 */
const showError = (msg) => {
  wx.showToast({
    title: msg,
    icon: 'none',
    duration: 2000
  })
}

/**
 * 模拟API请求的统一返回函数
 * @param {Object} data 模拟返回的数据
 * @param {Number} delay 模拟网络延迟（毫秒）
 * @return {Promise} Promise对象
 */
const mockRequest = (data, delay = 500) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(data)
    }, delay)
  })
}

// 导出API方法
module.exports = {
  // 用户相关
  login: (code) => {
    console.log('模拟登录请求:', code)
    return mockRequest({
      token: 'mock_token_' + new Date().getTime(),
      userId: 'user_' + Math.floor(Math.random() * 10000)
    })
  },
  
  getUserInfo: () => {
    const userInfo = wx.getStorageSync('userInfo') || {
      nickName: '游客',
      avatarUrl: '/static/images/default-avatar.png',
      gender: 0,
      memberExpireTime: new Date().getTime() + 86400000 * 7, // 默认7天会员期限
      credits: 100
    }
    return mockRequest(userInfo)
  },
  
  updateUserInfo: (userInfo) => {
    console.log('模拟更新用户信息:', userInfo)
    // 更新本地存储
    const oldUserInfo = wx.getStorageSync('userInfo') || {}
    const newUserInfo = {...oldUserInfo, ...userInfo}
    wx.setStorageSync('userInfo', newUserInfo)
    return mockRequest(newUserInfo)
  },
  
  // AI绘图相关
  generateImage: (params, progressCallback) => {
    console.log('模拟生成图片:', params)
    return new Promise((resolve) => {
      // 模拟网络延迟和进度更新
      let progress = 0;
      const progressInterval = setInterval(() => {
        if (progress < 95) {  // 只更新到95%，最后5%留给结果处理
          // 不同阶段速度不同
          const increment = progress < 30 ? 5 : (progress < 60 ? 3 : (progress < 80 ? 2 : 1));
          progress += increment;
          if (typeof progressCallback === 'function') {
            progressCallback(progress);
          }
        }
        
        // 当进度达到95时，停止自动更新，等待最终处理
        if (progress >= 95) {
          clearInterval(progressInterval);
        }
      }, 200);
      
      // 模拟API调用延迟
      setTimeout(() => {
        // 解决最后5%的进度和显示最终结果
        if (typeof progressCallback === 'function') {
          progressCallback(100);
        }
        
        clearInterval(progressInterval);
        
        // 根据不同风格返回不同的模拟图片
        let imageUrl = '/static/images/sample_generated.jpg';
        
        // 如果有风格参数，返回对应风格的图片
        if (params.style) {
          switch(params.style) {
            case 'realistic':
            case '写实风格':
              imageUrl = '/static/images/samples/realistic.jpg';
              break;
            case 'cartoon':
            case '卡通风格':
              imageUrl = '/static/images/samples/cartoon.jpg';
              break;
            case 'ink':
            case '水墨风格':
              imageUrl = '/static/images/samples/ink.jpg';
              break;
            case 'oil':
            case '油画风格':
              imageUrl = '/static/images/samples/oil.jpg';
              break;
            case 'anime':
            case '动漫风格':
              imageUrl = '/static/images/samples/anime.jpg';
              break;
            default:
              imageUrl = '/static/images/sample_generated.jpg';
          }
        }
        
        console.log('模拟生成图片完成:', imageUrl);
        
        // 返回模拟数据
        resolve({
          imageUrl: imageUrl,
          width: params.width || 512,
          height: params.height || 512,
          prompt: params.prompt,
          style: params.style,
          description: "这是一个AI生成的图像，根据您的提示生成"
        });
      }, 3000) // 模拟3秒网络延迟
    });
  },
  
  getDrawHistory: () => {
    // 从本地存储获取历史记录
    const history = wx.getStorageSync('drawHistory') || []
    return mockRequest(history)
  },
  
  // AI转动漫相关
  generateAnime: (params) => {
    console.log('模拟动漫化请求:', params)
    return mockRequest({
      imageUrl: '/static/images/samples/anime_converted.jpg',
      width: params.width || 512,
      height: params.height || 512,
      prompt: params.prompt || '动漫风格',
      description: "这是一个AI生成的动漫风格图像"
    }, 2000)
  },
  
  // AI换脸相关
  faceSwap: (params) => {
    console.log('模拟换脸请求:', params)
    return mockRequest({
      imageUrl: '/static/images/samples/face_swap.jpg',
      width: params.width || 512,
      height: params.height || 512,
      description: "这是一个AI换脸的图像"
    }, 2000)
  },
  
  // AI头像相关
  generateAvatar: (params) => {
    console.log('模拟生成头像请求:', params)
    return mockRequest({
      imageUrl: '/static/images/samples/avatar.jpg',
      width: params.width || 512,
      height: params.height || 512,
      description: "这是一个AI生成的头像图像"
    }, 2000)
  },
  
  // 作品相关
  getWorks: (page, size) => {
    console.log('模拟获取作品列表:', page, size)
    // 生成模拟数据
    const works = []
    const count = size || 10
    for (let i = 0; i < count; i++) {
      works.push({
        id: 'work_' + (page * count + i),
        title: '作品 ' + (page * count + i),
        imageUrl: '/static/images/samples/' + (i % 5 + 1) + '.jpg',
        author: '用户' + Math.floor(Math.random() * 1000),
        likeCount: Math.floor(Math.random() * 100),
        createTime: new Date(Date.now() - Math.random() * 86400000 * 30).toISOString()
      })
    }
    return mockRequest({
      list: works,
      total: 100,
      page: page || 0,
      size: size || 10
    })
  },
  
  getWorkDetail: (id) => {
    console.log('模拟获取作品详情:', id)
    return mockRequest({
      id: id,
      title: '作品 ' + id,
      imageUrl: '/static/images/samples/' + (Math.floor(Math.random() * 5) + 1) + '.jpg',
      author: {
        id: 'user_' + Math.floor(Math.random() * 1000),
        nickName: '用户' + Math.floor(Math.random() * 1000),
        avatarUrl: '/static/images/default-avatar.png'
      },
      description: '这是作品描述，由AI生成的精美图片',
      prompt: '用户提示词：山川、湖泊、星空',
      style: '写实风格',
      likeCount: Math.floor(Math.random() * 100),
      viewCount: Math.floor(Math.random() * 500),
      createTime: new Date(Date.now() - Math.random() * 86400000 * 30).toISOString(),
      tags: ['风景', 'AI绘画', '写实']
    })
  },
  
  likeWork: (id) => {
    console.log('模拟点赞作品:', id)
    return mockRequest({
      id: id,
      liked: true,
      likeCount: Math.floor(Math.random() * 100) + 1
    })
  },
  
  // 社区相关
  getCommunityPosts: (page, size) => {
    console.log('模拟获取社区帖子:', page, size)
    // 生成模拟数据
    const posts = []
    const count = size || 10
    for (let i = 0; i < count; i++) {
      posts.push({
        id: 'post_' + (page * count + i),
        title: '帖子标题 ' + (page * count + i),
        content: '这是帖子内容，分享AI绘画的心得体会...',
        author: {
          id: 'user_' + Math.floor(Math.random() * 1000),
          nickName: '用户' + Math.floor(Math.random() * 1000),
          avatarUrl: '/static/images/default-avatar.png'
        },
        imageUrls: [
          '/static/images/samples/' + (i % 5 + 1) + '.jpg'
        ],
        commentCount: Math.floor(Math.random() * 20),
        likeCount: Math.floor(Math.random() * 50),
        createTime: new Date(Date.now() - Math.random() * 86400000 * 10).toISOString()
      })
    }
    return mockRequest({
      list: posts,
      total: 100,
      page: page || 0,
      size: size || 10
    })
  },
  
  createPost: (post) => {
    console.log('模拟创建帖子:', post)
    return mockRequest({
      id: 'post_' + new Date().getTime(),
      ...post,
      author: {
        id: 'user_current',
        nickName: wx.getStorageSync('userInfo')?.nickName || '当前用户',
        avatarUrl: wx.getStorageSync('userInfo')?.avatarUrl || '/static/images/default-avatar.png'
      },
      commentCount: 0,
      likeCount: 0,
      createTime: new Date().toISOString()
    })
  },
  
  commentPost: (postId, content) => {
    console.log('模拟评论帖子:', postId, content)
    return mockRequest({
      id: 'comment_' + new Date().getTime(),
      postId: postId,
      content: content,
      author: {
        id: 'user_current',
        nickName: wx.getStorageSync('userInfo')?.nickName || '当前用户',
        avatarUrl: wx.getStorageSync('userInfo')?.avatarUrl || '/static/images/default-avatar.png'
      },
      createTime: new Date().toISOString()
    })
  },
  
  // 会员相关
  getMembershipPlans: () => {
    console.log('模拟获取会员套餐')
    return mockRequest([
      {
        id: 'plan_month',
        name: '月度会员',
        price: 28,
        originalPrice: 38,
        days: 30,
        description: '无限次AI绘画，优先体验新功能'
      },
      {
        id: 'plan_season',
        name: '季度会员',
        price: 78,
        originalPrice: 98,
        days: 90,
        description: '无限次AI绘画，优先体验新功能，赠送100个积分'
      },
      {
        id: 'plan_year',
        name: '年度会员',
        price: 288,
        originalPrice: 368,
        days: 365,
        description: '无限次AI绘画，优先体验新功能，赠送500个积分，专属客服'
      }
    ])
  },
  
  createOrder: (planId) => {
    console.log('模拟创建订单:', planId)
    return mockRequest({
      orderId: 'order_' + new Date().getTime(),
      planId: planId,
      status: 'pending',
      createTime: new Date().toISOString(),
      // 模拟支付参数（实际项目中由服务端返回真实的支付参数）
      payParams: {
        timeStamp: '' + Math.floor(Date.now() / 1000),
        nonceStr: Math.random().toString(36).substring(2, 17),
        package: 'prepay_id=wx' + new Date().getTime(),
        signType: 'MD5',
        paySign: Math.random().toString(36).substring(2, 32)
      }
    })
  },
  
  // 上传图片（模拟）
  uploadImage: (filePath, progress) => {
    console.log('模拟上传图片:', filePath)
    return new Promise((resolve) => {
      // 模拟上传进度
      let uploadProgress = 0
      const progressInterval = setInterval(() => {
        uploadProgress += 10
        if (typeof progress === 'function') {
          progress(uploadProgress)
        }
        if (uploadProgress >= 100) {
          clearInterval(progressInterval)
        }
      }, 200)
      
      // 模拟上传完成
      setTimeout(() => {
        resolve({
          url: filePath, // 在实际应用中会是服务器返回的URL，这里简化为直接返回本地路径
          width: 512,
          height: 512
        })
      }, 2000)
    })
  }
} 