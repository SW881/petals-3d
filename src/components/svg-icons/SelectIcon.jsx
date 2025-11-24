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
                d="M4.33142 3.21547C4.61831 2.97649 5.0218 2.9322 5.35436 3.10318L20.4989 10.8896C20.8306 11.0602 21.0269 11.4115 20.997 11.7812C20.9671 12.1507 20.7169 12.4665 20.362 12.5823L14.003 14.6577L10.8398 20.5142C10.6634 20.841 10.3067 21.0308 9.93483 20.9959C9.56298 20.9609 9.24852 20.708 9.13695 20.3541L4.0424 4.19603C3.93053 3.84122 4.04453 3.45444 4.33142 3.21547ZM6.4781 5.75517L10.248 17.712L12.5432 13.4627C12.6557 13.2543 12.8447 13.0968 13.071 13.0229L17.685 11.5171L6.4781 5.75517Z"
                fill={color}
            />
        </svg>
    )
}

export default SelectIcon
