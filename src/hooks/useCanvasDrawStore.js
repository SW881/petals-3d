import { create } from 'zustand'
import { v4 as uuid } from 'uuid'

export const canvasDrawStore = create((set, get) => ({
    notesData: [],
    setNotesData: (obj) =>
        set((state) => ({
            notesData: obj,
        })),

    penActive: false,
    setPenActive: (active) =>
        set((state) => ({
            penActive: active,
        })),

    activeMaterialType: 'flat',
    setActiveMaterialType: (type) =>
        set((state) => ({
            activeMaterialType: type,
        })),

    strokeColor: '#000000',
    setStrokeColor: (color) =>
        set((state) => ({
            strokeColor: color,
        })),

    strokeType: 'cube',
    setStrokeType: (style) =>
        set((state) => ({
            strokeType: style,
        })),

    drawShapeType: 'free_hand',
    setDrawShapeType: (style) =>
        set((state) => ({
            drawShapeType: style,
        })),

    openOpacitySlider: false,
    setOpenOpacitySlider: (bool) =>
        set((state) => ({
            openOpacitySlider: bool,
        })),

    openWidthSlider: false,
    setOpenWidthSlider: (bool) =>
        set((state) => ({
            openWidthSlider: bool,
        })),

    openStrokeStabler: false,
    setOpenStrokeStabler: (bool) =>
        set((state) => ({
            openStrokeStabler: bool,
        })),

    pressureMode: false,
    setPressureMode: (bool) =>
        set((state) => ({
            pressureMode: bool,
        })),

    mirrorOptions: false,
    setMirrorOptions: (bool) =>
        set((state) => ({
            mirrorOptions: bool,
        })),

    openDrawShapeOptions: false,
    setOpenDrawShapeOptions: (bool) =>
        set((state) => ({
            openDrawShapeOptions: bool,
        })),

    mirror: { x: false, y: false, z: false },
    setMirror: (value) =>
        set((state) => ({
            mirror: {
                ...state.mirror,
                ...value,
            },
        })),

    openColorOptions: false,
    setOpenColorOptions: (bool) =>
        set((state) => ({
            openColorOptions: bool,
        })),

    openStrokeOptions: false,
    setOpenStrokeOptions: (bool) =>
        set((state) => ({
            openStrokeOptions: bool,
        })),

    drawGuideShapeOptions: false,
    setDrawGuideShapeOptions: (bool) =>
        set((state) => ({
            drawGuideShapeOptions: bool,
        })),

    widthBackground: `4.8% 100%`,
    stableBackground: `50% 100%`,
    opacityBackground: `100% 100%`,

    setWidthBackground: (value) =>
        set((state) => ({
            widthBackground: value,
        })),
    setStableBackground: (value) =>
        set((state) => ({
            stableBackground: value,
        })),
    setOpacityBackground: (value) =>
        set((state) => ({
            opacityBackground: value,
        })),

    strokeWidth: 0.25,
    strokeOpacity: 1,
    strokeStablePercentage: 50,
    setStrokeWidth: (width) =>
        set((state) => ({
            strokeWidth: width,
        })),
    setStrokeOpacity: (opacity) =>
        set((state) => ({
            strokeOpacity: opacity,
        })),

    setStrokeStablePercentage: (value) =>
        set((state) => ({
            strokeStablePercentage: value,
        })),

    eraserActive: false,
    setEraserActive: (active) =>
        set((state) => ({
            eraserActive: active,
        })),

    selectLines: false,
    setSelectLines: (select) =>
        set((state) => ({
            selectLines: select,
        })),

    selectGuide: false,
    setSelectGuide: (select) =>
        set((state) => ({
            selectGuide: select,
        })),

    copy: false,
    setCopy: (bool) =>
        set((state) => ({
            copy: bool,
        })),

    mergeGeometries: false,
    setMergeGeometries: (bool) =>
        set((state) => ({
            mergeGeometries: bool,
        })),

    drawGuide: false,
    setDrawGuide: (draw) =>
        set((state) => ({
            drawGuide: draw,
        })),

    bendPlaneGuide: false,
    ogGuidePoints: null,
    ogGuideNormals: null,

    transformMode: 'translate',
    setTransformMode: (mode) =>
        set((state) => ({
            transformMode: mode,
        })),

    axisMode: 'local',
    setAxisMode: (mode) =>
        set((state) => ({
            axisMode: mode,
        })),

    lineColor: '#15cf6c',
    setLineColor: (color) =>
        set((state) => ({
            lineColor: color,
        })),

    dynamicDrawingPlaneMesh: null,
    setDynamicDrawingPlaneMesh: (mesh) =>
        set((state) => ({
            dynamicDrawingPlaneMesh: mesh,
        })),

    bendPlaneGuide: false,
    setBendPlaneGuide: (bool) =>
        set((state) => ({
            bendPlaneGuide: bool,
        })),

    ogGuidePoints: null,
    setOgGuidePoints: (data) =>
        set((state) => ({
            ogGuidePoints: data,
        })),

    ogGuideNormals: null,
    setOgGuideNormals: (data) =>
        set((state) => ({
            ogGuideNormals: data,
        })),

    eraseGuide: false,
    setEraseGuide: (bool) =>
        set((state) => ({
            eraseGuide: bool,
        })),
}))
