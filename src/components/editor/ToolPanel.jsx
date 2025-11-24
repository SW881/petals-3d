import SunIcon from '../svg-icons/SunIcon'
import AddIcon from '../svg-icons/AddIcon'
import ArcIcon from '../svg-icons/ArcIcon'
import CopyIcon from '../svg-icons/CopyIcon'
import LinkIcon from '../svg-icons/LinkIcon'
import PenIcon from '../svg-icons/PenIcon'
import WidthIcon from '../svg-icons/WidthIcon'
import ScaleIcon from '../svg-icons/ScaleIcon'
import GuideIcon from '../svg-icons/GuideIcon'
import SelectIcon from '../svg-icons/SelectIcon'
import EraserIcon from '../svg-icons/EraserIcon'
import RotateIcon from '../svg-icons/RotateIcon'
import DeleteIcon from '../svg-icons/DeleteIcon'
import RenderIcon from '../svg-icons/RenderIcon'
import RenameIcon from '../svg-icons/RenameIcon'
import CircleIcon from '../svg-icons/CircleIcon'
import MirrorIcon from '../svg-icons/MirrorIcon'
import EyeOpenIcon from '../svg-icons/EyeOpenIcon'
import OpacityIcon from '../svg-icons/OpacityIcon'
import CorrectIcon from '../svg-icons/CorrectIcon'
import GroupingIcon from '../svg-icons/GroupingIcon'
import EyeCloseIcon from '../svg-icons/EyeCloseIcon'
import FreeHandIcon from '../svg-icons/FreeHandIcon'
import LocalModeIcon from '../svg-icons/LocalModeIcon'
import FlatShadeIcon from '../svg-icons/FlatShadeIcon'
import GlowShadeIcon from '../svg-icons/GlowShadeIcon'
import TranslateIcon from '../svg-icons/TranslateIcon'
import LoftGuideIcon from '../svg-icons/LoftGuideIcon'
import CubeStrokeIcon from '../svg-icons/CubeStrokeIcon'
import GlobalModeIcon from '../svg-icons/GlobalModeIcon'
import BeltStrokeIcon from '../svg-icons/BeltStrokeIcon'
import EraseGuideIcon from '../svg-icons/EraseGuideIcon'
import SceneOptionIcon from '../svg-icons/SceneOptionIcon'
import TaperStrokeIcon from '../svg-icons/TaperStrokeIcon'
import ColorSelectIcon from '../svg-icons/ColorSelectIcon'
import PaintStrokeIcon from '../svg-icons/PaintStrokeIcon'
import StableStrokIcon from '../svg-icons/StableStrokIcon'
import WrongButtonIcon from '../svg-icons/WrongButtonIcon'
import RespondShadeIcon from '../svg-icons/RespondShadeIcon'
import StraightLineIcon from '../svg-icons/StraightLineIcon'
import BendGuidePlaneIcon from '../svg-icons/BendGuidePlaneIcon'
import PressureActiveIcon from '../svg-icons/PressureActiveIcon'
import PressureInActiveIcon from '../svg-icons/PressureInActiveIcon'

import AddNewGroups from './canvas/groups/AddNewGroups'
import DeleteGroups from './canvas/groups/DeleteGroups'
import RenameGroups from './canvas/groups/RenameGroups'
import CopyGroups from './canvas/groups/CopyGroups'

import { saveGroupToIndexDB } from '../../helpers/sceneFunction'
import { canvasDrawStore } from '../../hooks/useCanvasDrawStore'
import { canvasViewStore } from '../../hooks/useCanvasViewStore'
import { canvasRenderStore } from '../../hooks/useRenderSceneStore'
import { dashboardStore } from '../../hooks/useDashboardStore'

import TooltipAdvanced from '../info/TooltipAdvanced'
import ColorHexPicker from './ColorHexPicker'
import WrongIcon from '../svg-icons/WrongIcon'

