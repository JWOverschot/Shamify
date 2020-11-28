export interface Paging {
    items: Array<any>,
    limit: number,
    next: string | null,
    offset: number,
    previous: string | null,
    total: number
}