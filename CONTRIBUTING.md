Use the pinned Node release in .node-version. Run npm test, npm run check and npm pack before changing a consumer. Keep native runtimes and game assets outside this repository. Browser tests accept BGP_PLAYWRIGHT and BGP_CHROME to reuse local tooling; tests/browser.mjs takes a frozen bundle server URL and evidence directory. Do not rewrite engine allocators or emulator fidelity algorithms while changing the shell.

AI-assisted contributions should record the actual tool version, model and reasoning effort in the commit trailer.
