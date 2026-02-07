export interface Page1Identity {
    title: string;
    sub_headline: string;
    one_line_diagnosis?: string;
    nature_snapshot: { title: string; definition: string; explanation: string };
    brain_snapshot: { title: string; definition: string; explanation: string };
    efficiency_snapshot: { level?: number; level_name?: string; score?: string; label: string; metaphor: string };
    visual_concept: { background_id: string; overlay_id: string };
}

export interface Page2Hardware {
    section_name: string;
    locked?: boolean;
    nature_title?: string;
    nature_description?: string;
    shadow_title?: string;
    shadow_description?: string;
    core_insights?: string[];
    core_drive?: string;
}

export interface Page3OS {
    section_name: string;
    locked?: boolean;
    os_title?: string;
    threat_axis?: { title: string; level: string; description: string };
    environment_axis?: { title: string; level: string; description: string };
    agency_axis?: { title: string; level: string; description: string };
    os_summary?: string;
    os_anchor?: string;
}

export interface Page4Mismatch {
    section_name: string;
    locked?: boolean;
    friction_title?: string;
    career_friction?: { title: string; description: string; quick_tip: string };
    relationship_friction?: { title: string; description: string; quick_tip: string };
    money_friction?: { title: string; description: string; quick_tip: string };
    friction_anchor?: string;
}

export interface Page5Solution {
    section_name: string;
    locked?: boolean;
    transformation_goal?: string;
    protocol_name?: string;
    daily_rituals?: Array<{ name: string; description: string; when: string; anti_pattern?: string }>;
    environment_boost?: { element_needed: string; tips: string[] };
    closing_message?: string;
    protocol_anchor?: string;
}

export interface ResultsData {
    reportId: string;
    email: string;
    userInput: { name: string; surveyScores: { typeKey: string; typeName: string } };
    sajuData: any;
    isPaid: boolean;
    createdAt: string;
    page1_identity: Page1Identity | null;
    page2_hardware: Page2Hardware | null;
    page3_os: Page3OS | null;
    page4_mismatch: Page4Mismatch | null;
    page5_solution: Page5Solution | null;
}

// Change Card Types for Part 6
export type ChangeTargetType = "alarm" | "processing" | "drive" | "work" | "relationship" | "money";

export interface ChangeTargetOption {
    type: ChangeTargetType;
    label: string;
    summary?: string; // v12: Context/Problem Summary for the card
    category: "os" | "friction";
}
