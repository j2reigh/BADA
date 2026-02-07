import { jsPDF } from "jspdf";
import fs from "fs";
import path from "path";

// Load test data
const testData = JSON.parse(
  fs.readFileSync(path.resolve("/Users/jeanne/BADA-Report/test_report_output.json"), "utf-8")
);

// Add missing top-level fields for ResultsData
const report = {
  reportId: "abcd1234-test-0000-0000-000000000000",
  email: "test@example.com",
  userInput: { name: "Jeanne", surveyScores: { typeKey: "T1-E1-A1", typeName: "Dreamer" } },
  sajuData: {},
  isPaid: true,
  createdAt: new Date().toISOString(),
  ...testData,
};

// ---- Inline PDF generation (mirrors pdfExport.ts) ----

const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

const pageWidth = doc.internal.pageSize.getWidth();
const pageHeight = doc.internal.pageSize.getHeight();
const margin = 25;
const contentWidth = 160;

doc.setLineHeightFactor(1.6);

const C = {
  primary: "#402525",
  navy:    "#233F64",
  steel:   "#879DC6",
  muted:   "#6B5050",
  faint:   "#9A8A8A",
  divider: "#E8E3E3",
};

let currentY = margin;

const userName = report.userInput?.name || "USER";
const reportId = report.reportId || "--------";
const dateStr = new Date().toLocaleDateString("en-US", {
  year: "numeric", month: "long", day: "numeric",
});

function hexRGB(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

function setColor(hex: string) {
  doc.setTextColor(...hexRGB(hex));
}

function lh(pt: number): number {
  return pt * (25.4 / 72) * 1.6;
}

function measureTextHeight(
  text: string, pt: number, maxW: number,
  style = "normal", font = "helvetica",
): number {
  doc.setFont(font, style);
  doc.setFontSize(pt);
  const lines = doc.splitTextToSize(text, maxW);
  return lines.length * lh(pt);
}

function ensureSpace(needed: number) {
  if (currentY + needed > pageHeight - margin) {
    doc.addPage();
    currentY = margin;
  }
}

function startNewPart() {
  doc.addPage();
  currentY = margin;
}

function writeText(
  text: string, x: number, y: number,
  opts: {
    font?: string; style?: string; size: number; color: string;
    align?: "left" | "center" | "right"; maxWidth?: number;
  },
): number {
  const { font = "helvetica", style = "normal", size, color, align = "left", maxWidth } = opts;
  doc.setFont(font, style);
  doc.setFontSize(size);
  setColor(color);
  if (maxWidth) {
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y, { align });
    return lines.length * lh(size);
  }
  doc.text(text, x, y, { align });
  return lh(size);
}

function writeParagraph(text: string, y: number): number {
  return writeText(text, margin, y, { size: 10, color: C.muted, maxWidth: contentWidth });
}

function writePartLabel(label: string, y: number): number {
  return writeText(label.toUpperCase(), margin, y, { size: 9, color: C.navy });
}

function writeSectionTitle(title: string, y: number): number {
  return writeText(title, margin, y, { size: 20, style: "bold", color: C.primary, maxWidth: contentWidth });
}

function writeSubheading(text: string, y: number): number {
  return writeText(text, margin, y, { size: 13, style: "bold", color: C.primary, maxWidth: contentWidth });
}

function writeCategoryLabel(label: string, y: number): number {
  return writeText(label.toUpperCase(), margin, y, { size: 9, color: C.navy });
}

function drawDivider(y: number, full = true) {
  doc.setDrawColor(...hexRGB(C.divider));
  if (full) {
    doc.line(margin, y, margin + contentWidth, y);
  } else {
    doc.line(pageWidth / 2 - 20, y, pageWidth / 2 + 20, y);
  }
}

// ====================== COVER ======================

writeText("ANALYSIS COMPLETE", pageWidth / 2, 105, {
  size: 9, color: C.navy, align: "center",
});

const overlayId = report.page1_identity?.visual_concept.overlay_id || "overlay_fire";
const elementName = overlayId.replace("overlay_", "").toUpperCase();
writeText(elementName, pageWidth / 2, 115, {
  size: 9, color: C.steel, align: "center",
});

writeText(userName.toUpperCase(), pageWidth / 2, 148, {
  size: 32, color: C.primary, align: "center", maxWidth: contentWidth,
});

if (report.page1_identity) {
  writeText(`"${report.page1_identity.sub_headline}"`, pageWidth / 2, 164, {
    size: 12, style: "italic", color: C.muted, align: "center", maxWidth: contentWidth,
  });
}

writeText("BADA REPORT", pageWidth / 2, pageHeight - margin - 6, {
  size: 8, color: C.faint, align: "center",
});
writeText(dateStr, pageWidth / 2, pageHeight - margin, {
  size: 8, color: C.faint, align: "center",
});

// ====================== PART 1 — YOUR ESSENCE ======================

