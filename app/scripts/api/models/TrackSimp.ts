import { isMoment } from 'moment'
import { Paging } from '../types/paging'
import { ArtistSimp } from './ArtistSimp'

export interface TrackSimp {
    id: string,
    name: string,
    artists: Array<ArtistSimp>,
    duration_ms: number,
    duration: string,
    track_number: number,
    is_playable: boolean,
    add_date: string,
    album_name: string
}