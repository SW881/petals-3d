import React from 'react'

const DrawGuidePlaneIcon = ({ color, size }) => {
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
                d="M6.28613 2.5H11.5V7.55566C11.5001 9.07224 12.761 10.2773 14.2861 10.2773H19.5V19.7773C19.5 20.7154 18.7135 21.5 17.7139 21.5H6.28613C5.28653 21.5 4.5 20.7153 4.5 19.7773V4.22266C4.5 3.28468 5.28654 2.5 6.28613 2.5Z"
                stroke={color}
            />
            <path
                d="M13.1428 7.55561V2.67066C13.1428 2.42319 13.4506 2.29926 13.6306 2.47425L19.5122 8.19252C19.6922 8.36751 19.5648 8.66672 19.3101 8.66672H14.2857C13.6545 8.66672 13.1428 8.16925 13.1428 7.55561Z"
                fill={color}
            />
            <path d="M8 13.6666H14.8571" stroke={color} strokeLinecap="round" />
            <path d="M8 17H13.7143" stroke={color} strokeLinecap="round" />
        </svg>
    )
}

export default DrawGuidePlaneIcon
