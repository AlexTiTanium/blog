/**
 * @file share-buttons island — copy-to-clipboard for the "Copy" button. Mounts on
 * `[data-component="share"]`. The click handler is a shared module function, so the same reference
 * mounts/unmounts cleanly across navigations.
 */
import type { Spa } from "@moku-labs/web";

/**
 * Briefly flip the button label to "Copied!" then restore it.
 *
 * @param button - The copy button element.
 * @example
 * showCopied(button);
 */
function showCopied(button: Element): void {
  const original = button.textContent;
  button.textContent = "Copied!";
  setTimeout(() => {
    button.textContent = original;
  }, 2000);
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
export const shareButtons: Spa.ComponentDef = {
  name: "share",
  hooks: {
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
      context.el
        .querySelector('[data-share="copy"]')
        ?.removeEventListener("click", handleCopyClick);
    }
  }
};
