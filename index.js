const electron = require("electron")
const url = require('url')
const path = require('path')
const exec = require('child_process').exec;
const {app, BrowserWindow, Menu, dialog, ipcMain} = electron

// const bgfilepath = "./background/info"
// const cfgpath = "./config.json"
// const tempPath = "./template/template.cpp"
const preferencePath = "./user/preference.json"

let mainWindow;
let filePath;
let imgPath;
let templatePath;
let server;
let fontPath;
let themeName;
let opacity;
let fontSize;
let cmode;

var options_open = {
	title: "打开文件",
	properties: ['openFile'],
	buttonLabel : "打开",
	filters :[
		{name: 'c++文件', extensions: ['cpp']}
	]
};

var options_save = {
	title: "存储文件",
	defaultPath : "filename",
	buttonLabel : "存储",
	filters :[
		{name: 'c++文件', extensions: ['cpp']}
	]
};


var options_img = {
	title: "打开文件",
	properties: ['openFile'],
	buttonLabel : "打开",
	filters :[
		{name: '图片文件', extensions: ['jpg', 'jpeg', 'png', 'bmp']}
	]
};

app.on('ready', function(){
	var fs = require('fs');
	// 读取appearance
	fs.readFile(preferencePath, 'utf-8', (err, data) => {
		  	if(err){
				return;
		  	}
	  	json = JSON.parse(data)
	  	imgPath = json["background"]
	  	fontPath = json["font"]
	  	fontSize = json["fontsize"]
	  	themeName = json["theme"]
	  	opacity = json["opacity"]
	  	bounds = json["bounds"]
	  	server = json["server"]
	  	templatePath = json["template"]
	  	cmode = json["cmode"]
	  	mainWindow = new BrowserWindow({
				    webPreferences: {
				      nodeIntegration: true,
				      contextIsolation: false,
				    },
				    frame: !cmode,
				    transparent:cmode,
				    x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height,
				    icon: __dirname + '/icons/ico.ico',
				    });

	  	mainWindow.loadURL(url.format({
			pathname: path.join(__dirname, 'index.html'),
			protocol: 'file:',
			slashes: true
		}))

		const mainMenu = Menu.buildFromTemplate(mainMenuTemplate)
		Menu.setApplicationMenu(mainMenu);
		mainWindow.webContents.once('dom-ready', () => {
			  	mainWindow.webContents.send('image', imgPath) // 初始化前台的背景图片
			  	mainWindow.webContents.send('theme', themeName) // 初始化前台的主题
			  	mainWindow.webContents.send('font', fontPath) // 初始化前台的字体
			  	mainWindow.webContents.send('fontSize', fontSize) // 初始化前台的字体大小
				mainWindow.webContents.send('opacity', opacity) // 初始化前台的透明度

		});

		mainWindow.on('close', function(e) {
			var obj = {
				font:fontPath,
				fontsize:fontSize,
				background:imgPath,
				theme:themeName,
				opacity:opacity,
				bounds:mainWindow.getBounds(),
				server:server,
				template:templatePath,
				cmode:cmode
			}
			// console.log(JSON.stringify(obj))
			var fs = require('fs');
			fs.writeFileSync(preferencePath, JSON.stringify(obj, null, "\t"));
		});
		// mainWindow.webContents.openDevTools()
	})

	// mainWindow.setBackgroundColor("#FFFF0000")

	//mainWindow.webContents.openDevTools();

	// mainWindow.webContents.once('dom-ready', () => {
		
	// 	fs.readFile(bgfilepath, 'utf-8', (err, data) => {
	//   	if(err){
	// 		return;
	//   	}
	//   	imgPath = data
	//   	mainWindow.webContents.send('image', imgPath)
	// 	});
	// });

	
})

ipcMain.on('save', function(e, v){
	var fs = require('fs');	
	fs.writeFileSync(filePath, v, 'utf-8');
})

ipcMain.on('opacity', function(e, v){
	opacity = v;
	// console.log(opacity)
})

