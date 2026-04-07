import { app, BrowserWindow } from "electron";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
const __filename$1 = fileURLToPath(import.meta.url);
const __dirname$1 = dirname(__filename$1);
let mainWindow = null;
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname$1, process.env.VITE_DEV_SERVER_URL ? "../public/OZ-logos/favicons/android-chrome-512x512.png" : "../dist/OZ-logos/favicons/android-chrome-512x512.png"),
    titleBarStyle: "hidden",
    titleBarOverlay: {
      color: "rgba(0,0,0,0)",
      // Transparent, blends with HTML
      symbolColor: "#F0F0F0",
      height: 40
    },
    webPreferences: {
      preload: path.join(__dirname$1, "preload.js")
    }
  });
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname$1, "../dist/index.html"));
  }
  mainWindow.setMenuBarVisibility(false);
  mainWindow.removeMenu();
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}
app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
