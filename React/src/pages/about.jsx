import React from 'react';
import { Button } from 'antd';
import { useSelector, useDispatch } from 'react-redux';

function App() {
    const count = useSelector(state => state.count.count);
    const {name, age} = useSelector(state => state.user);
    const dispatch = useDispatch();

    const handleIncrement = () => {
        dispatch({ type: 'INCREMENT', count: 2 });
    };
    const handleRuduce = () => {
        dispatch({ type: 'REDUCE' , count: 2});
    }

    const user = useSelector(state => console.log(state, 'state'))
    return (
        <div style={{ padding: '50px', fontSize: '24px', textAlign: 'center' }}>
            <h1>Redux 简单计数器</h1>
            <p>当前数字：{count}</p>
            <Button onClick={handleIncrement}>+</Button>
            <Button onClick={handleRuduce}>-</Button>
            <p className='pink'>Name: {name} Age: {age}</p>
            <Button type="primary" onClick={() => { dispatch({ type: 'SETNAME', name: 2 }); }}>name</Button>
            <Button type="primary"  onClick={() => { dispatch({ type: 'ADDAGE', name: 2 }); }}>age</Button>
        </div>
    );
}

export default App;