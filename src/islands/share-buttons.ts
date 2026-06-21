/**
 * @file share-buttons island — copy-to-clipboard for the "Copy" button. Mounts on
 * `[data-island="share"]`. The click handler is a shared module function, so the same reference
 * mounts/unmounts cleanly across navigations.
 */
import { createIsland } from "@moku-labs/web/browser";

/** Confirmation label shown on the copy button after a successful copy. */
const COPIED_LABEL = "Copied!";

/** How long the "Copied!" confirmation stays before the original label is restored (ms). */
const COPIED_FEEDBACK_MS = 2000;

/**
 * Briefly flip the button label to the confirmation, then restore it.
 *
 * @param button - The copy button element.
 * @example
 * showCopied(button);
 */
function showCopied(button: Element): void {
  const original = button.textContent;
  button.textContent = COPIED_LABEL;
  setTimeout(() => {
    button.textContent = original;
  }, COPIED_FEEDBACK_MS);
}

/**
 * Copy text to the clipboard, with a legacy `execCommand` fallback for older browsers.
 *
 * @param text - The text to copy.
 * @param button - The copy button (for the "Copied!" feedback).
 * @example
 * copy("https://example.com/", button);
 */
function copy(text: string, button: Element): void {
  if ("clipboard" in navigator) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        showCopied(button);
      })
      .catch(() => {
        /* clipboard write rejected — leave the label unchanged */
      });
    return;
  }
  const input = document.createElement("input");
  input.value = text;
  document.body.append(input);
  input.select();
  document.execCommand("copy");
  input.remove();
  showCopied(button);
}

/**
 * Handle a click on the copy button: copy its `data-copy-url` to the clipboard.
 *
 * @param event - The click event (its `currentTarget` is the copy button).
 * @example
 * copyButton.addEventListener("click", handleCopyClick);
 */
function handleCopyClick(event: Event): void {
  const button = event.currentTarget as HTMLElement;
  const url = button.dataset.copyUrl;
  if (url === undefined || url === "") return;
  copy(url, button);
}

/** Share-buttons island: wires the copy-link button to the Clipboard API (with a legacy fallback). */
export const shareButtons = createIsland("share", {
  /**
   * Bind the copy-link click handler when the share bar mounts.
   *
   * @param context - The island lifecycle context.
   * @example
   * onMount(context);
   */
  onMount(context) {
    context.el.querySelector('[data-share="copy"]')?.addEventListener("click", handleCopyClick);
  },
  /**
   * Remove the copy-link click handler when the share bar is destroyed.
   *
   * @param context - The island lifecycle context.
   * @example
   * onDestroy(context);
   */
  onDestroy(context) {
    context.el.querySelector('[data-share="copy"]')?.removeEventListener("click", handleCopyClick);
  }
});
