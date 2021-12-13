const UserURL = (action = '') => (id = '') =>
  id? (action? `/api/account/${id}/${action}/`:`/api/account/${id}/`): (action? `/api/account/${action}/`:`/api/account/`)

const ConfigURL = (action) => `/api/configs/${action}/`;

const URLS = {
  // AUTHENTICATION
  SIGN_IN: 'api-token-auth/',

  // USER
  USER_FETCH_ALL: UserURL()(),
  GET_CURRENT_USER: `${UserURL()()}current_user`,

  // CONFIG
  CONFIG_FETCH_GRADE_OPTIONS: ConfigURL('grade_options'),
}

export default URLS;
