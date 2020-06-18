// 引入electron并创建一个Browserwindow
const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const isDev = require("electron-is-dev");
const net = require('net');

const exec = require('child_process').execFile;

let loader = exec('manage.exe', ['runserver'], (err, data) => {
  console.log(err)
  console.log(data.toString());
});

let m_pid = loader.pid;

let mainWindow;


function createWindowHelper() {
  mainWindow = new BrowserWindow({
    // width: 1080, height: 960,
    // webPreferences: { webSecurity: false },
    // show: false
  })

 
  let establisted = false;
  let count = 0
  let id;

  // eslint-disable-next-line
  id = setTimeout(function tick() {
    portInUse(8000, function (value) {
      console.log('testPort: ' + value);

      if (value === false && count < 50) {
        count++;
        id = setTimeout(tick, 5000);
      } else if (value === true) {
        clearTimeout(id);

        if (establisted === false) {
          establisted = true;
          createWindow();
        }
      }
    })
  }, 5000)
}

function createWindow() {
  console.log('invoke createWindow')
  mainWindow.loadURL(
    isDev ?
      "http://localhost:3000" :
      `${path.join(__dirname, "../build/index.html")}`);

  // mainWindow.once('ready-to-show', () => {
  //   // setTimeout(() => {
  //     mainWindow.show()
  //   // }, 2000);
  // })

  // mainWindow.webContents.openDevTools()

  // 关闭window时触发下列事件.
  mainWindow.on('closed', function () {
    mainWindow = null;
  })

  mainWindow.maximize();
  // mainWindow.setFullScreen(true)
  // 隐藏任务栏
  Menu.setApplicationMenu(null);
}

function portInUse(port, callback) {
  let server = net.createServer(function (socket) {
    socket.write('Echo server\r\n');
    socket.pipe(socket);
  });

  server.listen(port, '127.0.0.1');
  server.on('error', function (e) {
    callback(true);
  });
  server.on('listening', function (e) {
    server.close();
    callback(false);
  });
};

app.on('ready', createWindowHelper)

// 所有窗口关闭时退出应用.
app.on('window-all-closed', function () {
  // macOS中除非用户按下 `Cmd + Q` 显式退出,否则应用与菜单栏始终处于活动状态.
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // macOS中点击Dock图标时没有已打开的其余应用窗口时,则通常在应用中重建一个窗口
  if (mainWindow === null) {
    createWindowHelper()
  }
})

// app.on('before-quit', (e) => {
//   find('port', 8000)
//     .then(function (list) {
//       if (list[0] != null) {
//         process.kill(list[0].pid, 'SIGHUP');
//         console.log('kill')
//       }
//     }.catch((e) => {
//       console.log(e.stack || e);
//     }));
// });

app.on('before-quit', function () {
  process.kill(m_pid, function (err) {
    if (err) {
      throw new Error(err);
    }
    else {
      console.log('Process %s has been killed!', m_pid);
    }
  });
});