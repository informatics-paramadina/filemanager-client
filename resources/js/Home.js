import { Route, Routes } from "react-router"
import FileManager from "./pages/FileManajer"
import Login from "./pages/Login"

const Home = () => {
    return (
        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/f" element={<FileManager />} />
        </Routes>
    )
}
export default Home
