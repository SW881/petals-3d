import { set, get, del, createStore } from 'idb-keyval'

const linesStore = createStore('petals-3d', 'states')

export function customReplacer(key, value) {
    const excludedKeys = ['geometry', 'material', 'mesh']

    if (excludedKeys.includes(key)) {
        return undefined
    }
    return value
}

export const saveSceneLinesToIndexDB = async (lineData) => {
    try {
        const sceneKey = `lines-draft-note`
        let lineString = JSON.stringify(lineData, customReplacer, 0) // 2 for pretty printing
        let lineJson = JSON.parse(lineString)
        await set(sceneKey, lineJson, linesStore)
        return true
    } catch (err) {
        console.error('❌ Failed to save line data from IndexedDB', err)
        return false
    }
}

export const saveGroupToIndexDB = async (groupData) => {
    try {
        // if ('storage' in navigator && 'estimate' in navigator.storage) {
        //     navigator.storage.estimate().then(({ usage, quota }) => {
        //         console.log(`Used: ${usage / 1024 / 1024} MB`)
        //         console.log(`Quota: ${quota / 1024 / 1024} MB`)
        //     })
        // }
        // const sceneKey = `groups-draft-note`
        const sceneKey = 0
        await set(sceneKey, groupData, linesStore)
        return true
    } catch (err) {
        console.log({ err })
        return false
    }
}

export const clearSceneFromIndexedDB = async () => {
    try {
        const lineSceneKey = `lines-draft-note`
        // const groupSceneKey = `groups-draft-note`

        const groupSceneKey = 0

        await del(lineSceneKey, linesStore)
        await del(groupSceneKey, linesStore)
    } catch (err) {
        console.error('❌ Failed to clear scene from IndexedDB', err)
    }
}

export const loadSceneFromIndexedDB = async () => {
    try {
        const lines = `lines-draft-note`
        // const groups = `groups-draft-note`
        const groups = 0

        const lineData = await get(lines, linesStore)
        const groupData = await get(groups, linesStore)

        if (groupData || lineData) {
            return {
                lineData,
                groupData,
                success: true,
                error: 'Loaded scene from IndexedDB',
            }
        } else {
            return { success: false, error: 'No saved scene found' }
        }
    } catch (err) {
        console.error('❌ Failed to load from IndexedDB', err)
        return { success: false, error: 'Failed to load from IndexedDB' }
    }
}
