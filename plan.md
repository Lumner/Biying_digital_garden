# Website Optimization Execution Plan

Source: `C:\Users\17597\Desktop\website_optimal.md`

This plan converts every unchecked item in the source checklist into concrete, testable work. Items that depend on live server state are handled with a local fallback or documented as deployment-dependent.

## Current Unfinished Scope

### Visual structure and density

Covered checklist items: 1, 2, 6, 7, 9, 17

Goal:
- Make homepage sections easier to distinguish without adding more visual noise.
- Reduce oversized UI blocks, especially the homepage entrance and site statistics area.
- Avoid first-load visual jumps caused by late sizing changes.
- Keep server-related performance risks separate from local UI work.

Files:
- `docs/zh/index.md`
- `docs/en/index.md`
- `docs/assets/styles/cyber.css`

Actions:
- Merge homepage statistics into the first content entrance instead of keeping a large standalone stats band.
- Make the below-fold entrance more compact and stable with fixed responsive constraints.
- Use lighter borders, smaller cards, and clearer spacing so sections read as separate areas.
- Reduce large typography inside non-hero sections.
- Keep a note that network/server stutter cannot be fully solved locally, but image/layout shifts can be reduced.

Acceptance:
- Homepage keeps all existing content.
- Stats still show total visitors and page views.
- No standalone oversized stats block appears on the homepage.
- Desktop and mobile homepage sections do not overlap or jump visibly during load.

### Light theme readability and harmony

Covered checklist items: 14, 16, 19, 21

Goal:
- Improve light mode contrast while keeping the palette soft and coherent.
- Replace the dark/rainy homepage background in light mode with a brighter generated character cover.
- Make sidebars in light mode match the page rather than staying harsh black.

Files:
- `docs/assets/images/home-hero-light.png`
- `docs/assets/styles/cyber.css`

Actions:
- Use `home-hero-light.png` only in light mode.
- Strengthen text colors for light mode body copy, meta text, card copy, section descriptions, and small labels.
- Give light-mode sidebars a translucent warm-white/jade surface with readable text.
- Avoid one-note neon green by mixing jade, warm white, pale gold, and dark ink.

Acceptance:
- Light mode homepage shows the new bright character artwork.
- Text in project cards, stats, chat, and sidebars is readable.
- Sidebar surface no longer appears black in light mode.

### Theme behavior

Covered checklist item: 18

Goal:
- Add a third theme mode: follow system.
- Make system mode the default for first-time visitors.
- Preserve existing light/dark manual choices.

Files:
- `docs/overrides/main.html`
- `docs/assets/javascripts/language-switch.js`
- `docs/assets/styles/cyber.css`
- `tests/mobile-biying.spec.js`

Actions:
- Interpret `localStorage["biying-theme"]` values as `system`, `light`, or `dark`.
- Resolve the active visual theme from `prefers-color-scheme` when mode is `system`.
- Update the custom theme switcher to cycle through system, dark, and light.
- Listen for OS theme changes while in system mode.
- Update tests so the default is system-resolved and manual selection still persists.

Acceptance:
- First visit uses `data-biying-theme-mode="system"`.
- Manual dark/light still persists.
- System mode updates when the browser color-scheme media query changes.

### Cursor consistency

Covered checklist item: 15

Goal:
- Keep the Pikachu cursor across interactive states, including clicked/focused buttons and Material UI controls.

Files:
- `docs/assets/styles/cyber.css`

Actions:
- Expand cursor rules to cover active, focus-visible, labels, summary elements, Material tabs, drawer controls, search controls, and generated buttons.
- Keep text inputs using text cursor behavior while still using the custom cursor asset.

Acceptance:
- Hovering and clicking buttons does not fall back to the browser arrow cursor.
- Text inputs remain obviously editable.

### Chat readability and persistence

Covered checklist item: 13

Goal:
- Make Biying chat easier to read and keep local transcript across page switches.

Files:
- `docs/assets/javascripts/biying-chat.js`
- `docs/assets/styles/cyber.css`
- `tests/mobile-biying.spec.js`

