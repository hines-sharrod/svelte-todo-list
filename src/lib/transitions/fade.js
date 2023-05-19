import {cubicInOut} from 'svelte/easing'

export default function fade(node, {delay = 0, duration = 400, easing = cubicInOut}) {
    const originalCapcity = getComputedStyle(node).opacity

    return {
        delay,
        duration,
        easing,
        // custom css transitions below
        // t is a range from 0 to 1
        css: (t) => {
            return `
                opacity: ${t * originalCapcity};
            `
        }    
    }
}