# Healthcare Translation App Design Guidelines

## Design Approach
**Reference-Based Approach**: Apple-inspired design following the legacy of Steve Jobs with intuitive, simple interfaces suitable for professional healthcare environments.

## Core Design Elements

### A. Color Palette
**Light Mode:**
- Primary: #2563EB (medical blue)
- Secondary: #059669 (trust green) 
- Background: #F8FAFC (clean white)
- Text: #1E293B (professional dark)
- Success: #10B981 (approval green)
- Warning: #F59E0B (review amber)

**Dark Mode:**
- Primary: #3B82F6 (lighter medical blue)
- Secondary: #34D399 (lighter trust green)
- Background: #0F172A (dark slate)
- Text: #F1F5F9 (light slate)
- Success: #22C55E (approval green)
- Warning: #FBBF24 (review amber)

### B. Typography
- **Primary Font**: Inter (via Google Fonts CDN)
- **Secondary Font**: Source Sans Pro (via Google Fonts CDN)
- **Hierarchy**: Large headings (32px), section titles (24px), body text (16px), captions (14px)
- **Weight Distribution**: Regular (400) for body, Medium (500) for labels, Semibold (600) for headings

### C. Layout System
**Tailwind Spacing Units**: Consistent use of 2, 4, 6, 8, 12, 16 units
- Micro spacing: p-2, m-2 (8px)
- Standard spacing: p-4, m-4 (16px) 
- Section spacing: p-6, m-6 (24px)
- Large spacing: p-8, m-8 (32px)
- Container spacing: p-12, m-12 (48px)
- Section breaks: p-16, m-16 (64px)

### D. Component Library

**Core Components:**
- **Step Cards**: Large, elevated cards with clear borders for each workflow step
- **Progress Indicators**: Simple numbered circles showing current step (1→2→3→4)
- **Comparison Panels**: Side-by-side layout for original/translation/back-translation
- **Preset Manager**: Dropdown with patient name, greeting, and tone settings
- **Action Buttons**: Large, touch-friendly primary buttons (minimum 44px height)
- **Dark Mode Toggle**: Subtle toggle in header/settings area

**Navigation:**
- Clean header with app title and dark mode toggle
- Minimal sidebar for preset management
- Breadcrumb navigation showing current step

**Forms:**
- Large text areas for message input
- Dropdown selectors for language and presets
- Clear labels with sufficient contrast
- Generous padding and spacing

**Data Displays:**
- Translation comparison tables with clear column headers
- Audio player with prominent play/pause and download buttons
- Status indicators using color-coded badges

**Overlays:**
- Modal dialogs for preset editing
- Toast notifications for API status updates
- Loading states with subtle progress indicators

### E. Workflow-Specific Design

**Step 1 - Input**: Large text area with preset selector above, language dropdown, prominent "Translate" button
**Step 2 - Translation**: Display original and translated text in clean cards with "Back-Translate" button
**Step 3 - Quality Control**: Three-column comparison with approve/reject buttons prominently displayed
**Step 4 - Audio Generation**: Clean audio player interface with waveform visualization

**Key Design Principles:**
- Generous white space between workflow steps
- Clear visual separation between each step
- No automatic progression - user must approve each step
- Apple-style card elevations and subtle shadows
- Professional color usage appropriate for healthcare settings
- Mobile-responsive with touch-friendly interface elements

**Icons**: Use Heroicons for consistency with Apple-style design language

The design should feel familiar to healthcare professionals while maintaining the elegant simplicity Apple is known for, ensuring quick and confident interactions during patient care.