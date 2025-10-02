# AI-Powered Interview Assistant

A modern React application that serves as an AI-powered interview assistant with dual-tab functionality for both interviewees and interviewers.

## 🚀 Features

### For Interviewees
- **Resume Upload**: Support for PDF and DOCX files with automatic text extraction
- **Information Collection**: Smart extraction and validation of candidate details (name, email, phone)
- **Interactive Interview**: 6-question interview with varying difficulty levels
- **Real-time Timer**: Different time limits based on question difficulty (Easy: 20s, Medium: 60s, Hard: 120s)
- **Auto-submission**: Questions automatically submit when time expires
- **Pause/Resume**: Interview can be paused and resumed later
- **Progress Tracking**: Visual progress bar and question counter

### For Interviewers
- **Dashboard Overview**: Statistics on total candidates, completed interviews, and average scores
- **Candidate Management**: Search, filter, and sort candidates
- **Detailed Analysis**: View complete interview history, answers, and AI-generated summaries
- **Score Visualization**: Color-coded scoring system with detailed breakdowns
- **Export Capabilities**: Review all candidate responses and performance metrics

### Technical Features
- **Persistent Storage**: All data saved locally with Redux Persist
- **Welcome Back Modal**: Automatic detection of incomplete interviews
- **Responsive Design**: Works seamlessly across desktop and mobile devices
- **Real-time Updates**: Live synchronization between tabs
- **Error Handling**: Comprehensive error handling with user-friendly messages

## 🛠️ Tech Stack

- **Frontend**: React 18 with TypeScript
- **State Management**: Redux Toolkit with Redux Persist
- **UI Framework**: Ant Design
- **Build Tool**: Vite
- **Styling**: CSS with Ant Design theming
- **File Processing**: Custom utilities (with mock implementations)
- **Date Handling**: Day.js

## 📁 Project Structure

```
src/
├── components/           # React components
│   ├── ChatMessage.tsx   # Individual chat message component
│   ├── IntervieweeTab.tsx # Main interview interface
│   ├── InterviewerTab.tsx # Dashboard interface
│   ├── Timer.tsx         # Timer component with animations
│   └── WelcomeBackModal.tsx # Resume interview modal
├── store/               # Redux store configuration
│   ├── interviewSlice.ts # Main state management
│   └── store.ts         # Store configuration with persistence
├── types/               # TypeScript type definitions
│   └── index.ts         # All application types
├── utils/               # Utility functions
│   ├── aiService.ts     # Mock AI service for questions/scoring
│   └── resumeParser.ts  # Resume parsing utilities
├── App.tsx             # Main application component
├── App.css             # Application styles
├── index.css           # Global styles
└── main.tsx            # Application entry point
```

## 🔐 Demo Accounts

For testing purposes, you can use the following demo accounts:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@demo.com | password123 |
| **Interviewer** | interviewer@demo.com | password123 |
| **Interviewee** | interviewee@demo.com | password123 |

### Account Roles

- **Admin**: Full access to all features including user management and admin portal
- **Interviewer**: Access to interviewer dashboard to view and manage candidate interviews
- **Interviewee**: Can take AI interviews and coding interviews

> **Note**: Admin and Interviewer accounts can only be created through the Admin Portal. Regular users can create Interviewee accounts through the registration page.

## 🚀 Getting Started

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-interview-assistant
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000` to view the application.

### Build for Production

```bash
npm run build
```

## 🔧 Configuration

The application uses the following configuration:

- **Port**: 3000 (configurable in `vite.config.ts`)
- **Storage**: LocalStorage via Redux Persist
- **Theme**: Ant Design with custom primary color (#1890ff)

## 📊 Interview Flow

### Question Structure
- **2 Easy Questions** (20 seconds each)
  - JavaScript fundamentals
  - React basics
- **2 Medium Questions** (60 seconds each)
  - React hooks
  - Database concepts
- **2 Hard Questions** (120 seconds each)
  - System design
  - Advanced JavaScript concepts

### Scoring System
- Questions are scored based on answer quality and completeness
- Final score calculated as weighted average across all questions
- Automatic summary generation based on performance patterns

## 🎨 UI/UX Features

- **Modern Design**: Clean, professional interface using Ant Design
- **Responsive Layout**: Optimized for both desktop and mobile
- **Real-time Feedback**: Live timer with color-coded warnings
- **Interactive Elements**: Smooth animations and transitions
- **Accessibility**: WCAG compliant with proper contrast and keyboard navigation

## 🔄 State Management

The application uses Redux Toolkit for state management with the following features:

- **Persistence**: Automatic saving/loading of interview state
- **Type Safety**: Full TypeScript integration
- **Immutable Updates**: Safe state mutations with Immer
- **DevTools Integration**: Redux DevTools support for debugging

## 🗂️ Data Flow

1. **Resume Upload** → Text extraction → Information validation
2. **Interview Start** → Question generation → Timer initialization
3. **Answer Submission** → Scoring → Progress update
4. **Interview Completion** → Final score calculation → Summary generation
5. **Data Persistence** → Local storage → Welcome back modal

## 🧪 Mock Services

For demonstration purposes, the application includes mock services:

- **AI Question Generation**: Pre-defined questions with difficulty levels
- **Resume Parsing**: Simulated text extraction from PDF/DOCX
- **Scoring Algorithm**: Simple scoring based on answer length and quality
- **Summary Generation**: Automatic candidate performance summaries

## 🚀 Future Enhancements

- **Real AI Integration**: Connect to actual AI services (OpenAI, Claude, etc.)
- **Video Recording**: Record candidate responses
- **Advanced Analytics**: Detailed performance metrics and trends
- **Multiple Templates**: Different interview templates for various roles
- **Team Collaboration**: Multi-interviewer support
- **Calendar Integration**: Schedule and manage interviews
- **Export Reports**: PDF/Excel export functionality

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For support, please open an issue in the GitHub repository or contact the development team.

---

Built with ❤️ using React, TypeScript, and Ant Design
