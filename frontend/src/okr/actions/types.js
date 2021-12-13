import { AuthType } from '../../actions/types';

export default {
  ...AuthType,
  OKR_FETCH_ALL: 'okr_fetch_all',
  OKR_FETCH_ALL_ERROR: 'okr_fetch_all_error',
  OKR_FETCH_ONE: 'okr_fetch_one',
  OKR_FETCH_ONE_ERROR: 'okr_fetch_one_error',
  OKR_FILE_FETCH_ONE: 'okr_file_fetch_one',
  OKR_FILE_FETCH_ONE_ERROR: 'okr_file_fetch_one_error',
};
