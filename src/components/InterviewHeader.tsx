import React from 'react';
import { Button, Progress, Tag } from 'antd';
import { PlusOutlined, UserOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { Candidate } from '../types';
import { UserRole } from '../types/auth';

interface InterviewHeaderProps {
  candidate: Candidate;
  isInterviewActive: boolean;
  onNewInterview: () => void;
  currentQuestionIndex?: number;
  totalQuestions?: number;
  userRole?: UserRole;
}

const InterviewHeader: React.FC<InterviewHeaderProps> = ({
  candidate,
  isInterviewActive,
  onNewInterview,
  currentQuestionIndex = 0,
  totalQuestions = 0,
  userRole
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'collecting-info': return 'orange';
      case 'in-progress': return 'blue';
      case 'completed': return 'green';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'collecting-info': return 'Setting Up';
      case 'in-progress': return 'In Progress';
      case 'completed': return 'Completed';
      default: return 'Unknown';
    }
  };

  const progressPercent = totalQuestions > 0 ? Math.round((currentQuestionIndex / totalQuestions) * 100) : 0;

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      padding: '16px 24px',
      borderBottom: '1px solid #f0f0f0',
      background: '#fff'
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserOutlined />
            {candidate.name || 'Candidate'}
          </h3>
          <Tag color={getStatusColor(candidate.status)}>
            {getStatusText(candidate.status)}
          </Tag>
          {isInterviewActive && <Tag color="processing">Live</Tag>}
        </div>
        
        <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#666' }}>
          {candidate.email && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MailOutlined />
              {candidate.email}
            </span>
          )}
          {candidate.phone && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <PhoneOutlined />
              {candidate.phone}
            </span>
          )}
        </div>

        {candidate.status === 'in-progress' && totalQuestions > 0 && (
          <div style={{ marginTop: '8px', maxWidth: '300px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
              <span>Progress</span>
              <span>{currentQuestionIndex}/{totalQuestions} questions</span>
            </div>
            <Progress 
              percent={progressPercent} 
              size="small" 
              status={progressPercent === 100 ? 'success' : 'active'}
            />
          </div>
        )}
      </div>
      
      {/* Only show New Interview button for Interviewees */}
      {userRole === UserRole.INTERVIEWEE && (
        <Button
          type="default"
          icon={<PlusOutlined />}
          onClick={onNewInterview}
          disabled={isInterviewActive}
        >
          New Interview
        </Button>
      )}
    </div>
  );
};

export default InterviewHeader;