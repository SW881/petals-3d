import React from 'react'

import Editor from './components/canvas-operations/Editor'
import { ToastContainer } from 'react-toastify'

const App = () => {
    return (
        <>
            <ToastContainer />
            <Editor />
        </>
    )
}

export default App
