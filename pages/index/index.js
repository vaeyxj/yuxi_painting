const app = getApp()

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    canIUseGetUserProfile: false,
    canIUseOpenData: wx.canIUse('open-data.type.userAvatarUrl') && wx.canIUse('open-data.type.userNickName'),
    
    // 功能卡片数据
    features: [
      {
        id: 'draw',
        name: 'AI绘画',
        icon: '/static/images/features/palette.png',
        path: '/pages/draw/draw',
        desc: '让你也成为天才画家',
        rightImage: '/static/images/features/draw-right.png'
      },
      {
        id: 'anime',
        name: 'AI转动漫',
        icon: '/static/images/features/anime-avatar.png',
        path: '/pages/anime/anime',
        desc: '让自己成为漫画的主角',
        rightImage: '/static/images/features/anime-right.png'
      },
      {
        id: 'face-swap',
        name: 'AI换脸',
        icon: '/static/images/features/face-swap.png',
        path: '/pages/face-swap/face-swap',
        desc: '让你轻松掌握易容术',
        rightImage: '/static/images/features/face-right.png'
      },
      {
        id: 'avatar',
        name: 'AI头像生成器',
        icon: '/static/images/features/avatar-maker.png',
        path: '/pages/avatar/avatar',
        desc: '让你DIY制作 AI萌拍头像',
        rightImage: '/static/images/features/avatar-right.png'
      }
    ],
    
    // 交互元素数据
    interactionIcons: [
      {
        id: 'chat',
        icon: '/static/images/icons/chat.png',
      },
      {
        id: 'video',
        icon: '/static/images/icons/video.png',
      },
      {
        id: 'cloud',
        icon: '/static/images/icons/cloud.png',
      }
    ],
    
    // 精选作品展示
    featuredWorks: [],
    // 轮播图数据
    banners: [],
    // 英雄区域数据
    heroData: {
      robotIcon: '/static/images/hero/ai-robot.png',
      speechBubble: '世界',
      controlText: '玩法多样'
    },
    // 会员信息
    membershipInfo: {
      title: '开通会员',
      desc: '解锁全部高级功能，享受无限创作'
    },
    
    // 当前激活的选项卡
    activeTab: 'home'
  },
  
  onLoad() {
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true
      })
    }
    
    // 获取轮播图数据
    this.getBanners()
    // 获取精选作品
    this.getFeaturedWorks()
    
    // 调试代码，查看banners数组
    setTimeout(() => {
      console.log('当前轮播图数据:', this.data.banners)
    }, 1000)
  },
  
  // 获取用户信息
  getUserProfile(e) {
    wx.getUserProfile({
      desc: '用于完善会员资料',
      success: (res) => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    })
  },
  
  // 功能导航
  navigateToFeature(e) {
    const { path } = e.currentTarget.dataset
    wx.navigateTo({
      url: path
    })
  },
  
  // 获取轮播图数据
  getBanners() {
    // 这里应该请求后端接口获取数据
    // 以下为模拟数据
    this.setData({
      banners: [
        {
          id: 1,
          imageUrl: '/static/images/banners/banner1.jpg',
          linkUrl: '/pages/draw/draw'
        },
        {
          id: 2,
          imageUrl: '/static/images/banners/banner2.png',
          linkUrl: '/pages/dress/dress'
        },
        {
          id: 3,
          imageUrl: '/static/images/banners/banner3.png',
          linkUrl: '/pages/expand/expand'
        }
      ]
    })
  },
  
  // 获取精选作品
  getFeaturedWorks() {
    // 这里应该请求后端接口获取数据
    // 以下为模拟数据
    this.setData({
      featuredWorks: [
        {
          id: 1,
          imageUrl: '/static/images/works/work1.jpg',
          title: '星空下的城市',
          author: '创作者A',
          likes: 256
        },
        {
          id: 2,
          imageUrl: '/static/images/works/work2.jpg',
          title: '梦幻森林',
          author: '创作者B',
          likes: 188
        },
        {
          id: 3,
          imageUrl: '/static/images/works/work3.jpg',
          title: '未来世界',
          author: '创作者C',
          likes: 342
        },
        {
          id: 4,
          imageUrl: '/static/images/works/work4.jpg',
          title: '古典风景',
          author: '创作者D',
          likes: 120
        }
      ]
    })
  },
  
  // 点击作品
  onWorkTap(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/work-detail/work-detail?id=${id}`
    })
  },
  
  // 轮播图点击
  onBannerTap(e) {
    const { url } = e.currentTarget.dataset
    wx.navigateTo({
      url
    })
  },
  
  // 底部导航栏跳转
  navigateToTab(e) {
    const { page } = e.currentTarget.dataset
    
    // 根据选项卡切换页面
    switch(page) {
      case 'draw':
        wx.navigateTo({
          url: '/pages/draw/draw'
        })
        break
      case 'gallery':
        wx.navigateTo({
          url: '/pages/gallery/gallery'
        })
        break
      case 'digital-human':
        wx.navigateTo({
          url: '/pages/digital-human/digital-human'
        })
        break
      case 'profile':
        wx.navigateTo({
          url: '/pages/profile/profile'
        })
        break
      default:
        // 默认处理
        break
    }
    
    this.setData({
      activeTab: page
    })
  },
  
  // 点击英雄区域
  onHeroTap() {
    // 可以导航到某个主推功能或者活动页
    wx.navigateTo({
      url: '/pages/draw/draw'
    })
  },
  
  // 会员卡点击处理
  onMembershipTap() {
    wx.navigateTo({
      url: '/pages/membership/membership'
    })
  },
  
  // CTA按钮点击 - 已通过navigateToFeature处理，此方法可选
  onCtaTap() {
    wx.navigateTo({
      url: '/pages/draw/draw'
    })
  }
}) 