# Liftie website

Liftie is a premium prelaunch website for a South African, organisation-verified commute-sharing network. The experience explains how recurring lift clubs differ from e-hailing and public social media groups, while giving riders, drivers, and organisations clear ways to register interest.

The landing page uses a warm-white, forest-green, and orange identity. A responsive SVG road arch frames the supplied commuter photograph, with a real Liftie request screen in a graphite phone frame. The route line draws once and respects reduced motion.

## Technology

- React 19 and TypeScript
- Vite 8
- Tailwind CSS 4, with a bespoke CSS design system
- Framer Motion for controlled interface transitions
- Lucide React for interface icons
- Locally bundled Manrope and IBM Plex Mono fonts
- Vitest for calculation tests

No map API, stock imagery, WebGL, or remote font service is required.

## Local setup

Requirements:

- Node.js 22 or newer
- npm 10 or newer

Install and start:

```bash
npm install
npm run dev
```

The development server prints its local URL. Open that URL in a current browser.

## Scripts

```bash
npm run dev
npm run build
npm run preview
npm run lint
npm run test
npm run audit:visual
```

`audit:visual` uses a locally installed Google Chrome to check the page at all briefed widths, capture representative screenshots, exercise core interactions, detect horizontal overflow, count dead links, and collect browser errors. On systems where Chrome is in another location, set `CHROME_PATH` before running the command.

## Form endpoints

Copy `.env.example` to `.env.local` and configure:

```env
VITE_LIFTIE_JOIN_ENDPOINT=https://your-service.example/join
VITE_LIFTIE_WHITELIST_ENDPOINT=https://your-service.example/whitelist
VITE_LIFTIE_SIGN_IN_URL=https://your-app.example/sign-in
```

Both endpoints receive structured JSON with `Content-Type: application/json`.

- The join payload includes organisation affiliation, general commute areas, role, schedule, weekdays, driver settings when applicable, consent values, source, and submission time.
- The whitelist payload includes organisation and domain details, requester information, commuter estimate, consent, source, and submission time.

The frontend does not contain secrets. The receiving service must perform its own validation, abuse protection, rate limiting, storage controls, privacy handling, and notification workflow.

When an endpoint is not configured, the form does not pretend to submit. It keeps the entered data visible and explains that registration is not connected yet.

The optional sign-in URL connects the header to the real application. If it is absent, the sign-in action explains that account access is not connected and offers network registration. Privacy, terms, and contact destinations remain marked as coming soon until approved content and destinations are supplied.

## Project structure

```text
src/
  components/
    forms/       Registration, whitelist, validation display, modal
    layout/      Header, mobile navigation, footer
    product/     Corridor, phone previews, matching controls
    sections/    Homepage narrative sections
    ui/          Buttons, logo, headings, accordion
  data/          Navigation, product content, routes, FAQ
  hooks/         Reduced motion and scroll spy
  lib/           Calculations, validation, submission service
  styles/        Global design system and responsive layout
scripts/
  visual-audit.mjs
public/
  favicon.svg
  og-liftie.svg
  site.webmanifest
```

## Design system

- Warm white and pale mint create editorial rhythm and improve form clarity.
- Forest green establishes structure in the driver section, calculator result, final invitation, and footer.
- Orange marks the co-funded headline, route movement, and destination details.
- SVG and CSS route lines carry the product story without imitating a commercial map.
- Cards are used only where containment clarifies an interface or decision.
- Product screens use supplied app screenshots. Their source configuration is shared by the hero, rider and driver sections, wallet, and interactive app tour.

## Accessibility

The implementation includes semantic landmarks, one `h1`, ordered headings, a skip link, labelled form fields, accessible errors, live result regions, focus-visible styling, keyboard tabs, accordion controls, a modal focus trap, escape handling, focus restoration, mobile scroll locking, and reduced-motion support.

The visual audit checks the requested widths from 320 px through 1920 px, plus 667 by 375 and 844 by 390 landscape layouts and reports horizontal overflow. A full WCAG audit with assistive technology and representative users should still be completed before public launch.

## Content and legal review

Current copy deliberately describes the product as planned or designed where integrations and operating policies are not confirmed. Before public launch, qualified South African advisers and the Liftie operating team should review:

- Lift-club eligibility and operating-licence conditions
- Driver, vehicle, documentation, insurance, and passenger requirements
- The final cost-sharing method and permissible cost recovery
- Tax treatment for drivers, riders, and Liftie
- Points custody, top-up, reservation, completion, and withdrawal mechanics
- Payment provider wording and supported methods
- Women-only matching eligibility and verification policy
- Privacy notice, terms, consent records, retention, and data subject processes
- Claims about availability, organisation domains, and operational coverage

The website does not claim formal organisation partnerships, completed background checks, guaranteed safety, active payment integrations, app-store availability, or universal legal compliance.

## Production build and deployment

Create the production output:

```bash
npm run build
```

Deploy the generated `dist/` directory to a static host. Configure HTTPS, compression, long-lived caching for hashed assets, and a short cache policy for `index.html`. Set the two form endpoint variables in the hosting environment before building.

After a real domain is chosen, verify the runtime canonical URL and replace the local SVG social preview if a raster preview is preferred by the target social platforms.
