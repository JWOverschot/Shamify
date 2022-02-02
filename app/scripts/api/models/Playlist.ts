import { image } from "../types/image"
import { PagingPlaylist } from "../types/pagingPlaylist"
import { User } from "./User"

export interface Playlist {
    id: string,
    name: string,
    description: string,
    tracks: PagingPlaylist,
    images: Array<image>,
    snapshot_id: string,
    owner: User,
    type: string,
    uri: string
}