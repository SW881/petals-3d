import React from 'react'

const OpacityIcon = ({ color, size, opacity }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            opacity={opacity}
        >
            <rect
                x="-0.5"
                y="0.5"
                width="23"
                height="23"
                transform="matrix(-1 0 0 1 23 0)"
                stroke="none"
            />
            <circle cx="12" cy="12" r="10" fill={color} />
        </svg>
    )
}

export default OpacityIcon
