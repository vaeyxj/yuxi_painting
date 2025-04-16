const app = getApp()

Page({
  data: {
    works: [],
    currentTab: 'latest'
  },

  onLoad: function (options) {
    // 加载作品数据
    this.getWorks()
  },

  onShow: function () {
    // 每次显示页面时刷新数据
    this.getWorks()
  },

  // 获取作品数据
  getWorks: function() {
    // 这里应该请求后端接口获取数据
    // 以下为模拟数据
    this.setData({
      works: [
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
  onWorkTap: function(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/work-detail/work-detail?id=${id}`
    })
  },

  // 切换选项卡
  switchTab: function(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({
      currentTab: tab
    })
    // 根据选项卡重新加载数据
    this.getWorks()
  }
}) 