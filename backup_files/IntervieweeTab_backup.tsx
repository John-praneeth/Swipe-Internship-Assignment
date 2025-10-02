import React, { useState, useEffect, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '../store/store';
import {
  Card,
  Upload,
  Button,
  Input,
  message,
  Spin,
  Progress,
  Tag,
  Tooltip,
  Space,
  Typography,
  Badge,
} from 'antd';
import { 
  InboxOutlined, 
  SendOutlined, 
  PauseCircleOutlined, 
  PlayCircleOutlined,
  QuestionCircleOutlined,
  BulbOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import type { UploadProps } from 'antd';
import {
  createCandidate,
  updateCandidateInfo,
  startInterview,
  submitAnswer,
  updateTimer,
  timeUp,
  pauseInterview,
  resumeInterview,
  addChatMessage,
} from '../store/interviewSlice';
import {
  extractTextFromPDF,
  extractTextFromDOCX,
  parseResumeData,
  isInfoComplete,
  getMissingInfoMessage,
  isValidEmail,
  isValidPhone,
  calculateTimeSpent,
} from '../utils/resumeParser';
import ChatMessage from './ChatMessage';
import Timer from './Timer';
import MultipleChoiceQuestion from './MultipleChoiceQuestion';
import InterviewCompletionPage from './InterviewCompletionPage';
import InterviewCompletionPage from './InterviewCompletionPage';

const { Dragger } = Upload;
const { TextArea } = Input;
const { Text, Title } = Typography;

// Helper function to provide hints for questions
const getQuestionHint = (question: any): string => {
  const hintMap: Record<string, string> = {
    'JavaScript Fundamentals': '💡 Think about scope, hoisting, and memory allocation differences',
    'React Basics': '💡 Consider component rendering, syntax benefits, and developer experience',
    'Web Development': '💡 Focus on performance, manipulation differences, and rendering concepts',
    'React Hooks': '💡 Explain lifecycle equivalents, dependency arrays, and cleanup functions',
    'Database Design': '💡 Consider scalability, consistency, flexibility, and use cases',
    'Asynchronous JavaScript': '💡 Think about .then(), .catch(), async/await, and error propagation',
    'State Management': '💡 Compare complexity, scalability, performance, and team preferences',
    'System Design': '💡 Consider architecture patterns, scalability bottlenecks, and real-time communication',
    'Advanced JavaScript': '💡 Think about scope chain, practical applications, and memory management',
    'Performance Optimization': '💡 Consider bundle size, rendering optimization, and user experience',
    'Distributed Systems': '💡 Think about service communication, security patterns, and fault tolerance',
  };
  
  return hintMap[question.category] || '💡 Structure your answer with clear points and examples';
};

const IntervieweeTab: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    currentCandidate,
    isInterviewActive,
    currentTimer,
    questions,
    chatMessages,
  } = useAppSelector((state) => state.interview);

  const [isUploading, setIsUploading] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [waitingForInfo, setWaitingForInfo] = useState<'name' | 'email' | 'phone' | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout>();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Timer effect - optimized to prevent unnecessary re-renders
  useEffect(() => {
    if (!isInterviewActive) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = undefined;
      }
      return;
    }

    if (currentTimer <= 0) {
      dispatch(timeUp());
      return;
    }

    timerRef.current = setTimeout(() => {
      dispatch(updateTimer(currentTimer - 1));
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = undefined;
      }
    };
  }, [isInterviewActive, currentTimer, dispatch]);

  const uploadProps: UploadProps = {
    name: 'file',
    multiple: false,
    accept: '.pdf,.docx',
    beforeUpload: (file) => {
      const isPDF = file.type === 'application/pdf';
      const isDOCX = file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      
      if (!isPDF && !isDOCX) {
        message.error('You can only upload PDF or DOCX files!');
        return false;
      }
      
      handleFileUpload(file);
      return false; // Prevent default upload
    },
    showUploadList: false,
  };

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    
    try {
      console.log('Starting file upload process for:', file.name, 'Type:', file.type);
      
      // Use the proper parseResumeData function with better error handling
      const candidateInfo = await parseResumeData(file);
      
      console.log('Parsed candidate info:', candidateInfo);
      
      // Also extract the text for storage (if possible)
      let extractedText = '';
      try {
        if (file.type === 'application/pdf') {
          extractedText = await extractTextFromPDF(file);
        } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
          extractedText = await extractTextFromDOCX(file);
        }
        console.log('Extracted text length:', extractedText.length);
      } catch (textError) {
        console.warn('Could not extract text for storage, continuing with manual input:', textError);
        extractedText = `Resume uploaded: ${file.name} (Text extraction failed, information collected manually)`;
      }
      
      dispatch(createCandidate({
        ...candidateInfo,
        resumeFile: file,
        resumeText: extractedText,
      }));
      
      // Show success message
      if (candidateInfo.name || candidateInfo.email || candidateInfo.phone) {
        message.success('Resume uploaded and processed successfully!');
      } else {
        message.success('Resume uploaded! I\'ll help you fill in your details.');
      }
      
      // Check what info is missing and ask for it
      if (!isInfoComplete(candidateInfo)) {
        const missingMessage = getMissingInfoMessage(candidateInfo);
        dispatch(addChatMessage({
          type: 'system',
          content: missingMessage,
        }));
        
        // Set what we're waiting for
        if (!candidateInfo.name) setWaitingForInfo('name');
        else if (!candidateInfo.email) setWaitingForInfo('email');
        else if (!candidateInfo.phone) setWaitingForInfo('phone');
      } else {
        // All info is complete, ask if ready to start
        dispatch(addChatMessage({
          type: 'system',
          content: `Great! I have all your information:\n\n📝 **Name:** ${candidateInfo.name}\n📧 **Email:** ${candidateInfo.email}\n📱 **Phone:** ${candidateInfo.phone}\n\nAre you ready to start the interview? The interview consists of 6 questions:\n- 2 Easy questions (20 seconds each)\n- 2 Medium questions (60 seconds each)\n- 2 Hard questions (120 seconds each)\n\nType "yes" when you're ready to begin!`,
        }));
      }
    } catch (error) {
      console.error('Resume upload error:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to process the resume. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('No text could be extracted')) {
          errorMessage = 'Could not extract text from the resume. Please ensure the file is not password-protected or corrupted.';
        } else if (error.message.includes('Unsupported file format')) {
          errorMessage = 'Please upload a PDF or DOCX file only.';
        } else if (error.message.includes('Failed to extract text from PDF')) {
          errorMessage = 'Failed to read PDF file. Please ensure it is not corrupted or password-protected.';
        } else if (error.message.includes('Failed to extract text from DOCX')) {
          errorMessage = 'Failed to read DOCX file. Please ensure it is not corrupted or password-protected.';
        }
      }
      
      message.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSendMessage = () => {
    if (!currentAnswer.trim()) return;
    
    const userMessage = currentAnswer.trim();
    setCurrentAnswer('');
    
    if (!currentCandidate) return;
    
    // Handle different states
    if (waitingForInfo) {
      handleInfoCollection(userMessage);
    } else if (currentCandidate.status === 'collecting-info' && userMessage.toLowerCase() === 'yes') {
      dispatch(startInterview());
    } else if (isInterviewActive) {
      // Submit answer
      const timeSpent = calculateTimeSpent(
        questions[currentCandidate.currentQuestionIndex]?.timeLimit || 0,
        currentTimer
      );
      dispatch(submitAnswer({ answer: userMessage, timeSpent }));
    } else {
      // General chat
      dispatch(addChatMessage({
        type: 'user',
        content: userMessage,
      }));
      
      if (currentCandidate.status === 'collecting-info') {
        dispatch(addChatMessage({
          type: 'system',
          content: 'Please type "yes" when you\'re ready to start the interview.',
        }));
      }
    }
  };

  const handleMultipleChoiceSubmit = (selectedAnswer: string) => {
    if (!currentCandidate || !isInterviewActive) return;
    
    const currentQuestion = questions[currentCandidate.currentQuestionIndex];
    if (!currentQuestion) return;
    
    const timeSpent = calculateTimeSpent(currentQuestion.timeLimit, currentTimer);
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    
    dispatch(submitAnswer({ 
      answer: selectedAnswer, 
      timeSpent,
      isCorrect,
      selectedOption: selectedAnswer
    }));
  };

  const handleInfoCollection = (value: string) => {
    if (!currentCandidate || !waitingForInfo) return;
    
    let isValid = true;
    let errorMessage = '';
    
    // Validate input based on what we're collecting
    if (waitingForInfo === 'email' && !isValidEmail(value)) {
      isValid = false;
      errorMessage = 'Please enter a valid email address.';
    } else if (waitingForInfo === 'phone' && !isValidPhone(value)) {
      isValid = false;
      errorMessage = 'Please enter a valid phone number.';
    }
    
    if (!isValid) {
      dispatch(addChatMessage({
        type: 'system',
        content: errorMessage + ' Please try again:',
      }));
      return;
    }
    
    // Update the candidate info
    dispatch(updateCandidateInfo({ field: waitingForInfo, value }));
    
    dispatch(addChatMessage({
      type: 'user',
      content: value,
    }));
    
    // Check what's next
    const updatedCandidate = { ...currentCandidate, [waitingForInfo]: value };
    
    if (!updatedCandidate.name) {
      setWaitingForInfo('name');
      dispatch(addChatMessage({
        type: 'system',
        content: 'Thank you! Now, what\'s your full name?',
      }));
    } else if (!updatedCandidate.email) {
      setWaitingForInfo('email');
      dispatch(addChatMessage({
        type: 'system',
        content: 'Great! What\'s your email address?',
      }));
    } else if (!updatedCandidate.phone) {
      setWaitingForInfo('phone');
      dispatch(addChatMessage({
        type: 'system',
        content: 'Perfect! What\'s your phone number?',
      }));
    } else {
      // All info collected
      setWaitingForInfo(null);
      dispatch(addChatMessage({
        type: 'system',
        content: `Excellent! I have all your information:\n\n📝 **Name:** ${updatedCandidate.name}\n📧 **Email:** ${updatedCandidate.email}\n📱 **Phone:** ${updatedCandidate.phone}\n\nAre you ready to start the interview? The interview consists of 6 questions:\n- 2 Easy questions (20 seconds each)\n- 2 Medium questions (60 seconds each)\n- 2 Hard questions (120 seconds each)\n\nType "yes" when you're ready to begin!`,
      }));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handlePauseResume = () => {
    if (currentCandidate?.isPaused) {
      dispatch(resumeInterview());
    } else {
      dispatch(pauseInterview());
    }
  };

  const getProgress = () => {
    if (!currentCandidate || !questions.length) return 0;
    return (currentCandidate.currentQuestionIndex / questions.length) * 100;
  };

  const getCurrentQuestion = () => {
    if (!currentCandidate || !questions.length || !isInterviewActive) return null;
    return questions[currentCandidate.currentQuestionIndex];
  };

  const currentQuestion = getCurrentQuestion();

  if (!currentCandidate) {
    return (
      <div style={{ padding: 24, maxWidth: 600, margin: '0 auto' }}>
        <Card title="Upload Your Resume" className="file-upload-area">
          <Spin spinning={isUploading} tip="Processing your resume...">
            <Dragger {...uploadProps} style={{ padding: 20 }}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined style={{ fontSize: 48, color: '#1890ff' }} />
              </p>
              <p className="ant-upload-text">
                Click or drag your resume file to this area to upload
              </p>
              <p className="ant-upload-hint">
                Support for PDF and DOCX files only. Your resume will be analyzed to extract basic information.
              </p>
            </Dragger>
          </Spin>
        </Card>
      </div>
    );
  }

  return (
    <div className="chat-container">
      {isInterviewActive && (
        <div style={{ 
          padding: '20px 24px', 
          borderBottom: '1px solid #f0f0f0', 
          background: 'linear-gradient(135deg, #f6f9fc 0%, #e9f4ff 100%)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
        }}>
          {/* Interview Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Space size="large">
              <Badge 
                count={`${currentCandidate.currentQuestionIndex + 1}/${questions.length}`}
                style={{ backgroundColor: '#1890ff' }}
              >
                <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
                  <TrophyOutlined /> Interview Progress
                </Title>
              </Badge>
              {currentQuestion && (
                <Tag 
                  className={`difficulty-${currentQuestion.difficulty}`}
                  style={{
                    fontSize: '14px',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontWeight: 'bold'
                  }}
                >
                  {currentQuestion.difficulty.toUpperCase()} - {currentQuestion.category}
                </Tag>
              )}
            </Space>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <Timer time={currentTimer} totalTime={currentQuestion?.timeLimit || 120} />
              <Tooltip title={currentCandidate.isPaused ? 'Resume Interview' : 'Pause Interview'}>
                <Button
                  type="default"
                  icon={currentCandidate.isPaused ? <PlayCircleOutlined /> : <PauseCircleOutlined />}
                  onClick={handlePauseResume}
                  size="large"
                  style={{
                    borderRadius: '25px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  {currentCandidate.isPaused ? 'Resume' : 'Pause'}
                </Button>
              </Tooltip>
            </div>
          </div>

          {/* Progress Bar with Steps */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text strong style={{ color: '#1890ff' }}>
                <ClockCircleOutlined /> Question {currentCandidate.currentQuestionIndex + 1} of {questions.length}
              </Text>
              <Text type="secondary">
                Time: {Math.floor(currentTimer / 60)}:{(currentTimer % 60).toString().padStart(2, '0')}
              </Text>
            </div>
            <Progress 
              percent={getProgress()} 
              showInfo={false}
              strokeColor={{
                '0%': '#108ee9',
                '100%': '#87d068',
              }}
              style={{ marginBottom: 8 }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              {questions.map((q, index) => (
                <div key={q.id} style={{ 
                  fontSize: '12px',
                  color: index < currentCandidate.currentQuestionIndex ? '#52c41a' : 
                         index === currentCandidate.currentQuestionIndex ? '#1890ff' : '#d9d9d9',
                  textAlign: 'center',
                  flex: 1
                }}>
                  {index < currentCandidate.currentQuestionIndex ? 
                    <CheckCircleOutlined /> : 
                    index === currentCandidate.currentQuestionIndex ?
                    <ClockCircleOutlined /> :
                    <QuestionCircleOutlined />
                  }
                  <br />
                  Q{index + 1}
                </div>
              ))}
            </div>
          </div>

          {/* Question Hints */}
          {currentQuestion && (
            <div style={{
              background: 'rgba(24, 144, 255, 0.05)',
              border: '1px solid rgba(24, 144, 255, 0.2)',
              borderRadius: '8px',
              padding: '12px',
              marginTop: 12
            }}>
              <Space>
                <BulbOutlined style={{ color: '#1890ff' }} />
                <Text style={{ color: '#1890ff', fontSize: '13px' }}>
                  <strong>Tip:</strong> Structure your answer clearly and provide specific examples when possible.
                </Text>
              </Space>
            </div>
          )}
        </div>
      )}
      
      <div className="chat-messages">
        {chatMessages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Multiple Choice Question Display */}
      {isInterviewActive && currentQuestion && currentQuestion.type === 'multiple-choice' && (
        <div style={{ padding: '24px', backgroundColor: '#f8f9fa' }}>
          <MultipleChoiceQuestion
            question={currentQuestion}
            questionNumber={currentCandidate.currentQuestionIndex + 1}
            totalQuestions={questions.length}
            timeRemaining={currentTimer}
            onSubmit={handleMultipleChoiceSubmit}
            disabled={currentCandidate.isPaused}
          />
        </div>
      )}
      
      <div className="chat-input-area">
        {currentCandidate.status === 'completed' ? (
          <InterviewCompletionPage
            candidate={currentCandidate}
            questions={questions}
            onStartNewInterview={() => {
              // Reset to initial state for new interview
              window.location.reload();
            }}
          />
        ) : currentCandidate.status === 'completed_old' ? (
          <div>Completed</div>
            {/* Thank You Header */}
            <Card 
              className="completion-card thank-you-header"
              style={{ 
                marginBottom: '24px',
                textAlign: 'center',
                border: '2px solid #1890ff',
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(24, 144, 255, 0.12)',
                position: 'relative'
              }}
            >
              <div className="completion-confetti">
                {[...Array(20)].map((_, i) => (
                  <div 
                    key={i}
                    className="confetti-piece"
                    style={{
                      left: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 3}s`,
                      animationDuration: `${3 + Math.random() * 2}s`
                    }}
                  />
                ))}
              </div>
              <Space direction="vertical" size="large" style={{ position: 'relative', zIndex: 1 }}>
                <div>
                  <TrophyOutlined className="trophy-glow" style={{ fontSize: '64px', color: '#faad14', marginBottom: '16px' }} />
                  <Title level={2} style={{ margin: 0, color: '#1890ff', fontWeight: 'bold' }}>
                    🎉 Interview Completed Successfully!
                  </Title>
                </div>
                <div>
                  <Title level={3} style={{ color: '#52c41a', margin: '16px 0' }}>
                    Thank You, {currentCandidate.name}!
                  </Title>
                  <Text style={{ fontSize: '18px', color: '#666', display: 'block', marginBottom: '8px' }}>
                    We appreciate the time and effort you've put into this interview.
                  </Text>
                  <Text style={{ fontSize: '16px', color: '#888' }}>
                    We will review your responses and reach out to you soon with the next steps.
                  </Text>
                </div>
                <div className="final-score-badge pulse-animation" style={{
                  background: 'rgba(82, 196, 26, 0.1)',
                  border: '2px solid #52c41a',
                  borderRadius: '12px',
                  padding: '20px',
                  display: 'inline-block'
                }}>
                  <Text strong style={{ fontSize: '24px', color: '#52c41a' }}>
                    Final Score: {currentCandidate.finalScore || 0}/100
                  </Text>
                </div>
              </Space>
            </Card>

            {/* Detailed Scorecard */}
            <Card 
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <TrophyOutlined style={{ color: '#1890ff' }} />
                  <span style={{ color: '#1890ff', fontWeight: 'bold' }}>Interview Scorecard</span>
                </div>
              }
              style={{ borderRadius: '12px', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)' }}
            >
              {/* Interview Summary Stats */}
              <div style={{ marginBottom: '24px' }}>
                <Space size="large" wrap>
                  <div className="scorecard-stat" style={{ textAlign: 'center', minWidth: '120px' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                      {questions.length}
                    </div>
                    <Text type="secondary">Questions</Text>
                  </div>
                  <div className="scorecard-stat" style={{ textAlign: 'center', minWidth: '120px' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                      {currentCandidate.answers.filter(a => a.answer.trim().length > 0).length}
                    </div>
                    <Text type="secondary">Answered</Text>
                  </div>
                  <div className="scorecard-stat" style={{ textAlign: 'center', minWidth: '120px' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#faad14' }}>
                      {Math.round(currentCandidate.answers.reduce((acc, answer) => acc + answer.timeSpent, 0) / 60)}m
                    </div>
                    <Text type="secondary">Total Time</Text>
                  </div>
                  <div className="scorecard-stat" style={{ textAlign: 'center', minWidth: '120px' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#722ed1' }}>
                      {currentCandidate.startTime && currentCandidate.endTime ? 
                        Math.round((currentCandidate.endTime - currentCandidate.startTime) / 1000 / 60) : 0}m
                    </div>
                    <Text type="secondary">Session Time</Text>
                  </div>
                </Space>
              </div>

              {/* Performance by Difficulty */}
              <div style={{ marginBottom: '24px' }}>
                <Title level={4} style={{ color: '#1890ff', marginBottom: '16px' }}>
                  Performance by Difficulty
                </Title>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  {['easy', 'medium', 'hard'].map(difficulty => {
                    const difficultyAnswers = currentCandidate.answers.filter(a => a.difficulty === difficulty);
                    const answered = difficultyAnswers.filter(a => a.answer.trim().length > 0).length;
                    const total = difficultyAnswers.length;
                    const percentage = total > 0 ? (answered / total) * 100 : 0;
                    
                    return (
                      <div key={difficulty} className={`performance-card difficulty-${difficulty}`} style={{
                        flex: 1,
                        minWidth: '200px',
                        border: '1px solid',
                        borderRadius: '8px',
                        padding: '16px',
                        textAlign: 'center'
                      }}>
                        <Tag 
                          className={`difficulty-${difficulty}`}
                          style={{ marginBottom: '8px', fontSize: '12px', fontWeight: 'bold' }}
                        >
                          {difficulty.toUpperCase()}
                        </Tag>
                        <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '4px' }}>
                          {answered}/{total}
                        </div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          Questions Completed
                        </Text>
                        <Progress 
                          percent={percentage} 
                          size="small" 
                          showInfo={false}
                          strokeColor={difficulty === 'easy' ? '#52c41a' : difficulty === 'medium' ? '#faad14' : '#ff4d4f'}
                          style={{ marginTop: '8px' }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Individual Question Performance */}
              <div>
                <Title level={4} style={{ color: '#1890ff', marginBottom: '16px' }}>
                  Question-by-Question Performance
                </Title>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {currentCandidate.answers.map((answer, index) => {
                    const question = questions.find(q => q.id === answer.questionId);
                    if (!question) return null;
                    
                    const timePercentage = (answer.timeSpent / question.timeLimit) * 100;
                    const hasAnswer = answer.answer.trim().length > 0;
                    
                    return (
                      <div key={answer.questionId} className="question-performance-item" style={{
                        background: '#fafafa',
                        border: '1px solid #f0f0f0',
                        borderRadius: '8px',
                        padding: '16px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                          <div style={{ flex: 1 }}>
                            <Text strong style={{ color: '#1890ff' }}>
                              Question {index + 1}: 
                            </Text>
                            <Tag 
                              className={`difficulty-${question.difficulty}`}
                              style={{ marginLeft: '8px', fontSize: '11px' }}
                            >
                              {question.difficulty.toUpperCase()}
                            </Tag>
                            <div style={{ marginTop: '4px', color: '#666' }}>
                              {question.category}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ 
                              color: hasAnswer ? '#52c41a' : '#ff4d4f',
                              fontWeight: 'bold',
                              fontSize: '12px'
                            }}>
                              {hasAnswer ? '✓ ANSWERED' : '✗ NOT ANSWERED'}
                            </div>
                            <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>
                              {Math.floor(answer.timeSpent / 60)}:{(answer.timeSpent % 60).toString().padStart(2, '0')} / {Math.floor(question.timeLimit / 60)}:{(question.timeLimit % 60).toString().padStart(2, '0')}
                            </div>
                          </div>
                        </div>
                        <Progress 
                          percent={timePercentage} 
                          size="small" 
                          showInfo={false}
                          strokeColor={timePercentage > 90 ? '#ff4d4f' : timePercentage > 70 ? '#faad14' : '#52c41a'}
                          format={() => `${Math.round(timePercentage)}%`}
                        />
                        {hasAnswer && (
                          <div style={{ 
                            marginTop: '8px', 
                            padding: '8px',
                            background: '#fff',
                            borderRadius: '4px',
                            border: '1px solid #e8e8e8'
                          }}>
                            <Text style={{ fontSize: '12px', color: '#666' }}>
                              Answer length: {answer.answer.length} characters
                            </Text>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Summary Message */}
              <div style={{ 
                marginTop: '24px',
                padding: '20px',
                background: 'linear-gradient(135deg, #e6f7ff 0%, #f0f9ff 100%)',
                border: '1px solid #91d5ff',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <Title level={4} style={{ color: '#1890ff', marginBottom: '12px' }}>
                  What's Next?
                </Title>
                <Text style={{ fontSize: '16px', color: '#666', display: 'block', marginBottom: '8px' }}>
                  🔍 Our team will carefully review your responses and technical approach
                </Text>
                <Text style={{ fontSize: '16px', color: '#666', display: 'block', marginBottom: '8px' }}>
                  📧 You'll receive an email with feedback and next steps within 2-3 business days
                </Text>
                <Text style={{ fontSize: '16px', color: '#666' }}>
                  💼 Thank you for your interest in joining our team!
                </Text>
              </div>
            </Card>
          </div>
        ) : (
          // Only show text input if it's not a multiple choice question
          !(isInterviewActive && currentQuestion && currentQuestion.type === 'multiple-choice') && (
            <div style={{ position: 'relative' }}>
              {/* Character count and status indicators */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 16px',
                background: '#fafafa',
                borderRadius: '8px 8px 0 0',
                fontSize: '12px',
                color: '#666'
              }}>
                <Space>
                  {waitingForInfo ? (
                    <Text type="secondary">
                      <QuestionCircleOutlined /> Please provide your {waitingForInfo}
                    </Text>
                  ) : isInterviewActive ? (
                    <Space>
                      <Text type="secondary">
                        <ClockCircleOutlined /> Question {currentCandidate.currentQuestionIndex + 1} of {questions.length}
                      </Text>
                      {currentQuestion && (
                        <Text type="secondary">
                          • {currentQuestion.difficulty.toUpperCase()}
                        </Text>
                      )}
                    </Space>
                  ) : (
                    <Text type="secondary">
                      <BulbOutlined /> Type your message
                    </Text>
                  )}
                </Space>
                <Text type="secondary">
                  {currentAnswer.length}/1000 characters
                </Text>
              </div>

            <div style={{ 
              display: 'flex', 
              gap: 12,
              padding: '12px',
              background: '#fff',
              borderRadius: '0 0 8px 8px',
              border: '1px solid #f0f0f0',
              borderTop: 'none'
            }}>
              <TextArea
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  waitingForInfo 
                    ? `Enter your ${waitingForInfo}...`
                    : isInterviewActive 
                      ? 'Type your answer here... (Press Enter to send, Shift+Enter for new line)'
                      : 'Type your message...'
                }
                autoSize={{ minRows: 2, maxRows: 6 }}
                disabled={currentCandidate.isPaused}
                maxLength={1000}
                style={{
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
                showCount
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Tooltip title={currentAnswer.trim() ? "Send your response" : "Please type your answer first"}>
                  <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={handleSendMessage}
                    disabled={!currentAnswer.trim() || currentCandidate.isPaused}
                    size="large"
                    style={{
                      borderRadius: '8px',
                      minWidth: '60px',
                      height: '40px'
                    }}
                  >
                    Send
                  </Button>
                </Tooltip>
                
                {isInterviewActive && (
                  <Tooltip title="Get a hint for the current question">
                    <Button
                      type="default"
                      icon={<BulbOutlined />}
                      size="small"
                      style={{
                        borderRadius: '6px',
                        fontSize: '12px'
                      }}
                      onClick={() => {
                        if (currentQuestion) {
                          const hints = getQuestionHint(currentQuestion);
                          message.info(hints, 5);
                        }
                      }}
                    >
                      Hint
                    </Button>
                  </Tooltip>
                )}
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default IntervieweeTab;
