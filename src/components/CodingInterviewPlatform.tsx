import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  Typography,
  Button,
  Select,
  Space,
  Row,
  Col,
  Tabs,
  Input,
  Tag,
  Progress,
  Modal,
  Alert,
  Divider,
  Timeline,
  message,
  Collapse,
  List
} from 'antd';
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  BulbOutlined,
  CheckCircleOutlined,

  CodeOutlined,
  SecurityScanOutlined,
  DatabaseOutlined,
  ApiOutlined,
  SettingOutlined,
  ThunderboltOutlined,
  EyeOutlined,
  SendOutlined,
  ReloadOutlined,
  BookOutlined,
  WarningOutlined,
  BarChartOutlined,
  StopOutlined
} from '@ant-design/icons';
import { CodingQuestion, advancedQuestionBank, getQuestionsByDifficulty, getQuestionsByCategory } from '../utils/simpleQuestionBank';


const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { Panel } = Collapse;

interface TestResult {
  passed: boolean;
  input: any;
  expectedOutput: any;
  actualOutput: any;
  executionTime: number;
  error?: string;
}

interface InterviewSession {
  questionId: string;
  startTime: number;
  hints: number[];
  attempts: number;
  code: string;
  language: string;
  testResults: TestResult[];
  completed: boolean;
  score: number;
}

