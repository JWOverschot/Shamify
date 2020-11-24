const { app, BrowserWindow } = require('electron')
import * as querystring from 'querystring'
import { IncomingHttpHeaders, ServerResponse } from 'http'
import { Helpers } from './helpers'
import { ApiProxy } from './api/proxy'
import { User } from './api/models/User'
import { Album } from './api/models/Album'

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
    apiProxy = new ApiProxy(newValue)
})

const server = https.createServer({ key: ssl_key, cert: ssl_cert }, exp);

exp.use(express.static(base_uri))
    .use(cors())
    .use(cookieParser())

exp.get('/', (req: any, res: any) => {
    res.sendFile(path.join(__dirname + '../../../app/pages/index.html'))
})

exp.get('/login', (req: any, res: any) => {
    const state: string = helpers.generateRandomString(16)
    res.cookie(stateKey, state)

    // your application requests authorization
    const scope = 'user-read-private user-read-email'
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
                    refresh_token = body.refresh_token

                store.set('access_token', access_token)
                store.set('refresh_token', refresh_token)

                apiProxy.getUser().then((res: User | Error) => {
                    console.log(res)
                }).catch((err: Error) => {
                    console.error(err)
                })

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

exp.get('/album/:id', (req: any, res: any) => {
    let albumId: string = req.params.id
    let template: HTMLDocument
    let compTemplate: any

    // First I want to read the file
    fs.readFile(path.join(__dirname + '../../../app/pages/album/index.html'), 'utf8', (err: any, data: any) => {
        if (err) {
            throw err;
        }
        template = data

        compTemplate = hogan.compile(template)
        console.log(compTemplate)

        apiProxy.getAlbum(albumId).then((album: Album | Error) => {
            // Render context to template
            console.log(album)
            if (!(album instanceof Error)) {
                res.send(compTemplate.render(album))
            }
        }).catch(err => {
            console.error(err)
        })
    })
})

//TODO: Only add neccesry directories
exp.use('dir', express.static(path.join(__dirname + '../../../dir')))
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
    // Create the browser window.
    let win = new BrowserWindow({
        width: 1920,
        height: 1080,
        webPreferences: {
            nodeIntegration: true,
            plugins: true,
            enableRemoteModule: true
        },
    })

    // and load the index.html of the app.
    //win.loadFile('./app/pages/index.html')
    win.loadURL(base_uri)

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
}

app.on('ready', createWindow)