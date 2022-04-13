import React, { useState, useEffect } from 'react';
import { Divider, Breadcrumb, Select, Button, message, Radio, Spin, Form, Space, Popconfirm } from 'antd';
import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Link, useHistory, useParams } from 'react-router-dom';
import _ from 'lodash';
import messages from './messages';
import routes from './routes';
import Container from './components/Container';
import CheckBoxGroup from './components/CheckBoxGroup';
import EditableTable from './components/EditableTable';
import { useFetchOne, useUpdateOne, useCurrentUser } from './hooks';
import './styles/formC.css';

const formText = messages.c.text;
const formName = messages.c.name;

const { Option } = Select;
const errMsg = 'There are no valid rows in the table. To submit the form, at least one row must be filled!';

const FormCEdit = () => {
  const [optionValue, setOptionValue] = useState();
  const history = useHistory();
  const [isLoading, setIsLoading] = useState(true);
  const [tickers, setTickers] = useState([]);
  const exceedingLimit = optionValue === formText.box1.radioGroupOptions[2].key;
  const [form] = Form.useForm();

  const { pk } = useParams();
  const [save, updateOneLoading, updateOneRes, updateOneErr] = useUpdateOne(pk);
  const [data, error] = useFetchOne(pk, 'c');
  const MODE = {
    edit: 'edit',
    new: 'new',
  };
  const mode = pk === undefined ? MODE.new : MODE.edit;
  const [currentUserLoading, currentUserRes, currentUserErr] = useCurrentUser();
  const [hasNoValidRows, setHasNoValidRows] = useState();
  const isSubmittable = !exceedingLimit || (exceedingLimit && !hasNoValidRows);

  useEffect(() => {
    if (!isLoading && data !== null) {
      setOptionValue(data.optionValue);

      form.setFieldsValue({ year: data.year, quarter: data.quarter, radioGroup: data.optionValue });

      if (Array.isArray(data.tickers) && data.tickers.length) {
        const newTickers = data.tickers.map((row, idx) => {
          return { key: idx, ...row };
        });

        setTickers(newTickers);
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
      message.success('Employee Quarterly Trade Report was submitted successfully!', 1);
      history.push(routes.formC.url());
    }

    if (updateOneErr !== null) {
      console.log(updateOneErr);
      message.error('Unexpected error encountered, please try again!');
    }
  }, [updateOneRes, updateOneErr]);

  const isObjEmpty = (obj) => !Object.values(obj).some((val) => val);

  useEffect(() => {
    if (!exceedingLimit) {
      setHasNoValidRows(false);
      return;
    }

    const validRow = tickers.findIndex((item) => {
      const cloneItem = { ...item };
      delete cloneItem.key;
      delete cloneItem.date;
      return !isObjEmpty(cloneItem);
    });

    if (validRow < 0) {
      setHasNoValidRows(true);
    } else {
      setHasNoValidRows(false);
    }
  }, [exceedingLimit, tickers]);

  if (isLoading) {
    return <Spin size='large' />;
  }

  if (error !== null) {
    return <p>{error.toString()}</p>;
  }

  const getTickers = () => {
    return _.cloneDeep(tickers)
      .map((row) => {
        delete row.key;
        return row;
      })
      .filter((obj) => {
        const cloneObj = { ...obj };
        delete cloneObj.date;
        return !isObjEmpty(cloneObj);
      });
  };

  const submitForm = async () => {
    await form.validateFields();

    const newTickers = exceedingLimit ? getTickers() : [];

    const formValues = form.getFieldsValue();
    const { year, quarter, radioGroup: optionValue } = formValues;
    save({
      typ: 'c',
      data: { optionValue, quarter, year, tickers: newTickers },
    });
  };

  const columns = [{ title: '#', render: (text, record, index) => index + 1 }];

  columns.push(...messages.c.text.box1.columns.map((col, idx) => ({ ...col, key: idx, editable: true })));

  return (
    <Container>
      <Breadcrumb style={{ marginBottom: '100px' }}>
        <Breadcrumb.Item>
          <Link to={routes.formC.url()}>{formName}</Link>
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
        <Form layout='vertical' form={form}>
          <p>{formText.title} </p>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <p style={{ marginBottom: 0 }}>{formText.quarterYearSelectTitle} </p>
            <Form.Item
              name='quarter'
              rules={[
                {
                  required: true,
                  message: 'Please select quarter!',
                },
              ]}
              style={{ display: 'inline-block', marginLeft: '10px', marginBottom: 0 }}>
              <Select style={{ width: 120 }}>
                {formText.quarters.map((q) => {
                  return (
                    <Option key={q} value={q}>
                      {q}
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>
            ,{' '}
            <Form.Item
              name='year'
              rules={[
                {
                  required: true,
                  message: 'Please select year!',
                },
              ]}
              style={{ display: 'inline-block', margin: 0 }}>
              <Select style={{ width: 120 }}>
                {Array.from({ length: 3 }).map((_, index) => (
                  <Option key={index} value={form.getFieldValue('year') + index - 1}>
                    {form.getFieldValue('year') + index - 1}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </div>
          <div
            style={{
              marginTop: '10px',
              padding: '6px',
              paddingTop: 0,
              border: '1px solid transparent',
              borderColor: 'rgba(0, 0, 0, 0.06)',
              borderTop: 'none',
            }}>
            <Divider style={{ position: 'relative', marginBottom: '0px', top: '-12px' }} orientation='left'>
              {formText.box1.title}
            </Divider>
            <Form.Item
              name='radioGroup'
              style={{ margin: 0 }}
              rules={[
                {
                  required: true,
                  message: 'Please choose 1 option!',
                },
              ]}>
              <Radio.Group onChange={(event) => setOptionValue(event.target.value)} value={optionValue}>
                {formText.box1.radioGroupOptions.map((option, index) => {
                  return (
                    <div key={index}>
                      <Radio value={option.key}>
                        <span style={{ whiteSpace: 'normal' }}>{option.label}</span>
                      </Radio>
                    </div>
                  );
                })}
              </Radio.Group>
            </Form.Item>
            <div>
              <div className='hide-message'>
                <EditableTable initColumns={columns} dataSource={exceedingLimit ? tickers : []} setData={setTickers} disabled={!exceedingLimit}/>
                {hasNoValidRows && <p style={{ color: "#ff4d4f" }}>{errMsg}</p>}
              </div>
            </div>
          </div>
        </Form>
        <div
          style={{
            marginTop: '24px',
            padding: '6px',
            paddingTop: 0,
            border: '1px solid transparent',
            borderColor: 'rgba(0, 0, 0, 0.06)',
            borderTop: 'none',
          }}>
          <Divider style={{ position: 'relative', marginBottom: '0px', top: '-12px' }} orientation='left'>
            {formText.box2.title}
          </Divider>
          <CheckBoxGroup titles={formText.box2.checkboxGroupTitles} />
        </div>
        <div
          style={{
            marginTop: '24px',
            padding: '6px',
            paddingTop: 0,
            border: '1px solid transparent',
            borderColor: 'rgba(0, 0, 0, 0.06)',
            borderTop: 'none',
          }}>
          <Divider style={{ position: 'relative', marginBottom: '0px', top: '-12px' }} orientation='left'>
            {formText.box3.title}
          </Divider>
          <CheckBoxGroup titles={formText.box3.checkboxGroupTitles} />
        </div>
        <div style={{ marginTop: '10px' }}>
          <strong>{formText.confirm}</strong>
        </div>

        <Space style={{ width: '100%' }} align='end' direction='vertical'>
          {!currentUserLoading && currentUserRes !== null && (
            <div>
              <div>Submitted by: {currentUserRes.data.username}</div>
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
              disabled={!isSubmittable}
              loading={updateOneLoading}
              style={{ marginRight: '6px' }}>
              Create
            </Button>
            <Popconfirm onConfirm={() => history.push(routes.formC.url())} title='Are you sure?'>
              <Button>Cancel</Button>
            </Popconfirm>
          </div>
        )}

        {mode === MODE.edit && (
          <div style={{ marginTop: '50px' }}>
            <Button
              type='primary'
              onClick={submitForm}
              disabled={!isSubmittable}
              loading={updateOneLoading}
              style={{ marginRight: '6px' }}>
              Update
            </Button>

            <Popconfirm onConfirm={() => history.push(routes.formC.url())} title='Are you sure?'>
              <Button>Cancel</Button>
            </Popconfirm>
          </div>
        )}
      </Space>
    </Container>
  );
};

export default FormCEdit;
