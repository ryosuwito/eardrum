const RequestURL = (action = '') => (id = '') => (
  id? (action? `/api/requests/${id}/${action}/`:`/api/requests/${id}/`):'api/requests/'
)
const ConfigURL = (action) => `/api/configs/${action}/`;

const URLS = {
  // AUTHENTICATION
  SIGN_IN: 'api-token-auth/',

  // REQUEST
  REQUEST_FETCH_ALL: RequestURL()(),
  REQUEST_FETCH_ONE: RequestURL(),
  REQUEST_SEND_REVIEW: RequestURL(),

  // CONFIG
  CONFIG_FETCH_GRADE_OPTIONS: ConfigURL('grade_options'),
}

export default URLS;
