import Head from "next/head";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

export default function Seo({ title, description = SITE_DESCRIPTION, path = "/", image, noIndex = false }) {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | Find jobs that match your resume`;
    const url = `${SITE_URL}${path}`;
    const imageUrl = image ? `${SITE_URL}${image}` : null;

    return (
        <Head>
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={url} />
            {noIndex && <meta name="robots" content="noindex" />}

            <meta property="og:type" content="website" />
            <meta property="og:site_name" content={SITE_NAME} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:url" content={url} />
            {imageUrl && <meta property="og:image" content={imageUrl} />}

            <meta name="twitter:card" content={imageUrl ? "summary_large_image" : "summary"} />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            {imageUrl && <meta name="twitter:image" content={imageUrl} />}
        </Head>
    );
}
