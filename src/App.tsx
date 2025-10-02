import React, { useState, useEffect, useRef } from 'react';
import { Layout, Tabs, BackTop, FloatButton, Button, Dropdown, Avatar, Space, Typography } from 'antd';
import type { TabsProps } from 'antd';
import { 
  UserOutlined, 
  TeamOutlined, 
  QuestionCircleOutlined,
  SettingOutlined,
  SoundOutlined,
  LogoutOutlined,
  SettingFilled,
  CrownOutlined,
  CodeOutlined
} from '@ant-design/icons';
import { useAppSelector, useAppDispatch } from './store/store';
import { setWelcomeBackModal, resetCurrentCandidate } from './store/interviewSlice';
import { logoutUser, validateSession } from './store/authSlice';
import IntervieweeTab from './components/IntervieweeTab';
import InterviewerTab from './components/InterviewerTab';
import WelcomeBackModal from './components/WelcomeBackModal';
import Login from './components/Login';
import './components/InterviewStyles.css';
import AdminPortal from './components/AdminPortal';
import ProtectedRoute from './components/ProtectedRoute';
import CodingInterviewPlatform from './components/CodingInterviewPlatform';
import { UserRole } from './types/auth';
import { hybridStorage } from './services/integrationService';
import './App.css';

const { Header, Content } = Layout;
const { Text } = Typography;

