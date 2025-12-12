import React from 'react'

const DrawIcon = ({ color, size }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
        >
            <rect x="0.5" y="0.5" width="23" height="23" stroke="none" />
            <path
                d="M11.5527 4.0127C11.737 3.64417 12.263 3.64417 12.4473 4.0127L20.8291 20.7764C20.9953 21.1088 20.7535 21.5 20.3818 21.5H3.61816C3.24647 21.5 3.00467 21.1088 3.1709 20.7764L11.5527 4.0127Z"
                fill="none"
                stroke={color}
            />
            <path d="M12 2L17 12H12.25H7L12 2Z" fill={color} />
        </svg>
    )
}

export default DrawIcon
