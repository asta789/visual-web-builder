import { Project } from "./type";

export const defaultProject: Project = {
    id: "project-1",

    name: "My Website",

    activePageId: "page-home",

    assets: {},

    designTokens: {},

    reusableStyles: {},

    pages: {
        "page-home": {
            id: "page-home",
            name: "Home",
            rootNodeId: "node-root",
        },
    },

    nodes: {
        "node-root": {
            id: "node-root",
            type: "page",
            name: "Home",
            children: ["node-section"],
        },

        "node-section": {
            id: "node-section",
            type: "section",
            name: "Hero Section",
            parentId: "node-root",
            children: ["node-heading", "node-description", "node-button"],
            styles: {
                paddingTop: "80px",
                paddingRight: "40px",
                paddingBottom: "80px",
                paddingLeft: "40px",
                backgroundColor: "#ffffff",
                textAlign: "center",
            },
        },

        "node-heading": {
            id: "node-heading",
            type: "text",
            name: "Heading",
            parentId: "node-section",
            content: "Build Your Website",
            styles: {
                fontSize: "48px",
                fontWeight: "700",
                color: "#111111",
                marginBottom: "20px",
            },
        },

        "node-description": {
            id: "node-description",
            type: "text",
            name: "Description",
            parentId: "node-section",
            content: "Create beautiful websites visually.",
            styles: {
                fontSize: "20px",
                color: "#555555",
                marginBottom: "30px",
            },
        },

        "node-button": {
            id: "node-button",
            type: "button",
            name: "Button",
            parentId: "node-section",
            content: "Get Started",
            styles: {
                backgroundColor: "#111111",
                color: "#ffffff",
                paddingTop: "12px",
                paddingRight: "24px",
                paddingBottom: "12px",
                paddingLeft: "24px",
                borderRadius: "8px",
            },
        },
    },
};