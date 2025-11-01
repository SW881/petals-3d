import { create } from 'zustand'
import { v4 as uuid } from 'uuid'

export const drawStore = create((set, get) => ({
    penActive: false,
    eraserActive: false,
    strokeColor: '#15cf6c',
    straightHandStroke: false,
    strokeTapperd: false,
    strokeType: 'cube',
    drawShapeType: 'free_hand',
    axisHelper: false,
    gridPlaneX: true,
    gridPlaneY: false,
    gridPlaneZ: false,
    selectLines: false,
    drawGuide: false,
    freeHandGuide: false,
    guidePlaneOpacity: 0.25,
    transformMode: 'translate',
    axisMode: 'local',
    historyIndex: 0,
    sceneHistory: [[]],
    openColorOptions: false,
    openStrokeOptions: false,
    dynamicDrawingPlaneMesh: null,
    transforming: false,
    notesData: [],
    dCalls: 0,
    activeScene: null,
    openOpacitySlider: false,
    openWidthSlider: false,
    openStrokeStabler: false,
    pressureMode: false,
    mirrorOptions: false,
    openDrawShapeOptions: false,
    drawGuideShapeOptions: false,

    canvasBackgroundColor: '#FFFFFF',

    widthBackground: `50% 100%`,
    stableBackground: `25% 100%`,
    opacityBackground: `100% 100%`,
    fovBackground: `30% 100%`,

    strokeWidth: 0.5,
    strokeOpacity: 1,
    strokeStablePercentage: 2.5,

    sceneOptions: false,
    groupOptions: false,
    guideOptions: false,

    lightIntensity: 0,
    intensityBackground: `10% 100%`,

    allowUndo: false,
    allowRedo: false,
    numberOfUndos: 0,

    // Copying
    copy: false,
    copyGroups: false,

    mergeGeometries: false,

    // Canvasfov
    cameraFov: 30,

    groupData: [],

    selectedGroups: [],
    activeGroup: null,

    showGridOptions: false,

    linkObjects: false,

    lineColor: '#15cf6c',

    mirror: { x: false, y: false, z: false },
    postProcess: false,
    activeMaterialType: 'flat',
    sequentialLoading: false,

    bendPlaneGuide: false,
    ogGuidePoints: null,
    ogGuideNormals: null,

    eraseGuide: false,

    setOgGuidePoints: (data) =>
        set((state) => ({
            ogGuidePoints: data,
        })),

    setOgGuideNormals: (data) =>
        set((state) => ({
            ogGuideNormals: data,
        })),

    setBendPlaneGuide: (bool) =>
        set((state) => ({
            bendPlaneGuide: bool,
        })),

    setEraseGuide: (bool) =>
        set((state) => ({
            eraseGuide: bool,
        })),

    setSequentialLoading: (bool) =>
        set((state) => ({
            sequentialLoading: bool,
        })),

    setActiveMaterialType: (type) =>
        set((state) => ({
            activeMaterialType: type,
        })),

    setPostProcess: (bool) =>
        set((state) => ({
            postProcess: bool,
        })),

    setMirror: (value) =>
        set((state) => ({
            mirror: {
                ...state.mirror,
                ...value,
            },
        })),

    setMirrorOptions: (bool) =>
        set((state) => ({
            mirrorOptions: bool,
        })),

    setPressureMode: (bool) =>
        set((state) => ({
            pressureMode: bool,
        })),

    setDrawGuideShapeOptions: (bool) =>
        set((state) => ({
            drawGuideShapeOptions: bool,
        })),

    setPenActive: (active) =>
        set((state) => ({
            penActive: active,
        })),

    setEraserActive: (active) =>
        set((state) => ({
            eraserActive: active,
        })),

    setStrokeColor: (color) =>
        set((state) => ({
            strokeColor: color,
        })),

    setStrokeWidth: (width) =>
        set((state) => ({
            strokeWidth: width,
        })),

    setFreeHandStroke: (bool) =>
        set((state) => ({
            straightHandStroke: bool,
        })),

    setStrokeTapperd: (style) =>
        set((state) => ({
            strokeTapperd: style,
        })),

    setStrokeType: (style) =>
        set((state) => ({
            strokeType: style,
        })),

    setDrawShapeType: (style) =>
        set((state) => ({
            drawShapeType: style,
        })),

    setAxisHelper: (show) =>
        set((state) => ({
            axisHelper: show,
        })),

    setGridPlaneX: (show) =>
        set((state) => ({
            gridPlaneX: show,
        })),

    setGridPlaneY: (show) =>
        set((state) => ({
            gridPlaneY: show,
        })),

    setGridPlaneZ: (show) =>
        set((state) => ({
            gridPlaneZ: show,
        })),

    setSelectLines: (select) =>
        set((state) => ({
            selectLines: select,
        })),

    setDrawGuide: (draw) =>
        set((state) => ({
            drawGuide: draw,
        })),

    setFreeHandGuide: (active) =>
        set((state) => ({
            freeHandGuide: active,
        })),

    setGuidePlaneOpacity: (opacity) =>
        set((state) => ({
            guidePlaneOpacity: opacity,
        })),

    setTransformMode: (mode) =>
        set((state) => ({
            transformMode: mode,
        })),

    setAxisMode: (mode) =>
        set((state) => ({
            axisMode: mode,
        })),

    setHistoryIndex: (index) =>
        set((state) => ({
            historyIndex: index,
        })),

    setStrokeOpacity: (opacity) =>
        set((state) => ({
            strokeOpacity: opacity,
        })),

    setSceneHistory: (history) =>
        set((state) => ({
            sceneHistory: history,
        })),

    setOpenColorOptions: (bool) =>
        set((state) => ({
            openColorOptions: bool,
        })),

    setOpenStrokeOptions: (bool) =>
        set((state) => ({
            openStrokeOptions: bool,
        })),

    setOpenDrawShapeOptions: (bool) =>
        set((state) => ({
            openDrawShapeOptions: bool,
        })),

    setDynamicDrawingPlaneMesh: (mesh) =>
        set((state) => ({
            dynamicDrawingPlaneMesh: mesh,
        })),

    setTransforming: (bool) =>
        set((state) => ({
            transforming: bool,
        })),

    setNotesData: (obj) =>
        set((state) => ({
            notesData: obj,
        })),

    setDCalls: (number) =>
        set((state) => ({
            dCalls: number,
        })),

    setActiveScene: (obj) =>
        set((state) => ({
            activeScene: obj,
        })),

    setOpenOpacitySlider: (bool) =>
        set((state) => ({
            openOpacitySlider: bool,
        })),

    setOpenWidthSlider: (bool) =>
        set((state) => ({
            openWidthSlider: bool,
        })),

    setOpacityBackground: (value) =>
        set((state) => ({
            opacityBackground: value,
        })),

    setWidthBackground: (value) =>
        set((state) => ({
            widthBackground: value,
        })),

    setStrokeStablePercentage: (value) =>
        set((state) => ({
            strokeStablePercentage: value,
        })),

    setOpenStrokeStabler: (bool) =>
        set((state) => ({
            openStrokeStabler: bool,
        })),

    setStableBackground: (value) =>
        set((state) => ({
            stableBackground: value,
        })),

    setSceneOptions: (bool) =>
        set((state) => ({
            sceneOptions: bool,
        })),

    setGroupOptions: (bool) =>
        set((state) => ({
            groupOptions: bool,
        })),

    setGuideOptions: (bool) =>
        set((state) => ({
            guideOptions: bool,
        })),

    setLightIntensity: (active) =>
        set((state) => ({
            lightIntensity: active,
        })),

    setIntensityBackground: (value) =>
        set((state) => ({
            intensityBackground: value,
        })),

    addToSelectedGroup: (group) =>
        set((state) => ({
            selectedGroups: [...state.selectedGroups, group], // Add new product to the selectedGroups array
        })),

    removeFromSelectedGroup: (groupId) =>
        set((state) => ({
            selectedGroups: state.selectedGroups.filter(
                (item) => item.uuid !== groupId
            ), // Filter out the removed item
        })),

    setActiveGroup: (value) =>
        set((state) => ({
            activeGroup: value,
        })),

    updateVisibleGroupProduct: (uuid, visiblity) =>
        set((state) => ({
            groupData: state.groupData.map((group) =>
                group.uuid === uuid ? { ...group, visible: visiblity } : group
            ),
        })),

    updateActiveGroupProduct: (uuid) =>
        set((state) => ({
            groupData: state.groupData.map((group) => ({
                ...group,
                active: group.uuid === uuid, // true if matched, false otherwise
            })),
        })),

    updateGroupNamesFromSelected: (name) =>
        set((state) => {
            const updatedGroupData = state.groupData.map((group) => {
                const match = state.selectedGroups.find(
                    (sel) => sel.uuid === group.uuid
                )
                return match ? { ...group, name: name } : group
            })

            return {
                groupData: updatedGroupData,
            }
        }),

    copySelectedGroups: () => {
        const { selectedGroups, groupData } = get()

        const newGroups = selectedGroups.map((g) => ({
            uuid: uuid(),
            name: g.name + '_copy',
            note_id: g.note_id,
            created_at: new Date().toISOString(),
            deleted_at: null,
            created_by: g.created_by,
            visible: g.visible,
            active: false,
        }))

        set({ groupData: [...groupData, ...newGroups] })
    },

    resetSelectedGroups: () => set({ selectedGroups: [] }),

    addNewGroup: (newGroup) =>
        set((state) => ({
            groupData: [...state.groupData, newGroup],
        })),

    sortGroupsByName: () =>
        set((state) => {
            const sorted = [...state.groupData].sort(
                (a, b) =>
                    new Date(a.created_at).getTime() -
                    new Date(b.created_at).getTime()
            )
            return { groupData: sorted }
        }),

    setAllowUndo: (bool) =>
        set((state) => ({
            allowUndo: bool,
        })),

    setAllowRedo: (bool) =>
        set((state) => ({
            allowRedo: bool,
        })),

    setNumberOfUndos: (value) =>
        set((state) => ({
            numberOfUndos: value,
        })),

    setCopy: (bool) =>
        set((state) => ({
            copy: bool,
        })),

    setMergeGeometries: (bool) =>
        set((state) => ({
            mergeGeometries: bool,
        })),

    setCopyGroups: (bool) =>
        set((state) => ({
            copyGroups: bool,
        })),

    setCameraFov: (value) =>
        set((state) => ({
            cameraFov: value,
        })),

    setFovBackground: (value) =>
        set((state) => ({
            fovBackground: value,
        })),

    setShowGridOptions: (bool) =>
        set((state) => ({
            showGridOptions: bool,
        })),

    setCanvasBackgroundColor: (color) =>
        set((state) => ({
            canvasBackgroundColor: color,
        })),

    setLinkObjects: (link) =>
        set((state) => ({
            linkObjects: link,
        })),
}))
