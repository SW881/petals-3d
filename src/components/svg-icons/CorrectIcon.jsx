import React from 'react'

const CorrectIcon = ({ color, size }) => {
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
            <path
                d="M20.57 4L8.40764 16.1607L3.42874 11.1813L2 12.6126L8.40764 19.02L22 5.42909L20.57 4Z"
                fill={color}
            />
        </svg>
    )
}

export default CorrectIcon
