import { combineReducers } from 'redux'
import {
  ADD_CONFIG
} from '../actions';

const initialState = {
  records: []
}

function masterConfigs(state = initialState, action) {
  switch (action.type) {
    case ADD_CONFIG:
      return [
        ...state,
        records: {
          text: action.text,
          completed: false
        }
      ]
    default:
      return state
  }
}

const masterConfigApp = combineReducers({
  masterConfigs
})

export default masterConfigApp;
