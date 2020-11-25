import { image } from "../types/image"
import { Paging } from "../types/paging"
import { User } from "./User"

export interface Playlist {
    id: string,
    name: string,
    description: string,
    tracks: Paging
    images: Array<image>,
    snapshot_id: string,
    total_tracks: number,
    duration: string,
    owner: User
}