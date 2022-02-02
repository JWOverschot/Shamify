import { Playlist } from "../../api/models/Playlist";
import { TrackPlaylist } from "../../api/models/TrackPlaylist";
import { TrackSimp } from "../../api/models/TrackSimp";
import { User } from "../../api/models/User";
import { image } from "../../api/types/image";
import { PagingPlaylist } from "../../api/types/pagingPlaylist";
import { Helpers } from "../../helpers";

export class PlaylistTemplate {
    private helpers: Helpers = new Helpers()
    constructor(playlist?: Playlist) {
        if (playlist) {
            this.name = playlist.name
            this.description = playlist.description
            this.tracks = playlist.tracks
            this.images = playlist.images
            this.owner = playlist.owner
            this.uri = playlist.uri
        }
    }
    name: string = 'Playlist'
    description: string = 'This is a playlist'
    tracks: PagingPlaylist = {
        //TODO: make sample track class and fill items with it
        items: [],
        limit: 1,
        next: null,
        offset: 0,
        previous: null,
        total: 1
    }
    images: Array<image> = [{ height: null, url: 'https://nl.concerty.com/img/no_cover.png', width: null }]
    owner: User = {
        display_name: 'Shamify',
        id: '',
        images: [{ height: null, url: '', width: null }],
        product: 'premium'
    }
    uri: string = 'spotify:playlist:37i9dQZF1DX7pykHKVxv6o'
    getTotalDuration = (): string => {
        let albumDurationMs = 0
        this.tracks.items.forEach((track: TrackPlaylist) => {
            albumDurationMs += track.track.duration_ms
        });
        return this.helpers.formatDurationFromMilliseconds(albumDurationMs, true)
    }
    getTotalTracks = (): number => {
        return this.tracks.total
    }
}