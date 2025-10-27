import React from 'react'

const FillComplete = ({ color, size }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
        >
            <rect x="0.5" y="0.5" width="23" height="23" stroke="none" />
            <rect x="4" y="4" width="16" height="16" rx="2" fill={color} />
        </svg>
    )
}

export default FillComplete
