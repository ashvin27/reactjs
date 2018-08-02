import {
  FETCH_RECORDS_BEGIN,
  FETCH_RECORDS_SUCCESS,
  FETCH_RECORDS_FAILURE,
  ADD_RECORD,
  UPDATE_RECORD,
  DELETE_RECORD
} from '../actions/mConfigActions';

const initialState = {
  records: [],
  loading: false,
  error: null
};

export default function mConfigReducer(state = initialState, action) {
  switch(action.type) {
    case FETCH_RECORDS_BEGIN:
      // Mark the state as "loading" so we can show a spinner or something
      // Also, reset any errors. We're starting fresh.
      return {
        ...state,
        records: [],
        loading: true,
        error: null
      };

    case FETCH_RECORDS_SUCCESS:
      // All done: set loading "false".
      // Also, replace the items with the ones from the server
      return {
        ...state,
        loading: false,
        records: action.records
      };

    case FETCH_RECORDS_FAILURE:
      // The request failed, but it did stop, so set loading to "false".
      // Save the error, and we can display it somewhere
      // Since it failed, we don't have items to display anymore, so set it empty.
      // This is up to you and your app though: maybe you want to keep the items
      // around! Do whatever seems right.
      return {
        ...state,
        loading: false,
        error: action.error,
        records: []
      };

    case ADD_RECORD:
      return {
        ...state,
        records: [action.record, ...state.records]
      };

    case UPDATE_RECORD:
      let records = [...state.records];
      records[action.index] = action.record;
      return {
        ...state,
        records: [...records]
      };

    case DELETE_RECORD:
      return {
        ...state,
        records: [
          ...state.records.slice(0, action.index),
          ...state.records.slice(parseInt(action.index) + 1)
        ]
      };
    default:
      // ALWAYS have a default case in a reducer
      return state;
  }
}
