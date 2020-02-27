import { createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import rootReducer from "../reducers";

// state的初始值见各reducer
const store = createStore(rootReducer, applyMiddleware(thunk));
export default store;