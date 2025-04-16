const app = getApp()
const api = require('../../utils/api')
const util = require('../../utils/util')

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUseGetUserProfile: false,
    isMember: false,
    memberExpireTime: '',
    usage: {
      drawCount: 0,
      dressCount: 0,
      expandCount: 0,
      restoreCount: 0,
      avatarCount: 0,
      totalCount: 0,
      dailyLimit: 3
    },
    workCount: 0,
    likeCount: 0,
    menuList: [
      {
        id: 'myWorks',
        name: '我的作品',
        icon: '/static/images/icons/works.png',
        path: '/pages/works/my-works'
      },
      {
        id: 'myCollect',
        name: '我的收藏',
        icon: '/static/images/icons/collect.png',
        path: '/pages/works/my-collect'
      },
      {
        id: 'membership',
        name: '会员中心',
        icon: '/static/images/icons/member.png',
        path: '/pages/membership/membership'
      },
      {
        id: 'history',
        name: '创作历史',
        icon: '/static/images/icons/history.png',
        path: '/pages/history/history'
      },
      {
        id: 'feedback',
        name: '意见反馈',
        icon: '/static/images/icons/feedback.png',
        path: '/pages/feedback/feedback'
      },
      {
        id: 'about',
        name: '关于我们',
        icon: '/static/images/icons/about.png',
        path: '/pages/about/about'
      }
    ]
  },

  onLoad: function (options) {
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true
      })
    }
  },

  onShow: function () {
    this.checkLogin()
    this.getUserInfo()
  },

  // 检查登录状态
  checkLogin: function () {
    const token = wx.getStorageSync('token')
    if (!token) {
      this.setData({
        hasUserInfo: false,
        userInfo: {}
      })
    }
  },

  // 获取用户信息
  getUserInfo: function () {
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      // 检查会员状态
      const isMember = util.checkMemberPermission()
      const memberExpireTime = userInfo.memberExpireTime ? util.formatTime(userInfo.memberExpireTime, 'yyyy-MM-dd') : ''
      
      this.setData({
        userInfo,
        hasUserInfo: true,
        isMember,
        memberExpireTime
      })
      
      // 获取用户使用情况
      this.getUserUsage()
      // 获取作品和点赞数量
      this.getWorksCount()
    }
  },

  // 获取微信用户信息并登录
  getUserProfile: function (e) {
    wx.getUserProfile({
      desc: '用于完善会员资料',
      success: (res) => {
        const userInfo = res.userInfo
        this.login(userInfo)
      },
      fail: (err) => {
        console.log('获取用户信息失败', err)
      }
    })
  },

  // 登录
  login: function (userInfo) {
    wx.showLoading({
      title: '登录中...',
    })
    
    wx.login({
      success: (res) => {
        if (res.code) {
          // 发送 res.code 到后台换取 openId, sessionKey, unionId
          api.login(res.code).then(data => {
            wx.hideLoading()
            // 保存token
            wx.setStorageSync('token', data.token)
            
            // 保存用户信息
            const userDataToSave = {
              ...userInfo,
              id: data.userId,
              memberExpireTime: data.memberExpireTime
            }
            wx.setStorageSync('userInfo', userDataToSave)
            
            // 更新页面数据
            const isMember = util.checkMemberPermission()
            const memberExpireTime = data.memberExpireTime ? util.formatTime(data.memberExpireTime, 'yyyy-MM-dd') : ''
            
            this.setData({
              userInfo: userDataToSave,
              hasUserInfo: true,
              isMember,
              memberExpireTime
            })
            
            // 获取用户使用情况
            this.getUserUsage()
            // 获取作品和点赞数量
            this.getWorksCount()
          }).catch(err => {
            wx.hideLoading()
            wx.showToast({
              title: '登录失败',
              icon: 'none'
            })
          })
        } else {
          wx.hideLoading()
          wx.showToast({
            title: '登录失败',
            icon: 'none'
          })
        }
      }
    })
  },

  // 获取用户使用情况
  getUserUsage: function () {
    // 实际项目中应该从后端获取
    // 这里使用模拟数据
    this.setData({
      usage: {
        drawCount: 15,
        dressCount: 7,
        expandCount: 3,
        restoreCount: 5,
        avatarCount: 10,
        totalCount: 40,
        dailyLimit: this.data.isMember ? 50 : 3
      }
    })
  },

  // 获取作品和点赞数量
  getWorksCount: function () {
    // 实际项目中应该从后端获取
    // 这里使用模拟数据
    this.setData({
      workCount: 23,
      likeCount: 48
    })
  },

  // 导航到菜单项
  navigateToMenu: function (e) {
    const { path } = e.currentTarget.dataset
    wx.navigateTo({
      url: path
    })
  },

  // 前往会员中心
  goToMembership: function () {
    wx.navigateTo({
      url: '/pages/membership/membership'
    })
  },

  // 退出登录
  logout: function () {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          // 清除本地存储的用户信息和token
          wx.removeStorageSync('userInfo')
          wx.removeStorageSync('token')
          
          // 更新页面数据
          this.setData({
            userInfo: {},
            hasUserInfo: false,
            isMember: false,
            memberExpireTime: '',
            usage: {
              drawCount: 0,
              dressCount: 0,
              expandCount: 0,
              restoreCount: 0,
              avatarCount: 0,
              totalCount: 0,
              dailyLimit: 3
            },
            workCount: 0,
            likeCount: 0
          })
        }
      }
    })
  }
}) 