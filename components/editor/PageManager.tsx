"use client";

import { useEditorStore } from "@/store/editorStore";

export default function PageManager() {
    const project = useEditorStore(
        (state) => state.project
    );

    const setActivePage = useEditorStore(
        (state) => state.setActivePage
    );

    const createPage = useEditorStore(
        (state) => state.createPage
    );

    const renamePage = useEditorStore(
        (state) => state.renamePage
    );

    const duplicatePage = useEditorStore(
        (state) => state.duplicatePage
    );

    const deletePage = useEditorStore(
        (state) => state.deletePage
    );

    const pages = Object.values(project.pages);

    const handleCreatePage = () => {
        createPage("New Page");
    };

    const handleRenamePage = (
        pageId: string,
        currentName: string
    ) => {
        const newName = window.prompt(
            "Enter page name:",
            currentName
        );

        if (!newName?.trim()) {
            return;
        }

        renamePage(
            pageId,
            newName.trim()
        );
    };

    const handleDeletePage = (
        pageId: string
    ) => {
        const page =
            project.pages[pageId];

        if (!page) {
            return;
        }

        const confirmed =
            window.confirm(
                `Delete "${page.name}"?`
            );

        if (!confirmed) {
            return;
        }

        deletePage(pageId);
    };

    return (
        <div
            className="
                flex
                min-w-0
                shrink-0
                items-center
                border-b
                bg-white
            "
        >
            {/* =============================================
                PAGE LABEL
            ============================================= */}

            <div
                className="
                    flex
                    h-10
                    shrink-0
                    items-center
                    border-r
                    px-3
                    text-sm
                    font-semibold
                    text-gray-700
                "
            >
                Pages
            </div>

            {/* =============================================
                PAGE TABS
            ============================================= */}

            <div
                className="
                    min-w-0
                    flex-1
                    overflow-x-auto
                    overflow-y-hidden
                "
            >
                <div
                    className="
                        flex
                        min-w-max
                        items-center
                        gap-1
                        px-2
                    "
                >
                    {pages.map((page) => {
                        const isActive =
                            page.id ===
                            project.activePageId;

                        return (
                            <div
                                key={page.id}
                                className={`
                                    group
                                    flex
                                    h-9
                                    shrink-0
                                    items-center
                                    rounded-md
                                    border
                                    ${isActive
                                        ? "border-gray-300 bg-gray-100"
                                        : "border-transparent hover:bg-gray-50"
                                    }
                                `}
                            >
                                {/* =================================
                                    PAGE TAB
                                ================================= */}

                                <button
                                    type="button"
                                    onClick={() =>
                                        setActivePage(
                                            page.id
                                        )
                                    }
                                    className={`
                                        flex
                                        h-full
                                        max-w-40
                                        items-center
                                        gap-1.5
                                        truncate
                                        px-3
                                        text-sm
                                        ${isActive
                                            ? "font-semibold text-gray-900"
                                            : "text-gray-600"
                                        }
                                    `}
                                    title={
                                        page.name
                                    }
                                >
                                    <span
                                        className={
                                            isActive
                                                ? "text-black"
                                                : "text-gray-400"
                                        }
                                    >
                                        {isActive
                                            ? "●"
                                            : "○"}
                                    </span>

                                    <span className="truncate">
                                        {
                                            page.name
                                        }
                                    </span>
                                </button>

                                {/* =================================
                                    PAGE ACTIONS
                                ================================= */}

                                <button
                                    type="button"
                                    onClick={() =>
                                        handleRenamePage(
                                            page.id,
                                            page.name
                                        )
                                    }
                                    title="Rename page"
                                    className="
                                        hidden
                                        h-7
                                        w-7
                                        shrink-0
                                        items-center
                                        justify-center
                                        rounded
                                        text-xs
                                        text-gray-500
                                        hover:bg-white
                                        hover:text-gray-900
                                        group-hover:flex
                                    "
                                >
                                    ✎
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        duplicatePage(
                                            page.id
                                        )
                                    }
                                    title="Duplicate page"
                                    className="
                                        hidden
                                        h-7
                                        w-7
                                        shrink-0
                                        items-center
                                        justify-center
                                        rounded
                                        text-xs
                                        text-gray-500
                                        hover:bg-white
                                        hover:text-gray-900
                                        group-hover:flex
                                    "
                                >
                                    ⧉
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        handleDeletePage(
                                            page.id
                                        )
                                    }
                                    title="Delete page"
                                    className="
                                        hidden
                                        h-7
                                        w-7
                                        shrink-0
                                        items-center
                                        justify-center
                                        rounded
                                        text-sm
                                        text-gray-500
                                        hover:bg-white
                                        hover:text-red-600
                                        group-hover:flex
                                    "
                                >
                                    ×
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* =============================================
                ADD PAGE
            ============================================= */}

            <div
                className="
                    flex
                    h-10
                    shrink-0
                    items-center
                    border-l
                    px-2
                "
            >
                <button
                    type="button"
                    onClick={
                        handleCreatePage
                    }
                    className="
                        shrink-0
                        rounded-md
                        border
                        border-gray-300
                        bg-white
                        px-3
                        py-1.5
                        text-xs
                        font-medium
                        text-gray-700
                        transition
                        hover:bg-gray-50
                    "
                >
                    + Add Page
                </button>
            </div>
        </div>
    );
}