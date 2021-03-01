/* eslint-disable no-shadow */
import React, {useEffect, useState} from 'react'
import {Popconfirm, Table, Space, Menu, Dropdown, Button, message, Tabs} from 'antd'
import { DownOutlined } from '@ant-design/icons'
import {Link, useParams, useHistory, Switch, Route } from 'react-router-dom'
import axios from 'axios'

import routes from './routes'
import messages from './messages'


require('react-dom');
window.React2 = require('react');
console.log('Check react-dom');
console.log(window.React1 === window.React2);
console.log('End Check')

const {TabPane} = Tabs


const FormAList = ({onRowDelete, isLoading, data}) => {
  const columns = [
    {
      title: 'Title',
      dataIndex: 'id',
      key: 'id',
      render: (text, record) => {
        const form = messages[record.typ]
        return <Link to={ routes.formA.view.url(record.id) }>{form.name}</Link>
      },
    },
    {
      title: 'Period',
      render: (text, record) => {
        const data = record.json_data
        return data.submissionDate
      },
    },
    {
      title: 'Submit By',
      dataIndex: 'submit_by',
      key: 'submit_by',
      filters: [...new Set(data.map((item) => item.submit_by))].map((submitBy) => ({text: submitBy, value: submitBy})),
      filterMultiple: true,
      onFilter: (value, record) => record.submit_by.indexOf(value) === 0,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (text, record) => {
        return (
          <Space size='middle'>
            <Link to={ routes.formA.edit.url(record.id) }>Edit</Link>
              <Popconfirm onConfirm={ onRowDelete } title="Are you sure?">
                <Button type='link' danger>Delete</Button>
              </Popconfirm>
          </Space>
        )
      },
    },
  ]

  return <Table loading={ isLoading } rowKey={(record) => record.id} columns={columns} dataSource={data} />
}


const FormBList = ({onRowDelete, isLoading, data}) => {
  return (<div>FormBList</div>)
}


const FormCList = ({onRowDelete, isLoading, data}) => {
  return (<div>FormCList</div>)
}


const FormDList = ({onRowDelete, isLoading, data}) => {
  return (<div>FormDList</div>)
}


const ComplianceApp = () => {
  const [forms, setFormList] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const { typ } = useParams()
  console.log('FormType: ' + typ);

  const history = useHistory()
  const typeToFormComponent = {
    a: FormAList,
    b: FormBList,
    c: FormCList,
    d: FormDList,
  }

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

  function onTabKeyChange(key) {
    history.push('/compliance/' + key)
  }

  const onDelete = (formId) => async () => {
    try {
      const res = await axios.delete(routes.api.detailsURL(formId))

      if (res.status === 204) {
        setFormList((forms) => forms.filter((form) => form.id !== formId))
        message.success('Form has been deleted successfully!')
      }
    } catch (error) {
      console.log(error)
      message.error('Errors occured while deleting.')
    }
  }

  const menu = (
    <Menu>
      <Menu.Item>
        <Link to={ routes.formA.new.url() }>{ routes.formA.new.label }</Link>
      </Menu.Item>
    </Menu>
  )

  return (
    <div>
      <Space style={{width: '100%', marginBottom: '10px'}} align='end' direction='vertical'>
        <Dropdown overlay={menu} trigger={['click']}>
          <Button type='primary'>
            New <DownOutlined />
          </Button>
        </Dropdown>
      </Space>

      <Tabs onChange={ onTabKeyChange } type='card' activeKey={ typ }>
        {Object.entries(messages).map(([typ, form]) => {
          const specificFormList = forms.filter((form) => form.typ === typ);
          const FormList = typeToFormComponent[typ];

          return (
            <TabPane tab={form.name} key={ typ }>
              <FormList formName={form.name} onRowDelete={onDelete} data={specificFormList} isLoading={isLoading} />
            </TabPane>
          )
        })}
      </Tabs>
    </div>
  )
}

export default ComplianceApp;


// {/* <PrivateRoute path="/compliance/a/new" component={ FormAEdit } /> */}
// <PrivateRoute path="/compliance/a/:pk/view" component={ FormAView } />
// {/* <PrivateRoute path="/compliance/a/:pk/edit" component={ FormAEdit } /> */}
// <PrivateRoute path="/compliance/:typ" component={ ComplianceApp } />