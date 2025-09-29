import React from 'react';
import { useAppSelector } from '../store/store';
import { UserRole } from '../types/auth';
import { Result, Button } from 'antd';
import { LockOutlined } from '@ant-design/icons';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requireAuth?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles, 
  requireAuth = true 
}) => {
  const { isAuthenticated, currentUser } = useAppSelector((state) => state.auth);

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return (
      <Result
        status="403"
        title="Authentication Required"
        subTitle="Please log in to access this content."
        icon={<LockOutlined />}
      />
    );
  }

  // If specific roles are required, check user role
  if (allowedRoles && currentUser) {
    if (!allowedRoles.includes(currentUser.role)) {
      return (
        <Result
          status="403"
          title="Access Denied"
          subTitle="You don't have permission to access this content."
          icon={<LockOutlined />}
          extra={
            <Button type="primary">
              Contact Administrator
            </Button>
          }
        />
      );
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
