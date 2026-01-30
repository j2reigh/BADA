# BADA Visual Branding v2 - 아이데이션

> 작성일: 2026-01-19
> 목표: 결과페이지, PDF, 이메일의 톤앤매너를 랜딩/서베이와 통일

---

## 1. 현재 상태 (As-Is)

### 일관성 있는 부분 (유지)
- **서베이 페이지 그리드 배경** - 은은한 테크 느낌
- **깊어지는 그라데이션** - 탐험/깊이 메타포

### 따로국밥인 부분 (수정 필요)
| 페이지 | 현재 톤 | 문제 |
|--------|---------|------|
| 결과페이지 | 어둡고 기술적 | 랜딩과 단절감 |
| PDF | 단조로운 문서 느낌 | 브랜드 부재 |
| Verification 이메일 | 기본 이메일 템플릿 | 브랜드 부재 |

---

## 2. 레퍼런스 분석

### Arc'teryx (기능적, 테크)
- **등고선 패턴**: 지형도에서 영감, 기술적 정밀함
- **그리드 시스템**: 정교한 레이아웃
- **색상**: 블랙/그레이 기반 + 포인트 컬러
- **타이포**: 기하학적 산세리프
- **키워드**: Precision, Technical, Functional

### Satisfy Running (힙한 한끗)
- **미니멀 흑백**: 극단적 단순함
- **커스텀 폰트**: ABC Walter Neue (독특한 개성)
- **서브컬처 감성**: "Running Cult Member" - 언더그라운드
- **매거진 문화**: 포토북, 스토리텔링
- **키워드**: Cult, Culture, Minimal, Intellectual

---

## 3. BADA 브랜딩 방향 (To-Be)

### 3.1 핵심 컨셉

```
Arc'teryx의 정밀함 + Satisfy의 힙함 + 바다의 블루
= "Technical Depth"
```

**한 줄 정의:**
> 바다의 깊이를 탐험하는 기술적 도구 - 정밀하지만 시적인

### 3.2 컬러 팔레트

#### Primary: Ocean Depth Spectrum (하늘 → 심해 바닥)
```
Sky Surface:   #ABBBD5 (하늘색, 수면 반사)
Soft Blue:     #879DC6 (연한 블루, 얕은 바다)
Mid Ocean:     #233F64 (미드 블루, 중간 깊이)
Deep Navy:     #182339 (딥 네이비, 깊은 바다)
Abyss Brown:   #402525 (갈색, 심해 바닥/퇴적층)
```

#### Accent: Functional
```
Signal Green:  #52a500ff (긍정, 성공, 강점)
Alert Rose:    #a50000ff (주의, 마찰, 약점)
Pure White:    #FFFFFF (텍스트, 포인트)
```

