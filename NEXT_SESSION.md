# Next session

- Branch: main, tracking origin/main.
- Last commit: see `git log -1`. The Data catalog lives on the public page under Data catalog (`/#/data`) and in `src/baton/catalog/atlas.py`. The overview still steps the decision engine one step at a time.
- Remote: https://github.com/SohamSa/baton (public). The browser demonstration is https://sohamsa.github.io/baton/. Do not touch siliconpulse-ai.
- Python: 3.14.4 virtual environment at `.venv`.
- Commands that passed: `python -m pytest` (32 passed) and `apps/web` `npm run build`. A local public-demo browser pass opened the Data catalog, switched 10 and 30 drawers, and opened the Buildings drawer. An earlier pass stepped the opening story and checked that return stays undefined until the accounting form is complete.
- Commands not run successfully: Docker Compose and PostgreSQL. `docker info` failed because `npipe:////./pipe/dockerDesktopLinuxEngine` was missing.
- Environment: Windows. GPU node triage documentation was not retrieved; `docs/references.md` marks it unverified.
- Next concrete task: when the Docker daemon is running, start Compose and apply the schema to Postgres 16, then record that result here.
- Secrets: none stored here. Local passwords belong only in gitignored `.local/dev-credentials.txt`.


## Owner journey handoff

- Start at `/` or `/journey`; the previous overview remains at `/portfolio`.
- Narrative source: `content/owner-journey.json`. Regenerate the README with `python scripts/build_owner_readme.py` after changing chapters or characters.
- Preserve chapter and owner-path query parameters when linking supporting rooms back into the story.
- The climax is deliberately a tabletop exercise. Do not describe it as an implemented compound fault simulation.
- Owner questions and evidence drawers identify optional/proposed records and simplified advanced rehearsals.
- Current verification: 43 Python tests passed; frontend typechecking and production builds passed. Earlier Windows/PostgreSQL notes above are historical.
