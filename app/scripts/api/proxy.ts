const request = require('request')
const fetch = require("node-fetch")
import { Album } from './models/Album'
import { User } from './models/User'
import { TrackSimp } from './models/TrackSimp'
import { Helpers } from '../helpers'
import { Playlist } from './models/Playlist'
import { TrackPlaylist } from './models/TrackPlaylist'
import { DatePrecision } from './types/datePrecision'
import { Track } from './models/Track'
import { PagingAlbum } from './types/pagingAlbum'
import { PagingPlaylist } from './types/pagingPlaylist'
import { Player } from './models/Player'
import { PlayState } from './types/playState'
import { PlayDirection } from './types/playDirection'
import { CurrentlyPlaying } from './models/CurrentlyPlaying'
import { RepeatState } from './types/repeatState'

export class ApiProxy {
    //TODO: Remove parsing logic from api calls
    private access_token: string
    private apiURI: string = 'https://api.spotify.com/v1/'
    private helpers: Helpers = new Helpers()
    private country: string = ''

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
                    this.country = response.body.country
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

        return await fetch(this.apiURI + 'albums/' + id + '?market=' + this.country, {
            method: 'GET',
            headers: {
                "Content-Type": "application/json; charset=utf-8",
                'Authorization': 'Bearer ' + this.access_token
            }
        }).then((res: Response) => {
            if (!res.ok) {
                throw Error(res.statusText);
            }
            return res.json()
        }).then(async (data: Album) => {
            let tracks: Array<TrackSimp> = data.tracks.items
            //let playlistDurationMs = 0
            let pageCheck = (data.tracks.total - data.tracks.offset) > data.tracks.limit
            let nextLink = data.tracks.next

            while (pageCheck && nextLink) {
                await this.getTracksAlbum(nextLink).then((res) => {
                    if (typeof res.items == typeof tracks) {
                        let tracksToAdd = new Array<TrackSimp>()

                        // This is temporary solution. Fix with correct data.
                        res.items.map(item =>{
                            return <TrackSimp>
                            {
                                add_date: item.add_date,
                                album_name: item.album_name,
                                artists: item.artists,
                                duration: '0',
                                duration_ms: item.duration_ms,
                                id: item.id,
                                is_playable: true,
                                name: item.name,
                                position: item.position,
                                track_number: 1
                            }
                        })

                        tracks = tracks.concat(tracksToAdd)
                    }
                    // Update page check with new data from new page object
                    pageCheck = (res.total - res.offset) > res.limit
                    nextLink = res.next
                })
            }

            tracks = tracks.filter(
                track => track.is_playable !== false
            )

            tracks.forEach((track, index) => {
                track.duration = this.helpers.formatDurationFromMilliseconds(track.duration_ms)
                track.add_date = track.add_date
                track.position = index
            })

            data.tracks.items = tracks

            return data
        }).catch((error: any) => {
            console.log(error)
        })
    }

    public getPlaylist = async (id: string): Promise<Playlist | Error> => {
        if (!this.access_token) {
            return {
                name: 'NO_ACCESS_TOKEN',
                message: 'No access token provided'
            }
        }

        return await fetch(this.apiURI + 'playlists/' + id + '?market=' + this.country, {
            method: 'GET',
            headers: {
                "Content-Type": "application/json; charset=utf-8",
                'Authorization': 'Bearer ' + this.access_token
            }
        }).then((res: Response) => {
            if (!res.ok) {
                throw Error(res.statusText);
            }
            return res.json()
        }).then(async (data: Playlist) => {
            let tracks: Array<TrackPlaylist> = data.tracks.items
            //let playlistDurationMs = 0
            let pageCheck = (data.tracks.total - data.tracks.offset) > data.tracks.limit
            let nextLink = data.tracks.next

            while (pageCheck && nextLink) {
                await this.getTracksPlaylist(nextLink).then((res) => {
                    tracks = tracks.concat(res.items)
                    // Update page check with new data from new page object
                    pageCheck = (res.total - res.offset) > res.limit
                    nextLink = res.next
                })
            }

            tracks = tracks.filter(
                track => track.track.is_playable !== false
            )

            tracks.forEach((track, index) => {
                track.track.duration = this.helpers.formatDurationFromMilliseconds(track.track.duration_ms)
                track.added_at = this.helpers.formatDate(track.added_at, DatePrecision.day)
                track.track.add_date = track.added_at
                //playlistDurationMs += track.track.duration_ms
                track.track.position = index
            })

            data.tracks.items = tracks
            //data.duration = this.helpers.formatDurationFromMilliseconds(playlistDurationMs, true)
            //data.total_tracks = data.tracks.total

            return data
        }).catch((error: any) => {
            console.log(error)
        })
    }

    public getTracksPlaylist = async (url: string): Promise<PagingPlaylist> => {
        //https://api.spotify.com/v1/playlists/39IbE4MVy7oNVgdwRwz6rL/tracks?offset=100&limit=100
        return await fetch(url, {
            method: 'GET',
            headers: {
                "Content-Type": "application/json; charset=utf-8",
                'Authorization': 'Bearer ' + this.access_token
            }
        }).then((res: Response) => {
            if (!res.ok) {
                throw Error(res.statusText);
            }
            return res.json()
        }).then((data: PagingPlaylist) => {
            return data
        }).catch((error: any) => {
            console.log(error)
        })
    }

    public getTracksAlbum = async (url: string): Promise<PagingAlbum> => {
        //https://api.spotify.com/v1/playlists/39IbE4MVy7oNVgdwRwz6rL/tracks?offset=100&limit=100
        return await fetch(url, {
            method: 'GET',
            headers: {
                "Content-Type": "application/json; charset=utf-8",
                'Authorization': 'Bearer ' + this.access_token
            }
        }).then((res: Response) => {
            if (!res.ok) {
                throw Error(res.statusText);
            }
            return res.json()
        }).then((data: PagingAlbum) => {
            return data
        }).catch((error: any) => {
            console.log(error)
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
            headers: {
                "Content-Type": "application/json; charset=utf-8",
                'Authorization': 'Bearer ' + this.access_token
            }
        }).then((res: Response) => {
            if (res.status === 204) {
                throw 'NO_CONTENT'
            }
            if (!res.ok) {
                throw Error(res.statusText);
            }
            return res.json()
        }).then((data: Player) => {
            // data.progress = this.helpers.formatDurationFromMilliseconds(data.progress_ms)
            // data.time_remening_ms = data.item.duration_ms - data.progress_ms
            // data.time_remening = '-' + this.helpers.formatDurationFromMilliseconds(data.time_remening_ms)
            return data
        }).catch((error: any) => {
            console.log(error)
        })
    }

    public getUserPlaylists = async (): Promise<PagingPlaylist | Error> => {
        if (!this.access_token) {
            return {
                name: 'NO_ACCESS_TOKEN',
                message: 'No access token provided'
            }
        }

        return await fetch(this.apiURI + 'me/playlists', {
            method: 'GET',
            headers: {
                "Content-Type": "application/json; charset=utf-8",
                'Authorization': 'Bearer ' + this.access_token
            }
        }).then((res: Response) => {
            if (!res.ok) {
                throw Error(res.statusText);
            }
            return res.json()
        }).then((data: PagingPlaylist) => {
            return data
        })
    }

    public getSavedSongs = async (): Promise<PagingPlaylist | Error> => {
        if (!this.access_token) {
            return {
                name: 'NO_ACCESS_TOKEN',
                message: 'No access token provided'
            }
        }

        return await fetch(this.apiURI + 'me/tracks' + '?market=' + this.country, {
            method: 'GET',
            headers: {
                "Content-Type": "application/json; charset=utf-8",
                'Authorization': 'Bearer ' + this.access_token
            }
        }).then((res: Response) => {
            if (!res.ok) {
                throw Error(res.statusText);
            }
            return res.json()
        }).then(async (data: PagingPlaylist) => {
            let tracks: Array<TrackPlaylist> = data.items
            //let playlistDurationMs = 0
            let pageCheck = (data.total - data.offset) > data.limit
            let nextLink = data.next

            while (pageCheck && nextLink) {
                await this.getTracksPlaylist(nextLink).then((res) => {
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
        }).catch((error: any) => {
            console.log(error)
        })
    }

    public setPlayState = async (playState: PlayState, trackToPlay?: Object): Promise<number | Error> => {
        if (!this.access_token) {
            return {
                name: 'NO_ACCESS_TOKEN',
                message: 'No access token provided'
            }
        }

        let requestBody: Object = new Object();
        if (trackToPlay) {
            requestBody = trackToPlay;
        }

        return await fetch(this.apiURI + 'me/player/' + playState, {
            method: 'PUT',
            headers: {
                "Content-Type": "application/json; charset=utf-8",
                'Authorization': 'Bearer ' + this.access_token
            },
            body: JSON.stringify(requestBody)
        }).then((res: Response) => {
            if (!res.ok) {
                throw Error(res.statusText);
            }
            return res.status
        }).catch((error: any) => {
            console.log(error)
        })
    }

    public skipToNextOrPrevious = async (direction: PlayDirection): Promise<number | Error> => {
        if (!this.access_token) {
            return {
                name: 'NO_ACCESS_TOKEN',
                message: 'No access token provided'
            }
        }

        return await fetch(this.apiURI + 'me/player/' + direction, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json; charset=utf-8",
                'Authorization': 'Bearer ' + this.access_token
            }
        }).then((res: Response) => {
            if (!res.ok) {
                throw Error(res.statusText);
            }
            return res.status
        }).catch((error: any) => {
            console.log(error)
        })
    }

    public getCurrentTrackCover = async (): Promise<string | Error> => {
        if (!this.access_token) {
            return {
                name: 'NO_ACCESS_TOKEN',
                message: 'No access token provided'
            }
        }

        return await fetch(this.apiURI + 'me/player/currently-playing', {
            method: 'GET',
            headers: {
                "Content-Type": "application/json; charset=utf-8",
                'Authorization': 'Bearer ' + this.access_token
            }
        }).then((res: Response) => {
            if (!res.ok) {
                throw Error(res.statusText);
            }
            return res.json()
        }).then(async (data: CurrentlyPlaying) => {
            return data.item.album.images[0].url
        }).catch((error: any) => {
            console.log(error)
        })
    }

    public setShuffleState = async (state: boolean): Promise<string | Error> => {
        if (!this.access_token) {
            return {
                name: 'NO_ACCESS_TOKEN',
                message: 'No access token provided'
            }
        }

        return await fetch(this.apiURI + 'me/player/shuffle?state=' + state, {
            method: 'PUT',
            headers: {
                "Content-Type": "application/json; charset=utf-8",
                'Authorization': 'Bearer ' + this.access_token
            }
        }).then((res: Response) => {
            if (!res.ok) {
                throw Error(res.statusText);
            }
            return res.status
        }).catch((error: any) => {
            console.log(error)
        })
    }

    public setRepeatState = async (state: RepeatState): Promise<string | Error> => {
        if (!this.access_token) {
            return {
                name: 'NO_ACCESS_TOKEN',
                message: 'No access token provided'
            }
        }

        return await fetch(this.apiURI + 'me/player/repeat?state=' + state, {
            method: 'PUT',
            headers: {
                "Content-Type": "application/json; charset=utf-8",
                'Authorization': 'Bearer ' + this.access_token
            }
        }).then((res: Response) => {
            if (!res.ok) {
                throw Error(res.statusText);
            }
            return res.status
        }).catch((error: any) => {
            console.log(error)
        })
    }
}