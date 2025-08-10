import fs from 'fs';
import path from 'path';
/**
 * Recursively loads all controllers from a directory
 * @param {string} dir - path to the directory containing controllers
 * @returns {Function[]} - an array of controller functions
 */
export function loadControllers(dir: string): Function[] {
    const controllers: Function[] = [];

    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);

        if (fs.statSync(fullPath).isDirectory()) {
            controllers.push(...loadControllers(fullPath));
        } else if (file.endsWith('.controller.ts') || file.endsWith('.controller.js')) {
            const module = require(fullPath);
            for (const exported of Object.values(module)) {
                if (typeof exported === 'function') {
                    controllers.push(exported);
                }
            }
        }
    }

    return controllers;
}

/**
 * Recursively loads all middlewares from a directory
 * @param {string} dir - path to the directory containing middlewares
 * @returns {Function[]} - an array of middleware functions
 */
export function loadMiddlewares(dir: string): Function[] {
    const middlewares: Function[] = [];

    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);

        if (fs.statSync(fullPath).isDirectory()) {
            middlewares.push(...loadMiddlewares(fullPath));
        } else if (file.endsWith('.middleware.ts') || file.endsWith('.middleware.js')) {
            const module = require(fullPath);
            for (const exported of Object.values(module)) {
                if (typeof exported === 'function') {
                    middlewares.push(exported);
                }
            }
        }
    }

    return middlewares;
}
