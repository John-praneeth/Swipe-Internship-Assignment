import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Typography, 
  Space, 
  Button, 
  Progress, 
  Tag, 
  Divider, 
  Row, 
  Col, 
  Statistic, 
  Timeline,
  Modal,
  Rate,
  Input,
  message,

  Badge
} from 'antd';
import {
  TrophyOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  StarOutlined,
  DownloadOutlined,
  ShareAltOutlined,
  ReloadOutlined,
  HomeOutlined,
  MailOutlined,
  PhoneOutlined,
  LinkedinOutlined,
  TwitterOutlined,
  WhatsAppOutlined,
  CopyOutlined,
  PrinterOutlined,
  FileTextOutlined,
  BarChartOutlined,
  CalendarOutlined,
  UserOutlined
} from '@ant-design/icons';
import { Candidate, Question } from '../types';
import { useAppDispatch } from '../store/store';
import { resetCurrentCandidate } from '../store/interviewSlice';
import PostInterviewActions from './PostInterviewActions';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface InterviewCompletionPageProps {
  candidate: Candidate;
  questions: Question[];
  onStartNewInterview: () => void;
}

const InterviewCompletionPage: React.FC<InterviewCompletionPageProps> = ({
  candidate,
  questions: _questions,
  onStartNewInterview
}) => {
  const dispatch = useAppDispatch();
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [confettiVisible, setConfettiVisible] = useState(true);

  useEffect(() => {
    // Hide confetti after 5 seconds
    const timer = setTimeout(() => {
      setConfettiVisible(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#52c41a';
    if (score >= 60) return '#faad14';
    if (score >= 40) return '#fa8c16';
    return '#ff4d4f';
  };

  const getScoreGrade = (score: number) => {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B+';
    if (score >= 60) return 'B';
    if (score >= 50) return 'C+';
    if (score >= 40) return 'C';
    return 'D';
  };

  const getPerformanceByDifficulty = () => {
    const performance = { easy: 0, medium: 0, hard: 0 };
    const counts = { easy: 0, medium: 0, hard: 0 };

    candidate.answers.forEach(answer => {
      const difficulty = answer.difficulty.toLowerCase() as keyof typeof performance;
      if (answer.isCorrect !== undefined) {
        performance[difficulty] += answer.isCorrect ? 1 : 0;
      } else {
        // For text questions, assume partial scoring
        performance[difficulty] += 0.7;
      }
      counts[difficulty]++;
    });

    return {
      easy: counts.easy > 0 ? Math.round((performance.easy / counts.easy) * 100) : 0,
      medium: counts.medium > 0 ? Math.round((performance.medium / counts.medium) * 100) : 0,
      hard: counts.hard > 0 ? Math.round((performance.hard / counts.hard) * 100) : 0,
    };
  };

  const getTotalTimeSpent = () => {
    return candidate.answers.reduce((total, answer) => total + answer.timeSpent, 0);
  };

  const getInterviewDuration = () => {
    if (candidate.startTime && candidate.endTime) {
      return Math.round((candidate.endTime - candidate.startTime) / 1000 / 60);
    }
    return 0;
  };

  const handleSubmitFeedback = () => {
    if (rating === 0) {
      message.warning('Please provide a rating');
      return;
    }

    // Here you would typically send feedback to the backend
    message.success('Thank you for your feedback!');
    setShowFeedbackModal(false);
    setFeedback('');
    setRating(0);
  };

  const handleShare = (platform: string) => {
    const shareText = `I just completed an AI interview and scored ${candidate.finalScore}/100! 🎉`;
    const shareUrl = window.location.href;

    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`);
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`);
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`);
        break;
      case 'copy':
        navigator.clipboard.writeText(shareText + ' ' + shareUrl);
        message.success('Link copied to clipboard!');
        break;
    }
    setShowShareModal(false);
  };

  const handlePrintReport = () => {
    window.print();
  };

  const handleDownloadReport = () => {
    // Create a simple text report
    const report = `
Interview Report
===============

Candidate: ${candidate.name}
Email: ${candidate.email}
Phone: ${candidate.phone}
Date: ${new Date().toLocaleDateString()}

Final Score: ${candidate.finalScore}/100 (Grade: ${getScoreGrade(candidate.finalScore || 0)})
Interview Duration: ${getInterviewDuration()} minutes
Total Questions: ${candidate.answers.length}

Performance Summary:
${candidate.summary}

Questions and Answers:
${candidate.answers.map((answer, index) => `
${index + 1}. ${answer.question}
   Answer: ${answer.answer}
   Time Spent: ${Math.floor(answer.timeSpent / 60)}:${(answer.timeSpent % 60).toString().padStart(2, '0')}
   Difficulty: ${answer.difficulty}
   ${answer.isCorrect !== undefined ? `Correct: ${answer.isCorrect ? 'Yes' : 'No'}` : ''}
`).join('')}
    `;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interview-report-${candidate.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleStartNewInterview = () => {
    Modal.confirm({
      title: 'Start New Interview',
      content: 'Are you sure you want to start a new interview? This will reset your current progress.',
      onOk: () => {
        dispatch(resetCurrentCandidate());
        onStartNewInterview();
      },
    });
  };

  const performance = getPerformanceByDifficulty();
  const totalTimeSpent = getTotalTimeSpent();
  const interviewDuration = getInterviewDuration();

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', backgroundColor: '#f5f7fa' }}>
      {/* Confetti Animation */}
      {confettiVisible && (
        <div className="completion-confetti" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1000 }}>
          {[...Array(50)].map((_, i) => (
            <div 
              key={i}
              className="confetti-piece"
              style={{
                position: 'absolute',
                left: `${Math.random() * 100}%`,
                top: '-10px',
                width: '10px',
                height: '10px',
                backgroundColor: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'][Math.floor(Math.random() * 6)],
                animation: `confettiFall ${3 + Math.random() * 2}s linear infinite`,
                animationDelay: `${Math.random() * 3}s`,
              }}
            />
          ))}
        </div>
      )}

      <style>
        {`
          @keyframes confettiFall {
            0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
            100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
          }
          
          .completion-card {
            transition: all 0.3s ease;
          }
          
          .completion-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
          }
          
          .score-circle {
            animation: scoreGlow 2s ease-in-out infinite alternate;
          }
          
          @keyframes scoreGlow {
            0% { box-shadow: 0 0 20px rgba(82, 196, 26, 0.3); }
            100% { box-shadow: 0 0 30px rgba(82, 196, 26, 0.6); }
          }
          
          @media print {
            .no-print { display: none !important; }
          }
        `}
      </style>

      {/* Header Card */}
      <Card 
        className="completion-card"
        style={{ 
          marginBottom: '24px',
          textAlign: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '16px',
        }}
      >
        <Space direction="vertical" size="large">
          <div>
            <TrophyOutlined style={{ fontSize: '64px', color: '#ffd700', marginBottom: '16px' }} />
            <Title level={1} style={{ color: 'white', margin: 0, fontSize: '36px' }}>
              🎉 Interview Completed!
            </Title>
          </div>
          <div>
            <Title level={2} style={{ color: 'white', margin: '16px 0' }}>
              Congratulations, {candidate.name}!
            </Title>
            <Text style={{ fontSize: '18px', color: 'rgba(255, 255, 255, 0.9)' }}>
              You have successfully completed your AI-powered interview session.
            </Text>
          </div>
        </Space>
      </Card>

      <Row gutter={[24, 24]}>
        {/* Score Overview */}
        <Col xs={24} lg={8}>
          <Card 
            className="completion-card score-circle"
            style={{ textAlign: 'center', borderRadius: '16px', height: '100%' }}
          >
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div>
                <Progress
                  type="circle"
                  percent={candidate.finalScore || 0}
                  size={120}
                  strokeColor={getScoreColor(candidate.finalScore || 0)}
                  format={(percent) => (
                    <div>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: getScoreColor(percent || 0) }}>
                        {percent}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        Grade: {getScoreGrade(percent || 0)}
                      </div>
                    </div>
                  )}
                />
              </div>
              <div>
                <Title level={4} style={{ margin: 0, color: getScoreColor(candidate.finalScore || 0) }}>
                  Final Score
                </Title>
                <Text type="secondary">
                  {candidate.finalScore && candidate.finalScore >= 70 ? 'Excellent Performance!' : 
                   candidate.finalScore && candidate.finalScore >= 50 ? 'Good Job!' : 'Keep Learning!'}
                </Text>
              </div>
            </Space>
          </Card>
        </Col>

        {/* Statistics */}
        <Col xs={24} lg={16}>
          <Card 
            className="completion-card"
            title={
              <Space>
                <BarChartOutlined />
                <span>Interview Statistics</span>
              </Space>
            }
            style={{ borderRadius: '16px', height: '100%' }}
          >
            <Row gutter={[16, 16]}>
              <Col xs={12} sm={6}>
                <Statistic
                  title="Questions"
                  value={candidate.answers.length}
                  prefix={<FileTextOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic
                  title="Duration"
                  value={interviewDuration}
                  suffix="min"
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic
                  title="Answered"
                  value={candidate.answers.filter(a => !a.answer.includes('No answer')).length}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic
                  title="Avg Time"
                  value={Math.round(totalTimeSpent / candidate.answers.length)}
                  suffix="sec"
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: '#fa8c16' }}
                />
              </Col>
            </Row>

            <Divider />

            <Title level={5}>Performance by Difficulty</Title>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={8}>
                <div style={{ textAlign: 'center' }}>
                  <Progress
                    type="circle"
                    percent={performance.easy}
                    size={80}
                    strokeColor="#52c41a"
                    format={() => `${performance.easy}%`}
                  />
                  <div style={{ marginTop: '8px' }}>
                    <Tag color="green">Easy</Tag>
                  </div>
                </div>
              </Col>
              <Col xs={24} sm={8}>
                <div style={{ textAlign: 'center' }}>
                  <Progress
                    type="circle"
                    percent={performance.medium}
                    size={80}
                    strokeColor="#faad14"
                    format={() => `${performance.medium}%`}
                  />
                  <div style={{ marginTop: '8px' }}>
                    <Tag color="orange">Medium</Tag>
                  </div>
                </div>
              </Col>
              <Col xs={24} sm={8}>
                <div style={{ textAlign: 'center' }}>
                  <Progress
                    type="circle"
                    percent={performance.hard}
                    size={80}
                    strokeColor="#ff4d4f"
                    format={() => `${performance.hard}%`}
                  />
                  <div style={{ marginTop: '8px' }}>
                    <Tag color="red">Hard</Tag>
                  </div>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Detailed Analysis */}
      <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
        <Col xs={24} lg={12}>
          <Card 
            className="completion-card"
            title={
              <Space>
                <UserOutlined />
                <span>Performance Summary</span>
              </Space>
            }
            style={{ borderRadius: '16px', height: '100%' }}
          >
            <Paragraph style={{ fontSize: '16px', lineHeight: '1.6' }}>
              {candidate.summary || 'Great job completing the interview! Your responses show good understanding of the topics covered.'}
            </Paragraph>

            <Divider />

            <Title level={5}>Interview Timeline</Title>
            <Timeline>
              <Timeline.Item color="blue" dot={<CalendarOutlined />}>
                <Text strong>Interview Started</Text>
                <br />
                <Text type="secondary">
                  {candidate.startTime ? new Date(candidate.startTime).toLocaleString() : 'N/A'}
                </Text>
              </Timeline.Item>
              {candidate.answers.map((answer, index) => (
                <Timeline.Item 
                  key={index}
                  color={answer.isCorrect === true ? 'green' : answer.isCorrect === false ? 'red' : 'blue'}
                  dot={answer.isCorrect === true ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                >
                  <Text strong>Question {index + 1} - {answer.difficulty}</Text>
                  <br />
                  <Text type="secondary">
                    Completed in {Math.floor(answer.timeSpent / 60)}:{(answer.timeSpent % 60).toString().padStart(2, '0')}
                    {answer.isCorrect !== undefined && (
                      <Badge 
                        status={answer.isCorrect ? 'success' : 'error'} 
                        text={answer.isCorrect ? 'Correct' : 'Incorrect'}
                        style={{ marginLeft: '8px' }}
                      />
                    )}
                  </Text>
                </Timeline.Item>
              ))}
              <Timeline.Item color="green" dot={<TrophyOutlined />}>
                <Text strong>Interview Completed</Text>
                <br />
                <Text type="secondary">
                  {candidate.endTime ? new Date(candidate.endTime).toLocaleString() : 'N/A'}
                </Text>
              </Timeline.Item>
            </Timeline>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card 
            className="completion-card"
            title={
              <Space>
                <StarOutlined />
                <span>Next Steps</span>
              </Space>
            }
            style={{ borderRadius: '16px', height: '100%' }}
          >
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div>
                <Title level={5}>What happens next?</Title>
                <Timeline>
                  <Timeline.Item dot={<MailOutlined />}>
                    <Text>You'll receive an email confirmation within 24 hours</Text>
                  </Timeline.Item>
                  <Timeline.Item dot={<PhoneOutlined />}>
                    <Text>Our team will review your responses within 2-3 business days</Text>
                  </Timeline.Item>
                  <Timeline.Item dot={<CalendarOutlined />}>
                    <Text>If selected, we'll contact you for the next round</Text>
                  </Timeline.Item>
                </Timeline>
              </div>

              <Divider />

              <div>
                <Title level={5}>Actions</Title>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Row gutter={[8, 8]}>
                    <Col xs={24} sm={12}>
                      <Button 
                        type="primary" 
                        icon={<DownloadOutlined />} 
                        onClick={handleDownloadReport}
                        block
                      >
                        Download Report
                      </Button>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Button 
                        icon={<PrinterOutlined />} 
                        onClick={handlePrintReport}
                        block
                        className="no-print"
                      >
                        Print Report
                      </Button>
                    </Col>
                  </Row>
                  <Row gutter={[8, 8]}>
                    <Col xs={24} sm={12}>
                      <Button 
                        icon={<ShareAltOutlined />} 
                        onClick={() => setShowShareModal(true)}
                        block
                        className="no-print"
                      >
                        Share Results
                      </Button>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Button 
                        icon={<StarOutlined />} 
                        onClick={() => setShowFeedbackModal(true)}
                        block
                        className="no-print"
                      >
                        Give Feedback
                      </Button>
                    </Col>
                  </Row>
                  <Row gutter={[8, 8]}>
                    <Col xs={24} sm={12}>
                      <Button 
                        icon={<ReloadOutlined />} 
                        onClick={handleStartNewInterview}
                        block
                        className="no-print"
                      >
                        New Interview
                      </Button>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Button 
                        icon={<HomeOutlined />} 
                        onClick={() => window.location.reload()}
                        block
                        className="no-print"
                      >
                        Back to Home
                      </Button>
                    </Col>
                  </Row>
                </Space>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Post Interview Actions */}
      <div style={{ marginTop: '24px' }}>
        <PostInterviewActions
          candidate={candidate}
          onRetakeInterview={onStartNewInterview}
        />
      </div>

      {/* Feedback Modal */}
      <Modal
        title="Share Your Feedback"
        open={showFeedbackModal}
        onOk={handleSubmitFeedback}
        onCancel={() => setShowFeedbackModal(false)}
        okText="Submit Feedback"
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Text strong>How would you rate your interview experience?</Text>
            <div style={{ marginTop: '8px' }}>
              <Rate value={rating} onChange={setRating} />
            </div>
          </div>
          <div>
            <Text strong>Additional Comments (Optional)</Text>
            <TextArea
              rows={4}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Share your thoughts about the interview process..."
              style={{ marginTop: '8px' }}
            />
          </div>
        </Space>
      </Modal>

      {/* Share Modal */}
      <Modal
        title="Share Your Achievement"
        open={showShareModal}
        onCancel={() => setShowShareModal(false)}
        footer={null}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Text>Share your interview completion on social media:</Text>
          <Row gutter={[8, 8]}>
            <Col xs={12}>
              <Button 
                icon={<TwitterOutlined />} 
                onClick={() => handleShare('twitter')}
                block
                style={{ color: '#1da1f2' }}
              >
                Twitter
              </Button>
            </Col>
            <Col xs={12}>
              <Button 
                icon={<LinkedinOutlined />} 
                onClick={() => handleShare('linkedin')}
                block
                style={{ color: '#0077b5' }}
              >
                LinkedIn
              </Button>
            </Col>
            <Col xs={12}>
              <Button 
                icon={<WhatsAppOutlined />} 
                onClick={() => handleShare('whatsapp')}
                block
                style={{ color: '#25d366' }}
              >
                WhatsApp
              </Button>
            </Col>
            <Col xs={12}>
              <Button 
                icon={<CopyOutlined />} 
                onClick={() => handleShare('copy')}
                block
              >
                Copy Link
              </Button>
            </Col>
          </Row>
        </Space>
      </Modal>
    </div>
  );
};

export default InterviewCompletionPage;