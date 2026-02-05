// Faker.js template parsing and data generation
import { faker } from '@faker-js/faker';

// Regex to match {{faker.module.method()}} or {{faker.module.method(args)}}
const FAKER_TEMPLATE_REGEX = /\{\{faker\.([a-zA-Z]+)\.([a-zA-Z]+)\((.*?)\)\}\}/g;

/**
 * Process a string and replace Faker templates with generated values
 * @param {string} template - String containing {{faker.x.y()}} templates
 * @returns {string} - String with templates replaced by generated values
 */
export function processTemplate(template) {
  if (typeof template !== 'string') {
    return template;
  }

  return template.replace(FAKER_TEMPLATE_REGEX, (_match, module, method, args) => {
    try {
      const fakerModule = faker[module];
      if (!fakerModule || typeof fakerModule[method] !== 'function') {
        console.warn(`[Faker] Unknown method: faker.${module}.${method}`);
        return `[Unknown: faker.${module}.${method}]`;
      }

      // Parse arguments if provided
      let parsedArgs = [];
      if (args && args.trim()) {
        try {
          // Wrap in array brackets and parse as JSON
          parsedArgs = JSON.parse(`[${args}]`);
        } catch {
          // If parsing fails, treat as single string argument
          parsedArgs = [args.trim()];
        }
      }

      return fakerModule[method](...parsedArgs);
    } catch (error) {
      console.error(`[Faker] Error generating: faker.${module}.${method}()`, error);
      return `[Error: faker.${module}.${method}]`;
    }
  });
}

/**
 * Recursively process an object/array, replacing Faker templates in string values
 * @param {any} data - Object, array, or primitive to process
 * @returns {any} - Processed data with Faker templates replaced
 */
export function processBody(data) {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data === 'string') {
    return processTemplate(data);
  }

  if (Array.isArray(data)) {
    return data.map((item) => processBody(item));
  }

  if (typeof data === 'object') {
    const result = {};
    for (const [key, value] of Object.entries(data)) {
      result[key] = processBody(value);
    }
    return result;
  }

  // Primitives (number, boolean) pass through unchanged
  return data;
}

/**
 * Get list of available Faker modules and methods for documentation/hints
 */
export function getAvailableFakerMethods() {
  const methods = {};

  const commonModules = [
    'person',
    'internet',
    'lorem',
    'date',
    'number',
    'string',
    'commerce',
    'company',
    'location',
    'phone',
    'image',
  ];

  for (const moduleName of commonModules) {
    const module = faker[moduleName];
    if (module) {
      methods[moduleName] = Object.keys(module).filter(
        (key) => typeof module[key] === 'function' && !key.startsWith('_'),
      );
    }
  }

  return methods;
}
