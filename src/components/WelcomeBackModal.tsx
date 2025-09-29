import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Modal, Button, Typography, Space, Card, Progress, Avatar, Divider } from 'antd';
import { 
  PlayCircleOutlined, 
  StopOutlined, 
  UserOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import { RootState } from '../store/store';
import { resumeInterview, resetCurrentCandidate } from '../store/interviewSlice';

const { Title, Paragraph, Text } = Typography;

interface WelcomeBackModalProps {
  visible: boolean;
  onClose: () => void;
}

const WelcomeBackModal: React.FC<WelcomeBackModalProps> = ({ visible, onClose }) => {
  const dispatch = useDispatch();
  const { currentCandidate } = useSelector((state: RootState) => state.interview);

  const handleContinue = () => {
    dispatch(resumeInterview());
    onClose();
  };

  const handleStartNew = () => {
    dispatch(resetCurrentCandidate());
    onClose();
  };

  if (!currentCandidate) return null;

  const getProgressMessage = () => {
    if (currentCandidate.status === 'completed') {
      return `You have already completed the interview with a score of ${currentCandidate.finalScore}/100.`;
    }
    
    const questionsAnswered = currentCandidate.answers.length;
    const totalQuestions = 6;
    const progressPercent = (questionsAnswered / totalQuestions) * 100;
    
    return { questionsAnswered, totalQuestions, progressPercent };
  };

  const progress = currentCandidate.status !== 'completed' ? getProgressMessage() as { questionsAnswered: number; totalQuestions: number; progressPercent: number } : null;

  return (
    <Modal
      title={null}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={600}
      centered
      className="welcome-back-modal"
      style={{
        background: 'transparent',
      }}
    >
      <div className="glass-card" style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px',
        padding: '40px',
        textAlign: 'center',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Animated Background */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
          animation: 'slideIn 0.8s ease-out'
        }} />
        
        {/* User Avatar */}
        <div style={{ marginBottom: '24px' }}>
          <Avatar
            size={80}
            icon={<UserOutlined />}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
              border: '4px solid rgba(255, 255, 255, 0.8)'
            }}
          />
        </div>

        <Title level={2} style={{ 
          margin: 0,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Welcome Back, {currentCandidate.name}! 👋
        </Title>
        
        <Paragraph style={{ fontSize: '16px', color: '#666', margin: '16px 0 32px' }}>
          {currentCandidate.status === 'completed' 
            ? 'You have already completed your interview.'
            : 'We found your unfinished interview session.'
          }
        </Paragraph>

        {currentCandidate.status === 'completed' ? (
          <Card style={{ 
            background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)', 
            border: 'none',
            borderRadius: '16px',
            marginBottom: '24px'
          }}>
            <div style={{ color: 'white', textAlign: 'center' }}>
              <TrophyOutlined style={{ fontSize: '32px', marginBottom: '12px', display: 'block' }} />
              <Title level={3} style={{ color: 'white', margin: 0 }}>
                Final Score: {currentCandidate.finalScore}/100
              </Title>
              <Text style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                Interview completed successfully!
              </Text>
            </div>
          </Card>
        ) : (
          <Card style={{ 
            background: 'rgba(64, 169, 255, 0.1)', 
            border: '1px solid rgba(64, 169, 255, 0.3)',
            borderRadius: '16px',
            marginBottom: '24px'
          }}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div>
                <Text strong style={{ fontSize: '16px' }}>Interview Progress</Text>
                <div style={{ marginTop: '8px' }}>
                  <Progress
                    percent={typeof progress === 'object' ? progress.progressPercent : 0}
                    strokeColor={{
                      '0%': '#667eea',
                      '100%': '#764ba2',
                    }}
                    style={{ marginBottom: '8px' }}
                  />
                  <Text type="secondary">
                    {typeof progress === 'object' && `Question ${progress.questionsAnswered + 1} of ${progress.totalQuestions}`}
                  </Text>
                </div>
              </div>

              <Divider style={{ margin: '12px 0' }} />

              <Space size="large" style={{ justifyContent: 'center', width: '100%' }}>
                <div style={{ textAlign: 'center' }}>
                  <CheckCircleOutlined style={{ fontSize: '24px', color: '#52c41a' }} />
                  <div style={{ marginTop: '4px' }}>
                    <Text strong>{typeof progress === 'object' ? progress.questionsAnswered : 0}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>Completed</Text>
                  </div>
                </div>
                
                <div style={{ textAlign: 'center' }}>
                  <ThunderboltOutlined style={{ fontSize: '24px', color: '#fa8c16' }} />
                  <div style={{ marginTop: '4px' }}>
                    <Text strong>
                      {typeof progress === 'object' ? progress.totalQuestions - progress.questionsAnswered : 6}
                    </Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>Remaining</Text>
                  </div>
                </div>
                
                <div style={{ textAlign: 'center' }}>
                  <ClockCircleOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
                  <div style={{ marginTop: '4px' }}>
                    <Text strong>
                      {currentCandidate.remainingTime ? `${currentCandidate.remainingTime}s` : 'Paused'}
                    </Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>Time Left</Text>
                  </div>
                </div>
              </Space>
            </Space>
          </Card>
        )}

        <Space size="large">
          {currentCandidate.status !== 'completed' && (
            <>
              <Button
                size="large"
                icon={<StopOutlined />}
                onClick={handleStartNew}
                style={{
                  borderRadius: '25px',
                  height: '48px',
                  padding: '0 24px'
                }}
              >
                Start New Interview
              </Button>
              
              <Button
                type="primary"
                size="large"
                icon={<PlayCircleOutlined />}
                onClick={handleContinue}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  borderRadius: '25px',
                  height: '48px',
                  padding: '0 24px',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
                }}
                className="advanced-button"
              >
                Continue Interview
              </Button>
            </>
          )}
          
          {currentCandidate.status === 'completed' && (
            <Button
              type="primary"
              size="large"
              onClick={onClose}
              style={{
                background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
                border: 'none',
                borderRadius: '25px',
                height: '48px',
                padding: '0 32px'
              }}
            >
              Close
            </Button>
          )}
        </Space>

        <style>
          {`
            @keyframes slideIn {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(0); }
            }
          `}
        </style>
      </div>
    </Modal>
  );
};

export default WelcomeBackModal;
