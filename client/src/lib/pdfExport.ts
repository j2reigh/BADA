import jsPDF from "jspdf";

// ============================================
// Types (Synced with Results.tsx and gemini_client.ts)
// ============================================

interface Page1Identity {
  title: string;
  sub_headline: string;
  nature_snapshot: {
    title: string;
    definition: string;
    explanation: string;
  };
  brain_snapshot: {
    title: string;
    definition: string;
    explanation: string;
  };
  efficiency_snapshot: {
    level?: number;
    level_name?: string;
    score?: string;
    label: string;
    metaphor: string;
  };
  visual_concept: {
    background_id: string;
    overlay_id: string;
  };
}

interface Page2Hardware {
  section_name: string;
  locked?: boolean;
  nature_title?: string;
  nature_description?: string;
  shadow_title?: string;
  shadow_description?: string;
  core_insights?: string[];
}

interface Page3OS {
  section_name: string;
  locked?: boolean;
  os_title?: string;
  threat_axis?: {
    title: string;
    level: string;
    description: string;
  };
  environment_axis?: {
    title: string;
    level: string;
    description: string;
  };
  agency_axis?: {
    title: string;
    level: string;
    description: string;
  };
  os_summary?: string;
}

interface Page4Mismatch {
  section_name: string;
  locked?: boolean;
  friction_title?: string;
  career_friction?: {
    title: string;
    description: string;
    quick_tip: string;
  };
  relationship_friction?: {
    title: string;
    description: string;
    quick_tip: string;
  };
  money_friction?: {
    title: string;
    description: string;
    quick_tip: string;
  };
}

interface Page5Solution {
  section_name: string;
  locked?: boolean;
  transformation_goal?: string;
  protocol_name?: string;
  daily_rituals?: Array<{
    name: string;
    description: string;
    when: string;
  }>;
  environment_boost?: {
    element_needed: string;
    tips: string[];
  };
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
  page2_hardware: Page2Hardware | null;
  page3_os: Page3OS | null;
  page4_mismatch: Page4Mismatch | null;
  page5_solution: Page5Solution | null;
}

