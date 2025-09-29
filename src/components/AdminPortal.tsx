import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Select, 
  Typography, 
  Space, 
  Popconfirm, 
  Tag,
  message,
  Row,
  Col
} from 'antd';
import { 
  UserAddOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  UserOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../store/store';
import { fetchAllUsers, createUserByAdmin, updateUserByAdmin, deleteUserByAdmin } from '../store/authSlice';
import { UserRole, User } from '../types/auth';

const { Title, Text } = Typography;
const { Option } = Select;

const AdminPortal: React.FC = () => {
  const dispatch = useAppDispatch();
  const { users, currentUser, loading } = useAppSelector((state) => state.auth);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);

  const handleCreateUser = () => {
    setEditingUser(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue({
      name: user.username,
      email: user.email,
      role: user.role,
    });
    setIsModalVisible(true);
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await dispatch(deleteUserByAdmin(userId)).unwrap();
      message.success('User deleted successfully');
    } catch (error) {
      message.error('Failed to delete user');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingUser) {
        await dispatch(updateUserByAdmin({ 
          id: editingUser.id, 
          updates: {
            username: values.name,
            email: values.email,
            role: values.role,
          }
        })).unwrap();
        message.success('User updated successfully');
      } else {
        await dispatch(createUserByAdmin({
          name: values.name,
          email: values.email,
          password: values.password,
          role: values.role,
        })).unwrap();
        message.success('User created successfully');
      }
      setIsModalVisible(false);
      form.resetFields();
    } catch (error: any) {
      message.error(error.message || 'Operation failed');
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return 'red';
      case UserRole.INTERVIEWER:
        return 'blue';
      case UserRole.INTERVIEWEE:
        return 'green';
      default:
        return 'default';
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'username',
      key: 'username',
      render: (username: string) => (
        <Space>
          <UserOutlined />
          <strong>{username}</strong>
        </Space>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: UserRole) => (
        <Tag color={getRoleColor(role)} style={{ textTransform: 'capitalize' }}>
          {role}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (createdAt: number) => new Date(createdAt).toLocaleDateString(),
    },
    {
      title: 'Last Login',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      render: (lastLogin?: number) => 
        lastLogin ? new Date(lastLogin).toLocaleDateString() : 'Never',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: User) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEditUser(record)}
            disabled={record.id === currentUser?.id}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this user?"
            description="This action cannot be undone."
            onConfirm={() => handleDeleteUser(record.id)}
            disabled={record.id === currentUser?.id || record.role === UserRole.ADMIN}
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              disabled={record.id === currentUser?.id || record.role === UserRole.ADMIN}
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '20px', background: '#f5f5f5', minHeight: '100vh' }}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '24px' 
            }}>
              <div>
                <Title level={2} style={{ margin: 0, color: '#2c3e50' }}>
                  <TeamOutlined style={{ marginRight: '12px', color: '#667eea' }} />
                  User Management Portal
                </Title>
                <Text style={{ color: '#7f8c8d', fontSize: '16px' }}>
                  Manage users and their roles in the system
                </Text>
              </div>
              <Button
                type="primary"
                size="large"
                icon={<UserAddOutlined />}
                onClick={handleCreateUser}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600'
                }}
              >
                Add New User
              </Button>
            </div>

            <Table
              dataSource={users}
              columns={columns}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} users`,
              }}
              style={{ 
                backgroundColor: '#ffffff',
                borderRadius: '8px'
              }}
            />
          </Card>
        </Col>
      </Row>

      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <UserOutlined style={{ marginRight: '8px', color: '#667eea' }} />
            {editingUser ? 'Edit User' : 'Create New User'}
          </div>
        }
        visible={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
        style={{ top: 20 }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ marginTop: '20px' }}
        >
          <Form.Item
            label="Full Name"
            name="name"
            rules={[{ required: true, message: 'Please enter the full name' }]}
          >
            <Input 
              placeholder="Enter full name"
              style={{ borderRadius: '6px' }}
            />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Please enter email' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input 
              placeholder="Enter email address"
              style={{ borderRadius: '6px' }}
            />
          </Form.Item>

          {!editingUser && (
            <Form.Item
              label="Password"
              name="password"
              rules={[
                { required: true, message: 'Please enter password' },
                { min: 6, message: 'Password must be at least 6 characters' }
              ]}
            >
              <Input.Password 
                placeholder="Enter password"
                style={{ borderRadius: '6px' }}
              />
            </Form.Item>
          )}

          <Form.Item
            label="Role"
            name="role"
            rules={[{ required: true, message: 'Please select a role' }]}
          >
            <Select 
              placeholder="Select user role"
              style={{ borderRadius: '6px' }}
            >
              {Object.values(UserRole).map((role) => (
                <Option key={role} value={role}>
                  <Tag color={getRoleColor(role)} style={{ textTransform: 'capitalize' }}>
                    {role}
                  </Tag>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: '24px' }}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button
                onClick={() => {
                  setIsModalVisible(false);
                  form.resetFields();
                }}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  borderRadius: '6px'
                }}
              >
                {editingUser ? 'Update User' : 'Create User'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminPortal;
