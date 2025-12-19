import { create } from 'zustand'

export const canvasDrawStore = create((set) => ({
    pointerType: 'mouse',
    setPointerType: (value) =>
        set(() => ({
            pointerType: value,
        })),

    notesData: [],
    setNotesData: (obj) =>
        set(() => ({
            notesData: obj,
        })),

    plane: null,
    setPlane: (p) => set({ plane: p }),

    penActive: false,
    setPenActive: (active) =>
        set(() => ({
            penActive: active,
        })),

    activeMaterialType: 'flat',
    setActiveMaterialType: (type) =>
        set(() => ({
            activeMaterialType: type,
        })),

    strokeColor: '#8F8F8F',
    setStrokeColor: (color) =>
        set(() => ({
            strokeColor: color,
        })),

    strokeType: 'cube',
    setStrokeType: (style) =>
        set(() => ({
            strokeType: style,
        })),

    drawShapeType: 'free_hand',
    setDrawShapeType: (style) =>
        set(() => ({
            drawShapeType: style,
        })),

    openOpacitySlider: false,
    setOpenOpacitySlider: (bool) =>
        set(() => ({
            openOpacitySlider: bool,
        })),

    openWidthSlider: false,
    setOpenWidthSlider: (bool) =>
        set(() => ({
            openWidthSlider: bool,
        })),

    openStrokeStabler: false,
    setOpenStrokeStabler: (bool) =>
        set(() => ({
            openStrokeStabler: bool,
        })),

    pressureMode: false,
    setPressureMode: (bool) =>
        set(() => ({
            pressureMode: bool,
        })),

    mirrorOptions: false,
    setMirrorOptions: (bool) =>
        set(() => ({
            mirrorOptions: bool,
        })),

    openDrawShapeOptions: false,
    setOpenDrawShapeOptions: (bool) =>
        set(() => ({
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
        set(() => ({
            openColorOptions: bool,
        })),

    openStrokeOptions: false,
    setOpenStrokeOptions: (bool) =>
        set(() => ({
            openStrokeOptions: bool,
        })),

    drawGuideShapeOptions: false,
    setDrawGuideShapeOptions: (bool) =>
        set(() => ({
            drawGuideShapeOptions: bool,
        })),

    widthBackground: `4.8% 100%`,
    stableBackground: `30% 100%`,
    opacityBackground: `100% 100%`,
    tensionBackground: `50% 100%`,
    ployBackground: `1% 100%`,
    waistBackground: `50% 100%`,
    radialBackground: `50% 100%`,

    setWidthBackground: (value) =>
        set(() => ({
            widthBackground: value,
        })),
    setStableBackground: (value) =>
        set(() => ({
            stableBackground: value,
        })),
    setOpacityBackground: (value) =>
        set(() => ({
            opacityBackground: value,
        })),
    setTensionBackground: (value) =>
        set(() => ({
            tensionBackground: value,
        })),
    setWaistBackground: (value) =>
        set(() => ({
            waistBackground: value,
        })),
    setRadialBackground: (value) =>
        set(() => ({
            radialBackground: value,
        })),
    setPolyBackground: (value) =>
        set(() => ({
            ployBackground: value,
        })),

    strokeWidth: 0.1,
    strokeOpacity: 1,
    strokeStablePercentage: 30,
    tensionPercentage: 50,
    polyCountPercentage: 1,
    radialPercentage: 50,
    waistPercentage: 50,

    setStrokeWidth: (width) =>
        set(() => ({
            strokeWidth: width,
        })),
    setStrokeOpacity: (opacity) =>
        set(() => ({
            strokeOpacity: opacity,
        })),

    setStrokeStablePercentage: (value) =>
        set(() => ({
            strokeStablePercentage: value,
        })),

    setTensionPercentage: (value) =>
        set(() => ({
            tensionPercentage: value,
        })),

    setRadialPercentage: (value) =>
        set(() => ({
            radialPercentage: value,
        })),

    setWaistPercentage: (value) =>
        set(() => ({
            waistPercentage: value,
        })),

    setPolyCountPercentage: (value) =>
        set(() => ({
            polyCountPercentage: value,
        })),

    eraserActive: false,
    setEraserActive: (active) =>
        set(() => ({
            eraserActive: active,
        })),

    selectLines: false,
    setSelectLines: (select) =>
        set(() => ({
            selectLines: select,
        })),

    selectGuide: false,
    setSelectGuide: (select) =>
        set(() => ({
            selectGuide: select,
        })),

    copy: false,
    setCopy: (bool) =>
        set(() => ({
            copy: bool,
        })),

    mergeGeometries: false,
    setMergeGeometries: (bool) =>
        set(() => ({
            mergeGeometries: bool,
        })),

    drawGuide: false,
    setDrawGuide: (draw) =>
        set(() => ({
            drawGuide: draw,
        })),

    transformMode: 'translate',
    setTransformMode: (mode) =>
        set(() => ({
            transformMode: mode,
        })),

    axisMode: 'local',
    setAxisMode: (mode) =>
        set(() => ({
            axisMode: mode,
        })),

    lineColor: '#8F8F8F',
    setLineColor: (color) =>
        set(() => ({
            lineColor: color,
        })),

    dynamicDrawingPlaneMesh: null,
    setDynamicDrawingPlaneMesh: (mesh) =>
        set(() => ({
            dynamicDrawingPlaneMesh: mesh,
        })),

    bendPlaneGuide: false,
    setBendPlaneGuide: (bool) =>
        set(() => ({
            bendPlaneGuide: bool,
        })),

    loftGuidePlane: false,
    setLoftGuidePlane: (bool) =>
        set(() => ({
            loftGuidePlane: bool,
        })),

    highlighted: [],
    setHighlighted: (data) =>
        set(() => ({
            highlighted: data,
        })),
    addToHighlighted: (mesh) =>
        set((state) => ({
            highlighted: [...state.highlighted, mesh],
        })),

    generateLoftSurface: false,
    setGenerateLoftSurface: (bool) =>
        set(() => ({
            generateLoftSurface: bool,
        })),

    ogGuidePoints: null,
    setOgGuidePoints: (data) =>
        set(() => ({
            ogGuidePoints: data,
        })),

    ogGuideNormals: null,
    setOgGuideNormals: (data) =>
        set(() => ({
            ogGuideNormals: data,
        })),

    eraseGuide: false,
    setEraseGuide: (bool) =>
        set(() => ({
            eraseGuide: bool,
        })),
}))
