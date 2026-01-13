import jsPDF from "jspdf";

interface Page1Identity {
  title: string;
  sub_headline: string;
}

interface PageSection {
  section_name: string;
  locked?: boolean;
  blueprint_summary?: string;
  core_insight?: string[];
  diagnosis_summary?: string;
  analysis_points?: string[];
  insight_title?: string;
  conflict_explanation?: string[];
  goal?: string;
  protocol_name?: string;
  steps?: Array<{ step: number; action: string }>;
  closing_message?: string;
}

interface ReportData {
  userInput: {
    name: string;
    surveyScores?: {
      typeKey: string;
      typeName: string;
    };
  };
  isPaid: boolean;
  createdAt: string;
  page1_identity: Page1Identity | null;
  page2_hardware: PageSection | null;
  page3_os: PageSection | null;
  page4_mismatch: PageSection | null;
  page5_solution: PageSection | null;
}

const COLORS = {
  primary: "#2492FF",
  accent: "#E45B06",
  text: "#2F3034",
  secondary: "#6b7280",
  light: "#FAFAFA",
  section: {
    primary: "#2492FF",
    accent: "#E45B06",
  },
};

export async function generateReportPDF(data: ReportData): Promise<void> {
  if (!data.isPaid) {
    throw new Error("Cannot generate PDF for unpaid report");
  }

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let yPos = margin;

  const addNewPageIfNeeded = (requiredSpace: number) => {
    if (yPos + requiredSpace > pageHeight - margin) {
      pdf.addPage();
      yPos = margin;
      return true;
    }
    return false;
  };

  const wrapText = (text: string, maxWidth: number, fontSize: number): string[] => {
    pdf.setFontSize(fontSize);
    return pdf.splitTextToSize(text, maxWidth);
  };

  pdf.setFillColor(COLORS.primary);
  pdf.rect(0, 0, pageWidth, 70, "F");

  pdf.setTextColor("#ffffff");
  pdf.setFontSize(11);
  pdf.setFont("helvetica", "normal");
  pdf.text("BADA Life Blueprint Report", margin, 22);

  pdf.setFontSize(9);
  pdf.text(`Prepared for: ${data.userInput.name}`, margin, 32);
  pdf.text(`Generated: ${new Date(data.createdAt).toLocaleDateString()}`, margin, 40);

  if (data.page1_identity) {
    pdf.setFontSize(24);
    pdf.setFont("helvetica", "bold");
    const titleLines = wrapText(data.page1_identity.title, contentWidth, 24);
    pdf.text(titleLines, margin, 54);

    pdf.setFontSize(11);
    pdf.setFont("helvetica", "normal");
    const subLines = wrapText(data.page1_identity.sub_headline, contentWidth, 11);
    pdf.text(subLines, margin, 64);
  }

  yPos = 85;
  pdf.setTextColor(COLORS.text);

  if (data.userInput.surveyScores) {
    pdf.setFontSize(9);
    pdf.setTextColor(COLORS.secondary);
    pdf.text(`Operating Pattern: ${data.userInput.surveyScores.typeName}`, margin, yPos);
    yPos += 12;
  }

  const addSection = (
    page: PageSection | null,
    pageNum: number,
    accentColor: string
  ) => {
    if (!page || page.locked) return;

    addNewPageIfNeeded(50);

    pdf.setFillColor(accentColor);
    pdf.rect(margin, yPos, 2, 16, "F");

    pdf.setTextColor(accentColor);
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "bold");
    pdf.text(`PAGE ${pageNum}`, margin + 6, yPos + 5);

    pdf.setTextColor(COLORS.text);
    pdf.setFontSize(14);
    pdf.text(page.section_name, margin + 6, yPos + 12);

    yPos += 20;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(COLORS.text);

    if (page.blueprint_summary) {
      const lines = wrapText(page.blueprint_summary, contentWidth - 8, 10);
      addNewPageIfNeeded(lines.length * 5 + 8);
      pdf.text(lines, margin + 6, yPos);
      yPos += lines.length * 5 + 6;
    }

    if (page.core_insight && page.core_insight.length > 0) {
      page.core_insight.forEach((insight) => {
        const lines = wrapText(`• ${insight}`, contentWidth - 12, 9);
        addNewPageIfNeeded(lines.length * 4 + 4);
        pdf.setFontSize(9);
        pdf.text(lines, margin + 10, yPos);
        yPos += lines.length * 4 + 2;
      });
      yPos += 4;
    }

    if (page.diagnosis_summary) {
      const lines = wrapText(page.diagnosis_summary, contentWidth - 8, 10);
      addNewPageIfNeeded(lines.length * 5 + 8);
      pdf.text(lines, margin + 6, yPos);
      yPos += lines.length * 5 + 6;
    }

    if (page.analysis_points && page.analysis_points.length > 0) {
      page.analysis_points.forEach((point) => {
        const lines = wrapText(`• ${point}`, contentWidth - 12, 9);
        addNewPageIfNeeded(lines.length * 4 + 4);
        pdf.setFontSize(9);
        pdf.text(lines, margin + 10, yPos);
        yPos += lines.length * 4 + 2;
      });
      yPos += 4;
    }

    if (page.insight_title) {
      addNewPageIfNeeded(20);
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(accentColor);
      pdf.text(page.insight_title, margin + 6, yPos);
      yPos += 6;
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(COLORS.text);
    }

    if (page.conflict_explanation && page.conflict_explanation.length > 0) {
      page.conflict_explanation.forEach((exp, i) => {
        const lines = wrapText(`${i + 1}. ${exp}`, contentWidth - 12, 9);
        addNewPageIfNeeded(lines.length * 4 + 4);
        pdf.setFontSize(9);
        pdf.text(lines, margin + 10, yPos);
        yPos += lines.length * 4 + 2;
      });
      yPos += 4;
    }

    if (page.protocol_name) {
      addNewPageIfNeeded(25);
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(accentColor);
      pdf.text(page.protocol_name, margin + 6, yPos);
      yPos += 6;

      if (page.goal) {
        pdf.setFontSize(9);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(COLORS.secondary);
        const goalLines = wrapText(page.goal, contentWidth - 8, 9);
        pdf.text(goalLines, margin + 6, yPos);
        yPos += goalLines.length * 4 + 4;
      }
    }

    if (page.steps && page.steps.length > 0) {
      pdf.setTextColor(COLORS.text);
      page.steps.forEach((step) => {
        addNewPageIfNeeded(12);
        pdf.setFillColor(accentColor);
        pdf.rect(margin + 6, yPos - 3, 5, 5, "F");
        pdf.setTextColor("#ffffff");
        pdf.setFontSize(8);
        pdf.text(String(step.step), margin + 7.5, yPos);

        pdf.setTextColor(COLORS.text);
        pdf.setFontSize(9);
        const actionLines = wrapText(step.action, contentWidth - 20, 9);
        pdf.text(actionLines, margin + 14, yPos);
        yPos += actionLines.length * 4 + 4;
      });
      yPos += 4;
    }

    if (page.closing_message) {
      addNewPageIfNeeded(16);
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "italic");
      pdf.setTextColor(accentColor);
      const msgLines = wrapText(`"${page.closing_message}"`, contentWidth - 8, 9);
      pdf.text(msgLines, margin + 6, yPos);
      yPos += msgLines.length * 4 + 8;
    }

    yPos += 8;
  };

  addSection(data.page2_hardware, 2, COLORS.primary);
  addSection(data.page3_os, 3, COLORS.accent);
  addSection(data.page4_mismatch, 4, COLORS.primary);
  addSection(data.page5_solution, 5, COLORS.accent);

  addNewPageIfNeeded(25);
  pdf.setFillColor(COLORS.light);
  pdf.rect(margin, yPos, contentWidth, 20, "F");
  pdf.setTextColor(COLORS.secondary);
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "normal");
  pdf.text("Generated by BADA - Your Life Blueprint Platform", margin + 4, yPos + 8);
  pdf.text("www.bada.one", margin + 4, yPos + 14);

  const filename = `BADA_Blueprint_${data.userInput.name.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;
  pdf.save(filename);
}
