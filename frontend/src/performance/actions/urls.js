const RequestURL = (action = '') => (id = '') =>
  id ? (action ? `/api/requests/${id}/${action}/` : `/api/requests/${id}/`) : '/api/requests/';

export default {
  REQUEST_ACTION: RequestURL,
  REQUEST_FETCH_ALL: RequestURL()(),
  REQUEST_FETCH_ONE: RequestURL(),
  REQUEST_SEND_REVIEW: RequestURL(),
};
