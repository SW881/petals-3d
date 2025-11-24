import React, { useRef, useState, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { canvasDrawStore } from '../../../hooks/useCanvasDrawStore'

const LoftGuidePlane18 = ({ onDrawingFinished, onCancel }) => {
    const { camera, mouse, raycaster, scene, invalidate } = useThree()
    const {
        radialPercentage,
        waistPercentage,
        polyCountPercentage,
        generateLoftSurface,
        loftGuidePlane,
    } = canvasDrawStore((state) => state)

    const highlighted = useRef(new Set())
    const [draggingSelection, setDraggingSelection] = useState(false)
    const loftedSurfaceRef = useRef(null)
    const prevGenerateLoftRef = useRef(false)

    useEffect(() => {
        if (loftedSurfaceRef.current && radialPercentage !== undefined) {
            const radial = radialPercentage / 100
            loftedSurfaceRef.current.setRadial(radial)
        }
    }, [radialPercentage])

    useEffect(() => {
        if (loftedSurfaceRef.current && waistPercentage !== undefined) {
            const waist = waistPercentage / 100
            loftedSurfaceRef.current.setWaist(waist)
        }
    }, [waistPercentage])

    useEffect(() => {
        if (loftedSurfaceRef.current && polyCountPercentage !== undefined) {
            const polyLevel = polyCountPercentage / 100
            loftedSurfaceRef.current.setPolyCount(polyLevel)
        }
    }, [polyCountPercentage])

    useEffect(() => {
        if (loftGuidePlane) {
            if (generateLoftSurface && !prevGenerateLoftRef.current) {
                prevGenerateLoftRef.current = true

                if (!loftedSurfaceRef.current) return

                const loftMesh = loftedSurfaceRef.current.mesh
                if (!loftMesh) return

                const currentGeometry = loftMesh.geometry
                let finalGeometry = currentGeometry.clone()

                if (finalGeometry.index !== null) {
                    finalGeometry = finalGeometry.toNonIndexed()
                }

                finalGeometry.computeVertexNormals()
                finalGeometry.computeBoundingBox()
                finalGeometry.computeBoundingSphere()
                finalGeometry.attributes.position.needsUpdate = true

                const staticMaterial = new THREE.MeshBasicMaterial({
                    color: new THREE.Color('#F2F2F2'),
                    wireframe: true,
                    transparent: true,
                    opacity: 0.25,
                    side: THREE.DoubleSide,
                    forceSinglePass: true,
                    depthTest: true,
                    depthWrite: true,
                })

                const staticMesh = new THREE.Mesh(finalGeometry, staticMaterial)
                staticMesh.userData = {
                    type: 'Loft_Surface',
                    isDrawable: true,
                }

                staticMesh.updateMatrix()
                staticMesh.updateMatrixWorld(true)

                const drawingProxyGeometry = createLoftedSurface(
                    loftedSurfaceRef.current.originalGuideSets || [],
                    {
                        segments: 32,
                        radial: loftedSurfaceRef.current.getRadial(),
                        waist: loftedSurfaceRef.current.getWaist(),
                        subdivisions: 32,
                    }
                )

                if (drawingProxyGeometry) {
                    let proxyGeo = drawingProxyGeometry.clone()
                    if (proxyGeo.index !== null) {
                        proxyGeo = proxyGeo.toNonIndexed()
                    }
                    proxyGeo.computeVertexNormals()
                    proxyGeo.computeBoundingBox()
                    proxyGeo.computeBoundingSphere()
                    proxyGeo.attributes.position.needsUpdate = true

                    const proxyMaterial = new THREE.MeshBasicMaterial({
                        visible: false,
                        side: THREE.DoubleSide,
                    })

                    const drawingProxyMesh = new THREE.Mesh(
                        proxyGeo,
                        proxyMaterial
                    )
                    drawingProxyMesh.userData = {
                        type: 'Drawing_Proxy',
                        isDrawingProxy: true,
                    }
                    drawingProxyMesh.updateMatrix()
                    drawingProxyMesh.updateMatrixWorld(true)

                    scene.add(drawingProxyMesh)
                    staticMesh.userData.drawingProxy = drawingProxyMesh
                }

                scene.remove(loftMesh)
                loftedSurfaceRef.current.dispose()
                loftedSurfaceRef.current = null

                scene.add(staticMesh)

                const selectedObjects = Array.from(highlighted.current)
                selectedObjects.forEach((obj) => {
                    let baseColor = new THREE.Color(obj.userData.color)
                    const colors = obj.geometry.attributes.color
                    if (colors) {
                        for (let i = 0; i < colors.count; i++) {
                            colors.setXYZW(
                                i,
                                baseColor.r,
                                baseColor.g,
                                baseColor.b,
                                obj.userData.opacity
                            )
                        }
                        colors.needsUpdate = true
                    }
                })
                highlighted.current.clear()

                invalidate()

                if (onDrawingFinished && staticMesh) {
                    onDrawingFinished(staticMesh)
                }
            }
        } else if (!loftGuidePlane) {
            // console.log('Resetting for cancel')
            resetHighlightedObjects()

            // Dispose lofted surface if it exists
            if (loftedSurfaceRef.current) {
                if (loftedSurfaceRef.current.mesh) {
                    scene.remove(loftedSurfaceRef.current.mesh)
                }
                loftedSurfaceRef.current.dispose()
                loftedSurfaceRef.current = null
            }

            // Reset state
            setDraggingSelection(false)
            prevGenerateLoftRef.current = false

            invalidate()
        }
    }, [
        generateLoftSurface,
        loftGuidePlane,
        scene,
        onDrawingFinished,
        invalidate,
    ])

    const resetHighlightedObjects = () => {
        const selectedObjects = Array.from(highlighted.current)
        selectedObjects.forEach((obj) => {
            if (obj.userData && obj.userData.color) {
                let baseColor = new THREE.Color(obj.userData.color)
                const colors = obj.geometry.attributes.color
                if (colors) {
                    for (let i = 0; i < colors.count; i++) {
                        colors.setXYZW(
                            i,
                            baseColor.r,
                            baseColor.g,
                            baseColor.b,
                            obj.userData.opacity
                        )
                    }
                    colors.needsUpdate = true
                }
            }
        })
        highlighted.current.clear()
    }

    const onPointerDownWindow = (event) => {
        if (event.target.localName === 'canvas') {
            setDraggingSelection(true)
        }
    }

    const onPointerUpWindow = () => {
        if (!draggingSelection) {
            setDraggingSelection(false)
            return
        }

        setDraggingSelection(false)

        const selectedObjects = Array.from(highlighted.current)
        if (selectedObjects.length === 0) return

        let guideDataSets = []

        if (selectedObjects.length > 1) {
            const combinedGuide = detectAndCombineConnectedLoop(selectedObjects)
            if (combinedGuide) {
                guideDataSets.push(combinedGuide)
            } else {
                selectedObjects.forEach((obj) => {
                    guideDataSets.push({
                        guidePoints:
                            obj.userData.loft_points || obj.userData.points,
                    })
                })
            }
        } else {
            selectedObjects.forEach((obj) => {
                guideDataSets.push({
                    guidePoints:
                        obj.userData.loft_points || obj.userData.points,
                })
            })
        }

        if (guideDataSets.length === 0) return

        const TARGET_SEGMENTS = 128

        const normalizedSets = guideDataSets.map((gs) => {
            const normalized = normalizeGuideSetNoNormals(gs)
            return {
                guidePoints: normalized.points,
                isClosed: normalized.isClosed,
            }
        })

        // ✅ KEY FIX: Use old working alignment function
        const alignedSets = alignCurvesForLofting(normalizedSets)

        // ✅ KEY FIX: Use old working resampling function
        const finalizedGuideSets = alignedSets.map((gs) => {
            const resampled = resampleCurveNoNormals(
                gs.guidePoints,
                TARGET_SEGMENTS,
                gs.isClosed
            )
            const evened = ensureEvenCount(resampled.points, gs.isClosed)
            return { guidePoints: evened.points, isClosed: gs.isClosed }
        })

        if (selectedObjects.length === finalizedGuideSets.length) {
            finalizedGuideSets.forEach((gs, i) => {
                if (selectedObjects[i] && selectedObjects[i].userData) {
                    selectedObjects[i].userData.loft_points = gs.guidePoints
                }
            })
        }

        if (finalizedGuideSets.length < 2) {
            // console.warn(
            //     'Need at least 2 guide curves for lofting. Selected:',
            //     finalizedGuideSets.length
            // )
            return
        }

        if (loftedSurfaceRef.current) {
            loftedSurfaceRef.current.dispose()
        }

        const initialRadial = (radialPercentage ?? 50) / 100
        const initialWaist = (waistPercentage ?? 50) / 100
        const initialPolyCount = (polyCountPercentage ?? 50) / 100

        loftedSurfaceRef.current = createControlledLoftedSurface(
            finalizedGuideSets,
            {
                initialRadial: initialRadial,
                initialWaist: initialWaist,
                initialPolyCount: initialPolyCount,
            }
        )

        if (loftedSurfaceRef.current?.mesh) {
            scene.add(loftedSurfaceRef.current.mesh)
            // console.log('✅ Loft surface created and added to scene')
        } else {
            // console.error('❌ Failed to create loft surface mesh')
        }

        invalidate()
    }

    // ✅ OLD WORKING VERSION: Proper alignment for closed curves
    function alignCurvesForLofting(curveSets) {
        if (curveSets.length < 2) return curveSets

        const aligned = [curveSets[0]]

        for (let i = 1; i < curveSets.length; i++) {
            const prevCurve = aligned[i - 1].guidePoints
            const currentCurve = curveSets[i].guidePoints
            const isClosed = curveSets[i].isClosed

            let alignedPoints = currentCurve

            if (isClosed) {
                alignedPoints = alignClosedCurveSeam(currentCurve, prevCurve)
            } else {
                const d1 = prevCurve[0].distanceTo(currentCurve[0])
                const d2 = prevCurve[0].distanceTo(
                    currentCurve[currentCurve.length - 1]
                )

                if (d2 < d1) {
                    alignedPoints = [...currentCurve].reverse()
                }
            }

            aligned.push({
                guidePoints: alignedPoints,
                isClosed: curveSets[i].isClosed,
            })
        }

        return aligned
    }

    // ✅ OLD WORKING VERSION: Full rotation sampling (not coarse)
    function alignClosedCurveSeam(currentCurve, previousCurve) {
        const numPoints = currentCurve.length

        let workingCurve = currentCurve
        const isLastDuplicate =
            currentCurve[0].distanceTo(currentCurve[numPoints - 1]) < 0.001
        if (isLastDuplicate) {
            workingCurve = currentCurve.slice(0, -1)
        }

        const actualLength = workingCurve.length

        let bestRotation = 0
        let bestDirection = 'normal'
        let minTotalDistance = Infinity

        // ✅ KEY FIX: Test every rotation (not every 32nd)
        for (let rotation = 0; rotation < actualLength; rotation++) {
            const totalDist = calculateRotatedDistance(
                workingCurve,
                previousCurve,
                rotation
            )

            if (totalDist < minTotalDistance) {
                minTotalDistance = totalDist
                bestRotation = rotation
                bestDirection = 'normal'
            }
        }

        const reversedCurve = [...workingCurve].reverse()
        for (let rotation = 0; rotation < actualLength; rotation++) {
            const totalDist = calculateRotatedDistance(
                reversedCurve,
                previousCurve,
                rotation
            )

            if (totalDist < minTotalDistance) {
                minTotalDistance = totalDist
                bestRotation = rotation
                bestDirection = 'reversed'
            }
        }

        let resultCurve =
            bestDirection === 'reversed' ? reversedCurve : workingCurve

        if (bestRotation > 0) {
            resultCurve = [
                ...resultCurve.slice(bestRotation),
                ...resultCurve.slice(0, bestRotation),
            ]
        }

        if (isLastDuplicate) {
            resultCurve = [...resultCurve, resultCurve[0].clone()]
        }

        return resultCurve
    }

    function calculateRotatedDistance(curve, referenceCurve, rotation) {
        const sampleCount = Math.min(20, curve.length, referenceCurve.length)
        let totalDistance = 0

        for (let i = 0; i < sampleCount; i++) {
            const refIdx = Math.floor((i / sampleCount) * referenceCurve.length)
            const currIdx =
                (Math.floor((i / sampleCount) * curve.length) + rotation) %
                curve.length

            const refPoint = referenceCurve[refIdx]
            const currPoint = curve[currIdx]

            totalDistance += refPoint.distanceTo(currPoint)
        }

        return totalDistance / sampleCount
    }

    function detectAndCombineConnectedLoop(lineObjects) {
        if (!lineObjects || lineObjects.length < 2) return null

        const OVERLAP_THRESHOLD = 0.01

        const segments = lineObjects
            .map((obj) => {
                const points =
                    obj.userData.loft_points || obj.userData.points || []
                if (points.length < 2) return null
                return {
                    points: points,
                    start: points[0],
                    end: points[points.length - 1],
                    used: false,
                }
            })
            .filter((seg) => seg !== null)

        if (segments.length < 2) return null

        const connectedChain = []
        let currentSegment = segments[0]
        currentSegment.used = true
        connectedChain.push(currentSegment)

        let currentEnd = currentSegment.end
        let foundNext = true

        while (connectedChain.length < segments.length && foundNext) {
            foundNext = false

            for (let i = 0; i < segments.length; i++) {
                if (segments[i].used) continue

                const candidate = segments[i]
                const distToStart = currentEnd.distanceTo(candidate.start)
                const distToEnd = currentEnd.distanceTo(candidate.end)

                if (distToStart < OVERLAP_THRESHOLD) {
                    candidate.used = true
                    candidate.reversed = false
                    connectedChain.push(candidate)
                    currentEnd = candidate.end
                    foundNext = true
                    break
                } else if (distToEnd < OVERLAP_THRESHOLD) {
                    candidate.used = true
                    candidate.reversed = true
                    connectedChain.push(candidate)
                    currentEnd = candidate.start
                    foundNext = true
                    break
                }
            }
        }

        if (connectedChain.length !== segments.length) {
            return null
        }

        const firstPoint = connectedChain[0].start
        const lastPoint = currentEnd
        const isClosed = firstPoint.distanceTo(lastPoint) < OVERLAP_THRESHOLD
        if (!isClosed) {
            return null
        }

        const combinedPoints = []
        for (let i = 0; i < connectedChain.length; i++) {
            const segment = connectedChain[i]
            const isLastSegment = i === connectedChain.length - 1
            if (segment.reversed) {
                const reversedPoints = [...segment.points].reverse()
                if (isLastSegment) {
                    combinedPoints.push(...reversedPoints.slice(0, -1))
                } else {
                    combinedPoints.push(...reversedPoints.slice(0, -1))
                }
            } else {
                if (isLastSegment) {
                    combinedPoints.push(...segment.points.slice(0, -1))
                } else {
                    combinedPoints.push(...segment.points.slice(0, -1))
                }
            }
        }
        combinedPoints.push(combinedPoints[0].clone())

        return {
            guidePoints: combinedPoints,
        }
    }

    useEffect(() => {
        if (!loftGuidePlane) return

        window.addEventListener('pointerdown', onPointerDownWindow)
        window.addEventListener('pointerup', onPointerUpWindow)

        return () => {
            window.removeEventListener('pointerdown', onPointerDownWindow)
            window.removeEventListener('pointerup', onPointerUpWindow)
        }
    }, [loftGuidePlane, draggingSelection])

    useFrame(() => {
        if (!draggingSelection) return

        raycaster.setFromCamera(mouse, camera)
        const objectsToTest = scene.children.filter(
            (obj) => obj.isMesh && obj.userData?.type === 'Line'
        )

        const intersects = raycaster.intersectObjects(objectsToTest, true)
        let hasNewHighlight = false

        intersects.forEach(({ object }) => {
            if (!highlighted.current.has(object)) {
                highlighted.current.add(object)
                hasNewHighlight = true

                const colors = object.geometry.attributes.color
                const greenColor = new THREE.Color('#FF4433')
                for (let i = 0; i < colors.count; i++) {
                    colors.setXYZW(
                        i,
                        greenColor.r,
                        greenColor.g,
                        greenColor.b,
                        object.userData.opacity
                    )
                }
                colors.needsUpdate = true
            }
        })

        if (hasNewHighlight) {
            invalidate()
        }
    })

    function ensureEvenCount(points, isClosed) {
        if (!points || points.length === 0) return { points: [] }

        let out = points.slice()
        const isEven = out.length % 2 === 0
        if (!isEven) {
            if (isClosed) {
                const first = out[0]
                const second = out[1] || first
                const mid = new THREE.Vector3().lerpVectors(first, second, 0.5)
                out.splice(1, 0, mid)
            } else {
                let maxLen = -1
                let maxIdx = 0
                for (let i = 0; i < out.length - 1; i++) {
                    const len = out[i].distanceTo(out[i + 1])
                    if (len > maxLen) {
                        maxLen = len
                        maxIdx = i
                    }
                }
                const mid = new THREE.Vector3().lerpVectors(
                    out[maxIdx],
                    out[maxIdx + 1],
                    0.5
                )
                out.splice(maxIdx + 1, 0, mid)
            }
        }
        return { points: out }
    }

    function normalizeGuideSetNoNormals(guideSet) {
        const pointKeys = [
            'guidePoints',
            'points',
            'circlePoints',
            'squarePoints',
            'semiCirclePoints',
            'arcPoints',
        ]

        let points = null
        for (const key of pointKeys) {
            if (
                guideSet[key] &&
                Array.isArray(guideSet[key]) &&
                guideSet[key].length > 0
            ) {
                points = [...guideSet[key]]
                break
            }
        }

        if (!points || points.length === 0) {
            throw new Error('No points found in guide set')
        }

        const isClosed =
            points.length > 2 &&
            points[0].distanceTo(points[points.length - 1]) < 1e-6

        let cleanedPoints = points
        if (isClosed) {
            cleanedPoints = points.slice(0, -1)
        }

        if (cleanedPoints.length < 2) {
            throw new Error('Need at least 2 points per curve')
        }

        return {
            points: cleanedPoints,
            isClosed: isClosed,
        }
    }

    // ✅ OLD WORKING VERSION: CatmullRom-based resampling that preserves circular shapes
    function resampleCurveNoNormals(points, targetSegments, isClosed) {
        if (!points || points.length < 2) return { points: [] }

        const useCurveInterpolation = points.length >= 4

        if (!useCurveInterpolation) {
            const sampledPoints = []
            const segCount = isClosed ? points.length : points.length - 1

            if (segCount === 0) return { points: points.slice() }

            const perSeg = Math.max(1, Math.floor(targetSegments / segCount))

            for (let i = 0; i < segCount; i++) {
                const p0 = points[i]
                const p1 = points[(i + 1) % points.length]

                for (let j = 0; j < perSeg; j++) {
                    const t = j / perSeg
                    const ip = new THREE.Vector3().lerpVectors(p0, p1, t)
                    sampledPoints.push(ip)
                }
            }

            while (sampledPoints.length < targetSegments) {
                sampledPoints.push(
                    sampledPoints[sampledPoints.length - 1].clone()
                )
            }

            if (sampledPoints.length > targetSegments) {
                sampledPoints.length = targetSegments
            }

            return { points: sampledPoints }
        }

        // Use CatmullRom curve for smooth interpolation
        const curve = new THREE.CatmullRomCurve3(
            points,
            isClosed,
            'centripetal',
            0.5
        )
        curve.arcLengthDivisions = targetSegments * 3

        const sampledPoints = curve.getSpacedPoints(targetSegments - 1)

        return { points: sampledPoints }
    }

    // ✅ HYBRID LOFTING with radial/waist controls
    function createLoftedSurface(guideSets, options = {}) {
        const {
            segments = 128,
            radial = 0.5,
            waist = 0.5,
            subdivisions = 64,
        } = options

        if (!guideSets || guideSets.length < 2) {
            return null
        }

        const normalizedGuideSets = guideSets.map((guideSet) =>
            normalizeGuideSetNoNormals(guideSet)
        )

        const isClosed = normalizedGuideSets[0].isClosed

        const resampledGuides = normalizedGuideSets.map(
            ({ points, isClosed: closed }) =>
                resampleCurveNoNormals(points, segments, closed)
        )

        const positions = []
        const indices = []
        const uvs = []

        const numGuides = resampledGuides.length
        const numPointsPerCurve = segments

        const envelopes = []
        for (let i = 0; i < numGuides - 1; i++) {
            const curve1 = resampledGuides[i].points
            const curve2 = resampledGuides[i + 1].points

            const envelope = {
                minDists: [],
                maxDists: [],
                midPoints: [],
            }

            for (let j = 0; j < numPointsPerCurve; j++) {
                const p1 = curve1[j]
                const p2 = curve2[j]
                const mid = new THREE.Vector3().lerpVectors(p1, p2, 0.5)
                const dist = p1.distanceTo(p2)

                envelope.minDists.push(0)
                envelope.maxDists.push(dist)
                envelope.midPoints.push(mid)
            }

            envelopes.push(envelope)
        }

        for (let i = 0; i < subdivisions; i++) {
            const globalT = i / (subdivisions - 1)
            const v = globalT

            const guideT = globalT * (numGuides - 1)
            const segmentIndex = Math.floor(guideT)
            const nextSegmentIndex = Math.min(segmentIndex + 1, numGuides - 1)
            const localT = guideT - segmentIndex

            const currentGuide = resampledGuides[segmentIndex]
            const nextGuide = resampledGuides[nextSegmentIndex]
            const envelope =
                envelopes[Math.min(segmentIndex, envelopes.length - 1)]

            for (let j = 0; j < numPointsPerCurve; j++) {
                const u = j / (numPointsPerCurve - 1)

                const p1 = currentGuide.points[j]
                const p2 = nextGuide.points[j]

                const basePoint = new THREE.Vector3().lerpVectors(
                    p1,
                    p2,
                    localT
                )

                let radialT = localT
                if (radial !== 0.5) {
                    const bias = (radial - 0.5) * 2
                    radialT =
                        bias < 0
                            ? Math.pow(localT, 1 - bias * 0.5)
                            : 1 - Math.pow(1 - localT, 1 + bias * 0.5)
                }

                const radialPoint = new THREE.Vector3().lerpVectors(
                    p1,
                    p2,
                    radialT
                )

                let finalPoint = radialPoint.clone()

                if (Math.abs(waist - 0.5) > 0.01 && envelope) {
                    const bulgeIntensity = (waist - 0.5) * 2.0
                    const parabola = 4 * localT * (1 - localT)

                    const direction = new THREE.Vector3().subVectors(p2, p1)

                    const prevJ = Math.max(0, j - 1)
                    const nextJ = Math.min(numPointsPerCurve - 1, j + 1)

                    const p1_prev = currentGuide.points[prevJ]
                    const p1_next = currentGuide.points[nextJ]
                    const p2_prev = nextGuide.points[prevJ]
                    const p2_next = nextGuide.points[nextJ]

                    const tangent1 = new THREE.Vector3()
                        .subVectors(p1_next, p1_prev)
                        .normalize()
                    const tangent2 = new THREE.Vector3()
                        .subVectors(p2_next, p2_prev)
                        .normalize()
                    const avgTangent = new THREE.Vector3()
                        .lerpVectors(tangent1, tangent2, localT)
                        .normalize()

                    const axialDirection = direction.clone().normalize()
                    const bulgeDirection = new THREE.Vector3().crossVectors(
                        axialDirection,
                        avgTangent
                    )

                    if (bulgeDirection.length() > 0.001) {
                        bulgeDirection.normalize()

                        const maxBulge = envelope.maxDists[j] * 0.15
                        const bulgeAmount = parabola * bulgeIntensity * maxBulge

                        finalPoint.addScaledVector(bulgeDirection, bulgeAmount)
                    }
                }

                positions.push(finalPoint.x, finalPoint.y, finalPoint.z)
                uvs.push(u, v)
            }
        }

        for (let i = 0; i < subdivisions - 1; i++) {
            for (let j = 0; j < numPointsPerCurve - 1; j++) {
                const a = i * numPointsPerCurve + j
                const b = i * numPointsPerCurve + j + 1
                const c = (i + 1) * numPointsPerCurve + j
                const d = (i + 1) * numPointsPerCurve + j + 1

                indices.push(a, b, c)
                indices.push(b, d, c)
            }

            if (isClosed) {
                const j = numPointsPerCurve - 1
                const a = i * numPointsPerCurve + j
                const b = i * numPointsPerCurve + 0
                const c = (i + 1) * numPointsPerCurve + j
                const d = (i + 1) * numPointsPerCurve + 0

                indices.push(a, b, c)
                indices.push(b, d, c)
            }
        }

        const geometry = new THREE.BufferGeometry()
        geometry.setAttribute(
            'position',
            new THREE.Float32BufferAttribute(positions, 3)
        )
        geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
        geometry.setIndex(indices)
        geometry.computeVertexNormals()

        return geometry
    }

    function createControlledLoftedSurface(guideSets, options = {}) {
        const {
            initialRadial = 0.5,
            initialWaist = 0.5,
            initialPolyCount = 0.5,
        } = options

        let currentRadial = initialRadial
        let currentWaist = initialWaist
        let currentPolyCount = initialPolyCount
        let currentGeometry = null
        let loftMesh = null
        let originalGuideSets = guideSets

        const regenerate = (
            newRadial = currentRadial,
            newWaist = currentWaist,
            newPolyCount = currentPolyCount
        ) => {
            currentRadial = Math.max(0, Math.min(1, newRadial))
            currentWaist = Math.max(0, Math.min(1, newWaist))
            currentPolyCount = Math.max(0, Math.min(1, newPolyCount))

            if (currentGeometry) currentGeometry.dispose()

            const polySquared = currentPolyCount * currentPolyCount
            const dynamicSegments = Math.floor(lerp(16, 128, polySquared))
            const dynamicSubdivisions = Math.floor(lerp(16, 128, polySquared))

            currentGeometry = createLoftedSurface(originalGuideSets, {
                segments: dynamicSegments,
                radial: currentRadial,
                waist: currentWaist,
                subdivisions: dynamicSubdivisions,
            })

            if (!currentGeometry) return null

            if (loftMesh) {
                loftMesh.geometry = currentGeometry
            } else {
                const material = new THREE.MeshBasicMaterial({
                    color: new THREE.Color('#F2F2F2'),
                    wireframe: true,
                    transparent: true,
                    opacity: 0.25,
                    side: THREE.DoubleSide,
                    forceSinglePass: true,
                    depthTest: true,
                    depthWrite: true,
                })

                loftMesh = new THREE.Mesh(currentGeometry, material)
            }

            loftMesh.userData = {
                type: 'Loft_Surface',
            }

            return loftMesh
        }

        function lerp(min, max, t) {
            return min + (max - min) * t
        }

        regenerate()

        return {
            mesh: loftMesh,
            originalGuideSets,
            setRadial: (newRadial) =>
                regenerate(newRadial, currentWaist, currentPolyCount),
            setWaist: (newWaist) =>
                regenerate(currentRadial, newWaist, currentPolyCount),
            setPolyCount: (newPolyCount) =>
                regenerate(currentRadial, currentWaist, newPolyCount),
            getRadial: () => currentRadial,
            getWaist: () => currentWaist,
            getPolyCount: () => currentPolyCount,
            dispose: () => {
                if (currentGeometry) currentGeometry.dispose()
                if (loftMesh && loftMesh.material) loftMesh.material.dispose()
                if (loftMesh && loftMesh.parent)
                    loftMesh.parent.remove(loftMesh)
            },
        }
    }

    return null
}

export default LoftGuidePlane18
