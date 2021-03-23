import React, { useEffect } from 'react';
import { Divider, Breadcrumb, Select, Table, message, Radio, Spin, Button, Space } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Link, useParams, useHistory } from 'react-router-dom';
import messages from './messages';
import routes from './routes';
import Container from './components/Container';
import CheckBoxGroup from './components/CheckBoxGroup';
import { useFetchOne } from './hooks';
import './styles/formC.css';

const formText = messages.c.text;
const formName = messages.c.name;

const FormCView = () => {
  const { pk } = useParams();
  const [data, error] = useFetchOne(pk, 'c');
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
  const columns = [{ title: '#', render: (text, record, index) => index + 1 }];

  columns.push(...messages.c.text.box1.columns);

  const dataSource = data.tickers.map((row, idx) => {
    return { key: idx, ...row };
  });

  return (
    <Container>
      <Breadcrumb style={{ marginBottom: '100px' }}>
        <Breadcrumb.Item>
          <Link to={routes.formC.url()}>{formName}</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>View</Breadcrumb.Item>
      </Breadcrumb>

      <h1 style={{ textAlign: 'center' }}>{formName}</h1>
      <div style={{ padding: '0px 50px 0px' }}>
        <p>{formText.title} </p>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <p style={{ marginBottom: 0 }}>{formText.quarterYearSelectTitle} </p>
          <Select style={{ width: 120 }} value={data.quarter} disabled />,{' '}
          <Select style={{ width: 120 }} value={data.year} disabled />
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
          <Radio.Group value={data.optionValue} disabled>
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
          <div>
            <Table columns={columns} dataSource={dataSource} />
          </div>
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
        <Space style={{ width: '100%', marginTop: '20px' }} align='end' direction='vertical'>
          <div>
            <div>Submitted by: {data.submitBy}</div>
          </div>
        </Space>
        <Button icon={<ArrowLeftOutlined />} onClick={() => history.goBack()} style={{ marginTop: '50px' }}>
          Go back
        </Button>
      </div>
    </Container>
  );
};

export default FormCView;
