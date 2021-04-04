const buttons = jQuery('#main-footer button');

let timeInterval: any
clearInterval(timeInterval)

buttons.ready(() => {
    let playPause = (state: string) => {
        fetch(window.location.origin + '/change/play-state/' + state, {
            method: 'POST'
        })
            .then((res) => {
                if (res.ok) {
                    switch (state) {
                        case 'play':
                            jQuery('#main-footer button.play').addClass('hide')
                            jQuery('#main-footer button.play').removeClass('show')

                            jQuery('#main-footer button.pause').removeClass('hide')
                            jQuery('#main-footer button.pause').addClass('show')
                            break
                        case 'pause':
                            jQuery('#main-footer button.play').removeClass('hide')
                            jQuery('#main-footer button.play').addClass('show')

                            jQuery('#main-footer button.pause').addClass('hide')
                            jQuery('#main-footer button.pause').removeClass('show')
                            break
                    }
                }
            })
    }

    let trackSkipDirection = (direction: string) => {
        fetch(window.location.origin + '/change/track/' + direction, {
            method: 'POST'
        })
            .then((res) => {
                if (res.ok) {
                    setTimeout(() => {
                        loadFooterContent()
                    }, 400)
                }
            })
    }

    let toggleShuffle = (element: any) => {
        let state = !element.currentTarget.classList.contains('active')

        fetch(window.location.origin + '/change/shuffle/' + state, {
            method: 'POST'
        })
            .then((res) => {
                if (res.ok) {
                    jQuery('#main-footer button.suffle').toggleClass('active')
                }
            })
    }

    let toggleRepeat = (element: any) => {
        let state: string;

        if (element.currentTarget.classList.contains('active') && !element.currentTarget.classList.contains('repeat-song')) {
            state = 'track'
        } else if (!element.currentTarget.classList.contains('active')) {
            state = 'context'
        } else {
            state = 'off'
        }

        fetch(window.location.origin + '/change/repeat/' + state, {
            method: 'POST'
        })
            .then((res) => {
                if (res.ok) {
                    switch (state) {
                        case 'context':
                            jQuery('#main-footer button.repeat').addClass('active')
                            break
                        case 'track':
                            jQuery('#main-footer button.repeat').addClass('repeat-song')
                            break
                        case 'off':
                        default:
                            jQuery('#main-footer button.repeat').removeClass('active')
                            jQuery('#main-footer button.repeat').removeClass('repeat-song')
                    }
                }
            })
    }

    // Footer buttons listners
    jQuery('#main-footer button.play').on('click', () => {
        playPause('play')
        startProgressBar()
    })
    jQuery('#main-footer button.pause').on('click', () => {
        playPause('pause')
        pauseProgressBar()
        clearInterval(timeInterval)
    })
    jQuery('#main-footer button.back').on('click', () => { trackSkipDirection('previous') })
    jQuery('#main-footer button.next').on('click', () => { trackSkipDirection('next') })
    jQuery('#main-footer button.suffle').on('click', (ele: any) => { toggleShuffle(ele) })
    jQuery('#main-footer button.repeat').on('click', (ele: any) => { toggleRepeat(ele) })
})

const progressBar = jQuery('#main-footer .progress-bar')
// Duration from miliseconds to seconds
const trackDuration = jQuery('.progress-bar').attr('data-duration') / 1000
const trackDurationPast = jQuery('.progress-bar').attr('data-time') / 1000
let trackDurationLeft = trackDuration - trackDurationPast

const startProgressBar = () => {
    const computedLenghtInformationOverlay = jQuery('#main-footer .information-overlay').width()
    const computedLenghtinformationOverlayImg = jQuery('#main-footer .information-overlay img.cover').width()
    const ProgressBarFullWith = parseFloat(computedLenghtInformationOverlay) - parseFloat(computedLenghtinformationOverlayImg)

    const computedLenghtProgressBar = progressBar.width()
    const computedLenghtProgressBarInt = parseFloat(computedLenghtProgressBar)
    const percentageProgressBarInt = Math.round((computedLenghtProgressBarInt / ProgressBarFullWith) * 100)

    if (percentageProgressBarInt != 0) {
        trackDurationLeft = trackDuration * ((100 - percentageProgressBarInt) / 100)
    }

    progressBar.css('transitionDuration', trackDurationLeft + 's')
    progressBar.css('width', '100%')
}

const pauseProgressBar = function () {
    progressBar.css('transitionDuration', '0s')
    progressBar.css('width', progressBar.width())
}

const timePlusMinusOne = (time: string, minus: boolean) => {
    let splitTimeString = time.split(':')
    let hour: number = 0
    let min: number = 0
    let sec: number = 0

    if (splitTimeString.length > 2) {
        hour = parseInt(splitTimeString[0])
        min = parseInt(splitTimeString[1])
        sec = parseInt(splitTimeString[2])
    } else {
        min = parseInt(splitTimeString[0])
        sec = parseInt(splitTimeString[1])
    }

    if (minus && !(hour === 0 && min === 0 && sec === 0)) {
        sec -= 1

        if (sec == -1) {
            min -= 1
            if (min >= 0) {
                sec = 59
            }
        }

        if (min == -1) {
            hour -= 1
            min = 59
            sec = 59
        }

        // Get overlap time from user
        if (hour === 0 && min === 0 && sec === 4) {
            loadFooterContent()
        }

        if (hour === 0 && min === 0 && sec === 0) {
            loadFooterContent()
        }

    } else if (!minus) {
        sec += 1

        if (sec == 60) {
            min += 1
            sec = 0
        }

        if (min == 60) {
            hour += 1
            min = 0
            sec = 0
        }
    }

    if (hour > 0) {
        return `${hour}:${min > 9 ? min : '0' + min.toString()}:${sec > 9 ? sec : '0' + sec.toString()}`
    } else {
        return `${min}:${sec > 9 ? sec : '0' + sec.toString()}`
    }
}

progressBar.ready(() => {
    // Init progress bar
    (() => {
        const playedWidthPerc = (trackDurationPast / trackDuration) * 100
        progressBar.css('transitionDuration', '0s')
        progressBar.css('width', playedWidthPerc + '%')
    })()

    if (jQuery('.progress-bar').attr('data-isplaying') == 'true') {
        startProgressBar()

        clearInterval(timeInterval)
        timeInterval = setInterval(() => {
            jQuery('.elapsed').text(timePlusMinusOne(jQuery('.elapsed').text(), false))
            jQuery('.remaning-duration').text('-' + timePlusMinusOne(jQuery('.remaning-duration').text().substring(1), true))
        }, 1000)
    }
})