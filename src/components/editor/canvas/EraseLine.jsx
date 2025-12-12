import React, { useRef, useState, useEffect, useCallback } from 'react'
import { useFrame, useThree } from '@react-three/fiber'

import { saveGroupToIndexDB } from '../../../db/storage'
import { eraseLineType } from '../../../config/objectsConfig'
import { canvasDrawStore } from '../../../hooks/useCanvasDrawStore'
import { canvasRenderStore } from '../../../hooks/useRenderSceneStore'

const EraseLine = () => {
    const { camera, mouse, raycaster, scene } = useThree()
    const { activeGroup, groupData, setGroupData } = canvasRenderStore(
        (state) => state
    )
    const { eraserActive, pointerType } = canvasDrawStore((state) => state)

    const highlighted = useRef(new Set())
    const [dragging, setDragging] = useState(false)

    const resetHighlight = useCallback(() => {
        highlighted.current.forEach((obj) => {
            if (obj.material?.transparent !== undefined) {
                obj.material.opacity = 1
            }
        })
        highlighted.current.clear()
    }, [])

    const eraseObjects = useCallback(async () => {
        console.log('Erasing objects')
        highlighted.current.forEach((obj) => {
            if (!obj.parent) return

            obj.visible = false
            obj.userData.is_deleted = true

            activeGroup.objects.filter((item) => item.uuid !== obj.uuid)
        })

        // if (highlighted.current.size >= 1) {
        //     console.log('Saving data in db after removing : ')

        //     setGroupData([...canvasRenderStore.getState().groupData])
        //     await saveGroupToIndexDB(canvasRenderStore.getState().groupData)
        // }

        highlighted.current.clear()
    }, [setGroupData])

    useEffect(() => {
        const onPointerDown = (event) => {
            if (event.pointerType === pointerType) {
                if (eraserActive) {
                    resetHighlight()
                    setDragging(true)
                }
            }
        }

        const onPointerUp = () => {
            if (eraserActive) {
                setDragging(false)
                eraseObjects()
            }
        }

        window.addEventListener('pointerdown', onPointerDown)
        window.addEventListener('pointerup', onPointerUp)

        return () => {
            window.removeEventListener('pointerdown', onPointerDown)
            window.removeEventListener('pointerup', onPointerUp)
        }
    }, [resetHighlight, eraseObjects, eraserActive])

    useFrame(() => {
        if (!dragging) return

        raycaster.setFromCamera(mouse, camera)
        const objectsToCheck = scene.children.filter(
            (obj) =>
                obj.isMesh &&
                !obj.userData.is_deleted &&
                eraseLineType.includes(obj.userData?.type) &&
                obj.userData?.group_id === activeGroup.uuid
        )

        const intersects = raycaster.intersectObjects(objectsToCheck, true)

        if (
            intersects.length > 0 &&
            intersects[0]?.object &&
            !highlighted.current.has(intersects[0].object)
        ) {
            const obj = intersects[0].object
            highlighted.current.add(obj)

            if (obj.material) {
                obj.material.transparent = true
                obj.material.opacity = 0.5
                obj.material.needsUpdate = true
            }
        }
    })

    return null
}

export default EraseLine
