document.addEventListener('DOMContentLoaded', () => {
    const slider: HTMLElement | null = document.querySelector('body header')

    if (slider) {

        let isDown = false
        let startX: number
        let scrollLeft: number

        slider.addEventListener('mousedown', (e) => {
            isDown = true
            slider.classList.add('active')
            startX = e.pageX - slider.offsetLeft
            scrollLeft = slider.scrollLeft
        })
        slider.addEventListener('mouseleave', () => {
            isDown = false
            slider.classList.remove('active')
        })
        slider.addEventListener('mouseup', () => {
            isDown = false
            slider.classList.remove('active')
        })
        slider.addEventListener('mousemove', (e) => {
            if (!isDown) return
            e.preventDefault()
            const x = e.pageX - slider.offsetLeft
            const walk = (x - startX)
            slider.scrollLeft = scrollLeft - walk
        })
    }

    jQuery('#main-header .playlist-link').on('click', (e: MouseEvent) => {
        jQuery('#main-header .playlist-link').removeClass('selected')
        jQuery(e.target).addClass('selected')
    })

    let playlists: HTMLElement | null = document.querySelector('#main-header .playlist-link')

    playlists?.addEventListener('click', (e: MouseEvent) => {
        playlists?.classList.remove('selected')
        //e.target?.classList.add('selected')
    })
})