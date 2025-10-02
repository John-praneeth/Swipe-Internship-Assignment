import React, { useState, useEffect } from 'react';
import { Card, Radio, Button, Space, Typography, Tag, Progress } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { Question } from '../types';

const { Title, Text } = Typography;

interface MultipleChoiceQuestionProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  timeRemaining: number;
  onSubmit: (selectedAnswer: string) => void;
  disabled?: boolean;
}

const MultipleChoiceQuestion: React.FC<MultipleChoiceQuestionProps> = ({
  question,
  questionNumber,
  totalQuestions,
  timeRemaining,
  onSubmit,
  disabled = false,
}) => {
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Auto-submit when time runs out
  useEffect(() => {
    if (timeRemaining === 0 && !isSubmitted && !disabled) {
      handleSubmit();
    }
  }, [timeRemaining, isSubmitted, disabled]);

  const handleSubmit = () => {
    if (selectedOption || timeRemaining === 0) {
      setIsSubmitted(true);
      onSubmit(selectedOption || '(No answer selected - time expired)');
    }
  };

  const handleOptionChange = (e: any) => {
    if (!isSubmitted && !disabled) {
      setSelectedOption(e.target.value);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '#52c41a';
      case 'medium': return '#faad14';
      case 'hard': return '#ff4d4f';
      default: return '#1890ff';
    }
  };

  const getTimeProgress = () => {
    return ((question.timeLimit - timeRemaining) / question.timeLimit) * 100;
  };

  const getTimeColor = () => {
    const percentage = (timeRemaining / question.timeLimit) * 100;
    if (percentage <= 10) return '#ff4d4f';
    if (percentage <= 25) return '#faad14';
    return '#52c41a';
  };

  return (
    <Card
      className="multiple-choice-question"
      style={{
        maxWidth: '800px',
        margin: '0 auto',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
        borderRadius: '12px',
      }}
    >
      {/* Question Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <Space>
            <Tag color="blue">
              Question {questionNumber} of {totalQuestions}
            </Tag>
            <Tag 
              color={getDifficultyColor(question.difficulty)}
              style={{ fontWeight: 'bold' }}
            >
              {question.difficulty.toUpperCase()}
            </Tag>
            <Tag color="purple">{question.category}</Tag>
          </Space>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ClockCircleOutlined style={{ color: getTimeColor() }} />
            <Text strong style={{ color: getTimeColor(), fontSize: '16px' }}>
              {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
            </Text>
          </div>
        </div>

        {/* Time Progress Bar */}
        <Progress
          percent={getTimeProgress()}
          showInfo={false}
          strokeColor={getTimeColor()}
          trailColor="#f0f0f0"
          strokeWidth={4}
          style={{ marginBottom: '16px' }}
        />
      </div>

      {/* Question Text */}
      <Title level={4} style={{ color: '#1890ff', marginBottom: '24px' }}>
        {question.text}
      </Title>

      {/* Multiple Choice Options */}
      <Radio.Group
        value={selectedOption}
        onChange={handleOptionChange}
        disabled={isSubmitted || disabled}
        style={{ width: '100%' }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {question.options?.map((option, index) => (
            <Radio
              key={index}
              value={option}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 16px',
                border: '2px solid #f0f0f0',
                borderRadius: '8px',
                backgroundColor: selectedOption === option ? '#e6f7ff' : '#fafafa',
                borderColor: selectedOption === option ? '#1890ff' : '#f0f0f0',
                transition: 'all 0.3s ease',
                fontSize: '16px',
                minHeight: '60px',
              }}
            >
              <div style={{ marginLeft: '12px', flex: 1 }}>
                <Text strong style={{ fontSize: '16px' }}>
                  {String.fromCharCode(65 + index)}. {option}
                </Text>
              </div>
            </Radio>
          ))}
        </Space>
      </Radio.Group>

      {/* Submit Button */}
      <div style={{ marginTop: '32px', textAlign: 'center' }}>
        <Button
          type="primary"
          size="large"
          icon={<CheckCircleOutlined />}
          onClick={handleSubmit}
          disabled={!selectedOption || isSubmitted || disabled}
          style={{
            borderRadius: '25px',
            padding: '8px 32px',
            height: 'auto',
            fontSize: '16px',
            fontWeight: 'bold',
          }}
        >
          {isSubmitted ? 'Answer Submitted' : 'Submit Answer'}
        </Button>
      </div>

      {/* Hint */}
      {!isSubmitted && !disabled && (
        <div style={{
          marginTop: '16px',
          padding: '12px',
          backgroundColor: '#f6ffed',
          border: '1px solid #b7eb8f',
          borderRadius: '6px',
          textAlign: 'center',
        }}>
          <Text type="secondary" style={{ fontSize: '14px' }}>
            💡 Select the best answer from the options above. You can change your selection before submitting.
          </Text>
        </div>
      )}

      {/* Auto-submit warning */}
      {timeRemaining <= 10 && !isSubmitted && !disabled && (
        <div style={{
          marginTop: '16px',
          padding: '12px',
          backgroundColor: '#fff2e8',
          border: '1px solid #ffbb96',
          borderRadius: '6px',
          textAlign: 'center',
        }}>
          <Text style={{ color: '#fa8c16', fontSize: '14px', fontWeight: 'bold' }}>
            ⚠️ Time is running out! Your answer will be auto-submitted in {timeRemaining} seconds.
          </Text>
        </div>
      )}
    </Card>
  );
};

export default MultipleChoiceQuestion;