const $ = require('jquery')

let getHTMLTemplate = async (path: string): Promise<string> => {
    return await fetch(window.location.origin + path).then(res => { return res.text()})
}

let setHTMLTemplate = (template: string, elementId: string): void => {
    let element = $(elementId)

    // If alredy set clear all children first
    if (element.children().length > 0) {
        element.children().remove()
    }

    element.append(template)
}

let loadContent = (pathAndId: string) => {
    getHTMLTemplate(pathAndId).then(text => {
        setHTMLTemplate(text, '#main-main')
    })
}

((): void => {
    // Get and set header
    getHTMLTemplate('/header').then(text => {
        setHTMLTemplate(text, '#main-header')
    })
    // Get and set footer
    getHTMLTemplate('/footer').then(text => {
        setHTMLTemplate(text, '#main-footer')
    })
    // Get and set auth
    getHTMLTemplate('/auth').then(text => {
        setHTMLTemplate(text, '#main-main')
    })
})()
