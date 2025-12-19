import * as THREE from 'three'
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js'

export const generateScene = (scene, gD) => {
    try {
        let newGeneratedGroups = []
        for (let i = 0; i < gD.length; i++) {
            const group = gD[i]

            if (!group.deleted_at) {
                for (let j = 0; j < group.objects.length; j++) {
                    const line = group.objects[j]
                    if (!line.is_deleted) {
                        const currentMesh = [null, null, null, null]
                        let ogGeometries = []

                        for (let k = 0; k <= 3; k++) {
                            currentMesh[k] = createInitialLineMesh(
                                scene,
                                line.color,
                                line.opacity,
                                line.material_type,
                                50000,
                                line.is_mirror,
                                k
                            )

                            updateLine(
                                k,
                                line.optimization_threshold,
                                line.smooth_percentage,
                                line.shape_type,
                                currentMesh[k],
                                line.width,
                                line.stroke_opacity,
                                line.stroke_type,
                                line.color,
                                line.points,
                                line.pressures,
                                line.normals
                            )

                            const oldMesh = currentMesh[k]
                            let geometry = currentMesh[k].geometry
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
                        mergedGeo.computeVertexNormals()
                        mergedGeo.computeBoundingBox()
                        mergedGeo.computeBoundingSphere()

                        const material = getActiveMaterial(
                            line.material_type,
                            line.opacity,
                            line.color
                        )
                        const combinedMesh = new THREE.Mesh(mergedGeo, material)

                        combinedMesh.scale.set(
                            line.scale.x,
                            line.scale.y,
                            line.scale.z
                        )
                        combinedMesh.position.copy(line.position)
                        combinedMesh.quaternion.copy(line.rotation)

                        let ogLineData = {
                            type: 'LINE',
                            is_deleted: line.is_deleted,
                            is_mirror: false,
                            mirror_mode: 'NA',
                            points: line.points,
                            normals: line.normals,
                            pressures: line.pressures,
                            loft_points: line.points,
                            color: line.color,
                            width: line.width,
                            opacity: line.opacity,
                            stroke_type: line.stroke_type,
                            shape_type: line.shape_type,
                            uuid: line.uuid,
                            group_id: line.group_id,
                            material_type: line.material_type,
                            position: line.position,
                            rotation: line.rotation,
                            scale: line.scale,
                            visible: combinedMesh.visible,
                        }

                        combinedMesh.userData = ogLineData
                        scene.add(combinedMesh)
                    } else {
                        group.objects.splice(j, 1)
                    }
                }
                newGeneratedGroups.push(group)
            }
        }

        return { newGeneratedGroups, newScene: scene }
    } catch (error) {
        console.log('Error while generating scene... : ', error)
    }
}

function updateLine(
    stripId,
    optimizationThreshold,
    smoothPercentage,
    shapeType,
    mesh,
    width,
    strokeOpacity,
    strokeType,
    strokeColor,
    rawPts,
    pressuresArr,
    normalsArr
) {
    try {
        if (rawPts.length < 2) return

        const geometry = mesh.geometry

        let pts = rawPts
        let pressures = pressuresArr
        let finalNormals = normalsArr

        if (shapeType === 'free_hand') {
            pts = smoothPoints(rawPts, smoothPercentage)
            pressures = smoothArray(pressuresArr, smoothPercentage)
            const filteredResult = filterPoints(
                pts,
                pressures,
                normalsArr,
                optimizationThreshold
            )
            pts = filteredResult.filteredPts
            pressures = filteredResult.filteredPressures
            finalNormals = filteredResult.filteredNormals
        } else if (shapeType === 'straight') {
            const filteredResult = filterPoints(
                pts,
                pressures,
                normalsArr,
                optimizationThreshold
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

            let { w, h } = getAdaptiveStrokWidth(
                strokeType,
                effectivePressure,
                width
            )

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

            const normal = finalNormals[i]
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
    } catch (error) {
        console.log('Error while updating lines : ', error)
    }
}

export const getAdaptiveStrokWidth = (strokeType, pressure, width) => {
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

export const getActiveMirrorModes = (mirror) => {
    let mirrorString = []
    if (mirror.x) mirrorString.push('X')
    if (mirror.y) mirrorString.push('Y')
    if (mirror.z) mirrorString.push('Z')
    return mirrorString
}

export const getMirroredPoint = (
    cachedWorldMatrixInverseRef,
    cachedWorldMatrixRef,
    point,
    normal,
    mirrorAxis,
    planeMesh
) => {
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
}

export const generateCirclePointsWorld = (
    center,
    normal,
    radius,
    segments = 64
) => {
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
}

export const generateSemiCircleOpenArcWorld = (
    center,
    normal,
    radius,
    segments = 64
) => {
    const arcPoints = []
    const arcNormals = []

    const tempVector = new THREE.Vector3()
    const tempQuaternion = new THREE.Quaternion()

    const zAxis = new THREE.Vector3(0, 0, 1)
    tempQuaternion.setFromUnitVectors(zAxis, normal)

    for (let i = 0; i <= segments; i++) {
        const angle = Math.PI + (i / segments) * Math.PI
        tempVector.set(radius * Math.cos(angle), radius * Math.sin(angle), 0)
        tempVector.applyQuaternion(tempQuaternion).add(center)
        arcPoints.push(tempVector.clone())
        arcNormals.push(normal.clone())
    }

    return {
        arcPoints: arcPoints,
        arcNormals: arcNormals,
    }
}

export const applyTensionToPoints = (points, tensionValue) => {
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
}

export const smoothPoints = (points, percentage) => {
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
}

export const smoothArray = (arr, percentage) => {
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

export const filterPoints = (pts, pressures, normals, tolerance) => {
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
        if (
            pts.length === 3
                ? new THREE.Vector3().fromArray(pts[i])
                : pts[i].distanceTo(pts[lastKeptIndex]) >= tolerance
        ) {
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
}

export function createInitialLineMesh(
    strokeColor,
    strokeOpacity,
    activeMaterialType,
    MAX_POINTS,
    mirror,
    stripId
) {
    const maxVertices = MAX_POINTS * 4
    const positions = new Float32Array(maxVertices * 3)
    const meshNormals = new Float32Array(maxVertices * 3)
    const indices = new Uint32Array(MAX_POINTS * 24)

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('normal', new THREE.BufferAttribute(meshNormals, 3))
    geometry.setIndex(new THREE.BufferAttribute(indices, 1))
    geometry.setDrawRange(0, 0)

    let material = getActiveMaterial(
        activeMaterialType,
        strokeOpacity,
        strokeColor
    )

    const mesh = new THREE.Mesh(geometry, material)
    if (mirror && (stripId === 1 || stripId === 2 || stripId === 3)) {
        mesh.visible = false
    }

    return mesh
}

export function getSnappedLinePointsInPlane({
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
    const planeY = new THREE.Vector3().crossVectors(planeX, planeZ).normalize()

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
    }
}

export function getActiveMaterial(
    activeMaterialType,
    strokeOpacity,
    strokeColor
) {
    let baseColor = new THREE.Color(strokeColor)
    let material
    switch (activeMaterialType) {
        case 'flat':
            material = new THREE.MeshBasicMaterial({
                color: baseColor,
                wireframe: false,
                transparent: strokeOpacity < 1,
                side: THREE.DoubleSide,
                forceSinglePass: true,
                depthTest: true,
                depthWrite: true,
                opacity: strokeOpacity,
                blending: THREE.NormalBlending,
            })
            break

        case 'shaded':
            material = new THREE.MeshStandardMaterial({
                color: baseColor,
                wireframe: false,
                transparent: strokeOpacity < 1,
                side: THREE.DoubleSide,
                forceSinglePass: true,
                depthTest: true,
                depthWrite: true,
                opacity: strokeOpacity,
                blending: THREE.NormalBlending,
            })
            break

        case 'glow':
            material = new THREE.MeshStandardMaterial({
                color: baseColor,
                wireframe: false,
                transparent: strokeOpacity < 1,
                side: THREE.DoubleSide,
                forceSinglePass: true,
                depthTest: true,
                depthWrite: true,
                opacity: strokeOpacity,
                blending: THREE.NormalBlending,
                emissive: new THREE.Color(strokeColor),
                emissiveIntensity: 1,
            })
            break

        default:
            break
    }

    return material
}
