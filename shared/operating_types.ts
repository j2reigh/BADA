export type OSMode = 'active' | 'reactive' | 'passive';

export type ThreatMode = 'forward' | 'emotional' | 'freeze';

export type AlignmentType =
    | 'aligned'        // 최적 궁합
    | 'underutilized'  // Dynamic + Passive
    | 'overdriven'     // Static + Active
    | 'scattered'      // Dynamic + Reactive (v2.1)
    | 'depleted';      // Static + Reactive (v2.1)

export type OperatingLevel = 1 | 2 | 3 | 4 | 5;

export interface ValidityResult {
    validUntil: string; // ISO Date string
    validityWeeks: number;
    urgency: 'low' | 'medium' | 'high';
    reAssessmentReason: string;
}

export interface OperatingResult {
    // User-facing (외부 노출)
    level: OperatingLevel;
    levelName: string;
    levelDescription: string;
    guidance: string[];

    // Validity Info (v2.3)
    validity: ValidityResult;

    // System-facing (내부 전용 - 디버깅/로그용)
    _internal: {
        hardwareType: 'dynamic' | 'static';
        hardwareScore: number;
        osMode: OSMode;
        threatMode: ThreatMode;
        alignmentType: AlignmentType;
        rawRate: number;
        baseRate: number;
        intensityBonus: number;
        interactionPenalty: number;
        elementBalanceCeiling: number;
        finalRate: number;
    };
}

// Level별 정보 상수
export const OPERATING_LEVELS: Record<OperatingLevel, { name: string; description: string; guidance: string[] }> = {
    1: {
        name: "Survival",
        description: "에너지 누수 중. 시스템 과부하 상태.",
        guidance: [
            "회복 우선, 확장 금지",
            "의사결정 최소화",
            "기본 루틴만 유지"
        ]
    },
    2: {
        name: "Recovery",
        description: "기본 기능 복구 중. 방향 전환 가능.",
        guidance: [
            "무리한 목표 설정 금지",
            "작은 성공 경험 쌓기",
            "에너지 충전 루틴 필수"
        ]
    },
    3: {
        name: "Stable",
        description: "시스템 정상 작동. 루틴 유지 최적.",
        guidance: [
            "현재 페이스 유지",
            "소규모 확장 가능",
            "큰 변화는 신중히"
        ]
    },
    4: {
        name: "Aligned",
        description: "엔진과 OS 정렬. 효율 높은 생산 가능.",
        guidance: [
            "중요한 결정에 적합",
            "장기 프로젝트 시작 가능",
            "관계 확장 최적기"
        ]
    },
    5: {
        name: "Flow",
        description: "에너지 활용 극대화. 창조/확장 최적 구간.",
        guidance: [
            "단기 성과 폭발 가능",
            "도전적 목표 설정 가능",
            "지속 불가 - 충전 계획 필수"
        ]
    }
};
