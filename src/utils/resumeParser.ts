// Utility function to extract text from PDF files using PDF.js
export const extractTextFromPDF = async (file: File): Promise<string> => {
  try {
    console.log('Attempting to extract text from PDF:', file.name);
    
    // Use PDF.js for browser-based PDF parsing
    let pdfjsLib;
    try {
      // Try to import pdfjs-dist for browser environment
      pdfjsLib = await import('pdfjs-dist');
      
      // Set worker source - use the correct version
      if (typeof window !== 'undefined') {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.js`;
      }
      
      console.log('PDF.js library loaded successfully');
    } catch (importError) {
      console.error('Failed to import PDF.js:', importError);
      // Fallback to simple text extraction
      return await extractTextFromPDFSimple(file);
    }
    
    const arrayBuffer = await file.arrayBuffer();
    console.log('PDF file size:', arrayBuffer.byteLength, 'bytes');
    
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    console.log('PDF loaded, pages:', pdf.numPages);
    
    let fullText = '';
    
    // Extract text from all pages
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      
      fullText += pageText + '\n';
    }
    
    console.log('Extracted PDF text length:', fullText.length);
    return fullText;
    
  } catch (error) {
    console.error('Error extracting PDF text with PDF.js:', error);
    // Fallback to simple extraction
    return await extractTextFromPDFSimple(file);
  }
};

// Simple fallback PDF text extraction
const extractTextFromPDFSimple = async (file: File): Promise<string> => {
  try {
    console.log('Using simple PDF extraction fallback');
    
    // This is a very basic approach - in production you'd want a proper PDF parser
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Look for text streams in PDF
    let text = '';
    let inTextStream = false;
    let currentWord = '';
    
    for (let i = 0; i < uint8Array.length - 1; i++) {
      const char = String.fromCharCode(uint8Array[i]);
      const nextChar = String.fromCharCode(uint8Array[i + 1]);
      
      // Look for text stream markers
      if (char === 'B' && nextChar === 'T') {
        inTextStream = true;
        continue;
      }
      if (char === 'E' && nextChar === 'T') {
        inTextStream = false;
        if (currentWord.trim()) {
          text += currentWord + ' ';
          currentWord = '';
        }
        continue;
      }
      
      // Extract readable characters
      if (inTextStream || char.match(/[a-zA-Z0-9@.\-\s()]/)) {
        if (char.match(/[a-zA-Z0-9@.\-]/)) {
          currentWord += char;
        } else if (char === ' ' || char === '\n' || char === '\r') {
          if (currentWord.trim()) {
            text += currentWord + ' ';
            currentWord = '';
          }
        }
      }
    }
    
    // Add any remaining word
    if (currentWord.trim()) {
      text += currentWord;
    }
    
    // Clean up the extracted text
    text = text
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s@.\-()]/g, ' ')
      .trim();
    
    console.log('Simple PDF extraction completed, text length:', text.length);
    
    // If we got very little text, it might be a scanned PDF
    if (text.length < 50) {
      console.warn('Very little text extracted, might be a scanned PDF');
      throw new Error('This appears to be a scanned PDF. Please use a text-based PDF or provide information manually.');
    }
    
    return text;
  } catch (error) {
    console.error('Simple PDF extraction failed:', error);
    throw new Error(`Unable to extract text from PDF file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Utility function to extract text from DOCX files
export const extractTextFromDOCX = async (file: File): Promise<string> => {
  try {
    console.log('Attempting to extract text from DOCX:', file.name);
    
    // Simple DOCX text extraction using JSZip
    let JSZip;
    try {
      JSZip = (await import('jszip')).default;
      console.log('JSZip library loaded successfully');
    } catch (importError) {
      console.error('Failed to import JSZip:', importError);
      throw new Error('DOCX parsing requires JSZip library');
    }
    
    const arrayBuffer = await file.arrayBuffer();
    console.log('DOCX file size:', arrayBuffer.byteLength, 'bytes');
    
    const zip = await JSZip.loadAsync(arrayBuffer);
    const documentXml = await zip.file('word/document.xml')?.async('string');
    
    if (!documentXml) {
      throw new Error('Invalid DOCX file structure');
    }
    
    // Extract text from XML using regex (basic approach)
    const textMatches = documentXml.match(/<w:t[^>]*>([^<]*)<\/w:t>/g);
    let extractedText = '';
    
    if (textMatches) {
      extractedText = textMatches
        .map(match => match.replace(/<[^>]*>/g, ''))
        .join(' ');
    }
    
    // Clean up the text
    extractedText = extractedText
      .replace(/\s+/g, ' ')
      .trim();
    
    console.log('Extracted DOCX text length:', extractedText.length);
    return extractedText;
    
  } catch (error) {
    console.error('Error extracting DOCX text:', error);
    throw new Error(`Failed to extract text from DOCX file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Parse resume data from file - optimized with caching and better error handling
const parseCache = new Map<string, CandidateInfo>();

export const parseResumeData = async (file: File): Promise<CandidateInfo> => {
  // Create cache key based on file properties
  const cacheKey = `${file.name}-${file.size}-${file.lastModified}`;
  
  // Check cache first
  if (parseCache.has(cacheKey)) {
    console.log('Using cached resume data for:', file.name);
    return parseCache.get(cacheKey)!;
  }
  
  try {
    console.log('Starting resume parsing for file:', file.name, 'Size:', file.size, 'Type:', file.type);
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('File size too large. Please upload a file smaller than 10MB.');
    }
    
    // Validate file type more strictly
    const isValidPDF = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const isValidDOCX = file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.name.toLowerCase().endsWith('.docx');
    
    if (!isValidPDF && !isValidDOCX) {
      throw new Error('Unsupported file format. Please upload a PDF or DOCX file.');
    }
    
    let extractedText = '';
    
    try {
      // Use Promise.race to add timeout for large files
      const extractionPromise = isValidPDF ? 
        extractTextFromPDF(file) : 
        extractTextFromDOCX(file);
      
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('File processing timeout')), 15000); // 15 second timeout
      });
      
      extractedText = await Promise.race([extractionPromise, timeoutPromise]);
    } catch (extractionError) {
      console.warn('Text extraction failed, will prompt user for manual input:', extractionError);
      // Instead of failing, we'll return empty data and let the user input manually
      const emptyResult: CandidateInfo = { 
        name: '', 
        email: '', 
        phone: '', 
        projects: [], 
        skills: [], 
        experience: [], 
        education: [] 
      };
      parseCache.set(cacheKey, emptyResult);
      return emptyResult;
    }
    
    if (!extractedText || extractedText.trim().length === 0) {
      console.warn('No text extracted from file, will prompt user for manual input');
      // Return empty data to trigger manual input flow
      const emptyResult: CandidateInfo = { 
        name: '', 
        email: '', 
        phone: '', 
        projects: [], 
        skills: [], 
        experience: [], 
        education: [] 
      };
      parseCache.set(cacheKey, emptyResult);
      return emptyResult;
    }
    
    console.log('Extracted text length:', extractedText.length);
    
    const candidateInfo = extractCandidateInfo(extractedText);
    
    console.log('Extracted candidate info:', candidateInfo);
    
    // Cache the result
    parseCache.set(cacheKey, candidateInfo);
    
    // Clean up cache if it gets too large (keep last 50 entries)
    if (parseCache.size > 50) {
      const firstKey = parseCache.keys().next().value;
      if (firstKey) {
        parseCache.delete(firstKey);
      }
    }
    
    return candidateInfo;
  } catch (error) {
    console.error('Error parsing resume:', error);
    
    // Re-throw with more context
    if (error instanceof Error) {
      throw new Error(`Resume parsing failed: ${error.message}`);
    } else {
      throw new Error('Resume parsing failed due to an unknown error. Please try again or contact support.');
    }
  }
};

// Enhanced candidate information interface
export interface CandidateInfo {
  name: string;
  email: string;
  phone: string;
  projects: ProjectInfo[];
  skills: string[];
  experience: ExperienceInfo[];
  education: EducationInfo[];
}

export interface ProjectInfo {
  title: string;
  description: string;
  technologies: string[];
  duration?: string;
  url?: string;
}

export interface ExperienceInfo {
  company: string;
  position: string;
  duration: string;
  description: string;
}

export interface EducationInfo {
  institution: string;
  degree: string;
  duration: string;
  gpa?: string;
}

// Extract comprehensive candidate information from resume text
export const extractCandidateInfo = (resumeText: string): CandidateInfo => {
  const lines = resumeText.split('\n').map(line => line.trim()).filter(line => line);
  
  let name = '';
  let email = '';
  let phone = '';
  
  // Enhanced email extraction with better patterns
  const emailPatterns = [
    // Standard email pattern
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    // Email with labels
    /(?:email|e-mail|mail|contact)\s*:?\s*([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,})/gi,
    // Email in parentheses or brackets
    /[\(\[]([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,})[\)\]]/g
  ];
  
  for (const pattern of emailPatterns) {
    const matches = resumeText.match(pattern);
    if (matches) {
      for (const match of matches) {
        let cleanEmail = match.replace(/^(email|e-mail|mail|contact)\s*:?\s*/gi, '').trim();
        cleanEmail = cleanEmail.replace(/[\(\)\[\]]/g, ''); // Remove brackets
        if (isValidEmail(cleanEmail)) {
          email = cleanEmail;
          break;
        }
      }
      if (email) break;
    }
  }
  
  // Enhanced phone number extraction with better patterns
  const phonePatterns = [
    // US formats with country code
    /\+?1[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g,
    // Standard US format
    /\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g,
    // International formats
    /\+[0-9]{1,3}[-.\s]?[0-9]{1,4}[-.\s]?[0-9]{1,4}[-.\s]?[0-9]{1,9}/g,
    // With labels
    /(?:phone|mobile|cell|tel|telephone|contact|number)\s*:?\s*(\+?[\d\s\-\(\)\.]{10,})/gi,
    // Dot separated
    /\b\d{3}\.\d{3}\.\d{4}\b/g,
    // Dash separated
    /\b\d{3}-\d{3}-\d{4}\b/g
  ];
  
  for (const pattern of phonePatterns) {
    const matches = resumeText.match(pattern);
    if (matches) {
      for (const match of matches) {
        let cleanPhone = match.replace(/^(phone|mobile|cell|tel|telephone|contact|number)\s*:?\s*/gi, '').trim();
        // Clean up the phone number
        cleanPhone = cleanPhone.replace(/[^\d+\-\(\)\.\s]/g, '');
        if (isValidPhone(cleanPhone)) {
          phone = cleanPhone;
          break;
        }
      }
      if (phone) break;
    }
  }
  
  // Enhanced name extraction with multiple strategies
  name = extractName(lines, resumeText);
  
  // Extract projects, skills, experience, and education
  const projects = extractProjects(resumeText);
  const skills = extractSkills(resumeText);
  const experience = extractExperience(resumeText);
  const education = extractEducation(resumeText);
  
  return { name, email, phone, projects, skills, experience, education };
};

// Advanced name extraction function with improved accuracy
const extractName = (lines: string[], fullText: string): string => {
  const skipWords = [
    'resume', 'cv', 'curriculum', 'vitae', 'profile', 'summary', 'objective',
    'experience', 'education', 'skills', 'contact', 'address', 'phone', 'email',
    'linkedin', 'github', 'portfolio', 'website', 'professional', 'senior',
    'junior', 'lead', 'manager', 'developer', 'engineer', 'analyst', 'specialist',
    'coordinator', 'director', 'consultant', 'intern', 'associate', 'assistant',
    'software', 'web', 'full', 'stack', 'front', 'back', 'end', 'mobile', 'app',
    'data', 'science', 'machine', 'learning', 'artificial', 'intelligence'
  ];
  
  // Strategy 1: Look for explicit name labels
  const nameLabelPatterns = [
    /(?:name|full\s*name|candidate\s*name)\s*:?\s*([A-Z][a-zA-Z\s]{2,50})/i,
    /^([A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s*$/m, // First line name pattern
  ];
  
  for (const pattern of nameLabelPatterns) {
    const match = fullText.match(pattern);
    if (match && match[1]) {
      const extractedName = match[1].trim();
      const words = extractedName.split(/\s+/);
      if (words.length >= 2 && words.length <= 4 && 
          !skipWords.some(word => extractedName.toLowerCase().includes(word))) {
        return extractedName;
      }
    }
  }
  
  // Strategy 2: Look for name patterns at the beginning (improved)
  for (let i = 0; i < Math.min(8, lines.length); i++) {
    const line = lines[i];
    if (!line || line.length < 4) continue;
    
    const lowerLine = line.toLowerCase();
    
    // Skip lines with common resume keywords
    if (skipWords.some(word => lowerLine.includes(word))) continue;
    
    // Skip lines with email, phone, or URLs
    if (line.includes('@') || 
        /\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/.test(line) ||
        /https?:\/\//.test(line) ||
        /www\./.test(line)) continue;
    
    // Skip lines that are too long or too short
    if (line.length > 60 || line.length < 4) continue;
    
    // Skip lines with numbers or special characters (except spaces, hyphens, apostrophes)
    if (/[0-9<>{}[\]\\|`~@#$%^&*()+=]/.test(line)) continue;
    
    // Check if it looks like a name
    const words = line.split(/\s+/).filter(word => word.length > 1);
    if (words.length >= 2 && words.length <= 4) {
      // More flexible name pattern - allow for various capitalizations
      const isValidName = words.every(word => {
        // Allow names like McDonald, O'Connor, etc.
        return /^[A-Z][a-zA-Z''-]*$/.test(word) && word.length >= 2;
      });
      
      if (isValidName) {
        // Additional check: ensure it's not a job title or company
        const jobTitleWords = ['engineer', 'developer', 'manager', 'analyst', 'consultant', 
                              'director', 'specialist', 'coordinator', 'lead', 'senior', 'junior'];
        const hasJobTitle = words.some(word => 
          jobTitleWords.includes(word.toLowerCase())
        );
        
        if (!hasJobTitle) {
          return line;
        }
      }
    }
  }
  
  // Strategy 3: Look for contact section names
  const contactSectionMatch = fullText.match(/contact\s*(?:information|info|details)?\s*:?\s*([A-Z][a-zA-Z\s]{5,40})/i);
  if (contactSectionMatch && contactSectionMatch[1]) {
    const extractedName = contactSectionMatch[1].trim();
    const words = extractedName.split(/\s+/);
    if (words.length >= 2 && words.length <= 4) {
      return extractedName;
    }
  }
  
  // Strategy 4: Look for lines with only alphabetic characters and spaces (improved)
  for (const line of lines.slice(0, 15)) {
    if (line && 
        /^[A-Za-z\s'-]+$/.test(line) && 
        line.length >= 5 && 
        line.length <= 50) {
      
      const words = line.split(/\s+/);
      if (words.length >= 2 && words.length <= 4) {
        // Check if all words are capitalized properly
        const isProperlyCapitalized = words.every(word => 
          /^[A-Z][a-z''-]*$/.test(word)
        );
        
        // Check if it doesn't contain skip words
        const containsSkipWords = skipWords.some(word => 
          line.toLowerCase().includes(word)
        );
        
        if (isProperlyCapitalized && !containsSkipWords) {
          return line;
        }
      }
    }
  }
  
  return '';
};

// Format time display (MM:SS)
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Calculate time spent on a question
export const calculateTimeSpent = (timeLimit: number, remainingTime: number): number => {
  return timeLimit - remainingTime;
};

// Extract projects from resume text
const extractProjects = (resumeText: string): ProjectInfo[] => {
  const projects: ProjectInfo[] = [];
  const lines = resumeText.split('\n').map(line => line.trim()).filter(line => line);
  
  // Look for project sections
  const projectSectionPatterns = [
    /^(projects?|personal\s+projects?|academic\s+projects?|side\s+projects?)\s*:?\s*$/i,
    /^(portfolio|work\s+samples?|github\s+projects?)\s*:?\s*$/i
  ];
  
  let inProjectSection = false;
  let currentProject: Partial<ProjectInfo> = {};
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lowerLine = line.toLowerCase();
    
    // Check if we're entering a project section
    if (projectSectionPatterns.some(pattern => pattern.test(line))) {
      inProjectSection = true;
      continue;
    }
    
    // Check if we're leaving project section (entering another section)
    if (inProjectSection && /^(experience|education|skills|certifications?|awards?)\s*:?\s*$/i.test(line)) {
      inProjectSection = false;
      if (currentProject.title) {
        projects.push(currentProject as ProjectInfo);
        currentProject = {};
      }
      continue;
    }
    
    if (inProjectSection && line.length > 0) {
      // Project title patterns
      if (line.match(/^[A-Z][^:]*(?:\s*[-–—]\s*|\s*:\s*|$)/)) {
        // Save previous project if exists
        if (currentProject.title) {
          projects.push(currentProject as ProjectInfo);
        }
        
        // Start new project
        const titleMatch = line.match(/^([^:–—-]+)(?:\s*[-–—:]\s*(.*))?$/);
        if (titleMatch) {
          currentProject = {
            title: titleMatch[1].trim(),
            description: titleMatch[2] ? titleMatch[2].trim() : '',
            technologies: [],
          };
        }
      }
      // Technology patterns
      else if (lowerLine.includes('tech') || lowerLine.includes('stack') || lowerLine.includes('built with')) {
        const techMatch = line.match(/(?:tech|stack|built\s+with|technologies?|tools?)\s*:?\s*(.+)/i);
        if (techMatch && currentProject.title) {
          currentProject.technologies = extractTechnologies(techMatch[1]);
        }
      }
      // URL patterns
      else if (line.match(/https?:\/\/|github\.com|gitlab\.com/)) {
        if (currentProject.title) {
          currentProject.url = line.match(/(https?:\/\/[^\s]+)/)?.[1] || line;
        }
      }
      // Description continuation
      else if (currentProject.title && !line.match(/^[A-Z][^:]*:/)) {
        currentProject.description = currentProject.description 
          ? `${currentProject.description} ${line}`
          : line;
      }
    }
  }
  
  // Add last project if exists
  if (currentProject.title) {
    projects.push(currentProject as ProjectInfo);
  }
  
  return projects;
};

// Extract skills from resume text
const extractSkills = (resumeText: string): string[] => {
  const skills: string[] = [];
  const lines = resumeText.split('\n').map(line => line.trim()).filter(line => line);
  
  // Common skill section headers
  const skillSectionPatterns = [
    /^(skills?|technical\s+skills?|core\s+competencies|technologies?)\s*:?\s*$/i,
    /^(programming\s+languages?|languages?|tools?)\s*:?\s*$/i
  ];
  
  let inSkillSection = false;
  
  for (const line of lines) {
    // Check if we're entering a skill section
    if (skillSectionPatterns.some(pattern => pattern.test(line))) {
      inSkillSection = true;
      continue;
    }
    
    // Check if we're leaving skill section
    if (inSkillSection && /^(experience|education|projects?|certifications?)\s*:?\s*$/i.test(line)) {
      inSkillSection = false;
      continue;
    }
    
    if (inSkillSection && line.length > 0) {
      // Extract skills from the line
      const extractedSkills = extractTechnologies(line);
      skills.push(...extractedSkills);
    }
  }
  
  // Also extract skills from project technologies
  const projectTechs = extractProjects(resumeText)
    .flatMap(project => project.technologies);
  
  // Combine and deduplicate
  const allSkills = [...new Set([...skills, ...projectTechs])];
  
  return allSkills.filter(skill => skill.length > 1);
};

// Extract experience from resume text
const extractExperience = (resumeText: string): ExperienceInfo[] => {
  const experience: ExperienceInfo[] = [];
  const lines = resumeText.split('\n').map(line => line.trim()).filter(line => line);
  
  const experienceSectionPatterns = [
    /^(experience|work\s+experience|professional\s+experience|employment)\s*:?\s*$/i
  ];
  
  let inExperienceSection = false;
  let currentExp: Partial<ExperienceInfo> = {};
  
  for (const line of lines) {
    if (experienceSectionPatterns.some(pattern => pattern.test(line))) {
      inExperienceSection = true;
      continue;
    }
    
    if (inExperienceSection && /^(education|projects?|skills?|certifications?)\s*:?\s*$/i.test(line)) {
      inExperienceSection = false;
      if (currentExp.company && currentExp.position) {
        experience.push(currentExp as ExperienceInfo);
        currentExp = {};
      }
      continue;
    }
    
    if (inExperienceSection && line.length > 0) {
      // Company and position pattern
      const companyPositionMatch = line.match(/^(.+?)\s*[-–—|]\s*(.+?)(?:\s*[-–—|]\s*(.+))?$/);
      if (companyPositionMatch) {
        if (currentExp.company) {
          experience.push(currentExp as ExperienceInfo);
        }
        currentExp = {
          company: companyPositionMatch[1].trim(),
          position: companyPositionMatch[2].trim(),
          duration: companyPositionMatch[3] ? companyPositionMatch[3].trim() : '',
          description: ''
        };
      }
      // Duration pattern
      else if (line.match(/\d{4}|\d{1,2}\/\d{4}|present|current/i)) {
        if (currentExp.company && !currentExp.duration) {
          currentExp.duration = line;
        }
      }
      // Description
      else if (currentExp.company && line.startsWith('•') || line.startsWith('-')) {
        currentExp.description = currentExp.description 
          ? `${currentExp.description} ${line}`
          : line;
      }
    }
  }
  
  if (currentExp.company && currentExp.position) {
    experience.push(currentExp as ExperienceInfo);
  }
  
  return experience;
};

// Extract education from resume text
const extractEducation = (resumeText: string): EducationInfo[] => {
  const education: EducationInfo[] = [];
  const lines = resumeText.split('\n').map(line => line.trim()).filter(line => line);
  
  const educationSectionPatterns = [
    /^(education|academic\s+background|qualifications?)\s*:?\s*$/i
  ];
  
  let inEducationSection = false;
  let currentEdu: Partial<EducationInfo> = {};
  
  for (const line of lines) {
    if (educationSectionPatterns.some(pattern => pattern.test(line))) {
      inEducationSection = true;
      continue;
    }
    
    if (inEducationSection && /^(experience|projects?|skills?|certifications?)\s*:?\s*$/i.test(line)) {
      inEducationSection = false;
      if (currentEdu.institution && currentEdu.degree) {
        education.push(currentEdu as EducationInfo);
        currentEdu = {};
      }
      continue;
    }
    
    if (inEducationSection && line.length > 0) {
      // Institution and degree pattern
      const eduMatch = line.match(/^(.+?)\s*[-–—|]\s*(.+?)(?:\s*[-–—|]\s*(.+))?$/);
      if (eduMatch) {
        if (currentEdu.institution) {
          education.push(currentEdu as EducationInfo);
        }
        currentEdu = {
          institution: eduMatch[1].trim(),
          degree: eduMatch[2].trim(),
          duration: eduMatch[3] ? eduMatch[3].trim() : ''
        };
      }
      // GPA pattern
      else if (line.match(/gpa|grade/i)) {
        const gpaMatch = line.match(/(\d+\.\d+|\d+\/\d+)/);
        if (gpaMatch && currentEdu.institution) {
          currentEdu.gpa = gpaMatch[1];
        }
      }
    }
  }
  
  if (currentEdu.institution && currentEdu.degree) {
    education.push(currentEdu as EducationInfo);
  }
  
  return education;
};

// Extract technologies from a text line
const extractTechnologies = (text: string): string[] => {
  const commonTechs = [
    // Programming Languages
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'PHP', 'Ruby', 'Swift', 'Kotlin',
    // Web Technologies
    'React', 'Vue', 'Angular', 'Node.js', 'Express', 'Next.js', 'Nuxt.js', 'HTML', 'CSS', 'SASS', 'SCSS',
    // Databases
    'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'SQLite', 'Oracle', 'SQL Server',
    // Cloud & DevOps
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Jenkins', 'Git', 'GitHub', 'GitLab',
    // Mobile
    'React Native', 'Flutter', 'iOS', 'Android',
    // Other
    'GraphQL', 'REST', 'API', 'Microservices', 'Machine Learning', 'AI', 'TensorFlow', 'PyTorch'
  ];
  
  const foundTechs: string[] = [];
  
  // Split by common separators
  const parts = text.split(/[,;|•\-\n\r]+/).map(part => part.trim());
  
  for (const part of parts) {
    // Check against common technologies (case insensitive)
    for (const tech of commonTechs) {
      if (part.toLowerCase().includes(tech.toLowerCase())) {
        foundTechs.push(tech);
      }
    }
    
    // Also add the part itself if it looks like a technology
    if (part.length > 1 && part.length < 20 && 
        !part.match(/^(and|or|with|using|including|such as|like)$/i)) {
      foundTechs.push(part);
    }
  }
  
  return [...new Set(foundTechs)]; // Remove duplicates
};

// Check if candidate information is complete
export const isInfoComplete = (candidate: { name: string; email: string; phone: string }): boolean => {
  return !!(candidate.name && candidate.email && candidate.phone);
};

// Generate missing info message
export const getMissingInfoMessage = (candidate: { name: string; email: string; phone: string }): string => {
  const missing = [];
  if (!candidate.name) missing.push('name');
  if (!candidate.email) missing.push('email');
  if (!candidate.phone) missing.push('phone number');
  
  if (missing.length === 1) {
    return `I need your ${missing[0]} to continue. Please provide it:`;
  } else if (missing.length === 2) {
    return `I need your ${missing[0]} and ${missing[1]} to continue. Please provide your ${missing[0]}:`;
  } else {
    return `I need your ${missing.join(', ')} to continue. Please provide your ${missing[0]}:`;
  }
};

// Validate email format
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone format
export const isValidPhone = (phone: string): boolean => {
  if (!phone || typeof phone !== 'string') return false;
  
  // Remove all non-digit characters except + at the beginning
  const cleanPhone = phone.replace(/[^\d+]/g, '');
  
  // Check various phone number patterns
  const phonePatterns = [
    /^\+?1?[2-9]\d{2}[2-9]\d{2}\d{4}$/,  // US format: +1234567890 or 2345678901
    /^\+?[1-9]\d{7,14}$/,                 // International format: 7-15 digits
    /^\d{10}$/,                           // Simple 10 digit
    /^\d{11}$/,                           // 11 digit (with country code)
  ];
  
  // Must have at least 10 digits
  const digitCount = cleanPhone.replace(/^\+/, '').length;
  if (digitCount < 10 || digitCount > 15) return false;
  
  // Check against patterns
  return phonePatterns.some(pattern => pattern.test(cleanPhone));
};