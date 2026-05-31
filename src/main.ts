/**
 * @file Framework JS bundle entry. The framework's bundle phase discovers `src/main.ts` by
 * convention (the build config exposes no entry override); the real SPA boot lives in src/spa/.
 */
import "./spa/index";
