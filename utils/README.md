# 工具函数目录

本目录包含应用的各种工具函数和UI逻辑，已完成重构以移除所有后端依赖。

## 重构说明

为了优化小程序包体积和加载性能，我们已经完成了以下重构：

1. 移除了所有真实后端API调用代码
2. 使用本地数据模拟替代网络请求
3. 将所有异步操作改为基于Promise的模拟延迟实现
4. 保留了完整的UI交互逻辑和界面流程

## 主要文件

- `api.js` - 模拟API接口，处理与UI的所有交互逻辑
- `util.js` - 通用工具函数，如日期格式化、数据处理等

## 模拟API规范

`api.js` 文件中实现了所有模拟API，遵循以下规范：

1. 所有API函数返回Promise对象，保持与真实API调用一致的接口
2. 使用`mockRequest`函数统一处理模拟延迟和响应
3. 尽可能使用本地存储保存状态，模拟数据持久化
4. 模拟网络请求的超时和进度回调

示例：
```javascript
// 模拟获取用户信息
getUserInfo: () => {
  const userInfo = wx.getStorageSync('userInfo') || {
    nickName: '游客',
    avatarUrl: '/static/images/default-avatar.png',
    gender: 0,
    memberExpireTime: new Date().getTime() + 86400000 * 7,
    credits: 100
  }
  return mockRequest(userInfo)
}

// 模拟更新用户信息
updateUserInfo: (userInfo) => {
  console.log('模拟更新用户信息:', userInfo)
  // 更新本地存储
  const oldUserInfo = wx.getStorageSync('userInfo') || {}
  const newUserInfo = {...oldUserInfo, ...userInfo}
  wx.setStorageSync('userInfo', newUserInfo)
  return mockRequest(newUserInfo)
}
```

## 工具函数规范

`util.js` 文件中包含各种通用工具函数，遵循以下规范：

1. 函数具有单一职责，功能明确
2. 提供完整的参数说明和返回值说明
3. 考虑边界情况和错误处理
4. 不依赖后端服务，所有功能可离线使用

## 使用说明

在需要使用工具函数的页面或组件中，通过以下方式引入：

```javascript
const api = require('../../utils/api')
const util = require('../../utils/util')

// 调用模拟API
api.getUserInfo().then(res => {
  // 处理响应
})

// 使用工具函数
const formattedDate = util.formatTime(new Date())
```

## 本地存储使用

为了模拟后端数据持久化，我们使用了以下本地存储键：

- `userInfo` - 用户信息
- `token` - 模拟登录令牌
- `drawHistory` - 绘画历史记录

## 静态资源文件

所有模拟API返回的图片资源应放置在以下路径：

- `/static/images/samples/` - 示例图片
- `/static/images/default-avatar.png` - 默认头像

## 测试说明

所有功能都可以通过本地模拟数据进行测试，不依赖真实后端服务。部分功能（如会员检查）在开发环境下会随机通过一些检查，方便测试限制性功能。

## 小程序分包说明

为了优化小程序包体积，遵循以下分包规则：

1. 主包保持最小化，只包含核心功能和首页
2. 各功能模块（如AI绘图、社区等）使用分包加载
3. 工具函数放在主包中，便于各分包共享使用

## 优化方向

1. 进一步减少静态资源大小，考虑使用CDN加载
2. 优化本地存储使用，避免存储过大数据
3. 实现UI组件懒加载，提高首屏加载速度

# AI绘画功能技术文档

## 功能概述

AI绘画功能使用文生图（Text-to-Image）技术，根据用户提供的文字描述生成相应的图像。用户可以选择不同的风格，调整创意度和图像质量参数，生成符合自己需求的AI艺术作品。

## 页面结构

- **提示词输入区**：用户输入描述性文字
- **风格选择区**：提供多种预设风格选项
- **参数设置区**：调整创意度和图像质量
- **生成按钮**：触发AI绘画过程
- **结果展示区**：显示生成的图像及操作选项
- **历史记录区**：展示用户之前的创作记录

## API接口

### 生成图像接口

**接口路径**: `/draw/generate`

**请求方法**: `POST`

**请求参数**:

| 参数名 | 类型 | 必填 | 说明 |
|-------|------|-----|------|
| prompt | string | 是 | 文字描述，用于生成图像 |
| style | string | 是 | 风格ID，如realistic, cartoon, ink等 |
| creativity | number | 否 | 创意度，范围0-100，默认75 |
| quality | number | 否 | 图像质量，范围0-100，默认85 |
| width | number | 否 | 图像宽度，默认512 |
| height | number | 否 | 图像高度，默认512 |

**响应示例**:

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "imageUrl": "https://example.com/generated/image123.jpg",
    "prompt": "一片星空下的湖泊，倒映着满天繁星",
    "timestamp": 1678956123456
  }
}
```

## 存储规范

### 历史记录存储

历史记录使用微信小程序的本地存储功能(`wx.setStorageSync`)，存储在`drawHistory`键下。

存储格式:

```json
[
  {
    "id": 1678956123456,
    "prompt": "一片星空下的湖泊，倒映着满天繁星",
    "style": "写实风格",
    "imageUrl": "https://example.com/generated/image123.jpg",
    "timestamp": 1678956123456
  },
  // 更多历史记录...
]
```

## 前端配置

### 风格选项配置

风格选项在页面初始化时设置，可根据需要扩展或修改。目前支持以下风格:

- 写实风格 (realistic)
- 卡通风格 (cartoon)
- 水墨风格 (ink)
- 油画风格 (oil)
- 素描风格 (sketch)
- 动漫风格 (anime)
- 赛博朋克 (cyberpunk)
- 奇幻风格 (fantasy)

### 参数设置说明

- **创意度**: 值越高，生成的内容越有创意但可能偏离提示词
- **图像质量**: 值越高，生成的图像质量越好但耗时更长

## 开发注意事项

1. **适配性考虑**: 确保在不同尺寸的设备上都能正确显示
2. **错误处理**: 添加完善的错误处理和用户提示
3. **权限请求**: 保存图片时需要获取相册权限
4. **加载状态**: 生成图片过程中显示加载状态
5. **图像优化**: 考虑图像压缩和缓存策略

## 后期优化方向

1. **风格预览**: 为每个风格添加示例图片
2. **提示词辅助**: 提供热门提示词和自动补全功能
3. **批量生成**: 支持一次生成多张不同变体
4. **图像编辑**: 添加简单的图像编辑功能
5. **模型选择**: 支持选择不同的AI模型

## 使用示例

1. 输入提示词: "一片星空下的湖泊，倒映着满天繁星"
2. 选择风格: "写实风格"
3. 调整参数: 创意度80，质量90
4. 点击"开始创作"按钮
5. 等待图像生成完成
6. 保存或分享生成的图像 