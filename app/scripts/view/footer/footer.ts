const buttons = jQuery('#main-footer button');

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
                debugger
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
    jQuery('#main-footer button.play').on('click', () => { playPause('play') })
    jQuery('#main-footer button.pause').on('click', () => { playPause('pause') })
    jQuery('#main-footer button.back').on('click', () => { trackSkipDirection('previous') })
    jQuery('#main-footer button.next').on('click', () => { trackSkipDirection('next') })
    jQuery('#main-footer button.suffle').on('click', (ele: any) => { toggleShuffle(ele) })
    jQuery('#main-footer button.repeat').on('click', (ele: any) => { toggleRepeat(ele) })
})
