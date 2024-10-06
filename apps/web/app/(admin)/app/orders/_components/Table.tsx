"use client";

import { PlusOutlined } from "@ant-design/icons";
import type { ProColumns } from "@ant-design/pro-components";
import { ProCard, ProTable, TableDropdown } from "@ant-design/pro-components";
import { Button, Space, Tag, message } from "antd";
import request from "umi-request";

export interface OrdersLIst {
  data: Datum[];
  page: number;
  perPage: number;
  total: number;
  totalPage: number;
}

export interface Datum {
  customer: Customer;
  items: Item[];
  status: string;
  totalAmount: number;
  deliveryCost: number;
  isPaid: boolean;
  createdAt: Date;
  updatedAt: Date;
  id: string;
}

export interface Customer {
  email: string;
  emailConfirmed: boolean;
  firstName: string;
  lastName: string;
  postcode: string;
  userRoles: string[];
  createdAt: Date;
  updatedAt: Date;
  displayName: string;
  id: string;
}

export interface Item {
  product: string;
  quantity: number;
  price: number;
  variantAttributes: VariantAttributes;
}

export interface VariantAttributes {
  size: string;
  color: string;
}

type GithubIssueItem = {
  url: string;
  id: number;
  number: number;
  title: string;
  labels: {
    name: string;
    color: string;
  }[];
  state: string;
  comments: number;
  created_at: string;
  updated_at: string;
  closed_at?: string;
};

const columns: ProColumns<OrdersLIst["data"]>[] = [
  {
    title: "Date",
    dataIndex: "createdAt",
    width: 64,
    valueType: "dateMonth",
  },
  {
    title: "Sales Order",
    dataIndex: "id",
    copyable: true,
    ellipsis: true,
    search: false,
  },
  {
    title: (_, type) => (type === "table" ? "状态" : "列表状态"),
    dataIndex: "state",
    initialValue: "all",
    filters: true,
    onFilter: true,
    valueType: "select",
    valueEnum: {
      all: { text: "全部", status: "Default" },
      open: {
        text: "未解决",
        status: "Error",
      },
      closed: {
        text: "已解决",
        status: "Success",
      },
    },
  },
  {
    title: "排序方式",
    key: "direction",
    hideInTable: true,
    hideInDescriptions: true,
    dataIndex: "direction",
    filters: true,
    onFilter: true,
    valueType: "select",
    valueEnum: {
      asc: "正序",
      desc: "倒序",
    },
  },
  {
    title: "标签", // translate: 标签 english: label
    dataIndex: "labels",
    width: 120,
    render: (_, row) => (
      <Space>
        {row.labels.map(({ name, color }) => (
          <Tag color={color} key={name}>
            {name}
          </Tag>
        ))}
      </Space>
    ),
  },
  {
    title: "option",
    valueType: "option",
    dataIndex: "id",
    render: (text, row) => [
      <a href={row.url} key="show" target="_blank" rel="noopener noreferrer">
        查看
      </a>,
      <TableDropdown
        key="more"
        onSelect={(key) => message.info(key)}
        menus={[
          { key: "copy", name: "复制" },
          { key: "delete", name: "删除" },
        ]}
      />,
    ],
  },
];

export default () => {
  return (
    <ProCard>
      <ProTable<GithubIssueItem>
        columns={columns}
        type={"table"}
        request={async (params = {} as Record<string, any>) =>
          request<{
            data: GithubIssueItem[];
          }>("https://proapi.azurewebsites.net/github/issues", {
            params,
          })
        }
        pagination={{
          pageSize: 5,
        }}
        rowKey="id"
        dateFormatter="string"
        headerTitle="查询 Table"
        toolBarRender={() => [
          <Button key="3" type="primary">
            <PlusOutlined />
            新建
          </Button>,
        ]}
      />
    </ProCard>
  );
};
