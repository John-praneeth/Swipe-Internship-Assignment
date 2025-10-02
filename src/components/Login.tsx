import React, { useState } from 'react';
import { Form, Input, Button, Card, Alert, Typography, Divider, Row, Col } from 'antd';
import { UserOutlined, LockOutlined, LoginOutlined, UserAddOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../store/store';
import { loginUser, registerUser } from '../store/authSlice';
import { UserRole } from '../types/auth';

const { Title, Text } = Typography;

const Login: React.FC = () => {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);
  const [isRegister, setIsRegister] = useState(false);
  const [form] = Form.useForm();

  const handleSubmit = async (values: any) => {
    const { email, password, name } = values;
    
    try {
      if (isRegister) {
        await dispatch(registerUser({
          email,
          password,
          name,
          role: UserRole.INTERVIEWEE, // Only allow interviewee registration
        })).unwrap();
      } else {
        await dispatch(loginUser({ email, password })).unwrap();
      }
    } catch (error) {
      // Error handled in Redux slice
      console.error('Authentication error:', error);
    }
  };

  const switchMode = () => {
    setIsRegister(!isRegister);
    form.resetFields();
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <Row justify="center" style={{ width: '100%', maxWidth: '1200px' }}>
        <Col xs={24} sm={20} md={16} lg={12} xl={10}>
          <Card
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
              border: 'none',
              padding: '20px'
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <Title level={2} style={{ 
                color: '#2c3e50',
                marginBottom: '8px',
                fontSize: '28px',
                fontWeight: 'bold'
              }}>
                AI Interview Assistant
              </Title>
              <Text style={{ 
                color: '#7f8c8d',
                fontSize: '16px'
              }}>
                {isRegister ? 'Create interviewee account' : 'Sign in to your account'}
              </Text>
            </div>

            {error && (
              <Alert
                message="Authentication Error"
                description={error}
                type="error"
                showIcon
                style={{ marginBottom: '20px' }}
              />
            )}

            <Form
              form={form}
              name="auth"
              onFinish={handleSubmit}
              layout="vertical"
              size="large"
            >
              {isRegister && (
                <Form.Item
                  label="Full Name"
                  name="name"
                  rules={[{ required: true, message: 'Please input your full name!' }]}
                >
                  <Input
                    prefix={<UserOutlined style={{ color: '#bdc3c7' }} />}
                    placeholder="Enter your full name"
                    style={{ borderRadius: '8px' }}
                  />
                </Form.Item>
              )}

              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: 'Please input your email!' },
                  { type: 'email', message: 'Please enter a valid email!' }
                ]}
              >
                <Input
                  prefix={<UserOutlined style={{ color: '#bdc3c7' }} />}
                  placeholder="Enter your email"
                  style={{ borderRadius: '8px' }}
                />
              </Form.Item>

              <Form.Item
                label="Password"
                name="password"
                rules={[
                  { required: true, message: 'Please input your password!' },
                  { min: 6, message: 'Password must be at least 6 characters!' }
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined style={{ color: '#bdc3c7' }} />}
                  placeholder="Enter your password"
                  style={{ borderRadius: '8px' }}
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: '20px' }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  size="large"
                  style={{
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    fontWeight: '600',
                    fontSize: '16px'
                  }}
                  icon={isRegister ? <UserAddOutlined /> : <LoginOutlined />}
                >
                  {isRegister ? 'Create Interviewee Account' : 'Sign In'}
                </Button>
              </Form.Item>
            </Form>

            <Divider style={{ margin: '20px 0' }}>
              <Text style={{ color: '#bdc3c7' }}>or</Text>
            </Divider>

            <div style={{ textAlign: 'center' }}>
              <Text style={{ color: '#7f8c8d' }}>
                {isRegister ? 'Already have an account?' : "Need to take an interview?"}
              </Text>
              <Button
                type="link"
                onClick={switchMode}
                style={{
                  color: '#667eea',
                  fontWeight: '600',
                  padding: '0 8px'
                }}
              >
                {isRegister ? 'Sign in' : 'Create interviewee account'}
              </Button>
            </div>


          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Login;
