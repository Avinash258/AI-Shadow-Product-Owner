# AI Shadow Product Owner — Test Case Generator

Requirement-to-scenario generation with coverage and gap analysis — an AI assistant that behaves like a **shadow product owner** for quality engineering.

> Related RAG knowledge base: [RagBaseSolution](https://github.com/Avinash258/RagBaseSolution) · [Portfolio](https://avinash258.github.io/Protfolio/)

## Overview

Web app that turns user stories and requirements into structured test scenarios, highlights coverage gaps, and supports RAG-backed context so suggestions stay grounded in project knowledge. Built as a modern React + TypeScript front end with AI services behind it.

## Features

- Requirement / user-story intake
- Scenario generation with coverage and gap analysis
- Componentised UI for review and iteration
- Designed to pair with a RAG knowledge base for project-aware output

## Stack

- React · TypeScript · Vite
- AI services layer (`services/`)
- Tailwind-ready UI components

## Getting started

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
npm run preview
```

Configure your AI provider keys via the app’s environment / metadata as documented in `metadata.json` and local `.env` (do not commit secrets).

## Author

**Pushanshu Avinash Sharma** — QA Automation Architect / Lead SDET  
[GitHub](https://github.com/Avinash258) · [LinkedIn](https://www.linkedin.com/in/p-avinash-sharma-8b0203b9/) · [Portfolio](https://avinash258.github.io/Protfolio/)
