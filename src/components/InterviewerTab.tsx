import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Table,
  Card,
  Tag,
  Button,
  Input,
  Space,
  Modal,
  Typography,
  Statistic,
  Row,
  Col,
  Timeline,
  Badge,
  Tabs,
} from 'antd';
import { 
  EyeOutlined, 
  SearchOutlined, 
  TrophyOutlined, 
  ClockCircleOutlined,
  DownloadOutlined,
  FileTextOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  CopyOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { RootState } from '../store/store';
import { selectCandidate } from '../store/interviewSlice';
import { Candidate } from '../types';
import dayjs from 'dayjs';

const { Search } = Input;
const { Title, Text, Paragraph } = Typography;

interface CandidateDetailModalProps {
  candidate: Candidate | null;
  visible: boolean;
  onClose: () => void;
}

const CandidateDetailModal: React.FC<CandidateDetailModalProps> = ({
  candidate,
  visible,
  onClose,
}) => {
  if (!candidate) return null;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'green';
      case 'medium': return 'orange';
      case 'hard': return 'red';
      default: return 'default';
    }
  };

  const formatDuration = (startTime?: number, endTime?: number) => {
    if (!startTime || !endTime) return 'N/A';
    const duration = Math.round((endTime - startTime) / 1000 / 60); // in minutes
    return `${duration} minutes`;
  };

  return (
    <Modal
      title={`Interview Details - ${candidate.name}`}
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
      ]}
      width={800}
    >
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Statistic
            title="Final Score"
            value={candidate.finalScore || 0}
            suffix="/100"
            valueStyle={{ color: candidate.finalScore && candidate.finalScore >= 70 ? '#3f8600' : '#cf1322' }}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="Questions Answered"
            value={candidate.answers.filter(a => !a.answer.includes('(No answer provided')).length}
            suffix={`/${candidate.answers.length}`}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="Interview Duration"
            value={formatDuration(candidate.startTime, candidate.endTime)}
            prefix={<ClockCircleOutlined />}
          />
        </Col>
      </Row>

      <Title level={4}>Candidate Information</Title>
      <Row gutter={[16, 8]} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Text strong>Email:</Text> {candidate.email}
        </Col>
        <Col span={8}>
          <Text strong>Phone:</Text> {candidate.phone}
        </Col>
        <Col span={8}>
          <Text strong>Status:</Text>{' '}
          <Tag color={candidate.status === 'completed' ? 'green' : 'orange'}>
            {candidate.status.replace('-', ' ').toUpperCase()}
          </Tag>
        </Col>
      </Row>

      {/* Resume Section */}
      {(candidate.resumeFile || candidate.resumeText) && (
        <>
          <Title level={4}>Resume</Title>
          <Card style={{ marginBottom: 24 }}>
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Space>
                  {candidate.resumeFile && (
                    <>
                      {candidate.resumeFile.type === 'application/pdf' ? (
                        <FilePdfOutlined style={{ fontSize: '20px', color: '#ff4d4f' }} />
                      ) : (
                        <FileWordOutlined style={{ fontSize: '20px', color: '#1890ff' }} />
                      )}
                      <Text strong>{candidate.resumeFile.name}</Text>
                      <Text type="secondary">
                        ({(candidate.resumeFile.size / 1024).toFixed(1)} KB)
                      </Text>
                      <Button 
                        type="link" 
                        icon={<DownloadOutlined />}
                        onClick={() => {
                          const url = URL.createObjectURL(candidate.resumeFile!);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = candidate.resumeFile!.name;
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                          URL.revokeObjectURL(url);
                        }}
                      >
                        Download
                      </Button>
                    </>
                  )}
                  {!candidate.resumeFile && candidate.resumeText && (
                    <>
                      <FileTextOutlined style={{ fontSize: '20px', color: '#52c41a' }} />
                      <Text strong>Resume Text</Text>
                    </>
                  )}
                </Space>
              </Col>
              
              {candidate.resumeText && (
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
                            maxHeight: '300px', 
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
                            {candidate.resumeText}
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
                                navigator.clipboard.writeText(candidate.resumeText || '');
                                Modal.success({
                                  title: 'Copied!',
                                  content: 'Resume text copied to clipboard.',
                                });
                              }}
                            >
                              Copy
                            </Button>
                            <Input.TextArea
                              value={candidate.resumeText}
                              readOnly
                              autoSize={{ minRows: 8, maxRows: 15 }}
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
              )}
            </Row>
          </Card>
        </>
      )}

      <Title level={4}>Interview Summary</Title>
      <Card style={{ marginBottom: 24 }}>
        <Paragraph>{candidate.summary || 'No summary available.'}</Paragraph>
      </Card>

      <Title level={4}>Questions & Answers</Title>
      <Timeline>
        {candidate.answers.map((answer, index) => (
          <Timeline.Item
            key={answer.questionId}
            color={answer.answer.includes('(No answer provided') ? 'red' : 'green'}
          >
            <div style={{ marginBottom: 16 }}>
              <div style={{ marginBottom: 8 }}>
                <Text strong>Question {index + 1}</Text>
                <Tag
                  color={getDifficultyColor(answer.difficulty)}
                  style={{ marginLeft: 8 }}
                >
                  {answer.difficulty.toUpperCase()}
                </Tag>
              </div>
              <Paragraph style={{ marginBottom: 8 }}>
                <Text italic>{answer.question}</Text>
              </Paragraph>
              <Card size="small" style={{ backgroundColor: '#f9f9f9' }}>
                <Text>{answer.answer}</Text>
              </Card>
              <div style={{ marginTop: 8 }}>
                <Text type="secondary">
                  Time spent: {Math.round(answer.timeSpent)}s
                  {answer.score && ` | Score: ${answer.score}/20`}
                </Text>
              </div>
            </div>
          </Timeline.Item>
        ))}
      </Timeline>
    </Modal>
  );
};