const COLORS = {
  primary: "#2492FF",
  accent: "#E45B06",
  text: "#2F3034",
  secondary: "#6b7280",
  light: "#FAFAFA",
  white: "#FFFFFF",
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

  // Helper to wrap text
  const wrap = (text: string, width: number, size: number) => {
    pdf.setFontSize(size);
    return pdf.splitTextToSize(text, width);
  };

  // Helper to add header
  const addHeader = (pageNum: number, title: string, color: string) => {
    pdf.setFillColor(color);
    pdf.rect(0, 0, pageWidth, 5, "F");

    pdf.setFontSize(10);
    pdf.setTextColor(COLORS.secondary);
    pdf.text(`BADA Life Blueprint - Page ${pageNum}`, margin, 15);
    pdf.text(data.userInput.name, pageWidth - margin - pdf.getTextWidth(data.userInput.name), 15);

    pdf.setFontSize(18);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(COLORS.text);
    pdf.text(title, margin, 25);

    return 35; // New Y position
  };

  // ==========================================
  // PAGE 1: Identity
  // ==========================================
  if (data.page1_identity) {
    const p1 = data.page1_identity;

    // Background
    pdf.setFillColor(COLORS.primary);
    pdf.rect(0, 0, pageWidth, pageHeight, "F");

    // Title
    pdf.setTextColor(COLORS.white);
    pdf.setFontSize(32);
    pdf.setFont("helvetica", "bold");
    const titleLines = wrap(p1.title, contentWidth, 32);
    pdf.text(titleLines, pageWidth / 2, 60, { align: "center" });

    // Subheadline
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "italic");
    const subLines = wrap(p1.sub_headline, contentWidth, 14);
    pdf.text(subLines, pageWidth / 2, 80, { align: "center" });

    // Snapshots Box
    let y = 110;
    const boxHeight = 40;
    const boxGap = 10;

    const drawSnapshot = (title: string, def: string, exp: string) => {
      pdf.setFillColor(255, 255, 255, 0.1); // Transparent white
      pdf.roundedRect(margin, y, contentWidth, boxHeight, 3, 3, "F");

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(COLORS.white);
      pdf.text(title.toUpperCase(), margin + 5, y + 8);

      pdf.setFontSize(12);
      pdf.text(def, margin + 5, y + 16);

      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(230, 230, 230);
      const expLines = wrap(exp, contentWidth - 10, 9);
      pdf.text(expLines, margin + 5, y + 24);

      y += boxHeight + boxGap;
    };

    const efficiencyTitle = p1.efficiency_snapshot.level_name
      ? `${p1.efficiency_snapshot.label}: ${p1.efficiency_snapshot.level_name}`
      : `${p1.efficiency_snapshot.label}: ${p1.efficiency_snapshot.score}`;

    drawSnapshot("Nature Blueprint", p1.nature_snapshot.definition, p1.nature_snapshot.explanation);
    drawSnapshot("Brain State", p1.brain_snapshot.definition, p1.brain_snapshot.explanation);
    drawSnapshot(efficiencyTitle, p1.efficiency_snapshot.metaphor, "");
  }

  // ==========================================
  // PAGE 2: Hardware
  // ==========================================
  if (data.page2_hardware) {
    pdf.addPage();
    const p2 = data.page2_hardware;
    let y = addHeader(2, p2.section_name, COLORS.primary);

    // Nature
    pdf.setFillColor("#EFF6FF"); // Blue-50
    pdf.roundedRect(margin, y, contentWidth, 60, 3, 3, "F");

    pdf.setFontSize(10);
    pdf.setTextColor(COLORS.primary);
    pdf.setFont("helvetica", "bold");
    pdf.text("NATURE BLUEPRINT", margin + 5, y + 10);

    pdf.setFontSize(14);
    pdf.setTextColor("#1e3a8a"); // Blue-900
    pdf.text(p2.nature_title || "", margin + 5, y + 18);

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    const natLines = wrap(p2.nature_description || "", contentWidth - 10, 10);
    pdf.text(natLines, margin + 5, y + 26);
    y += 70;

    // Shadow
    pdf.setFillColor("#F3F4F6"); // Gray-100
    pdf.roundedRect(margin, y, contentWidth, 40, 3, 3, "F");

    pdf.setFontSize(10);
    pdf.setTextColor(COLORS.text);
    pdf.setFont("helvetica", "bold");
    pdf.text("THE SHADOW", margin + 5, y + 10);

    pdf.setFontSize(12);
    pdf.text(p2.shadow_title || "", margin + 5, y + 18);

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    const shadowLines = wrap(p2.shadow_description || "", contentWidth - 10, 10);
    pdf.text(shadowLines, margin + 5, y + 26);
    y += 50;

    // Insights
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(COLORS.text);
    pdf.text("Core Insights", margin, y);
    y += 8;

    p2.core_insights?.forEach((insight, i) => {
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.text(`${i + 1}. ${insight}`, margin + 5, y);
      y += 8;
    });
  }

  // ==========================================
  // PAGE 3: OS
  // ==========================================
  if (data.page3_os) {
    pdf.addPage();
    const p3 = data.page3_os;
    let y = addHeader(3, p3.section_name, COLORS.accent);

    pdf.setFontSize(12);
    pdf.setTextColor(COLORS.text);
    pdf.text(p3.os_title || "", margin, y);
    y += 10;

    const drawAxis = (title: string, level: string, desc: string, color: string) => {
      pdf.setDrawColor(color);
      pdf.setLineWidth(1);
      pdf.line(margin, y, margin, y + 30);

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(color);
      pdf.text(title.toUpperCase(), margin + 5, y + 5);

      pdf.setTextColor(COLORS.text);
      pdf.text(level, margin + 50, y + 5); // Right alignish

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      const descLines = wrap(desc, contentWidth - 10, 10);
      pdf.text(descLines, margin + 5, y + 12);

      y += 40;
    };

    if (p3.threat_axis) drawAxis(p3.threat_axis.title, p3.threat_axis.level, p3.threat_axis.description, "#F87171"); // Red
    if (p3.environment_axis) drawAxis(p3.environment_axis.title, p3.environment_axis.level, p3.environment_axis.description, "#34D399"); // Green
    if (p3.agency_axis) drawAxis(p3.agency_axis.title, p3.agency_axis.level, p3.agency_axis.description, "#60A5FA"); // Blue

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "italic");
    pdf.setTextColor(COLORS.secondary);
    const sumLines = wrap(`"${p3.os_summary}"`, contentWidth, 10);
    pdf.text(sumLines, margin, y);
  }

  // ==========================================
  // PAGE 4: Mismatch
  // ==========================================
  if (data.page4_mismatch) {
    pdf.addPage();
    const p4 = data.page4_mismatch;
    let y = addHeader(4, p4.section_name, COLORS.primary);

    pdf.setFontSize(14);
    pdf.setTextColor(COLORS.primary);
    pdf.text(p4.friction_title || "", margin, y);
    y += 15;

    const drawFriction = (area: string, title?: string, desc?: string, tip?: string) => {
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(COLORS.text);
      pdf.text(area.toUpperCase(), margin, y);
      y += 6;

      pdf.setFontSize(11);
      pdf.text(title || "", margin, y);
      y += 6;

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(COLORS.secondary);
      const lines = wrap(desc || "", contentWidth, 10);
      pdf.text(lines, margin, y);
      y += lines.length * 5 + 4;

      // Tip
      pdf.setFillColor("#FEF3C7"); // Yellow-100
      pdf.rect(margin, y, contentWidth, 12, "F");
      pdf.setFontSize(9);
      pdf.setTextColor("#92400E"); // Yellow-800
      pdf.text(`Tip: ${tip}`, margin + 2, y + 7);

      y += 20;
    };

    drawFriction("Career", p4.career_friction?.title, p4.career_friction?.description, p4.career_friction?.quick_tip);
    drawFriction("Relationships", p4.relationship_friction?.title, p4.relationship_friction?.description, p4.relationship_friction?.quick_tip);
    drawFriction("Money", p4.money_friction?.title, p4.money_friction?.description, p4.money_friction?.quick_tip);
  }

  // ==========================================
  // PAGE 5: Solution
  // ==========================================
  if (data.page5_solution) {
    pdf.addPage();
    const p5 = data.page5_solution;
    let y = addHeader(5, p5.section_name, COLORS.accent);

    // Goal
    pdf.setFillColor("#FFF7ED"); // Orange-50
    pdf.rect(margin, y, contentWidth, 20, "F");
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(COLORS.accent);
    pdf.text(p5.transformation_goal || "", margin + 5, y + 12);
    y += 30;

    // Protocol
    pdf.setFontSize(16);
    pdf.setTextColor(COLORS.text);
    pdf.text(p5.protocol_name || "", margin, y);
    y += 10;

    p5.daily_rituals?.forEach((ritual) => {
      pdf.setFillColor(COLORS.text);
      pdf.rect(margin, y, contentWidth, 25, "F"); // Dark card

      pdf.setTextColor(COLORS.white);
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "bold");
      pdf.text(ritual.name, margin + 5, y + 8);

      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      pdf.text(ritual.when, pageWidth - margin - pdf.getTextWidth(ritual.when) - 5, y + 8);

      pdf.setFontSize(9);
      pdf.setTextColor(200, 200, 200);
      const descLines = wrap(ritual.description, contentWidth - 10, 9);
      pdf.text(descLines, margin + 5, y + 16);

      y += 30;
    });

    // Environment Boost
    y += 5;
    pdf.setFontSize(12);
    pdf.setTextColor(COLORS.primary);
    pdf.setFont("helvetica", "bold");
    pdf.text(`Environment Boost: ${p5.environment_boost?.element_needed}`, margin, y);
    y += 8;

    p5.environment_boost?.tips.forEach((tip) => {
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(COLORS.text);
      pdf.text(`• ${tip}`, margin + 5, y);
      y += 6;
    });

    // Closing
    y += 15;
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "italic");
    pdf.setTextColor(COLORS.secondary);
    const closeLines = wrap(`"${p5.closing_message}"`, contentWidth, 10);
    pdf.text(closeLines, margin, y);
  }

  // Save
  const filename = `BADA_Blueprint_${data.userInput.name.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;
  pdf.save(filename);
}
