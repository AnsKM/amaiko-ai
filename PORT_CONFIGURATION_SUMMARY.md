# Port Configuration Update Summary

## Overview
Updated all port configurations in the Amaiko AI project to use alternative ports that are less likely to conflict with commonly running services.

## Port Mapping Changes

### Previous Ports (Commonly Busy)
- **Backend**: 3000
- **Frontend**: 3001
- **PostgreSQL**: 5432
- **Redis**: 6379
- **Letta**: 8283
- **ChromaDB**: 8000

### New External Ports (Host Access)
- **Backend**: **8100** (mapped to container port 3000)
- **Frontend**: **8200** (mapped to container port 3000)
- **PostgreSQL**: **5434** (mapped to container port 5432)
- **Redis**: **6380** (mapped to container port 6379)
- **Letta**: **8285** (mapped to container port 8283)
- **ChromaDB**: **8002** (mapped to container port 8000)

## Important: Docker Port Mapping Strategy

The configuration uses Docker's `HOST:CONTAINER` port mapping pattern:
- **HOST** ports are what you access from your local machine (NEW PORTS)
- **CONTAINER** ports are internal to the Docker network (ORIGINAL PORTS)

This means:
- External access (from your browser/tools) uses NEW ports (8100, 8200, etc.)
- Inter-container communication uses ORIGINAL ports (3000, 5432, etc.)

## Files Updated

### 1. docker-compose.yml
**Location**: `/Users/anskhalid/CascadeProjects/Live_Coding_Amaiko/amaiko-ai/docker-compose.yml`

**Changes**:
- Backend: Port mapping `8100:3000` (expose 3000 on host port 8100)
- Frontend: Port mapping `8200:3000` (expose 3000 on host port 8200)
- PostgreSQL: Port mapping `5434:5432`
- Redis: Port mapping `6380:6379`
- Letta: Port mapping `8285:8283`
- ChromaDB: Port mapping `8002:8000`

**Key Point**: Environment variables for inter-container URLs remain unchanged (e.g., `LETTA_BASE_URL: http://letta:8283`) because containers communicate via Docker network using standard ports.

### 2. .env.example
**Location**: `/Users/anskhalid/CascadeProjects/Live_Coding_Amaiko/amaiko-ai/.env.example`

**Changes**:
```bash
# Database (for localhost access when running services natively)
DATABASE_URL=postgresql://postgres:password@localhost:5434/amaiko
DATABASE_PORT=5434

# Redis
REDIS_URL=redis://localhost:6380
REDIS_PORT=6380

# Letta
LETTA_BASE_URL=http://localhost:8285

# ChromaDB
CHROMA_URL=http://localhost:8002
CHROMA_PORT=8002

# Frontend (browser access)
NEXT_PUBLIC_API_URL=http://localhost:8100
NEXT_PUBLIC_LETTA_URL=http://localhost:8285

# CORS
CORS_ORIGIN=http://localhost:8200,https://your-domain.com

# Auth Callback
AUTH_REDIRECT_URI=http://localhost:8100/auth/callback

# Testing
TEST_DATABASE_URL=postgresql://postgres:password@localhost:5434/amaiko_test
TEST_REDIS_URL=redis://localhost:6380/1
```

**Note**: Application PORT remains 3000 for container internal use.

### 3. README.md
**Location**: `/Users/anskhalid/CascadeProjects/Live_Coding_Amaiko/amaiko-ai/README.md`

**Changes**:
Updated "Access the Application" section with new ports:
```markdown
- **Backend API**: http://localhost:8100
- **Frontend Dashboard**: http://localhost:8200
- **Letta Server**: http://localhost:8285
- **ChromaDB**: http://localhost:8002
- **PostgreSQL**: localhost:5434
- **Redis**: localhost:6380
```

### 4. k8s/deployment.yaml
**Location**: `/Users/anskhalid/CascadeProjects/Live_Coding_Amaiko/amaiko-ai/k8s/deployment.yaml`

**Changes**: Kept standard ports for Kubernetes internal services:
- ConfigMap: All ports remain standard (3000, 5432, 6379, 8283, 8000)
- Container ports: All standard ports (3000, 5432, 6379)
- Service-to-service communication: Uses standard ports

**Rationale**: Kubernetes has its own service discovery and networking. Port conflicts don't occur within K8s clusters.

### 5. Dockerfiles
**Locations**:
- `/Users/anskhalid/CascadeProjects/Live_Coding_Amaiko/amaiko-ai/backend/Dockerfile`
- `/Users/anskhalid/CascadeProjects/Live_Coding_Amaiko/amaiko-ai/frontend/Dockerfile`

**Changes**: Kept standard container ports (3000) for both services.
- Backend EXPOSE: 3000
- Frontend EXPOSE: 3000
- Healthchecks: localhost:3000

**Rationale**: Containers internally run on standard ports. External mapping is handled by docker-compose.

### 6. Source Code Files

**backend/src/main.ts**:
- Default PORT fallback: `3000` (container internal)

**backend/src/agents/agent.service.ts**:
- Default LETTA_BASE_URL fallback: `http://localhost:8283` (container internal)

## How to Use

### Docker Compose (Recommended)

Start all services:
```bash
cd /Users/anskhalid/CascadeProjects/Live_Coding_Amaiko/amaiko-ai
docker-compose up -d
```

Access services:
- Backend API: http://localhost:8100
- Frontend: http://localhost:8200
- Letta: http://localhost:8285
- ChromaDB: http://localhost:8002
- PostgreSQL: `psql -h localhost -p 5434 -U postgres`
- Redis: `redis-cli -p 6380`

### Local Development (Native)

If running services natively (not in Docker), update your local `.env` file with the new ports from `.env.example`.

### Kubernetes

No changes needed - uses standard ports internally.

## Verification

Check that all services are running:
```bash
docker-compose ps
```

Test backend health:
```bash
curl http://localhost:8100/health
```

Test frontend:
```bash
curl http://localhost:8200
```

## Testing Checklist

- [ ] Backend accessible on http://localhost:8100
- [ ] Frontend accessible on http://localhost:8200
- [ ] PostgreSQL accessible on port 5434
- [ ] Redis accessible on port 6380
- [ ] Letta API accessible on http://localhost:8285
- [ ] ChromaDB accessible on http://localhost:8002
- [ ] Services can communicate with each other
- [ ] Health checks passing
- [ ] No port conflict errors in logs

## Notes

- The port changes only affect **external access** to services
- **Inter-container communication** remains unchanged
- Kubernetes configurations kept standard ports (no conflicts in K8s)
- All documentation updated to reflect new ports
- No breaking changes to application logic

## Contact

For questions or issues related to this port configuration update, please refer to the main project README or open an issue.

---
**Updated**: 2025-02-11
**Updated By**: Claude Code (Context Saver Delegate Agent)
