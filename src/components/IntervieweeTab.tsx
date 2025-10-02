import React, { useState, useEffect, useRef } from 'react';
import { useAppSelector, useAppDispatch } from '../store/store';
import {
  Card,
  Upload,
  Button,
  Input,
  message,
  Spin,
  Radio,
  Progress,
} from 'antd';
import { 
  InboxOutlined, 
  SendOutlined,
  PlusOutlined,
  PlayCircleOutlined,
  UploadOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import type { UploadProps } from 'antd';
import {
  createCandidate,
  addChatMessage,
  startInterview,
  resetCurrentCandidate,
  updateCandidateInfo,
  submitAnswer,
  updateTimer,
  timeUp,
} from '../store/interviewSlice';
import {
  parseResumeData,
} from '../utils/resumeParser';
import ProjectBasedQuestionGenerator from '../utils/projectBasedQuestionGenerator';
import ChatMessage from './ChatMessage';
import InterviewHeader from './InterviewHeader';
import './InterviewStyles.css';

// Add pulse animation for timer
const timerStyles = `
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
`;

const { Dragger } = Upload;

const IntervieweeTab: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    currentCandidate,
    chatMessages,
    isInterviewActive,
    questions,
    currentTimer,
  } = useAppSelector((state) => state.interview);

  const [isUploading, setIsUploading] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Timer functionality
  useEffect(() => {
    if (isInterviewActive && currentTimer > 0) {
      setTimeLeft(currentTimer);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          const newTime = prev - 1;
          dispatch(updateTimer(newTime));
          
          if (newTime <= 0) {
            // Time's up - auto submit
            dispatch(timeUp());
            handleTimeUp();
            return 0;
          }
          return newTime;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isInterviewActive, currentTimer, dispatch]);

  const handleTimeUp = () => {
    if (currentCandidate && questions.length > 0) {
      dispatch(submitAnswer({
        answer: '(Time expired)',
        timeSpent: questions[currentCandidate.currentQuestionIndex]?.timeLimit || 30,
        isCorrect: false,
        selectedOption: '',
      }));
      setSelectedOption('');
    }
  };

  const handleOptionSelect = (option: string) => {
    if (!currentCandidate || !isInterviewActive) return;
    
    const currentQuestion = questions[currentCandidate.currentQuestionIndex];
    if (!currentQuestion) return;

    console.log('=== OPTION SELECTED ===');
    console.log('Selected option:', option);
    console.log('Correct answer:', currentQuestion.correctAnswer);
    
    const isCorrect = option === currentQuestion.correctAnswer;
    const timeSpent = (currentQuestion.timeLimit || 30) - timeLeft;
    
    // Submit the answer immediately
    dispatch(submitAnswer({
      answer: option,
      timeSpent: timeSpent,
      isCorrect: isCorrect,
      selectedOption: option,
    }));
    
    // Reset selection for next question
    setSelectedOption('');
    
    console.log('=== ANSWER SUBMITTED ===');
    console.log('Is correct:', isCorrect);
    console.log('Time spent:', timeSpent);
  };

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
      return false;
    },
    showUploadList: false,
  };

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    
    try {
      const candidateInfo = await parseResumeData(file);
      
      // Generate project-based questions
      const projectQuestions = ProjectBasedQuestionGenerator.generateProjectQuestions(candidateInfo);
      
      dispatch(createCandidate({
        ...candidateInfo,
        resumeFile: file,
        resumeText: `Resume uploaded: ${file.name}`,
        projectQuestions,
      }));
      
      // Create a more informative success message
      let successMessage = 'Resume uploaded successfully!';
      if (candidateInfo.name) {
        successMessage += ` Welcome, ${candidateInfo.name}!`;
      }
      
      message.success(successMessage);
      
      // Create a personalized welcome message
      let welcomeContent = 'Welcome! Your resume has been processed successfully.';
      
      if (candidateInfo.projects.length > 0) {
        welcomeContent += ` I found ${candidateInfo.projects.length} project(s) in your resume: ${candidateInfo.projects.map(p => p.title).join(', ')}.`;
      }
      
      if (candidateInfo.skills.length > 0) {
        welcomeContent += ` Your key skills include: ${candidateInfo.skills.slice(0, 5).join(', ')}${candidateInfo.skills.length > 5 ? ' and more' : ''}.`;
      }
      
      welcomeContent += ' I\'ll be asking you questions about your projects and experience. Let\'s start!';
      
      dispatch(addChatMessage({
        type: 'system',
        content: welcomeContent,
      }));
      
      // Show start interview message after successful upload
      setTimeout(() => {
        dispatch(addChatMessage({
          type: 'system',
          content: 'Great! Now you can start your AI interview by clicking the "Start AI Interview" button below.',
        }));
      }, 1500);
      
    } catch (error) {
      console.error('Resume upload error:', error);
      
      // More specific error handling
      let errorMessage = 'Failed to process the resume.';
      if (error instanceof Error) {
        if (error.message.includes('PDF')) {
          errorMessage = 'Unable to extract text from PDF. Please try a different format or enter your information manually.';
        } else if (error.message.includes('DOCX')) {
          errorMessage = 'Unable to extract text from DOCX. Please try a different format or enter your information manually.';
        }
      }
      
      message.error(errorMessage);
      
      // Still create a candidate with empty info for manual entry
      dispatch(createCandidate({
        name: '',
        email: '',
        phone: '',
        projects: [],
        skills: [],
        experience: [],
        education: [],
        resumeFile: file,
        resumeText: `Resume uploaded: ${file.name} (Text extraction failed, information collected manually)`,
        projectQuestions: [],
      }));
      
      dispatch(addChatMessage({
        type: 'system',
        content: 'I had trouble reading your resume automatically. No worries! Please tell me your name, email, and phone number so we can get started.',
      }));
      
      // Show start interview message for manual entry
      setTimeout(() => {
        dispatch(addChatMessage({
          type: 'system',
          content: 'Once you provide your information, you can start the AI interview using the button below.',
        }));
      }, 1000);
      
    } finally {
      setIsUploading(false);
    }
  };

  const handleSendMessage = () => {
    if (!currentAnswer.trim()) return;
    
    const userMessage = currentAnswer.trim();
    setCurrentAnswer('');
    
    console.log('=== HANDLE SEND MESSAGE ===');
    console.log('Message:', userMessage);
    console.log('Is interview active:', isInterviewActive);
    console.log('Candidate status:', currentCandidate?.status);
    console.log('Questions length:', questions.length);
    
    // PRIORITY 1: If interview is active, this is an answer to a question
    if (isInterviewActive && currentCandidate && currentCandidate.status === 'in-progress') {
      console.log('=== PROCESSING ANSWER ===');
      console.log('Current question index:', currentCandidate.currentQuestionIndex);
      
      // Calculate time spent (mock for now - in real app you'd track actual time)
      const timeSpent = Math.floor(Math.random() * 60) + 30; // 30-90 seconds
      
      // Submit the answer - this will handle the chat message and next question
      dispatch(submitAnswer({
        answer: userMessage,
        timeSpent: timeSpent,
        isCorrect: undefined, // Will be evaluated by the system
      }));
      
      console.log('=== ANSWER SUBMITTED ===');
      return; // IMPORTANT: Exit here - don't process as regular chat
    }
    
    // PRIORITY 2: If not in interview, add as regular chat message
    dispatch(addChatMessage({
      type: 'user',
      content: userMessage,
    }));

    // PRIORITY 3: Only process information collection if status is 'collecting-info' AND interview is NOT active
    if (currentCandidate && 
        currentCandidate.status === 'collecting-info' && 
        !isInterviewActive) {
      
      console.log('Processing information collection:', userMessage);
      
      // Simple pattern matching for missing info
      const lowerMessage = userMessage.toLowerCase();
      let infoUpdated = false;
      
      // Check for email
      if (!currentCandidate.email && lowerMessage.includes('@')) {
        const emailMatch = userMessage.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
        if (emailMatch) {
          dispatch(updateCandidateInfo({ field: 'email', value: emailMatch[0] }));
          dispatch(addChatMessage({
            type: 'system',
            content: `Great! I've recorded your email as ${emailMatch[0]}.`,
          }));
          infoUpdated = true;
        }
      }
      
      // Check for phone
      if (!currentCandidate.phone && /\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/.test(userMessage)) {
        const phoneMatch = userMessage.match(/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/);
        if (phoneMatch) {
          dispatch(updateCandidateInfo({ field: 'phone', value: phoneMatch[0] }));
          dispatch(addChatMessage({
            type: 'system',
            content: `Perfect! I've recorded your phone number as ${phoneMatch[0]}.`,
          }));
          infoUpdated = true;
        }
      }
      
      // Check for name (if it's a simple response without @ or numbers)
      if (!currentCandidate.name && !lowerMessage.includes('@') && !/\d/.test(userMessage) && userMessage.split(' ').length <= 4) {
        dispatch(updateCandidateInfo({ field: 'name', value: userMessage }));
        dispatch(addChatMessage({
          type: 'system',
          content: `Nice to meet you, ${userMessage}! You can start the interview anytime by clicking the "Start AI Interview" button below.`,
        }));
        infoUpdated = true;
      }
      
      // If no information was extracted, provide a helpful response
      if (!infoUpdated) {
        dispatch(addChatMessage({
          type: 'system',
          content: 'Thank you for that information. You can start the interview anytime by clicking the "Start AI Interview" button below, or continue chatting with me.',
        }));
      }
    } else if (currentCandidate && currentCandidate.status !== 'collecting-info' && !isInterviewActive) {
      // If candidate exists but not collecting info and not in interview, just acknowledge
      dispatch(addChatMessage({
        type: 'system',
        content: 'I understand. You can start the interview anytime by clicking the "Start AI Interview" button below.',
      }));
    }
  };

  const handleStartInterview = () => {
    if (!currentCandidate) return;
    
    console.log('=== STARTING INTERVIEW ===');
    console.log('Candidate:', currentCandidate.name || 'Anonymous');
    console.log('Current status:', currentCandidate.status);
    console.log('Is interview active before:', isInterviewActive);
    
    // Start the interview
    dispatch(startInterview());
    
    console.log('=== INTERVIEW START DISPATCHED ===');
  };

  const handleNewInterview = () => {
    dispatch(resetCurrentCandidate());
    message.success('Ready for a new interview! Please upload your resume to get started.');
  };

  const triggerFileUpload = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.pdf,.docx';
    fileInput.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        handleFileUpload(file);
      }
    };
    fileInput.click();
  };

  if (!currentCandidate) {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f7fa', padding: '20px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h1 style={{ fontSize: '36px', color: '#1890ff', marginBottom: '16px', fontWeight: 'bold' }}>
              AI Interview Platform
            </h1>
            <p style={{ fontSize: '20px', color: '#666', marginBottom: '32px' }}>
              Get personalized interview questions based on your resume
            </p>
            
            {/* Prominent Start Button */}
            <div style={{
              background: 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)',
              padding: '32px',
              borderRadius: '16px',
              boxShadow: '0 12px 40px rgba(24, 144, 255, 0.3)',
              marginBottom: '20px'
            }}>
              <div style={{ marginBottom: '20px' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  backdropFilter: 'blur(10px)'
                }}>
                  <PlayCircleOutlined style={{ fontSize: '28px', color: 'white' }} />
                </div>
                <h2 style={{ 
                  color: 'white', 
                  fontSize: '24px', 
                  fontWeight: 'bold',
                  marginBottom: '8px'
                }}>
                  Ready to Start Your AI Interview?
                </h2>
                <p style={{ 
                  color: 'rgba(255, 255, 255, 0.9)', 
                  fontSize: '16px',
                  marginBottom: '0',
                  lineHeight: '1.5'
                }}>
                  Upload your resume and get personalized questions in minutes
                </p>
              </div>
              
              <Button
                type="default"
                size="large"
                icon={<UploadOutlined />}
                onClick={() => {
                  // Scroll to upload section
                  const uploadSection = document.querySelector('[data-upload-section]');
                  if (uploadSection) {
                    uploadSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }
                }}
                style={{ 
                  height: '56px',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  minWidth: '250px',
                  borderRadius: '8px',
                  background: 'white',
                  color: '#1890ff',
                  border: 'none',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
                }}
              >
                Start Interview Process
              </Button>
            </div>
          </div>

          {/* How It Works Section */}
          <Card style={{ 
            marginBottom: '40px', 
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            border: '1px solid #e8f4fd'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <h2 style={{ fontSize: '28px', color: '#1890ff', marginBottom: '16px', fontWeight: 'bold' }}>
                How It Works
              </h2>
              <p style={{ fontSize: '16px', color: '#666' }}>
                Our AI-powered interview process is simple and personalized
              </p>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '30px',
              marginBottom: '20px'
            }}>
              {/* Step 1 */}
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  boxShadow: '0 8px 25px rgba(24, 144, 255, 0.3)'
                }}>
                  <UploadOutlined style={{ fontSize: '32px', color: 'white' }} />
                </div>
                <h3 style={{ fontSize: '18px', color: '#262626', marginBottom: '12px', fontWeight: 'bold' }}>
                  1. Upload Resume
                </h3>
                <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.6' }}>
                  Provide your PDF or DOCX resume file
                </p>
              </div>

              {/* Step 2 */}
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  boxShadow: '0 8px 25px rgba(82, 196, 26, 0.3)'
                }}>
                  <div style={{ fontSize: '32px', color: 'white' }}>🤖</div>
                </div>
                <h3 style={{ fontSize: '18px', color: '#262626', marginBottom: '12px', fontWeight: 'bold' }}>
                  2. We Analyze
                </h3>
                <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.6' }}>
                  Our AI extracts your skills, projects, and experience
                </p>
              </div>

              {/* Step 3 */}
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #faad14 0%, #ffc53d 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  boxShadow: '0 8px 25px rgba(250, 173, 20, 0.3)'
                }}>
                  <QuestionCircleOutlined style={{ fontSize: '32px', color: 'white' }} />
                </div>
                <h3 style={{ fontSize: '18px', color: '#262626', marginBottom: '12px', fontWeight: 'bold' }}>
                  3. Personalized Questions
                </h3>
                <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.6' }}>
                  Based on your resume, we create custom interview questions
                </p>
              </div>

              {/* Step 4 */}
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #722ed1 0%, #9254de 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  boxShadow: '0 8px 25px rgba(114, 46, 209, 0.3)'
                }}>
                  <PlayCircleOutlined style={{ fontSize: '32px', color: 'white' }} />
                </div>
                <h3 style={{ fontSize: '18px', color: '#262626', marginBottom: '12px', fontWeight: 'bold' }}>
                  4. Start Interview
                </h3>
                <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.6' }}>
                  Begin your interview with tailored questions
                </p>
              </div>
            </div>
          </Card>

          {/* Upload Section */}
          <Card 
            data-upload-section
            title={
              <div style={{ textAlign: 'center' }}>
                <h2 style={{ margin: 0, color: '#1890ff', fontSize: '24px', fontWeight: 'bold' }}>
                  Upload Your Resume to Get Started
                </h2>
                <p style={{ margin: '8px 0 0', color: '#666', fontSize: '16px' }}>
                  Drag and drop your resume or click to browse
                </p>
              </div>
            } 
            style={{ 
              boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
              border: '2px solid #e8f4fd'
            }}
          >
            <Spin spinning={isUploading} tip="Processing your resume...">
              <Dragger {...uploadProps} style={{ 
                padding: 40, 
                marginBottom: 30,
                border: '2px dashed #1890ff',
                borderRadius: '12px',
                background: '#fafcff'
              }}>
                <p className="ant-upload-drag-icon">
                  <InboxOutlined style={{ fontSize: 72, color: '#1890ff' }} />
                </p>
                <p className="ant-upload-text" style={{ 
                  fontSize: '20px', 
                  fontWeight: 'bold',
                  color: '#262626',
                  marginBottom: '12px'
                }}>
                  Click or drag your resume file to this area to upload
                </p>
                <p className="ant-upload-hint" style={{ 
                  fontSize: '16px',
                  color: '#666',
                  lineHeight: '1.6'
                }}>
                  Support for PDF and DOCX files only. We'll extract your information and create personalized questions tailored to your background and experience.
                </p>
              </Dragger>
              
              <div style={{ textAlign: 'center' }}>
                <Button
                  type="primary"
                  size="large"
                  icon={<UploadOutlined />}
                  onClick={triggerFileUpload}
                  style={{ 
                    height: '56px',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    minWidth: '250px',
                    borderRadius: '8px',
                    boxShadow: '0 6px 20px rgba(24, 144, 255, 0.4)'
                  }}
                >
                  Choose Resume File
                </Button>
              </div>
            </Spin>
          </Card>

          {/* Additional Info */}
          <div style={{ 
            textAlign: 'center', 
            marginTop: '30px',
            padding: '20px',
            background: '#f0f8ff',
            borderRadius: '8px',
            border: '1px solid #e8f4fd'
          }}>
            <p style={{ 
              fontSize: '14px', 
              color: '#666', 
              margin: 0,
              lineHeight: '1.6'
            }}>
              <strong>Privacy Note:</strong> Your resume is processed locally and securely. We extract only the information needed to create personalized interview questions.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <style>{timerStyles}</style>
      <InterviewHeader
        candidate={currentCandidate}
        isInterviewActive={isInterviewActive}
        onNewInterview={handleNewInterview}
        currentQuestionIndex={currentCandidate.currentQuestionIndex}
        totalQuestions={questions.length}
      />

      <div className="chat-messages">
        {chatMessages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="chat-input-area">
        {currentCandidate.status === 'completed' ? (
          <div style={{ padding: '24px', textAlign: 'center' }}>
            <div style={{
              background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
              color: 'white',
              padding: '40px',
              borderRadius: '12px',
              marginBottom: '24px'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
              <h2 style={{ color: 'white', margin: '0 0 16px 0' }}>Interview Completed!</h2>
              <p style={{ color: 'white', fontSize: '18px', margin: 0 }}>
                Congratulations! You have successfully completed your interview.
              </p>
            </div>
            <div style={{
              background: '#f8f9fa',
              padding: '24px',
              borderRadius: '8px',
              marginBottom: '24px'
            }}>
              <h3>Your Performance Summary</h3>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', marginTop: '20px' }}>
                <div>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#52c41a' }}>
                    {currentCandidate.finalScore || 0}%
                  </div>
                  <div>Final Score</div>
                </div>
                <div>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1890ff' }}>
                    {currentCandidate.answers.length}
                  </div>
                  <div>Questions Answered</div>
                </div>
              </div>
            </div>
            <div style={{ marginTop: '24px' }}>
              <p><strong>What's Next?</strong></p>
              <p>We'll review your responses and get back to you within 2-3 business days.</p>
              <p>Thank you for your time and effort!</p>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleNewInterview}
                size="large"
                style={{ marginTop: '16px' }}
              >
                Start New Interview
              </Button>
            </div>
          </div>
        ) : !isInterviewActive ? (
          <div style={{ 
            padding: '40px',
            textAlign: 'center',
            background: 'linear-gradient(135deg, #f0f8ff 0%, #e6f4ff 100%)',
            border: '2px solid #1890ff',
            borderRadius: '16px',
            margin: '20px',
            boxShadow: '0 8px 30px rgba(24, 144, 255, 0.15)'
          }}>
            <div style={{ marginBottom: '24px' }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                boxShadow: '0 8px 25px rgba(82, 196, 26, 0.3)'
              }}>
                <div style={{ fontSize: '32px' }}>✅</div>
              </div>
              <h2 style={{ 
                fontSize: '28px', 
                color: '#1890ff', 
                marginBottom: '16px',
                fontWeight: 'bold'
              }}>
                Resume Processed Successfully!
              </h2>
              <p style={{ 
                fontSize: '18px', 
                color: '#666', 
                marginBottom: '8px',
                lineHeight: '1.6'
              }}>
                I've analyzed your resume and prepared personalized questions based on your background.
              </p>
              {currentCandidate.name && (
                <p style={{ 
                  fontSize: '16px', 
                  color: '#52c41a', 
                  fontWeight: 'bold',
                  marginBottom: '0'
                }}>
                  Welcome, {currentCandidate.name}! 👋
                </p>
              )}
            </div>

            {/* Resume Summary */}
            {(currentCandidate.skills.length > 0 || currentCandidate.projects.length > 0) && (
              <div style={{
                background: 'white',
                padding: '20px',
                borderRadius: '12px',
                marginBottom: '30px',
                border: '1px solid #e8f4fd',
                textAlign: 'left'
              }}>
                <h4 style={{ 
                  fontSize: '16px', 
                  color: '#1890ff', 
                  marginBottom: '16px',
                  textAlign: 'center'
                }}>
                  What I Found in Your Resume:
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  {currentCandidate.skills.length > 0 && (
                    <div>
                      <strong style={{ color: '#262626' }}>Skills:</strong>
                      <p style={{ 
                        fontSize: '14px', 
                        color: '#666', 
                        margin: '4px 0 0',
                        lineHeight: '1.5'
                      }}>
                        {currentCandidate.skills.slice(0, 5).join(', ')}
                        {currentCandidate.skills.length > 5 && ' and more...'}
                      </p>
                    </div>
                  )}
                  {currentCandidate.projects.length > 0 && (
                    <div>
                      <strong style={{ color: '#262626' }}>Projects:</strong>
                      <p style={{ 
                        fontSize: '14px', 
                        color: '#666', 
                        margin: '4px 0 0',
                        lineHeight: '1.5'
                      }}>
                        {currentCandidate.projects.slice(0, 3).map(p => p.title).join(', ')}
                        {currentCandidate.projects.length > 3 && ' and more...'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={handleStartInterview}
              size="large"
              style={{ 
                height: '56px',
                fontSize: '18px',
                fontWeight: 'bold',
                minWidth: '250px',
                borderRadius: '8px',
                boxShadow: '0 6px 20px rgba(24, 144, 255, 0.4)',
                background: 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)',
                border: 'none'
              }}
            >
              Start AI Interview
            </Button>
            
            <p style={{ 
              fontSize: '14px', 
              color: '#666', 
              marginTop: '16px',
              marginBottom: '0'
            }}>
              The interview will include multiple-choice questions tailored to your experience
            </p>
          </div>
        ) : isInterviewActive && currentCandidate && questions.length > 0 ? (
          // Multiple Choice Question Interface
          <div style={{ margin: '16px' }}>
            {/* Timer and Progress Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 20px',
              background: 'linear-gradient(135deg, #f0f8ff 0%, #e6f4ff 100%)',
              borderRadius: '12px 12px 0 0',
              border: '1px solid #d9d9d9',
              borderBottom: 'none'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontWeight: 'bold', color: '#1890ff', fontSize: '16px' }}>
                  Question {currentCandidate.currentQuestionIndex + 1} of {questions.length}
                </span>
                {questions[currentCandidate.currentQuestionIndex] && (
                  <span style={{ 
                    background: questions[currentCandidate.currentQuestionIndex].difficulty === 'easy' ? '#52c41a' : 
                               questions[currentCandidate.currentQuestionIndex].difficulty === 'medium' ? '#faad14' : '#ff4d4f',
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '16px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {questions[currentCandidate.currentQuestionIndex].difficulty.toUpperCase()}
                  </span>
                )}
              </div>
              
              {/* Timer Display */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  background: timeLeft <= 10 ? '#ff4d4f' : timeLeft <= 30 ? '#faad14' : '#52c41a',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontWeight: 'bold',
                  fontSize: '16px',
                  minWidth: '80px',
                  textAlign: 'center',
                  animation: timeLeft <= 10 ? 'pulse 1s infinite' : 'none'
                }}>
                  {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </div>
                <Progress
                  type="circle"
                  size={40}
                  percent={Math.round((timeLeft / (questions[currentCandidate.currentQuestionIndex]?.timeLimit || 30)) * 100)}
                  strokeColor={timeLeft <= 10 ? '#ff4d4f' : timeLeft <= 30 ? '#faad14' : '#52c41a'}
                  showInfo={false}
                />
              </div>
            </div>

            {/* Question and Options */}
            <Card style={{ 
              borderRadius: '0 0 12px 12px',
              border: '1px solid #d9d9d9',
              borderTop: 'none'
            }}>
              {questions[currentCandidate.currentQuestionIndex] && (
                <div>
                  {/* Question Text */}
                  <div style={{ 
                    marginBottom: '24px',
                    padding: '20px',
                    background: '#fafafa',
                    borderRadius: '8px',
                    border: '1px solid #f0f0f0'
                  }}>
                    <h3 style={{ 
                      margin: 0, 
                      fontSize: '18px', 
                      color: '#262626',
                      lineHeight: '1.5'
                    }}>
                      {questions[currentCandidate.currentQuestionIndex].text}
                    </h3>
                  </div>

                  {/* Multiple Choice Options */}
                  <div style={{ marginBottom: '20px' }}>
                    <Radio.Group
                      value={selectedOption}
                      onChange={(e) => setSelectedOption(e.target.value)}
                      style={{ width: '100%' }}
                    >
                      {questions[currentCandidate.currentQuestionIndex].options?.map((option, index) => (
                        <div key={index} style={{ marginBottom: '12px' }}>
                          <Card
                            hoverable
                            onClick={() => handleOptionSelect(option)}
                            style={{
                              cursor: 'pointer',
                              border: selectedOption === option ? '2px solid #1890ff' : '1px solid #f0f0f0',
                              background: selectedOption === option ? '#f0f8ff' : '#fff',
                              transition: 'all 0.3s ease'
                            }}
                          >
                            <Radio value={option} style={{ 
                              fontSize: '16px',
                              fontWeight: '500',
                              color: '#262626'
                            }}>
                              {option}
                            </Radio>
                          </Card>
                        </div>
                      ))}
                    </Radio.Group>
                  </div>

                  {/* Skip Button */}
                  <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <Button
                      type="default"
                      onClick={() => handleOptionSelect('(Skipped)')}
                      style={{ 
                        minWidth: '120px',
                        height: '40px'
                      }}
                    >
                      Skip Question
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        ) : (
          // Regular Chat Input (when not in interview)
          <div style={{ 
            display: 'flex', 
            gap: '12px',
            padding: '16px',
            background: '#fff',
            border: '1px solid #f0f0f0',
            borderRadius: '8px',
            margin: '16px'
          }}>
            <Input.TextArea
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              placeholder="Type your message here..."
              autoSize={{ minRows: 3, maxRows: 8 }}
              maxLength={1000}
              style={{ 
                flex: 1,
                fontSize: '14px',
                lineHeight: '1.6'
              }}
              onPressEnter={(e) => {
                if (e.shiftKey) return;
                e.preventDefault();
                handleSendMessage();
              }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleSendMessage}
                disabled={!currentAnswer.trim()}
                style={{ 
                  minWidth: '80px',
                  height: '40px',
                  fontWeight: 'bold'
                }}
              >
                Send
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IntervieweeTab;