/**
 * Resolve the element that actually scrolls a given node.
 *
 * The native shell never scrolls the document — MobileShell renders every page
 * into a `<main>` with `overflow-y: auto`, so `window.scrollTo` / `scrollY` are
 * dead there. The website DOES scroll the document. One helper covers both so
 * shared page code can move "the scroller" without knowing which shell it is in.
 */
export function resolveScroller(el: Element | null): HTMLElement | null {
  let node: HTMLElement | null = (el as HTMLElement | null)?.parentElement ?? null;
  while (node) {
    const oy = getComputedStyle(node).overflowY;
    // Deliberately NOT gated on `scrollHeight > clientHeight` (PullToRefresh's
    // findScroller is): during a branch swap the incoming content can be shorter
    // than the viewport for one frame, and we still need the element that MANAGES
    // the offset — the one holding a stale scrollTop we have to clear.
    if (oy === "auto" || oy === "scroll" || oy === "overlay") return node;
    node = node.parentElement;
  }
  return (document.scrollingElement as HTMLElement | null) ?? null;
}
