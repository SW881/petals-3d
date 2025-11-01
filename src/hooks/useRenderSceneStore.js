import { create } from 'zustand'
import { v4 as uuid } from 'uuid'

export const canvasRenderStore = create((set, get) => ({
    activeScene: null,
    setActiveScene: (obj) =>
        set((state) => ({
            activeScene: obj,
        })),

    lightIntensity: 0,
    setLightIntensity: (active) =>
        set((state) => ({
            lightIntensity: active,
        })),

    intensityBackground: `10% 100%`,
    setIntensityBackground: (value) =>
        set((state) => ({
            intensityBackground: value,
        })),

    postProcess: false,
    setPostProcess: (bool) =>
        set((state) => ({
            postProcess: bool,
        })),

    sequentialLoading: false,
    setSequentialLoading: (bool) =>
        set((state) => ({
            sequentialLoading: bool,
        })),

    canvasBackgroundColor: '#ffffff',
    setCanvasBackgroundColor: (color) =>
        set((state) => ({
            canvasBackgroundColor: color,
        })),

    sceneOptions: false,
    setSceneOptions: (bool) =>
        set((state) => ({
            sceneOptions: bool,
        })),

    // ---- Group Actions ----
    groupOptions: false,
    setGroupOptions: (bool) =>
        set((state) => ({
            groupOptions: bool,
        })),

    activeGroup: null,
    setActiveGroup: (value) =>
        set((state) => ({
            activeGroup: value,
        })),

    groupData: [],

    selectedGroups: [],

    setGroupData: (data) =>
        set((state) => ({
            groupData: data,
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

    deleteSelectedGroups: (groupIds) =>
        set((state) => ({
            groupData: state.groupData.filter(
                (group) => !groupIds.includes(group.uuid)
            ),
            selectedGroups: state.selectedGroups.filter(
                (group) => !groupIds.includes(group.uuid)
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
            note_id: 1,
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

    deleteSelectedGroups: () => {
        const { selectedGroups, groupData } = get()

        // Extract UUIDs from selected groups
        const selectedIds = selectedGroups.map((g) => g.uuid)

        // Filter out any group whose UUID matches a selected one
        const updatedGroups = groupData.filter(
            (group) => !selectedIds.includes(group.uuid)
        )

        // Update store: remove from both groupData and selectedGroups
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
        set((state) => ({
            copyGroups: bool,
        })),

    // ---- Group Actions ----

    renderMode: false,
    setRenderMode: (bool) =>
        set((state) => ({
            renderOptions: bool,
        })),

    renderOptions: false,
    setRenderOptions: (bool) =>
        set((state) => ({
            renderOptions: bool,
        })),

    dprValue: 1,
    setDprValue: (value) =>
        set((state) => ({
            dprValue: value,
        })),
}))
