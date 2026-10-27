# CSC 436 Week 10: Supabase + TypeScript (Oct 27 and Oct 29)

The Recipe Box API gets a real database on Tuesday and real types on Thursday. Built slow, for students who have never used a database or TypeScript, with a student code-along guide for every step Adam types live.

## What is in here

    Pantry-Field-Guide.docx          Student handout for BOTH days: vocabulary, SQL basics, supabase-js
                                     cheat sheet, TypeScript basics, and an error decoder

    tue-supabase-crud/               Tuesday deck (Vite). Mission 9: Supabase CRUD from Express
      docs/
        Mission9-Instructor-Walkthrough.docx   run of show, scripts, every line to type, deliberate
                                               mistakes, error field table, Brightspace posts
        Mission9-Code-Along-Guide.docx         STUDENT step-by-step that mirrors the live code
        Mission9-Stock-the-Pantry-Assignment.docx

    thu-typescript/                  Thursday deck (Vite). Mission 10: TypeScript via generated types
      docs/
        Mission10-Instructor-Walkthrough.docx
        Mission10-Code-Along-Guide.docx
        Mission10-Label-Every-Jar-Assignment.docx

    examples/recipe-box-api/         The code-along, saved as checkpoints 00 to 09
      setup.sql                      Run once in the Supabase SQL Editor (Tuesday)
      add-servings.sql               Thursday's schema-change demo
      requests.http                  Every route, good and bad
      checkpoints/                   00-start ... 05-filters (Tue), 06-typed-client ... 09-servings (Thu)

## Before Tuesday

1. Make your own Supabase project, run `examples/recipe-box-api/setup.sql`, copy `.env.example` to `.env` and fill it in.
2. `cd examples/recipe-box-api && npm install`, then `npm run cp01` through `npm run cp05` once each.
3. `npm install` in both deck folders. `npm run dev` to present.
4. Post the pre-class announcement from the Tuesday instructor walkthrough (Supabase account, Node 22.18+).

## Requirements

Node 22.18 or newer (Node 24 LTS recommended). supabase-js needs Node 22, and Thursday runs `.ts` files directly in Node.

ESM throughout. No require() or module.exports anywhere.
