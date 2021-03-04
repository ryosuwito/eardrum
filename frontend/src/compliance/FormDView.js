import React, { useEffect } from 'react';
import {
  Breadcrumb,
  Spin,
  message,
  Table
  } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import { Link, useParams } from 'react-router-dom';
import messages from './messages';
import routes from './routes';
import { useFetchOne } from './hooks';
import Container from './components/Container';
import './styles/formD.css';

const formText = messages.d.text;
const formName = messages.d.name;

const FormDView = () => {
  const { pk } = useParams();
  const [data, error] = useFetchOne(pk, 'd');

  useEffect(() => {
    if (error !== null) {
      message.error('Errors ocurred while fetching data');
    }
  }, [error]);

  if (error !== null) {
    return <p>{error.toString()}</p>;
  }

  if (data === null) {
    return <Spin size='large' />;
  }

  const columns = [{ title: '#', render: (text, record, index) => index + 1 }, ...formText.columns];

  const dataSource = data.issuers.map((row, idx) => {
    return { key: idx, ...row };
  });

  return (
    <Container>
      <Breadcrumb style={{ marginBottom: '100px' }}>
        <Breadcrumb.Item>
          <MenuOutlined /> <Link to={routes.formD.url()}>{formName} Form List</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>{formName}</Breadcrumb.Item>
      </Breadcrumb>
      <h1 style={{ textAlign: 'center' }}>{formName}</h1>
      <Table columns={columns} dataSource={dataSource} />
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
    </Container>
  );
};

export default FormDView;
