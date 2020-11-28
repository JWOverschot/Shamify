const request = require('request')
const fetch = require("node-fetch")
import { Album } from './models/Album'
import { User } from './models/User'
import { TrackSimp } from './models/TrackSimp'
import moment, { relativeTimeRounding } from 'moment'
import { Helpers } from '../helpers'
import { Playlist } from './models/Playlist'
import { TrackPlaylist } from './models/TrackPlaylist'
import { DatePrecision } from './types/datePrecision'
import { Track } from './models/Track'
import { Paging } from './types/paging'
import { Player } from './models/Player'
import { combinedDisposable } from 'custom-electron-titlebar/lib/common/lifecycle'

export class ApiProxy {
    //TODO: Remove parsing logic from api calls
    private access_token: string
    private apiURI: string = 'https://api.spotify.com/v1/'
    private helpers: Helpers = new Helpers()

    constructor(access_token: string) {
        this.access_token = access_token
    }

    /**
     * Gets information form logged-in user
     * @returns {Promise<User | Error>} Promise from api call with User object or and error
     * https://api.spotify.com/v1/me
     */
    public getUser = async (): Promise<User | Error> => {
        if (!this.access_token) {
            return {
                name: 'NO_ACCESS_TOKEN',
                message: 'No access token provided'
            }
        }

        let options = {
            url: this.apiURI + 'me',
            headers: { 'Authorization': 'Bearer ' + this.access_token },
            json: true
        }

        return await new Promise<User>((resolve, reject) => {
            request.get(options, (error: any, response: any, body: any) => {
                if (error) {
                    reject(error)
                } else {
                    resolve(body)
                }
            })
        })
    }

    /**
     * 
     * @param id 
     * https://api.spotify.com/v1/albums/{id}
     */
    public getAlbum = async (id: string): Promise<Album | Error> => {
        if (!this.access_token) {
            return {
                name: 'NO_ACCESS_TOKEN',
                message: 'No access token provided'
            }
        }

        let options = {
            url: this.apiURI + 'albums/' + id,
            headers: { 'Authorization': 'Bearer ' + this.access_token },
            json: true,
        }

        return await new Promise<Album>((resolve, reject) => {
            request.get(options, (error: any, response: any, body: Album) => {
                if (error) {
                    reject(error)
                } else {
                    //body.release_date = this.helpers.formatDate(body.release_date, body.release_date_precision)

                    let tracks: Array<TrackSimp> = body.tracks.items
                    //let albumDurationMs = 0

                    tracks.forEach(track => {
                        track.duration = this.helpers.formatDurationFromMilliseconds(track.duration_ms)
                        track.add_date = body.release_date
                        track.album_name = body.name
                        //albumDurationMs += track.duration_ms
                    })
                    //body.tracks.items = tracks
                    //body.duration = this.helpers.formatDurationFromMilliseconds(albumDurationMs, true)

                    resolve(body)
                }
            })
        })
    }

    public getPlaylist = async (id: string): Promise<Playlist | Error> => {
        if (!this.access_token) {
            return {
                name: 'NO_ACCESS_TOKEN',
                message: 'No access token provided'
            }
        }

        return await fetch(this.apiURI + 'playlists/' + id , {
            method: 'GET',
            headers:  { 
                "Content-Type": "application/json; charset=utf-8",
                'Authorization': 'Bearer ' + this.access_token
            }
        }).then((res: Response) => {
            return res.json()
        }).then(async (data: Playlist) => {
            let tracks: Array<TrackPlaylist> = data.tracks.items
            //let playlistDurationMs = 0
            let pageCheck = (data.tracks.total - data.tracks.offset) > data.tracks.limit
            let nextLink = data.tracks.next

            while (pageCheck && nextLink) {
                await this.getTracks(nextLink).then((res) => {
                    tracks = tracks.concat(res.items)
                    // Update page check with new data from new page object
                    pageCheck = (res.total - res.offset) > res.limit
                    nextLink = res.next
                })
            }

            tracks.forEach(track => {
                track.track.duration = this.helpers.formatDurationFromMilliseconds(track.track.duration_ms)
                track.added_at = this.helpers.formatDate(track.added_at, DatePrecision.day)
                track.track.add_date = track.added_at
                //playlistDurationMs += track.track.duration_ms
            })

            //data.tracks.items = tracks
            //data.duration = this.helpers.formatDurationFromMilliseconds(playlistDurationMs, true)
            //data.total_tracks = data.tracks.total

            return data
        })
    }

