import React from 'react'

import ArcIcon from '../svg-icons/ArcIcon'
import WidthIcon from '../svg-icons/WidthIcon'
import CircleIcon from '../svg-icons/CircleIcon'
import MirrorIcon from '../svg-icons/MirrorIcon'
import OpacityIcon from '../svg-icons/OpacityIcon'
import FreeHandIcon from '../svg-icons/FreeHandIcon'
import FlatShadeIcon from '../svg-icons/FlatShadeIcon'
import GlowShadeIcon from '../svg-icons/GlowShadeIcon'
import CubeStrokeIcon from '../svg-icons/CubeStrokeIcon'
import BeltStrokeIcon from '../svg-icons/BeltStrokeIcon'
import TaperStrokeIcon from '../svg-icons/TaperStrokeIcon'
import ColorSelectIcon from '../svg-icons/ColorSelectIcon'
import PaintStrokeIcon from '../svg-icons/PaintStrokeIcon'
import StableStrokIcon from '../svg-icons/StableStrokIcon'
import RespondShadeIcon from '../svg-icons/RespondShadeIcon'
import StraightLineIcon from '../svg-icons/StraightLineIcon'
import PressureActiveIcon from '../svg-icons/PressureActiveIcon'
import PressureInActiveIcon from '../svg-icons/PressureInActiveIcon'

import { canvasDrawStore } from '../../hooks/useCanvasDrawStore'

import ToolTip from '../ToolTip'
import ToolButton from '../ToolButton'
import ColorPicker from '../ColorPicker'
import RangeSlider from '../RangeSlider'

import {
    handleMirroring,
    handleShape,
    handleStroke,
} from '../../helpers/toolHelper'

