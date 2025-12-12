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
        set(() => ({
            activeTab: tab,
        })),

    setNewFolderModal: (bool) =>
        set(() => ({
            newFolderModal: bool,
        })),

    setNewNoteModal: (bool) =>
        set(() => ({
            newNoteModal: bool,
        })),

    setNewGroupModal: (bool) =>
        set(() => ({
            newGroupModal: bool,
        })),

    setRenameGroupModal: (bool) =>
        set(() => ({
            renameGroupModal: bool,
        })),

    setCopyGroupModal: (bool) =>
        set(() => ({
            copyGroupModal: bool,
        })),

    setDeleteGroupModal: (bool) =>
        set(() => ({
            deleteGroupModal: bool,
        })),

    setShowSettings: (bool) =>
        set(() => ({
            showSettings: bool,
        })),

    setIsHovered: (bool) =>
        set(() => ({
            isHovered: bool,
        })),

    setSession: (obj) =>
        set(() => ({
            session: obj,
        })),

    setLoading: (bool) =>
        set(() => ({
            loading: bool,
        })),

    setSortBy: (bool) =>
        set(() => ({
            sortBy: bool,
        })),
}))
