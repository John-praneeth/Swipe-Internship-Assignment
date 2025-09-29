import React from 'react';
import { Card, Typography, Avatar, Tag, Space } from 'antd';
import { 
  RobotOutlined, 
  UserOutlined, 
  QuestionCircleOutlined, 
  AlertOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  BulbOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import { ChatMessage as ChatMessageType } from '../types';

const { Text, Paragraph } = Typography;

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const getMessageStyle = () => {
    const baseStyle = {
      borderRadius: '16px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
      border: 'none',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative' as const,
      overflow: 'hidden' as const,
    };

    switch (message.type) {
      case 'user':
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          marginLeft: 'auto',
          maxWidth: '70%',
        };
      case 'system':
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
          color: 'white',
          maxWidth: '85%',
        };
      case 'question':
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, #fa8c16 0%, #ffa940 100%)',
          color: 'white',
          maxWidth: '90%',
          border: '2px solid rgba(250, 140, 22, 0.3)',
        };
      case 'feedback':
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, #722ed1 0%, #9254de 100%)',
          color: 'white',
          maxWidth: '75%',
          border: '1px solid rgba(114, 46, 209, 0.3)',
        };
      case 'timer-warning':
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)',
          color: 'white',
          maxWidth: '60%',
          animation: 'urgentPulse 0.8s ease-in-out infinite alternate',
        };
          maxWidth: '90%',
        };
      case 'timer-warning':
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)',
          color: 'white',
          textAlign: 'center' as const,
          maxWidth: '50%',
          margin: '0 auto',
          animation: 'pulse 1s ease-in-out infinite',
        };
      default:
        return {
          ...baseStyle,
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          maxWidth: '85%',
        };
    }
  };

  const formatContent = (content: string) => {
    // Handle markdown-style bold text
    const parts = content.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const boldText = part.slice(2, -2);
        return <strong key={index} style={{ fontWeight: 700 }}>{boldText}</strong>;
      }
      return part;
    });
  };

  const getAvatar = () => {
    const avatarStyle = {
      background: 'rgba(255, 255, 255, 0.2)',
      border: '2px solid rgba(255, 255, 255, 0.3)',
    };

    switch (message.type) {
      case 'question':
        return <Avatar icon={<QuestionCircleOutlined />} style={avatarStyle} />;
      case 'timer-warning':
        return <Avatar icon={<AlertOutlined />} style={{ ...avatarStyle, background: '#ff4d4f' }} />;
      case 'system':
        return <Avatar icon={<RobotOutlined />} style={avatarStyle} />;
      case 'user':
        return <Avatar icon={<UserOutlined />} style={avatarStyle} />;
      default:
        return <Avatar icon={<RobotOutlined />} style={avatarStyle} />;
    }
  };

  const getTypeIndicator = () => {
    switch (message.type) {
      case 'question':
        return <Tag color="orange" icon={<QuestionCircleOutlined />}>Question</Tag>;
      case 'timer-warning':
        return <Tag color="red" icon={<ClockCircleOutlined />}>Time Warning</Tag>;
      case 'system':
        return <Tag color="green" icon={<CheckCircleOutlined />}>System</Tag>;
      case 'user':
        return <Tag color="blue" icon={<UserOutlined />}>You</Tag>;
      default:
        return null;
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        marginBottom: 24,
        alignItems: message.type === 'user' ? 'flex-end' : 'flex-start',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 12,
          maxWidth: '100%',
          flexDirection: message.type === 'user' ? 'row-reverse' : 'row',
        }}
      >
        <div style={{ flexShrink: 0 }}>
          {getAvatar()}
        </div>
        
        <div style={{ flex: 1, minWidth: 0 }}>
          {message.type !== 'user' && (
            <div style={{ marginBottom: 8 }}>
              {getTypeIndicator()}
            </div>
          )}
          
          <Card
            size="small"
            style={{
              ...getMessageStyle(),
              margin: 0,
            }}
            bodyStyle={{ padding: '16px 20px' }}
          >
            <Paragraph 
              style={{ 
                margin: 0, 
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                color: 'inherit',
                fontSize: '15px',
                lineHeight: '1.6',
              }}
            >
              {formatContent(message.content)}
            </Paragraph>
            
            {message.difficulty && message.timeLimit && (
              <div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
                <Tag 
                  color="default" 
                  style={{ 
                    background: 'rgba(255, 255, 255, 0.2)', 
                    border: 'none',
                    color: 'white'
                  }}
                >
                  {message.timeLimit}s limit
                </Tag>
              </div>
            )}
          </Card>
        </div>
      </div>
      
      <Text 
        type="secondary" 
        style={{ 
          fontSize: '11px', 
          marginTop: 6,
          alignSelf: message.type === 'user' ? 'flex-end' : 'flex-start',
          color: 'rgba(255, 255, 255, 0.6)',
          background: 'rgba(0, 0, 0, 0.1)',
          padding: '2px 8px',
          borderRadius: '10px',
          backdropFilter: 'blur(10px)',
        }}
      >
        {new Date(message.timestamp).toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit',
          second: '2-digit'
        })}
      </Text>
    </div>
  );
};

export default ChatMessage;
