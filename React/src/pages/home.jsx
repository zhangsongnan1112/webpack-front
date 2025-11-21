import React from 'react';
import './index.scss'
import { useSelector, useDispatch } from 'react-redux';
import { Button } from 'antd';


const APP = () => {
    // https://api.cursor.sh/ping
    const count = useSelector((state) => state.count.count)
    const dispatch = useDispatch();

    const increment = () => {
        dispatch.count.increment(1)
    }
    const decrement = () => {
        dispatch.count.decrement(1)
    }
    const incrementAsync = () => {
        dispatch.count.incrementAsync(1)
    }
    return (
        <div>
            <h1 className="hot">Home~~</h1>
            <h1 className="hot">{count}</h1>
            <Button onClick={increment}>加</Button> 
            <Button onClick={decrement} >减</Button>
            <Button onClick={incrementAsync} >异步加</Button>
            {/* webpack 压缩图片 */}
            {/* <img className="imgname" src={require('../assets/1.png')} ></img> */}
        </div>
       
    )
}

export default APP