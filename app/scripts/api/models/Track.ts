import { Album } from "./Album"
import { TrackSimp } from "./TrackSimp"

export interface Track extends TrackSimp {
    album: Album,
}