const setPlayingTrack = () => {
    const trackElements = jQuery('.track-row')

    for (let index = 0; index < trackElements.length; index++) {
        const element = trackElements[index]
        const currentTrackId = jQuery('.information-overlay .overlay-top').attr('data-trackid')

        if (jQuery(element).attr('data-trackid') === currentTrackId) {
            if (jQuery('.progress-bar').attr('data-isplaying') == 'true') {
                jQuery(element).addClass('playing')
            }
        } else if (jQuery(element).hasClass('playing')) {
            jQuery(element).removeClass('playing')
        }
    }
}

jQuery('#main-main').bind('DOMSubtreeModified', () => {
    setPlayingTrack()
})
jQuery('#main-footer').bind('DOMSubtreeModified', () => {
    setPlayingTrack()
})