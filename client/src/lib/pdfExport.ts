import { jsPDF } from "jspdf";
import { ResultsData } from "@/components/report-v2/types";

// Asset Mapping (Mirrors SymbolRenderer)
const OVERLAY_IMAGES: Record<string, string> = {
  overlay_fire: "/overlays/overlay_fire_1768551210595.png",
  overlay_water: "/overlays/overlay_water_1768551230367.png",
  overlay_wood: "/overlays/overlay_wood_1768551247466.png",
  overlay_metal: "/overlays/overlay_metal_1768551265004.png",
  overlay_earth: "/overlays/overlay_earth_1768551282633.png",
};

export async function generateReportPDF(data: any) {
  const report = data as ResultsData;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;

  // --- Helpers ---
  const centeredText = (text: string, y: number, size: number, color: string = "#FFFFFF", font: string = "helvetica", style: string = "normal") => {
    doc.setFont(font, style);
    doc.setFontSize(size);
    doc.setTextColor(color);
    doc.text(text, pageWidth / 2, y, { align: "center" });
  };

  const leftText = (text: string, x: number, y: number, size: number, color: string = "#FFFFFF", font: string = "helvetica", style: string = "normal", maxWidth?: number) => {
    doc.setFont(font, style);
    doc.setFontSize(size);
    doc.setTextColor(color);
    if (maxWidth) {
      doc.text(text, x, y, { maxWidth });
    } else {
      doc.text(text, x, y);
    }
  };

  const drawWrappedText = (text: string, x: number, y: number, w: number, size: number, color: string, lineHeightFactor: number = 1.5): number => {
    doc.setFontSize(size);
    doc.setTextColor(color);
    const lines = doc.splitTextToSize(text, w);
    doc.text(lines, x, y);
    return lines.length * (size * 0.3527 * lineHeightFactor); // Returns height consumed
  };

  // ================= PAGE 1: COVER (Identity) =================
  doc.setFillColor("#050505");
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  // Load Symbol
  const overlayId = report.page1_identity?.visual_concept.overlay_id || "overlay_fire";
  const imgUrl = OVERLAY_IMAGES[overlayId];
  if (imgUrl) {
    try {
      const img = await loadImage(imgUrl);
      const imgSize = 100;
      doc.addImage(img, "PNG", (pageWidth - imgSize) / 2, 60, imgSize, imgSize);
    } catch (e) { console.warn("PDF Image Load Failed", e); }
  }

  // Cover Text
  centeredText("BADA ANALYSIS COMPLETE", 20, 8, "#666666");
  centeredText(report.userInput.name.toUpperCase(), 180, 40, "#FFFFFF", "helvetica", "bold");
  if (report.page1_identity) {
    centeredText(`"${report.page1_identity.sub_headline}"`, 195, 12, "#CCCCCC", "helvetica", "italic");

    // Identity Card
    doc.setDrawColor("#333333");
    doc.setFillColor("#111111");
    doc.roundedRect(margin, 220, pageWidth - (margin * 2), 50, 3, 3, "FD");

    leftText("CORE IDENTITY", margin + 10, 232, 8, "#10B981", "helvetica", "bold");
    leftText(report.page1_identity.title, margin + 10, 242, 20, "#FFFFFF");
    drawWrappedText(report.page1_identity.nature_snapshot.definition, margin + 10, 252, pageWidth - (margin * 2) - 20, 10, "#AAAAAA");
  }

  // ================= PAGE 2: BLUEPRINT (Hardware) =================
  doc.addPage();
  doc.setFillColor("#050505");
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  leftText("ACT II: THE BLUEPRINT", margin, 30, 8, "#10B981");
  if (report.page2_hardware) {
    const h = report.page2_hardware;
    leftText(h.nature_title || "", margin, 40, 24, "#FFFFFF", "helvetica", "bold", pageWidth - 40);

    // Nature Desc
    let currentY = 70;
    const heightUsed = drawWrappedText(h.nature_description || "", margin, currentY, pageWidth - 40, 10, "#CCCCCC");
    currentY += heightUsed + 20;

    // Shadow Box
    doc.setFillColor("#111111");
    doc.roundedRect(margin, currentY, pageWidth - 40, 80, 3, 3, "F");
    leftText("THE SHADOW SIDE", margin + 10, currentY + 15, 8, "#F43F5E");
    leftText(h.shadow_title || "", margin + 10, currentY + 25, 16, "#FFFFFF");
    drawWrappedText(h.shadow_description || "", margin + 10, currentY + 35, pageWidth - 60, 10, "#999999");
  }

  // ================= PAGE 3: DIAGNOSTICS (OS) =================
  doc.addPage();
  doc.setFillColor("#050505");
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  leftText("ACT III: SAJU O.S.", margin, 30, 8, "#3B82F6");
  if (report.page3_os) {
    const os = report.page3_os;
    leftText(os.os_title || "", margin, 40, 24, "#FFFFFF", "helvetica", "bold", pageWidth - 40);

    const drawAxis = (title: string, level: string, desc: string, y: number, color: string) => {
      doc.setDrawColor("#333333");
      doc.setFillColor("#0A0A0A");
      doc.roundedRect(margin, y, pageWidth - 40, 50, 2, 2, "FD");
      leftText(title.toUpperCase(), margin + 10, y + 10, 8, "#666666");
      leftText(level, margin + 10, y + 20, 14, "#FFFFFF", "helvetica", "bold");

      doc.setFillColor(color);
      doc.rect(margin + 10, y + 25, 80, 1, "F");

      drawWrappedText(desc, margin + 10, y + 35, pageWidth - 60, 9, "#AAAAAA");
    };

    if (os.threat_axis) drawAxis(os.threat_axis.title, os.threat_axis.level, os.threat_axis.description, 70, "#F43F5E");
    if (os.environment_axis) drawAxis(os.environment_axis.title, os.environment_axis.level, os.environment_axis.description, 130, "#10B981");
    if (os.agency_axis) drawAxis(os.agency_axis.title, os.agency_axis.level, os.agency_axis.description, 190, "#3B82F6");
  }

  // ================= PAGE 4: PROTOCOL (Solution) =================
  doc.addPage();
  doc.setFillColor("#FFFFFF");
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  leftText("ACT V: SYSTEM PROTOCOL", margin, 30, 8, "#10B981");
  if (report.page5_solution) {
    const sol = report.page5_solution;
    leftText(sol.protocol_name || "", margin, 40, 24, "#000000", "helvetica", "bold");
    drawWrappedText(`"${sol.transformation_goal}"`, margin, 55, pageWidth - 40, 12, "#666666");

    let y = 80;
    sol.daily_rituals?.forEach((r, i) => {
      doc.setDrawColor("#EEEEEE");
      doc.setFillColor("#F9FAFB");
      doc.roundedRect(margin, y, pageWidth - 40, 40, 2, 2, "FD");

      leftText(`${i + 1}. ${r.name}`, margin + 10, y + 10, 12, "#000000", "helvetica", "bold");
      leftText(r.when.toUpperCase(), margin + 10, y + 18, 8, "#999999");
      drawWrappedText(r.description, margin + 10, y + 25, pageWidth - 60, 9, "#444444");
      y += 45;
    });

    // Environment
    y += 10;
    doc.setFillColor("#064E3B");
    doc.roundedRect(margin, y, pageWidth - 40, 30, 3, 3, "F");
    leftText("ENVIRONMENT OPTIMIZATION", margin + 10, y + 10, 8, "#34D399");
    leftText(`Element Needed: ${sol.environment_boost?.element_needed}`, margin + 10, y + 20, 14, "#FFFFFF", "helvetica", "bold");
  }

  doc.save(`${report.userInput.name}_BADA_Blueprint.pdf`);
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = url;
    img.crossOrigin = "Anonymous";
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
  });
}
