# Workflow Doctor

AI-powered diagnostic tool for n8n workflows that treats automation workflows as code.

## Overview

Interactive diagnostic tool that uploads n8n JSON exports, visualizes node graphs using React Flow, and uses local AI (Ministral-3B) to suggest performance optimizations and fix error handling gaps.

## Tech Stack

- **n8n Integration**: JSON workflow parsing
- **AI Tooling**: Local LLM for diagnostics
- **React Flow**: Interactive graph visualization
- **Ministral-3B**: Fine-tuned on n8n documentation

## The Problem

Complex n8n workflows often contain hidden logic bombs—unhandled errors, race conditions, or N+1 query patterns—that only explode in production. Visual editors make these hard to spot.

## The Solution

An AI Linter that parses the workflow's JSON structure into a graph. It uses a local model (Ministral-3B) fine-tuned on n8n documentation to analyze node interactions and suggest structural fixes.

## Business Value

- Reduces debugging time from hours to minutes
- Prevents silent failures in critical automation pipelines
- Identifies error-handling gaps before deployment

## AI Integration

The AI doesn't just look at text; it understands the *topology* of the graph. It can spot issues like 'loops without breaks' or 'parallel execution limits' by analyzing the node connections.

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
