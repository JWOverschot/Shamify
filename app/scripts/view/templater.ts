const jQuery = require('jquery')

let urlExists = (url: string): Promise<boolean> => {
    return fetch(url).then(res => {
        return res.ok
    })
}

let getHTMLTemplate = async (path: string): Promise<string> => {
    return await fetch(window.location.origin + path).then(res => { return res.text() })
}

let getTrackCover = async (): Promise<string> => {
    return await fetch(window.location.origin + '/content/cover/currently-playing').then(res => { return res.text() })
}

let setHTMLTemplate = (template: string, elementId: string): void => {
    let element = jQuery(elementId)

    // If alredy set clear all children first
    if (element.children().length > 0) {
        element.children().remove()
    }

    element.append(template)
}

let setPageResources = (pageName: string): void => {
    if (window.location.pathname.split('/')[1] === pageName) {
        return
    }

    let element = jQuery('#resources')

    // If alredy set clear all children first
    if (element.children().length > 0) {
        element.children().remove()
    }

    let cssLink = window.location.origin + `/css/${pageName}/style.css`
    let jsLink = window.location.origin + `/js/view/${pageName}/${pageName}.js`

    urlExists(cssLink).then(bool => {
        if (bool) {
            element.append(`<link rel="stylesheet" href="${cssLink}">`)
        }
    })

    urlExists(jsLink).then(bool => {
        if (bool) {
            element.append(`<script src="${jsLink}"></script>`)
            if (pageName === 'album' || pageName === 'playlist') {
                element.append(`<script src="${window.location.origin + '/js/view/track.js'}"></script>`)
            }
        }
    })

    urlExists(window.location.origin + '/js/view/track.js').then(bool => {
        if (bool && (pageName === 'album' || pageName === 'playlist')) {
            element.append(`<script src="${window.location.origin + '/js/view/track.js'}"></script>`)
        }
    })
}

let loadHeaderContent = () => {
    getHTMLTemplate('/pages/header').then(text => {
        setHTMLTemplate(text, '#main-header')
    })
}

let loadMainContent = (pathAndId: string, differentElement?: string) => {
    getHTMLTemplate('/pages/' + pathAndId).then(text => {
        setHTMLTemplate(text, differentElement ? differentElement : '#main-main')
    })
}

let loadFooterContent = () => {
    getHTMLTemplate('/pages/footer').then(text => {
        setHTMLTemplate(text, '#main-footer')
    })
    loadBackgroundImage()
}

let loadBackgroundImage = () => {
    getTrackCover().then((url: string) => {
        if (url) {
            let element = jQuery('#background-content img')
    
            element[0].attributes.src.value = url
        }
    })
}

let preventNavigation = () => {
    let location = window.document.location
    let originalHashValue = location.hash

    window.setTimeout(() => {
        location.hash = 'preventNavigation' + ~~(9999 * Math.random())
        location.hash = originalHashValue
    }, 0)
};

let navigationHandler = (event: any, isNavigate: boolean) => {
    let URI
    if (isNavigate) {
        URI = event.target.location.href
    } else {
        URI = event.target.href ? event.target.href : ''
    }
    let path = URI.split('/').slice(3)

    switch (path[0]) {
        case 'album':
        case 'playlist':
            event.preventDefault()
            setPageResources(path[0])
            window.history.pushState('', path[0], URI)
            loadMainContent(path.join('/'))
            loadFooterContent()
            break
        case 'login':
            break
        case 'close':
            break
        default:
            //event.returnValue = '';
            event.preventDefault()
            window.history.pushState('', path[0], URI)
            loadHeaderContent()
            loadMainContent(path.join('/'))
            loadFooterContent()
            setPageResources('footer')
            
        //TODO: Page to go to when it doesn't exsist
    }
}

// window.addEventListener('beforeunload', (event: any) => {
//     event.stopPropagation()
//     navigationHandler(event, false)
// }, true);

window.onpopstate = (event: any) => {
    event.preventDefault()
    navigationHandler(event, true)
}

(function ($) {
    $(document).on('click', 'a', (event: any) => {
        event.stopPropagation()
        navigationHandler(event, false)
    })
})(jQuery);

// Inital page load
((): void => {
    // Get and set header
    loadHeaderContent()
    // Get and set footer
    loadFooterContent()
    // Get and set auth
    loadMainContent('auth')
})()

// $(document).ready(() => {
//     $('.titlebar .window-close').on('click', (event: any) => {
//         //event.preventDefault()
//         console.log('1')
//         window.removeEventListener('beforeunload', (event) => {
//             console.log('2')
//             navigationHandler(event, false, true)
//         }, true)
//     })
// })
//TODO: Make more intelligent Don't update when music is paused. Update immidetly on media key presses. No updates when scrubbing.
setInterval (() => {
    loadFooterContent()
}, 60000)