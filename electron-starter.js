// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, dialog, protocol } = require('electron');
const url = require('url');
const path = require('path');
const fs = require('fs').promises;
const fg = require('fast-glob');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow() {
  // create protocol
  const protocolName = 'safe-file-protocol';
  protocol.registerFileProtocol(protocolName, (request, callback) => {
    const url = request.url.replace(`${protocolName}://`, '');
    try {
      return callback(decodeURIComponent(url));
    } catch (error) {
      // Handle the error as needed
      console.error(error);
    }
  });

  // Create the browser window.
  mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
    },
    width: 2000,
    height: 800,
  });

  // and load the index.html of the app.
  // const startUrl =
  //   process.env.ELECTRON_START_URL ||
  //   url.format({
  //     pathname: path.join(__dirname, '/../build/index.html'),
  //     protocol: 'file:',
  //     slashes: true,
  //   });
  // tmp
  const startUrl = 'http://localhost:3000/';
  mainWindow.loadURL(startUrl);

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

ipcMain.on('open-upload-config', async (event) => {
  try {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      title: 'Select labeling config file',
      properties: ['openFile'],
      filters: [
        {
          name: 'Config',
          extensions: ['json', 'JSON'],
        },
      ],
    });
    if (!canceled && filePaths.length > 0) {
      const buf = await fs.readFile(filePaths[0]);
      const config = JSON.parse(String(buf));
      event.sender.send('load-config', config);
    }
  } catch (error) {
    console.error(error);
    event.sender.send('load-config-error', error);
  }
});

ipcMain.on('open-workspace', async (event) => {
  try {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      title: 'Select workspace',
      properties: ['openDirectory'],
    });
    if (!canceled && filePaths.length > 0) {
      const imgList = await fg([
        `${filePaths[0]}/*.{jpg,JPG,png,PNG,jpeg,JPEG,bmp,BMP}`,
      ]);
      const imgURLs = imgList.map((imgp) => {
        return 'safe-file-protocol://' + imgp;
      });
      console.log(imgURLs);
      event.sender.send('selected-workspace', {
        workspacePath: filePaths[0],
        imgList: imgURLs,
      });
    }
  } catch (error) {
    console.error(error);
    event.sender.send('select-workspace-error', error);
  }
});