Actions:
- Keep existing localStorage transcript behavior.
- Increase readable font sizes and line heights in page and floating chat.
- Make floating chat panel less visually heavy and better layered in light mode.
- Add keyboard shortcut behavior: Enter submits, Shift+Enter inserts a line break.

Acceptance:
- Existing transcript restore test passes.
- New Enter-submit behavior works in chat.
- Chat panel remains readable on mobile.

### Navigation and text polish

Covered checklist items: 20, 22, 23

Goal:
- Make navigation order more natural and move account access between friends and updates.
- Remove copy that feels like raw prompts or overly synthetic site narration.
- Add Enter key support for account forms, chat, and search where local code can control behavior.

Files:
- `mkdocs.yml`
- `docs/zh/index.md`
- `docs/en/index.md`
- `docs/zh/projects/personal-site-avatar.md`
- `docs/en/projects/personal-site-avatar.md`
- `docs/assets/javascripts/auth.js`
- `docs/assets/javascripts/biying-chat.js`
- `docs/assets/javascripts/layout-controls.js`
- `tests/mobile-biying.spec.js`

Actions:
- Reorder nav so account appears between Friends and Updates in both languages.
- Keep Stats page available, but remove it from top-level nav if the homepage already surfaces stats compactly.
- Rewrite homepage and project copy toward natural personal-site language.
- Ensure account forms submit on Enter through native form behavior and do not trap keyboard focus.
- Add search Enter normalization only if current Material search behavior needs help.

Acceptance:
- Navigation order matches requested position.
- Homepage/project text does not expose prompt-like wording.
- Keyboard submission works for chat and auth.

## Execution Order

1. Create or update project-bound assets.
2. Update `plan.md`.
3. Patch theme initialization and switcher behavior.
4. Patch homepage structure and copy.
5. Patch CSS for light theme, density, sidebars, cursor, chat, and stats.
6. Patch chat keyboard behavior.
7. Reorder navigation and bump asset versions.
8. Update tests for theme, light hero, navigation, keyboard behavior, and stats integration.
9. Build the site.
10. Run validation and Playwright tests.
11. Review diff and commit only if requested.

## Rollback Notes

- The dependency fix commit before this plan is `7ba966d`.
- This plan should be one logical change set. If a later visual direction is not liked, revert the eventual optimization commit rather than mixing it with dependency fixes.
- Generated light hero source is copied into `docs/assets/images/home-hero-light.png`; deleting that file and removing the light-theme CSS reference returns the old visual behavior.

## Server-Limited Items

Item 7 mentions stutter that may be server-related. Local work can reduce image/layout shifts and heavy panels, but live latency, KV cold starts, CDN edge behavior, or Function startup time must be verified after deployment.

## Execution Result - 2026-06-21

Completed locally:
- Added `docs/assets/images/home-hero-light.png` as the light-mode homepage character cover.
- Added system/dark/light theme mode support and made system mode the first-visit default.
- Moved account navigation between Friends and Updates, and removed Stats from top-level navigation while keeping the stats page linked from the homepage.
- Merged homepage visitor statistics into the first content entrance area as a compact strip.
- Improved light-mode text contrast, sidebar surfaces, and palette harmony.
- Expanded custom cursor coverage for active/focused interactive controls.
- Improved Biying chat readability and added Enter-to-send with Shift+Enter for line breaks.
- Refreshed project and update page copy with current maintenance state.
- Added Playwright coverage for theme modes, light hero artwork, compact homepage stats, navigation order, cursor coverage, and chat Enter behavior.

Verified locally:
- `node --check docs/assets/javascripts/language-switch.js`
- `node --check docs/assets/javascripts/biying-chat.js`
- `node --check docs/assets/javascripts/auth.js`
- `git diff --check`
- `python scripts/build_site.py`
- `python scripts/validate_public_scope.py`
- `npm run test:mobile` with 14 tests passed
- Browser visual check on `http://127.0.0.1:4177/zh/`

Still deployment-dependent:
- Live server stutter, EdgeOne KV cold starts, CDN behavior, and model/API latency must be checked after deployment.
