/* eslint-disable no-shadow */
import React, {useEffect, useState} from 'react'
import {Popconfirm, Table, Space, Menu, Dropdown, Button, message, Tabs} from 'antd'
import {Link, useParams, useHistory } from 'react-router-dom'
import axios from 'axios';
import Container from './components/Container';
import {useCurrentUser, useDeleteOne, useUpdateOne} from './hooks';
import _ from 'lodash';


import routes from './routes';
import messages from './messages';


const {TabPane} = Tabs


const columns = {
  a: [
    {
      title: 'Period',
      render: (text, record) => {
        const data = record.json_data;
        return data.submissionDate;
      },
    },
  ],
  b: [
    {
      title: 'Period',
      render: (text, record) => {
        const data = record.json_data;
        return data.year;
      },
    },
  ],
  c: [
    {
      title: 'Period',
      render: (text, record) => {
        const data = record.json_data;
        return `${data.quarter}/${data.year}`;
      },
    },
  ],
};

const FormList = ({columns, formType, isLoading, removeForm, data}) => {
  const [_, formRoute] = Object.entries(routes).find(([key, route]) => route.type === formType);

  if (!formRoute) return null;

  const initColumns = [
    {
      title: 'Submitted by',
      dataIndex: 'submit_by',
      key: 'submit_by',
      filters: [...new Set(data.map((item) => item.submit_by))].map((submitBy) => ({
        text: submitBy,
        value: submitBy,
      })),
      filterMultiple: true,
      onFilter: (value, record) => record.submit_by.indexOf(value) === 0,
    },
    {
      title: 'Action',
      key: 'action',
      render: (text, record) => {
        return (
          <Space size='middle'>
            <Link to={formRoute.view.url(record.id)}>View</Link>
            <Link to={formRoute.edit.url(record.id)}>Edit</Link>
            <DeleteButtonWithPopConfirm pk={record.id} removeForm={removeForm} />
          </Space>
        );
      },
    },
  ];

  const mergedColumns = [...columns, ...initColumns];

  return (
    <>
      <Space style={{ width: '100%', marginBottom: '10px' }} align='end' direction='vertical'>
        <Link to={formRoute.new.url()}>
          <Button type='primary'>New</Button>
        </Link>
      </Space>
      <h2 style={{ textAlign: 'center' }}>{messages[formType].name}</h2>
      <Table loading={isLoading} rowKey={(record) => record.id} columns={mergedColumns} dataSource={data} />
    </>
  );
}

const FormDList = ({isLoading, removeForm, changeFormStatus, data}) => {
  const [loading, res, error] = useCurrentUser();
  if (error) {
    message.error('Errors occured while fetching user!.');
    return null;
  }

  const AprroveRejectButton = ({ record }) => {
    const pk = record.id;
    const [save, loading, response, error] = useUpdateOne(pk);

    useEffect(() => {
      if (loading === false) {
        if (response !== null) {
          changeFormStatus(pk, response.data.status)
          message.success('Form status was changed successfully!');
        }

        if (error !== null) {
          console.log(error)
          message.error('Errors occured while changing form status.');
        }
      }
    }, [loading, response, error])

    const changeStatus = (status) => () => {
      save({ status, data: record.json_data });
    };

    const approveForm = changeStatus('approved');
    const rejectForm = changeStatus('rejected');

    return (
      <div style={{ display: 'flex' }}>
        <Popconfirm onConfirm={approveForm} title='Are you sure?'>
          <Button type='link'>Approve</Button>
        </Popconfirm>
        <Popconfirm onConfirm={rejectForm} title='Are you sure?'>
          <Button type='link' danger>
            Reject
          </Button>
        </Popconfirm>
      </div>
    );
  };

  const columns = [
    {
      title: 'Period',
      render: (text, record) => {
        const data = record.json_data
        return data.submissionDate
      },
    },
    {
      title: 'Submitted by',
      dataIndex: 'submit_by',
      key: 'submit_by',
      filters: [...new Set(data.map((item) => item.submit_by))].map((submitBy) => ({text: submitBy, value: submitBy})),
      filterMultiple: true,
      onFilter: (value, record) => record.submit_by.indexOf(value) === 0,
    },
    {
      title: 'Status',
      dataIndex: 'status',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (text, record) => {
        return (
          <Space size='middle'>
            <Link to={ routes.formD.view.url(record.id) }>View</Link>
            {!loading && res.data.is_admin && <AprroveRejectButton record={record} />}
            <Link to={routes.formD.edit.url(record.id)}>Edit</Link>
            <DeleteButtonWithPopConfirm pk={record.id} removeForm={removeForm} />
          </Space>
        );
      },
    },
  ]

  return (
    <>
      <Space style={{ width: '100%', marginBottom: '10px' }} align='end' direction='vertical'>
        <Link to={routes.formD.new.url()}>
          <Button type='primary'>New</Button>
        </Link>
      </Space>
      <h2 style={{ textAlign: 'center' }}>{messages.d.name}</h2>
      <Table loading={isLoading} rowKey={(record) => record.id} columns={columns} dataSource={data} />
    </>
  );
}

