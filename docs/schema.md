# Database Schema & ERD

## Overview

Ekhana Takst uses a hybrid storage approach:
- **Client-side**: localStorage for draft data (current implementation)
- **Server-side**: Planned PostgreSQL for production (scans, users, projects)

## Current State

### Client Storage (localStorage)
```json
{
  "assignment": {...},
  "property": {...},
  "rooms": [...],
  "observations": {...},
  "media": {...}
}
```

## Planned Database Schema

### PostgreSQL Tables (Planned)

```mermaid
erDiagram
    projects {
        uuid id PK
        text name
        text description
        uuid owner_id FK
        timestamp created_at
        timestamp updated_at
    }

    scans {
        uuid id PK
        uuid project_id FK
        uuid floor_id FK
        uuid room_id FK
        text name
        text source "blk2go"
        text status "queued|processing|ready|failed"
        bigint upload_bytes
        text master_e57_path
        text derived_laz_path
        text potree_path
        text thumbnail_path
        text error_message
        timestamp created_at
        timestamp updated_at
        timestamp processed_at
    }

    observations {
        uuid id PK
        uuid checklist_item_id FK
        uuid project_id FK
        text tg "TG0|TG1|TG2|TG3"
        text finding
        text cause
        text consequence
        text action
        jsonb media
        timestamp created_at
        timestamp reviewed_at
    }

    projects ||--o{ scans : "has many"
    projects ||--o{ observations : "has many"
```

## Migration Path

1. **Phase 1**: Client-side only (current)
2. **Phase 2**: Add server-side sync for scans
3. **Phase 3**: Full database backend
4. **Phase 4**: Multi-user collaboration

## Security Considerations

- Row Level Security (RLS) on all tables
- Encrypted storage for sensitive data
- Signed URLs for file access
- Audit logging for all changes

---

*Database schema will be updated as backend implementation progresses.*
