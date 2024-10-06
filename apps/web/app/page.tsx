"use client";
import { Flex, Rate } from "antd";
import React, { useState } from "react";

const desc = ["terrible", "bad", "normal", "good", "wonderful"];

const App: React.FC = () => {
  const [value, setValue] = useState(3);
  return (
    <Flex gap="middle" vertical>
      <Rate tooltips={desc} onChange={setValue} value={value} />
      {value ? <span>{desc[value - 1]}</span> : null}
    </Flex>
  );
};

export default App;
