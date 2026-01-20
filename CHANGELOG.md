# Changelog

## [Unreleased] - 2026-01-20

### Added
- **🏗️ Quasar Vue 3 Migration**: Complete dual-implementation architecture
  - New Quasar Vue 3 project in `/takst-quasar/` with TypeScript + Vite
  - Bootstrap implementation preserved in root directory for reference
  - Full Vue 3 Composition API with `<script setup>` syntax
  - TypeScript strict mode with proper type definitions

- **📱 Modern UI Architecture**
  - Quasar Framework components with Material Design 3
  - Responsive desktop-first layout with mobile tabbed interface
  - Vue Router 4 with history mode and nested routes
  - Component-based architecture with reusable Vue components

- **🏪 State Management System**
  - Pinia stores for project management (`useProjectStore`)
  - Upload queue store with retry logic (`useUploadQueueStore`)
  - Device ID and project ID generation for offline-first design
  - Reactive state management with computed properties and watchers

- **🗂️ Complete Page Structure**
  - `/dashboard` - Project overview with status cards
  - `/takst/new` - Address search onboarding with GeoNorge integration
  - `/takst/:projectId/editor` - Main inspection interface (3-column layout)
  - `/takst/:projectId/submit` - Bundle generation and upload initiation
  - `/takst/:projectId/summary` - Results display with TG statistics
  - `/takst/:projectId/pointcloud` - 3D viewer placeholder

- **🧩 Reusable Component Library**
  - `ProjectCard.vue` - Project display with completion status
  - `UploadQueuePanel.vue` - Queue management with retry actions
  - `TgChip.vue` - Condition grade chips with color coding
  - `ObservationModal.vue` - Full observation editing interface
  - `MainLayout.vue` - Navigation drawer and toolbar

- **💾 Offline-First Data Architecture**
  - Local storage with localStorage fallback (IndexedDB pending)
  - Upload queue with automatic retry and status tracking
  - Bundle format specification for backend submission
  - Device and project ID persistence

### 🔧 Development Infrastructure
  - Comprehensive TypeScript configuration with ES2015+ support
  - Vite build system with hot reload and optimization
  - PWA manifest for offline capabilities
  - Package.json with all required dependencies documented
  - **🐳 Docker containerization** for consistent development environment
  - **Docker Compose setup** with hot reload and volume mounting
  - **Dockerfile** with Node.js 18 Alpine base image and optimized build
  - **.dockerignore** for efficient container builds
  - **Docker verification script** (`test-docker.js`) for environment testing

### 🐳 Docker Containerization
  - **Containerized Development**: Full Node.js environment without local installation
  - **Hot Reloading**: Volume-mounted source code with instant updates
  - **CORS-Free Development**: Proxy configuration handles external APIs
  - **Cross-Platform Consistency**: Same environment on Windows, macOS, Linux
  - **Development-First Design**: Includes all dev dependencies and tools
  - **Docker Compose Orchestration**: Multi-service setup ready for backend integration

### Changed
- **Dual Implementation Strategy**: Bootstrap (legacy) + Quasar Vue (modern) coexisting
- **Architecture Patterns**: Migration from jQuery DOM manipulation to reactive Vue components
- **State Management**: From global STATE object to Pinia stores with TypeScript typing
- **Routing**: From hash-based navigation to Vue Router with programmatic navigation
- **Component Communication**: From direct DOM manipulation to Vue props/emit/events
- **Build System**: From simple HTML/JS to modern Vite bundler with TypeScript compilation

### Fixed
- **TypeScript Integration**: Proper type definitions for all Vue components and stores
- **Component Architecture**: Correct Vue 3 Composition API usage throughout
- **Responsive Design**: Quasar grid system replacing Bootstrap classes
- **State Persistence**: Local storage integration with proper error handling
- **Component Lifecycle**: Proper Vue lifecycle hooks and cleanup

### Docs
- **SPOT.md Enhancement**: Added Quasar architecture diagrams and function catalog
- **README.md**: Comprehensive documentation for Quasar project setup
- **Data Models**: Documented TypeScript interfaces and bundle format
- **Migration Guide**: Bootstrap to Quasar Vue transition patterns
- **Component Documentation**: Usage examples and prop interfaces
- **🐳 Docker Documentation**: Complete setup guides for containerized development
- **LOCAL_SETUP.md**: Docker-first approach with native Node.js alternative
- **CORS Configuration**: Proxy setup documentation for seamless API integration
- **FastAPI Backend**: Created function documentation (`./docs/functions/fastapi-backend.md`) with API specs and diagrams

### Performance
- **Bundle Size**: Optimized with tree-shaking and code splitting
- **Runtime Performance**: Reactive Vue 3 with efficient re-rendering
- **Memory Management**: Proper cleanup and garbage collection
- **Offline Storage**: Efficient local storage with minimal memory footprint

## [2.0.0] - 2026-01-20

### Added
- 3D Point Cloud Mapping support - BLK2GO integration, pipeline planning, and web visualization
- Comprehensive SPOT.md documentation hub following Windsurf rules
- Function catalog with Frontend, Backend, Database, and Infra sections
- Forberedt backend-API for scan-opplasting og prosessering
- 3D pipeline documentation (docs/3d-pipeline.md)
- Scan management UI placeholder (src/pages/scans.html)
- Project restructuring with src/, assets/, docs/ folders
- Bootstrap 5 integration and responsive design improvements

### Changed
- Major project structure refactoring for better organization
- Updated README.md with 3D functionality and comprehensive GitHub description
- Enhanced documentation following Windsurf single-SPOT architecture

### Fixed
- **Lint errors**: Moved inline styles to CSS classes in scans.html
- **Browser support**: Added `-webkit-backdrop-filter` for Safari compatibility
- **CSS fallbacks**: Added fallbacks for `color-mix()` in older browsers
- **Accessibility**: Improved code quality and linting compliance
- **Previous fixes**: Added placeholder to input fields, moved inline styles to external CSS classes
- **Path references**: Updated throughout project after restructuring

### Docs
- Created SPOT.md as authoritative documentation hub
- Updated function documentation structure
- Added localization support (nb-NO + en) framework
- Implemented proper link hygiene between source files and documentation
