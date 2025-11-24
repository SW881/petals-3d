import React from 'react'

const FoldersIcon = ({ size }) => {
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
                d="M21.5484 4H13.5806C13.3226 4 13.0968 4 12.8387 4.39184L12.4194 4.97959H3C2.45161 4.97959 2 5.50204 2 6.05714V18.8898C2 19.4449 2.45161 20 3 20H21C21.5484 20 22 19.4449 22 18.8898V8.96327V6.0898V4.39184C22 4.16327 21.8065 4 21.5484 4Z"
                fill="#FFB000"
            />
            <path
                d="M2 8H22V19C22 19.5523 21.5523 20 21 20H3C2.44772 20 2 19.5523 2 19V8Z"
                fill="#FDC64C"
            />
        </svg>
    )
}

export default FoldersIcon