ipcMain.on('fontSize', function(e, v){
	fontSize = v;
	// console.log(fontSize)
})

ipcMain.on('local', function(e, v){
	var fs = require('fs');	
	fs.writeFile('./run/a.cpp', v, err => {
		if (err) {
			console.error(err)
			return
		}
		exec('start cmd.exe /C "cd run && run"');
	})
})

ipcMain.on('code&input', function(e, v){
	const axios = require('axios')

	axios
	  .post(server, {
	    code: v[0],
	    input: v[1]
	  })
	  .then(res => {
	    mainWindow.webContents.send('ret', res["data"]);
	  })
	  .catch(error => {
	  	mainWindow.webContents.send('ne', "network error");
	  })

})

ipcMain.on('refresh', function(e, v){
	var fs = require('fs');
	fs.readFile(templatePath, 'utf-8', (err, data) => {
		if(err){
			return;
		}
		mainWindow.webContents.send('template', data)
	});
})


const mainMenuTemplate = [
	{
		label: 'File',
		submenu:[
			{
				label: '打开',
				accelerator: process.platform == 'darwin' ? 'command + o' : 'ctrl + o',
				click(){
					// open
			     	dialog.showOpenDialog(mainWindow, options_open).then(result => {
					  if(!result.canceled){
					  	var fs = require('fs');
					  	filePath__ = result.filePaths[0];
					  	fs.readFile(result.filePaths[0], 'utf-8', (err, data) => {
					  	if(err){
							return;
					  	}
					  	mainWindow.webContents.send('read', data)
    					});
					  }

				    })
				}
			},
			{
				label: '存储',
				accelerator: process.platform == 'darwin' ? 'command + s' : 'ctrl + s',
				click(){
					dialog.showSaveDialog(mainWindow, options_save).then(result => {
						if(!result.canceled){
							filePath = result.filePath
							mainWindow.webContents.send('save', result.filePath)
						}
					});
				}
			},
			{
				label: '主题',
				submenu: [
				    {
				    	label: "Monokai",
				    	click(){
				    		themeName = "monokai"
				    		mainWindow.webContents.send('theme', "monokai")
				    	}
				    },
				    {
				    	label: "Textmate",
				    	click(){
				    		themeName = "textmate"
				    		mainWindow.webContents.send('theme', "textmate")
				    	}
				    }
			    ]
			},
			{
				label: '字体',
				submenu: [
				    {
				    	label: "Monaco",
				    	click(){
				    		fontPath = "./font/Monaco.ttf";
				    		mainWindow.webContents.send('font', fontPath)
				    	}
				    },
				    {
				    	label: "JetBrainsMono",
				    	click(){
				    		fontPath = "./font/JetBrainsMono.ttf";
				    		mainWindow.webContents.send('font', fontPath)
				    	}
				    },
				    {
				    	label: "SourceCodePro",
				    	click(){
				    		fontPath = "./font/SourceCodePro-Semibold.ttf"
				    		mainWindow.webContents.send('font', fontPath)
				    	}
				    },
				    {
				    	label: "GNU",
				    	click(){
				    		fontPath = "./font/FreeMono.ttf"
				    		mainWindow.webContents.send('font', fontPath)
				    	}
				    }
			    ]
			},
			{
				label: '背景图片',
				click(){
					dialog.showOpenDialog(mainWindow, options_img).then(result => {
					  if(!result.canceled){
					  	var fs = require('fs');
					  	imgPath = result.filePaths[0]
					  	// fs.writeFileSync('./background/info', imgPath, 'utf-8')
					  	mainWindow.webContents.send('image', imgPath)
					  }
				}
				)}
			},
			{
				label: '选择模板',
				click(){
					dialog.showOpenDialog(mainWindow, options_open).then(result => {
					  if(!result.canceled){
					  	var fs = require('fs');
					  	templatePath = result.filePaths[0]
					  }
				}
				)}
			}
		]
	}
]