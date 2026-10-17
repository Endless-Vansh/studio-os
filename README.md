# STUDIO OS — Premium Creative Agency Workspace

A production-grade, editorial-aesthetic workspace built for independent creative design studios, art direction agencies, and publication ateliers.

---

## 1. Visual Identity & Art Direction

STUDIO OS is designed with an editorial, print-publication sensibility:
- **Palette Tokens**:
  - `Studio Ink`: `#191A18` — Deep architectural black used for the sidebar, high-contrast headings, and deliberate focal elements.
  - `Warm Paper`: `#F1EEE6` — Tactile warm paper canvas replicating unbleached book stock.
  - `Studio Vermilion`: `#D65A36` — Singular, restrained accent for urgent press approvals, highlights, and primary actions.
  - `Sage`: `#D9DED3` — Organic botanical tint for status badges and studio capacity allocations.
  - `Muted Borders & Hairlines`: `#DFDAD0` / `#E8E4DA` — 1px crisp borders, avoiding generic SaaS floating card shadows.
- **Typography Hierarchy**:
  - **Editorial Display Serif**: `Newsreader` (Google Fonts) with fallbacks to `Playfair Display`, `Georgia`, `serif` for prominent titles, monograph codes, and high-level milestones.
  - **Clean Interface Sans**: `Plus Jakarta Sans` / `Inter` / system-ui for legible tabular data, forms, and navigation links.
  - **Monospace Counter & Metadata**: `JetBrains Mono` for dates, serials, currency calculations, and specifications.

---

## 2. Architecture & File Structure

```
studio-os/
├── src/
│   ├── types/
│   │   └── index.ts                 # Domain models (Client, Project, Deliverable, Revision, Approval, Invoice, etc.)
│   ├── tokens/
│   │   └── tokens.ts                # TypeScript design token constants
│   ├── styles/
│   │   ├── tokens.css               # Centralized CSS Custom Properties (:root)
│   │   └── global.css               # Editorial CSS reset, tables, typographies, and utility styles
│   ├── services/
│   │   ├── apiInterface.ts          # Pure TypeScript contract (IStudioService)
│   │   ├── mockService.ts           # Asynchronous in-memory service implementation
│   │   └── index.ts                 # Exported singleton service for UI components
│   ├── mockData/
│   │   └── mockData.ts              # Realistic creative agency dataset (Maison Éthérée, ArchiMono, Kurogane, etc.)
│   ├── components/
│   │   ├── ui/                      # Reusable UI component library
│   │   │   ├── Button.tsx           # Primary, secondary, outline, vermilion, ghost, danger
│   │   │   ├── Badge.tsx            # Status pills with micro-caps & dots
│   │   │   ├── Input.tsx            # Form input with mono labels & icon support
│   │   │   ├── Select.tsx           # Styled dropdown input
│   │   │   ├── Modal.tsx            # Centered dialog with backdrop & escape key handler
│   │   │   ├── Drawer.tsx           # Slide-over inspection sheet for revision history & invoice slips
│   │   │   ├── Tabs.tsx             # Understated tab bar with count indicators
│   │   │   ├── StatPill.tsx         # Key metric block with serif numerals
│   │   │   ├── AlertBanner.tsx      # Restrained notification bar
│   │   │   ├── Table.tsx            # Generic typed table
│   │   │   └── index.ts
│   │   └── layout/
│   │       ├── AppShell.tsx         # Persistent application shell with modal triggers
│   │       ├── Sidebar.tsx          # Studio Ink navigation sidebar (responsive mobile drawer)
│   │       └── TopBar.tsx           # Breadcrumbs, quick search, live time, quick actions
│   ├── pages/
│   │   ├── Dashboard/               # Studio Runway, critical approvals, atelier tasks, treasury
│   │   ├── Projects/                # Works directory + ProjectDetail with 4 tabs & revision drawer
│   │   ├── Deliverables/            # Deliverable specs with live revision inspection & submission
│   │   ├── Approvals/               # Client sign-off portal with formal authorization modal
│   │   ├── Clients/                 # Client roster with onboarding modal & engagement metrics
│   │   └── Invoices/                # Financial ledger with itemized invoice slip drawer & mark-settled action
│   ├── App.tsx                      # React Router configuration
│   └── main.tsx                     # React entrypoint
```

---

## 3. Handover Guide: Connecting to Java Spring Boot & MySQL

The frontend strictly separates presentation from data access. No UI component makes direct database or fetch calls; all data flows through `IStudioService` (`src/services/apiInterface.ts`).

### Steps for the Backend Developer:
1. **Create an HTTP Service Implementation**:
   Create `src/services/httpApiService.ts` implementing `IStudioService`:
   ```typescript
   import { IStudioService } from './apiInterface';
   
   export class HttpStudioService implements IStudioService {
     private baseUrl = '/api/v1';

     async getProjects() {
       const res = await fetch(`${this.baseUrl}/projects`);
       return res.json();
     }
     // ... implement remaining methods matching IStudioService
   }
   ```
2. **Switch the Provider**:
   In `src/services/index.ts`, change:
   ```typescript
   // export const studioService: IStudioService = new MockStudioService();
   export const studioService: IStudioService = new HttpStudioService();
   ```
3. **Recommended Spring Boot REST Endpoints**:
   - `GET /api/v1/metrics` → `AgencyMetrics`
   - `GET /api/v1/projects` & `POST /api/v1/projects`
   - `GET /api/v1/projects/{id}`
   - `GET /api/v1/deliverables` & `POST /api/v1/deliverables`
   - `GET /api/v1/deliverables/{id}/revisions` & `POST /api/v1/deliverables/{id}/revisions`
   - `GET /api/v1/approvals`
   - `POST /api/v1/approvals/{id}/decide`
   - `GET /api/v1/invoices` & `POST /api/v1/invoices`
   - `PATCH /api/v1/invoices/{id}/status`
   - `GET /api/v1/clients` & `POST /api/v1/clients`

---

## 4. Running the Application

### Development Server:
```bash
npm run dev
```
The application will be available at `http://localhost:5173/`.

### Production Build:
```bash
npm run build
```
Generates optimized static bundles in `dist/` verified with zero TypeScript compilation warnings.
