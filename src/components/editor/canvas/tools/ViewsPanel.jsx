import React, { useCallback, useEffect } from 'react'

import LockIcon from '../../../svg-icons/LockIcon'
import UndoIcon from '../../../svg-icons/UndoIcon'
import RedoIcon from '../../../svg-icons/RedoIcon'
import GridIcon from '../../../svg-icons/GridIcon'
import CameraFovIcon from '../../../svg-icons/CameraFovIcon'
import OrthograhicView from '../../../svg-icons/OrthograhicView'

import { canvasViewStore } from '../../../../hooks/useCanvasViewStore'

import ToolTip from '../../../info/ToolTip'
import RangeSlider from './RangeSlider'
import FullScreenIcon from '../../../svg-icons/FullScreenIcon'

const ViewsPanel = ({ isSmall }) => {
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

        fullScreen,
        setFullScreen,
    } = canvasViewStore((state) => state)

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
            default:
                break
        }
    }

    async function handleFovSlider(e) {
        e.preventDefault()
        setCameraFov(parseInt(e.target.value))
        e.preventDefault()

        const min = e.target.min
        const max = e.target.max
        const currentVal = e.target.value

        setFovBackground(((currentVal - min) / (max - min)) * 100 + '% 100%')
    }

    const handleFullscreenToggle = useCallback(async () => {
        if (!document.fullscreenElement) {
            // Enter fullscreen
            if (document.documentElement.requestFullscreen) {
                await document.documentElement.requestFullscreen()
            } else if (document.documentElement.webkitRequestFullscreen) {
                // Chrome/Safari
                await document.documentElement.webkitRequestFullscreen()
            }
            setFullScreen(true)
        } else {
            // Exit fullscreen
            if (document.exitFullscreen) {
                await document.exitFullscreen()
            } else if (document.webkitExitFullscreen) {
                // Chrome/Safari
                await document.webkitExitFullscreen()
            }
            setFullScreen(false)
        }
    }, [])

    // Listen for fullscreen changes
    useEffect(() => {
        const handleFullscreenChange = () => {
            setFullScreen(!!document.fullscreenElement)
        }

        document.addEventListener('fullscreenchange', handleFullscreenChange)
        document.addEventListener(
            'webkitfullscreenchange',
            handleFullscreenChange
        )

        return () => {
            document.removeEventListener(
                'fullscreenchange',
                handleFullscreenChange
            )
            document.removeEventListener(
                'webkitfullscreenchange',
                handleFullscreenChange
            )
        }
    }, [])

    return (
        <>
            <div className="flex flex-col gap-[4px] p-[4px] absolute bottom-[16px] left-[12px] rounded-[8px] bg-[#FFFFFF] border-[1px] border-[#4B5563]/25 drop-shadow-xl">
                <ToolTip text="Full screen" position="right" delay={100}>
                    <button
                        onClick={(e) => handleFullscreenToggle(e)}
                        className={`text-[#FFFFFF] flex justify-center font-bold p-[8px] cursor-pointer rounded-[4px] border-[0px] ${
                            fullScreen
                                ? 'bg-[#5CA367]'
                                : 'hover:bg-[#5CA367]/75'
                        }`}
                    >
                        <FullScreenIcon
                            color="#000000"
                            size={isSmall ? 12 : 20}
                        />
                    </button>
                </ToolTip>

                <ToolTip text="Perfect View" position="right" delay={100}>
                    <button
                        onClick={(e) => setIsOrthographic(!isOrthographic)}
                        className={`text-[#FFFFFF] flex justify-center font-bold p-[8px] cursor-pointer rounded-[4px] border-[0px] ${
                            isOrthographic
                                ? 'bg-[#5CA367]'
                                : ' hover:bg-[#5CA367]/75'
                        }`}
                    >
                        <OrthograhicView
                            color="#000000"
                            size={isSmall ? 12 : 20}
                        />
                    </button>
                </ToolTip>

                <ToolTip text="Fov Slider" position="right" delay={100}>
                    <button
                        disabled={isOrthographic}
                        onClick={(e) => handleViewActions('fov_slider')}
                        className={`text-[#FFFFFF] flex justify-center font-bold p-[8px] cursor-pointer rounded-[4px] border-[0px] ${
                            showFovSlider && !isOrthographic
                                ? 'bg-[#5CA367]'
                                : ' hover:bg-[#5CA367]/75'
                        }`}
                    >
                        <CameraFovIcon
                            color="#000000"
                            size={isSmall ? 12 : 20}
                        />
                    </button>
                </ToolTip>

                <ToolTip text="Enable Grids" position="right" delay={100}>
                    <button
                        onClick={(e) => handleViewActions('grids')}
                        className={`text-[#FFFFFF] flex justify-center font-bold p-[8px] cursor-pointer rounded-[4px] border-[0px] ${
                            showGridOptions
                                ? 'bg-[#5CA367]'
                                : ' hover:bg-[#5CA367]/75'
                        }`}
                    >
                        <GridIcon color="#000000" size={isSmall ? 12 : 20} />
                    </button>
                </ToolTip>

                <ToolTip text="Orbit Lock" position="right" delay={100}>
                    <button
                        onClick={(e) => setOrbitalLock(!orbitalLock)}
                        className={`text-[#FFFFFF] flex justify-center font-bold p-[8px] cursor-pointer rounded-[4px] border-[0px] ${
                            orbitalLock
                                ? 'bg-[#5CA367]'
                                : ' hover:bg-[#5CA367]/75'
                        }`}
                    >
                        <LockIcon color="#000000" size={isSmall ? 12 : 20} />
                    </button>
                </ToolTip>

                <ToolTip text="Undo" position="right" delay={100}>
                    <button
                        className={`hover:bg-[#5CA367]/75  text-[#FFFFFF] font-bold p-[8px] cursor-pointer rounded-[4px] z-5 border-[0px]`}
                    >
                        <UndoIcon color="#000000" size={isSmall ? 12 : 20} />
                    </button>
                </ToolTip>

                <ToolTip text="Redo" position="right" delay={100}>
                    <button
                        className={`hover:bg-[#5CA367]/75  text-[#FFFFFF] font-bold p-[8px] cursor-pointer rounded-[4px] z-5 border-[0px]`}
                    >
                        <RedoIcon color="#000000" size={isSmall ? 12 : 20} />
                    </button>
                </ToolTip>
            </div>

            {showFovSlider && !isOrthographic && (
                <div className="absolute bottom-[140px] md:bottom-[184px] left-[58px] md:left-[72px] w-[140px] md:w-[198px] z-5 p-[4px] justify-center rounded-[8px] bg-[#FFFFFF] border-[1px] border-[#4B5563]/25 drop-shadow-xl">
                    <RangeSlider
                        name="Camera Fov"
                        max={100}
                        min={0}
                        step={1}
                        value={cameraFov}
                        backgroundSize={fovBackground}
                        setUpdatingValue={setCameraFov}
                        setUpdatingBackground={setFovBackground}
                        isSmall={isSmall}
                    />
                </div>
            )}

            {showGridOptions && (
                <div className="absolute bottom-[208px] md:bottom-[256px] left-[58px] md:left-[72px] z-5 gap-[4px] p-[4px] flex justify-center rounded-[8px] bg-[#FFFFFF] border-[1px] border-[#4B5563]/25 drop-shadow-xl">
                    <button
                        onClick={(e) => setGridPlaneX(!gridPlaneX)}
                        className={`${
                            gridPlaneX
                                ? 'bg-[#DE3163]/50'
                                : ' hover:bg-[#5CA367]/75'
                        }  text-[#FFFFFF] font-bold p-[8px] cursor-pointer rounded-[4px] z-5 border-[0px]`}
                    >
                        <GridIcon color="#DE3163" size={isSmall ? 12 : 20} />
                    </button>

                    <button
                        onClick={(e) => setGridPlaneY(!gridPlaneY)}
                        className={`${
                            gridPlaneY
                                ? 'bg-[#50C878]/50'
                                : ' hover:bg-[#5CA367]/75'
                        }  text-[#FFFFFF] font-bold p-[8px] cursor-pointer rounded-[4px] z-5 border-[0px]`}
                    >
                        <GridIcon color="#50C878" size={isSmall ? 12 : 20} />
                    </button>

                    <button
                        onClick={(e) => setGridPlaneZ(!gridPlaneZ)}
                        className={`${
                            gridPlaneZ
                                ? 'bg-[#0096FF]/50'
                                : ' hover:bg-[#5CA367]/75'
                        }  text-[#FFFFFF] font-bold p-[8px] cursor-pointer rounded-[4px] z-5 border-[0px]`}
                    >
                        <GridIcon color="#0096FF" size={isSmall ? 12 : 20} />
                    </button>
                </div>
            )}
        </>
    )
}

export default ViewsPanel
