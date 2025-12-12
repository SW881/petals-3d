import React from 'react'

const FullScreenIcon = ({ color, size }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
        >
            <rect
                x="-0.5"
                y="0.5"
                width="23"
                height="23"
                transform="matrix(-1 0 0 1 23 0)"
                stroke="none"
            />
            <rect x="2" y="2" width="8" height="1.5" rx="0.75" fill={color} />
            <rect x="2" y="2" width="1.5" height="8" rx="0.75" fill={color} />
            <rect
                x="2"
                y="22"
                width="8"
                height="1.5"
                rx="0.75"
                transform="rotate(-90 2 22)"
                fill={color}
            />
            <rect
                x="2"
                y="22"
                width="1.5"
                height="8"
                rx="0.75"
                transform="rotate(-90 2 22)"
                fill={color}
            />
            <rect
                x="22"
                y="2"
                width="8"
                height="1.5"
                rx="0.75"
                transform="rotate(90 22 2)"
                fill={color}
            />
            <rect
                x="22"
                y="2"
                width="1.5"
                height="8"
                rx="0.75"
                transform="rotate(90 22 2)"
                fill={color}
            />
            <rect
                x="22"
                y="22"
                width="8"
                height="1.5"
                rx="0.75"
                transform="rotate(-180 22 22)"
                fill={color}
            />
            <rect
                x="22"
                y="22"
                width="1.5"
                height="8"
                rx="0.75"
                transform="rotate(-180 22 22)"
                fill={color}
            />
        </svg>
    )
}

export default FullScreenIcon
