# 玉玺AI绘画微信小程序

基于微信小程序平台开发的AI绘画应用，提供多种AI绘画相关功能。

## 功能介绍

- **AI绘图**：用户输入文字描述，AI生成相应的图像
- **AI换装**：将选定服装自然地应用到上传图片中的人物上
- **AI扩图**：将用户上传的图片智能扩展为更大尺寸
- **AI高清修复**：修复老旧、模糊、损坏的图片，提升清晰度
- **AI头像生成**：根据用户上传的照片生成卡通化头像

## 项目结构

```
├── app.js                 // 小程序入口文件
├── app.json               // 小程序配置文件
├── app.wxss               // 全局样式文件
├── pages                  // 页面文件
│   ├── index              // 首页
│   ├── user               // 用户页面
│   ├── draw               // AI绘图页面
│   ├── dress              // AI换装页面
│   ├── expand             // AI扩图页面
│   ├── restore            // AI高清修复页面
│   ├── avatar             // AI头像生成页面
│   ├── community          // 社区页面
│   └── works              // 作品页面
├── utils                  // 工具函数
│   ├── api.js             // API接口封装
│   └── util.js            // 通用工具函数
├── static                 // 静态资源文件
│   ├── images             // 图片资源
│   └── styles             // 样式资源
└── project.config.json    // 项目配置文件
```

## 开发环境

- 微信开发者工具 v1.06.2306020
- Node.js v16.x
- npm v8.x

## 安装与运行

1. 克隆项目到本地
```bash
git clone https://github.com/yourusername/yuxi-painting.git
```

2. 使用微信开发者工具打开项目目录

3. 开发者工具中点击"编译"按钮进行预览

## 后端API

项目中的 `utils/api.js` 文件包含了与后端API交互的接口封装。实际部署时，请修改 `app.js` 中的 `apiBaseUrl` 为您的实际后端API地址。

## 项目进度

- [x] 项目初始化
- [x] 首页开发
- [x] AI绘图功能
- [x] 用户中心
- [ ] AI换装功能
- [ ] AI扩图功能 
- [ ] AI高清修复功能
- [ ] AI头像生成功能
- [ ] 作品管理
- [ ] 社区功能
- [ ] 会员系统

## 设计资源

UI设计稿：[Figma设计链接](https://figma.com/your-design-link)

## 贡献

欢迎提交问题和功能需求，或直接提交Pull Request。

## 许可证

本项目使用 MIT 许可证 - 详见 LICENSE 文件