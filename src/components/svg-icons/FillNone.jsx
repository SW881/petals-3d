import React from 'react'

const FillNone = ({ color, size }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
        >
            <rect x="0.5" y="0.5" width="23" height="23" stroke="none" />
            <rect
                x="4.5"
                y="4.5"
                width="15"
                height="15"
                rx="1.5"
                stroke={color}
            />
        </svg>
    )
}

export default FillNone
