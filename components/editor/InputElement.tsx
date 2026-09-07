import type {
    CSSProperties,
    InputHTMLAttributes,
    PointerEventHandler,
    MouseEventHandler,
    FocusEventHandler,
} from "react";

export type BuilderInputType =
    | "text"
    | "email"
    | "password"
    | "number"
    | "tel"
    | "url"
    | "search"
    | "date"
    | "time";

export interface InputElementProps
    extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
    inputType?: BuilderInputType;
}

export default function InputElement({
    inputType = "text",
    value,
    style,
    className,
    ...props
}: InputElementProps) {
    const safeType: BuilderInputType = [
        "text",
        "email",
        "password",
        "number",
        "tel",
        "url",
        "search",
        "date",
        "time",
    ].includes(inputType)
        ? inputType
        : "text";

    /*
     * The builder's Canvas owns selection, dragging and resizing.
     * Native input hit-testing would otherwise let the browser consume
     * the pointer gesture, causing the parent Section/Hero to be selected
     * and making the canvas jump during the gesture.
     *
     * Keep the native input visually faithful, but let the Canvas wrapper
     * receive pointer events.
     */
    const canvasStyle: CSSProperties = {
        boxSizing: "border-box",
        pointerEvents: "none",
        ...style,
    };

    const interactionProps = {
        ...(props as Omit<
            InputHTMLAttributes<HTMLInputElement>,
            "type"
        >),
    };

    return (
        <input
            {...interactionProps}
            type={safeType}
            defaultValue={value as string | number | readonly string[] | undefined}
            style={canvasStyle}
            className={className}
            aria-label="Input element preview"
        />
    );
}
