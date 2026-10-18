import styles from "./Match.module.css";

function getPageItems(current, total) {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

    const pages = new Set([1, total, current - 1, current, current + 1]);
    const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);

    const items = [];
    sorted.forEach((page, index) => {
        if (index > 0 && page - sorted[index - 1] > 1) items.push(`gap-${page}`);
        items.push(page);
    });
    return items;
}

export default function Pagination({ page, totalPages, onChange }) {
    if (totalPages <= 1) return null;

    return (
        <nav className={styles.pagination} aria-label="Results pages">
            <button
                type="button"
                className="btn btn--secondary btn--sm"
                onClick={() => onChange(page - 1)}
                disabled={page === 1}
            >
                <span aria-hidden="true">←</span> Previous
            </button>

            <ul className={styles.pageList}>
                {getPageItems(page, totalPages).map((item) =>
                    typeof item === "string" ? (
                        <li key={item} className={styles.pageGap} aria-hidden="true">…</li>
                    ) : (
                        <li key={item}>
                            <button
                                type="button"
                                className={`${styles.pageButton} ${item === page ? styles.pageButtonActive : ""}`}
                                onClick={() => onChange(item)}
                                aria-label={`Page ${item}`}
                                aria-current={item === page ? "page" : undefined}
                            >
                                {item}
                            </button>
                        </li>
                    )
                )}
            </ul>

            <button
                type="button"
                className="btn btn--secondary btn--sm"
                onClick={() => onChange(page + 1)}
                disabled={page === totalPages}
            >
                Next <span aria-hidden="true">→</span>
            </button>
        </nav>
    );
}