const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const { currentCandidate, showWelcomeBack, candidates, isInterviewActive } = useAppSelector((state) => state.interview);
  const { isAuthenticated, currentUser } = useAppSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('1');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const prevUserRef = useRef(currentUser?.id);

  useEffect(() => {
    // Initialize backend integration
    hybridStorage.initialize();
    
    // Validate session on app load
    if (!isAuthenticated) {
      dispatch(validateSession());
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    // Reset interview state when a different user logs in
    if (isAuthenticated && currentUser && prevUserRef.current !== currentUser.id) {
      dispatch(resetCurrentCandidate());
      prevUserRef.current = currentUser.id;
    }
  }, [dispatch, isAuthenticated, currentUser]);

  useEffect(() => {
    // Check if there's an unfinished interview on app load, but NOT during active interviews
    if (currentCandidate && !isInterviewActive && (currentCandidate.isPaused || 
        (currentCandidate.status === 'in-progress' && currentCandidate.currentQuestionIndex > 0))) {
      dispatch(setWelcomeBackModal(true));
    }
  }, [currentCandidate, dispatch, isInterviewActive]);

  const handleLogout = async () => {
    await dispatch(logoutUser());
  };

  // Play notification sounds - optimized to prevent memory leaks
  const playSound = (type: 'success' | 'warning' | 'error') => {
    if (!soundEnabled) return;
    
    try {
      const frequency = type === 'success' ? 800 : type === 'warning' ? 600 : 400;
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(context.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, context.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.2, context.currentTime + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.5);
      
      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + 0.5);
      
      // Clean up audio context after sound completes
      setTimeout(() => {
        context.close().catch(() => {}); // Ignore errors if already closed
      }, 600);
    } catch (error) {
      console.warn('Audio playback failed:', error);
    }
  };

  // Show login if user is not authenticated
  if (!isAuthenticated) {
    return <Login />;
  }

  // Create tabs based on user role
  const getTabItems = () => {
    const items: TabsProps['items'] = [];
    let keyCounter = 1;

    // Interviewees and Interviewers can take/conduct interviews
    if (currentUser?.role === UserRole.INTERVIEWEE || currentUser?.role === UserRole.INTERVIEWER || currentUser?.role === UserRole.ADMIN) {
      items.push({
        key: keyCounter.toString(),
        label: (
          <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 500 }}>
            <UserOutlined style={{ fontSize: 16 }} />
            AI Interview
            {currentCandidate && (
              <span style={{ 
                background: '#34a853', 
                color: 'white', 
                borderRadius: '50%', 
                width: 8, 
                height: 8, 
                display: 'inline-block'
              }} />
            )}
          </span>
        ),
        children: <IntervieweeTab />,
      });
      keyCounter++;

      items.push({
        key: keyCounter.toString(),
        label: (
          <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 500 }}>
            <CodeOutlined style={{ fontSize: 16 }} />
            Coding Interview
          </span>
        ),
        children: <CodingInterviewPlatform />,
      });
      keyCounter++;
    }

    // Interviewer and Admin can see interviewer dashboard
    if (currentUser?.role === UserRole.INTERVIEWER || currentUser?.role === UserRole.ADMIN) {
      items.push({
        key: keyCounter.toString(),
        label: (
          <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 500 }}>
            <TeamOutlined style={{ fontSize: 16 }} />
            Interviewer Dashboard
            {candidates.length > 0 && (
              <span style={{
                background: '#1a73e8',
                color: 'white',
                borderRadius: '12px',
                padding: '2px 6px',
                fontSize: '11px',
                fontWeight: '500',
                minWidth: '18px',
                textAlign: 'center'
              }}>
                {candidates.length}
              </span>
            )}
          </span>
        ),
        children: (
          <ProtectedRoute allowedRoles={[UserRole.INTERVIEWER, UserRole.ADMIN]}>
            <InterviewerTab />
          </ProtectedRoute>
        ),
      });
      keyCounter++;
    }

    // Only Admin can see admin portal
    if (currentUser?.role === UserRole.ADMIN) {
      items.push({
        key: keyCounter.toString(),
        label: (
          <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 500 }}>
            <CrownOutlined style={{ fontSize: 16 }} />
            Admin Portal
          </span>
        ),
        children: (
          <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
            <AdminPortal />
          </ProtectedRoute>
        ),
      });
    }

    return items;
  };

  return (
    <div style={{ backgroundColor: '#f5f7fa', minHeight: '100vh' }}>
      <Layout className="app-layout">
        <Header className="app-header header-card" style={{ 
          background: '#ffffff',
          padding: '0 32px',
          borderBottom: '1px solid #dadce0',
          boxShadow: '0 1px 6px rgba(32, 33, 36, 0.1)',
          zIndex: 1000,
          position: 'relative',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36,
              height: 36,
              background: '#1a73e8',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '18px',
              fontWeight: '600'
            }}>
              AI
            </div>
            <h2 style={{ 
              color: '#202124', 
              margin: 0, 
              fontWeight: 500,
              fontSize: 20
            }}>
              AI Interview Assistant
            </h2>
          </div>

          {/* User Info and Logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Space>
              <Text style={{ fontWeight: 500, color: '#5f6368' }}>
                Welcome, {currentUser?.username}
              </Text>
              <Avatar
                size="small"
                style={{ 
                  backgroundColor: currentUser?.role === UserRole.ADMIN ? '#ff4757' : 
                                   currentUser?.role === UserRole.INTERVIEWER ? '#1a73e8' : '#34a853',
                }}
              >
                {currentUser?.username?.charAt(0).toUpperCase()}
              </Avatar>
            </Space>
            <Dropdown
              menu={{
                items: [
                  {
                    key: 'role',
                    label: (
                      <Space>
                        {currentUser?.role === UserRole.ADMIN && <CrownOutlined style={{ color: '#ff4757' }} />}
                        {currentUser?.role === UserRole.INTERVIEWER && <TeamOutlined style={{ color: '#1a73e8' }} />}
                        {currentUser?.role === UserRole.INTERVIEWEE && <UserOutlined style={{ color: '#34a853' }} />}
                        <Text strong style={{ textTransform: 'capitalize' }}>
                          {currentUser?.role}
                        </Text>
                      </Space>
                    ),
                    disabled: true,
                  },
                  { type: 'divider' },
                  {
                    key: 'logout',
                    label: (
                      <Space>
                        <LogoutOutlined />
                        Logout
                      </Space>
                    ),
                    onClick: handleLogout,
                  },
                ],
              }}
              trigger={['click']}
            >
              <Button
                type="text"
                icon={<SettingFilled />}
                style={{ color: '#5f6368' }}
              >
                Account
              </Button>
            </Dropdown>
          </div>
        </Header>
        
        <Content className="app-content" style={{ 
          background: '#f5f7fa',
          padding: '0',
          overflow: 'hidden' 
        }}>
          <Tabs
            activeKey={activeTab}
            items={getTabItems()}
            onChange={setActiveTab}
            size="large"
            style={{ height: '100%' }}
            tabBarStyle={{ 
              marginBottom: 0, 
              paddingLeft: 24,
              paddingTop: 8,
              background: '#ffffff',
              borderBottom: '1px solid #dadce0'
            }}
          />
        </Content>

        {/* Professional Floating Action Buttons */}
        <FloatButton.Group
          trigger="hover"
          type="primary"
          style={{ right: 24, bottom: 24 }}
          icon={<SettingOutlined />}
          tooltip="Settings"
        >
          <FloatButton
            icon={<SoundOutlined />}
            tooltip={soundEnabled ? "Disable Sound" : "Enable Sound"}
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              playSound('success');
            }}
            type={soundEnabled ? "primary" : "default"}
          />
          <FloatButton
            icon={<QuestionCircleOutlined />}
            tooltip="Help & Support"
            onClick={() => playSound('success')}
          />
        </FloatButton.Group>

        <BackTop style={{ right: 80, bottom: 24 }} />
      </Layout>
      
      <WelcomeBackModal 
        visible={showWelcomeBack}
        onClose={() => dispatch(setWelcomeBackModal(false))}
      />
    </div>
  );
};

export default App;
