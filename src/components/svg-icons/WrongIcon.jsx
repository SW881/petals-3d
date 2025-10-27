import React from 'react'

const WrongIcon = ({ color, size }) => {
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
                d="M22 3.17449L13.1747 12L22 20.8255L20.8254 22L12.0001 13.1746L3.17471 22L2 20.8255L10.8254 12L2 3.17449L3.17459 2L11.9999 10.8254L20.8254 2L22 3.17449Z"
                fill={color}
            />
        </svg>
    )
}

export default WrongIcon
