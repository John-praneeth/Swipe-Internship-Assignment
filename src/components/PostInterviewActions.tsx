import React, { useState } from 'react';
import {
  Card,
  Button,
  Modal,

  Input,
  Rate,

  message,
  Space,
  Typography,
  Row,
  Col,

  Tag,
  Timeline,
  Progress,

  Alert
} from 'antd';
import {
  ShareAltOutlined,
  DownloadOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  FileTextOutlined,
  LinkedinOutlined,
  TwitterOutlined,
  FacebookOutlined,
  WhatsAppOutlined,
  CopyOutlined,
  StarOutlined,


  ReloadOutlined,

  BookOutlined,
  TrophyOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { Candidate } from '../types';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface PostInterviewActionsProps {
  candidate: Candidate;
  onRetakeInterview: () => void;
}

const PostInterviewActions: React.FC<PostInterviewActionsProps> = ({
  candidate,
  onRetakeInterview
}) => {
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [shareVisible, setShareVisible] = useState(false);

  const [followUpVisible, setFollowUpVisible] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleFeedbackSubmit = async () => {
    if (rating === 0) {
      message.warning('Please provide a rating');
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      message.success('Thank you for your feedback!');
      setFeedbackVisible(false);
      setFeedback('');
      setRating(0);
    } catch (error) {
      message.error('Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = (platform: string) => {
    const shareText = `I just completed an AI interview and scored ${candidate.finalScore}/100! 🎉 #AIInterview #TechInterview`;
    const shareUrl = window.location.href;

    switch (platform) {
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareText)}`);
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`);
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`);
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`);
        break;
      case 'copy':
        navigator.clipboard.writeText(shareText + ' ' + shareUrl);
        message.success('Link copied to clipboard!');
        break;
    }
    setShareVisible(false);
  };

  const handleDownloadCertificate = () => {
    // Generate a simple certificate
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 800;
    canvas.height = 600;

    // Background
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Border
    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 10;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

    // Title
    ctx.fillStyle = '#2c3e50';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Certificate of Completion', canvas.width / 2, 120);

    // Subtitle
    ctx.font = '24px Arial';
    ctx.fillText('AI Interview Assessment', canvas.width / 2, 160);

    // Name
    ctx.font = 'bold 32px Arial';
    ctx.fillStyle = '#667eea';
    ctx.fillText(candidate.name, canvas.width / 2, 250);

    // Score
    ctx.font = '28px Arial';
    ctx.fillStyle = '#52c41a';
    ctx.fillText(`Score: ${candidate.finalScore}/100`, canvas.width / 2, 320);

    // Date
    ctx.font = '18px Arial';
    ctx.fillStyle = '#7f8c8d';
    ctx.fillText(`Completed on ${new Date().toLocaleDateString()}`, canvas.width / 2, 380);

    // Download
    const link = document.createElement('a');
    link.download = `interview-certificate-${candidate.name.replace(/\s+/g, '-')}.png`;
    link.href = canvas.toDataURL();
    link.click();

    message.success('Certificate downloaded successfully!');
  };

  const handleScheduleFollowUp = () => {
    // Create calendar event
    const event = {
      title: 'Interview Follow-up Discussion',
      start: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
      description: `Follow-up discussion for interview completed by ${candidate.name} with score ${candidate.finalScore}/100`
    };

    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${event.start.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${event.start.toISOString().replace(/[-:]/g, '').split('.')[0]}Z&details=${encodeURIComponent(event.description)}`;
    
    window.open(calendarUrl, '_blank');
    setFollowUpVisible(false);
  };

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

  return (
    <div style={{ padding: '24px' }}>
      {/* Quick Actions */}
      <Card
        title={
          <Space>
            <TrophyOutlined />
            <span>Quick Actions</span>
          </Space>
        }
        style={{ marginBottom: '24px' }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={handleDownloadCertificate}
              block
              size="large"
            >
              Download Certificate
            </Button>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Button
              icon={<ShareAltOutlined />}
              onClick={() => setShareVisible(true)}
              block
              size="large"
            >
              Share Achievement
            </Button>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Button
              icon={<StarOutlined />}
              onClick={() => setFeedbackVisible(true)}
              block
              size="large"
            >
              Give Feedback
            </Button>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Button
              icon={<ReloadOutlined />}
              onClick={onRetakeInterview}
              block
              size="large"
            >
              Retake Interview
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Performance Summary */}
      <Card
        title={
          <Space>
            <BookOutlined />
            <span>Performance Summary</span>
          </Space>
        }
        style={{ marginBottom: '24px' }}
      >
        <Row gutter={[24, 24]}>
          <Col xs={24} md={8}>
            <div style={{ textAlign: 'center' }}>
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
              <div style={{ marginTop: '16px' }}>
                <Title level={4} style={{ margin: 0, color: getScoreColor(candidate.finalScore || 0) }}>
                  Overall Score
                </Title>
              </div>
            </div>
          </Col>
          <Col xs={24} md={16}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>Interview Summary:</Text>
                <Paragraph style={{ marginTop: '8px' }}>
                  {candidate.summary || 'Great job completing the interview! Your responses demonstrate good understanding of the technical concepts covered.'}
                </Paragraph>
              </div>
              
              <div>
                <Text strong>Key Metrics:</Text>
                <Row gutter={[16, 8]} style={{ marginTop: '8px' }}>
                  <Col span={12}>
                    <Tag icon={<FileTextOutlined />} color="blue">
                      {candidate.answers.length} Questions Answered
                    </Tag>
                  </Col>
                  <Col span={12}>
                    <Tag icon={<ClockCircleOutlined />} color="green">
                      {Math.round(candidate.answers.reduce((acc, ans) => acc + ans.timeSpent, 0) / 60)} Minutes Total
                    </Tag>
                  </Col>
                </Row>
              </div>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Next Steps */}
      <Card
        title={
          <Space>
            <CalendarOutlined />
            <span>Next Steps</span>
          </Space>
        }
      >
        <Timeline>
          <Timeline.Item color="green" dot={<MailOutlined />}>
            <Text strong>Email Confirmation Sent</Text>
            <br />
            <Text type="secondary">
              You'll receive a detailed report within 24 hours
            </Text>
          </Timeline.Item>
          <Timeline.Item color="blue" dot={<PhoneOutlined />}>
            <Text strong>Review Process</Text>
            <br />
            <Text type="secondary">
              Our team will review your responses within 2-3 business days
            </Text>
          </Timeline.Item>
          <Timeline.Item color="orange" dot={<CalendarOutlined />}>
            <Text strong>Follow-up Contact</Text>
            <br />
            <Text type="secondary">
              If selected, we'll contact you for the next round
            </Text>
            <br />
            <Button
              type="link"
              onClick={() => setFollowUpVisible(true)}
              style={{ padding: 0, marginTop: '8px' }}
            >
              Schedule Follow-up Reminder
            </Button>
          </Timeline.Item>
        </Timeline>

        <Alert
          message="Interview Completed Successfully!"
          description="Thank you for taking the time to complete our AI-powered interview. We appreciate your effort and will be in touch soon with the results."
          type="success"
          showIcon
          style={{ marginTop: '24px' }}
        />
      </Card>

      {/* Feedback Modal */}
      <Modal
        title={
          <Space>
            <StarOutlined />
            <span>Share Your Feedback</span>
          </Space>
        }
        open={feedbackVisible}
        onOk={handleFeedbackSubmit}
        onCancel={() => setFeedbackVisible(false)}
        confirmLoading={loading}
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
              placeholder="Share your thoughts about the interview process, questions, or overall experience..."
              style={{ marginTop: '8px' }}
            />
          </div>
        </Space>
      </Modal>

      {/* Share Modal */}
      <Modal
        title={
          <Space>
            <ShareAltOutlined />
            <span>Share Your Achievement</span>
          </Space>
        }
        open={shareVisible}
        onCancel={() => setShareVisible(false)}
        footer={null}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Text>Share your interview completion on social media:</Text>
          <Row gutter={[8, 8]}>
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
                icon={<FacebookOutlined />}
                onClick={() => handleShare('facebook')}
                block
                style={{ color: '#4267b2' }}
              >
                Facebook
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
          </Row>
          <Button
            icon={<CopyOutlined />}
            onClick={() => handleShare('copy')}
            block
            type="dashed"
          >
            Copy Link
          </Button>
        </Space>
      </Modal>

      {/* Follow-up Modal */}
      <Modal
        title={
          <Space>
            <CalendarOutlined />
            <span>Schedule Follow-up Reminder</span>
          </Space>
        }
        open={followUpVisible}
        onOk={handleScheduleFollowUp}
        onCancel={() => setFollowUpVisible(false)}
        okText="Add to Calendar"
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Text>
            Would you like to add a follow-up reminder to your calendar? 
            This will help you track the interview process.
          </Text>
          <Alert
            message="Reminder Details"
            description="A calendar event will be created for one week from today to follow up on your interview status."
            type="info"
            showIcon
          />
        </Space>
      </Modal>
    </div>
  );
};

export default PostInterviewActions;