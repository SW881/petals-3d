import React, { useRef, useState, useCallback, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

import {
    customCubeLine,
    createContinuousRibbonGeometry,
} from '../../../helpers/guideFunction'

const GuidePlane = ({
    drawGuide,
    onDrawingFinished,
    straightHandStroke,
    strokeStablePercentage,
}) => {
    const { camera, size, scene, gl } = useThree()
    const [pointerDown, setPointerDown] = useState(false)
    const [isHoldingForCircle, setIsHoldingForCircle] = useState(false)

    const planeRef = useRef()
    const currentLine = useRef(null)
    const circleHoldTimerId = useRef(null)
    const circleCenterPoint = useRef(null)
    const currentCircleObject = useRef(null)
    const rawDrawingPoints = useRef([])
    const allGuideObjects = useRef([])

    const eraserRadius = 0.2
    const pointDensity = 0.01
    const snapAngle = 1

    const SyncCameraFromMain = ({ planeRef }) => {
        const { camera } = useThree()
        useFrame(() => {
            if (!planeRef.current && drawGuide) return
            planeRef.current.rotation.copy(camera.rotation)
        })
        return null
    }

    const smoothPoints = useCallback((points, percentage) => {
        if (percentage === 0 || points.length < 3) {
            return points
        }

        const maxWindowSize = 10
        const windowSize = Math.ceil((percentage / 100) * maxWindowSize)

        const actualWindowSize = Math.max(
            1,
            Math.min(windowSize, Math.floor((points.length - 1) / 2))
        )

        const smoothed = []
        for (let i = 0; i < points.length; i++) {
            const sum = new THREE.Vector3()
            let count = 0

            for (let j = -actualWindowSize; j <= actualWindowSize; j++) {
                const index = i + j
                if (index >= 0 && index < points.length) {
                    sum.add(points[index])
                    count++
                }
            }
            smoothed.push(sum.divideScalar(count))
        }
        return smoothed
    }, [])

    const getPlaneIntersection = useCallback(
        (event) => {
            if (!planeRef.current) return null

            const canvas = gl.domElement
            const canvasBounds = canvas.getBoundingClientRect()

            const mouseX =
                ((event.clientX - canvasBounds.left) / canvasBounds.width) * 2 -
                1
            const mouseY =
                -((event.clientY - canvasBounds.top) / canvasBounds.height) *
                    2 +
                1

            const mouse = new THREE.Vector2(mouseX, mouseY)
            const raycaster = new THREE.Raycaster()
            raycaster.setFromCamera(mouse, camera)

            const intersects = raycaster.intersectObject(planeRef.current)

            if (intersects.length > 0) {
                const firstIntersect = intersects[0]
                const worldNormal = firstIntersect.face.normal
                    .clone()
                    .transformDirection(firstIntersect.object.matrixWorld)
                    .normalize()
                return {
                    point: firstIntersect.point.clone(),
                    normal: worldNormal,
                }
            }
            return null
        },
        [camera, gl]
    )

    const generateCirclePointsWorld = useCallback(
        (center, normal, radius, segments = 64) => {
            const points = []
            const normals = []
            const tempVector = new THREE.Vector3()
            const tempQuaternion = new THREE.Quaternion()

            const zAxis = new THREE.Vector3(0, 0, 1)
            tempQuaternion.setFromUnitVectors(zAxis, normal)

            for (let i = 0; i <= segments; i++) {
                const angle = (i / segments) * Math.PI * 2
                tempVector.set(
                    radius * Math.cos(angle),
                    radius * Math.sin(angle),
                    0
                )
                tempVector.applyQuaternion(tempQuaternion).add(center)
                points.push(tempVector.clone())
                normals.push(normal)
            }

            return { circlePoints: points }
        },
        []
    )

    const handlePointerDown = useCallback(
        (e) => {
            e.stopPropagation()
            setPointerDown(true)
            scene.updateMatrixWorld(true)
            const intersection = getPlaneIntersection(e)
            if (!intersection) {
                setPointerDown(false)
                return
            }

            const { point, normal } = intersection

            if (drawGuide) {
                if (currentLine.current) {
                    scene.remove(currentLine.current.mesh)
                    currentLine.current = null
                }
                if (currentCircleObject.current) {
                    scene.remove(currentCircleObject.current.mesh)
                    currentCircleObject.current = null
                }

                if (circleHoldTimerId.current) {
                    clearTimeout(circleHoldTimerId.current)
                    circleHoldTimerId.current = null
                }
                setIsHoldingForCircle(false)

                rawDrawingPoints.current = [point.clone()]

                circleCenterPoint.current = point.clone()

                circleHoldTimerId.current = setTimeout(() => {
                    setIsHoldingForCircle(true)

                    if (currentLine.current) {
                        scene.remove(currentLine.current.mesh)
                        currentLine.current = null
                    }

                    rawDrawingPoints.current = []

                    const initialRadius = 0.01
                    const { circlePoints } = generateCirclePointsWorld(
                        circleCenterPoint.current,
                        normal,
                        initialRadius
                    )

                    let circleLine = customCubeLine(
                        circlePoints,
                        1,
                        0.1,
                        'Guide_Line',
                        '#000000',
                        null,
                        true
                    )
                    currentCircleObject.current = circleLine
                    scene.add(circleLine.mesh)
                }, 500)
            }
        },
        [getPlaneIntersection, scene, drawGuide, generateCirclePointsWorld]
    )

    const handlePointerMove = useCallback(
        (e) => {
            e.stopPropagation()
            if (!pointerDown) return

            const intersection = getPlaneIntersection(e)
            if (!intersection) {
                setEraserPos(null)
                return
            }

            const { point, normal } = intersection

            if (isHoldingForCircle && drawGuide) {
                if (
                    !currentCircleObject.current ||
                    !circleCenterPoint.current
                ) {
                    console.error(
                        'Circle mode active but missing required states.'
                    )
                    return
                }

                const radius = circleCenterPoint.current.distanceTo(point)
                const { circlePoints } = generateCirclePointsWorld(
                    circleCenterPoint.current,
                    normal,
                    radius
                )
                currentCircleObject.current.pts = circlePoints

                scene.traverse(function (object) {
                    if (object.userData['temp']) {
                        object.geometry.dispose()
                        object.material.dispose()
                        scene.remove(object)
                    }
                })

                let circleLine = customCubeLine(
                    circlePoints,
                    1,
                    0.1,
                    'Guide_Line',
                    '#000000',
                    null,
                    true
                )
                scene.add(circleLine.mesh)
                return
            }

            if (circleHoldTimerId.current && drawGuide) {
                clearTimeout(circleHoldTimerId.current)
                circleHoldTimerId.current = null
                if (!currentLine.current) {
                    rawDrawingPoints.current = [
                        circleCenterPoint.current.clone(),
                    ]

                    const initialLinePoints = straightHandStroke
                        ? [circleCenterPoint.current.clone(), point.clone()]
                        : [circleCenterPoint.current.clone()]

                    currentLine.current = customCubeLine(
                        [
                            ...initialLinePoints,
                            ...initialLinePoints,
                            ...initialLinePoints,
                        ],
                        1,
                        0.1,
                        'Guide_Line',
                        '#000000',
                        null,
                        true
                    )

                    scene.add(currentLine.current.mesh)
                }
            }

            if (!currentLine.current) return

            const { geometry } = currentLine.current

            if (straightHandStroke && drawGuide) {
                const startPoint = rawDrawingPoints.current[0]
                if (startPoint) {
                    const delta = new THREE.Vector3().subVectors(
                        point,
                        startPoint
                    )
                    const length = delta.length()

                    const planeZ = normal.clone()
                    const tempX = new THREE.Vector3().crossVectors(
                        planeZ,
                        camera.up
                    )
                    if (tempX.lengthSq() < 0.0001) {
                        tempX
                            .set(1, 0, 0)
                            .applyQuaternion(
                                new THREE.Quaternion().setFromUnitVectors(
                                    new THREE.Vector3(0, 0, 1),
                                    planeZ
                                )
                            )
                            .normalize()
                    }
                    const planeX = tempX.normalize()
                    const planeY = new THREE.Vector3()
                        .crossVectors(planeX, planeZ)
                        .normalize()

                    const localDeltaX = delta.dot(planeX)
                    const localDeltaY = delta.dot(planeY)

                    let angleRad = Math.atan2(localDeltaY, localDeltaX)
                    const angleDeg = THREE.MathUtils.radToDeg(angleRad)

                    const snappedDeg =
                        Math.round(angleDeg / snapAngle) * snapAngle
                    const snappedRad = THREE.MathUtils.degToRad(snappedDeg)

                    const snappedDirection = new THREE.Vector3()
                        .addScaledVector(planeX, Math.cos(snappedRad))
                        .addScaledVector(planeY, Math.sin(snappedRad))
                        .normalize()

                    const snappedEnd = startPoint
                        .clone()
                        .addScaledVector(snappedDirection, length)

                    const interpolatedPoints = []
                    const numSegments = Math.max(
                        1,
                        Math.ceil(length / pointDensity)
                    )
                    for (let i = 0; i <= numSegments; i++) {
                        const t = i / numSegments
                        const interpolatedPoint = new THREE.Vector3()
                            .copy(startPoint)
                            .lerp(snappedEnd, t)
                        interpolatedPoints.push(interpolatedPoint)
                    }

                    currentLine.current.pts = interpolatedPoints

                    scene.traverse(function (object) {
                        if (object.userData['temp']) {
                            object.geometry.dispose()
                            object.material.dispose()
                            scene.remove(object)
                        }
                    })

                    const newCustomLine = customCubeLine(
                        interpolatedPoints,
                        1,
                        0.1,
                        'Guide_Line',
                        '#000000',
                        null,
                        true
                    )

                    scene.add(newCustomLine.mesh)
                }
            } else {
                const lastRawPoint =
                    rawDrawingPoints.current[
                        rawDrawingPoints.current.length - 1
                    ]

                if (lastRawPoint) {
                    const dist = lastRawPoint.distanceTo(point)

                    if (dist > pointDensity) {
                        const direction = new THREE.Vector3()
                            .subVectors(point, lastRawPoint)
                            .normalize()
                        const steps = Math.floor(dist / pointDensity)
                        for (let i = 1; i <= steps; i++) {
                            const interpolated = new THREE.Vector3()
                                .copy(lastRawPoint)
                                .addScaledVector(direction, pointDensity * i)
                            rawDrawingPoints.current.push(interpolated)
                        }
                        rawDrawingPoints.current.push(point.clone())

                        const smoothedPts = smoothPoints(
                            rawDrawingPoints.current,
                            250
                        )
                        currentLine.current.pts = smoothedPts

                        scene.traverse(function (object) {
                            if (object.userData['temp']) {
                                object.geometry.dispose()
                                object.material.dispose()
                                scene.remove(object)
                            }
                        })

                        const newCustomLine = customCubeLine(
                            smoothedPts,
                            1,
                            0.1,
                            'Guide_Line',
                            '#000000',
                            null,
                            true
                        )
                        scene.add(newCustomLine.mesh)
                    }
                }
            }
        },
        [
            getPlaneIntersection,
            pointerDown,
            drawGuide,
            isHoldingForCircle,
            generateCirclePointsWorld,
            circleHoldTimerId,
            straightHandStroke,
            scene,
            size,
            pointDensity,
            camera,
            smoothPoints,
            strokeStablePercentage,
        ]
    )

    const handlePointerUp = useCallback(
        (e) => {
            e.stopPropagation()
            if (drawGuide) {
                setPointerDown(false)

                if (circleHoldTimerId.current) {
                    clearTimeout(circleHoldTimerId.current)
                    circleHoldTimerId.current = null
                }
                setIsHoldingForCircle(false)

                rawDrawingPoints.current = []

                if (currentCircleObject.current) {
                    const circlePts = currentCircleObject.current.pts
                    if (
                        circlePts.length > 1 &&
                        circlePts[0].distanceTo(
                            circlePts[Math.floor(circlePts.length / 2)]
                        ) < 0.1
                    ) {
                        scene.remove(currentCircleObject.current.mesh)
                    } else {
                        scene.traverse(function (object) {
                            if (object.userData['temp']) {
                                object.geometry.dispose()
                                object.material.dispose()
                                scene.remove(object)
                            }
                        })

                        let newLine = customCubeLine(
                            currentCircleObject.current.pts,
                            1,
                            0.1,
                            'Guide_Line',
                            '#000000',
                            null,
                            false
                        )
                        scene.add(newLine.mesh)
                        scene.remove(currentCircleObject.current.mesh)
                        currentCircleObject.current.geometry.dispose()
                        currentCircleObject.current.material.dispose()

                        allGuideObjects.current =
                            allGuideObjects.current.filter(
                                (obj) => obj !== currentCircleObject.current
                            )

                        let intersection = getPlaneIntersection(e)
                        const planeNormal = intersection.normal

                        const planeWidth = 50

                        const ribbonGeometry = createContinuousRibbonGeometry(
                            currentCircleObject.current.pts,
                            planeWidth,
                            planeNormal
                        )

                        if (ribbonGeometry) {
                            const ribbonMaterial = new THREE.MeshBasicMaterial({
                                color: 0xe5e4e2,
                                side: THREE.DoubleSide,
                                forceSinglePass: true,
                                transparent: true,
                                opacity: 0.1,
                            })
                            const ribbonMesh = new THREE.Mesh(
                                ribbonGeometry,
                                ribbonMaterial
                            )
                            scene.add(ribbonMesh)
                            allGuideObjects.current.push({
                                mesh: ribbonMesh,
                                type: 'ribbon',
                            })
                            scene.remove(newLine.mesh)
                            newLine.geometry.dispose()
                            newLine.material.dispose()
                        }
                    }
                    currentCircleObject.current = null
                } else if (currentLine.current) {
                    const { pts, mesh } = currentLine.current

                    const isTooShort =
                        (straightHandStroke && pts.length < 2) ||
                        (!straightHandStroke && pts.length <= 3)

                    if (isTooShort) {
                        scene.remove(mesh)
                    } else {
                        scene.traverse(function (object) {
                            if (object.userData['temp']) {
                                object.geometry.dispose()
                                object.material.dispose()
                                scene.remove(object)
                            }
                        })

                        const newCustomLine = customCubeLine(
                            currentLine.current.pts,
                            1,
                            0.1,
                            'Guide_Line',
                            '#000000',
                            null,
                            false
                        )

                        scene.add(newCustomLine.mesh)
                        scene.remove(currentLine.current.mesh)
                        currentLine.current.geometry.dispose()
                        currentLine.current.material.dispose()

                        allGuideObjects.current =
                            allGuideObjects.current.filter(
                                (obj) => obj !== currentCircleObject.current
                            )

                        let intersection = getPlaneIntersection(e)
                        const planeNormal = intersection.normal

                        const planeWidth = 50

                        const ribbonGeometry = createContinuousRibbonGeometry(
                            currentLine.current.pts,
                            planeWidth,
                            planeNormal
                        )

                        if (ribbonGeometry) {
                            const ribbonMaterial = new THREE.MeshBasicMaterial({
                                color: 0xe5e4e2,
                                side: THREE.DoubleSide,
                                forceSinglePass: true,
                                transparent: true,
                                opacity: 0.1,
                            })

                            const ribbonMesh = new THREE.Mesh(
                                ribbonGeometry,
                                ribbonMaterial
                            )
                            scene.add(ribbonMesh)
                            allGuideObjects.current.push({
                                mesh: ribbonMesh,
                                type: 'ribbon',
                            })
                            scene.remove(newCustomLine.mesh)
                            newCustomLine.geometry.dispose()
                            newCustomLine.material.dispose()
                        }
                    }
                }

                if (onDrawingFinished && allGuideObjects.current.length > 0) {
                    onDrawingFinished(allGuideObjects.current[0])
                }
            }
        },
        [getPlaneIntersection, scene, camera, drawGuide, onDrawingFinished]
    )

    useEffect(() => {
        if (drawGuide) {
            allGuideObjects.current.forEach((obj) => {
                if (obj.mesh && obj.mesh.parent) {
                    scene.remove(obj.mesh)
                    obj.mesh.geometry.dispose()
                    obj.mesh.material.dispose()
                }
            })
            allGuideObjects.current = []

            if (
                currentLine.current &&
                currentLine.current.mesh &&
                currentLine.current.mesh.parent
            ) {
                scene.remove(currentLine.current.mesh)
                currentLine.current.mesh.geometry.dispose()
                currentLine.current.mesh.material.dispose()
            }
            currentLine.current = null
            circleCenterPoint.current = null
            rawDrawingPoints.current = []
            setPointerDown(false)
        }
    }, [drawGuide, scene])

    return (
        <>
            {drawGuide && <SyncCameraFromMain planeRef={planeRef} />}

            {drawGuide && (
                <mesh
                    ref={planeRef}
                    position={[0, 0, 0]}
                    rotation={[0, 0, 0]}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                >
                    <planeGeometry args={[4000, 4000]} />
                    <meshBasicMaterial
                        visible={false}
                        color="#f0f0f0"
                        transparent
                        opacity={0}
                        side={THREE.DoubleSide}
                    />
                </mesh>
            )}
        </>
    )
}

export default GuidePlane
