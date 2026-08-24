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

  /* saju.js(십성 엔진) 참조 — 브라우저는 전역, Node는 require. 한 번만 해석해 캐시한다. */
  var _saju = undefined;
  function getSaju() {
    if (_saju !== undefined) return _saju;
    _saju = null;
    try {
      if (typeof window !== 'undefined' && window.SajuEngine) _saju = window.SajuEngine;
      else if (typeof require === 'function') _saju = require('./saju.js');
    } catch (e) { _saju = null; }
    return _saju;
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

    /* 영역별 '왜 이 등급인지'의 사유를 함께 기록한다(v5.1).
     * 화면이 거짓 인과를 말하지 않게 하기 위한 것 — 반환 형태는
     * 기존과 동일한 {영역:등급} 객체를 유지하고, 사유는 out.__reason에 숨겨 붙인다
     * (기존 호출부·테스트가 그대로 동작해야 한다).
     *   'r1'      : 담당 영역이 R1(천간 관계)이라 정해짐
     *   'r2'      : 담당 영역이 R2(지지 관계)라 정해짐
     *   'gwan'    : R1=관성이라 '일'이 주의로 놓임
     *   'rotate'  : 주의가 0개라 무담당 중 결정론 순환으로 강등됨
     *   'neutral' : 무담당 기본값(보통)
     */
    var why = {};

    // 3. 기본값 = 보통(무담당)
    for (i = 0; i < AREA_ORDER.length; i++) { out[AREA_ORDER[i]] = '보통'; why[AREA_ORDER[i]] = 'neutral'; }

    // 2. R2 담당 영역 = 좋음 (일 포함) — 먼저 깔고 R1으로 덮어써 "R1 우선"을 보장
    for (i = 0; i < AREA_ORDER.length; i++) {
      area = AREA_ORDER[i];
      if (AREA_TYPE[area] === r2) { out[area] = '좋음'; why[area] = 'r2'; }
    }

    // 1. R1 담당 영역 = 좋음, 단 R1=관성이면 일=주의
    for (i = 0; i < AREA_ORDER.length; i++) {
      area = AREA_ORDER[i];
      if (AREA_TYPE[area] === r1) {
        var isGwan = (area === '일' && r1 === '관성');
        out[area] = isGwan ? '주의' : '좋음';
        why[area] = isGwan ? 'gwan' : 'r1';
      }
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
        why[pick] = 'rotate';
      }
    }
    // 열거되지 않게 숨겨 붙인다 — Object.keys(areas).length === 4 를 보는 기존 검증 보존
    try {
      Object.defineProperty(out, '__reason', { value: why, enumerable: false });
    } catch (e) { /* 구형 환경: 사유 없이도 동작해야 한다 */ }
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
    '일': { 부적: '합격 부적', 카피: '오늘 압박이 몰리는 날 — 합격 부적으로 중심을 잡으세요.' }
    // '건강'은 목적 부적 4종(합격·면접·재물·연애)에 대응물이 없다. 억지 매핑(구판: 면접) 대신
    // "오늘 채울 기운" 부적 카드가 처방을 담당한다 — S4에서 rxBox를 숨긴다.
  };

  /* D1(하한 30) — 30점대 전용 요약 문구.
   * 원칙: 불안 조장 금지. "나쁜 날"이라 말하지 않고 '무엇을 하면 되는지'만 남긴다.
   * 25조합 요약(SUMMARY)보다 우선해 표시된다(가장 낮은 구간에서만). */
  var LOW_TONE = [
    '속도를 늦추면 오히려 정리가 되는 날 — 급한 결정은 내일로 미뤄 두세요.',
    '벌이기보다 지키기 좋은 날 — 이미 하던 일부터 하나씩 마무리해 보세요.',
    '무리하지 않는 것이 최선인 날 — 중요한 일만 남기고 나머지는 덜어 내세요.'
  ];
  /** 점수 구간에 맞는 요약 문구(결정론). 30점대만 LOW_TONE으로 대체한다. */
  function summaryFor(dg, todayNo, myNo) {
    if (dg.score < 40) return LOW_TONE[mod(todayNo + myNo, LOW_TONE.length)];
    return dg.summary;
  }

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

    /* D. 점수는 십성 10종 기반으로 산출한다(saju.js SCORE_TABLE).
     * 구 5유형 scoreOf()는 겁재를 '보통'으로 처리해 전통 통념(사흉신)과 어긋났다
     * — 리포트 4-3 지적 반영. saju.js가 없으면 구 산식으로 폴백한다. */
    var SJx = getSaju();
    var score, tenGodInfo = null;
    if (SJx && mine.일간 && todayP.일간 && todayP.일지) {
      tenGodInfo = SJx.todayScore(mine.일간, todayP.일간, todayP.일지,
        mine.갑자순번, todayP.갑자순번);
      score = tenGodInfo.score;
    } else {
      score = scoreOf(r1, r2, mine.갑자순번, todayP.갑자순번);
    }
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
      tenGod: tenGodInfo,
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

    // 점수 기대범위는 saju.js의 SCORE_FLOOR/CEIL을 따른다(D1 변경 시 자동 추종).
    var _sj = getSaju();
    var SCORE_LO = _sj ? _sj.SCORE_FLOOR : 40;
    var SCORE_HI = _sj ? _sj.SCORE_CEIL : 95;
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

        if (!(typeof dg.score === 'number' && dg.score >= SCORE_LO && dg.score <= SCORE_HI)) badScore++;

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
        if (dg.caution !== '건강' && (!dg.prescription || !dg.prescription.카피)) badPrescription++; // 건강=용신 카드가 처방
        if (dg.caution && rxCount.hasOwnProperty(dg.caution)) rxCount[dg.caution]++;

        hist[dg.score] = (hist[dg.score] || 0) + 1;
      }
    }

    check('②전수 조합 수', total, 3600);
    check('②점수 ' + SCORE_LO + '~' + SCORE_HI + ' 이탈', badScore, 0);
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
    check('처방 테이블 3영역 완비(건강=용신 카드 담당)', Object.keys(PRESCRIPTION).length, 3);
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

  /* L8-A ② 판매 문구 — 실체 있는 차별점만 적는다(치명 R2 해소).
   * 구 문구는 해상도 차이를 내세웠으나 무료판과 같은 크기라 실체가 없었다(금지어 테스트 대상).
   * 실제 차이는 ⓐ워터마크 없음 ⓑ이름 각인 ⓒ오늘의 가호 문구 각인 셋뿐이다. */
  var OFFERS = {
    A: {
      arm: 'A',
      title: '오늘의 부적 각인판 3,900원',
      desc: '워터마크 없이, 내 이름과 오늘의 가호 문구를 새겨 드립니다. 미리보기로 먼저 확인해 보세요.',
      cta: '각인판 받기 · 3,900원'
    },
    B: {
      arm: 'B',
      title: '매일 부적 패스 · 월 6,900원',
      desc: '매달 원하는 부적 5장을 워터마크 없이 저장하고, 받은 부적은 언제든 다시 내려받을 수 있습니다.',
      cta: '패스 시작하기 · 월 6,900원'
    },
    C: {
      arm: 'C',
      title: '매일 부적 패스 · 월 9,900원',
      desc: '매달 원하는 부적 5장을 워터마크 없이 저장하고, 지금까지 받은 부적 전체를 무제한으로 다시 내려받습니다.',
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
    COHORT_WINDOW: 7,    // 재방문 관찰 창 D1~D7

    /* L8-A ③ 결제 토글 (스펙 2장).
     * off(기본) = 현행 무결제 CTA 그대로, 결제 코드 미노출.
     * on        = 위젯 결제 흐름. 전환은 이 한 줄 + 재배포.
     * 게시 1주차는 off로 둔다(대표님 결착: 1주 무결제 → 2차 결제 on). */
    PAYMENT_ENABLED: false,
    /* 결제 on 시 가격 3-arm 분기를 중단하고 3,900 단일로 고정한다(R6 — 실결제 표본 분산 방지) */
    PAID_AMOUNT: 3900,
    PAID_PRODUCT_ID: 'engraved_v1',
    ORDER_API: ''        // Workers 승인 서버 주소. 비면 결제 진입 불가(fail-closed)
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

  /* v6 — 가호 미리보기 A/B 분기 (스펙 4장, 레드팀 R5 필수 요구)
   * 상품×가격 분기(arm)와 **독립 축**이며 같은 결정론 해시 방식을 쓴다.
   * seed를 'blessing:'으로 달리해 arm과 상관되지 않게 한다.
   *
   * ★ 킬 조건(첫 클릭 3% · 잔존 30% · 완주 40%) 판정은 **미노출군(off) 기준**으로 고정한다.
   *   가호가 지표를 인위적으로 부양해도 판별력이 남아야 하기 때문이다.
   *   노출군(on)은 가호 효과 관찰용이며, 기존 지표의 분모·분자 정의는 바뀌지 않는다
   *   — variant는 이벤트 파라미터로만 병기된다. */
  var BLESSING_VARIANTS = ['off', 'on'];
  var blessingVariant = BLESSING_VARIANTS[hash32('blessing:' + anonId) % 2];
  var showBlessing = (blessingVariant === 'on');

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
      variant: blessingVariant,   // v6: 가호 A/B 태그(기존 지표 정의 무변경 — 파라미터 추가만)
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
  var state = { ilju: null, guardian: null, talisman: null, diag: null, ctaShown: false,
    profile: null, pillars: null, strength: null, need: null, prose: null,
    week: null, areaOpen: null, order: null, paid: null };
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
  /** S2 화면 내용만 채운다(화면 전환·계측 없음). 홈 랜딩에서도 재사용. */
  function fillS2(birth) {
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
    return g;
  }

  /** 홈 랜딩용 — 수호신 상태만 준비하고 S2는 띄우지 않는다(s2_reached 미발생). */
  function renderS2Silent(birth) {
    var g = fillS2(birth);
    // 홈에서 S2로 들어갔을 때 카드가 뒤집힌 상태로 보이게 준비만 해 둔다
    $('cardFlip').classList.add('flipped');
    $('s2Detail').classList.add('shown');
    return g;
  }

  function renderS2(birth) {
    var g = fillS2(birth);

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

    showScrollCue('cueS2');
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
    $('flowSummary').textContent = summaryFor(dg, t.갑자순번, state.guardian.갑자순번);

    /* v4 — 오늘의 풀이 프로즈 + 오늘 채울 기운(간이 용신 -> 부적 연동) */
    var SJp = getSaju();
    if (SJp && dg.tenGod && state.guardian.일간) {
      // 가장 밝은 영역 = '좋음'인 영역 중 앞쪽(결정론). 없으면 '보통' 중 앞쪽.
      var bright = null, mid = null;
      for (var bi = 0; bi < AREA_ORDER.length; bi++) {
        var an = AREA_ORDER[bi];
        if (!bright && dg.areas[an] === '좋음') bright = an;
        if (!mid && dg.areas[an] === '보통') mid = an;
      }
      bright = bright || mid || AREA_ORDER[0];

      var need = SJp.neededElement(state.guardian.일간, t.일간, dg.caution);
      state.need = need;

      var prose = SJp.todayProse({
        stemGod: dg.tenGod.stemGod,
        branchGod: dg.tenGod.branchGod,
        score: dg.score,
        bright: bright,
        caution: dg.caution,
        needEl: need.오행,
        todayNo: t.갑자순번,
        myNo: state.guardian.갑자순번
      });
      state.prose = prose;

      $('flowProse').textContent = prose.text;
      $('scoreSeal').textContent = prose.seal;   // 吉/平/凶 점수 연동

      // 오늘 채울 기운 카드
      $('needEl').textContent = need.오행 + SJp.EL_HANJA[need.오행] + ' 기운의 부적';
      $('needWhy').textContent = need.이유;
      var img = $('needImg');
      img.src = CARD_FILE[need.오행];
      img.alt = need.오행 + ' 기운의 부적 카드';
      $('needCard').hidden = false;
    } else {
      $('needCard').hidden = true;
    }
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
    seal.textContent = dg.score >= 65 ? '吉' : (dg.score >= 40 ? '平' : '凶');

    if (reduceMotion) {
      panel.classList.add('unrolled');
      seal.classList.add('stamped');
    } else {
      // 카운트업(값은 결정론 — 연출만 점진적)
      var target = dg.score, cur = Math.max(30, target - 18), step = 0;
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

    showScrollCue('cueS3');
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

  /* =========================================================
   * v6 가호 미리보기 헬퍼 (스펙 3장)
   * ★ 구매 전 판매 표면에는 관계 등급과 이유만 넣는다.
   *   숫자·화살표·+N 등 수치 인과 표기는 절대 금지(레드팀 결착·표시광고법).
   * ======================================================= */
  var EL_TAL_ID = { '목': 'el_목', '화': 'el_화', '토': 'el_토', '금': 'el_금', '수': 'el_수' };
  var PURPOSE_TAL_ID = { '합격': 'pp_합격', '면접': 'pp_면접', '재물': 'pp_재물', '연애': 'pp_연애' };

  /** 오늘 기준 가호 등급. 미노출군이거나 엔진이 없으면 null. */
  function blessingFor(talId) {
    if (!showBlessing) return null;              // 미노출군은 계산조차 하지 않는다
    var SJb = getSaju();
    if (!SJb || !SJb.blessingTier || !state.guardian) return null;
    var t = read(today);
    return SJb.blessingTier(talId, state.guardian, t);
  }

  /** 타일에 관계 문양 뱃지를 붙인다(S4·홈 공용 규격). 숫자 금지.
   * 미노출군이면 아무것도 하지 않는다. 붙였으면 tier를 돌려준다. */
  function attachTierMark(tile, talId) {
    var tb = blessingFor(talId);
    if (!tb) return null;
    var mk = doc.createElement('span');
    mk.className = 'tier-mark tier-' + (tb.tier === '大' ? 'dae' : tb.tier === '中' ? 'jung' : 'so');
    mk.setAttribute('data-tier', tb.tier);
    mk.setAttribute('data-tal', talId);
    mk.textContent = tb.tier;
    tile.appendChild(mk);
    trackBlessingView(talId, tb.tier);
    return tb.tier;
  }

  /** 진열대에서 오늘 大인 타일 중 **1개만** 미세 강조한다.
   * 전 타일 동시 강조는 게임화로 읽혀 구매 압박이 되므로 금지(레드팀 R3).
   * 선택은 DOM 순서상 첫 번째 大 — 결정론이라 새로고침해도 같은 타일이 강조된다. */
  function highlightSingleDae() {
    /* 컨테이너를 여러 개 받아 **합산 기준**으로 1개만 고른다.
     * 홈은 오행 5종(shopRow)+목적 4종(shopPurpose)이 나뉘어 있어
     * 각각 돌리면 강조가 2개가 된다 — 그래서 가변 인자로 받는다. */
    var marks = [];
    for (var h = 0; h < arguments.length; h++) {
      var host = arguments[h];
      if (!host) continue;
      var found = host.querySelectorAll('.tier-mark');
      for (var f = 0; f < found.length; f++) marks.push(found[f]);
    }
    var picked = false;
    for (var i = 0; i < marks.length; i++) {
      var m = marks[i];
      m.classList.remove('is-today-dae');
      if (!picked && m.getAttribute('data-tier') === '大') {
        m.classList.add('is-today-dae');
        picked = true;
      }
    }
  }

  /** 카드 최초 노출 시 세션당 부적별 1회만 기록(codex 시점 정의) */
  var blessingSeen = {};
  function trackBlessingView(talId, tier) {
    if (!showBlessing || !talId || blessingSeen[talId]) return;
    blessingSeen[talId] = true;
    track('blessing_preview_viewed', { talisman_id: talId, tier: tier });
  }

  /* =========================================================
   * L8-A ⑤ 결제 흐름 (PAYMENT_ENABLED=on 일 때만 동작)
   *
   * 순서: 이름 입력·동의 → 서버 /orders → 위젯 → successUrl 복귀
   *       → /confirm → 서명 영수증 검증 → 각인판 생성 → 소장 완료(복원 링크)
   *
   * ★ off면 이 경로가 아예 열리지 않는다(기존 무결제 CTA 그대로).
   * ★ purchase_completed는 서버가 /confirm에서 기록한다 — 여기서 보고하지 않는다.
   * ★ 이름은 canvas 합성에만 쓰고 서버로 보내지 않는다.
   * ======================================================= */

  function paymentOn() {
    return CONFIG.PAYMENT_ENABLED === true && !!CONFIG.ORDER_API;
  }

  /** 오늘의 가호 문구 — 각인판에 새길 한 줄(노출군/미노출군 무관하게 각인엔 사용) */
  function engraveBlessing() {
    var SJp = getSaju();
    if (!SJp || !state.guardian) return '';
    var t = read(today);
    var el = state.need ? state.need.오행 : t.오행;
    var talId = EL_TAL_ID[el];
    var b = SJp.blessingTier(talId, state.guardian, t);
    return b ? (b.tier + ' · ' + b.label) : '';
  }

  function renderPayScreen() {
    if (!paymentOn()) return false;
    $('payName').value = '';
    $('payConsent').checked = false;
    $('payErr').hidden = true;
    $('payBlessing').textContent = engraveBlessing() || '오늘의 가호';
    $('payAmount').textContent = CONFIG.PAID_AMOUNT.toLocaleString('ko-KR') + '원';
    show('sp');
    track('pay_screen_viewed', { amount: CONFIG.PAID_AMOUNT });
    return true;
  }

  /** 서버에서 주문을 발급받는다. 금액·주문번호는 서버가 정한다(클라이언트 값 신뢰 금지). */
  function createOrder(cb) {
    win.fetch(CONFIG.ORDER_API + '/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: CONFIG.PAID_PRODUCT_ID })
    }).then(function (r) { return r.json(); })
      .then(function (j) { cb(j && j.orderId ? j : null); })
      .catch(function () { cb(null); });
  }

  /** 승인 요청 — 성공 시 서명 영수증과 복원키를 받는다. */
  function confirmOrder(payload, cb) {
    win.fetch(CONFIG.ORDER_API + '/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (r) {
      return r.json().then(function (j) { return { ok: r.ok, json: j }; });
    }).then(function (res) { cb(res); })
      .catch(function () { cb({ ok: false, json: null }); });
  }

  /** 영수증 검증 — 서명이 있고 주문·금액이 맞아야 각인판 생성을 허용한다.
   * 한계 수용(레드팀 R3): 클라이언트 생성 구조라 개발자도구 우회를 완전히 막을 수는 없다.
   * 캐주얼 위조 차단까지만 하고 그 이상 방어 코드는 넣지 않는다. */
  function receiptValid(receipt, orderId) {
    if (!receipt || !receipt.payload || !receipt.signature) return false;
    var p = receipt.payload;
    return p.orderId === orderId
      && Number(p.amount) === Number(CONFIG.PAID_AMOUNT)
      && p.productId === CONFIG.PAID_PRODUCT_ID
      && !!p.paidAt;
  }

  function showPaidScreen(receipt, restoreKey, name) {
    state.paid = { receipt: receipt, restoreKey: restoreKey, name: name };
    var g = state.guardian;
    if (g) {
      $('paidImg').src = CARD_FILE[state.need ? state.need.오행 : g.오행];
      $('paidImg').alt = '각인판 미리보기';
    }
    var link = CONFIG.ORDER_API + '/restore?key=' + encodeURIComponent(restoreKey);
    $('restoreLink').textContent = link;
    $('scToast').hidden = true;
    show('sc');
    /* purchase_completed는 서버가 기록한다 — 여기서는 화면 도달만 남긴다 */
    track('purchase_screen_viewed', {});
  }

  function startPayment() {
    if (!paymentOn()) return;
    var name = String($('payName').value || '').trim();
    var agreed = !!$('payConsent').checked;
    if (!name) { showPayErr('각인할 이름을 입력해 주세요.'); return; }
    if (name.length > 12) { showPayErr('이름은 12자 이내로 입력해 주세요.'); return; }
    if (!agreed) { showPayErr('청약철회 제한 안내에 동의해 주세요.'); return; }
    $('payErr').hidden = true;

    track('pay_start_clicked', {});
    createOrder(function (order) {
      if (!order) { showPayErr('주문을 만들지 못했어요. 잠시 후 다시 시도해 주세요.'); return; }
      state.order = order;

      /* 결제 위젯 — 실제 SDK는 배포 시 주입한다.
       * 여기서는 위젯 호출부만 두고, 테스트에서는 주입된 스텁이 successUrl 복귀를 흉내낸다. */
      var widget = win.TossPaymentsWidget || null;
      if (!widget) {
        showPayErr('결제 모듈을 불러오지 못했어요.');
        track('pay_widget_missing', {});
        return;
      }
      widget.requestPayment({
        orderId: order.orderId,
        amount: order.amount,
        orderName: '오늘의 부적 각인판'
      }, function (result) {
        if (!result || !result.paymentKey) {
          track('pay_cancelled', {});
          return;   // 사용자가 취소 — 조용히 돌아간다
        }
        finishPayment(order, result.paymentKey, name);
      });
    });
  }

  function finishPayment(order, paymentKey, name) {
    confirmOrder({
      orderId: order.orderId,
      paymentKey: paymentKey,
      amount: order.amount,
      consentText: $('consentText').textContent,   // 동의 문구 원문 서버 보존(이름 미포함)
      anonId: anonId,
      variant: blessingVariant
    }, function (res) {
      if (!res.ok || !res.json || res.json.status !== 'PAID') {
        showPayErr('결제 확인에 실패했어요. 결제되었다면 곧 자동으로 처리됩니다.');
        track('pay_confirm_failed', { code: res.json && res.json.error });
        return;
      }
      if (!receiptValid(res.json.receipt, order.orderId)) {
        showPayErr('영수증 검증에 실패했어요.');
        track('pay_receipt_invalid', {});
        return;
      }
      showPaidScreen(res.json.receipt, res.json.restoreKey, name);
    });
  }

  function showPayErr(msg) {
    var el = $('payErr');
    el.textContent = msg;
    el.hidden = false;
  }

  /** 각인판 저장 — 워터마크 없음 + 이름·가호 각인 */
  function downloadEngraved() {
    if (!state.paid) return;
    composeCard(function (blob) {
      try {
        triggerDownload(blob || (state.guardian ? CARD_FILE[state.guardian.오행] : null));
        showScToast('각인판을 저장했어요');
        track('paid_download', { mode: blob ? 'composed' : 'original' });
      } catch (e) {
        showScToast('저장하지 못했어요. 잠시 후 다시 시도해 주세요');
      }
    }, { paid: true, name: state.paid.name, blessing: engraveBlessing() });
  }

  var scToastTimer = null;
  function showScToast(msg) {
    var el = $('scToast');
    if (!el) return;
    el.textContent = msg;
    el.hidden = false;
    if (scToastTimer) win.clearTimeout(scToastTimer);
    scToastTimer = win.setTimeout(function () { el.hidden = true; }, 2600);
  }

  /* ---- S4 렌더: 오늘의 부적 + 목적 부적 ---- */
  function renderS4() {
    if (!state.talisman) return;
    var t = state.talisman;
    var dg = state.diag;

    /* v4 — 오늘의 부적은 "오늘 채울 기운"(간이 용신) 카드가 된다.
     * 매일 이유가 바뀌므로 카드도 매일 달라진다(재구매 엔진). 용신이 없으면 일진 오행 폴백. */
    var needEl = state.need ? state.need.오행 : t.오행;
    setCard($('talismanImg'), needEl, '오늘의 부적 — ' + needEl + ' 기운');
    $('todayLabel').textContent = today.replace(/-/g, '. ') + ' 오늘의 부적';
    $('talismanName').textContent = needEl + OHAENG_ATTR[needEl].한자 + ' 기운의 부적';
    $('talismanLine').textContent = state.need ? state.need.이유 : TODAY_LINE[t.오행];

    // 진단 → 처방 연결 (변경 A)
    var rx = $('rxBox');
    if (dg && dg.prescription) {
      $('rxCopy').textContent = dg.prescription.카피;
      $('rxTarget').textContent = dg.prescription.부적;
      rx.hidden = false;
    } else {
      rx.hidden = true;
    }

    /* v6 — 오늘의 가호(관계 등급 + 이유 1줄). 미노출군은 요소 자체를 숨긴다.
     * 숫자·화살표는 넣지 않는다(구매 전 판매 표면 수치 인과 금지). */
    var mainTalId = EL_TAL_ID[needEl];
    var bl = blessingFor(mainTalId);
    if (bl) {
      $('blessingMark').textContent = bl.tier;
      $('blessingLabel').textContent = bl.tier + ' — ' + bl.label;
      $('blessingWhy').textContent = bl.이유;
      $('blessingBox').hidden = false;
      $('blessingNote').hidden = false;
      trackBlessingView(mainTalId, bl.tier);
    } else {
      $('blessingBox').hidden = true;
      $('blessingNote').hidden = true;
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

      /* v6 — 관계 문양 뱃지(숫자 금지). 大 강조는 뒤에서 1개만 남긴다. */
      attachTierMark(d, PURPOSE_TAL_ID[item.label]);
      shelf.appendChild(d);
    }
    /* 오늘 大인 부적이 여럿이어도 강조는 1개만(전 타일 동시 강조 금지 — 레드팀 R3 게임화 방지) */
    highlightSingleDae(shelf);

    show('s4');

    if (!reached.s4) {
      reached.s4 = true;
      /* 첫 완주 지점. s4_reached(기존 완주 이벤트)는 그대로 두고,
       * 홈 랜딩 자격 표식만 별도로 남긴다 — 기존 지표 정의 무변경. */
      markFirstRunDone();
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
   * 9. v3 프로필 층 + 휠 피커 + 사주 분석 (B·C·D)
   *
   * 4기둥은 vendor/manseryeok.js(MIT)에 위임한다. 야자시는 참고앱 정합을 위해
   * dayBoundary:'jasi'(23:30 경계)로 고정하고, UI에서 "모름"을 허용한다.
   * ======================================================= */

  var MS = win.Manseryeok || null;          // 4기둥 라이브러리(없으면 사주 화면만 비활성)
  var SJ = win.SajuEngine || null;          // 십성·오행·성격 엔진
  var PF = win.ProfileStore || null;        // 프로필 저장소 모듈
  var profiles = PF ? PF.makeStore(store) : null;

  var DAY_BOUNDARY = 'jasi';                // 야자시 고정(대표님 승인 2026-08-22)

  /* ---- 프로필 -> 4기둥 ---- */
  function pillarsOf(p) {
    if (!MS) return null;
    var hourInfo = PF.resolveHour(p);
    var info = {
      year: p.year, month: p.month, day: p.day,
      hour: hourInfo ? hourInfo.h : 12,      // 모름이면 정오로 계산하되 시주는 표시하지 않는다
      minute: hourInfo ? hourInfo.m : 0,
      isLunar: p.calendar === 'lunar',
      isLeapMonth: !!p.leap,
      dayBoundary: DAY_BOUNDARY
    };
    try {
      var r = MS.calculateFourPillars(info);
      return {
        year: { stem: r.year.heavenlyStem, branch: r.year.earthlyBranch },
        month: { stem: r.month.heavenlyStem, branch: r.month.earthlyBranch },
        day: { stem: r.day.heavenlyStem, branch: r.day.earthlyBranch },
        hour: hourInfo ? { stem: r.hour.heavenlyStem, branch: r.hour.earthlyBranch } : null,
        solar: MS.lunarToSolar && p.calendar === 'lunar'
          ? MS.lunarToSolar(p.year, p.month, p.day, !!p.leap)
          : { year: p.year, month: p.month, day: p.day }
      };
    } catch (e) {
      return null;
    }
  }

  /** 프로필의 양력 생년월일 ISO — 수호신 카드(기존 일주 산술)용 */
  function solarISOof(p) {
    var pil = pillarsOf(p);
    var s = (pil && pil.solar) ? pil.solar : { year: p.year, month: p.month, day: p.day };
    return s.year + '-' + pad2(s.month) + '-' + pad2(s.day);
  }

  /* =========================================================
   * 9-1. 프로필 목록 (S0)
   * ======================================================= */

  function renderProfileList() {
    if (!profiles) return;
    var box = $('profileList');
    box.innerHTML = '';
    var list = profiles.list();

    if (!list.length) {
      var empty = doc.createElement('p');
      empty.className = 'tiny center';
      empty.textContent = '아직 등록된 사용자가 없습니다. 아래에서 추가해 주세요.';
      box.appendChild(empty);
    }

    for (var i = 0; i < list.length; i++) {
      (function (p) {
        var row = doc.createElement('div');
        row.className = 'profile-row';

        var pick = doc.createElement('button');
        pick.type = 'button';
        pick.className = 'profile-pick';

        var nm = doc.createElement('span');
        nm.className = 'profile-name';
        nm.textContent = p.name;

        var meta = doc.createElement('span');
        meta.className = 'profile-meta';
        var cal = p.calendar === 'lunar' ? (p.leap ? '음력 윤달' : '음력') : '양력';
        var hrInfo = PF.resolveHour(p);
        var hr = hrInfo ? (hrInfo.label + ' ' + hrInfo.range) : '시각 모름';
        meta.textContent = cal + ' ' + p.year + '.' + pad2(p.month) + '.' + pad2(p.day) + ' · ' + hr;

        pick.appendChild(nm);
        pick.appendChild(meta);
        pick.addEventListener('click', function () {
          selectProfile(p.id);
        });

        var del = doc.createElement('button');
        del.type = 'button';
        del.className = 'profile-del';
        del.setAttribute('aria-label', p.name + ' 삭제');
        del.textContent = '삭제';
        del.addEventListener('click', function () {
          if (win.confirm(p.name + ' 님의 프로필을 지울까요?')) {
            profiles.remove(p.id);
            track('profile_removed', {});
            renderProfileList();
            renderWelcome();
          }
        });

        row.appendChild(pick);
        row.appendChild(del);
        box.appendChild(row);
      })(list[i]);
    }
  }

  function selectProfile(id) {
    var p = profiles.get(id);
    if (!p) return;
    profiles.setActive(id);
    state.profile = p;
    var iso = solarISOof(p);
    // C-⑤ 생년월일 원문은 계측에 넣지 않는다 — 일주 결과값만
    var g = read(iso);
    store.set(LS.ilju, g.일주_한글);
    var done = isFirstRunDone();
    track('profile_selected', {
      ilju: g.일주_한글, ohaeng: g.오행,
      calendar: p.calendar, has_hour: !!p.hourBranch, has_gender: !!p.gender,
      landing: done ? 'home' : 'linear'
    });
    /* ★ 완주 정의 보존: 첫 완주를 마치지 않은 사용자는 반드시 기존 선형을 탄다.
     * 완주 후·재방문만 홈으로 랜딩한다(스펙 1장). */
    if (done) {
      renderS2Silent(iso);   // 수호신 상태만 세팅하고 화면은 홈으로
      renderHome();
    } else {
      renderS2(iso);
    }
  }

  /* =========================================================
   * 9-2. 휠 피커 (생년월일 3열)
   * ======================================================= */

  var pickState = { y: 1990, m: 1, d: 1 };

  /* 휠 기하 (style.css와 반드시 같은 값이어야 한다)
   *   .wheels        height     = WHEEL_H
   *   .wheel-item    height     = ITEM_H
   *   .wheel-pad     height     = PAD_H = (WHEEL_H - ITEM_H) / 2
   *   .wheel-mask    top        = PAD_H
   * 항목 i를 중앙띠에 놓는 스크롤 위치는 scrollTop = i * ITEM_H 이다
   * (콘텐츠상 항목 위치 PAD_H + i*ITEM_H 에서 중앙띠 시작 PAD_H 를 뺀 값).
   * i=0 이면 0, i=마지막이면 (n-1)*ITEM_H 이고, 최대 스크롤도 (n-1)*ITEM_H 이므로
   * 양끝 항목이 모두 도달 가능하다. CSS는 scroll-snap-align:center +
   * scroll-padding 80px 로 이 좌표계와 일치시킨다(start로 두면 80px 어긋나
   * 첫 항목이 중앙에 못 와서 1월·1일이 선택 불가해진다 — 2026-08-22 실기기 결함). */
  var WHEEL_H = 200;
  var ITEM_H = 40;
  var PAD_H = (WHEEL_H - ITEM_H) / 2;

  /** 항목 인덱스 -> 중앙 정렬 scrollTop */
  function centerTopFor(index) { return index * ITEM_H; }
  /** 항목 n개일 때 최대 스크롤 위치 */
  function maxScrollFor(count) { return Math.max(0, (count - 1) * ITEM_H); }

  /* 휠 기하를 테스트에 노출한다 — DOM 테스트가 스크롤 좌표를 기하학적으로 검증한다
   * (클릭 우회로는 2026-08-22 실기기 결함을 못 잡았다). 상수 정의 뒤에 할당해야
   * 값이 확정된다(win.SMOKE 리터럴에 넣으면 호이스팅 때문에 undefined가 된다). */
  win.SMOKE.wheel = {
    WHEEL_H: WHEEL_H, ITEM_H: ITEM_H, PAD_H: PAD_H,
    centerTopFor: centerTopFor, maxScrollFor: maxScrollFor
  };

  function buildWheel(el, values, current, onPick) {
    el.innerHTML = '';
    var padTop = doc.createElement('div');
    padTop.className = 'wheel-pad';
    el.appendChild(padTop);

    for (var i = 0; i < values.length; i++) {
      (function (v) {
        var it = doc.createElement('div');
        it.className = 'wheel-item';
        it.setAttribute('role', 'option');
        it.dataset.value = String(v.value);
        it.textContent = v.label;
        if (v.value === current) it.classList.add('is-sel');
        it.addEventListener('click', function () {
          scrollToValue(el, v.value);
          onPick(v.value);
        });
        el.appendChild(it);
      })(values[i]);
    }

    var padBot = doc.createElement('div');
    padBot.className = 'wheel-pad';
    el.appendChild(padBot);

    scrollToValue(el, current, true);
  }

  function scrollToValue(el, value, instant) {
    var items = el.querySelectorAll('.wheel-item');
    for (var i = 0; i < items.length; i++) {
      if (items[i].dataset.value === String(value)) {
        var top = centerTopFor(i);
        if (instant || reduceMotion) el.scrollTop = top;
        else if (el.scrollTo) el.scrollTo({ top: top, behavior: 'smooth' });
        else el.scrollTop = top;
        markSelected(el, value);
        return;
      }
    }
  }

  function markSelected(el, value) {
    var items = el.querySelectorAll('.wheel-item');
    for (var i = 0; i < items.length; i++) {
      var on = items[i].dataset.value === String(value);
      items[i].classList[on ? 'add' : 'remove']('is-sel');
      items[i].setAttribute('aria-selected', on ? 'true' : 'false');
    }
  }

  /** 스크롤이 멈추면 가운데 항목으로 스냅 */
  function attachSnap(el, getValues, onPick) {
    var t = null;
    el.addEventListener('scroll', function () {
      if (t) win.clearTimeout(t);
      t = win.setTimeout(function () {
        var idx = Math.round(el.scrollTop / ITEM_H);
        var vals = getValues();
        if (idx < 0) idx = 0;
        if (idx > vals.length - 1) idx = vals.length - 1;
        var v = vals[idx];
        if (v === undefined) return;
        el.scrollTop = centerTopFor(idx);   // 스냅(중앙 정렬 좌표)
        markSelected(el, v.value);
        onPick(v.value);
      }, 90);
    }, { passive: true });

    // 접근성: 키보드 위/아래
    el.addEventListener('keydown', function (e) {
      var vals = getValues();
      var cur = 0;
      for (var i = 0; i < vals.length; i++) {
        if (el.querySelector('.wheel-item.is-sel') &&
          el.querySelector('.wheel-item.is-sel').dataset.value === String(vals[i].value)) { cur = i; break; }
      }
      var next = null;
      if (e.key === 'ArrowDown') next = Math.min(vals.length - 1, cur + 1);
      else if (e.key === 'ArrowUp') next = Math.max(0, cur - 1);
      else if (e.key === 'Home') next = 0;
      else if (e.key === 'End') next = vals.length - 1;
      if (next === null) return;
      e.preventDefault();
      scrollToValue(el, vals[next].value);
      onPick(vals[next].value);
    });
  }

  function yearValues() {
    var out = [], nowY = parseInt(today.slice(0, 4), 10);
    for (var y = 1900; y <= nowY; y++) out.push({ value: y, label: y + '년' });
    return out;
  }
  function monthValues() {
    var out = [];
    for (var m = 1; m <= 12; m++) out.push({ value: m, label: m + '월' });
    return out;
  }
  function dayValues() {
    var out = [], dim = PF.daysInMonth(pickState.y, pickState.m);
    for (var d = 1; d <= dim; d++) out.push({ value: d, label: d + '일' });
    return out;
  }

  function refreshDayWheel() {
    var dim = PF.daysInMonth(pickState.y, pickState.m);
    if (pickState.d > dim) pickState.d = dim;      // 2월 31일 같은 조합 차단
    buildWheel($('wheelD'), dayValues(), pickState.d, function (v) { pickState.d = v; });
  }

  function openBirthPicker() {
    var sheet = $('birthPicker');
    buildWheel($('wheelY'), yearValues(), pickState.y, function (v) {
      pickState.y = v; refreshDayWheel();
    });
    buildWheel($('wheelM'), monthValues(), pickState.m, function (v) {
      pickState.m = v; refreshDayWheel();
    });
    refreshDayWheel();
    sheet.hidden = false;
    track('picker_opened', { kind: 'birth' });
  }

  function closeBirthPicker() { $('birthPicker').hidden = true; }

  function birthLabel() {
    return pickState.y + '년 ' + pickState.m + '월 ' + pickState.d + '일';
  }

  /* =========================================================
   * 9-3. 시진 피커
   * ======================================================= */

  var draft = { hourBranch: null, hourIndex: null, calendar: 'solar', leap: false, gender: null, birthTouched: false };

  function openHourPicker() {
    var box = $('hourList');
    box.innerHTML = '';

    var mk = function (branch, label, sub, idx) {
      var on = (idx === null) ? (draft.hourIndex === null) : (draft.hourIndex === idx);
      var b = doc.createElement('button');
      b.type = 'button';
      b.className = 'hour-item' + (on ? ' is-on' : '');
      b.setAttribute('role', 'option');
      b.setAttribute('aria-selected', on ? 'true' : 'false');
      var t = doc.createElement('span');
      t.className = 'hour-name';
      t.textContent = label;
      b.appendChild(t);
      if (sub) {
        var sEl = doc.createElement('span');
        sEl.className = 'hour-range';
        sEl.textContent = sub;
        b.appendChild(sEl);
      }
      b.addEventListener('click', function () {
        draft.hourBranch = branch;
        draft.hourIndex = idx;
        $('hourDisplay').textContent = branch ? (label + ' ' + sub) : '모름';
        $('hourPicker').hidden = true;
        track('hour_selected', { known: !!branch, night: idx === 0 });
      });
      return b;
    };

    box.appendChild(mk(null, '모름', '', null));
    for (var i = 0; i < PF.HOURS.length; i++) {
      var h = PF.HOURS[i];
      box.appendChild(mk(h.branch, h.label, h.range, i));
    }
    $('hourPicker').hidden = false;
    track('picker_opened', { kind: 'hour' });
  }

  /* =========================================================
   * 9-4. 사주 분석 화면 (SA)
   * ======================================================= */

  function renderSA() {
    if (!state.profile || !SJ || !MS) return;
    var p = state.profile;
    var pil = pillarsOf(p);
    if (!pil) return;
    state.pillars = pil;

    $('saOwner').textContent = p.name;

    var dayStem = pil.day.stem;
    var st = SJ.strength(pil);
    state.strength = st;

    // 요약: 일간 + 월지 계절
    var season = SJ.BRANCH_SEASON[pil.month.branch];
    var elName = SJ.STEM_EL[dayStem];
    $('saSummary').textContent = dayStem + elName + ' · ' + season + '의 기운';

    // 키워드 칩 3개
    var per = SJ.personality(dayStem, st.판정);
    var chips = $('saChips');
    chips.innerHTML = '';
    for (var c = 0; c < per.키워드.length; c++) {
      var chip = doc.createElement('span');
      chip.className = 'chip';
      chip.textContent = per.키워드[c];
      chips.appendChild(chip);
    }

    // 내사주표 — 시/일/월/년 순(참고앱 구조)
    var order = ['hour', 'day', 'month', 'year'];
    var rowS = $('rowStem'), rowB = $('rowBranch');
    rowS.innerHTML = ''; rowB.innerHTML = '';

    for (var i = 0; i < order.length; i++) {
      var key = order[i], col = pil[key];

      var tdS = doc.createElement('td');
      var tdB = doc.createElement('td');

      if (!col) {                                  // 시주 모름
        tdS.className = 'cell cell-unknown';
        tdS.textContent = '모름';
        tdB.className = 'cell cell-unknown';
        tdB.textContent = '모름';
        rowS.appendChild(tdS); rowB.appendChild(tdB);
        continue;
      }

      var sEl = SJ.STEM_EL[col.stem], bEl = SJ.BRANCH_EL[col.branch];
      var sGod = (key === 'day') ? '본인' : SJ.tenGod(dayStem, col.stem);
      var bGod = SJ.branchTenGod(dayStem, col.branch);

      tdS.className = 'cell el-' + sEl + (key === 'day' ? ' cell-self' : '');
      tdS.appendChild(cellInner(SJ.STEM_HANJA[col.stem], col.stem, sGod));
      tdB.className = 'cell el-' + bEl;
      tdB.appendChild(cellInner(SJ.BRANCH_HANJA[col.branch], col.branch, bGod));

      rowS.appendChild(tdS);
      rowB.appendChild(tdB);
    }
    $('saHourNote').hidden = !!pil.hour;

    // 오행 분포 — 오각 다이어그램(SVG 자체 제작)
    var cnt = SJ.elementCount(pil);
    $('saElTotal').textContent = '(' + cnt.합계 + '글자 기준)';
    renderPentagon($('saElPenta'), cnt);

    // 선천 성격
    $('saPersona').textContent = per.본문;
    $('saStrength').textContent = '기운의 세기: ' + st.판정
      + ' (득령 ' + (st.득령 ? '○' : '×')
      + ' · 득지 ' + (st.득지 ? '○' : '×')
      + ' · 득세 ' + (st.득세 ? '○' : '×') + ')';

    show('sa');

    showScrollCue('cueSa');
    if (!reached.sa) {
      reached.sa = true;
      track('sa_reached', {
        day_stem: dayStem, season: season, strength: st.판정,
        el_total: cnt.합계, has_hour: !!pil.hour
      });
    }
  }

  /* ---- 오행 오각 다이어그램 (인라인 SVG, 라이브러리 0) ----
   * 정점 5개에 오행 원 + 개수. 상생(목→화→토→금→수→목)은 금색 실선,
   * 상극(목→토→수→화→금→목)은 주사색 점선. 스펙 1장 컴포넌트 1.
   */
  var SVG_NS = 'http://www.w3.org/2000/svg';
  var EL_FILL = {
    '목': '#3E7C59', '화': '#B3402A', '토': '#C9A227', '금': '#C9CCD1', '수': '#2E4A6B'
  };
  // 개수 텍스트 색 — 각 원 위에서 대비가 확보되는 값(금·백은 어두운 글자)
  var EL_TEXT = {
    '목': '#F0E7D3', '화': '#F0E7D3', '토': '#1A1408', '금': '#1A1408', '수': '#F0E7D3'
  };

  function svgEl(name, attrs) {
    var e = doc.createElementNS(SVG_NS, name);
    for (var k in attrs) if (attrs.hasOwnProperty(k)) e.setAttribute(k, String(attrs[k]));
    return e;
  }

  function renderPentagon(host, cnt) {
    host.innerHTML = '';
    var W = 280, H = 210, cx = W / 2, cy = 104, R = 74;

    var svg = svgEl('svg', {
      'class': 'el-penta', viewBox: '0 0 ' + W + ' ' + H,
      role: 'img',
      'aria-label': '오행 분포 — ' + SJ.EL_ORDER.map(function (e) {
        return e + ' ' + cnt[e] + '개';
      }).join(', ')
    });

    // 정점 좌표: 12시부터 시계방향으로 목·화·토·금·수(상생 순서 = 오각형 둘레)
    var order = SJ.EL_ORDER;   // ['목','화','토','금','수']
    var pos = {};
    for (var i = 0; i < 5; i++) {
      var ang = -Math.PI / 2 + (i * 2 * Math.PI / 5);
      pos[order[i]] = { x: cx + R * Math.cos(ang), y: cy + R * Math.sin(ang) };
    }

    // 상극(점선) 먼저 = 별 모양 대각선. 뒤에 그려질 원에 가려지도록 순서 앞
    for (var g = 0; g < order.length; g++) {
      var from = order[g], to = SJ.GEUK[from];
      if (!pos[to]) continue;
      svg.appendChild(svgEl('line', {
        'class': 'penta-line-geuk',
        x1: pos[from].x.toFixed(1), y1: pos[from].y.toFixed(1),
        x2: pos[to].x.toFixed(1), y2: pos[to].y.toFixed(1)
      }));
    }
    // 상생(실선) = 오각형 둘레
    for (var t = 0; t < order.length; t++) {
      var f2 = order[t], t2 = SJ.SAENG[f2];
      if (!pos[t2]) continue;
      svg.appendChild(svgEl('line', {
        'class': 'penta-line-saeng',
        x1: pos[f2].x.toFixed(1), y1: pos[f2].y.toFixed(1),
        x2: pos[t2].x.toFixed(1), y2: pos[t2].y.toFixed(1)
      }));
    }

    // 정점 원 + 개수 + 라벨
    for (var n = 0; n < order.length; n++) {
      var el = order[n], v = cnt[el] || 0;
      var p = pos[el];
      // 개수에 따라 반지름을 살짝 키운다(0이면 작고 흐리게)
      var r = 15 + Math.min(3, v) * 2.2;

      // 개수 0 = "그 기운이 없다"는 정보다. 채우지 않고 흐린 윤곽선만 남겨
      // 배경에 묻히지 않게 한다(2026-08-22 검수 반영).
      var empty = (v === 0);
      svg.appendChild(svgEl('circle', {
        'class': 'penta-node' + (empty ? ' is-zero' : ''),
        cx: p.x.toFixed(1), cy: p.y.toFixed(1), r: r.toFixed(1),
        fill: empty ? 'none' : EL_FILL[el],
        stroke: empty ? EL_FILL[el] : 'rgba(201,162,39,.45)',
        'stroke-dasharray': empty ? '3 2' : 'none'
      }));

      var num = svgEl('text', {
        'class': 'penta-count' + (empty ? ' is-zero-num' : ''),
        x: p.x.toFixed(1), y: p.y.toFixed(1),
        fill: empty ? '#A89E88' : EL_TEXT[el]
      });
      num.textContent = String(v);
      svg.appendChild(num);

      // 라벨은 바깥쪽으로 밀어 배치
      var lx = cx + (p.x - cx) * 1.42, ly = cy + (p.y - cy) * 1.42;
      var lab = svgEl('text', {
        'class': 'penta-label',
        x: lx.toFixed(1), y: (ly + 4).toFixed(1)
      });
      lab.textContent = el + SJ.EL_HANJA[el];
      svg.appendChild(lab);
    }

    host.appendChild(svg);
    return svg;
  }

  function cellInner(hanja, korean, god) {
    var wrap = doc.createElement('span');
    wrap.className = 'cell-in';
    var h = doc.createElement('span');
    h.className = 'cell-hanja';
    h.textContent = hanja;
    var k = doc.createElement('span');
    k.className = 'cell-kor';
    k.textContent = korean;
    var g = doc.createElement('span');
    g.className = 'cell-god';
    g.textContent = god || '';
    wrap.appendChild(h); wrap.appendChild(k); wrap.appendChild(g);
    return wrap;
  }


  /* =========================================================
   * 11. v5 — 홈 허브(SH) · 영역 상세(SD) · 주간 그래프 · 행운
   *
   * ★ 완주 정의 보존(스펙 1장·주의 1):
   *   신규 사용자의 첫 완주는 기존 선형(S0→S2→SA→S3→S4)을 그대로 탄다.
   *   홈 랜딩은 "첫 완주를 마친 뒤"와 "재방문"에만 적용한다.
   *   완주 여부는 세션 메모리(reached)가 아니라 localStorage에 남겨야
   *   재방문에서도 유지된다.
   * ======================================================= */

  var LS_DONE = 'gs_first_run_done';   // 첫 완주 표식(홈 랜딩 자격)

  function isFirstRunDone() { return store.get(LS_DONE) === '1'; }
  function markFirstRunDone() {
    if (isFirstRunDone()) return;
    store.set(LS_DONE, '1');
    track('first_run_completed', {});   // 기존 지표 정의 무변경 — 이벤트 추가만
  }

  /* ---- 질문형 카피 (자체 작성 — 참고앱 문구 복제 금지) ---- */
  var AREA_QUESTION = {
    '재물': '오늘 돈의 흐름은 어느 쪽일까요?',
    '애정': '오늘 마음은 어디로 향할까요?',
    '일': '오늘 일은 어떻게 풀릴까요?',
    '건강': '오늘 몸은 어떤 신호를 보낼까요?'
  };
  var AREA_ICON_MARK = { '좋음': '●', '보통': '◐', '주의': '○' };
  // 영역 -> 부적 연결 (v4 결정 유지: 건강은 오늘 채울 기운 부적)
  var AREA_TALISMAN = {
    '재물': '재물 부적', '애정': '연애 부적', '일': '합격 부적', '건강': null
  };

  /** 오늘 진단을 한 번만 계산해 홈·상세가 공유한다(결정론이라 값은 동일) */
  function todayContext() {
    if (!state.guardian) return null;
    var t = read(today);
    var dg = diagnose(state.guardian, t);
    var SJx = getSaju();
    var need = (SJx && state.guardian.일간)
      ? SJx.neededElement(state.guardian.일간, t.일간, dg.caution)
      : null;
    return { today: t, diag: dg, need: need, saju: SJx };
  }

  /* =========================================================
   * 11-1. 홈 허브 렌더
   * ======================================================= */

  function renderHome() {
    var ctx = todayContext();
    if (!ctx || !ctx.saju) return;
    var SJx = ctx.saju, t = ctx.today, dg = ctx.diag;

    state.talisman = t;
    state.diag = dg;
    state.need = ctx.need;

    $('homeOwner').textContent = state.profile ? state.profile.name : '';

    // 1. 오늘 점수 요약
    var grade = SJx.scoreGrade(dg.score);
    $('homeScore').textContent = String(dg.score);
    $('homeSeal').textContent = SJx.GRADE_SEAL[grade];
    $('homeGanji').textContent = today.replace(/-/g, '. ') + ' · ' + t.일주_한글;
    $('homeLine').textContent = summaryFor(dg, t.갑자순번, state.guardian.갑자순번);

    // 2. 수호신 미니 카드
    var g = state.guardian;
    $('homeGuardImg').src = CARD_FILE[g.오행];
    $('homeGuardImg').alt = g.오행 + ' 기운의 수호신 카드';
    $('homeGuardName').textContent = OHAENG_ATTR[g.오행].수식 + ' ' + g.띠;
    $('homeGuardSub').textContent = g.일주_한글 + '(' + g.일주_한자 + ') · 60갑자 ' + g.갑자순번 + '번';

    // 3. 세부 운세 4카드
    var grid = $('areaGrid');
    grid.innerHTML = '';
    for (var i = 0; i < AREA_ORDER.length; i++) {
      (function (area) {
        var lv = dg.areas[area];
        var card = doc.createElement('button');
        card.type = 'button';
        card.className = 'area-card area-' + (lv === '좋음' ? 'good' : lv === '보통' ? 'mid' : 'warn');

        var head = doc.createElement('span');
        head.className = 'area-card-head';
        var mk = doc.createElement('span');
        mk.className = 'area-mark';
        mk.setAttribute('aria-hidden', 'true');
        mk.textContent = AREA_ICON_MARK[lv];
        var nm = doc.createElement('span');
        nm.className = 'area-card-name';
        nm.textContent = area + '운';
        var lvEl = doc.createElement('span');
        lvEl.className = 'area-level';
        lvEl.textContent = lv;
        head.appendChild(mk); head.appendChild(nm); head.appendChild(lvEl);

        /* v6 — 영역 점수(비중첩 대역). 가호가 아니므로 양군 공통으로 노출한다. */
        var SJn = getSaju();
        if (SJn && SJn.areaScore) {
          var av = SJn.areaScore(area, lv, t.갑자순번, state.guardian.갑자순번);
          if (av !== null) {
            var numEl = doc.createElement('span');
            numEl.className = 'area-card-score';
            numEl.textContent = String(av);
            head.appendChild(numEl);
          }
        }

        var q = doc.createElement('span');
        q.className = 'area-card-q';
        q.textContent = AREA_QUESTION[area];

        card.appendChild(head);
        card.appendChild(q);
        card.addEventListener('click', function () { renderAreaDetail(area); });
        grid.appendChild(card);
      })(AREA_ORDER[i]);
    }

    // 4. 이번 주 흐름
    renderWeek(SJx);

    // 5. 오늘 채울 기운 + 행운
    if (ctx.need) {
      $('homeNeedImg').src = CARD_FILE[ctx.need.오행];
      $('homeNeedImg').alt = ctx.need.오행 + ' 기운의 부적';
      $('homeNeedEl').textContent = ctx.need.오행 + SJx.EL_HANJA[ctx.need.오행] + ' 기운의 부적';
      $('homeNeedWhy').textContent = ctx.need.이유;
      $('homeNeedCard').hidden = false;

      var lk = SJx.luckOf(ctx.need.오행);
      if (lk) {
        $('luckDir').textContent = lk.방위;
        $('luckColor').textContent = lk.색;
        $('luckNum').textContent = lk.숫자표기;
        $('luckTime').textContent = lk.시간대;
        $('luckNote').textContent = lk.한줄;
        $('luckCard').hidden = false;
      }
    } else {
      $('homeNeedCard').hidden = true;
      $('luckCard').hidden = true;
    }

    // 6. 부적 진열대 — 오행 5종 + 목적 4종
    var shop = $('shopRow');
    shop.innerHTML = '';
    for (var e = 0; e < SJx.EL_ORDER.length; e++) {
      (function (el) {
        var it = doc.createElement('button');
        it.type = 'button';
        it.className = 'shop-item' + (ctx.need && ctx.need.오행 === el ? ' is-today' : '');
        var im = doc.createElement('img');
        im.src = CARD_FILE[el];
        im.alt = el + ' 기운의 부적';
        im.setAttribute('decoding', 'async');
        var cap = doc.createElement('span');
        cap.className = 'shop-cap';
        cap.textContent = el + SJx.EL_HANJA[el];
        it.appendChild(im); it.appendChild(cap);
        /* v6 스펙 §3 — 홈 진열대에도 관계 문양 뱃지(노출군 한정, 숫자 금지) */
        attachTierMark(it, EL_TAL_ID[el]);
        it.addEventListener('click', function () {
          track('shop_item_clicked', { element: el, today: ctx.need && ctx.need.오행 === el });
          renderS4();
        });
        shop.appendChild(it);
      })(SJx.EL_ORDER[e]);
    }

    var purpose = $('shopPurpose');
    purpose.innerHTML = '';
    for (var pi = 0; pi < PURPOSE_SHELF.length; pi++) {
      (function (item) {
        var d = doc.createElement('button');
        d.type = 'button';
        d.className = 'shelf-item';
        var sp = doc.createElement('span');
        sp.className = 'shelf-icon';
        sp.textContent = item.icon;
        d.appendChild(sp);
        d.appendChild(doc.createTextNode(item.label));
        attachTierMark(d, PURPOSE_TAL_ID[item.label]);
        d.addEventListener('click', function () {
          track('shop_purpose_clicked', { purpose: item.label });
          renderS4();
        });
        purpose.appendChild(d);
      })(PURPOSE_SHELF[pi]);
    }

    /* 홈 大 강조도 1개만 — 오행 5종 + 목적 4종을 **합산** 기준으로 센다(스펙 §3).
     * 두 컨테이너를 각각 돌리면 최대 2개가 강조되므로 함께 넘긴다. */
    highlightSingleDae(shop, purpose);

    show('sh');
    maybeShowAreaHint();   // v7: 첫 홈 1회만 탭 힌트
    // 홈에 들어오면 다른 화면의 홈 버튼을 노출한다
    var hb = ['s2Home', 'saHome', 's3Home', 's4Home'];
    for (var h = 0; h < hb.length; h++) $(hb[h]).hidden = false;

    if (!reached.sh) {
      reached.sh = true;
      track('home_reached', { score: dg.score, grade: grade, need: ctx.need ? ctx.need.오행 : null });
    }
  }

  /* =========================================================
   * 11-2. 이번 주 흐름 — 인라인 SVG 미니 그래프(라이브러리 0)
   * ======================================================= */

  function renderWeek(SJx) {
    var host = $('weekChart');
    host.innerHTML = '';
    var series = SJx.weekFlow(state.guardian, read, today, addDaysISO, 7);
    state.week = series;

    var W = 300, H = 110, padX = 18, padY = 14;
    var lo = SJx.SCORE_FLOOR, hi = SJx.SCORE_CEIL;
    var innerW = W - padX * 2, innerH = H - padY * 2 - 16;
    var stepX = innerW / (series.length - 1);
    var yOf = function (v) { return padY + innerH - ((v - lo) / (hi - lo)) * innerH; };

    var svg = svgEl('svg', {
      'class': 'week-svg', viewBox: '0 0 ' + W + ' ' + H, role: 'img',
      'aria-label': '이번 주 흐름 — ' + series.map(function (d) {
        return d.iso.slice(5) + ' ' + d.score + '점';
      }).join(', ')
    });

    // 기준선(중앙)
    svg.appendChild(svgEl('line', {
      'class': 'week-base', x1: padX, y1: yOf((lo + hi) / 2).toFixed(1),
      x2: W - padX, y2: yOf((lo + hi) / 2).toFixed(1)
    }));

    // 꺾은선
    var pts = series.map(function (d, i) {
      return (padX + i * stepX).toFixed(1) + ',' + yOf(d.score).toFixed(1);
    }).join(' ');
    svg.appendChild(svgEl('polyline', { 'class': 'week-line', points: pts }));

    // 점 + 날짜 + 탭 영역
    for (var i = 0; i < series.length; i++) {
      (function (d, idx) {
        var cx = padX + idx * stepX, cy = yOf(d.score);
        var dot = svgEl('circle', {
          'class': 'week-dot' + (d.isToday ? ' is-today' : '') + ' wk-' + d.grade,
          cx: cx.toFixed(1), cy: cy.toFixed(1), r: d.isToday ? 5.5 : 3.8
        });
        svg.appendChild(dot);

        var lab = svgEl('text', {
          'class': 'week-label' + (d.isToday ? ' is-today' : ''),
          x: cx.toFixed(1), y: (H - 3).toFixed(1)
        });
        lab.textContent = d.isToday ? '오늘' : d.iso.slice(8).replace(/^0/, '') + '일';
        svg.appendChild(lab);

        // 탭 영역(터치 44px 확보용 투명 사각)
        var hit = svgEl('rect', {
          'class': 'week-hit',
          x: (cx - stepX / 2).toFixed(1), y: 0,
          width: stepX.toFixed(1), height: H
        });
        hit.addEventListener('click', function () {
          showWeekTip(d);
        });
        svg.appendChild(hit);
      })(series[i], i);
    }

    host.appendChild(svg);
    $('weekTip').hidden = true;
  }

  /** 툴팁은 항상 1개만 열린다(스펙 3장) */
  function showWeekTip(d) {
    var tip = $('weekTip');
    tip.textContent = d.iso.replace(/-/g, '. ') + ' · ' + d.ganji + ' · ' + d.score + '점(' + d.seal + ')';
    tip.hidden = false;
    track('week_point_tapped', { offset: d.offset, score: d.score, grade: d.grade });
  }

  /* =========================================================
   * 11-3. 영역 상세(SD)
   * ======================================================= */

  function renderAreaDetail(area) {
    var ctx = todayContext();
    if (!ctx || !ctx.saju) return;
    var SJx = ctx.saju, t = ctx.today, dg = ctx.diag;
    var lv = dg.areas[area];

    state.areaOpen = area;

    $('sdEyebrow').textContent = today.replace(/-/g, '. ') + ' 오늘의 ' + area + '운';
    $('sdTitle').textContent = area + '운 · ' + lv;

    // 등급 게이지 3구간 (금색 hairline, 인라인 SVG) + v6 영역 점수 병기
    var SJs = SJx;
    var sdScore = (SJs && SJs.areaScore)
      ? SJs.areaScore(area, lv, t.갑자순번, state.guardian.갑자순번) : null;
    renderGauge($('sdGauge'), lv, sdScore);

    // 영역 프로즈 — 내 일간 × 오늘 천간의 십성
    var god = SJx.areaGodOf(state.guardian.일간, t.일간);
    var prose = SJx.areaProse(area, god, t.갑자순번, state.guardian.갑자순번);
    $('sdProse').textContent = prose || '';

    /* "왜 이 등급" 설명 1줄 — 거짓 인과 금지(v5.1 검수 반영).
     * 십성 관계가 등급을 정한 것은 '담당 영역'일 때뿐이다. 무담당은 기본값이고,
     * 주의는 순환 강등일 수 있으므로 사유별로 정직하게 나눠 말한다. */
    var reason = (dg.areas.__reason && dg.areas.__reason[area]) || 'neutral';
    var elName = state.guardian.오행;
    /* 받침 유무에 따라 조사를 고른다(오행 5종: 목/금 받침O, 화/토/수 받침X). */
    var josa = (elName === '목' || elName === '금') ? '과' : '와';
    var lvJosa = (lv === '주의') ? '로' : '으로';
    var relText;
    if (reason === 'r1' || reason === 'r2' || reason === 'gwan') {
      // ① 담당 영역 — 십성 관계가 실제로 이 등급을 정했다
      relText = '오늘의 간지 ' + t.일주_한글 + ' — 당신의 ' + state.guardian.일간
        + '(' + elName + ')' + josa + ' ' + god + ' 관계라 ' + area + '운이 ' + lv + lvJosa + ' 놓였습니다.';
    } else if (reason === 'rotate') {
      // ② 순환 강등 — 크게 흔들리는 곳이 없어 상대적으로 짚은 자리
      relText = '오늘은 크게 흔들리는 영역이 없는 날입니다. 그중 상대적으로 아껴 둘 곳으로 '
        + area + '운을 짚었습니다.';
    } else {
      // ③ 무담당 기본값 — 오늘 기운이 이 영역을 특별히 건드리지 않는다
      relText = '오늘의 기운이 ' + area + ' 쪽을 특별히 밀지도 조이지도 않는 날입니다.';
    }
    $('sdRelation').textContent = relText;

    // 부적 연결 — 건강은 오늘 채울 기운 부적(v4 결정 유지)
    var talisman = AREA_TALISMAN[area];
    var needEl = ctx.need ? ctx.need.오행 : null;
    if (!talisman && needEl) talisman = needEl + SJx.EL_HANJA[needEl] + ' 기운의 부적';

    /* 처방 카피도 사유에 맞춘다 — 순환 강등을 "헐거워진다"고 단정하지 않는다.
     * (홈의 간이 용신 카드 문구는 v4 확정분이라 건드리지 않는다) */
    var rxCopy;
    if (lv === '주의' && reason === 'rotate') {
      rxCopy = '오늘 특별히 위태로운 곳은 없지만, ' + area + ' 쪽을 한 번 살펴 두면 좋은 날입니다.';
    } else if (lv === '주의') {
      rxCopy = '오늘 ' + area + ' 쪽이 헐거워지기 쉬운 날입니다.';
    } else {
      rxCopy = '오늘 ' + area + ' 흐름을 이어 두면 좋은 날입니다.';
    }
    $('sdRxCopy').textContent = rxCopy;
    $('sdRxTarget').textContent = talisman || '부적';
    $('sdCta').textContent = (talisman || '부적') + ' 보기';

    show('sd');

    track('area_detail_viewed', { area: area, level: lv, god: god, score: dg.score });
  }

  /** 등급 게이지 — 3구간(주의/보통/좋음) 중 현재 위치 강조 */
  function renderGauge(host, level, score) {
    host.innerHTML = '';
    var W = 280, H = 34, segW = (W - 4) / 3;
    var order = ['주의', '보통', '좋음'];
    /* 색 의미 정합(v5.1 검수): 홈 카드 배지는 주의=주사 빨강인데
     * 게이지만 항상 금색이면 같은 '주의'가 두 색으로 보인다.
     * 주의일 때만 주사 계열로 분기하고 좋음·보통은 금색을 유지한다. */
    var warnCls = (level === '주의') ? ' is-warn' : '';
    var svg = svgEl('svg', {
      'class': 'gauge-svg', viewBox: '0 0 ' + W + ' ' + H,
      role: 'img', 'aria-label': '오늘 등급 ' + level
    });
    for (var i = 0; i < order.length; i++) {
      var on = order[i] === level;
      svg.appendChild(svgEl('rect', {
        'class': 'gauge-seg' + (on ? ' is-on' + warnCls : ''),
        x: (2 + i * segW).toFixed(1), y: 2,
        width: (segW - 3).toFixed(1), height: (H - 12).toFixed(1), rx: 3
      }));
      var tx = svgEl('text', {
        'class': 'gauge-label' + (on ? ' is-on' + warnCls : ''),
        x: (2 + i * segW + segW / 2).toFixed(1), y: (H - 2).toFixed(1)
      });
      tx.textContent = order[i];
      svg.appendChild(tx);
    }
    host.appendChild(svg);
    /* v6 — 게이지 옆 숫자 병기(양군 공통). 등급이 정한 대역 안의 값이라
     * 등급-숫자 역전이 구조적으로 생기지 않는다. */
    if (score !== null && score !== undefined) {
      var sc = doc.createElement('p');
      sc.className = 'gauge-score';
      sc.textContent = String(score) + '점';
      host.appendChild(sc);
    }
  }


  /* =========================================================
   * 15. v7 — S0 환영 모드 (스펙 1장) · 탭 어포던스 (스펙 2장)
   *
   * ★ 신규(등록 0명) 동선·문구는 한 글자도 바꾸지 않는다.
   *   환영 모드는 등록 1명 이상일 때만 켜지고, CTA는 기존 selectProfile()을
   *   그대로 호출한다(새 경로 금지 — 완주 정의·선형 보존).
   * ======================================================= */

  var LS_HINT = 'gs_area_hint_shown';   // 세부 운세 힌트 1회성 표식

  /* 인사 1줄 — 시간대별 3변형. 결정론(시각으로만 갈림), 확언·과장 금지. */
  function greetingFor(name, hour) {
    var h = (typeof hour === 'number') ? hour : new Date().getHours();
    var slot = (h >= 5 && h < 12) ? '아침' : (h >= 12 && h < 18) ? '낮' : '밤';
    var line;
    if (slot === '아침') line = '님, 오늘의 기운이 준비되어 있어요';
    else if (slot === '낮') line = '님, 오늘 흐름을 살펴보실 시간이에요';
    else line = '님, 오늘 하루의 기운을 확인해 보세요';
    return { slot: slot, text: name + line };
  }

  /** 대표 사용자 — 최근 활성 프로필, 없으면 첫 프로필 */
  function headlineProfile() {
    if (!profiles) return null;
    var active = profiles.getActive();
    if (active) return active;
    var list = profiles.list();
    return list.length ? list[0] : null;
  }

  /** 환영 모드 렌더. 등록 0명이면 아무것도 하지 않고 기존 화면을 그대로 둔다. */
  function renderWelcome() {
    if (!profiles) return false;
    var head = headlineProfile();
    if (!head) {
      // 첫 방문 — 현행 유지(문구·동선 무변경). 여기선 '새 사용자 추가'가 주 CTA다.
      $('welcomeBox').hidden = true;
      $('s0Empty').hidden = false;
      $('profileList').hidden = false;
      $('btnAddProfile').className = 'btn btn-main';
      return false;
    }

    var iso = solarISOof(head);
    var g = read(iso);
    var t = read(today);

    $('welcomeImg').src = CARD_FILE[g.오행];
    $('welcomeImg').alt = g.오행 + ' 기운의 수호신 카드';

    var greet = greetingFor(head.name);
    $('welcomeGreet').textContent = greet.text;
    $('welcomeName').textContent = OHAENG_ATTR[g.오행].수식 + ' ' + g.띠;

    /* 오늘 티저 — 간지 + 인장만. 점수 수치·풀이 문장은 넣지 않는다
     * (눌러 들어갈 이유를 메인에서 소진하지 않기 위함 — 스펙 1장 3번).
     * 가호 요소도 넣지 않는다(A/B 축 오염 금지). */
    var SJw = getSaju();
    var seal = '';
    if (SJw && state && g.일간) {
      var dgw = diagnose(g, t);
      seal = SJw.GRADE_SEAL[SJw.scoreGrade(dgw.score)];
    }
    var md = today.split('-');
    $('welcomeTeaser').textContent = (+md[1]) + '월 ' + (+md[2]) + '일 ' + t.일주_한글 + '일';
    $('welcomeSeal').textContent = seal || '·';

    $('welcomeBox').hidden = false;
    $('s0Empty').hidden = true;
    $('profileList').hidden = true;          // 목록은 "다른 사람 보기"로 펼친다
    /* 시각 위계(스펙 §1-5 "하단에 작게"): 환영 모드의 주 CTA는 '오늘의 운세 보기' 하나뿐이다.
     * '새 사용자 추가'는 '다른 사람 보기'와 같은 급의 부 CTA로 낮춘다.
     * 0명 화면에서는 이 버튼이 주 CTA이므로 대형 금색을 그대로 둔다. */
    $('btnAddProfile').className = 'btn btn-sub';
    $('btnWelcomeSwitch').setAttribute('aria-expanded', 'false');

    if (!reached.welcome) {
      reached.welcome = true;
      track('welcome_shown', { slot: greet.slot, profiles: profiles.count() });
    }
    return true;
  }

  /** 진행 버튼이 폴드 밖일 때 인지가 안 되는 문제 — 각 화면 첫 진입 시 1회만 유도 신호.
   * 세션 단위(reached)라 같은 화면을 다시 봐도 반복 노출되지 않는다. */
  var cueShown = {};
  function showScrollCue(cueId) {
    var el = $(cueId);
    if (!el) return;
    if (cueShown[cueId]) { el.hidden = true; return; }
    cueShown[cueId] = true;
    el.hidden = false;
  }

  /** 첫 홈 랜딩 1회만 힌트를 보여준다(잔소리 방지 — 스펙 2장). */
  function maybeShowAreaHint() {
    var el = $('areaHint');
    if (!el) return;
    if (store.get(LS_HINT) === '1') { el.hidden = true; return; }
    el.hidden = false;
    store.set(LS_HINT, '1');
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

  /* =========================================================
   * v7.2 — S2 저장 / 공유 실동작 (목업 alert 제거)
   *
   * 벤치마크 공통 문법상 "결과=저장/공유 이미지"가 1급 CTA인데,
   * 목업 자백 alert가 뜨면 스모크에서 신뢰가 깨진다. 실제로 동작시킨다.
   *  · 저장: 카드 이미지 + 수호신명 + 간지를 canvas로 합성해 PNG 다운로드
   *          (assets는 same-origin이라 canvas 오염 없음)
   *  · 공유: navigator.share → 미지원 시 클립보드 복사
   *  · 결과 알림은 alert이 아니라 캡션 톤 토스트
   *  · 파일명은 ASCII 고정, 생년월일 등 개인정보는 파일명·공유문구에 넣지 않는다
   * ======================================================= */

  var SHARE_URL = 'https://bsrod0701-cell.github.io/suhoshin/';
  var SAVE_FILENAME = 'guardian_card.png';   // ASCII 고정(한글 파일명 인코딩 회피)

  var toastTimer = null;
  /** 캡션 톤 토스트. alert을 쓰지 않는다. */
  function showToast(msg) {
    var el = $('s2Toast');
    if (!el) return;
    el.textContent = msg;
    el.hidden = false;
    if (toastTimer) win.clearTimeout(toastTimer);
    toastTimer = win.setTimeout(function () { el.hidden = true; }, 2600);
  }

  /** 카드 위에 얹을 문구 — 개인정보(생년월일)는 넣지 않는다. */
  function cardCaption() {
    var g = state.guardian;
    if (!g) return null;
    return {
      name: OHAENG_ATTR[g.오행].수식 + ' ' + g.띠,
      sub: g.일주_한글 + '(' + g.일주_한자 + ') · ' + g.오행 + OHAENG_ATTR[g.오행].한자
    };
  }

  /** 수호신 카드를 canvas로 합성한다. 성공 시 blob을 콜백으로 넘긴다. */
  /* L8-A ① 무료 저장 = 시용상품(워터마크판).
   * 전상법 시행령의 "시험 사용 상품 제공" 요건을 이 무료판이 담당한다(R1 해소).
   * opts.paid === true 이면 워터마크를 넣지 않고 이름·가호 문구를 각인한다(유료 각인판). */
  var WATERMARK_TEXT = '내 수호신 · suhoshin';

  function composeCard(cb, opts) {
    opts = opts || {};
    var g = state.guardian;
    if (!g || !doc.createElement) { cb(null); return; }
    var cap = cardCaption();
    var src = CARD_FILE[g.오행];

    var img = new win.Image();
    img.onload = function () {
      try {
        var W = img.naturalWidth || 675, H = img.naturalHeight || 1200;
        var cv = doc.createElement('canvas');
        cv.width = W; cv.height = H;
        var cx = cv.getContext('2d');
        if (!cx) { cb(null); return; }

        cx.drawImage(img, 0, 0, W, H);

        /* 하단에 먹색 띠를 깔고 그 위에 글자를 올린다(카드 아트를 가리지 않게 최소 높이) */
        var band = Math.round(H * 0.18);
        var grad = cx.createLinearGradient(0, H - band, 0, H);
        grad.addColorStop(0, 'rgba(19,16,9,0)');
        grad.addColorStop(0.35, 'rgba(19,16,9,0.82)');
        grad.addColorStop(1, 'rgba(19,16,9,0.95)');
        cx.fillStyle = grad;
        cx.fillRect(0, H - band, W, band);

        cx.textAlign = 'center';
        cx.fillStyle = '#F0E7D3';
        cx.font = '700 ' + Math.round(W * 0.085) + 'px "Gowun Batang", serif';
        cx.fillText(cap.name, W / 2, H - Math.round(band * 0.52));

        cx.fillStyle = '#C9A227';
        cx.font = '400 ' + Math.round(W * 0.048) + 'px sans-serif';
        cx.fillText(cap.sub, W / 2, H - Math.round(band * 0.22));

        if (opts.paid) {
          /* 유료 각인판 — 워터마크 없음 + 이름 각인 + 오늘의 가호 문구 각인.
           * 이름은 canvas 합성에만 쓰고 서버로 보내지 않는다(개인정보 미전송). */
          if (opts.name) {
            cx.fillStyle = '#F0E7D3';
            cx.font = '700 ' + Math.round(W * 0.052) + 'px "Gowun Batang", serif';
            cx.fillText(opts.name, W / 2, Math.round(H * 0.085));
          }
          if (opts.blessing) {
            cx.fillStyle = 'rgba(240,231,211,0.92)';
            cx.font = '400 ' + Math.round(W * 0.040) + 'px sans-serif';
            cx.fillText(opts.blessing, W / 2, Math.round(H * 0.135));
          }
        } else {
          /* 무료 미리보기 — 은은한 워터마크(공유 시 유입 경로 겸용) */
          cx.fillStyle = 'rgba(240,231,211,0.55)';
          cx.font = '400 ' + Math.round(W * 0.038) + 'px sans-serif';
          cx.fillText(WATERMARK_TEXT, W / 2, H - Math.round(band * 0.06));
        }

        if (cv.toBlob) {
          cv.toBlob(function (blob) { cb(blob); }, 'image/png');
        } else {
          cb(null);
        }
      } catch (e) {
        cb(null);   // 합성 실패 시 원본 다운로드로 폴백
      }
    };
    img.onerror = function () { cb(null); };
    img.src = src;
  }

  /** blob(또는 원본 경로)을 <a download>로 내려받는다. */
  function triggerDownload(blobOrUrl) {
    var a = doc.createElement('a');
    var isBlob = blobOrUrl && typeof blobOrUrl !== 'string';
    var url = isBlob ? win.URL.createObjectURL(blobOrUrl) : blobOrUrl;
    a.href = url;
    a.download = SAVE_FILENAME;
    if (doc.body && doc.body.appendChild) doc.body.appendChild(a);
    a.click();
    if (doc.body && doc.body.removeChild) {
      try { doc.body.removeChild(a); } catch (e) { /* 무시 */ }
    }
    if (isBlob && win.URL.revokeObjectURL) {
      win.setTimeout(function () { win.URL.revokeObjectURL(url); }, 1000);
    }
    return true;
  }

  /** 공유 문구 — 생년월일 등 개인정보를 넣지 않는다. */
  function shareText() {
    var cap = cardCaption();
    return {
      title: '내 수호신',
      text: cap ? (cap.name + ' — 내 수호신을 찾아보세요') : '내 수호신을 찾아보세요',
      url: SHARE_URL
    };
  }

  // S2
  $('btnSave').addEventListener('click', function () {
    /* 계측 정의 무변경 — 기존 save_clicked를 그대로 쓴다(파라미터만 결과 표시 추가) */
    var cardId = state.guardian ? state.guardian.카드ID : null;
    composeCard(function (blob) {
      var mode = blob ? 'composed' : 'original';
      try {
        triggerDownload(blob || (state.guardian ? CARD_FILE[state.guardian.오행] : null));
        showToast('이미지를 저장했어요');
      } catch (e) {
        mode = 'failed';
        showToast('저장하지 못했어요. 잠시 후 다시 시도해 주세요');
      }
      track('save_clicked', { screen: 's2', card_id: cardId, mode: mode });
    });
  });

  $('btnShare').addEventListener('click', function () {
    var cardId = state.guardian ? state.guardian.카드ID : null;
    var data = shareText();
    var done = function (mode) {
      track('share_clicked', { screen: 's2', card_id: cardId, mode: mode });
    };

    if (win.navigator && typeof win.navigator.share === 'function') {
      try {
        var p = win.navigator.share(data);
        if (p && p.then) {
          p.then(function () { done('native'); },
            function () { done('cancelled'); });   // 사용자가 취소해도 alert 없음
        } else {
          done('native');
        }
        return;
      } catch (e) { /* 폴백으로 진행 */ }
    }

    // 폴백 — 클립보드 복사(alert 금지)
    var link = data.text + ' ' + data.url;
    if (win.navigator && win.navigator.clipboard && win.navigator.clipboard.writeText) {
      win.navigator.clipboard.writeText(link).then(function () {
        showToast('링크를 복사했어요');
        done('clipboard');
      }, function () {
        showToast('링크 복사를 지원하지 않는 환경이에요');
        done('unsupported');
      });
    } else {
      showToast('링크 복사를 지원하지 않는 환경이에요');
      done('unsupported');
    }
  });

  // S3 — "오늘 채울 기운" 부적 CTA (재구매 엔진 계측)
  $('btnNeedCta').addEventListener('click', function () {
    track('need_cta_clicked', {
      element: state.need ? state.need.오행 : null,
      reason: state.need ? state.need.사유코드 : null,
      grade: state.prose ? state.prose.grade : null,
      arm: arm
    });
    $('prepDesc').textContent = (state.need ? state.need.오행 : '') + ' 기운의 부적 — 곧 만나실 수 있도록 준비하고 있습니다.';
    $('notifyOk').hidden = true;
    $('btnNotify').disabled = false;
    show('s5');
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
    /* on이면 결제 화면으로. off면 아래 기존 무결제 경로를 그대로 탄다(동등성 보존). */
    if (paymentOn() && renderPayScreen()) return;
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


  /* =========================================================
   * 10. v3 이벤트 바인딩 (프로필 · 피커 · 사주)
   * ======================================================= */

  if (profiles) {
    // --- S0 목록 ---
    $('btnAddProfile').addEventListener('click', function () {
      if (profiles.isFull()) {
        win.alert('프로필은 최대 ' + PF.MAX_PROFILES + '명까지 저장할 수 있습니다.');
        return;
      }
      // 입력 초안 초기화
      draft = { hourBranch: null, hourIndex: null, calendar: 'solar', leap: false, gender: null, birthTouched: false };
      pickState = { y: 1990, m: 1, d: 1 };
      $('pName').value = '';
      $('birthDisplay').textContent = '생년월일 선택';
      $('hourDisplay').textContent = '모름';
      $('pErr').hidden = true;
      setSeg($('segCalendar'), 'cal', 'solar');
      setSeg($('segGender'), 'gender', null);
      track('profile_form_opened', {});
      show('s0b');
    });

    // --- 세그먼트 버튼(달력·성별) ---
    function setSeg(group, attr, value) {
      var btns = group.querySelectorAll('.seg-btn');
      for (var i = 0; i < btns.length; i++) {
        var on = btns[i].dataset[attr] === value;
        btns[i].classList[on ? 'add' : 'remove']('is-on');
        btns[i].setAttribute('aria-pressed', on ? 'true' : 'false');
      }
    }

    $('segCalendar').addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('.seg-btn') : null;
      if (!b) return;
      var v = b.dataset.cal;
      draft.calendar = (v === 'solar') ? 'solar' : 'lunar';
      draft.leap = (v === 'leap');
      setSeg($('segCalendar'), 'cal', v);
      $('pickHint').textContent = (v === 'solar')
        ? '양력 기준 생년월일을 선택하세요.'
        : (v === 'leap' ? '음력 윤달 기준 생년월일을 선택하세요.' : '음력 기준 생년월일을 선택하세요.');
    });

    $('segGender').addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('.seg-btn') : null;
      if (!b) return;
      draft.gender = b.dataset.gender;
      setSeg($('segGender'), 'gender', draft.gender);
    });

    // --- 생년월일 피커 ---
    $('btnBirthPicker').addEventListener('click', openBirthPicker);
    $('pickCancel').addEventListener('click', closeBirthPicker);
    $('pickDone').addEventListener('click', function () {
      draft.birthTouched = true;
      $('birthDisplay').textContent = birthLabel();
      closeBirthPicker();
      track('birth_picked', {});   // C-⑤ 원문 미기록
    });
    attachSnap($('wheelY'), yearValues, function (v) { pickState.y = v; refreshDayWheel(); });
    attachSnap($('wheelM'), monthValues, function (v) { pickState.m = v; refreshDayWheel(); });
    attachSnap($('wheelD'), dayValues, function (v) { pickState.d = v; });

    // --- 시진 피커 ---
    $('btnHourPicker').addEventListener('click', openHourPicker);
    $('hourCancel').addEventListener('click', function () { $('hourPicker').hidden = true; });

    // --- 저장 ---
    $('btnSaveProfile').addEventListener('click', function () {
      var cand = {
        name: $('pName').value,
        year: pickState.y, month: pickState.m, day: pickState.d,
        calendar: draft.calendar, leap: draft.leap,
        hourBranch: draft.hourBranch, hourIndex: draft.hourIndex, gender: draft.gender,
        __today: today
      };
      if (!draft.birthTouched) {
        showPErr('생년월일을 선택해 주세요.');
        return;
      }
      var res = profiles.add(cand);
      if (!res.ok) { showPErr(res.error); return; }
      $('pErr').hidden = true;
      track('profile_created', {
        calendar: cand.calendar, leap: cand.leap,
        has_hour: !!cand.hourBranch, has_gender: !!cand.gender
      });                                   // C-⑤ 생년월일 원문 미전송
      renderProfileList();
      /* 저장 직후에는 곧바로 selectProfile()로 넘어가므로 환영 화면을 그리지 않는다.
       * 그리면 신규 첫 완주 도중 welcome_shown이 발생해 계측이 오염된다(2026-08-23 적발). */
      selectProfile(res.profile.id);
    });

    function showPErr(msg) {
      var el = $('pErr');
      el.textContent = msg;
      el.hidden = false;
      track('profile_invalid', {});
    }

    $('btnCancelProfile').addEventListener('click', function () {
      track('profile_form_cancelled', {});
      show('s0');
    });

    // --- 사주 화면 이동 ---
    $('toSa').addEventListener('click', function () {
      track('s2_to_sa');
      renderSA();
    });
    $('toS3FromSa').addEventListener('click', function () {
      track('sa_to_s3');
      renderS3();
    });
    $('backToS2FromSa').addEventListener('click', function () {
      track('sa_to_s2');
      show('s2');
      $('cardFlip').classList.add('flipped');
      $('s2Detail').classList.add('shown');
    });

    /* ---- v5 홈 허브 배선 ---- */
    $('homeScoreBox').addEventListener('click', function () {
      track('home_to_s3', {});
      renderS3();
    });
    $('homeGuardBox').addEventListener('click', function () {
      track('home_to_s2', {});
      show('s2');
      $('cardFlip').classList.add('flipped');
      $('s2Detail').classList.add('shown');
    });
    $('homeNeedCta').addEventListener('click', function () {
      track('home_need_clicked', { element: state.need ? state.need.오행 : null });
      renderS4();
    });

    // 각 화면 -> 홈 복귀
    var homeBtns = ['s2Home', 'saHome', 's3Home', 's4Home', 'sdHome'];
    for (var hi = 0; hi < homeBtns.length; hi++) {
      (function (id) {
        $(id).addEventListener('click', function () {
          track('home_returned', { from: id.replace('Home', '') });
          renderHome();
        });
      })(homeBtns[hi]);
    }

    // 영역 상세 CTA / 돌아가기
    $('sdCta').addEventListener('click', function () {
      track('area_cta_clicked', {
        area: state.areaOpen,
        level: state.areaOpen && state.diag ? state.diag.areas[state.areaOpen] : null,
        arm: arm
      });
      renderS4();
    });
    $('sdBack').addEventListener('click', function () {
      track('area_detail_back', { area: state.areaOpen });
      renderHome();
    });

    /* ---- v7 환영 모드 배선 ---- */
    $('btnWelcomeCta').addEventListener('click', function () {
      var head = headlineProfile();
      if (!head) return;
      track('welcome_cta_clicked', {});
      /* ★ 기존 프로필 선택과 **완전히 같은** 분기 함수를 탄다.
       * 완주자=홈 랜딩 / 미완주자=선형 이어서 — 분기 로직 무변경. */
      selectProfile(head.id);
    });

    $('btnWelcomeSwitch').addEventListener('click', function () {
      var list = $('profileList');
      var open = list.hidden;
      list.hidden = !open;
      this.setAttribute('aria-expanded', open ? 'true' : 'false');
      this.textContent = open ? '목록 접기' : '다른 사람 보기';
      if (open) track('welcome_switch_opened', { profiles: profiles.count() });
    });

    /* ---- L8-A 결제 화면 배선 (off면 이 화면에 도달하지 않는다) ---- */
    $('btnPayStart').addEventListener('click', startPayment);
    $('btnPayCancel').addEventListener('click', function () {
      track('pay_cancelled_screen', {});
      renderS4();
    });
    $('spHome').addEventListener('click', function () { renderHome(); });
    $('btnPaidDownload').addEventListener('click', downloadEngraved);
    $('btnScHome').addEventListener('click', function () { renderHome(); });
    $('btnCopyRestore').addEventListener('click', function () {
      var link = $('restoreLink').textContent;
      if (win.navigator && win.navigator.clipboard && win.navigator.clipboard.writeText) {
        win.navigator.clipboard.writeText(link).then(function () {
          showScToast('복원 링크를 복사했어요');
          track('restore_link_copied', {});
        }, function () { showScToast('복사를 지원하지 않는 환경이에요'); });
      } else {
        showScToast('복사를 지원하지 않는 환경이에요');
      }
    });

    // 첫 화면 결정: 프로필이 있으면 목록, 없으면 입력 폼으로 바로
    renderProfileList();
    renderWelcome();
  }

  /* ---- 기동 시 self-test ---- */
  var st = runSelfTest();
  win.SMOKE.selfTestResult = st;
  if (st.실패 > 0) track('selftest_failed', { failed: st.실패, total: st.전체 });

  // 사주 엔진(십성·오행·성격) self-test도 함께 돌린다 — 콘솔 1줄로 재현 가능
  var sj = getSaju();
  if (sj && sj.selfTest) {
    var sjr = sj.selfTest();
    win.SMOKE.sajuSelfTest = sjr;
    if (sjr.실패 > 0) track('saju_selftest_failed', { failed: sjr.실패, total: sjr.전체 });
  }

  return ENGINE;
});
