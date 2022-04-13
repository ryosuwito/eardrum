export const AuthType = {
  // AUTHENTICATION
  AUTH_SIGN_IN: 'auth_sign_in',
  AUTH_SIGN_IN_ERROR: 'auth_sign_in_error',
  AUTH_SIGN_OUT: 'auth_sign_out',
};

const ActionTypes = {
  ...AuthType,

  // USER
  USER_FETCH_ALL: 'user_fetch_all',
  USER_FETCH_ALL_ERROR: 'user_fetch_all_error',
  USER_FETCH_ONE: 'user_fetch_one',
  GET_CURRENT_USER: 'user_fetch_one',
  USER_FETCH_ONE_ERROR: 'user_fetch_one_error',

  // QUESTION
  QUESTION_FETCH_ALL: 'question_fetch_all',
  QUESTION_FETCH_ALL_ERROR: 'question_fetch_all_error',
  QUESTION_FETCH_ONE: 'question_fetch_one',
  QUESTION_FETCH_ONE_ERROR: 'question_fetch_one_error',

  // BUCKET
  BUCKET_FETCH_ALL: 'bucket_fetch_all',
  BUCKET_FETCH_ALL_ERROR: 'bucket_fetch_all_error',
  BUCKET_FETCH_ONE: 'bucket_fetch_one',
  BUCKET_FETCH_ONE_ERROR: 'bucket_fetch_one_error',

  // CONFIG
  CONFIG_FETCH_GRADE_OPTIONS: 'config_fetch_grade_options',
  CONFIG_FETCH_GRADE_OPTIONS_ERROR: 'config_fetch_grade_options_error',

  // NOTIFICATION
  SNACKBAR_ENQUEUE: 'snackbar_enqueue',
  SNACKBAR_CLOSE: 'snackbar_close',
  SNACKBAR_REMOVE: 'snackbar_remove',


  // OTHER
  API_CALL_SUCCESS: 'api_call_success',
  API_CALL_ERROR: 'api_call_error',
};

export default ActionTypes;
