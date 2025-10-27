import { create } from 'zustand'

export const dashboardStore = create((set) => ({
    activeTab: 'Folders',
    newFolderModal: false,
    newNoteModal: false,
    newGroupModal: false,
    renameGroupModal: false,
    copyGroupModal: false,
    deleteGroupModal: false,

    showSettings: false,
    isHovered: true,
    session: null,
    loading: true,
    sortBy: 'Last Modified',

    setActiveTab: (tab) =>
        set((state) => ({
            activeTab: tab,
        })),

    setNewFolderModal: (bool) =>
        set((state) => ({
            newFolderModal: bool,
        })),

    setNewNoteModal: (bool) =>
        set((state) => ({
            newNoteModal: bool,
        })),

    setNewGroupModal: (bool) =>
        set((state) => ({
            newGroupModal: bool,
        })),

    setRenameGroupModal: (bool) =>
        set((state) => ({
            renameGroupModal: bool,
        })),

    setCopyGroupModal: (bool) =>
        set((state) => ({
            copyGroupModal: bool,
        })),

    setDeleteGroupModal: (bool) =>
        set((state) => ({
            deleteGroupModal: bool,
        })),

    setShowSettings: (bool) =>
        set((state) => ({
            showSettings: bool,
        })),

    setIsHovered: (bool) =>
        set((state) => ({
            isHovered: bool,
        })),

    setSession: (obj) =>
        set((state) => ({
            session: obj,
        })),

    setLoading: (bool) =>
        set((state) => ({
            loading: bool,
        })),

    setSortBy: (bool) =>
        set((state) => ({
            sortBy: bool,
        })),
}))
