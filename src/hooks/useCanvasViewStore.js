import { create } from 'zustand'

export const canvasViewStore = create((set) => ({
    orbitalLock: false,
    setOrbitalLock: (orbitalLockState) =>
        set(() => ({
            orbitalLock: orbitalLockState,
        })),

    cameraFov: 30,
    setCameraFov: (value) =>
        set(() => ({
            cameraFov: value,
        })),

    showFovSlider: false,
    setShowFovSlider: (bool) =>
        set(() => ({
            showFovSlider: bool,
        })),

    isOrthographic: false,
    setIsOrthographic: (bool) =>
        set(() => ({
            isOrthographic: bool,
        })),

    showGridOptions: false,
    setShowGridOptions: (bool) =>
        set(() => ({
            showGridOptions: bool,
        })),

    fullScreen: false,
    setFullScreen: (bool) =>
        set(() => ({
            fullScreen: bool,
        })),

    gridPlaneX: true,
    gridPlaneY: false,
    gridPlaneZ: false,
    setGridPlaneX: (show) =>
        set(() => ({
            gridPlaneX: show,
        })),

    setGridPlaneY: (show) =>
        set(() => ({
            gridPlaneY: show,
        })),

    setGridPlaneZ: (show) =>
        set(() => ({
            gridPlaneZ: show,
        })),

    fovBackground: `30% 100%`,
    setFovBackground: (value) =>
        set(() => ({
            fovBackground: value,
        })),
}))
