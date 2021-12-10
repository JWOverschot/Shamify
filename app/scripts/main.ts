import { app, BrowserWindow, globalShortcut } from 'electron'
import * as querystring from 'querystring'
import { IncomingHttpHeaders, ServerResponse } from 'http'
import { Helpers } from './helpers'
import { ApiProxy } from './api/proxy'
import { User } from './api/models/User'
import { Album } from './api/models/Album'
import { Playlist } from './api/models/Playlist'
import windowStateKeeper from 'electron-window-state'
import { AlbumTemplate } from './template/models/Album'
import { PlaylistTemplate } from './template/models/Playlist'
import { HeaderTemplate } from './template/models/Header'
import { FooterTemplate } from './template/models/Footer'
import { platform } from 'custom-electron-titlebar/lib/common/platform'
import { PlayState } from './api/types/playState'
import { PlayDirection } from './api/types/playDirection'
import { RepeatState } from './api/types/repeatState'
import { PagingPlaylist } from './api/types/pagingPlaylist'

const { client } = require('./client-keys')
const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const path = require('path')
const fs = require('fs')
const https = require('https')
const Store = require('electron-store')
const request = require('request')
const hogan = require('hogan.js')

// Constants
const exp = express()
const base_uri = 'https://127.0.0.1:8888/'
const client_id = client.id // Your client id
const client_secret = client.secret // Your secret
const redirect_uri = base_uri + 'callback/' // Your redirect uri
const stateKey = 'spotify_auth_state'
const ssl_key = fs.readFileSync(path.join(__dirname + '../../../key.pem'))
const ssl_cert = fs.readFileSync(path.join(__dirname + '../../../cert.pem'))

// Initalize apiProxy
let apiProxy: ApiProxy = new ApiProxy('')
const helpers: Helpers = new Helpers()
const store = new Store()

// You have to pass the directory that contains widevine library here, it is
// * `libwidevinecdm.dylib` on macOS,
// * `widevinecdm.dll` on Windows.
app.commandLine.appendSwitch('widevine-cdm-path', 'C:/Program Files (x86)/Google/Chrome/Application/77.0.3865.90/WidevineCdm/_platform_specific/win_x64/widevinecdm.dll')
// The version of plugin can be got from `chrome://components` page in Chrome.
app.commandLine.appendSwitch('widevine-cdm-version', '4.10.1503.4')
// Ignore certificate errors
app.commandLine.appendSwitch('ignore-certificate-errors', 'true')

store.onDidChange('access_token', (newValue: string, oldValue: string) => {
    console.log('access token changed')
    apiProxy = new ApiProxy(newValue)
})

const server = https.createServer({ key: ssl_key, cert: ssl_cert }, exp)

function updateAccessToken() {
    setTimeout(() => {
        console.log('update access token')
        let authOptions = {
            url: 'https://accounts.spotify.com/api/token',
            form: {
                grant_type: 'refresh_token',
                refresh_token: store.get('refresh_token')
            },
            headers: {
                'Authorization': 'Basic ' + (Buffer.from(client_id + ':' + client_secret).toString('base64'))
            },
            json: true
        }
        request.post(authOptions, (error: any, response: any, body: any) => {
            if (!error && response.statusCode === 200) {
    
                let access_token = body.access_token
                let token_expiration = body.expires_in
    
                store.set('access_token', access_token)
                store.set('token_expiration', token_expiration)

                console.log('expires in: ' + token_expiration)

                if (store.get('token_expiration')) {
                    updateAccessToken()
                }
    
                // apiProxy.getUser().then((res: User | Error) => {
                //     console.log(res)
                // }).catch((err: Error) => {
                //     console.error(err)
                // })
            }
            // else {
            //     res.redirect('/#' +
            //         querystring.stringify({
            //             error: 'invalid_token'
            //         }))
            // }
        })
    }, ((store.get('token_expiration') / 100) * 75) * 1000)
}

exp.use(express.static(base_uri))
    .use(cors())
    .use(cookieParser())

