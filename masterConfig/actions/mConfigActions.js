export const FETCH_RECORDS_BEGIN   = 'FETCH_RECORDS_BEGIN';
export const FETCH_RECORDS_SUCCESS = 'FETCH_RECORDS_SUCCESS';
export const FETCH_RECORDS_FAILURE = 'FETCH_RECORDS_FAILURE';
export const ADD_RECORD            = 'ADD_RECORD';
export const UPDATE_RECORD         = 'UPDATE_RECORD';
export const DELETE_RECORD         = 'DELETE_RECORD';
const URL = "admin/masterConfig/";

export const fetchRecordsBegin = () => ({
  type: FETCH_RECORDS_BEGIN
});

export const fetchRecordsSuccess = data => ({
  type: FETCH_RECORDS_SUCCESS,
  records: data
});

export const fetchRecordsError = error => ({
  type: FETCH_RECORDS_FAILURE,
  error: error
});

export const addRecord = record => ({
  type: ADD_RECORD,
  record: record
});

export const updateRecord = data => ({
  type: UPDATE_RECORD,
  index: data.index,
  record: data.record
});

export const deleteRecord = index => ({
  type: DELETE_RECORD,
  index: index
});

export function fetchRecords() {
  return dispatch => {
    dispatch(fetchRecordsBegin());
    $.ajax({
      url: SITE_URL + URL + "list/",
      type: 'POST',
      dataType: 'json',
      data: {
        [CSRF_TOK_NAME]: getCSRFToken()
      },
      beforeSend: () => {
      },
      complete: () => {},
      success: ({data, message, response_tag, status}, textStatus, xhr) => {
        expTokenRedirect({response_tag:response_tag});
        dispatch(fetchRecordsSuccess(data));
      },
      error: (jqXHR) => {
        dispatch(fetchRecordsFailure(error))
        ajaxErrorHandling(jqXHR);
      }
    });
    /*return fetch("/records")
      .then(handleErrors)
      .then(res => res.json())
      .then(json => {
        dispatch(fetchRecordsSuccess(json.records));
        return json.records;
      })
      .catch(error => dispatch(fetchRecordsFailure(error)));*/
  };
}

// Handle HTTP errors since fetch won't.
function handleErrors(response) {
  if (!response.ok) {
    throw Error(response.statusText);
  }
  return response;
}
