---
langs: [en, nb-NO]
lastUpdated: 2026-01-20
---

# app.js — Overview

Core application logic for Ekhana Takst property assessment tool. Manages TG classification workflow, UI state coordination, and JSON-first data handling.

**Source paths**: `src/js/app.js`
**SPOT:** ./SPOT.md#function-catalog

## API

### Core Functions
- `initApp()` - Initialize application state and UI
- `loadPropertyData()` - Load NS3600 profile and property data
- `handleTGClick(tgValue, observationId)` - Handle TG classification clicks
- `showObservationModal(observationId)` - Display/edit observation details
- `saveObservation(observationId, data)` - Persist observation changes
- `calculateProgress()` - Update completion status per room/section

### UI Management
- `renderClientView()` - Customer overview with room cards
- `renderInspectorView()` - Detailed assessment table for appraisers
- `renderPreview()` - Final report preview
- `updateProgressIndicators()` - Visual progress tracking

### Data Management
- `getCurrentProperty()` - Access current property data
- `validateObservation(data)` - Form validation
- `exportReport()` - Generate assessment report

## Design

### Goals
- Provide intuitive TG-based assessment workflow
- Maintain JSON-first architecture for flexibility
- Ensure responsive performance with large datasets
- Support offline capability via localStorage

### Decisions
- **Single-page application** - No routing, tab-based navigation
- **Event-driven updates** - Direct DOM manipulation for performance
- **localStorage persistence** - Offline draft capability
- **Bootstrap integration** - Consistent Norwegian UI patterns

### Trade-offs
- **No framework** - Smaller bundle, but manual DOM management
- **Client-side only** - Simpler deployment, limited scalability
- **JSON configuration** - Flexible, but requires careful schema management

## Usage

### Basic Initialization
```javascript
// Initialize when DOM ready
document.addEventListener('DOMContentLoaded', initApp);

// Core workflow
loadPropertyData()
  .then(() => renderClientView())
  .then(() => setupEventListeners());
```

### TG Classification
```javascript
// Handle TG button click
function onTGClick(event) {
  const tgValue = event.target.dataset.tg;
  const observationId = event.target.closest('.observation-row').dataset.id;

  handleTGClick(tgValue, observationId);
}
```

### Modal Management
```javascript
// Show observation editor
showObservationModal(observationId);

// Save changes
saveObservation(observationId, {
  funn: "Slitasje på gulv",
  aarsak: "Normal bruk",
  konsekvens: "Estetisk",
  tiltak: "Ingen tiltak nødvendig"
});
```

## Changelog

### [Unreleased]
- Initial function documentation following Windsurf rules

### 2026-01-20
- Core TG workflow implementation
- JSON-first data architecture
- Bootstrap 5 responsive UI
- localStorage draft persistence
- Progress tracking per room/section

## Diagrams

```mermaid
flowchart TD
    A[User Opens App] --> B[initApp()]
    B --> C[loadPropertyData()]
    C --> D[renderClientView()]
    D --> E[User Clicks TG]
    E --> F[handleTGClick()]
    F --> G{Is TG 1-3?}
    G -->|Yes| H[showObservationModal()]
    G -->|No| I[Mark as TG0]
    H --> J[User Edits Details]
    J --> K[saveObservation()]
    K --> L[updateProgressIndicators()]
    L --> M[renderUpdatedView()]
```

**TG Workflow**: Users can quickly classify observations with TG0-TG3, where TG1-3 automatically open detailed editing modal.
