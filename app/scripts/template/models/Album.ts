import { Album } from "../../api/models/Album";
import { ArtistSimp } from "../../api/models/ArtistSimp";
import { TrackSimp } from "../../api/models/TrackSimp";
import { DatePrecision } from "../../api/types/datePrecision";
import { image } from "../../api/types/image";
import { Paging } from "../../api/types/paging";
import { Helpers } from "../../helpers";

export class AlbumTemplate {
    private helpers: Helpers = new Helpers()

    constructor(album?: Album) {
        if (album) {
            this.artists = album.artists
            this.name = album.name
            this.images = album.images
            this.release_date = album.release_date
            this.release_date_precision = album.release_date_precision
            this.total_tracks = album.total_tracks
            this.tracks = album.tracks
        }
    }

    artists: Array<ArtistSimp> = [{ id: '', name: 'Artist' }]
    name: string = 'Album'
    images: Array<image> = [{ height: null, url: 'https://nl.concerty.com/img/no_cover.png', width: null }]
    release_date: string = '1999-12-09'
    release_date_precision: DatePrecision = DatePrecision.day
    total_tracks: number = 1
    tracks: Paging = {
        //TODO: make sample track class and fill items with it
        items: [],
        limit: 1,
        next: null,
        offset: 0,
        previous: null,
        total: 1
    }
    getTotalDuration = (): string => {
        let albumDurationMs = 0
        this.tracks.items.forEach((track: TrackSimp) => {
            albumDurationMs += track.duration_ms
        });
        return this.helpers.formatDurationFromMilliseconds(albumDurationMs, true)
    }
    getFormattedReleaseDate = (): string => {
        return this.helpers.formatDate(this.release_date, this.release_date_precision)
    }
    getTotalTracks = (): number => {
        return this.tracks.total
    }
}