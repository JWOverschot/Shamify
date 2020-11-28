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
        let days = Math.floor(duration.asDays())
        let hours = Math.floor(duration.asHours()) - days * 24
        let minutes = Math.floor(duration.asMinutes()) - ((hours * 60) + (days * 1440))
        let seconds = Math.round(duration.asSeconds()) - ((minutes * 60) + (hours * 3600) + (days * 86400))
        let format = ''

        if (seconds === 60) {
            seconds = 0
            minutes++
        }
        if (minutes === 60) {
            minutes = 0
            hours++
        }
        if (hours === 24) {
            hours = 0
            days++
        }
        if (days > 31) {
            days = 31
        }

        if (hours === 0) {
            format = withText ? 'm [min]' : 'm:ss'
        } else if (days === 31) {
            format = '[+]31 [days]'
        } else if (days === 1) {
            format = 'D [day] H [hr]'
        } else if (days > 1) {
            format = 'D [days] H [hr]'
        } else if (minutes === 0) {
            format = withText ? 'H [hr]' : 'H:mm:ss'
        } else {
            format = withText ? 'H [hr] m [min]' : 'H:mm:ss'
        }

        return moment({
            day: days || 1,
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