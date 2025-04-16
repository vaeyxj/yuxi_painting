const app = getApp()

// 配置参数
const DEEPSEEK_API_KEY = 'sk-4c1d1a5bdd5d4d0db21d418117cb406b'; // 您的DeepSeek API密钥，请替换为实际密钥
const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions'; // Deepseek API 地址

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

// 调用DeepSeek API生成图片
const callDeepseekAPI = (params, progressCallback) => {
  // 构建prompt模板
  const promptTemplate = `你现在是一个AI图片生成机器人，等待我给你一些提示(不需要举例)，你用你的想象力去描述这幅图片，并转换成英文用纯文本的形式填充到下面url的占位符{prompt}中：
![image](https://image.pollinations.ai/prompt/{prompt}?width=1024&height=1024&enhance=true&private=true&nologo=true&safe=true&model=flux)
生成后给出中文提示语`;
  
  // 将所有参数转换为字符串并拼接
  const userPrompt = Object.entries(params)
    .map(([key, value]) => `${key}: ${value}`)
    .join(', ');
  
  console.log('发送到Deepseek的提示词:', userPrompt);
  
  // 开始模拟进度更新
  let progress = 0;
  const progressInterval = setInterval(() => {
    // 在0-90%范围内缓慢增长
    if (progress < 90) {
      // 初始快速，后期缓慢的指数曲线
      const increment = progress < 30 ? 5 : (progress < 60 ? 3 : 1);
      progress += increment;
      if (typeof progressCallback === 'function') {
        progressCallback(progress);
      }
    }
  }, 300);
  
  // 构建请求参数
  const requestData = {
    model: "deepseek-chat",
    messages: [
      { role: "system", content: "${promptTemplate}" },
      { role: "user", content: "${userPrompt}" }
    ],
    stream: false
  };
  
  return new Promise((resolve, reject) => {
    wx.request({
      url: DEEPSEEK_API_URL,
      method: 'POST',
      data: requestData,
      header: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      success: (res) => {
        console.log('Deepseek API原始响应:', res);
        
        // 设置进度为95%
        if (typeof progressCallback === 'function') {
          progressCallback(95);
        }
        
        if (res.statusCode === 200 && res.data && res.data.choices && res.data.choices.length > 0) {
          // 成功响应，处理DeepSeek返回的内容
          const content = res.data.choices[0].message.content;
          console.log('Deepseek返回内容:', content);
          
          // 从返回内容中提取图片URL
          const urlMatch = content.match(/\!\[image\]\((https:\/\/image\.pollinations\.ai\/prompt\/[^)]+)\)/);
          
          if (urlMatch && urlMatch[1]) {
            // 提取成功，返回图片URL和中文描述
            const imageUrl = urlMatch[1];
            console.log('提取的图片URL:', imageUrl);
            
            // 提取中文描述部分
            const descriptionMatch = content.match(/生成后给出中文提示语([\s\S]*)/);
            const description = descriptionMatch ? descriptionMatch[1].trim() : "AI创作的图像";
            console.log('提取的中文描述:', description);
            
            // 设置进度为100%
            if (typeof progressCallback === 'function') {
              progressCallback(100);
              
              // 确保在完成时再次调用100%，让UI有时间更新
              setTimeout(() => {
                progressCallback(100);
              }, 200);
            }
            
            clearInterval(progressInterval);
            resolve({
              imageUrl: imageUrl,
              description: description,
              rawContent: content
            });
          } else {
            // 无法提取URL，尝试直接从内容中找出英文提示词并构建URL
            console.warn('无法从内容中提取URL，尝试其他方式');
            
            // 尝试提取英文提示词部分
            const englishPromptMatch = content.match(/prompt\/(.*?)(\?|$)/);
            if (englishPromptMatch && englishPromptMatch[1]) {
              const englishPrompt = englishPromptMatch[1];
              const constructedUrl = `https://image.pollinations.ai/prompt/${englishPrompt}?width=1024&height=1024&enhance=true&private=true&nologo=true&safe=true&model=flux`;
              console.log('构建的URL:', constructedUrl);
              
              // 设置进度为100%
              if (typeof progressCallback === 'function') {
                progressCallback(100);
                
                // 确保在完成时再次调用100%，让UI有时间更新
                setTimeout(() => {
                  progressCallback(100);
                }, 200);
              }
              
              clearInterval(progressInterval);
              resolve({
                imageUrl: constructedUrl,
                description: "AI根据您的提示创作的图像",
                rawContent: content
              });
            } else {
              // 完全无法提取，使用原始提示词构建URL
              const fallbackPrompt = encodeURIComponent(userPrompt);
              const fallbackUrl = `https://image.pollinations.ai/prompt/${fallbackPrompt}?width=1024&height=1024&enhance=true&private=true&nologo=true&safe=true&model=flux`;
              console.log('使用原始提示词构建URL:', fallbackUrl);
              
              // 设置进度为100%
              if (typeof progressCallback === 'function') {
                progressCallback(100);
                
                // 确保在完成时再次调用100%，让UI有时间更新
                setTimeout(() => {
                  progressCallback(100);
                }, 200);
              }
              
              clearInterval(progressInterval);
              resolve({
                imageUrl: fallbackUrl,
                description: "根据提示词直接生成的图像",
                rawContent: content
              });
            }
          }
        } else {
          // 请求失败
          console.error('Deepseek API请求失败:', res);
          clearInterval(progressInterval);
          
          // 确保在失败时也设置进度为100%，以便关闭进度条
          if (typeof progressCallback === 'function') {
            progressCallback(100);
          }
          
          reject({
            error: `请求失败，状态码: ${res.statusCode}`,
            data: res.data
          });
        }
      },
      fail: (err) => {
        console.error('网络请求失败:', err);
        clearInterval(progressInterval);
        
        // 确保在失败时也设置进度为100%，以便关闭进度条
        if (typeof progressCallback === 'function') {
          progressCallback(100);
        }
        
        reject({
          error: '网络请求失败',
          details: err
        });
      }
    });
  });
};

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
  generateImage: (params, progressCallback) => {
    // 判断是否使用模拟数据（没有实际后端服务或明确设置了使用模拟数据）
    const useMockData = !app.globalData.apiBaseUrl || app.globalData.useMockData;
    
    console.log('是否使用模拟数据:', useMockData);
    
    if (useMockData) {
      console.log('使用模拟数据生成图片');
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
          
          console.log('模拟生成图片:', imageUrl);
          
          // 返回模拟数据
          resolve({
            imageUrl: imageUrl,
            width: params.width,
            height: params.height,
            prompt: params.prompt,
            style: params.style,
            description: "这是一个AI生成的图像，根据您的提示生成"
          });
        }, 3000) // 模拟3秒网络延迟
      });
    }
    
    console.log('调用真实的Deepseek API');
    // 生产环境使用 Deepseek API
    return callDeepseekAPI(params, progressCallback)
      .then(res => {
        console.log('Deepseek API响应成功:', res);
        return {
          imageUrl: res.imageUrl,
          width: params.width,
          height: params.height,
          prompt: params.prompt,
          style: params.style,
          description: "AI根据您的提示创作的图像:" + res.description
        };
      })
      .catch(err => {
        console.error('Deepseek API调用失败:', err);
        // 在API调用失败的情况下，返回一个错误信息和默认图片
        showError('AI接口调用失败，请稍后重试');
        
        // 使用备选方案：直接使用pollinations.ai生成
        // 将所有参数转换为字符串并拼接
        const userPrompt = Object.entries(params)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');

        console.log('发送到pollinations.ai的提示词:', userPrompt);
        const fallbackPrompt = encodeURIComponent(userPrompt);
        const fallbackUrl = `https://image.pollinations.ai/prompt/${fallbackPrompt}?width=1024&height=1024&enhance=true&private=true&nologo=true&safe=true&model=flux`;
        
        // 确保进度达到100%
        if (typeof progressCallback === 'function') {
          progressCallback(100);
        }
        
        return {
          imageUrl: fallbackUrl,
          width: params.width,
          height: params.height,
          prompt: params.prompt,
          style: params.style,
          description: "备用方案生成的图像"
        };
      });
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
        }
      })
    })
  }
} 