exp.get('/', (req: any, res: any) => {
    if (store.get('access_token')) {
        apiProxy = new ApiProxy(store.get('access_token'))
        res.sendFile(path.join(__dirname + '../../../app/pages/index.html'))
    } else {
        res.redirect('/login')
    }
})

exp.get('/login', (req: any, res: any) => {
    const state: string = helpers.generateRandomString(16)
    res.cookie(stateKey, state)

    // your application requests authorization
    const scope = 'user-read-private user-read-email playlist-read-private playlist-read-collaborative user-read-playback-state user-library-read user-modify-playback-state user-read-currently-playing'
    res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: client_id,
            scope: scope,
            redirect_uri: redirect_uri,
            state: state
        }))
})

exp.get('/callback', (req: any, res: any) => {
    let code = req.query.code || null
    let state = req.query.state || null
    let storedState = req.cookies ? req.cookies[stateKey] : null

    if (state === null || state !== storedState) {
        res.redirect('/#' +
            querystring.stringify({
                error: 'state_mismatch'
            }))
    } else {
        res.clearCookie(stateKey)
        let authOptions = {
            url: 'https://accounts.spotify.com/api/token',
            form: {
                code: code,
                redirect_uri: redirect_uri,
                grant_type: 'authorization_code'
            },
            headers: {
                'Authorization': 'Basic ' + (Buffer.from(client_id + ':' + client_secret).toString('base64'))
            },
            json: true
        }

        request.post(authOptions, (error: any, response: any, body: any) => {
            if (!error && response.statusCode === 200) {

                let access_token = body.access_token,
                    refresh_token = body.refresh_token,
                    token_expiration = body.expires_in

                store.set('access_token', access_token)
                store.set('refresh_token', refresh_token)
                store.set('token_expiration', token_expiration)

                console.log('expires in: ' + token_expiration)

                if (store.get('token_expiration')) {
                    updateAccessToken()
                }

                apiProxy.getUser().then((res: User | Error) => {
                    console.log(res)
                }).catch((err: Error) => {
                    console.error(err)
                })
                res.sendFile(path.join(__dirname + '../../../app/pages/index.html'))
                // we can also pass the token to the browser to make requests from there
                // res.redirect('/?' +
                // 	querystring.stringify({
                // 		access_token: access_token,
                // 		refresh_token: refresh_token
                // 	}))
            } else {
                res.redirect('/#' +
                    querystring.stringify({
                        error: 'invalid_token'
                    }))
            }
        })
    }
})

// exp.get('/refresh', (req: any, res: any) => {
    
// })

exp.get('/pages/header', (req: any, res: any) => {
    let template: Document

    fs.readFile(path.join(__dirname + '../../../app/pages/header.html'), 'utf8', (err: any, data: any) => {
        if (err) {
            throw err;
        }
        template = data

        let compTemplate = hogan.compile(template)

        apiProxy.getUserPlaylists().then((playlistArray) => {
            // Render context to template
            if (!(playlistArray instanceof Error)) {
                let headerObject = new HeaderTemplate(playlistArray)
                res.send(compTemplate.render(headerObject))
            }
        }).catch(err => {
            console.error(err)
        })
    })
})

exp.get('/pages/footer', async (req: any, res: any) => {
    let template: Document

    fs.readFile(path.join(__dirname + '../../../app/pages/footer.html'), 'utf8', (err: any, data: any) => {
        if (err) {
            throw err;
        }
        template = data

        let compTemplate = hogan.compile(template)

        apiProxy.getPlayer().then((player) => {
            // Render context to template
            if (!(player instanceof Error)) {
                let footerObject: FooterTemplate = new FooterTemplate(player)
                res.send(compTemplate.render(footerObject))
            }
        }).catch(err => {
            console.error(err)
        })
    })
})

exp.get('/pages/auth', (req: any, res: any) => {
    let template: Document = fs.readFileSync(path.join(__dirname + '../../../app/pages/auth.html'))
    res.send(template)
})

