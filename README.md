# Career Path Finder

Career Path Finder is a static quiz that helps someone compare real occupations before they spend time or money on training. It asks about interests, work style, physical demands, schooling they are willing to start, pay, and location. It then ranks careers and shows the published U.S. pay and job outlook for each one.

## Who it is for

It is for students, career changers, and advisors who want a short way to compare paths across technology, skilled trades, healthcare, construction, finance, sales, education, public safety, and logistics. It is a starting point. It does not place anyone in a job, and local wages and hiring rules differ from the national figures.

## How to use it

1. Open the app and answer the 20 questions. You can move back and change an answer.
2. Read the top five matches. Each card has a fit score, the reasons for that score, median pay, 10-year growth, typical entry education, typical training, and a short checklist.
3. Use the filters and the comparison table to narrow the list by field, preparation, pay, growth, or desk versus active work.
4. Copy the results link. The answers live in the page address, so someone with the link sees the same ranking. Nothing is uploaded.
5. Use Print or save as PDF for a paper copy. The print view drops the buttons and keeps the matches and table.

Each career links to its Occupational Outlook Handbook profile and to a guide on [AI TEK SOLUTIONS articles](https://aiteksolutions.net/articles). To point a career at a specific guide, add its id to `src/data/articleLinks.ts`. Ids that are not listed use the articles index.

A footer credit links to [https://aiteksolutions.net](https://aiteksolutions.net).

## Data sources

Pay, employment, growth, entry education, and training categories come from the [Occupational Outlook Handbook](https://www.bls.gov/ooh/) published by the U.S. Bureau of Labor Statistics.

- Wages are May 2025 medians from the Occupational Employment and Wage Statistics program, as printed in each profile.
- Employment and percent change are the 2025–35 projections in those profiles.
- The handbook states that the median annual wage for all workers was $50,980 in May 2025, and that employment for all occupations is projected to grow 3 percent from 2025 to 2035.
- When one profile covers more than one occupation, the career record names the wage series separately from the outlook series. Examples include software developers versus quality assurance analysts, and web developers versus digital interface designers.
- A few common job titles, including DevOps engineer and forward deployed engineer, do not have their own handbook profiles. Those cards say so and use the software developers series.

The bundled file is `src/data/careers.json`. Each career includes the handbook URL. Do not replace a figure without reading that page.

## Local development

Requirements: Node.js 22 and npm.

```bash
npm install
npm test
npm run dev
```

`npm test` runs the scoring tests. `npm run build` produces the static site in `dist/`.

The Vite `base` is `./`, so scripts and styles load with relative paths. That lets the same build be served at a domain root or in a subpath such as `/career/`.

## Deployment

The site is a static build for Cloudflare Pages. `public/_headers` sets a Content Security Policy and these response headers:

- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` with powerful features disabled

Publish the `dist` directory. No server, database, or API key is required.
