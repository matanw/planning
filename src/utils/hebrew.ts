// Hebrew text detection and RTL support utilities

export interface HebrewTextOptions {
  isHebrew: boolean;
  direction: 'rtl' | 'ltr';
}

// Hebrew Unicode ranges
const HEBREW_RANGES = [
  [0x0590, 0x05FF], // Hebrew
  [0xFB1D, 0xFB4F], // Hebrew Presentation Forms
];

// Arabic Unicode ranges (also RTL)
const ARABIC_RANGES = [
  [0x0600, 0x06FF], // Arabic
  [0x0750, 0x077F], // Arabic Supplement
  [0x08A0, 0x08FF], // Arabic Extended-A
  [0xFB50, 0xFDFF], // Arabic Presentation Forms-A
  [0xFE70, 0xFEFF], // Arabic Presentation Forms-B
];

/**
 * Detects if text contains Hebrew characters
 */
export function isHebrewText(text: string): boolean {
  if (!text) return false;
  
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    
    // Check Hebrew ranges
    for (const [start, end] of HEBREW_RANGES) {
      if (charCode >= start && charCode <= end) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Detects if text contains RTL characters (Hebrew, Arabic, etc.)
 */
export function isRTLText(text: string): boolean {
  if (!text) return false;
  
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    
    // Check Hebrew ranges
    for (const [start, end] of HEBREW_RANGES) {
      if (charCode >= start && charCode <= end) {
        return true;
      }
    }
    
    // Check Arabic ranges
    for (const [start, end] of ARABIC_RANGES) {
      if (charCode >= start && charCode <= end) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Analyzes text and returns Hebrew/RTL options
 */
export function analyzeText(text: string): HebrewTextOptions {
  const isHebrew = isHebrewText(text);
  const isRTL = isRTLText(text);
  
  return {
    isHebrew,
    direction: isRTL ? 'rtl' : 'ltr'
  };
}

/**
 * Gets CSS classes for Hebrew/RTL text
 */
export function getHebrewClasses(text: string): string {
  const analysis = analyzeText(text);
  
  if (analysis.isHebrew) {
    return 'hebrew';
  }
  
  return '';
}

/**
 * Gets CSS direction style for text
 */
export function getDirectionStyle(text: string): React.CSSProperties {
  const analysis = analyzeText(text);
  
  return {
    direction: analysis.direction,
    textAlign: analysis.direction === 'rtl' ? 'right' : 'left'
  };
}

/**
 * Formats text for display with proper direction
 */
export function formatTextForDisplay(text: string): {
  text: string;
  className: string;
  style: React.CSSProperties;
} {
  const analysis = analyzeText(text);
  
  return {
    text,
    className: analysis.isHebrew ? 'hebrew' : '',
    style: {
      direction: analysis.direction,
      textAlign: analysis.direction === 'rtl' ? 'right' : 'left'
    }
  };
}

/**
 * Checks if a task title or description contains Hebrew text
 */
export function taskContainsHebrew(task: { title: string; description?: string }): boolean {
  return isHebrewText(task.title) || (task.description ? isHebrewText(task.description) : false);
}

/**
 * Gets the primary direction for a task based on its content
 */
export function getTaskDirection(task: { title: string; description?: string }): 'rtl' | 'ltr' {
  const titleAnalysis = analyzeText(task.title);
  const descriptionAnalysis = task.description ? analyzeText(task.description) : null;
  
  // If title is RTL, use RTL
  if (titleAnalysis.direction === 'rtl') {
    return 'rtl';
  }
  
  // If description is RTL, use RTL
  if (descriptionAnalysis && descriptionAnalysis.direction === 'rtl') {
    return 'rtl';
  }
  
  // Default to LTR
  return 'ltr';
}