if (report.page1_identity) {
  startNewPart();
  const p = report.page1_identity;

  writePartLabel("PART 1", currentY);
  currentY += lh(9) + 2;

  currentY += writeSectionTitle(p.title, currentY) + 6;
  currentY += writeParagraph(p.nature_snapshot.definition, currentY) + 6;

  drawDivider(currentY);
  currentY += 6;

  currentY += writeText(p.nature_snapshot.explanation, margin, currentY, {
    size: 10, style: "italic", color: C.muted, maxWidth: contentWidth,
  }) + 10;

  ensureSpace(40);
  writeCategoryLabel("YOUR MIND STATE", currentY);
  currentY += lh(9) + 3;

  currentY += writeSubheading(p.brain_snapshot.definition, currentY) + 3;
  currentY += writeParagraph(p.brain_snapshot.explanation, currentY) + 10;

  ensureSpace(30);
  writeCategoryLabel("OPERATING EFFICIENCY", currentY);
  currentY += lh(9) + 3;

  if (p.efficiency_snapshot.level_name) {
    currentY += writeSubheading(p.efficiency_snapshot.level_name, currentY) + 3;
  }
  writeParagraph(p.efficiency_snapshot.metaphor, currentY);
}

// ====================== PART 2 — YOUR NATURE ======================

if (report.page2_hardware) {
  startNewPart();
  const p = report.page2_hardware;

  writePartLabel("PART 2", currentY);
  currentY += lh(9) + 2;

  currentY += writeSectionTitle(p.nature_title || "", currentY) + 6;
  currentY += writeParagraph(p.nature_description || "", currentY) + 8;

  writeCategoryLabel("THE SHADOW SIDE", currentY);
  currentY += lh(9) + 3;

  currentY += writeSubheading(p.shadow_title || "", currentY) + 3;
  currentY += writeParagraph(p.shadow_description || "", currentY) + 6;

  drawDivider(currentY);
  currentY += 6;

  writeCategoryLabel("CORE INSIGHTS", currentY);
  currentY += lh(9) + 4;

  if (p.core_insights) {
    p.core_insights.forEach((insight: string, i: number) => {
      const num = String(i + 1).padStart(2, "0");
      const h = measureTextHeight(insight, 10, contentWidth - 12);
      ensureSpace(h + 4);

      writeText(num, margin, currentY, { size: 10, color: C.steel });
      const actual = writeText(insight, margin + 12, currentY, {
        size: 10, color: C.muted, maxWidth: contentWidth - 12,
      });
      currentY += actual + 4;
    });
  }
}

// ====================== PART 3 — YOUR MIND ======================

if (report.page3_os) {
  startNewPart();
  const p = report.page3_os;

  writePartLabel("PART 3", currentY);
  currentY += lh(9) + 2;

  currentY += writeSectionTitle(p.os_title || "", currentY) + 8;

  const axes = [p.threat_axis, p.environment_axis, p.agency_axis];

  axes.forEach((axis: any) => {
    if (!axis) return;

    const labelH = lh(9) + 3;
    const levelH = measureTextHeight(axis.level, 13, contentWidth, "bold") + 3;
    const descH = measureTextHeight(axis.description, 10, contentWidth);
    const blockH = labelH + levelH + descH + 8;

    ensureSpace(blockH);

    writeCategoryLabel(axis.title, currentY);
    currentY += labelH;

    writeSubheading(axis.level, currentY);
    currentY += levelH;

    writeParagraph(axis.description, currentY);
    currentY += descH + 8;
  });

  drawDivider(currentY);
  currentY += 6;

  if (p.os_summary) {
    const h = measureTextHeight(p.os_summary, 10, contentWidth - 10, "italic");
    ensureSpace(h);
    writeText(p.os_summary, margin + 5, currentY, {
      size: 10, style: "italic", color: C.muted, maxWidth: contentWidth - 10,
    });
  }
}

// ====================== PART 4 — YOUR FRICTION ======================

if (report.page4_mismatch) {
  startNewPart();
  const p = report.page4_mismatch;

  writePartLabel("PART 4", currentY);
  currentY += lh(9) + 2;

  currentY += writeSectionTitle(p.friction_title || "", currentY) + 8;

  const areas = [
    { label: "CAREER", data: p.career_friction },
    { label: "RELATIONSHIP", data: p.relationship_friction },
    { label: "MONEY", data: p.money_friction },
  ];

  areas.forEach((area: any, i: number) => {
    if (!area.data) return;

    const labelH = lh(9) + 3;
    const titleH = measureTextHeight(area.data.title, 13, contentWidth, "bold") + 3;
    const descH = measureTextHeight(area.data.description, 10, contentWidth);
    const tipLabelH = area.data.quick_tip ? lh(9) + 2 : 0;
    const tipBodyH = area.data.quick_tip
      ? measureTextHeight(area.data.quick_tip, 9, contentWidth)
      : 0;
    const blockH = labelH + titleH + descH + 4 + tipLabelH + tipBodyH + 6;

    ensureSpace(blockH);

    writeCategoryLabel(area.label, currentY);
    currentY += labelH;

    writeSubheading(area.data.title, currentY);
    currentY += titleH;

    currentY += writeParagraph(area.data.description, currentY) + 4;

    if (area.data.quick_tip) {
      writeText("QUICK TIP", margin, currentY, {
        size: 9, style: "bold", color: C.navy,
      });
      currentY += tipLabelH;

      currentY += writeText(area.data.quick_tip, margin, currentY, {
        size: 9, color: C.muted, maxWidth: contentWidth,
      });
    }

    if (i < areas.length - 1) {
      currentY += 6;
      drawDivider(currentY);
      currentY += 6;
    }
  });
}

