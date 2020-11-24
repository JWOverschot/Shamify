import { TrackSimp } from "../models/TrackSimp";

export interface Paging {
    items: Array<any>,
    limit: number,
    next: string,
    offset: number,
    previous: string,
    total: number
}