const PenOptionsPanel = ({ isSmall }) => {
    const {
        mirror,
        setMirror,
        mirrorOptions,
        setMirrorOptions,

        strokeOpacity,
        setStrokeOpacity,

        penActive,

        strokeType,
        setStrokeType,

        strokeColor,
        setStrokeColor,

        strokeWidth,
        setStrokeWidth,

        pressureMode,
        setPressureMode,

        opacityBackground,
        setOpacityBackground,

        drawShapeType,
        setDrawShapeType,

        widthBackground,
        setWidthBackground,

        openWidthSlider,
        setOpenWidthSlider,

        openColorOptions,
        setOpenColorOptions,

        openStrokeOptions,
        setOpenStrokeOptions,

        openOpacitySlider,
        setOpenOpacitySlider,

        openDrawShapeOptions,
        setOpenDrawShapeOptions,

        activeMaterialType,
        setActiveMaterialType,

        openStrokeStabler,
        setOpenStrokeStabler,

        stableBackground,
        setStableBackground,

        strokeStablePercentage,
        setStrokeStablePercentage,
    } = canvasDrawStore((state) => state)

    function handleStrokeOptions(e) {
        setOpenColorOptions(false)
        setOpenOpacitySlider(false)
        setOpenWidthSlider(false)
        setMirrorOptions(false)
        setOpenStrokeStabler(false)
        setOpenDrawShapeOptions(false)
        setOpenStrokeOptions(!openStrokeOptions)
    }

    function handleShapeOptions(e) {
        setOpenColorOptions(false)
        setOpenOpacitySlider(false)
        setOpenWidthSlider(false)
        setMirrorOptions(false)
        setOpenStrokeStabler(false)
        setOpenStrokeOptions(false)
        setOpenDrawShapeOptions(!openDrawShapeOptions)
    }

    function handleColorChange(e) {
        setOpenStrokeOptions(false)
        setOpenOpacitySlider(false)
        setOpenWidthSlider(false)
        setMirrorOptions(false)
        setOpenDrawShapeOptions(false)
        setOpenStrokeStabler(false)
        setOpenColorOptions(!openColorOptions)
    }

    function handleOpacityOptions(e) {
        setOpenColorOptions(false)
        setOpenStrokeOptions(false)
        setOpenWidthSlider(false)
        setMirrorOptions(false)
        setOpenDrawShapeOptions(false)
        setOpenStrokeStabler(false)
        setOpenOpacitySlider(!openOpacitySlider)
    }

    function handleWidthOptions(e) {
        setOpenColorOptions(false)
        setOpenStrokeOptions(false)
        setOpenOpacitySlider(false)
        setMirrorOptions(false)
        setOpenDrawShapeOptions(false)
        setOpenStrokeStabler(false)
        setOpenWidthSlider(!openWidthSlider)
    }

    function handleMirrorOptions(e) {
        setOpenColorOptions(false)
        setOpenStrokeOptions(false)
        setOpenOpacitySlider(false)
        setOpenWidthSlider(false)
        setOpenDrawShapeOptions(false)
        setOpenStrokeStabler(false)
        setMirrorOptions(!mirrorOptions)
    }

    function handleStableStrokeOptions(e) {
        setOpenColorOptions(false)
        setOpenStrokeOptions(false)
        setOpenOpacitySlider(false)
        setOpenWidthSlider(false)
        setMirrorOptions(false)
        setOpenDrawShapeOptions(false)
        setOpenStrokeStabler(!openStrokeStabler)
    }

    return (
        <div>
            {penActive && (
                <div className="absolute top-[72px] left-[12px] z-5 gap-[4px] p-[4px] flex flex-col justify-center rounded-[8px] bg-[#FFFFFF] border-[1px] border-[#4B5563]/25 drop-shadow-xl">
                    <ToolTip text="Color Select" position="right" delay={100}>
                        <button
                            onClick={(e) => handleColorChange(e)}
                            className="hover:bg-[#5CA367]/25 font-bold flex justify-center items-center m-[8px] cursor-pointer rounded-[4px] border-[0px]"
                        >
                            <ColorSelectIcon
                                color={strokeColor}
                                size={isSmall ? 12 : 20}
                            />
                        </button>
                    </ToolTip>

                    <ToolTip text="Brushes" position="right" delay={100}>
                        <button
                            onClick={(e) => handleStrokeOptions(e)}
                            className={`hover:bg-[#5CA367]/25 flex justify-center font-bold p-[8px] cursor-pointer rounded-[4px] border-[0px]`}
                        >
                            {strokeType === 'taper' && (
                                <TaperStrokeIcon
                                    color={strokeColor}
                                    size={isSmall ? 12 : 20}
                                />
                            )}
                            {strokeType === 'cube' && (
                                <CubeStrokeIcon
                                    color={strokeColor}
                                    size={isSmall ? 12 : 20}
                                />
                            )}
                            {strokeType === 'paint' && (
                                <PaintStrokeIcon
                                    color={strokeColor}
                                    size={isSmall ? 12 : 20}
                                />
                            )}
                            {strokeType === 'belt' && (
                                <BeltStrokeIcon
                                    color={strokeColor}
                                    size={isSmall ? 12 : 20}
                                />
                            )}
                        </button>
                    </ToolTip>

                    <ToolTip text="Draw Shape" position="right" delay={100}>
                        <button
                            onClick={(e) => handleShapeOptions(e)}
                            className={`flex justify-center font-bold p-[8px] cursor-pointer rounded-[4px] border-[0px] ${
                                openDrawShapeOptions
                                    ? 'bg-[#5CA367]'
                                    : 'hover:bg-[#5CA367]/25'
                            }`}
                        >
                            {drawShapeType === 'free_hand' && (
                                <FreeHandIcon
                                    color="#000000"
                                    size={isSmall ? 12 : 20}
                                />
                            )}
                            {drawShapeType === 'straight' && (
                                <StraightLineIcon
                                    color="#000000"
                                    size={isSmall ? 12 : 20}
                                />
                            )}
                            {drawShapeType === 'circle' && (
                                <CircleIcon
                                    color="#000000"
                                    size={isSmall ? 12 : 20}
                                />
                            )}
                            {drawShapeType === 'arc' && (
                                <ArcIcon
                                    color="#000000"
                                    size={isSmall ? 12 : 20}
                                />
                            )}
                        </button>
                    </ToolTip>

                    <ToolTip text="Opacity" position="right" delay={100}>
                        <div onClick={(e) => handleOpacityOptions(e)}>
                            <ToolButton
                                condition={openOpacitySlider}
                                icon={
                                    <OpacityIcon
                                        color="#000000"
                                        size={isSmall ? 12 : 20}
                                        opacity={strokeOpacity}
                                    />
                                }
                            />
                        </div>
                    </ToolTip>

                    <ToolTip text="Width" position="right" delay={100}>
                        <div onClick={(e) => handleWidthOptions(e)}>
                            <ToolButton
                                condition={openWidthSlider}
                                icon={
                                    <WidthIcon
                                        color="#000000"
                                        size={isSmall ? 12 : 20}
                                    />
                                }
                            />
                        </div>
                    </ToolTip>

                    <ToolTip text="Stable Stroke" position="right" delay={100}>
                        <div onClick={(e) => handleStableStrokeOptions(e)}>
                            <ToolButton
                                condition={openStrokeStabler}
                                icon={
                                    <StableStrokIcon
                                        color="#000000"
                                        size={isSmall ? 12 : 20}
                                    />
                                }
                            />
                        </div>
                    </ToolTip>

                    {pressureMode && (
                        <div onClick={(e) => setPressureMode(false)}>
                            <ToolButton
                                condition={false}
                                icon={
                                    <PressureActiveIcon
                                        color="#000000"
                                        size={isSmall ? 12 : 20}
                                    />
                                }
                            />
                        </div>
                    )}

                    {!pressureMode && (
                        <div onClick={(e) => setPressureMode(true)}>
                            <ToolButton
                                condition={false}
                                icon={
                                    <PressureInActiveIcon
                                        color="#000000"
                                        size={isSmall ? 12 : 20}
                                    />
                                }
                            />
                        </div>
                    )}

                    <ToolTip text="Mirror" position="right" delay={100}>
                        <div onClick={(e) => handleMirrorOptions(e)}>
                            <ToolButton
                                condition={mirrorOptions}
                                icon={
                                    <MirrorIcon
                                        color="#000000"
                                        size={isSmall ? 12 : 20}
                                    />
                                }
                            />
                        </div>
                    </ToolTip>
                </div>
            )}

            {penActive && openColorOptions && (
                <div className="absolute top-[72px] left-[72px] z-5 p-[4px] rounded-[8px] bg-[#FFFFFF] border-[1px] border-[#4B5563]/25 drop-shadow-xl">
                    <ColorPicker
                        value={strokeColor}
                        onChange={setStrokeColor}
                        isSmall={isSmall}
                    />
                    <div className="text-[#000000] funnel-sans-regular mx-[8px] my-[12px]  text-[8px] md:text-[12px]">
                        Material
                    </div>
                    <div className="flex justify-around items-center mt-[12px]">
                        <ToolTip text="Flat" position="bottom" delay={100}>
                            <button
                                onClick={(e) => setActiveMaterialType('flat')}
                                className="cursor-pointer"
                            >
                                <FlatShadeIcon
                                    color="#000000"
                                    size={isSmall ? 20 : 32}
                                />
                            </button>
                        </ToolTip>
                        <ToolTip text="Shaded" position="bottom" delay={100}>
                            <button
                                onClick={(e) => setActiveMaterialType('shaded')}
                                className="cursor-pointer"
                            >
                                <RespondShadeIcon
                                    color="#000000"
                                    size={isSmall ? 20 : 32}
                                />
                            </button>
                        </ToolTip>
                        <ToolTip text="Emissive" position="bottom" delay={100}>
                            <button
                                onClick={(e) => setActiveMaterialType('glow')}
                                className="cursor-pointer"
                            >
                                <GlowShadeIcon
                                    color="#000000"
                                    size={isSmall ? 20 : 32}
                                />
                            </button>
                        </ToolTip>
                    </div>
                </div>
            )}

            {penActive && openStrokeOptions && (
                <div className="absolute flex flex-col justify-items-center gap-[4px] top-[72px] left-[72px] z-5 p-[4px] rounded-[8px] bg-[#FFFFFF] border-[1px] border-[#4B5563]/25 drop-shadow-xl">
                    <div onClick={(e) => handleStroke('taper', setStrokeType)}>
                        <ToolButton
                            condition={strokeType === 'taper'}
                            icon={
                                <TaperStrokeIcon
                                    color={strokeColor}
                                    size={isSmall ? 12 : 20}
                                />
                            }
                        />
                    </div>

                    <div onClick={(e) => handleStroke('cube', setStrokeType)}>
                        <ToolButton
                            condition={strokeType === 'cube'}
                            icon={
                                <CubeStrokeIcon
                                    color={strokeColor}
                                    size={isSmall ? 12 : 20}
                                />
                            }
                        />
                    </div>

                    <div onClick={(e) => handleStroke('paint', setStrokeType)}>
                        <ToolButton
                            condition={strokeType === 'paint'}
                            icon={
                                <PaintStrokeIcon
                                    color={strokeColor}
                                    size={isSmall ? 12 : 20}
                                />
                            }
                        />
                    </div>

                    <div onClick={(e) => handleStroke('belt', setStrokeType)}>
                        <ToolButton
                            condition={strokeType === 'belt'}
                            icon={
                                <BeltStrokeIcon
                                    color={strokeColor}
                                    size={isSmall ? 12 : 20}
                                />
                            }
                        />
                    </div>
                </div>
            )}

            {penActive && openDrawShapeOptions && (
                <div className="absolute flex flex-col justify-items-center gap-[4px] top-[72px] left-[72px] z-5 p-[4px] rounded-[8px] bg-[#FFFFFF] border-[1px] border-[#4B5563]/25 drop-shadow-xl">
                    <div
                        onClick={(e) =>
                            handleShape('free_hand', setDrawShapeType)
                        }
                    >
                        <ToolButton
                            condition={drawShapeType === 'free_hand'}
                            icon={
                                <FreeHandIcon
                                    color="#000000"
                                    size={isSmall ? 12 : 20}
                                />
                            }
                        />
                    </div>

                    <div
                        onClick={(e) =>
                            handleShape('straight', setDrawShapeType)
                        }
                    >
                        <ToolButton
                            condition={drawShapeType === 'straight'}
                            icon={
                                <FreeHandIcon
                                    color="#000000"
                                    size={isSmall ? 12 : 20}
                                />
                            }
                        />
                    </div>

                    <div
                        onClick={(e) => handleShape('circle', setDrawShapeType)}
                    >
                        <ToolButton
                            condition={drawShapeType === 'circle'}
                            icon={
                                <CircleIcon
                                    color="#000000"
                                    size={isSmall ? 12 : 20}
                                />
                            }
                        />
                    </div>

                    <div onClick={(e) => handleShape('arc', setDrawShapeType)}>
                        <ToolButton
                            condition={drawShapeType === 'arc'}
                            icon={
                                <ArcIcon
                                    color="#000000"
                                    size={isSmall ? 12 : 20}
                                />
                            }
                        />
                    </div>
                </div>
            )}

            {penActive && openOpacitySlider && (
                <div className="absolute w-[140px] md:w-[198px] top-[72px] left-[72px] z-5 p-[4px] justify-center rounded-[8px] text-[#000000] bg-[#FFFFFF] border-[1px] border-[#4B5563]/25 drop-shadow-xl">
                    <RangeSlider
                        name="Stroke Opacity"
                        max={1}
                        min={0.0}
                        step={0.1}
                        value={strokeOpacity}
                        backgroundSize={opacityBackground}
                        setUpdatingValue={setStrokeOpacity}
                        setUpdatingBackground={setOpacityBackground}
                    />
                </div>
            )}

            {penActive && openWidthSlider && (
                <div className="absolute w-[140px] md:w-[198px] top-[72px] left-[72px] z-5 p-[4px] justify-center rounded-[8px] text-[#000000] bg-[#FFFFFF] border-[1px] border-[#4B5563]/25 drop-shadow-xl">
                    <RangeSlider
                        name="Stroke Width"
                        max={5}
                        min={0}
                        step={0.05}
                        value={strokeWidth}
                        backgroundSize={widthBackground}
                        setUpdatingValue={setStrokeWidth}
                        setUpdatingBackground={setWidthBackground}
                    />
                </div>
            )}

            {penActive && openStrokeStabler && (
                <div className="absolute w-[140px] md:w-[198px] top-[72px] left-[72px] z-5 p-[4px] justify-center rounded-[8px] text-[#000000] bg-[#FFFFFF] border-[1px] border-[#4B5563]/25 drop-shadow-xl">
                    <RangeSlider
                        name="Stroke Stable Percentage"
                        max={100}
                        min={0}
                        step={1}
                        value={strokeStablePercentage}
                        backgroundSize={stableBackground}
                        setUpdatingValue={setStrokeStablePercentage}
                        setUpdatingBackground={setStableBackground}
                    />
                </div>
            )}

            {penActive && mirrorOptions && (
                <div className="absolute flex flex-col justify-items-center gap-[4px] top-[72px] left-[72px] z-5 p-[4px] rounded-[8px] bg-[#FFFFFF] border-[1px] border-[#4B5563]/25 drop-shadow-xl">
                    <button
                        onClick={(e) => handleMirroring('X', mirror, setMirror)}
                        className={`${
                            mirror.x
                                ? 'bg-[#DE3163]/50'
                                : 'hover:bg-[#5CA367]/25'
                        }   font-bold p-[8px] cursor-pointer rounded-[4px] border-[0px]`}
                    >
                        <MirrorIcon color="#DE3163" size={isSmall ? 12 : 20} />
                    </button>
                    <button
                        onClick={(e) => handleMirroring('Y', mirror, setMirror)}
                        className={`${
                            mirror.y
                                ? 'bg-[#50C878]/50'
                                : 'hover:bg-[#5CA367]/25'
                        }   font-bold p-[8px] cursor-pointer rounded-[4px] border-[0px]`}
                    >
                        <MirrorIcon color="#50C878" size={isSmall ? 12 : 20} />
                    </button>
                    <button
                        onClick={(e) => handleMirroring('Z', mirror, setMirror)}
                        className={`${
                            mirror.z
                                ? 'bg-[#0096FF]/50'
                                : 'hover:bg-[#5CA367]/25'
                        }   font-bold p-[8px] cursor-pointer rounded-[4px] border-[0px]`}
                    >
                        <MirrorIcon color="#0096FF" size={isSmall ? 12 : 20} />
                    </button>
                </div>
            )}
        </div>
    )
}

export default PenOptionsPanel
