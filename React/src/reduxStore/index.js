
import { createStore, combineReducers } from 'redux';

import counterReducer from './count';
import userReducer from './user';


const store = createStore(
    combineReducers({
        count: counterReducer, 
        user: userReducer    
    })

);

export default store;
