import React from 'react'

const WidthIcon = ({ color, size }) => {
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
                x="22"
                y="18"
                width="4"
                height="20"
                rx="2"
                transform="rotate(90 22 18)"
                fill={color}
            />
            <rect
                x="20"
                y="9"
                width="4"
                height="16"
                rx="2"
                transform="rotate(90 20 9)"
                fill={color}
            />
            <rect
                x="18"
                y="2"
                width="3"
                height="12"
                rx="1.5"
                transform="rotate(90 18 2)"
                fill={color}
            />
        </svg>
    )
}

export default WidthIcon
