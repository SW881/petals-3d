import React from 'react'

const ToolButton = (props) => {
    const { icon, condition } = props

    return (
        <>
            <button
                className={`flex justify-center font-bold p-[8px] cursor-pointer rounded-[4px] border-[0px] ${
                    condition ? 'bg-[#5CA367]' : 'hover:bg-[#5CA367]/25'
                }`}
            >
                {icon}
            </button>
        </>
    )
}

export default ToolButton
