import React, { memo, useMemo } from 'react';
import { Progress, Space } from 'antd';
import { ClockCircleOutlined, ThunderboltOutlined, FireOutlined, CheckCircleOutlined } from '@ant-design/icons';

interface OptimizedTimerProps {
  time: number;
  totalTime?: number;
}

// Memoized timer component to prevent unnecessary re-renders
const OptimizedTimer: React.FC<OptimizedTimerProps> = memo(({ time, totalTime = 120 }) => {
  // Memoize calculations to prevent recalculation on every render
  const timerData = useMemo(() => {
    const percentage = (time / totalTime) * 100;
    const progressPercentage = ((totalTime - time) / totalTime) * 100;
    
    // Format time
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    // Determine timer state
    let icon;
    let timerClass;
    let progressColor;
    
    if (time === 0) {
      icon = <CheckCircleOutlined />;
      timerClass = 'timer-completed';
      progressColor = '#52c41a';
    } else if (percentage <= 10) {
      icon = <FireOutlined />;
      timerClass = 'timer-critical';
      progressColor = '#ff4d4f';
    } else if (percentage <= 25) {
      icon = <ThunderboltOutlined />;
      timerClass = 'timer-warning';
      progressColor = '#faad14';
    } else {
      icon = <ClockCircleOutlined />;
      timerClass = 'timer-normal';
      progressColor = '#1890ff';
    }
    
    return {
      formattedTime,
      icon,
      timerClass,
      progressColor,
      progressPercentage: Math.max(0, progressPercentage),
      percentage,
    };
  }, [time, totalTime]);

  // Memoize styles to prevent object recreation
  const timerStyle = useMemo(() => {
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

    if (timerData.timerClass === 'timer-completed') {
      return {
        ...baseStyle,
        background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
        color: 'white',
      };
    } else if (timerData.timerClass === 'timer-critical') {
      return {
        ...baseStyle,
        animation: 'criticalPulse 0.5s ease-in-out infinite alternate',
        background: 'linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)',
        color: 'white',
        transform: 'scale(1.05)',
      };
    } else if (timerData.timerClass === 'timer-warning') {
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
  }, [timerData.timerClass]);

  return (
    <div className="optimized-timer-container" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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
      
      <div style={timerStyle}>
        <Space size={8}>
          {timerData.icon}
          <span>{timerData.formattedTime}</span>
        </Space>
      </div>
      
      {/* Mini progress indicator */}
      <div style={{ width: '60px' }}>
        <Progress
          percent={timerData.progressPercentage}
          showInfo={false}
          strokeColor={timerData.progressColor}
          strokeWidth={6}
          trailColor="#f0f0f0"
        />
      </div>
    </div>
  );
});

OptimizedTimer.displayName = 'OptimizedTimer';

export default OptimizedTimer;