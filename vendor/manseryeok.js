/*! manseryeok v2.0.0 — https://github.com/yhj1024/manseryeok
 * MIT License · Copyright (c) 2025 Yoohyojun
 * 브라우저 번들(esbuild IIFE) — window.Manseryeok 로 노출.
 * 원본 무수정, 번들만 수행. 전체 라이선스 전문: vendor/manseryeok.LICENSE.txt
 */
(() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __commonJS = (cb, mod) => function __require() {
    try {
      return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
    } catch (e) {
      throw mod = 0, e;
    }
  };

  // node_modules/manseryeok/dist/constants.js
  var require_constants = __commonJS({
    "node_modules/manseryeok/dist/constants.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.DAY_PILLAR_ANCHOR = exports.TEN_GOD_HANJA = exports.ELEMENT_CONTROLS = exports.ELEMENT_GENERATES = exports.MONTH_BRANCHES = exports.BRANCH_MAIN_STEM = exports.BRANCH_ELEMENTS = exports.STEM_ELEMENTS = exports.FIVE_ELEMENTS = exports.YIN_YANG = exports.EARTHLY_BRANCHES_HANJA = exports.EARTHLY_BRANCHES = exports.HEAVENLY_STEMS_HANJA = exports.HEAVENLY_STEMS = void 0;
      exports.HEAVENLY_STEMS = ["\uAC11", "\uC744", "\uBCD1", "\uC815", "\uBB34", "\uAE30", "\uACBD", "\uC2E0", "\uC784", "\uACC4"];
      exports.HEAVENLY_STEMS_HANJA = [
        "\u7532",
        "\u4E59",
        "\u4E19",
        "\u4E01",
        "\u620A",
        "\u5DF1",
        "\u5E9A",
        "\u8F9B",
        "\u58EC",
        "\u7678"
      ];
      exports.EARTHLY_BRANCHES = [
        "\uC790",
        "\uCD95",
        "\uC778",
        "\uBB18",
        "\uC9C4",
        "\uC0AC",
        "\uC624",
        "\uBBF8",
        "\uC2E0",
        "\uC720",
        "\uC220",
        "\uD574"
      ];
      exports.EARTHLY_BRANCHES_HANJA = [
        "\u5B50",
        "\u4E11",
        "\u5BC5",
        "\u536F",
        "\u8FB0",
        "\u5DF3",
        "\u5348",
        "\u672A",
        "\u7533",
        "\u9149",
        "\u620C",
        "\u4EA5"
      ];
      exports.YIN_YANG = ["\uC591", "\uC74C"];
      exports.FIVE_ELEMENTS = ["\uBAA9", "\uD654", "\uD1A0", "\uAE08", "\uC218"];
      exports.STEM_ELEMENTS = [
        "\uBAA9",
        "\uBAA9",
        "\uD654",
        "\uD654",
        "\uD1A0",
        "\uD1A0",
        "\uAE08",
        "\uAE08",
        "\uC218",
        "\uC218"
      ];
      exports.BRANCH_ELEMENTS = [
        "\uC218",
        // 자
        "\uD1A0",
        // 축
        "\uBAA9",
        // 인
        "\uBAA9",
        // 묘
        "\uD1A0",
        // 진
        "\uD654",
        // 사
        "\uD654",
        // 오
        "\uD1A0",
        // 미
        "\uAE08",
        // 신
        "\uAE08",
        // 유
        "\uD1A0",
        // 술
        "\uC218"
        // 해
      ];
      exports.BRANCH_MAIN_STEM = {
        \uC790: "\uACC4",
        \uCD95: "\uAE30",
        \uC778: "\uAC11",
        \uBB18: "\uC744",
        \uC9C4: "\uBB34",
        \uC0AC: "\uBCD1",
        \uC624: "\uC815",
        \uBBF8: "\uAE30",
        \uC2E0: "\uACBD",
        \uC720: "\uC2E0",
        \uC220: "\uBB34",
        \uD574: "\uC784"
      };
      exports.MONTH_BRANCHES = {
        1: "\uC778",
        2: "\uBB18",
        3: "\uC9C4",
        4: "\uC0AC",
        5: "\uC624",
        6: "\uBBF8",
        7: "\uC2E0",
        8: "\uC720",
        9: "\uC220",
        10: "\uD574",
        11: "\uC790",
        12: "\uCD95"
      };
      exports.ELEMENT_GENERATES = {
        \uBAA9: "\uD654",
        \uD654: "\uD1A0",
        \uD1A0: "\uAE08",
        \uAE08: "\uC218",
        \uC218: "\uBAA9"
      };
      exports.ELEMENT_CONTROLS = {
        \uBAA9: "\uD1A0",
        \uD1A0: "\uC218",
        \uC218: "\uD654",
        \uD654: "\uAE08",
        \uAE08: "\uBAA9"
      };
      exports.TEN_GOD_HANJA = {
        \uBE44\uACAC: "\u6BD4\u80A9",
        \uAC81\uC7AC: "\u52AB\u8CA1",
        \uC2DD\uC2E0: "\u98DF\u795E",
        \uC0C1\uAD00: "\u50B7\u5B98",
        \uD3B8\uC7AC: "\u504F\u8CA1",
        \uC815\uC7AC: "\u6B63\u8CA1",
        \uD3B8\uAD00: "\u504F\u5B98",
        \uC815\uAD00: "\u6B63\u5B98",
        \uD3B8\uC778: "\u504F\u5370",
        \uC815\uC778: "\u6B63\u5370"
      };
      exports.DAY_PILLAR_ANCHOR = {
        year: 1992,
        month: 10,
        day: 24,
        ganjiIndex: 9
      };
    }
  });

  // node_modules/manseryeok/dist/validation.js
  var require_validation = __commonJS({
    "node_modules/manseryeok/dist/validation.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.assertIntegerInRange = assertIntegerInRange;
      exports.assertFiniteNumber = assertFiniteNumber;
      exports.assertBoolean = assertBoolean;
      exports.assertOptionalBoolean = assertOptionalBoolean;
      exports.assertHeavenlyStem = assertHeavenlyStem;
      exports.assertEarthlyBranch = assertEarthlyBranch;
      exports.assertPillar = assertPillar;
      exports.assertGender = assertGender;
      exports.assertDayBoundary = assertDayBoundary;
      var constants_1 = require_constants();
      function assertIntegerInRange(value, min, max, name) {
        if (typeof value !== "number" || !Number.isInteger(value)) {
          throw new RangeError(`${name}\uC740 \uC815\uC218\uC5EC\uC57C \uD569\uB2C8\uB2E4: ${String(value)}`);
        }
        if (value < min || value > max) {
          throw new RangeError(`${name}\uC740 ${min}~${max} \uBC94\uC704\uC5EC\uC57C \uD569\uB2C8\uB2E4: ${value}`);
        }
      }
      function assertFiniteNumber(value, name) {
        if (typeof value !== "number" || !Number.isFinite(value)) {
          throw new RangeError(`${name}\uC740 \uC720\uD55C\uD55C \uC22B\uC790\uC5EC\uC57C \uD569\uB2C8\uB2E4: ${String(value)}`);
        }
      }
      function assertBoolean(value, name) {
        if (typeof value !== "boolean") {
          throw new TypeError(`${name}\uC740 boolean \uC774\uC5B4\uC57C \uD569\uB2C8\uB2E4: ${String(value)}`);
        }
      }
      function assertOptionalBoolean(value, name) {
        if (value !== void 0) {
          assertBoolean(value, name);
        }
      }
      function assertHeavenlyStem(value, name = "\uCC9C\uAC04") {
        if (typeof value !== "string" || !constants_1.HEAVENLY_STEMS.includes(value)) {
          throw new RangeError(`${name}\uC740 \uC720\uD6A8\uD55C \uCC9C\uAC04\uC774\uC5B4\uC57C \uD569\uB2C8\uB2E4: ${String(value)}`);
        }
      }
      function assertEarthlyBranch(value, name = "\uC9C0\uC9C0") {
        if (typeof value !== "string" || !constants_1.EARTHLY_BRANCHES.includes(value)) {
          throw new RangeError(`${name}\uC740 \uC720\uD6A8\uD55C \uC9C0\uC9C0\uC5EC\uC57C \uD569\uB2C8\uB2E4: ${String(value)}`);
        }
      }
      function assertPillar(value, name = "\uAE30\uB465") {
        if (value === null || typeof value !== "object") {
          throw new TypeError(`${name}\uC740 \uAC1D\uCCB4\uC5EC\uC57C \uD569\uB2C8\uB2E4.`);
        }
        const pillar = value;
        assertHeavenlyStem(pillar.heavenlyStem, `${name}.heavenlyStem`);
        assertEarthlyBranch(pillar.earthlyBranch, `${name}.earthlyBranch`);
      }
      function assertGender(value, name = "\uC131\uBCC4(gender)") {
        if (value !== "male" && value !== "female") {
          throw new RangeError(`${name}\uC740 'male' \uB610\uB294 'female' \uC774\uC5B4\uC57C \uD569\uB2C8\uB2E4: ${String(value)}`);
        }
      }
      function assertDayBoundary(value, name = "\uC77C \uACBD\uACC4(dayBoundary)") {
        if (value !== "midnight" && value !== "jasi" && value !== "splitJasi") {
          throw new RangeError(`${name}\uB294 'midnight', 'jasi', 'splitJasi' \uC911 \uD558\uB098\uC5EC\uC57C \uD569\uB2C8\uB2E4: ${String(value)}`);
        }
      }
    }
  });

  // node_modules/manseryeok/dist/elements.js
  var require_elements = __commonJS({
    "node_modules/manseryeok/dist/elements.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.getHeavenlyStemYinYang = getHeavenlyStemYinYang;
      exports.getHeavenlyStemElement = getHeavenlyStemElement;
      exports.getEarthlyBranchYinYang = getEarthlyBranchYinYang;
      exports.getEarthlyBranchElement = getEarthlyBranchElement;
      var constants_1 = require_constants();
      var validation_1 = require_validation();
      function getHeavenlyStemYinYang(stem) {
        (0, validation_1.assertHeavenlyStem)(stem);
        return constants_1.HEAVENLY_STEMS.indexOf(stem) % 2 === 0 ? "\uC591" : "\uC74C";
      }
      function getHeavenlyStemElement(stem) {
        (0, validation_1.assertHeavenlyStem)(stem);
        return constants_1.STEM_ELEMENTS[constants_1.HEAVENLY_STEMS.indexOf(stem)];
      }
      function getEarthlyBranchYinYang(branch) {
        (0, validation_1.assertEarthlyBranch)(branch);
        return constants_1.EARTHLY_BRANCHES.indexOf(branch) % 2 === 0 ? "\uC591" : "\uC74C";
      }
      function getEarthlyBranchElement(branch) {
        (0, validation_1.assertEarthlyBranch)(branch);
        return constants_1.BRANCH_ELEMENTS[constants_1.EARTHLY_BRANCHES.indexOf(branch)];
      }
    }
  });

  // node_modules/manseryeok/dist/calendar/lunar-data.js
  var require_lunar_data = __commonJS({
    "node_modules/manseryeok/dist/calendar/lunar-data.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.LUNAR_BASE_UTC_MS = exports.LUNAR_MAX_YEAR = exports.LUNAR_MIN_YEAR = void 0;
      exports.getLeapMonth = getLeapMonth;
      exports.getLeapMonthDays = getLeapMonthDays;
      exports.getLunarMonthDays = getLunarMonthDays;
      exports.getLunarYearDays = getLunarYearDays;
      var validation_1 = require_validation();
      var LUNAR_DATA = [
        25904,
        92828,
        23200,
        43856,
        76632,
        11104,
        41840,
        21221,
        53600,
        58544,
        87331,
        55968,
        88907,
        22224,
        10976,
        106967,
        41680,
        53584,
        117076,
        46368,
        112268,
        44448,
        21968,
        75193,
        17840,
        41648,
        107189,
        43344,
        46368,
        92833,
        43872,
        87468,
        19312,
        17776,
        86391,
        21168,
        26960,
        92500,
        23200,
        109388,
        42720,
        19168,
        107752,
        42336,
        53920,
        60070,
        54608,
        22176,
        103842,
        38352,
        84699,
        18864,
        42192,
        118999,
        45728,
        46416,
        27987,
        11680,
        38320,
        71025,
        18864,
        107641,
        25776,
        27280,
        109222,
        27472,
        11104,
        43746,
        37744,
        84331,
        51552,
        58544,
        92455,
        55968,
        23248,
        71379,
        9952,
        37600,
        103122,
        51536,
        119897,
        46240,
        46736,
        87462,
        21936,
        9680,
        42418,
        37552,
        108858,
        26960,
        29856,
        111784,
        43872,
        21424,
        11124,
        9584,
        21168,
        86705,
        26960,
        92761,
        23200,
        43856,
        83669,
        19168,
        42352,
        83171,
        53920,
        121163,
        46416,
        22176,
        103847,
        38352,
        19168,
        43444,
        42192,
        53840,
        109217,
        46416,
        87641,
        11680,
        38320,
        82805,
        18800,
        42160,
        107700,
        27280,
        109900,
        23376,
        11104,
        103656,
        37616,
        18800,
        26980,
        54432,
        125516,
        54928,
        22224,
        76634,
        9952,
        37600,
        51926,
        51536,
        54432,
        111778,
        46480,
        87756,
        21936,
        9680,
        102839,
        37552,
        43344,
        110933,
        27808,
        44368,
        76641,
        19376,
        75129,
        9584,
        21168,
        43686,
        59728,
        27296,
        105123,
        43856,
        84827,
        19168,
        42352,
        86231,
        53856,
        55632,
        87381,
        22176,
        38608,
        71122,
        19168,
        107706,
        42192,
        53840,
        119446,
        46416,
        13728,
        43938,
        38320,
        84412,
        18800,
        42160,
        45752,
        27216,
        27968,
        109396,
        11104,
        37744,
        21234,
        18800,
        25833,
        54432,
        59984,
        92822,
        22224,
        11104,
        99811,
        37600,
        51579,
        43344,
        54432,
        55976,
        46416,
        22192,
        11700,
        9680,
        37584,
        53938,
        43344,
        46297,
        27296,
        44368,
        22358,
        19376,
        9648,
        83315,
        21168,
        108875,
        59728,
        27296,
        44456,
        39760,
        19296,
        43748,
        42224,
        21088,
        119394,
        54608,
        88730,
        22176,
        38608,
        84438,
        18912,
        42192,
        54484,
        53840,
        54587,
        46400,
        46496,
        103848,
        38320,
        18864,
        43380,
        42160,
        43600,
        59985,
        27968,
        44475,
        11104,
        37744,
        19190,
        18800,
        25776,
        29859,
        55888,
        27483,
        22224,
        10976,
        37863,
        37600,
        51552,
        119125,
        54432,
        55888,
        87379,
        22176,
        42919,
        42448,
        37584,
        43702,
        43344,
        46240,
        47780,
        44368,
        21920,
        101282,
        42416,
        21367,
        21168,
        26928,
        94549,
        27296,
        44368,
        23379,
        19296,
        42472,
        42208,
        53856,
        60006,
        54560,
        55968,
        91812,
        22224,
        19168,
        43475,
        42192,
        53943,
        45648,
        54560,
        120133,
        46496,
        21968,
        21939,
        18864,
        25975,
        42160,
        43600,
        46678,
        27936,
        44448,
        23396,
        37744,
        18800,
        26995,
        25808,
        27303,
        55888,
        23200,
        44741,
        43744,
        37600,
        53987,
        51552,
        119896,
        54432,
        54608,
        88406,
        22176,
        42704,
        21972,
        21200,
        43344,
        117075,
        46240,
        111783,
        44368,
        21920,
        107429,
        42416,
        21168,
        45427,
        26928,
        27321,
        27296,
        43856,
        20310,
        19296,
        42352,
        21220,
        53600,
        59696,
        29987,
        55968,
        88743,
        22224,
        19168,
        106965,
        41680,
        53584,
        55892,
        46368,
        54953,
        44448,
        21968,
        76214,
        17840,
        41648,
        45749,
        43344,
        46368,
        109346,
        44384,
        87399,
        21360,
        17776,
        25973,
        21168,
        26960,
        31059,
        23200,
        43882,
        42704,
        19168,
        42726,
        42336,
        53920,
        60069,
        54608,
        23200,
        46755,
        42704,
        19415,
        19120,
        43216,
        54613,
        45728,
        46416,
        23892,
        19872,
        38352,
        21874,
        18864,
        43382,
        25776,
        27280,
        47780,
        27472,
        11168,
        43874,
        37744,
        21222,
        53600,
        58544,
        27941,
        55952,
        23376,
        14035,
        10976,
        41696,
        58066,
        51536,
        54614,
        46368,
        46736,
        23972,
        21968,
        9680,
        42419,
        41648,
        108727,
        43344,
        46240,
        111269,
        44368,
        21936,
        11124,
        9584,
        21241,
        21168,
        26960,
        27990,
        23200,
        43856,
        22228,
        19168,
        42352,
        83299,
        53920,
        125095,
        54608,
        23200,
        44453,
        38352,
        19168,
        43700,
        42192,
        53944,
        45712,
        46416,
        22359,
        11680,
        38352,
        19829,
        18864,
        42160,
        107699,
        27280,
        44440,
        27472,
        11104,
        103269,
        37744,
        18800,
        26980,
        58528,
        60010,
        55952,
        23248,
        76502,
        10976,
        37600,
        51925,
        51536,
        54432,
        119971,
        46736,
        22439,
        21936,
        9680,
        38325,
        37552,
        43344,
        55636,
        46240,
        46416,
        27986,
        21936,
        10102,
        9584,
        21168,
        43685,
        59728,
        27296,
        47779,
        43856,
        19416,
        19168,
        42352,
        21717,
        53856,
        55632,
        91476,
        22176,
        39632,
        21970,
        19168,
        42422,
        42192,
        53840,
        55957,
        46416,
        22176,
        44450,
        38352,
        19383,
        18864,
        42160,
        46261,
        27280,
        44352,
        47956,
        11104,
        38320,
        21362,
        18800,
        25958,
        58528,
        59984,
        92821,
        23376,
        11104,
        101091,
        37600,
        116951,
        51536,
        54432,
        120998,
        46736,
        22224,
        75188,
        9680,
        37584,
        53938,
        43344,
        54615,
        46240,
        46416,
        87381,
        19888,
        9648,
        99699,
        21168,
        43448,
        26960,
        27296,
        44710,
        43856,
        19296,
        43748,
        42352,
        21104,
        29283,
        55632,
        27479,
        22176,
        39632,
        19925,
        19168,
        42208,
        54484,
        53840,
        54680,
        46400,
        54944,
        103846,
        38320,
        18864,
        43444,
        42160,
        45690,
        27216,
        27968,
        46934,
        11104,
        38320,
        19317,
        18800,
        25776,
        29859,
        59984,
        28056,
        23248,
        11104,
        38629,
        37600,
        51552,
        59732,
        54432,
        55888,
        30034,
        22208,
        43959,
        9680,
        37584,
        51893,
        43344,
        46240,
        111779,
        46416,
        21977,
        19360,
        42416,
        21877,
        21168,
        43344,
        47444,
        27296,
        44368,
        27474,
        19296,
        42726,
        42352,
        21104,
        27237,
        55600,
        23200,
        46755,
        38608,
        19195,
        19168,
        42192,
        118998,
        53840,
        54560,
        56645,
        46752,
        38608,
        21938,
        18864,
        42359,
        42160,
        45648,
        111189,
        27968,
        44448,
        84835,
        37744,
        18936,
        18800,
        25776,
        92326,
        59984,
        27424,
        108228,
        43744,
        37600,
        53987,
        51552,
        54615,
        54432,
        55888,
        23893,
        22176,
        42704,
        21972,
        21200,
        43448,
        43344,
        46240,
        46758,
        44368,
        21920,
        43940,
        42416,
        21168,
        45683,
        26928,
        29495,
        27296,
        44368,
        84821,
        19296,
        42352,
        21732,
        53600,
        59752,
        54560,
        55968,
        92838,
        22224,
        19168,
        43476,
        41680,
        53584,
        62034,
        54560
      ];
      exports.LUNAR_MIN_YEAR = 1391;
      exports.LUNAR_MAX_YEAR = exports.LUNAR_MIN_YEAR + LUNAR_DATA.length - 1;
      exports.LUNAR_BASE_UTC_MS = Date.UTC(1391, 1, 13);
      function assertYear(year) {
        (0, validation_1.assertIntegerInRange)(year, exports.LUNAR_MIN_YEAR, exports.LUNAR_MAX_YEAR, "\uC74C\uB825 \uC5F0\uB3C4(year)");
      }
      function getLeapMonth(year) {
        assertYear(year);
        return LUNAR_DATA[year - exports.LUNAR_MIN_YEAR] & 15;
      }
      function getLeapMonthDays(year) {
        assertYear(year);
        const data = LUNAR_DATA[year - exports.LUNAR_MIN_YEAR];
        if ((data & 15) === 0)
          return 0;
        return data & 65536 ? 30 : 29;
      }
      function getLunarMonthDays(year, month) {
        assertYear(year);
        (0, validation_1.assertIntegerInRange)(month, 1, 12, "\uC74C\uB825 \uC6D4(month)");
        return LUNAR_DATA[year - exports.LUNAR_MIN_YEAR] & 65536 >> month ? 30 : 29;
      }
      function getLunarYearDays(year) {
        assertYear(year);
        let sum = 348;
        for (let i = 32768; i > 8; i >>= 1) {
          sum += LUNAR_DATA[year - exports.LUNAR_MIN_YEAR] & i ? 1 : 0;
        }
        return sum + getLeapMonthDays(year);
      }
    }
  });

  // node_modules/manseryeok/dist/calendar/convert.js
  var require_convert = __commonJS({
    "node_modules/manseryeok/dist/calendar/convert.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.isValidSolarDate = isValidSolarDate;
      exports.lunarToSolar = lunarToSolar;
      exports.solarToLunar = solarToLunar;
      var lunar_data_1 = require_lunar_data();
      var validation_1 = require_validation();
      var MS_PER_DAY = 864e5;
      function isValidSolarDate(year, month, day) {
        if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
          return false;
        }
        if (month < 1 || month > 12 || day < 1 || day > 31) {
          return false;
        }
        const d = new Date(Date.UTC(year, month - 1, day));
        return d.getUTCFullYear() === year && d.getUTCMonth() === month - 1 && d.getUTCDate() === day;
      }
      function lunarToSolar(year, month, day, isLeapMonth) {
        (0, validation_1.assertIntegerInRange)(year, lunar_data_1.LUNAR_MIN_YEAR, lunar_data_1.LUNAR_MAX_YEAR, "\uC74C\uB825 \uC5F0\uB3C4(year)");
        (0, validation_1.assertIntegerInRange)(month, 1, 12, "\uC74C\uB825 \uC6D4(month)");
        (0, validation_1.assertBoolean)(isLeapMonth, "\uC724\uB2EC \uC5EC\uBD80(isLeapMonth)");
        const leapMonth = (0, lunar_data_1.getLeapMonth)(year);
        if (isLeapMonth && leapMonth !== month) {
          throw new RangeError(`${year}\uB144\uC5D0\uB294 \uC724${month}\uC6D4\uC774 \uC874\uC7AC\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.`);
        }
        const maxDay = isLeapMonth && leapMonth === month ? (0, lunar_data_1.getLeapMonthDays)(year) : (0, lunar_data_1.getLunarMonthDays)(year, month);
        (0, validation_1.assertIntegerInRange)(day, 1, maxDay, `${year}\uB144 ${isLeapMonth ? "\uC724" : ""}${month}\uC6D4 \uC77C\uC790(day)`);
        let offset = 0;
        for (let y = lunar_data_1.LUNAR_MIN_YEAR; y < year; y++) {
          offset += (0, lunar_data_1.getLunarYearDays)(y);
        }
        for (let m = 1; m < month; m++) {
          offset += (0, lunar_data_1.getLunarMonthDays)(year, m);
          if (leapMonth > 0 && m === leapMonth) {
            offset += (0, lunar_data_1.getLeapMonthDays)(year);
          }
        }
        if (isLeapMonth && leapMonth === month) {
          offset += (0, lunar_data_1.getLunarMonthDays)(year, month);
        }
        offset += day - 1;
        const solar = new Date(lunar_data_1.LUNAR_BASE_UTC_MS + offset * MS_PER_DAY);
        return {
          year: solar.getUTCFullYear(),
          month: solar.getUTCMonth() + 1,
          day: solar.getUTCDate()
        };
      }
      function solarToLunar(year, month, day) {
        if (!isValidSolarDate(year, month, day)) {
          throw new RangeError(`\uC720\uD6A8\uD558\uC9C0 \uC54A\uC740 \uC591\uB825 \uB0A0\uC9DC\uC785\uB2C8\uB2E4: ${year}-${month}-${day}`);
        }
        const targetUTC = Date.UTC(year, month - 1, day);
        let offset = Math.floor((targetUTC - lunar_data_1.LUNAR_BASE_UTC_MS) / MS_PER_DAY);
        if (offset < 0) {
          const base = new Date(lunar_data_1.LUNAR_BASE_UTC_MS);
          const baseStr = `${base.getUTCFullYear()}-${String(base.getUTCMonth() + 1).padStart(2, "0")}-${String(base.getUTCDate()).padStart(2, "0")}`;
          throw new RangeError(`\uC74C\uB825 \uBCC0\uD658 \uC9C0\uC6D0 \uBC94\uC704(\uC591\uB825 ${baseStr}) \uC774\uC804 \uB0A0\uC9DC\uC785\uB2C8\uB2E4: ${year}-${month}-${day}`);
        }
        let lunarYear = lunar_data_1.LUNAR_MIN_YEAR;
        for (; lunarYear <= lunar_data_1.LUNAR_MAX_YEAR; lunarYear++) {
          const yearDays = (0, lunar_data_1.getLunarYearDays)(lunarYear);
          if (offset < yearDays)
            break;
          offset -= yearDays;
        }
        if (lunarYear > lunar_data_1.LUNAR_MAX_YEAR) {
          throw new RangeError(`\uC74C\uB825 \uBCC0\uD658 \uC9C0\uC6D0 \uBC94\uC704(${lunar_data_1.LUNAR_MAX_YEAR}\uB144)\uB97C \uBC97\uC5B4\uB0AC\uC2B5\uB2C8\uB2E4: ${year}-${month}-${day}`);
        }
        const leapMonth = (0, lunar_data_1.getLeapMonth)(lunarYear);
        let lunarMonth = 1;
        let isLeapMonth = false;
        for (let m = 1; m <= 12; m++) {
          const monthDays = (0, lunar_data_1.getLunarMonthDays)(lunarYear, m);
          if (offset < monthDays) {
            lunarMonth = m;
            isLeapMonth = false;
            break;
          }
          offset -= monthDays;
          if (leapMonth > 0 && m === leapMonth) {
            const leapDays = (0, lunar_data_1.getLeapMonthDays)(lunarYear);
            if (offset < leapDays) {
              lunarMonth = m;
              isLeapMonth = true;
              break;
            }
            offset -= leapDays;
          }
        }
        return {
          year: lunarYear,
          month: lunarMonth,
          day: offset + 1,
          isLeapMonth
        };
      }
    }
  });

  // node_modules/manseryeok/dist/astro/solar-terms-data.js
  var require_solar_terms_data = __commonJS({
    "node_modules/manseryeok/dist/astro/solar-terms-data.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.SOLAR_TERM_DATA_MAX_YEAR = exports.SOLAR_TERM_DATA_MIN_YEAR = void 0;
      exports.solarTermCorrectionMinutes = solarTermCorrectionMinutes;
      exports.SOLAR_TERM_DATA_MIN_YEAR = 1800;
      exports.SOLAR_TERM_DATA_MAX_YEAR = 2300;
      var ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
      var OFFSET = 31;
      var PACKED = [
        "fjejeiehegeeececgdjgmhmhlgkekflgninjmhjgffdededgeggihlkomrmrlpjlfiefdfehfjhkikijighehdhchchdiejfjflgmglgjghghihkimhlfibe",
        "ZdYeafdjflgmjnlnnnnmmiieedcdffihlhlfjdicieigjgjgifieifihiihiehcgcjelhnhmgjcgZdYcYcaeefhhkimkokokoilhkfididjfkhkikiiihggh",
        "gijkkmmolokoimhmhmilhlhlhmjnkokmiigdebfchemipkpkpjoininingkghgghhkhlilhkgiehdiflhnjpjokmkljkkkkjjkjkklllnkmhlfjcgafaebgd",
        "iflhminilijhghdgchchcgbfaeafafafZfbgehhjkklikgidfcdbdbgciejfkglhkhkhhefbbZbaceghikjmhmglhmhmimhlgkeibfaeZcabaacafdkhokrm",
        "qknhkdgaeYdZecffhiijikiljkijhifheidjelgmhmjljlilimlompnomkjfgbfZfagcidjfliplsnsormmhgecebgdigkgkfjeiekfkgmgkgjgihijjljlj",
        "jiihhhkjnlqlqjnhkehcfcfdgehfkimmpqpsorlpilfjdiciejfkfkejeiehghihkhkhkgjfjfieiejdidjekhmknnmmkjhecbbbbcdgfiflgnjplrmpknij",
        "dgbebgchfgfeebfbgciflgmhmglfjeidhdgbebccbfejimjmikfgbdYcWbWdYecheihkjklmllkkjjhghehdidididhcgchdjgljolqmpmmkhifiejejekek",
        "gminjpingkdgbcacddhhlinknkmkmknjnhlgkejeifhgihighfgfhgjklnmqlpkoimgkfjejfkglhokolollkiiehbfafagcielhnjpjoinhlhihhhghefdd",
        "bcbcbdcgchdkfmiolplnkkggddadaedhiiljnjnjojnilfhbfZeZebifljmllljmjmjojnjmhkehbeZdYeZeaecggikmooqppnmjiffbdYcZfciflhlilili",
        "lhjgjegeffegejgmiojojoiniokplqlpikffcbaacbgdifkhljnlpmqkohkcgZbYbbefgiiiigggfgghfieidididiekglilhkgjgkhljmmllhjdhaeZeZfb",
        "gdjfmiokqmrnolkjghdgcfcfeifjgjgidichchdifhghghggfgfhghgghfhejflhninhkegadYcYdagdjijkkmkolqlpjngkdhbgcidkfjeidfddeehgkili",
        "likgjfjeidhbhbfbfdhhkjlkliiffccbbcbfchekgmininjninimhmglhkhiigigjfjeididjflipmsmsmqjmhjiiiikikikjkjkkljlgkdibgbgdiglknmo",
        "kmjlikikjikhkgkflflglfkfkfjdjejhmjolnnlnjmgkgkfjekgkhlhmglgkehdfdcdcccefghijlklilgkejdhdidhegdebdZdZcadbdccfdhflhninhldh",
        "beYdYfahejgjhhhgjgjfiehbeaebfdiekhmhlfjfhgiijkkjjihfedbcZbXcYdZfbiflinlqmpknhjegcdccediekfkfkfkfkflglglglgkgjijlkmjlhkgj",
        "hkjomqmqlngjcfadaddffiijjkkmnoooomnhjdhbgciejgkfjdhchdhfjijjikhkglhlhmgkfkejekgmjplplnkjifgcfcecfdhgkimjplrlqkojkhhffdfd",
        "fegehegeeedgdielgmimhlgkeidhcgbgcfdfggkinkojmfibeYcWcYeahdkflhlkmnnolnkjghefegdgdgbfZdYdafdihlkmkmikgheedccZcYcYeahekglh",
        "mgleibeYcXbacddhfkglhlhlinimhmhmgkdidfcedeeefdeeggiknoqoqmoildhcgcgeigjhkhlilikijgfebeZeagdjgnhninhmhmhmhmikhiigheiehdhe",
        "heiejgliolqmrlpkmijhgffgghiikllmlnjmgkeichbebfbgdiflimimjljhjgjglflfjdgaeYdYdZfbgdifjjlmnpnolmghcdZcZebhflgmgmhlikikiigg",
        "eecddefhiililhlgkgminjoknikdgadYbYaaZdbhekhnkqmrlpkngjcfZeZebffhijkikikhjhkjlilikgkekfkhlimjljkikjmkomomlkfgZdXcXeahdjgl",
        "hnjolplpkmihfccZdbgdiekfjeididjekflfkfighhgigighfhgigiiljokojngkdfbdZcZdbfejhmknmnolojmhkehbgbgafbhchchcfcfdeffigkhmhkfi",
        "dgcfbgchchdiejilkllkkhgdbZaZabddhgkhniniokolnjmhjehdhdgegfffbeaeagckgmjpkpingkeicgbecdddfeifkhlhlhjfidgafZfahejgkjlkkkjj",
        "jjkjklkljlikfkejeieieheidigljpmqnpnlkhjeidjekgkfkfkejekejdhdfcdeehhljnkokmikgifiejekfkgjfhghfhffefeeeffhjimjninimfjeidhd",
        "iejgmhlhjggfeebeafafagbhdiekglgkdicgbeceffhegdeabYaYbZcaeafbidjgljmkliifebcZcbeeghfieichbidididhcgbgchdifkhihfgdfchdjgmh",
        "mhkehaeYcWbWcYdceggjjllnmnllijfhcfafbhdjfkgififheigkilklllkikhlhlhmhmglgkgmjplqlpjkgecacZebhejglhninjplqkoilfgcedeefhghg",
        "gffefehgjhlininhmgkgjfififheigkimmmolnhleibeZdYdZgcjgmiokplplmljkhiehcgbfbebebfaeZeagcihkkllkkigfccbbbbdcecgdjfmjojnikfg",
        "adYbYcZedhghjhliniojojnhkeidhbfaeYdYbYZZadchglknlokmhjehaeYcXcYcaeehgihjijhifgedcacZdahdjflflgkgkglhmjnjmjjhfebeaeafagbh",
        "djfmkqmsmrknhhddccddgeififififigjeichbgbfdhfjikjkijgihihikjmimhlfjdicgbgbgbhdjfljomponplnilficgbgdjfkhmhmgkfiehfffffefef",
        "eggihjhjgjeiejekglikhieeabXaXbacddgfigmiplqlpjmfibfZdZfcjfkhihfifjfkgkfkfididhdidjfkeiegefghijlkljigecbYZWaVbYfbiflinkom",
        "plojlhieecccbfcjelfkfjejdjekglhmhlgjghhgjhkhlhkgkgmjnlpknhkbfYbXaZdeghjkllllmmlljkghcgaeZfagdheiehdhcheigjiijhkfkfjejejd",
        "ieiekfmhojnjmihgdeacYbZcafejimkojojnimgjehefcdccbdbdceddecebgcielhmilhjegaeaeaecgeghgihminimhkdgZeYcYeahelhnkmklllmknklj",
        "khifhegdgbgafaeafdhgkjnlomnlmiifedceafbhdjekglglgkglfjeidgdgggjinknjoimgkglhmjpjojnhkegeffegfgfgfhiklnnrnqlohkdhcgdhgkhk",
        "hjgiehfhfffdgdhciejflhmhlgkeicidifkijjijgiehcgbfbgdheiglhnjokpknjjiggeeeeefgiiihiegcfagbgcgcgdhdgdheieifhfeecfchekglfjcf",
        "YcWbWcYeafdgfgiilkolojlghcdZdafcidjejdgcedffghihihhhghghfieidhcgafchfkimimhkehbdZaYZbZebiekgmhojnjoinhlejdhdgfghgjhjfieh",
        "ehfkjnlpmpkpimilhkikjjiihjjlknmnmklfhbfZeagdjgminjojojojmkkjhhfheidjeididichchdjfminknlmlkkijghfhehfihljnkojpimgjfhdebdc",
        "edhgjilklljmimhlgkfjeicgaeYdYdYdZdadcegglkplpjngjcfZeZeZfahcifihjklljkhhddbbabbeciekflfkgkhlkmjmjmhkfidfccbZbXbXdZgdkhok",
        "rlqlpildgbcYaaadcgeifjfkfkgkglfjdichcheihjjjkijhihijlmonplnhjcgZeZebgdheigljomqpronmiidgaeagcjekfkejejejekfighgfhfigkhlh",
        "lhjgjgkglhojpkojkhhfecccddefhijmmonrnsmqknhkdhcgchdkglikhjhhheiekfkfkejdidiejfjekejehfiijmkmikfgbcYaYbZeciekgmjomqoqoolk",
        "ggddbddfhgjgkeididjfkglhlglgjfieifggggeheiekgmiojnhlehaeXbWbYccfhilknkmkmjlikhifhcgbhchejgkgjghfhfihkjnmnnkmhkfkfkflhmgl",
        "gmhninjnhkfgcbbYbYfcjglinjnjnjnhmgkfidfdeeeffgfgffegfgfihkhminhmhlfifhdgeheigkillmlklhkeicfZeYdZeaielhnjnjmjjihifiehdgbf",
        "ZcZdYdZeZfZfbhfjjlmnmkjhfecbbaccfdifkgmhminjmhjfgceaebfehikljmiminhnjojoinimfkdhaeZdabccedigkjolqnqmpkmfibfZfbgeiijijjii",
        "ihiijijjhigjfkgniojnjmikgkhliolqnomkjfgcgbhdjekglgmipkqlrlpjkgfededhfjgjgiegdgchchdididifihjikjkjjhighgghhliminglfichbfa",
        "fbgciekhmjnmmnknjlfjdhcgbhdjflfkeicgbfdfffhgjhighfhfhfiehdgagbhejhliliiefbbZbZcceffigkgmiokpkoingjdhdidifjgifffcfbfcifkh",
        "mjnjmimglfjdhdfdeedfgihjjljjiiffbeZeZgbjfliljmjlimimjlkljkjikglglglfkeididjgnjpmsornomklililhlhlhlhnjnkpjnhkfhcfdfghjjll",
        "mllllklkmjlhlglglgkgjfiehdhdiejgkjmnmpmqlpjohkejdjdjfmhnioknkkjijghegcfbfchfjhmjmimglgkhkikijihfecbabZabbcaebhdliolqlpkl",
        "fhadYcYcaedggfifkhlhmhleidhbgagbiekgkhjihjhkjmknknkliidfadXbWbXcafdiillonqoommjigcdZdYfbiekflgkfkflgmhlilhjhghfjgmininhm",
        "glgnjpmrmrkmggdcbbccffigjjllonqosnpjmeibeaecgeigigififighihjgkgkflfkfkfkfkfkfkflhnlonnnkmgjcfZeZeagdkgmjqlrmrnroomkjgfee",
        "deegfhgjfiehcidjglimjmikfidhdhegfggehekhokqkqjmfhaeXcXeZgdihkkkmmpmqnqloikfidhdiejdjeidgdgfhijlmnnmmllkiiehbgagbgdhekhli",
        "mimgkfgcdaaaZdbhflhnjnjnjninininhlgjghgfhfifjeiehfjhlkpmrmrkoikfifhghhiikjkjllkljkhidgZeZfcifkhnkokojmimikjiigifjeidichc",
        "hchdiekglinkomnmlmjkgiegdgeihlknkojnhmgifhdfcdcdcfeiiklmmklhkfkekflgkehbeZdYdYdaecfefhgliolqlpilfhbfaeagcjfliljkkjkikijh",
        "iffegfhgkhmiojoimililjmknlnklhiffebdafbhdkgmhnjqlrmqkpilfidfefhgkinjmhlfjfkgkhminimimimkmnnonnlljjijknmpnpkmgjcgbgcgfihk",
        "iljmkolomnmjkficgchdjflglfjeichcheifighigkhkgkgkgjfjfidjekhmimilhhfedccbbcdfgjkknlokojoinhkfidgcfcgdiehegdecbebhekfmgmhk",
        "fjdhchbhcgcfcffhjjmjnilfhcdZcZdagciekglilkmlmmmlkijhhghhghehdgafZeagdjhmkplqlojlhifeecebgchdjekflhlglfkdhbfaecffhkjmkljk",
        "hjhkimknjojnglfjfhfhfhfhfhgjjmnqrqsnpjnglejejfkglglglililikhggdfcheiglininimhmhmgmhmiljlkjjhifgdfdfdffhglinkrlrmqlnjkghe",
        "gdgeigkjkkjlhkfkfkejdichchcjekgkgkghffgfiglglgjdfZbWaWaWbXdZecgfjkmnmnlkhgdcbbacbfdidjdidieifjgjfifhehehfggfieidididiflh",
        "ojoimgjcfYbXZYZbbfdiglinkomqmojleibfaebgehhiihhgffghijlkmkmilglglglhlhkgkgkhnkpnqnnlhhbeYdYeagdkflhnjpkqlqkmiifeececgdgd",
        "gdgdfdgdiekflglhkijhiggffefegfgiilkokpkohkehaeXbXcZgdjhlknmmnmnloimfjcgbfZeagbgbgagbfcfgikknkmjkfgdebeaeafagciekhmknlmji",
        "feaaYaZbddhfkhminjpkqlpknilfjdhdgcecdcbdbfbhdjgnjokojngjdgZdYcZbcdgfhgjhihihiggdfadYdZfbigkimjlhjgjgjhjijihidhbfafagbhbg",
        "bidkgnjplpmnjhgdfcebgcifkgkfkfkfjdibfacabbcefghjjjijiihifieiejejdhdfbeaeaeaecgfihjkkmjojnhlficgZeZgcjflhmhkghfffdfcebeae",
        "afbgejgkgkeidhcfeghhihfecaZYXYYZbaebgdielinkojnhjdfZdZdaeeghgjfididjdjejejeidjdjekgkhiihigheigjhlilikgicfZcWcXdaffhhkjkk",
        "llmklkkiggcfbgciekglhkfjdidiekhljmjkkijhlhlhmhlfkekglhnioimghddbabaddhfihkjlkmjnimfkdhbfadbededfdececdbcccfdhdjejeidicgb",
        "fbfbhchdifjijjhjegbeYbWaWbYfbiflglglhkhihhgefcdbbababacacZcXcYeagejhlikgidebcZcZbbbdbfbhekgmglficfZdWbXdZfdhghigjhkhlhlh",
        "lgkgjeidhafZdYbYaZbccefijllmmmkkfgbeYcXdZfbfcgdgdhdgdheheedcdbfcielglfkdididjflhmjnijgffdebebfbfbfchfkiplqlpjmgieeddeeef",
        "gffgfffegegchbhbhchdifjfjfjeidgcgegggjhlhlficfZdXdXdYfahdjgljmmmmkmijegbdbdcfdhdhcgafZebededfddcdbcbdcddcdZbXcXdZhdjeieg",
        "acWZUXTYVZYaZZdcgekgmhmgjcfZcXbWcXdZdacaabacaecfegehfhehdgbgbgafadbcbfehgjhjghedbYYUXTZWdZgcjekfkglglgkficebbcaecgdhdhbf",
        "aeagdigmhmhmhjfhfggghfhfgeggiiljmikehadXaVZXcbfehgjhkikjkjhiegaeZdYeYeZdZdYeZeZeagehghigjgidgbeZdYdZebhdjflhmhkghedbaZWX",
        "WXYbcegjhlhlglglgjfideacZbXZWZXaYaZZaZebhelhmhmfiaeYcVbVbXdaedfghjilikgidfZbWaWaXeahdifjhjijjjijiihhgfeccZbXbWaWcXdZfdig",
        "ljokojlfgbaYWYVaXdagbhcgbgbgcgagZdYbYaZaddgfifiegdfdgfjglgkeiaeYbXZYaZbbccedghkllmjlfibeYbXbXcZebgcgbfafbdbcbabYdYeZeagc",
        "hbhbhbgbfbgchegfgfddaaXYWYXZZccfdielhminikhhddabYaYbbedffefbeZdZfafbfaeZdYdZeafbfbdaaaZdbgejeicfZbUXSWSYUaXcZecefgiikjjh",
        "gddaaZaZbZfbgbfaeZdZdbecgdgehehffedecfbgafZfZfbhdjejdibfYbWYWXYZdchekfkfjeifieidgaeZeaebeefgffddbbacceeigjhlgkeidieieiei",
        "eheheifighfdcZbVZVaWdZgchdjeieichbfacaZaYbYbYbYbXbXbYbXcXdZfafcgdfddccbaZaZaabccedgcgbgaeZcXZUYTYTZXcagdhfgfdebfafafZeYc",
        "WbVZUZTZUZUYUXWYbbgfjgjefbcYaWZVZVbWdYeaebfdfefdeabYZYaaacbechcichbhchdiejfjeidgacYYYVYVaVbWdZfbjelhmhlfibeXaWYXabbecebd",
        "acadbecgcfafaeZfcgehfhdfcebecffijikgidgZdXbWbXcXdZfbhflhmjmjjhefacXbYcZeaeafZdYdYeYeadbddcdddcdcdcdbcbdadafcidkfjehdeZaW",
        "YVYVZYcbeefhgkhmhmfibfZbVaVaXdZeZcYaXZYYbZebfbfadZcYcXcYcWbVZUZXbbefggecaZWVTTSTSWUZVbXdZgdieifidfbcYaXZXZZZbYbWbVbVbXdZ",
        "gbididhcgbdZaZZZYaYbZcZecgdgdgaeXaUXSXTYXbceffffefegfffefceZeYdYeZeaeZdYdXcYechfjikihhdgbfafZeafafbhciejeidgacYYXWYWZYcb",
        "fdheiehehchbfaeZcZcZaYZXYWYWYXZaacbfdiekejcgaeXbVZVaXcZfcgeggegcgbeXbVZSYTZUcYebhchcgcedefdfcebbYYVWUVTWTXTZVaXdbgfjilhj",
        "eeZaWXTVVVYXbYeagbhchchbfZdXbVbVbXbadddgdgchdidiejgkfjcfXbUXSWSVVXZZcbeehhiijhiefZaTXRXSYWbadadZcZbZdadbdcbbZbXcYeZfbgbf",
        "aeZfafciejfgdbZWXTWTYUaWbYdbgdjflgkeibdYZWXXXYYaabaaaaZaYbXbXcXcYcYcZcZcZdZdYdZcaccdfdhdhcfYbVYSXSXUbXeahdifihiigiegbdYa",
        "VZWaYcaeZdYcXbWaYcbdcdccbbaaZZZaaZaXaVbXdagchdgadXZTXRWTXWZZbdbfchdididicgaeYcXcYcYdacaaaYZXaXbZdcgehfjehcfZeYdYbZcacbdb",
        "dbdcdbcbZYWYTZUbYechdjdhbfafafafcecdcbdbfbgbfafYdXcXdZgciekfjegdedcdcdcdcecececeaeYdWbUYUXUYXaZdcfegdfcecbbYbXcWcWcXbWaU",
        "ZUZUaUZVbXbacccfcfbeZcWZUYUZVbYeZgafadZcaaZYXVWUVUWWZZcbeceZdXcXbXcZcabXZUXSURTRTTUVTXUaWeahdjeicfXbUYSWSXUZYaaacZdaeaea",
        "eZcYbXbXbXdYeaebecdcccddefgghgeeabVXSWRXTZWbYdagchfkgkfhddaYYUYUaXeZeZdYdXcXdYeafbfcebccbecfcgbeadadagdiflfkdgZbXYWWWXXY",
        "ZabddfghihjficgYcWaWZWaWbXbXbWaWZXZZacafbfbfaeYdXcWbWbWbWcYebfegfffbcXYTURUTWVaYdZgbhcieififfccZZWYXZYZZYYVXTWSYVcYfbgcg",
        "aeYcVaUYUXTVTTVUZYdagbgbeXaTXRWQWRYUZWaZaccedfefefcdacZcYbWaUaUYTWUXVYWbafdhfighfdcZaVYTZUaVbXcYdZeZfaeZcXZVWVUYWbYebfbf",
        "aeZeafbgbhbgbeZbZaZZaZZXYYZYbcfejglhleicfZcYcYbYcaebecfdedccZbWaUZUZUaXdZfagbgafaeadbcbbcacYbVZUXSXUYVaWcXebhdhfiggfcbZX",
        "WVVWXYZdbfbfafZeZdYcXaVXTXUYWbZebedccZdZeZfagbfYcUYRVPTPVQVTXWYabeeigjghdeZaUWSVSXTaWdZdbecdcdccccbbaaZZZYbYdZeZfbeafaea",
        "gchcgbfZaVVSRSQUSYVcYfagchdidjchadWYSVTUWXaZdacZaXaXZYcYdZdXdXcWbYbacbdbcZbZcceffgefacWYSWQVRXTZXcZfbhdieiefcaaWYTXSXTYU",
        "ZWaWaVZUaVaVbXaabbabYaYZXYXZXZYbYcYfahcgbfabXXUURTRVTYYccdfdgdidichbfYcVZTYTYUZVaVZWXWVYXbYebgbfZdXaWZUYTZTYUYVZZbcdfeec",
        "bYYVUTUSVTYVcYeZfagbgdfdfcebdacabZZZXaVaUaVZUaWcYfbiejejcfabXXXWYWaYbYcYcYcYcYcXbWZUZUYWaacdfffddbbbbabcbeaeZdYdXcXbXbXa",
        "WaVaWcZfeggggdgaeXbWcXcXdZfafafYdXcWYVWWVWUYVaXbZdaeadZcWbVaVaWbXaYZXXVVTUTUUWWXYYaYeafbgcgadYaUXTXTYVbYcZbZZZWZVZVaVZUY",
        "SYTYUaXcYdXbWYVWXXZYcacZZVXSTRSPTPVRXSYVaYdceegeebbYYVVVVVVYWbXdXcWaWaXcXcYdZeZdadadcbdaeZdYcXcXeagcidhbeXaTWSUTVXXaacad",
        "bedfegfgceZbVZUZWbZcacaaXZWYWaZcdefdgcgbfZfafaeZdXcXcZgcheheecaaVYTXSXUZWbYdagbgcichbeabYYYYYXYWXWWVWUWUWUYUaXdafbfbdYaX",
        "YUXUWUYVYXZaaebgbgadXbTWQVQWRYVbXdadbcdcecfbeZcXaVXTXTWSWQVPUPTRVWZacededbaYXVVUTURURWRYUaXdaebdZbWZTWSURUUVXVaXdXdYeZeZ",
        "fafafZeZcWaVWTUUTUSWTXVZYdcgeificfYaTXRVRVVXXYYZYZYZYZZZZXYUYTYTZWbYdZeZdYcYbYdZecedccZbXaUZUZTZTaVaXeahdjfkfhdcbZZWYVYW",
        "ZYbZdadZcXbWbVaUYUXWXXYXaYbZbabaaaYaXcYeYeYcVZTWQVQVRWUZWbZdddgeieicfYbUXRWSXUbXdYdYcXaYaaZaZZWXWWUWVYWaYbXbVaUZVaYdbebc",
        "YYTUPROQQQRRVUZWcZgciejehaeXaTXRVSWUXXYZXbWaWbWaWcXcYdYcWbWbVaXZYZZZZZZZbcddfddaaVWQTNSOURYWbZcbdbecfbebcYXWSURWSYUaWbWa",
        "VZUZVaWcYeadabaZaYaWaXbXaWbYcafbhbgadXZTUSSRSSTVWYZacdeedfbeZcWaUXSWSWRWSWSXSWTWUWWXZYbZeZeXcVZTXRWSXTYUaXcZdadccdZaWWST",
        "PROSRXVbYfafafbfbecdabYYWWUUTUTUVTVRVRWSYVbYebgbfZbWYTWRVSUTUWUYWbYeYeZdXcVZTXSXRXTZWbabcbdbdacadacbdbeacXaUYSXSWTWVXWYX",
        "ZZdbfegeedZZUXSWSYVbXcXbWaVZUZUZVYVXVVXVZXdYeaeYcWaUZUaWcXdZdYaYXXWXVXVXWXWYXaadbfchbfZcWZVXVXVYXaXaXZWXVVVTVRWRWRXSYTZV",
        "bWbWbWaUYTXUVVWYXbWZUXSVQTPUQVRXTZUbWcYcbccbaYXVTTSSUVXWaWZUYSXRXSXTYUXVXUXTYUYWYWXXTVRVQXTaWcXbVZSVOSNRNSPTSVVVYXaYdZdZ",
        "dZbWZUYSXSYTZVZWYWXVVVVWWXZaacccbdZcXbWbWbWaVZVZXbZdaeadYZVUSQSQWSZWcYdYeYeZeZfZdYcWYVWWXYXaXbXZVYTWVYWbYeafbfadZbZaYZYZ",
        "YZXZYabcdceacWaUXRWRVRWT"
      ].join("");
      function solarTermCorrectionMinutes(year, index) {
        if (year < exports.SOLAR_TERM_DATA_MIN_YEAR || year > exports.SOLAR_TERM_DATA_MAX_YEAR)
          return 0;
        return ALPHABET.indexOf(PACKED[(year - exports.SOLAR_TERM_DATA_MIN_YEAR) * 24 + index]) - OFFSET;
      }
    }
  });

  // node_modules/manseryeok/dist/astro/sun-longitude.js
  var require_sun_longitude = __commonJS({
    "node_modules/manseryeok/dist/astro/sun-longitude.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.apparentSolarLongitude = apparentSolarLongitude;
      exports.equationOfTimeMinutes = equationOfTimeMinutes;
      exports.solveSolarLongitudeInstant = solveSolarLongitudeInstant;
      var DEG2RAD = Math.PI / 180;
      var RAD2DEG = 180 / Math.PI;
      function julianDayFromMs(ms) {
        return ms / 864e5 + 24405875e-1;
      }
      function normalizeDegrees(deg) {
        const d = deg % 360;
        return d < 0 ? d + 360 : d;
      }
      function solarElements(jd) {
        const T = (jd - 2451545) / 36525;
        const L0 = normalizeDegrees(280.46646 + 36000.76983 * T + 3032e-7 * T * T);
        const M2 = 357.52911 + 35999.05029 * T - 1537e-7 * T * T;
        const e = 0.016708634 - 42037e-9 * T - 1267e-10 * T * T;
        const Mrad = M2 * DEG2RAD;
        const C = (1.914602 - 4817e-6 * T - 14e-6 * T * T) * Math.sin(Mrad) + (0.019993 - 101e-6 * T) * Math.sin(2 * Mrad) + 289e-6 * Math.sin(3 * Mrad);
        const epsilon0 = 23 + 26 / 60 + 21.448 / 3600 - 46.815 / 3600 * T - 59e-5 / 3600 * T * T + 1813e-6 / 3600 * T * T * T;
        return { L0, M: M2, e, C, epsilon: epsilon0, T };
      }
      function apparentSolarLongitude(ms) {
        const jd = julianDayFromMs(ms);
        const { L0, C, T } = solarElements(jd);
        const trueLong = L0 + C;
        const omega = 125.04 - 1934.136 * T;
        const apparent = trueLong - 569e-5 - 478e-5 * Math.sin(omega * DEG2RAD);
        return normalizeDegrees(apparent);
      }
      function equationOfTimeMinutes(ms) {
        const jd = julianDayFromMs(ms);
        const { L0, M: M2, e, epsilon } = solarElements(jd);
        const epsRad = epsilon * DEG2RAD;
        const y = Math.tan(epsRad / 2) ** 2;
        const L0rad = L0 * DEG2RAD;
        const Mrad = M2 * DEG2RAD;
        const E = y * Math.sin(2 * L0rad) - 2 * e * Math.sin(Mrad) + 4 * e * y * Math.sin(Mrad) * Math.cos(2 * L0rad) - 0.5 * y * y * Math.sin(4 * L0rad) - 1.25 * e * e * Math.sin(2 * Mrad);
        return E * RAD2DEG * 4;
      }
      function solveSolarLongitudeInstant(targetLongitude, guessMs) {
        let ms = guessMs;
        const degPerDay = 360 / 365.2422;
        for (let i = 0; i < 8; i++) {
          const current = apparentSolarLongitude(ms);
          let diff = (current - targetLongitude + 540) % 360 - 180;
          if (Math.abs(diff) < 1e-7)
            break;
          ms -= diff / degPerDay * 864e5;
        }
        return ms;
      }
    }
  });

  // node_modules/manseryeok/dist/time/korea-timezone.js
  var require_korea_timezone = __commonJS({
    "node_modules/manseryeok/dist/time/korea-timezone.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.koreaCivilOffsetMin = koreaCivilOffsetMin;
      var STANDARD_EPOCHS = [
        { year: 1908, month: 4, day: 1, offsetMin: 510 },
        { year: 1912, month: 1, day: 1, offsetMin: 540 },
        { year: 1954, month: 3, day: 21, offsetMin: 510 },
        { year: 1961, month: 8, day: 10, offsetMin: 540 }
      ];
      var DEFAULT_OFFSET_MIN = 540;
      var DST_INTERVALS = [
        { start: { y: 1948, mo: 6, d: 1, h: 0 }, end: { y: 1948, mo: 9, d: 13, h: 0 } },
        { start: { y: 1949, mo: 4, d: 3, h: 0 }, end: { y: 1949, mo: 9, d: 11, h: 0 } },
        { start: { y: 1950, mo: 4, d: 1, h: 0 }, end: { y: 1950, mo: 9, d: 10, h: 0 } },
        { start: { y: 1951, mo: 5, d: 6, h: 0 }, end: { y: 1951, mo: 9, d: 9, h: 0 } },
        { start: { y: 1955, mo: 5, d: 5, h: 0 }, end: { y: 1955, mo: 9, d: 9, h: 0 } },
        { start: { y: 1956, mo: 5, d: 20, h: 0 }, end: { y: 1956, mo: 9, d: 30, h: 0 } },
        { start: { y: 1957, mo: 5, d: 5, h: 0 }, end: { y: 1957, mo: 9, d: 22, h: 0 } },
        { start: { y: 1958, mo: 5, d: 4, h: 0 }, end: { y: 1958, mo: 9, d: 21, h: 0 } },
        { start: { y: 1959, mo: 5, d: 3, h: 0 }, end: { y: 1959, mo: 9, d: 20, h: 0 } },
        { start: { y: 1960, mo: 5, d: 1, h: 0 }, end: { y: 1960, mo: 9, d: 18, h: 0 } },
        { start: { y: 1987, mo: 5, d: 10, h: 2 }, end: { y: 1987, mo: 10, d: 11, h: 3 } },
        { start: { y: 1988, mo: 5, d: 8, h: 2 }, end: { y: 1988, mo: 10, d: 9, h: 3 } }
      ];
      function key(y, mo, d, h) {
        return ((y * 12 + (mo - 1)) * 31 + (d - 1)) * 24 + h;
      }
      function standardOffsetMin(y, mo, d) {
        const k = key(y, mo, d, 0);
        let offset = DEFAULT_OFFSET_MIN;
        for (const e of STANDARD_EPOCHS) {
          if (k >= key(e.year, e.month, e.day, 0)) {
            offset = e.offsetMin;
          } else {
            break;
          }
        }
        return offset;
      }
      function isDst(y, mo, d, h) {
        const k = key(y, mo, d, h);
        for (const iv of DST_INTERVALS) {
          if (k >= key(iv.start.y, iv.start.mo, iv.start.d, iv.start.h) && k < key(iv.end.y, iv.end.mo, iv.end.d, iv.end.h)) {
            return true;
          }
        }
        return false;
      }
      function koreaCivilOffsetMin(y, mo, d, h) {
        const base = standardOffsetMin(y, mo, d);
        return base + (isDst(y, mo, d, h) ? 60 : 0);
      }
    }
  });

  // node_modules/manseryeok/dist/time/true-solar-time.js
  var require_true_solar_time = __commonJS({
    "node_modules/manseryeok/dist/time/true-solar-time.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.DEFAULT_LONGITUDE = void 0;
      exports.resolveInstant = resolveInstant;
      var sun_longitude_1 = require_sun_longitude();
      var korea_timezone_1 = require_korea_timezone();
      var MINUTE_MS = 6e4;
      var KST_STANDARD_MERIDIAN = 135;
      var KST_OFFSET_MIN = 540;
      exports.DEFAULT_LONGITUDE = 127.5;
      function resolveInstant(year, month, day, hour, minute, options) {
        var _a, _b, _c;
        const wallMs = Date.UTC(year, month - 1, day, hour, minute, 0);
        if (!options) {
          const instantUTCms2 = wallMs - KST_OFFSET_MIN * MINUTE_MS;
          const apparentMs2 = instantUTCms2 + KST_STANDARD_MERIDIAN * 4 * MINUTE_MS;
          return { instantUTCms: instantUTCms2, apparentMs: apparentMs2 };
        }
        const longitude = (_a = options.longitude) != null ? _a : exports.DEFAULT_LONGITUDE;
        const applyEoT = (_b = options.applyEquationOfTime) != null ? _b : true;
        const applyDst = (_c = options.applyHistoricalDst) != null ? _c : true;
        const civilOffsetMin = applyDst ? (0, korea_timezone_1.koreaCivilOffsetMin)(year, month, day, hour) : KST_OFFSET_MIN;
        const instantUTCms = wallMs - civilOffsetMin * MINUTE_MS;
        const eotMin = applyEoT ? (0, sun_longitude_1.equationOfTimeMinutes)(instantUTCms) : 0;
        const apparentMs = instantUTCms + (longitude * 4 + eotMin) * MINUTE_MS;
        return { instantUTCms, apparentMs };
      }
    }
  });

  // node_modules/manseryeok/dist/ganji.js
  var require_ganji = __commonJS({
    "node_modules/manseryeok/dist/ganji.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.ganjiIndexOf = ganjiIndexOf;
      exports.pillarFromGanji = pillarFromGanji;
      var constants_1 = require_constants();
      function ganjiIndexOf(stemIndex, branchIndex) {
        if ((stemIndex - branchIndex) % 2 !== 0) {
          throw new RangeError(`\uC874\uC7AC\uD558\uC9C0 \uC54A\uB294 \uCC9C\uAC04\xB7\uC9C0\uC9C0 \uC870\uD569\uC785\uB2C8\uB2E4: ${constants_1.HEAVENLY_STEMS[stemIndex]}${constants_1.EARTHLY_BRANCHES[branchIndex]}`);
        }
        return ((6 * stemIndex - 5 * branchIndex) % 60 + 60) % 60;
      }
      function pillarFromGanji(ganjiIndex) {
        return {
          heavenlyStem: constants_1.HEAVENLY_STEMS[ganjiIndex % 10],
          earthlyBranch: constants_1.EARTHLY_BRANCHES[ganjiIndex % 12]
        };
      }
    }
  });

  // node_modules/manseryeok/dist/astro/solar-terms.js
  var require_solar_terms = __commonJS({
    "node_modules/manseryeok/dist/astro/solar-terms.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.SOLAR_TERM_NAMES_HANJA = exports.SOLAR_TERM_NAMES = void 0;
      exports.solarTermInstantMs = solarTermInstantMs;
      exports.getSolarTerm = getSolarTerm;
      exports.getSolarTermsOfYear = getSolarTermsOfYear;
      exports.sajuYearForInstant = sajuYearForInstant;
      exports.sajuMonthForInstant = sajuMonthForInstant;
      var sun_longitude_1 = require_sun_longitude();
      var validation_1 = require_validation();
      var solar_terms_data_1 = require_solar_terms_data();
      var SOLAR_TERM_MIN_YEAR = 100;
      var SOLAR_TERM_MAX_YEAR = 9999;
      var MS_PER_MINUTE = 6e4;
      var SOLAR_TERM_CACHE = /* @__PURE__ */ new Map();
      function assertSolarTermYear(year) {
        (0, validation_1.assertIntegerInRange)(year, SOLAR_TERM_MIN_YEAR, SOLAR_TERM_MAX_YEAR, "\uC808\uAE30 \uC5F0\uB3C4(year)");
      }
      exports.SOLAR_TERM_NAMES = [
        "\uC18C\uD55C",
        "\uB300\uD55C",
        "\uC785\uCD98",
        "\uC6B0\uC218",
        "\uACBD\uCE69",
        "\uCD98\uBD84",
        "\uCCAD\uBA85",
        "\uACE1\uC6B0",
        "\uC785\uD558",
        "\uC18C\uB9CC",
        "\uB9DD\uC885",
        "\uD558\uC9C0",
        "\uC18C\uC11C",
        "\uB300\uC11C",
        "\uC785\uCD94",
        "\uCC98\uC11C",
        "\uBC31\uB85C",
        "\uCD94\uBD84",
        "\uD55C\uB85C",
        "\uC0C1\uAC15",
        "\uC785\uB3D9",
        "\uC18C\uC124",
        "\uB300\uC124",
        "\uB3D9\uC9C0"
      ];
      exports.SOLAR_TERM_NAMES_HANJA = [
        "\u5C0F\u5BD2",
        "\u5927\u5BD2",
        "\u7ACB\u6625",
        "\u96E8\u6C34",
        "\u9A5A\u87C4",
        "\u6625\u5206",
        "\u6DF8\u660E",
        "\u7A40\u96E8",
        "\u7ACB\u590F",
        "\u5C0F\u6EFF",
        "\u8292\u7A2E",
        "\u590F\u81F3",
        "\u5C0F\u6691",
        "\u5927\u6691",
        "\u7ACB\u79CB",
        "\u8655\u6691",
        "\u767D\u9732",
        "\u79CB\u5206",
        "\u5BD2\u9732",
        "\u971C\u964D",
        "\u7ACB\u51AC",
        "\u5C0F\u96EA",
        "\u5927\u96EA",
        "\u51AC\u81F3"
      ];
      var LICHUN_INDEX = 2;
      function solarTermLongitude(index) {
        (0, validation_1.assertIntegerInRange)(index, 0, 23, "\uC808\uAE30 \uC778\uB371\uC2A4(index)");
        return (285 + 15 * index) % 360;
      }
      function solarTermInstantMs(year, index) {
        assertSolarTermYear(year);
        const target = solarTermLongitude(index);
        const cacheKey = year * 24 + index;
        const cached = SOLAR_TERM_CACHE.get(cacheKey);
        if (cached !== void 0)
          return cached;
        const month = Math.floor(index / 2);
        const guessMs = Date.UTC(year, month, 15, 0, 0, 0);
        const meeusMin = Math.round((0, sun_longitude_1.solveSolarLongitudeInstant)(target, guessMs) / MS_PER_MINUTE);
        const instantMs = (meeusMin + (0, solar_terms_data_1.solarTermCorrectionMinutes)(year, index)) * MS_PER_MINUTE;
        SOLAR_TERM_CACHE.set(cacheKey, instantMs);
        return instantMs;
      }
      function getSolarTerm(year, index) {
        const ms = solarTermInstantMs(year, index);
        return {
          index,
          name: exports.SOLAR_TERM_NAMES[index],
          hanja: exports.SOLAR_TERM_NAMES_HANJA[index],
          date: new Date(ms)
        };
      }
      function getSolarTermsOfYear(year) {
        return Array.from({ length: 24 }, (_, i) => getSolarTerm(year, i));
      }
      function sajuYearForInstant(instantMs, calendarYear) {
        (0, validation_1.assertFiniteNumber)(instantMs, "\uC808\uB300 \uC21C\uAC04(instantMs)");
        const lichunMs = solarTermInstantMs(calendarYear, LICHUN_INDEX);
        return instantMs < lichunMs ? calendarYear - 1 : calendarYear;
      }
      var JEOL_TO_MONTH = [
        [2, 1],
        [4, 2],
        [6, 3],
        [8, 4],
        [10, 5],
        [12, 6],
        [14, 7],
        [16, 8],
        [18, 9],
        [20, 10],
        [22, 11],
        [0, 12]
      ];
      function sajuMonthForInstant(instantMs) {
        (0, validation_1.assertFiniteNumber)(instantMs, "\uC808\uB300 \uC21C\uAC04(instantMs)");
        const year = new Date(instantMs).getUTCFullYear();
        let bestBoundary = -Infinity;
        let month = 12;
        for (const yr of [year - 1, year, year + 1]) {
          for (const [index, mon] of JEOL_TO_MONTH) {
            const boundary = solarTermInstantMs(yr, index);
            if (boundary <= instantMs && boundary > bestBoundary) {
              bestBoundary = boundary;
              month = mon;
            }
          }
        }
        return month;
      }
    }
  });

  // node_modules/manseryeok/dist/pillars.js
  var require_pillars = __commonJS({
    "node_modules/manseryeok/dist/pillars.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.computeFourPillars = computeFourPillars;
      var constants_1 = require_constants();
      var ganji_1 = require_ganji();
      var solar_terms_1 = require_solar_terms();
      var MS_PER_DAY = 864e5;
      function mod(n, m) {
        return (n % m + m) % m;
      }
      function getYearPillar(sajuYear) {
        return {
          heavenlyStem: constants_1.HEAVENLY_STEMS[mod(sajuYear - 4, 10)],
          earthlyBranch: constants_1.EARTHLY_BRANCHES[mod(sajuYear - 4, 12)]
        };
      }
      function getMonthPillar(sajuYear, monthNumber) {
        const yearStem = mod(sajuYear - 4, 10);
        const yearStemMod5 = yearStem % 5;
        const monthStemIndex = (yearStemMod5 * 2 + monthNumber + 1) % 10;
        return {
          heavenlyStem: constants_1.HEAVENLY_STEMS[monthStemIndex],
          earthlyBranch: constants_1.MONTH_BRANCHES[monthNumber]
        };
      }
      function ganjiIndexForDate(year, month, day) {
        const anchorMs = Date.UTC(constants_1.DAY_PILLAR_ANCHOR.year, constants_1.DAY_PILLAR_ANCHOR.month - 1, constants_1.DAY_PILLAR_ANCHOR.day);
        const targetMs = Date.UTC(year, month - 1, day);
        const daysDiff = Math.round((targetMs - anchorMs) / MS_PER_DAY);
        return mod(constants_1.DAY_PILLAR_ANCHOR.ganjiIndex + daysDiff, 60);
      }
      function computeDayPillar(apparentMs, dayBoundary) {
        const d = new Date(apparentMs);
        const baseGanji = ganjiIndexForDate(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
        const isLateZi = d.getUTCHours() >= 23;
        const nextGanji = (baseGanji + 1) % 60;
        let dayGanji = baseGanji;
        let hourStemGanji = baseGanji;
        if (isLateZi) {
          if (dayBoundary === "jasi") {
            dayGanji = nextGanji;
            hourStemGanji = nextGanji;
          } else if (dayBoundary === "splitJasi") {
            hourStemGanji = nextGanji;
          }
        }
        return { pillar: (0, ganji_1.pillarFromGanji)(dayGanji), dayStemIndex: hourStemGanji % 10 };
      }
      function shichenForApparent(apparentMs) {
        const d = new Date(apparentMs);
        const totalMinutes = d.getUTCHours() * 60 + d.getUTCMinutes();
        return Math.floor((totalMinutes + 60) % 1440 / 120);
      }
      function getHourPillar(dayStemIndex, shichen) {
        const hourStemBase = dayStemIndex % 5 * 2;
        const hourStemIndex = (hourStemBase + shichen) % 10;
        return {
          heavenlyStem: constants_1.HEAVENLY_STEMS[hourStemIndex],
          earthlyBranch: constants_1.EARTHLY_BRANCHES[shichen]
        };
      }
      function computeFourPillars(resolved, calendarYear, dayBoundary) {
        const sajuYear = (0, solar_terms_1.sajuYearForInstant)(resolved.instantUTCms, calendarYear);
        const monthNumber = (0, solar_terms_1.sajuMonthForInstant)(resolved.instantUTCms);
        const yearPillar = getYearPillar(sajuYear);
        const monthPillar = getMonthPillar(sajuYear, monthNumber);
        const { pillar: dayPillar, dayStemIndex } = computeDayPillar(resolved.apparentMs, dayBoundary);
        const shichen = shichenForApparent(resolved.apparentMs);
        const hourPillar = getHourPillar(dayStemIndex, shichen);
        return { year: yearPillar, month: monthPillar, day: dayPillar, hour: hourPillar };
      }
    }
  });

  // node_modules/manseryeok/dist/features/ten-gods.js
  var require_ten_gods = __commonJS({
    "node_modules/manseryeok/dist/features/ten-gods.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.getTenGod = getTenGod;
      exports.getBranchTenGod = getBranchTenGod;
      exports.getTenGodChart = getTenGodChart;
      var constants_1 = require_constants();
      var elements_1 = require_elements();
      var validation_1 = require_validation();
      function getTenGod(dayMaster, target) {
        const dayEl = (0, elements_1.getHeavenlyStemElement)(dayMaster);
        const targetEl = (0, elements_1.getHeavenlyStemElement)(target);
        const sameYinYang = (0, elements_1.getHeavenlyStemYinYang)(dayMaster) === (0, elements_1.getHeavenlyStemYinYang)(target);
        if (targetEl === dayEl) {
          return sameYinYang ? "\uBE44\uACAC" : "\uAC81\uC7AC";
        }
        if (constants_1.ELEMENT_GENERATES[dayEl] === targetEl) {
          return sameYinYang ? "\uC2DD\uC2E0" : "\uC0C1\uAD00";
        }
        if (constants_1.ELEMENT_CONTROLS[dayEl] === targetEl) {
          return sameYinYang ? "\uD3B8\uC7AC" : "\uC815\uC7AC";
        }
        if (constants_1.ELEMENT_CONTROLS[targetEl] === dayEl) {
          return sameYinYang ? "\uD3B8\uAD00" : "\uC815\uAD00";
        }
        return sameYinYang ? "\uD3B8\uC778" : "\uC815\uC778";
      }
      function getBranchTenGod(dayMaster, branch) {
        (0, validation_1.assertEarthlyBranch)(branch);
        return getTenGod(dayMaster, constants_1.BRANCH_MAIN_STEM[branch]);
      }
      function getTenGodChart(pillars) {
        const dayMaster = pillars.day.heavenlyStem;
        return {
          year: {
            stem: getTenGod(dayMaster, pillars.year.heavenlyStem),
            branch: getBranchTenGod(dayMaster, pillars.year.earthlyBranch)
          },
          month: {
            stem: getTenGod(dayMaster, pillars.month.heavenlyStem),
            branch: getBranchTenGod(dayMaster, pillars.month.earthlyBranch)
          },
          day: {
            stem: "\uC77C\uAC04",
            branch: getBranchTenGod(dayMaster, pillars.day.earthlyBranch)
          },
          hour: {
            stem: getTenGod(dayMaster, pillars.hour.heavenlyStem),
            branch: getBranchTenGod(dayMaster, pillars.hour.earthlyBranch)
          }
        };
      }
    }
  });

  // node_modules/manseryeok/dist/features/void-branches.js
  var require_void_branches = __commonJS({
    "node_modules/manseryeok/dist/features/void-branches.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.getVoidBranches = getVoidBranches;
      var constants_1 = require_constants();
      var ganji_1 = require_ganji();
      var validation_1 = require_validation();
      function getVoidBranches(dayStem, dayBranch) {
        (0, validation_1.assertHeavenlyStem)(dayStem, "\uC77C\uAC04(dayStem)");
        (0, validation_1.assertEarthlyBranch)(dayBranch, "\uC77C\uC9C0(dayBranch)");
        const dayGanji = (0, ganji_1.ganjiIndexOf)(constants_1.HEAVENLY_STEMS.indexOf(dayStem), constants_1.EARTHLY_BRANCHES.indexOf(dayBranch));
        const xunStartBranch = (dayGanji - dayGanji % 10) % 12;
        return [
          constants_1.EARTHLY_BRANCHES[(xunStartBranch + 10) % 12],
          constants_1.EARTHLY_BRANCHES[(xunStartBranch + 11) % 12]
        ];
      }
    }
  });

  // node_modules/manseryeok/dist/features/luck-pillars.js
  var require_luck_pillars = __commonJS({
    "node_modules/manseryeok/dist/features/luck-pillars.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.getLuckPillars = getLuckPillars;
      var constants_1 = require_constants();
      var ganji_1 = require_ganji();
      var solar_terms_1 = require_solar_terms();
      var validation_1 = require_validation();
      var MS_PER_DAY = 864e5;
      var JEOL_INDICES = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22];
      function collectJeolInstants(birthYear) {
        const result = [];
        for (let y = birthYear - 1; y <= birthYear + 1; y++) {
          for (const idx of JEOL_INDICES) {
            result.push((0, solar_terms_1.solarTermInstantMs)(y, idx));
          }
        }
        return result.sort((a, b) => a - b);
      }
      function getLuckPillars(params) {
        const { instantUTCms, birthYear, monthPillar, sajuYearStemIndex, gender, count = 10 } = params;
        (0, validation_1.assertFiniteNumber)(instantUTCms, "\uCD9C\uC0DD \uC808\uB300 \uC21C\uAC04(instantUTCms)");
        (0, validation_1.assertIntegerInRange)(birthYear, 101, 9998, "\uC785\uB825 \uC591\uB825 \uC5F0\uB3C4(birthYear)");
        (0, validation_1.assertPillar)(monthPillar, "\uC6D4\uC8FC(monthPillar)");
        (0, validation_1.assertIntegerInRange)(sajuYearStemIndex, 0, 9, "\uC0AC\uC8FC \uC5F0\uAC04 \uC778\uB371\uC2A4(sajuYearStemIndex)");
        (0, validation_1.assertGender)(gender);
        (0, validation_1.assertIntegerInRange)(count, 1, 120, "\uB300\uC6B4 \uAC1C\uC218(count)");
        const yangYear = sajuYearStemIndex % 2 === 0;
        const male = gender === "male";
        const forward = yangYear && male || !yangYear && !male;
        const jeols = collectJeolInstants(birthYear);
        let days;
        if (forward) {
          const next = jeols.find((ms) => ms > instantUTCms);
          days = next ? (next - instantUTCms) / MS_PER_DAY : 0;
        } else {
          const prev = [...jeols].reverse().find((ms) => ms <= instantUTCms);
          days = prev ? (instantUTCms - prev) / MS_PER_DAY : 0;
        }
        const startAge = Math.max(1, Math.round(days / 3));
        let startYears = Math.floor(days / 3);
        const remMonths = (days - startYears * 3) * 4;
        let startMonths = Math.floor(remMonths);
        let startDays = Math.round((remMonths - startMonths) * 30);
        if (startDays >= 30) {
          startDays -= 30;
          startMonths += 1;
        }
        if (startMonths >= 12) {
          startMonths -= 12;
          startYears += 1;
        }
        const monthGanji = (0, ganji_1.ganjiIndexOf)(constants_1.HEAVENLY_STEMS.indexOf(monthPillar.heavenlyStem), constants_1.EARTHLY_BRANCHES.indexOf(monthPillar.earthlyBranch));
        const pillars = [];
        for (let i = 0; i < count; i++) {
          const step = i + 1;
          const ganji = forward ? (monthGanji + step) % 60 : ((monthGanji - step) % 60 + 60) % 60;
          const pillar = (0, ganji_1.pillarFromGanji)(ganji);
          pillars.push({
            age: startAge + i * 10,
            pillar,
            korean: `${pillar.heavenlyStem}${pillar.earthlyBranch}`
          });
        }
        return { forward, startAge, startYears, startMonths, startDays, pillars };
      }
    }
  });

  // node_modules/manseryeok/dist/index.js
  var require_dist = __commonJS({
    "node_modules/manseryeok/dist/index.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.DEFAULT_LONGITUDE = exports.getLuckPillars = exports.getVoidBranches = exports.getTenGodChart = exports.getBranchTenGod = exports.getTenGod = exports.equationOfTimeMinutes = exports.apparentSolarLongitude = exports.SOLAR_TERM_NAMES_HANJA = exports.SOLAR_TERM_NAMES = exports.getSolarTermsOfYear = exports.getSolarTerm = exports.LUNAR_MAX_YEAR = exports.LUNAR_MIN_YEAR = exports.isValidSolarDate = exports.solarToLunar = exports.lunarToSolar = exports.getEarthlyBranchElement = exports.getEarthlyBranchYinYang = exports.getHeavenlyStemElement = exports.getHeavenlyStemYinYang = exports.TEN_GOD_HANJA = exports.FIVE_ELEMENTS = exports.YIN_YANG = exports.EARTHLY_BRANCHES_HANJA = exports.EARTHLY_BRANCHES = exports.HEAVENLY_STEMS_HANJA = exports.HEAVENLY_STEMS = void 0;
      exports.calculateFourPillars = calculateFourPillars;
      exports.fourPillarsToString = fourPillarsToString;
      var constants_1 = require_constants();
      var elements_1 = require_elements();
      var convert_1 = require_convert();
      var lunar_data_1 = require_lunar_data();
      var solar_terms_data_1 = require_solar_terms_data();
      var true_solar_time_1 = require_true_solar_time();
      var pillars_1 = require_pillars();
      var ten_gods_1 = require_ten_gods();
      var void_branches_1 = require_void_branches();
      var luck_pillars_1 = require_luck_pillars();
      var validation_1 = require_validation();
      var constants_2 = require_constants();
      Object.defineProperty(exports, "HEAVENLY_STEMS", { enumerable: true, get: function() {
        return constants_2.HEAVENLY_STEMS;
      } });
      Object.defineProperty(exports, "HEAVENLY_STEMS_HANJA", { enumerable: true, get: function() {
        return constants_2.HEAVENLY_STEMS_HANJA;
      } });
      Object.defineProperty(exports, "EARTHLY_BRANCHES", { enumerable: true, get: function() {
        return constants_2.EARTHLY_BRANCHES;
      } });
      Object.defineProperty(exports, "EARTHLY_BRANCHES_HANJA", { enumerable: true, get: function() {
        return constants_2.EARTHLY_BRANCHES_HANJA;
      } });
      Object.defineProperty(exports, "YIN_YANG", { enumerable: true, get: function() {
        return constants_2.YIN_YANG;
      } });
      Object.defineProperty(exports, "FIVE_ELEMENTS", { enumerable: true, get: function() {
        return constants_2.FIVE_ELEMENTS;
      } });
      Object.defineProperty(exports, "TEN_GOD_HANJA", { enumerable: true, get: function() {
        return constants_2.TEN_GOD_HANJA;
      } });
      var elements_2 = require_elements();
      Object.defineProperty(exports, "getHeavenlyStemYinYang", { enumerable: true, get: function() {
        return elements_2.getHeavenlyStemYinYang;
      } });
      Object.defineProperty(exports, "getHeavenlyStemElement", { enumerable: true, get: function() {
        return elements_2.getHeavenlyStemElement;
      } });
      Object.defineProperty(exports, "getEarthlyBranchYinYang", { enumerable: true, get: function() {
        return elements_2.getEarthlyBranchYinYang;
      } });
      Object.defineProperty(exports, "getEarthlyBranchElement", { enumerable: true, get: function() {
        return elements_2.getEarthlyBranchElement;
      } });
      var convert_2 = require_convert();
      Object.defineProperty(exports, "lunarToSolar", { enumerable: true, get: function() {
        return convert_2.lunarToSolar;
      } });
      Object.defineProperty(exports, "solarToLunar", { enumerable: true, get: function() {
        return convert_2.solarToLunar;
      } });
      Object.defineProperty(exports, "isValidSolarDate", { enumerable: true, get: function() {
        return convert_2.isValidSolarDate;
      } });
      var lunar_data_2 = require_lunar_data();
      Object.defineProperty(exports, "LUNAR_MIN_YEAR", { enumerable: true, get: function() {
        return lunar_data_2.LUNAR_MIN_YEAR;
      } });
      Object.defineProperty(exports, "LUNAR_MAX_YEAR", { enumerable: true, get: function() {
        return lunar_data_2.LUNAR_MAX_YEAR;
      } });
      var solar_terms_1 = require_solar_terms();
      Object.defineProperty(exports, "getSolarTerm", { enumerable: true, get: function() {
        return solar_terms_1.getSolarTerm;
      } });
      Object.defineProperty(exports, "getSolarTermsOfYear", { enumerable: true, get: function() {
        return solar_terms_1.getSolarTermsOfYear;
      } });
      Object.defineProperty(exports, "SOLAR_TERM_NAMES", { enumerable: true, get: function() {
        return solar_terms_1.SOLAR_TERM_NAMES;
      } });
      Object.defineProperty(exports, "SOLAR_TERM_NAMES_HANJA", { enumerable: true, get: function() {
        return solar_terms_1.SOLAR_TERM_NAMES_HANJA;
      } });
      var sun_longitude_1 = require_sun_longitude();
      Object.defineProperty(exports, "apparentSolarLongitude", { enumerable: true, get: function() {
        return sun_longitude_1.apparentSolarLongitude;
      } });
      Object.defineProperty(exports, "equationOfTimeMinutes", { enumerable: true, get: function() {
        return sun_longitude_1.equationOfTimeMinutes;
      } });
      var ten_gods_2 = require_ten_gods();
      Object.defineProperty(exports, "getTenGod", { enumerable: true, get: function() {
        return ten_gods_2.getTenGod;
      } });
      Object.defineProperty(exports, "getBranchTenGod", { enumerable: true, get: function() {
        return ten_gods_2.getBranchTenGod;
      } });
      Object.defineProperty(exports, "getTenGodChart", { enumerable: true, get: function() {
        return ten_gods_2.getTenGodChart;
      } });
      var void_branches_2 = require_void_branches();
      Object.defineProperty(exports, "getVoidBranches", { enumerable: true, get: function() {
        return void_branches_2.getVoidBranches;
      } });
      var luck_pillars_2 = require_luck_pillars();
      Object.defineProperty(exports, "getLuckPillars", { enumerable: true, get: function() {
        return luck_pillars_2.getLuckPillars;
      } });
      var true_solar_time_2 = require_true_solar_time();
      Object.defineProperty(exports, "DEFAULT_LONGITUDE", { enumerable: true, get: function() {
        return true_solar_time_2.DEFAULT_LONGITUDE;
      } });
      function validateBirthInfo(birthInfo) {
        if (birthInfo === null || typeof birthInfo !== "object") {
          throw new TypeError("\uC0DD\uB144\uC6D4\uC77C\uC2DC \uC815\uBCF4(birthInfo)\uB294 \uAC1D\uCCB4\uC5EC\uC57C \uD569\uB2C8\uB2E4.");
        }
        const { year, month, day, hour, minute } = birthInfo;
        if (birthInfo.isLunar !== void 0) {
          (0, validation_1.assertBoolean)(birthInfo.isLunar, "\uC74C\uB825 \uC5EC\uBD80(isLunar)");
        }
        if (birthInfo.isLeapMonth !== void 0) {
          (0, validation_1.assertBoolean)(birthInfo.isLeapMonth, "\uC724\uB2EC \uC5EC\uBD80(isLeapMonth)");
        }
        if (birthInfo.dayBoundary !== void 0) {
          (0, validation_1.assertDayBoundary)(birthInfo.dayBoundary);
        }
        if (birthInfo.gender !== void 0) {
          (0, validation_1.assertGender)(birthInfo.gender);
        }
        if (birthInfo.trueSolarTime !== void 0) {
          const { trueSolarTime } = birthInfo;
          if (trueSolarTime === null || typeof trueSolarTime !== "object" || Array.isArray(trueSolarTime)) {
            throw new TypeError("\uC9C4\uD0DC\uC591\uC2DC \uC635\uC158(trueSolarTime)\uC740 \uAC1D\uCCB4\uC5EC\uC57C \uD569\uB2C8\uB2E4.");
          }
          if (trueSolarTime.longitude !== void 0) {
            (0, validation_1.assertFiniteNumber)(trueSolarTime.longitude, "\uCD9C\uC0DD\uC9C0 \uACBD\uB3C4(trueSolarTime.longitude)");
            if (trueSolarTime.longitude < -180 || trueSolarTime.longitude > 180) {
              throw new RangeError(`\uCD9C\uC0DD\uC9C0 \uACBD\uB3C4(trueSolarTime.longitude)\uB294 -180~180 \uBC94\uC704\uC5EC\uC57C \uD569\uB2C8\uB2E4: ${trueSolarTime.longitude}`);
            }
          }
          (0, validation_1.assertOptionalBoolean)(trueSolarTime.applyEquationOfTime, "\uADE0\uC2DC\uCC28 \uBCF4\uC815 \uC5EC\uBD80(trueSolarTime.applyEquationOfTime)");
          (0, validation_1.assertOptionalBoolean)(trueSolarTime.applyHistoricalDst, "\uACFC\uAC70 \uD45C\uC900\uC2DC\xB7\uC11C\uBA38\uD0C0\uC784 \uBCF4\uC815 \uC5EC\uBD80(trueSolarTime.applyHistoricalDst)");
        }
        const minYear = solar_terms_data_1.SOLAR_TERM_DATA_MIN_YEAR;
        const maxYear = birthInfo.isLunar ? lunar_data_1.LUNAR_MAX_YEAR : solar_terms_data_1.SOLAR_TERM_DATA_MAX_YEAR;
        if (!Number.isInteger(year) || year < minYear || year > maxYear) {
          throw new RangeError(`\uC5F0\uB3C4(year)\uB294 ${minYear}~${maxYear} \uC815\uC218\uC5EC\uC57C \uD569\uB2C8\uB2E4: ${year}`);
        }
        if (!Number.isInteger(hour) || hour < 0 || hour > 23) {
          throw new RangeError(`\uC2DC(hour)\uB294 0~23 \uC815\uC218\uC5EC\uC57C \uD569\uB2C8\uB2E4: ${hour}`);
        }
        if (!Number.isInteger(minute) || minute < 0 || minute > 59) {
          throw new RangeError(`\uBD84(minute)\uC740 0~59 \uC815\uC218\uC5EC\uC57C \uD569\uB2C8\uB2E4: ${minute}`);
        }
        if (birthInfo.isLunar) {
          if (!Number.isInteger(month) || month < 1 || month > 12) {
            throw new RangeError(`\uC6D4(month)\uC740 1~12 \uC815\uC218\uC5EC\uC57C \uD569\uB2C8\uB2E4: ${month}`);
          }
          if (!Number.isInteger(day) || day < 1 || day > 30) {
            throw new RangeError(`\uC74C\uB825 \uC77C(day)\uC740 1~30 \uC815\uC218\uC5EC\uC57C \uD569\uB2C8\uB2E4: ${day}`);
          }
        } else if (!(0, convert_1.isValidSolarDate)(year, month, day)) {
          throw new RangeError(`\uC720\uD6A8\uD558\uC9C0 \uC54A\uC740 \uC591\uB825 \uB0A0\uC9DC\uC785\uB2C8\uB2E4: ${year}-${month}-${day}`);
        }
      }
      function hanjaOf(pillar) {
        return constants_1.HEAVENLY_STEMS_HANJA[constants_1.HEAVENLY_STEMS.indexOf(pillar.heavenlyStem)] + constants_1.EARTHLY_BRANCHES_HANJA[constants_1.EARTHLY_BRANCHES.indexOf(pillar.earthlyBranch)];
      }
      function elementOf(pillar) {
        return {
          stem: (0, elements_1.getHeavenlyStemElement)(pillar.heavenlyStem),
          branch: (0, elements_1.getEarthlyBranchElement)(pillar.earthlyBranch)
        };
      }
      function yinYangOf(pillar) {
        return {
          stem: (0, elements_1.getHeavenlyStemYinYang)(pillar.heavenlyStem),
          branch: (0, elements_1.getEarthlyBranchYinYang)(pillar.earthlyBranch)
        };
      }
      function calculateFourPillars(birthInfo) {
        var _a, _b;
        validateBirthInfo(birthInfo);
        const { hour, minute } = birthInfo;
        let { year, month, day } = birthInfo;
        if (birthInfo.isLunar) {
          const solar = (0, convert_1.lunarToSolar)(year, month, day, (_a = birthInfo.isLeapMonth) != null ? _a : false);
          year = solar.year;
          month = solar.month;
          day = solar.day;
        }
        const resolved = (0, true_solar_time_1.resolveInstant)(year, month, day, hour, minute, birthInfo.trueSolarTime);
        const dayBoundary = (_b = birthInfo.dayBoundary) != null ? _b : "midnight";
        const pillars = (0, pillars_1.computeFourPillars)(resolved, year, dayBoundary);
        const fourPillars = {
          year: pillars.year,
          month: pillars.month,
          day: pillars.day,
          hour: pillars.hour
        };
        const tenGods = (0, ten_gods_1.getTenGodChart)(fourPillars);
        const voidBranches = (0, void_branches_1.getVoidBranches)(pillars.day.heavenlyStem, pillars.day.earthlyBranch);
        let luckPillars;
        if (birthInfo.gender) {
          luckPillars = (0, luck_pillars_1.getLuckPillars)({
            instantUTCms: resolved.instantUTCms,
            birthYear: year,
            monthPillar: pillars.month,
            sajuYearStemIndex: constants_1.HEAVENLY_STEMS.indexOf(pillars.year.heavenlyStem),
            gender: birthInfo.gender
          });
        }
        const yearString = `${pillars.year.heavenlyStem}${pillars.year.earthlyBranch}`;
        const monthString = `${pillars.month.heavenlyStem}${pillars.month.earthlyBranch}`;
        const dayString = `${pillars.day.heavenlyStem}${pillars.day.earthlyBranch}`;
        const hourString = `${pillars.hour.heavenlyStem}${pillars.hour.earthlyBranch}`;
        const yearHanja = hanjaOf(pillars.year);
        const monthHanja = hanjaOf(pillars.month);
        const dayHanja = hanjaOf(pillars.day);
        const hourHanja = hanjaOf(pillars.hour);
        return {
          ...fourPillars,
          yearElement: elementOf(pillars.year),
          monthElement: elementOf(pillars.month),
          dayElement: elementOf(pillars.day),
          hourElement: elementOf(pillars.hour),
          yearYinYang: yinYangOf(pillars.year),
          monthYinYang: yinYangOf(pillars.month),
          dayYinYang: yinYangOf(pillars.day),
          hourYinYang: yinYangOf(pillars.hour),
          yearString,
          monthString,
          dayString,
          hourString,
          yearHanja,
          monthHanja,
          dayHanja,
          hourHanja,
          tenGods,
          voidBranches,
          luckPillars,
          toString() {
            return fourPillarsToString(fourPillars);
          },
          toObject() {
            return { year: yearString, month: monthString, day: dayString, hour: hourString };
          },
          toHanjaObject() {
            return {
              year: { korean: yearString, hanja: yearHanja },
              month: { korean: monthString, hanja: monthHanja },
              day: { korean: dayString, hanja: dayHanja },
              hour: { korean: hourString, hanja: hourHanja }
            };
          },
          toHanjaString() {
            return `${yearHanja}\u5E74\u67F1, ${monthHanja}\u6708\u67F1, ${dayHanja}\u65E5\u67F1, ${hourHanja}\u6642\u67F1`;
          }
        };
      }
      function fourPillarsToString(fourPillars) {
        const { year, month, day, hour } = fourPillars;
        (0, validation_1.assertPillar)(year, "year");
        (0, validation_1.assertPillar)(month, "month");
        (0, validation_1.assertPillar)(day, "day");
        (0, validation_1.assertPillar)(hour, "hour");
        return [
          `${year.heavenlyStem}${year.earthlyBranch}\uC5F0\uC8FC`,
          `${month.heavenlyStem}${month.earthlyBranch}\uC6D4\uC8FC`,
          `${day.heavenlyStem}${day.earthlyBranch}\uC77C\uC8FC`,
          `${hour.heavenlyStem}${hour.earthlyBranch}\uC2DC\uC8FC`
        ].join(", ");
      }
    }
  });

  // entry.js
  var M = require_dist();
  if (typeof window !== "undefined") window.Manseryeok = M;
  else if (typeof globalThis !== "undefined") globalThis.Manseryeok = M;
})();
/*! Bundled license information:

manseryeok/dist/index.js:
  (**
   * 만세력(萬歲曆) 계산 라이브러리
   * Korean Saju (Four Pillars) and Manseryeok calculation library
   *
   * @author Yoohyojun
   * @license MIT
   *)
*/
