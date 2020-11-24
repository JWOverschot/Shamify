import { Duration, min, Moment } from "moment"
import moment from 'moment'

export class Helpers {
    /**
     * Generates a random string containing numbers and letters
     * @param  {number} length The length of the string
     * @return {string} The generated string
     */
    public generateRandomString = (length: number): string => {
        let text: string = ''
        const possible: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

        for (let i = 0; i < length; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length))
        }
        return text
    }

    public formatDurationFromMilliseconds = (milliseconds: number): string => {
        let duration = moment.duration(milliseconds, 'milliseconds')
        let hours = Math.floor(duration.asHours())
        let minutes = Math.floor(duration.asMinutes()) - hours * 60
        let seconds = Math.round(duration.asSeconds()) - minutes * 60

        if (hours === 0) {
            return moment({minute: minutes, second: seconds}).format('m:ss')
        } else {
            return moment({hour: hours, minute: minutes, second: seconds}).format('h:mm:ss')
        }
    }
}