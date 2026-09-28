# Next session

- Branch: main, tracking origin/main.
- Last commit: see `git log -1`. The README and the public pages explain the rehearsal in ordinary language, and the overview still steps the decision engine one step at a time.
- Remote: https://github.com/SohamSa/training-continuity (public). The browser demonstration is https://sohamsa.github.io/training-continuity/. Do not touch siliconpulse-ai.
- Python: 3.14.4 virtual environment at `.venv`.
- Commands that passed: `python -m pytest` (31 passed) and `apps/web` `npm run build`. A local public-demo browser pass stepped the opening story, approved a checkpoint, finished the healthy-workload story, and checked that return stays undefined until the accounting form is complete.
- Commands not run successfully: Docker Compose and PostgreSQL. `docker info` failed because `npipe:////./pipe/dockerDesktopLinuxEngine` was missing.
- Environment: Windows. GPU node triage documentation was not retrieved; `docs/references.md` marks it unverified.
- Next concrete task: when the Docker daemon is running, start Compose and apply the schema to Postgres 16, then record that result here.
- Secrets: none stored here. Local passwords belong only in gitignored `.local/dev-credentials.txt`.
