import { TrackPlaylist } from "../models/TrackPlaylist";
import { Paging } from "./paging";

export interface PagingPlaylist extends Paging {
    items: Array<TrackPlaylist>
}