const InterviewerTab: React.FC = () => {
  const dispatch = useDispatch();
  const { candidates } = useSelector((state: RootState) => state.interview);
  const [searchText, setSearchText] = React.useState('');
  const [selectedCandidate, setSelectedCandidate] = React.useState<Candidate | null>(null);
  const [detailModalVisible, setDetailModalVisible] = React.useState(false);

  const filteredCandidates = candidates.filter(candidate =>
    candidate.name.toLowerCase().includes(searchText.toLowerCase()) ||
    candidate.email.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleViewCandidate = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setDetailModalVisible(true);
    dispatch(selectCandidate(candidate.id));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge status="success" text="Completed" />;
      case 'in-progress':
        return <Badge status="processing" text="In Progress" />;
      case 'collecting-info':
        return <Badge status="warning" text="Collecting Info" />;
      default:
        return <Badge status="default" text="Unknown" />;
    }
  };

  const getScoreColor = (score?: number) => {
    if (!score) return '#999';
    if (score >= 80) return '#52c41a';
    if (score >= 60) return '#faad14';
    return '#ff4d4f';
  };

  const columns: ColumnsType<Candidate> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name: string) => <Text strong>{name}</Text>,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      ellipsis: true,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusBadge(status),
      filters: [
        { text: 'Completed', value: 'completed' },
        { text: 'In Progress', value: 'in-progress' },
        { text: 'Collecting Info', value: 'collecting-info' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Score',
      dataIndex: 'finalScore',
      key: 'finalScore',
      sorter: (a, b) => (a.finalScore || 0) - (b.finalScore || 0),
      render: (score?: number) => (
        <Text style={{ color: getScoreColor(score), fontWeight: 'bold' }}>
          {score ? `${score}/100` : 'N/A'}
        </Text>
      ),
    },
    {
      title: 'Resume',
      key: 'resume',
      render: (_, record) => {
        if (record.resumeFile || record.resumeText) {
          return (
            <Space>
              {record.resumeFile ? (
                record.resumeFile.type === 'application/pdf' ? (
                  <FilePdfOutlined style={{ color: '#ff4d4f' }} />
                ) : (
                  <FileWordOutlined style={{ color: '#1890ff' }} />
                )
              ) : (
                <FileTextOutlined style={{ color: '#52c41a' }} />
              )}
              <Tag color="green">Available</Tag>
            </Space>
          );
        }
        return <Tag color="default">Not Available</Tag>;
      },
      filters: [
        { text: 'Available', value: 'available' },
        { text: 'Not Available', value: 'not-available' },
      ],
      onFilter: (value, record) => {
        const hasResume = !!(record.resumeFile || record.resumeText);
        return value === 'available' ? hasResume : !hasResume;
      },
    },
    {
      title: 'Questions Completed',
      key: 'questionsCompleted',
      render: (_, record) => {
        const completed = record.answers.filter(a => !a.answer.includes('(No answer provided')).length;
        const total = record.answers.length || 6;
        return `${completed}/${total}`;
      },
    },
    {
      title: 'Interview Date',
      dataIndex: 'startTime',
      key: 'startTime',
      sorter: (a, b) => (a.startTime || 0) - (b.startTime || 0),
      render: (startTime?: number) =>
        startTime ? dayjs(startTime).format('MMM DD, YYYY HH:mm') : 'N/A',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => handleViewCandidate(record)}
        >
          View Details
        </Button>
      ),
    },
  ];

  const getStats = () => {
    const completed = candidates.filter(c => c.status === 'completed').length;
    const inProgress = candidates.filter(c => c.status === 'in-progress').length;
    const withResume = candidates.filter(c => c.resumeFile || c.resumeText).length;
    const avgScore = completed > 0 
      ? Math.round(candidates
          .filter(c => c.finalScore)
          .reduce((sum, c) => sum + (c.finalScore || 0), 0) / completed)
      : 0;

    return { completed, inProgress, withResume, avgScore };
  };

  const stats = getStats();

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>
          <TrophyOutlined style={{ marginRight: 8 }} />
          Interview Dashboard
        </Title>
        
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Candidates"
                value={candidates.length}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Completed Interviews"
                value={stats.completed}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Resumes Available"
                value={stats.withResume}
                suffix={`/${candidates.length}`}
                valueStyle={{ color: '#722ed1' }}
                prefix={<FileTextOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Average Score"
                value={stats.avgScore}
                suffix="/100"
                valueStyle={{ color: getScoreColor(stats.avgScore) }}
              />
            </Card>
          </Col>
        </Row>

        <Space style={{ marginBottom: 16 }}>
          <Search
            placeholder="Search candidates by name or email"
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            onSearch={setSearchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 400 }}
          />
        </Space>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={filteredCandidates}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} candidates`,
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      <CandidateDetailModal
        candidate={selectedCandidate}
        visible={detailModalVisible}
        onClose={() => {
          setDetailModalVisible(false);
          setSelectedCandidate(null);
        }}
      />
    </div>
  );
};

export default InterviewerTab;
