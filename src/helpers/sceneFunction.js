import { set, get, del, createStore } from 'idb-keyval'

const linesStore = createStore('petals-3d', 'lines')

function customReplacer(key, value) {
    const excludedKeys = ['geometry', 'material', 'mesh']

    if (excludedKeys.includes(key)) {
        return undefined
    }
    return value
}

export const saveSceneLinesToIndexDB = async (lineData, id) => {
    try {
        const sceneKey = `lines-draft-note-1`
        // console.log({ lineData })
        let lineString = JSON.stringify(lineData, customReplacer, 0) // 2 for pretty printing
        let lineJson = JSON.parse(lineString)
        await set(sceneKey, lineJson, linesStore)
        // await set(`groups-${sceneKey}`, lineData, linesStore)
        // console.log('✅ Saved line data from IndexedDB:', lineJson)
        return true
    } catch (err) {
        console.error('❌ Failed to save line data from IndexedDB', err)
        return false
    }
}

export const saveGroupToIndexDB = async (groupData, id) => {
    try {
        const sceneKey = `groups-draft-note-1`
        await set(sceneKey, groupData, linesStore)
        console.log('Saved Group ...')
        return true
    } catch (err) {
        console.log('Failed to save Group ...')
        return false
    }
}

export const clearSceneFromIndexedDB = async (id) => {
    try {
        const lineSceneKey = `lines-draft-note-1`
        const groupSceneKey = `groups-draft-note-1`

        await del(lineSceneKey, linesStore)
        await del(groupSceneKey, linesStore)

        console.log('🧹 Scene cleared from IndexedDB')
    } catch (err) {
        console.error('❌ Failed to clear scene from IndexedDB', err)
    }
}

export const loadSceneFromIndexedDB = async (id) => {
    try {
        const lines = `lines-draft-note-1`
        const groups = `groups-draft-note-1`

        const lineData = await get(lines, linesStore)
        const groupData = await get(groups, linesStore)

        console.log({ groupData })
        if (groupData || lineData) {
            console.log('✅ Loaded lines data from IndexedDB:', lineData)
            console.log('✅ Loaded groups data from IndexedDB:', groupData)

            return {
                lineData,
                groupData,
                success: true,
                error: 'Loaded scene from IndexedDB',
            }
        } else {
            console.log('ℹ️ No saved scene found.')
            return { success: false, error: 'No saved scene found' }
        }
    } catch (err) {
        console.error('❌ Failed to load from IndexedDB', err)
        return { success: false, error: 'Failed to load from IndexedDB' }
    }
}
