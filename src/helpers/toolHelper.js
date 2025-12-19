import { canvasDrawStore } from '../hooks/useCanvasDrawStore'
import { dashboardStore } from '../hooks/useDashboardStore'

export function handleStroke(stroke, setStrokeType) {
    switch (stroke) {
        case 'taper':
            setStrokeType('taper')
            break
        case 'cube':
            setStrokeType('cube')
            break
        case 'tube':
            setStrokeType('tube')
            break
        case 'paint':
            setStrokeType('paint')
            break
        case 'belt':
            setStrokeType('belt')
            break
        default:
            setStrokeType('cube')
            break
    }
}

export function handleShape(shape, setDrawShapeType) {
    switch (shape) {
        case 'free_hand':
            setDrawShapeType('free_hand')
            break
        case 'straight':
            setDrawShapeType('straight')
            break
        case 'circle':
            setDrawShapeType('circle')
            break
        case 'arc':
            setDrawShapeType('arc')
            break
        default:
            break
    }
}

export function handleMirroring(axis, mirror, setMirror) {
    switch (axis) {
        case 'X':
            setMirror({ x: !mirror.x })
            break
        case 'Y':
            setMirror({ y: !mirror.y })
            break
        case 'Z':
            setMirror({ z: !mirror.z })
            break
        default:
            canvasDrawStore
                .getState()
                .setMirror({ x: false, y: false, z: false })
            break
    }
}

export function handleGroupOperation(operation) {
    const {
        setNewGroupModal,
        setCopyGroupModal,
        setRenameGroupModal,
        setDeleteGroupModal,
    } = dashboardStore((state) => state)

    switch (operation) {
        case 'add':
            setNewGroupModal(true)
            break
        case 'rename':
            setRenameGroupModal(true)
            break
        case 'copy':
            setCopyGroupModal(true)
            break
        case 'delete':
            setDeleteGroupModal(true)
            break
        default:
            break
    }
}
