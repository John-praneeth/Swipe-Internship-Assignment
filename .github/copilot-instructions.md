# Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
This is an AI-Powered Interview Assistant built with React, TypeScript, Redux, and Ant Design. The application provides a dual-tab interface for conducting AI-powered technical interviews.

## Key Features
- **Resume Upload & Parsing**: Upload PDF/DOCX files and extract candidate information
- **Interactive Interview Flow**: 6 questions (2 Easy, 2 Medium, 2 Hard) with different time limits
- **Real-time Timer**: Auto-submit when time expires
- **Persistence**: Local storage with pause/resume functionality
- **Dashboard**: View all candidates, scores, and detailed interview history

## Architecture
- **Frontend**: React 18 with TypeScript
- **State Management**: Redux Toolkit with Redux Persist
- **UI Library**: Ant Design
- **File Processing**: Custom utilities for PDF/DOCX parsing (mocked)
- **Styling**: CSS with Ant Design theming

## Code Style Guidelines
- Use TypeScript for type safety
- Follow React functional components with hooks
- Use Redux Toolkit patterns (createSlice, createSelector)
- Implement proper error handling and loading states
- Use Ant Design components consistently
- Maintain responsive design principles

## File Structure
- `src/components/`: React components
- `src/store/`: Redux store and slices
- `src/types/`: TypeScript type definitions
- `src/utils/`: Utility functions
- `src/`: Main app files

## Development Notes
- Mock AI services are implemented for question generation and scoring
- File parsing is simulated with setTimeout for demo purposes
- Local persistence uses redux-persist with localStorage
- Timer functionality uses React hooks with useEffect cleanup
