const { app, BrowserWindow, Menu, globalShortcut } = require('electron');
const path = require('path');
const isDev = require("electron-is-dev");
const net = require('net');
const { spawn } = require('child_process');
const find = require("find-process");

// let loader = spawn('python', [ 'manage.py', 'runserver', '127.0.0.1:8000'], {
//   cwd: path.join(__dirname, '../group_anaysis/'),
// });

let loader = spawn('manage.exe', ['runserver']);

let mainWindow, loading;

function createWindowHelper() {
  loading = new BrowserWindow({
    width: 640, height: 500,
    show: false,
    // frame: false
  })

  // global.sharedObject = {
  //   establisted: false
  // }

  // remote.getGlobal('sharedObject').someProperty = 'new value';

  loading.once('show', () => {
    mainWindow = new BrowserWindow({
      // width: 1080, height: 960,
      // webPreferences: { webSecurity: false },
      show: false,
    })

    mainWindow.webContents.once('dom-ready', () => {
      console.log('main loaded')
      mainWindow.show()
      loading.hide()
      loading.close()
    })
  })

  loading.loadURL(`${path.join(__dirname, "../build/loading.html")}`)
  loading.show()

  let establisted = false;
  let count = 0
  let id;

  // eslint-disable-next-line
  id = setTimeout(function tick() {
    portInUse(8000, function (value) {
      console.log('testPort: ' + value);

      if (value === false && count < 50) {
        count++;
        id = setTimeout(tick, 1500);
      } else if (value === true) {
        clearTimeout(id);

        if (establisted === false) {
          establisted = true;
          createWindow();
        }
      }
    })
  }, 1500)
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


  // 关闭window时触发下列事件.
  mainWindow.on('closed', function () {
    mainWindow = null;
  })

  mainWindow.maximize();

  mainWindow.webContents.openDevTools()


  // mainWindow.on('resize', function(event) {
  //   event.preventDefault();
  //   mainWindow.setFullScreen(true)
  // });
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

app.whenReady().then(() => {
  globalShortcut.register('F11', () => {
    let flag = mainWindow.isFullScreen();
    mainWindow.setFullScreen(!flag);
  })

  globalShortcut.register('F12', () => {
    mainWindow.webContents.openDevTools()
  })
})

// 所有窗口关闭时退出应用.
app.on('window-all-closed', async function () {
  // macOS中除非用户按下 `Cmd + Q` 显式退出,否则应用与菜单栏始终处于活动状态.
  if (process.platform !== 'darwin') {

    try {
      let list = await find('name', 'man  age.exe');
      // console.log(list.length)
      list.forEach(e => {
        process.kill(e.pid)
      })
    } catch(err) {
      console.log(err);
    }
    app.quit()
  }
})

app.on('activate', function () {
  // macOS中点击Dock图标时没有已打开的其余应用窗口时,则通常在应用中重建一个窗口
  if (mainWindow === null) {
    createWindowHelper()
  }
})

app.on('before-quit', function () {
  globalShortcut.unregisterAll();
})         