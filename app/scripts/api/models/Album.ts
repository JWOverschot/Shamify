import { ArtistSimp } from './ArtistSimp'
import { TrackSimp } from '../models/TrackSimp'
import { image } from '../types/image'
import { PagingAlbum } from '../types/pagingAlbum';
import { DatePrecision } from '../types/datePrecision'
import { Paging } from '../types/paging';

export interface Album {
    id: string,
    artists: Array<ArtistSimp>,
    name: string,
    images: Array<image>,
    release_date: string,
    release_date_precision: DatePrecision,
    total_tracks: number,
    tracks: Paging,
    type: string,
    uri: string
}