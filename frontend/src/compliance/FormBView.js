import React, { useEffect, useState } from 'react';
import { Breadcrumb, Spin, Select, List, message, Radio } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import { Link, useParams } from 'react-router-dom';
import messages from './messages';
import routes from './routes';
import Container from './components/Container';
import { useFetchOne } from './hooks';

const formText = messages.b.text;
const formName = messages.b.name;

const FormBView = () => {
  const { pk } = useParams();
  const [fileList, setFileList] = useState([]);
  const [data, error] = useFetchOne(pk, 'b');

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
    const getFileList = async (files) => {
      if (!Array.isArray(files)) return [];
      const convertedFiles = [];

      for (const file of files) {
        const { name, type, content } = file;
        const convertedFile = await dataUrlToFile(content, name, type);
        const url = URL.createObjectURL(convertedFile);
        convertedFiles.push({ uid: url, name, type, status: 'done', url });
      }

      setFileList(convertedFiles);
    };

    if (data !== null) {
      getFileList(data.fileList);
    }
  }, [data]);

  useEffect(() => {
    if (error !== null) {
      message.error('Errors ocurred while fetching data');
    }
  }, [error]);

  if (error !== null) {
    message.error('Errors ocurred while fetching data');
  }

  if (data === null) {
    return <Spin size='large' />;
  }

  return (
    <Container>
      <Breadcrumb style={{ marginBottom: '100px' }}>
        <Breadcrumb.Item>
          <Link to={routes.formB.url()}>
            <MenuOutlined /> {formName} Form List
          </Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>{formName}</Breadcrumb.Item>
      </Breadcrumb>

      <h1 style={{ textAlign: 'center' }}>{formName}</h1>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <p style={{ marginBottom: 0 }}>{formText.yearSelectTitle}</p>{' '}
        <Select value={data.year} style={{ width: 120 }} disabled />
      </div>
      <div style={{ marginTop: '10px' }}>
        <p> {formText.options_title}</p>
        <Radio.Group value={data.optionValue} disabled>
          {formText.options.map((option, idx) => {
            return (
              <Radio value={option.key} key={idx} style={{ whiteSpace: 'break-spaces', display: 'block' }}>
                {option.label}
              </Radio>
            );
          })}
        </Radio.Group>
      </div>
      <div style={{ marginLeft: '10px', marginTop: '6px' }}>
        <div>
          <div>Attach file(s)</div>

          <List
            size='small'
            bordered
            dataSource={fileList}
            renderItem={(item) => (
              <List.Item>
                <a href={item.url} download={item.name}>
                  {item.name}
                </a>
              </List.Item>
            )}
          />
        </div>
      </div>
    </Container>
  );
};

export default FormBView;
