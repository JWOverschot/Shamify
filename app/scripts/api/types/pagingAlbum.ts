import { TrackAlbumTemplate } from "../../template/models/TrackAlbum";
import { TrackSimp } from "../models/TrackSimp";
import { Paging } from "./paging";

export interface PagingAlbum extends Paging {
    items: Array<TrackSimp | TrackAlbumTemplate>
}