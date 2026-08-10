# Conferencer

An open-source conference program operating system: collect speaker proposals, review
them, onboard accepted speakers, build the agenda, and publish the program.

## Run locally

Requires Node.js 20+.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The DevFlow Conf 2027 demo is
included automatically, so every screen is populated on first launch.

## Demo entry points

| Surface | URL |
| --- | --- |
| Organizer | [http://localhost:3000/admin](http://localhost:3000/admin) |
| Speaker portal | [http://localhost:3000/portal](http://localhost:3000/portal) |
| Reviewer | [http://localhost:3000/review](http://localhost:3000/review) |
| Public program | [http://localhost:3000/e/devflow-conf-2027/sessions](http://localhost:3000/e/devflow-conf-2027/sessions) |
| Call for speakers | [http://localhost:3000/e/devflow-conf-2027/submit/cfp-main](http://localhost:3000/e/devflow-conf-2027/submit/cfp-main) |

The sign-in screen includes one-click role switching with the seeded organizer, speaker,
and reviewer credentials.

## Checks

```bash
npm run lint
npm run build
```

## Stack

Next.js 16, React 19, TypeScript, and Tailwind CSS 4. The application uses server-rendered
App Router entry points and limits client state to interactive program workflows.

## License

MIT
