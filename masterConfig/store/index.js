import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import mConfigReducer from '../reducers/mConfigReducer'

const initialState = {
  records: [],
  loading: false,
  error: null
};

const store = createStore(
  mConfigReducer,
  initialState,
  applyMiddleware(thunk)
)

export default store;
