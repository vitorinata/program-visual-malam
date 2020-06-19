const electron = require("electron")
const fs =  require("fs")
const uuid = require("uuid").v4;

const {app,  BrowserWindow, ipcMain, Menu} = electron

let mainWindow

let allApointments = []

fs.readFile("db.json", (err, jsonAppointments) => {
    if(!err){
        const oldAppointment = JSON.parse(jsonAppointments);
        allAppointment = oldAppointment;
    }
})

const createWindow = () => {
    mainWindow = new BrowserWindow({
        webPreference: {
            noteIntegration: true
        },
        title: "Doctor Appointments",
    })
    const startUrl = process.env.ELECTRON_START_URL || `file://${__dirname}/build/index.html`

    mainWindow.loadURL(startUrl)

    mainWindow.on("closed", () => {
        const jsonAppointment = JSON.stringify(allAppointments)
        fs.writeFileSync("db.json", jsonAppointment)

        app.quit()
        todayWindow = null
    })

    if(process.env.ELECTRON_START_URL){
        const mainMenu = Menu.buildFromTemplate(menuTemplate)
        Menu.setApplicationMenu(mainMenu)
    }else{
        Menu.setApplicationMenu(null)
    }
}

app.on("ready", createWindow)

ipcMain.on("appointment:create", (event, appointment) => {
    appointment["id"] = uuid()
    apppointment["done"] = 0

    allAppointment.push(appointment)
})

ipcMain.on("appointment:request:list:", (event) => {
    mainWindow.webContents.send("appointment:response:list", allAppointment)
})

ipcMain.on("appointment:request:today", (event) => {
    sendTodayAppointments()
})

ipcMain.on("appointment:done", (event, id) => {
    allAppointment.forEach((appointment) => {
        appointment["done"] = 1
    })
    sendTodayAppointments()
})

const sendTodayAppointments = () => {
    const today = new Date().toISOString.slice(0, 10)
    const filtered = allAppointment.filtered(
        (appointment) => appointment.date === today
    )

    mainWindow.webContents.send("appointment:response:today", filtered)
}

const menuTemplate = [
    {
        label:"View",
        submenu: [{role: "reload"}, {role: "toggledevtools"}],
    },
]