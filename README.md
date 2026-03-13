# PRIMECHANGE Dashboard Project

This folder contains the initial planning and MVP prototype for a daily executive dashboard for PRIMECHANGE.

Contents:

- `docs/requirements.md`: business goals, KPIs, and scope
- `docs/dashboard-plan.md`: screen structure, data model, and rollout plan
- `data/sample-data.js`: sample data shape for the MVP
- `data/live-data.js`: generated data file for real spreadsheet imports
- `data/generated-dashboard.json`: generated JSON output
- `mvp/index.html`: static dashboard prototype
- `mvp/styles.css`: dashboard styling
- `mvp/app.js`: rendering logic for the prototype
- `scripts/build-dashboard-data.mjs`: fetch and aggregate public Google Sheets data
- `scripts/build-dashboard-data.py`: review + finance aggregation from public Google Sheets

Open `mvp/index.html` in a browser to review the first dashboard prototype.

To build dashboard data from the public spreadsheet:

```bash
python3 scripts/build-dashboard-data.py
```

Or use the refresh helper:

```bash
./scripts/refresh-dashboard.sh
```

This updates:

- `data/generated-dashboard.json`
- `data/live-data.js`

Production app:

```bash
npm install
npm run refresh-data
npm run dev
```

Then open `http://localhost:3000`.