#### 그라데이션 적용 방향
- Landing: 위에서 아래로 (#ABBBD5 → #182339 → #402525)
- Survey: 진행에 따라 #879DC6 → #402525
- Results: #182339 베이스, 마지막 섹션에서 #ABBBD5로 상승

### 3.3 그래픽 요소

#### 등고선/그리드 패턴 (Arc'teryx 영감)
```
- 바다 깊이를 등고선으로 표현
- Bathymetric map (해저 지형도) 스타일
- 서베이 페이지 그리드 → 전체 확장
```

#### 파형/웨이브 패턴 (바다 영감)
```
- 추상적인 파도 라인
- 사인파 그래픽
- 데이터 시각화 느낌
```

### 3.4 타이포그래피

#### 제안 조합
```
Heading: Inter (기하학적, 테크)
Body:    Inter (가독성)
Mono:    JetBrains Mono (코드, 데이터 느낌)
```

### 3.5 톤앤매너

| 요소 | 방향 |
|------|------|
| 전체 무드 | 깊고 차분하지만 신비로운 |
| 이미지 | 추상적, 데이터 시각화, 해저 지형 |
| 카피 | 시적이지만 정확한 |
| UI | 미니멀, 그리드 기반, 여백 활용 |

---

## 4. 페이지별 적용 방향

### 4.1 결과페이지 (Results)

**현재**: 어두운 배경, 섹션별 다른 스타일
**방향**:
- 전체 블루 그라데이션 배경 (Deep Abyss → Ocean Night)
- 등고선 패턴 오버레이 (서베이 그리드 확장)
- Part 1~5 섹션 간 시각적 연결

**구체적 아이디어**:
```
- Hero: 해저에서 올려다보는 느낌, 심볼 + 등고선
- Part 2~4: 깊이에 따른 색상 변화 (점점 어두워짐)
- Part 5: 수면으로 올라오는 느낌 (밝아짐)
```

### 4.2 PDF

**현재**: 단순 텍스트 문서
**방향**:
- 표지에 등고선 패턴 + 심볼
- 각 페이지 상단에 깊이 인디케이터 (Part 1 = 표면, Part 5 = 깊은 곳)
- 일관된 블루 컬러 시스템

### 4.3 Verification 이메일

**현재**: 기본 템플릿
**방향**:
- 미니멀 블루 헤더
- 등고선 패턴 subtle하게
- "Your journey into the deep begins" 같은 카피

---

## 5. 인터랙션 아이디어 (Olivier Larose 참고)

> 참고: https://blog.olivierlarose.com/tutorials

### 5.1 바다/깊이 컨셉에 맞는 효과

| 효과 | 적용 위치 | 설명 |
|------|----------|------|
| **3D Wave on Scroll** | Landing Hero | 스크롤 시 물결 파동 애니메이션 |
| **Ripple Shader** | 결과페이지 배경 | GLSL 물결 효과, 마우스/터치에 반응 |
| **SVG Path On Scroll** | Landing/Results | 스크롤하면 등고선이 그려지는 효과 |
| **Zoom Parallax** | 섹션 전환 | 깊이로 들어가는 느낌의 줌 |
| **Text Gradient Scroll Opacity** | 결과페이지 | Part별로 텍스트 투명도 변화 (깊이감) |
| **Mask Section Transition** | Results Part 전환 | 등고선 모양 SVG 마스크로 섹션 드러내기 |

### 5.2 테크/정밀함 (Arc'teryx 영감)

| 효과 | 적용 위치 | 설명 |
|------|----------|------|
| **Text Along Path** | 결과페이지 헤더 | 등고선 곡선 따라 흐르는 텍스트 |
| **Parallax Scroll** | 전체 | 레이어별 다른 속도로 깊이감 |
| **Grid Animation** | 서베이/결과 배경 | 그리드 라인이 서서히 나타나거나 움직임 |
| **3D Parallax Letters** | Part 타이틀 | 입체감 있는 타이포그래피 |

### 5.3 힙한 한끗 (Satisfy 영감)

| 효과 | 적용 위치 | 설명 |
|------|----------|------|
| **Blend Mode Cursor** | 결과페이지 | 커서가 지나가면 색상 반전/블렌드 |
| **Mouse Image Distortion** | 심볼 호버 | 마우스로 심볼 이미지 왜곡 |
| **Text Disperse Effect** | CTA 호버 | 버튼 호버 시 텍스트 분산 |
| **Magnetic Button** | CTA 버튼 | 자석처럼 끌리는 버튼 |

### 5.4 추천 조합 (우선순위)

#### Landing Page
```
1. Hero: 3D Wave + Parallax (바다 느낌)
2. Scroll: SVG Path로 등고선 그려짐
3. CTA: Magnetic Button
```

#### 결과페이지
```
1. Blend Mode Cursor - 커서가 지나가면 색상 반전 ✅ 확정
2. Part 전환: Mask Section Transition (등고선 마스크)
3. 심볼: Mouse Distortion (호버 시)
4. 맨 하단: Text Along Path - "FLOW WITH YOUR NATURE, BADA" ✅ 확정
   → 참고: https://blog.olivierlarose.com/tutorials/text-along-path
```

#### 서베이 페이지
```
1. 배경: 그리드 라인 유지 (애니메이션 없음) ✅ 확정
2. Progress: SVG Path 채워지는 효과 (검토)
3. 질문 전환: 기존 유지 또는 subtle한 페이드
```

---

## 6. 무드보드 키워드

```
#DeepBlue #Bathymetric #ContourLines #TechnicalMinimal
#OceanDepth #DataVisualization #CultOfSelf #PrecisionPoetry
```

---

## 6. 다음 단계

- [ ] 컬러 팔레트 최종 확정
- [ ] 등고선/그리드 패턴 에셋 제작 방향
- [ ] 결과페이지 UI 리디자인 와이어프레임
- [ ] PDF 템플릿 리디자인
- [ ] 이메일 템플릿 리디자인

---

## 7. 참고 이미지/사이트

- Arc'teryx: https://arcteryx.com/us/en/explore/whoweare/inspiration
- Satisfy Running: https://satisfyrunning.com/collections/objects
- Bathymetric maps (해저 지형도)
- NOAA Ocean Exploration visuals

---

## 작업 로그

| 날짜 | 작업 내용 |
|------|----------|
| 2026-01-19 | 초안 작성, 레퍼런스 분석 |
| | |
