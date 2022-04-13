import React, { useState, useEffect } from 'react';
import {
  Breadcrumb,
  Button,
  Space,
  Spin,
  message,
  Popconfirm,
  } from 'antd';
import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Link, useHistory, useParams } from 'react-router-dom';
import axios from 'axios';
import _ from 'lodash';
import messages from './messages';
import routes from './routes';
import { useFetchOne, useUpdateOne, useCurrentUser } from './hooks';
import Container from './components/Container';
import EditableTable from './components/EditableTable';
import './styles/formD.css';

const formText = messages.d.text;
const formName = messages.d.name;
const errMsg = 'There are no valid rows in the table. To submit the form, at least one row must be filled!';

const FormDEdit = () => {
  const [isLoading, setIsLoading] = useState(true);
  const history = useHistory();
  const [issuers, setIssuers] = useState([]);

  const { pk } = useParams();
  const [data, error] = useFetchOne(pk, 'd');
  const [save, updateOneLoading, updateOneRes, updateOneErr] = useUpdateOne(pk);
  const MODE = {
    edit: 'edit',
    new: 'new',
  };
  const mode = pk === undefined ? MODE.new : MODE.edit;
  const [currentUserLoading, currentUserRes, currentUserErr] = useCurrentUser();
  const [isSubmittable, setIsSubmittable] = useState(false);

  const isObjEmpty = (obj) => !Object.values(obj).some((val) => val);

  useEffect(() => {
    if (!isLoading && data !== null) {
      if (Array.isArray(data.issuers) && data.issuers.length) {
        const newIssuers = data.issuers.map((row, idx) => {
          return { key: idx, ...row };
        });

        setIssuers(newIssuers);
      }
    }
  }, [isLoading, data]);

  useEffect(() => {
    if (data !== null || error !== null) {
      setIsLoading(false);
    }
  }, [data, error]);

  useEffect(() => {
    if (!currentUserLoading && currentUserErr !== null) {
      console.log(currentUserErr);
      message.error('Errors occured while fetching user!.');
    }
  }, [currentUserLoading, currentUserErr]);

  useEffect(() => {
    if (updateOneRes !== null) {
      message.success('Request for Pre-Clearance of Securities Trade was submitted successfully!', 1);
      history.push(routes.formD.url());
    }

    if (updateOneErr !== null) {
      console.log(updateOneErr);
      message.error('Unexpected error encountered, please try again!');
    }
  }, [updateOneRes, updateOneErr]);

  useEffect(() => {
    const validRow = issuers.findIndex((item) => {
      const cloneItem = { ...item };
      delete cloneItem.key;
      delete cloneItem.date;
      return !isObjEmpty(cloneItem);
    });

    if (validRow < 0) {
      setIsSubmittable(false);
    } else {
      setIsSubmittable(true);
    }
  }, [issuers]);

  if (isLoading || currentUserLoading ) {
    return <Spin size='large' />;
  }

  if (error !== null) {
    return <p>{error.toString()}</p>;
  }

  const submitForm = async () => {
    const newIssuers = _.cloneDeep(issuers)
      .map((row) => {
        delete row.key;
        return row;
      })
      .filter((obj) => {
        const cloneObj = { ...obj };
        delete cloneObj.date;
        return !isObjEmpty(cloneObj);
      });

    save({
      typ: 'd',
      data: { submissionDate: data.submissionDate, issuers: newIssuers },
    });
  };

  const columns = [{ title: '#', render: (text, record, index) => index + 1 }];

  columns.push(...formText.columns.map((col, idx) => ({ ...col, key: idx, editable: true })));

  return (
    <Container>
      <Breadcrumb style={{ marginBottom: '100px' }}>
        <Breadcrumb.Item>
          <Link to={routes.formD.url()}>
          {formName}
          </Link>
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

      <h1 style={{ textAlign: 'center' }}>{formName}</h1>

      <div style={{ padding: '0px 50px 0px' }}>
        <div className='hide-message'>
          <EditableTable initColumns={columns} dataSource={issuers} setData={setIssuers} />
          {!isSubmittable && <p style={{ color: "#ff4d4f" }}>{errMsg}</p>}
        </div>
        <div style={{ marginTop: '16px' }}>
          <div>{formText.list.title}</div>
          <ol type='a'>
            {formText.list.items.map((item) => {
              return <li key={item}>{item}</li>;
            })}
          </ol>
          <div>
            <i>{formText.note}</i>
          </div>
        </div>

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
            <Button
              type='primary'
              onClick={submitForm}
              loading={updateOneLoading}
              disabled={!isSubmittable}
              style={{ marginRight: '6px' }}>
              Create
            </Button>

            <Popconfirm onConfirm={() => history.push(routes.formD.url())} title='Are you sure?'>
              <Button>Cancel</Button>
            </Popconfirm>
          </div>
        )}

        {mode === MODE.edit && (
          <div style={{ marginTop: '50px' }}>
            <Button
              type='primary'
              onClick={submitForm}
              loading={updateOneLoading}
              disabled={!isSubmittable}
              style={{ marginRight: '6px' }}>
              Update
            </Button>

            <Popconfirm onConfirm={() => history.push(routes.formD.url())} title='Are you sure?'>
              <Button>Cancel</Button>
            </Popconfirm>
          </div>
        )}
      </Space>
    </Container>
  );
};

export default FormDEdit;
