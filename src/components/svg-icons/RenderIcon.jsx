import React from 'react'

const RenderIcon = ({ color, size }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
        >
            <path d="M0.5 0.5V23.5H23.5V0.5H0.5Z" stroke="none" />
            <path
                d="M12 11C10.3431 11 9 12.3431 9 14C9 15.6569 10.3431 17 12 17C13.6569 17 15 15.6569 15 14C15 12.3431 13.6569 11 12 11Z"
                stroke={color}
                strokeWidth="2"
            />
            <path
                d="M7 3H17C17.5523 3 18 3.44772 18 4V6H6V4C6 3.44772 6.44772 3 7 3Z"
                stroke={color}
                strokeWidth="2"
            />
            <path
                d="M4 6H20C20.5523 6 21 6.44772 21 7V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V7C3 6.44772 3.44772 6 4 6Z"
                stroke={color}
                strokeWidth="2"
            />
        </svg>
    )
}

export default RenderIcon
