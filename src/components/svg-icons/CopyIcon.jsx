import React from 'react'

const CopyIcon = ({ color, size }) => {
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
                fillRule="evenodd"
                clipRule="evenodd"
                d="M10.3333 7.83333H19.5C20.8807 7.83333 22 8.95262 22 10.3333V19.5C22 20.8807 20.8807 22 19.5 22H10.3333C8.95262 22 7.83333 20.8807 7.83333 19.5V10.3333C7.83333 8.95262 8.95262 7.83333 10.3333 7.83333ZM16.1667 6.16667H10.3333C8.03215 6.16667 6.16667 8.03215 6.16667 10.3333V16.1667H4.5C3.11929 16.1667 2 15.0474 2 13.6667V4.5C2 3.11929 3.11929 2 4.5 2H13.6667C15.0474 2 16.1667 3.11929 16.1667 4.5V6.16667Z"
                fill={color}
            />
        </svg>
    )
}

export default CopyIcon
