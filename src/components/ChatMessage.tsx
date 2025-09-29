import React from 'react';
import { Avatar, Tag } from 'antd';
import { 
  RobotOutlined, 
  UserOutlined, 
  QuestionCircleOutlined, 
  AlertOutlined,
  ClockCircleOutlined,
  BulbOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import { ChatMessage as ChatMessageType } from '../types';

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
      margin: '12px 0',
      padding: '16px 20px',
    };

    switch (message.type) {
      case 'user':
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          marginLeft: 'auto',
          maxWidth: '70%',
          alignSelf: 'flex-end',
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
      default:
        return {
          ...baseStyle,
          background: '#f6f6f6',
          color: '#333',
          maxWidth: '80%',
        };
    }
  };

  const formatContent = (content: string) => {
    // Handle markdown-like formatting
    const formattedContent = content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    return { __html: formattedContent };
  };

  const getAvatar = () => {
    const avatarStyle = {
      marginRight: message.type === 'user' ? '0' : '12px',
      marginLeft: message.type === 'user' ? '12px' : '0',
    };

    switch (message.type) {
      case 'user':
        return <Avatar icon={<UserOutlined />} style={{ ...avatarStyle, backgroundColor: '#667eea' }} />;
      case 'system':
        return <Avatar icon={<RobotOutlined />} style={{ ...avatarStyle, backgroundColor: '#52c41a' }} />;
      case 'question':
        return <Avatar icon={<QuestionCircleOutlined />} style={{ ...avatarStyle, backgroundColor: '#fa8c16' }} />;
      case 'feedback':
        return <Avatar icon={<BulbOutlined />} style={{ ...avatarStyle, backgroundColor: '#722ed1' }} />;
      case 'timer-warning':
        return <Avatar icon={<AlertOutlined />} style={{ ...avatarStyle, backgroundColor: '#ff4d4f' }} />;
      default:
        return <Avatar icon={<RobotOutlined />} style={avatarStyle} />;
    }
  };

  const getTypeIndicator = () => {
    switch (message.type) {
      case 'question':
        return (
          <Tag color="orange" style={{ marginBottom: '8px' }}>
            <QuestionCircleOutlined /> Question {message.difficulty && `• ${message.difficulty.toUpperCase()}`}
          </Tag>
        );
      case 'feedback':
        return (
          <Tag color="purple" style={{ marginBottom: '8px' }}>
            <TrophyOutlined /> Feedback
          </Tag>
        );
      case 'timer-warning':
        return (
          <Tag color="red" style={{ marginBottom: '8px' }}>
            <ClockCircleOutlined /> Time Warning
          </Tag>
        );
      default:
        return null;
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  return (
    <>
      <style>
        {`
          @keyframes urgentPulse {
            0% { 
              transform: translateX(0);
              box-shadow: 0 4px 20px rgba(255, 77, 79, 0.4);
            }
            100% { 
              transform: translateX(2px);
              box-shadow: 0 6px 25px rgba(255, 77, 79, 0.6);
            }
          }
        `}
      </style>
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        marginBottom: '16px',
        flexDirection: message.type === 'user' ? 'row-reverse' : 'row',
      }}>
        {message.type !== 'timer-warning' && getAvatar()}
        
        <div style={getMessageStyle()}>
          {getTypeIndicator()}
          
          <div dangerouslySetInnerHTML={formatContent(message.content)} />
          
          <div style={{
            fontSize: '11px',
            opacity: 0.7,
            marginTop: '8px',
            textAlign: message.type === 'user' ? 'right' : 'left'
          }}>
            {formatTimestamp(message.timestamp)}
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatMessage;
