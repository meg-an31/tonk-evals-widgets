import { z } from 'zod';
import { ls, mkDir, readDoc, writeDoc } from './shim.js';
import { setWidgetPath, getWidgetPath } from './deterministic-tests.js';
export class WidgetMCPServer {
    tools = new Map();
    widgetsBasePath = 'widgets';
    constructor() {
        this.setupTools();
    }
    addTool(tool) {
        this.tools.set(tool.name, tool);
    }
    setupTools() {
        // Tool to write widget files
        this.addTool({
            name: 'write_widget_file',
            description: 'Write a file to the widgets directory',
            inputSchema: z.object({
                path: z.string().describe('Relative path within widgets directory'),
                content: z.string().describe('File content to write'),
                encoding: z.enum(['utf8', 'base64']).default('utf8').describe('File encoding'),
            }),
            handler: async (args) => {
                const { path: filePath, content, encoding } = args;
                // Security: Normalize and validate path
                const normalizedPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
                const fullPath = `${this.widgetsBasePath}/${normalizedPath}`;
                try {
                    // Write file
                    /* writeDoc(`/widgets/${normalizedPath}`, {
                      content,
                      encoding,
                      timestamp: Date.now(),
                    }); */
                    writeDoc(`widgets/${normalizedPath}`, content, encoding);
                    
                   
                    return {
                        content: [{
                                type: 'text',
                                text: JSON.stringify({
                                    path: filePath,
                                    fullPath,
                                    size: content.length,
                                    message: `Successfully wrote ${content.length} bytes to ${filePath}`
                                })
                            }]
                    };
                }
                catch (error) {
                    throw new Error(`Failed to write file: ${error instanceof Error ? error.message : 'Unknown error'}`);
                }
            }
        });
        // Tool to read widget files
        this.addTool({
            name: 'read_widget_file',
            description: 'Read a file from the widgets directory',
            inputSchema: z.object({
                path: z.string().describe('Relative path within widgets directory'),
                encoding: z.enum(['utf8', 'base64']).default('utf8').describe('File encoding'),
            }),
            handler: async (args) => {
                const { path: filePath } = args;
                // Security: Normalize and validate path
                const normalizedPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
                const fullPath = `${this.widgetsBasePath}/${normalizedPath}`;
                try {
                    // READDOC CHANGE
                    const doc = await readDoc(fullPath);
                    //const doc = await readDoc<{ content: string; encoding: string; timestamp: number }>(fullPath);
                    if (!doc)
                        throw new Error(`File not found: ${filePath}`);
                    return {
                        content: [{
                                type: 'text',
                                text: JSON.stringify({
                                    path: filePath,
                                    content: doc.content,
                                    size: doc.content.length,
                                    modified: new Date(Date.now()).toISOString()
                                })
                            }]
                    };
                }
                catch (error) {
                    throw new Error(`Failed to read file: ${error instanceof Error ? error.message : 'Unknown error'}`);
                }
            }
        });
        // Tool to list widget directory contents
        this.addTool({
            name: 'list_widget_directory',
            description: 'List contents of a directory within widgets',
            inputSchema: z.object({
                path: z.string().default('').describe('Relative path within widgets directory (empty for root)'),
            }),
            handler: async (args) => {
                const { path: dirPath } = args;
                // Security: Normalize and validate path
                const normalizedPath = (dirPath.startsWith('/') ? dirPath.slice(1) : dirPath) || '';
                const fullPath = normalizedPath ? `${this.widgetsBasePath}/${normalizedPath}` : this.widgetsBasePath;
                // EDITED HERE 
                try {
                    // used to be const docNode
                    const items = await ls(fullPath);
                    if (!items)
                        throw new Error(`Directory not found: ${normalizedPath}`);
                    /* const items = (docNode.children || []).map(child => ({
                      name: child.name,
                      type: child.type === 'dir' ? 'directory' : 'file',
                      path: path.join(dirPath, child.name)
                    })); */
                    return {
                        content: [{
                                type: 'text',
                                text: JSON.stringify({
                                    path: dirPath,
                                    items
                                })
                            }]
                    };
                }
                catch (error) {
                    throw new Error(`Failed to list directory: ${error instanceof Error ? error.message : 'Unknown error'}`);
                }
            }
        });
        // Tool to read comprehensive widget templates
        this.addTool({
            name: 'read_widget_templates',
            description: 'Read all widget templates including component and index templates with guidelines',
            inputSchema: z.object({
                templateType: z.enum(['component', 'index', 'all']).default('all').describe('Type of template to read'),
            }),
            handler: async (args) => {
                const { templateType } = args;
                try {
                    const templates = {};
                    if (templateType === 'component' || templateType === 'all') {
                        // READDOC CHANGE
                        const componentDoc = await readDoc('widgets/templates/component-template.tsx');
                        //const componentDoc = await readDoc<{ content: string; encoding: string; timestamp: number }>('/widgets/templates/component-template.tsx');
                        if (componentDoc) {
                            templates.component = componentDoc.content;
                        }
                    }
                    if (templateType === 'index' || templateType === 'all') {
                        // READDOC CHANGE
                        const indexDoc = await readDoc('widgets/templates/index-template.ts');
                        //const indexDoc = await readDoc<{ content: string; encoding: string; timestamp: number }>('/widgets/templates/index-template.ts');
                        if (indexDoc) {
                            templates.index = indexDoc.content;
                        }
                    }
                    return {
                        content: [{
                                type: 'text',
                                text: JSON.stringify({
                                    templates,
                                    importPaths: {
                                        BaseWidget: "import BaseWidget from '../../templates/BaseWidget';",
                                        WidgetProps: "import { WidgetProps } from '../../index';",
                                        React: "import React, { useState, useEffect } from 'react';"
                                    },
                                    guidelines: [
                                        "Always use the exact import paths shown above",
                                        "Extend WidgetProps interface for custom props",
                                        "Use BaseWidget as the root component",
                                        "Follow the component structure in the template",
                                        "Include proper TypeScript typing",
                                        "Use Tailwind CSS for styling",
                                        "Replace MyWidget with your actual widget name",
                                        "Update the widget ID, name, and description in index.js",
                                        "Set appropriate default width and height",
                                        "Include proper state management with useState",
                                        "Add useEffect for initialization and cleanup",
                                        "Use theme and size props for customization",
                                        "CRITICAL: Always provide unique 'key' props when rendering arrays or lists",
                                        "CRITICAL: Use map() with proper keys: items.map((item, index) => <div key={item.id || index}>...)",
                                        "CRITICAL: Avoid creating implicit JSX arrays - use single elements or proper keyed arrays",
                                        "CRITICAL: When using conditional rendering with multiple elements, wrap in fragments or single containers",
                                        "CRITICAL: For dynamic lists, use stable unique identifiers as keys, not just array indices when possible", 
                                        "CRITICAL: Find more detailed information on how to use the software in the read_documentation tool"
                                    ]
                                })
                            }]
                    };
                }
                catch (error) {
                    throw new Error(`Failed to read widget templates: ${error instanceof Error ? error.message : 'Unknown error'}`);
                }
            }
        });
        // Tool to read documentation 
        this.addTool({
            name: 'read_documentation',
            description: 'Read all documentation for insights on how to build widgets',
            inputSchema: z.object({
                templateType: z.enum(['components', 'instructions', 'modules', 'server', 'stores', 'views', 'overview']).default('overview').describe('Type of doc to read'),
            }),
            handler: async (args) => {
                const { templateType } = args;
                try {
                    const templates = {};
                    console.warn("LLM read doc", templateType);
                    if (templateType === 'overview') {
                        // READDOC CHANGE
                        const overviewDoc = await readDoc('llms/shared/README.md');
                        //const componentDoc = await readDoc<{ content: string; encoding: string; timestamp: number }>('/widgets/templates/component-template.tsx');
                        if (overviewDoc) {
                            templates.overview = overviewDoc.content;
                        }
                    }
                    if (templateType === 'views') {
                        // READDOC CHANGE
                        const viewsDoc = await readDoc('llms/shared/views.md');
                        //const indexDoc = await readDoc<{ content: string; encoding: string; timestamp: number }>('/widgets/templates/index-template.ts');
                        if (viewsDoc) {
                            templates.views = viewsDoc.content;
                        }
                    }
                    if (templateType === 'stores') {
                        // READDOC CHANGE
                        const storesDoc = await readDoc('llms/shared/stores.md');
                        //const indexDoc = await readDoc<{ content: string; encoding: string; timestamp: number }>('/widgets/templates/index-template.ts');
                        if (storesDoc) {
                            templates.stores = storesDoc.content;
                        }
                    }
                    if (templateType === 'modules') {
                        // READDOC CHANGE
                        const modulesDoc = await readDoc('llms/shared/modules.md');
                        //const indexDoc = await readDoc<{ content: string; encoding: string; timestamp: number }>('/widgets/templates/index-template.ts');
                        if (modulesDoc) {
                            templates.modules = modulesDoc.content;
                        }
                    }
                    if (templateType === 'server') {
                        // READDOC CHANGE
                        const serverDoc = await readDoc('llms/shared/server.md');
                        //const indexDoc = await readDoc<{ content: string; encoding: string; timestamp: number }>('/widgets/templates/index-template.ts');
                        if (serverDoc) {
                            templates.server = serverDoc.content;
                        }
                    }
                    if (templateType === 'instructions') {
                        // READDOC CHANGE
                        const instructionsDoc = await readDoc('llms/shared/instructions.md');
                        //const indexDoc = await readDoc<{ content: string; encoding: string; timestamp: number }>('/widgets/templates/index-template.ts');
                        if (instructionsDoc) {
                            templates.instructions = instructionsDoc.content;
                        }
                    }
                    if (templateType === 'components') {
                        // READDOC CHANGE
                        const componentsDoc = await readDoc('llms/shared/components.md');
                        //const indexDoc = await readDoc<{ content: string; encoding: string; timestamp: number }>('/widgets/templates/index-template.ts');
                        if (componentsDoc) {
                            templates.components = componentsDoc.content;
                        }
                    }
                    return {
                        content: [{
                                type: 'text',
                                text: JSON.stringify({
                                    templates,
                                    guidelines: [
                                        "Follow the instructions in the documentation"
                                    ]
                                })
                            }]
                    };
                }
                catch (error) {
                    throw new Error(`Failed to read documentation: ${error instanceof Error ? error.message : 'Unknown error'}`);
                }
            }
        });
    }
    async executeTool(name, args) {
        const tool = this.tools.get(name);
        if (!tool) {
            throw new Error(`Tool ${name} not found`);
        }
        // Validate input
        const validatedArgs = tool.inputSchema.parse(args);
        // Execute tool
        return await tool.handler(validatedArgs);
    }
    getTools() {
        const result = {};
        for (const [name, tool] of this.tools) {
            result[name] = {
                description: tool.description,
                inputSchema: tool.inputSchema
            };
        }
        return result;
    }
    async start() {
        // Ensure widgets directory exists
        try {
            await mkDir(this.widgetsBasePath);
            console.log(`Widget MCP Server initialized.`);
        }
        catch (error) {
            console.error('Failed to create widgets directory:', error);
            throw error;
        }
    }
}

