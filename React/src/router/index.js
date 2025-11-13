import * as React from 'react';


  const routers =  [
    {
        path: '/home',
        name: 'home',
        component: React.lazy(() => import(
            /*  webpackChunkName: "home" */
            /*  webpackMode: "lazy" */
            '../pages/home'
        )),
    },
    {
        path: '/about',
        name: 'about',
        component: React.lazy(() => import(
            /*  webpackChunkName: "about" */
            /*  webpackMode: "lazy" */
            '../pages/about'
        )),
    }
   
]
export default routers