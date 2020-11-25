import { Duration, min, Moment } from "moment"
import moment from 'moment'
import { DatePrecision } from './api/types/datePrecision'

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

    public formatDurationFromMilliseconds = (milliseconds: number, withText: boolean = false): string => {
        let duration = moment.duration(milliseconds, 'milliseconds')
        let hours = Math.floor(duration.asHours())
        let minutes = Math.floor(duration.asMinutes()) - hours * 60
        let seconds = Math.round(duration.asSeconds()) - (minutes * 60 + hours * 3600)
        let format = ''
        
        if (hours === 0) {
            format = withText ? 'm [min]' : 'm:ss'
        } else {
            format = withText ? 'h [hr] m [min]' : 'h:mm:ss'
        }
        
        return moment({
            hour: hours, 
            minute: minutes, 
            second: seconds
        }).format(format)
    }

    public formatDate = (date: string, datePrecision: DatePrecision): string => {
        let format
        switch (datePrecision) {
            case DatePrecision.day:
                format = 'DD-MM-YYYY'
                break
            case DatePrecision.month:
                format = 'MM-YYYY'
                break
            case DatePrecision.year:
                format = 'YYYY'
                break
            default:
                format = ''
                break
        }
        return moment(date).format(format)
    }
}