import { cssTransition } from 'react-toastify'

export const eraseLineType = ['LINE', 'MERGED_LINE']

export const loftGuideLineType = ['LINE']

export const guideObjectType = [
    'LOFT_SURFACE',
    'OG_GUIDE_PLANE',
    'BEND_GUIDE_PLANE',
    'DYNAMIC_GUIDE_LINE',
]

export const Fade = cssTransition({
    enter: 'animate-fade-in',
    exit: 'animate-fade-out',
})
