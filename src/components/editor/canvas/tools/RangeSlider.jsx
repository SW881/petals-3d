import React from 'react'

const RangeSlider = (props) => {
    const {
        name,
        max,
        min,
        step,
        value,
        backgroundSize,
        setUpdatingValue,
        setUpdatingBackground,
    } = props

    function handleValueChange(e) {
        e.preventDefault()
        setUpdatingValue(parseFloat(e.target.value))
        const min = e.target.min
        const max = e.target.max
        const currentVal = e.target.value
        setUpdatingBackground(
            ((currentVal - min) / (max - min)) * 100 + '% 100%'
        )
    }
    return (
        <>
            <div className="p-[12px] text-[8px] md:text-[12px] funnel-sans-regular">
                {name ? name : ''}
            </div>
            <div className="bg-[#000000] flex flex-col m-[4px] gesture-allowed">
                <div className="range-container">
                    <div className="range-wrapper">
                        <input
                            onChange={(e) => handleValueChange(e)}
                            type="range"
                            name="range"
                            id="range-slider"
                            step={step}
                            value={value}
                            min={min}
                            max={max}
                            style={{
                                width: '100%',
                                backgroundSize: backgroundSize,
                            }}
                        />
                    </div>
                </div>
            </div>
            <div className="m-[4px]">
                <div className="mt-[16px]">
                    <input
                        type="number"
                        className="border border-[#E5E7EB] text-[#000000] rounded-[4px] block w-[72px] text-[8px] md:text-[12px]  px-[12px] py-[8px] focus:outline-0 funnel-sans-semibold"
                        value={value}
                        disabled={true}
                    />
                </div>
            </div>
        </>
    )
}

export default RangeSlider
