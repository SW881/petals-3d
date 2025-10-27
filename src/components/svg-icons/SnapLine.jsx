import React from 'react'

const SnapLine = ({ color, size }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
        >
            <path
                d="M4 12H20"
                stroke={color}
                strokeWidth="4"
                strokeLinecap="round"
            />
        </svg>
    )
}

export default SnapLine
