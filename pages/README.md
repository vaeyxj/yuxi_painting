# 页面文件目录

本目录包含微信小程序的所有页面文件，每个页面通常由 .js、.wxml、.wxss 和 .json 四个文件组成。

## 主要页面

- `index/` - 首页，展示应用的主要功能入口和推荐内容
- `user/` - 用户中心，管理用户信息和账户设置
- `draw/` - AI绘图功能，基于文本生成图像
- `dress/` - AI换装功能，为上传的人物图片更换服装
- `expand/` - AI扩图功能，智能扩展图片尺寸
- `restore/` - AI高清修复功能，修复和增强图片质量
- `avatar/` - AI头像生成功能，生成个性化头像
- `community/` - 社区页面，用户可以分享和浏览作品
- `works/` - 作品管理页面，查看和管理自己的作品

## 页面开发规范

1. **文件命名**
   - 页面目录使用小写字母，多个单词用连字符连接
   - 示例：`user-profile`，`work-detail`

2. **代码组织**
   - 每个页面的业务逻辑应该封装在对应的 .js 文件中
   - 页面样式应当在对应的 .wxss 文件中定义
   - 公共样式应提取到 app.wxss 中

3. **页面结构**
   - 每个页面应有清晰的结构和语义化的标签
   - 复杂页面应拆分为多个组件，提高代码可维护性

4. **页面间传参**
   - 页面间传递参数应当使用 URL 查询字符串
   - 示例：`wx.navigateTo({ url: '/pages/detail/detail?id=123' })`

## 性能优化

- 避免页面中使用大量的计算和DOM操作
- 合理使用 setData，避免频繁调用和传递大量数据
- 图片资源应进行适当压缩，减少加载时间
- 合理使用分页加载，避免一次性加载大量数据 