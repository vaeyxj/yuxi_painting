# 静态资源处理指南

## 背景

为优化小程序包体积和加载性能，我们将静态资源（如图片、音频等）统一放置到云存储服务上。本指南介绍如何使用我们的工具函数处理静态资源路径。

## 全局配置

静态资源的域名已经在 `app.js` 的 `globalData` 中配置：

```javascript
globalData: {
  // ...其他配置
  STATIC_DOMAIN: 'https://yuxi-painting.tos-cn-beijing.volces.com', // 静态资源域名
  // ...其他配置
}
```

## 使用方法

### 1. 在 WXML 中使用（推荐方式）

在 WXML 中，我们提供了一个 WXS 模块处理静态资源路径，这是**最推荐**的使用方式：

```html
<!-- 在 WXML 文件顶部引入 -->
<wxs src="../../utils/common.wxs" module="common" />

<!-- 在标签中使用 -->
<image src="{{common.getStaticUrl('/static/images/hero/ai-robot.png')}}" mode="aspectFit"></image>
```

### 2. 在 JS 中处理数据

在页面 JS 文件中，可以使用 `app.processStaticPaths` 函数处理数据对象中的静态资源路径：

```javascript
const app = getApp();

// 处理数据
const data = [
  { imageUrl: '/static/images/banner1.jpg' },
  { imageUrl: '/static/images/banner2.jpg' }
];

const processedData = app.processStaticPaths(data, ['imageUrl']);

// 结果：
// [
//   { imageUrl: 'https://yuxi-painting.tos-cn-beijing.volces.com/static/images/banner1.jpg' },
//   { imageUrl: 'https://yuxi-painting.tos-cn-beijing.volces.com/static/images/banner2.jpg' }
// ]
```

### 3. 页面增强方法

为了简化页面开发，我们提供了 `app.enhancePage` 函数来自动注入静态资源处理功能：

```javascript
const app = getApp();

// 使用 app.enhancePage 包装页面配置
Page(app.enhancePage({
  data: {
    // 页面数据...
  },
  
  onLoad() {
    // 页面加载逻辑...
  },
  
  // 其他页面方法...
}));
```

## 图片路径处理最佳实践

由于微信小程序的特殊机制，我们推荐使用以下方式处理静态资源路径：

1. **WXML 中的图片路径**：使用 WXS 模块处理（最推荐）
   ```html
   <wxs src="../../utils/common.wxs" module="common" />
   <image src="{{common.getStaticUrl('/static/images/example.png')}}"></image>
   ```

2. **JS 中的数据处理**：使用 `app.processStaticPaths`
   ```javascript
   const processedData = app.processStaticPaths(data, ['imageUrl', 'icon']);
   this.setData({ dataList: processedData });
   ```

3. **硬编码完整路径**：在某些场景下可以直接使用完整URL
   ```html
   <image src="https://yuxi-painting.tos-cn-beijing.volces.com/static/images/example.png"></image>
   ```

## 代码示例

### 页面完整示例

```html
<!-- index.wxml -->
<wxs src="../../utils/common.wxs" module="common" />

<view class="container">
  <!-- 使用 WXS 模块处理图片路径 -->
  <image src="{{common.getStaticUrl('/static/images/banner.png')}}"></image>
  
  <!-- 列表数据 (已在 JS 中处理过) -->
  <view wx:for="{{works}}" wx:key="id">
    <image src="{{item.cover}}"></image>
  </view>
</view>
```

```javascript
// index.js
const app = getApp();

Page(app.enhancePage({
  data: {
    banners: [],
    works: []
  },
  
  onLoad() {
    // 获取数据
    this.getBanners();
    this.getWorks();
  },
  
  getBanners() {
    // 模拟数据
    const banners = [
      { imageUrl: '/static/images/banner1.jpg' },
      { imageUrl: '/static/images/banner2.jpg' }
    ];
    
    // 处理路径
    const processedBanners = app.processStaticPaths(banners, ['imageUrl']);
    
    this.setData({ banners: processedBanners });
  },
  
  getWorks() {
    // 模拟API请求
    const works = [
      { cover: '/static/images/work1.jpg', title: '作品1' },
      { cover: '/static/images/work2.jpg', title: '作品2' }
    ];
    
    // 处理路径
    const processedWorks = app.processStaticPaths(works, ['cover']);
    
    this.setData({ works: processedWorks });
  }
}));
```

## 问题排查

如果静态资源无法正常加载，请检查以下几点：

1. 确认资源路径是否正确（以 `/static/` 开头）
2. 确认云存储服务是否正常
3. 检查是否正确引入了 WXS 模块：`<wxs src="../../utils/common.wxs" module="common" />`
4. 确认 WXS 模块路径是否正确（使用相对路径）
5. 检查控制台是否有网络请求错误

## WXS 模块说明

我们使用 WXS 模块处理静态资源路径，是因为:

1. WXS 在视图层执行，性能更好
2. 避免了 JS 和 WXML 数据传递的复杂性
3. 确保所有页面使用统一的路径处理逻辑

如有疑问，请联系技术支持团队。 