/**
 * Accessibility Audit System
 * Comprehensive WCAG 2.1 AA compliance checking
 */

export interface AccessibilityIssue {
  id: string;
  severity: 'error' | 'warning' | 'info';
  category: 'keyboard' | 'screen-reader' | 'visual' | 'cognitive' | 'motor';
  wcagLevel: 'A' | 'AA' | 'AAA';
  description: string;
  element?: HTMLElement;
  fix?: string;
  automated: boolean;
}

export interface AccessibilityReport {
  score: number;
  issues: AccessibilityIssue[];
  passed: number;
  failed: number;
  warnings: number;
  recommendations: string[];
}

export class AccessibilityAuditor {
  private issues: AccessibilityIssue[] = [];

  /**
   * Run comprehensive accessibility audit
   */
  audit(): AccessibilityReport {
    this.issues = [];
    
    this.checkImages();
    this.checkHeadings();
    this.checkLinks();
    this.checkForms();
    this.checkButtons();
    this.checkColorContrast();
    this.checkKeyboardNavigation();
    this.checkFocusManagement();
    this.checkARIALabels();
    this.checkSemanticHTML();
    this.checkTextAlternatives();
    this.checkLanguage();
    this.checkSkipLinks();

    return this.generateReport();
  }

  private checkImages() {
    const images = document.querySelectorAll('img');
    
    images.forEach((img) => {
      // Check for missing alt text
      if (!img.alt && !img.getAttribute('aria-label')) {
        this.addIssue({
          id: 'missing-alt-text',
          severity: 'error',
          category: 'screen-reader',
          wcagLevel: 'A',
          description: 'Image missing alt text',
          element: img,
          fix: 'Add alt attribute or aria-label',
          automated: true,
        });
      }

      // Check for decorative images
      if (img.alt === '' && !img.getAttribute('role')) {
        this.addIssue({
          id: 'decorative-image',
          severity: 'warning',
          category: 'screen-reader',
          wcagLevel: 'A',
          description: 'Decorative image should have role="presentation"',
          element: img,
          fix: 'Add role="presentation" to decorative images',
          automated: true,
        });
      }
    });
  }

  private checkHeadings() {
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const headingLevels: number[] = [];

    headings.forEach((heading) => {
      const level = parseInt(heading.tagName.charAt(1));
      headingLevels.push(level);

      // Check for empty headings
      if (!heading.textContent?.trim()) {
        this.addIssue({
          id: 'empty-heading',
          severity: 'error',
          category: 'screen-reader',
          wcagLevel: 'A',
          description: 'Empty heading element',
          element: heading,
          fix: 'Add content to heading or remove if not needed',
          automated: true,
        });
      }
    });

    // Check heading hierarchy
    for (let i = 1; i < headingLevels.length; i++) {
      if (headingLevels[i] > headingLevels[i - 1] + 1) {
        this.addIssue({
          id: 'heading-hierarchy',
          severity: 'warning',
          category: 'screen-reader',
          wcagLevel: 'AA',
          description: 'Heading hierarchy skipped levels',
          fix: 'Use proper heading hierarchy (h1 -> h2 -> h3, etc.)',
          automated: true,
        });
        break;
      }
    }
  }

  private checkLinks() {
    const links = document.querySelectorAll('a');
    
    links.forEach((link) => {
      // Check for empty links
      if (!link.textContent?.trim() && !link.querySelector('img')) {
        this.addIssue({
          id: 'empty-link',
          severity: 'error',
          category: 'screen-reader',
          wcagLevel: 'A',
          description: 'Link has no accessible text',
          element: link,
          fix: 'Add text content or aria-label to link',
          automated: true,
        });
      }

      // Check for links that open in new window
      if (link.target === '_blank' && !link.getAttribute('aria-label')?.includes('opens in new window')) {
        this.addIssue({
          id: 'new-window-link',
          severity: 'warning',
          category: 'screen-reader',
          wcagLevel: 'AA',
          description: 'Link opens in new window without warning',
          element: link,
          fix: 'Add aria-label indicating link opens in new window',
          automated: true,
        });
      }
    });
  }

