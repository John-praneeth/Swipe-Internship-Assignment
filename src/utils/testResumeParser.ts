// Test file for resume parser functionality
import { extractCandidateInfo } from './resumeParser';

// Sample resume text for testing
const sampleResumeText = `
John Doe
Software Engineer
Email: john.doe@example.com
Phone: (555) 123-4567

EXPERIENCE
Software Engineer - Tech Corp - 2022-2024
• Developed web applications using React and Node.js
• Implemented REST APIs and database solutions
• Collaborated with cross-functional teams

PROJECTS
E-commerce Platform
Built a full-stack e-commerce application with React, Node.js, and MongoDB
Technologies: React, Node.js, MongoDB, Express, JWT

Task Management App
Created a task management application with real-time updates
Technologies: React, Socket.io, PostgreSQL, Docker

SKILLS
JavaScript, TypeScript, React, Node.js, Python, SQL, MongoDB, PostgreSQL, Docker, AWS

EDUCATION
Bachelor of Science in Computer Science - University of Technology - 2018-2022
GPA: 3.8/4.0
`;

// Test the parser
export const testResumeParser = () => {
  console.log('Testing resume parser...');
  
  try {
    const result = extractCandidateInfo(sampleResumeText);
    
    console.log('Parsed candidate info:', {
      name: result.name,
      email: result.email,
      phone: result.phone,
      projectCount: result.projects.length,
      skillCount: result.skills.length,
      experienceCount: result.experience.length,
      educationCount: result.education.length
    });
    
    console.log('Projects:', result.projects);
    console.log('Skills:', result.skills);
    console.log('Experience:', result.experience);
    console.log('Education:', result.education);
    
    return result;
  } catch (error) {
    console.error('Resume parser test failed:', error);
    return null;
  }
};

// Run test if this file is executed directly
if (typeof window !== 'undefined') {
  // Browser environment - can be called manually
  (window as any).testResumeParser = testResumeParser;
}

export default testResumeParser;