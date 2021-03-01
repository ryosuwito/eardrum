export default {
  api: {
    list: () => '/api/compliance/',
    detailsURL: (ID) => `/api/compliance/${ID}/`,
  },
  formA: {
    label: 'Form A',
    url: () => '/compliance/a',
    view: {
      label: 'Form A - View',
      url: (id) => `/compliance/a/${id}/view`,
    },
    edit: {
      label: 'Form A - Edit',
      url: (id) => `/compliance/a/${id}/edit`,
    },
    new: {
      label: 'Form A - New',
      url: () => `/compliance/a/new`,
    },
  },
}
