import React from 'react';
import { Checkbox } from 'antd';

const CheckBoxGroup = ({ titles }) => {
  const options = titles.map((name, index) => ({ label: name, value: index }));
  const defaultValue = Array.from({ length: titles.length }).map((_, index) => index);

  return <Checkbox.Group options={options} value={defaultValue} onChange={() => defaultValue} />;
};

export default CheckBoxGroup;
