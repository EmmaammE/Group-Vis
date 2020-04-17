This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

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