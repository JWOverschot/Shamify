import { image } from '../types/image'

export interface User {
    id: string,
    display_name: string,
    images: Array<image>,
    product: string
}