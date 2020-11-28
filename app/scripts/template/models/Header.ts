import { Playlist } from "../../api/models/Playlist";
import { Paging } from "../../api/types/paging";

export class HeaderTemplate implements Paging {
    constructor (paging: Paging) {
        this.items = paging.items
        this.limit = paging.limit
        this.next = paging.next
        this.offset = paging.offset
        this.previous = paging.previous
        this.total = paging.total
    }
    
    items: Array<Playlist>
    limit: number
    next: string| null
    offset: number
    previous: string | null
    total: number
}