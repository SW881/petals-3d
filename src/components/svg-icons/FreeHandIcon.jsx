import React from 'react'

const FreeHandIcon = ({ color, size }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
        >
            <rect x="0.5" y="0.5" width="23" height="23" stroke="none" />
            <path
                d="M20 9.99979C12 24 12 -1.27146e-07 4 13.9998"
                stroke={color}
                strokeWidth="3"
                strokeLinecap="round"
            />
        </svg>
    )
}

export default FreeHandIcon
