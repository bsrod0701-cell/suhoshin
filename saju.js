/* 「내 수호신」 사주 분석 엔진 v3 — 십성·오행·성격·오늘 점수 (외부 API 0, 결정론)
 *
 * 근거: projects/사업화_검토/리서치/2026-08-22_사주풀이_방법론.md
 *   3-2 십성 대응표 · 3-4 지장간표(본기) · 4-1 사길신/사흉신 · 5-1b 일간 10종 · 5-2 득령/득지/득세 · 6장 오행 카운트
 *
 * 4기둥(년·월·일·시)은 vendor/manseryeok.js(MIT, yhj1024)에 위임한다.
 *   - 년주=입춘 절입 순간, 월주=절(節) 절입 시각 기준 (절기 천문 계산을 자체 구현하지 않음)
 *   - 우리 기존 일주 산술과 1900~2026 랜덤 300건 전수 일치를 실증한 뒤 채택
 *   - AGPL인 orrery는 코드 차용도 로직 참고도 하지 않는다 — 본 파일은 리포트의 공개 표만 코드화
 *
 * 성격 문장은 전부 자체 작성이다(참고앱·블로그 원문 복제 없음 — 리포트 5-1b의 키워드·근거만 참고).
 * 브라우저/Node 공용.
 */
(function (root, factory) {
  'use strict';
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (typeof window !== 'undefined') window.SajuEngine = api;
})(this, function () {
  'use strict';

  /* =========================================================
   * 1. 기초 테이블 (리포트 1·3장)
   * ======================================================= */

  var STEMS = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];
  var BRANCHES = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'];

  var STEM_HANJA = { '갑': '甲', '을': '乙', '병': '丙', '정': '丁', '무': '戊', '기': '己', '경': '庚', '신': '辛', '임': '壬', '계': '癸' };
  var BRANCH_HANJA = { '자': '子', '축': '丑', '인': '寅', '묘': '卯', '진': '辰', '사': '巳', '오': '午', '미': '未', '신': '申', '유': '酉', '술': '戌', '해': '亥' };

  var STEM_EL = { '갑': '목', '을': '목', '병': '화', '정': '화', '무': '토', '기': '토', '경': '금', '신': '금', '임': '수', '계': '수' };
  var STEM_YY = { '갑': '양', '을': '음', '병': '양', '정': '음', '무': '양', '기': '음', '경': '양', '신': '음', '임': '양', '계': '음' };

  var BRANCH_EL = { '인': '목', '묘': '목', '사': '화', '오': '화', '진': '토', '술': '토', '축': '토', '미': '토', '신': '금', '유': '금', '해': '수', '자': '수' };

  // 리포트 3-4 지장간표 — 본기(정기)만 사용(자·묘·유 중기 유파 상충은 본기에 영향 없음)
  var BRANCH_MAIN = {
    '자': '계', '축': '기', '인': '갑', '묘': '을', '진': '무', '사': '병',
    '오': '정', '미': '기', '신': '경', '유': '신', '술': '무', '해': '임'
  };

  var SAENG = { '목': '화', '화': '토', '토': '금', '금': '수', '수': '목' };
  var GEUK = { '목': '토', '토': '수', '수': '화', '화': '금', '금': '목' };

  var EL_HANJA = { '목': '木', '화': '火', '토': '土', '금': '金', '수': '水' };
  var EL_ORDER = ['목', '화', '토', '금', '수'];

  var BRANCH_SEASON = {
    '인': '봄', '묘': '봄', '진': '봄',
    '사': '여름', '오': '여름', '미': '여름',
    '신': '가을', '유': '가을', '술': '가을',
    '해': '겨울', '자': '겨울', '축': '겨울'
  };

  var BRANCH_HOUR_LABEL = {
    '자': '자시 23:30~01:30', '축': '축시 01:30~03:30', '인': '인시 03:30~05:30',
    '묘': '묘시 05:30~07:30', '진': '진시 07:30~09:30', '사': '사시 09:30~11:30',
    '오': '오시 11:30~13:30', '미': '미시 13:30~15:30', '신': '신시 15:30~17:30',
    '유': '유시 17:30~19:30', '술': '술시 19:30~21:30', '해': '해시 21:30~23:30'
  };

  /* =========================================================
   * 2. 십성 (리포트 3-2 표 그대로 코드화)
   * ======================================================= */

  function tenGod(dayStem, otherStem) {
    var X = STEM_EL[dayStem], Y = STEM_EL[otherStem];
    if (!X || !Y) return null;
    var same = STEM_YY[dayStem] === STEM_YY[otherStem];
    if (X === Y) return same ? '비견' : '겁재';
    if (SAENG[X] === Y) return same ? '식신' : '상관';   // 내가 생하는 = 식상
    if (GEUK[X] === Y) return same ? '편재' : '정재';    // 내가 극하는 = 재성
    if (GEUK[Y] === X) return same ? '편관' : '정관';    // 나를 극하는 = 관성
    if (SAENG[Y] === X) return same ? '편인' : '정인';   // 나를 생하는 = 인성
    return null;
  }

  /** 지지의 십성 — 지장간 본기를 대표 천간으로 삼아 동일 표 적용(리포트 3-3) */
  function branchTenGod(dayStem, branch) {
    return tenGod(dayStem, BRANCH_MAIN[branch]);
  }

  // 리포트 4-1 사길신 / 사흉신
  var FOUR_LUCKY = { '식신': 1, '정재': 1, '정관': 1, '정인': 1 };
  var FOUR_UNLUCKY = { '상관': 1, '겁재': 1, '편관': 1, '편인': 1 };
  function godClass(g) {
    if (FOUR_LUCKY[g]) return '길';
    if (FOUR_UNLUCKY[g]) return '흉';
    return '중'; // 비견 · 편재
  }

  // 십성 -> 사용자 언어 한 단어(화면 라벨 보조)
  var GOD_PLAIN = {
    '비견': '나란한 기운', '겁재': '경쟁의 기운', '식신': '표현의 기운', '상관': '날 선 기운',
    '편재': '기회의 기운', '정재': '결실의 기운', '편관': '압박의 기운', '정관': '질서의 기운',
    '편인': '생각의 기운', '정인': '도움의 기운'
  };

  /* =========================================================
   * 3. 오행 분포 (리포트 6장 — 표면 8글자, 지지는 지지 자체 오행)
   * ======================================================= */

  /** pillars: {year:{stem,branch}, month, day, hour|null}. hour가 null이면 6글자 */
  function elementCount(pillars) {
    var out = { '목': 0, '화': 0, '토': 0, '금': 0, '수': 0, 합계: 0 };
    var keys = ['year', 'month', 'day', 'hour'];
    for (var i = 0; i < keys.length; i++) {
      var p = pillars[keys[i]];
      if (!p) continue;                    // 시주 모름 -> 2글자 제외(합계 6)
      out[STEM_EL[p.stem]]++; out.합계++;
      out[BRANCH_EL[p.branch]]++; out.합계++;
    }
    return out;
  }

  /* =========================================================
   * 4. 신강/신약 (리포트 5-2 득령·득지·득세)
   * ======================================================= */

  /** 상대 오행이 일간을 돕는가(비겁=같은 오행 또는 인성=나를 생함) */
  function helps(dayEl, otherEl) {
    return otherEl === dayEl || SAENG[otherEl] === dayEl;
  }

  function strength(pillars) {
    var dayEl = STEM_EL[pillars.day.stem];

    // 득령: 월지가 비겁 또는 인성 (가장 비중 큼)
    var deukRyeong = helps(dayEl, BRANCH_EL[pillars.month.branch]);

    // 득지: 일지 또는 시지가 일간을 돕는가
    var deukJi = helps(dayEl, BRANCH_EL[pillars.day.branch]);
    if (!deukJi && pillars.hour) deukJi = helps(dayEl, BRANCH_EL[pillars.hour.branch]);

    // 득세: 8글자(시주 모름이면 6글자) 중 비겁·인성이 4개 이상
    var keys = ['year', 'month', 'day', 'hour'], allies = 0;
    for (var i = 0; i < keys.length; i++) {
      var p = pillars[keys[i]];
      if (!p) continue;
      if (helps(dayEl, STEM_EL[p.stem])) allies++;
      if (helps(dayEl, BRANCH_EL[p.branch])) allies++;
    }
    var deukSe = allies >= 4;

    var score = (deukRyeong ? 2 : 0) + (deukJi ? 1 : 0) + (deukSe ? 1 : 0); // 월지 가중 2
    return {
      득령: deukRyeong, 득지: deukJi, 득세: deukSe,
      우군수: allies,
      판정: score >= 3 ? '신강' : (score >= 2 ? '중화' : '신약'),
      점수: score
    };
  }

  /* =========================================================
   * 5. 일간 10종 성격 (리포트 5-1b 키워드 기반 — 문장은 전부 자체 작성)
   *    강/약 2톤만 변주(과설계 금지): 신강이면 기운이 앞서는 톤, 신약이면 살피는 톤.
   * ======================================================= */

  var DAY_MASTER = {
    '갑': {
      은유: '큰 나무', 키워드: ['추진', '정직', '리더'],
      본문: '큰 나무처럼 위로 곧게 자라는 기운입니다. 목표가 정해지면 방향을 잘 바꾸지 않고, 남이 미루는 일을 먼저 떠맡는 자리에 자주 섭니다. 책임지는 모습이 쌓여 신뢰를 얻고, 무리를 이끄는 역할이 자연스럽게 돌아옵니다. 시작을 두려워하지 않아 새로운 판을 여는 데 강점이 있습니다. 사람들은 당신에게 방향을 묻고, 어려운 자리를 맡기려 합니다. 처음부터 무언가를 세우는 일, 흩어진 사람들을 하나의 목표로 모으는 일에서 특히 힘이 납니다. 조급해지는 순간에 한 박자만 늦추면 훨씬 멀리 갑니다. 주변에서는 당신을 믿음직한 사람으로 기억하지만, 정작 스스로는 쉬어야 할 때를 잘 알아채지 못합니다. 힘을 다 쓰기 전에 한 번씩 멈추는 습관이 오래 가는 비결입니다.',
      강: '기운이 뻗어 나가는 자리라 결정이 빠르고 추진력이 두드러집니다. 다만 한번 세운 계획을 고집하다 방향 전환이 늦어질 때가 있고, 굽히는 것을 지는 것으로 여겨 관계에서 손해를 보기도 합니다.',
      약: '겉으로는 조용해도 속에 곧은 심지가 있어, 정말 중요한 일에서만 힘을 냅니다. 다만 주변 사정을 살피다 결정을 미루는 일이 있고, 한번 마음이 상하면 오래 담아 두는 편입니다.'
    },
    '을': {
      은유: '덩굴과 화초', 키워드: ['유연', '사교', '끈기'],
      본문: '덩굴처럼 유연하게 뻗어 나가는 기운입니다. 상황을 빠르게 읽고 사람 사이의 결을 맞추는 감각이 뛰어나 낯선 자리에서도 자기 자리를 찾습니다. 정면으로 부딪치기보다 돌아가는 길을 택해 결국 목적지에 닿는 끈기가 있습니다. 겉은 부드러워도 속은 단단해 쉽게 꺾이지 않습니다. 어디에 놓여도 뿌리를 내리는 적응력이 있어, 사람을 상대하는 일과 조율이 필요한 자리에서 강점이 드러납니다. 부드럽게 설득해 결국 원하는 자리로 가는 방식이 당신의 무기입니다. 가끔은 원하는 것을 그대로 말해도 관계는 무너지지 않습니다. 겉으로 보이는 부드러움 때문에 만만하게 보는 사람도 있지만, 끝까지 남아 자리를 지키는 쪽은 대개 당신입니다. 서두르지 않아도 결국 원하는 곳에 닿습니다.',
      강: '사람이 모이는 자리에서 중심을 잡고, 필요한 것을 부드럽게 얻어 냅니다. 다만 여러 관계를 두루 살피다 정작 자신을 돌보는 일이 뒷순위로 밀리고, 곁의 강한 사람에게 기대는 습관이 생기기도 합니다.',
      약: '조용히 곁을 지키며 상대의 마음을 헤아리는 편입니다. 다만 자기 의사를 미루고 결정을 남에게 넘긴 뒤 속으로 아쉬워하는 일이 잦습니다.'
    },
    '병': {
      은유: '한낮의 태양', 키워드: ['열정', '표현', '공평'],
      본문: '사방을 밝히는 태양 같은 기운입니다. 감정과 생각을 숨기지 않고 드러내 함께 있는 사람의 기분까지 끌어올리고, 처음 만난 자리에서도 분위기를 여는 역할을 맡습니다. 속임이 없고 공평해 사람들이 마음을 놓고 다가옵니다. 포부가 크고 판단이 빠릅니다. 분위기를 살리고 사람을 모으는 일, 앞에 나서서 알리는 일에서 제 몫을 합니다. 당신이 있는 자리는 대체로 활기가 돕니다. 다만 오래 가려면 스스로 식힐 시간을 정해 두는 편이 좋습니다. 한번 마음을 열면 아낌없이 내주는 편이라 곁에 사람이 오래 머뭅니다. 다만 그 온도를 모두가 똑같이 돌려주지는 않는다는 점을 알아 두면 마음이 덜 다칩니다.',
      강: '나서야 할 자리에서 주저하지 않아 큰 판을 여는 힘이 있습니다. 다만 마음이 급해 말이 먼저 나가는 일이 있고, 속내가 그대로 드러나 뜻하지 않은 구설을 만들기도 합니다.',
      약: '밝은 기운을 가까운 사람에게 먼저 나눕니다. 다만 관심이 여러 곳으로 흩어져 시작한 일을 끝까지 끌고 가는 데 힘이 부치고, 반응이 없는 상대 앞에서 쉽게 지치는 편입니다.'
    },
    '정': {
      은유: '촛불과 등불', 키워드: ['섬세', '온기', '집중'],
      본문: '가까운 곳을 오래 밝히는 촛불 같은 기운입니다. 큰 소리를 내지 않아도 곁에 있는 사람의 사정을 세심하게 살피고, 필요한 순간에 조용히 손을 내밉니다. 한 가지에 마음을 두면 깊이 파고들어 남이 놓치는 결을 찾아냅니다. 관찰력과 분석력이 강점입니다. 세밀한 손길이 필요한 일, 오래 들여다봐야 답이 나오는 일에서 빛납니다. 사람의 마음을 살피는 감각이 좋아 곁에 오래 남는 인연이 많습니다. 혼자 삭이지 말고 한 사람에게라도 털어놓으면 훨씬 가벼워집니다. 작고 꾸준한 빛이 오래 남는 법이라, 시간이 지날수록 당신의 진가를 알아보는 사람이 늘어납니다. 조급하게 인정을 구하지 않아도 됩니다.',
      강: '집중해야 할 대상이 정해지면 오래 타오르며 끝을 봅니다. 다만 한곳에 몰입하느라 시야가 좁아지고, 자기 기준에 맞지 않는 것을 잘 넘기지 못하기도 합니다.',
      약: '겉으로는 부드럽지만 속에 쉽게 꺼지지 않는 심지가 있습니다. 다만 생각이 안으로 향해 걱정을 오래 품고, 상대의 기분을 지나치게 살피다 하고 싶은 말을 삼키는 편입니다.'
    },
    '무': {
      은유: '산과 넓은 대지', 키워드: ['중심', '포용', '신뢰'],
      본문: '무게 있게 자리를 지키는 대지 같은 기운입니다. 급하게 움직이지 않고 상황을 끝까지 지켜본 뒤 판단해, 주변에서 믿고 맡기는 일이 많습니다. 여러 사람의 사정을 품는 그릇이 있어 갈등의 가운데에서 조율하는 역할이 어울립니다. 한번 맡은 것은 티 내지 않고 끝까지 지켜 냅니다. 오래 지켜야 하는 일, 여러 사람의 이해가 얽힌 자리를 정리하는 일에 어울립니다. 당신이 자리를 지키는 것만으로 주변이 안정됩니다. 마음을 말로 옮기는 연습을 하면 오해가 크게 줄어듭니다. 요란하지 않아도 당신이 맡은 자리는 좀처럼 무너지지 않습니다. 그 믿음직함이 당신의 가장 큰 자산이니, 스스로를 낮게 보지 않아도 됩니다.',
      강: '흔들리지 않는 중심이 있어 큰 짐을 맡아도 버텨 냅니다. 다만 고집이 세게 드러나고, 변화가 빠른 자리에서는 판단이 늦어 기회를 놓치기도 합니다.',
      약: '조용히 자기 자리를 지키며 주변을 살핍니다. 다만 표현이 서툴러 마음과 다르게 오해를 사고, 남의 몫까지 떠안다 혼자 무거워지는 편입니다.'
    },
    '기': {
      은유: '잘 가꾼 텃밭', 키워드: ['안정', '조율', '실속'],
      본문: '무언가를 길러 내는 밭흙 같은 기운입니다. 눈에 띄는 자리보다 실제로 일이 굴러가게 만드는 자리에서 힘을 발휘하고, 사람 사이의 어긋난 결을 조용히 맞춰 놓습니다. 인정이 많아 곁의 사람을 잘 챙기며, 무엇이든 기르고 가꾸는 일에 감각이 있습니다. 현실 감각이 좋아 헛된 일에 시간을 쓰지 않습니다. 사람을 기르고 돌보는 일, 흩어진 것을 챙겨 굴러가게 만드는 일에서 강점이 드러납니다. 가르치고 보살피는 자리와 잘 맞습니다. 베풀 때는 돌아올 것을 세지 않는 편이 마음이 편합니다. 눈에 잘 띄지 않는 자리에서 실제로 일을 굴러가게 만드는 사람이 당신입니다. 그 공을 스스로 인정해 주는 것부터가 시작입니다.',
      강: '품이 넓어 사람이 모이고, 맡은 자리를 오래 지켜 결과를 만들어 냅니다. 다만 베푼 만큼 돌아오지 않을 때 서운함을 오래 품고, 자기 것을 챙기는 모습이 인색해 보이기도 합니다.',
      약: '작은 것을 오래 쌓아 결과를 만드는 편입니다. 다만 생각이 많아 결정을 미루다 때를 놓치고, 확실하지 않은 일에는 좀처럼 발을 들이지 않아 기회의 폭이 좁아지기도 합니다.'
    },
    '경': {
      은유: '제련 전의 무쇠', 키워드: ['결단', '원칙', '추진'],
      본문: '맺고 끊음이 분명한 쇠 같은 기운입니다. 해야 할 일과 하지 않을 일을 빠르게 가르고, 한번 정하면 곧장 실행에 옮깁니다. 원칙이 뚜렷해 이해관계가 얽힌 자리에서도 기준을 잃지 않고, 어려운 결정을 미루지 않아 곁의 사람이 든든해합니다. 불의를 보면 참지 않는 기질이 있습니다. 기준을 세우고 판을 정리하는 일, 결단이 필요한 자리에서 제 몫을 합니다. 미루면 커지는 문제를 당신은 초반에 끊어 냅니다. 옳은 말일수록 한 겹 부드럽게 감싸면 더 잘 전해집니다. 결정을 미루지 않는 성향 덕에 주변의 시간을 아껴 주는 사람입니다. 그 단호함에 온기를 한 겹 더하면 따르는 사람이 늘어납니다.',
      강: '밀어붙이는 힘이 강해 어려운 일을 끝까지 관철합니다. 다만 표현이 직선적이어서 옳은 말을 하고도 마음을 상하게 하고, 자기 기준을 굽히지 않아 관계가 갑자기 멀어지기도 합니다.',
      약: '평소에는 조용하지만 기준을 건드리면 분명하게 선을 긋습니다. 다만 속도가 다른 사람을 답답해하고, 비판이 앞서 곁을 서운하게 만드는 편입니다.'
    },
    '신': {
      은유: '다듬어진 보석', 키워드: ['정교', '감각', '완성'],
      본문: '잘 벼려진 보석 같은 정교한 기운입니다. 작은 차이를 알아보는 눈이 있어 남들이 지나치는 부분에서 완성도를 끌어올리고, 자기 영역에서 기준을 세우는 사람으로 인정받습니다. 겉모습과 표현을 다듬는 감각이 좋아 하는 일에 특유의 결이 남습니다. 스스로를 관리하는 힘이 강합니다. 정밀함이 요구되는 일, 결과물의 완성도가 곧 실력이 되는 자리에서 인정받습니다. 미감과 기준이 분명해 당신의 결과물에는 특유의 결이 남습니다. 스스로에게 조금 너그러워져도 실력은 줄지 않습니다. 기준이 높다는 것은 그만큼 좋은 것을 알아본다는 뜻입니다. 그 눈을 자신을 깎는 데 쓰지 말고 만들어 내는 데 쓰면 훨씬 멀리 갑니다.',
      강: '기준이 분명해 자기 영역을 빠르게 만들어 냅니다. 다만 관심 없는 일에는 냉담해 보이고, 예리한 말 한마디가 상대에게 오래 남기도 합니다.',
      약: '조용히 완성도를 높이며 실력을 쌓습니다. 다만 자기 결과물에 좀처럼 만족하지 못하고, 남의 평가에 오래 마음을 쓰다 혼자 삭이는 편입니다.'
    },
    '임': {
      은유: '큰 강과 바다', 키워드: ['포용', '지혜', '흐름'],
      본문: '넓게 흐르는 큰 물 같은 기운입니다. 상황을 멀리서 바라보고 전체 그림을 그리는 데 능해, 복잡한 문제 앞에서도 길을 찾아냅니다. 사람을 가리지 않고 품는 폭이 있어 다양한 인연이 모이고, 낯선 환경에도 빠르게 스며듭니다. 판단이 빠르고 아는 것을 나누는 데 인색하지 않습니다. 큰 그림을 그리는 일, 여러 갈래를 하나로 엮는 일에서 강점이 드러납니다. 낯선 분야에도 금방 스며들어 자기 자리를 만듭니다. 벌인 것 중 하나만 끝까지 끌고 가도 결과가 크게 달라집니다. 넓게 보는 눈은 아무나 갖지 못하는 재능입니다. 다만 그 넓이를 감당하려면 돌아올 자리 하나는 정해 두는 편이 좋습니다.',
      강: '스케일이 커서 남이 엄두 내지 못하는 일을 벌입니다. 다만 잔잔하다가도 한번 감정이 격해지면 폭이 커지고, 속을 잘 드러내지 않아 가까운 사람도 마음을 짐작하기 어려워합니다.',
      약: '흐름을 거스르지 않고 상황에 맞춰 자기 자리를 만듭니다. 다만 관심이 넓은 만큼 한곳에 오래 머물지 못해 마무리가 아쉽고, 즉흥적인 결정으로 계획이 흔들리기도 합니다.'
    },
    '계': {
      은유: '이슬과 빗물', 키워드: ['통찰', '치밀', '적응'],
      본문: '조용히 스며드는 이슬비 같은 기운입니다. 말수가 많지 않아도 상황의 흐름과 사람의 속내를 빠르게 읽어 내고, 필요한 순간에 정확한 한마디를 꺼냅니다. 계획과 처리가 치밀해 실수가 적고, 실리를 살피는 현실 감각이 좋습니다. 환경이 바뀌어도 유연하게 자기 자리를 만듭니다. 자료를 다루고 계획을 짜는 일, 빈틈을 찾아내는 자리에서 실력이 드러납니다. 조용히 준비해 정확한 때에 움직이는 방식이 잘 맞습니다. 작은 실수는 흘려보내도 전체는 무너지지 않습니다. 조용히 준비하는 시간이 길수록 결정적인 순간의 정확도가 올라갑니다. 남들이 재빠르게 움직일 때 뒤처진 듯 느껴질 수 있지만, 대개 마지막에 정확한 답을 들고 오는 쪽은 당신입니다. 그 신중함을 스스로 답답해하지 않아도 됩니다.',
      강: '머리 회전이 빨라 복잡한 일을 정리해 냅니다. 다만 계산이 앞서 차갑게 비치고, 재고 따지느라 시작이 늦어지기도 합니다.',
      약: '오래 생각한 끝에 깊이 있는 답을 내놓습니다. 다만 작은 일에 지나치게 신경 써 마음이 무거워지고, 사소한 말 한마디를 오래 담아 두는 편입니다.'
    }
  };

  /** 선천 성격 프로즈 — 본문 + 강약 톤 1문단 (약 400~500자) */
  function personality(dayStem, strengthVerdict) {
    var d = DAY_MASTER[dayStem];
    if (!d) return null;
    var tone = (strengthVerdict === '신강') ? d.강 : (strengthVerdict === '신약' ? d.약 : d.강);
    return {
      은유: d.은유,
      키워드: d.키워드.slice(),
      본문: d.본문 + ' ' + tone
    };
  }

  /* =========================================================
   * 6. 오늘 점수 — 십성 10종 가중치 (교체 가능한 테이블)
   *
   * 설계 근거: 리포트 4-1 사길신/사흉신 + 참고앱 실측 2점(방향 정합이 목표, 복제 아님)
   *   · 기 일간 × 무진(겁재/겁재) = 참고앱 38점 -> 흉신 겹침은 40~55대
   *   · 기 일간 × 정묘(편인/편관) = 참고앱 63점 -> 흉신이지만 중간대
   * ======================================================= */

  /* D1 확정(대표님 결정 2026-08-22): 점수 하한 30 — 낮은 날의 체감 폭을 열되,
   * 문구는 불안 조장 없이 실용 조언 톤으로 받는다(30~40 구간 문구는 app.js LOW_TONE 참조).
   * 이 상수 1줄만 바꾸면 전 화면·검증 기대범위가 함께 움직인다. */
  var SCORE_FLOOR = 30;
  var SCORE_CEIL = 95;

  var SCORE_TABLE = {
    base: 69,
    stemWeight: 1.0,    // 천간(주축)
    branchWeight: 0.8,  // 지지(보조)
    // 가중치는 참고앱 실측 2점에 맞춰 역산하되, 사길신>중립>사흉신 순서(리포트 4-1 통념)를 깨지 않는 해만 채택했다.
    gods: {
      '식신': 13, '정재': 12, '정인': 11, '정관': 10,   // 사길신 (+)
      '편재': 6, '비견': 1,                              // 중립
      '편인': -2, '편관': -3, '상관': -9, '겁재': -17    // 사흉신 (-)
    },
    waveMod: 7,
    min: SCORE_FLOOR, max: SCORE_CEIL
  };

  function clamp(v, lo, hi) { return v < lo ? lo : (v > hi ? hi : v); }
  function mod(n, m) { return ((n % m) + m) % m; }

  /**
   * 오늘 점수 — 내 일간 × 오늘 일진(천간·지지 본기)의 십성으로 산출.
   * 같은 입력이면 항상 같은 값(결정론).
   */
  function todayScore(dayStem, todayStem, todayBranch, myNo, todayNo) {
    var T = SCORE_TABLE;
    var g1 = tenGod(dayStem, todayStem);
    var g2 = branchTenGod(dayStem, todayBranch);
    var wave = mod(todayNo * myNo, T.waveMod) - 3;
    var raw = T.base + T.gods[g1] * T.stemWeight + T.gods[g2] * T.branchWeight + wave;
    return {
      score: clamp(Math.round(raw), T.min, T.max),
      stemGod: g1, branchGod: g2,
      stemClass: godClass(g1), branchClass: godClass(g2),
      stemPlain: GOD_PLAIN[g1], branchPlain: GOD_PLAIN[g2]
    };
  }


  /* =========================================================
   * 7. 자체 검증 (리포트 표와 전수 대조 — 콘솔 self-test)
   * ======================================================= */

  function selfTest(opts) {
    var quiet = !!(opts && opts.quiet);
    var res = [], failed = 0;
    function check(name, got, want) {
      var ok = String(got) === String(want);
      if (!ok) failed++;
      res.push({ 항목: name, 기대: String(want), 실제: String(got), 판정: ok ? 'PASS' : 'FAIL' });
    }

    // --- 테이블 완전성 ---
    check('천간 10', STEMS.length, 10);
    check('지지 12', BRANCHES.length, 12);
    check('지장간 본기 12', Object.keys(BRANCH_MAIN).length, 12);
    // 리포트 3-4 표의 정기(본기)를 문서에서 그대로 옮긴 독립 기대값과 대조.
    // (BRANCH_MAIN에서 파생하지 않는다 — 파생하면 표 오타를 영영 못 잡는다)
    check('지장간 본기 12지 실값',
      BRANCHES.map(function (b) { return BRANCH_MAIN[b]; }).join(''),
      ['계', '기', '갑', '을', '무', '병', '정', '기', '경', '신', '무', '임'].join(''));
    // 지지 오행도 문서 값과 직접 대조(인묘=목 사오=화 진술축미=토 신유=금 해자=수)
    check('지지 오행 12지 실값',
      BRANCHES.map(function (b) { return BRANCH_EL[b]; }).join(''),
      ['수', '토', '목', '목', '토', '화', '화', '토', '금', '금', '토', '수'].join(''));
    check('천간 오행 10간 실값',
      STEMS.map(function (t) { return STEM_EL[t]; }).join(''),
      ['목', '목', '화', '화', '토', '토', '금', '금', '수', '수'].join(''));
    check('천간 음양 10간 실값',
      STEMS.map(function (t) { return STEM_YY[t]; }).join(''),
      ['양', '음', '양', '음', '양', '음', '양', '음', '양', '음'].join(''));
    check('일간 기질 10종', Object.keys(DAY_MASTER).length, 10);

    // --- 십성 100조합 전수: 리포트 3-2 규칙을 독립 재현해 대조 ---
    var bad = 0, kinds = {};
    for (var i = 0; i < STEMS.length; i++) {
      for (var j = 0; j < STEMS.length; j++) {
        var d = STEMS[i], o = STEMS[j];
        var g = tenGod(d, o);
        if (!g) { bad++; continue; }
        kinds[g] = (kinds[g] || 0) + 1;
        // 독립 재현: 관계 + 음양
        var X = STEM_EL[d], Y = STEM_EL[o], same = STEM_YY[d] === STEM_YY[o], want;
        if (X === Y) want = same ? '비견' : '겁재';
        else if (SAENG[X] === Y) want = same ? '식신' : '상관';
        else if (GEUK[X] === Y) want = same ? '편재' : '정재';
        else if (GEUK[Y] === X) want = same ? '편관' : '정관';
        else want = same ? '편인' : '정인';
        if (g !== want) bad++;
      }
    }
    check('십성 100조합 규칙 일치', bad, 0);
    check('십성 10종 모두 출현', Object.keys(kinds).length, 10);
    // 각 십성이 정확히 10회씩(10x10 폐쇄계) — 테이블 붕괴 조기 감지
    var even = true;
    for (var k in kinds) if (kinds[k] !== 10) even = false;
    check('십성 10회 균등 분포', even, 'true');

    // --- 지지 십성 120조합: 본기 경유가 천간표와 동일한가 ---
    var bbad = 0;
    for (var a = 0; a < STEMS.length; a++)
      for (var b = 0; b < BRANCHES.length; b++)
        if (branchTenGod(STEMS[a], BRANCHES[b]) !== tenGod(STEMS[a], BRANCH_MAIN[BRANCHES[b]])) bbad++;
    check('지지십성 120조합 본기 일치', bbad, 0);

    // --- 사길신/사흉신 (리포트 4-1) ---
    check('사길신 4종', Object.keys(FOUR_LUCKY).sort().join(','), ['식신', '정재', '정관', '정인'].sort().join(','));
    check('사흉신 4종', Object.keys(FOUR_UNLUCKY).sort().join(','), ['상관', '겁재', '편관', '편인'].sort().join(','));
    check('겁재=흉', godClass('겁재'), '흉');
    check('식신=길', godClass('식신'), '길');
    check('비견=중', godClass('비견'), '중');

    // --- 점수표 통념 순서: 사길신 전부 > 사흉신 전부 ---
    var minLucky = Infinity, maxUnlucky = -Infinity, g2;
    for (g2 in FOUR_LUCKY) minLucky = Math.min(minLucky, SCORE_TABLE.gods[g2]);
    for (g2 in FOUR_UNLUCKY) maxUnlucky = Math.max(maxUnlucky, SCORE_TABLE.gods[g2]);
    check('점수 가중치 길>흉 순서 보존', minLucky > maxUnlucky, 'true');
    check('사흉신 전부 음수', maxUnlucky < 0, 'true');

    // --- 참고앱 실측 2점 방향 정합 (복제 아님 — 구간 검증) ---
    var s1 = todayScore('기', '무', '진', 16, 5).score;   // 겁재/겁재
    var s2 = todayScore('기', '정', '묘', 16, 4).score;   // 편인/편관
    // D1(하한 30) 반영: 흉신 겹침 구간 기대범위를 30~55로 갱신. 참고앱 38 대비 근접도 확인.
    check('무진(겁재겹침) 흉신대 30~55', s1 >= 30 && s1 <= 55, 'true');
    check('무진 참고앱(38) 오차 ±6', Math.abs(s1 - 38) <= 6, 'true');
    check('정묘 중간대 55~70', s2 >= 55 && s2 <= 70, 'true');

    // --- 점수 전수: 일간 10 x 일주순번 60 x 일진 60 ---
    var total = 0, out = 0, hist = {}, ganji = [];
    for (var q = 0; q < 60; q++) ganji.push({ stem: STEMS[q % 10], branch: BRANCHES[q % 12], no: q + 1 });
    for (var di = 0; di < STEMS.length; di++)
      for (var mn = 1; mn <= 60; mn++)
        for (var gi = 0; gi < ganji.length; gi++) {
          var r = todayScore(STEMS[di], ganji[gi].stem, ganji[gi].branch, mn, ganji[gi].no);
          total++;
          if (!(r.score >= SCORE_TABLE.min && r.score <= SCORE_TABLE.max)) out++;
          hist[r.score] = (hist[r.score] || 0) + 1;
        }
    check('점수 전수 조합', total, 36000);
    check('점수 범위 이탈', out, 0);
    var maxc = 0, distinct = 0;
    for (var sc in hist) { distinct++; if (hist[sc] > maxc) maxc = hist[sc]; }
    check('점수 최빈 비중 < 40%', (maxc / total) < 0.40, 'true');
    check('점수 종수 >= 10', distinct >= 10, 'true');

    // --- 결정론 ---
    var det = true;
    for (var z = 0; z < 200; z++)
      if (todayScore('기', '무', '진', 16, 5).score !== s1) { det = false; break; }
    check('점수 결정론 200회', det, 'true');

    // --- 성격 프로즈 10종 분량·부정 포함 ---
    var shortP = 0;
    for (var pi = 0; pi < STEMS.length; pi++) {
      var pr = personality(STEMS[pi], '신강');
      if (!pr || pr.본문.length < 380 || pr.본문.length > 600) shortP++;
      if (pr.키워드.length !== 3) shortP++;
    }
    check('성격 프로즈 10종 분량·키워드3', shortP, 0);

    // --- 오행 카운트: 8글자 / 시주 모름 6글자 ---
    var pil = {
      year: { stem: '경', branch: '오' }, month: { stem: '기', branch: '묘' },
      day: { stem: '기', branch: '묘' }, hour: { stem: '기', branch: '사' }
    };
    check('오행 합계 8', elementCount(pil).합계, 8);
    var noHour = { year: pil.year, month: pil.month, day: pil.day, hour: null };
    check('시주 모름 합계 6', elementCount(noHour).합계, 6);

    if (!quiet && typeof console !== 'undefined') {
      if (failed === 0) console.log('%c[saju self-test] ' + res.length + '건 PASS', 'color:#0a7d33;font-weight:bold');
      else { console.error('[saju self-test] 실패 ' + failed + '건'); if (console.table) console.table(res.filter(function (r) { return r.판정 === 'FAIL'; })); }
    }
    return { 전체: res.length, 통과: res.length - failed, 실패: failed, 상세: res };
  }

  return {
    STEMS: STEMS, BRANCHES: BRANCHES,
    STEM_HANJA: STEM_HANJA, BRANCH_HANJA: BRANCH_HANJA,
    STEM_EL: STEM_EL, STEM_YY: STEM_YY, BRANCH_EL: BRANCH_EL, BRANCH_MAIN: BRANCH_MAIN,
    EL_HANJA: EL_HANJA, EL_ORDER: EL_ORDER,
    BRANCH_SEASON: BRANCH_SEASON, BRANCH_HOUR_LABEL: BRANCH_HOUR_LABEL,
    SAENG: SAENG, GEUK: GEUK,
    tenGod: tenGod, branchTenGod: branchTenGod, godClass: godClass, GOD_PLAIN: GOD_PLAIN,
    FOUR_LUCKY: FOUR_LUCKY, FOUR_UNLUCKY: FOUR_UNLUCKY,
    elementCount: elementCount, strength: strength,
    DAY_MASTER: DAY_MASTER, personality: personality,
    SCORE_FLOOR: SCORE_FLOOR, SCORE_CEIL: SCORE_CEIL,
    SCORE_TABLE: SCORE_TABLE, todayScore: todayScore,
    selfTest: selfTest
  };
});
