# Development Conventions

## Code Style

### JavaScript
- **ES6+ features**: Arrow functions, template literals, destructuring
- **Async/await**: Preferred over promises for readability
- **Functional programming**: Pure functions where possible
- **Naming**: camelCase for variables/functions, PascalCase for constructors
- **Comments**: JSDoc for public APIs, inline for complex logic

### CSS
- **BEM methodology**: `.block__element--modifier`
- **CSS variables**: For colors, spacing, typography
- **Mobile-first**: Base styles for mobile, media queries for larger screens
- **No inline styles**: All styles in external CSS files

### HTML
- **Semantic markup**: Proper use of headings, sections, articles
- **Accessibility**: ARIA attributes, alt text, keyboard navigation
- **Bootstrap classes**: Consistent use of Bootstrap 5 components
- **Data attributes**: For JavaScript hooks (data-* attributes)

## File Organization

### Source Structure
```
src/
├── pages/          # HTML pages
├── js/            # JavaScript modules
└── assets/        # Static assets
    └── css/       # Stylesheets
```

### Documentation Structure
```
docs/
├── functions/     # Function documentation
├── tasks/         # Task management
├── erd.mmd        # Database schema (Mermaid)
├── schema.md      # ERD documentation
├── conventions.md # This file
└── 3d-pipeline.md # 3D features
```

## Git Workflow

### Branch Naming
- `feature/feature-name`: New features
- `bugfix/issue-description`: Bug fixes
- `docs/update-description`: Documentation updates
- `refactor/component-name`: Code refactoring

### Commit Messages
```
type(scope): description

Types:
- feat: New features
- fix: Bug fixes
- docs: Documentation
- style: Code style changes
- refactor: Code refactoring
- test: Testing
- chore: Maintenance
```

## Testing

### Manual Testing Checklist
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Accessibility (keyboard navigation, screen readers)
- [ ] Browser compatibility (Chrome, Firefox, Safari, Edge)
- [ ] Offline functionality
- [ ] Form validation
- [ ] Error handling

### Performance
- Lighthouse score >90
- Bundle size monitoring
- Load time optimization

## Deployment

### Static Hosting
- GitHub Pages for development/demo
- CDN for production assets
- HTTPS required for all deployments

### Environment Variables
```
# Development
NODE_ENV=development
API_BASE_URL=http://localhost:3000

# Production
NODE_ENV=production
API_BASE_URL=https://api.ekhana.dev
```

## Security

### Client-side Security
- Input sanitization
- XSS prevention
- Content Security Policy (CSP)
- Secure localStorage usage

### File Upload Security
- File type validation
- Size limits
- Virus scanning (planned)
- Secure file serving

## Localization

### Supported Languages
- **Norwegian (nb-NO)**: Primary language
- **English (en)**: Secondary language for international users

### Translation Keys
- Use descriptive keys: `button.save`, `error.required_field`
- Support for pluralization
- Context-aware translations

### Date/Time Formatting
- Norwegian: DD.MM.YYYY kl. HH:MM
- English: YYYY-MM-DD HH:MM

## Error Handling

### User-facing Errors
- Clear, actionable error messages
- Norwegian language
- Recovery suggestions

### Logging
- Structured logging with levels
- Error tracking and monitoring
- Performance metrics

## Performance

### Optimization Goals
- First paint <1.5s
- Time to interactive <3s
- Bundle size <500KB
- Lighthouse score >90

### Monitoring
- Core Web Vitals tracking
- Error rate monitoring
- User journey analytics
