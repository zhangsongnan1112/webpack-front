const countModels =  {
    state: {
        count: 0
    },
    reducers: {
        increment: (state, payload) => ({
            ...state, 
            count: state.count + payload 
        }),
        decrement: (state, payload) => ({
            ...state, 
            count: state.count - payload
        }),
        reset: () => 0,
    },
    effects: (dispatch) => ({
        async incrementAsync(payload, rootState) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            dispatch.count.increment(payload);
        }
    }),
};

export default countModels