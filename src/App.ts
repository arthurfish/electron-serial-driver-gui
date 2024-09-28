import { app, BrowserWindow } from "electron";
import * as path from "path";

app.on("ready", () => {
    console.log("App is ready");

    const win = new BrowserWindow({
        width: 600,
        height: 400,
        backgroundColor: "#FFFBF7",
        webPreferences: {
            nodeIntegration: true, // to allow require
            contextIsolation: false, // allow use with Electron 12+
            preload: path.join(__dirname, 'preload.js')
        }
    });

    const indexHTML = path.join(__dirname + "/public/index.html");
    win
        .loadFile(indexHTML)
        .then(() => {
            // IMPLEMENT FANCY STUFF HERE
        })
        .catch((e) => console.error(e));
});