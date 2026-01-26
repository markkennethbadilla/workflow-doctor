# Workflow Doctor

AI-powered diagnostic tool for n8n workflows that treats automation workflows as code.

## Overview

Interactive diagnostic tool that uploads n8n JSON exports, visualizes node graphs using React Flow, and uses local AI to suggest performance optimizations and fix error handling gaps.

## Tech Stack

- **n8n Integration**: JSON workflow parsing
- **AI Tooling**: Local LLM for diagnostics
- **React Flow**: Interactive graph visualization

## The Problem

Complex n8n workflows often contain hidden logic bombs—unhandled errors, race conditions, or N+1 query patterns—that only explode in production. Visual editors make these hard to spot.

## The Solution

An AI Linter that parses the workflow's JSON structure into a graph. It uses a local model fine-tuned on n8n documentation to analyze node interactions and suggest structural fixes.

## Business Value

- Reduces debugging time from hours to minutes
- Prevents silent failures in critical automation pipelines
- Identifies error-handling gaps before deployment

## AI Integration

The analysis engine combines **Large Language Models** with **Deterministic Heuristics**:

1.  **Deterministic Scoring**: Analyzes the graph topology for concrete anti-patterns (loops, missing error handlers, trigger hygiene) to generate a quantitative health score.
2.  **LLM Insights**: Uses local AI to provide qualitative suggestions (e.g., "Replace complex function node with built-in filter").

## Features

- Upload n8n workflow JSON
- Interactive graph visualization
- AI-powered diagnostics and suggestions
- Performance optimization hints
- Error handling gap detection

## Development

This is a standalone project repository linked from the main portfolio at [markkennethbadilla.com](https://markkennethbadilla.com).

## License

MIT
