// Utility function to extract text from PDF files
export const extractTextFromPDF = async (file: File): Promise<string> => {
  try {
    console.log('Attempting to extract text from PDF:', file.name);
    
    // Test if pdf-parse can be imported
    let pdfParse;
    try {
      pdfParse = await import('pdf-parse');
      console.log('pdf-parse library loaded successfully');
    } catch (importError) {
      console.error('Failed to import pdf-parse:', importError);
      throw new Error('PDF parsing library is not available. Please ensure pdf-parse is installed.');
    }
    
    const arrayBuffer = await file.arrayBuffer();
    
    console.log('PDF file size:', arrayBuffer.byteLength, 'bytes');
    
    // Create buffer - handle both Node.js and browser environments
    let buffer: Buffer;
    if (typeof Buffer !== 'undefined') {
      buffer = Buffer.from(arrayBuffer);
    } else {
      // Fallback for environments without Buffer
      const uint8Array = new Uint8Array(arrayBuffer);
      buffer = uint8Array as any;
    }
    
    const data = await pdfParse.default(buffer);
    
    console.log('Extracted PDF text length:', data.text.length);
    
    return data.text;
  } catch (error) {
    console.error('Error extracting PDF text:', error);
    throw new Error(`Failed to extract text from PDF file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Utility function to extract text from DOCX files
export const extractTextFromDOCX = async (file: File): Promise<string> => {
  try {
    console.log('Attempting to extract text from DOCX:', file.name);
    
    // Test if mammoth can be imported
    let mammoth;
    try {
      mammoth = await import('mammoth');
      console.log('mammoth library loaded successfully');
    } catch (importError) {
      console.error('Failed to import mammoth:', importError);
      throw new Error('DOCX parsing library is not available. Please ensure mammoth is installed.');
    }
    
    const arrayBuffer = await file.arrayBuffer();
    
    console.log('DOCX file size:', arrayBuffer.byteLength, 'bytes');
    
    const result = await mammoth.extractRawText({ arrayBuffer });
    
    console.log('Extracted DOCX text length:', result.value.length);
    
    return result.value;
  } catch (error) {
    console.error('Error extracting DOCX text:', error);
    throw new Error(`Failed to extract text from DOCX file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Parse resume data from file
export const parseResumeData = async (file: File): Promise<{ name: string; email: string; phone: string }> => {
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
      if (isValidPDF) {
        extractedText = await extractTextFromPDF(file);
      } else if (isValidDOCX) {
        extractedText = await extractTextFromDOCX(file);
      }
    } catch (extractionError) {
      console.warn('Text extraction failed, will prompt user for manual input:', extractionError);
      // Instead of failing, we'll return empty data and let the user input manually
      return {
        name: '',
        email: '',
        phone: ''
      };
    }
    
    if (!extractedText || extractedText.trim().length === 0) {
      console.warn('No text extracted from file, will prompt user for manual input');
      // Return empty data to trigger manual input flow
      return {
        name: '',
        email: '',
        phone: ''
      };
    }
    
    console.log('Extracted text length:', extractedText.length);
    console.log('Extracted text preview:', extractedText.substring(0, 300) + '...');
    
    const candidateInfo = extractCandidateInfo(extractedText);
    
    console.log('Extracted candidate info:', candidateInfo);
    
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

// Extract candidate information from resume text
export const extractCandidateInfo = (resumeText: string): { name: string; email: string; phone: string } => {
  const lines = resumeText.split('\n').map(line => line.trim()).filter(line => line);
  
  let name = '';
  let email = '';
  let phone = '';
  
  // Enhanced email extraction - multiple patterns
  const emailPatterns = [
    /[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}/g,
    /email\s*:?\s*([\w.-]+@[\w.-]+\.[a-zA-Z]{2,})/gi,
    /e-mail\s*:?\s*([\w.-]+@[\w.-]+\.[a-zA-Z]{2,})/gi,
    /mail\s*:?\s*([\w.-]+@[\w.-]+\.[a-zA-Z]{2,})/gi
  ];
  
  for (const pattern of emailPatterns) {
    const matches = resumeText.match(pattern);
    if (matches) {
      // Get the first valid email
      for (const match of matches) {
        const cleanEmail = match.replace(/^(email|e-mail|mail)\s*:?\s*/gi, '').trim();
        if (isValidEmail(cleanEmail)) {
          email = cleanEmail;
          break;
        }
      }
      if (email) break;
    }
  }
  
  // Enhanced phone number extraction - multiple patterns
  const phonePatterns = [
    // US formats
    /\+?1?[-.\s]?\(?(\d{3})\)?[-.\s]?(\d{3})[-.\s]?(\d{4})/g,
    // International formats
    /\+\d{1,3}[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}/g,
    // With labels
    /(?:phone|mobile|cell|tel|telephone)\s*:?\s*\+?[\d\s\-\(\)\.]{10,}/gi,
    // Simple 10+ digit numbers
    /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g
  ];
  
  for (const pattern of phonePatterns) {
    const matches = resumeText.match(pattern);
    if (matches) {
      for (const match of matches) {
        const cleanPhone = match.replace(/^(phone|mobile|cell|tel|telephone)\s*:?\s*/gi, '').trim();
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
  
  return { name, email, phone };
};

// Advanced name extraction function
const extractName = (lines: string[], fullText: string): string => {
  const skipWords = [
    'resume', 'cv', 'curriculum', 'vitae', 'profile', 'summary', 'objective',
    'experience', 'education', 'skills', 'contact', 'address', 'phone', 'email',
    'linkedin', 'github', 'portfolio', 'website', 'professional', 'senior',
    'junior', 'lead', 'manager', 'developer', 'engineer', 'analyst', 'specialist',
    'coordinator', 'director', 'consultant', 'intern', 'associate', 'assistant'
  ];
  
  // Strategy 1: Look for name patterns at the beginning
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i];
    if (!line) continue;
    
    const lowerLine = line.toLowerCase();
    
    // Skip lines with common resume keywords
    if (skipWords.some(word => lowerLine.includes(word))) continue;
    
    // Skip lines with email or phone
    if (line.includes('@') || /\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/.test(line)) continue;
    
    // Skip lines that are too long (likely job titles or descriptions)
    if (line.length > 50) continue;
    
    // Skip lines with special characters (likely not names)
    if (/[<>{}[\]\\|`~]/.test(line)) continue;
    
    // Check if it looks like a name (2-4 words, proper case)
    const words = line.split(/\s+/).filter(word => word.length > 1);
    if (words.length >= 2 && words.length <= 4) {
      // Check if words start with uppercase (name-like)
      const namePattern = /^[A-Z][a-z]+(\s+[A-Z][a-z]+)*$/;
      if (namePattern.test(line) || words.every(word => /^[A-Z][a-zA-Z]*$/.test(word))) {
        return line;
      }
    }
  }
  
  // Strategy 2: Look for "Name:" pattern
  const nameMatch = fullText.match(/(?:name|full\s*name)\s*:?\s*([A-Z][a-zA-Z\s]{2,40})/i);
  if (nameMatch && nameMatch[1]) {
    const extractedName = nameMatch[1].trim();
    if (extractedName.split(/\s+/).length >= 2) {
      return extractedName;
    }
  }
  
  // Strategy 3: Look for lines with only alphabetic characters and spaces
  for (const line of lines.slice(0, 10)) {
    if (line && 
        /^[A-Za-z\s]+$/.test(line) && 
        line.length > 3 && 
        line.length < 50 &&
        line.split(/\s+/).length >= 2 &&
        !skipWords.some(word => line.toLowerCase().includes(word))) {
      return line;
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