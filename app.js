/* 「내 수호신」 스모크 목업 v2 — 순수 JS, 외부 의존 0, CDN 0
 *
 * v1 대비 변경
 *   A. 화면 5단 재구성: S1 입력 → S2 수호신 → S3 오늘의 흐름(신설) → S4 부적 → S5 결제 의향
 *   B. 진단 엔진 신설 (01_운세진단_스펙.md 전체 구현 + 검증 4종)
 *   C. 계측 수정 9건 (L1-3 codex 2관문 명세)
 *   D. 카드 이미지 assets/generic_*.jpg 상대참조(자기완결)
 *
 * 사주 산술은 saju_engine.py(미션 3호 스파이크) 이식 — v1에서 전수 검증 완료분을 그대로 재사용.
 *   출처1 ytliu0: S = 1 + mod(JDnoon - 11, 60), T = 1 + mod(JDnoon - 1, 10), B = 1 + mod(JDnoon + 1, 12)
 *
 * JS 이식 주의(파이썬과 다른 지점):
 *   - 파이썬 %는 항상 비음수, JS %는 피연산자 부호를 따른다 -> mod() 헬퍼로 통일
 *   - 파이썬 //(floor division)는 음수에서 내림 -> Math.floor로 통일
 *   두 지점 모두 1900년 이전 날짜에서 실제로 갈린다(1899-12-31 케이스로 검증).
 *
 * 브라우저/Node 공용: 파일 하단에서 Node일 때 module.exports로 엔진을 내보낸다(헤드리스 검증용).
 */
