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
  primary: "#0800FF",
  text: "#1a1a1a",
  secondary: "#666666",
  light: "#f0f8ff",
  accent: {
    green: "#22c55e",
    blue: "#3b82f6",
    amber: "#f59e0b",
    violet: "#8b5cf6",
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
  pdf.rect(0, 0, pageWidth, 80, "F");

  pdf.setTextColor("#ffffff");
  pdf.setFontSize(12);
  pdf.text("BADA Life Blueprint Report", margin, 25);

  pdf.setFontSize(10);
  pdf.text(`Prepared for: ${data.userInput.name}`, margin, 35);
  pdf.text(`Generated: ${new Date(data.createdAt).toLocaleDateString()}`, margin, 42);

  if (data.page1_identity) {
    pdf.setFontSize(28);
    pdf.setFont("helvetica", "bold");
    const titleLines = wrapText(data.page1_identity.title, contentWidth, 28);
    pdf.text(titleLines, margin, 58);

    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");
    const subLines = wrapText(data.page1_identity.sub_headline, contentWidth, 12);
    pdf.text(subLines, margin, 70);
  }

  yPos = 95;
  pdf.setTextColor(COLORS.text);

  if (data.userInput.surveyScores) {
    pdf.setFontSize(10);
    pdf.setTextColor(COLORS.secondary);
    pdf.text(`Operating Pattern: ${data.userInput.surveyScores.typeName}`, margin, yPos);
    yPos += 15;
  }

  const addSection = (
    page: PageSection | null,
    pageNum: number,
    accentColor: string
  ) => {
    if (!page || page.locked) return;

    addNewPageIfNeeded(60);

    pdf.setFillColor(accentColor);
    pdf.rect(margin, yPos, 3, 20, "F");

    pdf.setTextColor(accentColor);
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.text(`PAGE ${pageNum}`, margin + 8, yPos + 5);

    pdf.setTextColor(COLORS.text);
    pdf.setFontSize(16);
    pdf.text(page.section_name, margin + 8, yPos + 14);

    yPos += 25;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);
    pdf.setTextColor(COLORS.text);

    if (page.blueprint_summary) {
      const lines = wrapText(page.blueprint_summary, contentWidth - 10, 11);
      addNewPageIfNeeded(lines.length * 5 + 10);
      pdf.text(lines, margin + 8, yPos);
      yPos += lines.length * 5 + 8;
    }

    if (page.core_insight && page.core_insight.length > 0) {
      page.core_insight.forEach((insight) => {
        const lines = wrapText(`• ${insight}`, contentWidth - 15, 10);
        addNewPageIfNeeded(lines.length * 4 + 5);
        pdf.setFontSize(10);
        pdf.text(lines, margin + 12, yPos);
        yPos += lines.length * 4 + 3;
      });
      yPos += 5;
    }

    if (page.diagnosis_summary) {
      const lines = wrapText(page.diagnosis_summary, contentWidth - 10, 11);
      addNewPageIfNeeded(lines.length * 5 + 10);
      pdf.text(lines, margin + 8, yPos);
      yPos += lines.length * 5 + 8;
    }

    if (page.analysis_points && page.analysis_points.length > 0) {
      page.analysis_points.forEach((point) => {
        const lines = wrapText(`• ${point}`, contentWidth - 15, 10);
        addNewPageIfNeeded(lines.length * 4 + 5);
        pdf.setFontSize(10);
        pdf.text(lines, margin + 12, yPos);
        yPos += lines.length * 4 + 3;
      });
      yPos += 5;
    }

    if (page.insight_title) {
      addNewPageIfNeeded(25);
      pdf.setFontSize(13);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(accentColor);
      pdf.text(page.insight_title, margin + 8, yPos);
      yPos += 8;
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(COLORS.text);
    }

    if (page.conflict_explanation && page.conflict_explanation.length > 0) {
      page.conflict_explanation.forEach((exp, i) => {
        const lines = wrapText(`${i + 1}. ${exp}`, contentWidth - 15, 10);
        addNewPageIfNeeded(lines.length * 4 + 5);
        pdf.setFontSize(10);
        pdf.text(lines, margin + 12, yPos);
        yPos += lines.length * 4 + 3;
      });
      yPos += 5;
    }

    if (page.protocol_name) {
      addNewPageIfNeeded(30);
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(accentColor);
      pdf.text(page.protocol_name, margin + 8, yPos);
      yPos += 7;

      if (page.goal) {
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(COLORS.secondary);
        const goalLines = wrapText(page.goal, contentWidth - 10, 10);
        pdf.text(goalLines, margin + 8, yPos);
        yPos += goalLines.length * 4 + 5;
      }
    }

    if (page.steps && page.steps.length > 0) {
      pdf.setTextColor(COLORS.text);
      page.steps.forEach((step) => {
        addNewPageIfNeeded(15);
        pdf.setFillColor(accentColor);
        pdf.circle(margin + 12, yPos - 1, 3, "F");
        pdf.setTextColor("#ffffff");
        pdf.setFontSize(8);
        pdf.text(String(step.step), margin + 10.5, yPos + 1);

        pdf.setTextColor(COLORS.text);
        pdf.setFontSize(10);
        const actionLines = wrapText(step.action, contentWidth - 25, 10);
        pdf.text(actionLines, margin + 20, yPos);
        yPos += actionLines.length * 4 + 5;
      });
      yPos += 5;
    }

    if (page.closing_message) {
      addNewPageIfNeeded(20);
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "italic");
      pdf.setTextColor(accentColor);
      const msgLines = wrapText(`"${page.closing_message}"`, contentWidth - 10, 10);
      pdf.text(msgLines, margin + 8, yPos);
      yPos += msgLines.length * 4 + 10;
    }

    yPos += 10;
  };

  addSection(data.page2_hardware, 2, COLORS.accent.green);
  addSection(data.page3_os, 3, COLORS.accent.blue);
  addSection(data.page4_mismatch, 4, COLORS.accent.amber);
  addSection(data.page5_solution, 5, COLORS.accent.violet);

  addNewPageIfNeeded(30);
  pdf.setFillColor(COLORS.light);
  pdf.rect(margin, yPos, contentWidth, 25, "F");
  pdf.setTextColor(COLORS.secondary);
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");
  pdf.text("Generated by BADA - Your Life Blueprint Platform", margin + 5, yPos + 10);
  pdf.text("www.bada.one", margin + 5, yPos + 17);

  const filename = `BADA_Blueprint_${data.userInput.name.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;
  pdf.save(filename);
}
