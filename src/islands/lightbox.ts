/**
 * @file lightbox island — opens full-size article images in a `<dialog>` overlay. Mounts on
 * `[data-component="lightbox"]` (the article body wrapper). The dialog is a lazily-created
 * singleton reused across article views; the click handler is a shared module function, so the
 * same reference mounts/unmounts cleanly across navigations.
 */
import type { Spa } from "@moku-labs/web";

let dialog: HTMLDialogElement | undefined;
let dialogImage: HTMLImageElement | undefined;

/**
 * Lazily create (once) the shared lightbox dialog and its scoped styles.
 *
 * @returns The shared lightbox `<dialog>` element.
 * @example
 * getDialog().showModal();
 */
function getDialog(): HTMLDialogElement {
  if (dialog) return dialog;

  dialog = document.createElement("dialog");
  dialog.dataset.lightbox = "";
  dialogImage = document.createElement("img");
  dialog.append(dialogImage);

  const style = document.createElement("style");
  style.textContent = `
    dialog[data-lightbox] {
      border: none;
      background: none;
      padding: 0;
      max-width: 90vw;
      max-height: 90vh;
      margin: auto;
      position: fixed;
      inset: 0;
    }
    dialog[data-lightbox]::backdrop {
      background: rgba(0, 0, 0, 0.8);
      cursor: pointer;
    }
    dialog[data-lightbox] img {
      max-width: 90vw;
      max-height: 90vh;
      object-fit: contain;
      cursor: pointer;
      border-radius: 4px;
    }
  `;
  document.head.append(style);
  document.body.append(dialog);

  dialog.addEventListener("click", event => {
    const rect = dialog?.getBoundingClientRect();
    if (!rect) return;
    const clickedBackdrop =
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom;
    if (clickedBackdrop || event.target === dialogImage) dialog?.close();
  });

  return dialog;
}

/**
 * Open the clicked article image in the shared lightbox dialog.
 *
 * @param event - The click event from the article body.
 * @example
 * element.addEventListener("click", openImage);
 */
function openImage(event: Event): void {
  const image = (event.target as Element).closest("img");
  if (!image) return;
  const source = image.getAttribute("src");
  if (!source) return;
  const element = getDialog();
  if (dialogImage) {
    dialogImage.src = source;
    dialogImage.alt = image.getAttribute("alt") ?? "";
  }
  element.showModal();
}

/** Lightbox island: article image click → full-size dialog overlay. */
export const lightbox: Spa.ComponentDef = {
  name: "lightbox",
  hooks: {
    /**
     * Bind the image-click handler when the article body mounts.
     *
     * @param context - The island lifecycle context.
     * @example
     * onMount(context);
     */
    onMount(context) {
      context.el.addEventListener("click", openImage);
    },
    /**
     * Remove the image-click handler when the article body is destroyed.
     *
     * @param context - The island lifecycle context.
     * @example
     * onDestroy(context);
     */
    onDestroy(context) {
      context.el.removeEventListener("click", openImage);
    }
  }
};
