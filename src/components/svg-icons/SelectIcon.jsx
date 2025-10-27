import React from 'react'

const SelectIcon = ({ color, size }) => {
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
                d="M20.9648 21.0469L12.3711 17.6104C12.1328 17.5151 11.8672 17.5151 11.6289 17.6104L3.03516 21.0469L12 3.11816L20.9648 21.0469Z"
                fill={color}
                stroke={color}
            />
        </svg>
    )
}

export default SelectIcon
