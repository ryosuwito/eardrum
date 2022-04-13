import React, {useState, useEffect} from 'react';
import {
  Radio,
  Spin,
  Button,
  message,
  Breadcrumb,
  Space,
  Popconfirm,
  Form,
} from 'antd';
import {
  useHistory,
  useParams,
  Link,
} from 'react-router-dom';
import axios from 'axios';
import _ from 'lodash';
import {EditOutlined, PlusOutlined} from '@ant-design/icons';
import moment from 'moment';
import Container from './components/Container';
import EditableTable from './components/EditableTable';

import { useFetchOne, useCurrentUser } from './hooks';
import messages from './messages';
import routes from './routes';

const dateFormat = 'DD/MM/YYYY';
const formText = messages.a.text;
const errMsg = 'There are no valid rows in the table. To submit the form, at least one row must be filled!';

const FormAEdit = () => {
  const { pk } = useParams()
  const [data, error] = useFetchOne(pk, 'a');
  const [loading, setLoading] = useState(true);
  const [optionValue, setOptionValue] = useState();
  const [accounts, setAccounts] = useState([]);
  const history = useHistory();
  const [currentUserLoading, currentUserRes, currentUserErr] = useCurrentUser();
  const [hasNoValidRows, setHasNoValidRows] = useState();
  const hasAccounts = optionValue === formText.options[1].key;
  const isSubmittable = !hasAccounts || (hasAccounts && !hasNoValidRows);
  const [form] = Form.useForm();

  const isObjEmpty = (obj) => !Object.values(obj).some((val) => val);

  useEffect(() => {
    if (!loading && data !== null) {
      setOptionValue(data.optionValue);
      form.setFieldsValue({ optionValue: data.optionValue });
      let newAccounts = data.accounts.map((account, idx) => {
        const ret = { key: idx };
        for(let i = 0; i < account.length; i++) {
          ret[i] = account[i];
        }
        return ret;
      });
      setAccounts(newAccounts);
    }
  }, [loading, data]);

  useEffect(() => {
    if (data !== null || error !== null) {
      setLoading(false)
    }
  }, [data, error]);

  useEffect(() => {
    if (!currentUserLoading && currentUserErr !== null) {
      console.log(currentUserErr)
      message.error('Errors occured while fetching user!.');
    }
  }, [currentUserLoading, currentUserErr]);

  useEffect(() => {
    if (!hasAccounts) {
      setHasNoValidRows(false);
      return;
    }

    const validRow = accounts.findIndex((acc) => {
      const cloneAcc = { ...acc };
      delete cloneAcc.key;
      return !isObjEmpty(cloneAcc);
    });

    if (validRow < 0) {
      setHasNoValidRows(true);
    } else {
      setHasNoValidRows(false);
    }
  }, [accounts, hasAccounts]);

  const MODE = {
    'edit': 'edit',
    'new': 'new',
  }
  const mode = pk === undefined? MODE.new : MODE.edit; // 'edit', 'new';
  console.log("view mode", mode);


  if (loading || currentUserLoading) {
    return <Spin size="large" />
  }

  if (error !== null) {
    return (<p>{ error.toString() }</p>)
  }

  function onOptionChange(e) {
    setOptionValue(e.target.value);
  }

  let columns = [{title: '#', render: (text, record, index) => index + 1}]

  columns.push(
    ...formText.account_headers.map((header, idx) => ({
      title: <b>{`${header}`}</b>,
      dataIndex: idx,
      key: `${idx}`,
      editable: true,
    }))
  )

  function getAccounts() {
    if (!hasAccounts) {
      return []
    }

    let arrAccounts = accounts.map(account => {
      let arrAccount = [];
      for(let i = 0; i < formText.account_headers.length; i++) {
        arrAccount.push(account[i]);
      }
      return arrAccount;
    });

    arrAccounts = arrAccounts.filter((arr) => arr.some((val) => val));
    return arrAccounts;
  }

  async function onSave() {
    try {
      await form.validateFields();
      const formData = {
        typ: 'a',
        data: {
          optionValue,
          submissionDate: data.submissionDate,
          accounts: getAccounts(accounts),
        }
      }
      const res = await axios.patch(routes.api.detailsURL(pk), formData);
      console.log(res);
      history.push(routes.formA.url());
    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        message.error('Errors occured while submitting.');
      }
    }
  }

  async function onSubmit() {
    try {
      await form.validateFields();
      const data = {
        typ: 'a',
        data: {
          optionValue,
          submissionDate: moment(new Date()).format(dateFormat),
          accounts: getAccounts(accounts),
        }
      }
      const res = await axios.post(routes.api.list(), data);
      console.log(res);
      history.push(routes.formA.url());
    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        message.error('Errors occured while submitting.');
      }
    }
  }

  return (
    <Container>
      <Breadcrumb style={{marginBottom: '100px'}}>
        <Breadcrumb.Item>
          <Link to={routes.formA.url()}>{messages.a.name}</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          {mode === MODE.edit ? (
            <>
              <EditOutlined /> Edit
            </>
          ) : (
            <>
              <PlusOutlined /> New
            </>
          )}
        </Breadcrumb.Item>
      </Breadcrumb>


      <h1 style={{textAlign: 'center'}}>
        {messages.a.name}
      </h1>
      <div style={{padding: '0px 50px 0px' }}>
        <p>{ formText.overview }</p>
        <p>{ formText.non_required_title }</p>
        <ol>
          { formText.non_required_items.map( (non_required_account, idx) => (<li key={`no-required-account-key-${idx}`}><p>{ non_required_account }</p></li>))}
        </ol>
        <Form layout='vertical' form={form}>
          <Form.Item
            name='optionValue'
            label={formText.option_title}
            style={{ margin: 0 }}
            rules={[
              {
                required: true,
                message: 'Please choose 1 option!',
              },
            ]}>
            <Radio.Group onChange={onOptionChange}>
              {formText.options.map((option, idx) => (
                <Radio value={option.key} key={`option-key-${idx}`}>
                  {option.label}
                </Radio>
              ))}
            </Radio.Group>
          </Form.Item>
        </Form>
        <p>{ formText.note }</p>
        <EditableTable initColumns={ columns } dataSource={ hasAccounts? accounts: [] } setData={ setAccounts } disabled={ !hasAccounts }/>
        {hasNoValidRows && <p style={{color: "#ff4d4f"}}>{errMsg}</p>}
        <p>{ formText.policy }</p>

        <Space style={{ width: '100%' }} align='end' direction='vertical'>
          {!currentUserLoading && currentUserRes !== null && (
            <div>
              <div>Submitted by: {currentUserRes.data.username}</div>
              <div>Date: {data.submissionDate}</div>
            </div>
          )}
        </Space>
      </div>

      <Space style={{ width: '100%' }} align='end' direction='vertical'>
        {mode === MODE.new && (
          <div style={{ marginTop: '50px' }}>
            <Button type='primary' onClick={onSubmit} disabled={!isSubmittable} style={{ marginRight: '6px' }}>
              Create
            </Button>

            <Popconfirm onConfirm={() => history.push(routes.formA.url())} title='Are you sure?'>
              <Button>Cancel</Button>
            </Popconfirm>
          </div>
        )}

        {mode === MODE.edit && (
          <div style={{ marginTop: '50px' }}>
            <Button type='primary' onClick={onSave} disabled={!isSubmittable} style={{ marginRight: '6px' }}>
              Update
            </Button>

            <Popconfirm onConfirm={() => history.push(routes.formA.url())} title='Are you sure?'>
              <Button>Cancel</Button>
            </Popconfirm>
          </div>
        )}
      </Space>
    </Container>
  )
}


export default FormAEdit;
