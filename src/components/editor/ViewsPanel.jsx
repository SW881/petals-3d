import React from 'react'

import LockIcon from '../svg-icons/LockIcon'
import UndoIcon from '../svg-icons/UndoIcon'
import RedoIcon from '../svg-icons/RedoIcon'
import GridIcon from '../svg-icons/GridIcon'
import CameraFovIcon from '../svg-icons/CameraFovIcon'
import OrthograhicView from '../svg-icons/OrthograhicView'

import { drawStore } from '../../hooks/useDrawStore'
import { canvasViewStore } from '../../hooks/useCanvasViewStore'
import TooltipAdvanced from '../info/TooltipAdvanced'

const ViewsPanel = () => {
    const {
        orbitalLock,
        setOrbitalLock,
        showFovSlider,
        setShowFovSlider,
        gridPlaneX,
        gridPlaneY,
        gridPlaneZ,
        setGridPlaneX,
        setGridPlaneY,
        setGridPlaneZ,
        showGridOptions,
        setShowGridOptions,
        cameraFov,
        setCameraFov,
        fovBackground,
        setFovBackground,
        isOrthographic,
        setIsOrthographic,
    } = canvasViewStore((state) => state)

    const { allowUndo, allowRedo, setAllowUndo, setAllowRedo } = drawStore(
        (state) => state
    )

    async function handleViewActions(action) {
        switch (action) {
            case 'fov_slider':
                setShowGridOptions(false)
                setShowFovSlider(!showFovSlider)
                break
            case 'grids':
                setShowFovSlider(false)
                setShowGridOptions(!showGridOptions)
                break
            case 'orbit_lock':
                break
            default:
                break
        }
    }

    async function handleUndoRedo(action) {
        if (action === 'undo') {
            setAllowUndo(true)
        } else {
            setAllowRedo(true)
        }
    }

    async function handleFovSlider(e) {
        e.preventDefault()
        setCameraFov(parseInt(e.target.value))
        // console.log({ cameraFov })
        // const min = e.target.min
        // const max = e.target.max
        // const currentVal = e.target.value
        // // e.target.style.backgroundSize =
        // let x = ((currentVal - min) / (max - min)) * 100 + '% 100%'
        // console.log({ x })
        // setFovBackground(((currentVal - min) / (max - min)) * 100 + '% 100%')

        e.preventDefault()
        // setStrokeStablePercentage(e.target.value)

        const min = e.target.min
        const max = e.target.max
        const currentVal = e.target.value
        // e.target.style.backgroundSize =
        // let x = ((currentVal - min) / (max - min)) * 100 + '% 100%'
        // console.log({ x })
        setFovBackground(((currentVal - min) / (max - min)) * 100 + '% 100%')
    }

    return (
        <>
            <div className="flex flex-col gap-[4px] p-[4px] absolute bottom-[16px] left-[16px] rounded-[12px] bg-[#000000]">
                <TooltipAdvanced
                    text="Perfect View"
                    position="right"
                    delay={100}
                >
                    <button
                        onClick={(e) => setIsOrthographic(!isOrthographic)}
                        className={`hover:bg-[#5D3FD3] text-[#FFFFFF] flex justify-center font-bold p-[8px] cursor-pointer rounded-[8px] border-[0px] ${
                            isOrthographic ? 'bg-[#5D3FD3]' : 'bg-[#000000]'
                        }`}
                    >
                        <OrthograhicView color="#FFFFFF" size={20} />
                    </button>
                </TooltipAdvanced>

                <TooltipAdvanced text="Fov Slider" position="right" delay={100}>
                    <button
                        disabled={isOrthographic}
                        onClick={(e) => handleViewActions('fov_slider')}
                        className={`hover:bg-[#5D3FD3] text-[#FFFFFF] flex justify-center font-bold p-[8px] cursor-pointer rounded-[8px] border-[0px] ${
                            showFovSlider && !isOrthographic
                                ? 'bg-[#5D3FD3]'
                                : 'bg-[#000000]'
                        }`}
                    >
                        <CameraFovIcon color="#FFFFFF" size={20} />
                    </button>
                </TooltipAdvanced>

                <TooltipAdvanced
                    text="Enable Grids"
                    position="right"
                    delay={100}
                >
                    <button
                        onClick={(e) => handleViewActions('grids')}
                        className={`hover:bg-[#5D3FD3] text-[#FFFFFF] flex justify-center font-bold p-[8px] cursor-pointer rounded-[8px] border-[0px] ${
                            showGridOptions ? 'bg-[#5D3FD3]' : 'bg-[#000000]'
                        }`}
                    >
                        <GridIcon color="#FFFFFF" size={20} />
                    </button>
                </TooltipAdvanced>

                <TooltipAdvanced text="Orbit Lock" position="right" delay={100}>
                    <button
                        onClick={(e) => setOrbitalLock(!orbitalLock)}
                        className={`hover:bg-[#5D3FD3] text-[#FFFFFF] flex justify-center font-bold p-[8px] cursor-pointer rounded-[8px] border-[0px] ${
                            orbitalLock ? 'bg-[#5D3FD3]' : 'bg-[#000000]'
                        }`}
                    >
                        <LockIcon color="#FFFFFF" size={20} />
                    </button>
                </TooltipAdvanced>

                <TooltipAdvanced text="Undo" position="right" delay={100}>
                    <button
                        // disabled={allowUndo}
                        // onClick={(e) => handleUndoRedo('undo')}
                        className={`hover:bg-[#5D3FD3] active:scale-90 text-[#FFFFFF] font-bold p-[8px] cursor-pointer rounded-[8px] z-5 border-[0px]`}
                    >
                        <UndoIcon color="#FFFFFF" size={20} />
                    </button>
                </TooltipAdvanced>

                <TooltipAdvanced text="Redo" position="right" delay={100}>
                    <button
                        // disabled={allowRedo}
                        // onClick={(e) => handleUndoRedo('redo')}
                        className={`hover:bg-[#5D3FD3] active:scale-90 text-[#FFFFFF] font-bold p-[8px] cursor-pointer rounded-[8px] z-5 border-[0px]`}
                    >
                        <RedoIcon color="#FFFFFF" size={20} />
                    </button>
                </TooltipAdvanced>
            </div>

            {showFovSlider && !isOrthographic && (
                <div className="absolute w-[198px] bottom-[188px] left-[72px] z-5 p-[4px] justify-center rounded-[8px] bg-[#000000] ">
                    <div className="flex flex-col m-[4px]">
                        <div className="range-container">
                            <div className="range-wrapper">
                                <input
                                    onChange={(e) => handleFovSlider(e)}
                                    type="range"
                                    name="range"
                                    id="range-slider"
                                    step={1}
                                    value={cameraFov}
                                    min={1}
                                    max={100}
                                    style={{
                                        backgroundSize: fovBackground,
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#000000] m-[4px]">
                        <div className="mt-[16px]">
                            <input
                                // onChange={(e) => handleOpacitySliderValue(e)}
                                type="number"
                                className="text-[#FFFFFF] rounded-[8px] block w-[72px] text-[12px] px-[12px] py-[8px] focus:outline-0 funnel-sans-semibold"
                                value={cameraFov}
                                disabled={true}
                            />
                        </div>
                    </div>
                </div>
            )}

            {showGridOptions && (
                <div className="absolute bottom-[216px] left-[72px] z-5 gap-[4px] p-[4px] flex justify-center rounded-[12px] bg-[#000000]">
                    <button
                        onClick={(e) => setGridPlaneX(!gridPlaneX)}
                        className={`${
                            gridPlaneX ? 'bg-[#DE3163]/50' : 'bg-[#000000]'
                        } active:scale-90 text-[#FFFFFF] font-bold p-[8px] cursor-pointer rounded-[8px] z-5 border-[0px]`}
                    >
                        <GridIcon color="#DE3163" size={20} />
                    </button>

                    <button
                        onClick={(e) => setGridPlaneY(!gridPlaneY)}
                        className={`${
                            gridPlaneY ? 'bg-[#50C878]/50' : 'bg-[#000000]'
                        } active:scale-90 text-[#FFFFFF] font-bold p-[8px] cursor-pointer rounded-[8px] z-5 border-[0px]`}
                    >
                        <GridIcon color="#50C878" size={20} />
                    </button>

                    <button
                        onClick={(e) => setGridPlaneZ(!gridPlaneZ)}
                        className={`${
                            gridPlaneZ ? 'bg-[#0096FF]/50' : 'bg-[#000000]'
                        } active:scale-90 text-[#FFFFFF] font-bold p-[8px] cursor-pointer rounded-[8px] z-5 border-[0px]`}
                    >
                        <GridIcon color="#0096FF" size={20} />
                    </button>
                </div>
            )}
        </>
    )
}

export default ViewsPanel
