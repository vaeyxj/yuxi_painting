const app = getApp()

Page({
  data: {
    features: [
      {
        id: 1,
        title: '形象定制',
        desc: '创建专属数字人形象',
        imageUrl: '/static/images/digital-human/customize.jpg',
        path: '/pages/digital-human/customize/customize'
      },
      {
        id: 2,
        title: '语音合成',
        desc: '为数字人添加声音',
        imageUrl: '/static/images/digital-human/voice.jpg',
        path: '/pages/digital-human/voice/voice'
      },
      {
        id: 3,
        title: '数字人互动',
        desc: '与AI数字人对话',
        imageUrl: '/static/images/digital-human/interact.jpg',
        path: '/pages/digital-human/interact/interact'
      },
      {
        id: 4,
        title: '视频生成',
        desc: '制作数字人视频',
        imageUrl: '/static/images/digital-human/video.jpg',
        path: '/pages/digital-human/video/video'
      }
    ],
    samples: [
      {
        id: 1,
        name: '智能助手',
        category: '服务型',
        imageUrl: '/static/images/digital-human/sample1.jpg'
      },
      {
        id: 2,
        name: '数字主播',
        category: '媒体型',
        imageUrl: '/static/images/digital-human/sample2.jpg'
      },
      {
        id: 3,
        name: '虚拟歌手',
        category: '娱乐型',
        imageUrl: '/static/images/digital-human/sample3.jpg'
      },
      {
        id: 4,
        name: '教育讲师',
        category: '教育型',
        imageUrl: '/static/images/digital-human/sample4.jpg'
      },
      {
        id: 5,
        name: '定制形象',
        category: '个性化',
        imageUrl: '/static/images/digital-human/sample5.jpg'
      }
    ]
  },

  onLoad: function (options) {
    // 初始化数据
  },

  // 导航到具体功能
  navigateToFeature: function(e) {
    const path = e.currentTarget.dataset.path
    wx.navigateTo({
      url: path
    })
  },

  // 点击样例
  onSampleTap: function(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/digital-human/sample-detail/sample-detail?id=${id}`
    })
  }
}) 