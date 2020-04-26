This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

### `yarn start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

后端： http://localhost:8080

## 备注

可能会因为内存不足，网页崩溃

"start": "react-scripts --max_old_space_size=6144 start "

并注释掉 actions/step.js 中的 dispatch(updateMatrix(matrixViewData));

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
