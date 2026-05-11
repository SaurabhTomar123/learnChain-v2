# LearnChain Quality Gates

Run these checks before a public release:

```bash
npm run check
npm run build
```

## Lighthouse Targets

Run Lighthouse against `/`, `/roadmap/frontend-react`, `/trending`, `/profile`, and `/squads` on mobile and desktop.

- Performance: 90+
- Accessibility: 90+
- Best Practices: 90+
- SEO: 90+
- LCP: <= 2.5s
- INP: <= 200ms
- CLS: <= 0.1

## Manual Smoke Tests

- Home: open mobile search, search for `react`, navigate to a roadmap.
- Auth: open sign-in dialog, close with ESC, tab through fields, toggle password visibility.
- Onboarding: create a Learning OS plan and land on `/dashboard`.
- Dashboard: view weekly plan, saved resources, and set a weekly reminder.
- Roadmap: save and unsave a resource from a module.
- Compare: select and remove up to three roadmaps.
- PWA: load once, go offline, refresh, and confirm `/offline.html` appears.

## Accessibility Checks

- All icon-only buttons have labels.
- Focus rings are visible on keyboard navigation.
- Dialog focus is trapped while open.
- Reduced motion disables animated transitions.
- Body/support text maintains AA contrast on white backgrounds.
