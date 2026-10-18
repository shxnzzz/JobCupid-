import Navbar from "./Navbar";
import Footer from "./Footer";
import styles from "./Layout.module.css";

export default function Layout({ children }) {
    return (
        <div className={styles.shell}>
            <a href="#main-content" className="skip-link">
                Skip to main content
            </a>
            <Navbar />
            <main id="main-content" tabIndex={-1} className={styles.main}>
                {children}
            </main>
            <Footer />
        </div>
    );
}
