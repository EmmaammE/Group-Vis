This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).
、
后端端口说明： 默认为23333端口，

开发模式和react分支，只代理了23333端口。

打包后会从23333开始找未在使用的端口

## 命令说明

### `yarn react-start` 

启动react项目<br /> 

单独启动react项目会报错，需要切换到react分支

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

可能会因为内存不足，网页崩溃， 所以设置了最大内存

### `yarn electron-start`

通过electron启动app

### `yarn start`

上面两个命令合在一起

## 配置说明

- .env文件: 设置不默认打开浏览器页面
- .yarnrc文件： 在安装electron electron-builder过程中可能会出现网络问题，换一下yarn镜像

## 样式

在App.css里写全局的样式，后面用到组件里。

命名： g-XXX 

颜色： 在root中写自定义变量

## 中英文切换

reducers/index.js文件中， 修改KEY的初始值

en_name: 英文

name: 中文

## 群体对比数据流说明

- 对比的群体：

    存储在store.vennstep（Array）中， 默认为选择的最后两个群体的step.

- 请求两个群体合并分析的结果：
    
    actions/step.js | function compareGroup 

- 两个群体的人的状态：

    actions/step.js | function getPeopleStatus(people

- 数据存储：

    为了方便，直接存储在group中，键为 step1-step2 (String)

    查看：
    - actions/step.js | function compareGroup | socket.onmessage

    - actions/step.js | function updateFourViews | type = 3

        （目前只放了地图、降维图、人、主题）