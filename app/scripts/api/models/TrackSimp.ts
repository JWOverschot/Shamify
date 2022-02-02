import { ArtistSimp } from './ArtistSimp'

export interface TrackSimp {
    id: string,
    position: number,
    name: string,
    artists: Array<ArtistSimp>,
    duration_ms: number,
    duration: string,
    track_number: number,
    is_playable: boolean,
    add_date: string,
    album_name: string
}