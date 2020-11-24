const request = require('request')
import { Album } from './models/Album'
import { User } from './models/User'
import { TrackSimp } from './models/TrackSimp'
import moment from 'moment'
import { Helpers } from '../helpers'

export class ApiProxy {
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
                    let tracks: Array<TrackSimp> = body.tracks.items

                    tracks.forEach(track => {
                        track.duration = this.helpers.formatDurationFromMilliseconds(track.duration_ms)
                    });
                    body.tracks.items = tracks

                    resolve(body)
                }
            })
        })
    }
}