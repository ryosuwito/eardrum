import React, { useState, useEffect } from 'react';
import { Breadcrumb, Spin, Select, Button, Form, message, Upload, Radio, Space, Popconfirm } from 'antd';
import { UploadOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Link, useHistory, useParams } from 'react-router-dom';
import messages from './messages';
import routes from './routes';
import Container from './components/Container';
import { useFetchOne, useCurrentUser, useUpdateOne } from './hooks';

const formText = messages.b.text;
const formName = messages.b.name;

const { Option } = Select;
const errMsg = 'There is no file attached in the table. To submit the form, at least one file must be attached!';

const FormBEdit = () => {
  const [fileList, setFileList] = useState([]);
  const history = useHistory();
  const { pk } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [form] = Form.useForm();
  const [data, error] = useFetchOne(pk, 'b');
  const [optionValue, setOptionValue] = useState(false);
  const MODE = {
    edit: 'edit',
    new: 'new',
  };
  const mode = pk === undefined ? MODE.new : MODE.edit;
  const isUploadEnabled = optionValue === formText.options[1].key;
  const [save, updateOneLoading, updateOneRes, updateOneErr] = useUpdateOne(pk);
  const [currentUserLoading, currentUserRes, currentUserErr] = useCurrentUser();
  const isSubmittable = !isUploadEnabled || (isUploadEnabled && fileList.length !== 0);

  const dataUrlToFile = async (dataUrl, fileName, type) => {
    try {
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      return new File([blob], fileName, { type });
    } catch (error) {
      console.log(error);
      message.error('Error parsing file!');
    }
  };

  useEffect(() => {
    const setState = async () => {
      if (data !== null) {
        setOptionValue(data.optionValue);
        form.setFieldsValue({ year: data.year, radioGroup: data.optionValue });

        const { fileList } = data;
        if (Array.isArray(fileList) && fileList.length) {
          const convertedFiles = [];

          for (const file of fileList) {
            const { name, type, content } = file;
            const convertedFile = await dataUrlToFile(content, name, type);
            const url = URL.createObjectURL(convertedFile);
            convertedFiles.push({ uid: url, name, type, content, status: 'done', url });
          }

          setFileList(convertedFiles);
        }
        setIsLoading(false);
      }
    };

    setState();

    return () => {
      fileList.forEach((file) => {
        if ('url' in file) {
          URL.revokeObjectURL(file.url);
        }
      });
    };
  }, [data]);

  useEffect(() => {
    if (error !== null) {
      setIsLoading(false);
    }
  }, [error]);

  useEffect(() => {
    if (!currentUserLoading && currentUserErr !== null) {
      console.log(currentUserErr);
      message.error('Errors occured while fetching user!.');
    }
  }, [currentUserLoading, currentUserErr]);

  useEffect(() => {
    if (updateOneRes !== null) {
      message.success('Employee Quarterly Trade Report was submitted successfully!', 1);
      history.push(routes.formB.url());
    }

    if (updateOneErr !== null) {
      console.log(updateOneErr);
      message.error('Unexpected error encountered, please try again!');
    }
  }, [updateOneRes, updateOneErr]);

  if (isLoading || currentUserLoading) {
    return <Spin size='large' />;
  }

  if (error !== null) {
    return <p>{error.toString()}</p>;
  }

  const fileToBase64 = async (file) => {
    return new Promise((resolve, reject) => {
      let reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = function () {
        resolve(reader.result);
      };
      reader.onerror = function (error) {
        console.log('Error: ', error);
        reject(error);
      };
    });
  };

  const onFileChange = async ({ fileList }) => {
    setFileList(fileList);
  };

  const onRadioGroupChange = (event) => {
    setOptionValue(event.target.value);
  };

  const getFiles = async () => {
    if (optionValue === formText.options[0].key) {
      return [];
    }

    const files = [];
    for (const file of fileList) {
      let { content } = file;
      if ('originFileObj' in file) {
        content = await fileToBase64(file.originFileObj);
      }
      files.push({ name: file.name, type: file.type, content });
    }

    return files;
  };

  const submitForm = async () => {
    await form.validateFields();

    const year = form.getFieldValue('year');
    const optionValue = form.getFieldValue('radioGroup');
    const fileList = await getFiles();
    save({
      typ: 'b',
      data: { optionValue, year, fileList },
    });
  };

  return (
    <Container>
      <Breadcrumb style={{ marginBottom: '100px' }}>
        <Breadcrumb.Item>
          <Link to={routes.formB.url()}>{formName}</Link>
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
      <div style={{ padding: '0px 50px 50px' }}>
        <Form layout='vertical' form={form}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <p style={{ marginBottom: 0 }}>{formText.yearSelectTitle} </p>
            <Form.Item name='year' style={{ margin: 0 }}>
              <Select style={{ width: 120 }}>
                {Array.from({ length: 3 }).map((_, index) => (
                  <Option key={index} value={form.getFieldValue('year') + index - 1}>
                    {form.getFieldValue('year') + index - 1}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </div>
          <div style={{ marginTop: '10px' }}>
            <Form.Item
              name='radioGroup'
              label={formText.options_title}
              style={{ margin: 0 }}
              rules={[
                {
                  required: true,
                  message: 'Please choose 1 option!',
                },
              ]}>
              <Radio.Group onChange={onRadioGroupChange}>
                {formText.options.map((option, idx) => {
                  return (
                    <Radio value={option.key} key={idx} style={{ whiteSpace: 'break-spaces', display: 'block' }}>
                      {option.label}
                    </Radio>
                  );
                })}
              </Radio.Group>
            </Form.Item>
          </div>
        </Form>
        <div>
          <div style={{ marginLeft: '10px', marginTop: '6px' }}>
            <div style={{ maxWidth: '60%' }}>
              <Upload
                fileList={fileList}
                disabled={!isUploadEnabled}
                onChange={onFileChange}
                beforeUpload={() => false}
                multiple>
                <Button disabled={!isUploadEnabled} icon={<UploadOutlined />}>
                  Attach file(s)
                </Button>
              </Upload>
            </div>
            <p>{formText.note}</p>
            {!isSubmittable && <p style={{ color: '#ff4d4f' }}>{errMsg}</p>}
          </div>
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
          <div>
            <Button
              type='primary'
              onClick={submitForm}
              disabled={!isSubmittable}
              loading={updateOneLoading}
              style={{ marginRight: '6px' }}>
              Create
            </Button>

            <Popconfirm onConfirm={() => history.push(routes.formB.url())} title='Are you sure?'>
              <Button>Cancel</Button>
            </Popconfirm>
          </div>
        )}

        {mode === MODE.edit && (
          <div>
            <Button
              type='primary'
              onClick={submitForm}
              disabled={!isSubmittable}
              loading={updateOneLoading}
              style={{ marginRight: '6px' }}>
              Update
            </Button>

            <Popconfirm onConfirm={() => history.push(routes.formB.url())} title='Are you sure?'>
              <Button>Cancel</Button>
            </Popconfirm>
          </div>
        )}
      </Space>
    </Container>
  );
};

export default FormBEdit;
