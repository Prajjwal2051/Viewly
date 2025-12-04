import { useState } from "react"
import { BrowserRouter,Routes,Route,Navigate } from "react-router-dom"
import { useSelector } from "react-redux"
import {Toaster} from "react-hot-toast"


function App() {
    const [count, setCount] = useState(0)

    return (
        <>
            <h1 className="text-3xl font-bold underline">
                hello from vidnest front-end
            </h1>
        </>
    )
}

export default App
