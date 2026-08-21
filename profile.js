/* 「내 수호신」 프로필 층 v3 — 다중 사용자 + 휠 피커 입력 (B)
 *
 * 참고앱(정통사주)의 "구조"만 본받는다 — 문구·디자인은 전부 자체 작성.
 *   · 다중 사용자 목록(가족 등) + "새 사용자 추가"
 *   · 생년월일 3열 휠 피커(년/월/일) — 네이티브 date input 대신
 *   · 출생시 12지 시진 목록(야자시 23:30 시작) + "모름"
 *   · 달력 기준 양력/음력/윤달 3버튼 · 성별 2버튼(대운 대비 저장만)
 *
 * 개인정보: 프로필은 이 기기 localStorage에만 저장한다. 계측으로 생년월일 원문을
 * 내보내지 않는다(app.js의 C-⑤ 원칙 유지 — 여기서도 원문은 track()에 넘기지 않는다).
 *
 * 브라우저/Node 공용(Node에서는 순수 로직만 검증 가능).
 */
(function (root, factory) {
  'use strict';
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (typeof window !== 'undefined') window.ProfileStore = api;
})(this, function () {
  'use strict';

  var LS_KEY = 'gs_profiles';
  var LS_ACTIVE = 'gs_active_profile';
  var MAX_PROFILES = 8;

  /* ---- 12지 시진 (야자시 23:30 시작 — 리포트 1-4, 참고앱 정합) ---- */
  var HOURS = [
    /* 자시는 자정을 걸쳐 있다(23:30~01:30). 한 값으로 뭉뚱그리면 23:30~24:00 출생자의
     * 일주가 하루 어긋나므로, 야자시(전날 밤)와 조자시(당일 새벽)를 나눠 고른다. */
    { branch: '자', label: '자시', range: '23:30~24:00 (야자시)', h: 23, m: 40, night: true },
    { branch: '자', label: '자시', range: '00:00~01:30 (조자시)', h: 0, m: 30 },
    { branch: '축', label: '축시', range: '01:30~03:30', h: 2, m: 30 },
    { branch: '인', label: '인시', range: '03:30~05:30', h: 4, m: 30 },
    { branch: '묘', label: '묘시', range: '05:30~07:30', h: 6, m: 30 },
    { branch: '진', label: '진시', range: '07:30~09:30', h: 8, m: 30 },
    { branch: '사', label: '사시', range: '09:30~11:30', h: 10, m: 30 },
    { branch: '오', label: '오시', range: '11:30~13:30', h: 12, m: 30 },
    { branch: '미', label: '미시', range: '13:30~15:30', h: 14, m: 30 },
    { branch: '신', label: '신시', range: '15:30~17:30', h: 16, m: 30 },
    { branch: '유', label: '유시', range: '17:30~19:30', h: 18, m: 30 },
    { branch: '술', label: '술시', range: '19:30~21:30', h: 20, m: 30 },
    { branch: '해', label: '해시', range: '21:30~23:30', h: 22, m: 30 }
  ];

  function daysInMonth(y, m) { return new Date(y, m, 0).getDate(); }

  function pad2(n) { return n < 10 ? '0' + n : String(n); }

  /** 프로필 유효성 — 저장 전 검사 */
  function validate(p) {
    if (!p) return '입력을 확인해 주세요.';
    var name = String(p.name || '').trim();
    if (!name) return '이름을 입력해 주세요.';
    if (name.length > 12) return '이름은 12자 이내로 입력해 주세요.';
    if (!(p.year >= 1900 && p.year <= 2100)) return '태어난 해를 확인해 주세요.';
    if (!(p.month >= 1 && p.month <= 12)) return '태어난 달을 확인해 주세요.';
    if (!(p.day >= 1 && p.day <= daysInMonth(p.year, p.month))) return '태어난 날을 확인해 주세요.';
    if (p.calendar !== 'solar' && p.calendar !== 'lunar') return '달력 기준을 선택해 주세요.';
    if (p.calendar === 'solar' && p.leap) return '윤달은 음력에서만 선택할 수 있습니다.';
    if (p.gender && p.gender !== 'M' && p.gender !== 'F') return '성별을 확인해 주세요.';
    if (p.hourBranch && !branchExists(p.hourBranch)) return '태어난 시각을 확인해 주세요.';
    if (p.hourIndex !== null && p.hourIndex !== undefined
      && !(p.hourIndex >= 0 && p.hourIndex < HOURS.length)) return '태어난 시각을 확인해 주세요.';
    // 양력 미래 날짜 차단(음력은 변환 후 app에서 재확인)
    if (p.calendar === 'solar') {
      var iso = p.year + '-' + pad2(p.month) + '-' + pad2(p.day);
      var todayISO = p.__today || null;
      if (todayISO && iso > todayISO) return '태어난 날이 오늘보다 뒤일 수 없습니다.';
    }
    return null;
  }

  function branchExists(b) {
    for (var i = 0; i < HOURS.length; i++) if (HOURS[i].branch === b) return true;
    return false;
  }

  /** 자시가 야자시/조자시 2개로 나뉘므로 지지만으로는 특정할 수 없다.
   * 저장은 인덱스(hourIndex)로 하고, 지지 조회는 하위호환용으로만 남긴다. */
  function hourByBranch(b) {
    for (var i = 0; i < HOURS.length; i++) if (HOURS[i].branch === b) return HOURS[i];
    return null;
  }
  function hourByIndex(i) {
    return (typeof i === 'number' && i >= 0 && i < HOURS.length) ? HOURS[i] : null;
  }
  /** 프로필이 가진 시각 정보를 실제 시진 항목으로 해석(인덱스 우선, 없으면 지지) */
  function resolveHour(p) {
    if (!p) return null;
    if (typeof p.hourIndex === 'number') return hourByIndex(p.hourIndex);
    if (p.hourBranch) return hourByBranch(p.hourBranch);
    return null;
  }

  /** store = app.js의 폴백 스토어(get/set) — 저장소 비대칭 수리를 그대로 재사용한다 */
  function makeStore(store) {

    function loadAll() {
      var raw = store.get(LS_KEY);
      var arr = [];
      try { arr = JSON.parse(raw || '[]'); } catch (e) { arr = []; }
      if (!Array.isArray(arr)) arr = [];
      // 손상 항목 제거(구조가 깨진 채 화면에 올라가지 않게)
      return arr.filter(function (p) {
        return p && typeof p === 'object' && p.id && p.name
          && p.year && p.month && p.day;
      });
    }

    function saveAll(list) {
      store.set(LS_KEY, JSON.stringify(list.slice(0, MAX_PROFILES)));
    }

    function newId() {
      return 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    }

    return {
      LS_KEY: LS_KEY,
      list: loadAll,
      count: function () { return loadAll().length; },
      isFull: function () { return loadAll().length >= MAX_PROFILES; },

      add: function (p) {
        var err = validate(p);
        if (err) return { ok: false, error: err };
        var list = loadAll();
        if (list.length >= MAX_PROFILES) {
          return { ok: false, error: '프로필은 최대 ' + MAX_PROFILES + '명까지 저장할 수 있습니다.' };
        }
        var rec = {
          id: newId(),
          name: String(p.name).trim(),
          year: p.year, month: p.month, day: p.day,
          calendar: p.calendar,          // 'solar' | 'lunar'
          leap: !!p.leap,                // 윤달(음력만)
          hourBranch: p.hourBranch || null, // null = 모름
          hourIndex: (typeof p.hourIndex === 'number') ? p.hourIndex : null,
          gender: p.gender || null,      // 'M' | 'F' | null (대운 대비 저장만)
          createdAt: new Date().toISOString()
        };
        list.push(rec);
        saveAll(list);
        return { ok: true, profile: rec };
      },

      remove: function (id) {
        var list = loadAll().filter(function (p) { return p.id !== id; });
        saveAll(list);
        if (store.get(LS_ACTIVE) === id) store.set(LS_ACTIVE, '');
        return list;
      },

      get: function (id) {
        var list = loadAll();
        for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
        return null;
      },

      setActive: function (id) { store.set(LS_ACTIVE, id || ''); },
      getActive: function () {
        var id = store.get(LS_ACTIVE);
        if (!id) return null;
        return this.get(id);
      }
    };
  }

  return {
    HOURS: HOURS,
    MAX_PROFILES: MAX_PROFILES,
    LS_KEY: LS_KEY,
    LS_ACTIVE: LS_ACTIVE,
    daysInMonth: daysInMonth,
    validate: validate,
    hourByBranch: hourByBranch,
    hourByIndex: hourByIndex,
    resolveHour: resolveHour,
    makeStore: makeStore,
    pad2: pad2
  };
});
