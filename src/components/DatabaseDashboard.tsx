import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Button,
  DatePicker,
  Select,
  Space,
  Typography,
  Progress,
  Tag,
  Tooltip,

  message,
  Spin,
  Alert,
  Divider
} from 'antd';
import {
  DatabaseOutlined,
  UserOutlined,

  TrophyOutlined,


  ReloadOutlined,

  ExportOutlined,
  BarChartOutlined,
  PieChartOutlined,
  LineChartOutlined,
  SettingOutlined,

} from '@ant-design/icons';


const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

interface DatabaseStats {
  totalCandidates: number;
  completedInterviews: number;
  inProgressInterviews: number;
  averageScore: number;
  totalQuestions: number;
  totalUsers: number;
  completionRate: number;
}

interface PerformanceData {
  scoreDistribution: any[];
  difficultyPerformance: any[];
  categoryPerformance: any[];
}

const DatabaseDashboard: React.FC = () => {

  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<[any, any] | null>(null);
  const [selectedMetric, setSelectedMetric] = useState('overview');
  const [maintenanceLoading, setMaintenanceLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Mock data - In real app, this would call the backend API
      const mockStats: DatabaseStats = {
        totalCandidates: 156,
        completedInterviews: 134,
        inProgressInterviews: 12,
        averageScore: 73,
        totalQuestions: 25,
        totalUsers: 8,
        completionRate: 86
      };

      const mockPerformance: PerformanceData = {
        scoreDistribution: [
          { range: '90-100', count: 23 },
          { range: '80-89', count: 45 },
          { range: '70-79', count: 38 },
          { range: '60-69', count: 21 },
          { range: '50-59', count: 7 }
        ],
        difficultyPerformance: [
          { difficulty: 'EASY', avgScore: 85, count: 134 },
          { difficulty: 'MEDIUM', avgScore: 72, count: 134 },
          { difficulty: 'HARD', avgScore: 58, count: 134 }
        ],
        categoryPerformance: [
          { category: 'JavaScript', avgTime: 25, count: 268 },
          { category: 'React', avgTime: 28, count: 268 },
          { category: 'System Design', avgTime: 45, count: 134 }
        ]
      };

      setStats(mockStats);
      setPerformanceData(mockPerformance);
    } catch (error) {
      message.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleMaintenance = async () => {
    setMaintenanceLoading(true);
    try {
      // Mock maintenance operation
      await new Promise(resolve => setTimeout(resolve, 2000));
      message.success('Database maintenance completed successfully');
      fetchDashboardData();
    } catch (error) {
      message.error('Maintenance failed');
    } finally {
      setMaintenanceLoading(false);
    }
  };

  const handleExport = async (type: string) => {
    setExportLoading(true);
    try {
      // Mock export operation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const exportData = {
        exportDate: new Date().toISOString(),
        type,
        summary: stats
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `database-export-${type}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      message.success(`${type} data exported successfully`);
    } catch (error) {
      message.error('Export failed');
    } finally {
      setExportLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#52c41a';
    if (score >= 60) return '#faad14';
    if (score >= 40) return '#fa8c16';
    return '#ff4d4f';
  };

  const candidateColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <Text strong>{text}</Text>
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'COMPLETED' ? 'green' : status === 'IN_PROGRESS' ? 'blue' : 'orange'}>
          {status}
        </Tag>
      )
    },
    {
      title: 'Score',
      dataIndex: 'score',
      key: 'score',
      render: (score: number) => (
        <Text style={{ color: getScoreColor(score), fontWeight: 'bold' }}>
          {score || 'N/A'}
        </Text>
      )
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date'
    }
  ];

  const mockCandidates = [
    { key: '1', name: 'John Doe', email: 'john@example.com', status: 'COMPLETED', score: 85, date: '2024-01-10' },
    { key: '2', name: 'Jane Smith', email: 'jane@example.com', status: 'COMPLETED', score: 92, date: '2024-01-09' },
    { key: '3', name: 'Bob Johnson', email: 'bob@example.com', status: 'IN_PROGRESS', score: null, date: '2024-01-08' },
    { key: '4', name: 'Alice Brown', email: 'alice@example.com', status: 'COMPLETED', score: 78, date: '2024-01-07' },
    { key: '5', name: 'Charlie Wilson', email: 'charlie@example.com', status: 'COMPLETED', score: 67, date: '2024-01-06' }
  ];

  if (loading) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <Spin size="large" />
        <div style={{ marginTop: '20px' }}>
          <Text>Loading dashboard data...</Text>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', backgroundColor: '#f5f7fa', minHeight: '100vh' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level={2}>
          <DatabaseOutlined /> Database Management Dashboard
        </Title>
        <Text type="secondary">
          Monitor and manage your interview system database
        </Text>
      </div>

      {/* Controls */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Space>
              <Text strong>Date Range:</Text>
              <RangePicker
                value={dateRange}
                onChange={setDateRange}
                style={{ width: '200px' }}
              />
            </Space>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Space>
              <Text strong>View:</Text>
              <Select
                value={selectedMetric}
                onChange={setSelectedMetric}
                style={{ width: '150px' }}
              >
                <Option value="overview">Overview</Option>
                <Option value="performance">Performance</Option>
                <Option value="analytics">Analytics</Option>
              </Select>
            </Space>
          </Col>
          <Col xs={24} md={8}>
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchDashboardData}
                loading={loading}
              >
                Refresh
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={handleMaintenance}
                loading={maintenanceLoading}
                type="primary"
              >
                Maintenance
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Statistics Overview */}
      <Row gutter={[24, 24]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Candidates"
              value={stats?.totalCandidates}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Completed Interviews"
              value={stats?.completedInterviews}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Average Score"
              value={stats?.averageScore}
              suffix="/100"
              prefix={<BarChartOutlined />}
              valueStyle={{ color: getScoreColor(stats?.averageScore || 0) }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Completion Rate"
              value={stats?.completionRate}
              suffix="%"
              prefix={<PieChartOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        {/* Performance Metrics */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <LineChartOutlined />
                <span>Performance by Difficulty</span>
              </Space>
            }
            extra={
              <Tooltip title="Average performance across difficulty levels">
                <Button type="text" icon={<BarChartOutlined />} />
              </Tooltip>
            }
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              {performanceData?.difficultyPerformance.map((item) => (
                <div key={item.difficulty}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <Text strong>{item.difficulty}</Text>
                    <Text>{item.avgScore}% avg</Text>
                  </div>
                  <Progress
                    percent={item.avgScore}
                    strokeColor={getScoreColor(item.avgScore)}
                    showInfo={false}
                  />
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {item.count} responses
                  </Text>
                </div>
              ))}
            </Space>
          </Card>
        </Col>

        {/* Score Distribution */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <PieChartOutlined />
                <span>Score Distribution</span>
              </Space>
            }
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              {performanceData?.scoreDistribution.map((item) => (
                <div key={item.range} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Tag color={getScoreColor(parseInt(item.range.split('-')[0]))}>
                    {item.range}
                  </Tag>
                  <div style={{ flex: 1, margin: '0 16px' }}>
                    <Progress
                      percent={(item.count / (stats?.completedInterviews || 1)) * 100}
                      showInfo={false}
                      strokeColor={getScoreColor(parseInt(item.range.split('-')[0]))}
                    />
                  </div>
                  <Text strong>{item.count}</Text>
                </div>
              ))}
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Recent Candidates */}
      <Card
        title={
          <Space>
            <UserOutlined />
            <span>Recent Candidates</span>
          </Space>
        }
        extra={
          <Space>
            <Button
              icon={<ExportOutlined />}
              onClick={() => handleExport('candidates')}
              loading={exportLoading}
            >
              Export
            </Button>
          </Space>
        }
        style={{ marginTop: '24px' }}
      >
        <Table
          columns={candidateColumns}
          dataSource={mockCandidates}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 800 }}
        />
      </Card>

      {/* Database Actions */}
      <Card
        title={
          <Space>
            <SettingOutlined />
            <span>Database Actions</span>
          </Space>
        }
        style={{ marginTop: '24px' }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Button
              block
              icon={<ExportOutlined />}
              onClick={() => handleExport('all')}
              loading={exportLoading}
            >
              Export All Data
            </Button>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Button
              block
              icon={<ExportOutlined />}
              onClick={() => handleExport('users')}
              loading={exportLoading}
            >
              Export Users
            </Button>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Button
              block
              icon={<ExportOutlined />}
              onClick={() => handleExport('questions')}
              loading={exportLoading}
            >
              Export Questions
            </Button>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Button
              block
              icon={<SettingOutlined />}
              onClick={handleMaintenance}
              loading={maintenanceLoading}
              type="primary"
            >
              Run Maintenance
            </Button>
          </Col>
        </Row>

        <Divider />

        <Alert
          message="Database Maintenance"
          description="Regular maintenance includes cleaning up expired sessions, removing old incomplete interviews, and optimizing database performance."
          type="info"
          showIcon
          style={{ marginTop: '16px' }}
        />
      </Card>
    </div>
  );
};

export default DatabaseDashboard;