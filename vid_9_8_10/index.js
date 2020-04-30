const electron = require("electron");
const uuid = require('uuid').v4;
uuid();
const fs = require('fs')

const {app, BrowserWindow, Menu, ipcMain} = electron;

let todayWindow;
let createWindow;
let listWindow;

let allAppointment = [];

fs.readFile("db.json", (err, jsonAppointments) => {
    if(!err){
        const oldAppointment = JSON.parse(jsonAppointments);
        allAppointment = oldAppointment;
    }
});

app.on("ready", ()=> {
    todayWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true
        },
        title: "Aplikasi Dokter"
    });
    todayWindow.loadURL(`file://${__dirname}/today.html`);
    todayWindow.on("closed", () => {

        const jsonAppointment = JSON.stringify(allAppointment);
        fs.writeFileSync("db.json", jsonAppointment);

        app.quit();
        todayWindow = null;
    });

    const mainMenu = Menu.buildFromTemplate(menuTemplate)
    Menu.setApplicationMenu(mainMenu);

});

const listWindowCreator = () => {
    listWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true
        },
        width: 600,
        height: 400,
        title: "All Apointments"
    });

    listWindow.setMenu(null);
    listWindow.loadURL(`file://${__dirname}/list.html`);
    listWindow.on("closed",() => (listWindow = null)); 
};

const createWindowCreator = () => {
    createWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true
        },
        width: 600,
        height: 400,
        title: "Create Apointments"
    });

    createWindow.setMenu(null);
    createWindow.loadURL(`file://${__dirname}/create.html`);
    createWindow.on("closed",() => (createWindow = null));
};


ipcMain.on("appointment:create", (event, appointment) => {
    appointment["id"] = uuid()
    appointment["done"] = 0
    allAppointment.push(appointment)
    sendTodayAppointments()
    createWindow.close()

    console.log(allAppointment);
});

ipcMain.on("appointment:request:list", (event) => {
    listWindow.webContents.send("appointment:response:list", allAppointment);
});

ipcMain.on("appointment:request:today", (event) => {
    sendTodayAppointments()
    console.log("here2")
})

ipcMain.on("appointment:done", (event, id) => {
    allAppointment.forEach((appointment) => {
        appointment["done"] = 1
    })
    sendTodayAppointments()
})

const sendTodayAppointments = () => {
    const today = new Date().toISOString().slice(0,10)
    const filtered = allAppointment.filter((appointment) => appointment.date === 
        today)

    todayWindow.webContents.send("appointment:response:today", filtered)
}


const menuTemplate = [{
    label: "File",
    submenu: [{
        label: "New Appointment",

        click() {
            createWindowCreator();
        }
        
    },
        {
        label: "All Appointment",
        click(){
        listWindowCreator();
        }
    },
        {
            label: "Quit",
            accelerator: process.platform === "darwin" ? "Command+Q" : 
            "Ctrl + Q",
            click(){
                app.quit();
                }
            }
        ]
    },

    {
        label: "View",
        submenu: [{ role: "reload"}, {role: "toggledevtools"}]
    }
    ]