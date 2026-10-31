import { useState } from "react";
import styles from "./Match.module.css";

const MAX_LENGTH = 60;

export default function ChipEditor({ id, label, hint, items, onChange, max, placeholder, disabled }) {
    const [value, setValue] = useState("");
    const [error, setError] = useState(null);
    const atLimit = items.length >= max;

    const add = () => {
        const item = value.replace(/\s+/g, " ").trim().slice(0, MAX_LENGTH);
        if (!item) return;
        if (items.some((existing) => existing.toLowerCase() === item.toLowerCase())) {
            setError(`"${item}" is already in the list.`);
            return;
        }
        if (atLimit) {
            setError(`You can add up to ${max}.`);
            return;
        }
        onChange([...items, item]);
        setValue("");
        setError(null);
    };

    const remove = (item) => {
        onChange(items.filter((existing) => existing !== item));
        setError(null);
    };

    return (
        <div className={styles.chipEditor}>
            <div className={styles.chipEditorHeader}>
                <h3 className={styles.skillsTitle} id={`${id}-label`}>
                    {label} <span className={styles.count}>({items.length}/{max})</span>
                </h3>
                {hint && <p className={styles.helper}>{hint}</p>}
            </div>

            {items.length > 0 ? (
                <ul className={styles.chips} aria-labelledby={`${id}-label`}>
                    {items.map((item) => (
                        <li key={item} className={`badge ${styles.editableChip}`}>
                            <span>{item}</span>
                            <button
                                type="button"
                                className={styles.chipRemove}
                                onClick={() => remove(item)}
                                disabled={disabled}
                                aria-label={`Remove ${item}`}
                            >
                                <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                                </svg>
                            </button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className={styles.emptyChips}>None yet. Add one below.</p>
            )}

            <div className={styles.chipInputRow}>
                <label htmlFor={`${id}-input`} className="sr-only">Add to {label.toLowerCase()}</label>
                <input
                    id={`${id}-input`}
                    type="text"
                    className={styles.input}
                    value={value}
                    maxLength={MAX_LENGTH}
                    placeholder={placeholder}
                    disabled={disabled || atLimit}
                    onChange={(event) => {
                        setValue(event.target.value);
                        setError(null);
                    }}
                    onKeyDown={(event) => {
                        if (event.key === "Enter") {
                            event.preventDefault();
                            add();
                        }
                    }}
                    aria-describedby={error ? `${id}-error` : undefined}
                />
                <button
                    type="button"
                    className="btn btn--secondary btn--sm"
                    onClick={add}
                    disabled={disabled || atLimit || !value.trim()}
                >
                    Add
                </button>
            </div>
            {error && (
                <p id={`${id}-error`} className={styles.fieldError} role="alert">{error}</p>
            )}
        </div>
    );
}