const CodingInterviewPlatform: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState<CodingQuestion | null>(null);
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [isRunning, setIsRunning] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [showHints, setShowHints] = useState(false);
  const [usedHints, setUsedHints] = useState<number[]>([]);
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [interviewerFeedback, setInterviewerFeedback] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showAnalytics, setShowAnalytics] = useState(false);
  
  // New state for question progression
  const [questionSet, setQuestionSet] = useState<CodingQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [completedQuestions, setCompletedQuestions] = useState<InterviewSession[]>([]);
  const [isInterviewComplete, setIsInterviewComplete] = useState(false);
  const [finalResults, setFinalResults] = useState<any>(null);
  
  // Ensure showAnalytics is recognized as used
  void showAnalytics;
  
  const timerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (isTimerActive) {
      timerRef.current = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isTimerActive]);

  const startInterview = (difficulty?: string, category?: string) => {
    let questions = advancedQuestionBank;
    
    if (difficulty) {
      questions = getQuestionsByDifficulty(difficulty as any);
    }
    
    if (category) {
      questions = getQuestionsByCategory(category);
    }
    
    // Select 3-5 questions for the interview
    const shuffled = [...questions].sort(() => 0.5 - Math.random());
    const selectedQuestions = shuffled.slice(0, Math.min(3, questions.length));
    
    setQuestionSet(selectedQuestions);
    setCurrentQuestionIndex(0);
    setCompletedQuestions([]);
    setIsInterviewComplete(false);
    setFinalResults(null);
    
    const firstQuestion = selectedQuestions[0];
    setCurrentQuestion(firstQuestion);
    
    const newSession: InterviewSession = {
      questionId: firstQuestion.id,
      startTime: Date.now(),
      hints: [],
      attempts: 0,
      code: firstQuestion.starterCode?.[language as keyof typeof firstQuestion.starterCode] || '',
      language,
      testResults: [],
      completed: false,
      score: 0
    };
    
    setSession(newSession);
    setCode(newSession.code);
    setTimeElapsed(0);
    setIsTimerActive(true);
    setUsedHints([]);
    setTestResults([]);
    setShowFollowUp(false);
    setInterviewerFeedback('');
  };

  const pauseInterview = () => {
    setIsTimerActive(false);
  };

  const completeCurrentQuestion = () => {
    if (!session || !currentQuestion) return;

    // Calculate score based on test results
    const passedTests = testResults.filter(result => result.passed).length;
    const totalTests = testResults.length;
    const score = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;

    const completedSession: InterviewSession = {
      ...session,
      completed: true,
      score,
      testResults
    };

    setCompletedQuestions(prev => [...prev, completedSession]);
    
    // Move to next question or complete interview
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < questionSet.length) {
      // Move to next question
      setCurrentQuestionIndex(nextIndex);
      const nextQuestion = questionSet[nextIndex];
      setCurrentQuestion(nextQuestion);
      
      const newSession: InterviewSession = {
        questionId: nextQuestion.id,
        startTime: Date.now(),
        hints: [],
        attempts: 0,
        code: nextQuestion.starterCode?.[language as keyof typeof nextQuestion.starterCode] || '',
        language,
        testResults: [],
        completed: false,
        score: 0
      };
      
      setSession(newSession);
      setCode(newSession.code);
      setTimeElapsed(0);
      setUsedHints([]);
      setTestResults([]);
      setShowFollowUp(false);
      setInterviewerFeedback('');
      
      message.success(`Moving to question ${nextIndex + 1} of ${questionSet.length}`);
    } else {
      // Complete interview
      completeInterview();
    }
  };

  const completeInterview = () => {
    setIsTimerActive(false);
    setIsInterviewComplete(true);
    
    // Calculate final results
    const totalScore = completedQuestions.reduce((sum, session) => sum + session.score, 0);
    const averageScore = completedQuestions.length > 0 ? Math.round(totalScore / completedQuestions.length) : 0;
    const totalTime = completedQuestions.reduce((sum, session) => sum + (Date.now() - session.startTime), 0);
    
    const results = {
      totalQuestions: questionSet.length,
      completedQuestions: completedQuestions.length,
      averageScore,
      totalTime: Math.round(totalTime / 1000 / 60), // in minutes
      questionResults: completedQuestions.map(session => ({
        questionId: session.questionId,
        score: session.score,
        attempts: session.attempts,
        hintsUsed: session.hints.length
      }))
    };
    
    setFinalResults(results);
    message.success('Interview completed successfully!');
  };

  const resumeInterview = () => {
    setIsTimerActive(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    if (!currentQuestion) return '#52c41a';
    const timeLimit = currentQuestion.timeLimit * 60; // Convert to seconds
    const percentage = (timeElapsed / timeLimit) * 100;
    
    if (percentage >= 90) return '#ff4d4f';
    if (percentage >= 75) return '#faad14';
    return '#52c41a';
  };

  const runCode = async () => {
    if (!currentQuestion || !session) return;
    
    setIsRunning(true);
    
    try {
      // Import the code execution engine
      const { codeExecutionEngine } = await import('../utils/codeExecutionEngine');
      
      // Convert test cases to the expected format
      const testCases = currentQuestion.testCases.map(tc => ({
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        isHidden: tc.isHidden || false
      }));
      
      // Execute code using the proper engine
      const { results: executionResults } = await codeExecutionEngine.executeCode(
        code,
        language,
        testCases
      );
      
      // Convert execution results to test results format
      const results: TestResult[] = executionResults.map((execResult, index) => ({
        passed: execResult.success,
        input: testCases[index].input,
        expectedOutput: testCases[index].expectedOutput,
        actualOutput: execResult.output,
        executionTime: execResult.executionTime,
        error: execResult.error
      }));
      
      setTestResults(results);
      
      // Update session
      const updatedSession = {
        ...session,
        attempts: session.attempts + 1,
        code,
        testResults: results
      };
      setSession(updatedSession);
      
      const passedTests = results.filter(r => r.passed).length;
      const totalTests = results.length;
      
      if (passedTests === totalTests) {
        message.success(`All tests passed! (${passedTests}/${totalTests})`);
        // Show submit button or auto-complete after a delay
        setTimeout(() => {
          completeCurrentQuestion();
        }, 2000);
      } else {
        message.warning(`${passedTests}/${totalTests} tests passed. Keep trying!`);
      }
      
    } catch (error) {
      console.error('Code execution failed:', error);
      message.error('Code execution failed. Please check your code and try again.');
      
      // Set all tests as failed in case of execution error
      const failedResults: TestResult[] = currentQuestion.testCases.map(tc => ({
        passed: false,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        actualOutput: null,
        executionTime: 0,
        error: 'Execution failed'
      }));
      
      setTestResults(failedResults);
    } finally {
      setIsRunning(false);
    }
  };





  const useHint = (hintLevel: number) => {
    if (!usedHints.includes(hintLevel)) {
      setUsedHints([...usedHints, hintLevel]);
      message.info('Hint revealed! This will affect your final score.');
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Security': return <SecurityScanOutlined />;
      case 'Database': return <DatabaseOutlined />;
      case 'API': return <ApiOutlined />;
      case 'System Design': return <SettingOutlined />;
      case 'DSA': return <ThunderboltOutlined />;
      default: return <CodeOutlined />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return '#52c41a';
      case 'Medium': return '#faad14';
      case 'Hard': return '#ff4d4f';
      default: return '#1890ff';
    }
  };

  // Results Screen
  if (isInterviewComplete && finalResults) {
    return (
      <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
        <Card>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
              color: 'white',
              padding: '40px',
              borderRadius: '12px',
              marginBottom: '32px'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
              <Title level={2} style={{ color: 'white', margin: '0 0 16px 0' }}>
                Coding Interview Completed!
              </Title>
              <Text style={{ color: 'white', fontSize: '18px' }}>
                Congratulations! You have successfully completed your coding interview.
              </Text>
            </div>

            <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
              <Col xs={24} md={6}>
                <Card>
                  <Statistic
                    title="Overall Score"
                    value={finalResults.averageScore}
                    suffix="%"
                    valueStyle={{ color: finalResults.averageScore >= 70 ? '#52c41a' : '#faad14' }}
                  />
                </Card>
              </Col>
              <Col xs={24} md={6}>
                <Card>
                  <Statistic
                    title="Questions Completed"
                    value={finalResults.completedQuestions}
                    suffix={`/ ${finalResults.totalQuestions}`}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col xs={24} md={6}>
                <Card>
                  <Statistic
                    title="Total Time"
                    value={finalResults.totalTime}
                    suffix="min"
                    valueStyle={{ color: '#722ed1' }}
                  />
                </Card>
              </Col>
              <Col xs={24} md={6}>
                <Card>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Performance</div>
                    <div style={{ 
                      fontSize: '24px', 
                      fontWeight: 'bold',
                      color: finalResults.averageScore >= 80 ? '#52c41a' : finalResults.averageScore >= 60 ? '#faad14' : '#ff4d4f'
                    }}>
                      {finalResults.averageScore >= 80 ? 'Excellent' : finalResults.averageScore >= 60 ? 'Good' : 'Needs Improvement'}
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>

            <Card title="Question-wise Results" style={{ textAlign: 'left', marginBottom: '32px' }}>
              <List
                dataSource={finalResults.questionResults}
                renderItem={(item: any, index: number) => (
                  <List.Item>
                    <List.Item.Meta
                      title={`Question ${index + 1}`}
                      description={
                        <Space>
                          <Tag color={item.score >= 70 ? 'green' : item.score >= 50 ? 'orange' : 'red'}>
                            Score: {item.score}%
                          </Tag>
                          <Tag>Attempts: {item.attempts}</Tag>
                          <Tag>Hints: {item.hintsUsed}</Tag>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>

            <div style={{ marginTop: '32px' }}>
              <Title level={4}>What's Next?</Title>
              <Paragraph>
                We'll review your coding solutions and get back to you within 2-3 business days.
                Thank you for your time and effort!
              </Paragraph>
              <Button
                type="primary"
                size="large"
                onClick={() => {
                  setIsInterviewComplete(false);
                  setFinalResults(null);
                  setCurrentQuestion(null);
                  setQuestionSet([]);
                  setCurrentQuestionIndex(0);
                  setCompletedQuestions([]);
                }}
                style={{ marginTop: '16px' }}
              >
                Start New Interview
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
        <Card>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Title level={2}>
              <CodeOutlined /> Advanced Coding Interview Platform
            </Title>
            <Paragraph style={{ fontSize: '16px', marginBottom: '32px' }}>
              Practice with real-world coding challenges used by top tech companies.
              Get instant feedback, hints, and detailed performance analysis.
            </Paragraph>
            
            <Row gutter={[16, 16]} style={{ marginBottom: '32px' }}>
              <Col xs={24} sm={12}>
                <Select
                  placeholder="Select Difficulty"
                  style={{ width: '100%' }}
                  value={selectedDifficulty}
                  onChange={setSelectedDifficulty}
                  allowClear
                >
                  <Option value="Easy">🟢 Easy</Option>
                  <Option value="Medium">🟡 Medium</Option>
                  <Option value="Hard">🔴 Hard</Option>
                </Select>
              </Col>
              <Col xs={24} sm={12}>
                <Select
                  placeholder="Select Category"
                  style={{ width: '100%' }}
                  value={selectedCategory}
                  onChange={setSelectedCategory}
                  allowClear
                >
                  <Option value="Security">🔒 Security</Option>
                  <Option value="System Design">🏗️ System Design</Option>
                  <Option value="Database">🗄️ Database</Option>
                  <Option value="API">🌐 API Design</Option>
                  <Option value="DSA">⚡ Algorithms</Option>
                  <Option value="OOP">🎯 OOP</Option>
                </Select>
              </Col>
            </Row>
            
            <Button
              type="primary"
              size="large"
              icon={<PlayCircleOutlined />}
              onClick={() => startInterview(selectedDifficulty, selectedCategory)}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 32px',
                height: 'auto',
                fontSize: '16px'
              }}
            >
              Start Coding Interview
            </Button>
            
            <div style={{ marginTop: '40px' }}>
              <Row gutter={[24, 24]} justify="center">
                <Col xs={24} md={8}>
                  <Card size="small">
                    <Statistic title="Difficulty Levels" value={3} />
                  </Card>
                </Col>
              </Row>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <Card style={{ marginBottom: '24px' }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <Title level={3} style={{ margin: 0 }}>
                {getCategoryIcon(currentQuestion.category)}
                {currentQuestion.title}
              </Title>
              <Tag color={getDifficultyColor(currentQuestion.difficulty)}>
                {currentQuestion.difficulty}
              </Tag>
              <Tag>{currentQuestion.category}</Tag>
              <Tag color="blue">
                Question {currentQuestionIndex + 1} of {questionSet.length}
              </Tag>
            </Space>
          </Col>
          <Col>
            <Space>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: getTimeColor() }}>
                  {formatTime(timeElapsed)}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  / {currentQuestion.timeLimit}min
                </div>
              </div>
              <Button
                icon={isTimerActive ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                onClick={isTimerActive ? pauseInterview : resumeInterview}
              >
                {isTimerActive ? 'Pause' : 'Resume'}
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => startInterview()}
              >
                New Question
              </Button>
              <Button
                icon={<BarChartOutlined />}
                onClick={() => setShowAnalytics(true)}
              >
                Analytics
              </Button>
              <Button
                danger
                icon={<StopOutlined />}
                onClick={() => {
                  Modal.confirm({
                    title: 'End Interview',
                    content: 'Are you sure you want to end the interview? This action cannot be undone.',
                    okText: 'Yes, End Interview',
                    cancelText: 'Cancel',
                    onOk: () => {
                      setSession(null);
                      setCurrentQuestion(null);
                      setIsTimerActive(false);
                      setTimeElapsed(0);
                      message.success('Interview ended successfully');
                    }
                  });
                }}
              >
                End Test
              </Button>
            </Space>
          </Col>
        </Row>
        
        <Progress
          percent={Math.min(100, (timeElapsed / (currentQuestion.timeLimit * 60)) * 100)}
          strokeColor={getTimeColor()}
          showInfo={false}
          style={{ marginTop: '16px' }}
        />
      </Card>

      <Row gutter={[24, 24]}>
        {/* Problem Description */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <BookOutlined />
                Problem Description
              </Space>
            }
            style={{ height: '600px', overflow: 'auto' }}
          >
            <div style={{ whiteSpace: 'pre-wrap', marginBottom: '16px' }}>
              {currentQuestion.description}
            </div>
            
            <Divider />
            
            <Collapse ghost>
              <Panel header="📝 Examples" key="examples">
                {currentQuestion.examples.map((example, index) => (
                  <div key={index} style={{ marginBottom: '16px' }}>
                    <Text strong>Example {index + 1}:</Text>
                    <div style={{ background: '#f5f5f5', padding: '8px', borderRadius: '4px', margin: '8px 0' }}>
                      <Text code>Input: {example.input}</Text><br />
                      <Text code>Output: {example.output}</Text>
                    </div>
                    <Text type="secondary">{example.explanation}</Text>
                  </div>
                ))}
              </Panel>
              
              <Panel header="⚠️ Constraints" key="constraints">
                <List
                  size="small"
                  dataSource={currentQuestion.constraints}
                  renderItem={item => <List.Item>• {item}</List.Item>}
                />
              </Panel>
              
              <Panel header="🔍 Edge Cases" key="edges">
                <List
                  size="small"
                  dataSource={currentQuestion.edgeCases}
                  renderItem={item => <List.Item>• {item}</List.Item>}
                />
              </Panel>
              
              <Panel header="🔒 Security Considerations" key="security">
                <List
                  size="small"
                  dataSource={currentQuestion.securityConsiderations}
                  renderItem={item => <List.Item>• {item}</List.Item>}
                />
              </Panel>
            </Collapse>
            
            <Divider />
            
            <Space>
              <Button
                icon={<BulbOutlined />}
                onClick={() => setShowHints(true)}
                disabled={usedHints.length >= currentQuestion.hints.length}
              >
                Get Hint ({usedHints.length}/{currentQuestion.hints.length})
              </Button>
              <Button
                icon={<EyeOutlined />}
                onClick={() => setShowFollowUp(true)}
                disabled={!session?.completed}
              >
                Follow-up Questions
              </Button>
            </Space>
          </Card>
        </Col>

        {/* Code Editor */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <CodeOutlined />
                Code Editor
                <Select
                  value={language}
                  onChange={setLanguage}
                  style={{ width: 120 }}
                >
                  <Option value="javascript">JavaScript</Option>
                  <Option value="python">Python</Option>
                  <Option value="java">Java</Option>
                </Select>
              </Space>
            }
            extra={
              <Space>
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={runCode}
                  loading={isRunning}
                >
                  Run Tests
                </Button>
                <Button
                  type="default"
                  icon={<CheckCircleOutlined />}
                  onClick={() => {
                    Modal.confirm({
                      title: 'Submit Question',
                      content: 'Are you sure you want to submit this question and move to the next one?',
                      okText: 'Yes, Submit',
                      cancelText: 'Cancel',
                      onOk: () => {
                        completeCurrentQuestion();
                      }
                    });
                  }}
                  style={{
                    background: '#52c41a',
                    borderColor: '#52c41a',
                    color: 'white'
                  }}
                >
                  {currentQuestionIndex + 1 < questionSet.length ? 'Submit & Next' : 'Submit & Finish'}
                </Button>
              </Space>
            }
            style={{ height: '600px' }}
          >
            <TextArea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              style={{
                height: '400px',
                fontFamily: 'Monaco, Consolas, "Courier New", monospace',
                fontSize: '14px'
              }}
              placeholder="Write your solution here..."
            />
            
            {testResults.length > 0 && (
              <div style={{ marginTop: '16px' }}>
                <Title level={5}>Test Results:</Title>
                {testResults.map((result, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '8px',
                      margin: '4px 0',
                      borderRadius: '4px',
                      background: result.passed ? '#f6ffed' : '#fff2f0',
                      border: `1px solid ${result.passed ? '#b7eb8f' : '#ffccc7'}`
                    }}
                  >
                    <Space>
                      {result.passed ? (
                        <CheckCircleOutlined style={{ color: '#52c41a' }} />
                      ) : (
                        <WarningOutlined style={{ color: '#ff4d4f' }} />
                      )}
                      <Text strong>Test {index + 1}</Text>
                      <Text type="secondary">({result.executionTime.toFixed(2)}ms)</Text>
                    </Space>
                    {!result.passed && result.error && (
                      <div style={{ marginTop: '4px', color: '#ff4d4f' }}>
                        {result.error}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Hints Modal */}
      <Modal
        title="💡 Progressive Hints"
        open={showHints}
        onCancel={() => setShowHints(false)}
        footer={null}
        width={600}
      >
        <Alert
          message="Hint Usage"
          description="Using hints will reduce your final score. Try to solve independently first!"
          type="warning"
          showIcon
          style={{ marginBottom: '16px' }}
        />
        
        <Timeline>
          {currentQuestion.hints.map((hint, index) => (
            <Timeline.Item
              key={index}
              color={usedHints.includes(index) ? 'green' : 'gray'}
              dot={usedHints.includes(index) ? <CheckCircleOutlined /> : <BulbOutlined />}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Text strong>Hint {index + 1}</Text>
                  {usedHints.includes(index) && (
                    <div style={{ marginTop: '8px' }}>
                      <Text>{hint.hint}</Text>
                    </div>
                  )}
                </div>
                {!usedHints.includes(index) && (
                  <Button
                    size="small"
                    onClick={() => useHint(index)}
                  >
                    Reveal
                  </Button>
                )}
              </div>
            </Timeline.Item>
          ))}
        </Timeline>
      </Modal>

      {/* Follow-up Questions Modal */}
      <Modal
        title="🎯 Follow-up Discussion"
        open={showFollowUp}
        onCancel={() => setShowFollowUp(false)}
        footer={null}
        width={800}
      >
        <Tabs
          items={[
            {
              key: 'feedback',
              label: 'Performance Feedback',
              children: (
                <div style={{ whiteSpace: 'pre-wrap' }}>
                  {interviewerFeedback}
                </div>
              )
            },
            {
              key: 'followup',
              label: 'Follow-up Questions',
              children: (
                <List
                  dataSource={currentQuestion.followUpQuestions}
                  renderItem={(question, index) => (
                    <List.Item>
                      <Text strong>{index + 1}. </Text>
                      <Text>{question}</Text>
                    </List.Item>
                  )}
                />
              )
            },
            {
              key: 'optimization',
              label: 'Optimization Discussion',
              children: (
                <div>
                  <Title level={5}>Performance Requirements:</Title>
                  <Text>{currentQuestion.performanceRequirements}</Text>
                  
                  <Title level={5} style={{ marginTop: '16px' }}>Discussion Points:</Title>
                  <List
                    dataSource={[
                      "What is the time and space complexity of your solution?",
                      "How would you optimize for different input sizes?",
                      "What trade-offs did you consider?",
                      "How would you handle edge cases in production?",
                      "What monitoring would you add to this system?"
                    ]}
                    renderItem={item => <List.Item>• {item}</List.Item>}
                  />
                </div>
              )
            }
          ]}
        />
      </Modal>
    </div>
  );
};

// Custom Statistic component
const Statistic: React.FC<{ 
  title: string; 
  value: number | string; 
  suffix?: string; 
  valueStyle?: React.CSSProperties 
}> = ({ title, value, suffix = '', valueStyle = {} }) => (
  <div style={{ textAlign: 'center' }}>
    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff', ...valueStyle }}>
      {value}{suffix}
    </div>
    <div style={{ color: '#666', fontSize: '14px' }}>{title}</div>
  </div>
);

export default CodingInterviewPlatform;