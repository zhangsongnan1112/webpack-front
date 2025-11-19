
const initialState = {
    name: 'zz',
    age: 18
};

function userReducer(state = initialState, action) {
    switch (action.type) {
        case 'SETNAME':
            return {
                ...state,
                name: action.name
            };
        case 'ADDAGE':
            return {
                ...state,
                age: state.age + 1
            };
        default:
            return state;
    }
}

export default userReducer;