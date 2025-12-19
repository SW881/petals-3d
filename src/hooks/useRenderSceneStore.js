import { create } from 'zustand'
import { v4 as uuid } from 'uuid'

export const canvasRenderStore = create((set, get) => ({
    activeScene: null,
    setActiveScene: (obj) =>
        set(() => ({
            activeScene: obj,
        })),

    lightIntensity: 0,
    setLightIntensity: (active) =>
        set(() => ({
            lightIntensity: active,
        })),

    intensityBackground: `10% 100%`,
    setIntensityBackground: (value) =>
        set(() => ({
            intensityBackground: value,
        })),

    postProcess: false,
    setPostProcess: (bool) =>
        set(() => ({
            postProcess: bool,
        })),

    sequentialLoading: false,
    setSequentialLoading: (bool) =>
        set(() => ({
            sequentialLoading: bool,
        })),

    canvasBackgroundColor: '#FFFFFF',
    setCanvasBackgroundColor: (color) =>
        set(() => ({
            canvasBackgroundColor: color,
        })),

    sceneOptions: false,
    setSceneOptions: (bool) =>
        set(() => ({
            sceneOptions: bool,
        })),

    groupOptions: false,
    setGroupOptions: (bool) =>
        set(() => ({
            groupOptions: bool,
        })),

    activeGroup: null,
    setActiveGroup: (value) =>
        set(() => ({
            activeGroup: value,
        })),

    groupData: [],

    selectedGroups: [],

    setGroupData: (data) =>
        set(() => ({
            groupData: data,
        })),

    addToSelectedGroup: (group) =>
        set((state) => ({
            selectedGroups: [...state.selectedGroups, group],
        })),

    removeFromSelectedGroup: (groupId) =>
        set((state) => ({
            selectedGroups: state.selectedGroups.filter(
                (item) => item.uuid !== groupId
            ),
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
                active: group.uuid === uuid,
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
            created_at: new Date().toISOString(),
            deleted_at: null,
            visible: g.visible,
            active: false,
            objects: g.objects,
        }))

        set({ groupData: [...groupData, ...newGroups] })
    },

    resetSelectedGroups: () => set({ selectedGroups: [] }),

    addNewGroup: (newGroup) =>
        set((state) => ({
            groupData: [...state.groupData, newGroup],
        })),

    deleteSelectedGroups: () => {
        const { selectedGroups, groupData } = get()

        const selectedIds = selectedGroups.map((g) => g.uuid)

        const updatedGroups = groupData.filter(
            (group) => !selectedIds.includes(group.uuid)
        )

        set({ groupData: updatedGroups })
    },

    sortGroupsByName: () =>
        set((state) => {
            const sorted = [...state.groupData].sort(
                (a, b) =>
                    new Date(a.created_at).getTime() -
                    new Date(b.created_at).getTime()
            )
            return { groupData: sorted }
        }),

    copyGroups: false,
    setCopyGroups: (bool) =>
        set(() => ({
            copyGroups: bool,
        })),

    renderMode: false,
    setRenderMode: (bool) =>
        set(() => ({
            renderOptions: bool,
        })),

    renderOptions: false,
    setRenderOptions: (bool) =>
        set(() => ({
            renderOptions: bool,
        })),

    dprValue: 1,
    setDprValue: (value) =>
        set(() => ({
            dprValue: value,
        })),
}))
