import { create } from 'zustand'
import { v4 as uuid } from 'uuid'

export const canvasDrawStore = create((set, get) => ({
    notesData: [],
    setNotesData: (obj) =>
        set((state) => ({
            notesData: obj,
        })),

    plane: null,
    setPlane: (p) => set({ plane: p }),

    penActive: false,
    setPenActive: (active) =>
        set((state) => ({
            penActive: active,
        })),

    activeMaterialType: 'shaded',
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
    tensionBackground: `50% 100%`,
    ployBackground: `50% 100%`,
    waistBackground: `50% 100%`,
    radialBackground: `50% 100%`,

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
    setTensionBackground: (value) =>
        set((state) => ({
            tensionBackground: value,
        })),
    setWaistBackground: (value) =>
        set((state) => ({
            waistBackground: value,
        })),
    setRadialBackground: (value) =>
        set((state) => ({
            radialBackground: value,
        })),
    setPolyBackground: (value) =>
        set((state) => ({
            ployBackground: value,
        })),

    strokeWidth: 0.1,
    strokeOpacity: 1,
    strokeStablePercentage: 50,
    tensionPercentage: 50,
    polyCountPercentage: 1,
    radialPercentage: 50,
    waistPercentage: 50,

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

    setTensionPercentage: (value) =>
        set((state) => ({
            tensionPercentage: value,
        })),

    setRadialPercentage: (value) =>
        set((state) => ({
            radialPercentage: value,
        })),

    setWaistPercentage: (value) =>
        set((state) => ({
            waistPercentage: value,
        })),

    setPolyCountPercentage: (value) =>
        set((state) => ({
            polyCountPercentage: value,
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

    loftGuidePlane: false,
    setLoftGuidePlane: (bool) =>
        set((state) => ({
            loftGuidePlane: bool,
        })),

    highlighted: [],
    setHighlighted: (data) =>
        set((state) => ({
            highlighted: data,
        })),
    addToHighlighted: (mesh) =>
        set((state) => ({
            highlighted: [...state.highlighted, mesh], // Add new product to the selectedGroups array
        })),

    generateLoftSurface: false,
    setGenerateLoftSurface: (bool) =>
        set((state) => ({
            generateLoftSurface: bool,
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
