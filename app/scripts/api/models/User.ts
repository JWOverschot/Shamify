import { image } from '../types/image'

export interface User {
    id: number,
    display_name: string,
    images: Array<image>,
    product: string
}