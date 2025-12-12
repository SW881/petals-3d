import PenIcon from '../../../svg-icons/PenIcon'
import SunIcon from '../../../svg-icons/SunIcon'
import AddIcon from '../../../svg-icons/AddIcon'
import ArcIcon from '../../../svg-icons/ArcIcon'
import CopyIcon from '../../../svg-icons/CopyIcon'
import LinkIcon from '../../../svg-icons/LinkIcon'
import WidthIcon from '../../../svg-icons/WidthIcon'
import ScaleIcon from '../../../svg-icons/ScaleIcon'
import GuideIcon from '../../../svg-icons/GuideIcon'
import SelectIcon from '../../../svg-icons/SelectIcon'
import EraserIcon from '../../../svg-icons/EraserIcon'
import RotateIcon from '../../../svg-icons/RotateIcon'
import DeleteIcon from '../../../svg-icons/DeleteIcon'
import RenderIcon from '../../../svg-icons/RenderIcon'
import RenameIcon from '../../../svg-icons/RenameIcon'
import CircleIcon from '../../../svg-icons/CircleIcon'
import MirrorIcon from '../../../svg-icons/MirrorIcon'
import EyeOpenIcon from '../../../svg-icons/EyeOpenIcon'
import OpacityIcon from '../../../svg-icons/OpacityIcon'
import CorrectIcon from '../../../svg-icons/CorrectIcon'
import SelectGuide from '../../../svg-icons/SelectGuide'
import GroupingIcon from '../../../svg-icons/GroupingIcon'
import EyeCloseIcon from '../../../svg-icons/EyeCloseIcon'
import FreeHandIcon from '../../../svg-icons/FreeHandIcon'
import LocalModeIcon from '../../../svg-icons/LocalModeIcon'
import FlatShadeIcon from '../../../svg-icons/FlatShadeIcon'
import GlowShadeIcon from '../../../svg-icons/GlowShadeIcon'
import TranslateIcon from '../../../svg-icons/TranslateIcon'
import LoftGuideIcon from '../../../svg-icons/LoftGuideIcon'
import CubeStrokeIcon from '../../../svg-icons/CubeStrokeIcon'
import GlobalModeIcon from '../../../svg-icons/GlobalModeIcon'
import BeltStrokeIcon from '../../../svg-icons/BeltStrokeIcon'
import EraseGuideIcon from '../../../svg-icons/EraseGuideIcon'
import SceneOptionIcon from '../../../svg-icons/SceneOptionIcon'
import TaperStrokeIcon from '../../../svg-icons/TaperStrokeIcon'
import ColorSelectIcon from '../../../svg-icons/ColorSelectIcon'
import PaintStrokeIcon from '../../../svg-icons/PaintStrokeIcon'
import StableStrokIcon from '../../../svg-icons/StableStrokIcon'
import WrongButtonIcon from '../../../svg-icons/WrongButtonIcon'
import RespondShadeIcon from '../../../svg-icons/RespondShadeIcon'
import StraightLineIcon from '../../../svg-icons/StraightLineIcon'
import BendGuidePlaneIcon from '../../../svg-icons/BendGuidePlaneIcon'
import PressureActiveIcon from '../../../svg-icons/PressureActiveIcon'
import PressureInActiveIcon from '../../../svg-icons/PressureInActiveIcon'

import { dashboardStore } from '../../../../hooks/useDashboardStore'
import { canvasDrawStore } from '../../../../hooks/useCanvasDrawStore'
import { canvasViewStore } from '../../../../hooks/useCanvasViewStore'
import { canvasRenderStore } from '../../../../hooks/useRenderSceneStore'

import RangeSlider from './RangeSlider'
import ToolTip from '../../../info/ToolTip'
import ColorPicker from '../../ColorPicker'

import { saveGroupToIndexDB } from '../../../../db/storage'

