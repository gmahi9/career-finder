/** Career id to a guide on the articles site. Unknown ids use the index. */
export const ARTICLES_INDEX = "https://aiteksolutions.net/articles";

export const articleLinks: Record<string, string> = {};

export function guideUrl(careerId: string): string {
  return articleLinks[careerId] ?? ARTICLES_INDEX;
}
