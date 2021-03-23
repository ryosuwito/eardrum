const OKRURL = (action = '') => (id = '') =>
  id ? (action ? `/api/okrs/${id}/${action}/` : `/api/okrs/${id}/`) : '/api/okrs/';

export default {
  OKR_FETCH_ALL: OKRURL()(),
  OKR_FETCH_ONE: OKRURL(),
  OKR_DETAIL_URL: OKRURL(),
};
