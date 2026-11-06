declare module "*.css?inline" {
  const css: string;
  export default css;
}

declare module "turndown-plugin-gfm" {
  import type TurndownService from "turndown";
  export const gfm: TurndownService.Plugin;
}
