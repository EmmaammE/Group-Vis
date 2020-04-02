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