// ====================== PART 5 — YOUR GUIDE ======================

if (report.page5_solution) {
  startNewPart();
  const sol = report.page5_solution;

  writePartLabel("PART 5", currentY);
  currentY += lh(9) + 2;

  currentY += writeSectionTitle(sol.protocol_name || "", currentY) + 4;

  if (sol.transformation_goal) {
    currentY += writeText(`"${sol.transformation_goal}"`, margin, currentY, {
      size: 10, style: "italic", color: C.muted, maxWidth: contentWidth,
    }) + 8;
  }

  writeCategoryLabel("DAILY RITUALS", currentY);
  currentY += lh(9) + 3;
  drawDivider(currentY);
  currentY += 6;

  if (sol.daily_rituals) {
    sol.daily_rituals.forEach((ritual: any, i: number) => {
      const num = String(i + 1).padStart(2, "0");

      const nameH = measureTextHeight(ritual.name, 13, contentWidth - 12, "bold") + 2;
      const whenH = ritual.when ? lh(9) + 3 : 0;
      const descH = measureTextHeight(ritual.description, 10, contentWidth);
      const blockH = nameH + whenH + descH + 6;

      ensureSpace(blockH);

      writeText(num, margin, currentY, { size: 13, color: C.steel });
      writeText(ritual.name, margin + 12, currentY, {
        size: 13, style: "bold", color: C.primary, maxWidth: contentWidth - 12,
      });
      currentY += nameH;

      if (ritual.when) {
        writeText(ritual.when.toUpperCase(), margin, currentY, {
          size: 9, color: C.navy,
        });
        currentY += whenH;
      }

      currentY += writeParagraph(ritual.description, currentY) + 6;
    });
  }

  drawDivider(currentY);
  currentY += 8;

  ensureSpace(40);
  writeCategoryLabel("YOUR ENVIRONMENT", currentY);
  currentY += lh(9) + 3;

  if (sol.environment_boost) {
    const elName = sol.environment_boost.element_needed;
    writeSubheading(elName.charAt(0).toUpperCase() + elName.slice(1), currentY);
    currentY += lh(13) + 3;

    if (sol.environment_boost.tips) {
      sol.environment_boost.tips.forEach((tip: string) => {
        const tipText = `>  ${tip}`;
        const tipH = measureTextHeight(tipText, 10, contentWidth - 5);
        ensureSpace(tipH + 4);

        writeText(tipText, margin + 5, currentY, {
          size: 10, color: C.muted, maxWidth: contentWidth - 5,
        });
        currentY += tipH + 4;
      });
    }
  }

  currentY += 8;
  ensureSpace(60);
  drawDivider(currentY, false);
  currentY += 10;

  if (sol.closing_message) {
    const msgH = measureTextHeight(
      `"${sol.closing_message}"`, 13, contentWidth - 20, "italic", "times",
    );
    ensureSpace(msgH + 20);

    writeText(`"${sol.closing_message}"`, pageWidth / 2, currentY, {
      font: "times", style: "italic", size: 13, color: C.primary,
      align: "center", maxWidth: contentWidth - 20,
    });
    currentY += msgH + 15;
  }

  const footer = `BADA REPORT  \u00B7  ${reportId.slice(0, 8).toUpperCase()}  \u00B7  ${dateStr}`;
  writeText(footer, pageWidth / 2, currentY + 5, {
    size: 8, color: C.faint, align: "center",
  });
}

// ====================== PAGE NUMBERS (cover excluded) ======================

const totalPages = doc.getNumberOfPages();
for (let p = 2; p <= totalPages; p++) {
  doc.setPage(p);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  setColor(C.faint);
  doc.text(String(p - 1), pageWidth / 2, pageHeight - 12, { align: "center" });
}

// ====================== SAVE ======================

const outPath = "/Users/jeanne/BADA-Report/test_BADA_Report.pdf";
const arrayBuf = doc.output("arraybuffer");
fs.writeFileSync(outPath, Buffer.from(arrayBuf));
console.log(`PDF saved to: ${outPath}`);
console.log(`Total pages: ${totalPages}`);
