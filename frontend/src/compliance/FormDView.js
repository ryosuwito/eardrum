import React, { useEffect } from 'react';
import {
  Breadcrumb,
  Spin,
  message,
  Table,
  Button,
  } from 'antd';
import { Link, useParams, useHistory } from 'react-router-dom';
import {ArrowLeftOutlined} from '@ant-design/icons';
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
  const history = useHistory();

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
          <Link to={routes.formD.url()}>{formName}</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>View</Breadcrumb.Item>
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
      <Button icon={<ArrowLeftOutlined />} onClick={() => history.push(routes.formD.url())} style={{marginTop: '10px' }}>
        Go back
      </Button>
    </Container>
  );
};

export default FormDView;
