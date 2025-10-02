import React, { useState, useEffect } from 'react';
import { Card, Button, Select, Tabs, Alert, Spin, Typography, Space } from 'antd';
import { PlayCircleOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { CodingQuestion } from '../utils/simpleQuestionBank';
import { codeExecutionEngine, ExecutionResult, CodeAnalysis } from '../utils/codeExecutionEngine';

const { Option } = Select;
const { TabPane } = Tabs;
const { Title, Text, Paragraph } = Typography;

interface CodingQuestionInterfaceProps {
  question: CodingQuestion;
  onComplete: (success: boolean, timeSpent: number) => void;
}

const CodingQuestionInterface: React.FC<CodingQuestionInterfaceProps> = ({
  question,
  onComplete
}) => {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResults, setExecutionResults] = useState<ExecutionResult[]>([]);
  const [codeAnalysis, setCodeAnalysis] = useState<CodeAnalysis | null>(null);
  const [startTime] = useState(Date.now());
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    // Set initial code based on selected language
    if (question.starterCode) {
      setCode(question.starterCode[language as keyof typeof question.starterCode] || '');
    }
  }, [language, question.starterCode]);

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    if (question.starterCode) {
      setCode(question.starterCode[newLanguage as keyof typeof question.starterCode] || '');
    }
  };

  const handleRunCode = async () => {
    if (!code.trim()) {
      return;
    }

    setIsExecuting(true);
    setAttempts(prev => prev + 1);

    try {
      const { results, analysis } = await codeExecutionEngine.executeCode(
        code,
        language,
        question.testCases
      );

      setExecutionResults(results);
      setCodeAnalysis(analysis);

      // Check if all test cases passed
      const allPassed = results.every(result => result.success);
      if (allPassed) {
        const timeSpent = Date.now() - startTime;
        setTimeout(() => {
          onComplete(true, timeSpent);
        }, 2000); // Give user time to see results
      }

    } catch (error) {
      console.error('Code execution failed:', error);
      setExecutionResults([{
        success: false,
        output: null,
        error: 'Execution failed. Please check your code and try again.',
        executionTime: 0,
        memoryUsage: 0,
        securityViolations: []
      }]);
    } finally {
      setIsExecuting(false);
    }
  };

  const renderTestResults = () => {
    if (executionResults.length === 0) return null;

    return (
      <div style={{ marginTop: 16 }}>
        <Title level={4}>Test Results</Title>
        {executionResults.map((result, index) => (
          <Card
            key={index}
            size="small"
            style={{ marginBottom: 8 }}
            title={
              <Space>
                {result.success ? (
                  <CheckCircleOutlined style={{ color: '#52c41a' }} />
                ) : (
                  <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                )}
                Test Case {index + 1}
                {question.testCases[index]?.isHidden && (
                  <Text type="secondary">(Hidden)</Text>
                )}
              </Space>
            }
          >
            {result.error ? (
              <Alert
                message="Execution Error"
                description={result.error}
                type="error"
                showIcon
              />
            ) : (
              <div>
                <div style={{ marginBottom: 8 }}>
                  <Text strong>Input: </Text>
                  <Text code>{JSON.stringify(question.testCases[index]?.input)}</Text>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <Text strong>Expected: </Text>
                  <Text code>{JSON.stringify(question.testCases[index]?.expectedOutput)}</Text>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <Text strong>Your Output: </Text>
                  <Text code>{JSON.stringify(result.output)}</Text>
                </div>
                <div>
                  <Text type="secondary">
                    Execution Time: {result.executionTime.toFixed(2)}ms | 
                    Memory: {(result.memoryUsage / 1024).toFixed(2)}KB
                  </Text>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    );
  };

  const renderCodeAnalysis = () => {
    if (!codeAnalysis) return null;

    return (
      <div style={{ marginTop: 16 }}>
        <Title level={4}>Code Analysis</Title>
        <Card>
          <div style={{ marginBottom: 16 }}>
            <Text strong>Time Complexity: </Text>
            <Text code>{codeAnalysis.timeComplexity}</Text>
            <br />
            <Text strong>Space Complexity: </Text>
            <Text code>{codeAnalysis.spaceComplexity}</Text>
            <br />
            <Text strong>Code Quality Score: </Text>
            <Text strong style={{ color: codeAnalysis.codeQuality >= 70 ? '#52c41a' : '#ff4d4f' }}>
              {codeAnalysis.codeQuality}/100
            </Text>
          </div>

          {codeAnalysis.securityIssues.length > 0 && (
            <Alert
              message="Security Issues"
              description={
                <ul>
                  {codeAnalysis.securityIssues.map((issue, index) => (
                    <li key={index}>{issue}</li>
                  ))}
                </ul>
              }
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}

          {codeAnalysis.performanceIssues.length > 0 && (
            <Alert
              message="Performance Issues"
              description={
                <ul>
                  {codeAnalysis.performanceIssues.map((issue, index) => (
                    <li key={index}>{issue}</li>
                  ))}
                </ul>
              }
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}

          {codeAnalysis.suggestions.length > 0 && (
            <div>
              <Text strong>Suggestions:</Text>
              <ul>
                {codeAnalysis.suggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      </div>
    );
  };

  const getLanguageOptions = () => {
    const options = ['javascript', 'python', 'java'];
    
    // Add SQL option for database questions
    if (question.category === 'Database') {
      options.push('sql');
    }
    
    return options;
  };

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Title level={3}>{question.title}</Title>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <Text>Language:</Text>
              <Select
                value={language}
                onChange={handleLanguageChange}
                style={{ width: 120 }}
              >
                {getLanguageOptions().map(lang => (
                  <Option key={lang} value={lang}>
                    {lang.toUpperCase()}
                  </Option>
                ))}
              </Select>
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <Text strong>Difficulty: </Text>
            <Text type={question.difficulty === 'Easy' ? 'success' : question.difficulty === 'Medium' ? 'warning' : 'danger'}>
              {question.difficulty}
            </Text>
            <Text style={{ marginLeft: 16 }} strong>Category: </Text>
            <Text>{question.category}</Text>
            <Text style={{ marginLeft: 16 }} strong>Time Limit: </Text>
            <Text>{question.timeLimit} minutes</Text>
          </div>

          <Paragraph>{question.description}</Paragraph>

          {question.examples.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <Title level={4}>Examples</Title>
              {question.examples.map((example, index) => (
                <Card key={index} size="small" style={{ marginBottom: 8 }}>
                  <div><Text strong>Input:</Text> <Text code>{example.input}</Text></div>
                  <div><Text strong>Output:</Text> <Text code>{example.output}</Text></div>
                  <div><Text strong>Explanation:</Text> {example.explanation}</div>
                </Card>
              ))}
            </div>
          )}

          {question.constraints.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <Title level={4}>Constraints</Title>
              <ul>
                {question.constraints.map((constraint, index) => (
                  <li key={index}>{constraint}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <Tabs defaultActiveKey="code">
          <TabPane tab="Code Editor" key="code">
            <div style={{ marginBottom: 16 }}>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                style={{
                  width: '100%',
                  minHeight: '300px',
                  fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                  fontSize: '14px',
                  padding: '12px',
                  border: '1px solid #d9d9d9',
                  borderRadius: '6px',
                  resize: 'vertical'
                }}
                placeholder={`Write your ${language} code here...`}
              />
            </div>

            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <Button
                type="primary"
                icon={<PlayCircleOutlined />}
                onClick={handleRunCode}
                loading={isExecuting}
                disabled={!code.trim()}
              >
                {isExecuting ? 'Running...' : 'Run Code'}
              </Button>
              
              <Text type="secondary">
                Attempts: {attempts}
              </Text>
            </div>

            {isExecuting && (
              <div style={{ marginTop: 16, textAlign: 'center' }}>
                <Spin size="large" />
                <div style={{ marginTop: 8 }}>
                  <Text>Executing your code...</Text>
                </div>
              </div>
            )}

            {renderTestResults()}
            {renderCodeAnalysis()}
          </TabPane>

          {question.hints.length > 0 && (
            <TabPane tab="Hints" key="hints">
              <div>
                <Title level={4}>Hints</Title>
                {question.hints.map((hint, index) => (
                  <Card key={index} size="small" style={{ marginBottom: 8 }}>
                    <Text strong>Level {hint.level}: </Text>
                    {hint.hint}
                  </Card>
                ))}
              </div>
            </TabPane>
          )}

          {question.followUpQuestions.length > 0 && (
            <TabPane tab="Follow-up Questions" key="followup">
              <div>
                <Title level={4}>Follow-up Questions</Title>
                <div style={{ marginBottom: 24 }}>
                  <ul>
                    {question.followUpQuestions.map((question, index) => (
                      <li key={index} style={{ marginBottom: 12, fontSize: '16px' }}>{question}</li>
                    ))}
                  </ul>
                </div>
                
                {/* Follow-up Discussion Area */}
                <Card style={{ background: '#f8f9fa', border: '1px solid #e9ecef' }}>
                  <Title level={5}>Discussion Notes</Title>
                  <textarea
                    placeholder="Write your thoughts, approach, or answers to the follow-up questions here..."
                    style={{
                      width: '100%',
                      minHeight: '150px',
                      fontFamily: 'inherit',
                      fontSize: '14px',
                      padding: '12px',
                      border: '1px solid #d9d9d9',
                      borderRadius: '6px',
                      resize: 'vertical',
                      marginBottom: '16px'
                    }}
                  />
                  
                  <div style={{ textAlign: 'center' }}>
                    <Button
                      type="primary"
                      size="large"
                      onClick={() => {
                        const timeSpent = Date.now() - startTime;
                        onComplete(true, timeSpent);
                      }}
                      style={{
                        minWidth: '200px',
                        height: '40px',
                        fontSize: '16px',
                        fontWeight: 'bold'
                      }}
                    >
                      Submit Discussion
                    </Button>
                  </div>
                </Card>
              </div>
            </TabPane>
          )}
        </Tabs>
      </Card>
    </div>
  );
};

export default CodingQuestionInterface;