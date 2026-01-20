---
langs: [en, nb-NO]
lastUpdated: 2026-01-20
---

# onboarding.js — Overview

Customer onboarding and property registration module for Ekhana Takst. Handles address lookup, property configuration, floor/room setup, and initial data collection.

**Source paths**: `src/js/onboarding.js`
**SPOT:** ./SPOT.md#function-catalog

## API

### Core Functions
- `initOnboarding()` - Initialize onboarding UI and event listeners
- `searchAddress(query)` - Norwegian address search with autosuggest
- `loadPropertyData(address)` - Fetch property details from selected address
- `setupFloorsAndRooms()` - Configure building floors and room layout
- `saveCustomerData(data)` - Persist customer and property information
- `generateChecklist()` - Create NS3600 checklist based on property configuration

### Address Services
- `connectToAddressAPI(query)` - Connect to Norwegian address registry
- `parseAddressResult(result)` - Parse and format address data
- `validateAddressData(data)` - Ensure address completeness

### Property Configuration
- `renderFloorGrid()` - Display floor/room configuration UI
- `addRoomToFloor(floorIndex, roomType)` - Add room to specific floor
- `calculatePropertyStats()` - Compute total area and room counts
- `validatePropertySetup()` - Ensure minimum property requirements

## Design

### Goals
- Provide intuitive property registration workflow
- Integrate with Norwegian address systems
- Support flexible floor/room configurations
- Ensure data completeness before proceeding

### Decisions
- **Modal-based room management** - Clean separation of concerns
- **Autosuggest address search** - Fast Norwegian address lookup
- **Progressive disclosure** - Show relevant fields as user progresses
- **Local validation** - Client-side data integrity checks

### Trade-offs
- **Norwegian-only** - Focused on Norwegian market requirements
- **Address API dependency** - Requires external service availability
- **Manual room setup** - No automatic room detection from scans yet

## Usage

### Address Search Flow
```javascript
// Initialize address search
const addressInput = document.getElementById('addressQuery');
addressInput.addEventListener('input', (e) => {
  const query = e.target.value;
  if (query.length > 2) {
    searchAddress(query)
      .then(displaySuggestions)
      .catch(handleSearchError);
  }
});

// Handle address selection
function onAddressSelect(address) {
  loadPropertyData(address)
    .then(displayPropertyCard)
    .then(enableFloorSetup);
}
```

### Floor/Room Configuration
```javascript
// Add room to floor
function addRoom(floorIndex, roomType) {
  const roomData = createRoomData(roomType);
  addRoomToFloor(floorIndex, roomData);
  updateFloorDisplay(floorIndex);
  recalculateStats();
}

// Save configuration
function saveConfiguration() {
  const config = collectFloorRoomData();
  if (validatePropertySetup(config)) {
    saveCustomerData(config);
    proceedToAssessment();
  }
}
```

### Integration with Main App
```javascript
// Export for main app integration
window.OnboardingModule = {
  init: initOnboarding,
  getPropertyData: () => currentPropertyData,
  isComplete: () => onboardingComplete
};
```

## Changelog

### [Unreleased]
- Initial function documentation following Windsurf rules

### 2026-01-20
- Complete onboarding workflow implementation
- Norwegian address integration
- Floor/room configuration system
- Bootstrap 5 responsive UI
- Property data validation and persistence
- Integration with main application flow
