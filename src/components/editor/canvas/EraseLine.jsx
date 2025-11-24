import React, { useRef, useState, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'

import { canvasRenderStore } from '../../../hooks/useRenderSceneStore'
import { canvasDrawStore } from '../../../hooks/useCanvasDrawStore'

const EraseLine = ({ id }) => {
    const { eraserActive } = canvasDrawStore((state) => state)

    function EraserTool({ eraseFilter = () => true }) {
        const { camera, mouse, raycaster, scene } = useThree()
        const [dragging, setDragging] = useState(false)
        const highlighted = useRef(new Set())
        const { activeGroup } = canvasRenderStore((state) => state)

        const resetHighlight = () => {
            highlighted.current.forEach((obj) => {
                if (obj.material && obj.material.transparent !== undefined) {
                    obj.material.opacity = 1
                }
            })
            highlighted.current.clear()
        }

        useEffect(() => {
            const onPointerDown = () => {
                resetHighlight()
                setDragging(true)
            }

            const onPointerUp = () => {
                setDragging(false)

                highlighted.current.forEach((obj) => {
                    if (obj.parent) {
                        obj.parent.remove(obj)
                        obj.geometry.dispose()
                        obj.material.dispose()
                    }
                })

                highlighted.current.clear()
                // Save line to db
            }

            window.addEventListener('pointerdown', onPointerDown)
            window.addEventListener('pointerup', onPointerUp)

            return () => {
                window.removeEventListener('pointerdown', onPointerDown)
                window.removeEventListener('pointerup', onPointerUp)
            }
        }, [scene])

        useFrame(() => {
            if (!dragging) return

            raycaster.setFromCamera(mouse, camera)

            const objectsToCheck = scene.children.filter(
                (obj) =>
                    obj.isMesh &&
                    (obj.userData?.type === 'Line' ||
                        obj.userData?.type === 'Merged_Line') &&
                    obj.userData?.group_id === activeGroup &&
                    eraseFilter(obj)
            )

            const intersects = raycaster.intersectObjects(objectsToCheck, true)

            intersects.forEach(({ object }) => {
                if (
                    intersects.length > 0 &&
                    intersects[0]?.object &&
                    !highlighted.current.has(intersects[0].object)
                ) {
                    const obj = intersects[0].object
                    highlighted.current.add(obj)

                    // Set material transparent with opacity 0.5
                    if (obj.material) {
                        obj.material.transparent = true // enable transparency
                        obj.material.opacity = 0.5 // reduce opacity
                        obj.material.needsUpdate = true // update material
                    }

                    // Do NOT modify vertex colors, so they remain as is
                }
            })
        })

        return null
    }

    return <>{eraserActive && <EraserTool />}</>
}

export default EraseLine
