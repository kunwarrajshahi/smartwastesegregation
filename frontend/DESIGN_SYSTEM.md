# EcoSort AI — Design System & Component Library

A modern, minimal AI SaaS design system built for **Smart Waste Segregation** monitoring, edge computer vision telemetry, and automated waste stream sorting facilities.

---

## 1. Visual Identity & Foundations

### Color Tokens
- **Background**: `#F7FAF8` (Clean, refreshing eco-tinted surface)
- **Primary Color**: Deep Forest Green (`#154429` / `forest-800`)
- **Card Background**: `#FFFFFF` with subtle border `rgba(226, 232, 240, 0.8)`
- **Shadows**:
  - `shadow-card`: `0 1px 3px 0 rgba(16, 24, 40, 0.04)`
  - `shadow-card-hover`: `0 10px 25px -5px rgba(14, 48, 29, 0.08)`
  - `shadow-dropdown`: `0 12px 30px -4px rgba(14, 48, 29, 0.12)`
  - `shadow-modal`: `0 25px 50px -12px rgba(14, 48, 29, 0.25)`

### Semantic Waste Categories
| Category | Primary Bin | Hex / Token | Badge Classes |
| :--- | :--- | :--- | :--- |
| **Organic** | Green Compost Bin | `#10B981` | `bg-emerald-50 text-emerald-800 border-emerald-200` |
| **Recyclable** | Blue Recycling Bin | `#3B82F6` | `bg-blue-50 text-blue-800 border-blue-200` |
| **Glass** | Teal Glass Bin | `#0D9488` | `bg-teal-50 text-teal-800 border-teal-200` |
| **Hazardous** | Red Hazard Bin | `#EF4444` | `bg-red-50 text-red-800 border-red-200` |
| **E-Waste** | Purple Depot | `#A855F7` | `bg-purple-50 text-purple-800 border-purple-200` |
| **Landfill** | Grey Residual Bin | `#64748B` | `bg-slate-100 text-slate-800 border-slate-300` |

---

## 2. The 10 Core Reusable Components

### 1. `Sidebar` (`src/components/Sidebar.jsx`)
- Supports desktop static navigation and mobile slide-in drawer with backdrop.
- Active state indicators, live model version badge, and facility supervisor profile.

### 2. `Topbar` (`src/components/Topbar.jsx`)
- Global search input with `Ctrl + K` / `Cmd + K` shortcut indicator.
- Real-time Edge AI node status pill (`24ms latency`, `12/12 online`).
- Notifications dropdown with unread badge counter.
- Quick scan launcher and plant profile avatar.

### 3. `PageHeader` (`src/components/PageHeader.jsx`)
- Breadcrumbs / facility category badges.
- Prominent semibold page titles with descriptive subtitles.
- Action slot for toolbars, exports, date selectors, and filters.

### 4. `StatCard` (`src/design-system/StatCard.jsx`)
- Metric title, value, unit, and comparison baseline (`+14.2% vs last week`).
- Trend badge with up/down arrows and conditional color tinting.
- Variant styles: `default` (white card) and `forest` (gradient green highlight).
- Optional progress bar and tooltip indicators.

### 5. `Button` (`src/design-system/Button.jsx`)
- **Variants**: `primary`, `secondary`, `outline`, `ghost`, `danger`, `danger-solid`, `success`.
- **Sizes**: `xs`, `sm`, `md`, `lg`, `icon`, `icon-sm`.
- **States**: `isLoading` (with animated spinner), `disabled`.
- Slots for `leftIcon` and `rightIcon`.

### 6. `Badge` & `ConfidenceBadge` (`src/design-system/Badge.jsx`)
- Semantic category mapping (`category="organic"` etc.).
- Operational status mapping (`status="verified"`, `status="flagged"`).
- Confidence chips that automatically format percentages with color grades.

### 7. `Table` (`src/design-system/Table.jsx`)
- Sortable columns (clickable headers with direction arrows).
- Built-in text search and category dropdown filters.
- Optional multi-row checkbox selection with bulk action callbacks.
- Clean pagination controls and friendly empty state.

### 8. `Modal` & `ConfirmModal` (`src/design-system/Modal.jsx`)
- Smooth backdrop blur and animated entrance.
- Keyboard ESC dismissal and focus/scroll locking.
- Pre-built confirmation dialogs with danger/warning presets.

### 9. `Skeleton` (`src/design-system/Skeleton.jsx`)
- Base shimmer primitive.
- Dedicated composite skeletons: `StatCardSkeleton`, `TableSkeleton`, `ChartSkeleton`.

### 10. `Toast` (`src/design-system/Toast.jsx`)
- Accessible `ToastProvider` and `useToast()` hook.
- Methods: `toast.success()`, `toast.error()`, `toast.warning()`, `toast.info()`.
- Auto-timeout countdown, manual dismissal, and stack layout.

---

## 3. Application Views
1. **Dashboard**: High-level KPI stat cards, hourly diversion throughput chart (Recharts), category distribution donut, and live classification feed.
2. **Waste Detection**: Live optical stream simulation, bounding box overlay, confidence gauge, destination bin assignment, and operator override.
3. **Analytics**: Recharts stacked bar charts, model validation accuracy trends, and purity compliance benchmarks.
4. **Scan History**: Full data table with sorting, search filters, bulk actions, and deep inspection modal.
5. **Settings**: YOLOv11 model selection, confidence gate sliders, pneumatic actuator latency calibration, and hardware fail-safes.
6. **Design System**: Dedicated live catalog showcasing all 10 components with interactive states.

---

## 4. How to Run Locally

```bash
cd frontend
npm install
npm run dev
```

Server starts on `http://localhost:3000`.
Build production assets:
```bash
npm run build
```