const ToolPanel = ({ isSmall }) => {
    const {
        copy,
        setCopy,

        mirror,
        mirrorOptions,
        setMirrorOptions,

        strokeOpacity,
        setStrokeOpacity,

        axisMode,
        penActive,

        drawGuide,
        setDrawGuide,

        strokeType,
        setStrokeType,

        strokeColor,
        setStrokeColor,

        lineColor,
        setLineColor,

        strokeWidth,
        setStrokeWidth,

        setAxisMode,

        selectLines,
        setSelectLines,

        eraserActive,
        setEraserActive,

        pressureMode,
        setPressureMode,

        dynamicDrawingPlaneMesh,
        setDynamicDrawingPlaneMesh,

        transformMode,
        setTransformMode,

        opacityBackground,
        setOpacityBackground,

        mergeGeometries,
        setMergeGeometries,

        selectGuide,
        setSelectGuide,

        drawShapeType,
        setDrawShapeType,

        setPenActive,

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

        bendPlaneGuide,
        setBendPlaneGuide,

        loftGuidePlane,
        setLoftGuidePlane,

        setEraseGuide,

        openStrokeStabler,
        setOpenStrokeStabler,

        stableBackground,
        setStableBackground,

        strokeStablePercentage,
        setStrokeStablePercentage,

        waistBackground,
        setWaistBackground,

        radialBackground,
        setRadialBackground,

        ployBackground,
        setPolyBackground,

        radialPercentage,
        setRadialPercentage,

        waistPercentage,
        setWaistPercentage,

        polyCountPercentage,
        setPolyCountPercentage,

        setGenerateLoftSurface,

        highlighted,
        setHighlighted,
    } = canvasDrawStore((state) => state)

    const { setOrbitalLock } = canvasViewStore((state) => state)

    const {
        newGroupModal,
        setNewGroupModal,

        copyGroupModal,
        setCopyGroupModal,

        renameGroupModal,
        setRenameGroupModal,

        deleteGroupModal,
        setDeleteGroupModal,
    } = dashboardStore((state) => state)

    const {
        sceneOptions,
        setSceneOptions,

        groupOptions,
        setGroupOptions,

        groupData,

        selectedGroups,
        addToSelectedGroup,
        removeFromSelectedGroup,

        renderOptions,
        setRenderOptions,

        postProcess,
        setPostProcess,

        sequentialLoading,
        setSequentialLoading,

        canvasBackgroundColor,
        setCanvasBackgroundColor,

        intensityBackground,
        setIntensityBackground,

        lightIntensity,
        setLightIntensity,
    } = canvasRenderStore((state) => state)

    function handleDraw(button) {
        switch (button) {
            case 'pen':
                setPenActive(!penActive)
                setOpenDrawShapeOptions(false)
                setEraserActive(false)
                setSelectLines(false)
                setSelectGuide(false)
                setDrawGuide(false)
                setBendPlaneGuide(false)
                setOpenColorOptions(false)
                setOpenStrokeOptions(false)
                setGenerateLoftSurface(false)
                setLoftGuidePlane(false)

                if (canvasDrawStore.getState().penActive) {
                    setOrbitalLock(true)
                } else {
                    setOrbitalLock(false)
                }
                break

            case 'eraser':
                setEraserActive(!eraserActive)
                setPenActive(false)
                setSelectLines(false)
                setSelectGuide(false)
                setDrawGuide(false)
                setBendPlaneGuide(false)
                setOpenColorOptions(false)
                setOpenStrokeOptions(false)
                setGenerateLoftSurface(false)
                setLoftGuidePlane(false)

                if (canvasDrawStore.getState().eraserActive) {
                    setOrbitalLock(true)
                } else {
                    setOrbitalLock(false)
                }
                break

            case 'selectLines':
                setSelectLines(!selectLines)
                setEraserActive(false)
                setSelectGuide(false)
                setPenActive(false)
                setDrawGuide(false)
                setBendPlaneGuide(false)
                setOpenColorOptions(false)
                setOpenStrokeOptions(false)
                setGenerateLoftSurface(false)
                setLoftGuidePlane(false)

                if (canvasDrawStore.getState().selectLines) {
                    setOrbitalLock(true)
                } else {
                    setOrbitalLock(false)
                }
                break

            case 'selectGuide':
                setSelectGuide(!selectGuide)
                setSelectLines(false)
                setEraserActive(false)
                setPenActive(false)
                setDrawGuide(false)
                setBendPlaneGuide(false)
                setOpenColorOptions(false)
                setOpenStrokeOptions(false)
                setGenerateLoftSurface(false)
                setLoftGuidePlane(false)

                if (canvasDrawStore.getState().selectGuide) {
                    setOrbitalLock(true)
                } else {
                    setOrbitalLock(false)
                }
                break

            case 'draw_guide':
                setDrawGuide(!drawGuide)
                setOpenDrawShapeOptions(false)
                setPenActive(false)
                setEraserActive(false)
                setSelectLines(false)
                setSelectGuide(false)
                setOpenColorOptions(false)
                setOpenStrokeOptions(false)
                setOrbitalLock(false)
                setGenerateLoftSurface(false)
                setLoftGuidePlane(false)

                if (canvasDrawStore.getState().drawGuide) {
                    setOrbitalLock(true)
                } else {
                    setOrbitalLock(false)
                }
                break

            case 'erase_guide':
                setEraseGuide(true)
                setDynamicDrawingPlaneMesh(null)
                setDrawGuide(false)
                setBendPlaneGuide(false)
                setPenActive(false)
                setEraserActive(false)
                setSelectLines(false)
                setSelectGuide(false)
                setOpenColorOptions(false)
                setOpenStrokeOptions(false)
                setOrbitalLock(false)
                setGenerateLoftSurface(false)
                setLoftGuidePlane(false)

                break

            case 'bend_guide':
                setBendPlaneGuide(!bendPlaneGuide)
                setLoftGuidePlane(false)
                setDrawGuide(false)
                setOpenDrawShapeOptions(false)
                setPenActive(false)
                setEraserActive(false)
                setSelectLines(false)
                setSelectGuide(false)
                setOpenColorOptions(false)
                setOpenStrokeOptions(false)
                setOrbitalLock(false)
                setGenerateLoftSurface(false)
                setLoftGuidePlane(false)

                if (canvasDrawStore.getState().bendPlaneGuide) {
                    setOrbitalLock(true)
                } else {
                    setOrbitalLock(false)
                }
                break

            case 'loft_guide':
                setLoftGuidePlane(!loftGuidePlane)
                setDynamicDrawingPlaneMesh(null)
                setDrawGuide(false)
                setBendPlaneGuide(false)
                setPenActive(false)
                setEraserActive(false)
                setSelectLines(false)
                setSelectGuide(false)
                setOpenColorOptions(false)
                setOpenStrokeOptions(false)
                setOrbitalLock(false)
                setGenerateLoftSurface(false)

                if (canvasDrawStore.getState().loftGuidePlane) {
                    setOrbitalLock(true)
                } else {
                    setOrbitalLock(false)
                }
                break

            case 'cancel_loft_guide':
                setLoftGuidePlane(!loftGuidePlane)
                setDynamicDrawingPlaneMesh(null)
                setDrawGuide(false)
                setBendPlaneGuide(false)
                setPenActive(false)
                setEraserActive(false)
                setSelectLines(false)
                setSelectGuide(false)
                setOpenColorOptions(false)
                setOpenStrokeOptions(false)
                setOrbitalLock(false)
                setGenerateLoftSurface(false)
                setHighlighted([])
                break

            case 'generate_loft_guide':
                setGenerateLoftSurface(true)
                setDynamicDrawingPlaneMesh(null)
                setDrawGuide(false)
                setBendPlaneGuide(false)
                setPenActive(false)
                setEraserActive(false)
                setSelectLines(false)
                setSelectGuide(false)
                setOpenColorOptions(false)
                setOpenStrokeOptions(false)
                setOrbitalLock(false)

                // Save to db
                break

            default:
                break
        }
    }

    function handleSceneOptions() {
        setSceneOptions(!sceneOptions)
        setGroupOptions(true)
        setRenderOptions(false)
    }

    function handleStroke(stroke) {
        switch (stroke) {
            case 'taper':
                setStrokeType('taper')
                break
            case 'cube':
                setStrokeType('cube')
                break
            case 'tube':
                setStrokeType('tube')
                break
            case 'paint':
                setStrokeType('paint')
                break
            case 'belt':
                setStrokeType('belt')
                break
            default:
                setStrokeType('cube')
                break
        }
    }

    function handleShape(shape) {
        switch (shape) {
            case 'free_hand':
                setDrawShapeType('free_hand')
                break
            case 'straight':
                setDrawShapeType('straight')
                break
            case 'circle':
                setDrawShapeType('circle')
                break
            case 'arc':
                setDrawShapeType('arc')
                break
            default:
                break
        }
    }

    function handleMirroring(axis) {
        switch (axis) {
            case 'X':
                canvasDrawStore.getState().setMirror({ x: !mirror.x })
                break
            case 'Y':
                canvasDrawStore.getState().setMirror({ y: !mirror.y })
                break
            case 'Z':
                canvasDrawStore.getState().setMirror({ z: !mirror.z })
                break
            default:
                canvasDrawStore
                    .getState()
                    .setMirror({ x: false, y: false, z: false })
                break
        }
    }

    function handleStrokeOptions(e) {
        setOpenColorOptions(false)
        setOpenOpacitySlider(false)
        setOpenWidthSlider(false)
        setMirrorOptions(false)
        setOpenStrokeStabler(false)
        setOpenStrokeOptions(!openStrokeOptions)
        setOpenDrawShapeOptions(false)
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

    function handleLightIntensitySlider(e) {
        e.preventDefault()
        setLightIntensity(e.target.value)
        const min = e.target.min
        const max = e.target.max
        const currentVal = e.target.value
        setIntensityBackground(
            ((currentVal - min) / (max - min)) * 100 + '% 100%'
        )
    }

    function handleSceneActiveOptions(option) {
        switch (option) {
            case 'groups':
                setRenderOptions(false)
                setGroupOptions(true)
                break
            case 'render':
                setGroupOptions(false)
                setRenderOptions(true)
                break

            default:
                break
        }
    }

    async function handleSelectGroup(e, data) {
        if (e.target.checked) {
            addToSelectedGroup(data)
        } else {
            removeFromSelectedGroup(data.uuid)
        }
    }

    function handleGroupOperation(operation) {
        switch (operation) {
            case 'add':
                setNewGroupModal(true)
                break
            case 'rename':
                setRenameGroupModal(true)
                break
            case 'copy':
                setCopyGroupModal(true)
                break
            case 'delete':
                setDeleteGroupModal(true)
                break
            default:
                break
        }
    }

    async function handleGroupVisibility(data) {
        canvasRenderStore
            .getState()
            .updateVisibleGroupProduct(data.uuid, !data.visible)
        const updatedGroupData = canvasRenderStore.getState().groupData
        await saveGroupToIndexDB(updatedGroupData)
    }

    async function handleActiveGroup(data) {
        canvasRenderStore.getState().setActiveGroup(data)
        canvasRenderStore.getState().updateActiveGroupProduct(data.uuid)
        const updatedGroupData = canvasRenderStore.getState().groupData
        await saveGroupToIndexDB(updatedGroupData)
    }

    return (
        <>
            <div className="absolute top-[12px] right-[12px] z-5 flex items-center gap-[4px] p-[4px] rounded-[8px] border-[1px] border-[#4B5563]/25 drop-shadow-xl bg-[#FFFFFF]">
                {!dynamicDrawingPlaneMesh && (
                    <ToolTip text="Draw Guide" position="bottom" delay={100}>
                        <button
                            onClick={(e) => handleDraw('draw_guide')}
                            className={`flex justify-center font-bold p-[8px] cursor-pointer rounded-[4px] border-[0px] ${
                                drawGuide
                                    ? 'bg-[#5CA367]'
                                    : 'hover:bg-[#5CA367]/25'
                            }`}
                        >
                            <GuideIcon
                                color="#000000"
                                size={isSmall ? 12 : 20}
                            />
                        </button>
                    </ToolTip>
                )}

                {dynamicDrawingPlaneMesh && (
                    <ToolTip text="Erase Guide" position="bottom" delay={100}>
                        <button
                            onClick={(e) => handleDraw('erase_guide')}
                            className={`hover:bg-[#5CA367]/25 flex justify-center font-bold p-[8px] cursor-pointer rounded-[4px] border-[0px]`}
                        >
                            <EraseGuideIcon
                                color="#000000"
                                size={isSmall ? 12 : 20}
                            />
                        </button>
                    </ToolTip>
                )}

                {dynamicDrawingPlaneMesh && (
                    <ToolTip text="Bend Guide" position="bottom" delay={100}>
                        <button
                            onClick={(e) => handleDraw('bend_guide')}
                            className={`flex justify-center font-bold p-[8px] cursor-pointer rounded-[4px] border-[0px] ${
                                bendPlaneGuide
                                    ? 'bg-[#5CA367]'
                                    : 'hover:bg-[#5CA367]/25'
                            }`}
                        >
                            <BendGuidePlaneIcon
                                color="#000000"
                                size={isSmall ? 12 : 20}
                            />
                        </button>
                    </ToolTip>
                )}

                <ToolTip text="Loft Guide" position="bottom" delay={100}>
                    <button
                        onClick={(e) => handleDraw('loft_guide')}
                        className={`text-[#000000] flex justify-center font-bold p-[8px] cursor-pointer rounded-[4px] border-[0px] ${
                            loftGuidePlane
                                ? 'bg-[#5CA367]'
                                : 'hover:bg-[#5CA367]/25'
                        }`}
                    >
                        <LoftGuideIcon
                            color="#000000"
                            size={isSmall ? 12 : 20}
                        />
                    </button>
                </ToolTip>

                {dynamicDrawingPlaneMesh && (
                    <ToolTip text="Select Guide" position="bottom" delay={100}>
                        <button
                            onClick={(e) => handleDraw('selectGuide')}
                            className={`flex justify-center font-bold p-[8px] cursor-pointer rounded-[4px] border-[0px] ${
                                selectGuide
                                    ? 'bg-[#5CA367]'
                                    : 'hover:bg-[#5CA367]/25'
                            }`}
                        >
                            <SelectGuide
                                color="#000000"
                                size={isSmall ? 12 : 20}
                            />
                        </button>
                    </ToolTip>
                )}

                <div className="px-[8px] text-[#000000]">|</div>

                <ToolTip text="Pen" position="bottom" delay={100}>
                    <button
                        onClick={(e) => handleDraw('pen')}
                        className={`flex justify-center font-bold p-[8px] cursor-pointer rounded-[4px] border-[0px] ${
                            penActive ? 'bg-[#5CA367]' : 'hover:bg-[#5CA367]/25'
                        }`}
                    >
                        <PenIcon color="#000000" size={isSmall ? 12 : 20} />
                    </button>
                </ToolTip>

                <ToolTip text="Eraser" position="bottom" delay={100}>
                    <button
                        onClick={(e) => handleDraw('eraser')}
                        className={`flex justify-center font-bold p-[8px] cursor-pointer rounded-[4px] border-[0px] ${
                            eraserActive
                                ? 'bg-[#5CA367]'
                                : 'hover:bg-[#5CA367]/25'
                        }`}
                    >
                        <EraserIcon color="#000000" size={isSmall ? 12 : 20} />
                    </button>
                </ToolTip>

                <ToolTip text="Select Lines" position="bottom" delay={100}>
                    <button
                        onClick={(e) => handleDraw('selectLines')}
                        className={`flex justify-center font-bold p-[8px] cursor-pointer rounded-[4px] border-[0px] ${
                            selectLines
                                ? 'bg-[#5CA367]'
                                : 'hover:bg-[#5CA367]/25'
                        }`}
                    >
                        <SelectIcon color="#000000" size={isSmall ? 12 : 20} />
                    </button>
                </ToolTip>

                <div className="px-[8px] text-[#000000]">|</div>

                <ToolTip text="Scene Options" position="bottom" delay={100}>
                    <button
                        onClick={(e) => handleSceneOptions()}
                        className={`flex justify-center font-bold p-[8px] cursor-pointer rounded-[4px] border-[0px] ${
                            sceneOptions
                                ? 'bg-[#5CA367]'
                                : 'hover:bg-[#5CA367]/25'
                        }`}
                    >
                        <RenderIcon color="#000000" size={isSmall ? 12 : 20} />
                    </button>
                </ToolTip>
            </div>

            <div className="absolute funnel-sans-regular text-[#000000] flex flex-col gap-[8px] top-[72px] left-[12px]">
                {loftGuidePlane && (
                    <div className="w-[140px] md:w-[198px] z-5 p-[4px] justify-center rounded-[8px] bg-[#FFFFFF] border-[1px] border-[#4B5563]/25 drop-shadow-xl">
                        <RangeSlider
                            name="Radial Percentage"
                            max={100}
                            min={0}
                            step={1}
                            value={radialPercentage}
                            backgroundSize={radialBackground}
                            setUpdatingValue={setRadialPercentage}
                            setUpdatingBackground={setRadialBackground}
                        />
                    </div>
                )}

                {loftGuidePlane && (
                    <div className="w-[140px] md:w-[198px] z-5 p-[4px] justify-center rounded-[8px] bg-[#FFFFFF] border-[1px] border-[#4B5563]/25 drop-shadow-xl">
                        <RangeSlider
                            name="Waist Percentage"
                            max={100}
                            min={0}
                            step={1}
                            value={waistPercentage}
                            backgroundSize={waistBackground}
                            setUpdatingValue={setWaistPercentage}
                            setUpdatingBackground={setWaistBackground}
                        />
                    </div>
                )}

                {loftGuidePlane && (
                    <div className="w-[140px] md:w-[198px] z-5 p-[4px] justify-center rounded-[8px] bg-[#FFFFFF] border-[1px] border-[#4B5563]/25 drop-shadow-xl">
                        <RangeSlider
                            name="Poly count Percentage"
                            max={50}
                            min={0}
                            step={1}
                            value={polyCountPercentage}
                            backgroundSize={ployBackground}
                            setUpdatingValue={setPolyCountPercentage}
                            setUpdatingBackground={setPolyBackground}
                        />
                    </div>
                )}
            </div>

            {loftGuidePlane && (
                <div className="funnel-sans-regular absolute bottom-[4px] left-1/2 -translate-x-1/2 -translate-y-1/2 z-5 rounded-[8px] text-[#000000] bg-[#FFFFFF] border-[1px] border-[#4B5563]/25 drop-shadow-xl">
                    <div className="flex justify-center items-center gap-[8px] p-[4px]">
                        <button
                            onClick={(e) => handleDraw('cancel_loft_guide')}
                            className={`hover:bg-[#DE3163]/50 flex justify-center font-bold p-[8px] cursor-pointer rounded-[4px] border-[0px]`}
                        >
                            <WrongButtonIcon
                                color="#DE3163"
                                size={isSmall ? 12 : 20}
                            />
                        </button>

                        <button
                            disabled={highlighted.length < 2}
                            onClick={(e) => handleDraw('generate_loft_guide')}
                            className={`hover:bg-[#5CA367]/25 flex justify-center font-bold p-[8px] cursor-pointer rounded-[4px] border-[0px]`}
                        >
                            <CorrectIcon
                                color="#5CA367"
                                size={isSmall ? 12 : 20}
                            />
                        </button>
                    </div>
                </div>
            )}

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
                        <button
                            onClick={(e) => handleOpacityOptions(e)}
                            className={`flex justify-center font-bold p-[8px] cursor-pointer rounded-[4px] border-[0px] ${
                                openOpacitySlider
                                    ? 'bg-[#5CA367]'
                                    : 'hover:bg-[#5CA367]/25'
                            }`}
                        >
                            <OpacityIcon
                                color="#000000"
                                size={isSmall ? 12 : 20}
                                opacity={strokeOpacity}
                            />
                        </button>
                    </ToolTip>
                    <ToolTip text="Width" position="right" delay={100}>
                        <button
                            onClick={(e) => handleWidthOptions(e)}
                            className={`flex justify-center font-bold p-[8px] cursor-pointer rounded-[4px] border-[0px] ${
                                openWidthSlider
                                    ? 'bg-[#5CA367]'
                                    : 'hover:bg-[#5CA367]/25'
                            }`}
                        >
                            <WidthIcon
                                color="#000000"
                                size={isSmall ? 12 : 20}
                            />
                        </button>
                    </ToolTip>
                    <ToolTip text="Stable Stroke" position="right" delay={100}>
                        <button
                            onClick={(e) => handleStableStrokeOptions(e)}
                            className={`flex justify-center font-bold p-[8px] cursor-pointer rounded-[4px] border-[0px] ${
                                openStrokeStabler
                                    ? 'bg-[#5CA367]'
                                    : 'hover:bg-[#5CA367]/25'
                            }`}
                        >
                            <StableStrokIcon
                                color="#000000"
                                size={isSmall ? 12 : 20}
                            />
                        </button>
                    </ToolTip>

                    {pressureMode && (
                        <ToolTip
                            text="Pressure Active"
                            position="right"
                            delay={100}
                        >
                            <button
                                onClick={(e) => setPressureMode(false)}
                                className={`hover:bg-[#5CA367]/25 flex justify-center font-bold p-[8px] cursor-pointer rounded-[4px] border-[0px]`}
                            >
                                <PressureActiveIcon
                                    color="#000000"
                                    size={isSmall ? 12 : 20}
                                />
                            </button>
                        </ToolTip>
                    )}

                    {!pressureMode && (
                        <ToolTip
                            text="Pressure Inactive"
                            position="right"
                            delay={100}
                        >
                            <button
                                onClick={(e) => setPressureMode(true)}
                                className={`hover:bg-[#5CA367]/25 flex justify-center font-bold p-[8px] cursor-pointer rounded-[4px] border-[0px]`}
                            >
                                <PressureInActiveIcon
                                    color="#000000"
                                    size={isSmall ? 12 : 20}
                                />
                            </button>
                        </ToolTip>
                    )}

                    <ToolTip text="Mirror" position="right" delay={100}>
                        <button
                            onClick={(e) => handleMirrorOptions(e)}
                            className={`flex justify-center font-bold p-[8px] cursor-pointer rounded-[4px] border-[0px] ${
                                mirrorOptions
                                    ? 'bg-[#5CA367]'
                                    : 'hover:bg-[#5CA367]/25'
                            }`}
                        >
                            <MirrorIcon
                                color="#000000"
                                size={isSmall ? 12 : 20}
                            />
                        </button>
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
                                    color={
                                        activeMaterialType === 'flat'
                                            ? '#000000'
                                            : '#B7B7B7'
                                    }
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
                                    color={
                                        activeMaterialType === 'shaded'
                                            ? '#000000'
                                            : '#B7B7B7'
                                    }
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
                                    color={
                                        activeMaterialType === 'glow'
                                            ? '#000000'
                                            : '#B7B7B7'
                                    }
                                    size={isSmall ? 20 : 32}
                                />
                            </button>
                        </ToolTip>
                    </div>
                </div>
            )}

            {penActive && openStrokeOptions && (
                <div className="absolute flex flex-col justify-items-center gap-[4px] top-[72px] left-[72px] z-5 p-[4px] rounded-[8px] bg-[#FFFFFF] border-[1px] border-[#4B5563]/25 drop-shadow-xl">
                    {/* <p className="text-left text-[8px] md:text-[12px] block funnel-sans-regular text-[#ffffff] mb-[8px]">
                        Stroke
                    </p> */}
                    <button
                        onClick={(e) => handleStroke('taper')}
                        className={`font-bold p-[8px] cursor-pointer rounded-[4px] border-[0px] ${
                            strokeType === 'taper'
                                ? 'bg-[#5CA367]'
                                : 'hover:bg-[#5CA367]/25'
                        }`}
                    >
                        <TaperStrokeIcon
                            color={strokeColor}
                            size={isSmall ? 12 : 20}
                        />
                    </button>
                    <button
                        onClick={(e) => handleStroke('cube')}
                        className={`font-bold p-[8px] cursor-pointer rounded-[4px] border-[0px] ${
                            strokeType === 'cube'
                                ? 'bg-[#5CA367]'
                                : 'hover:bg-[#5CA367]/25'
                        }`}
                    >
                        <CubeStrokeIcon
                            color={strokeColor}
                            size={isSmall ? 12 : 20}
                        />
                    </button>
                    <button
                        onClick={(e) => handleStroke('paint')}
                        className={`font-bold p-[8px] cursor-pointer rounded-[4px] border-[0px] ${
                            strokeType === 'paint'
                                ? 'bg-[#5CA367]'
                                : 'hover:bg-[#5CA367]/25'
                        }`}
                    >
                        <PaintStrokeIcon
                            color={strokeColor}
                            size={isSmall ? 12 : 20}
                        />
                    </button>
                    <button
                        onClick={(e) => handleStroke('belt')}
                        className={`font-bold p-[8px] cursor-pointer rounded-[4px] border-[0px] ${
                            strokeType === 'belt'
                                ? 'bg-[#5CA367]'
                                : 'hover:bg-[#5CA367]/25'
                        }`}
                    >
                        <BeltStrokeIcon
                            color={strokeColor}
                            size={isSmall ? 12 : 20}
                        />
                    </button>
                </div>
            )}

            {penActive && openDrawShapeOptions && (
                <div className="absolute flex flex-col justify-items-center gap-[4px] top-[72px] left-[72px] z-5 p-[4px] rounded-[8px] bg-[#FFFFFF] border-[1px] border-[#4B5563]/25 drop-shadow-xl">
                    <button
                        onClick={(e) => handleShape('free_hand')}
                        className={`font-bold p-[8px] cursor-pointer rounded-[4px] border-[0px] ${
                            drawShapeType === 'free_hand'
                                ? 'bg-[#5CA367]'
                                : 'hover:bg-[#5CA367]/25'
                        }`}
                    >
                        <FreeHandIcon
                            color="#000000"
                            size={isSmall ? 12 : 20}
                        />
                    </button>
                    <button
                        onClick={(e) => handleShape('straight')}
                        className={`font-bold p-[8px] cursor-pointer rounded-[4px] border-[0px] ${
                            drawShapeType === 'straight'
                                ? 'bg-[#5CA367]'
                                : 'hover:bg-[#5CA367]/25'
                        }`}
                    >
                        <StraightLineIcon
                            color="#000000"
                            size={isSmall ? 12 : 20}
                        />
                    </button>
                    <button
                        onClick={(e) => handleShape('circle')}
                        className={`font-bold p-[8px] cursor-pointer rounded-[4px] border-[0px] ${
                            drawShapeType === 'circle'
                                ? 'bg-[#5CA367]'
                                : 'hover:bg-[#5CA367]/25'
                        }`}
                    >
                        <CircleIcon color="#000000" size={isSmall ? 12 : 20} />
                    </button>
                    <button
                        onClick={(e) => handleShape('arc')}
                        className={`font-bold p-[8px] cursor-pointer rounded-[4px] border-[0px] ${
                            drawShapeType === 'arc'
                                ? 'bg-[#5CA367]'
                                : 'hover:bg-[#5CA367]/25'
                        }`}
                    >
                        <ArcIcon color="#000000" size={isSmall ? 12 : 20} />
                    </button>
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
                        onClick={(e) => handleMirroring('X')}
                        className={`${
                            mirror.x ? 'bg-[#DE3163]/50' : ' hover:bg-[#5CA367]'
                        }   font-bold p-[8px] cursor-pointer rounded-[4px] border-[0px]`}
                    >
                        <MirrorIcon color="#DE3163" size={isSmall ? 12 : 20} />
                    </button>
                    <button
                        onClick={(e) => handleMirroring('Y')}
                        className={`${
                            mirror.y
                                ? 'bg-[#50C878]/50'
                                : 'hover:bg-[#5CA367]/25'
                        }   font-bold p-[8px] cursor-pointer rounded-[4px] border-[0px]`}
                    >
                        <MirrorIcon color="#50C878" size={isSmall ? 12 : 20} />
                    </button>
                    <button
                        onClick={(e) => handleMirroring('Z')}
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

            {(drawGuide || bendPlaneGuide) && (
                <div className="absolute top-[72px] left-[12px] z-5 p-[4px] flex flex-col justify-center rounded-[8px] bg-[#FFFFFF] border-[1px] border-[#4B5563]/25 drop-shadow-xl">
                    <button
                        onClick={(e) => handleShapeOptions(e)}
                        className="hover:bg-[#5CA367]/25 font-bold p-[8px] cursor-pointer rounded-[4px]"
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
                            <ArcIcon color="#000000" size={isSmall ? 12 : 20} />
                        )}
                    </button>
                </div>
            )}

            {(drawGuide || bendPlaneGuide) && openDrawShapeOptions && (
                <div className="absolute flex flex-col justify-items-center gap-[4px] top-[72px] left-[72px] z-5 p-[4px] rounded-[8px] bg-[#FFFFFF] border-[1px] border-[#4B5563]/25 drop-shadow-xl">
                    <button
                        onClick={(e) => handleShape('free_hand')}
                        className="hover:bg-[#5CA367]/25 font-bold p-[8px] cursor-pointer rounded-[4px]"
                    >
                        <FreeHandIcon
                            color="#000000"
                            size={isSmall ? 12 : 20}
                        />
                    </button>
                    <button
                        onClick={(e) => handleShape('straight')}
                        className="hover:bg-[#5CA367]/25 font-bold p-[8px] cursor-pointer rounded-[4px]"
                    >
                        <StraightLineIcon
                            color="#000000"
                            size={isSmall ? 12 : 20}
                        />
                    </button>
                    <button
                        onClick={(e) => handleShape('circle')}
                        className="hover:bg-[#5CA367]/25 font-bold p-[8px] cursor-pointer rounded-[4px]"
                    >
                        <CircleIcon color="#000000" size={isSmall ? 12 : 20} />
                    </button>
                    <button
                        onClick={(e) => handleShape('arc')}
                        className="hover:bg-[#5CA367]/25 font-bold p-[8px] cursor-pointer rounded-[4px]"
                    >
                        <ArcIcon color="#000000" size={isSmall ? 12 : 20} />
                    </button>
                </div>
            )}

            {(selectLines || selectGuide) && (
                <div className="absolute flex flex-col justify-items-center gap-[4px] top-[72px] left-[12px] z-5 p-[4px] rounded-[8px] bg-[#FFFFFF] border-[1px] border-[#4B5563]/25 drop-shadow-xl">
                    {selectLines && (
                        <button
                            onClick={(e) => handleColorChange(e)}
                            className="hover:bg-[#5CA367]/25 font-bold flex justify-center items-center m-[8px] cursor-pointer rounded-[4px] border-[0px]"
                        >
                            <ColorSelectIcon
                                color={lineColor}
                                size={isSmall ? 12 : 20}
                            />
                        </button>
                    )}

                    <button
                        onClick={(e) => setTransformMode('translate')}
                        className={`flex justify-center font-bold p-[8px] cursor-pointer rounded-[4px] border-[0px] ${
                            transformMode === 'translate'
                                ? 'bg-[#5CA367]'
                                : 'hover:bg-[#5CA367]/25'
                        }`}
                    >
                        <TranslateIcon
                            color="#000000"
                            size={isSmall ? 12 : 20}
                        />
                    </button>

                    <button
                        onClick={(e) => setTransformMode('rotate')}
                        className={`flex justify-center font-bold p-[8px] cursor-pointer rounded-[4px] border-[0px] ${
                            transformMode === 'rotate'
                                ? 'bg-[#5CA367]'
                                : 'hover:bg-[#5CA367]/25'
                        }`}
                    >
                        <RotateIcon color="#000000" size={isSmall ? 12 : 20} />
                    </button>

                    <button
                        onClick={(e) => setTransformMode('scale')}
                        className={`flex justify-center font-bold p-[8px] cursor-pointer rounded-[4px] border-[0px] ${
                            transformMode === 'scale'
                                ? 'bg-[#5CA367]'
                                : 'hover:bg-[#5CA367]/25'
                        }`}
                    >
                        <ScaleIcon color="#000000" size={isSmall ? 12 : 20} />
                    </button>

                    {axisMode === 'world' && (
                        <button
                            onClick={(e) => setAxisMode('local')}
                            className="hover:bg-[#5CA367]/25 font-bold p-[8px] cursor-pointer rounded-[4px]"
                        >
                            <GlobalModeIcon
                                color="#000000"
                                size={isSmall ? 12 : 20}
                            />
                        </button>
                    )}

                    {axisMode === 'local' && (
                        <button
                            onClick={(e) => setAxisMode('world')}
                            className="hover:bg-[#5CA367]/25 font-bold p-[8px] cursor-pointer rounded-[4px]"
                        >
                            <LocalModeIcon color="#000000" />
                        </button>
                    )}

                    {selectLines && (
                        <button
                            disabled={copy}
                            onClick={(e) => setCopy(!copy)}
                            className="hover:bg-[#5CA367]/25 font-bold p-[8px] cursor-pointer rounded-[4px]"
                        >
                            <CopyIcon
                                color="#000000"
                                size={isSmall ? 12 : 20}
                            />
                        </button>
                    )}

                    {/* {selectLines && (
                        <button
                            disabled={mergeGeometries}
                            onClick={(e) =>
                                setMergeGeometries(!mergeGeometries)
                            }
                            className="hover:bg-[#5CA367]/25 font-bold p-[8px] cursor-pointer rounded-[4px]"
                        >
                            <LinkIcon
                                color="#000000"
                                size={isSmall ? 12 : 20}
                            />
                        </button>
                    )} */}
                </div>
            )}

            {selectLines && openColorOptions && (
                <div className="funnel-sans-regular absolute top-[72px] left-[72px] z-5 p-[8px] rounded-[8px] bg-[#FFFFFF] border-[1px] border-[#4B5563]/25 drop-shadow-xl">
                    <ColorPicker
                        value={lineColor}
                        onChange={setLineColor}
                        isSmall={isSmall}
                    />
                </div>
            )}

            {sceneOptions && (
                <div className="absolute w-[180px] md:w-[240px] top-[72px] right-[12px] z-5 p-[4px] rounded-[8px] bg-[#FFFFFF] border-[1px] border-[#4B5563]/25 drop-shadow-xl">
                    <div className="flex justify-around mb-[8px]">
                        <div
                            onClick={(e) => handleSceneActiveOptions('groups')}
                            className={`${
                                groupOptions
                                    ? 'border-[#00A36C]'
                                    : 'border-[#121212]'
                            } font-bold p-[8px] cursor-pointer border-b-[2px] rounded-t-[4px]`}
                        >
                            <GroupingIcon
                                color="#000000"
                                size={isSmall ? 12 : 20}
                            />
                        </div>

                        <div
                            onClick={(e) => handleSceneActiveOptions('render')}
                            className={`${
                                renderOptions
                                    ? 'border-[#00A36C]'
                                    : 'border-[#121212]'
                            }  font-bold p-[8px] cursor-pointer border-b-[2px] rounded-t-[4px]`}
                        >
                            <SceneOptionIcon
                                color="#000000"
                                size={isSmall ? 12 : 20}
                            />
                        </div>
                    </div>

                    {sceneOptions && groupOptions && (
                        <div className="flex justify-center mb-[8px]">
                            <div
                                onClick={(e) => handleGroupOperation('add')}
                                className="hover:bg-[#5CA367]/25 p-[8px] cursor-pointer rounded-[4px]"
                            >
                                <AddIcon
                                    color="#000000"
                                    size={isSmall ? 12 : 20}
                                />
                            </div>
                            <div
                                onClick={(e) => handleGroupOperation('rename')}
                                className="hover:bg-[#5CA367]/25 p-[8px] cursor-pointer rounded-[4px]"
                            >
                                <RenameIcon
                                    color="#000000"
                                    size={isSmall ? 12 : 20}
                                />
                            </div>
                            {/* <div
                                onClick={(e) => handleGroupOperation('copy')}
                                className="hover:bg-[#5CA367]/25 p-[8px] cursor-pointer rounded-[4px]"
                            >
                                <CopyIcon
                                    color="#000000"
                                    size={isSmall ? 12 : 20}
                                />
                            </div> */}
                            <div
                                onClick={(e) => handleGroupOperation('delete')}
                                className="hover:bg-[#5CA367]/25 p-[8px] cursor-pointer rounded-[4px]"
                            >
                                <DeleteIcon
                                    color="#000000"
                                    size={isSmall ? 12 : 20}
                                />
                            </div>
                        </div>
                    )}

                    <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
                        {sceneOptions &&
                            groupOptions &&
                            groupData.map((data, key) => {
                                return (
                                    <div
                                        key={key}
                                        className="text-[8px] md:text-[12px] z-5 m-[4px] flex flex-col rounded-[4px] text-[#000000] funnel-sans-regular"
                                    >
                                        <div
                                            className={`${
                                                data.active
                                                    ? 'bg-[#5CA367]'
                                                    : 'bg-[#FFFFFF]'
                                            } flex cursor-pointer justify-between items-center rounded-[4px] px-[8px]`}
                                        >
                                            <label className="cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="peer sr-only border-[1px]"
                                                    checked={selectedGroups.some(
                                                        (group) =>
                                                            group.uuid ===
                                                            data.uuid
                                                    )}
                                                    onChange={(e) =>
                                                        handleSelectGroup(
                                                            e,
                                                            data
                                                        )
                                                    }
                                                    onFocus={(e) =>
                                                        e.preventDefault()
                                                    }
                                                />
                                                <div
                                                    className={`w-[12px] h-[12px] md:w-[16px] md:h-[16px] rounded-[20px] bg-[#ffffff] border-[1px] border-[#4B5563]/25 peer-checked:bg-[#005eff] flex items-center justify-center`}
                                                >
                                                    <CorrectIcon
                                                        size={isSmall ? 8 : 12}
                                                        color="#FFFFFF"
                                                    />
                                                </div>
                                            </label>
                                            <div
                                                onClick={(e) =>
                                                    handleActiveGroup(data)
                                                }
                                                className="p-[4px] w-full mx-[8px]"
                                            >
                                                {data.name.length > 13
                                                    ? `${data.name.slice(
                                                          0,
                                                          13
                                                      )}...`
                                                    : data.name}
                                            </div>

                                            <div
                                                onClick={(e) =>
                                                    handleGroupVisibility(data)
                                                }
                                                className="flex justify-between gap-[8px] items-center p-[4px] rounded-[4px]"
                                            >
                                                {data.visible && (
                                                    <EyeOpenIcon
                                                        color="#000000"
                                                        size={isSmall ? 12 : 20}
                                                    />
                                                )}
                                                {!data.visible && (
                                                    <EyeCloseIcon
                                                        color="#000000"
                                                        size={isSmall ? 12 : 20}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                    </div>

                    {sceneOptions && renderOptions && (
                        <div className="funnel-sans-regular z-5 items-center rounded-[8px] w-full text-[#000000] bg-[#FFFFFF]">
                            <div className="flex justify-between items-center px-[12px] border-b-[1px] border-[#4B5563]/25">
                                <div className="flex justify-between items-center">
                                    <div className="font-bold p-[8px] cursor-pointer flex gap-[12px]">
                                        <SunIcon
                                            color="#000000"
                                            size={isSmall ? 12 : 20}
                                        />
                                    </div>

                                    <div className="flex flex-col m-[4px] gesture-allowed">
                                        <div className="range-container">
                                            <div className="range-wrapper">
                                                <input
                                                    onChange={(e) =>
                                                        handleLightIntensitySlider(
                                                            e
                                                        )
                                                    }
                                                    type="range"
                                                    name="range"
                                                    id="range-slider"
                                                    step={1}
                                                    value={lightIntensity}
                                                    min={0}
                                                    max={10}
                                                    style={{
                                                        width: isSmall
                                                            ? '80px'
                                                            : '120px',
                                                        backgroundSize:
                                                            intensityBackground,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="font-bold p-[4px] cursor-pointer flex text-[8px] md:text-[12px]">
                                    {lightIntensity}
                                </div>
                            </div>

                            <div className="m-[12px] flex items-center justify-between">
                                <div className="text-[8px] md:text-[12px]">
                                    Post Process
                                </div>
                                {postProcess && (
                                    <div
                                        onClick={(e) =>
                                            setPostProcess(!postProcess)
                                        }
                                        className="m-[12px] flex items-center bg-[#16b826] rounded-[12px]"
                                    >
                                        <div className="flex items-center bg-[#16b826] rounded-[12px] transition-all duration-200 ease-out transform animate-fade-in">
                                            <OpacityIcon
                                                color="#16b826"
                                                size={isSmall ? 12 : 20}
                                            />
                                            <OpacityIcon
                                                color="#000000"
                                                size={isSmall ? 12 : 20}
                                            />
                                        </div>
                                    </div>
                                )}
                                {!postProcess && (
                                    <div
                                        onClick={(e) =>
                                            setPostProcess(!postProcess)
                                        }
                                        className="m-[12px] flex items-center bg-[#16b826] rounded-[12px]"
                                    >
                                        <div className="flex items-center bg-[#A9A9A9] rounded-[12px] transition-all duration-200 ease-out transform animate-fade-in">
                                            <OpacityIcon
                                                color="#000000"
                                                size={isSmall ? 12 : 20}
                                            />
                                            <OpacityIcon
                                                color="#A9A9A9"
                                                size={isSmall ? 12 : 20}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="m-[12px] flex items-center justify-between">
                                <div className="text-[8px] md:text-[12px]">
                                    Sequential Loading
                                </div>
                                {sequentialLoading && (
                                    <div
                                        onClick={(e) =>
                                            setSequentialLoading(
                                                !sequentialLoading
                                            )
                                        }
                                        className="m-[12px] flex items-center bg-[#16b826] rounded-[12px]"
                                    >
                                        <div className="flex items-center bg-[#16b826] rounded-[12px] transition-all duration-200 ease-out transform animate-fade-in">
                                            <OpacityIcon
                                                color="#16b826"
                                                size={isSmall ? 12 : 20}
                                            />
                                            <OpacityIcon
                                                color="#000000"
                                                size={isSmall ? 12 : 20}
                                            />
                                        </div>
                                    </div>
                                )}

                                {!sequentialLoading && (
                                    <div
                                        onClick={(e) =>
                                            setSequentialLoading(
                                                !sequentialLoading
                                            )
                                        }
                                        className="m-[12px] flex-col items-center bg-[#16b826] rounded-[12px]"
                                    >
                                        <div className="flex items-center bg-[#A9A9A9] rounded-[12px] transition-all duration-200 ease-out transform animate-fade-in">
                                            <OpacityIcon
                                                color="#000000"
                                                size={isSmall ? 12 : 20}
                                            />
                                            <OpacityIcon
                                                color="#A9A9A9"
                                                size={isSmall ? 12 : 20}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="border-t-[1px] border-[#4B5563]/25 gesture-allowed">
                                <ColorPicker
                                    value={canvasBackgroundColor}
                                    onChange={setCanvasBackgroundColor}
                                    isSmall={isSmall}
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}
        </>
    )
}

export default ToolPanel
