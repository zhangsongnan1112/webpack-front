import React, { useEffect, useState } from 'react';
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

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            console.log(entries, 'entries')
            entries.forEach(item => {
                if (item.isIntersecting && item.intersectionRatio >= 1) {
                    item.target.classList.add('red');
                }
            });
        }, {
            // 当元素可见比例达到 30%、50%、100% 时触发回调
            threshold: [0.3, 1],     // 默认值为 0（仅在元素刚进入视口时触发一次）
            root: null,  // 观察的跟元素， 必须是目标元素的祖先节点 监听元素在某个滚动容器内的可见性
            rootMargin: "100px 0px" // 根容器的扩展边距. , 元素进入视口前 100px 就触发回调
        });

        const boxes = document.querySelectorAll('.hot');
        console.log(boxes, 'boxes')
        boxes.forEach(el => observer.observe(el));

        // ✅ 清理：断开观察，防止内存泄漏和卸载后回调
        return () => {
            observer.disconnect();
        };
    }, []);

  
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