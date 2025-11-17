import React , {Suspense, lazy} from 'react';
import { Routes, Route, Link } from 'react-router-dom'
import routers from './router';

// const Home =  lazy(() => import('./pages/home'))
// const About = lazy(() => import('./pages/about'))
console.log(routers, 1)
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
                    {routers.map(router => (
                        <Route
                            key={router.path}  // 必须添加 key，避免 React 列表渲染警告
                            path={router.path}
                            element={<router.component />}
                        />
                    ))}
                </Routes>
            </Suspense>
        
        </div>
    )
}

export default APP