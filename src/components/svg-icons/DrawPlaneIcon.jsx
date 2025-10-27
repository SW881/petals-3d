import React from 'react'

const DrawPlaneIcon = ({ color, size }) => {
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
                d="M11 3.5H18C18.2761 3.5 18.5 3.72386 18.5 4V20C18.5 20.2761 18.2761 20.5 18 20.5H6C5.72386 20.5 5.5 20.2761 5.5 20V9C5.5 5.96243 7.96243 3.5 11 3.5Z"
                stroke={color}
            />
            <path
                d="M10.0996 7C10.0996 7.82843 9.42804 8.5 8.59961 8.5H5.50293C5.553 5.89759 7.55041 3.77267 10.0996 3.52441V7Z"
                stroke={color}
            />
        </svg>
    )
}

export default DrawPlaneIcon
