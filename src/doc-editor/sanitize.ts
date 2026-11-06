import DOMPurify from "dompurify";

/**
 * Stored HTML is rendered with dangerouslySetInnerHTML, so it must be cleaned
 * first. DOMPurify needs a DOM: call this in the browser only.
 */
export const sanitizeHtml = (html: string) =>
  DOMPurify.sanitize(html, { ADD_ATTR: ["target"] });

export const stripTags = (html: string) =>
  html
    .replace(/<[^>]*>/g, " ")
    .replace(/[<>]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
