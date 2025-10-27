import React, { useRef, useState, useCallback, useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { SimplifyModifier } from 'three/examples/jsm/modifiers/SimplifyModifier.js'
import { canvasDrawStore } from '../../../hooks/useCanvasDrawStore'

const DrawLine = ({ id }) => {
    const { camera, scene, gl } = useThree()
    const planeRef = useRef()

    const MAX_POINTS = 50000
    const SMOOTH_PERCENTAGE = 25
    const DISTANCE_THRESHOLD = 0.001
    const OPTIMIZATION_THRESHOLD = 0.01 // Threshold for pre-smoothing filtering
    const SIMPLIFY_PERCENTAGE = 0.0 // 45% reduction of vertices
    let startPoint = null
    let currentNormal = null // To store the normal of the drawing plane

    const {
        dynamicDrawingPlaneMesh,
        strokeOpacity,
        strokeWidth,
        strokeColor,
        pressureMode,
        mirror,
        strokeType,
        drawShape,
        activeMaterialType,
    } = canvasDrawStore((state) => state)

    let isDrawing = false
    let points = []
    let pressures = []
    let normals = []
    let currentMesh = null
    let mirrorData = {}
    let mirrorMeshes = {}

    const isMirroring = mirror.x || mirror.y || mirror.z

    const color = new THREE.Color(strokeColor)

    const getAdaptiveStrokWidth = (pressure, width) => {
        let w, h
        switch (strokeType) {
            case 'taper':
                w = (pressure * width) / 2
                h = (pressure * width) / 2
                break
            case 'cube':
                w = (pressure * width) / 2
                h = (pressure * width) / 2
                break
            case 'paint':
                w = (pressure * width) / 2
                h = 0.01
                break
            case 'belt':
                w = 0.01
                h = (pressure * width) / 2
                break
            default:
                key
                break
        }
        return { w, h }
    }

    const getActiveMirrorModes = () => {
        let mirrorString = []
        if (mirror.x) {
            mirrorString.push('X')
        }
        if (mirror.y) {
            mirrorString.push('Y')
        }
        if (mirror.z) {
            mirrorString.push('Z')
        }
        return mirrorString
        // if (!mirrorMode || mirrorMode === 'None') return []
        // const uniqueAxes = Array.from(new Set(mirrorMode.split(''))).sort()
        // return uniqueAxes.filter((axis) => ['X', 'Y', 'Z'].includes(axis))
    }

    const getMirroredPoint = useCallback(
        (point, normal, mirrorAxis, planeMesh) => {
            if (!point || !normal || !mirrorAxis || !planeMesh)
                return {
                    mirroredPoint: null,
                    mirroredNormal: null,
                }

            const worldMatrix = planeMesh.matrixWorld
            const worldMatrixInverse = new THREE.Matrix4()
                .copy(worldMatrix)
                .invert()

            const localPoint = point.clone().applyMatrix4(worldMatrixInverse)
            const localNormal = normal
                .clone()
                .transformDirection(worldMatrixInverse)
                .normalize()

            const mirroredLocalPoint = localPoint.clone()
            const mirroredLocalNormal = localNormal.clone()

            if (mirrorAxis === 'X') {
                mirroredLocalPoint.x *= -1
                mirroredLocalNormal.x *= -1
            } else if (mirrorAxis === 'Y') {
                mirroredLocalPoint.y *= -1
                mirroredLocalNormal.y *= -1
            } else if (mirrorAxis === 'Z') {
                mirroredLocalPoint.z *= -1
                mirroredLocalNormal.z *= -1
            }

            const mirroredPoint = mirroredLocalPoint.applyMatrix4(worldMatrix)
            const mirroredNormal = mirroredLocalNormal
                .transformDirection(worldMatrix)
                .normalize()

            return {
                mirroredPoint,
                mirroredNormal,
            }
        },
        []
    )

    const generateCirclePointsWorld = useCallback(
        (center, normal, radius, segments = 64) => {
            const circlePoints = []
            const circleNormals = []

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
                circlePoints.push(tempVector.clone())
                circleNormals.push(normal.clone())
            }

            return {
                circlePoints,
                circleNormals,
            }
        },
        []
    )

    // Square
    const generateSquarePointsWorld = useCallback(
        (
            center,
            normal,
            radius,
            { cornerSegments = 8, segments = 64 } = {}
        ) => {
            const squarePoints = []
            const squareNormals = []

            const tempVector = new THREE.Vector3()
            const tempQuaternion = new THREE.Quaternion()

            // Align local XY plane with the normal
            const zAxis = new THREE.Vector3(0, 0, 1)
            tempQuaternion.setFromUnitVectors(zAxis, normal)

            // Square side length from radius (radius = half diagonal)
            const sideLength = radius * Math.sqrt(2) // so diagonal = 2*radius
            const halfSide = sideLength / 2

            // Corner radius for smooth rounding (adjust cornerRadiusFactor for more/less rounding)
            const cornerRadiusFactor = 0.15 // 15% of side length
            const cornerRadius = sideLength * cornerRadiusFactor
            const straightLength = halfSide - cornerRadius

            // Four corners positions (in local space before rotation)
            const corners = [
                {
                    x: straightLength,
                    y: straightLength,
                    startAngle: 0,
                    endAngle: Math.PI / 2,
                }, // top-right
                {
                    x: -straightLength,
                    y: straightLength,
                    startAngle: Math.PI / 2,
                    endAngle: Math.PI,
                }, // top-left
                {
                    x: -straightLength,
                    y: -straightLength,
                    startAngle: Math.PI,
                    endAngle: Math.PI * 1.5,
                }, // bottom-left
                {
                    x: straightLength,
                    y: -straightLength,
                    startAngle: Math.PI * 1.5,
                    endAngle: Math.PI * 2,
                }, // bottom-right
            ]

            const pointsPerSide = Math.floor(segments / 4)
            const pointsPerCorner = cornerSegments

            // Generate square with rounded corners
            corners.forEach((corner, idx) => {
                const nextCorner = corners[(idx + 1) % 4]

                // Rounded corner arc
                for (let i = 0; i < pointsPerCorner; i++) {
                    const t = i / pointsPerCorner
                    const angle =
                        corner.startAngle +
                        t * (corner.endAngle - corner.startAngle)
                    tempVector.set(
                        corner.x + cornerRadius * Math.cos(angle),
                        corner.y + cornerRadius * Math.sin(angle),
                        0
                    )
                    tempVector.applyQuaternion(tempQuaternion).add(center)
                    squarePoints.push(tempVector.clone())
                    squareNormals.push(normal.clone())
                }

                // Straight edge to next corner
                const edgeStart = {
                    x: corner.x + cornerRadius * Math.cos(corner.endAngle),
                    y: corner.y + cornerRadius * Math.sin(corner.endAngle),
                }
                const edgeEnd = {
                    x:
                        nextCorner.x +
                        cornerRadius * Math.cos(nextCorner.startAngle),
                    y:
                        nextCorner.y +
                        cornerRadius * Math.sin(nextCorner.startAngle),
                }

                for (let i = 1; i < pointsPerSide; i++) {
                    const t = i / pointsPerSide
                    tempVector.set(
                        edgeStart.x + t * (edgeEnd.x - edgeStart.x),
                        edgeStart.y + t * (edgeEnd.y - edgeStart.y),
                        0
                    )
                    tempVector.applyQuaternion(tempQuaternion).add(center)
                    squarePoints.push(tempVector.clone())
                    squareNormals.push(normal.clone())
                }
            })

            // Close the loop
            squarePoints.push(squarePoints[0].clone())
            squareNormals.push(normal.clone())

            return {
                squarePoints: squarePoints,
                squareNormals: squareNormals,
            }
        },
        []
    )

    // Semi Circle close arc
    const generateSemiCirclePointsWorld = useCallback(
        (center, normal, radius, segments = 64) => {
            const semiCirclePoints = []
            const semiCircleNormals = []

            const tempVector = new THREE.Vector3()
            const tempQuaternion = new THREE.Quaternion()

            // Align local XY plane with the normal
            const zAxis = new THREE.Vector3(0, 0, 1)
            tempQuaternion.setFromUnitVectors(zAxis, normal)

            // Semi-circle arc (top half, 180 degrees)
            const arcSegments = Math.floor(segments * 0.6) // 60% for the arc
            for (let i = 0; i <= arcSegments; i++) {
                const angle = Math.PI + (i / arcSegments) * Math.PI // from 180° to 360° (top half)
                tempVector.set(
                    radius * Math.cos(angle),
                    radius * Math.sin(angle),
                    0
                )
                tempVector.applyQuaternion(tempQuaternion).add(center)
                semiCirclePoints.push(tempVector.clone())
                semiCircleNormals.push(normal.clone())
            }

            // Straight base line (bottom, closing the semi-circle)
            const baseSegments = Math.floor(segments * 0.4) // 40% for the base
            for (let i = 1; i < baseSegments; i++) {
                const t = i / baseSegments
                tempVector.set(
                    radius - t * (2 * radius), // from right (-radius) to left (+radius)
                    0,
                    0
                )
                tempVector.applyQuaternion(tempQuaternion).add(center)
                semiCirclePoints.push(tempVector.clone())
                semiCircleNormals.push(normal.clone())
            }

            // Close the loop
            semiCirclePoints.push(semiCirclePoints[0].clone())
            semiCircleNormals.push(normal.clone())

            return {
                circlePoints: semiCirclePoints,
                circleNormals: semiCircleNormals,
            }
        },
        []
    )

    // Semi circle opened arc
    const generateSemiCircleOpenArcWorld = useCallback(
        (center, normal, radius, segments = 64) => {
            const arcPoints = []
            const arcNormals = []

            const tempVector = new THREE.Vector3()
            const tempQuaternion = new THREE.Quaternion()

            const zAxis = new THREE.Vector3(0, 0, 1)
            tempQuaternion.setFromUnitVectors(zAxis, normal)

            // Just the arc, no closing line
            for (let i = 0; i <= segments; i++) {
                const angle = Math.PI + (i / segments) * Math.PI // 180° arc
                tempVector.set(
                    radius * Math.cos(angle),
                    radius * Math.sin(angle),
                    0
                )
                tempVector.applyQuaternion(tempQuaternion).add(center)
                arcPoints.push(tempVector.clone())
                arcNormals.push(normal.clone())
            }

            return {
                arcPoints: arcPoints,
                arcNormals: arcNormals,
            }
        },
        []
    )

    const smoothPoints = useCallback((points, percentage) => {
        if (percentage === 0 || points.length < 3) return points

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

    const smoothArray = (arr, percentage) => {
        const maxWindowSize = 10
        const windowSize = Math.ceil((percentage / 100) * maxWindowSize)
        const actualWindowSize = Math.max(
            1,
            Math.min(windowSize, Math.floor((arr.length - 1) / 2))
        )
        const smoothed = []

        for (let i = 0; i < arr.length; i++) {
            let sum = 0
            let count = 0

            for (let j = -actualWindowSize; j <= actualWindowSize; j++) {
                const index = i + j
                if (index >= 0 && index < arr.length) {
                    sum += arr[index]
                    count++
                }
            }
            smoothed.push(sum / count)
        }

        return smoothed
    }

    const filterPoints = useCallback((pts, pressures, normals, tolerance) => {
        if (pts.length < 2)
            return {
                filteredPts: pts,
                filteredPressures: pressures,
                filteredNormals: normals,
            }

        const filteredPts = [pts[0]]
        const filteredPressures = [pressures[0]]
        const filteredNormals = [normals[0]]

        let lastKeptIndex = 0

        for (let i = 1; i < pts.length; i++) {
            if (pts[i].distanceTo(pts[lastKeptIndex]) >= tolerance) {
                filteredPts.push(pts[i])
                filteredPressures.push(pressures[i])
                filteredNormals.push(normals[i])
                lastKeptIndex = i
            }
        }

        if (lastKeptIndex !== pts.length - 1) {
            filteredPts.push(pts[pts.length - 1])
            filteredPressures.push(pressures[pressures.length - 1])
            filteredNormals.push(normals[normals.length - 1])
        }

        return {
            filteredPts,
            filteredPressures,
            filteredNormals,
        }
    }, [])

    function getSnappedPoint(start, current, maxSnapAngleDeg = 45) {
        const dir = current.clone().sub(start)
        const angle = Math.atan2(dir.y, dir.x)
        const snapAngle = THREE.MathUtils.degToRad(maxSnapAngleDeg)

        const snappedAngle = Math.round(angle / snapAngle) * snapAngle

        const length = dir.length()
        const snappedDir = new THREE.Vector3(
            Math.cos(snappedAngle),
            Math.sin(snappedAngle),
            0
        ).multiplyScalar(length)

        return start.clone().add(snappedDir)
    }

    function createInitialLineMesh() {
        const maxVertices = MAX_POINTS * 4
        const positions = new Float32Array(maxVertices * 3)
        const meshNormals = new Float32Array(maxVertices * 3)
        const indices = new Uint32Array(MAX_POINTS * 24)

        const geometry = new THREE.BufferGeometry()
        geometry.setAttribute(
            'position',
            new THREE.BufferAttribute(positions, 3)
        )
        geometry.setAttribute(
            'normal',
            new THREE.BufferAttribute(meshNormals, 3)
        )
        geometry.setIndex(new THREE.BufferAttribute(indices, 1))
        geometry.setDrawRange(0, 0)

        let material
        switch (activeMaterialType) {
            case 'flat':
                material = new THREE.MeshBasicMaterial({
                    color: new THREE.Color(strokeColor),
                    wireframe: false,
                    transparent: true,
                    opacity: strokeOpacity,
                    side: THREE.DoubleSide,
                    forceSinglePass: true,
                    depthTest: true,
                    depthWrite: true,
                    // flatShading: true,
                })
                break

            case 'shaded':
                material = new THREE.MeshStandardMaterial({
                    color: new THREE.Color(strokeColor),
                    wireframe: false,
                    transparent: true,
                    opacity: strokeOpacity,
                    side: THREE.DoubleSide,
                    forceSinglePass: true,
                    depthTest: true,
                    depthWrite: true,
                    // flatShading: true,
                })
                break

            case 'glow':
                material = new THREE.MeshStandardMaterial({
                    color: new THREE.Color(strokeColor),
                    wireframe: false,
                    emissive: new THREE.Color(strokeColor),
                    transparent: true,
                    opacity: strokeOpacity,
                    side: THREE.DoubleSide,
                    forceSinglePass: true,
                    depthTest: true,
                    depthWrite: true,
                    // flatShading: true,
                    emissiveIntensity: 1,
                })
                break

            default:
                break
        }

        const mesh = new THREE.Mesh(geometry, material)
        // mesh.layers.set(1)
        scene.add(mesh)
        return mesh
    }

    function updateLine(mesh, rawPts, pressuresArr, normalsArr) {
        if (rawPts.length < 2) return

        const geometry = mesh.geometry

        let pts = rawPts
        let pressures = pressuresArr
        let finalNormals = normalsArr

        if (drawShape === 'free_hand') {
            pts = smoothPoints(rawPts, SMOOTH_PERCENTAGE)
            pressures = smoothArray(pressuresArr, SMOOTH_PERCENTAGE)
            const filteredResult = filterPoints(
                pts,
                pressures,
                normalsArr,
                OPTIMIZATION_THRESHOLD
            )
            pts = filteredResult.filteredPts
            pressures = filteredResult.filteredPressures
            finalNormals = filteredResult.filteredNormals
        }

        if (pts.length < 2) return

        const positions = []
        const meshNormals = []
        const indices = []

        const tangents = []
        for (let i = 0; i < pts.length - 1; i++) {
            tangents.push(
                new THREE.Vector3().subVectors(pts[i + 1], pts[i]).normalize()
            )
        }

        if (pts.length === 2 && tangents.length === 0) {
            tangents.push(
                new THREE.Vector3().subVectors(pts[1], pts[0]).normalize()
            )
        }

        const transportedRights = []
        let right = new THREE.Vector3()
            .crossVectors(
                finalNormals[0],
                tangents[0] || new THREE.Vector3(1, 0, 0)
            )
            .normalize()

        if (right.lengthSq() < 1e-6) {
            right.set(0, 1, 0)
            if (tangents.length > 0 && Math.abs(tangents[0].dot(right)) > 0.99)
                right.set(1, 0, 0)
            if (tangents.length > 0)
                right.crossVectors(finalNormals[0], tangents[0]).normalize()
            else
                right
                    .crossVectors(finalNormals[0], new THREE.Vector3(1, 0, 0))
                    .normalize()
        }
        transportedRights.push(right.clone())

        for (let i = 1; i < tangents.length; i++) {
            const prevT = tangents[i - 1]
            const currT = tangents[i]
            const axis = new THREE.Vector3().crossVectors(prevT, currT)
            const angle = Math.acos(Math.max(-1, Math.min(1, prevT.dot(currT))))

            if (axis.lengthSq() < 1e-6 || angle === 0) {
                transportedRights.push(transportedRights[i - 1].clone())
            } else {
                const q = new THREE.Quaternion().setFromAxisAngle(
                    axis.normalize(),
                    angle
                )
                transportedRights.push(
                    transportedRights[i - 1]
                        .clone()
                        .applyQuaternion(q)
                        .normalize()
                )
            }
        }

        for (let i = 0; i < pts.length; i++) {
            const curr = pts[i]
            const tangent =
                i === pts.length - 1
                    ? tangents[i - 1]
                    : tangents[i] || tangents[0]
            const rightVec =
                transportedRights[i] ||
                transportedRights[transportedRights.length - 1]
            const up = new THREE.Vector3()
                .crossVectors(tangent, rightVec)
                .normalize()

            let taperFactor
            if (strokeType === 'taper') {
                const t = i / (pts.length - 1)
                const taperAmount = 1.0
                taperFactor =
                    1 - taperAmount + taperAmount * Math.sin(t * Math.PI)
            }

            const effectivePressure =
                pressures[i] * (strokeType === 'taper' ? taperFactor : 1)

            let { w, h } = getAdaptiveStrokWidth(effectivePressure, strokeWidth)
            // const halfW = (effectivePressure * strokeWidth) / 2
            // const halfH = (effectivePressure * strokeWidth) / 2

            const halfW = w
            const halfH = h

            const tl = new THREE.Vector3()
                .copy(curr)
                .addScaledVector(rightVec, -halfW)
                .addScaledVector(up, halfH)
            const tr = new THREE.Vector3()
                .copy(curr)
                .addScaledVector(rightVec, halfW)
                .addScaledVector(up, halfH)
            const br = new THREE.Vector3()
                .copy(curr)
                .addScaledVector(rightVec, halfW)
                .addScaledVector(up, -halfH)
            const bl = new THREE.Vector3()
                .copy(curr)
                .addScaledVector(rightVec, -halfW)
                .addScaledVector(up, -halfH)

            const normal = finalNormals[i].clone()
            const baseIdx = positions.length / 3

            ;[tl, tr, br, bl, tl, tr, br, bl].forEach((v) => {
                positions.push(v.x, v.y, v.z)
                meshNormals.push(normal.x, normal.y, normal.z)
            })

            if (i > 0) {
                const prevBase = baseIdx - 4
                indices.push(prevBase, prevBase + 1, baseIdx + 1)
                indices.push(prevBase, baseIdx + 1, baseIdx)
                indices.push(prevBase + 1, prevBase + 2, baseIdx + 2)
                indices.push(prevBase + 1, baseIdx + 2, baseIdx + 1)
                indices.push(prevBase + 2, prevBase + 3, baseIdx + 3)
                indices.push(prevBase + 2, baseIdx + 3, baseIdx + 2)
                indices.push(prevBase + 3, prevBase, baseIdx)
                indices.push(prevBase + 3, baseIdx, baseIdx + 3)
            }
        }

        geometry.setAttribute(
            'position',
            new THREE.Float32BufferAttribute(positions, 3)
        )
        geometry.setAttribute(
            'normal',
            new THREE.Float32BufferAttribute(meshNormals, 3)
        )

        geometry.setIndex(indices)

        geometry.attributes.position.needsUpdate = true
        geometry.attributes.normal.needsUpdate = true
        geometry.index.needsUpdate = true
        geometry.setDrawRange(0, indices.length)

        if (mesh.material) {
            mesh.material.color.copy(color)
            mesh.material.opacity = strokeOpacity
            // mesh.material.flatShading = true
            mesh.material.needsUpdate = true
        }
    }

    function startDrawing(event) {
        if (!planeRef.current) return

        isDrawing = true
        points = []
        pressures = []
        normals = []
        mirrorData = {}

        Object.values(mirrorMeshes).forEach((mesh) => {
            scene.remove(mesh)
            if (mesh.geometry) mesh.geometry.dispose()
            if (mesh.material) mesh.material.dispose()
        })
        mirrorMeshes = {}

        const { point, normal } = getPlaneIntersection(event)
        if (!point) return

        startPoint = point.clone()
        currentNormal = normal.clone()
        currentMesh = createInitialLineMesh()

        const activeMirrorModes = isMirroring ? getActiveMirrorModes() : []

        activeMirrorModes.forEach((mode) => {
            mirrorMeshes[mode] = createInitialLineMesh()
            mirrorData[mode] = {
                points: [],
                pressures: [],
                normals: [],
            }
        })

        const pressure = pressureMode ? event.pressure : 1.0

        points.push(startPoint.clone())
        pressures.push(pressure)
        normals.push(currentNormal)

        activeMirrorModes.forEach((mode) => {
            const { mirroredPoint, mirroredNormal } = getMirroredPoint(
                startPoint,
                currentNormal,
                mode,
                planeRef.current
            )
            mirrorData[mode].points.push(mirroredPoint.clone())
            mirrorData[mode].pressures.push(pressure)
            mirrorData[mode].normals.push(mirroredNormal)
        })

        if (drawShape === 'free_hand') {
            const secondPoint = new THREE.Vector3()
                .copy(startPoint)
                .addScalar(0.001)
            points.push(secondPoint)
            pressures.push(pressure)
            normals.push(currentNormal)

            activeMirrorModes.forEach((mode) => {
                const {
                    mirroredPoint: mirrorSecondPoint,
                    mirroredNormal: mirrorSecondNormal,
                } = getMirroredPoint(
                    secondPoint,
                    currentNormal,
                    mode,
                    planeRef.current
                )
                mirrorData[mode].points.push(mirrorSecondPoint)
                mirrorData[mode].pressures.push(pressure)
                mirrorData[mode].normals.push(mirrorSecondNormal)
            })
        }

        updateLine(currentMesh, points, pressures, normals)

        activeMirrorModes.forEach((mode) => {
            const data = mirrorData[mode]
            updateLine(
                mirrorMeshes[mode],
                data.points,
                data.pressures,
                data.normals
            )
        })
    }

    function getSnappedLinePointsInPlane({
        startPoint,
        currentPoint,
        normal,
        camera,
        snapAngle = 45,
        pointDensity = 0.1,
    }) {
        const delta = new THREE.Vector3().subVectors(currentPoint, startPoint)
        const length = delta.length()

        const planeZ = normal.clone()

        const tempX = new THREE.Vector3().crossVectors(planeZ, camera.up)
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

        const snappedDeg = Math.round(angleDeg / snapAngle) * snapAngle
        const snappedRad = THREE.MathUtils.degToRad(snappedDeg)

        const snappedDirection = new THREE.Vector3()
            .addScaledVector(planeX, Math.cos(snappedRad))
            .addScaledVector(planeY, Math.sin(snappedRad))
            .normalize()

        const snappedEnd = startPoint
            .clone()
            .addScaledVector(snappedDirection, length)

        // Interpolate between startPoint and snappedEnd
        const interpolatedPoints = []
        const numSegments = Math.max(1, Math.ceil(length / pointDensity))
        for (let i = 0; i <= numSegments; i++) {
            const t = i / numSegments
            const interpolatedPoint = new THREE.Vector3()
                .copy(startPoint)
                .lerp(snappedEnd, t)
            interpolatedPoints.push(interpolatedPoint)
        }

        return {
            snappedEnd,
            interpolatedPoints,
        }
    }

    function getPlaneBasis(normal, u, v) {
        // Create any vector not parallel to the normal
        const temp =
            Math.abs(normal.x) < 0.9
                ? new THREE.Vector3(1, 0, 0)
                : new THREE.Vector3(0, 1, 0)

        // Compute u and v as orthogonal vectors in the plane
        u.copy(temp).cross(normal).normalize() // u = temp × normal
        v.copy(normal).cross(u).normalize() // v = normal × u
    }

    function continueDrawing(event) {
        if (!isDrawing || !planeRef.current) return
        const { point, normal } = getPlaneIntersection(event)
        if (!point) return

        const pressure = pressureMode ? event.pressure : 1.0
        const activeMirrorModes = isMirroring ? getActiveMirrorModes() : []

        if (drawShape === 'free_hand') {
            let newPoint = point.clone()

            const last = points[points.length - 1]
            if (newPoint.distanceTo(last) < DISTANCE_THRESHOLD) return

            points.push(newPoint)
            pressures.push(pressure)
            normals.push(normal)

            activeMirrorModes.forEach((mode) => {
                const { mirroredPoint, mirroredNormal } = getMirroredPoint(
                    newPoint,
                    normal,
                    mode,
                    planeRef.current
                )
                mirrorData[mode].points.push(mirroredPoint)
                mirrorData[mode].pressures.push(pressure)
                mirrorData[mode].normals.push(mirroredNormal)
            })

            if (points.length > MAX_POINTS) {
                points.shift()
                pressures.shift()
                normals.shift()
                activeMirrorModes.forEach((mode) => {
                    mirrorData[mode].points.shift()
                    mirrorData[mode].pressures.shift()
                    mirrorData[mode].normals.shift()
                })
            }

            updateLine(currentMesh, points, pressures, normals)

            activeMirrorModes.forEach((mode) => {
                const data = mirrorData[mode]
                updateLine(
                    mirrorMeshes[mode],
                    data.points,
                    data.pressures,
                    data.normals
                )
            })
        } else if (drawShape === 'straight') {
            if (!startPoint || !currentNormal) return

            // Snap point to constrained angle (max 45°)
            // const snappedPoint = getSnappedPoint(startPoint, point, 1) // 45 is max angle for snapping
            const { snappedEnd, interpolatedPoints } =
                getSnappedLinePointsInPlane({
                    startPoint,
                    currentPoint: point,
                    normal,
                    camera,
                    snapAngle: 1,
                    pointDensity: 0.05,
                })

            // Only two points: start and snapped end
            points.length = 0
            points.push(startPoint.clone())
            points.push(snappedEnd.clone())

            pressures.length = 0
            pressures.push(pressure)
            pressures.push(pressure)

            normals.length = 0
            normals.push(currentNormal.clone())
            normals.push(normal.clone())

            updateLine(currentMesh, points, pressures, normals)

            // Mirroring
            activeMirrorModes.forEach((mode) => {
                const {
                    mirroredPoint: mirroredStart,
                    mirroredNormal: mirroredNormal1,
                } = getMirroredPoint(
                    startPoint,
                    currentNormal,
                    mode,
                    planeRef.current
                )
                const {
                    mirroredPoint: mirroredEnd,
                    mirroredNormal: mirroredNormal2,
                } = getMirroredPoint(snappedEnd, normal, mode, planeRef.current)

                mirrorData[mode].points = [mirroredStart, mirroredEnd]
                mirrorData[mode].pressures = [pressure, pressure]
                mirrorData[mode].normals = [mirroredNormal1, mirroredNormal2]

                updateLine(
                    mirrorMeshes[mode],
                    mirrorData[mode].points,
                    mirrorData[mode].pressures,
                    mirrorData[mode].normals
                )
            })
        } else if (drawShape === 'circle') {
            if (!startPoint || !currentNormal) return

            const radius = startPoint.distanceTo(point)
            const pressure = pressureMode ? event.pressure : 1.0

            const { circlePoints, circleNormals } = generateCirclePointsWorld(
                startPoint,
                currentNormal,
                radius
            )

            const circlePressures = Array(circlePoints.length).fill(pressure)

            updateLine(
                currentMesh,
                circlePoints,
                circlePressures,
                circleNormals
            )

            activeMirrorModes.forEach((mode) => {
                const {
                    mirroredPoint: mirrorCenter,
                    mirroredNormal: mirrorNormal,
                } = getMirroredPoint(
                    startPoint,
                    currentNormal,
                    mode,
                    planeRef.current
                )

                const {
                    circlePoints: mirrorCirclePoints,
                    circleNormals: mirrorCircleNormals,
                } = generateCirclePointsWorld(
                    mirrorCenter,
                    mirrorNormal,
                    radius
                )
                const mirrorCirclePressures = Array(
                    mirrorCirclePoints.length
                ).fill(pressure)

                updateLine(
                    mirrorMeshes[mode],
                    mirrorCirclePoints,
                    mirrorCirclePressures,
                    mirrorCircleNormals
                )
            })
        } else if (drawShape === 'square') {
            if (!startPoint || !currentNormal) return

            const radius = startPoint.distanceTo(point)
            const pressure = pressureMode ? event.pressure : 1.0

            const { squarePoints, squareNormals } = generateSquarePointsWorld(
                startPoint,
                currentNormal,
                radius
            )

            const squarePressures = Array(squarePoints.length).fill(pressure)

            updateLine(
                currentMesh,
                squarePoints,
                squarePressures,
                squareNormals
            )

            activeMirrorModes.forEach((mode) => {
                const {
                    mirroredPoint: mirrorCenter,
                    mirroredNormal: mirrorNormal,
                } = getMirroredPoint(
                    startPoint,
                    currentNormal,
                    mode,
                    planeRef.current
                )

                const {
                    squarePoints: mirrorCirclePoints,
                    squareNormals: mirrorCircleNormals,
                } = generateSquarePointsWorld(
                    mirrorCenter,
                    mirrorNormal,
                    radius
                )
                const mirrorCirclePressures = Array(
                    mirrorCirclePoints.length
                ).fill(pressure)

                updateLine(
                    mirrorMeshes[mode],
                    mirrorCirclePoints,
                    mirrorCirclePressures,
                    mirrorCircleNormals
                )
            })
        } else if (drawShape === 'arc') {
            if (!startPoint || !currentNormal) return

            const radius = startPoint.distanceTo(point)
            const pressure = pressureMode ? event.pressure : 1.0

            const { arcPoints, arcNormals } = generateSemiCircleOpenArcWorld(
                startPoint,
                currentNormal,
                radius
            )

            const arcPressures = Array(arcPoints.length).fill(pressure)

            updateLine(currentMesh, arcPoints, arcPressures, arcNormals)

            activeMirrorModes.forEach((mode) => {
                const {
                    mirroredPoint: mirrorCenter,
                    mirroredNormal: mirrorNormal,
                } = getMirroredPoint(
                    startPoint,
                    currentNormal,
                    mode,
                    planeRef.current
                )

                const {
                    arcPoints: mirrorCirclePoints,
                    arcNormals: mirrorCircleNormals,
                } = generateSemiCircleOpenArcWorld(
                    mirrorCenter,
                    mirrorNormal,
                    radius
                )
                const mirrorCirclePressures = Array(
                    mirrorCirclePoints.length
                ).fill(pressure)

                updateLine(
                    mirrorMeshes[mode],
                    mirrorCirclePoints,
                    mirrorCirclePressures,
                    mirrorCircleNormals
                )
            })
        }
    }

    function stopDrawing(event) {
        if (!isDrawing || !planeRef.current) return

        const activeMirrorModes = isMirroring ? getActiveMirrorModes() : []

        if (drawShape === 'free_hand' || drawShape === 'straight') {
            if (!currentMesh || !startPoint || points.length < 2) {
                if (currentMesh) scene.remove(currentMesh)
                Object.values(mirrorMeshes).forEach((mesh) =>
                    scene.remove(mesh)
                )
                currentMesh = null
                mirrorMeshes = {}
                startPoint = null
                return
            }

            let geometry = currentMesh.geometry
            const oldMesh = currentMesh

            const initialVertexCount = geometry.attributes.position.count
            // console.log(`--- Simplification Start (Primary) ---`)
            // console.log(`Initial Vertex Count: ${initialVertexCount}`)

            // if (geometry.index) {
            //     geometry.toNonIndexed()
            // }

            const countAfterNonIndex = geometry.attributes.position.count
            const reductionCount = Math.floor(
                (countAfterNonIndex / 3) * SIMPLIFY_PERCENTAGE
            )

            const modifier = new SimplifyModifier()
            const simplifiedGeometry = modifier.modify(geometry, reductionCount)
            geometry.dispose()
            geometry = simplifiedGeometry

            // console.log(`--- Simplification Result (Primary) ---`)
            const finalVertexCount = geometry.attributes.position.count
            // console.log(`Final Vertex Count: ${finalVertexCount}`)

            const pos = geometry.attributes.position
            const finalMeshNormals = new Float32Array(pos.count * 3)
            const faceNormals = []

            for (let i = 0; i < pos.count / 3; i++) {
                const idx = i * 3
                const vA = new THREE.Vector3(
                    pos.array[idx * 3],
                    pos.array[idx * 3 + 1],
                    pos.array[idx * 3 + 2]
                )
                const vB = new THREE.Vector3(
                    pos.array[(idx + 1) * 3],
                    pos.array[(idx + 1) * 3 + 1],
                    pos.array[(idx + 1) * 3 + 2]
                )
                const vC = new THREE.Vector3(
                    pos.array[(idx + 2) * 3],
                    pos.array[(idx + 2) * 3 + 1],
                    pos.array[(idx + 2) * 3 + 2]
                )
                const cb = new THREE.Vector3().subVectors(vC, vB)
                const ab = new THREE.Vector3().subVectors(vA, vB)
                const normal = new THREE.Vector3()
                    .crossVectors(cb, ab)
                    .normalize()
                faceNormals.push(normal)
            }

            const averageNormal = new THREE.Vector3()
            faceNormals.forEach((n) => averageNormal.add(n))
            averageNormal.normalize()

            if (averageNormal.lengthSq() < 1e-6) {
                averageNormal.copy(currentNormal || new THREE.Vector3(0, 0, 1))
            }

            for (let i = 0; i < pos.count / 3; i++) {
                const normal = faceNormals[i]
                const idx = i * 3

                if (normal.dot(averageNormal) < 0) {
                    normal.negate()
                }
                normal.normalize()

                for (let j = 0; j < 3; j++) {
                    finalMeshNormals[(idx + j) * 3] = normal.x
                    finalMeshNormals[(idx + j) * 3 + 1] = normal.y
                    finalMeshNormals[(idx + j) * 3 + 2] = normal.z
                }
            }

            geometry.setAttribute(
                'normal',
                new THREE.BufferAttribute(finalMeshNormals, 3)
            )

            geometry.attributes.position.needsUpdate = true
            geometry.attributes.normal.needsUpdate = true
            geometry.computeVertexNormals()
            geometry.toNonIndexed()
            geometry.computeBoundingBox()
            geometry.computeBoundingSphere()

            let finalMaterial
            switch (activeMaterialType) {
                case 'flat':
                    finalMaterial = new THREE.MeshBasicMaterial({
                        color: new THREE.Color(strokeColor),
                        wireframe: false,
                        transparent: true,
                        opacity: strokeOpacity,
                        side: THREE.DoubleSide,
                        forceSinglePass: true,
                        depthTest: true,
                        depthWrite: true,
                        // flatShading: true,
                    })
                    break

                case 'shaded':
                    finalMaterial = new THREE.MeshStandardMaterial({
                        color: new THREE.Color(strokeColor),
                        wireframe: false,
                        transparent: true,
                        opacity: strokeOpacity,
                        side: THREE.DoubleSide,
                        forceSinglePass: true,
                        depthTest: true,
                        depthWrite: true,
                        // flatShading: true,
                    })
                    break

                case 'glow':
                    finalMaterial = new THREE.MeshStandardMaterial({
                        color: new THREE.Color(strokeColor),
                        wireframe: false,
                        emissive: new THREE.Color(strokeColor),
                        transparent: true,
                        opacity: strokeOpacity,
                        side: THREE.DoubleSide,
                        forceSinglePass: true,
                        depthTest: true,
                        depthWrite: true,
                        // flatShading: true,
                        emissiveIntensity: 1,
                    })
                    break

                default:
                    break
            }

            scene.remove(oldMesh)
            if (oldMesh.material) oldMesh.material.dispose()

            const newMesh = new THREE.Mesh(geometry, finalMaterial)

            newMesh.position.copy(oldMesh.position)
            newMesh.rotation.copy(oldMesh.rotation)
            newMesh.scale.copy(oldMesh.scale)
            newMesh.uuid = oldMesh.uuid

            // console.log({ newMesh })
            newMesh.userData = {
                type: 'Line',
                opacity: strokeOpacity,
                color: strokeColor,
                pts: points,
                pressures: pressures,
                normals: normals,
                width: strokeWidth,
                position: {
                    x: 0,
                    y: 0,
                    z: 0,
                },
                rotation: {
                    isEuler: true,
                    _x: 0,
                    _y: 0,
                    _z: 0,
                },
                scale: {
                    x: 1,
                    y: 1,
                    z: 1,
                },
                stroke_type: 'cube',
                uuid: newMesh.uuid,
            }

            // newMesh.material.flatShading = true
            newMesh.material.needsUpdate = true
            // newMesh.layers.set(1)
            scene.add(newMesh)

            // console.log(`--- Simplification End (Primary) ---`)

            activeMirrorModes.forEach((mode) => {
                const mirrorOldMesh = mirrorMeshes[mode]
                if (!mirrorOldMesh) return

                let mirrorGeometry = mirrorOldMesh.geometry

                mirrorGeometry.computeVertexNormals()
                mirrorGeometry.toNonIndexed()
                mirrorGeometry.computeBoundingBox()
                mirrorGeometry.computeBoundingSphere()

                let mirrorFinalMaterial
                switch (activeMaterialType) {
                    case 'flat':
                        mirrorFinalMaterial = new THREE.MeshBasicMaterial({
                            color: new THREE.Color(strokeColor),
                            wireframe: false,
                            transparent: true,
                            opacity: strokeOpacity,
                            side: THREE.DoubleSide,
                            forceSinglePass: true,
                            depthTest: true,
                            depthWrite: true,
                            // flatShading: true,
                        })
                        break

                    case 'shaded':
                        mirrorFinalMaterial = new THREE.MeshStandardMaterial({
                            color: new THREE.Color(strokeColor),
                            wireframe: false,
                            transparent: true,
                            opacity: strokeOpacity,
                            side: THREE.DoubleSide,
                            forceSinglePass: true,
                            depthTest: true,
                            depthWrite: true,
                            // flatShading: true,
                        })
                        break

                    case 'glow':
                        mirrorFinalMaterial = new THREE.MeshStandardMaterial({
                            color: new THREE.Color(strokeColor),
                            wireframe: false,
                            emissive: new THREE.Color(strokeColor),
                            transparent: true,
                            opacity: strokeOpacity,
                            side: THREE.DoubleSide,
                            forceSinglePass: true,
                            depthTest: true,
                            depthWrite: true,
                            // flatShading: true,
                            emissiveIntensity: 1,
                        })
                        break

                    default:
                        break
                }

                scene.remove(mirrorOldMesh)

                if (mirrorOldMesh.material) {
                    // mirrorOldMesh.dispose()
                    mirrorOldMesh.material.dispose()
                }
                const mirrorNewMesh = new THREE.Mesh(
                    mirrorGeometry,
                    mirrorFinalMaterial
                )

                mirrorNewMesh.userData = {
                    type: 'Line',
                    isMirror: true,
                    mirrorMode: mode,
                    pts: mirrorData[mode].points,
                    pressures: mirrorData[mode].pressures,
                    normals: mirrorData[mode].normals,
                    width: strokeWidth,
                    uuid: mirrorNewMesh.uuid,
                }

                // mirrorNewMesh.material.flatShading = true
                mirrorNewMesh.material.needsUpdate = true
                // mirrorNewMesh.layers.set(1)
                scene.add(mirrorNewMesh)
            })
        } else if (drawShape === 'circle') {
            const lastPoint =
                getPlaneIntersection(event)?.point || points[points.length - 1]
            const radius = startPoint.distanceTo(lastPoint)

            const { circlePoints, circleNormals } = generateCirclePointsWorld(
                startPoint,
                currentNormal,
                radius
            )

            const finalPressures = Array(circlePoints.length).fill(
                pressures[0] || 1.0
            )

            updateLine(currentMesh, circlePoints, finalPressures, circleNormals)

            const oldMesh = currentMesh
            let geometry = currentMesh.geometry

            let finalMaterial
            switch (activeMaterialType) {
                case 'flat':
                    finalMaterial = new THREE.MeshBasicMaterial({
                        color: new THREE.Color(strokeColor),
                        wireframe: false,
                        transparent: true,
                        opacity: strokeOpacity,
                        side: THREE.DoubleSide,
                        forceSinglePass: true,
                        depthTest: true,
                        depthWrite: true,
                        // flatShading: true,
                    })
                    break

                case 'shaded':
                    finalMaterial = new THREE.MeshStandardMaterial({
                        color: new THREE.Color(strokeColor),
                        wireframe: false,
                        transparent: true,
                        opacity: strokeOpacity,
                        side: THREE.DoubleSide,
                        forceSinglePass: true,
                        depthTest: true,
                        depthWrite: true,
                        // flatShading: true,
                    })
                    break

                case 'glow':
                    finalMaterial = new THREE.MeshStandardMaterial({
                        color: new THREE.Color(strokeColor),
                        wireframe: false,
                        emissive: new THREE.Color(strokeColor),
                        transparent: true,
                        opacity: strokeOpacity,
                        side: THREE.DoubleSide,
                        forceSinglePass: true,
                        depthTest: true,
                        depthWrite: true,
                        // flatShading: true,
                        emissiveIntensity: 1,
                    })
                    break

                default:
                    break
            }

            scene.remove(oldMesh)

            const newMesh = new THREE.Mesh(geometry, finalMaterial)
            geometry.computeBoundingBox()
            geometry.computeBoundingSphere()

            newMesh.position.copy(oldMesh.position)
            newMesh.rotation.copy(oldMesh.rotation)
            newMesh.scale.copy(oldMesh.scale)
            newMesh.uuid = oldMesh.uuid

            newMesh.userData = {
                type: 'Line',
                opacity: strokeOpacity,
                color: strokeColor,
                pts: circlePoints,
                pressures: finalPressures,
                normals: circleNormals,
                width: strokeWidth,
                position: {
                    x: 0,
                    y: 0,
                    z: 0,
                },
                rotation: {
                    isEuler: true,
                    _x: 0,
                    _y: 0,
                    _z: 0,
                },
                scale: {
                    x: 1,
                    y: 1,
                    z: 1,
                },
                stroke_type: 'cube',
                uuid: newMesh.uuid,
            }
            // finalMaterial.flatShading = true
            finalMaterial.needsUpdate = true
            // newMesh.layers.set(1)

            scene.add(newMesh)

            activeMirrorModes.forEach((mode) => {
                const mirrorOldMesh = mirrorMeshes[mode]
                if (!mirrorOldMesh) return

                let mirrorGeometry = mirrorOldMesh.geometry

                mirrorGeometry.computeVertexNormals()
                mirrorGeometry.toNonIndexed()
                mirrorGeometry.computeBoundingBox()
                mirrorGeometry.computeBoundingSphere()

                let mirrorFinalMaterial
                switch (activeMaterialType) {
                    case 'flat':
                        mirrorFinalMaterial = new THREE.MeshBasicMaterial({
                            color: new THREE.Color(strokeColor),
                            wireframe: false,
                            transparent: true,
                            opacity: strokeOpacity,
                            side: THREE.DoubleSide,
                            forceSinglePass: true,
                            depthTest: true,
                            depthWrite: true,
                            // flatShading: true,
                        })
                        break

                    case 'shaded':
                        mirrorFinalMaterial = new THREE.MeshStandardMaterial({
                            color: new THREE.Color(strokeColor),
                            wireframe: false,
                            transparent: true,
                            opacity: strokeOpacity,
                            side: THREE.DoubleSide,
                            forceSinglePass: true,
                            depthTest: true,
                            depthWrite: true,
                            // flatShading: true,
                        })
                        break

                    case 'glow':
                        mirrorFinalMaterial = new THREE.MeshStandardMaterial({
                            color: new THREE.Color(strokeColor),
                            wireframe: false,
                            emissive: new THREE.Color(strokeColor),
                            transparent: true,
                            opacity: strokeOpacity,
                            side: THREE.DoubleSide,
                            forceSinglePass: true,
                            depthTest: true,
                            depthWrite: true,
                            // flatShading: true,
                            emissiveIntensity: 1,
                        })
                        break

                    default:
                        break
                }

                scene.remove(mirrorOldMesh)

                if (mirrorOldMesh.material) {
                    // mirrorOldMesh.dispose()
                    mirrorOldMesh.material.dispose()
                }
                const mirrorNewMesh = new THREE.Mesh(
                    mirrorGeometry,
                    mirrorFinalMaterial
                )

                mirrorNewMesh.userData = {
                    type: 'Line',
                    isMirror: true,
                    mirrorMode: mode,
                    pts: mirrorData[mode].points,
                    pressures: mirrorData[mode].pressures,
                    normals: mirrorData[mode].normals,
                    width: strokeWidth,
                    uuid: mirrorNewMesh.uuid,
                }

                // mirrorNewMesh.material.flatShading = true
                mirrorNewMesh.material.needsUpdate = true
                // mirrorNewMesh.layers.set(1)

                scene.add(mirrorNewMesh)
            })
        } else if (drawShape === 'square') {
            const lastPoint =
                getPlaneIntersection(event)?.point || points[points.length - 1]
            const radius = startPoint.distanceTo(lastPoint)

            const { squarePoints, squareNormals } = generateSquarePointsWorld(
                startPoint,
                currentNormal,
                radius
            )

            const squareFinalPressures = Array(squarePoints.length).fill(
                pressures[0] || 1.0
            )

            updateLine(
                currentMesh,
                squarePoints,
                squareFinalPressures,
                squareNormals
            )

            const oldMesh = currentMesh
            let geometry = currentMesh.geometry

            let finalMaterial
            switch (activeMaterialType) {
                case 'flat':
                    finalMaterial = new THREE.MeshBasicMaterial({
                        color: new THREE.Color(strokeColor),
                        wireframe: false,
                        transparent: true,
                        opacity: strokeOpacity,
                        side: THREE.DoubleSide,
                        forceSinglePass: true,
                        depthTest: true,
                        depthWrite: true,
                        // flatShading: true,
                    })
                    break

                case 'shaded':
                    finalMaterial = new THREE.MeshStandardMaterial({
                        color: new THREE.Color(strokeColor),
                        wireframe: false,
                        transparent: true,
                        opacity: strokeOpacity,
                        side: THREE.DoubleSide,
                        forceSinglePass: true,
                        depthTest: true,
                        depthWrite: true,
                        // flatShading: true,
                    })
                    break

                case 'glow':
                    finalMaterial = new THREE.MeshStandardMaterial({
                        color: new THREE.Color(strokeColor),
                        wireframe: false,
                        emissive: new THREE.Color(strokeColor),
                        transparent: true,
                        opacity: strokeOpacity,
                        side: THREE.DoubleSide,
                        forceSinglePass: true,
                        depthTest: true,
                        depthWrite: true,
                        // flatShading: true,
                        emissiveIntensity: 1,
                    })
                    break

                default:
                    break
            }

            scene.remove(oldMesh)

            const newMesh = new THREE.Mesh(geometry, finalMaterial)
            geometry.computeBoundingBox()
            geometry.computeBoundingSphere()

            newMesh.position.copy(oldMesh.position)
            newMesh.rotation.copy(oldMesh.rotation)
            newMesh.scale.copy(oldMesh.scale)
            newMesh.uuid = oldMesh.uuid

            newMesh.userData = {
                type: 'Line',
                opacity: strokeOpacity,
                color: strokeColor,
                pts: squarePoints,
                pressures: squareFinalPressures,
                normals: squareNormals,
                width: strokeWidth,
                position: {
                    x: 0,
                    y: 0,
                    z: 0,
                },
                rotation: {
                    isEuler: true,
                    _x: 0,
                    _y: 0,
                    _z: 0,
                },
                scale: {
                    x: 1,
                    y: 1,
                    z: 1,
                },
                stroke_type: 'cube',
                uuid: newMesh.uuid,
            }
            // finalMaterial.flatShading = true
            finalMaterial.needsUpdate = true
            // newMesh.layers.set(1)

            scene.add(newMesh)

            activeMirrorModes.forEach((mode) => {
                const mirrorOldMesh = mirrorMeshes[mode]
                if (!mirrorOldMesh) return

                let mirrorGeometry = mirrorOldMesh.geometry

                mirrorGeometry.computeVertexNormals()
                mirrorGeometry.toNonIndexed()
                mirrorGeometry.computeBoundingBox()
                mirrorGeometry.computeBoundingSphere()

                let mirrorFinalMaterial
                switch (activeMaterialType) {
                    case 'flat':
                        mirrorFinalMaterial = new THREE.MeshBasicMaterial({
                            color: new THREE.Color(strokeColor),
                            wireframe: false,
                            transparent: true,
                            opacity: strokeOpacity,
                            side: THREE.DoubleSide,
                            forceSinglePass: true,
                            depthTest: true,
                            depthWrite: true,
                            // flatShading: true,
                        })
                        break

                    case 'shaded':
                        mirrorFinalMaterial = new THREE.MeshStandardMaterial({
                            color: new THREE.Color(strokeColor),
                            wireframe: false,
                            transparent: true,
                            opacity: strokeOpacity,
                            side: THREE.DoubleSide,
                            forceSinglePass: true,
                            depthTest: true,
                            depthWrite: true,
                            // flatShading: true,
                        })
                        break

                    case 'glow':
                        mirrorFinalMaterial = new THREE.MeshStandardMaterial({
                            color: new THREE.Color(strokeColor),
                            wireframe: false,
                            emissive: new THREE.Color(strokeColor),
                            transparent: true,
                            opacity: strokeOpacity,
                            side: THREE.DoubleSide,
                            forceSinglePass: true,
                            depthTest: true,
                            depthWrite: true,
                            // flatShading: true,
                            emissiveIntensity: 1,
                        })
                        break

                    default:
                        break
                }

                scene.remove(mirrorOldMesh)

                if (mirrorOldMesh.material) {
                    // mirrorOldMesh.dispose()
                    mirrorOldMesh.material.dispose()
                }
                const mirrorNewMesh = new THREE.Mesh(
                    mirrorGeometry,
                    mirrorFinalMaterial
                )

                mirrorNewMesh.userData = {
                    type: 'Line',
                    isMirror: true,
                    mirrorMode: mode,
                    pts: mirrorData[mode].points,
                    pressures: mirrorData[mode].pressures,
                    normals: mirrorData[mode].normals,
                    width: strokeWidth,
                    uuid: mirrorNewMesh.uuid,
                }

                // mirrorNewMesh.material.flatShading = true
                mirrorNewMesh.material.needsUpdate = true
                // mirrorNewMesh.layers.set(1)
                scene.add(mirrorNewMesh)
            })
        } else if (drawShape === 'square') {
            const lastPoint =
                getPlaneIntersection(event)?.point || points[points.length - 1]
            const radius = startPoint.distanceTo(lastPoint)

            const { squarePoints, squareNormals } = generateSquarePointsWorld(
                startPoint,
                currentNormal,
                radius
            )

            const squareFinalPressures = Array(squarePoints.length).fill(
                pressures[0] || 1.0
            )

            updateLine(
                currentMesh,
                squarePoints,
                squareFinalPressures,
                squareNormals
            )

            const oldMesh = currentMesh
            let geometry = currentMesh.geometry

            let finalMaterial
            switch (activeMaterialType) {
                case 'flat':
                    finalMaterial = new THREE.MeshBasicMaterial({
                        color: new THREE.Color(strokeColor),
                        wireframe: false,
                        transparent: true,
                        opacity: strokeOpacity,
                        side: THREE.DoubleSide,
                        forceSinglePass: true,
                        depthTest: true,
                        depthWrite: true,
                        // flatShading: true,
                    })
                    break

                case 'shaded':
                    finalMaterial = new THREE.MeshStandardMaterial({
                        color: new THREE.Color(strokeColor),
                        wireframe: false,
                        transparent: true,
                        opacity: strokeOpacity,
                        side: THREE.DoubleSide,
                        forceSinglePass: true,
                        depthTest: true,
                        depthWrite: true,
                        // flatShading: true,
                    })
                    break

                case 'glow':
                    finalMaterial = new THREE.MeshStandardMaterial({
                        color: new THREE.Color(strokeColor),
                        wireframe: false,
                        emissive: new THREE.Color(strokeColor),
                        transparent: true,
                        opacity: strokeOpacity,
                        side: THREE.DoubleSide,
                        forceSinglePass: true,
                        depthTest: true,
                        depthWrite: true,
                        // flatShading: true,
                        emissiveIntensity: 1,
                    })
                    break

                default:
                    break
            }

            scene.remove(oldMesh)

            const newMesh = new THREE.Mesh(geometry, finalMaterial)
            geometry.computeBoundingBox()
            geometry.computeBoundingSphere()

            newMesh.position.copy(oldMesh.position)
            newMesh.rotation.copy(oldMesh.rotation)
            newMesh.scale.copy(oldMesh.scale)
            newMesh.uuid = oldMesh.uuid

            newMesh.userData = {
                type: 'Line',
                opacity: strokeOpacity,
                color: strokeColor,
                pts: squarePoints,
                pressures: squareFinalPressures,
                normals: squareNormals,
                width: strokeWidth,
                position: {
                    x: 0,
                    y: 0,
                    z: 0,
                },
                rotation: {
                    isEuler: true,
                    _x: 0,
                    _y: 0,
                    _z: 0,
                },
                scale: {
                    x: 1,
                    y: 1,
                    z: 1,
                },
                stroke_type: 'cube',
                uuid: newMesh.uuid,
            }
            // finalMaterial.flatShading = true
            finalMaterial.needsUpdate = true
            // newMesh.layers.set(1)

            scene.add(newMesh)

            activeMirrorModes.forEach((mode) => {
                const mirrorOldMesh = mirrorMeshes[mode]
                if (!mirrorOldMesh) return

                let mirrorGeometry = mirrorOldMesh.geometry

                mirrorGeometry.computeVertexNormals()
                mirrorGeometry.toNonIndexed()
                mirrorGeometry.computeBoundingBox()
                mirrorGeometry.computeBoundingSphere()

                let mirrorFinalMaterial
                switch (activeMaterialType) {
                    case 'flat':
                        mirrorFinalMaterial = new THREE.MeshBasicMaterial({
                            color: new THREE.Color(strokeColor),
                            wireframe: false,
                            transparent: true,
                            opacity: strokeOpacity,
                            side: THREE.DoubleSide,
                            forceSinglePass: true,
                            depthTest: true,
                            depthWrite: true,
                            // flatShading: true,
                        })
                        break

                    case 'shaded':
                        mirrorFinalMaterial = new THREE.MeshStandardMaterial({
                            color: new THREE.Color(strokeColor),
                            wireframe: false,
                            transparent: true,
                            opacity: strokeOpacity,
                            side: THREE.DoubleSide,
                            forceSinglePass: true,
                            depthTest: true,
                            depthWrite: true,
                            // flatShading: true,
                        })
                        break

                    case 'glow':
                        mirrorFinalMaterial = new THREE.MeshStandardMaterial({
                            color: new THREE.Color(strokeColor),
                            wireframe: false,
                            emissive: new THREE.Color(strokeColor),
                            transparent: true,
                            opacity: strokeOpacity,
                            side: THREE.DoubleSide,
                            forceSinglePass: true,
                            depthTest: true,
                            depthWrite: true,
                            // flatShading: true,
                            emissiveIntensity: 1,
                        })
                        break

                    default:
                        break
                }

                scene.remove(mirrorOldMesh)

                if (mirrorOldMesh.material) {
                    // mirrorOldMesh.dispose()
                    mirrorOldMesh.material.dispose()
                }
                const mirrorNewMesh = new THREE.Mesh(
                    mirrorGeometry,
                    mirrorFinalMaterial
                )

                mirrorNewMesh.userData = {
                    type: 'Line',
                    isMirror: true,
                    mirrorMode: mode,
                    pts: mirrorData[mode].points,
                    pressures: mirrorData[mode].pressures,
                    normals: mirrorData[mode].normals,
                    width: strokeWidth,
                    uuid: mirrorNewMesh.uuid,
                }

                // mirrorNewMesh.material.flatShading = true
                mirrorNewMesh.material.needsUpdate = true
                // mirrorNewMesh.layers.set(1)
                scene.add(mirrorNewMesh)
            })
        } else if (drawShape === 'arc') {
            const lastPoint =
                getPlaneIntersection(event)?.point || points[points.length - 1]
            const radius = startPoint.distanceTo(lastPoint)

            const { arcPoints, arcNormals } = generateSemiCircleOpenArcWorld(
                startPoint,
                currentNormal,
                radius
            )

            const arcFinalPressures = Array(arcPoints.length).fill(
                pressures[0] || 1.0
            )

            updateLine(currentMesh, arcPoints, arcFinalPressures, arcPoints)

            const oldMesh = currentMesh
            let geometry = currentMesh.geometry

            let finalMaterial
            switch (activeMaterialType) {
                case 'flat':
                    finalMaterial = new THREE.MeshBasicMaterial({
                        color: new THREE.Color(strokeColor),
                        wireframe: false,
                        transparent: true,
                        opacity: strokeOpacity,
                        side: THREE.DoubleSide,
                        forceSinglePass: true,
                        depthTest: true,
                        depthWrite: true,
                        // flatShading: true,
                    })
                    break

                case 'shaded':
                    finalMaterial = new THREE.MeshStandardMaterial({
                        color: new THREE.Color(strokeColor),
                        wireframe: false,
                        transparent: true,
                        opacity: strokeOpacity,
                        side: THREE.DoubleSide,
                        forceSinglePass: true,
                        depthTest: true,
                        depthWrite: true,
                        // flatShading: true,
                    })
                    break

                case 'glow':
                    finalMaterial = new THREE.MeshStandardMaterial({
                        color: new THREE.Color(strokeColor),
                        wireframe: false,
                        emissive: new THREE.Color(strokeColor),
                        transparent: true,
                        opacity: strokeOpacity,
                        side: THREE.DoubleSide,
                        forceSinglePass: true,
                        depthTest: true,
                        depthWrite: true,
                        // flatShading: true,
                        emissiveIntensity: 1,
                    })
                    break

                default:
                    break
            }

            scene.remove(oldMesh)

            const newMesh = new THREE.Mesh(geometry, finalMaterial)
            geometry.computeBoundingBox()
            geometry.computeBoundingSphere()

            newMesh.position.copy(oldMesh.position)
            newMesh.rotation.copy(oldMesh.rotation)
            newMesh.scale.copy(oldMesh.scale)
            newMesh.uuid = oldMesh.uuid

            newMesh.userData = {
                type: 'Line',
                opacity: strokeOpacity,
                color: strokeColor,
                pts: arcPoints,
                pressures: arcFinalPressures,
                normals: arcNormals,
                width: strokeWidth,
                position: {
                    x: 0,
                    y: 0,
                    z: 0,
                },
                rotation: {
                    isEuler: true,
                    _x: 0,
                    _y: 0,
                    _z: 0,
                },
                scale: {
                    x: 1,
                    y: 1,
                    z: 1,
                },
                stroke_type: 'cube',
                uuid: newMesh.uuid,
            }
            // finalMaterial.flatShading = true
            finalMaterial.needsUpdate = true
            // newMesh.layers.set(1)

            scene.add(newMesh)

            activeMirrorModes.forEach((mode) => {
                const mirrorOldMesh = mirrorMeshes[mode]
                if (!mirrorOldMesh) return

                let mirrorGeometry = mirrorOldMesh.geometry

                mirrorGeometry.computeVertexNormals()
                mirrorGeometry.toNonIndexed()
                mirrorGeometry.computeBoundingBox()
                mirrorGeometry.computeBoundingSphere()

                let mirrorFinalMaterial
                switch (activeMaterialType) {
                    case 'flat':
                        mirrorFinalMaterial = new THREE.MeshBasicMaterial({
                            color: new THREE.Color(strokeColor),
                            wireframe: false,
                            transparent: true,
                            opacity: strokeOpacity,
                            side: THREE.DoubleSide,
                            forceSinglePass: true,
                            depthTest: true,
                            depthWrite: true,
                            // flatShading: true,
                        })
                        break

                    case 'shaded':
                        mirrorFinalMaterial = new THREE.MeshStandardMaterial({
                            color: new THREE.Color(strokeColor),
                            wireframe: false,
                            transparent: true,
                            opacity: strokeOpacity,
                            side: THREE.DoubleSide,
                            forceSinglePass: true,
                            depthTest: true,
                            depthWrite: true,
                            // flatShading: true,
                        })
                        break

                    case 'glow':
                        mirrorFinalMaterial = new THREE.MeshStandardMaterial({
                            color: new THREE.Color(strokeColor),
                            wireframe: false,
                            emissive: new THREE.Color(strokeColor),
                            transparent: true,
                            opacity: strokeOpacity,
                            side: THREE.DoubleSide,
                            forceSinglePass: true,
                            depthTest: true,
                            depthWrite: true,
                            emissiveIntensity: 1,
                        })
                        break

                    default:
                        break
                }

                scene.remove(mirrorOldMesh)

                if (mirrorOldMesh.material) {
                    // mirrorOldMesh.dispose()
                    mirrorOldMesh.material.dispose()
                }
                const mirrorNewMesh = new THREE.Mesh(
                    mirrorGeometry,
                    mirrorFinalMaterial
                )

                mirrorNewMesh.userData = {
                    type: 'Line',
                    isMirror: true,
                    mirrorMode: mode,
                    pts: mirrorData[mode].points,
                    pressures: mirrorData[mode].pressures,
                    normals: mirrorData[mode].normals,
                    width: strokeWidth,
                    uuid: mirrorNewMesh.uuid,
                }

                // mirrorNewMesh.material.flatShading = true
                mirrorNewMesh.material.needsUpdate = true
                // mirrorNewMesh.layers.set(1)
                scene.add(mirrorNewMesh)
            })
        }

        currentMesh = null
        mirrorMeshes = {}
        mirrorData = {}
        startPoint = null
        currentNormal = null
        isDrawing = false
        // console.log(`--- Drawing End ---`)
    }

    const getPlaneIntersection = useCallback(
        (event) => {
            if (!planeRef.current) return null

            const canvas = gl.domElement
            const rect = canvas.getBoundingClientRect()

            const mouse = new THREE.Vector2(
                ((event.clientX - rect.left) / rect.width) * 2 - 1,
                -((event.clientY - rect.top) / rect.height) * 2 + 1
            )

            const raycaster = new THREE.Raycaster()
            raycaster.setFromCamera(mouse, camera)

            const intersects = raycaster.intersectObject(planeRef.current)
            if (intersects.length > 0) {
                const intersection = intersects[0]
                const normal = intersection.face.normal
                    .clone()
                    .transformDirection(intersection.object.matrixWorld)
                    .normalize()
                return {
                    point: intersection.point.clone(),
                    normal,
                }
            }
            return null
        },
        [camera, gl]
    )

    return (
        <>
            {dynamicDrawingPlaneMesh && (
                <primitive
                    object={dynamicDrawingPlaneMesh}
                    ref={planeRef}
                    onPointerDown={startDrawing}
                    onPointerMove={continueDrawing}
                    onPointerUp={stopDrawing}
                />
            )}
        </>
    )
}

export default DrawLine
