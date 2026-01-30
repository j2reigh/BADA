import html2canvas from "html2canvas";

/**
 * Captures a DOM element and downloads it as a PNG image
 */
export async function captureAndDownloadImage(
  element: HTMLElement,
  filename: string
): Promise<void> {
  const canvas = await html2canvas(element, {
    backgroundColor: null,
    scale: 2, // Higher resolution for better quality
    useCORS: true,
    logging: false,
  });

  const link = document.createElement("a");
  link.download = `${filename}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}
