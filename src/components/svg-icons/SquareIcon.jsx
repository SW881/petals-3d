import React from 'react'

const SquareIcon = ({ color, size }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
        >
            <path d="M0.5 0.5V23.5H23.5V0.5H0.5Z" stroke="none" />
            <rect
                x="2.5"
                y="2.5"
                width="19"
                height="19"
                rx="1.5"
                stroke={color}
                strokeLinejoin="round"
            />
        </svg>
    )
}

export default SquareIcon
