import React, { useState } from 'react';
import {Table, Input, InputNumber, Popconfirm, Form, DatePicker, Select, Button as AntButton} from 'antd'
import { Button } from '@material-ui/core';
import moment from 'moment';
import _ from 'lodash';
const originData = [];

const dateFormat = 'DD/MM/YYYY'

const EditableCell = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  options,
  ...restProps
}) => {
  const inputComponent = {
    number: <InputNumber />,
    text: <Input />,
    date: <DatePicker format={dateFormat} />,
    select: (
      <Select>
        {Array.isArray(options) &&
          options.map((option) => {
            return (
              <Select.Option key={option} value={option}>
                {option}
              </Select.Option>
            )
          })}
      </Select>
    ),
  }

  const inputNode = inputComponent[inputType];

  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{
            margin: 0,
          }}
          rules={[
            {
              required: true,
              message: `Please input`,
            },
          ]}
        >
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};

const EditableTable = ({ dataSource, setData, initColumns, disabled }) => {
  const [form] = Form.useForm();
  const [editingKey, setEditingKey] = useState('');

  const isEditing = (record) => record.key === editingKey;

  const edit = (record) => {
    form.setFieldsValue({...record, ...(record.date && {date: moment(record.date, dateFormat)})})
    setEditingKey(record.key);
  };

  const cancel = () => {
    setEditingKey('');
  };

  const save = async (key) => {
    try {
      const row = await form.validateFields();
      const newRow = {...row, ...(row.date && {date: moment(row.date).format(dateFormat)})};
      const newData = [...dataSource];
      const index = newData.findIndex((item) => key === item.key);

      const item = newData[index];
      newData.splice(index, 1, { ...item, ...newRow });
      console.log(newData);
      setData(newData);
      setEditingKey('');
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
    }
  };

  const del = (key) => {
    const newData = [...dataSource];
    const index = newData.findIndex((item) => key === item.key);
    newData.splice(index, 1);
    setData(newData);
  }

  const columns = [
    ...initColumns,
    {
      title: <b>Actions</b>,
      dataIndex: 'key',
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <span>
            <Button onClick={() => save(record.key)}>Save</Button>
            <Popconfirm title="Sure to cancel?" onConfirm={cancel}>
              <Button>Cancel</Button>
            </Popconfirm>
          </span>
        ) : (
          <span>
            <Button disabled={editingKey !== ''} onClick={() => edit(record)}>
              Edit
            </Button>
            <Popconfirm title="Are you sure?" onConfirm={ () => del(record.key) }>
              <Button disabled={ editingKey !== ''}>Delete</Button>
            </Popconfirm>
          </span>

        );
      },
    },
  ];

  const addNewRow = () => {
    const defaultValue = {
      text: '',
      select: null,
      number: 0,
      date: moment(new Date()).format(dateFormat),
    };
    const newDataSource = _.cloneDeep(dataSource);

    const data = {};
    const newKey = new Date().getTime();
    data.key = newKey;

    initColumns.forEach((col) => {
      if (col.title !== '#') {
        data[col.dataIndex] = col.inputType ? defaultValue[col.inputType] : defaultValue.text;
      }
    });

    newDataSource.push(data);
    setData(newDataSource);
  };

  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }

    return {
      ...col,
      onCell: (record) => ({
        record,
        inputType: col.inputType ? col.inputType : 'text',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
        ...(col.inputType === 'select' && {options: col.options}),
      }),
    };
  });

  return (
    <Form form={form} component={false}>
      <AntButton onClick={addNewRow} disabled={disabled}>New row</AntButton>
      <Table
        components={{
          body: {
            cell: EditableCell,
          },
        }}
        bordered
        dataSource={ dataSource }
        columns={mergedColumns}
        rowClassName="editable-row"
        pagination={{
          onChange: cancel,
        }}
      />
    </Form>
  );
};


export default EditableTable;
