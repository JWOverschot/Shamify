import { Device } from "./Device"
import { Track } from "./Track"

export interface Player {
    device: Device,
    repeat_state: string,
    shuffle_state: boolean,
    context: any,
    timestamp: number,
    progress_ms: number,
    is_playing: boolean,
    item: Track
}