  private checkForms() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach((form) => {
      const inputs = form.querySelectorAll('input, textarea, select');
      
      inputs.forEach((input) => {
        const inputElement = input as HTMLInputElement;
        
        // Check for missing labels
        if (!inputElement.labels?.length && !inputElement.getAttribute('aria-label')) {
          this.addIssue({
            id: 'missing-label',
            severity: 'error',
            category: 'screen-reader',
            wcagLevel: 'A',
            description: 'Form input missing label',
            element: inputElement,
            fix: 'Add label element or aria-label attribute',
            automated: true,
          });
        }

        // Check for required fields
        if (inputElement.required && !inputElement.getAttribute('aria-required')) {
          this.addIssue({
            id: 'required-field',
            severity: 'warning',
            category: 'screen-reader',
            wcagLevel: 'A',
            description: 'Required field should have aria-required="true"',
            element: inputElement,
            fix: 'Add aria-required="true" to required fields',
            automated: true,
          });
        }
      });
    });
  }

  private checkButtons() {
    const buttons = document.querySelectorAll('button, [role="button"]');
    
    buttons.forEach((button) => {
      // Check for empty buttons
      if (!button.textContent?.trim() && !button.querySelector('img, svg')) {
        this.addIssue({
          id: 'empty-button',
          severity: 'error',
          category: 'screen-reader',
          wcagLevel: 'A',
          description: 'Button has no accessible text',
          element: button,
          fix: 'Add text content or aria-label to button',
          automated: true,
        });
      }
    });
  }

  private checkColorContrast() {
    // This is a simplified check - in a real implementation,
    // you'd use a library like color-contrast-checker
    const textElements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6');
    
    textElements.forEach((element) => {
      const styles = window.getComputedStyle(element);
      const color = styles.color;
      const backgroundColor = styles.backgroundColor;
      
      // Check if colors are defined
      if (color === 'rgba(0, 0, 0, 0)' || backgroundColor === 'rgba(0, 0, 0, 0)') {
        this.addIssue({
          id: 'color-contrast',
          severity: 'warning',
          category: 'visual',
          wcagLevel: 'AA',
          description: 'Text color or background color not defined',
          element: element as HTMLElement,
          fix: 'Ensure sufficient color contrast ratio (4.5:1 for normal text)',
          automated: false,
        });
      }
    });
  }

  private checkKeyboardNavigation() {
    const interactiveElements = document.querySelectorAll('a, button, input, select, textarea, [tabindex]');
    
    interactiveElements.forEach((element) => {
      const tabIndex = element.getAttribute('tabindex');
      
      // Check for invalid tabindex values
      if (tabIndex && (isNaN(Number(tabIndex)) || Number(tabIndex) > 0)) {
        this.addIssue({
          id: 'invalid-tabindex',
          severity: 'warning',
          category: 'keyboard',
          wcagLevel: 'A',
          description: 'Tabindex should be 0 or -1 for proper keyboard navigation',
          element: element as HTMLElement,
          fix: 'Use tabindex="0" for focusable elements or tabindex="-1" for programmatically focusable',
          automated: true,
        });
      }
    });
  }

  private checkFocusManagement() {
    // Check for focus traps in modals
    const modals = document.querySelectorAll('[role="dialog"], [role="alertdialog"]');
    
    modals.forEach((modal) => {
      const focusableElements = modal.querySelectorAll('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
      
      if (focusableElements.length === 0) {
        this.addIssue({
          id: 'modal-focus-trap',
          severity: 'error',
          category: 'keyboard',
          wcagLevel: 'A',
          description: 'Modal dialog has no focusable elements',
          element: modal as HTMLElement,
          fix: 'Add focusable elements or implement focus trap',
          automated: true,
        });
      }
    });
  }

  private checkARIALabels() {
    const ariaElements = document.querySelectorAll('[aria-label], [aria-labelledby], [aria-describedby]');
    
    ariaElements.forEach((element) => {
      const ariaLabel = element.getAttribute('aria-label');
      const ariaLabelledBy = element.getAttribute('aria-labelledby');
      const ariaDescribedBy = element.getAttribute('aria-describedby');
      
      // Check for empty aria-label
      if (ariaLabel && !ariaLabel.trim()) {
        this.addIssue({
          id: 'empty-aria-label',
          severity: 'error',
          category: 'screen-reader',
          wcagLevel: 'A',
          description: 'Empty aria-label attribute',
          element: element as HTMLElement,
          fix: 'Remove empty aria-label or provide meaningful text',
          automated: true,
        });
      }

      // Check for invalid aria-labelledby reference
      if (ariaLabelledBy) {
        const referencedElement = document.getElementById(ariaLabelledBy);
        if (!referencedElement) {
          this.addIssue({
            id: 'invalid-aria-labelledby',
            severity: 'error',
            category: 'screen-reader',
            wcagLevel: 'A',
            description: 'aria-labelledby references non-existent element',
            element: element as HTMLElement,
            fix: 'Ensure referenced element exists and has an id',
            automated: true,
          });
        }
      }
    });
  }

  private checkSemanticHTML() {
    // Check for proper use of semantic elements
    const divs = document.querySelectorAll('div');
    
    divs.forEach((div) => {
      // Check if div should be a button
      if (div.onclick || div.getAttribute('role') === 'button') {
        this.addIssue({
          id: 'div-as-button',
          severity: 'warning',
          category: 'screen-reader',
          wcagLevel: 'A',
          description: 'Div used as button should be a button element',
          element: div,
          fix: 'Use button element instead of div for interactive elements',
          automated: true,
        });
      }
    });
  }

  private checkTextAlternatives() {
    const mediaElements = document.querySelectorAll('video, audio');
    
    mediaElements.forEach((media) => {
      // Check for missing captions/subtitles
      if (media.tagName === 'VIDEO' && !media.querySelector('track[kind="captions"]')) {
        this.addIssue({
          id: 'missing-captions',
          severity: 'warning',
          category: 'screen-reader',
          wcagLevel: 'A',
          description: 'Video missing captions',
          element: media as HTMLElement,
          fix: 'Add captions track to video element',
          automated: true,
        });
      }
    });
  }

  private checkLanguage() {
    const html = document.documentElement;
    const lang = html.getAttribute('lang');
    
    if (!lang) {
      this.addIssue({
        id: 'missing-lang',
        severity: 'error',
        category: 'screen-reader',
        wcagLevel: 'A',
        description: 'HTML element missing lang attribute',
        element: html,
        fix: 'Add lang attribute to html element',
        automated: true,
      });
    }
  }

  private checkSkipLinks() {
    const skipLinks = document.querySelectorAll('a[href^="#"]');
    const hasSkipLink = Array.from(skipLinks).some(link => 
      link.textContent?.toLowerCase().includes('skip') ||
      link.getAttribute('aria-label')?.toLowerCase().includes('skip')
    );
    
    if (!hasSkipLink) {
      this.addIssue({
        id: 'missing-skip-link',
        severity: 'warning',
        category: 'keyboard',
        wcagLevel: 'A',
        description: 'Page missing skip to main content link',
        fix: 'Add skip link for keyboard users',
        automated: true,
      });
    }
  }

  private addIssue(issue: AccessibilityIssue) {
    this.issues.push(issue);
  }

  private generateReport(): AccessibilityReport {
    const errors = this.issues.filter(issue => issue.severity === 'error').length;
    const warnings = this.issues.filter(issue => issue.severity === 'warning').length;
    const total = this.issues.length;
    const passed = total - errors - warnings;
    
    // Calculate score (0-100)
    const score = total > 0 ? Math.round(((passed + warnings * 0.5) / total) * 100) : 100;
    
    // Generate recommendations
    const recommendations = this.generateRecommendations();
    
    return {
      score,
      issues: this.issues,
      passed,
      failed: errors,
      warnings,
      recommendations,
    };
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    const issueTypes = new Set(this.issues.map(issue => issue.id));
    
    if (issueTypes.has('missing-alt-text')) {
      recommendations.push('Add alt text to all images for screen reader users');
    }
    
    if (issueTypes.has('missing-label')) {
      recommendations.push('Ensure all form inputs have associated labels');
    }
    
    if (issueTypes.has('empty-link') || issueTypes.has('empty-button')) {
      recommendations.push('Provide accessible text for all interactive elements');
    }
    
    if (issueTypes.has('color-contrast')) {
      recommendations.push('Ensure sufficient color contrast for all text elements');
    }
    
    if (issueTypes.has('missing-skip-link')) {
      recommendations.push('Add skip links for keyboard navigation');
    }
    
    return recommendations;
  }
}

