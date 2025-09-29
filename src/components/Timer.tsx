import React from 'react';
import { Progress, Space } from 'antd';
import { ClockCircleOutlined, ThunderboltOutlined, FireOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { formatTime } from '../utils/resumeParser';

interface TimerProps {
  time: number;
  totalTime?: number;
}

const Timer: React.FC<TimerProps> = ({ time, totalTime = 120 }) => {
  const percentage = (time / totalTime) * 100;
  
  const getTimerIcon = () => {
    if (time === 0) return <CheckCircleOutlined />;
    if (percentage <= 10) return <FireOutlined />;
    if (percentage <= 25) return <ThunderboltOutlined />;
    return <ClockCircleOutlined />;
  };

  const getTimerStyle = () => {
    const baseStyle = {
      fontSize: '16px',
      fontWeight: 'bold' as const,
      padding: '8px 16px',
      borderRadius: '25px',
      border: 'none',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.3s ease',
      minWidth: '120px',
      textAlign: 'center' as const,
    };

    if (time === 0) {
      return {
        ...baseStyle,
        background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
        color: 'white',
      };
    }

    if (percentage <= 10) {
      return {
        ...baseStyle,
        animation: 'criticalPulse 0.5s ease-in-out infinite alternate',
        background: 'linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)',
        color: 'white',
        transform: 'scale(1.05)',
      };
    }
    
    if (percentage <= 25) {
      return {
        ...baseStyle,
        animation: 'warningPulse 1s ease-in-out infinite alternate',
        background: 'linear-gradient(135deg, #faad14 0%, #ffd666 100%)',
        color: 'white',
      };
    }
    
    return {
      ...baseStyle,
      background: 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)',
      color: 'white',
    };
  };

  const getProgressColor = () => {
    if (percentage <= 10) return '#ff4d4f';
    if (percentage <= 25) return '#faad14';
    if (percentage <= 50) return '#1890ff';
    return '#52c41a';
  };

  const progressPercentage = ((totalTime - time) / totalTime) * 100;

  return (
    <div className="timer-container" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <style>
        {`
          @keyframes criticalPulse {
            0% { 
              transform: scale(1.05);
              box-shadow: 0 0 20px rgba(255, 77, 79, 0.6);
            }
            100% { 
              transform: scale(1.1);
              box-shadow: 0 0 30px rgba(255, 77, 79, 0.9);
            }
          }
          
          @keyframes warningPulse {
            0% { 
              box-shadow: 0 4px 20px rgba(250, 173, 20, 0.4);
            }
            100% { 
              box-shadow: 0 6px 25px rgba(250, 173, 20, 0.6);
            }
          }
        `}
      </style>
      
      <div style={getTimerStyle()}>
        <Space size={8}>
          {getTimerIcon()}
          <span>{formatTime(time)}</span>
        </Space>
      </div>
      
      {/* Mini progress indicator */}
      <div style={{ width: '60px' }}>
        <Progress
          percent={Math.max(0, progressPercentage)}
          showInfo={false}
          strokeColor={getProgressColor()}
          strokeWidth={6}
          trailColor="#f0f0f0"
        />
      </div>
    </div>
  );
};

export default Timer;
