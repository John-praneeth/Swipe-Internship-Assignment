import React from 'react';
import { Card, Typography, Tag, Space, Button, Modal, Tabs, Row, Col, Input } from 'antd';
import { 
  FilePdfOutlined, 
  FileTextOutlined, 
  DownloadOutlined, 
  EyeOutlined,
  CopyOutlined 
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;

// Demo candidate with resume data
const demoCandidate = {
  id: 'demo-candidate-1',
  name: 'Sarah Johnson',
  email: 'sarah.johnson@example.com',
  phone: '+1-555-0199',
  resumeFile: new File(
    [new Blob([''])], 
    'Sarah_Johnson_Resume.pdf',
    { type: 'application/pdf' }
  ),
  resumeText: `SARAH JOHNSON
Senior Software Engineer

Contact Information:
Email: sarah.johnson@example.com
Phone: +1-555-0199
LinkedIn: linkedin.com/in/sarahjohnson
Location: San Francisco, CA

PROFESSIONAL SUMMARY
Experienced Full-Stack Developer with 5+ years of expertise in React, Node.js, and cloud technologies. Proven track record of building scalable web applications and leading development teams. Strong problem-solving skills and passion for clean, maintainable code.

TECHNICAL SKILLS
• Frontend: React, TypeScript, Redux, HTML5, CSS3, Ant Design
• Backend: Node.js, Express.js, Python, RESTful APIs
• Databases: PostgreSQL, MongoDB, Redis
• Cloud: AWS (EC2, S3, Lambda), Docker, Kubernetes
• Tools: Git, Jest, Webpack, VS Code

PROFESSIONAL EXPERIENCE

Senior Software Engineer | TechCorp Inc. | 2021 - Present
• Led development of customer-facing React application serving 100K+ users
• Implemented microservices architecture reducing API response time by 40%
• Mentored 3 junior developers and conducted code reviews
• Collaborated with product managers to define technical requirements

Software Engineer | StartupXYZ | 2019 - 2021
• Built responsive web applications using React and Node.js
• Developed automated testing suites increasing code coverage to 90%
• Optimized database queries improving application performance by 30%
• Participated in agile development processes and sprint planning

Junior Developer | WebSolutions | 2018 - 2019
• Developed and maintained client websites using modern web technologies
• Fixed bugs and implemented new features based on client feedback
• Learned and applied best practices for web development

EDUCATION
Bachelor of Science in Computer Science
University of California, Berkeley | 2014 - 2018
GPA: 3.7/4.0

PROJECTS
• E-commerce Platform: Built full-stack application with React and Node.js
• Task Management App: Developed team collaboration tool with real-time updates
• Personal Portfolio: Created responsive website showcasing development work

CERTIFICATIONS
• AWS Certified Solutions Architect
• MongoDB Certified Developer`,
  status: 'completed' as const,
  answers: [],
  currentQuestionIndex: 6,
  finalScore: 85,
  isPaused: false,
  startTime: Date.now() - 1000 * 60 * 25,
  endTime: Date.now(),
};

const InterviewerResumeDemo: React.FC = () => {
  const [showModal, setShowModal] = React.useState(false);

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      <Title level={2}>📋 Resume in Interviewer Portal - Demo</Title>
      
      {/* Main candidate card showing resume availability */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]}>
          <Col span={18}>
            <Space direction="vertical" size="small">
              <Title level={4} style={{ margin: 0 }}>{demoCandidate.name}</Title>
              <Text type="secondary">{demoCandidate.email}</Text>
              <Space>
                <Tag color="green">Interview Completed</Tag>
                <Tag color="blue">Score: {demoCandidate.finalScore}/100</Tag>
                <Space>
                  <FilePdfOutlined style={{ color: '#ff4d4f' }} />
                  <Tag color="green">Resume Available</Tag>
                </Space>
              </Space>
            </Space>
          </Col>
          <Col span={6} style={{ textAlign: 'right' }}>
            <Button 
              type="primary" 
              icon={<EyeOutlined />}
              onClick={() => setShowModal(true)}
              size="large"
            >
              View Details & Resume
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Features demonstration */}
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card title="✨ Resume Features for Interviewers" bordered={false}>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div>
                <Text strong>📄 File Information</Text>
                <br />
                <Text type="secondary">View original filename, file type, and size</Text>
              </div>
              <div>
                <Text strong>⬇️ Download Original</Text>
                <br />
                <Text type="secondary">Download the candidate's original resume file</Text>
              </div>
              <div>
                <Text strong>👁️ Text Preview</Text>
                <br />
                <Text type="secondary">Read extracted text content in formatted view</Text>
              </div>
              <div>
                <Text strong>📋 Copy Text</Text>
                <br />
                <Text type="secondary">Copy resume text for external analysis tools</Text>
              </div>
              <div>
                <Text strong>🔍 Filter by Resume</Text>
                <br />
                <Text type="secondary">Filter candidate list by resume availability</Text>
              </div>
            </Space>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="📊 Dashboard Integration" bordered={false}>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div>
                <Text strong>📈 Resume Statistics</Text>
                <br />
                <Text type="secondary">Track how many candidates uploaded resumes</Text>
              </div>
              <div>
                <Text strong>🏷️ Visual Indicators</Text>
                <br />
                <Text type="secondary">Instant visibility of resume availability in candidate list</Text>
              </div>
              <div>
                <Text strong>🎯 Quick Access</Text>
                <br />
                <Text type="secondary">One-click access to resume from candidate details</Text>
              </div>
              <div>
                <Text strong>💼 Professional Display</Text>
                <br />
                <Text type="secondary">Clean, professional presentation of resume data</Text>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Demo Modal */}
      <Modal
        title={`Interview Details - ${demoCandidate.name}`}
        open={showModal}
        onCancel={() => setShowModal(false)}
        footer={[
          <Button key="close" onClick={() => setShowModal(false)}>
            Close
          </Button>,
        ]}
        width={900}
      >
        {/* Resume Section - This is what interviewers will see */}
        <Title level={4}>Resume</Title>
        <Card style={{ marginBottom: 24 }}>
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Space>
                <FilePdfOutlined style={{ fontSize: '20px', color: '#ff4d4f' }} />
                <Text strong>{demoCandidate.resumeFile.name}</Text>
                <Text type="secondary">
                  ({(demoCandidate.resumeFile.size / 1024 || 245).toFixed(1)} KB)
                </Text>
                <Button 
                  type="link" 
                  icon={<DownloadOutlined />}
                  onClick={() => {
                    Modal.info({
                      title: 'Download Started',
                      content: 'In a real application, the resume file would be downloaded now.',
                    });
                  }}
                >
                  Download
                </Button>
              </Space>
            </Col>
            
            <Col span={24}>
              <Tabs
                items={[
                  {
                    key: 'preview',
                    label: (
                      <span>
                        <EyeOutlined />
                        Preview
                      </span>
                    ),
                    children: (
                      <div style={{ 
                        maxHeight: '400px', 
                        overflowY: 'auto',
                        padding: '16px',
                        backgroundColor: '#fafafa',
                        border: '1px solid #f0f0f0',
                        borderRadius: '6px',
                        whiteSpace: 'pre-wrap',
                        fontFamily: 'monospace',
                        fontSize: '13px',
                        lineHeight: '1.6'
                      }}>
                        {demoCandidate.resumeText}
                      </div>
                    ),
                  },
                  {
                    key: 'raw',
                    label: (
                      <span>
                        <FileTextOutlined />
                        Raw Text
                      </span>
                    ),
                    children: (
                      <div style={{ position: 'relative' }}>
                        <Button
                          size="small"
                          icon={<CopyOutlined />}
                          style={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}
                          onClick={() => {
                            Modal.success({
                              title: 'Copied!',
                              content: 'Resume text copied to clipboard.',
                            });
                          }}
                        >
                          Copy
                        </Button>
                        <TextArea
                          value={demoCandidate.resumeText}
                          readOnly
                          autoSize={{ minRows: 10, maxRows: 20 }}
                          style={{ 
                            fontFamily: 'monospace',
                            fontSize: '12px',
                            backgroundColor: '#f8f8f8'
                          }}
                        />
                      </div>
                    ),
                  },
                ]}
              />
            </Col>
          </Row>
        </Card>

        <Card>
          <Title level={5}>✅ Key Benefits for Interviewers:</Title>
          <ul style={{ paddingLeft: '20px' }}>
            <li><Text>Quick access to candidate's background and experience</Text></li>
            <li><Text>Ability to reference specific skills and projects during interview</Text></li>
            <li><Text>Professional resume storage and organization</Text></li>
            <li><Text>Easy sharing and collaboration with hiring team</Text></li>
            <li><Text>Seamless integration with interview workflow</Text></li>
          </ul>
        </Card>
      </Modal>
    </div>
  );
};

export default InterviewerResumeDemo;
