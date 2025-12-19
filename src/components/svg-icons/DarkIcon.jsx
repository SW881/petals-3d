import React from 'react'

const DarkIcon = ({ color, size }) => {
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
                d="M16.124 13.5319C12.5659 13.2121 9.64746 10.4136 9.12774 6.89553C9.0078 6.17592 9.0078 5.41633 9.12774 4.7367C9.2077 4.177 8.56804 3.81719 8.12828 4.09704C5.52968 5.69618 3.85059 8.57462 4.01051 11.8129C4.2104 16.0906 7.60856 19.6087 11.8862 19.9685C16.124 20.3283 19.802 17.5698 20.8814 13.7318C21.0413 13.1721 20.4816 12.6924 19.9619 12.9323C18.8025 13.452 17.5232 13.6519 16.124 13.5319Z"
                stroke={color}
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    )
}

export default DarkIcon