    public getTracks = async (url: string): Promise<Paging> => {
        //https://api.spotify.com/v1/playlists/39IbE4MVy7oNVgdwRwz6rL/tracks?offset=100&limit=100
        return await fetch(url, {
            method: 'GET',
            headers:  { 
                "Content-Type": "application/json; charset=utf-8",
                'Authorization': 'Bearer ' + this.access_token
            }
        }).then((res: Response) => {
            return res.json()
        }).then((data: Paging) => {
            return data
        })
    }

    public getPlayer = async (): Promise<Player | Error> => {
        if (!this.access_token) {
            return {
                name: 'NO_ACCESS_TOKEN',
                message: 'No access token provided'
            }
        }

        return await fetch(this.apiURI + 'me/player', {
            method: 'GET',
            headers:  { 
                "Content-Type": "application/json; charset=utf-8",
                'Authorization': 'Bearer ' + this.access_token
            }
        }).then((res: Response) => {
            if (res.status === 204) {
                throw 'NO_CONTENT'
            }
            return res.json()
        }).then((data: Player) => {
            // data.progress = this.helpers.formatDurationFromMilliseconds(data.progress_ms)
            // data.time_remening_ms = data.item.duration_ms - data.progress_ms
            // data.time_remening = '-' + this.helpers.formatDurationFromMilliseconds(data.time_remening_ms)
            return data
        })
    }

    public getUserPlaylists = async (): Promise<Paging | Error> => {
        if (!this.access_token) {
            return {
                name: 'NO_ACCESS_TOKEN',
                message: 'No access token provided'
            }
        }

        return await fetch(this.apiURI + 'me/playlists', {
            method: 'GET',
            headers:  { 
                "Content-Type": "application/json; charset=utf-8",
                'Authorization': 'Bearer ' + this.access_token
            }
        }).then((res: Response) => {
            return res.json()
        }).then((data: Paging) => {
            return data
        })
    }

    public getSavedSongs = async (): Promise<Paging | Error> => {
        if (!this.access_token) {
            return {
                name: 'NO_ACCESS_TOKEN',
                message: 'No access token provided'
            }
        }

        return await fetch(this.apiURI + 'me/tracks', {
            method: 'GET',
            headers:  { 
                "Content-Type": "application/json; charset=utf-8",
                'Authorization': 'Bearer ' + this.access_token
            }
        }).then((res: Response) => {
            return res.json()
        }).then(async (data: Paging) => {
            let tracks: Array<TrackPlaylist> = data.items
            //let playlistDurationMs = 0
            let pageCheck = (data.total - data.offset) > data.limit
            let nextLink = data.next

            while (pageCheck && nextLink) {
                await this.getTracks(nextLink).then((res) => {
                    tracks = tracks.concat(res.items)
                    // Update page check with new data from new page object
                    pageCheck = (res.total - res.offset) > res.limit
                    nextLink = res.next
                })
            }

            tracks.forEach(track => {
                track.track.duration = this.helpers.formatDurationFromMilliseconds(track.track.duration_ms)
                track.added_at = this.helpers.formatDate(track.added_at, DatePrecision.day)
                track.track.add_date = track.added_at
                //playlistDurationMs += track.track.duration_ms
            })

            data.items = tracks
            //data.duration = this.helpers.formatDurationFromMilliseconds(playlistDurationMs, true)
            //data.total_tracks = data.total

            return data
        })
    }
}