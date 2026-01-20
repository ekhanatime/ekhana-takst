# Changelog

## [Unreleased] - 2026-01-20

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
