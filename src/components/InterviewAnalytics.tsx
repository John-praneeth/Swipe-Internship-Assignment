import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  Table,
  Tag,
  Typography,
  Space,

  Select,

  Tabs,
  Alert,
  Timeline,
  Badge,

} from 'antd';
import {
  TrophyOutlined,
  ClockCircleOutlined,
  CodeOutlined,
  SecurityScanOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  BulbOutlined,
  FireOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
  WarningOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

const { Option } = Select;

interface InterviewStats {
  totalInterviews: number;
  averageScore: number;
  completionRate: number;
  averageTime: number;
  topCategories: Array<{ category: string; count: number; avgScore: number }>;
  difficultyBreakdown: Array<{ difficulty: string; attempted: number; success: number }>;
  recentPerformance: Array<{
    date: string;
    score: number;
    category: string;
    difficulty: string;
    timeSpent: number;
  }>;
  skillProgression: Array<{
    skill: string;
    level: number;
    improvement: number;
  }>;
  weakAreas: Array<{
    area: string;
    score: number;
    suggestions: string[];
  }>;
}

const InterviewAnalytics: React.FC = () => {
  const [stats, setStats] = useState<InterviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchAnalytics();
  }, [selectedPeriod, selectedCategory]);

  const fetchAnalytics = async () => {
    setLoading(true);
    
    // Mock data - in real implementation, this would fetch from backend
    const mockStats: InterviewStats = {
      totalInterviews: 45,
      averageScore: 78,
      completionRate: 89,
      averageTime: 25, // minutes
      topCategories: [
        { category: 'DSA', count: 15, avgScore: 82 },
        { category: 'System Design', count: 12, avgScore: 75 },
        { category: 'Security', count: 8, avgScore: 71 },
        { category: 'Database', count: 6, avgScore: 85 },
        { category: 'API', count: 4, avgScore: 79 }
      ],
      difficultyBreakdown: [
        { difficulty: 'Easy', attempted: 20, success: 18 },
        { difficulty: 'Medium', attempted: 18, success: 14 },
        { difficulty: 'Hard', attempted: 7, success: 4 }
      ],
      recentPerformance: [
        { date: '2024-01-10', score: 85, category: 'DSA', difficulty: 'Medium', timeSpent: 22 },
        { date: '2024-01-09', score: 92, category: 'Security', difficulty: 'Easy', timeSpent: 18 },
        { date: '2024-01-08', score: 67, category: 'System Design', difficulty: 'Hard', timeSpent: 35 },
        { date: '2024-01-07', score: 78, category: 'Database', difficulty: 'Medium', timeSpent: 28 },
        { date: '2024-01-06', score: 88, category: 'API', difficulty: 'Easy', timeSpent: 15 }
      ],
      skillProgression: [
        { skill: 'Algorithm Design', level: 75, improvement: 12 },
        { skill: 'System Architecture', level: 68, improvement: 8 },
        { skill: 'Security Practices', level: 72, improvement: 15 },
        { skill: 'Database Design', level: 80, improvement: 5 },
        { skill: 'API Development', level: 77, improvement: 10 }
      ],
      weakAreas: [
        {
          area: 'Dynamic Programming',
          score: 45,
          suggestions: [
            'Practice more DP problems with memoization',
            'Study common DP patterns (knapsack, LIS, etc.)',
            'Focus on state transition definitions'
          ]
        },
        {
          area: 'Distributed Systems',
          score: 52,
          suggestions: [
            'Learn about CAP theorem and consistency models',
            'Study microservices architecture patterns',
            'Practice designing scalable systems'
          ]
        }
      ]
    };

    setTimeout(() => {
      setStats(mockStats);
      setLoading(false);
    }, 1000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#52c41a';
    if (score >= 60) return '#faad14';
    if (score >= 40) return '#fa8c16';
    return '#ff4d4f';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return '#52c41a';
      case 'Medium': return '#faad14';
      case 'Hard': return '#ff4d4f';
      default: return '#1890ff';
    }
  };

  const getSkillLevel = (level: number) => {
    if (level >= 80) return 'Expert';
    if (level >= 60) return 'Proficient';
    if (level >= 40) return 'Intermediate';
    return 'Beginner';
  };

  const performanceColumns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => new Date(date).toLocaleDateString()
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => <Tag color="blue">{category}</Tag>
    },
    {
      title: 'Difficulty',
      dataIndex: 'difficulty',
      key: 'difficulty',
      render: (difficulty: string) => (
        <Tag color={getDifficultyColor(difficulty)}>{difficulty}</Tag>
      )
    },
    {
      title: 'Score',
      dataIndex: 'score',
      key: 'score',
      render: (score: number) => (
        <Text style={{ color: getScoreColor(score), fontWeight: 'bold' }}>
          {score}%
        </Text>
      )
    },
    {
      title: 'Time',
      dataIndex: 'timeSpent',
      key: 'timeSpent',
      render: (time: number) => `${time}min`
    }
  ];

  if (loading || !stats) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <div>Loading analytics...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', backgroundColor: '#f5f7fa', minHeight: '100vh' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>
          <BarChartOutlined /> Interview Performance Analytics
        </Title>
        <Text type="secondary">
          Track your coding interview progress and identify areas for improvement
        </Text>
      </div>

      {/* Controls */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Space>
              <Text strong>Time Period:</Text>
              <Select
                value={selectedPeriod}
                onChange={setSelectedPeriod}
                style={{ width: '120px' }}
              >
                <Option value="7d">Last 7 days</Option>
                <Option value="30d">Last 30 days</Option>
                <Option value="90d">Last 3 months</Option>
                <Option value="1y">Last year</Option>
              </Select>
            </Space>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Space>
              <Text strong>Category:</Text>
              <Select
                value={selectedCategory}
                onChange={setSelectedCategory}
                style={{ width: '150px' }}
              >
                <Option value="all">All Categories</Option>
                <Option value="DSA">Algorithms</Option>
                <Option value="System Design">System Design</Option>
                <Option value="Security">Security</Option>
                <Option value="Database">Database</Option>
                <Option value="API">API Design</Option>
              </Select>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Overview Statistics */}
      <Row gutter={[24, 24]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Interviews"
              value={stats.totalInterviews}
              prefix={<CodeOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Average Score"
              value={stats.averageScore}
              suffix="%"
              prefix={<TrophyOutlined />}
              valueStyle={{ color: getScoreColor(stats.averageScore) }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Completion Rate"
              value={stats.completionRate}
              suffix="%"
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Avg Time"
              value={stats.averageTime}
              suffix="min"
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Tabs
        defaultActiveKey="overview"
        items={[
          {
            key: 'overview',
            label: (
              <span>
                <PieChartOutlined />
                Overview
              </span>
            ),
            children: (
              <Row gutter={[24, 24]}>
                {/* Category Performance */}
                <Col xs={24} lg={12}>
                  <Card
                    title={
                      <Space>
                        <BarChartOutlined />
                        Performance by Category
                      </Space>
                    }
                  >
                    <Space direction="vertical" style={{ width: '100%' }}>
                      {stats.topCategories.map((category) => (
                        <div key={category.category}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <Text strong>{category.category}</Text>
                            <Space>
                              <Text>{category.avgScore}%</Text>
                              <Text type="secondary">({category.count} attempts)</Text>
                            </Space>
                          </div>
                          <Progress
                            percent={category.avgScore}
                            strokeColor={getScoreColor(category.avgScore)}
                            showInfo={false}
                          />
                        </div>
                      ))}
                    </Space>
                  </Card>
                </Col>

                {/* Difficulty Breakdown */}
                <Col xs={24} lg={12}>
                  <Card
                    title={
                      <Space>
                        <ThunderboltOutlined />
                        Difficulty Analysis
                      </Space>
                    }
                  >
                    <Space direction="vertical" style={{ width: '100%' }}>
                      {stats.difficultyBreakdown.map((item) => {
                        const successRate = (item.success / item.attempted) * 100;
                        return (
                          <div key={item.difficulty}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                              <Tag color={getDifficultyColor(item.difficulty)}>
                                {item.difficulty}
                              </Tag>
                              <Text>
                                {item.success}/{item.attempted} ({Math.round(successRate)}%)
                              </Text>
                            </div>
                            <Progress
                              percent={successRate}
                              strokeColor={getDifficultyColor(item.difficulty)}
                              showInfo={false}
                            />
                          </div>
                        );
                      })}
                    </Space>
                  </Card>
                </Col>
              </Row>
            )
          },
          {
            key: 'skills',
            label: (
              <span>
                <FireOutlined />
                Skill Progression
              </span>
            ),
            children: (
              <Row gutter={[24, 24]}>
                <Col xs={24} lg={16}>
                  <Card
                    title={
                      <Space>
                        <LineChartOutlined />
                        Skill Development
                      </Space>
                    }
                  >
                    <Space direction="vertical" style={{ width: '100%' }}>
                      {stats.skillProgression.map((skill) => (
                        <div key={skill.skill} style={{ marginBottom: '16px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <Text strong>{skill.skill}</Text>
                            <Space>
                              <Badge
                                count={`+${skill.improvement}%`}
                                style={{ backgroundColor: '#52c41a' }}
                              />
                              <Text>{getSkillLevel(skill.level)}</Text>
                            </Space>
                          </div>
                          <Progress
                            percent={skill.level}
                            strokeColor={{
                              '0%': '#108ee9',
                              '100%': '#87d068',
                            }}
                            format={(percent) => `${percent}%`}
                          />
                        </div>
                      ))}
                    </Space>
                  </Card>
                </Col>

                <Col xs={24} lg={8}>
                  <Card
                    title={
                      <Space>
                        <WarningOutlined />
                        Areas for Improvement
                      </Space>
                    }
                  >
                    <Space direction="vertical" style={{ width: '100%' }}>
                      {stats.weakAreas.map((area) => (
                        <Alert
                          key={area.area}
                          message={area.area}
                          description={
                            <div>
                              <Text strong style={{ color: getScoreColor(area.score) }}>
                                Score: {area.score}%
                              </Text>
                              <div style={{ marginTop: '8px' }}>
                                {area.suggestions.map((suggestion, index) => (
                                  <div key={index} style={{ fontSize: '12px', marginBottom: '4px' }}>
                                    • {suggestion}
                                  </div>
                                ))}
                              </div>
                            </div>
                          }
                          type="warning"
                          showIcon
                          style={{ marginBottom: '12px' }}
                        />
                      ))}
                    </Space>
                  </Card>
                </Col>
              </Row>
            )
          },
          {
            key: 'history',
            label: (
              <span>
                <ClockCircleOutlined />
                Recent Performance
              </span>
            ),
            children: (
              <Card
                title={
                  <Space>
                    <ClockCircleOutlined />
                    Recent Interview History
                  </Space>
                }
              >
                <Table
                  columns={performanceColumns}
                  dataSource={stats.recentPerformance}
                  pagination={{ pageSize: 10 }}
                  rowKey="date"
                />
              </Card>
            )
          },
          {
            key: 'recommendations',
            label: (
              <span>
                <BulbOutlined />
                Recommendations
              </span>
            ),
            children: (
              <Row gutter={[24, 24]}>
                <Col xs={24} lg={12}>
                  <Card
                    title={
                      <Space>
                        <BulbOutlined />
                        Personalized Study Plan
                      </Space>
                    }
                  >
                    <Timeline>
                      <Timeline.Item color="blue" dot={<FireOutlined />}>
                        <Text strong>Week 1-2: Focus on Dynamic Programming</Text>
                        <div style={{ marginTop: '8px', color: '#666' }}>
                          • Practice 5 DP problems daily
                          • Study memoization patterns
                          • Review classic problems (knapsack, LIS)
                        </div>
                      </Timeline.Item>
                      <Timeline.Item color="green" dot={<ThunderboltOutlined />}>
                        <Text strong>Week 3-4: System Design Fundamentals</Text>
                        <div style={{ marginTop: '8px', color: '#666' }}>
                          • Learn about distributed systems
                          • Practice designing scalable architectures
                          • Study real-world system examples
                        </div>
                      </Timeline.Item>
                      <Timeline.Item color="orange" dot={<SecurityScanOutlined />}>
                        <Text strong>Week 5-6: Security Best Practices</Text>
                        <div style={{ marginTop: '8px', color: '#666' }}>
                          • Review OWASP Top 10
                          • Practice secure coding patterns
                          • Learn about authentication systems
                        </div>
                      </Timeline.Item>
                    </Timeline>
                  </Card>
                </Col>

                <Col xs={24} lg={12}>
                  <Card
                    title={
                      <Space>
                        <TrophyOutlined />
                        Achievement Goals
                      </Space>
                    }
                  >
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Alert
                        message="Short-term Goals (Next 2 weeks)"
                        description={
                          <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                            <li>Achieve 85%+ average score on Medium problems</li>
                            <li>Complete 10 Dynamic Programming problems</li>
                            <li>Reduce average solving time to under 20 minutes</li>
                          </ul>
                        }
                        type="info"
                        showIcon
                      />
                      
                      <Alert
                        message="Long-term Goals (Next 2 months)"
                        description={
                          <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                            <li>Master all Easy and Medium difficulty levels</li>
                            <li>Achieve 70%+ success rate on Hard problems</li>
                            <li>Complete system design interview preparation</li>
                          </ul>
                        }
                        type="success"
                        showIcon
                      />
                    </Space>
                  </Card>
                </Col>
              </Row>
            )
          }
        ]}
      />
    </div>
  );
};

export default InterviewAnalytics;