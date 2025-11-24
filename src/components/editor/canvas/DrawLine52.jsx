import React, { useRef, useState, useCallback, useEffect } from 'react'
import * as THREE from 'three'
import { useThree } from '@react-three/fiber'
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js'

import { canvasDrawStore } from '../../../hooks/useCanvasDrawStore'
import { canvasRenderStore } from '../../../hooks/useRenderSceneStore'

const DrawLine52 = ({ id }) => {
    const { camera, scene, gl } = useThree()
    const planeRef = useRef()

    const holdTimerRef = useRef(null)
    const lastPointRef = useRef(null)
    const tensionModeRef = useRef(false)
    const originalMirrorDataRef = useRef({})
    const initialTensionYRef = useRef(0)
    const [tension, setTension] = useState(0.05)

    const originalPointsRef = useRef([])
    const originalPressuresRef = useRef([])
    const originalNormalsRef = useRef([])
    const originalStrokeWidthsRef = useRef([])
    const originalShapeDataRef = useRef({
        points: [],
        normals: [],
        center: null,
        radius: 0,
        startAngle: 0,
        endAngle: 0,
    })

    const pointsRef = useRef([])
    const pressuresRef = useRef([])
    const normalsRef = useRef([])
    const currentMeshRef = useRef([null, null, null, null])
    const startPointRef = useRef(null)
    const currentNormalRef = useRef(null)
    const isDrawingRef = useRef(false)
    const mirrorDataRef = useRef({})
    const mirrorMeshesRef = useRef({
        X: [null, null, null, null],
        Y: [null, null, null, null],
        Z: [null, null, null, null],
    })

    const cachedWorldMatrixRef = useRef(null)
    const cachedWorldMatrixInverseRef = useRef(null)

    const {
        penActive,
        mirror,
        strokeType,
        strokeColor,
        strokeWidth,
        pressureMode,
        drawShapeType,
        strokeOpacity,
        activeMaterialType,
        strokeStablePercentage,
        dynamicDrawingPlaneMesh,
    } = canvasDrawStore((state) => state)

    const { activeGroup } = canvasRenderStore((state) => state)

    const MAX_POINTS = 50000
    const SMOOTH_PERCENTAGE = strokeStablePercentage
    const DISTANCE_THRESHOLD = 0.01
    const OPTIMIZATION_THRESHOLD = 0.05

    const HOLD_DURATION = 1000
    const HOLD_THRESHOLD = 0.02
    const TENSION_SENSITIVITY = 0.005

    const isMirroring = mirror.x || mirror.y || mirror.z

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
                break
        }
        return { w, h }
    }

    const getActiveMirrorModes = () => {
        let mirrorString = []
        if (mirror.x) mirrorString.push('X')
        if (mirror.y) mirrorString.push('Y')
        if (mirror.z) mirrorString.push('Z')
        return mirrorString
    }
    const activeMirrorModes = isMirroring ? getActiveMirrorModes() : []

    const getMirroredPoint = useCallback(
        (point, normal, mirrorAxis, planeMesh) => {
            if (!point || !normal || !mirrorAxis || !planeMesh)
                return {
                    mirroredPoint: null,
                    mirroredNormal: null,
                }

            if (!cachedWorldMatrixRef.current) {
                cachedWorldMatrixRef.current = planeMesh.matrixWorld.clone()
                cachedWorldMatrixInverseRef.current = new THREE.Matrix4()
                    .copy(planeMesh.matrixWorld)
                    .invert()
            }

            const worldMatrix = cachedWorldMatrixRef.current
            const worldMatrixInverse = cachedWorldMatrixInverseRef.current

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

            const globalUp = new THREE.Vector3(0, 1, 0)
            const globalRight = new THREE.Vector3(1, 0, 0)

            let startDirection = new THREE.Vector3()

            if (Math.abs(normal.dot(globalUp)) < 0.99) {
                startDirection
                    .copy(globalUp)
                    .addScaledVector(normal, -globalUp.dot(normal))
                    .normalize()
            } else {
                startDirection
                    .copy(globalRight)
                    .addScaledVector(normal, -globalRight.dot(normal))
                    .normalize()
            }

            const perpDirection = new THREE.Vector3()
                .crossVectors(normal, startDirection)
                .normalize()

            for (let i = 0; i <= segments; i++) {
                const angle = (i / segments) * Math.PI * 2

                const point = new THREE.Vector3()
                    .copy(center)
                    .addScaledVector(startDirection, radius * Math.cos(angle))
                    .addScaledVector(perpDirection, radius * Math.sin(angle))

                circlePoints.push(point)
                circleNormals.push(normal.clone())
            }

            return {
                circlePoints,
                circleNormals,
            }
        },
        []
    )

    const generateSemiCircleOpenArcWorld = useCallback(
        (center, normal, radius, segments = 64) => {
            const arcPoints = []
            const arcNormals = []

            const tempVector = new THREE.Vector3()
            const tempQuaternion = new THREE.Quaternion()

            const zAxis = new THREE.Vector3(0, 0, 1)
            tempQuaternion.setFromUnitVectors(zAxis, normal)

            for (let i = 0; i <= segments; i++) {
                const angle = Math.PI + (i / segments) * Math.PI
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

    const applyTensionToPoints = useCallback((points, tensionValue) => {
        if (points.length < 2) return points

        const tensionedPoints = []
        const start = points[0]
        const end = points[points.length - 1]

        tensionedPoints.push(start.clone())

        for (let i = 1; i < points.length - 1; i++) {
            const t = i / (points.length - 1)
            const straightPoint = new THREE.Vector3().lerpVectors(start, end, t)
            const tensionedPoint = new THREE.Vector3().lerpVectors(
                points[i],
                straightPoint,
                tensionValue
            )
            tensionedPoints.push(tensionedPoint)
        }

        tensionedPoints.push(end.clone())

        return tensionedPoints
    }, [])

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

    function createInitialLineMesh(mirror, stripId) {
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
                    vertexColors: true,
                    wireframe: false,
                    transparent: strokeOpacity < 1,
                    side: THREE.DoubleSide,
                    forceSinglePass: true,
                    depthTest: true,
                    depthWrite: strokeOpacity >= 1,
                    blending: THREE.NormalBlending,
                })
                break

            case 'shaded':
                material = new THREE.MeshStandardMaterial({
                    vertexColors: true,
                    wireframe: false,
                    transparent: strokeOpacity < 1,
                    side: THREE.DoubleSide,
                    forceSinglePass: true,
                    depthTest: true,
                    depthWrite: true,
                    blending: THREE.NoBlending,
                })
                break

            case 'glow':
                material = new THREE.MeshStandardMaterial({
                    vertexColors: true,
                    wireframe: false,
                    transparent: false,
                    side: THREE.DoubleSide,
                    forceSinglePass: true,
                    depthTest: true,
                    depthWrite: true,
                    blending: THREE.NoBlending,
                    emissive: new THREE.Color(strokeColor),
                    emissiveIntensity: 1,
                })
                break

            default:
                break
        }

        const mesh = new THREE.Mesh(geometry, material)
        if (mirror && (stripId === 1 || stripId === 2 || stripId === 3)) {
            mesh.visible = false
        }
        scene.add(mesh)
        return mesh
    }

    const startHoldTimer = (point) => {
        if (drawShapeType !== 'free_hand') {
            return
        }

        lastPointRef.current = point.clone()

        holdTimerRef.current = setTimeout(() => {
            tensionModeRef.current = true
            // console.log(`Tension mode activated for ${drawShapeType}`)

            if (drawShapeType === 'free_hand') {
                if (pointsRef.current.length > 0) {
                    const smoothed = smoothPoints(
                        [...pointsRef.current],
                        SMOOTH_PERCENTAGE
                    )
                    const smoothedPressures = smoothArray(
                        [...pressuresRef.current],
                        SMOOTH_PERCENTAGE
                    )

                    originalPointsRef.current = smoothed.map((p) => p.clone())
                    originalPressuresRef.current = [...smoothedPressures]
                    originalNormalsRef.current = [...normalsRef.current]

                    originalStrokeWidthsRef.current = []
                    for (let i = 0; i < smoothed.length; i++) {
                        let taperFactor = 1
                        if (strokeType === 'taper') {
                            const t = i / (smoothed.length - 1)
                            const taperAmount = 1.0
                            taperFactor =
                                1 -
                                taperAmount +
                                taperAmount * Math.sin(t * Math.PI)
                        }
                        const effectivePressure =
                            smoothedPressures[i] * taperFactor
                        const { w, h } = getAdaptiveStrokWidth(
                            effectivePressure,
                            strokeWidth
                        )
                        originalStrokeWidthsRef.current.push({ w, h })
                    }

                    originalMirrorDataRef.current = {}

                    activeMirrorModes.forEach((mode) => {
                        for (let i = 0; i <= 3; i++) {
                            const mirrorData = mirrorDataRef.current[mode]
                            if (mirrorData && mirrorData.points.length > 0) {
                                const smoothedMirrorPoints = smoothPoints(
                                    [...mirrorData.points],
                                    SMOOTH_PERCENTAGE
                                )
                                const smoothedMirrorPressures = smoothArray(
                                    [...mirrorData.pressures],
                                    SMOOTH_PERCENTAGE
                                )

                                originalMirrorDataRef.current[mode] = {
                                    points: smoothedMirrorPoints.map((p) =>
                                        p.clone()
                                    ),
                                    pressures: [...smoothedMirrorPressures],
                                    normals: [...mirrorData.normals],
                                    strokeWidths: [],
                                }

                                for (
                                    let i = 0;
                                    i < smoothedMirrorPoints.length;
                                    i++
                                ) {
                                    let taperFactor = 1
                                    if (strokeType === 'taper') {
                                        const t =
                                            i /
                                            (smoothedMirrorPoints.length - 1)
                                        const taperAmount = 1.0
                                        taperFactor =
                                            1 -
                                            taperAmount +
                                            taperAmount * Math.sin(t * Math.PI)
                                    }
                                    const effectivePressure =
                                        smoothedMirrorPressures[i] * taperFactor
                                    const { w, h } = getAdaptiveStrokWidth(
                                        effectivePressure,
                                        strokeWidth
                                    )
                                    originalMirrorDataRef.current[
                                        mode
                                    ].strokeWidths.push({ w, h })
                                }
                            }
                        }
                    })
                }
            }
        }, HOLD_DURATION)
    }

    const clearHoldTimer = () => {
        if (holdTimerRef.current) {
            clearTimeout(holdTimerRef.current)
            holdTimerRef.current = null
        }
    }

    const updateTensionAndLine = useCallback(
        (clientY) => {
            if (!tensionModeRef.current) return

            const deltaY = initialTensionYRef.current - clientY
            let newTension = 0.5 + deltaY * TENSION_SENSITIVITY
            newTension = Math.max(0, Math.min(1, newTension))
            setTension(newTension)

            if (drawShapeType === 'free_hand') {
                if (originalPointsRef.current.length === 0) return

                const tensionedPoints = applyTensionToPoints(
                    originalPointsRef.current,
                    newTension
                )

                if (
                    currentMeshRef.current &&
                    originalStrokeWidthsRef.current.length > 0
                ) {
                    for (let i = 0; i <= 3; i++) {
                        updateLineWithTensionAndStoredWidths(
                            i,
                            currentMeshRef.current[i],
                            tensionedPoints,
                            originalNormalsRef.current,
                            originalStrokeWidthsRef.current
                        )

                        currentMeshRef.current[i].userData.points =
                            tensionedPoints.map((p) => p.clone())
                        currentMeshRef.current[i].userData.normals =
                            originalNormalsRef.current.map((n) => n.clone())
                        currentMeshRef.current[i].userData.pressures = [
                            ...originalPressuresRef.current,
                        ]
                    }
                }

                activeMirrorModes.forEach((mode) => {
                    for (let i = 0; i <= 3; i++) {
                        const originalMirrorData =
                            originalMirrorDataRef.current[mode]
                        if (
                            originalMirrorData &&
                            mirrorMeshesRef.current[mode][i]
                        ) {
                            const tensionedMirrorPoints = applyTensionToPoints(
                                originalMirrorData.points,
                                newTension
                            )
                            updateLineWithTensionAndStoredWidths(
                                i,
                                mirrorMeshesRef.current[mode][i],
                                tensionedMirrorPoints,
                                originalMirrorData.normals,
                                originalMirrorData.strokeWidths
                            )

                            mirrorMeshesRef.current[mode][i].userData.points =
                                tensionedMirrorPoints.map((p) => p.clone())
                            mirrorMeshesRef.current[mode][i].userData.normals =
                                originalMirrorData.normals.map((n) => n.clone())
                            mirrorMeshesRef.current[mode][
                                i
                            ].userData.pressures = [
                                ...originalMirrorData.pressures,
                            ]
                        }
                    }
                })
            }
        },
        [applyTensionToPoints, isMirroring, getActiveMirrorModes]
    )

    function updateLineWithTensionAndStoredWidths(
        stripId,
        mesh,
        tensionedPoints,
        normals,
        storedWidths
    ) {
        if (tensionedPoints.length < 2) return

        const geometry = mesh.geometry

        let pts = tensionedPoints
        let finalNormals = normals
        let finalWidths = storedWidths

        if (pts.length >= 2) {
            const filteredPts = [pts[0]]
            const filteredNormals = [normals[0]]
            const filteredWidths = [storedWidths[0]]

            let lastKeptIndex = 0

            for (let i = 1; i < pts.length; i++) {
                if (
                    pts[i].distanceTo(pts[lastKeptIndex]) >=
                    OPTIMIZATION_THRESHOLD
                ) {
                    filteredPts.push(pts[i])
                    filteredNormals.push(normals[i])
                    filteredWidths.push(storedWidths[i])
                    lastKeptIndex = i
                }
            }

            if (lastKeptIndex !== pts.length - 1) {
                filteredPts.push(pts[pts.length - 1])
                filteredNormals.push(normals[normals.length - 1])
                filteredWidths.push(storedWidths[storedWidths.length - 1])
            }

            pts = filteredPts
            finalNormals = filteredNormals
            finalWidths = filteredWidths
        }

        if (pts.length < 2) return

        const positions = []
        const meshNormals = []
        const indices = []
        const colors = []

        const baseColor = new THREE.Color(strokeColor)

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

            const widthIndex = Math.min(i, finalWidths.length - 1)
            const halfW = finalWidths[widthIndex].w
            const halfH = finalWidths[widthIndex].h

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
                if (stripId === 0) {
                    indices.push(prevBase, prevBase + 1, baseIdx + 1)
                    indices.push(prevBase, baseIdx + 1, baseIdx)
                }
                if (stripId === 1) {
                    indices.push(prevBase + 1, prevBase + 2, baseIdx + 2)
                    indices.push(prevBase + 1, baseIdx + 2, baseIdx + 1)
                }
                if (stripId === 2) {
                    indices.push(prevBase + 2, prevBase + 3, baseIdx + 3)
                    indices.push(prevBase + 2, baseIdx + 3, baseIdx + 2)
                }
                if (stripId === 3) {
                    indices.push(prevBase + 3, prevBase, baseIdx)
                    indices.push(prevBase + 3, baseIdx, baseIdx + 3)
                }

                // const prevBase = baseIdx - 4
                // indices.push(prevBase, prevBase + 1, baseIdx + 1)
                // indices.push(prevBase, baseIdx + 1, baseIdx)
                // indices.push(prevBase + 1, prevBase + 2, baseIdx + 2)
                // indices.push(prevBase + 1, baseIdx + 2, baseIdx + 1)
                // indices.push(prevBase + 2, prevBase + 3, baseIdx + 3)
                // indices.push(prevBase + 2, baseIdx + 3, baseIdx + 2)
                // indices.push(prevBase + 3, prevBase, baseIdx)
                // indices.push(prevBase + 3, baseIdx, baseIdx + 3)
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
            mesh.material.needsUpdate = true
        }
    }

    function updateLine(stripId, mesh, rawPts, pressuresArr, normalsArr) {
        if (rawPts.length < 2) return

        const geometry = mesh.geometry

        let pts = rawPts
        let pressures = pressuresArr
        let finalNormals = normalsArr

        if (drawShapeType === 'free_hand' && !tensionModeRef.current) {
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
        } else if (drawShapeType === 'straight') {
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
        const colors = []

        const baseColor = new THREE.Color(strokeColor)

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
                colors.push(
                    baseColor.r,
                    baseColor.g,
                    baseColor.b,
                    strokeOpacity
                )
            })

            if (i > 0) {
                const prevBase = baseIdx - 4
                if (stripId === 0) {
                    indices.push(prevBase, prevBase + 1, baseIdx + 1)
                    indices.push(prevBase, baseIdx + 1, baseIdx)
                }
                if (stripId === 1) {
                    indices.push(prevBase + 1, prevBase + 2, baseIdx + 2)
                    indices.push(prevBase + 1, baseIdx + 2, baseIdx + 1)
                }
                if (stripId === 2) {
                    indices.push(prevBase + 2, prevBase + 3, baseIdx + 3)
                    indices.push(prevBase + 2, baseIdx + 3, baseIdx + 2)
                }
                if (stripId === 3) {
                    indices.push(prevBase + 3, prevBase, baseIdx)
                    indices.push(prevBase + 3, baseIdx, baseIdx + 3)
                }
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
        geometry.setAttribute(
            'color',
            new THREE.Float32BufferAttribute(colors, 4)
        )

        geometry.setIndex(indices)

        geometry.attributes.position.needsUpdate = true
        geometry.attributes.normal.needsUpdate = true
        geometry.index.needsUpdate = true
        geometry.setDrawRange(0, indices.length)
        // console.log({ stripId })
    }

    function startDrawing(event) {
        if (!planeRef.current) return

        isDrawingRef.current = true
        tensionModeRef.current = false
        setTension(0.5)
        originalPointsRef.current = []
        originalPressuresRef.current = []
        originalNormalsRef.current = []
        originalStrokeWidthsRef.current = []
        originalMirrorDataRef.current = {}
        pointsRef.current = []
        pressuresRef.current = []
        normalsRef.current = []
        mirrorDataRef.current = {}

        cachedWorldMatrixRef.current = null
        cachedWorldMatrixInverseRef.current = null

        const intersection = getPlaneIntersection(event)
        if (!intersection) return
        const { point, normal } = intersection

        startPointRef.current = point.clone()
        currentNormalRef.current = normal.clone()
        for (let i = 0; i <= 3; i++) {
            currentMeshRef.current[i] = createInitialLineMesh({
                is_mirror: false,
                i,
            })
        }

        activeMirrorModes.forEach((mode) => {
            for (let i = 0; i <= 3; i++) {
                //
                mirrorMeshesRef.current[mode][i] = createInitialLineMesh({
                    is_mirror: true,
                    i,
                })
                mirrorDataRef.current[mode] = {
                    points: [],
                    pressures: [],
                    normals: [],
                }
            }
        })

        const pressure = pressureMode ? event.pressure : 1.0

        pointsRef.current.push(startPointRef.current.clone())
        pressuresRef.current.push(pressure)
        normalsRef.current.push(currentNormalRef.current)

        activeMirrorModes.forEach((mode) => {
            const { mirroredPoint, mirroredNormal } = getMirroredPoint(
                startPointRef.current,
                currentNormalRef.current,
                mode,
                planeRef.current
            )
            mirrorDataRef.current[mode].points.push(mirroredPoint.clone())
            mirrorDataRef.current[mode].pressures.push(pressure)
            mirrorDataRef.current[mode].normals.push(mirroredNormal)
        })

        startHoldTimer(startPointRef.current)
        initialTensionYRef.current = event.clientY

        if (drawShapeType === 'free_hand') {
            const secondPoint = new THREE.Vector3()
                .copy(startPointRef.current)
                .addScalar(0.001)
            pointsRef.current.push(secondPoint)
            pressuresRef.current.push(pressure)
            normalsRef.current.push(currentNormalRef.current)

            activeMirrorModes.forEach((mode) => {
                const {
                    mirroredPoint: mirrorSecondPoint,
                    mirroredNormal: mirrorSecondNormal,
                } = getMirroredPoint(
                    secondPoint,
                    currentNormalRef.current,
                    mode,
                    planeRef.current
                )
                mirrorDataRef.current[mode].points.push(mirrorSecondPoint)
                mirrorDataRef.current[mode].pressures.push(pressure)
                mirrorDataRef.current[mode].normals.push(mirrorSecondNormal)
            })
        }

        for (let i = 0; i <= 3; i++) {
            updateLine(
                i,
                currentMeshRef.current[i],
                pointsRef.current,
                pressuresRef.current,
                normalsRef.current
            )
        }

        activeMirrorModes.forEach((mode) => {
            const data = mirrorDataRef.current[mode]
            for (let i = 0; i <= 3; i++) {
                updateLine(
                    i,
                    mirrorMeshesRef.current[mode][i],
                    data.points,
                    data.pressures,
                    data.normals
                )
            }
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

    function continueDrawing(event) {
        if (!isDrawingRef.current || !planeRef.current) return

        if (tensionModeRef.current) {
            updateTensionAndLine(event.clientY)
            return
        }

        const intersection = getPlaneIntersection(event)
        if (!intersection) return

        const { point, normal } = intersection

        if (drawShapeType === 'free_hand' && point && lastPointRef.current) {
            const distance = point.distanceTo(lastPointRef.current)
            if (distance > HOLD_THRESHOLD) {
                clearHoldTimer()
                startHoldTimer(point)
                initialTensionYRef.current = event.clientY
            }
        }

        const pressure = pressureMode ? event.pressure : 1.0

        if (drawShapeType === 'free_hand') {
            let newPoint = point.clone()

            const last = pointsRef.current[pointsRef.current.length - 1]
            if (newPoint.distanceTo(last) < DISTANCE_THRESHOLD) return

            pointsRef.current.push(newPoint)
            pressuresRef.current.push(pressure)
            normalsRef.current.push(normal)

            activeMirrorModes.forEach((mode) => {
                const { mirroredPoint, mirroredNormal } = getMirroredPoint(
                    newPoint,
                    normal,
                    mode,
                    planeRef.current
                )
                mirrorDataRef.current[mode].points.push(mirroredPoint)
                mirrorDataRef.current[mode].pressures.push(pressure)
                mirrorDataRef.current[mode].normals.push(mirroredNormal)
            })

            if (pointsRef.current.length > MAX_POINTS) {
                pointsRef.current.shift()
                pressuresRef.current.shift()
                normalsRef.current.shift()
                activeMirrorModes.forEach((mode) => {
                    mirrorDataRef.current[mode].points.shift()
                    mirrorDataRef.current[mode].pressures.shift()
                    mirrorDataRef.current[mode].normals.shift()
                })
            }

            for (let i = 0; i <= 3; i++) {
                updateLine(
                    i,
                    currentMeshRef.current[i],
                    pointsRef.current,
                    pressuresRef.current,
                    normalsRef.current
                )
            }

            activeMirrorModes.forEach((mode) => {
                const data = mirrorDataRef.current[mode]
                for (let i = 0; i <= 3; i++) {
                    updateLine(
                        i,
                        mirrorMeshesRef.current[mode][i],
                        data.points,
                        data.pressures,
                        data.normals
                    )
                }
            })
        } else if (drawShapeType === 'straight') {
            if (!startPointRef.current || !currentNormalRef.current) return

            const { snappedEnd } = getSnappedLinePointsInPlane({
                startPoint: startPointRef.current,
                currentPoint: point,
                normal,
                camera,
                snapAngle: 1,
                pointDensity: 0.05,
            })

            pointsRef.current.length = 0
            pressuresRef.current.length = 0
            normalsRef.current.length = 0

            if (strokeType === 'taper') {
                const positions = [
                    0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0,
                ]

                positions.forEach((t) => {
                    const point = new THREE.Vector3().lerpVectors(
                        startPointRef.current,
                        snappedEnd,
                        t
                    )
                    pointsRef.current.push(point)
                    pressuresRef.current.push(pressure)

                    const interpolatedNormal = new THREE.Vector3()
                        .lerpVectors(currentNormalRef.current, normal, t)
                        .normalize()
                    normalsRef.current.push(interpolatedNormal)
                })
            } else {
                const middlePoint = new THREE.Vector3().lerpVectors(
                    startPointRef.current,
                    snappedEnd,
                    0.5
                )

                pointsRef.current.push(startPointRef.current.clone())
                pointsRef.current.push(middlePoint)
                pointsRef.current.push(snappedEnd.clone())

                pressuresRef.current.push(pressure)
                pressuresRef.current.push(pressure)
                pressuresRef.current.push(pressure)

                normalsRef.current.push(currentNormalRef.current.clone())
                normalsRef.current.push(normal.clone())
                normalsRef.current.push(normal.clone())
            }

            for (let i = 0; i <= 3; i++) {
                updateLine(
                    i,
                    currentMeshRef.current[i],
                    pointsRef.current,
                    pressuresRef.current,
                    normalsRef.current
                )
            }

            activeMirrorModes.forEach((mode) => {
                const {
                    mirroredPoint: mirroredStart,
                    mirroredNormal: mirroredNormal1,
                } = getMirroredPoint(
                    startPointRef.current,
                    currentNormalRef.current,
                    mode,
                    planeRef.current
                )
                const {
                    mirroredPoint: mirroredEnd,
                    mirroredNormal: mirroredNormal2,
                } = getMirroredPoint(snappedEnd, normal, mode, planeRef.current)

                mirrorDataRef.current[mode].points = []
                mirrorDataRef.current[mode].pressures = []
                mirrorDataRef.current[mode].normals = []

                if (strokeType === 'taper') {
                    const positions = [0, 0.25, 0.5, 0.75, 1.0]

                    positions.forEach((t) => {
                        const mirroredPoint = new THREE.Vector3().lerpVectors(
                            mirroredStart,
                            mirroredEnd,
                            t
                        )
                        const mirroredNormal = new THREE.Vector3()
                            .lerpVectors(mirroredNormal1, mirroredNormal2, t)
                            .normalize()

                        mirrorDataRef.current[mode].points.push(mirroredPoint)
                        mirrorDataRef.current[mode].pressures.push(pressure)
                        mirrorDataRef.current[mode].normals.push(mirroredNormal)
                    })
                } else {
                    const mirroredMiddle = new THREE.Vector3().lerpVectors(
                        mirroredStart,
                        mirroredEnd,
                        0.5
                    )

                    mirrorDataRef.current[mode].points = [
                        mirroredStart,
                        mirroredMiddle,
                        mirroredEnd,
                    ]
                    mirrorDataRef.current[mode].pressures = [
                        pressure,
                        pressure,
                        pressure,
                    ]
                    mirrorDataRef.current[mode].normals = [
                        mirroredNormal1,
                        mirroredNormal2,
                        mirroredNormal2,
                    ]
                }

                for (let i = 0; i <= 3; i++) {
                    updateLine(
                        i,
                        mirrorMeshesRef.current[mode][i],
                        mirrorDataRef.current[mode].points,
                        mirrorDataRef.current[mode].pressures,
                        mirrorDataRef.current[mode].normals
                    )
                }
            })
        } else if (drawShapeType === 'circle') {
            if (!startPointRef.current || !currentNormalRef.current) return

            const radius = startPointRef.current.distanceTo(point)
            const { circlePoints, circleNormals } = generateCirclePointsWorld(
                startPointRef.current,
                currentNormalRef.current,
                radius
            )
            const circlePressures = Array(circlePoints.length).fill(pressure)

            for (let i = 0; i <= 3; i++) {
                updateLine(
                    i,
                    currentMeshRef.current[i],
                    circlePoints,
                    circlePressures,
                    circleNormals
                )
            }

            activeMirrorModes.forEach((mode) => {
                const {
                    mirroredPoint: mirrorCenter,
                    mirroredNormal: mirrorNormal,
                } = getMirroredPoint(
                    startPointRef.current,
                    currentNormalRef.current,
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

                for (let i = 0; i <= 3; i++) {
                    updateLine(
                        i,
                        mirrorMeshesRef.current[mode][i],
                        mirrorCirclePoints,
                        mirrorCirclePressures,
                        mirrorCircleNormals
                    )
                }
                mirrorDataRef.current[mode] = {
                    points: mirrorCirclePoints,
                    pressures: mirrorCirclePressures,
                    normals: mirrorCircleNormals,
                }
            })
        } else if (drawShapeType === 'arc') {
            if (!startPointRef.current || !currentNormalRef.current) return

            const radius = startPointRef.current.distanceTo(point)
            const { arcPoints, arcNormals } = generateSemiCircleOpenArcWorld(
                startPointRef.current,
                currentNormalRef.current,
                radius
            )
            const arcPressures = Array(arcPoints.length).fill(pressure)

            for (let i = 0; i <= 3; i++) {
                updateLine(
                    i,
                    currentMeshRef.current[i],
                    arcPoints,
                    arcPressures,
                    arcNormals
                )
            }

            activeMirrorModes.forEach((mode) => {
                const {
                    mirroredPoint: mirrorCenter,
                    mirroredNormal: mirrorNormal,
                } = getMirroredPoint(
                    startPointRef.current,
                    currentNormalRef.current,
                    mode,
                    planeRef.current
                )

                const {
                    arcPoints: mirrorArcPoints,
                    arcNormals: mirrorArcNormals,
                } = generateSemiCircleOpenArcWorld(
                    mirrorCenter,
                    mirrorNormal,
                    radius
                )
                const mirrorArcPressures = Array(mirrorArcPoints.length).fill(
                    pressure
                )

                for (let i = 0; i <= 3; i++) {
                    updateLine(
                        i,
                        mirrorMeshesRef.current[mode][i],
                        mirrorArcPoints,
                        mirrorArcPressures,
                        mirrorArcNormals
                    )
                }

                mirrorDataRef.current[mode] = {
                    points: mirrorArcPoints,
                    pressures: mirrorArcPressures,
                    normals: mirrorArcNormals,
                }
            })
        }
    }

    function stopDrawing(event) {
        clearHoldTimer()

        if (!isDrawingRef.current || !planeRef.current) return

        if (tensionModeRef.current) {
            tensionModeRef.current = false

            if (currentMeshRef.current?.userData?.points) {
                pointsRef.current = currentMeshRef.current.userData.points.map(
                    (p) => p.clone()
                )
                normalsRef.current =
                    currentMeshRef.current.userData.normals.map((n) =>
                        n.clone()
                    )
                pressuresRef.current = [
                    ...currentMeshRef.current.userData.pressures,
                ]
            }

            activeMirrorModes.forEach((mode) => {
                for (let i = 0; i <= 3; i++) {
                    if (mirrorMeshesRef.current[mode][i]?.userData?.points) {
                        mirrorDataRef.current[mode] = {
                            points: mirrorMeshesRef.current[mode][
                                i
                            ].userData.points.map((p) => p.clone()),
                            pressures: [
                                ...mirrorMeshesRef.current[mode][i].userData
                                    .pressures,
                            ],
                            normals: mirrorMeshesRef.current[mode][
                                i
                            ].userData.normals.map((n) => n.clone()),
                        }
                    }
                }
            })

            originalPointsRef.current = []
            originalPressuresRef.current = []
            originalNormalsRef.current = []
            originalStrokeWidthsRef.current = []
            originalMirrorDataRef.current = {}
            originalShapeDataRef.current = {
                points: [],
                normals: [],
                center: null,
                radius: 0,
                startAngle: 0,
                endAngle: 0,
            }
        }

        if (drawShapeType === 'free_hand' || drawShapeType === 'straight') {
            if (
                !currentMeshRef.current ||
                !startPointRef.current ||
                pointsRef.current.length < 2
            ) {
                if (currentMeshRef.current) scene.remove(currentMeshRef.current)
                Object.values(mirrorMeshesRef.current).forEach((mesh) =>
                    scene.remove(mesh)
                )
                currentMeshRef.current = [null, null, null, null]
                mirrorMeshesRef.current = {
                    X: [null, null, null, null],
                    Y: [null, null, null, null],
                    Z: [null, null, null, null],
                }
                startPointRef.current = null
                return
            }

            let ogGeometries = []
            for (let i = 0; i <= 3; i++) {
                const oldMesh = currentMeshRef.current[i]
                let geometry = currentMeshRef.current[i].geometry
                geometry.computeBoundingBox()
                geometry.computeBoundingSphere()
                ogGeometries.push(geometry)

                scene.remove(oldMesh)
                oldMesh.geometry.dispose()

                if (Array.isArray(oldMesh.material)) {
                    oldMesh.material.forEach((m) => m.dispose())
                } else if (oldMesh.material) {
                    oldMesh.material.dispose()
                }
            }

            const mergedGeo = BufferGeometryUtils.mergeGeometries(
                ogGeometries,
                false
            )

            if (!mergedGeo.attributes.color) {
                const count = mergedGeo.attributes.position.count
                const colors = new Float32Array(count * 4) // RGBA

                const strokeColorObj = new THREE.Color(strokeColor)
                for (let i = 0; i < count; i++) {
                    colors[i * 4 + 0] = strokeColorObj.r
                    colors[i * 4 + 1] = strokeColorObj.g
                    colors[i * 4 + 2] = strokeColorObj.b
                    colors[i * 4 + 3] = strokeOpacity ?? 1.0
                }

                mergedGeo.setAttribute(
                    'color',
                    new THREE.BufferAttribute(colors, 4)
                )
            }

            let material
            switch (activeMaterialType) {
                case 'flat':
                    material = new THREE.MeshBasicMaterial({
                        vertexColors: true,
                        wireframe: false,
                        transparent: strokeOpacity < 1,
                        side: THREE.DoubleSide,
                        forceSinglePass: true,
                        depthTest: true,
                        depthWrite: strokeOpacity >= 1,
                        blending: THREE.NormalBlending,
                    })
                    break

                case 'shaded':
                    material = new THREE.MeshStandardMaterial({
                        vertexColors: true,
                        wireframe: false,
                        transparent: strokeOpacity < 1,
                        side: THREE.DoubleSide,
                        forceSinglePass: true,
                        depthTest: true,
                        depthWrite: true,
                        blending: THREE.NoBlending,
                    })
                    break

                case 'glow':
                    material = new THREE.MeshStandardMaterial({
                        vertexColors: true,
                        wireframe: false,
                        transparent: false,
                        side: THREE.DoubleSide,
                        forceSinglePass: true,
                        depthTest: true,
                        depthWrite: true,
                        blending: THREE.NoBlending,
                        emissive: new THREE.Color(strokeColor),
                        emissiveIntensity: 1,
                    })
                    break

                default:
                    break
            }

            const combinedMesh = new THREE.Mesh(mergedGeo, material)
            combinedMesh.geometry.toNonIndexed()
            combinedMesh.geometry.computeVertexNormals()
            combinedMesh.geometry.computeBoundingBox()
            combinedMesh.geometry.computeBoundingSphere()

            combinedMesh.userData = {
                type: 'Line',
                note_id: id,
                is_mirror: false,
                mirror_mode: 'NA',
                points: pointsRef.current,
                normals: normalsRef.current,
                pressures: pressuresRef.current,
                loft_points: pointsRef.current,
                color: strokeColor,
                width: strokeWidth,
                opacity: strokeOpacity,
                stroke_type: strokeType,
                shape_type: drawShapeType,
                uuid: combinedMesh.uuid,
                group_id: activeGroup,
                position: { x: 0, y: 0, z: 0 },
                rotation: { x: 0, y: 0, z: 0, w: 1 },
                scale: { x: 1, y: 1, z: 1 },
            }

            scene.add(combinedMesh)

            activeMirrorModes.forEach((mode) => {
                let ogMirrorGeometries = []
                let mirrorMaterial
                switch (activeMaterialType) {
                    case 'flat':
                        mirrorMaterial = new THREE.MeshBasicMaterial({
                            vertexColors: true,
                            wireframe: false,
                            transparent: strokeOpacity < 1,
                            side: THREE.DoubleSide,
                            forceSinglePass: true,
                            depthTest: true,
                            depthWrite: strokeOpacity >= 1,
                            blending: THREE.NormalBlending,
                        })
                        break

                    case 'shaded':
                        mirrorMaterial = new THREE.MeshStandardMaterial({
                            vertexColors: true,
                            wireframe: false,
                            transparent: strokeOpacity < 1,
                            side: THREE.DoubleSide,
                            forceSinglePass: true,
                            depthTest: true,
                            depthWrite: true,
                            blending: THREE.NoBlending,
                        })
                        break

                    case 'glow':
                        mirrorMaterial = new THREE.MeshStandardMaterial({
                            vertexColors: true,
                            wireframe: false,
                            transparent: false,
                            side: THREE.DoubleSide,
                            forceSinglePass: true,
                            depthTest: true,
                            depthWrite: true,
                            blending: THREE.NoBlending,
                            emissive: new THREE.Color(strokeColor),
                            emissiveIntensity: 1,
                        })
                        break

                    default:
                        break
                }

                for (let i = 0; i <= 3; i++) {
                    const mirrorOldMesh = mirrorMeshesRef.current[mode][i]
                    let geometry = mirrorOldMesh.geometry
                    geometry.computeBoundingBox()
                    geometry.computeBoundingSphere()
                    ogMirrorGeometries.push(geometry)

                    scene.remove(mirrorOldMesh)
                    mirrorOldMesh.geometry.dispose()

                    if (Array.isArray(mirrorOldMesh.material)) {
                        mirrorOldMesh.material.forEach((m) => m.dispose())
                    } else if (mirrorOldMesh.material) {
                        mirrorOldMesh.material.dispose()
                    }
                }

                const mergedMirrorGeo =
                    BufferGeometryUtils.mergeGeometries(ogMirrorGeometries)

                const combinedMirrorMesh = new THREE.Mesh(
                    mergedMirrorGeo,
                    mirrorMaterial
                )
                combinedMirrorMesh.geometry.computeVertexNormals()
                combinedMirrorMesh.geometry.computeBoundingBox()
                combinedMirrorMesh.geometry.computeBoundingSphere()

                combinedMirrorMesh.userData = {
                    type: 'Line',
                    note_id: id,
                    is_mirror: false,
                    mirror_mode: 'NA',
                    points: mirrorDataRef.current[mode].points,
                    normals: mirrorDataRef.current[mode].normals,
                    pressures: mirrorDataRef.current[mode].pressures,
                    loft_points: mirrorDataRef.current[mode].points,

                    color: strokeColor,
                    width: strokeWidth,
                    opacity: strokeOpacity,
                    stroke_type: strokeType,
                    shape_type: drawShapeType,
                    uuid: combinedMirrorMesh.uuid,
                    group_id: activeGroup,
                    position: { x: 0, y: 0, z: 0 },
                    rotation: { x: 0, y: 0, z: 0, w: 1 },
                    scale: { x: 1, y: 1, z: 1 },
                }
                scene.add(combinedMirrorMesh)
            })
        } else if (drawShapeType === 'circle') {
            const intersection = getPlaneIntersection(event)
            const lastPoint =
                intersection?.point ||
                pointsRef.current[pointsRef.current.length - 1]
            const radius = startPointRef.current.distanceTo(lastPoint)

            const { circlePoints, circleNormals } = generateCirclePointsWorld(
                startPointRef.current,
                currentNormalRef.current,
                radius
            )
            const finalPressures = Array(circlePoints.length).fill(
                pressuresRef.current[0] || 1.0
            )

            let ogGeometries = []
            for (let i = 0; i <= 3; i++) {
                const oldMesh = currentMeshRef.current[i]
                let geometry = currentMeshRef.current[i].geometry
                geometry.computeBoundingBox()
                geometry.computeBoundingSphere()
                ogGeometries.push(geometry)

                scene.remove(oldMesh)
                oldMesh.geometry.dispose()

                if (Array.isArray(oldMesh.material)) {
                    oldMesh.material.forEach((m) => m.dispose())
                } else if (oldMesh.material) {
                    oldMesh.material.dispose()
                }
            }

            const mergedGeo = BufferGeometryUtils.mergeGeometries(ogGeometries)

            if (!mergedGeo.attributes.color) {
                const count = mergedGeo.attributes.position.count
                const colors = new Float32Array(count * 4) // RGBA

                const strokeColorObj = new THREE.Color(strokeColor)
                for (let i = 0; i < count; i++) {
                    colors[i * 4 + 0] = strokeColorObj.r
                    colors[i * 4 + 1] = strokeColorObj.g
                    colors[i * 4 + 2] = strokeColorObj.b
                    colors[i * 4 + 3] = strokeOpacity ?? 1.0
                }

                mergedGeo.setAttribute(
                    'color',
                    new THREE.BufferAttribute(colors, 4)
                )
            }

            let material
            switch (activeMaterialType) {
                case 'flat':
                    material = new THREE.MeshBasicMaterial({
                        vertexColors: true,
                        wireframe: false,
                        transparent: strokeOpacity < 1,
                        side: THREE.DoubleSide,
                        forceSinglePass: true,
                        depthTest: true,
                        depthWrite: strokeOpacity >= 1,
                        blending: THREE.NormalBlending,
                    })
                    break

                case 'shaded':
                    material = new THREE.MeshStandardMaterial({
                        vertexColors: true,
                        wireframe: false,
                        transparent: strokeOpacity < 1,
                        side: THREE.DoubleSide,
                        forceSinglePass: true,
                        depthTest: true,
                        depthWrite: true,
                        blending: THREE.NoBlending,
                    })
                    break

                case 'glow':
                    material = new THREE.MeshStandardMaterial({
                        vertexColors: true,
                        wireframe: false,
                        transparent: false,
                        side: THREE.DoubleSide,
                        forceSinglePass: true,
                        depthTest: true,
                        depthWrite: true,
                        blending: THREE.NoBlending,
                        emissive: new THREE.Color(strokeColor),
                        emissiveIntensity: 1,
                    })
                    break

                default:
                    break
            }

            const combinedMesh = new THREE.Mesh(mergedGeo, material)
            combinedMesh.geometry.toNonIndexed()
            combinedMesh.geometry.computeVertexNormals()
            combinedMesh.geometry.computeBoundingBox()
            combinedMesh.geometry.computeBoundingSphere()

            combinedMesh.userData = {
                type: 'Line',
                note_id: id,
                is_mirror: false,
                mirror_mode: 'NA',
                points: circlePoints,
                normals: circleNormals,
                pressures: finalPressures,
                loft_points: circlePoints,
                color: strokeColor,
                width: strokeWidth,
                opacity: strokeOpacity,
                stroke_type: strokeType,
                shape_type: drawShapeType,
                uuid: combinedMesh.uuid,
                group_id: activeGroup,
                position: { x: 0, y: 0, z: 0 },
                rotation: { x: 0, y: 0, z: 0, w: 1 },
                scale: { x: 1, y: 1, z: 1 },
            }
            scene.add(combinedMesh)

            activeMirrorModes.forEach((mode) => {
                let ogMirrorGeometries = []
                let mirrorMaterial
                switch (activeMaterialType) {
                    case 'flat':
                        mirrorMaterial = new THREE.MeshBasicMaterial({
                            vertexColors: true,
                            wireframe: false,
                            transparent: strokeOpacity < 1,
                            side: THREE.DoubleSide,
                            forceSinglePass: true,
                            depthTest: true,
                            depthWrite: strokeOpacity >= 1,
                            blending: THREE.NormalBlending,
                        })
                        break

                    case 'shaded':
                        mirrorMaterial = new THREE.MeshStandardMaterial({
                            vertexColors: true,
                            wireframe: false,
                            transparent: strokeOpacity < 1,
                            side: THREE.DoubleSide,
                            forceSinglePass: true,
                            depthTest: true,
                            depthWrite: true,
                            blending: THREE.NoBlending,
                        })
                        break

                    case 'glow':
                        mirrorMaterial = new THREE.MeshStandardMaterial({
                            vertexColors: true,
                            wireframe: false,
                            transparent: false,
                            side: THREE.DoubleSide,
                            forceSinglePass: true,
                            depthTest: true,
                            depthWrite: true,
                            blending: THREE.NoBlending,
                            emissive: new THREE.Color(strokeColor),
                            emissiveIntensity: 1,
                        })
                        break

                    default:
                        break
                }

                for (let i = 0; i <= 3; i++) {
                    const mirrorOldMesh = mirrorMeshesRef.current[mode][i]
                    let geometry = mirrorOldMesh.geometry
                    geometry.computeBoundingBox()
                    geometry.computeBoundingSphere()
                    ogMirrorGeometries.push(geometry)

                    scene.remove(mirrorOldMesh)
                    mirrorOldMesh.geometry.dispose()

                    if (Array.isArray(mirrorOldMesh.material)) {
                        mirrorOldMesh.material.forEach((m) => m.dispose())
                    } else if (mirrorOldMesh.material) {
                        mirrorOldMesh.material.dispose()
                    }
                }

                const mergedMirrorGeo =
                    BufferGeometryUtils.mergeGeometries(ogMirrorGeometries)

                const combinedMirrorMesh = new THREE.Mesh(
                    mergedMirrorGeo,
                    mirrorMaterial
                )
                combinedMirrorMesh.geometry.computeVertexNormals()
                combinedMirrorMesh.geometry.computeBoundingBox()
                combinedMirrorMesh.geometry.computeBoundingSphere()

                combinedMirrorMesh.userData = {
                    type: 'Line',
                    note_id: id,
                    is_mirror: false,
                    mirror_mode: 'NA',
                    points: mirrorDataRef.current[mode].points,
                    normals: mirrorDataRef.current[mode].normals,
                    pressures: mirrorDataRef.current[mode].pressures,
                    loft_points: mirrorDataRef.current[mode].points,
                    color: strokeColor,
                    width: strokeWidth,
                    opacity: strokeOpacity,
                    stroke_type: strokeType,
                    shape_type: drawShapeType,
                    uuid: combinedMirrorMesh.uuid,
                    group_id: activeGroup,
                    position: { x: 0, y: 0, z: 0 },
                    rotation: { x: 0, y: 0, z: 0, w: 1 },
                    scale: { x: 1, y: 1, z: 1 },
                }
                scene.add(combinedMirrorMesh)
            })
        } else if (drawShapeType === 'arc') {
            const intersection = getPlaneIntersection(event)
            const lastPoint =
                intersection?.point ||
                pointsRef.current[pointsRef.current.length - 1]
            const radius = startPointRef.current.distanceTo(lastPoint)

            const { arcPoints, arcNormals } = generateSemiCircleOpenArcWorld(
                startPointRef.current,
                currentNormalRef.current,
                radius
            )
            const arcFinalPressures = Array(arcPoints.length).fill(
                pressuresRef.current[0] || 1.0
            )

            let ogGeometries = []
            for (let i = 0; i <= 3; i++) {
                const oldMesh = currentMeshRef.current[i]
                let geometry = currentMeshRef.current[i].geometry
                geometry.computeBoundingBox()
                geometry.computeBoundingSphere()
                ogGeometries.push(geometry)

                scene.remove(oldMesh)
                oldMesh.geometry.dispose()

                if (Array.isArray(oldMesh.material)) {
                    oldMesh.material.forEach((m) => m.dispose())
                } else if (oldMesh.material) {
                    oldMesh.material.dispose()
                }
            }

            const mergedGeo = BufferGeometryUtils.mergeGeometries(ogGeometries)

            if (!mergedGeo.attributes.color) {
                const count = mergedGeo.attributes.position.count
                const colors = new Float32Array(count * 4) // RGBA

                const strokeColorObj = new THREE.Color(strokeColor)
                for (let i = 0; i < count; i++) {
                    colors[i * 4 + 0] = strokeColorObj.r
                    colors[i * 4 + 1] = strokeColorObj.g
                    colors[i * 4 + 2] = strokeColorObj.b
                    colors[i * 4 + 3] = strokeOpacity ?? 1.0
                }

                mergedGeo.setAttribute(
                    'color',
                    new THREE.BufferAttribute(colors, 4)
                )
            }

            let material
            switch (activeMaterialType) {
                case 'flat':
                    material = new THREE.MeshBasicMaterial({
                        vertexColors: true,
                        wireframe: false,
                        transparent: strokeOpacity < 1,
                        side: THREE.DoubleSide,
                        forceSinglePass: true,
                        depthTest: true,
                        depthWrite: strokeOpacity >= 1,
                        blending: THREE.NormalBlending,
                    })
                    break

                case 'shaded':
                    material = new THREE.MeshStandardMaterial({
                        vertexColors: true,
                        wireframe: false,
                        transparent: strokeOpacity < 1,
                        side: THREE.DoubleSide,
                        forceSinglePass: true,
                        depthTest: true,
                        depthWrite: true,
                        blending: THREE.NoBlending,
                    })
                    break

                case 'glow':
                    material = new THREE.MeshStandardMaterial({
                        vertexColors: true,
                        wireframe: false,
                        transparent: false,
                        side: THREE.DoubleSide,
                        forceSinglePass: true,
                        depthTest: true,
                        depthWrite: true,
                        blending: THREE.NoBlending,
                        emissive: new THREE.Color(strokeColor),
                        emissiveIntensity: 1,
                    })
                    break

                default:
                    break
            }

            const combinedMesh = new THREE.Mesh(mergedGeo, material)
            combinedMesh.geometry.toNonIndexed()
            combinedMesh.geometry.computeVertexNormals()
            combinedMesh.geometry.computeBoundingBox()
            combinedMesh.geometry.computeBoundingSphere()

            combinedMesh.userData = {
                type: 'Line',
                note_id: id,
                is_mirror: false,
                mirror_mode: 'NA',
                points: arcPoints,
                normals: arcNormals,
                pressures: arcFinalPressures,
                loft_points: arcPoints,
                color: strokeColor,
                width: strokeWidth,
                opacity: strokeOpacity,
                stroke_type: strokeType,
                shape_type: drawShapeType,
                uuid: combinedMesh.uuid,
                group_id: activeGroup,
                position: { x: 0, y: 0, z: 0 },
                rotation: { x: 0, y: 0, z: 0, w: 1 },
                scale: { x: 1, y: 1, z: 1 },
            }
            scene.add(combinedMesh)

            activeMirrorModes.forEach((mode) => {
                let ogMirrorGeometries = []
                let mirrorMaterial
                switch (activeMaterialType) {
                    case 'flat':
                        mirrorMaterial = new THREE.MeshBasicMaterial({
                            vertexColors: true,
                            wireframe: false,
                            transparent: strokeOpacity < 1,
                            side: THREE.DoubleSide,
                            forceSinglePass: true,
                            depthTest: true,
                            depthWrite: strokeOpacity >= 1,
                            blending: THREE.NormalBlending,
                        })
                        break

                    case 'shaded':
                        mirrorMaterial = new THREE.MeshStandardMaterial({
                            vertexColors: true,
                            wireframe: false,
                            transparent: strokeOpacity < 1,
                            side: THREE.DoubleSide,
                            forceSinglePass: true,
                            depthTest: true,
                            depthWrite: true,
                            blending: THREE.NoBlending,
                        })
                        break

                    case 'glow':
                        mirrorMaterial = new THREE.MeshStandardMaterial({
                            vertexColors: true,
                            wireframe: false,
                            transparent: false,
                            side: THREE.DoubleSide,
                            forceSinglePass: true,
                            depthTest: true,
                            depthWrite: true,
                            blending: THREE.NoBlending,
                            emissive: new THREE.Color(strokeColor),
                            emissiveIntensity: 1,
                        })
                        break

                    default:
                        break
                }

                for (let i = 0; i <= 3; i++) {
                    const mirrorOldMesh = mirrorMeshesRef.current[mode][i]
                    let geometry = mirrorOldMesh.geometry
                    geometry.computeBoundingBox()
                    geometry.computeBoundingSphere()
                    ogMirrorGeometries.push(geometry)

                    scene.remove(mirrorOldMesh)
                    mirrorOldMesh.geometry.dispose()

                    if (Array.isArray(mirrorOldMesh.material)) {
                        mirrorOldMesh.material.forEach((m) => m.dispose())
                    } else if (mirrorOldMesh.material) {
                        mirrorOldMesh.material.dispose()
                    }
                }

                const mergedMirrorGeo =
                    BufferGeometryUtils.mergeGeometries(ogMirrorGeometries)

                const combinedMirrorMesh = new THREE.Mesh(
                    mergedMirrorGeo,
                    mirrorMaterial
                )
                combinedMirrorMesh.geometry.computeVertexNormals()
                combinedMirrorMesh.geometry.computeBoundingBox()
                combinedMirrorMesh.geometry.computeBoundingSphere()

                combinedMirrorMesh.userData = {
                    type: 'Line',
                    note_id: id,
                    is_mirror: false,
                    mirror_mode: 'NA',
                    points: mirrorDataRef.current[mode].points,
                    normals: mirrorDataRef.current[mode].normals,
                    pressures: mirrorDataRef.current[mode].pressures,
                    loft_points: mirrorDataRef.current[mode].points,
                    color: strokeColor,
                    width: strokeWidth,
                    opacity: strokeOpacity,
                    stroke_type: strokeType,
                    shape_type: drawShapeType,
                    uuid: combinedMirrorMesh.uuid,
                    group_id: activeGroup,
                    position: { x: 0, y: 0, z: 0 },
                    rotation: { x: 0, y: 0, z: 0, w: 1 },
                    scale: { x: 1, y: 1, z: 1 },
                }
                scene.add(combinedMirrorMesh)
            })
        }

        currentMeshRef.current = [null, null, null, null]
        mirrorMeshesRef.current = {
            X: [null, null, null, null],
            Y: [null, null, null, null],
            Z: [null, null, null, null],
        }
        mirrorDataRef.current = {}
        startPointRef.current = null
        currentNormalRef.current = null
        isDrawingRef.current = false
        // console.log({ scene })
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

    useEffect(() => {
        return () => {
            clearHoldTimer()
        }
    }, [])

    return (
        <>
            {dynamicDrawingPlaneMesh && (
                <primitive
                    object={dynamicDrawingPlaneMesh}
                    ref={planeRef}
                    onPointerDown={penActive && startDrawing}
                    onPointerMove={penActive && continueDrawing}
                    onPointerUp={penActive && stopDrawing}
                    onPointerOut={penActive && stopDrawing}
                />
            )}
        </>
    )
}

export default DrawLine52
