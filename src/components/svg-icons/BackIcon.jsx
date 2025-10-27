import React from 'react'

const BackIcon = ({ color, size }) => {
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
                d="M4.29289 11.2929C3.90237 11.6834 3.90237 12.3166 4.29289 12.7071L10.6569 19.0711C11.0474 19.4616 11.6805 19.4616 12.0711 19.0711C12.4616 18.6805 12.4616 18.0474 12.0711 17.6569L6.41421 12L12.0711 6.34315C12.4616 5.95262 12.4616 5.31946 12.0711 4.92893C11.6805 4.53841 11.0474 4.53841 10.6569 4.92893L4.29289 11.2929ZM20 12L20 11L5 11L5 12L5 13L20 13L20 12Z"
                fill={color}
            />
        </svg>
    )
}

export default BackIcon
