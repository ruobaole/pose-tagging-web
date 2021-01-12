const remote = require('electron').remote;
window.appQuit = function () {
  remote.app.exit(0);
};
