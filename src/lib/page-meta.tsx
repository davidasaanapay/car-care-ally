import { Helmet } from "react-helmet-async";

export interface PageMetaProps {
  title?: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
}

export function PageMeta({ title, description, ogTitle, ogDescription, ogImage }: PageMetaProps) {
  return (
    <Helmet>
      {title && <title>{title}</title>}
      {description && <meta name="description" content={description} />}
      {(ogTitle || title) && <meta property="og:title" content={ogTitle ?? title!} />}
      {(ogDescription || description) && (
        <meta property="og:description" content={ogDescription ?? description!} />
      )}
      {ogImage && <meta property="og:image" content={ogImage} />}
      {ogImage && <meta name="twitter:image" content={ogImage} />}
    </Helmet>
  );
}
