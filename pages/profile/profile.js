const app = getApp()

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUseGetUserProfile: false
  },

  onLoad: function (options) {
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true
      })
    }
  },

  // 获取用户信息
  getUserProfile: function(e) {
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

  // 导航到我的作品
  navigateToMyWorks: function() {
    wx.navigateTo({
      url: '/pages/myworks/myworks'
    })
  },

  // 导航到会员中心
  navigateToMembership: function() {
    wx.navigateTo({
      url: '/pages/membership/membership'
    })
  },

  // 导航到设置
  navigateToSettings: function() {
    wx.navigateTo({
      url: '/pages/settings/settings'
    })
  }
}) 