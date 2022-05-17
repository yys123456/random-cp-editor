#### 某不科学的信竞编辑器

使用electron UI ➕ node.js ➕ C++ 简易沙箱制作

<img src ="image/1.jpg">

**支持特性：**

1. 文件另存为/打开
2. 背景图片设置
3. 无需保存即可编译运行
4. 远端编译配置`config.json`（IP可以配置为`127.0.0.1:xxxx`实现本地运行，但是仅支持Linux）
5. 透明度调节（`F9 F10`）

**注意：**配置`config.json`的时候，需要保证node.js服务器（启动judge-server中的server.js）监听的端口号和`config.json`中的相同

### 2021.11.24 update

1. 切换主题（支持textmate和monokai）
2. 支持信竞代码模板，支持根据喜好更改template文件
3. 支持f5刷新模板
4. 修改字体为Monaco
5. 自动补全

#### todo list

1. 修改字体✅

### Instruction

`F9 F10`透明度

`F11 F12`呼出输入输出面板，编译运行

`F5`刷新模板

### 2022.1.18 update

1. 4种字体支持

2. 模板自由设定
3. 用户偏好信息记忆（窗口位置，大小，字体信息，背景，透明度等）
4. 删除多余的自动补全功能

#### todo list

1. 系统cmd调用，本地运行（可能会用java来做）（屏蔽系统调用，文件操作...）
2. 远程沙盒完善（屏蔽系统调用，文件操作...）
3. 支持服务器自行配置
4. 合入各大OJ接口，提供交题服务
5. 多文件

### 2022.1.30 update

支持透明窗口

### 2022.2.3 update

支持windows本地运行