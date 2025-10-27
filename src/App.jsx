import React from 'react'
import { AuthContextProvider } from './context/AuthContext'
import { RouterProvider } from 'react-router-dom'
import { router } from './routes/router'

const App = () => {
    return (
        <AuthContextProvider>
            <RouterProvider router={router} />
        </AuthContextProvider>
    )
}

export default App
