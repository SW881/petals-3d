import { ColorPicker, useColor } from 'react-color-palette'
import 'react-color-palette/css'

import DrawIcon from '../svg-icons/DrawIcon'
import ScaleIcon from '../svg-icons/ScaleIcon'
import SelectIcon from '../svg-icons/SelectIcon'
import EraserIcon from '../svg-icons/EraserIcon'
import RotateIcon from '../svg-icons/RotateIcon'
import SunIcon from '../svg-icons/SunIcon'
import AddIcon from '../svg-icons/AddIcon'
import CopyIcon from '../svg-icons/CopyIcon'
import FreeHandIcon from '../svg-icons/FreeHandIcon'
import LinkIcon from '../svg-icons/LinkIcon'
import WidthIcon from '../svg-icons/WidthIcon'
import TranslateIcon from '../svg-icons/TranslateIcon'
import EraseGuideIcon from '../svg-icons/EraseGuideIcon'
import DeleteIcon from '../svg-icons/DeleteIcon'
import RenderIcon from '../svg-icons/RenderIcon'
import RenameIcon from '../svg-icons/RenameIcon'
import CircleIcon from '../svg-icons/CircleIcon'
import MirrorIcon from '../svg-icons/MirrorIcon'
import EyeOpenIcon from '../svg-icons/EyeOpenIcon'
import ColorSelectIcon from '../svg-icons/ColorSelectIcon'
import OpacityIcon from '../svg-icons/OpacityIcon'
import CorrectIcon from '../svg-icons/CorrectIcon'
import StraightLineIcon from '../svg-icons/StraightLineIcon'
import GroupingIcon from '../svg-icons/GroupingIcon'
import EyeCloseIcon from '../svg-icons/EyeCloseIcon'
import LocalModeIcon from '../svg-icons/LocalModeIcon'
import FlatShadeIcon from '../svg-icons/FlatShadeIcon'
import GlowShadeIcon from '../svg-icons/GlowShadeIcon'
import DrawGuidePlaneIcon from '../svg-icons/DrawGuidePlaneIcon'
import CubeStrokeIcon from '../svg-icons/CubeStrokeIcon'
import GlobalModeIcon from '../svg-icons/GlobalModeIcon'
import BeltStrokeIcon from '../svg-icons/BeltStrokeIcon'
import BendGuidePlaneIcon from '../svg-icons/BendGuidePlaneIcon'
import SceneOptionIcon from '../svg-icons/SceneOptionIcon'
import TaperStrokeIcon from '../svg-icons/TaperStrokeIcon'
import PaintStrokeIcon from '../svg-icons/PaintStrokeIcon'
import StableStrokIcon from '../svg-icons/StableStrokIcon'
import RespondShadeIcon from '../svg-icons/RespondShadeIcon'
import SquareIcon from '../svg-icons/SquareIcon'
import ArcIcon from '../svg-icons/ArcIcon'
import CopyGroups from './canvas/groups/CopyGroups'
import RenameGroups from './canvas/groups/RenameGroups'
import DeleteGroups from './canvas/groups/DeleteGroups'

import AddNewGroups from './canvas/groups/AddNewGroups'
import { saveGroupToIndexDB } from '../../helpers/sceneFunction'
import { canvasDrawStore } from '../../hooks/useCanvasDrawStore'
import { canvasViewStore } from '../../hooks/useCanvasViewStore'
import { canvasRenderStore } from '../../hooks/useRenderSceneStore'

import { dashboardStore } from '../../hooks/useDashboardStore'

