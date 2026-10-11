# Contributing to NDVS

VERSION : 0.6.0

*Adiyen Dāsan* 🙏

Thank you for taking the time to visit this page and for your interest in supporting **Namāmyaham Drāviḍa Veda Sāgaram (NDVS)**. Your willingness to contribute — in whatever capacity — is deeply valued.

---

## About the Project

For over two years, NDVS has been dedicated to building a comprehensive platform that brings together the entire **Nālāyira Divya Prabandham** in a single, well-organised, and accessible place. The vision is not merely to preserve the pāsurams, but to present them in a structured, searchable, and meaningful manner for devotees, students, researchers, and seekers around the world.

Each pāsuram is being carefully organised with the following:

- **Original Tamil text** — the pāsuram as composed by the Āḻvār
- **English meaning** — a faithful rendering of the verse
- **Purport** — a condensed synthesis of various Pūrvācārya commentaries
- **Anubhavams** — the Āḻvār's devotional experience, including *śaraṇāgati*, *vātsalya*, *śṛṅgāra / nāyikā-bhāva*, and others
- **Associated Divya Deśams** — the sacred temples glorified in the verse
- **Related avatārams** — the divine forms of Bhagavān referenced
- **Contextual references and classifications**

Alongside this, NDVS aims to provide powerful search capabilities, advanced filtering, cross-references, multilingual support, and an intuitive reading experience across both the website and the upcoming **Prabandham Mālai** Android application.

Although several excellent resources on the Divya Prabandham already exist, NDVS seeks to offer a more comprehensive, centralised, modern, and easy-to-navigate platform — while remaining faithful to the teachings of our Pūrvācāryas.

---

## Why We Need Your Help

Building a comprehensive resource for all 4,000 pāsurams is a long-term undertaking. While substantial progress has already been made, there is still a tremendous amount of work remaining in research, content preparation, organisation, review, and software development.

We are currently seeking volunteers to assist with the following areas:

### Content & Research

- Writing and refining English meanings and purports
- Reviewing content for accuracy and consistency with Pūrvācārya commentary
- Organising and classifying pāsurams by theme, *anubhavam*, and context
- Researching contextual references, scriptural citations, and related *ithihāsa-purāṇa* episodes

### Technology & Design

- Testing the website and the Prabandham Mālai Android application
- Website and Android development
- UI/UX design and accessibility improvements
- Documentation and general project support

More than technical expertise, we seek sincere volunteers who are willing to learn while serving this project. You do not need to be an expert in the Divya Prabandham to contribute. Even a basic understanding, coupled with a genuine desire to learn and serve, can make a meaningful difference.

*Every contribution — whether large or small — helps bring the teachings of the Āḻvārs closer to devotees across the world.*

---

## Contributing to the Prabandha Malai App

The **Prabandha Malai** app lives in `app/` and is the cross-platform (iOS / Android / Web) client for exploring pāsurams, Divya Deśams, Āḻvārs, and Ācāryas. It is built with React Native + Expo (SDK 54), Expo Router, NativeWind (Tailwind CSS), Expo SQLite, and TypeScript. For the full feature list and app docs, see `app/README.md`. By participating, please uphold a welcoming, inclusive, and respectful environment.

### Local setup

Prerequisites: Node.js v18+, npm (or yarn/pnpm), Expo CLI, and an iOS Simulator (Mac) or Android Emulator for mobile testing. All app commands run from `app/`:

```bash
git clone https://github.com/kausthub-kannan/ndvs-prabandha-malai.git
cd ndvs-prabandha-malai/app
npm install
npm start
```

From the Expo CLI: `a` for Android, `i` for iOS (Mac only), `w` for web.

Available scripts (from `app/`): `npm start` (Metro bundler), `npm run android` / `npm run ios` / `npm run web`, `npm run lint` (ESLint), `npm run reset-project`.

### Project structure

- `app/app/` — screens and routing (Expo Router), including `app/app/(tabs)` tab navigation.
- `app/components/` — reusable UI components (buttons, cards, rows, nav bars, etc.).
- `app/assets/` — static assets, including the bundled SQLite database (`app/assets/db`).
- `app/scripts/` — project maintenance utilities.

### How to contribute

- **Reporting bugs:** open a GitHub issue with a clear title, reproduction steps, expected vs. actual behaviour, and your device, OS, and Expo/React Native versions.
- **Suggesting enhancements:** open an issue describing the feature, why it is useful, and any implementation ideas.
- **Code contributions:**
  1. Fork and branch from `main`.
  2. `cd app && npm install`, then make your changes.
  3. Test on iOS, Android, and Web where possible.
  4. Run `npm run lint` from `app/`.
  5. Commit with a clear message, push, and open a Pull Request.

### Coding guidelines

- **TypeScript:** properly typed code; avoid `any` where possible.
- **Styling:** prefer NativeWind/Tailwind utility classes over `StyleSheet.create` for layout, spacing, typography, and colours.
- **Components:** keep them small and reusable; split files that grow too large.
- **Responsive + themed:** verify small mobile screens through tablet/web widths (`rem`-based scaling), and support Light/Dark mode via theme-aware styling.

### Pull Request process

1. Describe the problem and solution clearly; link related issues.
2. Keep PRs small and focused on one change.
3. Be responsive to reviewer feedback.

---

## Join the Community

If you would like to contribute, we would be delighted to have you join the NDVS community.

**Discord** — [Join via this link](https://discord.gg/KZETg9bgu)

If you have questions or would like to discuss how you can contribute, you are welcome to reach out directly through the Discord server.

With the blessings of Bhagavān, the Āḻvārs, and our Pūrvācāryas, we pray that this humble effort may become a valuable resource for present and future generations.

---

*Āḻvār, Emberumāṉār, Jeeyar Tiruvaḍigaḷē Śaraṇam.*