const OKRURL = (action = '') => (id = '') =>
  id ? (action ? `/api/okrs/${id}/${action}/` : `/api/okrs/${id}/`) : (action ? `/api/okrs/${action}/` : '/api/okrs/');

const OKRFILEURL = (id = '') =>
  id ? `/api/okrfiles/?okr=${id}` : '/api/okrfiles/';

const OKRFILEDELETEURL = (id = '') =>
  `/api/okrfiles/${id}/`;

export default {
  OKR_ACTION: OKRURL,
  OKR_FETCH_ALL: OKRURL()(),
  OKR_FETCH_ONE: OKRURL(),
  OKR_DETAIL_URL: OKRURL(),
  OKR_FILE_FETCH_ALL: OKRFILEURL,
  OKR_FILE_FETCH_ONE: OKRFILEURL,
  OKR_FILE_DETAIL_URL: OKRFILEURL,
  OKR_FILE_DELETE_URL: OKRFILEDELETEURL,
};
