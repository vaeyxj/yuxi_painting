# 工具函数目录

本目录包含应用的各种工具函数和通用逻辑，用于提高代码复用性和可维护性。

## 主要文件

- `api.js` - API接口封装，处理与后端服务的所有通信
- `util.js` - 通用工具函数，如日期格式化、数据处理等

## API 封装规范

`api.js` 文件中封装了所有与后端交互的接口，遵循以下规范：

1. 所有 API 函数应返回 Promise 对象
2. 统一处理请求错误和异常情况
3. 遵循 RESTful API 设计原则
4. 接口命名应清晰表达其功能

示例：
```javascript
// 获取用户信息
getUserInfo: () => {
  return request('/user/info', 'GET')
}

// 更新用户信息
updateUserInfo: (userInfo) => {
  return request('/user/update', 'POST', userInfo)
}
```

## 工具函数规范

`util.js` 文件中包含各种通用工具函数，遵循以下规范：

1. 函数应具有单一职责，功能明确
2. 提供完整的参数说明和返回值说明
3. 考虑边界情况和错误处理
4. 尽量保持纯函数设计，减少副作用

示例：
```javascript
/**
 * 日期格式化
 * @param {Date} date 日期对象
 * @param {String} fmt 格式字符串
 * @return {String} 格式化后的日期字符串
 */
const formatTime = (date, fmt = 'yyyy-MM-dd') => {
  // 实现代码
}
```

## 使用说明

在需要使用工具函数的页面或组件中，通过以下方式引入：

```javascript
const api = require('../../utils/api')
const util = require('../../utils/util')

// 调用 API
api.getUserInfo().then(res => {
  // 处理响应
})

// 使用工具函数
const formattedDate = util.formatTime(new Date())
``` 