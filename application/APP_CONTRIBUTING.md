# Contributing to Prabandha Malai

First off, thank you for considering contributing to Prabandha Malai! It's people like you that make open-source projects rewarding and successful. 

## Code of Conduct

By participating in this project, you are expected to uphold a welcoming, inclusive, and respectful environment. Please be kind and collaborative in all your interactions.

## How Can I Contribute?

### Reporting Bugs
If you find a bug, please create an issue on GitHub. Include:
- A clear and descriptive title.
- Steps to reproduce the issue.
- Expected vs. actual behavior.
- Device, OS, and Expo/React Native version you are using.

### Suggesting Enhancements
Have an idea for a new feature or improvement? Open an issue with:
- A description of the feature.
- Why it would be useful.
- Potential implementation ideas if you have any.

### Code Contributions

1. **Fork the repository** and create your branch from `main`.
2. **Install dependencies**: run `npm install`.
3. **Make your changes**: Write clean, readable code.
4. **Test your changes**: Ensure your changes do not break existing functionality. Run the app on iOS, Android, and Web if possible.
5. **Lint your code**: Run `npm run lint` to ensure your code matches the project's style guidelines.
6. **Commit your changes**: Write clear, descriptive commit messages.
7. **Push to your fork** and submit a Pull Request.

## Development Setup

To set up the project locally, see the **Getting Started** section in the [README.md](./README.md).

## Project Structure

Understanding the project structure will help you navigate the codebase:

- `/app`: Contains all the screens and routing logic powered by Expo Router.
  - `(tabs)`: Main tab-based navigation screens.
- `/components`: Reusable UI components (buttons, cards, rows, navigation bars, etc.).
- `/assets`: Static assets like images, fonts, and the bundled SQLite database (`/db`).
- `/scripts`: Utility scripts for project maintenance.

## Coding Guidelines

- **TypeScript**: We use TypeScript. Please ensure your new code is properly typed and does not introduce `any` where it can be avoided.
- **Styling**: We use **NativeWind** (Tailwind CSS) for styling. Prefer Tailwind utility classes over inline `StyleSheet.create` where possible, especially for standard layout, spacing, typography, and colors.
- **Components**: Keep components small, focused, and reusable. If a file gets too large, consider breaking it down.
- **Responsive Design**: Ensure your UI additions look good on both small mobile screens and larger tablet/web views. We use `rem` based styling for scalability.
- **Theme Support**: Use theme-aware styling to ensure components look correct in both Light and Dark modes.

## Pull Request Process

1. Ensure your PR description clearly describes the problem and solution.
2. Link any relevant open issues in your PR.
3. Keep PRs small and focused on a single change or feature.
4. Reviewers may ask for changes or clarifications. Please be responsive!

Thank you for contributing!