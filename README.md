# Kuya Bong's Car Selection

A simple marketplace for browsing, filtering, and comparing pre-owned vehicles. The app showcases a catalog of used cars with detailed listing pages, seller contact information, search and filter controls, and a comparison tool for up to three vehicles.

## Features

- Browse a catalog of used vehicles with price, mileage, year, condition, and location
- Filter listings by make, model, year range, price range, body type, fuel type, transmission, and condition
- Search by keywords across model, features, and descriptions
- Open detailed vehicle pages with image galleries, seller remarks, and contact options
- Select multiple vehicles to compare specifications side-by-side
- Includes separate frontend areas for the customer-facing marketplace and back-office management

## Project Structure

- `src/web/`: public marketplace frontend built with React and TypeScript
- `src/admin/`: admin dashboard frontend for inventory and event management
- `src/server/`: backend API and data models, including Flask routes and database utilities
- `packages/shared/` (`@repo/shared`): shared TypeScript enums, types, and React hooks used by both frontend apps

## Purpose

This project is a development-stage used car marketplace with a polished interface for buyers, and a backend structure to support inventory and seller workflows.
