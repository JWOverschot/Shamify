import { ArtistSimp } from './ArtistSimp'
import { TrackSimp } from '../models/TrackSimp'
import { image } from '../types/image'
import { Paging } from '../types/paging';

export interface Album {
    id: string,
    artists: Array<ArtistSimp>,
    name: string,
    images: Array<image>,
    release_date: string,
    release_date_precision: string,
    total_tracks: number,
    tracks: Paging
}