const DeleteButtonWithPopConfirm = ({ pk, removeForm }) => {
  const [deleteForm, loading, response, error] = useDeleteOne(pk);

  useEffect(() => {
    if (loading === false) {
      if (response !== null) {
        removeForm(pk);
        message.success('Form has been deleted successfully!');
      }

      if (error !== null) {
        message.error('Errors occured while deleting form.');
      }
    }
  }, [loading, response, error, removeForm]);

  return (
    <Popconfirm onConfirm={deleteForm} title='Are you sure?'>
      <Button type='link' danger>
        Delete
      </Button>
    </Popconfirm>
  );
};


const ComplianceApp = () => {
  const [forms, setFormList] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const { typ } = useParams()
  console.log('FormType: ' + typ);

  const history = useHistory();

  useEffect(() => {
    setIsLoading(true)

    axios
      .get(routes.api.list())
      .then(({data}) => {
        setFormList(data)
      })
      .catch((err) => {
        console.log(err)
        message.error('Could not fetch forms. Errors occured while fetching.')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  const removeForm = (pk) => {
    setFormList((forms) => forms.filter((form) => form.id !== pk));
  };

  const changeFormStatus = (pk, status) => {
    const index = forms.findIndex((f) => f.id === pk);
    if (!index) return;

    const newForms = _.cloneDeep(forms);
    const newItem = { ...newForms[index], status };
    newForms.splice(index, 1, newItem);

    setFormList(newForms);
  };

  function onTabKeyChange(key) {
    history.push('/compliance/' + key)
  }

  return (
    <Container>
     <Tabs onChange={onTabKeyChange} type='card' activeKey={typ}>
        {Object.entries(messages).map(([typ, form]) => {
          const specificFormList = forms.filter((form) => form.typ === typ);

          if (['a', 'b', 'c'].includes(typ)) {
            return (
              <TabPane tab={form.name} key={typ}>
                <FormList
                  columns={columns[typ]}
                  data={specificFormList}
                  isLoading={isLoading}
                  removeForm={removeForm}
                  formType={typ}
                />
              </TabPane>
            );
          }

          return (
            <TabPane tab={form.name} key={typ}>
              <FormDList
                changeFormStatus={changeFormStatus}
                removeForm={removeForm}
                data={specificFormList}
                isLoading={isLoading}
              />
            </TabPane>
          );
        })}
      </Tabs>
    </Container>
  )
}

export default ComplianceApp;


// {/* <PrivateRoute path="/compliance/a/new" component={ FormAEdit } /> */}
// <PrivateRoute path="/compliance/a/:pk/view" component={ FormAView } />
// {/* <PrivateRoute path="/compliance/a/:pk/edit" component={ FormAEdit } /> */}
// <PrivateRoute path="/compliance/:typ" component={ ComplianceApp } />
