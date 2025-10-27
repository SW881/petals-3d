import { useEffect, useRef } from 'react'
import DrawWorker from '../helpers/drawWorker.js?worker'

export default function useWorkerFunction() {
    const workerRef = useRef(null)
    const promisesRef = useRef({})

    useEffect(() => {
        const worker = new DrawWorker()
        workerRef.current = worker

        worker.onmessage = (e) => {
            const { id, result, error } = e.data
            const { resolve, reject } = promisesRef.current[id] || {}
            delete promisesRef.current[id]
            error ? reject(error) : resolve(result)
        }

        return () => {
            worker.terminate()
        }
    }, [])

    function runWorkerFunction(fnName, args) {
        return new Promise((resolve, reject) => {
            const id = Math.random().toString(36).substr(2, 9)
            promisesRef.current[id] = { resolve, reject }
            workerRef.current.postMessage({ id, fnName, args })
        })
    }

    return runWorkerFunction
}
