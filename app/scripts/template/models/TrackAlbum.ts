import { Album } from "../../api/models/Album";
import { ArtistSimp } from "../../api/models/ArtistSimp";
import { Track } from "../../api/models/Track";
import { TrackSimp } from "../../api/models/TrackSimp";
import { DatePrecision } from "../../api/types/datePrecision";
import { image } from "../../api/types/image";
import { Helpers } from "../../helpers";

export class TrackAlbumTemplate {
    private helpers: Helpers = new Helpers()

    constructor(track?: Track | TrackSimp) {
        if (track) {
            this.id = track.id
            this.position = track.position
            this.name = track.name
            this.artists = track.artists
            this.album_name = track.album_name
            this.duration_ms = track.duration_ms
            this.add_date = track.add_date
        }
    }

    id: string = '0aAAaA00aaaaA0A000a0aa'
    position: number = 0
    name: string = 'Track'
    //images: Array<image> = [{ height: null, url: 'https://nl.concerty.com/img/no_cover.png', width: null }]
    artists: Array<ArtistSimp> = [{ id: '0a00a0A0aaAAaaAAAA0A0A', name: 'Artist Name' }]
    album_name: string = 'Album Name'
    duration_ms: number = 180000
    add_date: string = '1999-12-09'
    
    getTrackDuration = (): string => {
        return this.helpers.formatDurationFromMilliseconds(this.duration_ms, false)
    }
}