import React, { useState, useEffect } from 'react';
import { Breadcrumb, Spin, Select, Button, Form, message, Upload, Radio } from 'antd';
import { MenuOutlined, UploadOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Link, useHistory, useParams } from 'react-router-dom';
import axios from 'axios';
import messages from './messages';
import routes from './routes';
import Container from './components/Container';
import { useFetchOne } from './hooks';

const formText = messages.b.text;
const formName = messages.b.name;

const { Option } = Select;

const FormBEdit = () => {
  const [fileList, setFileList] = useState([]);
  const history = useHistory();
  const { pk } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [form] = Form.useForm();
  const [data, error] = useFetchOne(pk, 'b');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [optionValue, setOptionValue] = useState(false);
  const MODE = {
    edit: 'edit',
    new: 'new',
  };
  const mode = pk === undefined ? MODE.new : MODE.edit;
  const isUploadDisabled = optionValue !== formText.options[1].key;

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
      if (!isLoading && data !== null) {
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
  }, [isLoading, data]);

  useEffect(() => {
    if (data !== null || error !== null) {
      setIsLoading(false);
    }
  }, [data, error]);

  if (isLoading) {
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

  const createForm = async () => {
    try {
      await form.validateFields();
      setIsSubmitting(true);

      const year = form.getFieldValue('year');
      const optionValue = form.getFieldValue('radioGroup');
      const fileList = await getFiles();
      const { data } = await axios.post(routes.api.list(), {
        typ: 'b',
        data: { optionValue, year, fileList },
      });

      if (data.id) {
        setIsSubmitting(false);
        message.success('Employee Securities Holdings Report was created successfully!', 1);
        history.push(routes.formB.url());
      }
    } catch (error) {
      setIsSubmitting(false);
      console.log(error);
      if (error instanceof Error) {
        message.error('Unexpected error encountered, please try again!');
      }
    }
  };

  const updateForm = async () => {
    try {
      await form.validateFields();
      setIsSubmitting(true);

      const year = form.getFieldValue('year');
      const optionValue = form.getFieldValue('radioGroup');
      const fileList = await getFiles();
      const { data } = await axios.patch(routes.api.detailsURL(pk), {
        typ: 'b',
        data: { optionValue, year, fileList },
      });

      if (data.id) {
        setIsSubmitting(false);
        message.success('Employee Securities Holdings Report was updated successfully!', 1);
        history.push(routes.formB.url());
      }
    } catch (error) {
      setIsSubmitting(false);
      console.log(error);
      if (error instanceof Error) {
        message.error('Unexpected error encountered, please try again!');
      }
    }
  };

  return (
    <Container>
      <Breadcrumb style={{ marginBottom: '100px' }}>
        <Breadcrumb.Item>
          <Link to={routes.formB.url()}>
            <MenuOutlined /> {formName} Form List
          </Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          {mode === MODE.edit ? (
            <>
              <EditOutlined /> Edit {formName}
            </>
          ) : (
            <>
              <PlusOutlined /> New {formName}
            </>
          )}
        </Breadcrumb.Item>
      </Breadcrumb>

      <h1 style={{ textAlign: 'center' }}>{formName}</h1>
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
              disabled={isUploadDisabled}
              onChange={onFileChange}
              beforeUpload={() => false}
              multiple>
              <Button disabled={isUploadDisabled} icon={<UploadOutlined />}>
                Attach file(s)
              </Button>
            </Upload>
          </div>
          <p>{formText.note}</p>
        </div>
      </div>

      {mode === MODE.edit && (
        <Button type='primary' onClick={updateForm} loading={isSubmitting}>
          Update
        </Button>
      )}

      {mode === MODE.new && (
        <Button type='primary' onClick={createForm} loading={isSubmitting}>
          Submit
        </Button>
      )}
    </Container>
  );
};

export default FormBEdit;