exp.get('/pages/album/:id', (req: any, res: any) => {
    let albumId: string = req.params.id
    let template: Document
    let compTemplate: any

    // First I want to read the file
    fs.readFile(path.join(__dirname + '../../../app/pages/album/index.html'), 'utf8', (err: any, data: any) => {
        if (err) {
            throw err;
        }
        template = data

        compTemplate = hogan.compile(template)

        apiProxy.getAlbum(albumId).then((album: Album | Error) => {
            // Render context to template
            if (!(album instanceof Error)) {
                let albumObject: AlbumTemplate = new AlbumTemplate(album)
                res.send(compTemplate.render(albumObject))
            }
        }).catch(err => {
            console.error(err)
        })
    })
})

exp.get('/pages/playlist/:id', (req: any, res: any) => {
    let playlistId: string = req.params.id
    let template: Document
    let compTemplate: any

    // First I want to read the file
    fs.readFile(path.join(__dirname + '../../../app/pages/playlist/playlist.html'), 'utf8', (err: any, data: any) => {
        if (err) {
            throw err;
        }
        template = data

        compTemplate = hogan.compile(template)

        apiProxy.getPlaylist(playlistId).then((playlist: Playlist | Error) => {
            // Render context to template
            if (!(playlist instanceof Error)) {
                let playlistObject: PlaylistTemplate = new PlaylistTemplate(playlist)
                res.send(compTemplate.render(playlistObject))
            }
        }).catch(err => {
            console.error(err)
        })
    })
})

exp.get('/pages/playlist', (req: any, res: any) => {
    let template: Document
    let compTemplate: any

    // First I want to read the file
    fs.readFile(path.join(__dirname + '../../../app/pages/playlist/playlist.html'), 'utf8', (err: any, data: any) => {
        if (err) {
            throw err;
        }
        template = data

        compTemplate = hogan.compile(template)

        apiProxy.getSavedSongs().then((paging: PagingPlaylist | Error) => {
            // Render context to template
            if (!(paging instanceof Error)) {
                let PlaylistObject: PlaylistTemplate = new PlaylistTemplate()
                PlaylistObject.description = 'Your liked songs'
                PlaylistObject.name = 'Liked Songs'
                //TODO: Change owner to logged in user
                //PlaylistObject.owner
                PlaylistObject.tracks = paging


                res.send(compTemplate.render(PlaylistObject))
            }
        }).catch(err => {
            console.error(err)
        })
    })
})

exp.get('/content/cover/currently-playing', (req: any, res: any) => {

    apiProxy.getCurrentTrackCover().then(apiRes => {
        res.send(apiRes)
    }).catch(err => {
        console.error(err)
    })
})

exp.post('/change/play-state/:state', (req: any, res: any) => {
    let state: PlayState = req.params.state

    apiProxy.setPlayState(state).then(apiRes => {
        res.sendStatus(apiRes)
    }).catch(err => {
        console.error(err)
    })
})

exp.post('/change/track/:direction', (req: any, res: any) => {
    let direction: PlayDirection = req.params.direction

    apiProxy.skipToNextOrPrevious(direction).then(apiRes => {
        res.sendStatus(apiRes)
    }).catch(err => {
        console.error(err)
    })
})

exp.post('/change/shuffle/:state', (req: any, res: any) => {
    let state: boolean = req.params.state

    apiProxy.setShuffleState(state).then(apiRes => {
        res.sendStatus(apiRes)
    }).catch(err => {
        console.error(err)
    })
})

exp.post('/change/repeat/:state', (req: any, res: any) => {
    let state: RepeatState = req.params.state

    apiProxy.setRepeatState(state).then(apiRes => {
        res.sendStatus(apiRes)
    }).catch(err => {
        console.error(err)
    })
})

//TODO: Only add neccesry directories
exp.use(express.static(path.join(__dirname + '../../../dir')))
exp.use(express.static(path.join(__dirname + '../../../app')))

// exp.get('/login', (req: Request, res: any) => {
// 	console.log('/login')
// 	const state = generateRandomString(16)
// 	res.cookie(stateKey, state)

