import { Device } from "../../api/models/Device";
import { Player } from "../../api/models/Player";
import { Track } from "../../api/models/Track";
import { Helpers } from "../../helpers";

export class FooterTemplate implements Player {
    private helpers: Helpers = new Helpers()
    constructor(player: Player) {
        this.context = player.context
        this.device = player.device
        this.is_playing = player.is_playing
        this.item = player.item
        this.progress_ms = player.progress_ms
        this.repeat_state = player.repeat_state
        this.shuffle_state = player.shuffle_state
        this.timestamp = player.timestamp
    }
    device: Device
    repeat_state: string
    shuffle_state: boolean
    context: any
    timestamp: number
    progress_ms: number
    is_playing: boolean
    item: Track
    getFormattedProgress = (): string => {
        return this.helpers.formatDurationFromMilliseconds(this.progress_ms)
    }
    getTimeRemeingMs = (): number => {
        return this.item.duration_ms - this.progress_ms
    }
    getFormattedTimeRemeing = (): string => {
        return '-' + this.helpers.formatDurationFromMilliseconds(this.getTimeRemeingMs())
    }
}