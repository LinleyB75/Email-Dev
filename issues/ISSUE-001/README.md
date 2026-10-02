# ISSUE-001: Images shrink and space apart in MJML columns (mj-group)

# ISSUE-001: Outlook Seam Fix & Mobile Flush Handling in `moodfashion.html`

## The Problem
When rendering complex e-commerce layouts like `moodfashion.html`, Microsoft Outlook (using the Word rendering engine) creates hairline white horizontal gaps ("seams") between adjacent table rows and background colors. Additionally, mobile viewports can break padding alignment on narrow screens.

## The Engineered Solution
1. **Outlook Seam & Line Height Normalization:** Applied exact line-height parameters (`mso-line-height-rule: exactly !important;`) on container styles to prevent unwanted vertical spacing anomalies in Word-based engines.
2. **Mobile Viewport Overrides:** Implemented targeted media queries (`@media only screen and (max-width: 375px)`) to force clean padding resets on narrow screens.

## File Reference
- **Production Code:** [View `moodfashion.html`](../../../moodfashion.html)

- **Date:** 2026-10-02
- **Client/environment:** Wall! Mail (webmail), viewed in Google Chrome. Version not recorded.
- **Viewport:** desktop browser window, about 1200px wide
- **Layouts affected:** 3 columns, 2 columns, 2 columns with image and text

## Symptom
With the columns wrapped in `<mj-group>`, the images came out smaller than expected and spaced apart instead of sitting flush. Without `<mj-group>` the layouts kept images and text together.

## Root cause
- **Padding: confirmed.** `mj-image` has a default padding of `10px 25px`. In a 600px email split into three columns, each column is about 200px, so the padding leaves a 150px image with about 50px between neighbouring images. Setting the padding to 0 fixed that part.
- **mj-group: not identified.** It still caused problems after the padding fix. Not yet explained.
- **Column widths (33.33% / 50%):** looked at, no evidence they cause the problem.
- **Lead (unconfirmed):** the grouped output writes the column width inline (`33%`), while the ungrouped output uses an inline `100%` and relies on a media query in the head `<style>` for the side-by-side layout. Worth checking whether Wall! Mail keeps head styles.

## Fix
1. Set `padding="0"` on `mj-image` (and on `mj-section` if you want it flush to the edges).
2. Remove `mj-group` and use plain `mj-column`s.

See `examples/issue-001-before.mjml` and `examples/issue-001-after.mjml`.

## Side effects and retested in
- Wall! Mail in Chrome: fixed in the 3-column, 2-column, and 2-column image and text layouts.
- Not tested in other clients or at narrower widths.

## Tags
`mjml` `mj-group` `mj-image` `padding` `columns` `webmail`

## Handbook / blog
- Blog post: https://linleyb.com/blog/mj-group-padding.html
- Before/after screenshots: in the blog post
