# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.

## Scenario sources

Use **New Scenario** in the app to generate a scenario with the selected AI provider or the built-in offline synthesizer. **Surprise me** creates one from a curated set of practice prompts. **Find online** searches GitHub, Stack Overflow, and Wikipedia; select a result to synthesize a complete practice scenario from it. You can also import a public URL (GitHub repositories are supported directly; other websites must permit browser access) or add a scenario manually.

Online search and URL import require an internet connection. Imported scenarios keep a link to their source in the scenario banner and library.