// 	// your application requests authorization
// 	const scope = 'user-read-private user-read-email'
// 	res.redirect(`https://accounts.spotify.com/authorize?${
// 		querystring.stringify({
// 			response_type: 'code',
// 			client_id: client_id,
// 			scope: scope,
// 			redirect_uri: redirect_uri,
// 			state: state
// 		})}`
// 	)
// })

server.listen(8888)

// const requestSpotifyToken = function (requestUrl: string): void {
//     console.log(requestUrl)
//     apiRequests
//         .post(requestUrl)
//         .end(function (err: Error, response: any) {
//             if (response && response.ok) {
//                 console.log(requestUrl)
//                 // Success - Received Token.
//                 // Store it in localStorage maybe?
//                 window.localStorage.setItem('spotifytoken', response.body.access_token)
//             } else {
//                 // Error - Show messages.
//                 console.log(err)
//             }
//         })

// }

function createWindow() {
    const mainWindowStateKeeper = windowStateKeeper({
        defaultHeight: 1100,
        defaultWidth: 1920
    });
    // Create the browser window.
    let win: BrowserWindow | null = new BrowserWindow({
        x: mainWindowStateKeeper.x,
        y: mainWindowStateKeeper.y,
        height: mainWindowStateKeeper.height,
        width: mainWindowStateKeeper.width,
        webPreferences: {
            nodeIntegration: true,
            plugins: true,
            enableRemoteModule: true,
            preload: path.join(__dirname + '../../../dir/js/titleBar.js'),
        },
        frame: false
    })
    mainWindowStateKeeper.manage(win)

    // and load the index.html of the app.
    //win.loadFile('./app/pages/index.html')
    win.loadURL(base_uri + 'login')


    win.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        win = null
        app.exit()
    })
    // const scope = 'user-read-private user-read-email'
    // const state = generateRandomString(16)
    // const authUrl: string = (`https://accounts.spotify.com/authorize?${
    // 	querystring.stringify({
    // 		response_type: 'code',
    // 		client_id: client_id,
    // 		scope: scope,
    // 		redirect_uri: redirect_uri,
    // 		state: state
    // 	})}`
    // )

    // win.loadURL(authUrl)
    // win.show()

    // function handleCallback(url: string) {
    // 	let raw_code = /code=([^&]*)/.exec(url) || null
    // 	let code = (raw_code && raw_code.length > 1) ? raw_code[1] : null
    // 	let error = /\?error=(.+)$/.exec(url)

    // 	if (code || error) {
    // 		// Close the browser if code found or error
    // 		win.destroy()
    // 	}

    // 	// If there is a code, proceed to get token from github
    // 	if (code) {
    // 		requestSpotifyToken(authUrl)
    // 	} else if (error) {
    // 		alert('Oops! Something went wrong and we couldn\'t' +
    // 			'log you in using Github. Please try again.')
    // 	}
    // }

    // win.webContents.on('will-navigate', function (event: any, url: string) {
    // 	handleCallback(url)
    // })

    // win.webContents.on('did-get-redirect-request', function (event: any, oldUrl: string, newUrl: string) {
    // 	handleCallback(newUrl)
    // })

    // win.on('close', function () {
    // 	win = null
    // }, false)

    // // 'will-navigate' is an event emitted when the window.location changes
    // // newUrl should contain the tokens you need
    // win.webContents.on('will-navigate', function (event: any, newUrl: string) {
    // 	console.log(newUrl)
    // 	// More complex code to handle tokens goes here
    // })

    // win.on('closed', function () {
    // 	win = null
    // })
    return win
}

app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') app.quit()
})

app.on('browser-window-focus', function () {
    globalShortcut.register("CommandOrControl+R", () => {
        console.log("CommandOrControl+R is pressed: Shortcut Disabled");
    });
    globalShortcut.register("F5", () => {
        console.log("F5 is pressed: Shortcut Disabled");
    });
    //TODO: Something with media keys
    // globalShortcut.register('MediaPlayPause', () => {

    // });
});

app.on('browser-window-blur', function () {
    globalShortcut.unregister('CommandOrControl+R');
    globalShortcut.unregister('F5');
});