import { Track } from "./Track";

export interface CurrentlyPlaying {
    timestamp: number,
    progress_ms: number,
    is_playing: boolean,
    item: Track,
    currently_playing_type: string
}