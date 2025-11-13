import React , {Suspense, lazy} from 'react';
import { Routes, Route, Link } from 'react-router-dom'

const Home =  lazy(() => import('./pages/home'))
const About = lazy(() => import('./pages/about'))

const APP = () => {
    return   (
        <div>
            <h1>App</h1>
            <ul>
                <li>
                    <Link to="/home">home</Link>
                </li>
                <li>
                    <Link to="/about">about</Link>
                </li>
            </ul>

            <Suspense fallback={<div>loading.....</div>}>
                <Routes>
                    <Route path="/home" element={<Home />}></Route>
                    <Route path="/about" element={<About />}></Route>
                </Routes>
            </Suspense>
        
        </div>
    )
}

export default APP