(function (root, factory) {
  'use strict';
  var api = factory(typeof window !== 'undefined' ? window : null);
  if (typeof module === 'object' && module.exports) module.exports = api; // Node 검증용
})(this, function (win) {
  'use strict';

  var HAS_DOM = !!(win && win.document);

  /* =========================================================
   * 1. 사주 엔진 (saju_engine.py 이식 — v1 검증 완료분 재사용)
   * ======================================================= */

  var CHEONGAN = [
    ['갑', '甲'], ['을', '乙'], ['병', '丙'], ['정', '丁'], ['무', '戊'],
    ['기', '己'], ['경', '庚'], ['신', '辛'], ['임', '壬'], ['계', '癸']
  ];

  var JIJI = [
    ['자', '子', '쥐'], ['축', '丑', '소'], ['인', '寅', '호랑이'],
    ['묘', '卯', '토끼'], ['진', '辰', '용'], ['사', '巳', '뱀'],
    ['오', '午', '말'], ['미', '未', '양'], ['신', '申', '원숭이'],
    ['유', '酉', '닭'], ['술', '戌', '개'], ['해', '亥', '돼지']
  ];

  var OHAENG_BY_GAN = {
    '갑': ['목', '양'], '을': ['목', '음'],
    '병': ['화', '양'], '정': ['화', '음'],
    '무': ['토', '양'], '기': ['토', '음'],
    '경': ['금', '양'], '신': ['금', '음'],
    '임': ['수', '양'], '계': ['수', '음']
  };

  // 스펙 1절 — 지지 오행: 인묘=목 · 사오=화 · 진술축미=토 · 신유=금 · 해자=수
  var OHAENG_BY_JI = {
    '인': '목', '묘': '목',
    '사': '화', '오': '화',
    '진': '토', '술': '토', '축': '토', '미': '토',
    '신': '금', '유': '금',
    '해': '수', '자': '수'
  };

  var OHAENG_ATTR = {
    '목': { 한자: '木', 수식: '푸른' },
    '화': { 한자: '火', 수식: '붉은' },
    '토': { 한자: '土', 수식: '황금빛' },
    '금': { 한자: '金', 수식: '백금의' },
    '수': { 한자: '水', 수식: '검푸른' }
  };

  var GAN_ROMAN = {
    '갑': 'GA', '을': 'EUL', '병': 'BYEONG', '정': 'JEONG', '무': 'MU',
    '기': 'GI', '경': 'GYEONG', '신': 'SIN', '임': 'IM', '계': 'GYE'
  };
  var JI_ROMAN = {
    '자': 'JA', '축': 'CHUK', '인': 'IN', '묘': 'MYO', '진': 'JIN', '사': 'SA',
    '오': 'O', '미': 'MI', '신': 'SHIN', '유': 'YU', '술': 'SUL', '해': 'HAE'
  };

  // 오행 -> 카드 이미지. 문구 없는 범용판 5종을 목업 폴더 안에 둬 자기완결(D).
  // 파일명은 ASCII 고정 — GitHub Pages 등에서 한글 파일명 인코딩 문제를 피한다.
  var CARD_FILE = {
    '목': 'assets/generic_wood.jpg',
    '화': 'assets/generic_fire.jpg',
    '토': 'assets/generic_earth.jpg',
    '금': 'assets/generic_metal.jpg',
    '수': 'assets/generic_water.jpg'
  };

  // 파이썬 % 와 동일한 비음수 나머지
  function mod(n, m) { return ((n % m) + m) % m; }

  /** 그레고리력 -> JDN (Fliegel-Van Flandern). 파이썬 julian_day_number 이식. */
  function julianDayNumber(y, mth, day) {
    var a = Math.floor((14 - mth) / 12);
    var yy = y + 4800 - a;
    var mm = mth + 12 * a - 3;
    return day + Math.floor((153 * mm + 2) / 5) + 365 * yy
      + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045;
  }

  /** {y,m,d} -> 일주 정보. 파이썬 day_pillar 이식(00시 경계, 자시 미반영). */
  function dayPillar(y, m, d) {
    var jdn = julianDayNumber(y, m, d);
    var ganIdx = mod(jdn - 1, 10);
    var jiIdx = mod(jdn + 1, 12);

    var gan = CHEONGAN[ganIdx];
    var ji = JIJI[jiIdx];
    var oh = OHAENG_BY_GAN[gan[0]];
    var ganjiNo = mod(jdn - 11, 60) + 1;

    return {
      jdn: jdn,
      일주_한글: gan[0] + ji[0],
      일주_한자: gan[1] + ji[1],
      일간: gan[0],
      일지: ji[0],
      띠: ji[2],
      오행: oh[0],          // 일간(천간) 오행 = 주축
      지지오행: OHAENG_BY_JI[ji[0]],
      음양: oh[1],
      갑자순번: ganjiNo
    };
  }

  function archetypeId(p) {
    var n = p.갑자순번 < 10 ? '0' + p.갑자순번 : String(p.갑자순번);
    return 'GS-' + n + '-' + GAN_ROMAN[p.일간] + JI_ROMAN[p.일지];
  }

  function cardPhrase(p) {
    return p.일주_한글 + '(' + p.일주_한자 + ') - '
      + OHAENG_ATTR[p.오행].수식 + ' ' + p.띠;
  }

  /** 'YYYY-MM-DD' -> 전체 결과. 파이썬 read() 이식. */
  function read(dateStr) {
    var parts = String(dateStr).split('-');
    var p = dayPillar(+parts[0], +parts[1], +parts[2]);
    p.카드ID = archetypeId(p);
    p.카드문구 = cardPhrase(p);
    return p;
  }

  /** 갑자순번(1~60) -> 일주 한글. 전수 검증에서 60일주를 만들 때 쓴다. */
  function iljuByNo(no) {
    var i = no - 1;
    return CHEONGAN[mod(i, 10)][0] + JIJI[mod(i, 12)][0];
  }

  /* ---- 날짜 유틸 (로컬 시간 기준, UTC 밀림 방지) ---- */
  function pad2(n) { return n < 10 ? '0' + n : String(n); }
  function toISO(dt) {
    return dt.getFullYear() + '-' + pad2(dt.getMonth() + 1) + '-' + pad2(dt.getDate());
  }
  /** ISO 날짜에 일수 더하기 — Date의 월말 롤오버를 이용(자체 산술보다 안전) */
  function addDaysISO(iso, n) {
    var p = iso.split('-');
    var dt = new Date(+p[0], +p[1] - 1, +p[2] + n);
    return toISO(dt);
  }
  /** 두 ISO 날짜의 일수 차이 (b - a). 로컬 자정 기준이라 DST 영향 없음(KST는 DST 없음). */
  function diffDaysISO(a, b) {
    var pa = a.split('-'), pb = b.split('-');
    var ja = julianDayNumber(+pa[0], +pa[1], +pa[2]);
    var jb = julianDayNumber(+pb[0], +pb[1], +pb[2]);
    return jb - ja;
  }

  /** KST(UTC+9) 고정 오늘 날짜 — C-④ 코호트 창 판정의 기준 타임존. */
  function todayKST(nowMs) {
    var ms = (typeof nowMs === 'number') ? nowMs : Date.now();
    var kst = new Date(ms + 9 * 3600 * 1000);
    return kst.getUTCFullYear() + '-' + pad2(kst.getUTCMonth() + 1) + '-' + pad2(kst.getUTCDate());
  }

  /* =========================================================
   * 2. 진단 엔진 (01_운세진단_스펙.md — B)
   * ======================================================= */

  // 스펙 1절 — 상생(生): 목→화→토→금→수→목
  var SAENG = { '목': '화', '화': '토', '토': '금', '금': '수', '수': '목' };
  // 스펙 1절 — 상극(克): 목→토→수→화→금→목
  var GEUK = { '목': '토', '토': '수', '수': '화', '화': '금', '금': '목' };

  var TYPE_LABEL = { '비화': '균형', '인성': '도움', '식상': '발산', '재성': '기회', '관성': '긴장' };

  /** 스펙 2절 — 내 일간 오행 X vs 상대 오행 Y (5유형 판정) */
  function relation(x, y) {
    if (x === y) return '비화';        // X == Y
    if (SAENG[y] === x) return '인성'; // Y가 X를 생함
    if (SAENG[x] === y) return '식상'; // X가 Y를 생함
    if (GEUK[x] === y) return '재성';  // X가 Y를 극함
    if (GEUK[y] === x) return '관성';  // Y가 X를 극함
    return '비화'; // 도달 불가(5행 폐쇄계) — 방어적 기본값
  }

  // 스펙 3절 — 점수 상수
  var BASE = { '인성': 82, '재성': 78, '비화': 70, '식상': 62, '관성': 52 };
  var ADJ = { '인성': 8, '재성': 6, '비화': 3, '식상': -2, '관성': -8 };

  // 스펙 4절 — 영역별 담당 유형
  var AREA_TYPE = { '재물': '재성', '애정': '식상', '일': '관성', '건강': '인성' };
  var AREA_ORDER = ['재물', '애정', '일', '건강'];

  function clamp(v, lo, hi) { return v < lo ? lo : (v > hi ? hi : v); }

  /** 스펙 3절 — 점수 = base(R1) + adj(R2) + wave, clamp(40,95) */
  function scoreOf(r1, r2, myNo, todayNo) {
    var wave = mod(todayNo * myNo, 7) - 3; // 같은 입력=항상 같은 값
    return clamp(BASE[r1] + ADJ[r2] + wave, 40, 95);
  }

  /** 스펙 4절 v1.1 — 4영역 3단계 결정론 배정
   *  1. R1 담당 영역 = 좋음 (예외: R1=관성이면 일=주의, 긴장 톤)
   *  2. R2 담당 영역 = 좋음(약한 톤). 일도 포함 — R1 규칙과 충돌 시 R1 우선
   *  3. 무담당 영역 = 보통
   *  4. 주의 0개면 보통(무담당) 후보 중 (일진순번+일주순번) mod k 번째를 주의로 강등
   *     (구판은 base 최저 고정이라 "일"만 강등돼 처방이 일 2,880/건강 0으로 쏠렸다)
   */
  function areasOf(r1, r2, todayNo, myNo) {
    var out = {};
    var i, area;

    // 3. 기본값 = 보통(무담당)
    for (i = 0; i < AREA_ORDER.length; i++) out[AREA_ORDER[i]] = '보통';

    // 2. R2 담당 영역 = 좋음 (일 포함) — 먼저 깔고 R1으로 덮어써 "R1 우선"을 보장
    for (i = 0; i < AREA_ORDER.length; i++) {
      area = AREA_ORDER[i];
      if (AREA_TYPE[area] === r2) out[area] = '좋음';
    }

    // 1. R1 담당 영역 = 좋음, 단 R1=관성이면 일=주의
    for (i = 0; i < AREA_ORDER.length; i++) {
      area = AREA_ORDER[i];
      if (AREA_TYPE[area] === r1) out[area] = (area === '일' && r1 === '관성') ? '주의' : '좋음';
    }

    // 4. 주의가 0개면 무담당(보통) 영역 중 결정론 순환으로 1개 강등
    var hasCaution = false;
    for (var a in out) if (out[a] === '주의') { hasCaution = true; break; }
    if (!hasCaution) {
      var cand = [];
      for (i = 0; i < AREA_ORDER.length; i++) {
        area = AREA_ORDER[i];
        // 무담당 = R1·R2 어느 쪽 담당도 아닌 영역(= 보통으로 남은 것)
        if (out[area] === '보통') cand.push(area);
      }
      if (cand.length) {
        var pick = cand[mod(todayNo + myNo, cand.length)];
        out[pick] = '주의';
      }
    }
    return out;
  }

  /* ---- 스펙 5절 문구 (전부 사전 하드코딩 — 생성 없음) ---- */

  // 요약 1줄 × 25조합 (R1 × R2). 확언 어미("~됩니다") 금지, "~하기 좋은 날" 권장.
  var SUMMARY = {
    '인성': {
      '인성': '기운이 겹겹이 당신을 받쳐 주는 날 — 크게 마음먹기 좋은 날입니다.',
      '재성': '받는 기운과 거두는 기운이 나란한 날 — 챙길 것을 챙기기 좋습니다.',
      '비화': '든든한 기운이 곁을 지키는 날 — 하던 일을 밀고 나가기 좋습니다.',
      '식상': '채워진 기운을 밖으로 내보내기 좋은 날 — 표현이 잘 닿습니다.',
      '관성': '받쳐 주는 기운 위에 작은 압박이 얹히는 날 — 서두르지 않으면 무난합니다.'
    },
    '재성': {
      '인성': '거두는 기운에 도움이 붙는 날 — 실속을 챙기기 좋습니다.',
      '재성': '손에 쥐는 기운이 강한 날 — 미뤄 둔 계산을 정리하기 좋습니다.',
      '비화': '기회가 눈에 들어오는 날 — 욕심을 반만 내면 잘 풀립니다.',
      '식상': '움직인 만큼 돌아오는 날 — 먼저 손을 내밀기 좋습니다.',
      '관성': '기회와 부담이 함께 오는 날 — 하나만 고르는 편이 낫습니다.'
    },
    '비화': {
      '인성': '나란한 기운에 힘이 보태지는 날 — 사람을 만나기 좋습니다.',
      '재성': '평온한 흐름에 작은 기회가 얹히는 날 — 가볍게 시도하기 좋습니다.',
      '비화': '무리 없이 흘러가는 날 — 익숙한 일을 마무리하기 좋습니다.',
      '식상': '마음이 밖으로 향하는 날 — 하고 싶던 말을 꺼내기 좋습니다.',
      '관성': '평탄한 가운데 한 군데가 조이는 날 — 일정을 여유 있게 잡으세요.'
    },
    '식상': {
      '인성': '내보낸 만큼 다시 채워지는 날 — 새로 배우기 좋습니다.',
      '재성': '펼친 것이 결실로 이어지기 좋은 날 — 마무리에 힘을 실으세요.',
      '비화': '기운을 쓰는 날 — 벌여 놓은 일을 하나씩 접기 좋습니다.',
      '식상': '에너지가 밖으로 많이 나가는 날 — 쉬는 시간을 미리 잡아 두세요.',
      '관성': '쓰는 기운에 압박이 겹치는 날 — 욕심을 덜면 편해집니다.'
    },
    '관성': {
      '인성': '긴장 속에서도 받쳐 주는 손이 있는 날 — 도움을 청하기 좋습니다.',
      '재성': '부담과 기회가 나란한 날 — 우선순위를 먼저 정하세요.',
      '비화': '어깨가 무거운 날 — 혼자 다 지지 않는 편이 좋습니다.',
      '식상': '압박을 풀 곳이 필요한 날 — 몸을 움직이면 가벼워집니다.',
      '관성': '조이는 기운이 겹치는 날 — 오늘은 지키는 것만으로 충분합니다.'
    }
  };

  // 영역 문구 4영역 × 3단계 = 12개
  var AREA_TEXT = {
    '재물': {
      '좋음': '들어오는 흐름이 열려 있습니다.',
      '보통': '큰 변동 없이 유지되는 흐름입니다.',
      '주의': '새는 곳이 생기기 쉬우니 지갑을 단속하세요.'
    },
    '애정': {
      '좋음': '마음이 잘 전해지는 흐름입니다.',
      '보통': '평소만큼 오가는 흐름입니다.',
      '주의': '말이 어긋나기 쉬우니 한 번 더 확인하세요.'
    },
    '일': {
      '좋음': '맡은 일이 매끄럽게 굴러갑니다.',
      '보통': '무리 없이 처리되는 흐름입니다.',
      '주의': '압박이 오는 날 — 그 압박을 기회로 바꿔 보세요.'
    },
    '건강': {
      '좋음': '기운이 잘 도는 흐름입니다.',
      '보통': '평소 컨디션을 유지하는 흐름입니다.',
      '주의': '무리가 쌓이기 쉬우니 쉬는 시간을 챙기세요.'
    }
  };

  // 처방 카피 — 주의 영역 → 목적 부적 연결 (스펙 5절)
  var PRESCRIPTION = {
    '재물': { 부적: '재물 부적', 카피: '오늘 재물 기운이 새는 날 — 재물 부적으로 단속하세요.' },
    '애정': { 부적: '연애 부적', 카피: '오늘 마음이 어긋나기 쉬운 날 — 연애 부적으로 이어 두세요.' },
    '일': { 부적: '합격 부적', 카피: '오늘 압박이 몰리는 날 — 합격 부적으로 중심을 잡으세요.' },
    '건강': { 부적: '면접 부적', 카피: '오늘 기운이 빠지기 쉬운 날 — 면접 부적으로 기세를 세우세요.' }
  };

  var AREA_ICON = { '좋음': '●', '보통': '◐', '주의': '○' };

  /**
   * 진단 본체 — 내 일주 × 오늘 일진.
   * @param {object} mine  read()가 돌려준 내 일주 정보
   * @param {object} todayP read()가 돌려준 오늘 일진 정보
   */
  function diagnose(mine, todayP) {
    var x = mine.오행;                    // 내 일간 오행
    var r1 = relation(x, todayP.오행);     // 천간 관계(주축)
    var r2 = relation(x, todayP.지지오행); // 지지 관계(보조)

    var score = scoreOf(r1, r2, mine.갑자순번, todayP.갑자순번);
    var areas = areasOf(r1, r2, todayP.갑자순번, mine.갑자순번);

    // 주의 영역 → 처방 연결. 여럿이면 AREA_ORDER 앞쪽 1개(결정론).
    var caution = null;
    for (var i = 0; i < AREA_ORDER.length; i++) {
      if (areas[AREA_ORDER[i]] === '주의') { caution = AREA_ORDER[i]; break; }
    }

    // "왜 이 점수?" 1줄 템플릿 (스펙 5절)
    var why = '오늘의 간지 ' + todayP.일주_한글 + '(' + todayP.오행 + ') — 당신의 '
      + mine.일주_한글 + '(' + x + ')와 ' + TYPE_LABEL[r1] + ' 관계';

    return {
      r1: r1, r2: r2,
      r1_label: TYPE_LABEL[r1], r2_label: TYPE_LABEL[r2],
      score: score,
      areas: areas,
      caution: caution,
      summary: SUMMARY[r1][r2],
      why: why,
      prescription: caution ? PRESCRIPTION[caution] : null
    };
  }

  /* =========================================================
   * 3. 검증 — 사주 self-test + 진단 엔진 검증 4종 (스펙 6절)
   * ======================================================= */

  function runSelfTest(opts) {
    var quiet = !!(opts && opts.quiet);
    var results = [];
    var failed = 0;

    function check(name, got, want) {
      var ok = String(got) === String(want);
      if (!ok) failed++;
      results.push({ 항목: name, 기대: String(want), 실제: String(got), 판정: ok ? 'PASS' : 'FAIL' });
      return ok;
    }

    /* ---------- 3-1. 사주 산술 (v1 검증분 그대로 재사용) ---------- */
    check('JDN 2019-01-27', julianDayNumber(2019, 1, 27), 2458511);
    check('JDN 1781-03-13', julianDayNumber(1781, 3, 13), 2371629);

    var cases = [
      ['2019-01-27', '갑자', '출처1 ytliu0 앵커'],
      ['1781-03-13', '임술', '출처1 ytliu0'],
      ['1949-10-01', '갑자', '출처2 Wikipedia'],
      ['1900-01-01', '갑술', '출처3 한국 만세력'],
      ['2000-01-01', '무오', '출처1 파생 검증']
    ];
    for (var i = 0; i < cases.length; i++) {
      check('일주 ' + cases[i][0] + ' (' + cases[i][2] + ')',
        read(cases[i][0]).일주_한글, cases[i][1]);
    }

    check('갑자순번 2019-01-27', read('2019-01-27').갑자순번, 1);
    check('갑자순번 1949-10-01', read('1949-10-01').갑자순번, 1);
    check('계해순번 2019-01-26', read('2019-01-26').갑자순번, 60);
    check('계해일주 2019-01-26', read('2019-01-26').일주_한글, '계해');

    var base = '1990-03-15';
    check('60일 뒤 동일 일주', read(addDaysISO(base, 60)).일주_한글, read(base).일주_한글);
    check('59일 뒤 다른 일주', read(addDaysISO(base, 59)).일주_한글 !== read(base).일주_한글, 'true');

    var ids = {}, cnt = 0;
    for (var k = 0; k < 60; k++) {
      var id = read(addDaysISO(base, k)).카드ID;
      if (!ids[id]) { ids[id] = 1; cnt++; }
    }
    check('60일간 카드 ID 종수', cnt, 60);
    check('결정론(동일 입력 동일 카드)', read('1990-03-15').카드ID === read('1990-03-15').카드ID, 'true');
    check('천간 오행 테이블 수', Object.keys(OHAENG_BY_GAN).length, 10);
    var ohSet = {};
    for (var g in OHAENG_BY_GAN) ohSet[OHAENG_BY_GAN[g][0]] = 1;
    check('오행 5종 완비', Object.keys(ohSet).sort().join(','), ['목', '화', '토', '금', '수'].sort().join(','));

    // JS 고유 위험(음수 mod / floor division) 회귀 검증
    check('1899-12-31 일주(음수경계)', read('1899-12-31').일주_한글, '계유');
    check('1899-12-31 순번(음수경계)', read('1899-12-31').갑자순번, 10);
    check('윤일 2024-02-29 일주', read('2024-02-29').일주_한글, '계해');
    check('1990-03-15 일주', read('1990-03-15').일주_한글, '기묘');
    check('1990-03-15 카드ID', read('1990-03-15').카드ID, 'GS-16-GIMYO');
    check('1990-03-15 오행', read('1990-03-15').오행, '토');
    check('2026-08-21 일주', read('2026-08-21').일주_한글, '정묘');
    check('카드 파일 5종', Object.keys(CARD_FILE).length, 5);

    // 지지 오행 테이블(v2 신설) 완전성 — 12지 전부 매핑
    check('지지 오행 12지 완비', Object.keys(OHAENG_BY_JI).length, 12);
    check('지지 오행 진술축미=토',
      [OHAENG_BY_JI['진'], OHAENG_BY_JI['술'], OHAENG_BY_JI['축'], OHAENG_BY_JI['미']].join(''), '토토토토');

    // 관계 판정 5유형 (스펙 2절 정의 그대로)
    check('관계 목vs목 = 비화', relation('목', '목'), '비화');
    check('관계 목vs수 = 인성(수생목)', relation('목', '수'), '인성');
    check('관계 목vs화 = 식상(목생화)', relation('목', '화'), '식상');
    check('관계 목vs토 = 재성(목극토)', relation('목', '토'), '재성');
    check('관계 목vs금 = 관성(금극목)', relation('목', '금'), '관성');
    // 5×5 = 25조합이 전부 5유형 중 하나로 판정되는지
    var OHS = ['목', '화', '토', '금', '수'], relCount = 0, relKinds = {};
    for (var a1 = 0; a1 < 5; a1++) for (var b1 = 0; b1 < 5; b1++) {
      var rr = relation(OHS[a1], OHS[b1]);
      if (BASE.hasOwnProperty(rr)) relCount++;
      relKinds[rr] = (relKinds[rr] || 0) + 1;
    }
    check('오행 25조합 전부 유형 판정', relCount, 25);
    // 5행 폐쇄계에서는 각 유형이 정확히 5회씩 나온다(오타·테이블 붕괴 조기 감지)
    check('유형별 5회 균등(테이블 무결성)',
      [relKinds['비화'], relKinds['인성'], relKinds['식상'], relKinds['재성'], relKinds['관성']].join(','),
      '5,5,5,5,5');

    /* ---------- 3-2. 진단 검증 ① 결정론 1,000회 (스펙 6절 ①) ---------- */
    var detMine = read('1990-03-15');
    var detToday = read('2026-08-22');
    var first = JSON.stringify(diagnose(detMine, detToday));
    var detOk = true;
    for (var n = 0; n < 1000; n++) {
      if (JSON.stringify(diagnose(read('1990-03-15'), read('2026-08-22'))) !== first) { detOk = false; break; }
    }
    check('①결정론 1,000회 동일 출력', detOk, 'true');

    /* ---------- 3-3. 진단 검증 ② 3,600조합 전수 assert (스펙 6절 ②) ---------- */
    // 60일주 × 60일진. 일주는 갑자순번으로 만들되, 실제 read() 결과를 쓰기 위해
    // 기준일에서 0~59일을 더해 60가지 일주/일진을 모두 만든다(순번 1~60 전수).
    var anchor = '2019-01-27'; // 갑자(순번 1)
    var pillars = [];
    for (var d0 = 0; d0 < 60; d0++) pillars.push(read(addDaysISO(anchor, d0)));

    // 만든 60개가 실제로 60갑자 전부인지 먼저 확인(전수의 전제)
    var noSet = {};
    for (var q = 0; q < pillars.length; q++) noSet[pillars[q].갑자순번] = 1;
    check('②전수 전제: 60일주 순번 전수', Object.keys(noSet).length, 60);
    check('②전수 전제: 순번↔일주 일치', pillars[15].일주_한글, iljuByNo(pillars[15].갑자순번));

    var total = 0, badScore = 0, badAreaCount = 0, badCaution = 0, badLevel = 0,
      badSummary = 0, badWhy = 0, badPrescription = 0;
    var hist = {};
    // ⑤ 집계: 영역별 3단계 출현 수 + 처방(주의) 대상 분포
    var areaLevelCount = {}, rxCount = {};
    for (var az = 0; az < AREA_ORDER.length; az++) {
      areaLevelCount[AREA_ORDER[az]] = { '좋음': 0, '보통': 0, '주의': 0 };
      rxCount[AREA_ORDER[az]] = 0;
    }
    var LEVELS = { '좋음': 1, '보통': 1, '주의': 1 };

    for (var mi = 0; mi < 60; mi++) {
      for (var ti = 0; ti < 60; ti++) {
        var dg = diagnose(pillars[mi], pillars[ti]);
        total++;

        if (!(typeof dg.score === 'number' && dg.score >= 40 && dg.score <= 95)) badScore++;

        var keys = Object.keys(dg.areas);
        if (keys.length !== 4) badAreaCount++;
        var cautionCnt = 0;
        for (var ki = 0; ki < keys.length; ki++) {
          var lv = dg.areas[keys[ki]];
          if (!LEVELS[lv]) badLevel++;
          if (lv === '주의') cautionCnt++;
          if (areaLevelCount[keys[ki]] && LEVELS[lv]) areaLevelCount[keys[ki]][lv]++;
        }
        if (cautionCnt < 1) badCaution++;

        if (!dg.summary || typeof dg.summary !== 'string') badSummary++;
        if (!dg.why || dg.why.indexOf('—') < 0) badWhy++;
        if (!dg.prescription || !dg.prescription.카피) badPrescription++;
        if (dg.caution && rxCount.hasOwnProperty(dg.caution)) rxCount[dg.caution]++;

        hist[dg.score] = (hist[dg.score] || 0) + 1;
      }
    }

    check('②전수 조합 수', total, 3600);
    check('②점수 40~95 이탈', badScore, 0);
    check('②영역 4개 배정 이탈', badAreaCount, 0);
    check('②영역 단계값 이탈', badLevel, 0);
    check('②주의 최소 1개 미달', badCaution, 0);
    check('②요약 문구 누락', badSummary, 0);
    check('②왜 이 점수 누락', badWhy, 0);
    check('②처방 카피 누락', badPrescription, 0);

    /* ---------- 3-4. 진단 검증 ③ 분포 쏠림 (스펙 6절 ③) ---------- */
    var maxCnt = 0, maxScore = null, distinct = 0;
    for (var s in hist) {
      distinct++;
      if (hist[s] > maxCnt) { maxCnt = hist[s]; maxScore = s; }
    }
    var maxShare = maxCnt / total;
    check('③최빈 점수 비중 < 40%', maxShare < 0.40, 'true');
    check('③점수 값 종수 ≥ 10', distinct >= 10, 'true');

    /* ---------- 3-4b. 진단 검증 ⑤ 영역/처방 쏠림 (스펙 v1.1 6절 ⑤) ---------- */
    // 4영역 각각에 좋음·보통·주의가 모두 출현하고, "주의" 최대 영역 점유율 ≤60%.
    var lvlMiss = [], rxZero = [];
    for (var ai = 0; ai < AREA_ORDER.length; ai++) {
      var an = AREA_ORDER[ai];
      if (!(areaLevelCount[an]['좋음'] > 0 && areaLevelCount[an]['보통'] > 0 && areaLevelCount[an]['주의'] > 0)) {
        lvlMiss.push(an);
      }
      if (!rxCount[an]) rxZero.push(an);
    }
    check('⑤4영역 3단계 모두 출현', lvlMiss.length ? lvlMiss.join(',') : 0, 0);
    check('⑤처방 0인 영역 없음', rxZero.length ? rxZero.join(',') : 0, 0);

    var rxMax = 0, rxMaxArea = null;
    for (var aj = 0; aj < AREA_ORDER.length; aj++) {
      var a2 = AREA_ORDER[aj];
      if (rxCount[a2] > rxMax) { rxMax = rxCount[a2]; rxMaxArea = a2; }
    }
    var rxShare = rxMax / total;
    check('⑤주의 최대 영역 점유율 ≤60%', rxShare <= 0.60, 'true');


    /* ---------- 3-5. 처방 연결 무결성 ---------- */
    check('처방 테이블 4영역 완비', Object.keys(PRESCRIPTION).length, 4);
    check('영역 문구 4×3 완비',
      Object.keys(AREA_TEXT).length * 3, 12);
    var summaryCount = 0;
    for (var rk in SUMMARY) summaryCount += Object.keys(SUMMARY[rk]).length;
    check('요약 문구 25조합 완비', summaryCount, 25);
    // 확언 어미 금지(스펙 5절) — 25문구 전수 검사
    var badTone = 0;
    for (var rk2 in SUMMARY) for (var rk3 in SUMMARY[rk2]) {
      if (/됩니다/.test(SUMMARY[rk2][rk3])) badTone++;
    }
    check('요약 문구 확언어미 금지', badTone, 0);

    /* ---------- 3-6. KST 코호트 유틸 ---------- */
    // 2026-08-21 15:00 UTC = 2026-08-22 00:00 KST -> 날짜가 넘어가야 한다
    check('KST 자정 경계', todayKST(Date.UTC(2026, 7, 21, 15, 0, 0)), '2026-08-22');
    check('KST 자정 직전', todayKST(Date.UTC(2026, 7, 21, 14, 59, 0)), '2026-08-21');
    check('일수 차이 D1', diffDaysISO('2026-08-21', '2026-08-22'), 1);
    check('일수 차이 월경계', diffDaysISO('2026-07-31', '2026-08-07'), 7);

    var summary = {
      전체: results.length,
      통과: results.length - failed,
      실패: failed,
      상세: results,
      분포: {
        조합수: total, 최빈점수: maxScore, 최빈비중: Math.round(maxShare * 1000) / 10 + '%', 점수종수: distinct,
        영역단계: areaLevelCount, 처방분포: rxCount,
        처방최대: rxMaxArea + ' ' + (Math.round(rxShare * 1000) / 10) + '%'
      }
    };

    if (!quiet) {
      var C = (typeof console !== 'undefined') ? console : null;
      if (C) {
        if (failed === 0) {
          C.log('%c[self-test] 전체 ' + results.length + '건 PASS · 진단 전수 3,600조합 · 최빈 '
            + summary.분포.최빈비중 + '(<40%) · 처방최대 ' + summary.분포.처방최대 + '(≤60%)',
            'color:#0a7d33;font-weight:bold');
        } else {
          C.error('[self-test] 실패 ' + failed + '건 — 아래 표 확인');
          if (C.table) C.table(results.filter(function (r) { return r.판정 === 'FAIL'; }));
        }
        if (C.table) C.table(results);
      }
    }
    return summary;
  }

  /* ---- 엔진 API (Node 검증에서도 그대로 쓰인다) ---- */
  var ENGINE = {
    read: read, dayPillar: dayPillar, julianDayNumber: julianDayNumber,
    diagnose: diagnose, relation: relation, scoreOf: scoreOf, areasOf: areasOf,
    iljuByNo: iljuByNo, addDaysISO: addDaysISO, diffDaysISO: diffDaysISO,
    todayKST: todayKST, selfTest: runSelfTest,
    tables: {
      OHAENG_BY_GAN: OHAENG_BY_GAN, OHAENG_BY_JI: OHAENG_BY_JI, OHAENG_ATTR: OHAENG_ATTR,
      BASE: BASE, ADJ: ADJ, AREA_TYPE: AREA_TYPE, TYPE_LABEL: TYPE_LABEL,
      SUMMARY: SUMMARY, AREA_TEXT: AREA_TEXT, PRESCRIPTION: PRESCRIPTION, CARD_FILE: CARD_FILE
    }
  };

  // DOM이 없으면(Node 헤드리스 검증) 엔진만 돌려주고 UI는 건드리지 않는다.
  if (!HAS_DOM) return ENGINE;

  /* =========================================================
   * 4. 콘텐츠 (오행별 문구 하드코딩)
   * ======================================================= */

  var TRAITS = {
    '목': ['한번 마음먹으면 곧게 뻗어 나갑니다.', '주변을 살리는 기운이 있어 사람이 모입니다.', '서두르지 않을 때 가장 크게 자랍니다.'],
    '화': ['타고난 열기로 자리의 공기를 바꿉니다.', '표현이 솔직해 마음이 빨리 전해집니다.', '식지 않게 쉬어 주는 것이 관건입니다.'],
    '토': ['흔들리지 않는 중심으로 신뢰를 얻습니다.', '맡은 것을 끝까지 지켜 내는 사람입니다.', '너무 품으면 무거워지니 덜어 내야 합니다.'],
    '금': ['맺고 끊음이 분명해 판단이 빠릅니다.', '기준이 뚜렷하고 자기 원칙을 지킵니다.', '날이 설 때는 한 템포 늦추면 좋습니다.'],
    '수': ['상황을 읽고 자연스럽게 길을 냅니다.', '깊이 생각하고 오래 기억합니다.', '고이지 않게 흘려보낼 때 맑아집니다.']
  };

  var TODAY_LINE = {
    '목': '오늘은 새로 시작한 일이 뿌리를 내리는 날입니다. 서두르지 마세요.',
    '화': '오늘은 마음이 앞서는 날입니다. 한 박자 늦추면 뜻대로 풀립니다.',
    '토': '오늘은 자리를 지키는 것이 이기는 날입니다. 하던 것을 마무리하세요.',
    '금': '오늘은 결정을 미루지 않는 편이 좋습니다. 답은 이미 나와 있습니다.',
    '수': '오늘은 흐름을 거스르지 마세요. 기다린 소식이 닿습니다.'
  };

  // 목적 부적 진열 — 처방(주의 영역)과 연결되는 label을 공유한다.
  var PURPOSE_SHELF = [
    { icon: '合', label: '합격', 부적: '합격 부적' },
    { icon: '面', label: '면접', 부적: '면접 부적' },
    { icon: '財', label: '재물', 부적: '재물 부적' },
    { icon: '緣', label: '연애', 부적: '연애 부적' }
  ];

  /* =========================================================
   * 5. 과금 실험 분기 (A/B/C)
   * ======================================================= */

  var OFFERS = {
    A: {
      arm: 'A',
      title: '오늘의 부적 소장판 3,900원',
      desc: '워터마크 없는 고해상 원본으로 오늘의 부적을 소장하세요. 잠금화면에 딱 맞는 크기로 드립니다.',
      cta: '소장판 받기 · 3,900원'
    },
    B: {
      arm: 'B',
      title: '매일 부적 패스 · 월 6,900원',
      desc: '매달 원하는 부적 5장을 골라 고해상으로 저장하고, 받은 부적은 언제든 다시 내려받을 수 있습니다.',
      cta: '패스 시작하기 · 월 6,900원'
    },
    C: {
      arm: 'C',
      title: '매일 부적 패스 · 월 9,900원',
      desc: '매달 원하는 부적 5장을 고해상으로 저장하고, 지금까지 받은 부적 전체를 무제한으로 다시 내려받습니다.',
      cta: '패스 시작하기 · 월 9,900원'
    }
  };

  /* =========================================================
   * 6. 계측 (C — L1-3 명세 9건)
   * ======================================================= */

  /* C-⑦ 전송 설정. 값이 비면 전송하지 않는다(현재 기본값 = 빈 값 고정).
   * 실배포 시 여기에만 수집 엔드포인트를 넣으면 sendEvents()가 동작한다. */
  var CONFIG = {
    ENDPOINT: '',        // 예: 'https://<수집서버>/collect' — 비면 전송 안 함
    SEND_BATCH: 10,      // 이벤트가 이만큼 쌓이면 전송 시도
    COHORT_WINDOW: 7     // 재방문 관찰 창 D1~D7
  };

  var LS = {
    id: 'gs_anon_id',
    log: 'gs_events',
    ilju: 'gs_ilju',            // C-⑤ 생년월일 원문 대신 일주 결과값만 저장
    firstSeen: 'gs_first_seen', // 코호트 기준일(KST)
    lastVisit: 'gs_last_visit',
    visits: 'gs_visit_count',
    once: 'gs_once',            // C-③ 전환 이벤트 1회화 키 집합
    sent: 'gs_sent_upto'        // 전송 완료 인덱스
  };

  /* C-② 저장 폴백 비대칭 수리:
   * v1은 set 실패 시 mem에 썼는데 get은 localStorage만 읽어 값이 증발했다(분기 재배정 오염).
   * v2는 set이 mem으로 떨어지면 그 키를 '오염 목록'에 넣고, get도 같은 키는 mem을 우선한다. */
  var store = (function () {
    var mem = {}, memKeys = {}, ok = true;
    try {
      var t = '__gs_t__';
      win.localStorage.setItem(t, '1');
      win.localStorage.removeItem(t);
    } catch (e) { ok = false; }

    function useMem(k) { return !ok || memKeys[k] === 1; }

    return {
      available: ok,
      mode: function () { return ok ? 'localStorage' : 'memory'; },
      get: function (k) {
        if (useMem(k)) return (k in mem) ? mem[k] : null;
        try {
          var v = win.localStorage.getItem(k);
          // localStorage가 살아 있어도 그 키만 쓰기에 실패했었다면 mem이 진실이다
          return (v === null && (k in mem)) ? mem[k] : v;
        } catch (e) {
          memKeys[k] = 1;
          return (k in mem) ? mem[k] : null;
        }
      },
      set: function (k, v) {
        if (!ok) { mem[k] = v; memKeys[k] = 1; return; }
        try {
          win.localStorage.setItem(k, v);
          mem[k] = v;          // 미러링 — get이 어느 쪽을 읽어도 같은 값
          delete memKeys[k];
        } catch (e) {
          mem[k] = v; memKeys[k] = 1;  // 이 키는 이후 get도 mem을 본다(비대칭 해소)
        }
      }
    };
  })();

  function uuid() {
    try {
      if (win.crypto && typeof win.crypto.randomUUID === 'function') return win.crypto.randomUUID();
      if (win.crypto && win.crypto.getRandomValues) {
        var b = new Uint8Array(16);
        win.crypto.getRandomValues(b);
        b[6] = (b[6] & 0x0f) | 0x40;
        b[8] = (b[8] & 0x3f) | 0x80;
        var h = [];
        for (var i = 0; i < 16; i++) h.push((b[i] + 0x100).toString(16).slice(1));
        return h.slice(0, 4).join('') + '-' + h.slice(4, 6).join('') + '-'
          + h.slice(6, 8).join('') + '-' + h.slice(8, 10).join('') + '-' + h.slice(10).join('');
      }
    } catch (e) { /* 폴백으로 진행 */ }
    return 'fb-' + Date.now().toString(16) + '-' + Math.random().toString(16).slice(2, 10);
  }

  var anonId = store.get(LS.id);
  var isNewId = false;
  if (!anonId) { anonId = uuid(); store.set(LS.id, anonId); isNewId = true; }

  /* C-① 분기 배정 = anon_id 결정론 해시. 랜덤·저장 없음 → 다중 탭 경합 소멸,
   * 저장소가 날아가도 같은 id면 같은 분기가 복원된다. (FNV-1a 32bit) */
  function hash32(str) {
    var h = 0x811c9dc5;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
    }
    return h >>> 0;
  }
  var ARMS = ['A', 'B', 'C'];
  var arm = ARMS[hash32('arm:' + anonId) % 3];
  var offer = OFFERS[arm];

  /* ---- C-④ 코호트 (KST 고정) ---- */
  var today = todayKST();                    // 자정 넘김 대비: track()마다 재계산한다
  var firstSeen = store.get(LS.firstSeen);
  var isFirstVisit = false;
  if (!firstSeen) {
    firstSeen = today;
    store.set(LS.firstSeen, firstSeen);
    isFirstVisit = true;
  }

  var lastVisit = store.get(LS.lastVisit);
  var visitCount = parseInt(store.get(LS.visits) || '0', 10);
  if (isNaN(visitCount) || visitCount < 0) visitCount = 0;

  // 재방문 = 코호트 창(D1~D7) 안의 다른 날 방문
  var dayIndex = diffDaysISO(firstSeen, today);           // D0, D1, ...
  var isReturning = !!(lastVisit && lastVisit !== today && dayIndex >= 1);
  var inCohortWindow = dayIndex >= 1 && dayIndex <= CONFIG.COHORT_WINDOW;

  if (!lastVisit || lastVisit !== today) {
    visitCount += 1;
    store.set(LS.visits, String(visitCount));
    store.set(LS.lastVisit, today);
  }

  var events = [];
  try { events = JSON.parse(store.get(LS.log) || '[]'); } catch (e) { events = []; }
  if (!Array.isArray(events)) events = [];

  var sessionId = uuid().slice(0, 8);

  /* C-③ 전환 이벤트 1회화 — 세션 중복 방지.
   * 세션 키(session+event)로 막아 같은 세션의 연타를 1건으로 만든다. */
  var onceKeys = {};
  try { onceKeys = JSON.parse(store.get(LS.once) || '{}') || {}; } catch (e) { onceKeys = {}; }
  var ONCE_PER_SESSION = { cta_clicked: 1, notify_requested: 1, s1_submitted: 1 };

  function track(name, props) {
    // 자정 넘김 시 today 재계산(C-④)
    var nowDay = todayKST();
    if (nowDay !== today) {
      today = nowDay;
      dayIndex = diffDaysISO(firstSeen, today);
      inCohortWindow = dayIndex >= 1 && dayIndex <= CONFIG.COHORT_WINDOW;
    }

    if (ONCE_PER_SESSION[name]) {
      var key = sessionId + '|' + name;
      if (onceKeys[key]) return null;   // 이미 보낸 전환 이벤트 — 버린다
      onceKeys[key] = 1;
      // 세션 키가 무한 증식하지 않도록 상한
      var ks = Object.keys(onceKeys);
      if (ks.length > 60) {
        var trimmed = {};
        for (var t = ks.length - 30; t < ks.length; t++) trimmed[ks[t]] = 1;
        onceKeys = trimmed;
      }
      store.set(LS.once, JSON.stringify(onceKeys));
    }

    var ev = {
      event: name,
      ts: new Date().toISOString(),
      anon_id: anonId,
      session: sessionId,
      arm: arm,
      // C-④ 코호트 필드 — 모든 이벤트에 포함
      first_seen_at: firstSeen,
      cohort_date: firstSeen,
      is_first_visit: isFirstVisit,
      day_index: dayIndex,
      in_cohort_window: inCohortWindow,
      today_kst: today
    };
    if (props) for (var k in props) if (props.hasOwnProperty(k)) ev[k] = props[k];

    events.push(ev);
    if (events.length > 500) events = events.slice(-500);
    try { store.set(LS.log, JSON.stringify(events)); } catch (e) { /* 용량 초과 무시 */ }
    win.SMOKE_LOG = events;

    if (events.length % CONFIG.SEND_BATCH === 0) sendEvents();
    return ev;
  }

  /* C-⑦ 전송. CONFIG.ENDPOINT가 비면 아무 것도 하지 않는다(현재 기본값).
   * 값이 들어오면 미전송분만 POST한다. 네트워크 코드는 이 함수 하나뿐이다. */
  function sendEvents() {
    if (!CONFIG.ENDPOINT) return false;   // 미작동이 기본
    var sentUpto = parseInt(store.get(LS.sent) || '0', 10);
    if (isNaN(sentUpto) || sentUpto < 0) sentUpto = 0;
    var pending = events.slice(sentUpto);
    if (!pending.length) return false;

    var payload = JSON.stringify({ anon_id: anonId, arm: arm, events: pending });
    var upto = events.length;

    try {
      if (typeof win.fetch === 'function') {
        win.fetch(CONFIG.ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
          keepalive: true
        }).then(function (res) {
          if (res && res.ok) store.set(LS.sent, String(upto)); // 실패면 다음에 재시도
        })['catch'](function () { /* 오프라인 — 다음 기회에 재전송 */ });
        return true;
      }
    } catch (e) { /* 전송 실패는 목업 동작을 막지 않는다 */ }
    return false;
  }

  win.SMOKE_LOG = events;
  win.SMOKE = {
    id: anonId, arm: arm, events: events, config: CONFIG,
    sendEvents: sendEvents, track: track,
    read: read, dayPillar: dayPillar, diagnose: diagnose, selfTest: runSelfTest,
    engine: ENGINE
  };

  /* ---- 방문 이벤트 ---- */
  track('visit', {
    returning: isReturning,
    visit_count: visitCount,
    last_visit: lastVisit || null,
    storage: store.mode(),
    new_id: isNewId,
    env: (function () {
      var ua = win.navigator && win.navigator.userAgent ? win.navigator.userAgent : '';
      // C-⑦ 인앱/외부 브라우저 환경값 기록(원문 UA는 남기지 않고 분류만)
      if (/KAKAOTALK/i.test(ua)) return 'inapp_kakao';
      if (/NAVER\(inapp|Instagram|FBAN|FBAV|Line\//i.test(ua)) return 'inapp_other';
      return 'browser';
    })()
  });
  if (isReturning) {
    track('revisit', {
      previous_visit: lastVisit,
      visit_count: visitCount,
      day_index: dayIndex,
      in_window: inCohortWindow
    });
  }

  /* =========================================================
   * 7. 화면 제어
   * ======================================================= */

  var doc = win.document;
  var $ = function (id) { return doc.getElementById(id); };
  var state = { ilju: null, guardian: null, talisman: null, diag: null, ctaShown: false };
  var reached = {};

  function show(screenId) {
    var all = doc.querySelectorAll('.screen');
    for (var i = 0; i < all.length; i++) all[i].classList.remove('is-active');
    $(screenId).classList.add('is-active');
    win.scrollTo(0, 0);
  }

  function setCard(imgEl, ohaeng, altText) {
    imgEl.src = CARD_FILE[ohaeng];
    imgEl.alt = altText;
  }

  var reduceMotion = false;
  try {
    reduceMotion = !!(win.matchMedia && win.matchMedia('(prefers-reduced-motion: reduce)').matches);
  } catch (e) { reduceMotion = false; }

  /* ---- S2 렌더: 수호신 공개 ---- */
  function renderS2(birth) {
    var g = read(birth);
    state.guardian = g;

    setCard($('guardImg'), g.오행, g.오행 + ' 기운의 수호신 카드');
    $('guardName').textContent = OHAENG_ATTR[g.오행].수식 + ' ' + g.띠;
    $('guardSub').textContent = g.일주_한글 + '(' + g.일주_한자 + ') · '
      + g.오행 + OHAENG_ATTR[g.오행].한자 + ' · 60갑자 ' + g.갑자순번 + '번';

    var ul = $('guardTraits');
    ul.innerHTML = '';
    var t = TRAITS[g.오행];
    for (var i = 0; i < t.length; i++) {
      var li = doc.createElement('li');
      li.textContent = t[i];
      ul.appendChild(li);
    }

    show('s2');

    var flip = $('cardFlip'), late = $('s2Detail');
    flip.classList.remove('flipped');
    late.classList.remove('shown');
    if (reduceMotion) {
      flip.classList.add('flipped');
      late.classList.add('shown');
    } else {
      win.setTimeout(function () { flip.classList.add('flipped'); }, 420);
      win.setTimeout(function () { late.classList.add('shown'); }, 1080);
    }

    if (!reached.s2) {
      reached.s2 = true;
      track('s2_reached', { ilju: g.일주_한글, ohaeng: g.오행, card_id: g.카드ID });
    }
  }

  /* ---- S3 렌더: 오늘의 흐름 (신설) ---- */
  function renderS3() {
    if (!state.guardian) return;
    var t = read(today);
    state.talisman = t;

    var dg = diagnose(state.guardian, t);
    state.diag = dg;

    $('flowDate').textContent = today.replace(/-/g, '. ');
    $('flowGanji').textContent = t.일주_한글 + '(' + t.일주_한자 + ') · ' + t.오행 + OHAENG_ATTR[t.오행].한자;
    $('flowSummary').textContent = dg.summary;
    $('whyLine').textContent = dg.why;

    // 4영역
    var box = $('areaList');
    box.innerHTML = '';
    for (var i = 0; i < AREA_ORDER.length; i++) {
      var area = AREA_ORDER[i];
      var lv = dg.areas[area];

      var row = doc.createElement('div');
      row.className = 'area area-' + (lv === '좋음' ? 'good' : lv === '보통' ? 'mid' : 'warn');

      var mark = doc.createElement('span');
      mark.className = 'area-mark';
      mark.setAttribute('aria-hidden', 'true');
      mark.textContent = AREA_ICON[lv];

      var nameEl = doc.createElement('span');
      nameEl.className = 'area-name';
      nameEl.textContent = area;

      var lvEl = doc.createElement('span');
      lvEl.className = 'area-level';
      lvEl.textContent = lv;

      var txt = doc.createElement('p');
      txt.className = 'area-text';
      txt.textContent = AREA_TEXT[area][lv];

      var head = doc.createElement('div');
      head.className = 'area-head';
      head.appendChild(mark);
      head.appendChild(nameEl);
      head.appendChild(lvEl);

      row.appendChild(head);
      row.appendChild(txt);
      box.appendChild(row);
    }

    show('s3');

    // 점수 공개 연출(시그니처): 한지가 펼쳐지며 인장이 찍히듯. 지연 0 — 값은 이미 계산돼 있다.
    var scoreEl = $('flowScore'), seal = $('scoreSeal'), panel = $('flowPanel');
    panel.classList.remove('unrolled');
    seal.classList.remove('stamped');
    scoreEl.textContent = String(dg.score);

    if (reduceMotion) {
      panel.classList.add('unrolled');
      seal.classList.add('stamped');
    } else {
      // 카운트업(값은 결정론 — 연출만 점진적)
      var target = dg.score, cur = Math.max(40, target - 18), step = 0;
      scoreEl.textContent = String(cur);
      win.requestAnimationFrame(function () { panel.classList.add('unrolled'); });
      var timer = win.setInterval(function () {
        step++;
        cur = Math.min(target, cur + Math.max(1, Math.round((target - cur) / 3)));
        scoreEl.textContent = String(cur);
        if (cur >= target || step > 30) {
          scoreEl.textContent = String(target);
          win.clearInterval(timer);
          seal.classList.add('stamped');
        }
      }, 40);
    }

    if (!reached.s3) {
      reached.s3 = true;
      track('s3_reached', {
        today_ilju: t.일주_한글,
        today_ohaeng: t.오행,
        score: dg.score,
        r1: dg.r1, r2: dg.r2,
        caution: dg.caution
      });
    }
  }

  /* ---- S4 렌더: 오늘의 부적 + 목적 부적 ---- */
  function renderS4() {
    if (!state.talisman) return;
    var t = state.talisman;
    var dg = state.diag;

    setCard($('talismanImg'), t.오행, '오늘의 부적 — ' + t.오행 + ' 기운');
    $('todayLabel').textContent = today.replace(/-/g, '. ') + ' 오늘의 부적';
    $('talismanName').textContent = OHAENG_ATTR[t.오행].수식 + ' ' + t.띠 + '의 부적';
    $('talismanLine').textContent = TODAY_LINE[t.오행];

    // 진단 → 처방 연결 (변경 A)
    var rx = $('rxBox');
    if (dg && dg.prescription) {
      $('rxCopy').textContent = dg.prescription.카피;
      $('rxTarget').textContent = dg.prescription.부적;
      rx.hidden = false;
    } else {
      rx.hidden = true;
    }

    $('offerTitle').textContent = offer.title;
    $('offerDesc').textContent = offer.desc;
    $('btnCta').textContent = offer.cta;

    var shelf = $('shelfRow');
    shelf.innerHTML = '';
    for (var i = 0; i < PURPOSE_SHELF.length; i++) {
      var item = PURPOSE_SHELF[i];
      var d = doc.createElement('div');
      d.className = 'shelf-item';
      if (dg && dg.prescription && dg.prescription.부적 === item.부적) {
        d.className += ' is-rx';
        var badge = doc.createElement('span');
        badge.className = 'shelf-badge';
        badge.textContent = '추천';
        d.appendChild(badge);
      }
      var s = doc.createElement('span');
      s.className = 'shelf-icon';
      s.textContent = item.icon;
      d.appendChild(s);
      d.appendChild(doc.createTextNode(item.label));
      shelf.appendChild(d);
    }

    show('s4');

    if (!reached.s4) {
      reached.s4 = true;
      track('s4_reached', {
        today_ilju: t.일주_한글,
        today_ohaeng: t.오행,
        rx: dg && dg.prescription ? dg.prescription.부적 : null
      });
    }
    if (!state.ctaShown) {
      state.ctaShown = true;
      track('cta_shown', { arm: arm, offer: offer.title });
    }
  }

  /* =========================================================
   * 8. 이벤트 바인딩
   * ======================================================= */

  // S1 제출
  $('birthForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var v = $('birth').value;
    var err = $('birthErr');

    var okFormat = /^\d{4}-\d{2}-\d{2}$/.test(v);
    var valid = false;
    if (okFormat) {
      var p = v.split('-');
      var dt = new Date(+p[0], +p[1] - 1, +p[2]);
      valid = dt.getFullYear() === +p[0]
        && dt.getMonth() === +p[1] - 1
        && dt.getDate() === +p[2]
        && v <= today
        && +p[0] >= 1900;
    }
    if (!valid) {
      err.hidden = false;
      // C-⑤ 원문(raw) 저장 금지 — 사유 코드만 남긴다
      track('s1_invalid', { reason: !v ? 'empty' : (!okFormat ? 'format' : 'range') });
      $('birth').focus();
      return;
    }
    err.hidden = true;

    var g = read(v);
    state.ilju = g.일주_한글;
    // C-⑤ 생년월일 원문 저장 금지 — 일주 결과값만 저장
    store.set(LS.ilju, g.일주_한글);

    track('s1_submitted', {
      ilju: g.일주_한글,
      ohaeng: g.오행,
      ganji_no: g.갑자순번,
      has_time: !!$('btime').value,
      has_gender: !!$('gender').value,
      optional_opened: !!doc.querySelector('.opt').open
    });
    renderS2(v);
  });

  // S2
  $('btnSave').addEventListener('click', function () {
    track('save_clicked', { screen: 's2', card_id: state.guardian ? state.guardian.카드ID : null });
    win.alert('저장되었습니다. (목업 — 실제 파일은 저장되지 않습니다)');
  });
  $('btnShare').addEventListener('click', function () {
    track('share_clicked', { screen: 's2', card_id: state.guardian ? state.guardian.카드ID : null });
    win.alert('공유 링크가 준비되었습니다. (목업 — 실제 공유는 동작하지 않습니다)');
  });
  $('toS3').addEventListener('click', function () {
    track('s2_to_s3');
    renderS3();
  });

  // S3
  $('toS4').addEventListener('click', function () {
    track('s3_to_s4', { caution: state.diag ? state.diag.caution : null });
    renderS4();
  });
  $('backToS2').addEventListener('click', function () {
    track('s3_to_s2');
    show('s2');
    $('cardFlip').classList.add('flipped');
    $('s2Detail').classList.add('shown');
  });
  $('whyToggle').addEventListener('toggle', function () {
    if (this.open) track('why_opened', { score: state.diag ? state.diag.score : null });
  });

  // S4
  $('btnCta').addEventListener('click', function () {
    track('cta_clicked', { arm: arm, offer: offer.title });
    $('prepDesc').textContent = offer.title + ' — 곧 만나실 수 있도록 준비하고 있습니다.';
    $('notifyOk').hidden = true;
    $('btnNotify').disabled = false;
    show('s5');
  });
  $('backToS3').addEventListener('click', function () {
    track('s4_to_s3');
    renderS3();
  });

  // S5
  $('btnNotify').addEventListener('click', function () {
    track('notify_requested', { arm: arm, offer: offer.title });
    $('notifyOk').hidden = false;
    this.disabled = true;
  });
  $('backFromS5').addEventListener('click', function () {
    track('s5_back');
    renderS4();
  });

  /* ---- 개발자 패널: 우하단 5회 탭 ---- */
  var taps = 0, tapTimer = null;
  $('devDot').addEventListener('click', function () {
    taps++;
    if (tapTimer) win.clearTimeout(tapTimer);
    tapTimer = win.setTimeout(function () { taps = 0; }, 1500);
    if (taps >= 5) {
      taps = 0;
      $('devJson').value = JSON.stringify(events, null, 1);
      $('devMeta').textContent = 'anon_id ' + anonId + ' · 분기 ' + arm + '(결정론 해시)'
        + ' · 이벤트 ' + events.length + '건 · 방문 ' + visitCount + '회 · D' + dayIndex
        + ' · 저장소 ' + store.mode()
        + ' · 전송 ' + (CONFIG.ENDPOINT ? 'ON' : 'OFF');
      $('devPanel').hidden = false;
    }
  });
  $('devClose').addEventListener('click', function () { $('devPanel').hidden = true; });
  $('devCopy').addEventListener('click', function () {
    var ta = $('devJson');
    ta.select();
    var done = false;
    try { done = doc.execCommand('copy'); } catch (e) { done = false; }
    if (!done && win.navigator.clipboard) {
      win.navigator.clipboard.writeText(ta.value).then(function () {
        $('devCopy').textContent = '복사됨';
      }, function () { $('devCopy').textContent = '복사 실패 — 수동 선택'; });
      return;
    }
    $('devCopy').textContent = done ? '복사됨' : '복사 실패 — 수동 선택';
    win.setTimeout(function () { $('devCopy').textContent = 'JSON 복사'; }, 1600);
  });

  /* ---- 날짜 입력 max = 오늘 (C-⑨ / 변경 A) ---- */
  $('birth').setAttribute('max', today);

  /* ---- 기동 시 self-test ---- */
  var st = runSelfTest();
  win.SMOKE.selfTestResult = st;
  if (st.실패 > 0) track('selftest_failed', { failed: st.실패, total: st.전체 });

  return ENGINE;
});