const ToolPanel = () => {
    const [color, setColor] = useColor('#000000')
    const [canvasColor, setCanvasColor] = useColor('#FFFFFF')
    const [selectedLinesColor, setSelectedLinesColor] = useColor('#15cf6c')

    const {
        copy,
        setCopy,
        axisMode,
        penActive,
        drawGuide,
        drawShape,
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
        setStrokeStablePercentage,
        setStableBackground,
        selectedGroups,
        addToSelectedGroup,
        removeFromSelectedGroup,
        mergeGeometries,
        setMergeGeometries,
        setLineColor,
        mirrorOptions,
        setMirrorOptions,
        mirror,
        activeMaterialType,
        setActiveMaterialType,
        bendPlaneGuide,
        setBendPlaneGuide,
        setEraseGuide,
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
        renderOptions,
        setRenderOptions,
        postProcess,
        setPostProcess,
        sequentialLoading,
        setSequentialLoading,
        setCanvasBackgroundColor,
        intensityBackground,
        setIntensityBackground,
        lightIntensity,
        setLightIntensity,
        renderMode,
        setRenderMode,
    } = canvasRenderStore((state) => state)

    function handleDraw(button) {
        switch (button) {
            case 'pen':
                setPenActive(!penActive)
                setOpenDrawShapeOptions(false)
                setEraserActive(false)
                setSelectLines(false)
                setDrawGuide(false)
                setBendPlaneGuide(false)
                setOpenColorOptions(false)
                setOpenStrokeOptions(false)
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
                setDrawGuide(false)
                setBendPlaneGuide(false)
                setOpenColorOptions(false)
                setOpenStrokeOptions(false)
                if (canvasDrawStore.getState().eraserActive) {
                    setOrbitalLock(true)
                } else {
                    setOrbitalLock(false)
                }
                break

            case 'selectLines':
                setSelectLines(!selectLines)
                setEraserActive(false)
                setPenActive(false)
                setDrawGuide(false)
                setBendPlaneGuide(false)
                setOpenColorOptions(false)
                setOpenStrokeOptions(false)
                if (canvasDrawStore.getState().selectLines) {
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
                setOpenColorOptions(false)
                setOpenStrokeOptions(false)
                setOrbitalLock(false)
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
                setOpenColorOptions(false)
                setOpenStrokeOptions(false)
                setOrbitalLock(false)
                break

            case 'bend_guide':
                // setDrawGuide(!drawGuide)
                setBendPlaneGuide(!bendPlaneGuide)
                setOpenDrawShapeOptions(false)
                setPenActive(false)
                setEraserActive(false)
                setSelectLines(false)
                setOpenColorOptions(false)
                setOpenStrokeOptions(false)
                setOrbitalLock(false)
                if (canvasDrawStore.getState().bendPlaneGuide) {
                    setOrbitalLock(true)
                } else {
                    setOrbitalLock(false)
                }
                break

            default:
                break
        }
    }

    function handleSceneOptions() {
        setSceneOptions(!sceneOptions)
        setGroupOptions(true)
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
        // setOpenStrokStabler(false)
        setOpenStrokeOptions(!openStrokeOptions)
        setOpenDrawShapeOptions(false)
    }

    function handleShapeOptions(e) {
        setOpenColorOptions(false)
        // setFreeHandStroke(false)
        setOpenOpacitySlider(false)
        setOpenWidthSlider(false)
        setMirrorOptions(false)
        // setOpenStrokStabler(false)
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
        // setOpenStrokStabler(false)
        setOpenColorOptions(!openColorOptions)
    }

    function handleSelectedColorChange(e) {
        // setFreeHandStroke(false)
        setOpenStrokeOptions(false)
        setOpenOpacitySlider(false)
        setOpenWidthSlider(false)
        setMirrorOptions(false)
        setOpenDrawShapeOptions(false)
        // setOpenStrokStabler(false)
        setOpenColorOptions(!openColorOptions)
    }

    function handleFreeHandOptions(e) {
        setOpenColorOptions(false)
        setOpenStrokeOptions(false)
        setOpenOpacitySlider(false)
        setOpenWidthSlider(false)
        setMirrorOptions(false)
        setOpenDrawShapeOptions(false)
        // setOpenStrokStabler(false)l
        setFreeHandStroke(!straightHandStroke)
    }

    function handleOpacityOptions(e) {
        setOpenColorOptions(false)
        // setFreeHandStroke(false)
        setOpenStrokeOptions(false)
        setOpenWidthSlider(false)
        setMirrorOptions(false)
        setOpenDrawShapeOptions(false)
        // setOpenStrokStabler(false)
        setOpenOpacitySlider(!openOpacitySlider)
    }

    function handleWidthOptions(e) {
        setOpenColorOptions(false)
        // setFreeHandStroke(false)
        setOpenStrokeOptions(false)
        setOpenOpacitySlider(false)
        setMirrorOptions(false)
        setOpenDrawShapeOptions(false)
        // setOpenStrokStabler(false)
        setOpenWidthSlider(!openWidthSlider)
    }

    function handleMirrorOptions(e) {
        setOpenColorOptions(false)
        // setFreeHandStroke(false)
        setOpenStrokeOptions(false)
        setOpenOpacitySlider(false)
        setOpenWidthSlider(false)
        setOpenDrawShapeOptions(false)
        setMirrorOptions(!mirrorOptions)
        // setOpenStrokStabler(!openStrokStabler)
    }

    function handleStableStrokeOptions(e) {
        setOpenColorOptions(false)
        // setFreeHandStroke(false)
        setOpenStrokeOptions(false)
        setOpenOpacitySlider(false)
        setOpenWidthSlider(false)
        setMirrorOptions(false)
        setOpenDrawShapeOptions(false)
        // setOpenStrokStabler(!openStrokStabler)
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
        // let x = ((currentVal - min) / (max - min)) * 100 + '% 100%'
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

    // Render
    function handleSceneActiveOptions(option) {
        switch (option) {
            case 'groups':
                // setGuideOptions(false)
                setRenderOptions(false)
                break
            // case 'guides':
            //     setGuideOptions(true)
            //     setGroupOptions(false)
            //     setRenderOptions(false)
            //     break
            case 'render':
                setRenderOptions(true)
                setGroupOptions(false)
                // setGuideOptions(false)
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
        canvasDrawStore
            .getState()
            .updateVisibleGroupProduct(data.uuid, !data.visible)
        const updatedGroupData = canvasDrawStore.getState().groupData
        let response = await saveGroupToIndexDB(updatedGroupData, data.note_id)
    }

    async function handleActiveGroup(data) {
        canvasDrawStore.getState().setActiveGroup(data.uuid)
        canvasDrawStore.getState().updateActiveGroupProduct(data.uuid)
        const updatedGroupData = canvasDrawStore.getState().groupData
        let response = await saveGroupToIndexDB(updatedGroupData, data.note_id)
    }

    return (
        <>
            <div className="absolute top-4 right-[16px] z-5 flex items-center gap-[4px] p-[4px] rounded-[12px] bg-[#000000]">
                {!dynamicDrawingPlaneMesh && (
                    <button
                        onClick={(e) => handleDraw('draw_guide')}
                        className={`text-[#FFFFFF] flex justify-center font-bold p-[8px] cursor-pointer rounded-[8px] border-[0px] ${
                            drawGuide ? 'bg-[#D3D3D3]/25' : 'bg-[#000000]'
                        }`}
                    >
                        <DrawGuidePlaneIcon color="#FFFFFF" size={20} />
                    </button>
                )}

                {dynamicDrawingPlaneMesh && (
                    <button
                        onClick={(e) => handleDraw('erase_guide')}
                        className={`text-[#FFFFFF] flex justify-center font-bold p-[8px] cursor-pointer rounded-[8px] border-[0px] ${
                            openDrawShapeOptions
                                ? 'bg-[#D3D3D3]/25'
                                : 'bg-[#000000]'
                        }`}
                    >
                        <EraseGuideIcon color="#FFFFFF" size={20} />
                    </button>
                )}

                {dynamicDrawingPlaneMesh && (
                    <button
                        onClick={(e) => handleDraw('bend_guide')}
                        // setBendPlaneGuide(!bendPlaneGuide)}
                        className={`text-[#FFFFFF] flex justify-center font-bold p-[8px] cursor-pointer rounded-[8px] border-[0px] ${
                            bendPlaneGuide ? 'bg-[#D3D3D3]/25' : 'bg-[#000000]'
                        }`}
                    >
                        <BendGuidePlaneIcon color="#FFFFFF" size={20} />
                    </button>
                )}

                <button
                    onClick={(e) => handleDraw('pen')}
                    className={`text-[#FFFFFF] flex justify-center font-bold p-[8px] cursor-pointer rounded-[8px] border-[0px] ${
                        penActive ? 'bg-[#D3D3D3]/25' : 'bg-[#000000]'
                    }`}
                >
                    <DrawIcon color="#FFFFFF" size={20} />
                </button>

                <button
                    onClick={(e) => handleDraw('eraser')}
                    className={`text-[#FFFFFF] flex justify-center font-bold p-[8px] cursor-pointer rounded-[8px] border-[0px] ${
                        eraserActive ? 'bg-[#D3D3D3]/25' : 'bg-[#000000]'
                    }`}
                >
                    <EraserIcon color="#FFFFFF" size={20} />
                </button>

                <button
                    onClick={(e) => handleDraw('selectLines')}
                    className={`text-[#FFFFFF] flex justify-center font-bold p-[8px] cursor-pointer rounded-[8px] border-[0px] ${
                        selectLines ? 'bg-[#D3D3D3]/25' : 'bg-[#000000]'
                    }`}
                >
                    <SelectIcon color="#FFFFFF" size={20} />
                </button>

                <div className="px-[8px] text-[#FFFFFF]">|</div>

                <button
                    onClick={(e) => handleSceneOptions()}
                    className={`text-[#FFFFFF] flex justify-center font-bold p-[8px] cursor-pointer rounded-[8px] border-[0px] ${
                        sceneOptions ? 'bg-[#D3D3D3]/25' : 'bg-[#000000]'
                    }`}
                >
                    <RenderIcon color="#FFFFFF" size={20} />
                </button>
            </div>

            {penActive && (
                <div className="absolute top-[72px] left-[16px] z-5 gap-[4px] p-[4px] flex flex-col justify-center rounded-[12px] bg-[#000000]">
                    <button
                        onClick={(e) => handleColorChange(e)}
                        className="text-[#FFFFFF] font-bold flex justify-center items-center m-[8px] cursor-pointer rounded-[8px] border-[0px]"
                    >
                        <ColorSelectIcon color={color.hex} size={20} />
                    </button>

                    <button
                        onClick={(e) => handleStrokeOptions(e)}
                        className={`text-[#FFFFFF] flex justify-center font-bold p-[8px] cursor-pointer rounded-[8px] border-[0px]`}
                    >
                        {strokeType === 'taper' && (
                            <TaperStrokeIcon color={color.hex} size={20} />
                        )}
                        {strokeType === 'cube' && (
                            <CubeStrokeIcon color={color.hex} size={20} />
                        )}
                        {strokeType === 'paint' && (
                            <PaintStrokeIcon color={color.hex} size={20} />
                        )}
                        {strokeType === 'belt' && (
                            <BeltStrokeIcon color={color.hex} size={20} />
                        )}
                    </button>

                    <button
                        onClick={(e) => handleShapeOptions(e)}
                        className={`text-[#FFFFFF] flex justify-center font-bold p-[8px] cursor-pointer rounded-[8px] border-[0px] ${
                            openDrawShapeOptions
                                ? 'bg-[#D3D3D3]/25'
                                : 'bg-[#000000]'
                        }`}
                    >
                        {drawShape === 'free_hand' && (
                            <FreeHandIcon color="#FFFFFF" size={20} />
                        )}
                        {drawShape === 'straight' && (
                            <StraightLineIcon color="#FFFFFF" size={20} />
                        )}
                        {drawShape === 'circle' && (
                            <CircleIcon color="#FFFFFF" size={20} />
                        )}
                        {drawShape === 'square' && (
                            <SquareIcon color="#FFFFFF" size={20} />
                        )}
                        {drawShape === 'arc' && (
                            <ArcIcon color="#FFFFFF" size={20} />
                        )}
                    </button>

                    <button
                        onClick={(e) => handleOpacityOptions(e)}
                        className={`text-[#FFFFFF] flex justify-center font-bold p-[8px] cursor-pointer rounded-[8px] border-[0px] ${
                            openOpacitySlider
                                ? 'bg-[#D3D3D3]/25'
                                : 'bg-[#000000]'
                        }`}
                    >
                        <OpacityIcon
                            color="#FFFFFF"
                            size={20}
                            opacity={strokeOpacity}
                        />
                    </button>

                    <button
                        onClick={(e) => handleWidthOptions(e)}
                        className={`text-[#FFFFFF] flex justify-center font-bold p-[8px] cursor-pointer rounded-[8px] border-[0px] ${
                            openWidthSlider ? 'bg-[#D3D3D3]/25' : 'bg-[#000000]'
                        }`}
                    >
                        <WidthIcon color="#FFFFFF" size={20} />
                    </button>

                    <button
                        onClick={(e) => setPressureMode(!pressureMode)}
                        className={`text-[#FFFFFF] flex justify-center font-bold p-[8px] cursor-pointer rounded-[8px] border-[0px] ${
                            pressureMode ? 'bg-[#D3D3D3]/25' : 'bg-[#000000]'
                        }`}
                    >
                        <StableStrokIcon color="#FFFFFF" size={20} />
                    </button>

                    <button
                        onClick={(e) => handleMirrorOptions(e)}
                        className={`text-[#FFFFFF] flex justify-center font-bold p-[8px] cursor-pointer rounded-[8px] border-[0px] ${
                            mirrorOptions ? 'bg-[#D3D3D3]/25' : 'bg-[#000000]'
                        }`}
                    >
                        <MirrorIcon color={'#FFFFFF'} size={20} />
                    </button>
                </div>
            )}

            {penActive && openColorOptions && (
                <div
                    onPointerUp={(e) => setStrokeColor(color.hex)}
                    className="absolute top-[72px] left-[72px] z-5 p-[0px] rounded-[12px] bg-[#000000] border-[0px]"
                >
                    <ColorPicker
                        color={color}
                        onChange={setColor}
                        onChangeComplete={(e) => setStrokeColor(color.hex)}
                        height={150}
                        hideInput={['rgb', 'hsv']}
                        hideAlpha={true}
                    />
                    <div className="items-center justify-between m-[12px]">
                        <div className="bg-[#000000] flex justify-around">
                            <button
                                onClick={(e) => setActiveMaterialType('flat')}
                                className=" text-[#FFFFFF] font-bold cursor-pointer"
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
                            <button
                                onClick={(e) => setActiveMaterialType('shaded')}
                                className=" text-[#FFFFFF] font-bold cursor-pointer"
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
                            <button
                                onClick={(e) => setActiveMaterialType('glow')}
                                className=" text-[#FFFFFF] font-bold cursor-pointer"
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
                        </div>
                    </div>
                </div>
            )}

            {penActive && openStrokeOptions && (
                <div className="absolute flex flex-col justify-items-center gap-[4px] top-[72px] left-[72px] z-5 p-[4px] rounded-[12px]  bg-[#000000]">
                    {/* <p className="text-left text-[12px] block funnel-sans-regular text-[#ffffff] mb-[8px]">
                        Stroke
                    </p> */}
                    <button
                        onClick={(e) => handleStroke('taper')}
                        className={` text-[#FFFFFF] font-bold p-[8px] cursor-pointer rounded-[8px] border-[0px] ${
                            strokeType === 'taper'
                                ? 'bg-[#D3D3D3]/25'
                                : 'bg-[#000000]'
                        }`}
                    >
                        <TaperStrokeIcon color={color.hex} size={20} />
                    </button>
                    <button
                        onClick={(e) => handleStroke('cube')}
                        className={` text-[#FFFFFF] font-bold p-[8px] cursor-pointer rounded-[8px] border-[0px] ${
                            strokeType === 'cube'
                                ? 'bg-[#D3D3D3]/25'
                                : 'bg-[#000000]'
                        }`}
                    >
                        <CubeStrokeIcon color={color.hex} size={20} />
                    </button>
                    <button
                        onClick={(e) => handleStroke('paint')}
                        className={` text-[#FFFFFF] font-bold p-[8px] cursor-pointer rounded-[8px] border-[0px] ${
                            strokeType === 'paint'
                                ? 'bg-[#D3D3D3]/25'
                                : 'bg-[#000000]'
                        }`}
                    >
                        <PaintStrokeIcon color={color.hex} size={20} />
                    </button>
                    <button
                        onClick={(e) => handleStroke('belt')}
                        className={` text-[#FFFFFF] font-bold p-[8px] cursor-pointer rounded-[8px] border-[0px] ${
                            strokeType === 'belt'
                                ? 'bg-[#D3D3D3]/25'
                                : 'bg-[#000000]'
                        }`}
                    >
                        <BeltStrokeIcon color={color.hex} size={20} />
                    </button>
                </div>
            )}

            {penActive && openDrawShapeOptions && (
                <div className="absolute flex flex-col justify-items-center gap-[4px] top-[72px] left-[72px] z-5 p-[4px] rounded-[12px]  bg-[#000000]">
                    <button
                        onClick={(e) => handleShape('free_hand')}
                        className={` text-[#FFFFFF] font-bold p-[8px] cursor-pointer rounded-[8px] border-[0px] ${
                            drawShape === 'free_hand'
                                ? 'bg-[#D3D3D3]/25'
                                : 'bg-[#000000]'
                        }`}
                    >
                        <FreeHandIcon color="#FFFFFF" size={20} />
                    </button>
                    <button
                        onClick={(e) => handleShape('straight')}
                        className={` text-[#FFFFFF] font-bold p-[8px] cursor-pointer rounded-[8px] border-[0px] ${
                            drawShape === 'straight'
                                ? 'bg-[#D3D3D3]/25'
                                : 'bg-[#000000]'
                        }`}
                    >
                        <StraightLineIcon color="#FFFFFF" size={20} />
                    </button>
                    <button
                        onClick={(e) => handleShape('circle')}
                        className={` text-[#FFFFFF] font-bold p-[8px] cursor-pointer rounded-[8px] border-[0px] ${
                            drawShape === 'circle'
                                ? 'bg-[#D3D3D3]/25'
                                : 'bg-[#000000]'
                        }`}
                    >
                        <CircleIcon color="#FFFFFF" size={20} />
                    </button>
                    <button
                        onClick={(e) => handleShape('square')}
                        className={` text-[#FFFFFF] font-bold p-[8px] cursor-pointer rounded-[8px] border-[0px] ${
                            drawShape === 'square'
                                ? 'bg-[#D3D3D3]/25'
                                : 'bg-[#000000]'
                        }`}
                    >
                        <SquareIcon color="#FFFFFF" size={20} />
                    </button>
                    <button
                        onClick={(e) => handleShape('arc')}
                        className={` text-[#FFFFFF] font-bold p-[8px] cursor-pointer rounded-[8px] border-[0px] ${
                            drawShape === 'arc'
                                ? 'bg-[#D3D3D3]/25'
                                : 'bg-[#000000]'
                        }`}
                    >
                        <ArcIcon color="#FFFFFF" size={20} />
                    </button>
                </div>
            )}

            {penActive && openOpacitySlider && (
                <div className="absolute w-[198px] top-[72px] left-[72px] z-5 p-[4px] justify-center rounded-[12px] bg-[#000000]">
                    {/* <p className="text-left text-[12px] block funnel-sans-regular text-[#ffffff] mb-[8px]">
                        OpacityIcon
                    </p> */}
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
                                    min={0.1}
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
                                className="text-[#FFFFFF] rounded-[8px] block w-[72px] text-[12px] px-[12px] py-[8px] focus:outline-0 funnel-sans-semibold"
                                value={strokeOpacity}
                                disabled={true}
                            />
                        </div>
                    </div>
                </div>
            )}

            {penActive && openWidthSlider && (
                <div className="absolute w-[198px] top-[72px] left-[72px] gap-[4px] z-5 p-[4px] justify-center rounded-[12px] bg-[#000000]  ">
                    {/* <p className="text-left text-[12px] block funnel-sans-regular text-[#ffffff] mb-[8px]">
                        Width
                    </p> */}
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
                                    min={0.01}
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
                                className="  text-[#FFFFFF] rounded-[8px] block w-[72px] text-[12px] px-[12px] py-[8px] focus:outline-0 funnel-sans-semibold"
                                value={strokeWidth}
                                disabled={true}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* {penActive && openStrokStabler && (
                <div className="absolute w-[198px] top-[72px] left-[72px] z-5 p-[4px] justify-center rounded-[8px]    ">

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
                                    step={0.01}
                                    value={strokeStablePercentage}
                                    min={0}
                                    max={1}
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
                                className="  text-[#FFFFFF] rounded-[8px] block w-[72px] text-[12px] px-[12px] py-[8px] focus:outline-0 funnel-sans-semibold"
                                value={strokeStablePercentage}
                                disabled={true}
                            />
                        </div>
                    </div>
                </div>
            )} */}

            {penActive && mirrorOptions && (
                <div className="absolute flex flex-col justify-items-center gap-[4px] top-[72px] left-[72px] z-5 p-[4px] rounded-[12px] bg-[#000000]">
                    <button
                        onClick={(e) => handleMirroring('X')}
                        className={`${
                            mirror.x ? 'bg-[#DE3163]/50' : 'bg-[#000000]'
                        }  text-[#FFFFFF] font-bold p-[8px] cursor-pointer rounded-[8px] border-[0px]`}
                    >
                        <MirrorIcon color="#DE3163" size={20} />
                    </button>
                    <button
                        onClick={(e) => handleMirroring('Y')}
                        className={`${
                            mirror.y ? 'bg-[#50C878]/50' : 'bg-[#000000]'
                        }  text-[#FFFFFF] font-bold p-[8px] cursor-pointer rounded-[8px] border-[0px]`}
                    >
                        <MirrorIcon color="#50C878" size={20} />
                    </button>
                    <button
                        onClick={(e) => handleMirroring('Z')}
                        className={`${
                            mirror.z ? 'bg-[#0096FF]/50' : 'bg-[#000000]'
                        }  text-[#FFFFFF] font-bold p-[8px] cursor-pointer rounded-[8px] border-[0px]`}
                    >
                        <MirrorIcon color="#0096FF" size={20} />
                    </button>
                </div>
            )}

            {(drawGuide || bendPlaneGuide) && (
                <div className="absolute top-[72px] left-[16px] z-5 p-[4px] flex flex-col justify-center rounded-[12px] bg-[#000000]">
                    <button
                        onClick={(e) => handleShapeOptions(e)}
                        className=" text-[#FFFFFF] font-bold p-[8px] cursor-pointer rounded-[8px]"
                    >
                        {drawShape === 'free_hand' && (
                            <FreeHandIcon color="#FFFFFF" size={20} />
                        )}
                        {drawShape === 'straight' && (
                            <StraightLineIcon color="#FFFFFF" size={20} />
                        )}
                        {drawShape === 'circle' && (
                            <CircleIcon color="#FFFFFF" size={20} />
                        )}
                        {drawShape === 'square' && (
                            <SquareIcon color="#FFFFFF" size={20} />
                        )}
                        {drawShape === 'arc' && (
                            <ArcIcon color="#FFFFFF" size={20} />
                        )}
                    </button>
                </div>
            )}

            {(drawGuide || bendPlaneGuide) && openDrawShapeOptions && (
                <div className="absolute flex flex-col justify-items-center gap-[4px] top-[72px] left-[72px] z-5 p-[4px] rounded-[12px]  bg-[#000000]">
                    <button
                        onClick={(e) => handleShape('free_hand')}
                        className=" text-[#FFFFFF] font-bold p-[8px] cursor-pointer rounded-[8px]"
                    >
                        <FreeHandIcon color="#FFFFFF" size={20} />
                    </button>
                    <button
                        onClick={(e) => handleShape('straight')}
                        className=" text-[#FFFFFF] font-bold p-[8px] cursor-pointer rounded-[8px]"
                    >
                        <StraightLineIcon color="#FFFFFF" size={20} />
                    </button>
                    <button
                        onClick={(e) => handleShape('circle')}
                        className=" text-[#FFFFFF] font-bold p-[8px] cursor-pointer rounded-[8px]"
                    >
                        <CircleIcon color="#FFFFFF" size={20} />
                    </button>
                    <button
                        onClick={(e) => handleShape('square')}
                        className=" text-[#FFFFFF] font-bold p-[8px] cursor-pointer rounded-[8px]"
                    >
                        <SquareIcon color="#FFFFFF" size={20} />
                    </button>
                    <button
                        onClick={(e) => handleShape('arc')}
                        className=" text-[#FFFFFF] font-bold p-[8px] cursor-pointer rounded-[8px]"
                    >
                        <ArcIcon color="#FFFFFF" size={20} />
                    </button>
                </div>
            )}

            {selectLines && (
                <div className="absolute top-[72px] left-[16px] z-5 p-[4px] flex flex-col justify-center rounded-[12px] bg-[#000000]">
                    <button
                        onClick={(e) => handleSelectedColorChange(e)}
                        className="text-[#FFFFFF] font-bold p-[8px] cursor-pointer rounded-[8px]"
                    >
                        <ColorSelectIcon
                            color={selectedLinesColor.hex}
                            size={20}
                        />
                    </button>

                    <button
                        onClick={(e) => setTransformMode('translate')}
                        className={`text-[#FFFFFF] flex justify-center font-bold p-[8px] cursor-pointer rounded-[8px] border-[0px] ${
                            transformMode === 'translate'
                                ? 'bg-[#D3D3D3]/25'
                                : 'bg-[#000000]'
                        }`}
                    >
                        <TranslateIcon color="#FFFFFF" size={20} />
                    </button>

                    <button
                        onClick={(e) => setTransformMode('rotate')}
                        className={`text-[#FFFFFF] flex justify-center font-bold p-[8px] cursor-pointer rounded-[8px] border-[0px] ${
                            transformMode === 'rotate'
                                ? 'bg-[#D3D3D3]/25'
                                : 'bg-[#000000]'
                        }`}
                    >
                        <RotateIcon color="#FFFFFF" size={20} />
                    </button>

                    <button
                        onClick={(e) => setTransformMode('scale')}
                        className={`text-[#FFFFFF] flex justify-center font-bold p-[8px] cursor-pointer rounded-[8px] border-[0px] ${
                            transformMode === 'scale'
                                ? 'bg-[#D3D3D3]/25'
                                : 'bg-[#000000]'
                        }`}
                    >
                        <ScaleIcon color="#FFFFFF" size={20} />
                    </button>

                    {axisMode === 'world' && (
                        <button
                            onClick={(e) => setAxisMode('local')}
                            className=" text-[#FFFFFF] font-bold p-[8px] cursor-pointer rounded-[8px]"
                        >
                            <GlobalModeIcon color="#FFFFFF" size={20} />
                        </button>
                    )}

                    {axisMode === 'local' && (
                        <button
                            onClick={(e) => setAxisMode('world')}
                            className=" text-[#FFFFFF] font-bold p-[8px] cursor-pointer rounded-[8px]"
                        >
                            <LocalModeIcon color="#FFFFFF" />
                        </button>
                    )}

                    <button
                        disabled={copy}
                        onClick={(e) => setCopy(!copy)}
                        className=" text-[#FFFFFF] font-bold p-[8px] cursor-pointer rounded-[8px]"
                    >
                        <CopyIcon color="#FFFFFF" size={20} />
                    </button>

                    <button
                        disabled={mergeGeometries}
                        onClick={(e) => setMergeGeometries(!mergeGeometries)}
                        className=" text-[#FFFFFF] font-bold p-[8px] cursor-pointer rounded-[8px]"
                    >
                        <LinkIcon color="#FFFFFF" size={20} />
                    </button>
                </div>
            )}

            {selectLines && openColorOptions && (
                <div
                    onChange={(e) => setLineColor(selectedLinesColor.hex)}
                    onPointerUp={(e) => setLineColor(selectedLinesColor.hex)}
                    className="funnel-sans-regular absolute top-[72px] left-[72px] z-5 p-[0px] rounded-[12px]"
                >
                    <ColorPicker
                        color={selectedLinesColor}
                        onChange={setSelectedLinesColor}
                        onChangeComplete={(e) =>
                            setLineColor(selectedLinesColor.hex)
                        }
                        height={150}
                        hideInput={['rgb', 'hsv']}
                        hideAlpha={true}
                    />
                </div>
            )}

            {sceneOptions && (
                <div className="absolute w-[240px] top-[72px] right-[16px] text-[#FFFFFF] z-5 p-[4px] rounded-[12px] bg-[#000000]">
                    <div className="flex justify-around mb-[8px]">
                        <div
                            onClick={(e) => handleSceneActiveOptions('groups')}
                            className={`${
                                groupOptions
                                    ? ' border-[#00A36C]'
                                    : ' border-[#121212]'
                            }    font-bold p-[8px] cursor-pointer border-b-[2px] rounded-t-[4px]`}
                        >
                            <GroupingIcon color="#FFFFFF" size={20} />
                        </div>

                        <div
                            onClick={(e) => handleSceneActiveOptions('render')}
                            className={`${
                                renderOptions
                                    ? 'border-[#00A36C]'
                                    : 'border-[#121212]'
                            }    font-bold p-[8px] cursor-pointer border-b-[2px] rounded-t-[4px]`}
                        >
                            <SceneOptionIcon color="#FFFFFF" size={20} />
                        </div>
                    </div>

                    {sceneOptions && groupOptions && (
                        <div className="flex justify-center mb-[8px]">
                            <div
                                onClick={(e) => handleGroupOperation('add')}
                                className="   font-bold p-[8px] cursor-pointer rounded-[8px]"
                            >
                                <AddIcon color="#FFFFFF" size={20} />
                            </div>
                            <div
                                onClick={(e) => handleGroupOperation('rename')}
                                className="   font-bold p-[8px] cursor-pointer rounded-[8px]"
                            >
                                <RenameIcon color="#FFFFFF" size={20} />
                            </div>
                            <div
                                onClick={(e) => handleGroupOperation('copy')}
                                className="   font-bold p-[8px] cursor-pointer rounded-[8px]"
                            >
                                <CopyIcon color="#FFFFFF" size={20} />
                            </div>
                            <div
                                onClick={(e) => handleGroupOperation('delete')}
                                className="   font-bold p-[8px] cursor-pointer rounded-[8px]"
                            >
                                <DeleteIcon color="#FF3131" size={20} />
                            </div>
                        </div>
                    )}

                    {sceneOptions && newGroupModal && <AddNewGroups />}
                    {sceneOptions && renameGroupModal && <RenameGroups />}
                    {sceneOptions && copyGroupModal && <CopyGroups />}
                    {sceneOptions && deleteGroupModal && <DeleteGroups />}

                    <div className="max-h-[200px] overflow-y-auto custom-scrollbar">
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
                                                    ? 'bg-[#00A36C]'
                                                    : 'bg-[#FFFFFF]'
                                            } flex cursor-pointer justify-between items-center rounded-[8px] px-[8px]`}
                                        >
                                            {/* <input
                                                type="checkbox"
                                                className="cursor-pointer"
                                                onClick={(e) =>
                                                    handleSelectGroup(e, data)
                                                }
                                            /> */}
                                            <label className="cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="peer sr-only"
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
                                                />
                                                <div
                                                    className={`w-[16px] h-[16px] rounded-[20px] bg-[#ffffff] border-[0px] border-blue-600 peer-checked:bg-blue-600 flex items-center justify-center`}
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
                                                {data.name}
                                            </div>

                                            {/* <div>
                                                <label
                                                    htmlFor="toggle"
                                                    className="flex items-center cursor-pointer"
                                                >
                                                    <div className="relative">
                                                        <input
                                                            type="checkbox"
                                                            id="toggle"
                                                            className="sr-only" // Visually hide the default checkbox
                                                            // checked={true}
                                                            // onChange
                                                        />
                                                        <div
                                                            className={`block w-14 h-8 rounded-full transition-colors duration-300 ${
                                                                true
                                                                    ? 'bg-blue-600'
                                                                    : 'bg-gray-300'
                                                            }`}
                                                        ></div>
                                                        <div
                                                            className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform duration-300 ${
                                                                true
                                                                    ? 'translate-x-full'
                                                                    : ''
                                                            }`}
                                                        ></div>
                                                    </div>
                                                    <span className="ml-3 text-gray-700">
                                                        {true ? 'On' : 'Off'}
                                                    </span>
                                                </label>
                                            </div> */}

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
                        <div className="funnel-sans-regular text-[#FFFFFF] z-5 items-center rounded-[8px] w-full bg-[#000000]">
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

                            <div className="m-[12px] flex items-center justify-between">
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

                            <div
                                onPointerUp={(e) =>
                                    setCanvasBackgroundColor(canvasColor.hex)
                                }
                                className="mt-[12px]"
                            >
                                <ColorPicker
                                    color={canvasColor}
                                    onChange={setCanvasColor}
                                    // onChangeComplete={(e) =>
                                    //     setCanvasBackgroundColor(
                                    //         canvasColor.hex
                                    //     )
                                    // }
                                    height={150}
                                    hideInput={['rgb', 'hsv']}
                                    hideAlpha={true}
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