// Accessibility testing utilities
export class AccessibilityTester {
  /**
   * Test keyboard navigation
   */
  static testKeyboardNavigation(): Promise<boolean> {
    return new Promise((resolve) => {
      const focusableElements = document.querySelectorAll('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
      let currentIndex = 0;
      
      const testNext = () => {
        if (currentIndex >= focusableElements.length) {
          resolve(true);
          return;
        }
        
        const element = focusableElements[currentIndex] as HTMLElement;
        element.focus();
        
        // Check if element is actually focused
        if (document.activeElement === element) {
          currentIndex++;
          setTimeout(testNext, 100);
        } else {
          resolve(false);
        }
      };
      
      testNext();
    });
  }

  /**
   * Test screen reader compatibility
   */
  static testScreenReaderCompatibility(): {
    hasHeadings: boolean;
    hasLandmarks: boolean;
    hasAltText: boolean;
    hasLabels: boolean;
  } {
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const landmarks = document.querySelectorAll('[role="main"], [role="navigation"], [role="banner"], [role="contentinfo"]');
    const images = document.querySelectorAll('img');
    const inputs = document.querySelectorAll('input, textarea, select');
    
    return {
      hasHeadings: headings.length > 0,
      hasLandmarks: landmarks.length > 0,
      hasAltText: Array.from(images).every(img => img.alt || img.getAttribute('aria-label')),
      hasLabels: Array.from(inputs).every(input => 
        (input as HTMLInputElement).labels?.length || input.getAttribute('aria-label')
      ),
    };
  }

  /**
   * Test color contrast (simplified)
   */
  static testColorContrast(): {
    passed: boolean;
    failedElements: HTMLElement[];
  } {
    const textElements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6');
    const failedElements: HTMLElement[] = [];
    
    textElements.forEach((element) => {
      const styles = window.getComputedStyle(element);
      const color = styles.color;
      const backgroundColor = styles.backgroundColor;
      
      // Simplified check - in production, use a proper contrast checker
      if (color === 'rgba(0, 0, 0, 0)' || backgroundColor === 'rgba(0, 0, 0, 0)') {
        failedElements.push(element as HTMLElement);
      }
    });
    
    return {
      passed: failedElements.length === 0,
      failedElements,
    };
  }
}