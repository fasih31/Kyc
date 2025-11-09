# Ali-V KYC System Design Guidelines

## Design Approach
**Hybrid Approach:** Combining Material Design's data-rich patterns with Linear's modern aesthetics and Stripe's professional restraint. The system prioritizes clarity, trust, and cutting-edge technology presentation.

**Core Principles:**
- Professional trust through clean layouts and precise data presentation
- Futuristic feel via subtle gradients, smooth transitions, and modern typography
- Enterprise-grade information density with excellent readability
- Security-first visual language (clear hierarchy, unambiguous states)

---

## Typography System

**Font Stack:**
- Primary: Inter (Google Fonts) - weights 400, 500, 600, 700
- Monospace: JetBrains Mono - for document IDs, verification codes

**Hierarchy:**
- Hero/Landing Headlines: 5xl-6xl, weight 700
- Dashboard Page Titles: 3xl, weight 600
- Section Headers: xl-2xl, weight 600
- Card Titles: lg, weight 600
- Body Text: base, weight 400-500
- Metadata/Labels: sm, weight 500, uppercase tracking-wide
- Data/Stats: 2xl-4xl, weight 700, monospace for numbers

---

## Layout System

**Spacing Primitives:** Tailwind units of 2, 4, 6, 8, 12, 16, 20
- Component padding: p-6, p-8
- Section spacing: py-12, py-16, py-20
- Card gaps: gap-6, gap-8
- Element margins: mb-4, mb-6, mb-8

**Grid Structures:**
- Dashboard: Sidebar (256px fixed) + main content area
- Verification cards: 2-column grid on desktop (grid-cols-2)
- Stats overview: 3-4 column grid (grid-cols-3 lg:grid-cols-4)
- Single column on mobile with full-width cards

**Container Widths:**
- Landing page: max-w-7xl
- Dashboard content: max-w-6xl
- Forms: max-w-2xl
- Cards: Full width within grid constraints

---

## Component Library

### Navigation
**Top Header:**
- Fixed position with backdrop blur
- Height: h-16
- Logo left, navigation center, user profile/notifications right
- Subtle bottom border separator

**Sidebar (Admin Dashboard):**
- Width: w-64, fixed left
- Navigation items with icons (from Heroicons)
- Active state: subtle background fill with left border accent
- Grouped sections with uppercase labels

### Landing Page Structure
1. **Hero Section** (h-screen or min-h-[600px])
   - Large headline + subheadline
   - Two CTAs: primary "Start Verification" + secondary "View Demo"
   - Background: Subtle geometric pattern or abstract tech imagery
   - Stats bar below hero: "50K+ Verifications" | "99.9% Accuracy" | "< 2min Average"

2. **Features Grid** (py-20)
   - 3-column layout showcasing: AI Verification, Biometric Match, Risk Scoring
   - Each card: icon top, bold title, description
   - Subtle card elevation with border

3. **How It Works** (py-20)
   - 4-step process with numbered steps
   - Alternating left-right layout or horizontal timeline
   - Icons + brief descriptions

4. **Security & Trust** (py-16)
   - 2-column: Left text, right security badge/certification icons
   - Bullet points for encryption, compliance, privacy features

5. **CTA Section** (py-16)
   - Centered, bold headline
   - Primary action button
   - Supporting text about getting started

### Dashboard Components

**Verification Cards:**
- Elevation: subtle shadow with border
- Padding: p-6
- Header: User name + timestamp
- Status badge: inline with clear states (Pending, Verified, Rejected, Under Review)
- Document thumbnail + user photo side-by-side
- Risk score visualization: progress bar or circular indicator
- Action buttons bottom-right

**Stats Cards:**
- Compact design, p-6
- Large number display (text-4xl) with label below
- Small trend indicator (↑ 12% vs last month)
- Icon top-right corner

**Risk Score Display:**
- Circular progress indicator showing 0-100 score
- Accompanying risk level text: Low, Medium, High, Critical
- Color-coded through opacity/intensity variations

**Document Viewer:**
- Large preview area with zoom capability
- Extracted data fields displayed alongside in structured format
- Confidence scores per field (OCR accuracy)

**Verification Timeline:**
- Vertical timeline showing verification steps
- Icons for each step (Upload → OCR → Face Match → Risk Score → Decision)
- Timestamps and status for each completed step

### Forms & Inputs

**Document Upload:**
- Large drag-and-drop zone (min-h-64)
- Dotted border with upload icon centered
- Accepted file types displayed below
- Preview thumbnails after upload with remove option

**Selfie Capture:**
- Centered camera preview (square or portrait aspect)
- Face detection overlay (oval guide)
- "Capture" button prominent below
- Instructions: "Look at camera" / "Blink detected" feedback

**Input Fields:**
- Height: h-12
- Border: 2px solid
- Focus state: increased border weight + ring
- Label above field, error text below
- Icon support (left or right positioned)

### Data Visualization

**Verification Volume Chart:**
- Line or area chart showing daily/weekly verifications
- Height: h-64 to h-80
- Grid lines with subtle opacity
- Hover tooltips for data points

**Risk Distribution:**
- Donut chart showing percentage breakdown
- Legend positioned right or below
- Interactive hover states

**Success Rate Metric:**
- Large percentage display with supporting context
- Small sparkline showing trend

---

## Page-Specific Layouts

### Landing Page
- Full-width hero with centered content
- Alternating section backgrounds (transparent vs subtle fill)
- Generous vertical spacing (py-20 to py-32)
- Footer: 4-column layout (Product, Company, Resources, Legal) + newsletter signup

### User Dashboard
- Welcome banner: username + last login
- Quick stats row: 3 stats cards
- Recent verifications table
- Digital ID wallet section: card-style display of verified credentials

### Admin Dashboard
- Top metrics bar: 4 key stats
- Verification queue: list/card view toggle
- Filters sidebar: status, risk level, date range
- Bulk action toolbar when items selected

### Verification Detail Page
- 2-column layout: Document viewer (left 60%) + Details panel (right 40%)
- Sticky details panel on scroll
- Action buttons fixed bottom-right: Approve/Reject/Request More Info

---

## Interactions & States

**Button States:**
- Default: solid fill with medium weight text
- Hover: subtle transform scale(1.02) + shadow increase
- Active: transform scale(0.98)
- Disabled: reduced opacity (0.5), cursor-not-allowed

**Card Hover:**
- Subtle shadow elevation increase
- Border intensity change
- No dramatic animations

**Loading States:**
- Skeleton screens for data-heavy sections
- Spinner for quick actions
- Progress bars for file uploads

**Transitions:**
- Duration: 200ms for micro-interactions, 300ms for page elements
- Easing: ease-in-out

---

## Images

**Hero Section Image:**
- Abstract technology/AI visualization (neural networks, data patterns, biometric scan overlay)
- Placement: Full-width background with overlay gradient for text readability
- Blur buttons on hero if needed

**Feature Illustrations:**
- Simple iconography or minimal 3D-style illustrations
- Document scanning, face recognition, shield/security icons
- Placement: Above each feature card title

**Dashboard Avatars:**
- User profile photos in verification cards (circular, 48x48px)
- Document ID photos (rectangular thumbnail, 80x60px)

**No Stock Photos:** System focuses on data, UI, and functional imagery rather than lifestyle photography.

---

## Accessibility
- All interactive elements have clear focus rings
- Form inputs maintain 4.5:1 contrast minimum
- Icon-only buttons include aria-labels
- Status indicators use both shape and text (not just visual treatment)
- Keyboard navigation fully supported throughout