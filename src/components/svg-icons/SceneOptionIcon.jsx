import React from 'react'

const SceneOptionIcon = ({ color, size }) => {
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
            <rect
                x="-0.5"
                y="0.5"
                width="7.88889"
                height="7.88889"
                transform="matrix(-1 0 0 1 9.88892 2)"
                stroke={color}
            />
            <rect
                x="-0.5"
                y="0.5"
                width="7.88889"
                height="7.88889"
                transform="matrix(-1 0 0 1 21 13.1111)"
                stroke={color}
            />
            <rect
                width="8.88889"
                height="8.88889"
                transform="matrix(-1 0 0 1 22 2)"
                fill={color}
            />
            <rect
                width="8.88889"
                height="8.88889"
                transform="matrix(-1 0 0 1 10.8889 13.1111)"
                fill={color}
            />
        </svg>
    )
}

export default SceneOptionIcon
