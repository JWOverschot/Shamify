const trackButtons = jQuery('#main-main button');
const setPlayingTrack = () => {
    const trackElements = jQuery('.track-row')

    for (let index = 0; index < trackElements.length; index++) {
        const element = trackElements[index]
        const currentTrackId = jQuery('.information-overlay .overlay-top').attr('data-trackid')

        if (jQuery(element).attr('data-trackid') === currentTrackId && jQuery('.progress-bar').attr('data-isplaying') == 'true') {
            console.log(Date() + ` | row ${jQuery(element).closest('.track-row').data('position')} is playing`)
            jQuery(element).addClass('playing')

            jQuery(element).find('button.play').addClass('hide')
            jQuery(element).find('button.pause').removeClass('hide')
        } else {
            if (jQuery(element).hasClass('playing')) {
                console.log(Date() + ` | Not playing`)
                jQuery(element).removeClass('playing')
            }
            if (!jQuery(element).find('button.pause').hasClass('hide')) {
                jQuery(element).find('button.pause').addClass('hide')
                jQuery(element).find('button.play').removeClass('hide')
            }
        }
    }
}



jQuery('#main-main').bind('DOMSubtreeModified', () => {
    console.log(Date() + ` | DOMSubtreeModified #main-main`)
    trackButtons.ready(() => {
        let playSong = (URI: string, position: number) => {
            fetch(window.location.origin + `/change/play-song/${URI}/${position}`, {
                method: 'POST'
            })
                .then((res) => {
                    if (res.ok) {
                        setTimeout(() => {
                            loadFooterContent()
                            setPlayingTrack()
                        }, 400)
                    }
                })
        }

        // Listner for track play button
        // TODO: support reasume playback from track play button
        jQuery('#main-main button.play').off('click')
        jQuery('#main-main button.play').on('click', (event: Event) => {
            let spotifyURI: string = jQuery('#main-main > div').attr('id')
            let position: number = jQuery(event.currentTarget).closest('.track-row').data('position')

            playSong(spotifyURI, position)
        })

        // Listner for track pause button
        jQuery('#main-main button.pause').off('click')
        jQuery('#main-main button.pause').on('click', (event: Event) => {
            fetch(window.location.origin + '/change/play-state/pause', {
                method: 'POST'
            })
                .then((res) => {
                    if (res.ok) {
                        setTimeout(() => {
                            loadFooterContent()
                            setPlayingTrack()
                        }, 400)
                    }
                })
        })
    })

    setPlayingTrack()
})
jQuery('#main-footer').bind('DOMSubtreeModified', () => {
    console.log(Date() + ` | DOMSubtreeModified #main-footer`)

    setTimeout(() => {
        setPlayingTrack()
    }, 400)

    // jQuery('#main-footer button').on('click', (event: Event) => {
    //     console.log(Date() + ` | click #main-footer button`)
    //     setTimeout(() => {
    //         setPlayingTrack()
    //     }, 1000)
    // })

    let element: Node = document.getElementsByClassName('progress-bar').length > 0 ? document.getElementsByClassName('progress-bar')[0] : document.createElement('div')
    const mutationObserver = new MutationObserver(callback)
    mutationObserver.observe(element, { attributes: true })

    function callback() {
        console.log(Date() + ` | attribute changed`)
        setPlayingTrack()
    }
})