const ToolPanel = () => {
    const {
        copy,
        setCopy,
        axisMode,
        penActive,
        drawGuide,
        drawShapeType,
        strokeType,
        strokeWidth,
        setAxisMode,
        selectLines,
        eraserActive,
        setDrawGuide,
        pressureMode,
        setPenActive,
        strokeOpacity,
        transformMode,
        setStrokeType,
        setSelectLines,
        setStrokeWidth,
        setStrokeColor,
        strokeColor,
        setEraserActive,
        widthBackground,
        setPressureMode,
        openWidthSlider,
        setStrokeOpacity,
        openColorOptions,
        setDrawShapeType,
        setTransformMode,
        setFreeHandStroke,
        openStrokeOptions,
        openOpacitySlider,
        opacityBackground,
        straightHandStroke,
        setOpenWidthSlider,
        setOpenColorOptions,
        setOpenOpacitySlider,
        openDrawShapeOptions,
        setOpacityBackground,
        setOpenStrokeOptions,
        setOpenDrawShapeOptions,
        dynamicDrawingPlaneMesh,
        setDynamicDrawingPlaneMesh,
        setWidthBackground,
        mergeGeometries,
        setMergeGeometries,
        lineColor,
        setLineColor,
        mirrorOptions,
        setMirrorOptions,
        mirror,
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
        selectGuide,
        setSelectGuide,
        tensionBackground,
        waistBackground,
        radialBackground,
        ployBackground,
        setRadialBackground,
        setWaistBackground,
        setTensionBackground,
        setPolyBackground,
        tensionPercentage,
        setTensionPercentage,
        radialPercentage,
        setRadialPercentage,
        waistPercentage,
        setWaistPercentage,
        polyCountPercentage,
        setPolyCountPercentage,
        generateLoftSurface,
        setGenerateLoftSurface,
        highlighted,
        setHighlighted,
    } = canvasDrawStore((state) => state)

    const { orbitalLock, setOrbitalLock } = canvasViewStore((state) => state)

    const {
        newGroupModal,
        copyGroupModal,
        deleteGroupModal,
        setNewGroupModal,
        renameGroupModal,
        setCopyGroupModal,
        setRenameGroupModal,
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
                break

            case 'generate_loft_guide':
                // setLoftGuidePlane(false)
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

    // --- Handling Stroke ---
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
            case 'square':
                setDrawShapeType('square')
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
        // setFreeHandStroke(false)
        setOpenOpacitySlider(false)
        setOpenWidthSlider(false)
        setMirrorOptions(false)
        setOpenStrokeStabler(false)
        setOpenStrokeOptions(!openStrokeOptions)
        setOpenDrawShapeOptions(false)
    }

    function handleShapeOptions(e) {
        setOpenColorOptions(false)
        // setFreeHandStroke(false)
        setOpenOpacitySlider(false)
        setOpenWidthSlider(false)
        setMirrorOptions(false)
        setOpenStrokeStabler(false)
        setOpenStrokeOptions(false)
        setOpenDrawShapeOptions(!openDrawShapeOptions)
    }

    // --- Handling Color ---
    function handleColorChange(e) {
        // setFreeHandStroke(false)
        setOpenStrokeOptions(false)
        setOpenOpacitySlider(false)
        setOpenWidthSlider(false)
        setMirrorOptions(false)
        setOpenDrawShapeOptions(false)
        setOpenStrokeStabler(false)
        setOpenColorOptions(!openColorOptions)
    }

    function handleSelectedColorChange(e) {
        // setFreeHandStroke(false)
        setOpenStrokeOptions(false)
        setOpenOpacitySlider(false)
        setOpenWidthSlider(false)
        setMirrorOptions(false)
        setOpenDrawShapeOptions(false)
        setOpenStrokeStabler(false)
        setOpenColorOptions(!openColorOptions)
    }

    function handleFreeHandOptions(e) {
        setOpenColorOptions(false)
        setOpenStrokeOptions(false)
        setOpenOpacitySlider(false)
        setOpenWidthSlider(false)
        setMirrorOptions(false)
        setOpenDrawShapeOptions(false)
        setOpenStrokeStabler(false)
        setFreeHandStroke(!straightHandStroke)
    }

    function handleOpacityOptions(e) {
        setOpenColorOptions(false)
        // setFreeHandStroke(false)
        setOpenStrokeOptions(false)
        setOpenWidthSlider(false)
        setMirrorOptions(false)
        setOpenDrawShapeOptions(false)
        setOpenStrokeStabler(false)
        setOpenOpacitySlider(!openOpacitySlider)
    }

    function handleWidthOptions(e) {
        setOpenColorOptions(false)
        // setFreeHandStroke(false)
        setOpenStrokeOptions(false)
        setOpenOpacitySlider(false)
        setMirrorOptions(false)
        setOpenDrawShapeOptions(false)
        setOpenStrokeStabler(false)
        setOpenWidthSlider(!openWidthSlider)
    }

    function handleMirrorOptions(e) {
        setOpenColorOptions(false)
        // setFreeHandStroke(false)
        setOpenStrokeOptions(false)
        setOpenOpacitySlider(false)
        setOpenWidthSlider(false)
        setOpenDrawShapeOptions(false)
        setOpenStrokeStabler(false)
        setMirrorOptions(!mirrorOptions)
    }

    function handleStableStrokeOptions(e) {
        setOpenColorOptions(false)
        // setFreeHandStroke(false)
        setOpenStrokeOptions(false)
        setOpenOpacitySlider(false)
        setOpenWidthSlider(false)
        setMirrorOptions(false)
        setOpenDrawShapeOptions(false)
        setOpenStrokeStabler(!openStrokeStabler)
    }

    function handleWidthSliderValue(e) {
        e.preventDefault()
        // if (parseInt(e.target.value) < 0) {
        //     setStrokeWidth(1)
        // } else if (parseFloat(e.target.value) > 10.0) {
        //     setStrokeWidth(10)
        // } else {
        // }
        setStrokeWidth(parseFloat(e.target.value))

        const min = e.target.min
        const max = e.target.max
        const currentVal = e.target.value
        // e.target.style.backgroundSize =
        let x = ((currentVal - min) / (max - min)) * 100 + '% 100%'
        // console.log({ x })
        setWidthBackground(((currentVal - min) / (max - min)) * 100 + '% 100%')
    }

    function handleStrokeStableSliderValue(e) {
        e.preventDefault()
        // if (parseInt(e.target.value) <= 0) {
        //     setStrokeStablePercentage(0)
        // } else if (parseFloat(e.target.value) >= 20.0) {
        //     setStrokeStablePercentage(10 * 10)
        // } else {
        // }
        setStrokeStablePercentage(e.target.value)

        const min = e.target.min
        const max = e.target.max
        const currentVal = e.target.value
        // e.target.style.backgroundSize =
        let x = ((currentVal - min) / (max - min)) * 100 + '% 100%'
        console.log({ x })
        setStableBackground(((currentVal - min) / (max - min)) * 100 + '% 100%')
    }

    function handleOpacitySliderValue(e) {
        e.preventDefault()
        setStrokeOpacity(parseFloat(e.target.value))
        const min = e.target.min
        const max = e.target.max
        const currentVal = e.target.value
        // e.target.style.backgroundSize =
        // let x = ((currentVal - min) / (max - min)) * 100 + '% 100%'
        setOpacityBackground(
            ((currentVal - min) / (max - min)) * 100 + '% 100%'
        )
    }

    function handleTensionSliderValue(e) {
        e.preventDefault()
        setTensionPercentage(parseFloat(e.target.value))
        const min = e.target.min
        const max = e.target.max
        const currentVal = e.target.value
        // e.target.style.backgroundSize =
        // let x = ((currentVal - min) / (max - min)) * 100 + '% 100%'
        setTensionBackground(
            ((currentVal - min) / (max - min)) * 100 + '% 100%'
        )
    }

    function handleRadialPercentage(e) {
        e.preventDefault()
        setRadialPercentage(parseFloat(e.target.value))
        const min = e.target.min
        const max = e.target.max
        const currentVal = e.target.value
        // e.target.style.backgroundSize =
        // let x = ((currentVal - min) / (max - min)) * 100 + '% 100%'
        setRadialBackground(((currentVal - min) / (max - min)) * 100 + '% 100%')
    }

    function handleWaistPercentage(e) {
        e.preventDefault()
        setWaistPercentage(parseFloat(e.target.value))
        const min = e.target.min
        const max = e.target.max
        const currentVal = e.target.value
        // e.target.style.backgroundSize =
        // let x = ((currentVal - min) / (max - min)) * 100 + '% 100%'
        setWaistBackground(((currentVal - min) / (max - min)) * 100 + '% 100%')
    }

    function handlePolyCountSliderValue(e) {
        e.preventDefault()
        setPolyCountPercentage(parseFloat(e.target.value))
        const min = e.target.min
        const max = e.target.max
        const currentVal = e.target.value
        // e.target.style.backgroundSize =
        // let x = ((currentVal - min) / (max - min)) * 100 + '% 100%'
        setPolyBackground(((currentVal - min) / (max - min)) * 100 + '% 100%')
    }

    function handleLightIntensitySlider(e) {
        e.preventDefault()
        setLightIntensity(e.target.value)
        const min = e.target.min
        const max = e.target.max
        const currentVal = e.target.value
        // e.target.style.backgroundSize =
        // let x = ((currentVal - min) / (max - min)) * 100 + '% 100%'
        setIntensityBackground(
            ((currentVal - min) / (max - min)) * 100 + '% 100%'
        )
    }

    // Render options
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
        let response = await saveGroupToIndexDB(updatedGroupData, data.note_id)
    }

    async function handleActiveGroup(data) {
        canvasRenderStore.getState().setActiveGroup(data.uuid)
        canvasRenderStore.getState().updateActiveGroupProduct(data.uuid)
        const updatedGroupData = canvasRenderStore.getState().groupData
        let response = await saveGroupToIndexDB(updatedGroupData, data.note_id)
    }

    return (
        <>
            <div className="absolute top-[12px] right-[16px] z-5 flex items-center gap-[4px] p-[4px] rounded-[12px] bg-[#000000]">
                {!dynamicDrawingPlaneMesh && (
                    <TooltipAdvanced
                        text="Draw Guide"
                        position="bottom"
                        delay={100}
                    >
                        <button
                            onClick={(e) => handleDraw('draw_guide')}
                            className={`hover:bg-[#5D3FD3] flex justify-center font-bold p-[8px] cursor-pointer rounded-[8px] border-[0px] ${
                                drawGuide ? 'bg-[#5D3FD3]' : 'bg-[#000000]'
                            }`}
                        >
                            <GuideIcon color="#FFFFFF" size={20} />
                        </button>
                    </TooltipAdvanced>
                )}

                {dynamicDrawingPlaneMesh && (
                    <TooltipAdvanced
                        text="Erase Guide"
                        position="bottom"
                        delay={100}
                    >
                        <button
                            onClick={(e) => handleDraw('erase_guide')}
                            className={`hover:bg-[#5D3FD3] flex justify-center font-bold p-[8px] cursor-pointer rounded-[8px] border-[0px]`}
                        >
                            <EraseGuideIcon color="#FFFFFF" size={20} />
                        </button>
                    </TooltipAdvanced>
                )}

                {dynamicDrawingPlaneMesh && (
                    <TooltipAdvanced
                        text="Bend Guide"
                        position="bottom"
                        delay={100}
                    >
                        <button
                            onClick={(e) => handleDraw('bend_guide')}
                            className={`hover:bg-[#5D3FD3] flex justify-center font-bold p-[8px] cursor-pointer rounded-[8px] border-[0px] ${
                                bendPlaneGuide ? 'bg-[#5D3FD3]' : 'bg-[#000000]'
                            }`}
                        >
                            <BendGuidePlaneIcon color="#FFFFFF" size={20} />
                        </button>
                    </TooltipAdvanced>
                )}

                <TooltipAdvanced
                    text="Loft Guide"
                    position="bottom"
                    delay={100}
                >
                    <button
                        onClick={(e) => handleDraw('loft_guide')}
                        // setBendPlaneGuide(!bendPlaneGuide)}
                        className={`text-[#FFFFFF] hover:bg-[#5D3FD3] flex justify-center font-bold p-[8px] cursor-pointer rounded-[8px] border-[0px] ${
                            loftGuidePlane ? 'bg-[#5D3FD3]' : 'bg-[#000000]'
                        }`}
                    >
                        <LoftGuideIcon color="#FFFFFF" size={20} />
                    </button>
                </TooltipAdvanced>

                {dynamicDrawingPlaneMesh && (
                    <TooltipAdvanced
                        text="Select Guide"
                        position="bottom"
                        delay={100}
                    >
                        <button
                            onClick={(e) => handleDraw('selectGuide')}
                            className={`hover:bg-[#5D3FD3] flex justify-center font-bold p-[8px] cursor-pointer rounded-[8px] border-[0px] ${
                                selectGuide ? 'bg-[#5D3FD3]' : 'bg-[#000000]'
                            }`}
                        >
                            <SelectIcon color="#FFFFFF" size={20} />
                        </button>
                    </TooltipAdvanced>
                )}

                <div className="px-[8px] text-[#FFFFFF]">|</div>

                <TooltipAdvanced text="Pen" position="bottom" delay={100}>
                    <button
                        onClick={(e) => handleDraw('pen')}
                        className={`hover:bg-[#5D3FD3] flex justify-center font-bold p-[8px] cursor-pointer rounded-[8px] border-[0px] ${
                            penActive ? 'bg-[#5D3FD3]' : 'bg-[#000000]'
                        }`}
                    >
                        <PenIcon color="#FFFFFF" size={20} />
                    </button>
                </TooltipAdvanced>

                <TooltipAdvanced text="Eraser" position="bottom" delay={100}>
                    <button
                        onClick={(e) => handleDraw('eraser')}
                        className={`hover:bg-[#5D3FD3] flex justify-center font-bold p-[8px] cursor-pointer rounded-[8px] border-[0px] ${
                            eraserActive ? 'bg-[#5D3FD3]' : 'bg-[#000000]'
                        }`}
                    >
                        <EraserIcon color="#FFFFFF" size={20} />
                    </button>
                </TooltipAdvanced>

                <TooltipAdvanced
                    text="Select Lines"
                    position="bottom"
                    delay={100}
                >
                    <button
                        onClick={(e) => handleDraw('selectLines')}
                        className={`hover:bg-[#5D3FD3] flex justify-center font-bold p-[8px] cursor-pointer rounded-[8px] border-[0px] ${
                            selectLines ? 'bg-[#5D3FD3]' : 'bg-[#000000]'
                        }`}
                    >
                        <SelectIcon color="#FFFFFF" size={20} />
                    </button>
                </TooltipAdvanced>

                <div className="px-[8px] text-[#FFFFFF]">|</div>

                <TooltipAdvanced
                    text="Scene Options"
                    position="bottom"
                    delay={100}
                >
                    <button
                        onClick={(e) => handleSceneOptions()}
                        className={`hover:bg-[#5D3FD3] flex justify-center font-bold p-[8px] cursor-pointer rounded-[8px] border-[0px] ${
                            sceneOptions ? 'bg-[#5D3FD3]' : 'bg-[#000000]'
                        }`}
                    >
                        <RenderIcon color="#FFFFFF" size={20} />
                    </button>
                </TooltipAdvanced>
            </div>

            {/* {loftGuidePlane && (
                <div className="absolute w-[198px] top-[72px] left-[72px] z-5 p-[4px] justify-center rounded-[12px] bg-[#000000] text-[#FFFFFF]">
                    Tension Percentage
                    <div className="bg-[#000000] flex flex-col m-[4px]">
                        <div className="range-container">
                            <div className="range-wrapper">
                                <input
                                    onChange={(e) =>
                                        handleTensionSliderValue(e)
                                    }
                                    type="range"
                                    name="range"
                                    id="range-slider"
                                    step={1}
                                    value={tensionPercentage}
                                    min={0}
                                    max={100}
                                    style={{
                                        backgroundSize: tensionBackground,
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
                                className="rounded-[8px] block w-[72px] text-[12px] px-[12px] py-[8px] focus:outline-0 funnel-sans-semibold"
                                value={tensionPercentage}
                                disabled={true}
                            />
                        </div>
                    </div>
                </div>
            )} */}

            <div className="absolute funnel-sans-regular text-[#FFFFFF] flex flex-col gap-[8px] top-[72px] left-[16px] text-[12px]">
                {loftGuidePlane && (
                    <div className="w-[198px] z-5 p-[4px] justify-center rounded-[12px] bg-[#000000] ">
                        <div className="p-[12px]">Radial Percentage</div>
                        <div className="bg-[#000000] flex flex-col m-[4px]">
                            <div className="range-container">
                                <div className="range-wrapper">
                                    <input
                                        onChange={(e) =>
                                            handleRadialPercentage(e)
                                        }
                                        type="range"
                                        name="range"
                                        id="range-slider"
                                        step={1}
                                        value={radialPercentage}
                                        min={0}
                                        max={100}
                                        style={{
                                            backgroundSize: radialBackground,
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
                                    className="rounded-[8px] block w-[72px] text-[12px] px-[12px] py-[8px] focus:outline-0 funnel-sans-semibold"
                                    value={radialPercentage}
                                    disabled={true}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {loftGuidePlane && (
                    <div className="w-[198px] z-5 p-[4px] justify-center rounded-[12px] bg-[#000000]">
                        <div className="p-[12px]">Waist Percentage</div>
                        <div className="bg-[#000000] flex flex-col m-[4px]">
                            <div className="range-container">
                                <div className="range-wrapper">
                                    <input
                                        onChange={(e) =>
                                            handleWaistPercentage(e)
                                        }
                                        type="range"
                                        name="range"
                                        id="range-slider"
                                        step={1}
                                        value={waistPercentage}
                                        min={0}
                                        max={100}
                                        style={{
                                            backgroundSize: waistBackground,
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
                                    className="rounded-[8px] block w-[72px] text-[12px] px-[12px] py-[8px] focus:outline-0 funnel-sans-semibold"
                                    value={waistPercentage}
                                    disabled={true}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {loftGuidePlane && (
                    <div className="w-[198px] left-[16px] z-5 p-[4px] justify-center rounded-[12px] bg-[#000000]">
                        <div className="p-[12px]">Poly count Percentage</div>
                        <div className="bg-[#000000] flex flex-col m-[4px]">
                            <div className="range-container">
                                <div className="range-wrapper">
                                    <input
                                        onChange={(e) =>
                                            handlePolyCountSliderValue(e)
                                        }
                                        type="range"
                                        name="range"
                                        id="range-slider"
                                        step={1}
                                        value={polyCountPercentage}
                                        min={1}
                                        max={50}
                                        style={{
                                            backgroundSize: ployBackground,
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
                                    className="rounded-[8px] block w-[72px] text-[12px] px-[12px] py-[8px] focus:outline-0 funnel-sans-semibold"
                                    value={polyCountPercentage}
                                    disabled={true}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* {loftGuidePlane && (
                <div className="absolute top-[72px] left-[16px] z-5 gap-[4px] p-[4px] flex flex-col justify-center rounded-[12px] bg-[#000000]">
                    <TooltipAdvanced
                        text="Color Select"
                        position="right"
                        delay={100}
                    >
                        <button
                            onClick={(e) => handleColorChange(e)}
                            className="hover:bg-[#5D3FD3] font-bold flex justify-center items-center m-[8px] cursor-pointer rounded-[8px] border-[0px]"
                        >
                            <ColorSelectIcon color={strokeColor} size={20} />
                        </button>
                    </TooltipAdvanced>
                </div>
            )} */}
            </div>

            {loftGuidePlane && (
                <div className="funnel-sans-regular absolute bottom-[4px] left-1/2 -translate-x-1/2 -translate-y-1/2 z-5 rounded-[12px]  bg-[#000000]  text-[#FFFFFF]">
                    <div className="flex justify-center items-center gap-[8px] border-1 border-amber-50 p-[4px]">
                        <button
                            onClick={(e) => handleDraw('cancel_loft_guide')}
                            className={`active:scale-90 hover:bg-[#5D3FD3] flex justify-center font-bold p-[8px] cursor-pointer rounded-[8px] border-[0px]`}
                        >
                            <WrongButtonIcon color="#FFFFFF" size={20} />
                        </button>

                        <button
                            onClick={(e) => handleDraw('generate_loft_guide')}
                            className={`active:scale-90 hover:bg-[#5D3FD3] flex justify-center font-bold p-[8px] cursor-pointer rounded-[8px] border-[0px]`}
                        >
                            <CorrectIcon color="#FFFFFF" size={20} />
                        </button>
                    </div>
                </div>
            )}

            {penActive && (
                <div className="absolute top-[72px] left-[16px] z-5 gap-[4px] p-[4px] flex flex-col justify-center rounded-[12px] bg-[#000000]">
                    <TooltipAdvanced
                        text="Color Select"
                        position="right"
                        delay={100}
                    >
                        <button
                            onClick={(e) => handleColorChange(e)}
                            className="hover:bg-[#5D3FD3] font-bold flex justify-center items-center m-[8px] cursor-pointer rounded-[8px] border-[0px]"
                        >
                            <ColorSelectIcon color={strokeColor} size={20} />
                        </button>
                    </TooltipAdvanced>
                    <TooltipAdvanced
                        text="Brushes"
                        position="right"
                        delay={100}
                    >
                        <button
                            onClick={(e) => handleStrokeOptions(e)}
                            className={`hover:bg-[#5D3FD3] flex justify-center font-bold p-[8px] cursor-pointer rounded-[8px] border-[0px]`}
                        >
                            {strokeType === 'taper' && (
                                <TaperStrokeIcon
                                    color={strokeColor}
                                    size={20}
                                />
                            )}
                            {strokeType === 'cube' && (
                                <CubeStrokeIcon color={strokeColor} size={20} />
                            )}
                            {strokeType === 'paint' && (
                                <PaintStrokeIcon
                                    color={strokeColor}
                                    size={20}
                                />
                            )}
                            {strokeType === 'belt' && (
                                <BeltStrokeIcon color={strokeColor} size={20} />
                            )}
                        </button>
                    </TooltipAdvanced>
                    <TooltipAdvanced
                        text="Draw Shape"
                        position="right"
                        delay={100}
                    >
                        <button
                            onClick={(e) => handleShapeOptions(e)}
                            className={`hover:bg-[#5D3FD3] flex justify-center font-bold p-[8px] cursor-pointer rounded-[8px] border-[0px] ${
                                openDrawShapeOptions
                                    ? 'bg-[#5D3FD3]'
                                    : 'bg-[#000000]'
                            }`}
                        >
                            {drawShapeType === 'free_hand' && (
                                <FreeHandIcon color="#FFFFFF" size={20} />
                            )}
                            {drawShapeType === 'straight' && (
                                <StraightLineIcon color="#FFFFFF" size={20} />
                            )}
                            {drawShapeType === 'circle' && (
                                <CircleIcon color="#FFFFFF" size={20} />
                            )}
                            {drawShapeType === 'arc' && (
                                <ArcIcon color="#FFFFFF" size={20} />
                            )}
                        </button>
                    </TooltipAdvanced>
                    <TooltipAdvanced
                        text="Opacity"
                        position="right"
                        delay={100}
                    >
                        <button
                            onClick={(e) => handleOpacityOptions(e)}
                            className={`hover:bg-[#5D3FD3] flex justify-center font-bold p-[8px] cursor-pointer rounded-[8px] border-[0px] ${
                                openOpacitySlider
                                    ? 'bg-[#5D3FD3]'
                                    : 'bg-[#000000]'
                            }`}
                        >
                            <OpacityIcon
                                color="#FFFFFF"
                                size={20}
                                opacity={strokeOpacity}
                            />
                        </button>
                    </TooltipAdvanced>
                    <TooltipAdvanced text="Width" position="right" delay={100}>
                        <button
                            onClick={(e) => handleWidthOptions(e)}
                            className={`hover:bg-[#5D3FD3] flex justify-center font-bold p-[8px] cursor-pointer rounded-[8px] border-[0px] ${
                                openWidthSlider
                                    ? 'bg-[#5D3FD3]'
                                    : 'bg-[#000000]'
                            }`}
                        >
                            <WidthIcon color="#FFFFFF" size={20} />
                        </button>
                    </TooltipAdvanced>
                    <TooltipAdvanced
                        text="Stable Stroke"
                        position="right"
                        delay={100}
                    >
                        <button
                            onClick={(e) => handleStableStrokeOptions(e)}
                            className={`hover:bg-[#5D3FD3] flex justify-center font-bold p-[8px] cursor-pointer rounded-[8px] border-[0px] ${
                                openStrokeStabler
                                    ? 'bg-[#5D3FD3]'
                                    : 'bg-[#000000]'
                            }`}
                        >
                            <StableStrokIcon color="#FFFFFF" size={20} />
                        </button>
                    </TooltipAdvanced>

                    {pressureMode && (
                        <TooltipAdvanced
                            text="Pressure Active"
                            position="right"
                            delay={100}
                        >
                            <button
                                onClick={(e) => setPressureMode(false)}
                                className={`hover:bg-[#5D3FD3] flex justify-center font-bold p-[8px] cursor-pointer rounded-[8px] border-[0px] `}
                            >
                                <PressureActiveIcon color="#FFFFFF" size={20} />
                            </button>
                        </TooltipAdvanced>
                    )}

                    {!pressureMode && (
                        <TooltipAdvanced
                            text="Pressure Inactive"
                            position="right"
                            delay={100}
                        >
                            <button
                                onClick={(e) => setPressureMode(true)}
                                className={`hover:bg-[#5D3FD3] flex justify-center font-bold p-[8px] cursor-pointer rounded-[8px] border-[0px] `}
                            >
                                <PressureInActiveIcon
                                    color="#FFFFFF"
                                    size={20}
                                />
                            </button>
                        </TooltipAdvanced>
                    )}

                    <TooltipAdvanced text="Mirror" position="right" delay={100}>
                        <button
                            onClick={(e) => handleMirrorOptions(e)}
                            className={`hover:bg-[#5D3FD3] flex justify-center font-bold p-[8px] cursor-pointer rounded-[8px] border-[0px] ${
                                mirrorOptions ? 'bg-[#5D3FD3]' : 'bg-[#000000]'
                            }`}
                        >
                            <MirrorIcon color={'#FFFFFF'} size={20} />
                        </button>
                    </TooltipAdvanced>
                </div>
            )}

            {penActive && openColorOptions && (
                <div className="absolute top-[72px] left-[72px] z-5 p-[4px] rounded-[12px] bg-[#000000] border-[12px]">
                    <ColorHexPicker
                        value={strokeColor} // renamed prop to value (authoritative color)
                        onChange={setStrokeColor}
                    />
                    <div className="text-[#FFFFFF] funnel-sans-regular mx-[8px] my-[12px]">
                        Material
                    </div>
                    <div className="flex justify-around items-center mt-[12px] bg-[#000000] ">
                        <TooltipAdvanced
                            text="Flat"
                            position="bottom"
                            delay={100}
                        >
                            <button
                                onClick={(e) => setActiveMaterialType('flat')}
                                className="cursor-pointer"
                            >
                                <FlatShadeIcon
                                    color={
                                        activeMaterialType === 'flat'
                                            ? '#FFFFFF'
                                            : '#B7B7B7'
                                    }
                                    size={38}
                                />
                            </button>
                        </TooltipAdvanced>
                        <TooltipAdvanced
                            text="Shaded"
                            position="bottom"
                            delay={100}
                        >
                            <button
                                onClick={(e) => setActiveMaterialType('shaded')}
                                className="cursor-pointer"
                            >
                                <RespondShadeIcon
                                    color={
                                        activeMaterialType === 'shaded'
                                            ? '#FFFFFF'
                                            : '#B7B7B7'
                                    }
                                    size={38}
                                />
                            </button>
                        </TooltipAdvanced>
                        <TooltipAdvanced
                            text="Emissive"
                            position="bottom"
                            delay={100}
                        >
                            <button
                                onClick={(e) => setActiveMaterialType('glow')}
                                className="cursor-pointer"
                            >
                                <GlowShadeIcon
                                    color={
                                        activeMaterialType === 'glow'
                                            ? '#FFFFFF'
                                            : '#B7B7B7'
                                    }
                                    size={38}
                                />
                            </button>
                        </TooltipAdvanced>
                    </div>
                </div>
            )}

            {/* {loftGuidePlane && openColorOptions && (
                <div className="absolute top-[72px] left-[72px] z-5 p-[4px] rounded-[12px] bg-[#000000] border-[12px]">
                    <ColorHexPicker
                        value={strokeColor} // renamed prop to value (authoritative color)
                        onChange={setStrokeColor}
                    />
                    <div className="text-[#FFFFFF] funnel-sans-regular mx-[8px] my-[12px]">
                        Material
                    </div>
                    <div className="flex justify-around items-center mt-[12px] bg-[#000000] ">
                        <TooltipAdvanced
                            text="Flat"
                            position="bottom"
                            delay={100}
                        >
                            <button
                                onClick={(e) => setActiveMaterialType('flat')}
                                className="cursor-pointer"
                            >
                                <FlatShadeIcon
                                    color={
                                        activeMaterialType === 'flat'
                                            ? '#FFFFFF'
                                            : '#B7B7B7'
                                    }
                                    size={38}
                                />
                            </button>
                        </TooltipAdvanced>
                        <TooltipAdvanced
                            text="Shaded"
                            position="bottom"
                            delay={100}
                        >
                            <button
                                onClick={(e) => setActiveMaterialType('shaded')}
                                className="cursor-pointer"
                            >
                                <RespondShadeIcon
                                    color={
                                        activeMaterialType === 'shaded'
                                            ? '#FFFFFF'
                                            : '#B7B7B7'
                                    }
                                    size={38}
                                />
                            </button>
                        </TooltipAdvanced>
                        <TooltipAdvanced
                            text="Emissive"
                            position="bottom"
                            delay={100}
                        >
                            <button
                                onClick={(e) => setActiveMaterialType('glow')}
                                className="cursor-pointer"
                            >
                                <GlowShadeIcon
                                    color={
                                        activeMaterialType === 'glow'
                                            ? '#FFFFFF'
                                            : '#B7B7B7'
                                    }
                                    size={38}
                                />
                            </button>
                        </TooltipAdvanced>
                    </div>
                </div>
            )} */}

            {penActive && openStrokeOptions && (
                <div className="absolute flex flex-col justify-items-center gap-[4px] top-[72px] left-[72px] z-5 p-[4px] rounded-[12px]  bg-[#000000]">
                    {/* <p className="text-left text-[12px] block funnel-sans-regular text-[#ffffff] mb-[8px]">
                        Stroke
                    </p> */}
                    <button
                        onClick={(e) => handleStroke('taper')}
                        className={` hover:bg-[#5D3FD3] font-bold p-[8px] cursor-pointer rounded-[8px] border-[0px] ${
                            strokeType === 'taper'
                                ? 'bg-[#5D3FD3]'
                                : 'bg-[#000000]'
                        }`}
                    >
                        <TaperStrokeIcon color={strokeColor} size={20} />
                    </button>
                    <button
                        onClick={(e) => handleStroke('cube')}
                        className={` hover:bg-[#5D3FD3] font-bold p-[8px] cursor-pointer rounded-[8px] border-[0px] ${
                            strokeType === 'cube'
                                ? 'bg-[#5D3FD3]'
                                : 'bg-[#000000]'
                        }`}
                    >
                        <CubeStrokeIcon color={strokeColor} size={20} />
                    </button>
                    <button
                        onClick={(e) => handleStroke('paint')}
                        className={` hover:bg-[#5D3FD3] font-bold p-[8px] cursor-pointer rounded-[8px] border-[0px] ${
                            strokeType === 'paint'
                                ? 'bg-[#5D3FD3]'
                                : 'bg-[#000000]'
                        }`}
                    >
                        <PaintStrokeIcon color={strokeColor} size={20} />
                    </button>
                    <button
                        onClick={(e) => handleStroke('belt')}
                        className={` hover:bg-[#5D3FD3] font-bold p-[8px] cursor-pointer rounded-[8px] border-[0px] ${
                            strokeType === 'belt'
                                ? 'bg-[#5D3FD3]'
                                : 'bg-[#000000]'
                        }`}
                    >
                        <BeltStrokeIcon color={strokeColor} size={20} />
                    </button>
                </div>
            )}

            {penActive && openDrawShapeOptions && (
                <div className="absolute flex flex-col justify-items-center gap-[4px] top-[72px] left-[72px] z-5 p-[4px] rounded-[12px] bg-[#000000]">
                    <button
                        onClick={(e) => handleShape('free_hand')}
                        className={` hover:bg-[#5D3FD3] font-bold p-[8px] cursor-pointer rounded-[8px] border-[0px] ${
                            drawShapeType === 'free_hand'
                                ? 'bg-[#5D3FD3]'
                                : 'bg-[#000000]'
                        }`}
                    >
                        <FreeHandIcon color="#FFFFFF" size={20} />
                    </button>
                    <button
                        onClick={(e) => handleShape('straight')}
                        className={` hover:bg-[#5D3FD3] font-bold p-[8px] cursor-pointer rounded-[8px] border-[0px] ${
                            drawShapeType === 'straight'
                                ? 'bg-[#5D3FD3]'
                                : 'bg-[#000000]'
                        }`}
                    >
                        <StraightLineIcon color="#FFFFFF" size={20} />
                    </button>
                    <button
                        onClick={(e) => handleShape('circle')}
                        className={` hover:bg-[#5D3FD3] font-bold p-[8px] cursor-pointer rounded-[8px] border-[0px] ${
                            drawShapeType === 'circle'
                                ? 'bg-[#5D3FD3]'
                                : 'bg-[#000000]'
                        }`}
                    >
                        <CircleIcon color="#FFFFFF" size={20} />
                    </button>
                    <button
                        onClick={(e) => handleShape('arc')}
                        className={` hover:bg-[#5D3FD3] font-bold p-[8px] cursor-pointer rounded-[8px] border-[0px] ${
                            drawShapeType === 'arc'
                                ? 'bg-[#5D3FD3]'
                                : 'bg-[#000000]'
                        }`}
                    >
                        <ArcIcon color="#FFFFFF" size={20} />
                    </button>
                </div>
            )}

            {penActive && openOpacitySlider && (
                <div className="absolute w-[198px] top-[72px] left-[72px] z-5 p-[4px] justify-center rounded-[12px] bg-[#000000] text-[#FFFFFF]">
                    <div className="bg-[#000000] flex flex-col m-[4px]">
                        <div className="range-container">
                            <div className="range-wrapper">
                                <input
                                    onChange={(e) =>
                                        handleOpacitySliderValue(e)
                                    }
                                    type="range"
                                    name="range"
                                    id="range-slider"
                                    step={0.1}
                                    value={strokeOpacity}
                                    min={0.0}
                                    max={1}
                                    style={{
                                        backgroundSize: opacityBackground,
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
                                className="rounded-[8px] block w-[72px] text-[12px] px-[12px] py-[8px] focus:outline-0 funnel-sans-semibold"
                                value={strokeOpacity}
                                disabled={true}
                            />
                        </div>
                    </div>
                </div>
            )}

            {penActive && openWidthSlider && (
                <div className="absolute w-[198px] top-[72px] left-[72px] z-5 p-[4px] justify-center rounded-[12px] bg-[#000000] text-[#FFFFFF]">
                    <div className="bg-[#000000] flex flex-col m-[4px]">
                        <div className="range-container">
                            <div className="range-wrapper">
                                <input
                                    onChange={(e) => handleWidthSliderValue(e)}
                                    type="range"
                                    name="range"
                                    id="range-slider"
                                    step={0.05}
                                    value={strokeWidth}
                                    min={0.05}
                                    max={5}
                                    style={{
                                        backgroundSize: widthBackground,
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#000000] m-[4px]">
                        <div className="mt-[16px]">
                            <input
                                // onChange={(e) => handleWidthSliderValue(e)}
                                type="number"
                                className="rounded-[8px] block w-[72px] text-[12px] px-[12px] py-[8px] focus:outline-0 funnel-sans-semibold"
                                value={strokeWidth}
                                disabled={true}
                            />
                        </div>
                    </div>
                </div>
            )}

            {penActive && openStrokeStabler && (
                <div className="absolute w-[198px] top-[72px] left-[72px] z-5 p-[4px] justify-center rounded-[12px] bg-[#000000] text-[#FFFFFF]">
                    <div className="bg-[#000000] flex flex-col m-[4px]">
                        <div className="range-container">
                            <div className="range-wrapper">
                                <input
                                    onChange={(e) =>
                                        handleStrokeStableSliderValue(e)
                                    }
                                    type="range"
                                    name="range"
                                    id="range-slider"
                                    step={1}
                                    value={strokeStablePercentage}
                                    min={0}
                                    max={100}
                                    style={{
                                        backgroundSize: stableBackground,
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#000000] m-[4px]">
                        <div className="mt-[16px]">
                            <input
                                type="number"
                                className="rounded-[8px] block w-[72px] text-[12px] px-[12px] py-[8px] focus:outline-0 funnel-sans-semibold"
                                value={strokeStablePercentage}
                                disabled={true}
                            />
                        </div>
                    </div>
                </div>
            )}

            {penActive && mirrorOptions && (
                <div className="absolute flex flex-col justify-items-center gap-[4px] top-[72px] left-[72px] z-5 p-[4px] rounded-[12px] bg-[#000000]">
                    <button
                        onClick={(e) => handleMirroring('X')}
                        className={`${
                            mirror.x ? 'bg-[#DE3163]/50' : 'bg-[#000000]'
                        }  active:scale-90 font-bold p-[8px] cursor-pointer rounded-[8px] border-[0px]`}
                    >
                        <MirrorIcon color="#DE3163" size={20} />
                    </button>
                    <button
                        onClick={(e) => handleMirroring('Y')}
                        className={`${
                            mirror.y ? 'bg-[#50C878]/50' : 'bg-[#000000]'
                        }  active:scale-90 font-bold p-[8px] cursor-pointer rounded-[8px] border-[0px]`}
                    >
                        <MirrorIcon color="#50C878" size={20} />
                    </button>
                    <button
                        onClick={(e) => handleMirroring('Z')}
                        className={`${
                            mirror.z ? 'bg-[#0096FF]/50' : 'bg-[#000000]'
                        }  active:scale-90 font-bold p-[8px] cursor-pointer rounded-[8px] border-[0px]`}
                    >
                        <MirrorIcon color="#0096FF" size={20} />
                    </button>
                </div>
            )}

            {(drawGuide || bendPlaneGuide) && (
                <div className="absolute top-[72px] left-[16px] z-5 p-[4px] flex flex-col justify-center rounded-[12px] bg-[#000000]">
                    <button
                        onClick={(e) => handleShapeOptions(e)}
                        className=" hover:bg-[#5D3FD3] font-bold p-[8px] cursor-pointer rounded-[8px]"
                    >
                        {drawShapeType === 'free_hand' && (
                            <FreeHandIcon color="#FFFFFF" size={20} />
                        )}
                        {drawShapeType === 'straight' && (
                            <StraightLineIcon color="#FFFFFF" size={20} />
                        )}
                        {drawShapeType === 'circle' && (
                            <CircleIcon color="#FFFFFF" size={20} />
                        )}

                        {drawShapeType === 'arc' && (
                            <ArcIcon color="#FFFFFF" size={20} />
                        )}
                    </button>
                </div>
            )}

            {(drawGuide || bendPlaneGuide) && openDrawShapeOptions && (
                <div className="absolute flex flex-col justify-items-center gap-[4px] top-[72px] left-[72px] z-5 p-[4px] rounded-[12px] bg-[#000000]">
                    <button
                        onClick={(e) => handleShape('free_hand')}
                        className=" hover:bg-[#5D3FD3] font-bold p-[8px] cursor-pointer rounded-[8px]"
                    >
                        <FreeHandIcon color="#FFFFFF" size={20} />
                    </button>
                    <button
                        onClick={(e) => handleShape('straight')}
                        className=" hover:bg-[#5D3FD3] font-bold p-[8px] cursor-pointer rounded-[8px]"
                    >
                        <StraightLineIcon color="#FFFFFF" size={20} />
                    </button>
                    <button
                        onClick={(e) => handleShape('circle')}
                        className=" hover:bg-[#5D3FD3] font-bold p-[8px] cursor-pointer rounded-[8px]"
                    >
                        <CircleIcon color="#FFFFFF" size={20} />
                    </button>
                    <button
                        onClick={(e) => handleShape('arc')}
                        className=" hover:bg-[#5D3FD3] font-bold p-[8px] cursor-pointer rounded-[8px]"
                    >
                        <ArcIcon color="#FFFFFF" size={20} />
                    </button>
                </div>
            )}

            {(selectLines || selectGuide) && (
                <div className="absolute flex flex-col justify-items-center gap-[4px] top-[72px] left-[16px] z-5 p-[4px] rounded-[12px] bg-[#000000]">
                    {selectLines && (
                        <button
                            onClick={(e) => handleColorChange(e)}
                            className="hover:bg-[#5D3FD3] font-bold flex justify-center items-center m-[8px] cursor-pointer rounded-[8px] border-[0px]"
                        >
                            <ColorSelectIcon color={lineColor} size={20} />
                        </button>
                    )}

                    <button
                        onClick={(e) => setTransformMode('translate')}
                        className={`hover:bg-[#5D3FD3] flex justify-center font-bold p-[8px] cursor-pointer rounded-[8px] border-[0px] ${
                            transformMode === 'translate'
                                ? 'bg-[#5D3FD3]'
                                : 'bg-[#000000]'
                        }`}
                    >
                        <TranslateIcon color="#FFFFFF" size={20} />
                    </button>

                    <button
                        onClick={(e) => setTransformMode('rotate')}
                        className={`hover:bg-[#5D3FD3] flex justify-center font-bold p-[8px] cursor-pointer rounded-[8px] border-[0px] ${
                            transformMode === 'rotate'
                                ? 'bg-[#5D3FD3]'
                                : 'bg-[#000000]'
                        }`}
                    >
                        <RotateIcon color="#FFFFFF" size={20} />
                    </button>

                    <button
                        onClick={(e) => setTransformMode('scale')}
                        className={`hover:bg-[#5D3FD3] flex justify-center font-bold p-[8px] cursor-pointer rounded-[8px] border-[0px] ${
                            transformMode === 'scale'
                                ? 'bg-[#5D3FD3]'
                                : 'bg-[#000000]'
                        }`}
                    >
                        <ScaleIcon color="#FFFFFF" size={20} />
                    </button>

                    {axisMode === 'world' && (
                        <button
                            onClick={(e) => setAxisMode('local')}
                            className=" hover:bg-[#5D3FD3] font-bold p-[8px] cursor-pointer rounded-[8px]"
                        >
                            <GlobalModeIcon color="#FFFFFF" size={20} />
                        </button>
                    )}

                    {axisMode === 'local' && (
                        <button
                            onClick={(e) => setAxisMode('world')}
                            className=" hover:bg-[#5D3FD3] font-bold p-[8px] cursor-pointer rounded-[8px]"
                        >
                            <LocalModeIcon color="#FFFFFF" />
                        </button>
                    )}

                    {selectLines && (
                        <button
                            disabled={copy}
                            onClick={(e) => setCopy(!copy)}
                            className=" hover:bg-[#5D3FD3] font-bold p-[8px] cursor-pointer rounded-[8px]"
                        >
                            <CopyIcon color="#FFFFFF" size={20} />
                        </button>
                    )}

                    {selectLines && (
                        <button
                            disabled={mergeGeometries}
                            onClick={(e) =>
                                setMergeGeometries(!mergeGeometries)
                            }
                            className=" hover:bg-[#5D3FD3] font-bold p-[8px] cursor-pointer rounded-[8px]"
                        >
                            <LinkIcon color="#FFFFFF" size={20} />
                        </button>
                    )}
                </div>
            )}

            {selectLines && openColorOptions && (
                <div className="funnel-sans-regular absolute top-[72px] left-[72px] z-5 p-[8px] bg-[#000000] border-[0px] rounded-[12px]">
                    <ColorHexPicker value={lineColor} onChange={setLineColor} />
                </div>
            )}

            {sceneOptions && (
                <div className="absolute w-[240px] top-[72px] right-[16px] z-5 p-[4px] rounded-[12px] bg-[#000000]">
                    <div className="flex justify-around mb-[8px]">
                        <div
                            onClick={(e) => handleSceneActiveOptions('groups')}
                            className={`${
                                groupOptions
                                    ? ' border-[#00A36C]'
                                    : ' border-[#121212]'
                            } font-bold p-[8px] cursor-pointer border-b-[2px] rounded-t-[4px]`}
                        >
                            <GroupingIcon color="#FFFFFF" size={20} />
                        </div>

                        <div
                            onClick={(e) => handleSceneActiveOptions('render')}
                            className={`${
                                renderOptions
                                    ? 'border-[#00A36C]'
                                    : 'border-[#121212]'
                            }  font-bold p-[8px] cursor-pointer border-b-[2px] rounded-t-[4px]`}
                        >
                            <SceneOptionIcon color="#FFFFFF" size={20} />
                        </div>
                    </div>

                    {sceneOptions && groupOptions && (
                        <div className="flex justify-center mb-[8px]">
                            <div
                                onClick={(e) => handleGroupOperation('add')}
                                className="hover:bg-[#5D3FD3] p-[8px] cursor-pointer rounded-[8px]"
                            >
                                <AddIcon color="#FFFFFF" size={20} />
                            </div>
                            <div
                                onClick={(e) => handleGroupOperation('rename')}
                                className="hover:bg-[#5D3FD3] p-[8px] cursor-pointer rounded-[8px]"
                            >
                                <RenameIcon color="#FFFFFF" size={20} />
                            </div>
                            <div
                                onClick={(e) => handleGroupOperation('copy')}
                                className="hover:bg-[#5D3FD3] p-[8px] cursor-pointer rounded-[8px]"
                            >
                                <CopyIcon color="#FFFFFF" size={20} />
                            </div>
                            <div
                                onClick={(e) => handleGroupOperation('delete')}
                                className="hover:bg-[#5D3FD3] p-[8px] cursor-pointer rounded-[8px]"
                            >
                                <DeleteIcon color="#FFFFFF" size={20} />
                            </div>
                        </div>
                    )}

                    {sceneOptions && newGroupModal && <AddNewGroups />}
                    {sceneOptions && renameGroupModal && <RenameGroups />}
                    {sceneOptions && copyGroupModal && <CopyGroups />}
                    {sceneOptions && deleteGroupModal && <DeleteGroups />}

                    <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
                        {sceneOptions &&
                            groupOptions &&
                            groupData.map((data, key) => {
                                return (
                                    <div
                                        key={key}
                                        className="text-[16px] z-5 m-[4px] flex flex-col rounded-[8px] text-[#000000] funnel-sans-regular "
                                    >
                                        <div
                                            className={`${
                                                data.active
                                                    ? 'bg-[#5D3FD3]'
                                                    : 'bg-[#FFFFFF]'
                                            } flex cursor-pointer justify-between items-center rounded-[8px] px-[8px]`}
                                        >
                                            <label className="cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="peer sr-only border-1"
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
                                                    className={`w-[16px] h-[16px]  rounded-[20px] bg-[#ffffff] border-[1px] border-[#888888] peer-checked:bg-[#005eff] flex items-center justify-center`}
                                                >
                                                    <CorrectIcon
                                                        size={10}
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
                                                className="flex justify-between gap-[8px] items-center p-[4px] rounded-[8px]"
                                            >
                                                {data.visible && (
                                                    <EyeOpenIcon
                                                        color="#000000"
                                                        size={20}
                                                    />
                                                )}
                                                {!data.visible && (
                                                    <EyeCloseIcon
                                                        color="#000000"
                                                        size={20}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                    </div>

                    {sceneOptions && renderOptions && (
                        <div className="funnel-sans-regular z-5 items-center rounded-[12px] w-full bg-[#000000] text-[#FFFFFF]">
                            <div className="flex justify-between items-center px-[12px]">
                                <div className="flex justify-between items-center">
                                    <div className="font-bold p-[8px] cursor-pointer flex gap-[12px]">
                                        <SunIcon color="#FFFFFF" size={20} />
                                    </div>

                                    <div className="flex flex-col m-[4px]">
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
                                                        width: '120px',
                                                        backgroundSize:
                                                            intensityBackground,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="font-bold p-[4px] cursor-pointer flex">
                                    {lightIntensity}
                                </div>
                            </div>

                            <div className="m-[12px] flex items-center justify-between border-t-[1px]">
                                <div className="text-[12px]">Post Process</div>
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
                                                size={20}
                                            />
                                            <OpacityIcon
                                                color="#FFFFFF"
                                                size={20}
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
                                                color="#FFFFFF"
                                                size={20}
                                            />
                                            <OpacityIcon
                                                color="#A9A9A9"
                                                size={20}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="m-[12px] flex items-center justify-between">
                                <div className="text-[12px]">
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
                                                size={20}
                                            />
                                            <OpacityIcon
                                                color="#FFFFFF"
                                                size={20}
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
                                                color="#FFFFFF"
                                                size={20}
                                            />
                                            <OpacityIcon
                                                color="#A9A9A9"
                                                size={20}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="mt-[12px] p-[12px] border-t-[1px]">
                                <ColorHexPicker
                                    value={canvasBackgroundColor}
                                    onChange={setCanvasBackgroundColor}
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
