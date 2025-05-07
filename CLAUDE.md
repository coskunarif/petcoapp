# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands
- Install: `cd frontend && npm install`
- Start: `npm start`
- Android: `npm run android`
- iOS: `npm run ios`
- Web: `npm run web`

## Code Style Guidelines
- Use platform-specific extensions: `.tsx` (default), `.native.tsx` (React Native)
- Components: PascalCase (e.g., `PetCard.tsx`)
- Files/folders: camelCase (e.g., `petsService.ts`)
- Constants: UPPER_SNAKE_CASE (e.g., `MAX_UPLOAD_SIZE`)
- Use TypeScript interfaces for component props
- Organize Redux code by feature in `redux/slices`
- StyleSheet objects at bottom of component files
- Follow React Native Paper design system
- Primary color: #6C63FF
- Error handling: Use try/catch with specific error messages
- Components prefer destructured props with defaults