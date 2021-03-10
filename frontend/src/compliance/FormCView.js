import React, { useEffect } from 'react';
import { Divider, Breadcrumb, Select, Table, message, Radio, Spin } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import { Link, useParams } from 'react-router-dom';
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
          <MenuOutlined /> <Link to={routes.formC.url()}>{formName} Form List</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>{formName}</Breadcrumb.Item>
      </Breadcrumb>

      <h1 style={{ textAlign: 'center' }}>{formName}</h1>
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
          borderColor: 'lightgray',
          borderTop: 'none',
        }}>
        <Divider style={{ position: 'relative', marginBottom: '0px', top: '-12px' }} orientation='left'>
          {formText.box1.title}
        </Divider>

        <Radio.Group value={data.optionValue} disabled>
          {formText.box1.radioGroupOptions.map((option, index) => {
            return (
              <Radio key={index} value={option.key} style={{ whiteSpace: 'break-spaces' }}>
                {option.label}
              </Radio>
            );
          })}
        </Radio.Group>
        <p>{formText.box1.lastRadioItemNote}</p>
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
          borderColor: 'lightgray',
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
          borderColor: 'lightgray',
          borderTop: 'none',
        }}>
        <Divider style={{ position: 'relative', marginBottom: '0px', top: '-12px' }} orientation='left'>
          {formText.box3.title}
        </Divider>

        <CheckBoxGroup titles={formText.box3.checkboxGroupTitles} />
      </div>
    </Container>
  );
};

export default FormCView;
