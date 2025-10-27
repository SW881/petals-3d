import { create } from 'zustand'

export const canvasViewStore = create((set) => ({
    orbitalLock: false,
    setOrbitalLock: (orbitalLockState) =>
        set((state) => ({
            orbitalLock: orbitalLockState,
        })),

    cameraFov: 30,
    setCameraFov: (value) =>
        set((state) => ({
            cameraFov: value,
        })),

    showFovSlider: false,
    setShowFovSlider: (bool) =>
        set((state) => ({
            showFovSlider: bool,
        })),

    isOrthographic: false,
    setIsOrthographic: (bool) =>
        set((state) => ({
            isOrthographic: bool,
        })),

    showGridOptions: false,
    setShowGridOptions: (bool) =>
        set((state) => ({
            showGridOptions: bool,
        })),

    gridPlaneX: true,
    gridPlaneY: false,
    gridPlaneZ: false,
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

    fovBackground: `30% 100%`,
    setFovBackground: (value) =>
        set((state) => ({
            fovBackground: value,
        })),
}))
