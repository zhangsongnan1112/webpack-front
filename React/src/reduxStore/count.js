// 初始状态（只有一个 count 字段，值为 0）
const initialState = {
    count: 0
};

function counterReducer(state = initialState, action) {
    switch (action.type) {
        case 'INCREMENT':
            return {
                ...state, 
                count: state.count + action.count
            };
        case 'REDUCE':
            return {
                ...state,
                count: state.count - action.count
            };
        default:
            return state;
    }
}

export default counterReducer;