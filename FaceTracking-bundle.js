var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined")
    return require.apply(this, arguments);
  throw new Error('Dynamic require of "' + x + '" is not supported');
});
var __commonJS = (cb, mod) => function __require2() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result)
    __defProp(target, key, result);
  return result;
};
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};

// ../../ar-provider-8thwall/node_modules/qrcode-svg/lib/qrcode.js
var require_qrcode = __commonJS({
  "../../ar-provider-8thwall/node_modules/qrcode-svg/lib/qrcode.js"(exports, module) {
    function QR8bitByte(data) {
      this.mode = QRMode.MODE_8BIT_BYTE;
      this.data = data;
      this.parsedData = [];
      for (var i2 = 0, l = this.data.length; i2 < l; i2++) {
        var byteArray = [];
        var code = this.data.charCodeAt(i2);
        if (code > 65536) {
          byteArray[0] = 240 | (code & 1835008) >>> 18;
          byteArray[1] = 128 | (code & 258048) >>> 12;
          byteArray[2] = 128 | (code & 4032) >>> 6;
          byteArray[3] = 128 | code & 63;
        } else if (code > 2048) {
          byteArray[0] = 224 | (code & 61440) >>> 12;
          byteArray[1] = 128 | (code & 4032) >>> 6;
          byteArray[2] = 128 | code & 63;
        } else if (code > 128) {
          byteArray[0] = 192 | (code & 1984) >>> 6;
          byteArray[1] = 128 | code & 63;
        } else {
          byteArray[0] = code;
        }
        this.parsedData.push(byteArray);
      }
      this.parsedData = Array.prototype.concat.apply([], this.parsedData);
      if (this.parsedData.length != this.data.length) {
        this.parsedData.unshift(191);
        this.parsedData.unshift(187);
        this.parsedData.unshift(239);
      }
    }
    QR8bitByte.prototype = {
      getLength: function(buffer) {
        return this.parsedData.length;
      },
      write: function(buffer) {
        for (var i2 = 0, l = this.parsedData.length; i2 < l; i2++) {
          buffer.put(this.parsedData[i2], 8);
        }
      }
    };
    function QRCodeModel(typeNumber, errorCorrectLevel) {
      this.typeNumber = typeNumber;
      this.errorCorrectLevel = errorCorrectLevel;
      this.modules = null;
      this.moduleCount = 0;
      this.dataCache = null;
      this.dataList = [];
    }
    QRCodeModel.prototype = { addData: function(data) {
      var newData = new QR8bitByte(data);
      this.dataList.push(newData);
      this.dataCache = null;
    }, isDark: function(row, col) {
      if (row < 0 || this.moduleCount <= row || col < 0 || this.moduleCount <= col) {
        throw new Error(row + "," + col);
      }
      return this.modules[row][col];
    }, getModuleCount: function() {
      return this.moduleCount;
    }, make: function() {
      this.makeImpl(false, this.getBestMaskPattern());
    }, makeImpl: function(test, maskPattern) {
      this.moduleCount = this.typeNumber * 4 + 17;
      this.modules = new Array(this.moduleCount);
      for (var row = 0; row < this.moduleCount; row++) {
        this.modules[row] = new Array(this.moduleCount);
        for (var col = 0; col < this.moduleCount; col++) {
          this.modules[row][col] = null;
        }
      }
      this.setupPositionProbePattern(0, 0);
      this.setupPositionProbePattern(this.moduleCount - 7, 0);
      this.setupPositionProbePattern(0, this.moduleCount - 7);
      this.setupPositionAdjustPattern();
      this.setupTimingPattern();
      this.setupTypeInfo(test, maskPattern);
      if (this.typeNumber >= 7) {
        this.setupTypeNumber(test);
      }
      if (this.dataCache == null) {
        this.dataCache = QRCodeModel.createData(this.typeNumber, this.errorCorrectLevel, this.dataList);
      }
      this.mapData(this.dataCache, maskPattern);
    }, setupPositionProbePattern: function(row, col) {
      for (var r = -1; r <= 7; r++) {
        if (row + r <= -1 || this.moduleCount <= row + r)
          continue;
        for (var c = -1; c <= 7; c++) {
          if (col + c <= -1 || this.moduleCount <= col + c)
            continue;
          if (0 <= r && r <= 6 && (c == 0 || c == 6) || 0 <= c && c <= 6 && (r == 0 || r == 6) || 2 <= r && r <= 4 && 2 <= c && c <= 4) {
            this.modules[row + r][col + c] = true;
          } else {
            this.modules[row + r][col + c] = false;
          }
        }
      }
    }, getBestMaskPattern: function() {
      var minLostPoint = 0;
      var pattern = 0;
      for (var i2 = 0; i2 < 8; i2++) {
        this.makeImpl(true, i2);
        var lostPoint = QRUtil.getLostPoint(this);
        if (i2 == 0 || minLostPoint > lostPoint) {
          minLostPoint = lostPoint;
          pattern = i2;
        }
      }
      return pattern;
    }, createMovieClip: function(target_mc, instance_name, depth) {
      var qr_mc = target_mc.createEmptyMovieClip(instance_name, depth);
      var cs = 1;
      this.make();
      for (var row = 0; row < this.modules.length; row++) {
        var y = row * cs;
        for (var col = 0; col < this.modules[row].length; col++) {
          var x = col * cs;
          var dark = this.modules[row][col];
          if (dark) {
            qr_mc.beginFill(0, 100);
            qr_mc.moveTo(x, y);
            qr_mc.lineTo(x + cs, y);
            qr_mc.lineTo(x + cs, y + cs);
            qr_mc.lineTo(x, y + cs);
            qr_mc.endFill();
          }
        }
      }
      return qr_mc;
    }, setupTimingPattern: function() {
      for (var r = 8; r < this.moduleCount - 8; r++) {
        if (this.modules[r][6] != null) {
          continue;
        }
        this.modules[r][6] = r % 2 == 0;
      }
      for (var c = 8; c < this.moduleCount - 8; c++) {
        if (this.modules[6][c] != null) {
          continue;
        }
        this.modules[6][c] = c % 2 == 0;
      }
    }, setupPositionAdjustPattern: function() {
      var pos = QRUtil.getPatternPosition(this.typeNumber);
      for (var i2 = 0; i2 < pos.length; i2++) {
        for (var j = 0; j < pos.length; j++) {
          var row = pos[i2];
          var col = pos[j];
          if (this.modules[row][col] != null) {
            continue;
          }
          for (var r = -2; r <= 2; r++) {
            for (var c = -2; c <= 2; c++) {
              if (r == -2 || r == 2 || c == -2 || c == 2 || r == 0 && c == 0) {
                this.modules[row + r][col + c] = true;
              } else {
                this.modules[row + r][col + c] = false;
              }
            }
          }
        }
      }
    }, setupTypeNumber: function(test) {
      var bits = QRUtil.getBCHTypeNumber(this.typeNumber);
      for (var i2 = 0; i2 < 18; i2++) {
        var mod = !test && (bits >> i2 & 1) == 1;
        this.modules[Math.floor(i2 / 3)][i2 % 3 + this.moduleCount - 8 - 3] = mod;
      }
      for (var i2 = 0; i2 < 18; i2++) {
        var mod = !test && (bits >> i2 & 1) == 1;
        this.modules[i2 % 3 + this.moduleCount - 8 - 3][Math.floor(i2 / 3)] = mod;
      }
    }, setupTypeInfo: function(test, maskPattern) {
      var data = this.errorCorrectLevel << 3 | maskPattern;
      var bits = QRUtil.getBCHTypeInfo(data);
      for (var i2 = 0; i2 < 15; i2++) {
        var mod = !test && (bits >> i2 & 1) == 1;
        if (i2 < 6) {
          this.modules[i2][8] = mod;
        } else if (i2 < 8) {
          this.modules[i2 + 1][8] = mod;
        } else {
          this.modules[this.moduleCount - 15 + i2][8] = mod;
        }
      }
      for (var i2 = 0; i2 < 15; i2++) {
        var mod = !test && (bits >> i2 & 1) == 1;
        if (i2 < 8) {
          this.modules[8][this.moduleCount - i2 - 1] = mod;
        } else if (i2 < 9) {
          this.modules[8][15 - i2 - 1 + 1] = mod;
        } else {
          this.modules[8][15 - i2 - 1] = mod;
        }
      }
      this.modules[this.moduleCount - 8][8] = !test;
    }, mapData: function(data, maskPattern) {
      var inc = -1;
      var row = this.moduleCount - 1;
      var bitIndex = 7;
      var byteIndex = 0;
      for (var col = this.moduleCount - 1; col > 0; col -= 2) {
        if (col == 6)
          col--;
        while (true) {
          for (var c = 0; c < 2; c++) {
            if (this.modules[row][col - c] == null) {
              var dark = false;
              if (byteIndex < data.length) {
                dark = (data[byteIndex] >>> bitIndex & 1) == 1;
              }
              var mask = QRUtil.getMask(maskPattern, row, col - c);
              if (mask) {
                dark = !dark;
              }
              this.modules[row][col - c] = dark;
              bitIndex--;
              if (bitIndex == -1) {
                byteIndex++;
                bitIndex = 7;
              }
            }
          }
          row += inc;
          if (row < 0 || this.moduleCount <= row) {
            row -= inc;
            inc = -inc;
            break;
          }
        }
      }
    } };
    QRCodeModel.PAD0 = 236;
    QRCodeModel.PAD1 = 17;
    QRCodeModel.createData = function(typeNumber, errorCorrectLevel, dataList) {
      var rsBlocks = QRRSBlock.getRSBlocks(typeNumber, errorCorrectLevel);
      var buffer = new QRBitBuffer();
      for (var i2 = 0; i2 < dataList.length; i2++) {
        var data = dataList[i2];
        buffer.put(data.mode, 4);
        buffer.put(data.getLength(), QRUtil.getLengthInBits(data.mode, typeNumber));
        data.write(buffer);
      }
      var totalDataCount = 0;
      for (var i2 = 0; i2 < rsBlocks.length; i2++) {
        totalDataCount += rsBlocks[i2].dataCount;
      }
      if (buffer.getLengthInBits() > totalDataCount * 8) {
        throw new Error("code length overflow. (" + buffer.getLengthInBits() + ">" + totalDataCount * 8 + ")");
      }
      if (buffer.getLengthInBits() + 4 <= totalDataCount * 8) {
        buffer.put(0, 4);
      }
      while (buffer.getLengthInBits() % 8 != 0) {
        buffer.putBit(false);
      }
      while (true) {
        if (buffer.getLengthInBits() >= totalDataCount * 8) {
          break;
        }
        buffer.put(QRCodeModel.PAD0, 8);
        if (buffer.getLengthInBits() >= totalDataCount * 8) {
          break;
        }
        buffer.put(QRCodeModel.PAD1, 8);
      }
      return QRCodeModel.createBytes(buffer, rsBlocks);
    };
    QRCodeModel.createBytes = function(buffer, rsBlocks) {
      var offset = 0;
      var maxDcCount = 0;
      var maxEcCount = 0;
      var dcdata = new Array(rsBlocks.length);
      var ecdata = new Array(rsBlocks.length);
      for (var r = 0; r < rsBlocks.length; r++) {
        var dcCount = rsBlocks[r].dataCount;
        var ecCount = rsBlocks[r].totalCount - dcCount;
        maxDcCount = Math.max(maxDcCount, dcCount);
        maxEcCount = Math.max(maxEcCount, ecCount);
        dcdata[r] = new Array(dcCount);
        for (var i2 = 0; i2 < dcdata[r].length; i2++) {
          dcdata[r][i2] = 255 & buffer.buffer[i2 + offset];
        }
        offset += dcCount;
        var rsPoly = QRUtil.getErrorCorrectPolynomial(ecCount);
        var rawPoly = new QRPolynomial(dcdata[r], rsPoly.getLength() - 1);
        var modPoly = rawPoly.mod(rsPoly);
        ecdata[r] = new Array(rsPoly.getLength() - 1);
        for (var i2 = 0; i2 < ecdata[r].length; i2++) {
          var modIndex = i2 + modPoly.getLength() - ecdata[r].length;
          ecdata[r][i2] = modIndex >= 0 ? modPoly.get(modIndex) : 0;
        }
      }
      var totalCodeCount = 0;
      for (var i2 = 0; i2 < rsBlocks.length; i2++) {
        totalCodeCount += rsBlocks[i2].totalCount;
      }
      var data = new Array(totalCodeCount);
      var index = 0;
      for (var i2 = 0; i2 < maxDcCount; i2++) {
        for (var r = 0; r < rsBlocks.length; r++) {
          if (i2 < dcdata[r].length) {
            data[index++] = dcdata[r][i2];
          }
        }
      }
      for (var i2 = 0; i2 < maxEcCount; i2++) {
        for (var r = 0; r < rsBlocks.length; r++) {
          if (i2 < ecdata[r].length) {
            data[index++] = ecdata[r][i2];
          }
        }
      }
      return data;
    };
    var QRMode = { MODE_NUMBER: 1 << 0, MODE_ALPHA_NUM: 1 << 1, MODE_8BIT_BYTE: 1 << 2, MODE_KANJI: 1 << 3 };
    var QRErrorCorrectLevel = { L: 1, M: 0, Q: 3, H: 2 };
    var QRMaskPattern = { PATTERN000: 0, PATTERN001: 1, PATTERN010: 2, PATTERN011: 3, PATTERN100: 4, PATTERN101: 5, PATTERN110: 6, PATTERN111: 7 };
    var QRUtil = { PATTERN_POSITION_TABLE: [[], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34], [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50], [6, 30, 54], [6, 32, 58], [6, 34, 62], [6, 26, 46, 66], [6, 26, 48, 70], [6, 26, 50, 74], [6, 30, 54, 78], [6, 30, 56, 82], [6, 30, 58, 86], [6, 34, 62, 90], [6, 28, 50, 72, 94], [6, 26, 50, 74, 98], [6, 30, 54, 78, 102], [6, 28, 54, 80, 106], [6, 32, 58, 84, 110], [6, 30, 58, 86, 114], [6, 34, 62, 90, 118], [6, 26, 50, 74, 98, 122], [6, 30, 54, 78, 102, 126], [6, 26, 52, 78, 104, 130], [6, 30, 56, 82, 108, 134], [6, 34, 60, 86, 112, 138], [6, 30, 58, 86, 114, 142], [6, 34, 62, 90, 118, 146], [6, 30, 54, 78, 102, 126, 150], [6, 24, 50, 76, 102, 128, 154], [6, 28, 54, 80, 106, 132, 158], [6, 32, 58, 84, 110, 136, 162], [6, 26, 54, 82, 110, 138, 166], [6, 30, 58, 86, 114, 142, 170]], G15: 1 << 10 | 1 << 8 | 1 << 5 | 1 << 4 | 1 << 2 | 1 << 1 | 1 << 0, G18: 1 << 12 | 1 << 11 | 1 << 10 | 1 << 9 | 1 << 8 | 1 << 5 | 1 << 2 | 1 << 0, G15_MASK: 1 << 14 | 1 << 12 | 1 << 10 | 1 << 4 | 1 << 1, getBCHTypeInfo: function(data) {
      var d = data << 10;
      while (QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G15) >= 0) {
        d ^= QRUtil.G15 << QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G15);
      }
      return (data << 10 | d) ^ QRUtil.G15_MASK;
    }, getBCHTypeNumber: function(data) {
      var d = data << 12;
      while (QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G18) >= 0) {
        d ^= QRUtil.G18 << QRUtil.getBCHDigit(d) - QRUtil.getBCHDigit(QRUtil.G18);
      }
      return data << 12 | d;
    }, getBCHDigit: function(data) {
      var digit = 0;
      while (data != 0) {
        digit++;
        data >>>= 1;
      }
      return digit;
    }, getPatternPosition: function(typeNumber) {
      return QRUtil.PATTERN_POSITION_TABLE[typeNumber - 1];
    }, getMask: function(maskPattern, i2, j) {
      switch (maskPattern) {
        case QRMaskPattern.PATTERN000:
          return (i2 + j) % 2 == 0;
        case QRMaskPattern.PATTERN001:
          return i2 % 2 == 0;
        case QRMaskPattern.PATTERN010:
          return j % 3 == 0;
        case QRMaskPattern.PATTERN011:
          return (i2 + j) % 3 == 0;
        case QRMaskPattern.PATTERN100:
          return (Math.floor(i2 / 2) + Math.floor(j / 3)) % 2 == 0;
        case QRMaskPattern.PATTERN101:
          return i2 * j % 2 + i2 * j % 3 == 0;
        case QRMaskPattern.PATTERN110:
          return (i2 * j % 2 + i2 * j % 3) % 2 == 0;
        case QRMaskPattern.PATTERN111:
          return (i2 * j % 3 + (i2 + j) % 2) % 2 == 0;
        default:
          throw new Error("bad maskPattern:" + maskPattern);
      }
    }, getErrorCorrectPolynomial: function(errorCorrectLength) {
      var a = new QRPolynomial([1], 0);
      for (var i2 = 0; i2 < errorCorrectLength; i2++) {
        a = a.multiply(new QRPolynomial([1, QRMath.gexp(i2)], 0));
      }
      return a;
    }, getLengthInBits: function(mode, type) {
      if (1 <= type && type < 10) {
        switch (mode) {
          case QRMode.MODE_NUMBER:
            return 10;
          case QRMode.MODE_ALPHA_NUM:
            return 9;
          case QRMode.MODE_8BIT_BYTE:
            return 8;
          case QRMode.MODE_KANJI:
            return 8;
          default:
            throw new Error("mode:" + mode);
        }
      } else if (type < 27) {
        switch (mode) {
          case QRMode.MODE_NUMBER:
            return 12;
          case QRMode.MODE_ALPHA_NUM:
            return 11;
          case QRMode.MODE_8BIT_BYTE:
            return 16;
          case QRMode.MODE_KANJI:
            return 10;
          default:
            throw new Error("mode:" + mode);
        }
      } else if (type < 41) {
        switch (mode) {
          case QRMode.MODE_NUMBER:
            return 14;
          case QRMode.MODE_ALPHA_NUM:
            return 13;
          case QRMode.MODE_8BIT_BYTE:
            return 16;
          case QRMode.MODE_KANJI:
            return 12;
          default:
            throw new Error("mode:" + mode);
        }
      } else {
        throw new Error("type:" + type);
      }
    }, getLostPoint: function(qrCode) {
      var moduleCount = qrCode.getModuleCount();
      var lostPoint = 0;
      for (var row = 0; row < moduleCount; row++) {
        for (var col = 0; col < moduleCount; col++) {
          var sameCount = 0;
          var dark = qrCode.isDark(row, col);
          for (var r = -1; r <= 1; r++) {
            if (row + r < 0 || moduleCount <= row + r) {
              continue;
            }
            for (var c = -1; c <= 1; c++) {
              if (col + c < 0 || moduleCount <= col + c) {
                continue;
              }
              if (r == 0 && c == 0) {
                continue;
              }
              if (dark == qrCode.isDark(row + r, col + c)) {
                sameCount++;
              }
            }
          }
          if (sameCount > 5) {
            lostPoint += 3 + sameCount - 5;
          }
        }
      }
      for (var row = 0; row < moduleCount - 1; row++) {
        for (var col = 0; col < moduleCount - 1; col++) {
          var count = 0;
          if (qrCode.isDark(row, col))
            count++;
          if (qrCode.isDark(row + 1, col))
            count++;
          if (qrCode.isDark(row, col + 1))
            count++;
          if (qrCode.isDark(row + 1, col + 1))
            count++;
          if (count == 0 || count == 4) {
            lostPoint += 3;
          }
        }
      }
      for (var row = 0; row < moduleCount; row++) {
        for (var col = 0; col < moduleCount - 6; col++) {
          if (qrCode.isDark(row, col) && !qrCode.isDark(row, col + 1) && qrCode.isDark(row, col + 2) && qrCode.isDark(row, col + 3) && qrCode.isDark(row, col + 4) && !qrCode.isDark(row, col + 5) && qrCode.isDark(row, col + 6)) {
            lostPoint += 40;
          }
        }
      }
      for (var col = 0; col < moduleCount; col++) {
        for (var row = 0; row < moduleCount - 6; row++) {
          if (qrCode.isDark(row, col) && !qrCode.isDark(row + 1, col) && qrCode.isDark(row + 2, col) && qrCode.isDark(row + 3, col) && qrCode.isDark(row + 4, col) && !qrCode.isDark(row + 5, col) && qrCode.isDark(row + 6, col)) {
            lostPoint += 40;
          }
        }
      }
      var darkCount = 0;
      for (var col = 0; col < moduleCount; col++) {
        for (var row = 0; row < moduleCount; row++) {
          if (qrCode.isDark(row, col)) {
            darkCount++;
          }
        }
      }
      var ratio = Math.abs(100 * darkCount / moduleCount / moduleCount - 50) / 5;
      lostPoint += ratio * 10;
      return lostPoint;
    } };
    var QRMath = { glog: function(n) {
      if (n < 1) {
        throw new Error("glog(" + n + ")");
      }
      return QRMath.LOG_TABLE[n];
    }, gexp: function(n) {
      while (n < 0) {
        n += 255;
      }
      while (n >= 256) {
        n -= 255;
      }
      return QRMath.EXP_TABLE[n];
    }, EXP_TABLE: new Array(256), LOG_TABLE: new Array(256) };
    for (i = 0; i < 8; i++) {
      QRMath.EXP_TABLE[i] = 1 << i;
    }
    var i;
    for (i = 8; i < 256; i++) {
      QRMath.EXP_TABLE[i] = QRMath.EXP_TABLE[i - 4] ^ QRMath.EXP_TABLE[i - 5] ^ QRMath.EXP_TABLE[i - 6] ^ QRMath.EXP_TABLE[i - 8];
    }
    var i;
    for (i = 0; i < 255; i++) {
      QRMath.LOG_TABLE[QRMath.EXP_TABLE[i]] = i;
    }
    var i;
    function QRPolynomial(num, shift) {
      if (num.length == void 0) {
        throw new Error(num.length + "/" + shift);
      }
      var offset = 0;
      while (offset < num.length && num[offset] == 0) {
        offset++;
      }
      this.num = new Array(num.length - offset + shift);
      for (var i2 = 0; i2 < num.length - offset; i2++) {
        this.num[i2] = num[i2 + offset];
      }
    }
    QRPolynomial.prototype = { get: function(index) {
      return this.num[index];
    }, getLength: function() {
      return this.num.length;
    }, multiply: function(e) {
      var num = new Array(this.getLength() + e.getLength() - 1);
      for (var i2 = 0; i2 < this.getLength(); i2++) {
        for (var j = 0; j < e.getLength(); j++) {
          num[i2 + j] ^= QRMath.gexp(QRMath.glog(this.get(i2)) + QRMath.glog(e.get(j)));
        }
      }
      return new QRPolynomial(num, 0);
    }, mod: function(e) {
      if (this.getLength() - e.getLength() < 0) {
        return this;
      }
      var ratio = QRMath.glog(this.get(0)) - QRMath.glog(e.get(0));
      var num = new Array(this.getLength());
      for (var i2 = 0; i2 < this.getLength(); i2++) {
        num[i2] = this.get(i2);
      }
      for (var i2 = 0; i2 < e.getLength(); i2++) {
        num[i2] ^= QRMath.gexp(QRMath.glog(e.get(i2)) + ratio);
      }
      return new QRPolynomial(num, 0).mod(e);
    } };
    function QRRSBlock(totalCount, dataCount) {
      this.totalCount = totalCount;
      this.dataCount = dataCount;
    }
    QRRSBlock.RS_BLOCK_TABLE = [[1, 26, 19], [1, 26, 16], [1, 26, 13], [1, 26, 9], [1, 44, 34], [1, 44, 28], [1, 44, 22], [1, 44, 16], [1, 70, 55], [1, 70, 44], [2, 35, 17], [2, 35, 13], [1, 100, 80], [2, 50, 32], [2, 50, 24], [4, 25, 9], [1, 134, 108], [2, 67, 43], [2, 33, 15, 2, 34, 16], [2, 33, 11, 2, 34, 12], [2, 86, 68], [4, 43, 27], [4, 43, 19], [4, 43, 15], [2, 98, 78], [4, 49, 31], [2, 32, 14, 4, 33, 15], [4, 39, 13, 1, 40, 14], [2, 121, 97], [2, 60, 38, 2, 61, 39], [4, 40, 18, 2, 41, 19], [4, 40, 14, 2, 41, 15], [2, 146, 116], [3, 58, 36, 2, 59, 37], [4, 36, 16, 4, 37, 17], [4, 36, 12, 4, 37, 13], [2, 86, 68, 2, 87, 69], [4, 69, 43, 1, 70, 44], [6, 43, 19, 2, 44, 20], [6, 43, 15, 2, 44, 16], [4, 101, 81], [1, 80, 50, 4, 81, 51], [4, 50, 22, 4, 51, 23], [3, 36, 12, 8, 37, 13], [2, 116, 92, 2, 117, 93], [6, 58, 36, 2, 59, 37], [4, 46, 20, 6, 47, 21], [7, 42, 14, 4, 43, 15], [4, 133, 107], [8, 59, 37, 1, 60, 38], [8, 44, 20, 4, 45, 21], [12, 33, 11, 4, 34, 12], [3, 145, 115, 1, 146, 116], [4, 64, 40, 5, 65, 41], [11, 36, 16, 5, 37, 17], [11, 36, 12, 5, 37, 13], [5, 109, 87, 1, 110, 88], [5, 65, 41, 5, 66, 42], [5, 54, 24, 7, 55, 25], [11, 36, 12], [5, 122, 98, 1, 123, 99], [7, 73, 45, 3, 74, 46], [15, 43, 19, 2, 44, 20], [3, 45, 15, 13, 46, 16], [1, 135, 107, 5, 136, 108], [10, 74, 46, 1, 75, 47], [1, 50, 22, 15, 51, 23], [2, 42, 14, 17, 43, 15], [5, 150, 120, 1, 151, 121], [9, 69, 43, 4, 70, 44], [17, 50, 22, 1, 51, 23], [2, 42, 14, 19, 43, 15], [3, 141, 113, 4, 142, 114], [3, 70, 44, 11, 71, 45], [17, 47, 21, 4, 48, 22], [9, 39, 13, 16, 40, 14], [3, 135, 107, 5, 136, 108], [3, 67, 41, 13, 68, 42], [15, 54, 24, 5, 55, 25], [15, 43, 15, 10, 44, 16], [4, 144, 116, 4, 145, 117], [17, 68, 42], [17, 50, 22, 6, 51, 23], [19, 46, 16, 6, 47, 17], [2, 139, 111, 7, 140, 112], [17, 74, 46], [7, 54, 24, 16, 55, 25], [34, 37, 13], [4, 151, 121, 5, 152, 122], [4, 75, 47, 14, 76, 48], [11, 54, 24, 14, 55, 25], [16, 45, 15, 14, 46, 16], [6, 147, 117, 4, 148, 118], [6, 73, 45, 14, 74, 46], [11, 54, 24, 16, 55, 25], [30, 46, 16, 2, 47, 17], [8, 132, 106, 4, 133, 107], [8, 75, 47, 13, 76, 48], [7, 54, 24, 22, 55, 25], [22, 45, 15, 13, 46, 16], [10, 142, 114, 2, 143, 115], [19, 74, 46, 4, 75, 47], [28, 50, 22, 6, 51, 23], [33, 46, 16, 4, 47, 17], [8, 152, 122, 4, 153, 123], [22, 73, 45, 3, 74, 46], [8, 53, 23, 26, 54, 24], [12, 45, 15, 28, 46, 16], [3, 147, 117, 10, 148, 118], [3, 73, 45, 23, 74, 46], [4, 54, 24, 31, 55, 25], [11, 45, 15, 31, 46, 16], [7, 146, 116, 7, 147, 117], [21, 73, 45, 7, 74, 46], [1, 53, 23, 37, 54, 24], [19, 45, 15, 26, 46, 16], [5, 145, 115, 10, 146, 116], [19, 75, 47, 10, 76, 48], [15, 54, 24, 25, 55, 25], [23, 45, 15, 25, 46, 16], [13, 145, 115, 3, 146, 116], [2, 74, 46, 29, 75, 47], [42, 54, 24, 1, 55, 25], [23, 45, 15, 28, 46, 16], [17, 145, 115], [10, 74, 46, 23, 75, 47], [10, 54, 24, 35, 55, 25], [19, 45, 15, 35, 46, 16], [17, 145, 115, 1, 146, 116], [14, 74, 46, 21, 75, 47], [29, 54, 24, 19, 55, 25], [11, 45, 15, 46, 46, 16], [13, 145, 115, 6, 146, 116], [14, 74, 46, 23, 75, 47], [44, 54, 24, 7, 55, 25], [59, 46, 16, 1, 47, 17], [12, 151, 121, 7, 152, 122], [12, 75, 47, 26, 76, 48], [39, 54, 24, 14, 55, 25], [22, 45, 15, 41, 46, 16], [6, 151, 121, 14, 152, 122], [6, 75, 47, 34, 76, 48], [46, 54, 24, 10, 55, 25], [2, 45, 15, 64, 46, 16], [17, 152, 122, 4, 153, 123], [29, 74, 46, 14, 75, 47], [49, 54, 24, 10, 55, 25], [24, 45, 15, 46, 46, 16], [4, 152, 122, 18, 153, 123], [13, 74, 46, 32, 75, 47], [48, 54, 24, 14, 55, 25], [42, 45, 15, 32, 46, 16], [20, 147, 117, 4, 148, 118], [40, 75, 47, 7, 76, 48], [43, 54, 24, 22, 55, 25], [10, 45, 15, 67, 46, 16], [19, 148, 118, 6, 149, 119], [18, 75, 47, 31, 76, 48], [34, 54, 24, 34, 55, 25], [20, 45, 15, 61, 46, 16]];
    QRRSBlock.getRSBlocks = function(typeNumber, errorCorrectLevel) {
      var rsBlock = QRRSBlock.getRsBlockTable(typeNumber, errorCorrectLevel);
      if (rsBlock == void 0) {
        throw new Error("bad rs block @ typeNumber:" + typeNumber + "/errorCorrectLevel:" + errorCorrectLevel);
      }
      var length = rsBlock.length / 3;
      var list = [];
      for (var i2 = 0; i2 < length; i2++) {
        var count = rsBlock[i2 * 3 + 0];
        var totalCount = rsBlock[i2 * 3 + 1];
        var dataCount = rsBlock[i2 * 3 + 2];
        for (var j = 0; j < count; j++) {
          list.push(new QRRSBlock(totalCount, dataCount));
        }
      }
      return list;
    };
    QRRSBlock.getRsBlockTable = function(typeNumber, errorCorrectLevel) {
      switch (errorCorrectLevel) {
        case QRErrorCorrectLevel.L:
          return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 0];
        case QRErrorCorrectLevel.M:
          return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 1];
        case QRErrorCorrectLevel.Q:
          return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 2];
        case QRErrorCorrectLevel.H:
          return QRRSBlock.RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 3];
        default:
          return void 0;
      }
    };
    function QRBitBuffer() {
      this.buffer = [];
      this.length = 0;
    }
    QRBitBuffer.prototype = { get: function(index) {
      var bufIndex = Math.floor(index / 8);
      return (this.buffer[bufIndex] >>> 7 - index % 8 & 1) == 1;
    }, put: function(num, length) {
      for (var i2 = 0; i2 < length; i2++) {
        this.putBit((num >>> length - i2 - 1 & 1) == 1);
      }
    }, getLengthInBits: function() {
      return this.length;
    }, putBit: function(bit) {
      var bufIndex = Math.floor(this.length / 8);
      if (this.buffer.length <= bufIndex) {
        this.buffer.push(0);
      }
      if (bit) {
        this.buffer[bufIndex] |= 128 >>> this.length % 8;
      }
      this.length++;
    } };
    var QRCodeLimitLength = [[17, 14, 11, 7], [32, 26, 20, 14], [53, 42, 32, 24], [78, 62, 46, 34], [106, 84, 60, 44], [134, 106, 74, 58], [154, 122, 86, 64], [192, 152, 108, 84], [230, 180, 130, 98], [271, 213, 151, 119], [321, 251, 177, 137], [367, 287, 203, 155], [425, 331, 241, 177], [458, 362, 258, 194], [520, 412, 292, 220], [586, 450, 322, 250], [644, 504, 364, 280], [718, 560, 394, 310], [792, 624, 442, 338], [858, 666, 482, 382], [929, 711, 509, 403], [1003, 779, 565, 439], [1091, 857, 611, 461], [1171, 911, 661, 511], [1273, 997, 715, 535], [1367, 1059, 751, 593], [1465, 1125, 805, 625], [1528, 1190, 868, 658], [1628, 1264, 908, 698], [1732, 1370, 982, 742], [1840, 1452, 1030, 790], [1952, 1538, 1112, 842], [2068, 1628, 1168, 898], [2188, 1722, 1228, 958], [2303, 1809, 1283, 983], [2431, 1911, 1351, 1051], [2563, 1989, 1423, 1093], [2699, 2099, 1499, 1139], [2809, 2213, 1579, 1219], [2953, 2331, 1663, 1273]];
    function QRCode2(options) {
      var instance = this;
      this.options = {
        padding: 4,
        width: 256,
        height: 256,
        typeNumber: 4,
        color: "#000000",
        background: "#ffffff",
        ecl: "M"
      };
      if (typeof options === "string") {
        options = {
          content: options
        };
      }
      if (options) {
        for (var i2 in options) {
          this.options[i2] = options[i2];
        }
      }
      if (typeof this.options.content !== "string") {
        throw new Error("Expected 'content' as string!");
      }
      if (this.options.content.length === 0) {
        throw new Error("Expected 'content' to be non-empty!");
      }
      if (!(this.options.padding >= 0)) {
        throw new Error("Expected 'padding' value to be non-negative!");
      }
      if (!(this.options.width > 0) || !(this.options.height > 0)) {
        throw new Error("Expected 'width' or 'height' value to be higher than zero!");
      }
      function _getErrorCorrectLevel(ecl2) {
        switch (ecl2) {
          case "L":
            return QRErrorCorrectLevel.L;
          case "M":
            return QRErrorCorrectLevel.M;
          case "Q":
            return QRErrorCorrectLevel.Q;
          case "H":
            return QRErrorCorrectLevel.H;
          default:
            throw new Error("Unknwon error correction level: " + ecl2);
        }
      }
      function _getTypeNumber(content2, ecl2) {
        var length = _getUTF8Length(content2);
        var type2 = 1;
        var limit = 0;
        for (var i3 = 0, len = QRCodeLimitLength.length; i3 <= len; i3++) {
          var table = QRCodeLimitLength[i3];
          if (!table) {
            throw new Error("Content too long: expected " + limit + " but got " + length);
          }
          switch (ecl2) {
            case "L":
              limit = table[0];
              break;
            case "M":
              limit = table[1];
              break;
            case "Q":
              limit = table[2];
              break;
            case "H":
              limit = table[3];
              break;
            default:
              throw new Error("Unknwon error correction level: " + ecl2);
          }
          if (length <= limit) {
            break;
          }
          type2++;
        }
        if (type2 > QRCodeLimitLength.length) {
          throw new Error("Content too long");
        }
        return type2;
      }
      function _getUTF8Length(content2) {
        var result = encodeURI(content2).toString().replace(/\%[0-9a-fA-F]{2}/g, "a");
        return result.length + (result.length != content2 ? 3 : 0);
      }
      var content = this.options.content;
      var type = _getTypeNumber(content, this.options.ecl);
      var ecl = _getErrorCorrectLevel(this.options.ecl);
      this.qrcode = new QRCodeModel(type, ecl);
      this.qrcode.addData(content);
      this.qrcode.make();
    }
    QRCode2.prototype.svg = function(opt) {
      var options = this.options || {};
      var modules = this.qrcode.modules;
      if (typeof opt == "undefined") {
        opt = { container: options.container || "svg" };
      }
      var pretty = typeof options.pretty != "undefined" ? !!options.pretty : true;
      var indent = pretty ? "  " : "";
      var EOL = pretty ? "\r\n" : "";
      var width = options.width;
      var height = options.height;
      var length = modules.length;
      var xsize = width / (length + 2 * options.padding);
      var ysize = height / (length + 2 * options.padding);
      var join = typeof options.join != "undefined" ? !!options.join : false;
      var swap = typeof options.swap != "undefined" ? !!options.swap : false;
      var xmlDeclaration = typeof options.xmlDeclaration != "undefined" ? !!options.xmlDeclaration : true;
      var predefined = typeof options.predefined != "undefined" ? !!options.predefined : false;
      var defs = predefined ? indent + '<defs><path id="qrmodule" d="M0 0 h' + ysize + " v" + xsize + ' H0 z" style="fill:' + options.color + ';shape-rendering:crispEdges;" /></defs>' + EOL : "";
      var bgrect = indent + '<rect x="0" y="0" width="' + width + '" height="' + height + '" style="fill:' + options.background + ';shape-rendering:crispEdges;"/>' + EOL;
      var modrect = "";
      var pathdata = "";
      for (var y = 0; y < length; y++) {
        for (var x = 0; x < length; x++) {
          var module2 = modules[x][y];
          if (module2) {
            var px = x * xsize + options.padding * xsize;
            var py = y * ysize + options.padding * ysize;
            if (swap) {
              var t = px;
              px = py;
              py = t;
            }
            if (join) {
              var w = xsize + px;
              var h = ysize + py;
              px = Number.isInteger(px) ? Number(px) : px.toFixed(2);
              py = Number.isInteger(py) ? Number(py) : py.toFixed(2);
              w = Number.isInteger(w) ? Number(w) : w.toFixed(2);
              h = Number.isInteger(h) ? Number(h) : h.toFixed(2);
              pathdata += "M" + px + "," + py + " V" + h + " H" + w + " V" + py + " H" + px + " Z ";
            } else if (predefined) {
              modrect += indent + '<use x="' + px.toString() + '" y="' + py.toString() + '" href="#qrmodule" />' + EOL;
            } else {
              modrect += indent + '<rect x="' + px.toString() + '" y="' + py.toString() + '" width="' + xsize + '" height="' + ysize + '" style="fill:' + options.color + ';shape-rendering:crispEdges;"/>' + EOL;
            }
          }
        }
      }
      if (join) {
        modrect = indent + '<path x="0" y="0" style="fill:' + options.color + ';shape-rendering:crispEdges;" d="' + pathdata + '" />';
      }
      var svg = "";
      switch (opt.container) {
        case "svg":
          if (xmlDeclaration) {
            svg += '<?xml version="1.0" standalone="yes"?>' + EOL;
          }
          svg += '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="' + width + '" height="' + height + '">' + EOL;
          svg += defs + bgrect + modrect;
          svg += "</svg>";
          break;
        case "svg-viewbox":
          if (xmlDeclaration) {
            svg += '<?xml version="1.0" standalone="yes"?>' + EOL;
          }
          svg += '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 ' + width + " " + height + '">' + EOL;
          svg += defs + bgrect + modrect;
          svg += "</svg>";
          break;
        case "g":
          svg += '<g width="' + width + '" height="' + height + '">' + EOL;
          svg += defs + bgrect + modrect;
          svg += "</g>";
          break;
        default:
          svg += (defs + bgrect + modrect).replace(/^\s+/, "");
          break;
      }
      return svg;
    };
    QRCode2.prototype.save = function(file, callback) {
      var data = this.svg();
      if (typeof callback != "function") {
        callback = function(error, result) {
        };
      }
      try {
        var fs = __require("fs");
        fs.writeFile(file, data, callback);
      } catch (e) {
        callback(e);
      }
    };
    if (typeof module != "undefined") {
      module.exports = QRCode2;
    }
  }
});

// ../../ar-tracking/node_modules/@wonderlandengine/api/dist/property.js
var Type;
(function(Type4) {
  Type4[Type4["Native"] = 1] = "Native";
  Type4[Type4["Bool"] = 2] = "Bool";
  Type4[Type4["Int"] = 4] = "Int";
  Type4[Type4["Float"] = 8] = "Float";
  Type4[Type4["String"] = 16] = "String";
  Type4[Type4["Enum"] = 32] = "Enum";
  Type4[Type4["Object"] = 64] = "Object";
  Type4[Type4["Mesh"] = 128] = "Mesh";
  Type4[Type4["Texture"] = 256] = "Texture";
  Type4[Type4["Material"] = 512] = "Material";
  Type4[Type4["Animation"] = 1024] = "Animation";
  Type4[Type4["Skin"] = 2048] = "Skin";
  Type4[Type4["Color"] = 4096] = "Color";
})(Type || (Type = {}));
var Property = {
  /**
   * Create an boolean property.
   *
   * @param defaultValue The default value. If not provided, defaults to `false`.
   */
  bool(defaultValue = false) {
    return { type: Type.Bool, default: defaultValue };
  },
  /**
   * Create an integer property.
   *
   * @param defaultValue The default value. If not provided, defaults to `0`.
   */
  int(defaultValue = 0) {
    return { type: Type.Int, default: defaultValue };
  },
  /**
   * Create an float property.
   *
   * @param defaultValue The default value. If not provided, defaults to `0.0`.
   */
  float(defaultValue = 0) {
    return { type: Type.Float, default: defaultValue };
  },
  /**
   * Create an string property.
   *
   * @param defaultValue The default value. If not provided, defaults to `''`.
   */
  string(defaultValue = "") {
    return { type: Type.String, default: defaultValue };
  },
  /**
   * Create an enumeration property.
   *
   * @param values The list of values.
   * @param defaultValue The default value. Can be a string or an index into
   *     `values`. If not provided, defaults to the first element.
   */
  enum(values, defaultValue) {
    return { type: Type.Enum, values, default: defaultValue };
  },
  /** Create an {@link Object3D} reference property. */
  object() {
    return { type: Type.Object, default: null };
  },
  /** Create a {@link Mesh} reference property. */
  mesh() {
    return { type: Type.Mesh, default: null };
  },
  /** Create a {@link Texture} reference property. */
  texture() {
    return { type: Type.Texture, default: null };
  },
  /** Create a {@link Material} reference property. */
  material() {
    return { type: Type.Material, default: null };
  },
  /** Create an {@link Animation} reference property. */
  animation() {
    return { type: Type.Animation, default: null };
  },
  /** Create a {@link Skin} reference property. */
  skin() {
    return { type: Type.Skin, default: null };
  },
  /**
   * Create a color property.
   *
   * @param r The red component, in the range [0; 1].
   * @param g The green component, in the range [0; 1].
   * @param b The blue component, in the range [0; 1].
   * @param a The alpha component, in the range [0; 1].
   */
  color(r = 0, g = 0, b = 0, a = 1) {
    return { type: Type.Color, default: [r, g, b, a] };
  }
};

// ../../ar-tracking/node_modules/@wonderlandengine/api/dist/decorators.js
function propertyDecorator(data) {
  return function(target, propertyKey) {
    const ctor = target.constructor;
    ctor.Properties = ctor.Properties ?? {};
    ctor.Properties[propertyKey] = data;
  };
}
function enumerable() {
  return function(_, __, descriptor) {
    descriptor.enumerable = true;
  };
}
function nativeProperty() {
  return function(target, propertyKey, descriptor) {
    enumerable()(target, propertyKey, descriptor);
    propertyDecorator({ type: Type.Native })(target, propertyKey);
  };
}
var property = {};
for (const name in Property) {
  property[name] = (...args) => {
    const functor = Property[name];
    return propertyDecorator(functor(...args));
  };
}

// ../../ar-tracking/node_modules/@wonderlandengine/api/dist/utils/object.js
function isNumber(value) {
  if (value === null || value === void 0)
    return false;
  return typeof value === "number" || value.constructor === Number;
}

// ../../ar-tracking/node_modules/@wonderlandengine/api/dist/utils/event.js
var Emitter = class {
  /**
   * List of listeners to trigger when `notify` is called.
   *
   * @hidden
   */
  _listeners = [];
  /**
   * Register a new listener to be triggered on {@link Emitter.notify}.
   *
   * Basic usage:
   *
   * ```js
   * emitter.add((data) => {
   *     console.log('event received!');
   *     console.log(data);
   * });
   * ```
   *
   * Automatically remove the listener when an event is received:
   *
   * ```js
   * emitter.add((data) => {
   *     console.log('event received!');
   *     console.log(data);
   * }, {once: true});
   * ```
   *
   * @param listener The callback to register.
   * @param opts The listener options. For more information, please have a look
   *     at the {@link ListenerOptions} interface.
   *
   * @returns Reference to self (for method chaining)
   */
  add(listener, opts = {}) {
    const { once = false, id = void 0 } = opts;
    this._listeners.push({ id, once, callback: listener });
    return this;
  }
  /**
   * Equivalent to {@link Emitter.add}.
   *
   * @param listeners The callback(s) to register.
   * @returns Reference to self (for method chaining).
   *
   * @deprecated Please use {@link Emitter.add} instead.
   */
  push(...listeners) {
    for (const cb of listeners)
      this.add(cb);
    return this;
  }
  /**
   * Register a new listener to be triggered on {@link Emitter.notify}.
   *
   * Once notified, the listener will be automatically removed.
   *
   * The method is equivalent to calling {@link Emitter.add} with:
   *
   * ```js
   * emitter.add(listener, {once: true});
   * ```
   *
   * @param listener The callback to register.
   *
   * @returns Reference to self (for method chaining).
   */
  once(listener) {
    return this.add(listener, { once: true });
  }
  /**
   * Remove a registered listener.
   *
   * Usage with a callback:
   *
   * ```js
   * const listener = (data) => console.log(data);
   * emitter.add(listener);
   *
   * // Remove using the callback reference:
   * emitter.remove(listener);
   * ```
   *
   * Usage with an id:
   *
   * ```js
   * emitter.add((data) => console.log(data), {id: 'my-callback'});
   *
   * // Remove using the id:
   * emitter.remove('my-callback');
   * ```
   *
   * Using identifiers, you will need to ensure your value is unique to avoid
   * removing listeners from other libraries, e.g.,:
   *
   * ```js
   * emitter.add((data) => console.log(data), {id: 'non-unique'});
   * // This second listener could be added by a third-party library.
   * emitter.add((data) => console.log('Hello From Library!'), {id: 'non-unique'});
   *
   * // Ho Snap! This also removed the library listener!
   * emitter.remove('non-unique');
   * ```
   *
   * The identifier can be any type. However, remember that the comparison will be
   * by-value for primitive types (string, number), but by reference for objects.
   *
   * Example:
   *
   * ```js
   * emitter.add(() => console.log('Hello'), {id: {value: 42}});
   * emitter.add(() => console.log('World!'), {id: {value: 42}});
   * emitter.remove({value: 42}); // None of the above listeners match!
   * emitter.notify(); // Prints 'Hello' and 'World!'.
   * ```
   *
   * Here, both emitters have id `{value: 42}`, but the comparison is made by reference. Thus,
   * the `remove()` call has no effect. We can make it work by doing:
   *
   * ```js
   * const id = {value: 42};
   * emitter.add(() => console.log('Hello'), {id});
   * emitter.add(() => console.log('World!'), {id});
   * emitter.remove(id); // Same reference, it works!
   * emitter.notify(); // Doesn't print.
   * ```
   *
   * @param listener The registered callback or a value representing the `id`.
   *
   * @returns Reference to self (for method chaining)
   */
  remove(listener) {
    const listeners = this._listeners;
    for (let i = 0; i < listeners.length; ++i) {
      const target = listeners[i];
      if (target.callback === listener || target.id === listener) {
        listeners.splice(i--, 1);
      }
    }
    return this;
  }
  /**
   * Check whether the listener is registered.
   *
   * @note This method performs a linear search.
   *
   * @param listener The registered callback or a value representing the `id`.
   * @returns `true` if the handle is found, `false` otherwise.
   */
  has(listener) {
    const listeners = this._listeners;
    for (let i = 0; i < listeners.length; ++i) {
      const target = listeners[i];
      if (target.callback === listener || target.id === listener)
        return true;
    }
    return false;
  }
  /**
   * Notify listeners with the given data object.
   *
   * @note This method ensures all listeners are called even if
   * an exception is thrown. For (possibly) faster notification,
   * please use {@link Emitter.notifyUnsafe}.
   *
   * @param data The data to pass to listener when invoked.
   */
  notify(...data) {
    const listeners = this._listeners;
    for (let i = 0; i < listeners.length; ++i) {
      const listener = listeners[i];
      if (listener.once)
        listeners.splice(i--, 1);
      try {
        listener.callback(...data);
      } catch (e) {
        console.error(e);
      }
    }
  }
  /**
   * Notify listeners with the given data object.
   *
   * @note Because this method doesn't catch exceptions, some listeners
   * will be skipped on a throw. Please use {@link Emitter.notify} for safe
   * notification.
   *
   * @param data The data to pass to listener when invoked.
   */
  notifyUnsafe(...data) {
    const listeners = this._listeners;
    for (let i = 0; i < listeners.length; ++i) {
      const listener = listeners[i];
      if (listener.once)
        listeners.splice(i--, 1);
      listener.callback(...data);
    }
  }
  /**
   * Return a promise that will resolve on the next event.
   *
   * @note The promise might never resolve if no event is sent.
   *
   * @returns A promise that resolves with the data passed to
   *     {@link Emitter.notify}.
   */
  promise() {
    return new Promise((res, _) => {
      this.once((...args) => {
        if (args.length > 1) {
          res(args);
        } else {
          res(args[0]);
        }
      });
    });
  }
  /** Number of listeners. */
  get listenerCount() {
    return this._listeners.length;
  }
  /** `true` if it has no listeners, `false` otherwise. */
  get isEmpty() {
    return this.listenerCount === 0;
  }
};
var RetainEmitterUndefined = {};
var RetainEmitter = class extends Emitter {
  /** Pre-resolved data. @hidden */
  _event = RetainEmitterUndefined;
  /**
   * Emitter target used to reset the state of this emitter.
   *
   * @hidden
   */
  _reset;
  /** @override */
  add(listener, opts) {
    const immediate = opts?.immediate ?? true;
    if (this._event !== RetainEmitterUndefined && immediate) {
      listener(...this._event);
    }
    super.add(listener, opts);
    return this;
  }
  /**
   * @override
   *
   * @param listener The callback to register.
   * @param immediate If `true`, directly resolves if the emitter retains a value.
   *
   * @returns Reference to self (for method chaining).
   */
  once(listener, immediate) {
    return this.add(listener, { once: true, immediate });
  }
  /** @override */
  notify(...data) {
    this._event = data;
    super.notify(...data);
  }
  /** @override */
  notifyUnsafe(...data) {
    this._event = data;
    super.notifyUnsafe(...data);
  }
  /**
   * Reset the state of the emitter.
   *
   * Further call to {@link Emitter.add} will not automatically resolve,
   * until a new call to {@link Emitter.notify} is performed.
   *
   * @returns Reference to self (for method chaining)
   */
  reset() {
    this._event = RetainEmitterUndefined;
    return this;
  }
  /** Returns the retained data, or `undefined` if no data was retained. */
  get data() {
    return this.isDataRetained ? this._event : void 0;
  }
  /** `true` if data is retained from the last event, `false` otherwise. */
  get isDataRetained() {
    return this._event !== RetainEmitterUndefined;
  }
};

// ../../ar-tracking/node_modules/@wonderlandengine/api/dist/wonderland.js
var __decorate = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
    r = Reflect.decorate(decorators, target, key, desc);
  else
    for (var i = decorators.length - 1; i >= 0; i--)
      if (d = decorators[i])
        r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var Collider;
(function(Collider4) {
  Collider4[Collider4["Sphere"] = 0] = "Sphere";
  Collider4[Collider4["AxisAlignedBox"] = 1] = "AxisAlignedBox";
  Collider4[Collider4["Box"] = 2] = "Box";
})(Collider || (Collider = {}));
var Alignment;
(function(Alignment4) {
  Alignment4[Alignment4["Left"] = 0] = "Left";
  Alignment4[Alignment4["Center"] = 1] = "Center";
  Alignment4[Alignment4["Right"] = 2] = "Right";
})(Alignment || (Alignment = {}));
var Justification;
(function(Justification4) {
  Justification4[Justification4["Line"] = 0] = "Line";
  Justification4[Justification4["Middle"] = 1] = "Middle";
  Justification4[Justification4["Top"] = 2] = "Top";
  Justification4[Justification4["Bottom"] = 3] = "Bottom";
})(Justification || (Justification = {}));
var TextEffect;
(function(TextEffect4) {
  TextEffect4[TextEffect4["None"] = 0] = "None";
  TextEffect4[TextEffect4["Outline"] = 1] = "Outline";
})(TextEffect || (TextEffect = {}));
var InputType;
(function(InputType4) {
  InputType4[InputType4["Head"] = 0] = "Head";
  InputType4[InputType4["EyeLeft"] = 1] = "EyeLeft";
  InputType4[InputType4["EyeRight"] = 2] = "EyeRight";
  InputType4[InputType4["ControllerLeft"] = 3] = "ControllerLeft";
  InputType4[InputType4["ControllerRight"] = 4] = "ControllerRight";
  InputType4[InputType4["RayLeft"] = 5] = "RayLeft";
  InputType4[InputType4["RayRight"] = 6] = "RayRight";
})(InputType || (InputType = {}));
var LightType;
(function(LightType4) {
  LightType4[LightType4["Point"] = 0] = "Point";
  LightType4[LightType4["Spot"] = 1] = "Spot";
  LightType4[LightType4["Sun"] = 2] = "Sun";
})(LightType || (LightType = {}));
var AnimationState;
(function(AnimationState4) {
  AnimationState4[AnimationState4["Playing"] = 0] = "Playing";
  AnimationState4[AnimationState4["Paused"] = 1] = "Paused";
  AnimationState4[AnimationState4["Stopped"] = 2] = "Stopped";
})(AnimationState || (AnimationState = {}));
var ForceMode;
(function(ForceMode4) {
  ForceMode4[ForceMode4["Force"] = 0] = "Force";
  ForceMode4[ForceMode4["Impulse"] = 1] = "Impulse";
  ForceMode4[ForceMode4["VelocityChange"] = 2] = "VelocityChange";
  ForceMode4[ForceMode4["Acceleration"] = 3] = "Acceleration";
})(ForceMode || (ForceMode = {}));
var CollisionEventType;
(function(CollisionEventType4) {
  CollisionEventType4[CollisionEventType4["Touch"] = 0] = "Touch";
  CollisionEventType4[CollisionEventType4["TouchLost"] = 1] = "TouchLost";
  CollisionEventType4[CollisionEventType4["TriggerTouch"] = 2] = "TriggerTouch";
  CollisionEventType4[CollisionEventType4["TriggerTouchLost"] = 3] = "TriggerTouchLost";
})(CollisionEventType || (CollisionEventType = {}));
var Shape;
(function(Shape4) {
  Shape4[Shape4["None"] = 0] = "None";
  Shape4[Shape4["Sphere"] = 1] = "Sphere";
  Shape4[Shape4["Capsule"] = 2] = "Capsule";
  Shape4[Shape4["Box"] = 3] = "Box";
  Shape4[Shape4["Plane"] = 4] = "Plane";
  Shape4[Shape4["ConvexMesh"] = 5] = "ConvexMesh";
  Shape4[Shape4["TriangleMesh"] = 6] = "TriangleMesh";
})(Shape || (Shape = {}));
var MeshAttribute;
(function(MeshAttribute4) {
  MeshAttribute4[MeshAttribute4["Position"] = 0] = "Position";
  MeshAttribute4[MeshAttribute4["Tangent"] = 1] = "Tangent";
  MeshAttribute4[MeshAttribute4["Normal"] = 2] = "Normal";
  MeshAttribute4[MeshAttribute4["TextureCoordinate"] = 3] = "TextureCoordinate";
  MeshAttribute4[MeshAttribute4["Color"] = 4] = "Color";
  MeshAttribute4[MeshAttribute4["JointId"] = 5] = "JointId";
  MeshAttribute4[MeshAttribute4["JointWeight"] = 6] = "JointWeight";
})(MeshAttribute || (MeshAttribute = {}));
var MaterialParamType;
(function(MaterialParamType4) {
  MaterialParamType4[MaterialParamType4["UnsignedInt"] = 0] = "UnsignedInt";
  MaterialParamType4[MaterialParamType4["Int"] = 1] = "Int";
  MaterialParamType4[MaterialParamType4["Float"] = 2] = "Float";
  MaterialParamType4[MaterialParamType4["Sampler"] = 3] = "Sampler";
  MaterialParamType4[MaterialParamType4["Font"] = 4] = "Font";
})(MaterialParamType || (MaterialParamType = {}));
function isMeshShape(shape) {
  return shape === Shape.ConvexMesh || shape === Shape.TriangleMesh;
}
var Component = class {
  /** Manager index. @hidden */
  _manager;
  /** Instance index. @hidden */
  _id;
  /**
   * Object containing this object.
   *
   * **Note**: This is cached for faster retrieval.
   *
   * @hidden
   */
  _object;
  /** Wonderland Engine instance. @hidden */
  _engine;
  /**
   * Create a new instance
   *
   * @param engine The engine instance.
   * @param manager Index of the manager.
   * @param id WASM component instance index.
   *
   * @hidden
   */
  constructor(engine2, manager = -1, id = -1) {
    this._engine = engine2;
    this._manager = manager;
    this._id = id;
    this._object = null;
  }
  /** Hosting engine instance. */
  get engine() {
    return this._engine;
  }
  /** The name of this component's type */
  get type() {
    const ctor = this.constructor;
    return ctor.TypeName ?? this._engine.wasm._typeNameFor(this._manager);
  }
  /** The object this component is attached to. */
  get object() {
    if (!this._object) {
      const objectId = this._engine.wasm._wl_component_get_object(this._manager, this._id);
      this._object = this._engine.wrapObject(objectId);
    }
    return this._object;
  }
  /**
   * Set whether this component is active.
   *
   * Activating/deactivating a component comes at a small cost of reordering
   * components in the respective component manager. This function therefore
   * is not a trivial assignment.
   *
   * Does nothing if the component is already activated/deactivated.
   *
   * @param active New active state.
   */
  set active(active) {
    this._engine.wasm._wl_component_setActive(this._manager, this._id, active);
  }
  /**
   * Whether this component is active
   */
  get active() {
    return this._engine.wasm._wl_component_isActive(this._manager, this._id) != 0;
  }
  /**
   * Remove this component from its objects and destroy it.
   *
   * It is best practice to set the component to `null` after,
   * to ensure it does not get used later.
   *
   * ```js
   *    c.destroy();
   *    c = null;
   * ```
   * @since 0.9.0
   */
  destroy() {
    this._engine.wasm._wl_component_remove(this._manager, this._id);
    this._manager = -1;
    this._id = -1;
  }
  /**
   * Checks equality by comparing whether the wrapped native component ids
   * and component manager types are equal.
   *
   * @param otherComponent Component to check equality with.
   * @returns Whether this component equals the given component.
   */
  equals(otherComponent) {
    if (!otherComponent)
      return false;
    return this._manager == otherComponent._manager && this._id == otherComponent._id;
  }
};
/**
 * Unique identifier for this component class.
 *
 * This is used to register, add, and retrieve components of a given type.
 */
__publicField(Component, "TypeName");
/**
 * Properties of this component class.
 *
 * Properties are public attributes that can be configured via the
 * Wonderland Editor.
 *
 * Example:
 *
 * ```js
 * import { Component, Type } from '@wonderlandengine/api';
 * class MyComponent extends Component {
 *     static TypeName = 'my-component';
 *     static Properties = {
 *         myBoolean: { type: Type.Boolean, default: false },
 *         myFloat: { type: Type.Float, default: false },
 *         myTexture: { type: Type.Texture, default: null },
 *     };
 * }
 * ```
 *
 * Properties are automatically added to each component instance, and are
 * accessible like any JS attribute:
 *
 * ```js
 * // Creates a new component and set each properties value:
 * const myComponent = object.addComponent(MyComponent, {
 *     myBoolean: true,
 *     myFloat: 42.0,
 *     myTexture: null
 * });
 *
 * // You can also override the properties on the instance:
 * myComponent.myBoolean = false;
 * myComponent.myFloat = -42.0;
 * ```
 */
__publicField(Component, "Properties");
/**
 * This was never released in an official version, we are keeping it
 * to easy transition to the new API.
 *
 * @deprecated Use {@link Component.onRegister} instead.
 * @hidden
 */
__publicField(Component, "Dependencies");
/**
 * Called when this component class is registered.
 *
 * @example
 *
 * This callback can be used to register dependencies of a component,
 * e.g., component classes that need to be registered in order to add
 * them at runtime with {@link Object3D.addComponent}, independent of whether
 * they are used in the editor.
 *
 * ```js
 * class Spawner extends Component {
 *     static TypeName = 'spawner';
 *
 *     static onRegister() {
 *         engine.registerComponent(SpawnedComponent);
 *     }
 *
 *     // You can now use addComponent with SpawnedComponent
 * }
 * ```
 *
 * @example
 *
 * This callback can be used to register different implementations of a
 * component depending on client features or API versions.
 *
 * ```js
 * // Properties need to be the same for all implementations!
 * const SharedProperties = {};
 *
 * class Anchor extends Component {
 *     static TypeName = 'spawner';
 *     static Properties = SharedProperties;
 *
 *     static onRegister() {
 *         if(navigator.xr === undefined) {
 *             /* WebXR unsupported, keep this dummy component *\/
 *             return;
 *         }
 *         /* WebXR supported! Override already registered dummy implementation
 *          * with one depending on hit-test API support *\/
 *         engine.registerComponent(window.HitTestSource === undefined ?
 *             AnchorWithoutHitTest : AnchorWithHitTest);
 *     }
 *
 *     // This one implements no functions
 * }
 * ```
 */
__publicField(Component, "onRegister");
var _CollisionComponent = class extends Component {
  /** Collision component collider */
  get collider() {
    return this._engine.wasm._wl_collision_component_get_collider(this._id);
  }
  /**
   * Set collision component collider.
   *
   * @param collider Collider of the collision component.
   */
  set collider(collider) {
    this._engine.wasm._wl_collision_component_set_collider(this._id, collider);
  }
  /**
   * Collision component extents.
   *
   * If {@link collider} returns {@link Collider.Sphere}, only the first
   * component of the returned vector is used.
   */
  get extents() {
    const wasm = this._engine.wasm;
    return new Float32Array(wasm.HEAPF32.buffer, wasm._wl_collision_component_get_extents(this._id), 3);
  }
  /**
   * Set collision component extents.
   *
   * If {@link collider} returns {@link Collider.Sphere}, only the first
   * component of the passed vector is used.
   *
   * Example:
   *
   * ```js
   * // Spans 1 unit on the x-axis, 2 on the y-axis, 3 on the z-axis.
   * collision.extent = [1, 2, 3];
   * ```
   *
   * @param extents Extents of the collision component, expects a
   *      3 component array.
   */
  set extents(extents) {
    this.extents.set(extents);
  }
  /**
   * Collision component group.
   *
   * The groups is a bitmask that is compared to other components in {@link CollisionComponent#queryOverlaps}
   * or the group in {@link Scene#rayCast}.
   *
   * Colliders that have no common groups will not overlap with each other. If a collider
   * has none of the groups set for {@link Scene#rayCast}, the ray will not hit it.
   *
   * Each bit represents belonging to a group, see example.
   *
   * ```js
   *    // c belongs to group 2
   *    c.group = (1 << 2);
   *
   *    // c belongs to group 0
   *    c.group = (1 << 0);
   *
   *    // c belongs to group 0 *and* 2
   *    c.group = (1 << 0) | (1 << 2);
   *
   *    (c.group & (1 << 2)) != 0; // true
   *    (c.group & (1 << 7)) != 0; // false
   * ```
   */
  get group() {
    return this._engine.wasm._wl_collision_component_get_group(this._id);
  }
  /**
   * Set collision component group.
   *
   * @param group Group mask of the collision component.
   */
  set group(group) {
    this._engine.wasm._wl_collision_component_set_group(this._id, group);
  }
  /**
   * Query overlapping objects.
   *
   * Usage:
   *
   * ```js
   * const collision = object.getComponent('collision');
   * const overlaps = collision.queryOverlaps();
   * for(const otherCollision of overlaps) {
   *     const otherObject = otherCollision.object;
   *     console.log(`Collision with object ${otherObject.objectId}`);
   * }
   * ```
   *
   * @returns Collision components overlapping this collider.
   */
  queryOverlaps() {
    const count = this._engine.wasm._wl_collision_component_query_overlaps(this._id, this._engine.wasm._tempMem, this._engine.wasm._tempMemSize >> 1);
    const overlaps = new Array(count);
    for (let i = 0; i < count; ++i) {
      overlaps[i] = new _CollisionComponent(this._engine, this._manager, this._engine.wasm._tempMemUint16[i]);
    }
    return overlaps;
  }
};
var CollisionComponent = _CollisionComponent;
/** @override */
__publicField(CollisionComponent, "TypeName", "collision");
__decorate([
  nativeProperty()
], CollisionComponent.prototype, "collider", null);
__decorate([
  nativeProperty()
], CollisionComponent.prototype, "extents", null);
__decorate([
  nativeProperty()
], CollisionComponent.prototype, "group", null);
var TextComponent = class extends Component {
  /** Text component alignment. */
  get alignment() {
    return this._engine.wasm._wl_text_component_get_horizontal_alignment(this._id);
  }
  /**
   * Set text component alignment.
   *
   * @param alignment Alignment for the text component.
   */
  set alignment(alignment) {
    this._engine.wasm._wl_text_component_set_horizontal_alignment(this._id, alignment);
  }
  /** Text component justification. */
  get justification() {
    return this._engine.wasm._wl_text_component_get_vertical_alignment(this._id);
  }
  /**
   * Set text component justification.
   *
   * @param justification Justification for the text component.
   */
  set justification(justification) {
    this._engine.wasm._wl_text_component_set_vertical_alignment(this._id, justification);
  }
  /** Text component character spacing. */
  get characterSpacing() {
    return this._engine.wasm._wl_text_component_get_character_spacing(this._id);
  }
  /**
   * Set text component character spacing.
   *
   * @param spacing Character spacing for the text component.
   */
  set characterSpacing(spacing) {
    this._engine.wasm._wl_text_component_set_character_spacing(this._id, spacing);
  }
  /** Text component line spacing. */
  get lineSpacing() {
    return this._engine.wasm._wl_text_component_get_line_spacing(this._id);
  }
  /**
   * Set text component line spacing
   *
   * @param spacing Line spacing for the text component
   */
  set lineSpacing(spacing) {
    this._engine.wasm._wl_text_component_set_line_spacing(this._id, spacing);
  }
  /** Text component effect. */
  get effect() {
    return this._engine.wasm._wl_text_component_get_effect(this._id);
  }
  /**
   * Set text component effect
   *
   * @param effect Effect for the text component
   */
  set effect(effect) {
    this._engine.wasm._wl_text_component_set_effect(this._id, effect);
  }
  /** Text component text. */
  get text() {
    const wasm = this._engine.wasm;
    const ptr = wasm._wl_text_component_get_text(this._id);
    return wasm.UTF8ToString(ptr);
  }
  /**
   * Set text component text.
   *
   * @param text Text of the text component.
   */
  set text(text) {
    const wasm = this._engine.wasm;
    wasm._wl_text_component_set_text(this._id, wasm.tempUTF8(text));
  }
  /**
   * Set material to render the text with.
   *
   * @param material New material.
   */
  set material(material) {
    const matIndex = material ? material._index : 0;
    this._engine.wasm._wl_text_component_set_material(this._id, matIndex);
  }
  /** Material used to render the text. */
  get material() {
    const id = this._engine.wasm._wl_text_component_get_material(this._id);
    return id > 0 ? new Material(this._engine, id) : null;
  }
};
/** @override */
__publicField(TextComponent, "TypeName", "text");
__decorate([
  nativeProperty()
], TextComponent.prototype, "alignment", null);
__decorate([
  nativeProperty()
], TextComponent.prototype, "justification", null);
__decorate([
  nativeProperty()
], TextComponent.prototype, "characterSpacing", null);
__decorate([
  nativeProperty()
], TextComponent.prototype, "lineSpacing", null);
__decorate([
  nativeProperty()
], TextComponent.prototype, "effect", null);
__decorate([
  nativeProperty()
], TextComponent.prototype, "text", null);
__decorate([
  nativeProperty()
], TextComponent.prototype, "material", null);
var ViewComponent = class extends Component {
  /** Projection matrix. */
  get projectionMatrix() {
    const wasm = this._engine.wasm;
    return new Float32Array(wasm.HEAPF32.buffer, wasm._wl_view_component_get_projection_matrix(this._id), 16);
  }
  /** ViewComponent near clipping plane value. */
  get near() {
    return this._engine.wasm._wl_view_component_get_near(this._id);
  }
  /**
   * Set near clipping plane distance for the view.
   *
   * If an XR session is active, the change will apply in the
   * following frame, otherwise the change is immediate.
   *
   * @param near Near depth value.
   */
  set near(near) {
    this._engine.wasm._wl_view_component_set_near(this._id, near);
  }
  /** Far clipping plane value. */
  get far() {
    return this._engine.wasm._wl_view_component_get_far(this._id);
  }
  /**
   * Set far clipping plane distance for the view.
   *
   * If an XR session is active, the change will apply in the
   * following frame, otherwise the change is immediate.
   *
   * @param far Near depth value.
   */
  set far(far) {
    this._engine.wasm._wl_view_component_set_far(this._id, far);
  }
  /**
   * Get the horizontal field of view for the view, **in degrees**.
   *
   * If an XR session is active, this returns the field of view reported by
   * the device, regardless of the fov that was set.
   */
  get fov() {
    return this._engine.wasm._wl_view_component_get_fov(this._id);
  }
  /**
   * Set the horizontal field of view for the view, **in degrees**.
   *
   * If an XR session is active, the field of view reported by the device is
   * used and this value is ignored. After the XR session ends, the new value
   * is applied.
   *
   * @param fov Horizontal field of view, **in degrees**.
   */
  set fov(fov) {
    this._engine.wasm._wl_view_component_set_fov(this._id, fov);
  }
};
/** @override */
__publicField(ViewComponent, "TypeName", "view");
__decorate([
  enumerable()
], ViewComponent.prototype, "projectionMatrix", null);
__decorate([
  nativeProperty()
], ViewComponent.prototype, "near", null);
__decorate([
  nativeProperty()
], ViewComponent.prototype, "far", null);
__decorate([
  nativeProperty()
], ViewComponent.prototype, "fov", null);
var InputComponent = class extends Component {
  /** Input component type */
  get inputType() {
    return this._engine.wasm._wl_input_component_get_type(this._id);
  }
  /**
   * Set input component type.
   *
   * @params New input component type.
   */
  set inputType(type) {
    this._engine.wasm._wl_input_component_set_type(this._id, type);
  }
  /**
   * WebXR Device API input source associated with this input component,
   * if type {@link InputType.ControllerLeft} or {@link InputType.ControllerRight}.
   */
  get xrInputSource() {
    const xrSession = this._engine.xrSession;
    if (xrSession) {
      for (let inputSource of xrSession.inputSources) {
        if (inputSource.handedness == this.handedness) {
          return inputSource;
        }
      }
    }
    return null;
  }
  /**
   * 'left', 'right' or `null` depending on the {@link InputComponent#inputType}.
   */
  get handedness() {
    const inputType = this.inputType;
    if (inputType == InputType.ControllerRight || inputType == InputType.RayRight || inputType == InputType.EyeRight)
      return "right";
    if (inputType == InputType.ControllerLeft || inputType == InputType.RayLeft || inputType == InputType.EyeLeft)
      return "left";
    return null;
  }
};
/** @override */
__publicField(InputComponent, "TypeName", "input");
__decorate([
  nativeProperty()
], InputComponent.prototype, "inputType", null);
__decorate([
  enumerable()
], InputComponent.prototype, "xrInputSource", null);
__decorate([
  enumerable()
], InputComponent.prototype, "handedness", null);
var LightComponent = class extends Component {
  getColor(out = new Float32Array(3)) {
    const wasm = this._engine.wasm;
    const ptr = wasm._wl_light_component_get_color(this._id) / 4;
    out[0] = wasm.HEAPF32[ptr];
    out[1] = wasm.HEAPF32[ptr + 1];
    out[2] = wasm.HEAPF32[ptr + 2];
    return out;
  }
  /**
   * Set light color.
   *
   * @param c New color array/vector, expected to have at least 3 elements.
   * @since 1.0.0
   */
  setColor(c) {
    const wasm = this._engine.wasm;
    const ptr = wasm._wl_light_component_get_color(this._id) / 4;
    wasm.HEAPF32[ptr] = c[0];
    wasm.HEAPF32[ptr + 1] = c[1];
    wasm.HEAPF32[ptr + 2] = c[2];
  }
  /**
   * View on the light color.
   *
   * @note Prefer to use {@link getColor} in performance-critical code.
   */
  get color() {
    const wasm = this._engine.wasm;
    return new Float32Array(wasm.HEAPF32.buffer, wasm._wl_light_component_get_color(this._id), 3);
  }
  /**
   * Set light color.
   *
   * @param c Color of the light component.
   *
   * @note Prefer to use {@link setColor} in performance-critical code.
   */
  set color(c) {
    this.color.set(c);
  }
  /** Light type. */
  get lightType() {
    return this._engine.wasm._wl_light_component_get_type(this._id);
  }
  /**
   * Set light type.
   *
   * @param lightType Type of the light component.
   */
  set lightType(t) {
    this._engine.wasm._wl_light_component_set_type(this._id, t);
  }
  /**
   * Light intensity.
   * @since 1.0.0
   */
  get intensity() {
    return this._engine.wasm._wl_light_component_get_intensity(this._id);
  }
  /**
   * Set light intensity.
   *
   * @param intensity Intensity of the light component.
   * @since 1.0.0
   */
  set intensity(intensity) {
    this._engine.wasm._wl_light_component_set_intensity(this._id, intensity);
  }
  /**
   * Outer angle for spot lights, in degrees.
   * @since 1.0.0
   */
  get outerAngle() {
    return this._engine.wasm._wl_light_component_get_outerAngle(this._id);
  }
  /**
   * Set outer angle for spot lights.
   *
   * @param angle Outer angle, in degrees.
   * @since 1.0.0
   */
  set outerAngle(angle) {
    this._engine.wasm._wl_light_component_set_outerAngle(this._id, angle);
  }
  /**
   * Inner angle for spot lights, in degrees.
   * @since 1.0.0
   */
  get innerAngle() {
    return this._engine.wasm._wl_light_component_get_innerAngle(this._id);
  }
  /**
   * Set inner angle for spot lights.
   *
   * @param angle Inner angle, in degrees.
   * @since 1.0.0
   */
  set innerAngle(angle) {
    this._engine.wasm._wl_light_component_set_innerAngle(this._id, angle);
  }
  /**
   * Whether the light casts shadows.
   * @since 1.0.0
   */
  get shadows() {
    return !!this._engine.wasm._wl_light_component_get_shadows(this._id);
  }
  /**
   * Set whether the light casts shadows.
   *
   * @param b Whether the light casts shadows.
   * @since 1.0.0
   */
  set shadows(b) {
    this._engine.wasm._wl_light_component_set_shadows(this._id, b);
  }
  /**
   * Range for shadows.
   * @since 1.0.0
   */
  get shadowRange() {
    return this._engine.wasm._wl_light_component_get_shadowRange(this._id);
  }
  /**
   * Set range for shadows.
   *
   * @param range Range for shadows.
   * @since 1.0.0
   */
  set shadowRange(range) {
    this._engine.wasm._wl_light_component_set_shadowRange(this._id, range);
  }
  /**
   * Bias value for shadows.
   * @since 1.0.0
   */
  get shadowBias() {
    return this._engine.wasm._wl_light_component_get_shadowBias(this._id);
  }
  /**
   * Set bias value for shadows.
   *
   * @param bias Bias for shadows.
   * @since 1.0.0
   */
  set shadowBias(bias) {
    this._engine.wasm._wl_light_component_set_shadowBias(this._id, bias);
  }
  /**
   * Normal bias value for shadows.
   * @since 1.0.0
   */
  get shadowNormalBias() {
    return this._engine.wasm._wl_light_component_get_shadowNormalBias(this._id);
  }
  /**
   * Set normal bias value for shadows.
   *
   * @param bias Normal bias for shadows.
   * @since 1.0.0
   */
  set shadowNormalBias(bias) {
    this._engine.wasm._wl_light_component_set_shadowNormalBias(this._id, bias);
  }
  /**
   * Texel size for shadows.
   * @since 1.0.0
   */
  get shadowTexelSize() {
    return this._engine.wasm._wl_light_component_get_shadowTexelSize(this._id);
  }
  /**
   * Set texel size for shadows.
   *
   * @param size Texel size for shadows.
   * @since 1.0.0
   */
  set shadowTexelSize(size) {
    this._engine.wasm._wl_light_component_set_shadowTexelSize(this._id, size);
  }
  /**
   * Cascade count for {@link LightType.Sun} shadows.
   * @since 1.0.0
   */
  get cascadeCount() {
    return this._engine.wasm._wl_light_component_get_cascadeCount(this._id);
  }
  /**
   * Set cascade count for {@link LightType.Sun} shadows.
   *
   * @param count Cascade count.
   * @since 1.0.0
   */
  set cascadeCount(count) {
    this._engine.wasm._wl_light_component_set_cascadeCount(this._id, count);
  }
};
/** @override */
__publicField(LightComponent, "TypeName", "light");
__decorate([
  nativeProperty()
], LightComponent.prototype, "color", null);
__decorate([
  nativeProperty()
], LightComponent.prototype, "lightType", null);
__decorate([
  nativeProperty()
], LightComponent.prototype, "intensity", null);
__decorate([
  nativeProperty()
], LightComponent.prototype, "outerAngle", null);
__decorate([
  nativeProperty()
], LightComponent.prototype, "innerAngle", null);
__decorate([
  nativeProperty()
], LightComponent.prototype, "shadows", null);
__decorate([
  nativeProperty()
], LightComponent.prototype, "shadowRange", null);
__decorate([
  nativeProperty()
], LightComponent.prototype, "shadowBias", null);
__decorate([
  nativeProperty()
], LightComponent.prototype, "shadowNormalBias", null);
__decorate([
  nativeProperty()
], LightComponent.prototype, "shadowTexelSize", null);
__decorate([
  nativeProperty()
], LightComponent.prototype, "cascadeCount", null);
var AnimationComponent = class extends Component {
  /**
   * Set animation to play.
   *
   * Make sure to {@link Animation#retarget} the animation to affect the
   * right objects.
   *
   * @param anim Animation to play.
   */
  set animation(anim) {
    this._engine.wasm._wl_animation_component_set_animation(this._id, anim ? anim._index : 0);
  }
  /** Animation set for this component */
  get animation() {
    const id = this._engine.wasm._wl_animation_component_get_animation(this._id);
    return id > 0 ? new Animation(this._engine, id) : null;
  }
  /**
   * Set play count. Set to `0` to loop indefinitely.
   *
   * @param playCount Number of times to repeat the animation.
   */
  set playCount(playCount) {
    this._engine.wasm._wl_animation_component_set_playCount(this._id, playCount);
  }
  /** Number of times the animation is played. */
  get playCount() {
    return this._engine.wasm._wl_animation_component_get_playCount(this._id);
  }
  /**
   * Set speed. Set to negative values to run the animation backwards.
   *
   * Setting speed has an immediate effect for the current frame's update
   * and will continue with the speed from the current point in the animation.
   *
   * @param speed New speed at which to play the animation.
   * @since 0.8.10
   */
  set speed(speed) {
    this._engine.wasm._wl_animation_component_set_speed(this._id, speed);
  }
  /**
   * Speed factor at which the animation is played.
   *
   * @since 0.8.10
   */
  get speed() {
    return this._engine.wasm._wl_animation_component_get_speed(this._id);
  }
  /** Current playing state of the animation */
  get state() {
    return this._engine.wasm._wl_animation_component_state(this._id);
  }
  /**
   * Play animation.
   *
   * If the animation is currently paused, resumes from that position. If the
   * animation is already playing, does nothing.
   *
   * To restart the animation, {@link AnimationComponent#stop} it first.
   */
  play() {
    this._engine.wasm._wl_animation_component_play(this._id);
  }
  /** Stop animation. */
  stop() {
    this._engine.wasm._wl_animation_component_stop(this._id);
  }
  /** Pause animation. */
  pause() {
    this._engine.wasm._wl_animation_component_pause(this._id);
  }
};
/** @override */
__publicField(AnimationComponent, "TypeName", "animation");
__decorate([
  nativeProperty()
], AnimationComponent.prototype, "animation", null);
__decorate([
  nativeProperty()
], AnimationComponent.prototype, "playCount", null);
__decorate([
  nativeProperty()
], AnimationComponent.prototype, "speed", null);
__decorate([
  enumerable()
], AnimationComponent.prototype, "state", null);
var MeshComponent = class extends Component {
  /**
   * Set material to render the mesh with.
   *
   * @param material Material to render the mesh with.
   */
  set material(material) {
    this._engine.wasm._wl_mesh_component_set_material(this._id, material ? material._index : 0);
  }
  /** Material used to render the mesh. */
  get material() {
    const id = this._engine.wasm._wl_mesh_component_get_material(this._id);
    return id > 0 ? new Material(this._engine, id) : null;
  }
  /** Mesh rendered by this component. */
  get mesh() {
    const id = this._engine.wasm._wl_mesh_component_get_mesh(this._id);
    return id > 0 ? new Mesh(this._engine, id) : null;
  }
  /**
   * Set mesh to rendered with this component.
   *
   * @param mesh Mesh rendered by this component.
   */
  set mesh(mesh) {
    this._engine.wasm._wl_mesh_component_set_mesh(this._id, mesh ? mesh._index : 0);
  }
  /** Skin for this mesh component. */
  get skin() {
    const id = this._engine.wasm._wl_mesh_component_get_skin(this._id);
    return id > 0 ? new Skin(this._engine, id) : null;
  }
  /**
   * Set skin to transform this mesh component.
   *
   * @param skin Skin to use for rendering skinned meshes.
   */
  set skin(skin) {
    this._engine.wasm._wl_mesh_component_set_skin(this._id, skin ? skin._index : 0);
  }
};
/** @override */
__publicField(MeshComponent, "TypeName", "mesh");
__decorate([
  nativeProperty()
], MeshComponent.prototype, "material", null);
__decorate([
  nativeProperty()
], MeshComponent.prototype, "mesh", null);
__decorate([
  nativeProperty()
], MeshComponent.prototype, "skin", null);
var LockAxis;
(function(LockAxis4) {
  LockAxis4[LockAxis4["None"] = 0] = "None";
  LockAxis4[LockAxis4["X"] = 1] = "X";
  LockAxis4[LockAxis4["Y"] = 2] = "Y";
  LockAxis4[LockAxis4["Z"] = 4] = "Z";
})(LockAxis || (LockAxis = {}));
var PhysXComponent = class extends Component {
  /**
   * Set whether this rigid body is static.
   *
   * Setting this property only takes effect once the component
   * switches from inactive to active.
   *
   * @param b Whether the rigid body should be static.
   */
  set static(b) {
    this._engine.wasm._wl_physx_component_set_static(this._id, b);
  }
  /**
   * Whether this rigid body is static.
   *
   * This property returns whether the rigid body is *effectively*
   * static. If static property was set while the rigid body was
   * active, it will not take effect until the rigid body is set
   * inactive and active again. Until the component is set inactive,
   * this getter will return whether the rigid body is actually
   * static.
   */
  get static() {
    return !!this._engine.wasm._wl_physx_component_get_static(this._id);
  }
  /**
   * Set whether this rigid body is kinematic.
   *
   * @param b Whether the rigid body should be kinematic.
   */
  set kinematic(b) {
    this._engine.wasm._wl_physx_component_set_kinematic(this._id, b);
  }
  /**
   * Whether this rigid body is kinematic.
   */
  get kinematic() {
    return !!this._engine.wasm._wl_physx_component_get_kinematic(this._id);
  }
  /**
   * Set whether this rigid body's gravity is enabled.
   *
   * @param b Whether the rigid body's gravity should be enabled.
   */
  set gravity(b) {
    this._engine.wasm._wl_physx_component_set_gravity(this._id, b);
  }
  /**
   * Whether this rigid body's gravity flag is enabled.
   */
  get gravity() {
    return !!this._engine.wasm._wl_physx_component_get_gravity(this._id);
  }
  /**
   * Set whether this rigid body's simulate flag is enabled.
   *
   * @param b Whether the rigid body's simulate flag should be enabled.
   */
  set simulate(b) {
    this._engine.wasm._wl_physx_component_set_simulate(this._id, b);
  }
  /**
   * Whether this rigid body's simulate flag is enabled.
   */
  get simulate() {
    return !!this._engine.wasm._wl_physx_component_get_simulate(this._id);
  }
  /**
   * Set whether to allow simulation of this rigid body.
   *
   * {@link allowSimulation} and {@link trigger} can not be enabled at the
   * same time. Enabling {@link allowSimulation} while {@link trigger} is enabled
   * will disable {@link trigger}.
   *
   * @param b Whether to allow simulation of this rigid body.
   */
  set allowSimulation(b) {
    this._engine.wasm._wl_physx_component_set_allowSimulation(this._id, b);
  }
  /**
   * Whether to allow simulation of this rigid body.
   */
  get allowSimulation() {
    return !!this._engine.wasm._wl_physx_component_get_allowSimulation(this._id);
  }
  /**
   * Set whether this rigid body may be queried in ray casts.
   *
   * @param b Whether this rigid body may be queried in ray casts.
   */
  set allowQuery(b) {
    this._engine.wasm._wl_physx_component_set_allowQuery(this._id, b);
  }
  /**
   * Whether this rigid body may be queried in ray casts.
   */
  get allowQuery() {
    return !!this._engine.wasm._wl_physx_component_get_allowQuery(this._id);
  }
  /**
   * Set whether this physics body is a trigger.
   *
   * {@link allowSimulation} and {@link trigger} can not be enabled at the
   * same time. Enabling trigger while {@link allowSimulation} is enabled,
   * will disable {@link allowSimulation}.
   *
   * @param b Whether this physics body is a trigger.
   */
  set trigger(b) {
    this._engine.wasm._wl_physx_component_set_trigger(this._id, b);
  }
  /**
   * Whether this physics body is a trigger.
   */
  get trigger() {
    return !!this._engine.wasm._wl_physx_component_get_trigger(this._id);
  }
  /**
   * Set the shape for collision detection.
   *
   * @param s New shape.
   * @since 0.8.5
   */
  set shape(s) {
    this._engine.wasm._wl_physx_component_set_shape(this._id, s);
  }
  /** The shape for collision detection. */
  get shape() {
    return this._engine.wasm._wl_physx_component_get_shape(this._id);
  }
  /**
   * Set additional data for the shape.
   *
   * Retrieved only from {@link PhysXComponent#shapeData}.
   * @since 0.8.10
   */
  set shapeData(d) {
    if (d == null || !isMeshShape(this.shape))
      return;
    this._engine.wasm._wl_physx_component_set_shape_data(this._id, d.index);
  }
  /**
   * Additional data for the shape.
   *
   * `null` for {@link Shape} values: `None`, `Sphere`, `Capsule`, `Box`, `Plane`.
   * `{index: n}` for `TriangleMesh` and `ConvexHull`.
   *
   * This data is currently only for passing onto or creating other {@link PhysXComponent}.
   * @since 0.8.10
   */
  get shapeData() {
    if (!isMeshShape(this.shape))
      return null;
    return { index: this._engine.wasm._wl_physx_component_get_shape_data(this._id) };
  }
  /**
   * Set the shape extents for collision detection.
   *
   * @param e New extents for the shape.
   * @since 0.8.5
   */
  set extents(e) {
    this.extents.set(e);
  }
  /**
   * The shape extents for collision detection.
   */
  get extents() {
    const wasm = this._engine.wasm;
    const ptr = wasm._wl_physx_component_get_extents(this._id);
    return new Float32Array(wasm.HEAPF32.buffer, ptr, 3);
  }
  /**
   * Get staticFriction.
   */
  get staticFriction() {
    return this._engine.wasm._wl_physx_component_get_staticFriction(this._id);
  }
  /**
   * Set staticFriction.
   * @param v New staticFriction.
   */
  set staticFriction(v) {
    this._engine.wasm._wl_physx_component_set_staticFriction(this._id, v);
  }
  /**
   * Get dynamicFriction.
   */
  get dynamicFriction() {
    return this._engine.wasm._wl_physx_component_get_dynamicFriction(this._id);
  }
  /**
   * Set dynamicFriction
   * @param v New dynamicDamping.
   */
  set dynamicFriction(v) {
    this._engine.wasm._wl_physx_component_set_dynamicFriction(this._id, v);
  }
  /**
   * Get bounciness.
   * @since 0.9.0
   */
  get bounciness() {
    return this._engine.wasm._wl_physx_component_get_bounciness(this._id);
  }
  /**
   * Set bounciness.
   * @param v New bounciness.
   * @since 0.9.0
   */
  set bounciness(v) {
    this._engine.wasm._wl_physx_component_set_bounciness(this._id, v);
  }
  /**
   * Get linearDamping/
   */
  get linearDamping() {
    return this._engine.wasm._wl_physx_component_get_linearDamping(this._id);
  }
  /**
   * Set linearDamping.
   * @param v New linearDamping.
   */
  set linearDamping(v) {
    this._engine.wasm._wl_physx_component_set_linearDamping(this._id, v);
  }
  /** Get angularDamping. */
  get angularDamping() {
    return this._engine.wasm._wl_physx_component_get_angularDamping(this._id);
  }
  /**
   * Set angularDamping.
   * @param v New angularDamping.
   */
  set angularDamping(v) {
    this._engine.wasm._wl_physx_component_set_angularDamping(this._id, v);
  }
  /**
   * Set linear velocity.
   *
   * [PhysX Manual - "Velocity"](https://gameworksdocs.nvidia.com/PhysX/4.1/documentation/physxguide/Manual/RigidBodyDynamics.html#velocity)
   *
   * Has no effect, if the component is not active.
   *
   * @param v New linear velocity.
   */
  set linearVelocity(v) {
    this._engine.wasm._wl_physx_component_set_linearVelocity(this._id, v[0], v[1], v[2]);
  }
  /** Linear velocity or `[0, 0, 0]` if the component is not active. */
  get linearVelocity() {
    const wasm = this._engine.wasm;
    wasm._wl_physx_component_get_linearVelocity(this._id, wasm._tempMem);
    return new Float32Array(wasm.HEAPF32.buffer, wasm._tempMem, 3);
  }
  /**
   * Set angular velocity
   *
   * [PhysX Manual - "Velocity"](https://gameworksdocs.nvidia.com/PhysX/4.1/documentation/physxguide/Manual/RigidBodyDynamics.html#velocity)
   *
   * Has no effect, if the component is not active.
   *
   * @param v New angular velocity
   */
  set angularVelocity(v) {
    this._engine.wasm._wl_physx_component_set_angularVelocity(this._id, v[0], v[1], v[2]);
  }
  /** Angular velocity or `[0, 0, 0]` if the component is not active. */
  get angularVelocity() {
    const wasm = this._engine.wasm;
    wasm._wl_physx_component_get_angularVelocity(this._id, wasm._tempMem);
    return new Float32Array(wasm.HEAPF32.buffer, wasm._tempMem, 3);
  }
  /**
   * Set the components groups mask.
   *
   * @param flags New flags that need to be set.
   */
  set groupsMask(flags) {
    this._engine.wasm._wl_physx_component_set_groupsMask(this._id, flags);
  }
  /**
   * Get the components groups mask flags.
   *
   * Each bit represents membership to group, see example.
   *
   * ```js
   * // Assign c to group 2
   * c.groupsMask = (1 << 2);
   *
   * // Assign c to group 0
   * c.groupsMask  = (1 << 0);
   *
   * // Assign c to group 0 and 2
   * c.groupsMask = (1 << 0) | (1 << 2);
   *
   * (c.groupsMask & (1 << 2)) != 0; // true
   * (c.groupsMask & (1 << 7)) != 0; // false
   * ```
   */
  get groupsMask() {
    return this._engine.wasm._wl_physx_component_get_groupsMask(this._id);
  }
  /**
   * Set the components blocks mask.
   *
   * @param flags New flags that need to be set.
   */
  set blocksMask(flags) {
    this._engine.wasm._wl_physx_component_set_blocksMask(this._id, flags);
  }
  /**
   * Get the components blocks mask flags.
   *
   * Each bit represents membership to the block, see example.
   *
   * ```js
   * // Block overlap with any objects in group 2
   * c.blocksMask = (1 << 2);
   *
   * // Block overlap with any objects in group 0
   * c.blocksMask  = (1 << 0)
   *
   * // Block overlap with any objects in group 0 and 2
   * c.blocksMask = (1 << 0) | (1 << 2);
   *
   * (c.blocksMask & (1 << 2)) != 0; // true
   * (c.blocksMask & (1 << 7)) != 0; // false
   * ```
   */
  get blocksMask() {
    return this._engine.wasm._wl_physx_component_get_blocksMask(this._id);
  }
  /**
   * Set axes to lock for linear velocity.
   *
   * @param lock The Axis that needs to be set.
   *
   * Combine flags with Bitwise OR.
   * ```js
   * body.linearLockAxis = LockAxis.X | LockAxis.Y; // x and y set
   * body.linearLockAxis = LockAxis.X; // y unset
   * ```
   *
   * @note This has no effect if the component is static.
   */
  set linearLockAxis(lock) {
    this._engine.wasm._wl_physx_component_set_linearLockAxis(this._id, lock);
  }
  /**
   * Get the linear lock axes flags.
   *
   * To get the state of a specific flag, Bitwise AND with the LockAxis needed.
   *
   * ```js
   * if(body.linearLockAxis & LockAxis.Y) {
   *     console.log("The Y flag was set!");
   * }
   * ```
   *
   * @return axes that are currently locked for linear movement.
   */
  get linearLockAxis() {
    return this._engine.wasm._wl_physx_component_get_linearLockAxis(this._id);
  }
  /**
   * Set axes to lock for angular velocity.
   *
   * @param lock The Axis that needs to be set.
   *
   * ```js
   * body.angularLockAxis = LockAxis.X | LockAxis.Y; // x and y set
   * body.angularLockAxis = LockAxis.X; // y unset
   * ```
   *
   * @note This has no effect if the component is static.
   */
  set angularLockAxis(lock) {
    this._engine.wasm._wl_physx_component_set_angularLockAxis(this._id, lock);
  }
  /**
   * Get the angular lock axes flags.
   *
   * To get the state of a specific flag, Bitwise AND with the LockAxis needed.
   *
   * ```js
   * if(body.angularLockAxis & LockAxis.Y) {
   *     console.log("The Y flag was set!");
   * }
   * ```
   *
   * @return axes that are currently locked for angular movement.
   */
  get angularLockAxis() {
    return this._engine.wasm._wl_physx_component_get_angularLockAxis(this._id);
  }
  /**
   * Set mass.
   *
   * [PhysX Manual - "Mass Properties"](https://gameworksdocs.nvidia.com/PhysX/4.1/documentation/physxguide/Manual/RigidBodyDynamics.html#mass-properties)
   *
   * @param m New mass.
   */
  set mass(m) {
    this._engine.wasm._wl_physx_component_set_mass(this._id, m);
  }
  /** Mass */
  get mass() {
    return this._engine.wasm._wl_physx_component_get_mass(this._id);
  }
  /**
   * Set mass space interia tensor.
   *
   * [PhysX Manual - "Mass Properties"](https://gameworksdocs.nvidia.com/PhysX/4.1/documentation/physxguide/Manual/RigidBodyDynamics.html#mass-properties)
   *
   * Has no effect, if the component is not active.
   *
   * @param v New mass space interatia tensor.
   */
  set massSpaceInteriaTensor(v) {
    this._engine.wasm._wl_physx_component_set_massSpaceInertiaTensor(this._id, v[0], v[1], v[2]);
  }
  /**
   * Apply a force.
   *
   * [PhysX Manual - "Applying Forces and Torques"](https://gameworksdocs.nvidia.com/PhysX/4.1/documentation/physxguide/Manual/RigidBodyDynamics.html#applying-forces-and-torques)
   *
   * Has no effect, if the component is not active.
   *
   * @param f Force vector.
   * @param m Force mode, see {@link ForceMode}, default `Force`.
   * @param localForce Whether the force vector is in local space, default `false`.
   * @param p Position to apply force at, default is center of mass.
   * @param local Whether position is in local space, default `false`.
   */
  addForce(f, m = ForceMode.Force, localForce = false, p, local = false) {
    const wasm = this._engine.wasm;
    if (!p) {
      wasm._wl_physx_component_addForce(this._id, f[0], f[1], f[2], m, localForce);
      return;
    }
    wasm._wl_physx_component_addForceAt(this._id, f[0], f[1], f[2], m, localForce, p[0], p[1], p[2], local);
  }
  /**
   * Apply torque.
   *
   * [PhysX Manual - "Applying Forces and Torques"](https://gameworksdocs.nvidia.com/PhysX/4.1/documentation/physxguide/Manual/RigidBodyDynamics.html#applying-forces-and-torques)
   *
   * Has no effect, if the component is not active.
   *
   * @param f Force vector.
   * @param m Force mode, see {@link ForceMode}, default `Force`.
   */
  addTorque(f, m = ForceMode.Force) {
    this._engine.wasm._wl_physx_component_addTorque(this._id, f[0], f[1], f[2], m);
  }
  /**
   * Add on collision callback.
   *
   * @param callback Function to call when this rigid body (un)collides with any other.
   *
   * ```js
   *  let rigidBody = this.object.getComponent('physx');
   *  rigidBody.onCollision(function(type, other) {
   *      // Ignore uncollides
   *      if(type == CollisionEventType.TouchLost) return;
   *
   *      // Take damage on collision with enemies
   *      if(other.object.name.startsWith('enemy-')) {
   *          this.applyDamage(10);
   *      }
   *  }.bind(this));
   * ```
   *
   * @returns Id of the new callback for use with {@link PhysXComponent#removeCollisionCallback}.
   */
  onCollision(callback) {
    return this.onCollisionWith(this, callback);
  }
  /**
   * Add filtered on collision callback.
   *
   * @param otherComp Component for which callbacks will
   *        be triggered. If you pass this component, the method is equivalent to.
   *        {@link PhysXComponent#onCollision}.
   * @param callback Function to call when this rigid body
   *        (un)collides with `otherComp`.
   * @returns Id of the new callback for use with {@link PhysXComponent#removeCollisionCallback}.
   */
  onCollisionWith(otherComp, callback) {
    const physics = this._engine.physics;
    physics._callbacks[this._id] = physics._callbacks[this._id] || [];
    physics._callbacks[this._id].push(callback);
    return this._engine.wasm._wl_physx_component_addCallback(this._id, otherComp._id || this._id);
  }
  /**
   * Remove a collision callback added with {@link PhysXComponent#onCollision} or {@link PhysXComponent#onCollisionWith}.
   *
   * @param callbackId Callback id as returned by {@link PhysXComponent#onCollision} or {@link PhysXComponent#onCollisionWith}.
   * @throws When the callback does not belong to the component.
   * @throws When the callback does not exist.
   */
  removeCollisionCallback(callbackId) {
    const physics = this._engine.physics;
    const r = this._engine.wasm._wl_physx_component_removeCallback(this._id, callbackId);
    if (r)
      physics._callbacks[this._id].splice(-r);
  }
};
/** @override */
__publicField(PhysXComponent, "TypeName", "physx");
__decorate([
  nativeProperty()
], PhysXComponent.prototype, "static", null);
__decorate([
  nativeProperty()
], PhysXComponent.prototype, "kinematic", null);
__decorate([
  nativeProperty()
], PhysXComponent.prototype, "gravity", null);
__decorate([
  nativeProperty()
], PhysXComponent.prototype, "simulate", null);
__decorate([
  nativeProperty()
], PhysXComponent.prototype, "allowSimulation", null);
__decorate([
  nativeProperty()
], PhysXComponent.prototype, "allowQuery", null);
__decorate([
  nativeProperty()
], PhysXComponent.prototype, "trigger", null);
__decorate([
  nativeProperty()
], PhysXComponent.prototype, "shape", null);
__decorate([
  nativeProperty()
], PhysXComponent.prototype, "shapeData", null);
__decorate([
  nativeProperty()
], PhysXComponent.prototype, "extents", null);
__decorate([
  nativeProperty()
], PhysXComponent.prototype, "staticFriction", null);
__decorate([
  nativeProperty()
], PhysXComponent.prototype, "dynamicFriction", null);
__decorate([
  nativeProperty()
], PhysXComponent.prototype, "bounciness", null);
__decorate([
  nativeProperty()
], PhysXComponent.prototype, "linearDamping", null);
__decorate([
  nativeProperty()
], PhysXComponent.prototype, "angularDamping", null);
__decorate([
  nativeProperty()
], PhysXComponent.prototype, "linearVelocity", null);
__decorate([
  nativeProperty()
], PhysXComponent.prototype, "angularVelocity", null);
__decorate([
  nativeProperty()
], PhysXComponent.prototype, "groupsMask", null);
__decorate([
  nativeProperty()
], PhysXComponent.prototype, "blocksMask", null);
__decorate([
  nativeProperty()
], PhysXComponent.prototype, "linearLockAxis", null);
__decorate([
  nativeProperty()
], PhysXComponent.prototype, "angularLockAxis", null);
__decorate([
  nativeProperty()
], PhysXComponent.prototype, "mass", null);
var MeshIndexType;
(function(MeshIndexType4) {
  MeshIndexType4[MeshIndexType4["UnsignedByte"] = 1] = "UnsignedByte";
  MeshIndexType4[MeshIndexType4["UnsignedShort"] = 2] = "UnsignedShort";
  MeshIndexType4[MeshIndexType4["UnsignedInt"] = 4] = "UnsignedInt";
})(MeshIndexType || (MeshIndexType = {}));
var MeshSkinningType;
(function(MeshSkinningType4) {
  MeshSkinningType4[MeshSkinningType4["None"] = 0] = "None";
  MeshSkinningType4[MeshSkinningType4["FourJoints"] = 1] = "FourJoints";
  MeshSkinningType4[MeshSkinningType4["EightJoints"] = 2] = "EightJoints";
})(MeshSkinningType || (MeshSkinningType = {}));
var Mesh = class {
  /**
   * Index of the mesh in the manager.
   *
   * @hidden
   */
  _index = -1;
  /** Wonderland Engine instance. @hidden */
  _engine;
  /**
   * Create a new instance.
   *
   * @param params Either a mesh index to wrap or set of parameters to create a new mesh.
   *    For more information, please have a look at the {@link MeshParameters} interface.
   */
  constructor(engine2, params) {
    this._engine = engine2 ?? WL;
    this._index = -1;
    if (isNumber(params)) {
      this._index = params;
      return;
    }
    if (!params.vertexCount)
      throw new Error("Missing parameter 'vertexCount'");
    const wasm = this._engine.wasm;
    let indexData = 0;
    let indexType = 0;
    let indexDataSize = 0;
    if (params.indexData) {
      indexType = params.indexType || MeshIndexType.UnsignedShort;
      indexDataSize = params.indexData.length * indexType;
      indexData = wasm._malloc(indexDataSize);
      switch (indexType) {
        case MeshIndexType.UnsignedByte:
          wasm.HEAPU8.set(params.indexData, indexData);
          break;
        case MeshIndexType.UnsignedShort:
          wasm.HEAPU16.set(params.indexData, indexData >> 1);
          break;
        case MeshIndexType.UnsignedInt:
          wasm.HEAPU32.set(params.indexData, indexData >> 2);
          break;
      }
    }
    const { skinningType = MeshSkinningType.None } = params;
    this._index = wasm._wl_mesh_create(indexData, indexDataSize, indexType, params.vertexCount, skinningType);
  }
  /** Number of vertices in this mesh. */
  get vertexCount() {
    return this._engine.wasm._wl_mesh_get_vertexCount(this._index);
  }
  /** Index data (read-only) or `null` if the mesh is not indexed. */
  get indexData() {
    const wasm = this._engine.wasm;
    const tempMem = wasm._tempMem;
    const ptr = wasm._wl_mesh_get_indexData(this._index, tempMem, tempMem + 4);
    if (ptr === null)
      return null;
    const indexCount = wasm.HEAPU32[tempMem / 4];
    const indexSize = wasm.HEAPU32[tempMem / 4 + 1];
    switch (indexSize) {
      case MeshIndexType.UnsignedByte:
        return new Uint8Array(wasm.HEAPU8.buffer, ptr, indexCount);
      case MeshIndexType.UnsignedShort:
        return new Uint16Array(wasm.HEAPU16.buffer, ptr, indexCount);
      case MeshIndexType.UnsignedInt:
        return new Uint32Array(wasm.HEAPU32.buffer, ptr, indexCount);
    }
    return null;
  }
  /** Hosting engine instance. */
  get engine() {
    return this._engine;
  }
  /**
   * Apply changes to {@link attribute | vertex attributes}.
   *
   * Uploads the updated vertex attributes to the GPU and updates the bounding
   * sphere to match the new vertex positions.
   *
   * Since this is an expensive operation, call it only once you have performed
   * all modifications on a mesh and avoid calling if you did not perform any
   * modifications at all.
   */
  update() {
    this._engine.wasm._wl_mesh_update(this._index);
  }
  getBoundingSphere(out = new Float32Array(4)) {
    const tempMemFloat = this._engine.wasm._tempMemFloat;
    this._engine.wasm._wl_mesh_get_boundingSphere(this._index, this._engine.wasm._tempMem);
    out[0] = tempMemFloat[0];
    out[1] = tempMemFloat[1];
    out[2] = tempMemFloat[2];
    out[3] = tempMemFloat[3];
    return out;
  }
  attribute(attr) {
    if (typeof attr != "number")
      throw new TypeError("Expected number, but got " + typeof attr);
    const tempMemUint32 = this._engine.wasm._tempMemUint32;
    this._engine.wasm._wl_mesh_get_attribute(this._index, attr, this._engine.wasm._tempMem);
    if (tempMemUint32[0] == 255)
      return null;
    const arraySize = tempMemUint32[5];
    return new MeshAttributeAccessor(this._engine, {
      attribute: tempMemUint32[0],
      offset: tempMemUint32[1],
      stride: tempMemUint32[2],
      formatSize: tempMemUint32[3],
      componentCount: tempMemUint32[4],
      /* The WASM API returns `0` for a scalar value. We clamp it to 1 as we strictly use it as a multiplier for get/set operations */
      arraySize: arraySize ? arraySize : 1,
      length: this.vertexCount,
      bufferType: attr !== MeshAttribute.JointId ? Float32Array : Uint16Array
    });
  }
  /**
   * Destroy and free the meshes memory.
   *
   * It is best practice to set the mesh variable to `null` after calling
   * destroy to prevent accidental use:
   *
   * ```js
   *   mesh.destroy();
   *   mesh = null;
   * ```
   *
   * Accessing the mesh after destruction behaves like accessing an empty
   * mesh.
   *
   * @since 0.9.0
   */
  destroy() {
    this._engine.wasm._wl_mesh_destroy(this._index);
  }
  /**
   * Checks equality by comparing whether the wrapped native mesh ids are
   * equal.
   *
   * @param otherMesh Mesh to check equality with.
   * @returns Whether this mesh equals the given mesh.
   *
   * @since 1.0.0
   */
  equals(otherMesh) {
    if (!otherMesh)
      return false;
    return this._index === otherMesh._index;
  }
};
var MeshAttributeAccessor = class {
  /** Max number of elements. */
  length = 0;
  /** Wonderland Engine instance. @hidden */
  _engine;
  /** Attribute index. @hidden */
  _attribute = -1;
  /** Attribute offset. @hidden */
  _offset = 0;
  /** Attribute stride. @hidden */
  _stride = 0;
  /** Format size native enum. @hidden */
  _formatSize = 0;
  /** Number of components per vertex. @hidden */
  _componentCount = 0;
  /** Number of values per vertex. @hidden */
  _arraySize = 1;
  /**
   * Class to instantiate an ArrayBuffer to get/set values.
   */
  _bufferType;
  /**
   * Function to allocate temporary WASM memory. It is cached in the accessor to avoid
   * conditionals during get/set.
   */
  _tempBufferGetter;
  /**
   * Create a new instance.
   *
   * @note Please use {@link Mesh.attribute} to create a new instance.
   *
   * @param options Contains information about how to read the data.
   * @note Do not use this constructor. Instead, please use the {@link Mesh.attribute} method.
   *
   * @hidden
   */
  constructor(engine2, options) {
    this._engine = engine2;
    const wasm = this._engine.wasm;
    this._attribute = options.attribute;
    this._offset = options.offset;
    this._stride = options.stride;
    this._formatSize = options.formatSize;
    this._componentCount = options.componentCount;
    this._arraySize = options.arraySize;
    this._bufferType = options.bufferType;
    this.length = options.length;
    this._tempBufferGetter = this._bufferType === Float32Array ? wasm.getTempBufferF32.bind(wasm) : wasm.getTempBufferU16.bind(wasm);
  }
  /**
   * Create a new TypedArray to hold this attribute's values.
   *
   * This method is useful to create a view to hold the data to
   * pass to {@link get} and {@link set}
   *
   * Example:
   *
   * ```js
   * const vertexCount = 4;
   * const positionAttribute = mesh.attribute(MeshAttributes.Position);
   *
   * // A position has 3 floats per vertex. Thus, positions has length 3 * 4.
   * const positions = positionAttribute.createArray(vertexCount);
   * ```
   *
   * @param count The number of **vertices** expected.
   * @returns A TypedArray with the appropriate format to access the data
   */
  createArray(count = 1) {
    count = count > this.length ? this.length : count;
    return new this._bufferType(count * this._componentCount * this._arraySize);
  }
  get(index, out = this.createArray()) {
    if (out.length % this._componentCount !== 0) {
      throw new Error(`out.length, ${out.length} is not a multiple of the attribute vector components, ${this._componentCount}`);
    }
    const dest = this._tempBufferGetter(out.length);
    const elementSize = this._bufferType.BYTES_PER_ELEMENT;
    const destSize = elementSize * out.length;
    const srcFormatSize = this._formatSize * this._arraySize;
    const destFormatSize = this._componentCount * elementSize * this._arraySize;
    this._engine.wasm._wl_mesh_get_attribute_values(this._attribute, srcFormatSize, this._offset + index * this._stride, this._stride, destFormatSize, dest.byteOffset, destSize);
    for (let i = 0; i < out.length; ++i)
      out[i] = dest[i];
    return out;
  }
  /**
   * Set attribute element.
   *
   * @param i Index
   * @param v Value to set the element to
   *
   * `v.length` needs to be a multiple of the attributes component count, see
   * {@link MeshAttribute}. If `v.length` is more than one multiple, it will be
   * filled with the next n attribute elements, which can reduce overhead
   * of this call.
   *
   * @returns Reference to self (for method chaining)
   */
  set(i, v) {
    if (v.length % this._componentCount !== 0)
      throw new Error(`out.length, ${v.length} is not a multiple of the attribute vector components, ${this._componentCount}`);
    const elementSize = this._bufferType.BYTES_PER_ELEMENT;
    const srcSize = elementSize * v.length;
    const srcFormatSize = this._componentCount * elementSize * this._arraySize;
    const destFormatSize = this._formatSize * this._arraySize;
    const wasm = this._engine.wasm;
    if (v.buffer != wasm.HEAPU8.buffer) {
      const dest = this._tempBufferGetter(v.length);
      dest.set(v);
      v = dest;
    }
    wasm._wl_mesh_set_attribute_values(this._attribute, srcFormatSize, v.byteOffset, srcSize, destFormatSize, this._offset + i * this._stride, this._stride);
    return this;
  }
};
var Material = class {
  /**
   * Index of this material in the manager.
   *
   * @hidden
   */
  _index;
  /**
   * Material definition index in the scene.
   *
   * @hidden
   */
  _definition;
  /** Wonderland Engine instance. @hidden */
  _engine;
  /**
   * Create a new Material.
   *
   * @note Creating material is expensive. Please use {@link Material#clone} to clone a material.
   * @note Do not use this constructor directly with an index, this is reserved for internal purposes.
   */
  constructor(engine2, params) {
    this._engine = engine2;
    if (typeof params !== "number") {
      if (!params?.pipeline)
        throw new Error("Missing parameter 'pipeline'");
      const wasm = this._engine.wasm;
      const pipeline = params.pipeline;
      this._index = wasm._wl_material_create(wasm.tempUTF8(pipeline));
      if (this._index < 0)
        throw new Error(`No such pipeline '${pipeline}'`);
    } else {
      this._index = params;
    }
    this._definition = this._engine.wasm._wl_material_get_definition(this._index);
    if (!this._engine.wasm._materialDefinitions[this._definition])
      throw new Error(`Material Definition ${this._definition} not found for material with index ${this._index}`);
    return new Proxy(this, {
      get(target, prop) {
        const wasm = engine2.wasm;
        const definition = wasm._materialDefinitions[target._definition];
        const param = definition.get(prop);
        if (!param)
          return target[prop];
        if (wasm._wl_material_get_param_value(target._index, param.index, wasm._tempMem)) {
          const type = param.type;
          switch (type.type) {
            case MaterialParamType.UnsignedInt:
              return type.componentCount == 1 ? wasm._tempMemUint32[0] : new Uint32Array(wasm.HEAPU32.buffer, wasm._tempMem, type.componentCount);
            case MaterialParamType.Int:
              return type.componentCount == 1 ? wasm._tempMemInt[0] : new Int32Array(wasm.HEAP32.buffer, wasm._tempMem, type.componentCount);
            case MaterialParamType.Float:
              return type.componentCount == 1 ? wasm._tempMemFloat[0] : new Float32Array(wasm.HEAPF32.buffer, wasm._tempMem, type.componentCount);
            case MaterialParamType.Sampler:
              return engine2.textures.wrap(wasm._tempMemInt[0]);
            default:
              throw new Error(`Invalid type ${type.type} on parameter ${param.index} for material ${target._index}`);
          }
        }
      },
      set(target, prop, value) {
        const wasm = engine2.wasm;
        const definition = wasm._materialDefinitions[target._definition];
        const param = definition.get(prop);
        if (!param) {
          target[prop] = value;
          return true;
        }
        const type = param.type;
        switch (type.type) {
          case MaterialParamType.UnsignedInt:
          case MaterialParamType.Int:
          case MaterialParamType.Sampler:
            const v = value.id ?? value;
            wasm._wl_material_set_param_value_uint(target._index, param.index, v);
            break;
          case MaterialParamType.Float:
            let count = 1;
            if (typeof value === "number") {
              wasm._tempMemFloat[0] = value;
            } else {
              count = value.length;
              for (let i = 0; i < count; ++i)
                wasm._tempMemFloat[i] = value[i];
            }
            wasm._wl_material_set_param_value_float(target._index, param.index, wasm._tempMem, count);
            break;
          case MaterialParamType.Font:
            throw new Error("Setting font properties is currently unsupported.");
        }
        return true;
      }
    });
  }
  /** @deprecated Use {@link #pipeline} instead. */
  get shader() {
    return this.pipeline;
  }
  /** Name of the pipeline used by this material. */
  get pipeline() {
    const wasm = this._engine.wasm;
    return wasm.UTF8ToString(wasm._wl_material_get_pipeline(this._index));
  }
  /** Hosting engine instance. */
  get engine() {
    return this._engine;
  }
  /**
   * Create a copy of the underlying native material.
   *
   * @returns Material clone.
   */
  clone() {
    const id = this._engine.wasm._wl_material_clone(this._index);
    return id > 0 ? new Material(this._engine, id) : null;
  }
  /**
   * Checks equality by comparing whether the wrapped native material ids are
   * equal.
   *
   * @param otherMaterial Material to check equality with.
   * @returns Whether this material equals the given material.
   *
   * @since 1.0.0
   */
  equals(otherMaterial) {
    if (!otherMaterial)
      return false;
    return this._index === otherMaterial._index;
  }
  /**
   * Wrap a native material index.
   *
   * @param engine Engine instance.
   * @param index The index.
   * @returns Material instance or `null` if index <= 0.
   *
   * @deprecated Please use `new Material()` instead.
   */
  static wrap(engine2, index) {
    return index > 0 ? new Material(engine2, index) : null;
  }
};
var Animation = class {
  /** Index of the mesh in the manager. @hidden */
  _index;
  /** Wonderland Engine instance. @hidden */
  _engine;
  /**
   * @param index Index in the manager
   */
  constructor(engine2 = WL, index) {
    this._engine = engine2;
    this._index = index;
  }
  /** Duration of this animation. */
  get duration() {
    return this._engine.wasm._wl_animation_get_duration(this._index);
  }
  /** Number of tracks in this animation. */
  get trackCount() {
    return this._engine.wasm._wl_animation_get_trackCount(this._index);
  }
  /**
   * Clone this animation retargeted to a new set of objects.
   *
   * The clone shares most of the data with the original and is therefore
   * light-weight.
   *
   * **Experimental:** This API might change in upcoming versions.
   *
   * If retargeting to {@link Skin}, the join names will be used to determine a mapping
   * from the previous skin to the new skin. The source skin will be retrieved from
   * the first track in the animation that targets a joint.
   *
   * @param newTargets New targets per track. Expected to have
   *      {@link Animation#trackCount} elements or to be a {@link Skin}.
   * @returns The retargeted clone of this animation.
   */
  retarget(newTargets) {
    const wasm = this._engine.wasm;
    if (newTargets instanceof Skin) {
      const animId2 = wasm._wl_animation_retargetToSkin(this._index, newTargets._index);
      return new Animation(this._engine, animId2);
    }
    if (newTargets.length != this.trackCount) {
      throw Error("Expected " + this.trackCount.toString() + " targets, but got " + newTargets.length.toString());
    }
    const ptr = wasm._malloc(2 * newTargets.length);
    for (let i = 0; i < newTargets.length; ++i) {
      wasm.HEAPU16[ptr >> 1 + i] = newTargets[i].objectId;
    }
    const animId = wasm._wl_animation_retarget(this._index, ptr);
    wasm._free(ptr);
    return new Animation(this._engine, animId);
  }
  /**
   * Checks equality by comparing whether the wrapped native animation ids
   * are equal.
   *
   * @param otherAnimation Animation to check equality with.
   * @returns Whether this animation equals the given animation.
   *
   * @since 1.0.0
   */
  equals(otherAnimation) {
    if (!otherAnimation)
      return false;
    return this._index === otherAnimation._index;
  }
};
var Skin = class {
  /**
   * Index of the skin in the manager.
   * @hidden
   */
  _index;
  /** Wonderland Engine instance. @hidden */
  _engine;
  constructor(engine2, index) {
    this._engine = engine2;
    this._index = index;
  }
  /** Amount of joints in this skin. */
  get jointCount() {
    return this._engine.wasm._wl_skin_get_joint_count(this._index);
  }
  /** Joints object ids for this skin */
  get jointIds() {
    const wasm = this._engine.wasm;
    return new Uint16Array(wasm.HEAPU16.buffer, wasm._wl_skin_joint_ids(this._index), this.jointCount);
  }
  /**
   * Dual quaternions in a flat array of size 8 times {@link jointCount}.
   *
   * Inverse bind transforms of the skin.
   */
  get inverseBindTransforms() {
    const wasm = this._engine.wasm;
    return new Float32Array(wasm.HEAPF32.buffer, wasm._wl_skin_inverse_bind_transforms(this._index), 8 * this.jointCount);
  }
  /**
   * Vectors in a flat array of size 3 times {@link jointCount}.
   *
   * Inverse bind scalings of the skin.
   */
  get inverseBindScalings() {
    const wasm = this._engine.wasm;
    return new Float32Array(wasm.HEAPF32.buffer, wasm._wl_skin_inverse_bind_scalings(this._index), 3 * this.jointCount);
  }
  /**
   * Checks equality by comparing whether the wrapped native skin ids are
   * equal.
   *
   * @param otherSkin Skin to check equality with.
   * @returns Whether this skin equals the given skin.
   *
   * @since 1.0.0
   */
  equals(otherSkin) {
    if (!otherSkin)
      return false;
    return this._index === otherSkin._index;
  }
};

// ../../ar-tracking/node_modules/@wonderlandengine/api/dist/wasm.js
var _componentDefaults = /* @__PURE__ */ new Map([
  [Type.Bool, false],
  [Type.Int, 0],
  [Type.Float, 0],
  [Type.String, ""],
  [Type.Enum, void 0],
  [Type.Object, null],
  [Type.Mesh, null],
  [Type.Texture, null],
  [Type.Material, null],
  [Type.Animation, null],
  [Type.Skin, null],
  [Type.Color, [0, 0, 0, 1]]
]);

// ../../ar-tracking/dist/src/AR-session.js
var _ARSession = class {
  /** A tracking provider is a library that provides tracking capabilities, e.g.,
   * WebXR Device API, 8th Wall, mind-ar-js, etc.
   */
  _trackingProviders = [];
  /** Current running provider when AR session is running */
  _currentTrackingProvider = null;
  /** Emits and event when the AR session is ready */
  onARSessionReady = new RetainEmitter();
  /** Emits and event when an AR session was started */
  onSessionStart = new RetainEmitter();
  /** Emits and event when an AR session was ended */
  onSessionEnd = new Emitter();
  _engine;
  _sceneHasLoaded = false;
  _arSessionIsReady = false;
  /** Wonderland Engine instance this AR session is running on */
  get engine() {
    return this._engine;
  }
  /**
   * @returns a shallow copy of all registered providers
   */
  get registeredProviders() {
    return [...this._trackingProviders];
  }
  /**
   * Retrieve tracking implementation for given type.
   *
   * @returns The tracking instance or `null` if no provider was
   *     able to provide given tracking type
   */
  getTrackingProvider(type, component) {
    for (const p of this._trackingProviders) {
      if (p.supports(type))
        return p.createTracking(type, component);
    }
    throw new Error("No AR provider found for tracking type " + type);
  }
  /**
   * Get or create an AR session attached to given engine
   *
   * @param engine The engine to retrieve the AR session for.
   * @returns The current AR session, or creates one if none exists.
   */
  static getSessionForEngine(engine2) {
    if (!this.engines.has(engine2)) {
      this.engines.set(engine2, new _ARSession(engine2));
    }
    return this.engines.get(engine2);
  }
  /* Private, as ARSession instances should be created with getSessionForEngine */
  constructor(engine2) {
    this._engine = engine2;
  }
  /**
   * Registers tracking provider.
   *
   * Makes sure it is loaded and hooks into providers onSessionStart,
   * onSessionLoaded events.
   */
  async registerTrackingProvider(provider) {
    if (this._trackingProviders.includes(provider)) {
      return;
    }
    if (!this._engine.onSceneLoaded.has(this.onWLSceneLoaded)) {
      this._engine.onSceneLoaded.add(this.onWLSceneLoaded);
    }
    this._trackingProviders.push(provider);
    provider.onSessionStart.add(this.onProviderSessionStart);
    provider.onSessionEnd.add(this.onProviderSessionEnd);
    await provider.load();
    this.checkProviderLoadProgress();
  }
  /* Loop through all providers to check if they are loaded.
   * If that's the case and the WL scene itself is loaded -
   * notify all the subscribers about the `onARSessionReady` */
  checkProviderLoadProgress = () => {
    if (this._arSessionIsReady === true)
      return;
    if (this._trackingProviders.every((p) => p.loaded === true) && this._sceneHasLoaded) {
      this._arSessionIsReady = true;
      this.onARSessionReady.notify();
    }
  };
  onWLSceneLoaded = () => {
    this._sceneHasLoaded = true;
    this.checkProviderLoadProgress();
  };
  /** Stop a running AR session (if any) */
  stopARSession() {
    if (this._currentTrackingProvider === null) {
      console.warn("No tracking session is active, nothing will happen");
    }
    this._currentTrackingProvider?.endSession();
    this._currentTrackingProvider = null;
  }
  /* Called by AR providers when they started an AR session.
   * @param provider The provider to pass to onSessionStart */
  onProviderSessionStart = (provider) => {
    this._currentTrackingProvider = provider;
    this.onSessionStart.notify(provider);
  };
  /**
  /* Called by AR providers when they ended an AR session.
   * @param provider The provider to pass to onSessionEnd */
  onProviderSessionEnd = (provider) => {
    this.onSessionStart.reset();
    this.onSessionEnd.notify(provider);
  };
};
var ARSession = _ARSession;
__publicField(ARSession, "engines", /* @__PURE__ */ new WeakMap());

// ../../ar-tracking/dist/src/AR-provider.js
var ARProvider = class {
  _engine;
  get engine() {
    return this._engine;
  }
  constructor(engine2) {
    this._engine = engine2;
  }
  /**
   * onSessionStart - array of callbacks to be called when the tracking implementation has started tracking.
   * It is NOT necessary called immediately after startSession is called
   */
  onSessionStart = new Emitter();
  /**
   * onSessionEnd - array of callbacks to be called when the tracking implementation has stoped tracking.
   * It is NOT necessary called immediately after endSession is called
   */
  onSessionEnd = new Emitter();
  // Tracking implementation has beed loaded
  loaded = false;
};

// ../../ar-tracking/dist/src/tracking-mode.js
var TrackingMode = class {
  component;
  provider;
  constructor(provider, component) {
    this.component = component;
    this.provider = provider;
  }
};
var FaceAttachmentPoint;
(function(FaceAttachmentPoint2) {
  FaceAttachmentPoint2["Forehead"] = "forehead";
  FaceAttachmentPoint2["EyeOuterCornerLeft"] = "eye outer corner left";
  FaceAttachmentPoint2["EyeOuterCornerRight"] = "eye outer corner right";
  FaceAttachmentPoint2["EyeBrowInnerLeft"] = "eyebrow inner left";
  FaceAttachmentPoint2["EyeBrowInnerRight"] = "eyebrow inner right";
  FaceAttachmentPoint2["EyeBrowCenterLeft"] = "eyebrow center left";
  FaceAttachmentPoint2["EyeBrowCenterRight"] = "eyebrow center right";
  FaceAttachmentPoint2["EyeBrowOuterLeft"] = "eyebrow outer left";
  FaceAttachmentPoint2["EyeBrowOuterRight"] = "eyebrow outer right";
  FaceAttachmentPoint2["EarLeft"] = "ear left";
  FaceAttachmentPoint2["EarRight"] = "ear right";
  FaceAttachmentPoint2["EyeLeft"] = "eye left";
  FaceAttachmentPoint2["EyeRight"] = "eye right";
  FaceAttachmentPoint2["NoseBridge"] = "nose bridge";
  FaceAttachmentPoint2["NoseTip"] = "nose tip";
  FaceAttachmentPoint2["CheekLeft"] = "cheek left";
  FaceAttachmentPoint2["CheekRight"] = "cheek right";
  FaceAttachmentPoint2["Mouth"] = "mouth";
  FaceAttachmentPoint2["MouthCornerLeft"] = "mouth corner left";
  FaceAttachmentPoint2["MouthCornerRight"] = "mouth corner right";
  FaceAttachmentPoint2["UpperLip"] = "upper lip";
  FaceAttachmentPoint2["LowerLip"] = "lower lip";
  FaceAttachmentPoint2["Chin"] = "chin";
})(FaceAttachmentPoint || (FaceAttachmentPoint = {}));

// ../../ar-tracking/dist/src/tracking-type.js
var TrackingType;
(function(TrackingType2) {
  TrackingType2[TrackingType2["SLAM"] = 0] = "SLAM";
  TrackingType2[TrackingType2["Image"] = 1] = "Image";
  TrackingType2[TrackingType2["Face"] = 2] = "Face";
  TrackingType2[TrackingType2["VPS"] = 3] = "VPS";
})(TrackingType || (TrackingType = {}));

// ../../ar-tracking/dist/src/components/AR-Camera.js
var ARCamera = class extends Component {
};

// ../../ar-tracking/dist/src/components/AR-face-tracking-camera.js
var __decorate2 = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
    r = Reflect.decorate(decorators, target, key, desc);
  else
    for (var i = decorators.length - 1; i >= 0; i--)
      if (d = decorators[i])
        r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ARFaceTrackingCamera = class extends ARCamera {
  cameraDirection;
  _trackingImpl;
  get onFaceLoading() {
    return this._trackingImpl.onFaceLoading;
  }
  get onFaceFound() {
    return this._trackingImpl.onFaceFound;
  }
  get onFaceUpdate() {
    return this._trackingImpl.onFaceUpdate;
  }
  get onFaceLost() {
    return this._trackingImpl.onFaceLost;
  }
  init() {
    this._trackingImpl = ARSession.getSessionForEngine(this.engine).getTrackingProvider(TrackingType.Face, this);
  }
  start() {
    if (!this.object.getComponent("view")) {
      throw new Error("AR-camera requires a view component");
    }
    if (this._trackingImpl.init)
      this._trackingImpl.init();
  }
  startSession = async () => {
    if (this.active) {
      this._trackingImpl.startSession();
    }
  };
  endSession = async () => {
    if (this.active) {
      this._trackingImpl.endSession();
    }
  };
  onDeactivate() {
    this._trackingImpl.endSession();
  }
};
__publicField(ARFaceTrackingCamera, "TypeName", "ar-face-tracking-camera");
__decorate2([
  property.enum(["front", "back"], "front")
], ARFaceTrackingCamera.prototype, "cameraDirection", void 0);

// ../../ar-tracking/dist/src/components/AR-image-tracking-camera.js
var __decorate3 = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
    r = Reflect.decorate(decorators, target, key, desc);
  else
    for (var i = decorators.length - 1; i >= 0; i--)
      if (d = decorators[i])
        r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ARImageTrackingCamera = class extends ARCamera {
  enableSLAM;
  _trackingImpl;
  get onImageScanning() {
    return this._trackingImpl.onImageScanning;
  }
  get onImageFound() {
    return this._trackingImpl.onImageFound;
  }
  get onImageUpdate() {
    return this._trackingImpl.onImageUpdate;
  }
  get onImageLost() {
    return this._trackingImpl.onImageLost;
  }
  init() {
    this._trackingImpl = ARSession.getSessionForEngine(this.engine).getTrackingProvider(TrackingType.Image, this);
  }
  start() {
    if (this._trackingImpl.init)
      this._trackingImpl.init();
  }
  startSession = async () => {
    if (this.active) {
      this._trackingImpl.startSession();
    }
  };
  endSession = async () => {
    if (this.active) {
      this._trackingImpl.endSession();
    }
  };
  onDeactivate() {
    this._trackingImpl.endSession();
  }
};
__publicField(ARImageTrackingCamera, "TypeName", "ar-image-tracking-camera");
__decorate3([
  property.bool(false)
  // Improves tracking, reduces performance
], ARImageTrackingCamera.prototype, "enableSLAM", void 0);

// node_modules/wasm-feature-detect/dist/esm/index.js
var simd2 = async () => WebAssembly.validate(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 123, 3, 2, 1, 0, 10, 10, 1, 8, 0, 65, 0, 253, 15, 253, 98, 11]));
var threads2 = () => (async (e) => {
  try {
    return "undefined" != typeof MessageChannel && new MessageChannel().port1.postMessage(new SharedArrayBuffer(1)), WebAssembly.validate(e);
  } catch (e2) {
    return false;
  }
})(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 4, 1, 96, 0, 0, 3, 2, 1, 0, 5, 4, 1, 3, 1, 1, 10, 11, 1, 9, 0, 65, 0, 254, 16, 2, 0, 26, 11]));

// node_modules/@wonderlandengine/api/dist/property.js
var Type2;
(function(Type4) {
  Type4[Type4["Native"] = 1] = "Native";
  Type4[Type4["Bool"] = 2] = "Bool";
  Type4[Type4["Int"] = 4] = "Int";
  Type4[Type4["Float"] = 8] = "Float";
  Type4[Type4["String"] = 16] = "String";
  Type4[Type4["Enum"] = 32] = "Enum";
  Type4[Type4["Object"] = 64] = "Object";
  Type4[Type4["Mesh"] = 128] = "Mesh";
  Type4[Type4["Texture"] = 256] = "Texture";
  Type4[Type4["Material"] = 512] = "Material";
  Type4[Type4["Animation"] = 1024] = "Animation";
  Type4[Type4["Skin"] = 2048] = "Skin";
  Type4[Type4["Color"] = 4096] = "Color";
})(Type2 || (Type2 = {}));
var Property2 = {
  /**
   * Create an boolean property.
   *
   * @param defaultValue The default value. If not provided, defaults to `false`.
   */
  bool(defaultValue = false) {
    return { type: Type2.Bool, default: defaultValue };
  },
  /**
   * Create an integer property.
   *
   * @param defaultValue The default value. If not provided, defaults to `0`.
   */
  int(defaultValue = 0) {
    return { type: Type2.Int, default: defaultValue };
  },
  /**
   * Create an float property.
   *
   * @param defaultValue The default value. If not provided, defaults to `0.0`.
   */
  float(defaultValue = 0) {
    return { type: Type2.Float, default: defaultValue };
  },
  /**
   * Create an string property.
   *
   * @param defaultValue The default value. If not provided, defaults to `''`.
   */
  string(defaultValue = "") {
    return { type: Type2.String, default: defaultValue };
  },
  /**
   * Create an enumeration property.
   *
   * @param values The list of values.
   * @param defaultValue The default value. Can be a string or an index into
   *     `values`. If not provided, defaults to the first element.
   */
  enum(values, defaultValue) {
    return { type: Type2.Enum, values, default: defaultValue };
  },
  /** Create an {@link Object3D} reference property. */
  object(opts) {
    return { type: Type2.Object, default: null, required: opts?.required ?? false };
  },
  /** Create a {@link Mesh} reference property. */
  mesh(opts) {
    return { type: Type2.Mesh, default: null, required: opts?.required ?? false };
  },
  /** Create a {@link Texture} reference property. */
  texture(opts) {
    return { type: Type2.Texture, default: null, required: opts?.required ?? false };
  },
  /** Create a {@link Material} reference property. */
  material(opts) {
    return { type: Type2.Material, default: null, required: opts?.required ?? false };
  },
  /** Create an {@link Animation} reference property. */
  animation(opts) {
    return { type: Type2.Animation, default: null, required: opts?.required ?? false };
  },
  /** Create a {@link Skin} reference property. */
  skin(opts) {
    return { type: Type2.Skin, default: null, required: opts?.required ?? false };
  },
  /**
   * Create a color property.
   *
   * @param r The red component, in the range [0; 1].
   * @param g The green component, in the range [0; 1].
   * @param b The blue component, in the range [0; 1].
   * @param a The alpha component, in the range [0; 1].
   */
  color(r = 0, g = 0, b = 0, a = 1) {
    return { type: Type2.Color, default: [r, g, b, a] };
  }
};

// node_modules/@wonderlandengine/api/dist/decorators.js
function propertyDecorator2(data) {
  return function(target, propertyKey) {
    const ctor = target.constructor;
    ctor.Properties = ctor.hasOwnProperty("Properties") ? ctor.Properties : {};
    ctor.Properties[propertyKey] = data;
  };
}
function enumerable2() {
  return function(_, __, descriptor) {
    descriptor.enumerable = true;
  };
}
function nativeProperty2() {
  return function(target, propertyKey, descriptor) {
    enumerable2()(target, propertyKey, descriptor);
    propertyDecorator2({ type: Type2.Native })(target, propertyKey);
  };
}
var property2 = {};
for (const name in Property2) {
  property2[name] = (...args) => {
    const functor = Property2[name];
    return propertyDecorator2(functor(...args));
  };
}

// node_modules/@wonderlandengine/api/dist/utils/object.js
function isString2(value) {
  if (value === "")
    return true;
  return value && (typeof value === "string" || value.constructor === String);
}
function isNumber2(value) {
  if (value === null || value === void 0)
    return false;
  return typeof value === "number" || value.constructor === Number;
}

// node_modules/@wonderlandengine/api/dist/utils/event.js
var Emitter2 = class {
  /**
   * List of listeners to trigger when `notify` is called.
   *
   * @hidden
   */
  _listeners = [];
  /**
   * Register a new listener to be triggered on {@link Emitter.notify}.
   *
   * Basic usage:
   *
   * ```js
   * emitter.add((data) => {
   *     console.log('event received!');
   *     console.log(data);
   * });
   * ```
   *
   * Automatically remove the listener when an event is received:
   *
   * ```js
   * emitter.add((data) => {
   *     console.log('event received!');
   *     console.log(data);
   * }, {once: true});
   * ```
   *
   * @param listener The callback to register.
   * @param opts The listener options. For more information, please have a look
   *     at the {@link ListenerOptions} interface.
   *
   * @returns Reference to self (for method chaining)
   */
  add(listener, opts = {}) {
    const { once = false, id = void 0 } = opts;
    this._listeners.push({ id, once, callback: listener });
    return this;
  }
  /**
   * Equivalent to {@link Emitter.add}.
   *
   * @param listeners The callback(s) to register.
   * @returns Reference to self (for method chaining).
   *
   * @deprecated Please use {@link Emitter.add} instead.
   */
  push(...listeners) {
    for (const cb of listeners)
      this.add(cb);
    return this;
  }
  /**
   * Register a new listener to be triggered on {@link Emitter.notify}.
   *
   * Once notified, the listener will be automatically removed.
   *
   * The method is equivalent to calling {@link Emitter.add} with:
   *
   * ```js
   * emitter.add(listener, {once: true});
   * ```
   *
   * @param listener The callback to register.
   *
   * @returns Reference to self (for method chaining).
   */
  once(listener) {
    return this.add(listener, { once: true });
  }
  /**
   * Remove a registered listener.
   *
   * Usage with a callback:
   *
   * ```js
   * const listener = (data) => console.log(data);
   * emitter.add(listener);
   *
   * // Remove using the callback reference:
   * emitter.remove(listener);
   * ```
   *
   * Usage with an id:
   *
   * ```js
   * emitter.add((data) => console.log(data), {id: 'my-callback'});
   *
   * // Remove using the id:
   * emitter.remove('my-callback');
   * ```
   *
   * Using identifiers, you will need to ensure your value is unique to avoid
   * removing listeners from other libraries, e.g.,:
   *
   * ```js
   * emitter.add((data) => console.log(data), {id: 'non-unique'});
   * // This second listener could be added by a third-party library.
   * emitter.add((data) => console.log('Hello From Library!'), {id: 'non-unique'});
   *
   * // Ho Snap! This also removed the library listener!
   * emitter.remove('non-unique');
   * ```
   *
   * The identifier can be any type. However, remember that the comparison will be
   * by-value for primitive types (string, number), but by reference for objects.
   *
   * Example:
   *
   * ```js
   * emitter.add(() => console.log('Hello'), {id: {value: 42}});
   * emitter.add(() => console.log('World!'), {id: {value: 42}});
   * emitter.remove({value: 42}); // None of the above listeners match!
   * emitter.notify(); // Prints 'Hello' and 'World!'.
   * ```
   *
   * Here, both emitters have id `{value: 42}`, but the comparison is made by reference. Thus,
   * the `remove()` call has no effect. We can make it work by doing:
   *
   * ```js
   * const id = {value: 42};
   * emitter.add(() => console.log('Hello'), {id});
   * emitter.add(() => console.log('World!'), {id});
   * emitter.remove(id); // Same reference, it works!
   * emitter.notify(); // Doesn't print.
   * ```
   *
   * @param listener The registered callback or a value representing the `id`.
   *
   * @returns Reference to self (for method chaining)
   */
  remove(listener) {
    const listeners = this._listeners;
    for (let i = 0; i < listeners.length; ++i) {
      const target = listeners[i];
      if (target.callback === listener || target.id === listener) {
        listeners.splice(i--, 1);
      }
    }
    return this;
  }
  /**
   * Check whether the listener is registered.
   *
   * @note This method performs a linear search.
   *
   * @param listener The registered callback or a value representing the `id`.
   * @returns `true` if the handle is found, `false` otherwise.
   */
  has(listener) {
    const listeners = this._listeners;
    for (let i = 0; i < listeners.length; ++i) {
      const target = listeners[i];
      if (target.callback === listener || target.id === listener)
        return true;
    }
    return false;
  }
  /**
   * Notify listeners with the given data object.
   *
   * @note This method ensures all listeners are called even if
   * an exception is thrown. For (possibly) faster notification,
   * please use {@link Emitter.notifyUnsafe}.
   *
   * @param data The data to pass to listener when invoked.
   */
  notify(...data) {
    const listeners = this._listeners;
    for (let i = 0; i < listeners.length; ++i) {
      const listener = listeners[i];
      if (listener.once)
        listeners.splice(i--, 1);
      try {
        listener.callback(...data);
      } catch (e) {
        console.error(e);
      }
    }
  }
  /**
   * Notify listeners with the given data object.
   *
   * @note Because this method doesn't catch exceptions, some listeners
   * will be skipped on a throw. Please use {@link Emitter.notify} for safe
   * notification.
   *
   * @param data The data to pass to listener when invoked.
   */
  notifyUnsafe(...data) {
    const listeners = this._listeners;
    for (let i = 0; i < listeners.length; ++i) {
      const listener = listeners[i];
      if (listener.once)
        listeners.splice(i--, 1);
      listener.callback(...data);
    }
  }
  /**
   * Return a promise that will resolve on the next event.
   *
   * @note The promise might never resolve if no event is sent.
   *
   * @returns A promise that resolves with the data passed to
   *     {@link Emitter.notify}.
   */
  promise() {
    return new Promise((res, _) => {
      this.once((...args) => {
        if (args.length > 1) {
          res(args);
        } else {
          res(args[0]);
        }
      });
    });
  }
  /** Number of listeners. */
  get listenerCount() {
    return this._listeners.length;
  }
  /** `true` if it has no listeners, `false` otherwise. */
  get isEmpty() {
    return this.listenerCount === 0;
  }
};
var RetainEmitterUndefined2 = {};
var RetainEmitter2 = class extends Emitter2 {
  /** Pre-resolved data. @hidden */
  _event = RetainEmitterUndefined2;
  /**
   * Emitter target used to reset the state of this emitter.
   *
   * @hidden
   */
  _reset;
  /** @override */
  add(listener, opts) {
    const immediate = opts?.immediate ?? true;
    if (this._event !== RetainEmitterUndefined2 && immediate) {
      listener(...this._event);
    }
    super.add(listener, opts);
    return this;
  }
  /**
   * @override
   *
   * @param listener The callback to register.
   * @param immediate If `true`, directly resolves if the emitter retains a value.
   *
   * @returns Reference to self (for method chaining).
   */
  once(listener, immediate) {
    return this.add(listener, { once: true, immediate });
  }
  /** @override */
  notify(...data) {
    this._event = data;
    super.notify(...data);
  }
  /** @override */
  notifyUnsafe(...data) {
    this._event = data;
    super.notifyUnsafe(...data);
  }
  /**
   * Reset the state of the emitter.
   *
   * Further call to {@link Emitter.add} will not automatically resolve,
   * until a new call to {@link Emitter.notify} is performed.
   *
   * @returns Reference to self (for method chaining)
   */
  reset() {
    this._event = RetainEmitterUndefined2;
    return this;
  }
  /** Returns the retained data, or `undefined` if no data was retained. */
  get data() {
    return this.isDataRetained ? this._event : void 0;
  }
  /** `true` if data is retained from the last event, `false` otherwise. */
  get isDataRetained() {
    return this._event !== RetainEmitterUndefined2;
  }
};

// node_modules/@wonderlandengine/api/dist/wonderland.js
var __decorate4 = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
    r = Reflect.decorate(decorators, target, key, desc);
  else
    for (var i = decorators.length - 1; i >= 0; i--)
      if (d = decorators[i])
        r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var Collider2;
(function(Collider4) {
  Collider4[Collider4["Sphere"] = 0] = "Sphere";
  Collider4[Collider4["AxisAlignedBox"] = 1] = "AxisAlignedBox";
  Collider4[Collider4["Box"] = 2] = "Box";
})(Collider2 || (Collider2 = {}));
var Alignment2;
(function(Alignment4) {
  Alignment4[Alignment4["Left"] = 0] = "Left";
  Alignment4[Alignment4["Center"] = 1] = "Center";
  Alignment4[Alignment4["Right"] = 2] = "Right";
})(Alignment2 || (Alignment2 = {}));
var Justification2;
(function(Justification4) {
  Justification4[Justification4["Line"] = 0] = "Line";
  Justification4[Justification4["Middle"] = 1] = "Middle";
  Justification4[Justification4["Top"] = 2] = "Top";
  Justification4[Justification4["Bottom"] = 3] = "Bottom";
})(Justification2 || (Justification2 = {}));
var TextEffect2;
(function(TextEffect4) {
  TextEffect4[TextEffect4["None"] = 0] = "None";
  TextEffect4[TextEffect4["Outline"] = 1] = "Outline";
})(TextEffect2 || (TextEffect2 = {}));
var InputType2;
(function(InputType4) {
  InputType4[InputType4["Head"] = 0] = "Head";
  InputType4[InputType4["EyeLeft"] = 1] = "EyeLeft";
  InputType4[InputType4["EyeRight"] = 2] = "EyeRight";
  InputType4[InputType4["ControllerLeft"] = 3] = "ControllerLeft";
  InputType4[InputType4["ControllerRight"] = 4] = "ControllerRight";
  InputType4[InputType4["RayLeft"] = 5] = "RayLeft";
  InputType4[InputType4["RayRight"] = 6] = "RayRight";
})(InputType2 || (InputType2 = {}));
var LightType2;
(function(LightType4) {
  LightType4[LightType4["Point"] = 0] = "Point";
  LightType4[LightType4["Spot"] = 1] = "Spot";
  LightType4[LightType4["Sun"] = 2] = "Sun";
})(LightType2 || (LightType2 = {}));
var AnimationState2;
(function(AnimationState4) {
  AnimationState4[AnimationState4["Playing"] = 0] = "Playing";
  AnimationState4[AnimationState4["Paused"] = 1] = "Paused";
  AnimationState4[AnimationState4["Stopped"] = 2] = "Stopped";
})(AnimationState2 || (AnimationState2 = {}));
var ForceMode2;
(function(ForceMode4) {
  ForceMode4[ForceMode4["Force"] = 0] = "Force";
  ForceMode4[ForceMode4["Impulse"] = 1] = "Impulse";
  ForceMode4[ForceMode4["VelocityChange"] = 2] = "VelocityChange";
  ForceMode4[ForceMode4["Acceleration"] = 3] = "Acceleration";
})(ForceMode2 || (ForceMode2 = {}));
var CollisionEventType2;
(function(CollisionEventType4) {
  CollisionEventType4[CollisionEventType4["Touch"] = 0] = "Touch";
  CollisionEventType4[CollisionEventType4["TouchLost"] = 1] = "TouchLost";
  CollisionEventType4[CollisionEventType4["TriggerTouch"] = 2] = "TriggerTouch";
  CollisionEventType4[CollisionEventType4["TriggerTouchLost"] = 3] = "TriggerTouchLost";
})(CollisionEventType2 || (CollisionEventType2 = {}));
var Shape2;
(function(Shape4) {
  Shape4[Shape4["None"] = 0] = "None";
  Shape4[Shape4["Sphere"] = 1] = "Sphere";
  Shape4[Shape4["Capsule"] = 2] = "Capsule";
  Shape4[Shape4["Box"] = 3] = "Box";
  Shape4[Shape4["Plane"] = 4] = "Plane";
  Shape4[Shape4["ConvexMesh"] = 5] = "ConvexMesh";
  Shape4[Shape4["TriangleMesh"] = 6] = "TriangleMesh";
})(Shape2 || (Shape2 = {}));
var MeshAttribute2;
(function(MeshAttribute4) {
  MeshAttribute4[MeshAttribute4["Position"] = 0] = "Position";
  MeshAttribute4[MeshAttribute4["Tangent"] = 1] = "Tangent";
  MeshAttribute4[MeshAttribute4["Normal"] = 2] = "Normal";
  MeshAttribute4[MeshAttribute4["TextureCoordinate"] = 3] = "TextureCoordinate";
  MeshAttribute4[MeshAttribute4["Color"] = 4] = "Color";
  MeshAttribute4[MeshAttribute4["JointId"] = 5] = "JointId";
  MeshAttribute4[MeshAttribute4["JointWeight"] = 6] = "JointWeight";
})(MeshAttribute2 || (MeshAttribute2 = {}));
var MaterialParamType2;
(function(MaterialParamType4) {
  MaterialParamType4[MaterialParamType4["UnsignedInt"] = 0] = "UnsignedInt";
  MaterialParamType4[MaterialParamType4["Int"] = 1] = "Int";
  MaterialParamType4[MaterialParamType4["Float"] = 2] = "Float";
  MaterialParamType4[MaterialParamType4["Sampler"] = 3] = "Sampler";
  MaterialParamType4[MaterialParamType4["Font"] = 4] = "Font";
})(MaterialParamType2 || (MaterialParamType2 = {}));
function isMeshShape2(shape) {
  return shape === Shape2.ConvexMesh || shape === Shape2.TriangleMesh;
}
function isBaseComponentClass(value) {
  return !!value && value.hasOwnProperty("_isBaseComponent") && value._isBaseComponent;
}
var UP_VECTOR = [0, 1, 0];
var SQRT_3 = Math.sqrt(3);
var Component2 = class {
  /** Manager index. @hidden */
  _manager;
  /** Instance index. @hidden */
  _id;
  /**
   * Object containing this object.
   *
   * **Note**: This is cached for faster retrieval.
   *
   * @hidden
   */
  _object;
  /** Wonderland Engine instance. @hidden */
  _engine;
  /**
   * Create a new instance
   *
   * @param engine The engine instance.
   * @param manager Index of the manager.
   * @param id WASM component instance index.
   *
   * @hidden
   */
  constructor(engine2, manager = -1, id = -1) {
    this._engine = engine2;
    this._manager = manager;
    this._id = id;
    this._object = null;
  }
  /** Hosting engine instance. */
  get engine() {
    return this._engine;
  }
  /** The name of this component's type */
  get type() {
    const ctor = this.constructor;
    return ctor.TypeName ?? this._engine.wasm._typeNameFor(this._manager);
  }
  /** The object this component is attached to. */
  get object() {
    if (!this._object) {
      const objectId = this._engine.wasm._wl_component_get_object(this._manager, this._id);
      this._object = this._engine.wrapObject(objectId);
    }
    return this._object;
  }
  /**
   * Set whether this component is active.
   *
   * Activating/deactivating a component comes at a small cost of reordering
   * components in the respective component manager. This function therefore
   * is not a trivial assignment.
   *
   * Does nothing if the component is already activated/deactivated.
   *
   * @param active New active state.
   */
  set active(active) {
    this._engine.wasm._wl_component_setActive(this._manager, this._id, active);
  }
  /**
   * Whether this component is active
   */
  get active() {
    return this._engine.wasm._wl_component_isActive(this._manager, this._id) != 0;
  }
  /**
   * Remove this component from its objects and destroy it.
   *
   * It is best practice to set the component to `null` after,
   * to ensure it does not get used later.
   *
   * ```js
   *    c.destroy();
   *    c = null;
   * ```
   * @since 0.9.0
   */
  destroy() {
    if (this._manager < 0 || this._id < 0)
      return;
    const cache = this._engine._componentCache[this._manager];
    if (cache)
      cache[this._id] = null;
    this._engine.wasm._wl_component_remove(this._manager, this._id);
    this._manager = -1;
    this._id = -1;
  }
  /**
   * Checks equality by comparing whether the wrapped native component ids
   * and component manager types are equal.
   *
   * @param otherComponent Component to check equality with.
   * @returns Whether this component equals the given component.
   */
  equals(otherComponent) {
    if (!otherComponent)
      return false;
    return this._manager == otherComponent._manager && this._id == otherComponent._id;
  }
  /**
   * Reset the component properties to default.
   *
   * @note This is automatically called during the component instantiation.
   *
   * @returns Reference to self (for method chaining).
   */
  resetProperties() {
    const ctor = this.constructor;
    const properties = ctor.Properties;
    if (!properties)
      return this;
    for (const name in properties) {
      this[name] = properties[name].default;
    }
    return this;
  }
  /** @deprecated Use {@link Component.resetProperties} instead. */
  reset() {
    return this.resetProperties();
  }
  /**
   * Validate the properties on this instance.
   *
   * @throws If any of the required properties isn't initialized
   * on this instance.
   */
  validateProperties() {
    const ctor = this.constructor;
    if (!ctor.Properties)
      return;
    for (const name in ctor.Properties) {
      if (!ctor.Properties[name].required)
        continue;
      if (!this[name]) {
        throw new Error(`Property '${name}' is required but was not initialized`);
      }
    }
  }
  /**
   * Trigger the component {@link Component.init} method.
   *
   * @note Use this method instead of directly calling {@link Component.init},
   * because this method creates an handler for the {@link Component.start}.
   *
   * @note This api is meant to be used internally.
   *
   * @hidden
   */
  _triggerInit() {
    if (this.init) {
      try {
        this.init();
      } catch (e) {
        console.error(`Exception during ${this.type} init() on object ${this.object.name}`);
        console.error(e);
      }
    }
    const oldActivate = this.onActivate;
    this.onActivate = function() {
      this.onActivate = oldActivate;
      let failed = false;
      try {
        this.validateProperties();
      } catch (e) {
        console.error(`Exception during ${this.type} validateProperties() on object ${this.object.name}`);
        console.error(e);
        failed = true;
      }
      try {
        this.start?.();
      } catch (e) {
        console.error(`Exception during ${this.type} start() on object ${this.object.name}`);
        console.error(e);
        failed = true;
      }
      if (failed) {
        this.active = false;
        return;
      }
      if (!this.onActivate)
        return;
      try {
        this.onActivate();
      } catch (e) {
        console.error(`Exception during ${this.type} onActivate() on object ${this.object.name}`);
        console.error(e);
      }
    };
  }
  /**
   * Trigger the component {@link Component.update} method.
   *
   * @note This api is meant to be used internally.
   *
   * @hidden
   */
  _triggerUpdate(dt) {
    if (!this.update)
      return;
    try {
      this.update(dt);
    } catch (e) {
      console.error(`Exception during ${this.type} update() on object ${this.object.name}`);
      console.error(e);
      if (this._engine.wasm._deactivate_component_on_error) {
        this.active = false;
      }
    }
  }
  /**
   * Trigger the component {@link Component.onActivate} method.
   *
   * @note This api is meant to be used internally.
   *
   * @hidden
   */
  _triggerOnActivate() {
    if (!this.onActivate)
      return;
    try {
      this.onActivate();
    } catch (e) {
      console.error(`Exception during ${this.type} onActivate() on object ${this.object.name}`);
      console.error(e);
    }
  }
  /**
   * Trigger the component {@link Component.onDeactivate} method.
   *
   * @note This api is meant to be used internally.
   *
   * @hidden
   */
  _triggerOnDeactivate() {
    if (!this.onDeactivate)
      return;
    try {
      this.onDeactivate();
    } catch (e) {
      console.error(`Exception during ${this.type} onDeactivate() on object ${this.object.name}`);
      console.error(e);
    }
  }
  /**
   * Trigger the component {@link Component.onDestroy} method.
   *
   * @note This api is meant to be used internally.
   *
   * @hidden
   */
  _triggerOnDestroy() {
    if (!this.onDestroy)
      return;
    try {
      this.onDestroy();
    } catch (e) {
      console.error(`Exception during ${this.type} onDestroy() on object ${this.object.name}`);
      console.error(e);
    }
  }
};
/**
 * `true` for every class inheriting from this class.
 *
 * @note This is a workaround for `instanceof` to prevent issues
 * that could arise when an application ends up using multiple API versions.
 *
 * @hidden
 */
__publicField(Component2, "_isBaseComponent", true);
/**
 * Unique identifier for this component class.
 *
 * This is used to register, add, and retrieve components of a given type.
 */
__publicField(Component2, "TypeName");
/**
 * Properties of this component class.
 *
 * Properties are public attributes that can be configured via the
 * Wonderland Editor.
 *
 * Example:
 *
 * ```js
 * import { Component, Type } from '@wonderlandengine/api';
 * class MyComponent extends Component {
 *     static TypeName = 'my-component';
 *     static Properties = {
 *         myBoolean: { type: Type.Boolean, default: false },
 *         myFloat: { type: Type.Float, default: false },
 *         myTexture: { type: Type.Texture, default: null },
 *     };
 * }
 * ```
 *
 * Properties are automatically added to each component instance, and are
 * accessible like any JS attribute:
 *
 * ```js
 * // Creates a new component and set each properties value:
 * const myComponent = object.addComponent(MyComponent, {
 *     myBoolean: true,
 *     myFloat: 42.0,
 *     myTexture: null
 * });
 *
 * // You can also override the properties on the instance:
 * myComponent.myBoolean = false;
 * myComponent.myFloat = -42.0;
 * ```
 *
 * ## References
 *
 * Reference types (i.e., mesh, object, etc...) can also be listed as **required**:
 *
 * ```js
 * import {Component, Property} from '@wonderlandengine/api';
 *
 * class MyComponent extends Component {
 *     static Properties = {
 *         myObject: Property.object({required: true}),
 *         myAnimation: Property.animation({required: true}),
 *         myTexture: Property.texture({required: true}),
 *         myMesh: Property.mesh({required: true}),
 *     }
 * }
 * ```
 *
 * Please note that references are validated **once** before the call to {@link Component.start} only,
 * via the {@link Component.validateProperties} method.
 */
__publicField(Component2, "Properties");
/**
 * When set to `true`, the child class inherits from the parent
 * properties, as shown in the following example:
 *
 * ```js
 * import {Component, Property} from '@wonderlandengine/api';
 *
 * class Parent extends Component {
 *     static TypeName = 'parent';
 *     static Properties = {parentName: Property.string('parent')}
 * }
 *
 * class Child extends Parent {
 *     static TypeName = 'child';
 *     static Properties = {name: Property.string('child')}
 *     static InheritProperties = true;
 *
 *     start() {
 *         // Works because `InheritProperties` is `true`.
 *         console.log(`${this.name} inherits from ${this.parentName}`);
 *     }
 * }
 *
 * @note Properties defined in descendant classes will override properties
 * with the same name defined in ancestor classes.
 *
 * Defaults to `true`.
 */
__publicField(Component2, "InheritProperties");
/**
 * This was never released in an official version, we are keeping it
 * to easy transition to the new API.
 *
 * @deprecated Use {@link Component.onRegister} instead.
 * @hidden
 */
__publicField(Component2, "Dependencies");
/**
 * Called when this component class is registered.
 *
 * @example
 *
 * This callback can be used to register dependencies of a component,
 * e.g., component classes that need to be registered in order to add
 * them at runtime with {@link Object3D.addComponent}, independent of whether
 * they are used in the editor.
 *
 * ```js
 * class Spawner extends Component {
 *     static TypeName = 'spawner';
 *
 *     static onRegister(engine) {
 *         engine.registerComponent(SpawnedComponent);
 *     }
 *
 *     // You can now use addComponent with SpawnedComponent
 * }
 * ```
 *
 * @example
 *
 * This callback can be used to register different implementations of a
 * component depending on client features or API versions.
 *
 * ```js
 * // Properties need to be the same for all implementations!
 * const SharedProperties = {};
 *
 * class Anchor extends Component {
 *     static TypeName = 'spawner';
 *     static Properties = SharedProperties;
 *
 *     static onRegister(engine) {
 *         if(navigator.xr === undefined) {
 *             /* WebXR unsupported, keep this dummy component *\/
 *             return;
 *         }
 *         /* WebXR supported! Override already registered dummy implementation
 *          * with one depending on hit-test API support *\/
 *         engine.registerComponent(window.HitTestSource === undefined ?
 *             AnchorWithoutHitTest : AnchorWithHitTest);
 *     }
 *
 *     // This one implements no functions
 * }
 * ```
 */
__publicField(Component2, "onRegister");
var BrokenComponent = class extends Component2 {
};
__publicField(BrokenComponent, "TypeName", "__broken-component__");
function inheritProperties(target) {
  if (!target.TypeName)
    return;
  const chain = [];
  let curr = target;
  while (curr && !isBaseComponentClass(curr)) {
    const comp = curr;
    const needsMerge = comp.hasOwnProperty("InheritProperties") ? comp.InheritProperties : true;
    if (!needsMerge)
      break;
    if (comp.TypeName && comp.hasOwnProperty("Properties")) {
      chain.push(comp.Properties);
    }
    curr = Object.getPrototypeOf(curr);
  }
  if (chain.length <= 1)
    return;
  const merged = {};
  for (let i = chain.length - 1; i >= 0; --i) {
    Object.assign(merged, chain[i]);
  }
  target.Properties = merged;
}
var _CollisionComponent2 = class extends Component2 {
  /** Collision component collider */
  get collider() {
    return this._engine.wasm._wl_collision_component_get_collider(this._id);
  }
  /**
   * Set collision component collider.
   *
   * @param collider Collider of the collision component.
   */
  set collider(collider) {
    this._engine.wasm._wl_collision_component_set_collider(this._id, collider);
  }
  /**
   * Collision component extents.
   *
   * If {@link collider} returns {@link Collider.Sphere}, only the first
   * component of the returned vector is used.
   */
  get extents() {
    const wasm = this._engine.wasm;
    return new Float32Array(wasm.HEAPF32.buffer, wasm._wl_collision_component_get_extents(this._id), 3);
  }
  /**
   * Set collision component extents.
   *
   * If {@link collider} returns {@link Collider.Sphere}, only the first
   * component of the passed vector is used.
   *
   * Example:
   *
   * ```js
   * // Spans 1 unit on the x-axis, 2 on the y-axis, 3 on the z-axis.
   * collision.extent = [1, 2, 3];
   * ```
   *
   * @param extents Extents of the collision component, expects a
   *      3 component array.
   */
  set extents(extents) {
    this.extents.set(extents);
  }
  /**
   * Get collision component radius.
   *
   * @note If {@link collider} is not {@link Collider.Sphere}, the returned value
   * corresponds to the radius of a sphere enclosing the shape.
   *
   * Example:
   * ```js
   * sphere.radius = 3.0;
   * console.log(sphere.radius); // 3.0
   *
   * box.extents = [2.0, 2.0, 2.0];
   * console.log(box.radius); // 1.732...
   * ```
   *
   */
  get radius() {
    const wasm = this._engine.wasm;
    if (this.collider === Collider2.Sphere)
      return wasm.HEAPF32[wasm._wl_collision_component_get_extents(this._id) >> 2];
    const extents = new Float32Array(wasm.HEAPF32.buffer, wasm._wl_collision_component_get_extents(this._id), 3);
    const x2 = extents[0] * extents[0];
    const y2 = extents[1] * extents[1];
    const z2 = extents[2] * extents[2];
    return Math.sqrt(x2 + y2 + z2) / 2;
  }
  /**
   * Set collision component radius.
   *
   * @param radius Radius of the collision component
   *
   * @note If {@link collider} is not {@link Collider.Sphere},
   * the extents are set to form a square that fits a sphere with the provided radius.
   *
   * Example:
   * ```js
   * aabbCollision.radius = 2.0; // AABB fits a sphere of radius 2.0
   * boxCollision.radius = 3.0; // Box now fits a sphere of radius 3.0, keeping orientation
   * ```
   *
   */
  set radius(radius) {
    const length = this.collider === Collider2.Sphere ? radius : 2 * radius / SQRT_3;
    this.extents.set([length, length, length]);
  }
  /**
   * Collision component group.
   *
   * The groups is a bitmask that is compared to other components in {@link CollisionComponent#queryOverlaps}
   * or the group in {@link Scene#rayCast}.
   *
   * Colliders that have no common groups will not overlap with each other. If a collider
   * has none of the groups set for {@link Scene#rayCast}, the ray will not hit it.
   *
   * Each bit represents belonging to a group, see example.
   *
   * ```js
   *    // c belongs to group 2
   *    c.group = (1 << 2);
   *
   *    // c belongs to group 0
   *    c.group = (1 << 0);
   *
   *    // c belongs to group 0 *and* 2
   *    c.group = (1 << 0) | (1 << 2);
   *
   *    (c.group & (1 << 2)) != 0; // true
   *    (c.group & (1 << 7)) != 0; // false
   * ```
   */
  get group() {
    return this._engine.wasm._wl_collision_component_get_group(this._id);
  }
  /**
   * Set collision component group.
   *
   * @param group Group mask of the collision component.
   */
  set group(group) {
    this._engine.wasm._wl_collision_component_set_group(this._id, group);
  }
  /**
   * Query overlapping objects.
   *
   * Usage:
   *
   * ```js
   * const collision = object.getComponent('collision');
   * const overlaps = collision.queryOverlaps();
   * for(const otherCollision of overlaps) {
   *     const otherObject = otherCollision.object;
   *     console.log(`Collision with object ${otherObject.objectId}`);
   * }
   * ```
   *
   * @returns Collision components overlapping this collider.
   */
  queryOverlaps() {
    const count = this._engine.wasm._wl_collision_component_query_overlaps(this._id, this._engine.wasm._tempMem, this._engine.wasm._tempMemSize >> 1);
    const overlaps = new Array(count);
    for (let i = 0; i < count; ++i) {
      overlaps[i] = new _CollisionComponent2(this._engine, this._manager, this._engine.wasm._tempMemUint16[i]);
    }
    return overlaps;
  }
};
var CollisionComponent2 = _CollisionComponent2;
/** @override */
__publicField(CollisionComponent2, "TypeName", "collision");
__decorate4([
  nativeProperty2()
], CollisionComponent2.prototype, "collider", null);
__decorate4([
  nativeProperty2()
], CollisionComponent2.prototype, "extents", null);
__decorate4([
  nativeProperty2()
], CollisionComponent2.prototype, "group", null);
var TextComponent2 = class extends Component2 {
  /** Text component alignment. */
  get alignment() {
    return this._engine.wasm._wl_text_component_get_horizontal_alignment(this._id);
  }
  /**
   * Set text component alignment.
   *
   * @param alignment Alignment for the text component.
   */
  set alignment(alignment) {
    this._engine.wasm._wl_text_component_set_horizontal_alignment(this._id, alignment);
  }
  /** Text component justification. */
  get justification() {
    return this._engine.wasm._wl_text_component_get_vertical_alignment(this._id);
  }
  /**
   * Set text component justification.
   *
   * @param justification Justification for the text component.
   */
  set justification(justification) {
    this._engine.wasm._wl_text_component_set_vertical_alignment(this._id, justification);
  }
  /** Text component character spacing. */
  get characterSpacing() {
    return this._engine.wasm._wl_text_component_get_character_spacing(this._id);
  }
  /**
   * Set text component character spacing.
   *
   * @param spacing Character spacing for the text component.
   */
  set characterSpacing(spacing) {
    this._engine.wasm._wl_text_component_set_character_spacing(this._id, spacing);
  }
  /** Text component line spacing. */
  get lineSpacing() {
    return this._engine.wasm._wl_text_component_get_line_spacing(this._id);
  }
  /**
   * Set text component line spacing
   *
   * @param spacing Line spacing for the text component
   */
  set lineSpacing(spacing) {
    this._engine.wasm._wl_text_component_set_line_spacing(this._id, spacing);
  }
  /** Text component effect. */
  get effect() {
    return this._engine.wasm._wl_text_component_get_effect(this._id);
  }
  /**
   * Set text component effect
   *
   * @param effect Effect for the text component
   */
  set effect(effect) {
    this._engine.wasm._wl_text_component_set_effect(this._id, effect);
  }
  /** Text component text. */
  get text() {
    const wasm = this._engine.wasm;
    const ptr = wasm._wl_text_component_get_text(this._id);
    return wasm.UTF8ToString(ptr);
  }
  /**
   * Set text component text.
   *
   * @param text Text of the text component.
   */
  set text(text) {
    const wasm = this._engine.wasm;
    wasm._wl_text_component_set_text(this._id, wasm.tempUTF8(text.toString()));
  }
  /**
   * Set material to render the text with.
   *
   * @param material New material.
   */
  set material(material) {
    const matIndex = material ? material._index : 0;
    this._engine.wasm._wl_text_component_set_material(this._id, matIndex);
  }
  /** Material used to render the text. */
  get material() {
    const id = this._engine.wasm._wl_text_component_get_material(this._id);
    return id > 0 ? new Material2(this._engine, id) : null;
  }
};
/** @override */
__publicField(TextComponent2, "TypeName", "text");
__decorate4([
  nativeProperty2()
], TextComponent2.prototype, "alignment", null);
__decorate4([
  nativeProperty2()
], TextComponent2.prototype, "justification", null);
__decorate4([
  nativeProperty2()
], TextComponent2.prototype, "characterSpacing", null);
__decorate4([
  nativeProperty2()
], TextComponent2.prototype, "lineSpacing", null);
__decorate4([
  nativeProperty2()
], TextComponent2.prototype, "effect", null);
__decorate4([
  nativeProperty2()
], TextComponent2.prototype, "text", null);
__decorate4([
  nativeProperty2()
], TextComponent2.prototype, "material", null);
var ViewComponent2 = class extends Component2 {
  /** Projection matrix. */
  get projectionMatrix() {
    const wasm = this._engine.wasm;
    return new Float32Array(wasm.HEAPF32.buffer, wasm._wl_view_component_get_projection_matrix(this._id), 16);
  }
  /** ViewComponent near clipping plane value. */
  get near() {
    return this._engine.wasm._wl_view_component_get_near(this._id);
  }
  /**
   * Set near clipping plane distance for the view.
   *
   * If an XR session is active, the change will apply in the
   * following frame, otherwise the change is immediate.
   *
   * @param near Near depth value.
   */
  set near(near) {
    this._engine.wasm._wl_view_component_set_near(this._id, near);
  }
  /** Far clipping plane value. */
  get far() {
    return this._engine.wasm._wl_view_component_get_far(this._id);
  }
  /**
   * Set far clipping plane distance for the view.
   *
   * If an XR session is active, the change will apply in the
   * following frame, otherwise the change is immediate.
   *
   * @param far Near depth value.
   */
  set far(far) {
    this._engine.wasm._wl_view_component_set_far(this._id, far);
  }
  /**
   * Get the horizontal field of view for the view, **in degrees**.
   *
   * If an XR session is active, this returns the field of view reported by
   * the device, regardless of the fov that was set.
   */
  get fov() {
    return this._engine.wasm._wl_view_component_get_fov(this._id);
  }
  /**
   * Set the horizontal field of view for the view, **in degrees**.
   *
   * If an XR session is active, the field of view reported by the device is
   * used and this value is ignored. After the XR session ends, the new value
   * is applied.
   *
   * @param fov Horizontal field of view, **in degrees**.
   */
  set fov(fov) {
    this._engine.wasm._wl_view_component_set_fov(this._id, fov);
  }
};
/** @override */
__publicField(ViewComponent2, "TypeName", "view");
__decorate4([
  enumerable2()
], ViewComponent2.prototype, "projectionMatrix", null);
__decorate4([
  nativeProperty2()
], ViewComponent2.prototype, "near", null);
__decorate4([
  nativeProperty2()
], ViewComponent2.prototype, "far", null);
__decorate4([
  nativeProperty2()
], ViewComponent2.prototype, "fov", null);
var InputComponent2 = class extends Component2 {
  /** Input component type */
  get inputType() {
    return this._engine.wasm._wl_input_component_get_type(this._id);
  }
  /**
   * Set input component type.
   *
   * @params New input component type.
   */
  set inputType(type) {
    this._engine.wasm._wl_input_component_set_type(this._id, type);
  }
  /**
   * WebXR Device API input source associated with this input component,
   * if type {@link InputType.ControllerLeft} or {@link InputType.ControllerRight}.
   */
  get xrInputSource() {
    const xrSession = this._engine.xrSession;
    if (xrSession) {
      for (let inputSource of xrSession.inputSources) {
        if (inputSource.handedness == this.handedness) {
          return inputSource;
        }
      }
    }
    return null;
  }
  /**
   * 'left', 'right' or `null` depending on the {@link InputComponent#inputType}.
   */
  get handedness() {
    const inputType = this.inputType;
    if (inputType == InputType2.ControllerRight || inputType == InputType2.RayRight || inputType == InputType2.EyeRight)
      return "right";
    if (inputType == InputType2.ControllerLeft || inputType == InputType2.RayLeft || inputType == InputType2.EyeLeft)
      return "left";
    return null;
  }
};
/** @override */
__publicField(InputComponent2, "TypeName", "input");
__decorate4([
  nativeProperty2()
], InputComponent2.prototype, "inputType", null);
__decorate4([
  enumerable2()
], InputComponent2.prototype, "xrInputSource", null);
__decorate4([
  enumerable2()
], InputComponent2.prototype, "handedness", null);
var LightComponent2 = class extends Component2 {
  getColor(out = new Float32Array(3)) {
    const wasm = this._engine.wasm;
    const ptr = wasm._wl_light_component_get_color(this._id) / 4;
    out[0] = wasm.HEAPF32[ptr];
    out[1] = wasm.HEAPF32[ptr + 1];
    out[2] = wasm.HEAPF32[ptr + 2];
    return out;
  }
  /**
   * Set light color.
   *
   * @param c New color array/vector, expected to have at least 3 elements.
   * @since 1.0.0
   */
  setColor(c) {
    const wasm = this._engine.wasm;
    const ptr = wasm._wl_light_component_get_color(this._id) / 4;
    wasm.HEAPF32[ptr] = c[0];
    wasm.HEAPF32[ptr + 1] = c[1];
    wasm.HEAPF32[ptr + 2] = c[2];
  }
  /**
   * View on the light color.
   *
   * @note Prefer to use {@link getColor} in performance-critical code.
   */
  get color() {
    const wasm = this._engine.wasm;
    return new Float32Array(wasm.HEAPF32.buffer, wasm._wl_light_component_get_color(this._id), 3);
  }
  /**
   * Set light color.
   *
   * @param c Color of the light component.
   *
   * @note Prefer to use {@link setColor} in performance-critical code.
   */
  set color(c) {
    this.color.set(c);
  }
  /** Light type. */
  get lightType() {
    return this._engine.wasm._wl_light_component_get_type(this._id);
  }
  /**
   * Set light type.
   *
   * @param lightType Type of the light component.
   */
  set lightType(t) {
    this._engine.wasm._wl_light_component_set_type(this._id, t);
  }
  /**
   * Light intensity.
   * @since 1.0.0
   */
  get intensity() {
    return this._engine.wasm._wl_light_component_get_intensity(this._id);
  }
  /**
   * Set light intensity.
   *
   * @param intensity Intensity of the light component.
   * @since 1.0.0
   */
  set intensity(intensity) {
    this._engine.wasm._wl_light_component_set_intensity(this._id, intensity);
  }
  /**
   * Outer angle for spot lights, in degrees.
   * @since 1.0.0
   */
  get outerAngle() {
    return this._engine.wasm._wl_light_component_get_outerAngle(this._id);
  }
  /**
   * Set outer angle for spot lights.
   *
   * @param angle Outer angle, in degrees.
   * @since 1.0.0
   */
  set outerAngle(angle) {
    this._engine.wasm._wl_light_component_set_outerAngle(this._id, angle);
  }
  /**
   * Inner angle for spot lights, in degrees.
   * @since 1.0.0
   */
  get innerAngle() {
    return this._engine.wasm._wl_light_component_get_innerAngle(this._id);
  }
  /**
   * Set inner angle for spot lights.
   *
   * @param angle Inner angle, in degrees.
   * @since 1.0.0
   */
  set innerAngle(angle) {
    this._engine.wasm._wl_light_component_set_innerAngle(this._id, angle);
  }
  /**
   * Whether the light casts shadows.
   * @since 1.0.0
   */
  get shadows() {
    return !!this._engine.wasm._wl_light_component_get_shadows(this._id);
  }
  /**
   * Set whether the light casts shadows.
   *
   * @param b Whether the light casts shadows.
   * @since 1.0.0
   */
  set shadows(b) {
    this._engine.wasm._wl_light_component_set_shadows(this._id, b);
  }
  /**
   * Range for shadows.
   * @since 1.0.0
   */
  get shadowRange() {
    return this._engine.wasm._wl_light_component_get_shadowRange(this._id);
  }
  /**
   * Set range for shadows.
   *
   * @param range Range for shadows.
   * @since 1.0.0
   */
  set shadowRange(range) {
    this._engine.wasm._wl_light_component_set_shadowRange(this._id, range);
  }
  /**
   * Bias value for shadows.
   * @since 1.0.0
   */
  get shadowBias() {
    return this._engine.wasm._wl_light_component_get_shadowBias(this._id);
  }
  /**
   * Set bias value for shadows.
   *
   * @param bias Bias for shadows.
   * @since 1.0.0
   */
  set shadowBias(bias) {
    this._engine.wasm._wl_light_component_set_shadowBias(this._id, bias);
  }
  /**
   * Normal bias value for shadows.
   * @since 1.0.0
   */
  get shadowNormalBias() {
    return this._engine.wasm._wl_light_component_get_shadowNormalBias(this._id);
  }
  /**
   * Set normal bias value for shadows.
   *
   * @param bias Normal bias for shadows.
   * @since 1.0.0
   */
  set shadowNormalBias(bias) {
    this._engine.wasm._wl_light_component_set_shadowNormalBias(this._id, bias);
  }
  /**
   * Texel size for shadows.
   * @since 1.0.0
   */
  get shadowTexelSize() {
    return this._engine.wasm._wl_light_component_get_shadowTexelSize(this._id);
  }
  /**
   * Set texel size for shadows.
   *
   * @param size Texel size for shadows.
   * @since 1.0.0
   */
  set shadowTexelSize(size) {
    this._engine.wasm._wl_light_component_set_shadowTexelSize(this._id, size);
  }
  /**
   * Cascade count for {@link LightType.Sun} shadows.
   * @since 1.0.0
   */
  get cascadeCount() {
    return this._engine.wasm._wl_light_component_get_cascadeCount(this._id);
  }
  /**
   * Set cascade count for {@link LightType.Sun} shadows.
   *
   * @param count Cascade count.
   * @since 1.0.0
   */
  set cascadeCount(count) {
    this._engine.wasm._wl_light_component_set_cascadeCount(this._id, count);
  }
};
/** @override */
__publicField(LightComponent2, "TypeName", "light");
__decorate4([
  nativeProperty2()
], LightComponent2.prototype, "color", null);
__decorate4([
  nativeProperty2()
], LightComponent2.prototype, "lightType", null);
__decorate4([
  nativeProperty2()
], LightComponent2.prototype, "intensity", null);
__decorate4([
  nativeProperty2()
], LightComponent2.prototype, "outerAngle", null);
__decorate4([
  nativeProperty2()
], LightComponent2.prototype, "innerAngle", null);
__decorate4([
  nativeProperty2()
], LightComponent2.prototype, "shadows", null);
__decorate4([
  nativeProperty2()
], LightComponent2.prototype, "shadowRange", null);
__decorate4([
  nativeProperty2()
], LightComponent2.prototype, "shadowBias", null);
__decorate4([
  nativeProperty2()
], LightComponent2.prototype, "shadowNormalBias", null);
__decorate4([
  nativeProperty2()
], LightComponent2.prototype, "shadowTexelSize", null);
__decorate4([
  nativeProperty2()
], LightComponent2.prototype, "cascadeCount", null);
var AnimationComponent2 = class extends Component2 {
  /**
   * Set animation to play.
   *
   * Make sure to {@link Animation#retarget} the animation to affect the
   * right objects.
   *
   * @param anim Animation to play.
   */
  set animation(anim) {
    this._engine.wasm._wl_animation_component_set_animation(this._id, anim ? anim._index : 0);
  }
  /** Animation set for this component */
  get animation() {
    const id = this._engine.wasm._wl_animation_component_get_animation(this._id);
    return id > 0 ? new Animation2(this._engine, id) : null;
  }
  /**
   * Set play count. Set to `0` to loop indefinitely.
   *
   * @param playCount Number of times to repeat the animation.
   */
  set playCount(playCount) {
    this._engine.wasm._wl_animation_component_set_playCount(this._id, playCount);
  }
  /** Number of times the animation is played. */
  get playCount() {
    return this._engine.wasm._wl_animation_component_get_playCount(this._id);
  }
  /**
   * Set speed. Set to negative values to run the animation backwards.
   *
   * Setting speed has an immediate effect for the current frame's update
   * and will continue with the speed from the current point in the animation.
   *
   * @param speed New speed at which to play the animation.
   * @since 0.8.10
   */
  set speed(speed) {
    this._engine.wasm._wl_animation_component_set_speed(this._id, speed);
  }
  /**
   * Speed factor at which the animation is played.
   *
   * @since 0.8.10
   */
  get speed() {
    return this._engine.wasm._wl_animation_component_get_speed(this._id);
  }
  /** Current playing state of the animation */
  get state() {
    return this._engine.wasm._wl_animation_component_state(this._id);
  }
  /**
   * Play animation.
   *
   * If the animation is currently paused, resumes from that position. If the
   * animation is already playing, does nothing.
   *
   * To restart the animation, {@link AnimationComponent#stop} it first.
   */
  play() {
    this._engine.wasm._wl_animation_component_play(this._id);
  }
  /** Stop animation. */
  stop() {
    this._engine.wasm._wl_animation_component_stop(this._id);
  }
  /** Pause animation. */
  pause() {
    this._engine.wasm._wl_animation_component_pause(this._id);
  }
};
/** @override */
__publicField(AnimationComponent2, "TypeName", "animation");
__decorate4([
  nativeProperty2()
], AnimationComponent2.prototype, "animation", null);
__decorate4([
  nativeProperty2()
], AnimationComponent2.prototype, "playCount", null);
__decorate4([
  nativeProperty2()
], AnimationComponent2.prototype, "speed", null);
__decorate4([
  enumerable2()
], AnimationComponent2.prototype, "state", null);
var MeshComponent2 = class extends Component2 {
  /**
   * Set material to render the mesh with.
   *
   * @param material Material to render the mesh with.
   */
  set material(material) {
    this._engine.wasm._wl_mesh_component_set_material(this._id, material ? material._index : 0);
  }
  /** Material used to render the mesh. */
  get material() {
    const id = this._engine.wasm._wl_mesh_component_get_material(this._id);
    return id > 0 ? new Material2(this._engine, id) : null;
  }
  /** Mesh rendered by this component. */
  get mesh() {
    const id = this._engine.wasm._wl_mesh_component_get_mesh(this._id);
    return id > 0 ? new Mesh2(this._engine, id) : null;
  }
  /**
   * Set mesh to rendered with this component.
   *
   * @param mesh Mesh rendered by this component.
   */
  set mesh(mesh) {
    this._engine.wasm._wl_mesh_component_set_mesh(this._id, mesh ? mesh._index : 0);
  }
  /** Skin for this mesh component. */
  get skin() {
    const id = this._engine.wasm._wl_mesh_component_get_skin(this._id);
    return id > 0 ? new Skin2(this._engine, id) : null;
  }
  /**
   * Set skin to transform this mesh component.
   *
   * @param skin Skin to use for rendering skinned meshes.
   */
  set skin(skin) {
    this._engine.wasm._wl_mesh_component_set_skin(this._id, skin ? skin._index : 0);
  }
};
/** @override */
__publicField(MeshComponent2, "TypeName", "mesh");
__decorate4([
  nativeProperty2()
], MeshComponent2.prototype, "material", null);
__decorate4([
  nativeProperty2()
], MeshComponent2.prototype, "mesh", null);
__decorate4([
  nativeProperty2()
], MeshComponent2.prototype, "skin", null);
var LockAxis2;
(function(LockAxis4) {
  LockAxis4[LockAxis4["None"] = 0] = "None";
  LockAxis4[LockAxis4["X"] = 1] = "X";
  LockAxis4[LockAxis4["Y"] = 2] = "Y";
  LockAxis4[LockAxis4["Z"] = 4] = "Z";
})(LockAxis2 || (LockAxis2 = {}));
var PhysXComponent2 = class extends Component2 {
  /**
   * Set whether this rigid body is static.
   *
   * Setting this property only takes effect once the component
   * switches from inactive to active.
   *
   * @param b Whether the rigid body should be static.
   */
  set static(b) {
    this._engine.wasm._wl_physx_component_set_static(this._id, b);
  }
  /**
   * Whether this rigid body is static.
   *
   * This property returns whether the rigid body is *effectively*
   * static. If static property was set while the rigid body was
   * active, it will not take effect until the rigid body is set
   * inactive and active again. Until the component is set inactive,
   * this getter will return whether the rigid body is actually
   * static.
   */
  get static() {
    return !!this._engine.wasm._wl_physx_component_get_static(this._id);
  }
  /**
   * Set whether this rigid body is kinematic.
   *
   * @param b Whether the rigid body should be kinematic.
   */
  set kinematic(b) {
    this._engine.wasm._wl_physx_component_set_kinematic(this._id, b);
  }
  /**
   * Whether this rigid body is kinematic.
   */
  get kinematic() {
    return !!this._engine.wasm._wl_physx_component_get_kinematic(this._id);
  }
  /**
   * Set whether this rigid body's gravity is enabled.
   *
   * @param b Whether the rigid body's gravity should be enabled.
   */
  set gravity(b) {
    this._engine.wasm._wl_physx_component_set_gravity(this._id, b);
  }
  /**
   * Whether this rigid body's gravity flag is enabled.
   */
  get gravity() {
    return !!this._engine.wasm._wl_physx_component_get_gravity(this._id);
  }
  /**
   * Set whether this rigid body's simulate flag is enabled.
   *
   * @param b Whether the rigid body's simulate flag should be enabled.
   */
  set simulate(b) {
    this._engine.wasm._wl_physx_component_set_simulate(this._id, b);
  }
  /**
   * Whether this rigid body's simulate flag is enabled.
   */
  get simulate() {
    return !!this._engine.wasm._wl_physx_component_get_simulate(this._id);
  }
  /**
   * Set whether to allow simulation of this rigid body.
   *
   * {@link allowSimulation} and {@link trigger} can not be enabled at the
   * same time. Enabling {@link allowSimulation} while {@link trigger} is enabled
   * will disable {@link trigger}.
   *
   * @param b Whether to allow simulation of this rigid body.
   */
  set allowSimulation(b) {
    this._engine.wasm._wl_physx_component_set_allowSimulation(this._id, b);
  }
  /**
   * Whether to allow simulation of this rigid body.
   */
  get allowSimulation() {
    return !!this._engine.wasm._wl_physx_component_get_allowSimulation(this._id);
  }
  /**
   * Set whether this rigid body may be queried in ray casts.
   *
   * @param b Whether this rigid body may be queried in ray casts.
   */
  set allowQuery(b) {
    this._engine.wasm._wl_physx_component_set_allowQuery(this._id, b);
  }
  /**
   * Whether this rigid body may be queried in ray casts.
   */
  get allowQuery() {
    return !!this._engine.wasm._wl_physx_component_get_allowQuery(this._id);
  }
  /**
   * Set whether this physics body is a trigger.
   *
   * {@link allowSimulation} and {@link trigger} can not be enabled at the
   * same time. Enabling trigger while {@link allowSimulation} is enabled,
   * will disable {@link allowSimulation}.
   *
   * @param b Whether this physics body is a trigger.
   */
  set trigger(b) {
    this._engine.wasm._wl_physx_component_set_trigger(this._id, b);
  }
  /**
   * Whether this physics body is a trigger.
   */
  get trigger() {
    return !!this._engine.wasm._wl_physx_component_get_trigger(this._id);
  }
  /**
   * Set the shape for collision detection.
   *
   * @param s New shape.
   * @since 0.8.5
   */
  set shape(s) {
    this._engine.wasm._wl_physx_component_set_shape(this._id, s);
  }
  /** The shape for collision detection. */
  get shape() {
    return this._engine.wasm._wl_physx_component_get_shape(this._id);
  }
  /**
   * Set additional data for the shape.
   *
   * Retrieved only from {@link PhysXComponent#shapeData}.
   * @since 0.8.10
   */
  set shapeData(d) {
    if (d == null || !isMeshShape2(this.shape))
      return;
    this._engine.wasm._wl_physx_component_set_shape_data(this._id, d.index);
  }
  /**
   * Additional data for the shape.
   *
   * `null` for {@link Shape} values: `None`, `Sphere`, `Capsule`, `Box`, `Plane`.
   * `{index: n}` for `TriangleMesh` and `ConvexHull`.
   *
   * This data is currently only for passing onto or creating other {@link PhysXComponent}.
   * @since 0.8.10
   */
  get shapeData() {
    if (!isMeshShape2(this.shape))
      return null;
    return {
      index: this._engine.wasm._wl_physx_component_get_shape_data(this._id)
    };
  }
  /**
   * Set the shape extents for collision detection.
   *
   * @param e New extents for the shape.
   * @since 0.8.5
   */
  set extents(e) {
    this.extents.set(e);
  }
  /**
   * The shape extents for collision detection.
   */
  get extents() {
    const wasm = this._engine.wasm;
    const ptr = wasm._wl_physx_component_get_extents(this._id);
    return new Float32Array(wasm.HEAPF32.buffer, ptr, 3);
  }
  /**
   * Get staticFriction.
   */
  get staticFriction() {
    return this._engine.wasm._wl_physx_component_get_staticFriction(this._id);
  }
  /**
   * Set staticFriction.
   * @param v New staticFriction.
   */
  set staticFriction(v) {
    this._engine.wasm._wl_physx_component_set_staticFriction(this._id, v);
  }
  /**
   * Get dynamicFriction.
   */
  get dynamicFriction() {
    return this._engine.wasm._wl_physx_component_get_dynamicFriction(this._id);
  }
  /**
   * Set dynamicFriction
   * @param v New dynamicDamping.
   */
  set dynamicFriction(v) {
    this._engine.wasm._wl_physx_component_set_dynamicFriction(this._id, v);
  }
  /**
   * Get bounciness.
   * @since 0.9.0
   */
  get bounciness() {
    return this._engine.wasm._wl_physx_component_get_bounciness(this._id);
  }
  /**
   * Set bounciness.
   * @param v New bounciness.
   * @since 0.9.0
   */
  set bounciness(v) {
    this._engine.wasm._wl_physx_component_set_bounciness(this._id, v);
  }
  /**
   * Get linearDamping/
   */
  get linearDamping() {
    return this._engine.wasm._wl_physx_component_get_linearDamping(this._id);
  }
  /**
   * Set linearDamping.
   * @param v New linearDamping.
   */
  set linearDamping(v) {
    this._engine.wasm._wl_physx_component_set_linearDamping(this._id, v);
  }
  /** Get angularDamping. */
  get angularDamping() {
    return this._engine.wasm._wl_physx_component_get_angularDamping(this._id);
  }
  /**
   * Set angularDamping.
   * @param v New angularDamping.
   */
  set angularDamping(v) {
    this._engine.wasm._wl_physx_component_set_angularDamping(this._id, v);
  }
  /**
   * Set linear velocity.
   *
   * [PhysX Manual - "Velocity"](https://gameworksdocs.nvidia.com/PhysX/4.1/documentation/physxguide/Manual/RigidBodyDynamics.html#velocity)
   *
   * Has no effect, if the component is not active.
   *
   * @param v New linear velocity.
   */
  set linearVelocity(v) {
    this._engine.wasm._wl_physx_component_set_linearVelocity(this._id, v[0], v[1], v[2]);
  }
  /** Linear velocity or `[0, 0, 0]` if the component is not active. */
  get linearVelocity() {
    const wasm = this._engine.wasm;
    wasm._wl_physx_component_get_linearVelocity(this._id, wasm._tempMem);
    return new Float32Array(wasm.HEAPF32.buffer, wasm._tempMem, 3);
  }
  /**
   * Set angular velocity
   *
   * [PhysX Manual - "Velocity"](https://gameworksdocs.nvidia.com/PhysX/4.1/documentation/physxguide/Manual/RigidBodyDynamics.html#velocity)
   *
   * Has no effect, if the component is not active.
   *
   * @param v New angular velocity
   */
  set angularVelocity(v) {
    this._engine.wasm._wl_physx_component_set_angularVelocity(this._id, v[0], v[1], v[2]);
  }
  /** Angular velocity or `[0, 0, 0]` if the component is not active. */
  get angularVelocity() {
    const wasm = this._engine.wasm;
    wasm._wl_physx_component_get_angularVelocity(this._id, wasm._tempMem);
    return new Float32Array(wasm.HEAPF32.buffer, wasm._tempMem, 3);
  }
  /**
   * Set the components groups mask.
   *
   * @param flags New flags that need to be set.
   */
  set groupsMask(flags) {
    this._engine.wasm._wl_physx_component_set_groupsMask(this._id, flags);
  }
  /**
   * Get the components groups mask flags.
   *
   * Each bit represents membership to group, see example.
   *
   * ```js
   * // Assign c to group 2
   * c.groupsMask = (1 << 2);
   *
   * // Assign c to group 0
   * c.groupsMask  = (1 << 0);
   *
   * // Assign c to group 0 and 2
   * c.groupsMask = (1 << 0) | (1 << 2);
   *
   * (c.groupsMask & (1 << 2)) != 0; // true
   * (c.groupsMask & (1 << 7)) != 0; // false
   * ```
   */
  get groupsMask() {
    return this._engine.wasm._wl_physx_component_get_groupsMask(this._id);
  }
  /**
   * Set the components blocks mask.
   *
   * @param flags New flags that need to be set.
   */
  set blocksMask(flags) {
    this._engine.wasm._wl_physx_component_set_blocksMask(this._id, flags);
  }
  /**
   * Get the components blocks mask flags.
   *
   * Each bit represents membership to the block, see example.
   *
   * ```js
   * // Block overlap with any objects in group 2
   * c.blocksMask = (1 << 2);
   *
   * // Block overlap with any objects in group 0
   * c.blocksMask  = (1 << 0)
   *
   * // Block overlap with any objects in group 0 and 2
   * c.blocksMask = (1 << 0) | (1 << 2);
   *
   * (c.blocksMask & (1 << 2)) != 0; // true
   * (c.blocksMask & (1 << 7)) != 0; // false
   * ```
   */
  get blocksMask() {
    return this._engine.wasm._wl_physx_component_get_blocksMask(this._id);
  }
  /**
   * Set axes to lock for linear velocity.
   *
   * @param lock The Axis that needs to be set.
   *
   * Combine flags with Bitwise OR.
   * ```js
   * body.linearLockAxis = LockAxis.X | LockAxis.Y; // x and y set
   * body.linearLockAxis = LockAxis.X; // y unset
   * ```
   *
   * @note This has no effect if the component is static.
   */
  set linearLockAxis(lock) {
    this._engine.wasm._wl_physx_component_set_linearLockAxis(this._id, lock);
  }
  /**
   * Get the linear lock axes flags.
   *
   * To get the state of a specific flag, Bitwise AND with the LockAxis needed.
   *
   * ```js
   * if(body.linearLockAxis & LockAxis.Y) {
   *     console.log("The Y flag was set!");
   * }
   * ```
   *
   * @return axes that are currently locked for linear movement.
   */
  get linearLockAxis() {
    return this._engine.wasm._wl_physx_component_get_linearLockAxis(this._id);
  }
  /**
   * Set axes to lock for angular velocity.
   *
   * @param lock The Axis that needs to be set.
   *
   * ```js
   * body.angularLockAxis = LockAxis.X | LockAxis.Y; // x and y set
   * body.angularLockAxis = LockAxis.X; // y unset
   * ```
   *
   * @note This has no effect if the component is static.
   */
  set angularLockAxis(lock) {
    this._engine.wasm._wl_physx_component_set_angularLockAxis(this._id, lock);
  }
  /**
   * Get the angular lock axes flags.
   *
   * To get the state of a specific flag, Bitwise AND with the LockAxis needed.
   *
   * ```js
   * if(body.angularLockAxis & LockAxis.Y) {
   *     console.log("The Y flag was set!");
   * }
   * ```
   *
   * @return axes that are currently locked for angular movement.
   */
  get angularLockAxis() {
    return this._engine.wasm._wl_physx_component_get_angularLockAxis(this._id);
  }
  /**
   * Set mass.
   *
   * [PhysX Manual - "Mass Properties"](https://gameworksdocs.nvidia.com/PhysX/4.1/documentation/physxguide/Manual/RigidBodyDynamics.html#mass-properties)
   *
   * @param m New mass.
   */
  set mass(m) {
    this._engine.wasm._wl_physx_component_set_mass(this._id, m);
  }
  /** Mass */
  get mass() {
    return this._engine.wasm._wl_physx_component_get_mass(this._id);
  }
  /**
   * Set mass space interia tensor.
   *
   * [PhysX Manual - "Mass Properties"](https://gameworksdocs.nvidia.com/PhysX/4.1/documentation/physxguide/Manual/RigidBodyDynamics.html#mass-properties)
   *
   * Has no effect, if the component is not active.
   *
   * @param v New mass space interatia tensor.
   */
  set massSpaceInteriaTensor(v) {
    this._engine.wasm._wl_physx_component_set_massSpaceInertiaTensor(this._id, v[0], v[1], v[2]);
  }
  /**
   * Apply a force.
   *
   * [PhysX Manual - "Applying Forces and Torques"](https://gameworksdocs.nvidia.com/PhysX/4.1/documentation/physxguide/Manual/RigidBodyDynamics.html#applying-forces-and-torques)
   *
   * Has no effect, if the component is not active.
   *
   * @param f Force vector.
   * @param m Force mode, see {@link ForceMode}, default `Force`.
   * @param localForce Whether the force vector is in local space, default `false`.
   * @param p Position to apply force at, default is center of mass.
   * @param local Whether position is in local space, default `false`.
   */
  addForce(f, m = ForceMode2.Force, localForce = false, p, local = false) {
    const wasm = this._engine.wasm;
    if (!p) {
      wasm._wl_physx_component_addForce(this._id, f[0], f[1], f[2], m, localForce);
      return;
    }
    wasm._wl_physx_component_addForceAt(this._id, f[0], f[1], f[2], m, localForce, p[0], p[1], p[2], local);
  }
  /**
   * Apply torque.
   *
   * [PhysX Manual - "Applying Forces and Torques"](https://gameworksdocs.nvidia.com/PhysX/4.1/documentation/physxguide/Manual/RigidBodyDynamics.html#applying-forces-and-torques)
   *
   * Has no effect, if the component is not active.
   *
   * @param f Force vector.
   * @param m Force mode, see {@link ForceMode}, default `Force`.
   */
  addTorque(f, m = ForceMode2.Force) {
    this._engine.wasm._wl_physx_component_addTorque(this._id, f[0], f[1], f[2], m);
  }
  /**
   * Add on collision callback.
   *
   * @param callback Function to call when this rigid body (un)collides with any other.
   *
   * ```js
   *  let rigidBody = this.object.getComponent('physx');
   *  rigidBody.onCollision(function(type, other) {
   *      // Ignore uncollides
   *      if(type == CollisionEventType.TouchLost) return;
   *
   *      // Take damage on collision with enemies
   *      if(other.object.name.startsWith("enemy-")) {
   *          this.applyDamage(10);
   *      }
   *  }.bind(this));
   * ```
   *
   * @returns Id of the new callback for use with {@link PhysXComponent#removeCollisionCallback}.
   */
  onCollision(callback) {
    return this.onCollisionWith(this, callback);
  }
  /**
   * Add filtered on collision callback.
   *
   * @param otherComp Component for which callbacks will
   *        be triggered. If you pass this component, the method is equivalent to.
   *        {@link PhysXComponent#onCollision}.
   * @param callback Function to call when this rigid body
   *        (un)collides with `otherComp`.
   * @returns Id of the new callback for use with {@link PhysXComponent#removeCollisionCallback}.
   */
  onCollisionWith(otherComp, callback) {
    const physics = this._engine.physics;
    physics._callbacks[this._id] = physics._callbacks[this._id] || [];
    physics._callbacks[this._id].push(callback);
    return this._engine.wasm._wl_physx_component_addCallback(this._id, otherComp._id || this._id);
  }
  /**
   * Remove a collision callback added with {@link PhysXComponent#onCollision} or {@link PhysXComponent#onCollisionWith}.
   *
   * @param callbackId Callback id as returned by {@link PhysXComponent#onCollision} or {@link PhysXComponent#onCollisionWith}.
   * @throws When the callback does not belong to the component.
   * @throws When the callback does not exist.
   */
  removeCollisionCallback(callbackId) {
    const physics = this._engine.physics;
    const r = this._engine.wasm._wl_physx_component_removeCallback(this._id, callbackId);
    if (r)
      physics._callbacks[this._id].splice(-r);
  }
};
/** @override */
__publicField(PhysXComponent2, "TypeName", "physx");
__decorate4([
  nativeProperty2()
], PhysXComponent2.prototype, "static", null);
__decorate4([
  nativeProperty2()
], PhysXComponent2.prototype, "kinematic", null);
__decorate4([
  nativeProperty2()
], PhysXComponent2.prototype, "gravity", null);
__decorate4([
  nativeProperty2()
], PhysXComponent2.prototype, "simulate", null);
__decorate4([
  nativeProperty2()
], PhysXComponent2.prototype, "allowSimulation", null);
__decorate4([
  nativeProperty2()
], PhysXComponent2.prototype, "allowQuery", null);
__decorate4([
  nativeProperty2()
], PhysXComponent2.prototype, "trigger", null);
__decorate4([
  nativeProperty2()
], PhysXComponent2.prototype, "shape", null);
__decorate4([
  nativeProperty2()
], PhysXComponent2.prototype, "shapeData", null);
__decorate4([
  nativeProperty2()
], PhysXComponent2.prototype, "extents", null);
__decorate4([
  nativeProperty2()
], PhysXComponent2.prototype, "staticFriction", null);
__decorate4([
  nativeProperty2()
], PhysXComponent2.prototype, "dynamicFriction", null);
__decorate4([
  nativeProperty2()
], PhysXComponent2.prototype, "bounciness", null);
__decorate4([
  nativeProperty2()
], PhysXComponent2.prototype, "linearDamping", null);
__decorate4([
  nativeProperty2()
], PhysXComponent2.prototype, "angularDamping", null);
__decorate4([
  nativeProperty2()
], PhysXComponent2.prototype, "linearVelocity", null);
__decorate4([
  nativeProperty2()
], PhysXComponent2.prototype, "angularVelocity", null);
__decorate4([
  nativeProperty2()
], PhysXComponent2.prototype, "groupsMask", null);
__decorate4([
  nativeProperty2()
], PhysXComponent2.prototype, "blocksMask", null);
__decorate4([
  nativeProperty2()
], PhysXComponent2.prototype, "linearLockAxis", null);
__decorate4([
  nativeProperty2()
], PhysXComponent2.prototype, "angularLockAxis", null);
__decorate4([
  nativeProperty2()
], PhysXComponent2.prototype, "mass", null);
var Physics2 = class {
  /**
   * @hidden
   *
   * **Note**: This is public to emulate a `friend` accessor.
   */
  _callbacks;
  /** Wonderland Engine instance */
  _engine;
  /** Ray Hit */
  _rayHit;
  /** Hit. */
  _hit;
  constructor(engine2) {
    this._engine = engine2;
    this._rayHit = engine2.wasm._malloc(4 * (3 * 4 + 3 * 4 + 4 + 2) + 4);
    this._hit = new RayHit(this._engine, this._rayHit);
    this._callbacks = {};
  }
  /**
   * Cast a ray through the physics scene and find intersecting objects.
   *
   * The resulting ray hit will contain **up to 4** closest ray hits,
   * sorted by increasing distance.
   *
   * @param o Ray origin.
   * @param d Ray direction.
   * @param group Collision group to filter by: only objects that are
   *        part of given group are considered for raycast.
   * @param maxDistance Maximum ray distance, default `100.0`.
   *
   * @returns The RayHit instance, belonging to this class.
   *
   * @note The returned {@link RayHit} object is owned by the Physics instance and
   *       will be reused with the next {@link Physics#rayCast} call.
   */
  rayCast(o, d, group, maxDistance = 100) {
    this._engine.wasm._wl_physx_ray_cast(o[0], o[1], o[2], d[0], d[1], d[2], group, maxDistance, this._rayHit);
    return this._hit;
  }
};
var MeshIndexType2;
(function(MeshIndexType4) {
  MeshIndexType4[MeshIndexType4["UnsignedByte"] = 1] = "UnsignedByte";
  MeshIndexType4[MeshIndexType4["UnsignedShort"] = 2] = "UnsignedShort";
  MeshIndexType4[MeshIndexType4["UnsignedInt"] = 4] = "UnsignedInt";
})(MeshIndexType2 || (MeshIndexType2 = {}));
var MeshSkinningType2;
(function(MeshSkinningType4) {
  MeshSkinningType4[MeshSkinningType4["None"] = 0] = "None";
  MeshSkinningType4[MeshSkinningType4["FourJoints"] = 1] = "FourJoints";
  MeshSkinningType4[MeshSkinningType4["EightJoints"] = 2] = "EightJoints";
})(MeshSkinningType2 || (MeshSkinningType2 = {}));
var Mesh2 = class {
  /**
   * Index of the mesh in the manager.
   *
   * @hidden
   */
  _index = -1;
  /** Wonderland Engine instance. @hidden */
  _engine;
  /**
   * Create a new instance.
   *
   * @param params Either a mesh index to wrap or set of parameters to create a new mesh.
   *    For more information, please have a look at the {@link MeshParameters} interface.
   */
  constructor(engine2, params) {
    this._engine = engine2 ?? WL;
    this._index = -1;
    if (isNumber2(params)) {
      this._index = params;
      return;
    }
    if (!params.vertexCount)
      throw new Error("Missing parameter 'vertexCount'");
    const wasm = this._engine.wasm;
    let indexData = 0;
    let indexType = 0;
    let indexDataSize = 0;
    if (params.indexData) {
      indexType = params.indexType || MeshIndexType2.UnsignedShort;
      indexDataSize = params.indexData.length * indexType;
      indexData = wasm._malloc(indexDataSize);
      switch (indexType) {
        case MeshIndexType2.UnsignedByte:
          wasm.HEAPU8.set(params.indexData, indexData);
          break;
        case MeshIndexType2.UnsignedShort:
          wasm.HEAPU16.set(params.indexData, indexData >> 1);
          break;
        case MeshIndexType2.UnsignedInt:
          wasm.HEAPU32.set(params.indexData, indexData >> 2);
          break;
      }
    }
    const { skinningType = MeshSkinningType2.None } = params;
    this._index = wasm._wl_mesh_create(indexData, indexDataSize, indexType, params.vertexCount, skinningType);
  }
  /** Number of vertices in this mesh. */
  get vertexCount() {
    return this._engine.wasm._wl_mesh_get_vertexCount(this._index);
  }
  /** Index data (read-only) or `null` if the mesh is not indexed. */
  get indexData() {
    const wasm = this._engine.wasm;
    const tempMem = wasm._tempMem;
    const ptr = wasm._wl_mesh_get_indexData(this._index, tempMem, tempMem + 4);
    if (ptr === null)
      return null;
    const indexCount = wasm.HEAPU32[tempMem / 4];
    const indexSize = wasm.HEAPU32[tempMem / 4 + 1];
    switch (indexSize) {
      case MeshIndexType2.UnsignedByte:
        return new Uint8Array(wasm.HEAPU8.buffer, ptr, indexCount);
      case MeshIndexType2.UnsignedShort:
        return new Uint16Array(wasm.HEAPU16.buffer, ptr, indexCount);
      case MeshIndexType2.UnsignedInt:
        return new Uint32Array(wasm.HEAPU32.buffer, ptr, indexCount);
    }
    return null;
  }
  /** Hosting engine instance. */
  get engine() {
    return this._engine;
  }
  /**
   * Apply changes to {@link attribute | vertex attributes}.
   *
   * Uploads the updated vertex attributes to the GPU and updates the bounding
   * sphere to match the new vertex positions.
   *
   * Since this is an expensive operation, call it only once you have performed
   * all modifications on a mesh and avoid calling if you did not perform any
   * modifications at all.
   */
  update() {
    this._engine.wasm._wl_mesh_update(this._index);
  }
  getBoundingSphere(out = new Float32Array(4)) {
    const tempMemFloat = this._engine.wasm._tempMemFloat;
    this._engine.wasm._wl_mesh_get_boundingSphere(this._index, this._engine.wasm._tempMem);
    out[0] = tempMemFloat[0];
    out[1] = tempMemFloat[1];
    out[2] = tempMemFloat[2];
    out[3] = tempMemFloat[3];
    return out;
  }
  attribute(attr) {
    if (typeof attr != "number")
      throw new TypeError("Expected number, but got " + typeof attr);
    const tempMemUint32 = this._engine.wasm._tempMemUint32;
    this._engine.wasm._wl_mesh_get_attribute(this._index, attr, this._engine.wasm._tempMem);
    if (tempMemUint32[0] == 255)
      return null;
    const arraySize = tempMemUint32[5];
    return new MeshAttributeAccessor2(this._engine, {
      attribute: tempMemUint32[0],
      offset: tempMemUint32[1],
      stride: tempMemUint32[2],
      formatSize: tempMemUint32[3],
      componentCount: tempMemUint32[4],
      /* The WASM API returns `0` for a scalar value. We clamp it to 1 as we strictly use it as a multiplier for get/set operations */
      arraySize: arraySize ? arraySize : 1,
      length: this.vertexCount,
      bufferType: attr !== MeshAttribute2.JointId ? Float32Array : Uint16Array
    });
  }
  /**
   * Destroy and free the meshes memory.
   *
   * It is best practice to set the mesh variable to `null` after calling
   * destroy to prevent accidental use:
   *
   * ```js
   *   mesh.destroy();
   *   mesh = null;
   * ```
   *
   * Accessing the mesh after destruction behaves like accessing an empty
   * mesh.
   *
   * @since 0.9.0
   */
  destroy() {
    this._engine.wasm._wl_mesh_destroy(this._index);
  }
  /**
   * Checks equality by comparing whether the wrapped native mesh ids are
   * equal.
   *
   * @param otherMesh Mesh to check equality with.
   * @returns Whether this mesh equals the given mesh.
   *
   * @since 1.0.0
   */
  equals(otherMesh) {
    if (!otherMesh)
      return false;
    return this._index === otherMesh._index;
  }
};
var MeshAttributeAccessor2 = class {
  /** Max number of elements. */
  length = 0;
  /** Wonderland Engine instance. @hidden */
  _engine;
  /** Attribute index. @hidden */
  _attribute = -1;
  /** Attribute offset. @hidden */
  _offset = 0;
  /** Attribute stride. @hidden */
  _stride = 0;
  /** Format size native enum. @hidden */
  _formatSize = 0;
  /** Number of components per vertex. @hidden */
  _componentCount = 0;
  /** Number of values per vertex. @hidden */
  _arraySize = 1;
  /**
   * Class to instantiate an ArrayBuffer to get/set values.
   */
  _bufferType;
  /**
   * Function to allocate temporary WASM memory. It is cached in the accessor to avoid
   * conditionals during get/set.
   */
  _tempBufferGetter;
  /**
   * Create a new instance.
   *
   * @note Please use {@link Mesh.attribute} to create a new instance.
   *
   * @param options Contains information about how to read the data.
   * @note Do not use this constructor. Instead, please use the {@link Mesh.attribute} method.
   *
   * @hidden
   */
  constructor(engine2, options) {
    this._engine = engine2;
    const wasm = this._engine.wasm;
    this._attribute = options.attribute;
    this._offset = options.offset;
    this._stride = options.stride;
    this._formatSize = options.formatSize;
    this._componentCount = options.componentCount;
    this._arraySize = options.arraySize;
    this._bufferType = options.bufferType;
    this.length = options.length;
    this._tempBufferGetter = this._bufferType === Float32Array ? wasm.getTempBufferF32.bind(wasm) : wasm.getTempBufferU16.bind(wasm);
  }
  /**
   * Create a new TypedArray to hold this attribute's values.
   *
   * This method is useful to create a view to hold the data to
   * pass to {@link get} and {@link set}
   *
   * Example:
   *
   * ```js
   * const vertexCount = 4;
   * const positionAttribute = mesh.attribute(MeshAttribute.Position);
   *
   * // A position has 3 floats per vertex. Thus, positions has length 3 * 4.
   * const positions = positionAttribute.createArray(vertexCount);
   * ```
   *
   * @param count The number of **vertices** expected.
   * @returns A TypedArray with the appropriate format to access the data
   */
  createArray(count = 1) {
    count = count > this.length ? this.length : count;
    return new this._bufferType(count * this._componentCount * this._arraySize);
  }
  get(index, out = this.createArray()) {
    if (out.length % this._componentCount !== 0) {
      throw new Error(`out.length, ${out.length} is not a multiple of the attribute vector components, ${this._componentCount}`);
    }
    const dest = this._tempBufferGetter(out.length);
    const elementSize = this._bufferType.BYTES_PER_ELEMENT;
    const destSize = elementSize * out.length;
    const srcFormatSize = this._formatSize * this._arraySize;
    const destFormatSize = this._componentCount * elementSize * this._arraySize;
    this._engine.wasm._wl_mesh_get_attribute_values(this._attribute, srcFormatSize, this._offset + index * this._stride, this._stride, destFormatSize, dest.byteOffset, destSize);
    for (let i = 0; i < out.length; ++i)
      out[i] = dest[i];
    return out;
  }
  /**
   * Set attribute element.
   *
   * @param i Index
   * @param v Value to set the element to
   *
   * `v.length` needs to be a multiple of the attributes component count, see
   * {@link MeshAttribute}. If `v.length` is more than one multiple, it will be
   * filled with the next n attribute elements, which can reduce overhead
   * of this call.
   *
   * @returns Reference to self (for method chaining)
   */
  set(i, v) {
    if (v.length % this._componentCount !== 0)
      throw new Error(`out.length, ${v.length} is not a multiple of the attribute vector components, ${this._componentCount}`);
    const elementSize = this._bufferType.BYTES_PER_ELEMENT;
    const srcSize = elementSize * v.length;
    const srcFormatSize = this._componentCount * elementSize * this._arraySize;
    const destFormatSize = this._formatSize * this._arraySize;
    const wasm = this._engine.wasm;
    if (v.buffer != wasm.HEAPU8.buffer) {
      const dest = this._tempBufferGetter(v.length);
      dest.set(v);
      v = dest;
    }
    wasm._wl_mesh_set_attribute_values(this._attribute, srcFormatSize, v.byteOffset, srcSize, destFormatSize, this._offset + i * this._stride, this._stride);
    return this;
  }
};
var Material2 = class {
  /**
   * Index of this material in the manager.
   *
   * @hidden
   */
  _index;
  /**
   * Material definition index in the scene.
   *
   * @hidden
   */
  _definition;
  /** Wonderland Engine instance. @hidden */
  _engine;
  /**
   * Create a new Material.
   *
   * @note Creating material is expensive. Please use {@link Material#clone} to clone a material.
   * @note Do not use this constructor directly with an index, this is reserved for internal purposes.
   */
  constructor(engine2, params) {
    this._engine = engine2;
    if (typeof params !== "number") {
      if (!params?.pipeline)
        throw new Error("Missing parameter 'pipeline'");
      const wasm = this._engine.wasm;
      const pipeline = params.pipeline;
      this._index = wasm._wl_material_create(wasm.tempUTF8(pipeline));
      if (this._index < 0)
        throw new Error(`No such pipeline '${pipeline}'`);
    } else {
      this._index = params;
    }
    this._definition = this._engine.wasm._wl_material_get_definition(this._index);
    if (!this._engine.wasm._materialDefinitions[this._definition])
      throw new Error(`Material Definition ${this._definition} not found for material with index ${this._index}`);
    return new Proxy(this, {
      get(target, prop) {
        const wasm = engine2.wasm;
        const definition = wasm._materialDefinitions[target._definition];
        const param = definition.get(prop);
        if (!param)
          return target[prop];
        if (wasm._wl_material_get_param_value(target._index, param.index, wasm._tempMem)) {
          const type = param.type;
          switch (type.type) {
            case MaterialParamType2.UnsignedInt:
              return type.componentCount == 1 ? wasm._tempMemUint32[0] : new Uint32Array(wasm.HEAPU32.buffer, wasm._tempMem, type.componentCount);
            case MaterialParamType2.Int:
              return type.componentCount == 1 ? wasm._tempMemInt[0] : new Int32Array(wasm.HEAP32.buffer, wasm._tempMem, type.componentCount);
            case MaterialParamType2.Float:
              return type.componentCount == 1 ? wasm._tempMemFloat[0] : new Float32Array(wasm.HEAPF32.buffer, wasm._tempMem, type.componentCount);
            case MaterialParamType2.Sampler:
              return engine2.textures.wrap(wasm._tempMemInt[0]);
            default:
              throw new Error(`Invalid type ${type.type} on parameter ${param.index} for material ${target._index}`);
          }
        }
      },
      set(target, prop, value) {
        const wasm = engine2.wasm;
        const definition = wasm._materialDefinitions[target._definition];
        const param = definition.get(prop);
        if (!param) {
          target[prop] = value;
          return true;
        }
        const type = param.type;
        switch (type.type) {
          case MaterialParamType2.UnsignedInt:
          case MaterialParamType2.Int:
          case MaterialParamType2.Sampler:
            const v = value.id ?? value;
            wasm._wl_material_set_param_value_uint(target._index, param.index, v);
            break;
          case MaterialParamType2.Float:
            let count = 1;
            if (typeof value === "number") {
              wasm._tempMemFloat[0] = value;
            } else {
              count = value.length;
              for (let i = 0; i < count; ++i)
                wasm._tempMemFloat[i] = value[i];
            }
            wasm._wl_material_set_param_value_float(target._index, param.index, wasm._tempMem, count);
            break;
          case MaterialParamType2.Font:
            throw new Error("Setting font properties is currently unsupported.");
        }
        return true;
      }
    });
  }
  /** @deprecated Use {@link #pipeline} instead. */
  get shader() {
    return this.pipeline;
  }
  /** Name of the pipeline used by this material. */
  get pipeline() {
    const wasm = this._engine.wasm;
    return wasm.UTF8ToString(wasm._wl_material_get_pipeline(this._index));
  }
  /** Hosting engine instance. */
  get engine() {
    return this._engine;
  }
  /**
   * Create a copy of the underlying native material.
   *
   * @returns Material clone.
   */
  clone() {
    const id = this._engine.wasm._wl_material_clone(this._index);
    return id > 0 ? new Material2(this._engine, id) : null;
  }
  /**
   * Checks equality by comparing whether the wrapped native material ids are
   * equal.
   *
   * @param otherMaterial Material to check equality with.
   * @returns Whether this material equals the given material.
   *
   * @since 1.0.0
   */
  equals(otherMaterial) {
    if (!otherMaterial)
      return false;
    return this._index === otherMaterial._index;
  }
  /**
   * Wrap a native material index.
   *
   * @param engine Engine instance.
   * @param index The index.
   * @returns Material instance or `null` if index <= 0.
   *
   * @deprecated Please use `new Material()` instead.
   */
  static wrap(engine2, index) {
    return index > 0 ? new Material2(engine2, index) : null;
  }
};
var temp2d = null;
var Texture2 = class {
  /** Wonderland Engine instance. @hidden */
  _engine;
  /** Index in the manager. @hidden */
  _id = 0;
  /** HTML image index. @hidden */
  _imageIndex = null;
  /**
   * @param engine The engine instance
   * @param param HTML media element to create texture from or texture id to wrap.
   */
  constructor(engine2, param) {
    this._engine = engine2 ?? WL;
    const wasm = engine2.wasm;
    if (param instanceof HTMLImageElement || param instanceof HTMLVideoElement || param instanceof HTMLCanvasElement) {
      const index = wasm._images.length;
      wasm._images.push(param);
      this._imageIndex = index;
      this._id = this._engine.wasm._wl_renderer_addImage(index);
    } else {
      this._id = param;
    }
    this._engine.textures._set(this);
  }
  /** Whether this texture is valid. */
  get valid() {
    return this._id >= 0;
  }
  /** Index in this manager. */
  get id() {
    return this._id;
  }
  /** Update the texture to match the HTML element (e.g. reflect the current frame of a video). */
  update() {
    if (!this.valid || this._imageIndex === null)
      return;
    this._engine.wasm._wl_renderer_updateImage(this._id, this._imageIndex);
  }
  /** Width of the texture. */
  get width() {
    return this._engine.wasm._wl_texture_width(this._id);
  }
  /** Height of the texture. */
  get height() {
    return this._engine.wasm._wl_texture_height(this._id);
  }
  /** Hosting engine instance. */
  get engine() {
    return this._engine;
  }
  /**
   * Update a subrange on the texture to match the HTML element (e.g. reflect the current frame of a video).
   *
   * Usage:
   *
   * ```js
   * // Copies rectangle of pixel starting from (10, 20)
   * texture.updateSubImage(10, 20, 600, 400);
   * ```
   *
   * @param x x offset
   * @param y y offset
   * @param w width
   * @param h height
   */
  updateSubImage(x, y, w, h) {
    if (!this.valid || this._imageIndex === null)
      return;
    if (!temp2d) {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Texture.updateSubImage(): Failed to obtain CanvasRenderingContext2D.");
      }
      temp2d = {
        canvas,
        ctx
      };
    }
    const wasm = this._engine.wasm;
    const img = wasm._images[this._imageIndex];
    if (!img)
      return;
    temp2d.canvas.width = w;
    temp2d.canvas.height = h;
    temp2d.ctx.drawImage(img, x, y, w, h, 0, 0, w, h);
    const yOffset = (img.videoHeight ?? img.height) - y - h;
    wasm._images[this._imageIndex] = temp2d.canvas;
    wasm._wl_renderer_updateImage(this._id, this._imageIndex, x, yOffset);
    wasm._images[this._imageIndex] = img;
  }
  /**
   * Destroy and free the texture's texture altas space and memory.
   *
   * It is best practice to set the texture variable to `null` after calling
   * destroy to prevent accidental use of the invalid texture:
   *
   * ```js
   *   texture.destroy();
   *   texture = null;
   * ```
   *
   * @since 0.9.0
   */
  destroy() {
    this.engine.textures._destroy(this);
    this._id = -1;
    this._imageIndex = null;
  }
  /**
   * Checks equality by comparing whether the wrapped native texture ids are
   * equal.
   *
   * @param otherTexture Texture to check equality with.
   * @returns Whether this texture equals the given texture.
   *
   * @since 1.0.0
   */
  equals(otherTexture) {
    if (!otherTexture)
      return false;
    return this._id === otherTexture._id;
  }
};
var Animation2 = class {
  /** Index of the mesh in the manager. @hidden */
  _index;
  /** Wonderland Engine instance. @hidden */
  _engine;
  /**
   * @param index Index in the manager
   */
  constructor(engine2 = WL, index) {
    this._engine = engine2;
    this._index = index;
  }
  /** Duration of this animation. */
  get duration() {
    return this._engine.wasm._wl_animation_get_duration(this._index);
  }
  /** Number of tracks in this animation. */
  get trackCount() {
    return this._engine.wasm._wl_animation_get_trackCount(this._index);
  }
  /**
   * Clone this animation retargeted to a new set of objects.
   *
   * The clone shares most of the data with the original and is therefore
   * light-weight.
   *
   * **Experimental:** This API might change in upcoming versions.
   *
   * If retargeting to {@link Skin}, the join names will be used to determine a mapping
   * from the previous skin to the new skin. The source skin will be retrieved from
   * the first track in the animation that targets a joint.
   *
   * @param newTargets New targets per track. Expected to have
   *      {@link Animation#trackCount} elements or to be a {@link Skin}.
   * @returns The retargeted clone of this animation.
   */
  retarget(newTargets) {
    const wasm = this._engine.wasm;
    if (newTargets instanceof Skin2) {
      const animId2 = wasm._wl_animation_retargetToSkin(this._index, newTargets._index);
      return new Animation2(this._engine, animId2);
    }
    if (newTargets.length != this.trackCount) {
      throw Error("Expected " + this.trackCount.toString() + " targets, but got " + newTargets.length.toString());
    }
    const ptr = wasm._malloc(2 * newTargets.length);
    for (let i = 0; i < newTargets.length; ++i) {
      wasm.HEAPU16[ptr >> 1 + i] = newTargets[i].objectId;
    }
    const animId = wasm._wl_animation_retarget(this._index, ptr);
    wasm._free(ptr);
    return new Animation2(this._engine, animId);
  }
  /**
   * Checks equality by comparing whether the wrapped native animation ids
   * are equal.
   *
   * @param otherAnimation Animation to check equality with.
   * @returns Whether this animation equals the given animation.
   *
   * @since 1.0.0
   */
  equals(otherAnimation) {
    if (!otherAnimation)
      return false;
    return this._index === otherAnimation._index;
  }
};
var Object3D2 = class {
  /** Wonderland Engine instance. @hidden */
  _engine;
  /**
   * Object index in the manager.
   *
   * @hidden
   */
  _objectId = -1;
  /**
   * @param o Object id to wrap
   *
   * For performance reasons, please use {@link WonderlandEngine.wrapObject}
   */
  constructor(engine2, o) {
    this._objectId = o;
    this._engine = engine2;
  }
  /**
   * Name of the object.
   *
   * Useful for identifying objects during debugging.
   */
  get name() {
    const wasm = this._engine.wasm;
    return wasm.UTF8ToString(wasm._wl_object_name(this.objectId));
  }
  /**
   * Set the object's name.
   *
   * @param newName The new name to set.
   */
  set name(newName) {
    const wasm = this._engine.wasm;
    wasm._wl_object_set_name(this.objectId, wasm.tempUTF8(newName));
  }
  /**
   * Parent of this object or `null` if parented to root.
   */
  get parent() {
    const p = this._engine.wasm._wl_object_parent(this.objectId);
    return p === 0 ? null : this._engine.wrapObject(p);
  }
  /**
   * Children of this object.
   *
   * @note Child order is **undefined**. No assumptions should be made
   * about the index of a specific object.
   *
   * If you need to access a specific child of this object, you can
   * use {@link Object3D.findByName}.
   *
   * When the object exists in the scene at editor time, prefer passing it as
   * a component property.
   */
  get children() {
    const childrenCount = this._engine.wasm._wl_object_get_children_count(this.objectId);
    if (childrenCount === 0)
      return [];
    const wasm = this._engine.wasm;
    wasm.requireTempMem(childrenCount * 2);
    this._engine.wasm._wl_object_get_children(this.objectId, wasm._tempMem, wasm._tempMemSize >> 1);
    const children = new Array(childrenCount);
    for (let i = 0; i < childrenCount; ++i) {
      children[i] = this._engine.wrapObject(wasm._tempMemUint16[i]);
    }
    return children;
  }
  /**
   * Reparent object to given object.
   *
   * @note Reparenting is not trivial and might have a noticeable performance impact.
   *
   * @param newParent New parent or `null` to parent to root
   */
  set parent(newParent) {
    this._engine.wasm._wl_object_set_parent(this.objectId, newParent == null ? 0 : newParent.objectId);
  }
  /** Object index in the manager. */
  get objectId() {
    return this._objectId;
  }
  /** Hosting engine instance. */
  get engine() {
    return this._engine;
  }
  /**
   * Reset local transformation (translation, rotation and scaling) to identity.
   *
   * @returns Reference to self (for method chaining).
   */
  resetTransform() {
    this._engine.wasm._wl_object_reset_translation_rotation(this.objectId);
    this._engine.wasm._wl_object_reset_scaling(this.objectId);
    return this;
  }
  /**
   * Reset local position and rotation to identity.
   *
   * @returns Reference to self (for method chaining).
   */
  resetPositionRotation() {
    this._engine.wasm._wl_object_reset_translation_rotation(this.objectId);
    return this;
  }
  /** @deprecated Please use {@link Object3D.resetPositionRotation} instead. */
  resetTranslationRotation() {
    return this.resetPositionRotation();
  }
  /**
   * Reset local rotation, keep translation.
   *
   * @note To reset both rotation and translation, prefer
   *       {@link resetTranslationRotation}.
   *
   * @returns Reference to self (for method chaining).
   */
  resetRotation() {
    this._engine.wasm._wl_object_reset_rotation(this.objectId);
    return this;
  }
  /**
   * Reset local translation, keep rotation.
   *
   * @note To reset both rotation and translation, prefer
   *       {@link resetTranslationRotation}.
   *
   * @returns Reference to self (for method chaining).
   */
  resetPosition() {
    this._engine.wasm._wl_object_reset_translation(this.objectId);
    return this;
  }
  /** @deprecated Please use {@link Object3D.resetPosition} instead. */
  resetTranslation() {
    return this.resetPosition();
  }
  /**
   * Reset local scaling to identity (``[1.0, 1.0, 1.0]``).
   *
   * @returns Reference to self (for method chaining).
   */
  resetScaling() {
    this._engine.wasm._wl_object_reset_scaling(this.objectId);
    return this;
  }
  /** @deprecated Please use {@link Object3D.translateLocal} instead. */
  translate(v) {
    return this.translateLocal(v);
  }
  /**
   * Translate object by a vector in the parent's space.
   *
   * @param v Vector to translate by.
   *
   * @returns Reference to self (for method chaining).
   */
  translateLocal(v) {
    this._engine.wasm._wl_object_translate(this.objectId, v[0], v[1], v[2]);
    return this;
  }
  /**
   * Translate object by a vector in object space.
   *
   * @param v Vector to translate by.
   *
   * @returns Reference to self (for method chaining).
   */
  translateObject(v) {
    this._engine.wasm._wl_object_translate_obj(this.objectId, v[0], v[1], v[2]);
    return this;
  }
  /**
   * Translate object by a vector in world space.
   *
   * @param v Vector to translate by.
   *
   * @returns Reference to self (for method chaining).
   */
  translateWorld(v) {
    this._engine.wasm._wl_object_translate_world(this.objectId, v[0], v[1], v[2]);
    return this;
  }
  /** @deprecated Please use {@link Object3D.rotateAxisAngleDegLocal} instead. */
  rotateAxisAngleDeg(a, d) {
    this.rotateAxisAngleDegLocal(a, d);
    return this;
  }
  /**
   * Rotate around given axis by given angle (degrees) in local space.
   *
   * @param a Vector representing the rotation axis.
   * @param d Angle in degrees.
   *
   * @note If the object is translated the rotation will be around
   *     the parent. To rotate around the object origin, use
   *     {@link rotateAxisAngleDegObject}
   *
   * @see {@link rotateAxisAngleRad}
   *
   * @returns Reference to self (for method chaining).
   */
  rotateAxisAngleDegLocal(a, d) {
    this._engine.wasm._wl_object_rotate_axis_angle(this.objectId, a[0], a[1], a[2], d);
    return this;
  }
  /** @deprecated Please use {@link Object3D.rotateAxisAngleRadLocal} instead. */
  rotateAxisAngleRad(a, d) {
    return this.rotateAxisAngleRadLocal(a, d);
  }
  /**
   * Rotate around given axis by given angle (radians) in local space.
   *
   * @param a Vector representing the rotation axis.
   * @param d Angle in radians.
   *
   * @note If the object is translated the rotation will be around
   *     the parent. To rotate around the object origin, use
   *     {@link rotateAxisAngleDegObject}
   *
   * @see {@link rotateAxisAngleDeg}
   *
   * @returns Reference to self (for method chaining).
   */
  rotateAxisAngleRadLocal(a, d) {
    this._engine.wasm._wl_object_rotate_axis_angle_rad(this.objectId, a[0], a[1], a[2], d);
    return this;
  }
  /**
   * Rotate around given axis by given angle (degrees) in object space.
   *
   * @param a Vector representing the rotation axis.
   * @param d Angle in degrees.
   *
   * Equivalent to prepending a rotation quaternion to the object's
   * local transformation.
   *
   * @see {@link rotateAxisAngleRadObject}
   *
   * @returns Reference to self (for method chaining).
   */
  rotateAxisAngleDegObject(a, d) {
    this._engine.wasm._wl_object_rotate_axis_angle_obj(this.objectId, a[0], a[1], a[2], d);
    return this;
  }
  /**
   * Rotate around given axis by given angle (radians) in object space
   * Equivalent to prepending a rotation quaternion to the object's
   * local transformation.
   *
   * @param a Vector representing the rotation axis
   * @param d Angle in degrees
   *
   * @see {@link rotateAxisAngleDegObject}
   *
   * @returns Reference to self (for method chaining).
   */
  rotateAxisAngleRadObject(a, d) {
    this._engine.wasm._wl_object_rotate_axis_angle_rad_obj(this.objectId, a[0], a[1], a[2], d);
    return this;
  }
  /** @deprecated Please use {@link Object3D.rotateLocal} instead. */
  rotate(q) {
    this.rotateLocal(q);
    return this;
  }
  /**
   * Rotate by a quaternion.
   *
   * @param q the Quaternion to rotate by.
   *
   * @returns Reference to self (for method chaining).
   */
  rotateLocal(q) {
    this._engine.wasm._wl_object_rotate_quat(this.objectId, q[0], q[1], q[2], q[3]);
    return this;
  }
  /**
   * Rotate by a quaternion in object space.
   *
   * Equivalent to prepending a rotation quaternion to the object's
   * local transformation.
   *
   * @param q the Quaternion to rotate by.
   *
   * @returns Reference to self (for method chaining).
   */
  rotateObject(q) {
    this._engine.wasm._wl_object_rotate_quat_obj(this.objectId, q[0], q[1], q[2], q[3]);
    return this;
  }
  /** @deprecated Please use {@link Object3D.scaleLocal} instead. */
  scale(v) {
    this.scaleLocal(v);
    return this;
  }
  /**
   * Scale object by a vector in object space.
   *
   * @param v Vector to scale by.
   *
   * @returns Reference to self (for method chaining).
   */
  scaleLocal(v) {
    this._engine.wasm._wl_object_scale(this.objectId, v[0], v[1], v[2]);
    return this;
  }
  getPositionLocal(out = new Float32Array(3)) {
    const wasm = this._engine.wasm;
    wasm._wl_object_get_translation_local(this.objectId, wasm._tempMem);
    out[0] = wasm._tempMemFloat[0];
    out[1] = wasm._tempMemFloat[1];
    out[2] = wasm._tempMemFloat[2];
    return out;
  }
  getTranslationLocal(out = new Float32Array(3)) {
    return this.getPositionLocal(out);
  }
  getPositionWorld(out = new Float32Array(3)) {
    const wasm = this._engine.wasm;
    wasm._wl_object_get_translation_world(this.objectId, wasm._tempMem);
    out[0] = wasm._tempMemFloat[0];
    out[1] = wasm._tempMemFloat[1];
    out[2] = wasm._tempMemFloat[2];
    return out;
  }
  getTranslationWorld(out = new Float32Array(3)) {
    return this.getPositionWorld(out);
  }
  /**
   * Set local / object space position.
   *
   * Concatenates a new translation dual quaternion onto the existing rotation.
   *
   * @param v New local position array/vector, expected to have at least 3 elements.
   *
   * @returns Reference to self (for method chaining).
   */
  setPositionLocal(v) {
    this._engine.wasm._wl_object_set_translation_local(this.objectId, v[0], v[1], v[2]);
    return this;
  }
  /** @deprecated Please use {@link Object3D.setPositionLocal} instead. */
  setTranslationLocal(v) {
    return this.setPositionLocal(v);
  }
  /**
   * Set world space position.
   *
   * Applies the inverse parent transform with a new translation dual quaternion
   * which is concatenated onto the existing rotation.
   *
   * @param v New world position array/vector, expected to have at least 3 elements.
   *
   * @returns Reference to self (for method chaining).
   */
  setPositionWorld(v) {
    this._engine.wasm._wl_object_set_translation_world(this.objectId, v[0], v[1], v[2]);
    return this;
  }
  /** @deprecated Please use {@link Object3D.setPositionWorld} instead. */
  setTranslationWorld(v) {
    return this.setPositionWorld(v);
  }
  getScalingLocal(out = new Float32Array(3)) {
    const wasm = this._engine.wasm;
    const ptr = wasm._wl_object_scaling_local(this.objectId) / 4;
    out[0] = wasm.HEAPF32[ptr];
    out[1] = wasm.HEAPF32[ptr + 1];
    out[2] = wasm.HEAPF32[ptr + 2];
    return out;
  }
  /**
   * Set local / object space scaling.
   *
   * @param v New local scaling array/vector, expected to have at least 3 elements.
   *
   * @returns Reference to self (for method chaining).
   */
  setScalingLocal(v) {
    this._engine.wasm._wl_object_set_scaling_local(this.objectId, v[0], v[1], v[2]);
    return this;
  }
  getScalingWorld(out = new Float32Array(3)) {
    const wasm = this._engine.wasm;
    const ptr = wasm._wl_object_scaling_world(this.objectId) / 4;
    out[0] = wasm.HEAPF32[ptr];
    out[1] = wasm.HEAPF32[ptr + 1];
    out[2] = wasm.HEAPF32[ptr + 2];
    return out;
  }
  /**
   * Set World space scaling.
   *
   * @param v New world scaling array/vector, expected to have at least 3 elements.
   *
   * @returns Reference to self (for method chaining).
   */
  setScalingWorld(v) {
    this._engine.wasm._wl_object_set_scaling_world(this.objectId, v[0], v[1], v[2]);
    return this;
  }
  getRotationLocal(out = new Float32Array(4)) {
    const wasm = this._engine.wasm;
    const ptr = wasm._wl_object_trans_local(this.objectId) / 4;
    out[0] = wasm.HEAPF32[ptr];
    out[1] = wasm.HEAPF32[ptr + 1];
    out[2] = wasm.HEAPF32[ptr + 2];
    out[3] = wasm.HEAPF32[ptr + 3];
    return out;
  }
  /**
   * Set local space rotation.
   *
   * @param v New world rotation array/vector, expected to have at least 4 elements.
   *
   * @returns Reference to self (for method chaining).
   */
  setRotationLocal(v) {
    this._engine.wasm._wl_object_set_rotation_local(this.objectId, v[0], v[1], v[2], v[3]);
    return this;
  }
  getRotationWorld(out = new Float32Array(4)) {
    const wasm = this._engine.wasm;
    const ptr = wasm._wl_object_trans_world(this.objectId) / 4;
    out[0] = wasm.HEAPF32[ptr];
    out[1] = wasm.HEAPF32[ptr + 1];
    out[2] = wasm.HEAPF32[ptr + 2];
    out[3] = wasm.HEAPF32[ptr + 3];
    return out;
  }
  /**
   * Set local space rotation.
   *
   * @param v New world rotation array/vector, expected to have at least 4 elements.
   *
   * @returns Reference to self (for method chaining).
   */
  setRotationWorld(v) {
    this._engine.wasm._wl_object_set_rotation_world(this.objectId, v[0], v[1], v[2], v[3]);
    return this;
  }
  getTransformLocal(out = new Float32Array(8)) {
    const wasm = this._engine.wasm;
    const ptr = wasm._wl_object_trans_local(this.objectId) / 4;
    out[0] = wasm.HEAPF32[ptr];
    out[1] = wasm.HEAPF32[ptr + 1];
    out[2] = wasm.HEAPF32[ptr + 2];
    out[3] = wasm.HEAPF32[ptr + 3];
    out[4] = wasm.HEAPF32[ptr + 4];
    out[5] = wasm.HEAPF32[ptr + 5];
    out[6] = wasm.HEAPF32[ptr + 6];
    out[7] = wasm.HEAPF32[ptr + 7];
    return out;
  }
  /**
   * Set local space rotation.
   *
   * @param v New local transform array, expected to have at least 8 elements.
   *
   * @returns Reference to self (for method chaining).
   */
  setTransformLocal(v) {
    const wasm = this._engine.wasm;
    const ptr = wasm._wl_object_trans_local(this.objectId) / 4;
    wasm.HEAPF32[ptr] = v[0];
    wasm.HEAPF32[ptr + 1] = v[1];
    wasm.HEAPF32[ptr + 2] = v[2];
    wasm.HEAPF32[ptr + 3] = v[3];
    wasm.HEAPF32[ptr + 4] = v[4];
    wasm.HEAPF32[ptr + 5] = v[5];
    wasm.HEAPF32[ptr + 6] = v[6];
    wasm.HEAPF32[ptr + 7] = v[7];
    this.setDirty();
    return this;
  }
  getTransformWorld(out = new Float32Array(8)) {
    const wasm = this._engine.wasm;
    const ptr = wasm._wl_object_trans_world(this.objectId) / 4;
    out[0] = wasm.HEAPF32[ptr];
    out[1] = wasm.HEAPF32[ptr + 1];
    out[2] = wasm.HEAPF32[ptr + 2];
    out[3] = wasm.HEAPF32[ptr + 3];
    out[4] = wasm.HEAPF32[ptr + 4];
    out[5] = wasm.HEAPF32[ptr + 5];
    out[6] = wasm.HEAPF32[ptr + 6];
    out[7] = wasm.HEAPF32[ptr + 7];
    return out;
  }
  /**
   * Set world space rotation.
   *
   * @param v New world transform array, expected to have at least 8 elements.
   *
   * @returns Reference to self (for method chaining).
   */
  setTransformWorld(v) {
    const wasm = this._engine.wasm;
    const ptr = wasm._wl_object_trans_world(this.objectId) / 4;
    wasm.HEAPF32[ptr] = v[0];
    wasm.HEAPF32[ptr + 1] = v[1];
    wasm.HEAPF32[ptr + 2] = v[2];
    wasm.HEAPF32[ptr + 3] = v[3];
    wasm.HEAPF32[ptr + 4] = v[4];
    wasm.HEAPF32[ptr + 5] = v[5];
    wasm.HEAPF32[ptr + 6] = v[6];
    wasm.HEAPF32[ptr + 7] = v[7];
    this._engine.wasm._wl_object_trans_world_to_local(this.objectId);
    return this;
  }
  /**
   * Local space transformation.
   *
   * @deprecated Please use {@link Object3D.setTransformLocal} and
   * {@link Object3D.getTransformLocal} instead.
   */
  get transformLocal() {
    const wasm = this._engine.wasm;
    return new Float32Array(wasm.HEAPF32.buffer, wasm._wl_object_trans_local(this.objectId), 8);
  }
  /**
   * Set local transform.
   *
   * @param t Local space transformation.
   *
   * @since 0.8.5
   *
   * @deprecated Please use {@link Object3D.setTransformLocal} and
   * {@link Object3D.getTransformLocal} instead.
   */
  set transformLocal(t) {
    this.transformLocal.set(t);
    this.setDirty();
  }
  /**
   * Global / world space transformation.
   *
   * May recompute transformations of the hierarchy of this object,
   * if they were changed by JavaScript components this frame.
   *
   * @deprecated Please use {@link Object3D.setTransformWorld} and
   * {@link Object3D.getTransformWorld} instead.
   */
  get transformWorld() {
    const wasm = this._engine.wasm;
    return new Float32Array(wasm.HEAPF32.buffer, wasm._wl_object_trans_world(this.objectId), 8);
  }
  /**
   * Set world transform.
   *
   * @param t Global / world space transformation.
   *
   * @since 0.8.5
   *
   * @deprecated Please use {@link Object3D.setTransformWorld} and
   * {@link Object3D.getTransformWorld} instead.
   */
  set transformWorld(t) {
    this.transformWorld.set(t);
    this._engine.wasm._wl_object_trans_world_to_local(this.objectId);
  }
  /**
   * Local / object space scaling.
   *
   * @deprecated Please use {@link Object3D.setScalingLocal} and
   * {@link Object3D.getScalingLocal} instead.
   */
  get scalingLocal() {
    const wasm = this._engine.wasm;
    return new Float32Array(wasm.HEAPF32.buffer, wasm._wl_object_scaling_local(this.objectId), 3);
  }
  /**
   * Set local space scaling.
   *
   * @param s Local space scaling.
   *
   * @since 0.8.7
   *
   * @deprecated Please use {@link Object3D.setScalingLocal} and
   * {@link Object3D.getScalingLocal} instead.
   */
  set scalingLocal(s) {
    this.scalingLocal.set(s);
    this.setDirty();
  }
  /**
   * Global / world space scaling.
   *
   * May recompute transformations of the hierarchy of this object,
   * if they were changed by JavaScript components this frame.
   *
   * @deprecated Please use {@link Object3D.setScalingWorld} and
   * {@link Object3D.getScalingWorld} instead.
   */
  get scalingWorld() {
    const wasm = this._engine.wasm;
    return new Float32Array(wasm.HEAPF32.buffer, wasm._wl_object_scaling_world(this.objectId), 3);
  }
  /**
   * Set world space scaling.
   *
   * @param t World space scaling.
   *
   * @since 0.8.7
   *
   * @deprecated Please use {@link Object3D.setScalingWorld} and
   * {@link Object3D.getScalingWorld} instead.
   */
  set scalingWorld(s) {
    this.scalingWorld.set(s);
    this._engine.wasm._wl_object_scaling_world_to_local(this.objectId);
  }
  /**
   * Local space rotation.
   *
   * @since 0.8.7
   *
   * @deprecated Please use {@link Object3D.getRotationLocal} and
   * {@link Object3D.setRotationLocal} instead.
   */
  get rotationLocal() {
    return this.transformLocal.subarray(0, 4);
  }
  /**
   * Global / world space rotation
   *
   * @since 0.8.7
   *
   * @deprecated Please use {@link Object3D.getRotationWorld} and
   * {@link Object3D.setRotationWorld} instead.
   */
  get rotationWorld() {
    return this.transformWorld.subarray(0, 4);
  }
  /**
   * Set local space rotation.
   *
   * @param r Local space rotation
   *
   * @since 0.8.7
   *
   * @deprecated Please use {@link Object3D.getRotationLocal} and
   * {@link Object3D.setRotationLocal} instead.
   */
  set rotationLocal(r) {
    this._engine.wasm._wl_object_set_rotation_local(this.objectId, r[0], r[1], r[2], r[3]);
  }
  /**
   * Set world space rotation.
   *
   * @param r Global / world space rotation.
   *
   * @since 0.8.7
   *
   * @deprecated Please use {@link Object3D.getRotationWorld} and
   * {@link Object3D.setRotationWorld} instead.
   */
  set rotationWorld(r) {
    this._engine.wasm._wl_object_set_rotation_world(this.objectId, r[0], r[1], r[2], r[3]);
  }
  /** @deprecated Please use {@link Object3D.getForwardWorld} instead. */
  getForward(out) {
    return this.getForwardWorld(out);
  }
  /**
   * Compute the object's forward facing world space vector.
   *
   * The forward vector in object space is along the negative z-axis, i.e.,
   * `[0, 0, -1]`.
   *
   * @param out Destination array/vector, expected to have at least 3 elements.
   * @return The `out` parameter.
   */
  getForwardWorld(out) {
    out[0] = 0;
    out[1] = 0;
    out[2] = -1;
    this.transformVectorWorld(out);
    return out;
  }
  /** @deprecated Please use {@link Object3D.getUpWorld} instead. */
  getUp(out) {
    return this.getUpWorld(out);
  }
  /**
   * Compute the object's up facing world space vector.
   *
   * @param out Destination array/vector, expected to have at least 3 elements.
   * @return The `out` parameter.
   */
  getUpWorld(out) {
    out[0] = 0;
    out[1] = 1;
    out[2] = 0;
    this.transformVectorWorld(out);
    return out;
  }
  /** @deprecated Please use {@link Object3D.getRightWorld} instead. */
  getRight(out) {
    return this.getRightWorld(out);
  }
  /**
   * Compute the object's right facing world space vector.
   *
   * @param out Destination array/vector, expected to have at least 3 elements.
   * @return The `out` parameter.
   */
  getRightWorld(out) {
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    this.transformVectorWorld(out);
    return out;
  }
  /**
   * Transform a vector by this object's world transform.
   *
   * @param out Out vector
   * @param v Vector to transform, default `out`
   * @return The `out` parameter.
   *
   * @since 0.8.7
   */
  transformVectorWorld(out, v = out) {
    const wasm = this._engine.wasm;
    wasm._tempMemFloat[0] = v[0];
    wasm._tempMemFloat[1] = v[1];
    wasm._tempMemFloat[2] = v[2];
    wasm._wl_object_transformVectorWorld(this.objectId, wasm._tempMem);
    out[0] = wasm._tempMemFloat[0];
    out[1] = wasm._tempMemFloat[1];
    out[2] = wasm._tempMemFloat[2];
    return out;
  }
  /**
   * Transform a vector by this object's local transform.
   *
   * @param out Out vector
   * @param v Vector to transform, default `out`
   * @return The `out` parameter.
   *
   * @since 0.8.7
   */
  transformVectorLocal(out, v = out) {
    const wasm = this._engine.wasm;
    wasm._tempMemFloat[0] = v[0];
    wasm._tempMemFloat[1] = v[1];
    wasm._tempMemFloat[2] = v[2];
    wasm._wl_object_transformVectorLocal(this.objectId, wasm._tempMem);
    out[0] = wasm._tempMemFloat[0];
    out[1] = wasm._tempMemFloat[1];
    out[2] = wasm._tempMemFloat[2];
    return out;
  }
  /**
   * Transform a point by this object's world transform.
   *
   * @param out Out point.
   * @param p Point to transform, default `out`.
   * @return The `out` parameter.
   *
   * @since 0.8.7
   */
  transformPointWorld(out, p = out) {
    const wasm = this._engine.wasm;
    wasm._tempMemFloat[0] = p[0];
    wasm._tempMemFloat[1] = p[1];
    wasm._tempMemFloat[2] = p[2];
    wasm._wl_object_transformPointWorld(this.objectId, wasm._tempMem);
    out[0] = wasm._tempMemFloat[0];
    out[1] = wasm._tempMemFloat[1];
    out[2] = wasm._tempMemFloat[2];
    return out;
  }
  /**
   * Transform a point by this object's local transform.
   *
   * @param out Out point.
   * @param p Point to transform, default `out`.
   * @return The `out` parameter.
   *
   * @since 0.8.7
   */
  transformPointLocal(out, p = out) {
    const wasm = this._engine.wasm;
    wasm._tempMemFloat[0] = p[0];
    wasm._tempMemFloat[1] = p[1];
    wasm._tempMemFloat[2] = p[2];
    wasm._wl_object_transformPointLocal(this.objectId, wasm._tempMem);
    out[0] = wasm._tempMemFloat[0];
    out[1] = wasm._tempMemFloat[1];
    out[2] = wasm._tempMemFloat[2];
    return out;
  }
  /**
   * Transform a vector by this object's inverse world transform.
   *
   * @param out Out vector.
   * @param v Vector to transform, default `out`.
   * @return The `out` parameter.
   *
   * @since 0.8.7
   */
  transformVectorInverseWorld(out, v = out) {
    const wasm = this._engine.wasm;
    wasm._tempMemFloat[0] = v[0];
    wasm._tempMemFloat[1] = v[1];
    wasm._tempMemFloat[2] = v[2];
    wasm._wl_object_transformVectorInverseWorld(this.objectId, wasm._tempMem);
    out[0] = wasm._tempMemFloat[0];
    out[1] = wasm._tempMemFloat[1];
    out[2] = wasm._tempMemFloat[2];
    return out;
  }
  /**
   * Transform a vector by this object's inverse local transform.
   *
   * @param out Out vector
   * @param v Vector to transform, default `out`
   * @return The `out` parameter.
   *
   * @since 0.8.7
   */
  transformVectorInverseLocal(out, v = out) {
    const wasm = this._engine.wasm;
    wasm._tempMemFloat[0] = v[0];
    wasm._tempMemFloat[1] = v[1];
    wasm._tempMemFloat[2] = v[2];
    wasm._wl_object_transformVectorInverseLocal(this.objectId, wasm._tempMem);
    out[0] = wasm._tempMemFloat[0];
    out[1] = wasm._tempMemFloat[1];
    out[2] = wasm._tempMemFloat[2];
    return out;
  }
  /**
   * Transform a point by this object's inverse world transform.
   *
   * @param out Out point.
   * @param p Point to transform, default `out`.
   * @return The `out` parameter.
   *
   * @since 0.8.7
   */
  transformPointInverseWorld(out, p = out) {
    const wasm = this._engine.wasm;
    wasm._tempMemFloat[0] = p[0];
    wasm._tempMemFloat[1] = p[1];
    wasm._tempMemFloat[2] = p[2];
    wasm._wl_object_transformPointInverseWorld(this.objectId, wasm._tempMem);
    out[0] = wasm._tempMemFloat[0];
    out[1] = wasm._tempMemFloat[1];
    out[2] = wasm._tempMemFloat[2];
    return out;
  }
  /**
   * Transform a point by this object's inverse local transform.
   *
   * @param out Out point.
   * @param p Point to transform, default `out`.
   * @return The `out` parameter.
   *
   * @since 0.8.7
   */
  transformPointInverseLocal(out, p = out) {
    const wasm = this._engine.wasm;
    wasm._tempMemFloat.set(p);
    wasm._wl_object_transformPointInverseLocal(this.objectId, wasm._tempMem);
    out[0] = wasm._tempMemFloat[0];
    out[1] = wasm._tempMemFloat[1];
    out[2] = wasm._tempMemFloat[2];
    return out;
  }
  /**
   * Transform an object space dual quaternion into world space.
   *
   * @param out Out transformation.
   * @param q Local space transformation, default `out`.
   * @return The `out` parameter.
   *
   * @since 0.8.7
   */
  toWorldSpaceTransform(out, q = out) {
    const wasm = this._engine.wasm;
    wasm._tempMemFloat.set(q);
    wasm._wl_object_toWorldSpaceTransform(this.objectId, wasm._tempMem);
    out[0] = wasm._tempMemFloat[0];
    out[1] = wasm._tempMemFloat[1];
    out[2] = wasm._tempMemFloat[2];
    out[3] = wasm._tempMemFloat[3];
    out[4] = wasm._tempMemFloat[4];
    out[5] = wasm._tempMemFloat[5];
    out[6] = wasm._tempMemFloat[6];
    out[7] = wasm._tempMemFloat[7];
    return out;
  }
  /**
   * Transform a world space dual quaternion into local space.
   *
   * @param out Out transformation
   * @param q World space transformation, default `out`
   * @return The `out` parameter.
   *
   * @since 0.8.7
   */
  toLocalSpaceTransform(out, q = out) {
    const p = this.parent;
    if (p) {
      p.toObjectSpaceTransform(out, q);
      return out;
    }
    if (out !== q) {
      out[0] = q[0];
      out[1] = q[1];
      out[2] = q[2];
      out[3] = q[3];
      out[4] = q[4];
      out[5] = q[5];
      out[6] = q[6];
      out[7] = q[7];
    }
    return out;
  }
  /**
   * Transform a world space dual quaternion into object space.
   *
   * @param out Out transformation.
   * @param q World space transformation, default `out`
   * @return The `out` parameter.
   *
   * @since 0.8.7
   */
  toObjectSpaceTransform(out, q = out) {
    const wasm = this._engine.wasm;
    wasm._tempMemFloat.set(q);
    wasm._wl_object_toObjectSpaceTransform(this.objectId, wasm._tempMem);
    out[0] = wasm._tempMemFloat[0];
    out[1] = wasm._tempMemFloat[1];
    out[2] = wasm._tempMemFloat[2];
    out[3] = wasm._tempMemFloat[3];
    out[4] = wasm._tempMemFloat[4];
    out[5] = wasm._tempMemFloat[5];
    out[6] = wasm._tempMemFloat[6];
    out[7] = wasm._tempMemFloat[7];
    return out;
  }
  /**
   * Turn towards / look at target.
   *
   * Rotates the object so that its forward vector faces towards the target
   * position. The `up` vector acts as a hint to uniquely orient the object's
   * up direction. When orienting a view component, the projected `up` vector
   * faces upwards on the viewing plane.
   *
   * @param p Target position to turn towards, in world space.
   * @param up Up vector to align object with, in world space. Default is `[0, 1, 0]`.
   *
   * @returns Reference to self (for method chaining).
   */
  lookAt(p, up = UP_VECTOR) {
    this._engine.wasm._wl_object_lookAt(this.objectId, p[0], p[1], p[2], up[0], up[1], up[2]);
    return this;
  }
  /** Destroy the object with all of its components and remove it from the scene */
  destroy() {
    if (this._objectId < 0)
      return;
    this._engine._objectCache[this._objectId] = null;
    this._engine.wasm._wl_scene_remove_object(this.objectId);
    this._objectId = -1;
  }
  /**
   * Mark transformation dirty.
   *
   * Causes an eventual recalculation of {@link transformWorld}, either
   * on next {@link getTranslationWorld}, {@link transformWorld} or
   * {@link scalingWorld} or the beginning of next frame, whichever
   * happens first.
   */
  setDirty() {
    this._engine.wasm._wl_object_set_dirty(this.objectId);
  }
  /**
   * Disable/enable all components of this object.
   *
   * @param b New state for the components.
   *
   * @since 0.8.5
   */
  set active(b) {
    const comps = this.getComponents();
    for (let c of comps) {
      c.active = b;
    }
  }
  getComponent(typeOrClass, index = 0) {
    const type = isString2(typeOrClass) ? typeOrClass : typeOrClass.TypeName;
    const wasm = this._engine.wasm;
    const componentType = wasm._wl_get_component_manager_index(wasm.tempUTF8(type));
    if (componentType < 0) {
      const typeIndex = wasm._componentTypeIndices[type];
      if (typeIndex === void 0)
        return null;
      const jsIndex = wasm._wl_get_js_component_index(this.objectId, typeIndex, index);
      if (jsIndex < 0)
        return null;
      const component = this._engine.wasm._components[jsIndex];
      return component.constructor !== BrokenComponent ? component : null;
    }
    const componentId = this._engine.wasm._wl_get_component_id(this.objectId, componentType, index);
    return this._engine._wrapComponent(type, componentType, componentId);
  }
  getComponents(typeOrClass) {
    const wasm = this._engine.wasm;
    let componentType = null;
    let type = null;
    if (typeOrClass) {
      type = isString2(typeOrClass) ? typeOrClass : typeOrClass.TypeName;
      componentType = wasm._typeIndexFor(type);
    }
    const components = [];
    const maxComps = Math.floor(wasm._tempMemSize / 3 * 2);
    const componentsCount = wasm._wl_object_get_components(this.objectId, wasm._tempMem, maxComps);
    const offset = 2 * componentsCount;
    wasm._wl_object_get_component_types(this.objectId, wasm._tempMem + offset, maxComps);
    const jsManagerIndex = wasm._jsManagerIndex;
    for (let i = 0; i < componentsCount; ++i) {
      const t = wasm._tempMemUint8[i + offset];
      const componentId = wasm._tempMemUint16[i];
      if (t == jsManagerIndex) {
        const typeIndex = wasm._wl_get_js_component_index_for_id(componentId);
        const comp = wasm._components[typeIndex];
        const matches = componentType === null || comp.type == type;
        if (comp.constructor !== BrokenComponent && matches) {
          components.push(comp);
        }
        continue;
      }
      if (componentType === null) {
        const managerName = wasm._typeNameFor(t);
        components.push(this._engine._wrapComponent(managerName, t, componentId));
      } else if (t == componentType) {
        components.push(this._engine._wrapComponent(type, componentType, componentId));
      }
    }
    return components;
  }
  addComponent(typeOrClass, params) {
    const wasm = this._engine.wasm;
    const type = isString2(typeOrClass) ? typeOrClass : typeOrClass.TypeName;
    const componentType = wasm._typeIndexFor(type);
    let component = null;
    let componentIndex = null;
    if (componentType < 0) {
      if (!(type in wasm._componentTypeIndices)) {
        throw new TypeError("Unknown component type '" + type + "'");
      }
      const componentId = wasm._wl_object_add_js_component(this.objectId, wasm._componentTypeIndices[type]);
      componentIndex = wasm._wl_get_js_component_index_for_id(componentId);
      component = wasm._components[componentIndex];
    } else {
      const componentId = wasm._wl_object_add_component(this.objectId, componentType);
      component = this._engine._wrapComponent(type, componentType, componentId);
    }
    if (params !== void 0) {
      const ctor = component.constructor;
      for (const key in params) {
        if (!(key in ctor.Properties))
          continue;
        component[key] = params[key];
      }
    }
    if (componentType < 0) {
      wasm._wljs_component_init(componentIndex);
    }
    if (!params || !("active" in params && !params.active)) {
      component.active = true;
    }
    return component;
  }
  /**
   * Search for descendants matching the name.
   *
   * This method is a wrapper around {@link Object3D.findByNameDirect} and
   * {@link Object3D.findByNameRecursive}.
   *
   * @param name The name to search for.
   * @param recursive If `true`, the method will look at all the descendants of this object.
   *     If `false`, this method will only perform the search in direct children.
   * @returns An array of {@link Object3D} matching the name.
   *
   * @since 1.1.0
   */
  findByName(name, recursive = false) {
    return recursive ? this.findByNameRecursive(name) : this.findByNameDirect(name);
  }
  /**
   * Search for all **direct** children matching the name.
   *
   * @note Even though this method is heavily optimized, it does perform
   * a linear search to find the objects. Do not use in a hot path.
   *
   * @param name The name to search for.
   * @returns An array of {@link Object3D} matching the name.
   *
   * @since 1.1.0
   */
  findByNameDirect(name) {
    const wasm = this._engine.wasm;
    const id = this._objectId;
    const tempSizeU16 = wasm._tempMemSize >> 2;
    const maxCount = tempSizeU16 - 2;
    const buffer = wasm._tempMemUint16;
    buffer[maxCount] = 0;
    buffer[maxCount + 1] = 0;
    const bufferPtr = wasm._tempMem;
    const indexPtr = bufferPtr + maxCount * 2;
    const childCountPtr = bufferPtr + maxCount * 2 + 2;
    const namePtr = wasm.tempUTF8(name, (maxCount + 2) * 2);
    const result = [];
    let read = 0;
    while (read = wasm._wl_object_findByName(id, namePtr, indexPtr, childCountPtr, bufferPtr, maxCount)) {
      for (let i = 0; i < read; ++i)
        result.push(this.engine.wrapObject(buffer[i]));
    }
    return result;
  }
  /**
   * Search for **all descendants** matching the name.
   *
   * @note Even though this method is heavily optimized, it does perform
   * a linear search to find the objects. Do not use in a hot path.
   *
   * @param name The name to search for.
   * @returns An array of {@link Object3D} with the give name
   *
   * @returns An array of {@link Object3D} matching the name.
   */
  findByNameRecursive(name) {
    const wasm = this._engine.wasm;
    const id = this._objectId;
    const tempSizeU16 = wasm._tempMemSize >> 2;
    const maxCount = tempSizeU16 - 1;
    const buffer = wasm._tempMemUint16;
    buffer[maxCount] = 0;
    const bufferPtr = wasm._tempMem;
    const indexPtr = bufferPtr + maxCount * 2;
    const namePtr = wasm.tempUTF8(name, (maxCount + 1) * 2);
    let read = 0;
    const result = [];
    while (read = wasm._wl_object_findByNameRecursive(id, namePtr, indexPtr, bufferPtr, maxCount)) {
      for (let i = 0; i < read; ++i)
        result.push(this.engine.wrapObject(buffer[i]));
    }
    return result;
  }
  /**
   * Whether given object's transformation has changed.
   */
  get changed() {
    return !!this._engine.wasm._wl_object_is_changed(this.objectId);
  }
  /**
   * Checks equality by comparing whether the wrapped native object ids are
   * equal.
   *
   * @param otherObject Object to check equality with.
   * @returns Whether this object equals the given object.
   */
  equals(otherObject) {
    if (!otherObject)
      return false;
    return this.objectId == otherObject.objectId;
  }
};
var Skin2 = class {
  /**
   * Index of the skin in the manager.
   * @hidden
   */
  _index;
  /** Wonderland Engine instance. @hidden */
  _engine;
  constructor(engine2, index) {
    this._engine = engine2;
    this._index = index;
  }
  /** Amount of joints in this skin. */
  get jointCount() {
    return this._engine.wasm._wl_skin_get_joint_count(this._index);
  }
  /** Joints object ids for this skin */
  get jointIds() {
    const wasm = this._engine.wasm;
    return new Uint16Array(wasm.HEAPU16.buffer, wasm._wl_skin_joint_ids(this._index), this.jointCount);
  }
  /**
   * Dual quaternions in a flat array of size 8 times {@link jointCount}.
   *
   * Inverse bind transforms of the skin.
   */
  get inverseBindTransforms() {
    const wasm = this._engine.wasm;
    return new Float32Array(wasm.HEAPF32.buffer, wasm._wl_skin_inverse_bind_transforms(this._index), 8 * this.jointCount);
  }
  /**
   * Vectors in a flat array of size 3 times {@link jointCount}.
   *
   * Inverse bind scalings of the skin.
   */
  get inverseBindScalings() {
    const wasm = this._engine.wasm;
    return new Float32Array(wasm.HEAPF32.buffer, wasm._wl_skin_inverse_bind_scalings(this._index), 3 * this.jointCount);
  }
  /**
   * Checks equality by comparing whether the wrapped native skin ids are
   * equal.
   *
   * @param otherSkin Skin to check equality with.
   * @returns Whether this skin equals the given skin.
   *
   * @since 1.0.0
   */
  equals(otherSkin) {
    if (!otherSkin)
      return false;
    return this._index === otherSkin._index;
  }
};
var RayHit = class {
  /** Wonderland Engine instance. @hidden */
  _engine;
  /** Pointer to the memory heap. */
  _ptr;
  /**
   * @param ptr Pointer to the ray hits memory.
   */
  constructor(engine2, ptr) {
    if ((ptr & 3) !== 0) {
      throw new Error("Misaligned pointer: please report a bug");
    }
    this._engine = engine2;
    this._ptr = ptr;
  }
  /** Array of ray hit locations. */
  get locations() {
    let p = this._ptr;
    let l = [];
    for (let i = 0; i < this.hitCount; ++i) {
      l.push(new Float32Array(this._engine.wasm.HEAPF32.buffer, p + 12 * i, 3));
    }
    return l;
  }
  /** Array of ray hit normals (only when using {@link Physics#rayCast}. */
  get normals() {
    let p = this._ptr + 48;
    let l = [];
    for (let i = 0; i < this.hitCount; ++i) {
      l.push(new Float32Array(this._engine.wasm.HEAPF32.buffer, p + 12 * i, 3));
    }
    return l;
  }
  /**
   * Prefer these to recalculating the distance from locations.
   *
   * Distances of array hits to ray origin.
   */
  get distances() {
    const p = this._ptr + 48 * 2;
    return new Float32Array(this._engine.wasm.HEAPF32.buffer, p, this.hitCount);
  }
  /** Hit objects */
  get objects() {
    const HEAPU16 = this._engine.wasm.HEAPU16;
    const objects = [null, null, null, null];
    let p = this._ptr + (48 * 2 + 16) >> 1;
    for (let i = 0; i < this.hitCount; ++i) {
      objects[i] = this._engine.wrapObject(HEAPU16[p + i]);
    }
    return objects;
  }
  /** Number of hits (max 4) */
  get hitCount() {
    return Math.min(this._engine.wasm.HEAPU32[this._ptr / 4 + 30], 4);
  }
};
var I18N2 = class {
  /**
   * {@link Emitter} for language change events.
   *
   * First parameter to a listener is the old language index,
   * second parameter is the new language index.
   *
   * Usage from a within a component:
   * ```js
   * this.engine.i18n.onLanguageChanged.add((oldLanguageIndex, newLanguageIndex) => {
   *     const oldLanguage = this.engine.i18n.languageName(oldLanguageIndex);
   *     const newLanguage = this.engine.i18n.languageName(newLanguageIndex);
   *     console.log("Switched from", oldLanguage, "to", newLanguage);
   * });
   * ```
   */
  onLanguageChanged = new Emitter2();
  /** Wonderland Engine instance. @hidden */
  _engine;
  /** Previously set language index. @hidden */
  _prevLanguageIndex = -1;
  /**
   * Constructor
   */
  constructor(engine2) {
    this._engine = engine2;
  }
  /**
   * Set current language and apply translations to linked text parameters.
   *
   * @note This is equivalent to {@link I18N.setLanguage}.
   *
   * @param code Language code to switch to
   */
  set language(code) {
    this.setLanguage(code);
  }
  /** Get current language code. */
  get language() {
    const wasm = this._engine.wasm;
    const code = wasm._wl_i18n_currentLanguage();
    if (code === 0)
      return null;
    return wasm.UTF8ToString(code);
  }
  /**
   * Get the current language index.
   *
   * This method is more efficient than its equivalent:
   *
   * ```js
   * const index = i18n.languageIndex(i18n.language);
   * ```
   */
  get currentIndex() {
    return this._engine.wasm._wl_i18n_currentLanguageIndex();
  }
  /** Previous language index. */
  get previousIndex() {
    return this._prevLanguageIndex;
  }
  /**
   * Set current language and apply translations to linked text parameters.
   *
   * @param code The language code.
   * @returns A promise that resolves with the current index code when the
   *     language is loaded.
   */
  setLanguage(code) {
    if (code == null)
      return Promise.resolve(this.currentIndex);
    const wasm = this._engine.wasm;
    this._prevLanguageIndex = this.currentIndex;
    wasm._wl_i18n_setLanguage(wasm.tempUTF8(code));
    return this._engine.scene._flushAppend(this._engine.scene.baseURL).then(() => this.currentIndex);
  }
  /**
   * Get translated string for a term for the currently loaded language.
   *
   * @param term Term to translate
   */
  translate(term) {
    const wasm = this._engine.wasm;
    const translation = wasm._wl_i18n_translate(wasm.tempUTF8(term));
    if (translation === 0)
      return null;
    return wasm.UTF8ToString(translation);
  }
  /**
   * Get the number of languages in the project.
   *
   */
  languageCount() {
    const wasm = this._engine.wasm;
    return wasm._wl_i18n_languageCount();
  }
  /**
   * Get a language code.
   *
   * @param index Index of the language to get the code from
   */
  languageIndex(code) {
    const wasm = this._engine.wasm;
    return wasm._wl_i18n_languageIndex(wasm.tempUTF8(code));
  }
  /**
   * Get a language code.
   *
   * @param index Index of the language to get the code from
   */
  languageCode(index) {
    const wasm = this._engine.wasm;
    const code = wasm._wl_i18n_languageCode(index);
    if (code === 0)
      return null;
    return wasm.UTF8ToString(code);
  }
  /**
   * Get a language name.
   *
   * @param index Index of the language to get the name from
   */
  languageName(index) {
    const wasm = this._engine.wasm;
    const name = wasm._wl_i18n_languageName(index);
    if (name === 0)
      return null;
    return wasm.UTF8ToString(name);
  }
};
var XR2 = class {
  /** Wonderland WASM bridge. @hidden */
  #wasm;
  #mode;
  constructor(wasm, mode) {
    this.#wasm = wasm;
    this.#mode = mode;
  }
  /** Current WebXR session mode */
  get sessionMode() {
    return this.#mode;
  }
  /** Current WebXR session */
  get session() {
    return this.#wasm.webxr_session;
  }
  /** Current WebXR frame */
  get frame() {
    return this.#wasm.webxr_frame;
  }
  referenceSpaceForType(type) {
    return this.#wasm.webxr_refSpaces[type] ?? null;
  }
  /** Set current reference space type used for retrieving eye, head, hand and joint poses */
  set currentReferenceSpace(refSpace) {
    this.#wasm.webxr_refSpace = refSpace;
    this.#wasm.webxr_refSpaceType = null;
    for (const type of Object.keys(this.#wasm.webxr_refSpaces)) {
      if (this.#wasm.webxr_refSpaces[type] === refSpace) {
        this.#wasm.webxr_refSpaceType = type;
      }
    }
  }
  /** Current reference space type used for retrieving eye, head, hand and joint poses */
  get currentReferenceSpace() {
    return this.#wasm.webxr_refSpace;
  }
  /** Current WebXR reference space type or `null` if not a default reference space */
  get currentReferenceSpaceType() {
    return this.#wasm.webxr_refSpaceType;
  }
  /** Current WebXR base layer  */
  get baseLayer() {
    return this.#wasm.webxr_baseLayer;
  }
  /** Current WebXR framebuffer */
  get framebuffers() {
    if (!Array.isArray(this.#wasm.webxr_fbo)) {
      return [this.#wasm.GL.framebuffers[this.#wasm.webxr_fbo]];
    }
    return this.#wasm.webxr_fbo.map((id) => this.#wasm.GL.framebuffers[id]);
  }
};

// node_modules/@wonderlandengine/api/dist/utils/fetch.js
function fetchWithProgress2(path, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", path);
    xhr.responseType = "arraybuffer";
    xhr.onprogress = (progress) => {
      if (progress.lengthComputable) {
        onProgress?.(progress.loaded, progress.total);
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const buffer = xhr.response;
        onProgress?.(buffer.byteLength, buffer.byteLength);
        resolve(buffer);
      } else {
        reject(xhr.statusText);
      }
    };
    xhr.onerror = () => reject(xhr.statusText);
    xhr.send();
  });
}
function getBaseUrl(url) {
  return url.substring(0, url.lastIndexOf("/"));
}

// node_modules/@wonderlandengine/api/dist/utils/misc.js
function timeout(time) {
  return new Promise((res) => setTimeout(res, time));
}

// node_modules/@wonderlandengine/api/dist/scene.js
var MAGIC_BIN = "WLEV";
var Scene2 = class {
  /** Called before rendering the scene */
  onPreRender = new Emitter2();
  /** Called after the scene has been rendered */
  onPostRender = new Emitter2();
  /** Wonderland Engine instance. @hidden */
  _engine;
  /** Ray hit pointer in WASM heap. @hidden */
  _rayHit;
  /** Ray hit. @hidden */
  _hit;
  /**
   * Relative directory of the scene that was loaded with {@link Scene.load}
   * Used for loading any files relative to the main scene.
   *
   * We need this for the tests that load bin files since we aren't loading
   * from the deploy folder directly. (test/resources/projects/*.bin)
   *
   * @hidden
   */
  _baseURL;
  constructor(engine2) {
    this._engine = engine2;
    this._rayHit = engine2.wasm._malloc(4 * (3 * 4 + 3 * 4 + 4 + 2) + 4);
    this._hit = new RayHit(this._engine, this._rayHit);
    this._baseURL = "";
  }
  /**
   * Currently active view components.
   */
  get activeViews() {
    const wasm = this._engine.wasm;
    const count = wasm._wl_scene_get_active_views(this._engine.wasm._tempMem, 16);
    const views = [];
    const viewTypeIndex = wasm._typeIndexFor("view");
    for (let i = 0; i < count; ++i) {
      views.push(new ViewComponent2(this._engine, viewTypeIndex, this._engine.wasm._tempMemInt[i]));
    }
    return views;
  }
  /**
   * Relative directory of the scene that was loaded with {@link Scene.load}
   * Used for loading any files relative to the main scene.
   *
   * @hidden
   */
  get baseURL() {
    return this._baseURL;
  }
  /**
   * Cast a ray through the scene and find intersecting objects.
   *
   * The resulting ray hit will contain up to **4** closest ray hits,
   * sorted by increasing distance.
   *
   * @param o Ray origin.
   * @param d Ray direction.
   * @param group Collision group to filter by: only objects that are
   *        part of given group are considered for raycast.
   * @param maxDistance Maximum **inclusive** hit distance. Defaults to `100`.
   *
   * @returns The scene cached {@link RayHit} instance.
   * @note The returned object is owned by the Scene instance
   *   will be reused with the next {@link Scene#rayCast} call.
   */
  rayCast(o, d, group, maxDistance = 100) {
    this._engine.wasm._wl_scene_ray_cast(o[0], o[1], o[2], d[0], d[1], d[2], group, this._rayHit, maxDistance);
    return this._hit;
  }
  /**
   * Add an object to the scene.
   *
   * @param parent Parent object or `null`.
   * @returns A newly created object.
   */
  addObject(parent = null) {
    const parentId = parent ? parent.objectId : 0;
    const objectId = this._engine.wasm._wl_scene_add_object(parentId);
    return this._engine.wrapObject(objectId);
  }
  /**
   * Batch-add objects to the scene.
   *
   * Will provide better performance for adding multiple objects (e.g. > 16)
   * than calling {@link Scene#addObject} repeatedly in a loop.
   *
   * By providing upfront information of how many objects will be required,
   * the engine is able to batch-allocate the required memory rather than
   * convervatively grow the memory in small steps.
   *
   * **Experimental:** This API might change in upcoming versions.
   *
   * @param count Number of objects to add.
   * @param parent Parent object or `null`, default `null`.
   * @param componentCountHint Hint for how many components in total will
   *      be added to the created objects afterwards, default `0`.
   * @returns Newly created objects
   */
  addObjects(count, parent = null, componentCountHint = 0) {
    const parentId = parent ? parent.objectId : 0;
    this._engine.wasm.requireTempMem(count * 2);
    const actualCount = this._engine.wasm._wl_scene_add_objects(parentId, count, componentCountHint || 0, this._engine.wasm._tempMem, this._engine.wasm._tempMemSize >> 1);
    const ids = this._engine.wasm._tempMemUint16.subarray(0, actualCount);
    const wrapper = this._engine.wrapObject.bind(this._engine);
    const objects = Array.from(ids, wrapper);
    return objects;
  }
  /**
   * Pre-allocate memory for a given amount of objects and components.
   *
   * Will provide better performance for adding objects later with {@link Scene#addObject}
   * and {@link Scene#addObjects}.
   *
   * By providing upfront information of how many objects will be required,
   * the engine is able to batch-allocate the required memory rather than
   * conservatively grow the memory in small steps.
   *
   * **Experimental:** This API might change in upcoming versions.
   *
   * @param objectCount Number of objects to add.
   * @param componentCountPerType Amount of components to
   *      allocate for {@link Object3D.addComponent}, e.g. `{mesh: 100, collision: 200, "my-comp": 100}`.
   * @since 0.8.10
   */
  reserveObjects(objectCount, componentCountPerType) {
    const wasm = this._engine.wasm;
    componentCountPerType = componentCountPerType || {};
    const jsManagerIndex = wasm._jsManagerIndex;
    let countsPerTypeIndex = wasm._tempMemInt.subarray();
    countsPerTypeIndex.fill(0);
    for (const e of Object.entries(componentCountPerType)) {
      const typeIndex = wasm._typeIndexFor(e[0]);
      countsPerTypeIndex[typeIndex < 0 ? jsManagerIndex : typeIndex] += e[1];
    }
    wasm._wl_scene_reserve_objects(objectCount, wasm._tempMem);
  }
  /**
   * Set the background clear color.
   *
   * @param color new clear color (RGBA).
   * @since 0.8.5
   */
  set clearColor(color) {
    this._engine.wasm._wl_scene_set_clearColor(color[0], color[1], color[2], color[3]);
  }
  /**
   * Set whether to clear the color framebuffer before drawing.
   *
   * This function is useful if an external framework (e.g. an AR tracking
   * framework) is responsible for drawing a camera frame before Wonderland
   * Engine draws the scene on top of it.
   *
   * @param b Whether to enable color clear.
   * @since 0.9.4
   */
  set colorClearEnabled(b) {
    this._engine.wasm._wl_scene_enableColorClear(b);
  }
  /** Hosting engine instance. */
  get engine() {
    return this._engine;
  }
  /**
   * Load a scene file (.bin).
   *
   * Will replace the currently active scene with the one loaded
   * from given file. It is assumed that JavaScript components required by
   * the new scene were registered in advance.
   *
   * Once the scene is loaded successfully and initialized,
   * {@link WonderlandEngine.onSceneLoaded} is notified.
   *
   * @param filename Path to the .bin file.
   * @returns Promise that resolves when the scene was loaded.
   */
  async load(filename) {
    this._baseURL = getBaseUrl(filename);
    const wasm = this._engine.wasm;
    const buffer = await fetchWithProgress2(filename, (bytes, size2) => {
      console.log(`Scene downloading: ${bytes} / ${size2}`);
      wasm._wl_set_loading_screen_progress(bytes / size2);
    });
    const size = buffer.byteLength;
    console.log(`Scene download of ${size} bytes successful.`);
    const ptr = wasm._malloc(size);
    new Uint8Array(wasm.HEAPU8.buffer, ptr, size).set(new Uint8Array(buffer));
    try {
      wasm._wl_load_scene_bin(ptr, size, wasm.tempUTF8(filename));
    } finally {
      wasm._free(ptr);
    }
    const i18n = this._engine.i18n;
    const langPromise = i18n.setLanguage(i18n.languageCode(0));
    await Promise.all([langPromise, this._flushAppend(this._baseURL)]);
    this._engine.onSceneLoaded.notify();
  }
  /**
   * Append a scene file.
   *
   * Loads and parses the file and its images and appends the result
   * to the currently active scene.
   *
   * Supported formats are streamable Wonderland scene files (.bin) and glTF
   * 3D scenes (.gltf, .glb).
   *
   * ```js
   * WL.scene.append(filename).then(root => {
   *     // root contains the loaded scene
   * });
   * ```
   *
   * In case the `loadGltfExtensions` option is set to true, the response
   * will be an object containing both the root of the loaded scene and
   * any glTF extensions found on nodes, meshes and the root of the file.
   *
   * ```js
   * WL.scene.append(filename, { loadGltfExtensions: true }).then(({root, extensions}) => {
   *     // root contains the loaded scene
   *     // extensions.root contains any extensions at the root of glTF document
   *     const rootExtensions = extensions.root;
   *     // extensions.mesh and extensions.node contain extensions indexed by Object id
   *     const childObject = root.children[0];
   *     const meshExtensions = root.meshExtensions[childObject.objectId];
   *     const nodeExtensions = root.nodeExtensions[childObject.objectId];
   *     // extensions.idMapping contains a mapping from glTF node index to Object id
   * });
   * ```
   *
   * If the file to be loaded is located in a subfolder, it might be useful
   * to define the `baseURL` option. This will ensure any bin files
   * referenced by the loaded bin file are loaded at the correct path.
   *
   * ```js
   * WL.scene.append(filename, { baseURL: 'scenes' }).then(({root, extensions}) => {
   *     // do stuff
   * });
   * ```
   *
   *
   * @param file The .bin, .gltf or .glb file to append. Should be a URL or
   *   an `ArrayBuffer` with the file content.
   * @param options Additional options for loading.
   * @returns Promise that resolves when the scene was appended.
   */
  async append(file, options = {}) {
    const { loadGltfExtensions = false, baseURL = isString2(file) ? getBaseUrl(file) : this._baseURL } = options;
    const wasm = this._engine.wasm;
    const buffer = isString2(file) ? await fetchWithProgress2(file) : file;
    let error = null;
    let result = void 0;
    let callback = wasm.addFunction((objectId, extensionData, extensionDataSize) => {
      if (objectId < 0) {
        error = new Error(`Scene.append(): Internal runtime error, found root id = ${objectId}`);
        return;
      }
      const root = objectId ? this._engine.wrapObject(objectId) : null;
      result = root;
      if (!extensionData || !extensionDataSize)
        return;
      const marshalled = new Uint32Array(wasm.HEAPU32.buffer, extensionData, extensionDataSize / 4);
      const extensions = this._unmarshallGltfExtensions(marshalled);
      result = { root, extensions };
    }, "viii");
    const queuedBinCount = wasm._wl_scene_queued_bin_count();
    const size = buffer.byteLength;
    const ptr = wasm._malloc(size);
    const data = new Uint8Array(wasm.HEAPU8.buffer, ptr, size);
    data.set(new Uint8Array(buffer));
    const isBinFile = data.byteLength > MAGIC_BIN.length && data.subarray(0, MAGIC_BIN.length).every((value, i) => value === MAGIC_BIN.charCodeAt(i));
    try {
      if (isBinFile) {
        wasm._wl_append_scene_bin(ptr, size, callback);
      } else {
        wasm._wl_append_scene_gltf(ptr, size, loadGltfExtensions, callback);
      }
    } catch (e) {
      wasm.removeFunction(callback);
      throw e;
    } finally {
      wasm._free(ptr);
    }
    while (result === void 0 && !error)
      await timeout(4);
    wasm.removeFunction(callback);
    if (error)
      throw error;
    if (isBinFile)
      await this._flushAppend(baseURL);
    return result;
  }
  /**
   * Set the current material to render the sky.
   *
   * @note The sky needs to be enabled in the editor when creating the scene.
   * For more information, please refer to the background ![tutorial](https://wonderlandengine.com/tutorials/background-effect/).
   */
  set skyMaterial(material) {
    this._engine.wasm._wl_scene_set_sky_material(material?._index ?? 0);
  }
  /** Current sky material, or `null` if no sky is set. */
  get skyMaterial() {
    const id = this._engine.wasm._wl_scene_get_sky_material();
    return id > 0 ? new Material2(this._engine, id) : null;
  }
  /**
   * Load all currently queued bin files.
   *
   * Used by {@link Scene.append} and {@link Scene.load}
   * to load all delay-load bins.
   *
   * Used by {@link I18N.language} to trigger loading the
   * associated language bin, after it was queued.
   *
   * @param baseURL Url that is added to each path.
   * @param options Additional options for loading.
   *
   * @hidden
   */
  _flushAppend(baseURL) {
    const wasm = this._engine.wasm;
    const count = wasm._wl_scene_queued_bin_count();
    if (!count)
      return Promise.resolve();
    const urls = new Array(count).fill(0).map((_, i) => {
      const ptr = wasm._wl_scene_queued_bin_path(i);
      return wasm.UTF8ToString(ptr);
    });
    wasm._wl_scene_clear_queued_bin_list();
    const promises = urls.map((path) => this.append(baseURL.length ? `${baseURL}/${path}` : path));
    return Promise.all(promises).then((data) => {
      const i18n = this._engine.i18n;
      this._engine.i18n.onLanguageChanged.notify(i18n.previousIndex, i18n.currentIndex);
      return data;
    });
  }
  /**
   * Unmarshalls the GltfExtensions from an Uint32Array.
   *
   * @param data Array containing the gltf extension data.
   * @returns The extensions stored in an object literal.
   *
   * @hidden
   */
  _unmarshallGltfExtensions(data) {
    const extensions = {
      root: {},
      mesh: {},
      node: {},
      idMapping: []
    };
    let index = 0;
    const readString = () => {
      const strPtr = data[index++];
      const strLen = data[index++];
      return this._engine.wasm.UTF8ViewToString(strPtr, strPtr + strLen);
    };
    const idMappingSize = data[index++];
    const idMapping = new Array(idMappingSize);
    for (let i = 0; i < idMappingSize; ++i) {
      idMapping[i] = data[index++];
    }
    extensions.idMapping = idMapping;
    const meshExtensionsSize = data[index++];
    for (let i = 0; i < meshExtensionsSize; ++i) {
      const objectId = data[index++];
      extensions.mesh[idMapping[objectId]] = JSON.parse(readString());
    }
    const nodeExtensionsSize = data[index++];
    for (let i = 0; i < nodeExtensionsSize; ++i) {
      const objectId = data[index++];
      extensions.node[idMapping[objectId]] = JSON.parse(readString());
    }
    const rootExtensionsStr = readString();
    if (rootExtensionsStr) {
      extensions.root = JSON.parse(rootExtensionsStr);
    }
    return extensions;
  }
  /**
   * Reset the scene.
   *
   * This method deletes all used and allocated objects, and components.
   */
  reset() {
    this._engine.wasm._wl_scene_reset();
    this._baseURL = "";
  }
};

// node_modules/@wonderlandengine/api/dist/texture-manager.js
var TextureManager2 = class {
  /** Wonderland Engine instance. @hidden */
  _engine;
  /** Texture cache. @hidden */
  #cache = [];
  /** @hidden */
  constructor(engine2) {
    this._engine = engine2;
  }
  /**
   * Retrieve the texture with the given id.
   *
   * @param id The texture identifier.
   * @return The {@link Texture} if found, `null` otherwise.
   */
  get(id) {
    return this.#cache[id] ?? null;
  }
  /**
   * Load an image from URL as {@link Texture}.
   *
   * @param filename URL to load from.
   * @param crossOrigin Cross origin flag for the image object.
   * @returns Loaded texture.
   */
  load(filename, crossOrigin) {
    let image = new Image();
    image.crossOrigin = crossOrigin ?? image.crossOrigin;
    image.src = filename;
    return new Promise((resolve, reject) => {
      image.onload = () => {
        let texture = new Texture2(this._engine, image);
        if (!texture.valid) {
          reject("Failed to add image " + image.src + " to texture atlas. Probably incompatible format.");
        }
        resolve(texture);
      };
      image.onerror = function() {
        reject("Failed to load image. Not found or no read access");
      };
    });
  }
  /**
   * Wrap a texture ID using {@link Texture}.
   *
   * @note This method performs caching and will return the same
   * instance on subsequent calls.
   *
   * @param id ID of the texture to create.
   *
   * @returns The texture.
   */
  wrap(id) {
    const texture = this.#cache[id] ?? (this.#cache[id] = new Texture2(this._engine, id));
    texture["_id"] = id;
    return texture;
  }
  /** Number of textures allocated in the manager. */
  get allocatedCount() {
    return this.#cache.length;
  }
  /**
   * Number of textures in the manager.
   *
   * @note For performance reasons, avoid calling this method when possible.
   */
  get count() {
    let count = 0;
    for (const tex of this.#cache) {
      if (tex && tex.id >= 0)
        ++count;
    }
    return count;
  }
  /**
   * Set a new texture in the manager cache.
   *
   * @note This api is meant to be used internally.
   *
   * @param texture The texture to add.
   *
   * @hidden
   */
  _set(texture) {
    this.#cache[texture.id] = texture;
  }
  /**
   * Destroys the texture.
   *
   * @note This api is meant to be used internally.
   *
   * @param texture The texture to destroy.
   *
   * @hidden
   */
  _destroy(texture) {
    this._engine.wasm._wl_texture_destroy(texture.id);
    const img = texture["_imageIndex"];
    if (img !== null) {
      this._engine.wasm._images[img] = null;
    }
  }
  /**
   * Reset the manager.
   *
   * @note This api is meant to be used internally.
   *
   * @hidden
   */
  _reset() {
    this.#cache.length = 0;
  }
};

// node_modules/@wonderlandengine/api/dist/engine.js
var WonderlandEngine2 = class {
  /**
   * {@link Emitter} for WebXR session end events.
   *
   * Usage from a within a component:
   * ```js
   * this.engine.onXRSessionEnd.add(() => console.log("XR session ended."));
   * ```
   */
  onXRSessionEnd = new Emitter2();
  /**
   * {@link Emitter} for WebXR session start events.
   *
   * Usage from a within a component:
   * ```js
   * this.engine.onXRSessionStart.add((session, mode) => console.log(session, mode));
   * ```
   *
   * By default, this emitter is retained and will automatically call any callback added
   * while a session is already started:
   *
   * ```js
   * // XR session is already active.
   * this.engine.onXRSessionStart.add((session, mode) => {
   *     console.log(session, mode); // Triggered immediately.
   * });
   * ```
   */
  onXRSessionStart = new RetainEmitter2();
  /**
   * {@link Emitter} for canvas / main framebuffer resize events.
   *
   * Usage from a within a component:
   * ```js
   * this.engine.onResize.add(() => {
   *     const canvas = this.engine.canvas;
   *     console.log(`New Size: ${canvas.width}, ${canvas.height}`);
   * });
   * ```
   *
   * @note The size of the canvas is in physical pixels, and is set via {@link WonderlandEngine.resize}.
   */
  onResize = new Emitter2();
  /** Whether AR is supported by the browser. */
  arSupported = false;
  /** Whether VR is supported by the browser. */
  vrSupported = false;
  /**
   * {@link Emitter} for scene loaded events.
   *
   * Listeners get notified when a call to {@link Scene#load()} finishes,
   * which also happens after the main scene has replaced the loading screen.
   *
   * Usage from a within a component:
   * ```js
   * this.engine.onSceneLoaded.add(() => console.log("Scene switched!"));
   * ```
   */
  onSceneLoaded = new Emitter2();
  /**
   * Current main scene.
   */
  scene = null;
  /**
   * Access to internationalization.
   */
  i18n = new I18N2(this);
  /**
   * WebXR related state, `null` if no XR session is active.
   */
  xr = null;
  /**
   * Component class instances per type to avoid GC.
   *
   * @note Maps the manager index to the list of components.
   *
   * @hidden
   */
  _componentCache = {};
  /** Object class instances to avoid GC. @hidden */
  _objectCache = [];
  /**
   * WebAssembly bridge.
   *
   * @hidden
   */
  #wasm;
  /**
   * Physics manager, only available when physx is enabled in the runtime.
   *
   * @hidden
   */
  #physics = null;
  /** Texture manager. @hidden */
  #textures = new TextureManager2(this);
  /**
   * Resize observer to track for canvas size changes.
   *
   * @hidden
   */
  #resizeObserver = null;
  /**
   * Create a new engine instance.
   *
   * @param wasm Wasm bridge instance
   * @param loadingScreen Loading screen .bin file data
   *
   * @hidden
   */
  constructor(wasm, loadingScreen) {
    this.#wasm = wasm;
    this.#wasm["_setEngine"](this);
    this.#wasm._loadingScreen = loadingScreen;
    this._componentCache = {};
    this._objectCache.length = 0;
    this.canvas.addEventListener("webglcontextlost", function(e) {
      console.error("Context lost:");
      console.error(e);
    }, false);
  }
  /**
   * Start the engine if it's not already running.
   *
   * When using the {@link loadRuntime} function, this method is called
   * automatically.
   */
  start() {
    this.wasm._wl_application_start();
  }
  /**
   * Register a custom JavaScript component type.
   *
   * You can register a component directly using a class inheriting from {@link Component}:
   *
   * ```js
   * import { Component, Type } from '@wonderlandengine/api';
   *
   * export class MyComponent extends Component {
   *     static TypeName = 'my-component';
   *     static Properties = {
   *         myParam: {type: Type.Float, default: 42.0},
   *     };
   *     init() {}
   *     start() {}
   *     update(dt) {}
   *     onActivate() {}
   *     onDeactivate() {}
   *     onDestroy() {}
   * });
   *
   * // Here, we assume we have an engine already instantiated.
   * // In general, the registration occurs in the `index.js` file in your
   * // final application.
   * engine.registerComponent(MyComponent);
   * ```
   *
   * {@label CLASSES}
   * @param classes Custom component(s) extending {@link Component}.
   *
   * @since 1.0.0
   */
  registerComponent(...classes) {
    for (const arg of classes) {
      this.wasm._registerComponent(arg);
    }
  }
  /**
   * Checks whether the given component is registered or not.
   *
   * @param typeOrClass A string representing the component typename (e.g., `'cursor-component'`),
   *     or a component class (e.g., `CursorComponent`).
   * @returns `true` if the component is registered, `false` otherwise.
   */
  isRegistered(typeOrClass) {
    return this.#wasm.isRegistered(isString2(typeOrClass) ? typeOrClass : typeOrClass.TypeName);
  }
  /**
   * Resize the canvas and the rendering context.
   *
   * @note The `width` and `height` parameters will be scaled by the
   * `devicePixelRatio` value. By default, the pixel ratio used is
   * [window.devicePixelRatio](https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio).
   *
   * @param width The width, in CSS pixels.
   * @param height The height, in CSS pixels.
   * @param devicePixelRatio The pixel ratio factor.
   */
  resize(width, height, devicePixelRatio = window.devicePixelRatio) {
    width = width * devicePixelRatio;
    height = height * devicePixelRatio;
    this.canvas.width = width;
    this.canvas.height = height;
    this.wasm._wl_application_resize(width, height);
    this.onResize.notify();
  }
  /**
   * Run the next frame.
   *
   * @param fixedDelta The elapsed time between this frame and the previous one.
   *
   * @note The engine automatically schedules next frames. You should only
   * use this method for testing.
   */
  nextFrame(fixedDelta = 0) {
    this.#wasm._wl_nextFrame(fixedDelta);
  }
  /**
   * Request a XR session.
   *
   * @note Please use this call instead of directly calling `navigator.xr.requestSession()`.
   * Wonderland Engine requires to be aware that a session is started, and this
   * is done through this call.
   *
   * @param mode The XR mode.
   * @param features An array of required features, e.g., `['local-floor', 'hit-test']`.
   * @param optionalFeatures An array of optional features, e.g., `['bounded-floor', 'depth-sensing']`.
   * @returns A promise resolving with the `XRSession`, a string error message otherwise.
   */
  requestXRSession(mode, features, optionalFeatures = []) {
    if (!navigator.xr) {
      const isLocalhost = location.hostname === "localhost" || location.hostname === "127.0.0.1";
      const missingHTTPS = location.protocol !== "https:" && !isLocalhost;
      return Promise.reject(missingHTTPS ? "WebXR is only supported with HTTPS or on localhost!" : "WebXR unsupported in this browser.");
    }
    return this.#wasm.webxr_requestSession(mode, features, optionalFeatures);
  }
  /**
   * Wrap an object ID using {@link Object}.
   *
   * @note This method performs caching and will return the same
   * instance on subsequent calls.
   *
   * @param objectId ID of the object to create.
   *
   * @returns The object
   */
  wrapObject(objectId) {
    const cache = this._objectCache;
    const o = cache[objectId] || (cache[objectId] = new Object3D2(this, objectId));
    o["_objectId"] = objectId;
    return o;
  }
  /* Public Getters & Setter */
  /**
   * WebAssembly bridge.
   *
   * @note Use with care. This object is used to communicate
   * with the WebAssembly code throughout the api.
   *
   * @hidden
   */
  get wasm() {
    return this.#wasm;
  }
  /** Canvas element that Wonderland Engine renders to. */
  get canvas() {
    return this.#wasm.canvas;
  }
  /**
   * Current WebXR session or `null` if no session active.
   *
   * @deprecated Use {@link XR.session} on the {@link xr}
   * object instead.
   */
  get xrSession() {
    return this.xr?.session ?? null;
  }
  /**
   * Current WebXR frame or `null` if no session active.
   *
   * @deprecated Use {@link XR.frame} on the {@link xr}
   * object instead.
   */
  get xrFrame() {
    return this.xr?.frame ?? null;
  }
  /**
   * Current WebXR base layer or `null` if no session active.
   *
   * @deprecated Use {@link XR.baseLayer} on the {@link xr}
   * object instead.
   */
  get xrBaseLayer() {
    return this.xr?.baseLayer ?? null;
  }
  /**
   * Current WebXR framebuffer or `null` if no session active.
   *
   * @deprecated Use {@link XR.framebuffers} on the
   * {@link xr} object instead.
   */
  get xrFramebuffer() {
    return this.xr?.framebuffers[0] ?? null;
  }
  /** Framebuffer scale factor. */
  get xrFramebufferScaleFactor() {
    return this.#wasm.webxr_framebufferScaleFactor;
  }
  set xrFramebufferScaleFactor(value) {
    this.#wasm.webxr_framebufferScaleFactor = value;
  }
  /** Physics manager, only available when physx is enabled in the runtime. */
  get physics() {
    return this.#physics;
  }
  /**
   * Texture managger.
   *
   * Use this to load or programmatically create new textures at runtime.
   */
  get textures() {
    return this.#textures;
  }
  /*
   * Enable or disable the mechanism to automatically resize the canvas.
   *
   * Internally, the engine uses a [ResizeObserver](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver).
   * Changing the canvas css will thus automatically be tracked by the engine.
   */
  set autoResizeCanvas(flag) {
    const state = !!this.#resizeObserver;
    if (state === flag)
      return;
    if (!flag) {
      this.#resizeObserver?.unobserve(this.canvas);
      this.#resizeObserver = null;
      return;
    }
    this.#resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === this.canvas) {
          this.resize(entry.contentRect.width, entry.contentRect.height);
        }
      }
    });
    this.#resizeObserver.observe(this.canvas);
  }
  /** `true` if the canvas is automatically resized by the engine. */
  get autoResizeCanvas() {
    return this.#resizeObserver !== null;
  }
  /** Retrieves the runtime version. */
  get runtimeVersion() {
    const wasm = this.#wasm;
    const v = wasm._wl_application_version(wasm._tempMem);
    return {
      major: wasm._tempMemUint16[0],
      minor: wasm._tempMemUint16[1],
      patch: wasm._tempMemUint16[2],
      rc: wasm._tempMemUint16[3]
    };
  }
  /* Internal-Only Methods */
  /**
   * Initialize the engine.
   *
   * @note Should be called after the WebAssembly is fully loaded.
   *
   * @hidden
   */
  _init() {
    this.scene = new Scene2(this);
    this.#wasm._wl_set_error_callback(this.#wasm.addFunction((messagePtr) => {
      throw new Error(this.#wasm.UTF8ToString(messagePtr));
    }, "vi"));
    this.#physics = null;
    if (this.#wasm.withPhysX) {
      const physics = new Physics2(this);
      this.#wasm._wl_physx_set_collision_callback(this.#wasm.addFunction((a, index, type, b) => {
        const callback = physics._callbacks[a][index];
        const component = new PhysXComponent2(this, this.wasm._typeIndexFor("physx"), b);
        callback(type, component);
      }, "viiii"));
      this.#physics = physics;
    }
    this.resize(this.canvas.clientWidth, this.canvas.clientHeight);
  }
  /**
   * Reset the runtime state, including:
   *     - Component cache
   *     - Images
   *     - Callbacks
   *
   * @note This api is meant to be used internally.
   *
   * @hidden
   */
  _reset() {
    this._componentCache = {};
    this._objectCache.length = 0;
    this.#textures._reset();
    this.scene.reset();
    this.wasm.reset();
  }
  /**
   * Retrieves a component instance if it exists, or create and cache
   * a new one.
   *
   * @note This api is meant to be used internally. Please have a look at
   * {@link Object3D.addComponent} instead.
   *
   * @param type component type name
   * @param componentType Component manager index
   * @param componentId Component id in the manager
   *
   * @returns JavaScript instance wrapping the native component
   *
   * @hidden
   */
  _wrapComponent(type, componentType, componentId) {
    if (componentId < 0)
      return null;
    const c = this._componentCache[componentType] || (this._componentCache[componentType] = []);
    if (c[componentId]) {
      return c[componentId];
    }
    let component;
    if (type == "collision") {
      component = new CollisionComponent2(this, componentType, componentId);
    } else if (type == "text") {
      component = new TextComponent2(this, componentType, componentId);
    } else if (type == "view") {
      component = new ViewComponent2(this, componentType, componentId);
    } else if (type == "mesh") {
      component = new MeshComponent2(this, componentType, componentId);
    } else if (type == "input") {
      component = new InputComponent2(this, componentType, componentId);
    } else if (type == "light") {
      component = new LightComponent2(this, componentType, componentId);
    } else if (type == "animation") {
      component = new AnimationComponent2(this, componentType, componentId);
    } else if (type == "physx") {
      component = new PhysXComponent2(this, componentType, componentId);
    } else {
      const typeIndex = this.wasm._componentTypeIndices[type];
      const constructor = this.wasm._componentTypes[typeIndex];
      component = new constructor(this);
    }
    component._engine = this;
    component._manager = componentType;
    component._id = componentId;
    c[componentId] = component;
    return component;
  }
};

// node_modules/@wonderlandengine/api/dist/wasm.js
var _componentDefaults2 = /* @__PURE__ */ new Map([
  [Type2.Bool, false],
  [Type2.Int, 0],
  [Type2.Float, 0],
  [Type2.String, ""],
  [Type2.Enum, void 0],
  [Type2.Object, null],
  [Type2.Mesh, null],
  [Type2.Texture, null],
  [Type2.Material, null],
  [Type2.Animation, null],
  [Type2.Skin, null],
  [Type2.Color, [0, 0, 0, 1]]
]);
function _setupDefaults(ctor) {
  for (const name in ctor.Properties) {
    const p = ctor.Properties[name];
    if (p.type === Type2.Enum) {
      if (p.values?.length) {
        if (typeof p.default !== "number") {
          p.default = p.values.indexOf(p.default);
        }
        if (p.default < 0 || p.default >= p.values.length) {
          p.default = 0;
        }
      } else {
        p.default = void 0;
      }
    } else {
      p.default = p.default ?? _componentDefaults2.get(p.type);
    }
    ctor.prototype[name] = p.default;
  }
}
var WASM2 = class {
  /**
   * Emscripten worker field.
   *
   * @note This api is meant to be used internally.
   */
  worker = "";
  /**
   * Emscripten wasm field.
   *
   * @note This api is meant to be used internally.
   */
  wasm = null;
  /**
   * Emscripten canvas.
   *
   * @note This api is meant to be used internally.
   */
  canvas = null;
  /** Current WebXR  */
  /**
   * Emscripten WebXR session.
   *
   * @note This api is meant to be used internally.
   */
  webxr_session = null;
  /**
   * Emscripten WebXR request session callback.
   *
   * @note This api is meant to be used internally.
   */
  webxr_requestSession = null;
  /**
   * Emscripten WebXR frame.
   *
   * @note This api is meant to be used internally.
   */
  webxr_frame = null;
  /**
   * Emscripten current WebXR reference space.
   *
   * @note This api is meant to be used internally.
   */
  webxr_refSpace = null;
  /**
   * Emscripten WebXR reference spaces.
   *
   * @note This api is meant to be used internally.
   */
  webxr_refSpaces = null;
  /**
   * Emscripten WebXR current reference space type.
   *
   * @note This api is meant to be used internally.
   */
  webxr_refSpaceType = null;
  /**
   * Emscripten WebXR GL projection layer.
   *
   * @note This api is meant to be used internally.
   */
  webxr_baseLayer = null;
  /**
   * Emscripten WebXR framebuffer scale factor.
   *
   * @note This api is meant to be used internally.
   */
  webxr_framebufferScaleFactor = 1;
  /**
   * Emscripten WebXR framebuffer(s).
   *
   * @note This api is meant to be used internally.
   */
  /* webxr_fbo will not get overwritten if we are rendering to the
   * default framebuffer, e.g., when using WebXR emulator. */
  webxr_fbo = 0;
  /**
   * Convert a WASM memory view to a JavaScript string.
   *
   * @param ptr Pointer start
   * @param ptrEnd Pointer end
   * @returns JavaScript string
   */
  UTF8ViewToString;
  /** If `true`, logs will not spam the console on error. */
  _deactivate_component_on_error = false;
  /** Temporary memory pointer. */
  _tempMem = null;
  /** Temporary memory size. */
  _tempMemSize = 0;
  /** Temporary float memory view. */
  _tempMemFloat = null;
  /** Temporary int memory view. */
  _tempMemInt = null;
  /** Temporary uint8 memory view. */
  _tempMemUint8 = null;
  /** Temporary uint32 memory view. */
  _tempMemUint32 = null;
  /** Temporary uint16 memory view. */
  _tempMemUint16 = null;
  /** Loading screen .bin file data */
  _loadingScreen = null;
  /** List of callbacks triggered when the scene is loaded. */
  _sceneLoadedCallback = [];
  /**
   * Material definition cache. Each pipeline has its own
   * associated material definition.
   */
  _materialDefinitions = [];
  /** Image cache. */
  _images = [];
  /** Component instances. */
  _components = [];
  /** Component Type info. */
  _componentTypes = [];
  /** Index per component type name. */
  _componentTypeIndices = {};
  /** Wonderland engine instance. */
  _engine = null;
  /**
   * `true` if this runtime is using physx.
   *
   * @note This api is meant to be used internally.
   */
  _withPhysX = false;
  /** Decoder for UTF8 `ArrayBuffer` to JavaScript string. */
  _utf8Decoder = new TextDecoder("utf8");
  /** JavaScript manager index. */
  _jsManagerIndexCached = null;
  /**
   * Registration index of {@link BrokenComponent}.
   *
   * This is used to return dummy instances when a component
   * isn't registered.
   *
   * @hidden
   */
  _brokenComponentIndex = 0;
  /**
   * Create a new instance of the WebAssembly <> API bridge.
   *
   * @param threads `true` if the runtime used has threads support
   */
  constructor(threads4) {
    if (threads4) {
      this.UTF8ViewToString = (s, e) => {
        if (!s)
          return "";
        return this._utf8Decoder.decode(this.HEAPU8.slice(s, e));
      };
      return;
    }
    this.UTF8ViewToString = (s, e) => {
      if (!s)
        return "";
      return this._utf8Decoder.decode(this.HEAPU8.subarray(s, e));
    };
    this._brokenComponentIndex = this._registerComponent(BrokenComponent);
  }
  /**
   * Reset the cache of the library.
   *
   * @note Should only be called when tearing down the runtime.
   */
  reset() {
    this.allocateTempMemory(1024);
    this._materialDefinitions = [];
    this._images = [];
    this._components = [];
    this._componentTypes = [];
    this._componentTypeIndices = {};
    this._jsManagerIndexCached = null;
    this._brokenComponentIndex = this._registerComponent(BrokenComponent);
  }
  /**
   * Checks whether the given component is registered or not.
   *
   * @param ctor  A string representing the component typename (e.g., `'cursor-component'`).
   * @returns `true` if the component is registered, `false` otherwise.
   */
  isRegistered(type) {
    return type in this._componentTypeIndices;
  }
  /**
   * Register a legacy component in this Emscripten instance.
   *
   * @note This api is meant to be used internally.
   *
   * @param typeName The name of the component.
   * @param params An object containing the parameters (properties).
   * @param object The object's prototype.
   * @returns The registration index
   */
  _registerComponentLegacy(typeName, params, object) {
    const ctor = class CustomComponent extends Component2 {
    };
    ctor.TypeName = typeName;
    ctor.Properties = params;
    Object.assign(ctor.prototype, object);
    return this._registerComponent(ctor);
  }
  /**
   * Register a class component in this Emscripten instance.
   *
   * @note This api is meant to be used internally.
   *
   * @param ctor The class to register.
   * @returns The registration index.
   */
  _registerComponent(ctor) {
    if (!ctor.TypeName)
      throw new Error("no name provided for component.");
    if (!ctor.prototype._triggerInit) {
      throw new Error(`registerComponent(): Component ${ctor.TypeName} must extend Component`);
    }
    const dependencies = ctor.Dependencies;
    if (dependencies) {
      for (const dependency of dependencies) {
        if (!this.isRegistered(dependency.TypeName)) {
          this._registerComponent(dependency);
        }
      }
    }
    inheritProperties(ctor);
    _setupDefaults(ctor);
    const typeIndex = ctor.TypeName in this._componentTypeIndices ? this._componentTypeIndices[ctor.TypeName] : this._componentTypes.length;
    this._componentTypes[typeIndex] = ctor;
    this._componentTypeIndices[ctor.TypeName] = typeIndex;
    if (ctor === BrokenComponent)
      return typeIndex;
    console.log("Registered component", ctor.TypeName, `(class ${ctor.name})`, "with index", typeIndex);
    if (ctor.onRegister)
      ctor.onRegister(this._engine);
    return typeIndex;
  }
  /**
   * Allocate the requested amount of temporary memory
   * in this WASM instance.
   *
   * @param size The number of bytes to allocate
   */
  allocateTempMemory(size) {
    console.log("Allocating temp mem:", size);
    this._tempMemSize = size;
    if (this._tempMem)
      this._free(this._tempMem);
    this._tempMem = this._malloc(this._tempMemSize);
    this.updateTempMemory();
  }
  /**
   * @todo: Delete this and only keep `allocateTempMemory`
   *
   * @param size Number of bytes to allocate
   */
  requireTempMem(size) {
    if (this._tempMemSize >= size)
      return;
    this.allocateTempMemory(Math.ceil(size / 1024) * 1024);
  }
  /**
   * Update the temporary memory views. This must be called whenever the
   * temporary memory address changes.
   *
   * @note This api is meant to be used internally.
   */
  updateTempMemory() {
    this._tempMemFloat = new Float32Array(this.HEAP8.buffer, this._tempMem, this._tempMemSize >> 2);
    this._tempMemInt = new Int32Array(this.HEAP8.buffer, this._tempMem, this._tempMemSize >> 2);
    this._tempMemUint32 = new Uint32Array(this.HEAP8.buffer, this._tempMem, this._tempMemSize >> 2);
    this._tempMemUint16 = new Uint16Array(this.HEAP8.buffer, this._tempMem, this._tempMemSize >> 1);
    this._tempMemUint8 = new Uint8Array(this.HEAP8.buffer, this._tempMem, this._tempMemSize);
  }
  /**
   * Returns a uint8 buffer view on temporary WASM memory.
   *
   * **Note**: this method might allocate if the requested memory is bigger
   * than the current temporary memory allocated.
   *
   * @param count The number of **elements** required
   * @returns A {@link TypedArray} over the WASM memory
   */
  getTempBufferU8(count) {
    this.requireTempMem(count);
    return this._tempMemUint8;
  }
  /**
   * Returns a uint16 buffer view on temporary WASM memory.
   *
   * **Note**: this method might allocate if the requested memory is bigger
   * than the current temporary memory allocated.
   *
   * @param count The number of **elements** required
   * @returns A {@link TypedArray} over the WASM memory
   */
  getTempBufferU16(count) {
    this.requireTempMem(count * 2);
    return this._tempMemUint16;
  }
  /**
   * Returns a uint32 buffer view on temporary WASM memory.
   *
   * **Note**: this method might allocate if the requested memory is bigger
   * than the current temporary memory allocated.
   *
   * @param count The number of **elements** required.
   * @returns A {@link TypedArray} over the WASM memory.
   */
  getTempBufferU32(count) {
    this.requireTempMem(count * 4);
    return this._tempMemUint32;
  }
  /**
   * Returns a int32 buffer view on temporary WASM memory.
   *
   * **Note**: this method might allocate if the requested memory is bigger
   * than the current temporary memory allocated.
   *
   * @param count The number of **elements** required.
   * @returns A {@link TypedArray} over the WASM memory.
   */
  getTempBufferI32(count) {
    this.requireTempMem(count * 4);
    return this._tempMemInt;
  }
  /**
   * Returns a float32 buffer view on temporary WASM memory.
   *
   * **Note**: this method might allocate if the requested memory is bigger
   * than the current temporary memory allocated.
   *
   * @param count The number of **elements** required.
   * @returns A {@link TypedArray} over the WASM memory.
   */
  getTempBufferF32(count) {
    this.requireTempMem(count * 4);
    return this._tempMemFloat;
  }
  /**
   * Copy the string into temporary WASM memory and retrieve the pointer.
   *
   * @note This method will compute the strlen and append a `\0`.
   *
   * @note The result should be used **directly** otherwise it might get
   * overridden by any next call modifying the temporary memory.
   *
   * @param str The string to write to temporary memory
   * @param byteOffset The starting byte offset in the temporary memory at which
   *     the string should be written. This is useful when using multiple temporaries.
   * @return The temporary pointer onto the WASM memory
   */
  tempUTF8(str, byteOffset = 0) {
    const strLen = this.lengthBytesUTF8(str) + 1;
    this.requireTempMem(strLen + byteOffset);
    const ptr = this._tempMem + byteOffset;
    this.stringToUTF8(str, ptr, strLen);
    return ptr;
  }
  /**
   * Return the index of the component type.
   *
   * @note This method uses malloc and copies the string
   * to avoid overwriting caller's temporary data.
   *
   * @param type The type
   * @return The component type index
   */
  _typeIndexFor(type) {
    const lengthBytes = this.lengthBytesUTF8(type) + 1;
    const mem = this._malloc(lengthBytes);
    this.stringToUTF8(type, mem, lengthBytes);
    const componentType = this._wl_get_component_manager_index(mem);
    this._free(mem);
    return componentType;
  }
  /**
   * Return the name of component type stored at the given index.
   *
   * @param typeIndex The type index
   * @return The name as a string
   */
  _typeNameFor(typeIndex) {
    return this.UTF8ToString(this._wl_component_manager_name(typeIndex));
  }
  /**
   * Returns `true` if the runtime supports physx or not.
   */
  get withPhysX() {
    return this._withPhysX;
  }
  /** JavaScript manager index. */
  get _jsManagerIndex() {
    if (this._jsManagerIndexCached === null) {
      this._jsManagerIndexCached = this._typeIndexFor("js");
    }
    return this._jsManagerIndexCached;
  }
  /**
   * Set the engine instance holding this bridge.
   *
   * @note This api is meant to be used internally.
   *
   * @param engine The engine instance.
   */
  _setEngine(engine2) {
    this._engine = engine2;
  }
  /* WebAssembly to JS call bridge. */
  _wljs_xr_session_start(mode) {
    if (this._engine.xr === null) {
      this._engine.xr = new XR2(this, mode);
      this._engine.onXRSessionStart.notify(this.webxr_session, mode);
    }
  }
  _wljs_xr_session_end() {
    const startEmitter = this._engine.onXRSessionStart;
    if (startEmitter instanceof RetainEmitter2)
      startEmitter.reset();
    this._engine.onXRSessionEnd.notify();
    this._engine.xr = null;
  }
  _wljs_xr_disable() {
    this._engine.arSupported = false;
    this._engine.vrSupported = false;
  }
  _wljs_allocate(numComponents) {
    this._components = new Array(numComponents);
  }
  _wljs_init(withPhysX) {
    this._withPhysX = withPhysX;
    this.allocateTempMemory(1024);
  }
  _wljs_reallocate(numComponents) {
    if (numComponents > this._components.length) {
      this._components.length = numComponents;
    }
  }
  _wljs_scene_add_material_definition(definitionId) {
    const definition = /* @__PURE__ */ new Map();
    const nbParams = this._wl_material_definition_get_count(definitionId);
    for (let i = 0; i < nbParams; ++i) {
      const name = this.UTF8ToString(this._wl_material_definition_get_param_name(definitionId, i));
      const t = this._wl_material_definition_get_param_type(definitionId, i);
      definition.set(name, {
        index: i,
        type: {
          type: t & 255,
          componentCount: t >> 8 & 255,
          metaType: t >> 16 & 255
        }
      });
    }
    this._materialDefinitions[definitionId] = definition;
  }
  _wljs_set_component_param_bool(c, p, pe, v) {
    const param = this.UTF8ViewToString(p, pe);
    this._components[c][param] = v !== 0;
  }
  _wljs_set_component_param_int(c, p, pe, v) {
    const param = this.UTF8ViewToString(p, pe);
    this._components[c][param] = v;
  }
  _wljs_set_component_param_float(c, p, pe, v) {
    const param = this.UTF8ViewToString(p, pe);
    this._components[c][param] = v;
  }
  _wljs_set_component_param_string(c, p, pe, v, ve) {
    const param = this.UTF8ViewToString(p, pe);
    const value = this.UTF8ViewToString(v, ve);
    this._components[c][param] = value;
  }
  _wljs_set_component_param_color(c, p, pe, v) {
    const param = this.UTF8ViewToString(p, pe);
    this._components[c][param] = new Float32Array([0, 8, 16, 24].map((s) => (v >>> s & 255) / 255));
  }
  _wljs_set_component_param_object(c, p, pe, v) {
    const param = this.UTF8ViewToString(p, pe);
    this._components[c][param] = v > 0 ? this._engine.wrapObject(v) : null;
  }
  _wljs_set_component_param_mesh(c, p, pe, v) {
    const param = this.UTF8ViewToString(p, pe);
    this._components[c][param] = v > 0 ? new Mesh2(this._engine, v) : null;
  }
  _wljs_set_component_param_texture(c, p, pe, v) {
    const param = this.UTF8ViewToString(p, pe);
    this._components[c][param] = v > 0 ? this._engine.textures.wrap(v) : null;
  }
  _wljs_set_component_param_material(c, p, pe, v) {
    const param = this.UTF8ViewToString(p, pe);
    this._components[c][param] = v > 0 ? new Material2(this._engine, v) : null;
  }
  _wljs_set_component_param_animation(c, p, pe, v) {
    const param = this.UTF8ViewToString(p, pe);
    this._components[c][param] = v > 0 ? new Animation2(this._engine, v) : null;
  }
  _wljs_set_component_param_skin(c, p, pe, v) {
    const param = this.UTF8ViewToString(p, pe);
    this._components[c][param] = v > 0 ? new Skin2(this._engine, v) : null;
  }
  _wljs_get_component_type_index(namePtr, nameEndPtr) {
    const typename = this.UTF8ViewToString(namePtr, nameEndPtr);
    const index = this._componentTypeIndices[typename];
    if (index === void 0) {
      console.error(`component '${typename}' not found during scene loading.
Components must be registered before loading using 'engine.registerComponent()'`);
      return this._brokenComponentIndex;
    }
    return index;
  }
  _wljs_component_create(jsManagerIndex, index, id, type, object) {
    const ctor = this._componentTypes[type];
    if (!ctor) {
      throw new Error(`Type index ${type} isn't registered`);
    }
    let component = null;
    try {
      component = new ctor();
    } catch (e) {
      console.error(`Exception during instantiation of component ${ctor.TypeName}`);
      component = new BrokenComponent(this._engine);
    }
    component._engine = this._engine;
    component._manager = jsManagerIndex;
    component._id = id;
    component._object = this._engine.wrapObject(object);
    try {
      component.resetProperties();
    } catch (e) {
      console.error(`Exception during ${component.type} resetProperties() on object ${component.object.name}`);
    }
    this._components[index] = component;
    return component;
  }
  _wljs_component_init(component) {
    const c = this._components[component];
    c._triggerInit();
  }
  _wljs_component_update(component, dt) {
    const c = this._components[component];
    c._triggerUpdate(dt);
  }
  _wljs_component_onActivate(component) {
    const c = this._components[component];
    if (c)
      c._triggerOnActivate();
  }
  _wljs_component_onDeactivate(component) {
    const c = this._components[component];
    c._triggerOnDeactivate();
  }
  _wljs_component_onDestroy(component) {
    const c = this._components[component];
    c._triggerOnDestroy();
  }
  _wljs_swap(a, b) {
    const componentA = this._components[a];
    this._components[a] = this._components[b];
    this._components[b] = componentA;
  }
};

// node_modules/@wonderlandengine/api/dist/version.js
var APIVersion2 = {
  major: 1,
  minor: 1,
  patch: 0,
  rc: 0
};

// node_modules/@wonderlandengine/api/dist/index.js
var LOADING_SCREEN_PATH = "WonderlandRuntime-LoadingScreen.bin";
function loadScript(scriptURL) {
  return new Promise((res, rej) => {
    const s = document.createElement("script");
    const node = document.body.appendChild(s);
    s.onload = () => {
      document.body.removeChild(node);
      res();
    };
    s.onerror = (e) => {
      document.body.removeChild(node);
      rej(e);
    };
    s.src = scriptURL;
  });
}
async function detectFeatures() {
  let [simdSupported, threadsSupported] = await Promise.all([simd2(), threads2()]);
  if (simdSupported) {
    console.log("WASM SIMD is supported");
  } else {
    console.warn("WASM SIMD is not supported");
  }
  if (threadsSupported) {
    if (self.crossOriginIsolated) {
      console.log("WASM Threads is supported");
    } else {
      console.warn("WASM Threads is supported, but the page is not crossOriginIsolated, therefore thread support is disabled.");
    }
  } else {
    console.warn("WASM Threads is not supported");
  }
  threadsSupported = threadsSupported && self.crossOriginIsolated;
  return {
    simdSupported,
    threadsSupported
  };
}
var xrSupported = {
  ar: null,
  vr: null
};
function checkXRSupport() {
  if (typeof navigator === "undefined" || !navigator.xr) {
    xrSupported.vr = false;
    xrSupported.ar = false;
    return Promise.resolve(xrSupported);
  }
  const vrPromise = xrSupported.vr !== null ? Promise.resolve() : navigator.xr.isSessionSupported("immersive-vr").then((supported) => xrSupported.vr = supported);
  const arPromise = xrSupported.ar !== null ? Promise.resolve() : navigator.xr.isSessionSupported("immersive-ar").then((supported) => xrSupported.ar = supported);
  return Promise.all([vrPromise, arPromise]).then(() => xrSupported);
}
function checkRuntimeCompatibility(version) {
  const { major, minor } = version;
  let majorDiff = major - APIVersion2.major;
  let minorDiff = minor - APIVersion2.minor;
  if (!majorDiff && !minorDiff)
    return;
  const error = "checkRuntimeCompatibility(): Version compatibility mismatch:\n	\u2192 API and runtime compatibility is enforced on a patch level (versions x.y.*)\n";
  const isRuntimeOlder = majorDiff < 0 || !majorDiff && minorDiff < 0;
  if (isRuntimeOlder) {
    throw new Error(`${error}	\u2192 Please use a Wonderland Engine editor version >= ${APIVersion2.major}.${APIVersion2.minor}.*`);
  }
  throw new Error(`${error}	\u2192 Please use a new API version >= ${version.major}.${version.minor}.*`);
}
async function loadRuntime(runtime, options = {}) {
  const xrPromise = checkXRSupport();
  const baseURL = getBaseUrl(runtime);
  const { simdSupported, threadsSupported } = await detectFeatures();
  const { simd: simd4 = simdSupported, threads: threads4 = threadsSupported, physx = false, loader = false, xrFramebufferScaleFactor = 1, loadingScreen = baseURL ? `${baseURL}/${LOADING_SCREEN_PATH}` : LOADING_SCREEN_PATH, canvas = "canvas" } = options;
  const variant = [];
  if (loader)
    variant.push("loader");
  if (physx)
    variant.push("physx");
  if (simd4)
    variant.push("simd");
  if (threads4)
    variant.push("threads");
  const variantStr = variant.join("-");
  let filename = runtime;
  if (variantStr)
    filename = `${filename}-${variantStr}`;
  const download = function(filename2, errorMessage) {
    return fetch(filename2).then((r) => {
      if (!r.ok)
        return Promise.reject(errorMessage);
      return r.arrayBuffer();
    }).catch((_) => Promise.reject(errorMessage));
  };
  const [wasmData, loadingScreenData] = await Promise.all([
    download(`${filename}.wasm`, "Failed to fetch runtime .wasm file"),
    download(loadingScreen, "Failed to fetch loading screen file")
  ]);
  const glCanvas = document.getElementById(canvas);
  if (!glCanvas) {
    throw new Error(`loadRuntime(): Failed to find canvas with id '${canvas}'`);
  }
  if (!(glCanvas instanceof HTMLCanvasElement)) {
    throw new Error(`loadRuntime(): HTML element '${canvas}' must be a canvas`);
  }
  const wasm = new WASM2(threads4);
  wasm.worker = `${filename}.worker.js`;
  wasm.wasm = wasmData;
  wasm.canvas = glCanvas;
  const engine2 = new WonderlandEngine2(wasm, loadingScreenData);
  if (!window._WL) {
    window._WL = { runtimes: {} };
  }
  const runtimes = window._WL.runtimes;
  const runtimeGlobalId = variantStr ? variantStr : "default";
  if (!runtimes[runtimeGlobalId]) {
    await loadScript(`${filename}.js`);
    runtimes[runtimeGlobalId] = window.instantiateWonderlandRuntime;
    window.instantiateWonderlandRuntime = void 0;
  }
  await runtimes[runtimeGlobalId](wasm);
  engine2._init();
  checkRuntimeCompatibility(engine2.runtimeVersion);
  const xr = await xrPromise;
  engine2.arSupported = xr.ar;
  engine2.vrSupported = xr.vr;
  engine2.xrFramebufferScaleFactor = xrFramebufferScaleFactor;
  engine2.autoResizeCanvas = true;
  engine2.start();
  return engine2;
}

// js/button-end-ar-session.ts
var ButtonEndARSession = class extends Component2 {
  xrEndButton;
  init() {
    const rect = this.engine.canvas.getBoundingClientRect();
    this.xrEndButton = document.createElement("button");
    this.xrEndButton.style.lineHeight = "40px";
    this.xrEndButton.style.position = "absolute";
    this.xrEndButton.style.left = rect.left + "px";
    this.xrEndButton.style.top = rect.top + window.scrollY + "px";
    this.xrEndButton.style.zIndex = "999";
    this.xrEndButton.style.display = "none";
    this.xrEndButton.innerHTML = "END AR SESSION";
    document.body.appendChild(this.xrEndButton);
    this.xrEndButton.addEventListener("click", () => {
      ARSession.getSessionForEngine(this.engine).stopARSession();
    });
    ARSession.getSessionForEngine(this.engine).onSessionStart.add(() => {
      this.xrEndButton.style.display = "block";
    });
    ARSession.getSessionForEngine(this.engine).onSessionEnd.add(() => {
      this.xrEndButton.style.display = "none";
    });
  }
};
__publicField(ButtonEndARSession, "TypeName", "button-end-ar-session");

// js/button-start-ar-session.ts
var ButtonStartARSession = class extends Component2 {
  start() {
    ARSession.getSessionForEngine(this.engine).onARSessionReady.add(
      this.onARSessionReady.bind(this)
    );
    ARSession.getSessionForEngine(this.engine).onSessionEnd.add(() => {
      const xrButton = document.querySelector("#ar-button");
      xrButton.style.display = "block";
    });
  }
  onARSessionReady() {
    const xrButton = document.querySelector("#ar-button");
    if (xrButton === null) {
      console.error("No #ar-button found. Session will not start.");
      return;
    }
    xrButton.dataset.supported = "true";
    xrButton.addEventListener("click", () => {
      xrButton.style.display = "none";
      for (const c of this.object.getComponents()) {
        if (c instanceof ARCamera) {
          c.startSession();
          break;
        }
      }
    });
  }
};
__publicField(ButtonStartARSession, "TypeName", "button-start-ar-session");

// js/face-attachment-point-example.ts
var FaceAttachmentPoints = Object.values(FaceAttachmentPoint);
var FaceAttachmentPointExample = class extends Component2 {
  ARFaceTrackingCamera;
  attachmentPoint = 0;
  attachedObject;
  start() {
    if (!this.ARFaceTrackingCamera) {
      console.warn(
        `${this.object.name}/${this.type} requires a ${ARFaceTrackingCamera.TypeName}`
      );
      return;
    }
    const camera = this.ARFaceTrackingCamera.getComponent(ARFaceTrackingCamera);
    if (!camera) {
      throw new Error(
        `${ARFaceTrackingCamera.TypeName} was not found on ARFaceTrackingCamera`
      );
    }
    const cachedPosition = new Float32Array(3);
    const cachedRotation = new Float32Array(4);
    const cachedScale = new Float32Array(3);
    this.object.setScalingWorld(cachedScale);
    camera.onFaceUpdate.add((data) => {
      const { transform, attachmentPoints } = data;
      cachedRotation[0] = transform.rotation.x;
      cachedRotation[1] = transform.rotation.y;
      cachedRotation[2] = transform.rotation.z;
      cachedRotation[3] = transform.rotation.w;
      cachedPosition[0] = transform.position.x;
      cachedPosition[1] = transform.position.y;
      cachedPosition[2] = transform.position.z;
      cachedScale.fill(transform.scale);
      this.object.setRotationWorld(cachedRotation);
      this.object.setPositionWorld(cachedPosition);
      this.object.setScalingWorld(cachedScale);
      const attachmentPoint = attachmentPoints[FaceAttachmentPoints[this.attachmentPoint]].position;
      this.attachedObject.setPositionLocal([
        attachmentPoint.x,
        attachmentPoint.y,
        attachmentPoint.z
      ]);
    });
    camera.onFaceLost.add((_event) => {
      cachedScale.fill(0);
      this.object.setScalingWorld(cachedScale);
    });
  }
};
__publicField(FaceAttachmentPointExample, "TypeName", "face-attachment-point-example");
__decorateClass([
  property2.object()
], FaceAttachmentPointExample.prototype, "ARFaceTrackingCamera", 2);
__decorateClass([
  property2.enum(FaceAttachmentPoints)
], FaceAttachmentPointExample.prototype, "attachmentPoint", 2);
__decorateClass([
  property2.object()
], FaceAttachmentPointExample.prototype, "attachedObject", 2);

// js/face-mask-example.ts
var FaceMaskExample = class extends Component2 {
  ARFaceTrackingCamera;
  faceMaskMaterial;
  /**
   * We'll fill this with the mesh data provided by xr8
   */
  _mesh = null;
  /**
   * component to hold the mesh
   */
  _meshComp = null;
  start() {
    if (!this.ARFaceTrackingCamera) {
      console.warn(
        `${this.object.name}/${this.type} requires a ${ARFaceTrackingCamera.TypeName}`
      );
      return;
    }
    const camera = this.ARFaceTrackingCamera.getComponent(ARFaceTrackingCamera);
    if (!camera) {
      throw new Error(
        `${ARFaceTrackingCamera.TypeName} was not found on ARFaceTrackingCamera`
      );
    }
    const cachedPosition = new Float32Array(3);
    const cachedRotation = new Float32Array(4);
    const cachedScale = new Float32Array(3);
    this.object.setScalingWorld(cachedScale);
    if (!this._mesh) {
      this._meshComp = this.object.addComponent("mesh", {});
      this._meshComp.material = this.faceMaskMaterial;
    }
    camera.onFaceLoading.add((data) => {
      const { indices, uvs, pointsPerDetection } = data;
      const indexData = indices.reduce((data2, current) => {
        data2.push(...Object.values(current));
        return data2;
      }, []);
      this._mesh = new Mesh2(this.engine, {
        vertexCount: pointsPerDetection,
        indexData,
        indexType: MeshIndexType2.UnsignedInt
      });
      const textureCoordinate = this._mesh.attribute(
        MeshAttribute2.TextureCoordinate
      );
      for (let i = 0; i < uvs.length; i++) {
        textureCoordinate.set(i, [uvs[i].u, uvs[i].v]);
      }
      this._meshComp.mesh = this._mesh;
    });
    camera.onFaceFound.add(this.updateFaceMesh.bind(this));
    camera.onFaceUpdate.add((data) => {
      this.updateFaceMesh(data);
      const { transform } = data;
      cachedRotation[0] = transform.rotation.x;
      cachedRotation[1] = transform.rotation.y;
      cachedRotation[2] = transform.rotation.z;
      cachedRotation[3] = transform.rotation.w;
      cachedPosition[0] = transform.position.x;
      cachedPosition[1] = transform.position.y;
      cachedPosition[2] = transform.position.z;
      const scale = transform.scale;
      cachedScale[0] = scale;
      cachedScale[1] = scale;
      cachedScale[2] = scale;
      this.object.setRotationWorld(cachedRotation);
      this.object.setPositionWorld(cachedPosition);
      this.object.setScalingWorld(cachedScale);
    });
    camera.onFaceLost.add((_event) => {
      this.object.setScalingWorld([0, 0, 0]);
      cachedScale[0] = cachedScale[1] = cachedScale[2] = 0;
    });
  }
  // Update positions, normals of the face mesh
  updateFaceMesh(data) {
    const { vertices, normals } = data;
    const meshNormals = this._mesh.attribute(MeshAttribute2.Normal);
    const positions = this._mesh.attribute(MeshAttribute2.Position);
    for (let i = 0; i < vertices.length; i++) {
      positions.set(i, [vertices[i].x, vertices[i].y, vertices[i].z]);
      meshNormals.set(i, [normals[i].x, normals[i].y, normals[i].z]);
    }
    this._mesh.update();
  }
};
__publicField(FaceMaskExample, "TypeName", "face-mask-example");
__decorateClass([
  property2.object()
], FaceMaskExample.prototype, "ARFaceTrackingCamera", 2);
__decorateClass([
  property2.material()
], FaceMaskExample.prototype, "faceMaskMaterial", 2);

// ../../ar-provider-webxr/dist/src/world-tracking-mode-webxr.js
var WorldTracking_WebXR = class extends TrackingMode {
  startSession() {
    this.provider.startSession(window.WEBXR_REQUIRED_FEATURES, window.WEBXR_OPTIONAL_FEATURES);
  }
  endSession() {
    this.provider.endSession();
  }
};

// ../../ar-provider-webxr/dist/src/webxr-provider.js
var WebXRProvider = class extends ARProvider {
  _xrSession = null;
  get xrSession() {
    return this._xrSession;
  }
  static registerTrackingProviderWithARSession(arSession2) {
    const provider = new WebXRProvider(arSession2.engine);
    arSession2.registerTrackingProvider(provider);
    return provider;
  }
  constructor(engine2) {
    super(engine2);
    if (typeof document === "undefined") {
      return;
    }
    engine2.onXRSessionStart.add((session) => {
      this._xrSession = session;
      this.onSessionStart.notify(this);
    });
    engine2.onXRSessionEnd.add(() => {
      this.onSessionEnd.notify(this);
    });
  }
  async startSession(webxrRequiredFeatures = ["local"], webxrOptionalFeatures = ["local", "hit-test"]) {
    this._engine.requestXRSession("immersive-ar", webxrRequiredFeatures, webxrOptionalFeatures);
  }
  async endSession() {
    if (this._xrSession) {
      try {
        await this._xrSession.end();
      } catch {
      }
      this._xrSession = null;
    }
  }
  async load() {
    this.loaded = true;
    return Promise.resolve();
  }
  /** Whether this provider supports given tracking type */
  supports(type) {
    if (!this.engine.arSupported)
      return false;
    switch (type) {
      case TrackingType.SLAM:
        return true;
      default:
        return false;
    }
  }
  /** Create a tracking implementation */
  createTracking(type, component) {
    switch (type) {
      case TrackingType.SLAM:
        return new WorldTracking_WebXR(this, component);
      default:
        throw new Error("Tracking mode " + type + " not supported.");
    }
  }
};

// ../../ar-provider-8thwall/dist/src/xr8-provider.js
var QRCode = __toESM(require_qrcode(), 1);

// ../../ar-provider-8thwall/node_modules/@wonderlandengine/api/dist/property.js
var Type3;
(function(Type4) {
  Type4[Type4["Native"] = 1] = "Native";
  Type4[Type4["Bool"] = 2] = "Bool";
  Type4[Type4["Int"] = 4] = "Int";
  Type4[Type4["Float"] = 8] = "Float";
  Type4[Type4["String"] = 16] = "String";
  Type4[Type4["Enum"] = 32] = "Enum";
  Type4[Type4["Object"] = 64] = "Object";
  Type4[Type4["Mesh"] = 128] = "Mesh";
  Type4[Type4["Texture"] = 256] = "Texture";
  Type4[Type4["Material"] = 512] = "Material";
  Type4[Type4["Animation"] = 1024] = "Animation";
  Type4[Type4["Skin"] = 2048] = "Skin";
  Type4[Type4["Color"] = 4096] = "Color";
})(Type3 || (Type3 = {}));
var Property3 = {
  /**
   * Create an boolean property.
   *
   * @param defaultValue The default value. If not provided, defaults to `false`.
   */
  bool(defaultValue = false) {
    return { type: Type3.Bool, default: defaultValue };
  },
  /**
   * Create an integer property.
   *
   * @param defaultValue The default value. If not provided, defaults to `0`.
   */
  int(defaultValue = 0) {
    return { type: Type3.Int, default: defaultValue };
  },
  /**
   * Create an float property.
   *
   * @param defaultValue The default value. If not provided, defaults to `0.0`.
   */
  float(defaultValue = 0) {
    return { type: Type3.Float, default: defaultValue };
  },
  /**
   * Create an string property.
   *
   * @param defaultValue The default value. If not provided, defaults to `''`.
   */
  string(defaultValue = "") {
    return { type: Type3.String, default: defaultValue };
  },
  /**
   * Create an enumeration property.
   *
   * @param values The list of values.
   * @param defaultValue The default value. Can be a string or an index into
   *     `values`. If not provided, defaults to the first element.
   */
  enum(values, defaultValue) {
    return { type: Type3.Enum, values, default: defaultValue };
  },
  /** Create an {@link Object3D} reference property. */
  object() {
    return { type: Type3.Object, default: null };
  },
  /** Create a {@link Mesh} reference property. */
  mesh() {
    return { type: Type3.Mesh, default: null };
  },
  /** Create a {@link Texture} reference property. */
  texture() {
    return { type: Type3.Texture, default: null };
  },
  /** Create a {@link Material} reference property. */
  material() {
    return { type: Type3.Material, default: null };
  },
  /** Create an {@link Animation} reference property. */
  animation() {
    return { type: Type3.Animation, default: null };
  },
  /** Create a {@link Skin} reference property. */
  skin() {
    return { type: Type3.Skin, default: null };
  },
  /**
   * Create a color property.
   *
   * @param r The red component, in the range [0; 1].
   * @param g The green component, in the range [0; 1].
   * @param b The blue component, in the range [0; 1].
   * @param a The alpha component, in the range [0; 1].
   */
  color(r = 0, g = 0, b = 0, a = 1) {
    return { type: Type3.Color, default: [r, g, b, a] };
  }
};

// ../../ar-provider-8thwall/node_modules/@wonderlandengine/api/dist/decorators.js
function propertyDecorator3(data) {
  return function(target, propertyKey) {
    const ctor = target.constructor;
    ctor.Properties = ctor.Properties ?? {};
    ctor.Properties[propertyKey] = data;
  };
}
function enumerable3() {
  return function(_, __, descriptor) {
    descriptor.enumerable = true;
  };
}
function nativeProperty3() {
  return function(target, propertyKey, descriptor) {
    enumerable3()(target, propertyKey, descriptor);
    propertyDecorator3({ type: Type3.Native })(target, propertyKey);
  };
}
var property3 = {};
for (const name in Property3) {
  property3[name] = (...args) => {
    const functor = Property3[name];
    return propertyDecorator3(functor(...args));
  };
}

// ../../ar-provider-8thwall/node_modules/@wonderlandengine/api/dist/utils/object.js
function isNumber3(value) {
  if (value === null || value === void 0)
    return false;
  return typeof value === "number" || value.constructor === Number;
}

// ../../ar-provider-8thwall/node_modules/@wonderlandengine/api/dist/utils/event.js
var Emitter3 = class {
  /**
   * List of listeners to trigger when `notify` is called.
   *
   * @hidden
   */
  _listeners = [];
  /**
   * Register a new listener to be triggered on {@link Emitter.notify}.
   *
   * Basic usage:
   *
   * ```js
   * emitter.add((data) => {
   *     console.log('event received!');
   *     console.log(data);
   * });
   * ```
   *
   * Automatically remove the listener when an event is received:
   *
   * ```js
   * emitter.add((data) => {
   *     console.log('event received!');
   *     console.log(data);
   * }, {once: true});
   * ```
   *
   * @param listener The callback to register.
   * @param opts The listener options. For more information, please have a look
   *     at the {@link ListenerOptions} interface.
   *
   * @returns Reference to self (for method chaining)
   */
  add(listener, opts = {}) {
    const { once = false, id = void 0 } = opts;
    this._listeners.push({ id, once, callback: listener });
    return this;
  }
  /**
   * Equivalent to {@link Emitter.add}.
   *
   * @param listeners The callback(s) to register.
   * @returns Reference to self (for method chaining).
   *
   * @deprecated Please use {@link Emitter.add} instead.
   */
  push(...listeners) {
    for (const cb of listeners)
      this.add(cb);
    return this;
  }
  /**
   * Register a new listener to be triggered on {@link Emitter.notify}.
   *
   * Once notified, the listener will be automatically removed.
   *
   * The method is equivalent to calling {@link Emitter.add} with:
   *
   * ```js
   * emitter.add(listener, {once: true});
   * ```
   *
   * @param listener The callback to register.
   *
   * @returns Reference to self (for method chaining).
   */
  once(listener) {
    return this.add(listener, { once: true });
  }
  /**
   * Remove a registered listener.
   *
   * Usage with a callback:
   *
   * ```js
   * const listener = (data) => console.log(data);
   * emitter.add(listener);
   *
   * // Remove using the callback reference:
   * emitter.remove(listener);
   * ```
   *
   * Usage with an id:
   *
   * ```js
   * emitter.add((data) => console.log(data), {id: 'my-callback'});
   *
   * // Remove using the id:
   * emitter.remove('my-callback');
   * ```
   *
   * Using identifiers, you will need to ensure your value is unique to avoid
   * removing listeners from other libraries, e.g.,:
   *
   * ```js
   * emitter.add((data) => console.log(data), {id: 'non-unique'});
   * // This second listener could be added by a third-party library.
   * emitter.add((data) => console.log('Hello From Library!'), {id: 'non-unique'});
   *
   * // Ho Snap! This also removed the library listener!
   * emitter.remove('non-unique');
   * ```
   *
   * The identifier can be any type. However, remember that the comparison will be
   * by-value for primitive types (string, number), but by reference for objects.
   *
   * Example:
   *
   * ```js
   * emitter.add(() => console.log('Hello'), {id: {value: 42}});
   * emitter.add(() => console.log('World!'), {id: {value: 42}});
   * emitter.remove({value: 42}); // None of the above listeners match!
   * emitter.notify(); // Prints 'Hello' and 'World!'.
   * ```
   *
   * Here, both emitters have id `{value: 42}`, but the comparison is made by reference. Thus,
   * the `remove()` call has no effect. We can make it work by doing:
   *
   * ```js
   * const id = {value: 42};
   * emitter.add(() => console.log('Hello'), {id});
   * emitter.add(() => console.log('World!'), {id});
   * emitter.remove(id); // Same reference, it works!
   * emitter.notify(); // Doesn't print.
   * ```
   *
   * @param listener The registered callback or a value representing the `id`.
   *
   * @returns Reference to self (for method chaining)
   */
  remove(listener) {
    const listeners = this._listeners;
    for (let i = 0; i < listeners.length; ++i) {
      const target = listeners[i];
      if (target.callback === listener || target.id === listener) {
        listeners.splice(i--, 1);
      }
    }
    return this;
  }
  /**
   * Check whether the listener is registered.
   *
   * @note This method performs a linear search.
   *
   * @param listener The registered callback or a value representing the `id`.
   * @returns `true` if the handle is found, `false` otherwise.
   */
  has(listener) {
    const listeners = this._listeners;
    for (let i = 0; i < listeners.length; ++i) {
      const target = listeners[i];
      if (target.callback === listener || target.id === listener)
        return true;
    }
    return false;
  }
  /**
   * Notify listeners with the given data object.
   *
   * @note This method ensures all listeners are called even if
   * an exception is thrown. For (possibly) faster notification,
   * please use {@link Emitter.notifyUnsafe}.
   *
   * @param data The data to pass to listener when invoked.
   */
  notify(...data) {
    const listeners = this._listeners;
    for (let i = 0; i < listeners.length; ++i) {
      const listener = listeners[i];
      if (listener.once)
        listeners.splice(i--, 1);
      try {
        listener.callback(...data);
      } catch (e) {
        console.error(e);
      }
    }
  }
  /**
   * Notify listeners with the given data object.
   *
   * @note Because this method doesn't catch exceptions, some listeners
   * will be skipped on a throw. Please use {@link Emitter.notify} for safe
   * notification.
   *
   * @param data The data to pass to listener when invoked.
   */
  notifyUnsafe(...data) {
    const listeners = this._listeners;
    for (let i = 0; i < listeners.length; ++i) {
      const listener = listeners[i];
      if (listener.once)
        listeners.splice(i--, 1);
      listener.callback(...data);
    }
  }
  /**
   * Return a promise that will resolve on the next event.
   *
   * @note The promise might never resolve if no event is sent.
   *
   * @returns A promise that resolves with the data passed to
   *     {@link Emitter.notify}.
   */
  promise() {
    return new Promise((res, _) => {
      this.once((...args) => {
        if (args.length > 1) {
          res(args);
        } else {
          res(args[0]);
        }
      });
    });
  }
  /** Number of listeners. */
  get listenerCount() {
    return this._listeners.length;
  }
  /** `true` if it has no listeners, `false` otherwise. */
  get isEmpty() {
    return this.listenerCount === 0;
  }
};

// ../../ar-provider-8thwall/node_modules/@wonderlandengine/api/dist/wonderland.js
var __decorate5 = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
    r = Reflect.decorate(decorators, target, key, desc);
  else
    for (var i = decorators.length - 1; i >= 0; i--)
      if (d = decorators[i])
        r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var Collider3;
(function(Collider4) {
  Collider4[Collider4["Sphere"] = 0] = "Sphere";
  Collider4[Collider4["AxisAlignedBox"] = 1] = "AxisAlignedBox";
  Collider4[Collider4["Box"] = 2] = "Box";
})(Collider3 || (Collider3 = {}));
var Alignment3;
(function(Alignment4) {
  Alignment4[Alignment4["Left"] = 0] = "Left";
  Alignment4[Alignment4["Center"] = 1] = "Center";
  Alignment4[Alignment4["Right"] = 2] = "Right";
})(Alignment3 || (Alignment3 = {}));
var Justification3;
(function(Justification4) {
  Justification4[Justification4["Line"] = 0] = "Line";
  Justification4[Justification4["Middle"] = 1] = "Middle";
  Justification4[Justification4["Top"] = 2] = "Top";
  Justification4[Justification4["Bottom"] = 3] = "Bottom";
})(Justification3 || (Justification3 = {}));
var TextEffect3;
(function(TextEffect4) {
  TextEffect4[TextEffect4["None"] = 0] = "None";
  TextEffect4[TextEffect4["Outline"] = 1] = "Outline";
})(TextEffect3 || (TextEffect3 = {}));
var InputType3;
(function(InputType4) {
  InputType4[InputType4["Head"] = 0] = "Head";
  InputType4[InputType4["EyeLeft"] = 1] = "EyeLeft";
  InputType4[InputType4["EyeRight"] = 2] = "EyeRight";
  InputType4[InputType4["ControllerLeft"] = 3] = "ControllerLeft";
  InputType4[InputType4["ControllerRight"] = 4] = "ControllerRight";
  InputType4[InputType4["RayLeft"] = 5] = "RayLeft";
  InputType4[InputType4["RayRight"] = 6] = "RayRight";
})(InputType3 || (InputType3 = {}));
var LightType3;
(function(LightType4) {
  LightType4[LightType4["Point"] = 0] = "Point";
  LightType4[LightType4["Spot"] = 1] = "Spot";
  LightType4[LightType4["Sun"] = 2] = "Sun";
})(LightType3 || (LightType3 = {}));
var AnimationState3;
(function(AnimationState4) {
  AnimationState4[AnimationState4["Playing"] = 0] = "Playing";
  AnimationState4[AnimationState4["Paused"] = 1] = "Paused";
  AnimationState4[AnimationState4["Stopped"] = 2] = "Stopped";
})(AnimationState3 || (AnimationState3 = {}));
var ForceMode3;
(function(ForceMode4) {
  ForceMode4[ForceMode4["Force"] = 0] = "Force";
  ForceMode4[ForceMode4["Impulse"] = 1] = "Impulse";
  ForceMode4[ForceMode4["VelocityChange"] = 2] = "VelocityChange";
  ForceMode4[ForceMode4["Acceleration"] = 3] = "Acceleration";
})(ForceMode3 || (ForceMode3 = {}));
var CollisionEventType3;
(function(CollisionEventType4) {
  CollisionEventType4[CollisionEventType4["Touch"] = 0] = "Touch";
  CollisionEventType4[CollisionEventType4["TouchLost"] = 1] = "TouchLost";
  CollisionEventType4[CollisionEventType4["TriggerTouch"] = 2] = "TriggerTouch";
  CollisionEventType4[CollisionEventType4["TriggerTouchLost"] = 3] = "TriggerTouchLost";
})(CollisionEventType3 || (CollisionEventType3 = {}));
var Shape3;
(function(Shape4) {
  Shape4[Shape4["None"] = 0] = "None";
  Shape4[Shape4["Sphere"] = 1] = "Sphere";
  Shape4[Shape4["Capsule"] = 2] = "Capsule";
  Shape4[Shape4["Box"] = 3] = "Box";
  Shape4[Shape4["Plane"] = 4] = "Plane";
  Shape4[Shape4["ConvexMesh"] = 5] = "ConvexMesh";
  Shape4[Shape4["TriangleMesh"] = 6] = "TriangleMesh";
})(Shape3 || (Shape3 = {}));
var MeshAttribute3;
(function(MeshAttribute4) {
  MeshAttribute4[MeshAttribute4["Position"] = 0] = "Position";
  MeshAttribute4[MeshAttribute4["Tangent"] = 1] = "Tangent";
  MeshAttribute4[MeshAttribute4["Normal"] = 2] = "Normal";
  MeshAttribute4[MeshAttribute4["TextureCoordinate"] = 3] = "TextureCoordinate";
  MeshAttribute4[MeshAttribute4["Color"] = 4] = "Color";
  MeshAttribute4[MeshAttribute4["JointId"] = 5] = "JointId";
  MeshAttribute4[MeshAttribute4["JointWeight"] = 6] = "JointWeight";
})(MeshAttribute3 || (MeshAttribute3 = {}));
var MaterialParamType3;
(function(MaterialParamType4) {
  MaterialParamType4[MaterialParamType4["UnsignedInt"] = 0] = "UnsignedInt";
  MaterialParamType4[MaterialParamType4["Int"] = 1] = "Int";
  MaterialParamType4[MaterialParamType4["Float"] = 2] = "Float";
  MaterialParamType4[MaterialParamType4["Sampler"] = 3] = "Sampler";
  MaterialParamType4[MaterialParamType4["Font"] = 4] = "Font";
})(MaterialParamType3 || (MaterialParamType3 = {}));
function isMeshShape3(shape) {
  return shape === Shape3.ConvexMesh || shape === Shape3.TriangleMesh;
}
var Component3 = class {
  /** Manager index. @hidden */
  _manager;
  /** Instance index. @hidden */
  _id;
  /**
   * Object containing this object.
   *
   * **Note**: This is cached for faster retrieval.
   *
   * @hidden
   */
  _object;
  /** Wonderland Engine instance. @hidden */
  _engine;
  /**
   * Create a new instance
   *
   * @param engine The engine instance.
   * @param manager Index of the manager.
   * @param id WASM component instance index.
   *
   * @hidden
   */
  constructor(engine2, manager = -1, id = -1) {
    this._engine = engine2;
    this._manager = manager;
    this._id = id;
    this._object = null;
  }
  /** Hosting engine instance. */
  get engine() {
    return this._engine;
  }
  /** The name of this component's type */
  get type() {
    const ctor = this.constructor;
    return ctor.TypeName ?? this._engine.wasm._typeNameFor(this._manager);
  }
  /** The object this component is attached to. */
  get object() {
    if (!this._object) {
      const objectId = this._engine.wasm._wl_component_get_object(this._manager, this._id);
      this._object = this._engine.wrapObject(objectId);
    }
    return this._object;
  }
  /**
   * Set whether this component is active.
   *
   * Activating/deactivating a component comes at a small cost of reordering
   * components in the respective component manager. This function therefore
   * is not a trivial assignment.
   *
   * Does nothing if the component is already activated/deactivated.
   *
   * @param active New active state.
   */
  set active(active) {
    this._engine.wasm._wl_component_setActive(this._manager, this._id, active);
  }
  /**
   * Whether this component is active
   */
  get active() {
    return this._engine.wasm._wl_component_isActive(this._manager, this._id) != 0;
  }
  /**
   * Remove this component from its objects and destroy it.
   *
   * It is best practice to set the component to `null` after,
   * to ensure it does not get used later.
   *
   * ```js
   *    c.destroy();
   *    c = null;
   * ```
   * @since 0.9.0
   */
  destroy() {
    this._engine.wasm._wl_component_remove(this._manager, this._id);
    this._manager = -1;
    this._id = -1;
  }
  /**
   * Checks equality by comparing whether the wrapped native component ids
   * and component manager types are equal.
   *
   * @param otherComponent Component to check equality with.
   * @returns Whether this component equals the given component.
   */
  equals(otherComponent) {
    if (!otherComponent)
      return false;
    return this._manager == otherComponent._manager && this._id == otherComponent._id;
  }
};
/**
 * Unique identifier for this component class.
 *
 * This is used to register, add, and retrieve components of a given type.
 */
__publicField(Component3, "TypeName");
/**
 * Properties of this component class.
 *
 * Properties are public attributes that can be configured via the
 * Wonderland Editor.
 *
 * Example:
 *
 * ```js
 * import { Component, Type } from '@wonderlandengine/api';
 * class MyComponent extends Component {
 *     static TypeName = 'my-component';
 *     static Properties = {
 *         myBoolean: { type: Type.Boolean, default: false },
 *         myFloat: { type: Type.Float, default: false },
 *         myTexture: { type: Type.Texture, default: null },
 *     };
 * }
 * ```
 *
 * Properties are automatically added to each component instance, and are
 * accessible like any JS attribute:
 *
 * ```js
 * // Creates a new component and set each properties value:
 * const myComponent = object.addComponent(MyComponent, {
 *     myBoolean: true,
 *     myFloat: 42.0,
 *     myTexture: null
 * });
 *
 * // You can also override the properties on the instance:
 * myComponent.myBoolean = false;
 * myComponent.myFloat = -42.0;
 * ```
 */
__publicField(Component3, "Properties");
/**
 * This was never released in an official version, we are keeping it
 * to easy transition to the new API.
 *
 * @deprecated Use {@link Component.onRegister} instead.
 * @hidden
 */
__publicField(Component3, "Dependencies");
/**
 * Called when this component class is registered.
 *
 * @example
 *
 * This callback can be used to register dependencies of a component,
 * e.g., component classes that need to be registered in order to add
 * them at runtime with {@link Object3D.addComponent}, independent of whether
 * they are used in the editor.
 *
 * ```js
 * class Spawner extends Component {
 *     static TypeName = 'spawner';
 *
 *     static onRegister() {
 *         engine.registerComponent(SpawnedComponent);
 *     }
 *
 *     // You can now use addComponent with SpawnedComponent
 * }
 * ```
 *
 * @example
 *
 * This callback can be used to register different implementations of a
 * component depending on client features or API versions.
 *
 * ```js
 * // Properties need to be the same for all implementations!
 * const SharedProperties = {};
 *
 * class Anchor extends Component {
 *     static TypeName = 'spawner';
 *     static Properties = SharedProperties;
 *
 *     static onRegister() {
 *         if(navigator.xr === undefined) {
 *             /* WebXR unsupported, keep this dummy component *\/
 *             return;
 *         }
 *         /* WebXR supported! Override already registered dummy implementation
 *          * with one depending on hit-test API support *\/
 *         engine.registerComponent(window.HitTestSource === undefined ?
 *             AnchorWithoutHitTest : AnchorWithHitTest);
 *     }
 *
 *     // This one implements no functions
 * }
 * ```
 */
__publicField(Component3, "onRegister");
var _CollisionComponent3 = class extends Component3 {
  /** Collision component collider */
  get collider() {
    return this._engine.wasm._wl_collision_component_get_collider(this._id);
  }
  /**
   * Set collision component collider.
   *
   * @param collider Collider of the collision component.
   */
  set collider(collider) {
    this._engine.wasm._wl_collision_component_set_collider(this._id, collider);
  }
  /**
   * Collision component extents.
   *
   * If {@link collider} returns {@link Collider.Sphere}, only the first
   * component of the returned vector is used.
   */
  get extents() {
    const wasm = this._engine.wasm;
    return new Float32Array(wasm.HEAPF32.buffer, wasm._wl_collision_component_get_extents(this._id), 3);
  }
  /**
   * Set collision component extents.
   *
   * If {@link collider} returns {@link Collider.Sphere}, only the first
   * component of the passed vector is used.
   *
   * Example:
   *
   * ```js
   * // Spans 1 unit on the x-axis, 2 on the y-axis, 3 on the z-axis.
   * collision.extent = [1, 2, 3];
   * ```
   *
   * @param extents Extents of the collision component, expects a
   *      3 component array.
   */
  set extents(extents) {
    this.extents.set(extents);
  }
  /**
   * Collision component group.
   *
   * The groups is a bitmask that is compared to other components in {@link CollisionComponent#queryOverlaps}
   * or the group in {@link Scene#rayCast}.
   *
   * Colliders that have no common groups will not overlap with each other. If a collider
   * has none of the groups set for {@link Scene#rayCast}, the ray will not hit it.
   *
   * Each bit represents belonging to a group, see example.
   *
   * ```js
   *    // c belongs to group 2
   *    c.group = (1 << 2);
   *
   *    // c belongs to group 0
   *    c.group = (1 << 0);
   *
   *    // c belongs to group 0 *and* 2
   *    c.group = (1 << 0) | (1 << 2);
   *
   *    (c.group & (1 << 2)) != 0; // true
   *    (c.group & (1 << 7)) != 0; // false
   * ```
   */
  get group() {
    return this._engine.wasm._wl_collision_component_get_group(this._id);
  }
  /**
   * Set collision component group.
   *
   * @param group Group mask of the collision component.
   */
  set group(group) {
    this._engine.wasm._wl_collision_component_set_group(this._id, group);
  }
  /**
   * Query overlapping objects.
   *
   * Usage:
   *
   * ```js
   * const collision = object.getComponent('collision');
   * const overlaps = collision.queryOverlaps();
   * for(const otherCollision of overlaps) {
   *     const otherObject = otherCollision.object;
   *     console.log(`Collision with object ${otherObject.objectId}`);
   * }
   * ```
   *
   * @returns Collision components overlapping this collider.
   */
  queryOverlaps() {
    const count = this._engine.wasm._wl_collision_component_query_overlaps(this._id, this._engine.wasm._tempMem, this._engine.wasm._tempMemSize >> 1);
    const overlaps = new Array(count);
    for (let i = 0; i < count; ++i) {
      overlaps[i] = new _CollisionComponent3(this._engine, this._manager, this._engine.wasm._tempMemUint16[i]);
    }
    return overlaps;
  }
};
var CollisionComponent3 = _CollisionComponent3;
/** @override */
__publicField(CollisionComponent3, "TypeName", "collision");
__decorate5([
  nativeProperty3()
], CollisionComponent3.prototype, "collider", null);
__decorate5([
  nativeProperty3()
], CollisionComponent3.prototype, "extents", null);
__decorate5([
  nativeProperty3()
], CollisionComponent3.prototype, "group", null);
var TextComponent3 = class extends Component3 {
  /** Text component alignment. */
  get alignment() {
    return this._engine.wasm._wl_text_component_get_horizontal_alignment(this._id);
  }
  /**
   * Set text component alignment.
   *
   * @param alignment Alignment for the text component.
   */
  set alignment(alignment) {
    this._engine.wasm._wl_text_component_set_horizontal_alignment(this._id, alignment);
  }
  /** Text component justification. */
  get justification() {
    return this._engine.wasm._wl_text_component_get_vertical_alignment(this._id);
  }
  /**
   * Set text component justification.
   *
   * @param justification Justification for the text component.
   */
  set justification(justification) {
    this._engine.wasm._wl_text_component_set_vertical_alignment(this._id, justification);
  }
  /** Text component character spacing. */
  get characterSpacing() {
    return this._engine.wasm._wl_text_component_get_character_spacing(this._id);
  }
  /**
   * Set text component character spacing.
   *
   * @param spacing Character spacing for the text component.
   */
  set characterSpacing(spacing) {
    this._engine.wasm._wl_text_component_set_character_spacing(this._id, spacing);
  }
  /** Text component line spacing. */
  get lineSpacing() {
    return this._engine.wasm._wl_text_component_get_line_spacing(this._id);
  }
  /**
   * Set text component line spacing
   *
   * @param spacing Line spacing for the text component
   */
  set lineSpacing(spacing) {
    this._engine.wasm._wl_text_component_set_line_spacing(this._id, spacing);
  }
  /** Text component effect. */
  get effect() {
    return this._engine.wasm._wl_text_component_get_effect(this._id);
  }
  /**
   * Set text component effect
   *
   * @param effect Effect for the text component
   */
  set effect(effect) {
    this._engine.wasm._wl_text_component_set_effect(this._id, effect);
  }
  /** Text component text. */
  get text() {
    const wasm = this._engine.wasm;
    const ptr = wasm._wl_text_component_get_text(this._id);
    return wasm.UTF8ToString(ptr);
  }
  /**
   * Set text component text.
   *
   * @param text Text of the text component.
   */
  set text(text) {
    const wasm = this._engine.wasm;
    wasm._wl_text_component_set_text(this._id, wasm.tempUTF8(text));
  }
  /**
   * Set material to render the text with.
   *
   * @param material New material.
   */
  set material(material) {
    const matIndex = material ? material._index : 0;
    this._engine.wasm._wl_text_component_set_material(this._id, matIndex);
  }
  /** Material used to render the text. */
  get material() {
    const id = this._engine.wasm._wl_text_component_get_material(this._id);
    return id > 0 ? new Material4(this._engine, id) : null;
  }
};
/** @override */
__publicField(TextComponent3, "TypeName", "text");
__decorate5([
  nativeProperty3()
], TextComponent3.prototype, "alignment", null);
__decorate5([
  nativeProperty3()
], TextComponent3.prototype, "justification", null);
__decorate5([
  nativeProperty3()
], TextComponent3.prototype, "characterSpacing", null);
__decorate5([
  nativeProperty3()
], TextComponent3.prototype, "lineSpacing", null);
__decorate5([
  nativeProperty3()
], TextComponent3.prototype, "effect", null);
__decorate5([
  nativeProperty3()
], TextComponent3.prototype, "text", null);
__decorate5([
  nativeProperty3()
], TextComponent3.prototype, "material", null);
var ViewComponent3 = class extends Component3 {
  /** Projection matrix. */
  get projectionMatrix() {
    const wasm = this._engine.wasm;
    return new Float32Array(wasm.HEAPF32.buffer, wasm._wl_view_component_get_projection_matrix(this._id), 16);
  }
  /** ViewComponent near clipping plane value. */
  get near() {
    return this._engine.wasm._wl_view_component_get_near(this._id);
  }
  /**
   * Set near clipping plane distance for the view.
   *
   * If an XR session is active, the change will apply in the
   * following frame, otherwise the change is immediate.
   *
   * @param near Near depth value.
   */
  set near(near) {
    this._engine.wasm._wl_view_component_set_near(this._id, near);
  }
  /** Far clipping plane value. */
  get far() {
    return this._engine.wasm._wl_view_component_get_far(this._id);
  }
  /**
   * Set far clipping plane distance for the view.
   *
   * If an XR session is active, the change will apply in the
   * following frame, otherwise the change is immediate.
   *
   * @param far Near depth value.
   */
  set far(far) {
    this._engine.wasm._wl_view_component_set_far(this._id, far);
  }
  /**
   * Get the horizontal field of view for the view, **in degrees**.
   *
   * If an XR session is active, this returns the field of view reported by
   * the device, regardless of the fov that was set.
   */
  get fov() {
    return this._engine.wasm._wl_view_component_get_fov(this._id);
  }
  /**
   * Set the horizontal field of view for the view, **in degrees**.
   *
   * If an XR session is active, the field of view reported by the device is
   * used and this value is ignored. After the XR session ends, the new value
   * is applied.
   *
   * @param fov Horizontal field of view, **in degrees**.
   */
  set fov(fov) {
    this._engine.wasm._wl_view_component_set_fov(this._id, fov);
  }
};
/** @override */
__publicField(ViewComponent3, "TypeName", "view");
__decorate5([
  enumerable3()
], ViewComponent3.prototype, "projectionMatrix", null);
__decorate5([
  nativeProperty3()
], ViewComponent3.prototype, "near", null);
__decorate5([
  nativeProperty3()
], ViewComponent3.prototype, "far", null);
__decorate5([
  nativeProperty3()
], ViewComponent3.prototype, "fov", null);
var InputComponent3 = class extends Component3 {
  /** Input component type */
  get inputType() {
    return this._engine.wasm._wl_input_component_get_type(this._id);
  }
  /**
   * Set input component type.
   *
   * @params New input component type.
   */
  set inputType(type) {
    this._engine.wasm._wl_input_component_set_type(this._id, type);
  }
  /**
   * WebXR Device API input source associated with this input component,
   * if type {@link InputType.ControllerLeft} or {@link InputType.ControllerRight}.
   */
  get xrInputSource() {
    const xrSession = this._engine.xrSession;
    if (xrSession) {
      for (let inputSource of xrSession.inputSources) {
        if (inputSource.handedness == this.handedness) {
          return inputSource;
        }
      }
    }
    return null;
  }
  /**
   * 'left', 'right' or `null` depending on the {@link InputComponent#inputType}.
   */
  get handedness() {
    const inputType = this.inputType;
    if (inputType == InputType3.ControllerRight || inputType == InputType3.RayRight || inputType == InputType3.EyeRight)
      return "right";
    if (inputType == InputType3.ControllerLeft || inputType == InputType3.RayLeft || inputType == InputType3.EyeLeft)
      return "left";
    return null;
  }
};
/** @override */
__publicField(InputComponent3, "TypeName", "input");
__decorate5([
  nativeProperty3()
], InputComponent3.prototype, "inputType", null);
__decorate5([
  enumerable3()
], InputComponent3.prototype, "xrInputSource", null);
__decorate5([
  enumerable3()
], InputComponent3.prototype, "handedness", null);
var LightComponent3 = class extends Component3 {
  getColor(out = new Float32Array(3)) {
    const wasm = this._engine.wasm;
    const ptr = wasm._wl_light_component_get_color(this._id) / 4;
    out[0] = wasm.HEAPF32[ptr];
    out[1] = wasm.HEAPF32[ptr + 1];
    out[2] = wasm.HEAPF32[ptr + 2];
    return out;
  }
  /**
   * Set light color.
   *
   * @param c New color array/vector, expected to have at least 3 elements.
   * @since 1.0.0
   */
  setColor(c) {
    const wasm = this._engine.wasm;
    const ptr = wasm._wl_light_component_get_color(this._id) / 4;
    wasm.HEAPF32[ptr] = c[0];
    wasm.HEAPF32[ptr + 1] = c[1];
    wasm.HEAPF32[ptr + 2] = c[2];
  }
  /**
   * View on the light color.
   *
   * @note Prefer to use {@link getColor} in performance-critical code.
   */
  get color() {
    const wasm = this._engine.wasm;
    return new Float32Array(wasm.HEAPF32.buffer, wasm._wl_light_component_get_color(this._id), 3);
  }
  /**
   * Set light color.
   *
   * @param c Color of the light component.
   *
   * @note Prefer to use {@link setColor} in performance-critical code.
   */
  set color(c) {
    this.color.set(c);
  }
  /** Light type. */
  get lightType() {
    return this._engine.wasm._wl_light_component_get_type(this._id);
  }
  /**
   * Set light type.
   *
   * @param lightType Type of the light component.
   */
  set lightType(t) {
    this._engine.wasm._wl_light_component_set_type(this._id, t);
  }
  /**
   * Light intensity.
   * @since 1.0.0
   */
  get intensity() {
    return this._engine.wasm._wl_light_component_get_intensity(this._id);
  }
  /**
   * Set light intensity.
   *
   * @param intensity Intensity of the light component.
   * @since 1.0.0
   */
  set intensity(intensity) {
    this._engine.wasm._wl_light_component_set_intensity(this._id, intensity);
  }
  /**
   * Outer angle for spot lights, in degrees.
   * @since 1.0.0
   */
  get outerAngle() {
    return this._engine.wasm._wl_light_component_get_outerAngle(this._id);
  }
  /**
   * Set outer angle for spot lights.
   *
   * @param angle Outer angle, in degrees.
   * @since 1.0.0
   */
  set outerAngle(angle) {
    this._engine.wasm._wl_light_component_set_outerAngle(this._id, angle);
  }
  /**
   * Inner angle for spot lights, in degrees.
   * @since 1.0.0
   */
  get innerAngle() {
    return this._engine.wasm._wl_light_component_get_innerAngle(this._id);
  }
  /**
   * Set inner angle for spot lights.
   *
   * @param angle Inner angle, in degrees.
   * @since 1.0.0
   */
  set innerAngle(angle) {
    this._engine.wasm._wl_light_component_set_innerAngle(this._id, angle);
  }
  /**
   * Whether the light casts shadows.
   * @since 1.0.0
   */
  get shadows() {
    return !!this._engine.wasm._wl_light_component_get_shadows(this._id);
  }
  /**
   * Set whether the light casts shadows.
   *
   * @param b Whether the light casts shadows.
   * @since 1.0.0
   */
  set shadows(b) {
    this._engine.wasm._wl_light_component_set_shadows(this._id, b);
  }
  /**
   * Range for shadows.
   * @since 1.0.0
   */
  get shadowRange() {
    return this._engine.wasm._wl_light_component_get_shadowRange(this._id);
  }
  /**
   * Set range for shadows.
   *
   * @param range Range for shadows.
   * @since 1.0.0
   */
  set shadowRange(range) {
    this._engine.wasm._wl_light_component_set_shadowRange(this._id, range);
  }
  /**
   * Bias value for shadows.
   * @since 1.0.0
   */
  get shadowBias() {
    return this._engine.wasm._wl_light_component_get_shadowBias(this._id);
  }
  /**
   * Set bias value for shadows.
   *
   * @param bias Bias for shadows.
   * @since 1.0.0
   */
  set shadowBias(bias) {
    this._engine.wasm._wl_light_component_set_shadowBias(this._id, bias);
  }
  /**
   * Normal bias value for shadows.
   * @since 1.0.0
   */
  get shadowNormalBias() {
    return this._engine.wasm._wl_light_component_get_shadowNormalBias(this._id);
  }
  /**
   * Set normal bias value for shadows.
   *
   * @param bias Normal bias for shadows.
   * @since 1.0.0
   */
  set shadowNormalBias(bias) {
    this._engine.wasm._wl_light_component_set_shadowNormalBias(this._id, bias);
  }
  /**
   * Texel size for shadows.
   * @since 1.0.0
   */
  get shadowTexelSize() {
    return this._engine.wasm._wl_light_component_get_shadowTexelSize(this._id);
  }
  /**
   * Set texel size for shadows.
   *
   * @param size Texel size for shadows.
   * @since 1.0.0
   */
  set shadowTexelSize(size) {
    this._engine.wasm._wl_light_component_set_shadowTexelSize(this._id, size);
  }
  /**
   * Cascade count for {@link LightType.Sun} shadows.
   * @since 1.0.0
   */
  get cascadeCount() {
    return this._engine.wasm._wl_light_component_get_cascadeCount(this._id);
  }
  /**
   * Set cascade count for {@link LightType.Sun} shadows.
   *
   * @param count Cascade count.
   * @since 1.0.0
   */
  set cascadeCount(count) {
    this._engine.wasm._wl_light_component_set_cascadeCount(this._id, count);
  }
};
/** @override */
__publicField(LightComponent3, "TypeName", "light");
__decorate5([
  nativeProperty3()
], LightComponent3.prototype, "color", null);
__decorate5([
  nativeProperty3()
], LightComponent3.prototype, "lightType", null);
__decorate5([
  nativeProperty3()
], LightComponent3.prototype, "intensity", null);
__decorate5([
  nativeProperty3()
], LightComponent3.prototype, "outerAngle", null);
__decorate5([
  nativeProperty3()
], LightComponent3.prototype, "innerAngle", null);
__decorate5([
  nativeProperty3()
], LightComponent3.prototype, "shadows", null);
__decorate5([
  nativeProperty3()
], LightComponent3.prototype, "shadowRange", null);
__decorate5([
  nativeProperty3()
], LightComponent3.prototype, "shadowBias", null);
__decorate5([
  nativeProperty3()
], LightComponent3.prototype, "shadowNormalBias", null);
__decorate5([
  nativeProperty3()
], LightComponent3.prototype, "shadowTexelSize", null);
__decorate5([
  nativeProperty3()
], LightComponent3.prototype, "cascadeCount", null);
var AnimationComponent3 = class extends Component3 {
  /**
   * Set animation to play.
   *
   * Make sure to {@link Animation#retarget} the animation to affect the
   * right objects.
   *
   * @param anim Animation to play.
   */
  set animation(anim) {
    this._engine.wasm._wl_animation_component_set_animation(this._id, anim ? anim._index : 0);
  }
  /** Animation set for this component */
  get animation() {
    const id = this._engine.wasm._wl_animation_component_get_animation(this._id);
    return id > 0 ? new Animation3(this._engine, id) : null;
  }
  /**
   * Set play count. Set to `0` to loop indefinitely.
   *
   * @param playCount Number of times to repeat the animation.
   */
  set playCount(playCount) {
    this._engine.wasm._wl_animation_component_set_playCount(this._id, playCount);
  }
  /** Number of times the animation is played. */
  get playCount() {
    return this._engine.wasm._wl_animation_component_get_playCount(this._id);
  }
  /**
   * Set speed. Set to negative values to run the animation backwards.
   *
   * Setting speed has an immediate effect for the current frame's update
   * and will continue with the speed from the current point in the animation.
   *
   * @param speed New speed at which to play the animation.
   * @since 0.8.10
   */
  set speed(speed) {
    this._engine.wasm._wl_animation_component_set_speed(this._id, speed);
  }
  /**
   * Speed factor at which the animation is played.
   *
   * @since 0.8.10
   */
  get speed() {
    return this._engine.wasm._wl_animation_component_get_speed(this._id);
  }
  /** Current playing state of the animation */
  get state() {
    return this._engine.wasm._wl_animation_component_state(this._id);
  }
  /**
   * Play animation.
   *
   * If the animation is currently paused, resumes from that position. If the
   * animation is already playing, does nothing.
   *
   * To restart the animation, {@link AnimationComponent#stop} it first.
   */
  play() {
    this._engine.wasm._wl_animation_component_play(this._id);
  }
  /** Stop animation. */
  stop() {
    this._engine.wasm._wl_animation_component_stop(this._id);
  }
  /** Pause animation. */
  pause() {
    this._engine.wasm._wl_animation_component_pause(this._id);
  }
};
/** @override */
__publicField(AnimationComponent3, "TypeName", "animation");
__decorate5([
  nativeProperty3()
], AnimationComponent3.prototype, "animation", null);
__decorate5([
  nativeProperty3()
], AnimationComponent3.prototype, "playCount", null);
__decorate5([
  nativeProperty3()
], AnimationComponent3.prototype, "speed", null);
__decorate5([
  enumerable3()
], AnimationComponent3.prototype, "state", null);
var MeshComponent4 = class extends Component3 {
  /**
   * Set material to render the mesh with.
   *
   * @param material Material to render the mesh with.
   */
  set material(material) {
    this._engine.wasm._wl_mesh_component_set_material(this._id, material ? material._index : 0);
  }
  /** Material used to render the mesh. */
  get material() {
    const id = this._engine.wasm._wl_mesh_component_get_material(this._id);
    return id > 0 ? new Material4(this._engine, id) : null;
  }
  /** Mesh rendered by this component. */
  get mesh() {
    const id = this._engine.wasm._wl_mesh_component_get_mesh(this._id);
    return id > 0 ? new Mesh3(this._engine, id) : null;
  }
  /**
   * Set mesh to rendered with this component.
   *
   * @param mesh Mesh rendered by this component.
   */
  set mesh(mesh) {
    this._engine.wasm._wl_mesh_component_set_mesh(this._id, mesh ? mesh._index : 0);
  }
  /** Skin for this mesh component. */
  get skin() {
    const id = this._engine.wasm._wl_mesh_component_get_skin(this._id);
    return id > 0 ? new Skin3(this._engine, id) : null;
  }
  /**
   * Set skin to transform this mesh component.
   *
   * @param skin Skin to use for rendering skinned meshes.
   */
  set skin(skin) {
    this._engine.wasm._wl_mesh_component_set_skin(this._id, skin ? skin._index : 0);
  }
};
/** @override */
__publicField(MeshComponent4, "TypeName", "mesh");
__decorate5([
  nativeProperty3()
], MeshComponent4.prototype, "material", null);
__decorate5([
  nativeProperty3()
], MeshComponent4.prototype, "mesh", null);
__decorate5([
  nativeProperty3()
], MeshComponent4.prototype, "skin", null);
var LockAxis3;
(function(LockAxis4) {
  LockAxis4[LockAxis4["None"] = 0] = "None";
  LockAxis4[LockAxis4["X"] = 1] = "X";
  LockAxis4[LockAxis4["Y"] = 2] = "Y";
  LockAxis4[LockAxis4["Z"] = 4] = "Z";
})(LockAxis3 || (LockAxis3 = {}));
var PhysXComponent3 = class extends Component3 {
  /**
   * Set whether this rigid body is static.
   *
   * Setting this property only takes effect once the component
   * switches from inactive to active.
   *
   * @param b Whether the rigid body should be static.
   */
  set static(b) {
    this._engine.wasm._wl_physx_component_set_static(this._id, b);
  }
  /**
   * Whether this rigid body is static.
   *
   * This property returns whether the rigid body is *effectively*
   * static. If static property was set while the rigid body was
   * active, it will not take effect until the rigid body is set
   * inactive and active again. Until the component is set inactive,
   * this getter will return whether the rigid body is actually
   * static.
   */
  get static() {
    return !!this._engine.wasm._wl_physx_component_get_static(this._id);
  }
  /**
   * Set whether this rigid body is kinematic.
   *
   * @param b Whether the rigid body should be kinematic.
   */
  set kinematic(b) {
    this._engine.wasm._wl_physx_component_set_kinematic(this._id, b);
  }
  /**
   * Whether this rigid body is kinematic.
   */
  get kinematic() {
    return !!this._engine.wasm._wl_physx_component_get_kinematic(this._id);
  }
  /**
   * Set whether this rigid body's gravity is enabled.
   *
   * @param b Whether the rigid body's gravity should be enabled.
   */
  set gravity(b) {
    this._engine.wasm._wl_physx_component_set_gravity(this._id, b);
  }
  /**
   * Whether this rigid body's gravity flag is enabled.
   */
  get gravity() {
    return !!this._engine.wasm._wl_physx_component_get_gravity(this._id);
  }
  /**
   * Set whether this rigid body's simulate flag is enabled.
   *
   * @param b Whether the rigid body's simulate flag should be enabled.
   */
  set simulate(b) {
    this._engine.wasm._wl_physx_component_set_simulate(this._id, b);
  }
  /**
   * Whether this rigid body's simulate flag is enabled.
   */
  get simulate() {
    return !!this._engine.wasm._wl_physx_component_get_simulate(this._id);
  }
  /**
   * Set whether to allow simulation of this rigid body.
   *
   * {@link allowSimulation} and {@link trigger} can not be enabled at the
   * same time. Enabling {@link allowSimulation} while {@link trigger} is enabled
   * will disable {@link trigger}.
   *
   * @param b Whether to allow simulation of this rigid body.
   */
  set allowSimulation(b) {
    this._engine.wasm._wl_physx_component_set_allowSimulation(this._id, b);
  }
  /**
   * Whether to allow simulation of this rigid body.
   */
  get allowSimulation() {
    return !!this._engine.wasm._wl_physx_component_get_allowSimulation(this._id);
  }
  /**
   * Set whether this rigid body may be queried in ray casts.
   *
   * @param b Whether this rigid body may be queried in ray casts.
   */
  set allowQuery(b) {
    this._engine.wasm._wl_physx_component_set_allowQuery(this._id, b);
  }
  /**
   * Whether this rigid body may be queried in ray casts.
   */
  get allowQuery() {
    return !!this._engine.wasm._wl_physx_component_get_allowQuery(this._id);
  }
  /**
   * Set whether this physics body is a trigger.
   *
   * {@link allowSimulation} and {@link trigger} can not be enabled at the
   * same time. Enabling trigger while {@link allowSimulation} is enabled,
   * will disable {@link allowSimulation}.
   *
   * @param b Whether this physics body is a trigger.
   */
  set trigger(b) {
    this._engine.wasm._wl_physx_component_set_trigger(this._id, b);
  }
  /**
   * Whether this physics body is a trigger.
   */
  get trigger() {
    return !!this._engine.wasm._wl_physx_component_get_trigger(this._id);
  }
  /**
   * Set the shape for collision detection.
   *
   * @param s New shape.
   * @since 0.8.5
   */
  set shape(s) {
    this._engine.wasm._wl_physx_component_set_shape(this._id, s);
  }
  /** The shape for collision detection. */
  get shape() {
    return this._engine.wasm._wl_physx_component_get_shape(this._id);
  }
  /**
   * Set additional data for the shape.
   *
   * Retrieved only from {@link PhysXComponent#shapeData}.
   * @since 0.8.10
   */
  set shapeData(d) {
    if (d == null || !isMeshShape3(this.shape))
      return;
    this._engine.wasm._wl_physx_component_set_shape_data(this._id, d.index);
  }
  /**
   * Additional data for the shape.
   *
   * `null` for {@link Shape} values: `None`, `Sphere`, `Capsule`, `Box`, `Plane`.
   * `{index: n}` for `TriangleMesh` and `ConvexHull`.
   *
   * This data is currently only for passing onto or creating other {@link PhysXComponent}.
   * @since 0.8.10
   */
  get shapeData() {
    if (!isMeshShape3(this.shape))
      return null;
    return { index: this._engine.wasm._wl_physx_component_get_shape_data(this._id) };
  }
  /**
   * Set the shape extents for collision detection.
   *
   * @param e New extents for the shape.
   * @since 0.8.5
   */
  set extents(e) {
    this.extents.set(e);
  }
  /**
   * The shape extents for collision detection.
   */
  get extents() {
    const wasm = this._engine.wasm;
    const ptr = wasm._wl_physx_component_get_extents(this._id);
    return new Float32Array(wasm.HEAPF32.buffer, ptr, 3);
  }
  /**
   * Get staticFriction.
   */
  get staticFriction() {
    return this._engine.wasm._wl_physx_component_get_staticFriction(this._id);
  }
  /**
   * Set staticFriction.
   * @param v New staticFriction.
   */
  set staticFriction(v) {
    this._engine.wasm._wl_physx_component_set_staticFriction(this._id, v);
  }
  /**
   * Get dynamicFriction.
   */
  get dynamicFriction() {
    return this._engine.wasm._wl_physx_component_get_dynamicFriction(this._id);
  }
  /**
   * Set dynamicFriction
   * @param v New dynamicDamping.
   */
  set dynamicFriction(v) {
    this._engine.wasm._wl_physx_component_set_dynamicFriction(this._id, v);
  }
  /**
   * Get bounciness.
   * @since 0.9.0
   */
  get bounciness() {
    return this._engine.wasm._wl_physx_component_get_bounciness(this._id);
  }
  /**
   * Set bounciness.
   * @param v New bounciness.
   * @since 0.9.0
   */
  set bounciness(v) {
    this._engine.wasm._wl_physx_component_set_bounciness(this._id, v);
  }
  /**
   * Get linearDamping/
   */
  get linearDamping() {
    return this._engine.wasm._wl_physx_component_get_linearDamping(this._id);
  }
  /**
   * Set linearDamping.
   * @param v New linearDamping.
   */
  set linearDamping(v) {
    this._engine.wasm._wl_physx_component_set_linearDamping(this._id, v);
  }
  /** Get angularDamping. */
  get angularDamping() {
    return this._engine.wasm._wl_physx_component_get_angularDamping(this._id);
  }
  /**
   * Set angularDamping.
   * @param v New angularDamping.
   */
  set angularDamping(v) {
    this._engine.wasm._wl_physx_component_set_angularDamping(this._id, v);
  }
  /**
   * Set linear velocity.
   *
   * [PhysX Manual - "Velocity"](https://gameworksdocs.nvidia.com/PhysX/4.1/documentation/physxguide/Manual/RigidBodyDynamics.html#velocity)
   *
   * Has no effect, if the component is not active.
   *
   * @param v New linear velocity.
   */
  set linearVelocity(v) {
    this._engine.wasm._wl_physx_component_set_linearVelocity(this._id, v[0], v[1], v[2]);
  }
  /** Linear velocity or `[0, 0, 0]` if the component is not active. */
  get linearVelocity() {
    const wasm = this._engine.wasm;
    wasm._wl_physx_component_get_linearVelocity(this._id, wasm._tempMem);
    return new Float32Array(wasm.HEAPF32.buffer, wasm._tempMem, 3);
  }
  /**
   * Set angular velocity
   *
   * [PhysX Manual - "Velocity"](https://gameworksdocs.nvidia.com/PhysX/4.1/documentation/physxguide/Manual/RigidBodyDynamics.html#velocity)
   *
   * Has no effect, if the component is not active.
   *
   * @param v New angular velocity
   */
  set angularVelocity(v) {
    this._engine.wasm._wl_physx_component_set_angularVelocity(this._id, v[0], v[1], v[2]);
  }
  /** Angular velocity or `[0, 0, 0]` if the component is not active. */
  get angularVelocity() {
    const wasm = this._engine.wasm;
    wasm._wl_physx_component_get_angularVelocity(this._id, wasm._tempMem);
    return new Float32Array(wasm.HEAPF32.buffer, wasm._tempMem, 3);
  }
  /**
   * Set the components groups mask.
   *
   * @param flags New flags that need to be set.
   */
  set groupsMask(flags) {
    this._engine.wasm._wl_physx_component_set_groupsMask(this._id, flags);
  }
  /**
   * Get the components groups mask flags.
   *
   * Each bit represents membership to group, see example.
   *
   * ```js
   * // Assign c to group 2
   * c.groupsMask = (1 << 2);
   *
   * // Assign c to group 0
   * c.groupsMask  = (1 << 0);
   *
   * // Assign c to group 0 and 2
   * c.groupsMask = (1 << 0) | (1 << 2);
   *
   * (c.groupsMask & (1 << 2)) != 0; // true
   * (c.groupsMask & (1 << 7)) != 0; // false
   * ```
   */
  get groupsMask() {
    return this._engine.wasm._wl_physx_component_get_groupsMask(this._id);
  }
  /**
   * Set the components blocks mask.
   *
   * @param flags New flags that need to be set.
   */
  set blocksMask(flags) {
    this._engine.wasm._wl_physx_component_set_blocksMask(this._id, flags);
  }
  /**
   * Get the components blocks mask flags.
   *
   * Each bit represents membership to the block, see example.
   *
   * ```js
   * // Block overlap with any objects in group 2
   * c.blocksMask = (1 << 2);
   *
   * // Block overlap with any objects in group 0
   * c.blocksMask  = (1 << 0)
   *
   * // Block overlap with any objects in group 0 and 2
   * c.blocksMask = (1 << 0) | (1 << 2);
   *
   * (c.blocksMask & (1 << 2)) != 0; // true
   * (c.blocksMask & (1 << 7)) != 0; // false
   * ```
   */
  get blocksMask() {
    return this._engine.wasm._wl_physx_component_get_blocksMask(this._id);
  }
  /**
   * Set axes to lock for linear velocity.
   *
   * @param lock The Axis that needs to be set.
   *
   * Combine flags with Bitwise OR.
   * ```js
   * body.linearLockAxis = LockAxis.X | LockAxis.Y; // x and y set
   * body.linearLockAxis = LockAxis.X; // y unset
   * ```
   *
   * @note This has no effect if the component is static.
   */
  set linearLockAxis(lock) {
    this._engine.wasm._wl_physx_component_set_linearLockAxis(this._id, lock);
  }
  /**
   * Get the linear lock axes flags.
   *
   * To get the state of a specific flag, Bitwise AND with the LockAxis needed.
   *
   * ```js
   * if(body.linearLockAxis & LockAxis.Y) {
   *     console.log("The Y flag was set!");
   * }
   * ```
   *
   * @return axes that are currently locked for linear movement.
   */
  get linearLockAxis() {
    return this._engine.wasm._wl_physx_component_get_linearLockAxis(this._id);
  }
  /**
   * Set axes to lock for angular velocity.
   *
   * @param lock The Axis that needs to be set.
   *
   * ```js
   * body.angularLockAxis = LockAxis.X | LockAxis.Y; // x and y set
   * body.angularLockAxis = LockAxis.X; // y unset
   * ```
   *
   * @note This has no effect if the component is static.
   */
  set angularLockAxis(lock) {
    this._engine.wasm._wl_physx_component_set_angularLockAxis(this._id, lock);
  }
  /**
   * Get the angular lock axes flags.
   *
   * To get the state of a specific flag, Bitwise AND with the LockAxis needed.
   *
   * ```js
   * if(body.angularLockAxis & LockAxis.Y) {
   *     console.log("The Y flag was set!");
   * }
   * ```
   *
   * @return axes that are currently locked for angular movement.
   */
  get angularLockAxis() {
    return this._engine.wasm._wl_physx_component_get_angularLockAxis(this._id);
  }
  /**
   * Set mass.
   *
   * [PhysX Manual - "Mass Properties"](https://gameworksdocs.nvidia.com/PhysX/4.1/documentation/physxguide/Manual/RigidBodyDynamics.html#mass-properties)
   *
   * @param m New mass.
   */
  set mass(m) {
    this._engine.wasm._wl_physx_component_set_mass(this._id, m);
  }
  /** Mass */
  get mass() {
    return this._engine.wasm._wl_physx_component_get_mass(this._id);
  }
  /**
   * Set mass space interia tensor.
   *
   * [PhysX Manual - "Mass Properties"](https://gameworksdocs.nvidia.com/PhysX/4.1/documentation/physxguide/Manual/RigidBodyDynamics.html#mass-properties)
   *
   * Has no effect, if the component is not active.
   *
   * @param v New mass space interatia tensor.
   */
  set massSpaceInteriaTensor(v) {
    this._engine.wasm._wl_physx_component_set_massSpaceInertiaTensor(this._id, v[0], v[1], v[2]);
  }
  /**
   * Apply a force.
   *
   * [PhysX Manual - "Applying Forces and Torques"](https://gameworksdocs.nvidia.com/PhysX/4.1/documentation/physxguide/Manual/RigidBodyDynamics.html#applying-forces-and-torques)
   *
   * Has no effect, if the component is not active.
   *
   * @param f Force vector.
   * @param m Force mode, see {@link ForceMode}, default `Force`.
   * @param localForce Whether the force vector is in local space, default `false`.
   * @param p Position to apply force at, default is center of mass.
   * @param local Whether position is in local space, default `false`.
   */
  addForce(f, m = ForceMode3.Force, localForce = false, p, local = false) {
    const wasm = this._engine.wasm;
    if (!p) {
      wasm._wl_physx_component_addForce(this._id, f[0], f[1], f[2], m, localForce);
      return;
    }
    wasm._wl_physx_component_addForceAt(this._id, f[0], f[1], f[2], m, localForce, p[0], p[1], p[2], local);
  }
  /**
   * Apply torque.
   *
   * [PhysX Manual - "Applying Forces and Torques"](https://gameworksdocs.nvidia.com/PhysX/4.1/documentation/physxguide/Manual/RigidBodyDynamics.html#applying-forces-and-torques)
   *
   * Has no effect, if the component is not active.
   *
   * @param f Force vector.
   * @param m Force mode, see {@link ForceMode}, default `Force`.
   */
  addTorque(f, m = ForceMode3.Force) {
    this._engine.wasm._wl_physx_component_addTorque(this._id, f[0], f[1], f[2], m);
  }
  /**
   * Add on collision callback.
   *
   * @param callback Function to call when this rigid body (un)collides with any other.
   *
   * ```js
   *  let rigidBody = this.object.getComponent('physx');
   *  rigidBody.onCollision(function(type, other) {
   *      // Ignore uncollides
   *      if(type == CollisionEventType.TouchLost) return;
   *
   *      // Take damage on collision with enemies
   *      if(other.object.name.startsWith('enemy-')) {
   *          this.applyDamage(10);
   *      }
   *  }.bind(this));
   * ```
   *
   * @returns Id of the new callback for use with {@link PhysXComponent#removeCollisionCallback}.
   */
  onCollision(callback) {
    return this.onCollisionWith(this, callback);
  }
  /**
   * Add filtered on collision callback.
   *
   * @param otherComp Component for which callbacks will
   *        be triggered. If you pass this component, the method is equivalent to.
   *        {@link PhysXComponent#onCollision}.
   * @param callback Function to call when this rigid body
   *        (un)collides with `otherComp`.
   * @returns Id of the new callback for use with {@link PhysXComponent#removeCollisionCallback}.
   */
  onCollisionWith(otherComp, callback) {
    const physics = this._engine.physics;
    physics._callbacks[this._id] = physics._callbacks[this._id] || [];
    physics._callbacks[this._id].push(callback);
    return this._engine.wasm._wl_physx_component_addCallback(this._id, otherComp._id || this._id);
  }
  /**
   * Remove a collision callback added with {@link PhysXComponent#onCollision} or {@link PhysXComponent#onCollisionWith}.
   *
   * @param callbackId Callback id as returned by {@link PhysXComponent#onCollision} or {@link PhysXComponent#onCollisionWith}.
   * @throws When the callback does not belong to the component.
   * @throws When the callback does not exist.
   */
  removeCollisionCallback(callbackId) {
    const physics = this._engine.physics;
    const r = this._engine.wasm._wl_physx_component_removeCallback(this._id, callbackId);
    if (r)
      physics._callbacks[this._id].splice(-r);
  }
};
/** @override */
__publicField(PhysXComponent3, "TypeName", "physx");
__decorate5([
  nativeProperty3()
], PhysXComponent3.prototype, "static", null);
__decorate5([
  nativeProperty3()
], PhysXComponent3.prototype, "kinematic", null);
__decorate5([
  nativeProperty3()
], PhysXComponent3.prototype, "gravity", null);
__decorate5([
  nativeProperty3()
], PhysXComponent3.prototype, "simulate", null);
__decorate5([
  nativeProperty3()
], PhysXComponent3.prototype, "allowSimulation", null);
__decorate5([
  nativeProperty3()
], PhysXComponent3.prototype, "allowQuery", null);
__decorate5([
  nativeProperty3()
], PhysXComponent3.prototype, "trigger", null);
__decorate5([
  nativeProperty3()
], PhysXComponent3.prototype, "shape", null);
__decorate5([
  nativeProperty3()
], PhysXComponent3.prototype, "shapeData", null);
__decorate5([
  nativeProperty3()
], PhysXComponent3.prototype, "extents", null);
__decorate5([
  nativeProperty3()
], PhysXComponent3.prototype, "staticFriction", null);
__decorate5([
  nativeProperty3()
], PhysXComponent3.prototype, "dynamicFriction", null);
__decorate5([
  nativeProperty3()
], PhysXComponent3.prototype, "bounciness", null);
__decorate5([
  nativeProperty3()
], PhysXComponent3.prototype, "linearDamping", null);
__decorate5([
  nativeProperty3()
], PhysXComponent3.prototype, "angularDamping", null);
__decorate5([
  nativeProperty3()
], PhysXComponent3.prototype, "linearVelocity", null);
__decorate5([
  nativeProperty3()
], PhysXComponent3.prototype, "angularVelocity", null);
__decorate5([
  nativeProperty3()
], PhysXComponent3.prototype, "groupsMask", null);
__decorate5([
  nativeProperty3()
], PhysXComponent3.prototype, "blocksMask", null);
__decorate5([
  nativeProperty3()
], PhysXComponent3.prototype, "linearLockAxis", null);
__decorate5([
  nativeProperty3()
], PhysXComponent3.prototype, "angularLockAxis", null);
__decorate5([
  nativeProperty3()
], PhysXComponent3.prototype, "mass", null);
var MeshIndexType3;
(function(MeshIndexType4) {
  MeshIndexType4[MeshIndexType4["UnsignedByte"] = 1] = "UnsignedByte";
  MeshIndexType4[MeshIndexType4["UnsignedShort"] = 2] = "UnsignedShort";
  MeshIndexType4[MeshIndexType4["UnsignedInt"] = 4] = "UnsignedInt";
})(MeshIndexType3 || (MeshIndexType3 = {}));
var MeshSkinningType3;
(function(MeshSkinningType4) {
  MeshSkinningType4[MeshSkinningType4["None"] = 0] = "None";
  MeshSkinningType4[MeshSkinningType4["FourJoints"] = 1] = "FourJoints";
  MeshSkinningType4[MeshSkinningType4["EightJoints"] = 2] = "EightJoints";
})(MeshSkinningType3 || (MeshSkinningType3 = {}));
var Mesh3 = class {
  /**
   * Index of the mesh in the manager.
   *
   * @hidden
   */
  _index = -1;
  /** Wonderland Engine instance. @hidden */
  _engine;
  /**
   * Create a new instance.
   *
   * @param params Either a mesh index to wrap or set of parameters to create a new mesh.
   *    For more information, please have a look at the {@link MeshParameters} interface.
   */
  constructor(engine2, params) {
    this._engine = engine2 ?? WL;
    this._index = -1;
    if (isNumber3(params)) {
      this._index = params;
      return;
    }
    if (!params.vertexCount)
      throw new Error("Missing parameter 'vertexCount'");
    const wasm = this._engine.wasm;
    let indexData = 0;
    let indexType = 0;
    let indexDataSize = 0;
    if (params.indexData) {
      indexType = params.indexType || MeshIndexType3.UnsignedShort;
      indexDataSize = params.indexData.length * indexType;
      indexData = wasm._malloc(indexDataSize);
      switch (indexType) {
        case MeshIndexType3.UnsignedByte:
          wasm.HEAPU8.set(params.indexData, indexData);
          break;
        case MeshIndexType3.UnsignedShort:
          wasm.HEAPU16.set(params.indexData, indexData >> 1);
          break;
        case MeshIndexType3.UnsignedInt:
          wasm.HEAPU32.set(params.indexData, indexData >> 2);
          break;
      }
    }
    const { skinningType = MeshSkinningType3.None } = params;
    this._index = wasm._wl_mesh_create(indexData, indexDataSize, indexType, params.vertexCount, skinningType);
  }
  /** Number of vertices in this mesh. */
  get vertexCount() {
    return this._engine.wasm._wl_mesh_get_vertexCount(this._index);
  }
  /** Index data (read-only) or `null` if the mesh is not indexed. */
  get indexData() {
    const wasm = this._engine.wasm;
    const tempMem = wasm._tempMem;
    const ptr = wasm._wl_mesh_get_indexData(this._index, tempMem, tempMem + 4);
    if (ptr === null)
      return null;
    const indexCount = wasm.HEAPU32[tempMem / 4];
    const indexSize = wasm.HEAPU32[tempMem / 4 + 1];
    switch (indexSize) {
      case MeshIndexType3.UnsignedByte:
        return new Uint8Array(wasm.HEAPU8.buffer, ptr, indexCount);
      case MeshIndexType3.UnsignedShort:
        return new Uint16Array(wasm.HEAPU16.buffer, ptr, indexCount);
      case MeshIndexType3.UnsignedInt:
        return new Uint32Array(wasm.HEAPU32.buffer, ptr, indexCount);
    }
    return null;
  }
  /** Hosting engine instance. */
  get engine() {
    return this._engine;
  }
  /**
   * Apply changes to {@link attribute | vertex attributes}.
   *
   * Uploads the updated vertex attributes to the GPU and updates the bounding
   * sphere to match the new vertex positions.
   *
   * Since this is an expensive operation, call it only once you have performed
   * all modifications on a mesh and avoid calling if you did not perform any
   * modifications at all.
   */
  update() {
    this._engine.wasm._wl_mesh_update(this._index);
  }
  getBoundingSphere(out = new Float32Array(4)) {
    const tempMemFloat = this._engine.wasm._tempMemFloat;
    this._engine.wasm._wl_mesh_get_boundingSphere(this._index, this._engine.wasm._tempMem);
    out[0] = tempMemFloat[0];
    out[1] = tempMemFloat[1];
    out[2] = tempMemFloat[2];
    out[3] = tempMemFloat[3];
    return out;
  }
  attribute(attr) {
    if (typeof attr != "number")
      throw new TypeError("Expected number, but got " + typeof attr);
    const tempMemUint32 = this._engine.wasm._tempMemUint32;
    this._engine.wasm._wl_mesh_get_attribute(this._index, attr, this._engine.wasm._tempMem);
    if (tempMemUint32[0] == 255)
      return null;
    const arraySize = tempMemUint32[5];
    return new MeshAttributeAccessor3(this._engine, {
      attribute: tempMemUint32[0],
      offset: tempMemUint32[1],
      stride: tempMemUint32[2],
      formatSize: tempMemUint32[3],
      componentCount: tempMemUint32[4],
      /* The WASM API returns `0` for a scalar value. We clamp it to 1 as we strictly use it as a multiplier for get/set operations */
      arraySize: arraySize ? arraySize : 1,
      length: this.vertexCount,
      bufferType: attr !== MeshAttribute3.JointId ? Float32Array : Uint16Array
    });
  }
  /**
   * Destroy and free the meshes memory.
   *
   * It is best practice to set the mesh variable to `null` after calling
   * destroy to prevent accidental use:
   *
   * ```js
   *   mesh.destroy();
   *   mesh = null;
   * ```
   *
   * Accessing the mesh after destruction behaves like accessing an empty
   * mesh.
   *
   * @since 0.9.0
   */
  destroy() {
    this._engine.wasm._wl_mesh_destroy(this._index);
  }
  /**
   * Checks equality by comparing whether the wrapped native mesh ids are
   * equal.
   *
   * @param otherMesh Mesh to check equality with.
   * @returns Whether this mesh equals the given mesh.
   *
   * @since 1.0.0
   */
  equals(otherMesh) {
    if (!otherMesh)
      return false;
    return this._index === otherMesh._index;
  }
};
var MeshAttributeAccessor3 = class {
  /** Max number of elements. */
  length = 0;
  /** Wonderland Engine instance. @hidden */
  _engine;
  /** Attribute index. @hidden */
  _attribute = -1;
  /** Attribute offset. @hidden */
  _offset = 0;
  /** Attribute stride. @hidden */
  _stride = 0;
  /** Format size native enum. @hidden */
  _formatSize = 0;
  /** Number of components per vertex. @hidden */
  _componentCount = 0;
  /** Number of values per vertex. @hidden */
  _arraySize = 1;
  /**
   * Class to instantiate an ArrayBuffer to get/set values.
   */
  _bufferType;
  /**
   * Function to allocate temporary WASM memory. It is cached in the accessor to avoid
   * conditionals during get/set.
   */
  _tempBufferGetter;
  /**
   * Create a new instance.
   *
   * @note Please use {@link Mesh.attribute} to create a new instance.
   *
   * @param options Contains information about how to read the data.
   * @note Do not use this constructor. Instead, please use the {@link Mesh.attribute} method.
   *
   * @hidden
   */
  constructor(engine2, options) {
    this._engine = engine2;
    const wasm = this._engine.wasm;
    this._attribute = options.attribute;
    this._offset = options.offset;
    this._stride = options.stride;
    this._formatSize = options.formatSize;
    this._componentCount = options.componentCount;
    this._arraySize = options.arraySize;
    this._bufferType = options.bufferType;
    this.length = options.length;
    this._tempBufferGetter = this._bufferType === Float32Array ? wasm.getTempBufferF32.bind(wasm) : wasm.getTempBufferU16.bind(wasm);
  }
  /**
   * Create a new TypedArray to hold this attribute's values.
   *
   * This method is useful to create a view to hold the data to
   * pass to {@link get} and {@link set}
   *
   * Example:
   *
   * ```js
   * const vertexCount = 4;
   * const positionAttribute = mesh.attribute(MeshAttributes.Position);
   *
   * // A position has 3 floats per vertex. Thus, positions has length 3 * 4.
   * const positions = positionAttribute.createArray(vertexCount);
   * ```
   *
   * @param count The number of **vertices** expected.
   * @returns A TypedArray with the appropriate format to access the data
   */
  createArray(count = 1) {
    count = count > this.length ? this.length : count;
    return new this._bufferType(count * this._componentCount * this._arraySize);
  }
  get(index, out = this.createArray()) {
    if (out.length % this._componentCount !== 0) {
      throw new Error(`out.length, ${out.length} is not a multiple of the attribute vector components, ${this._componentCount}`);
    }
    const dest = this._tempBufferGetter(out.length);
    const elementSize = this._bufferType.BYTES_PER_ELEMENT;
    const destSize = elementSize * out.length;
    const srcFormatSize = this._formatSize * this._arraySize;
    const destFormatSize = this._componentCount * elementSize * this._arraySize;
    this._engine.wasm._wl_mesh_get_attribute_values(this._attribute, srcFormatSize, this._offset + index * this._stride, this._stride, destFormatSize, dest.byteOffset, destSize);
    for (let i = 0; i < out.length; ++i)
      out[i] = dest[i];
    return out;
  }
  /**
   * Set attribute element.
   *
   * @param i Index
   * @param v Value to set the element to
   *
   * `v.length` needs to be a multiple of the attributes component count, see
   * {@link MeshAttribute}. If `v.length` is more than one multiple, it will be
   * filled with the next n attribute elements, which can reduce overhead
   * of this call.
   *
   * @returns Reference to self (for method chaining)
   */
  set(i, v) {
    if (v.length % this._componentCount !== 0)
      throw new Error(`out.length, ${v.length} is not a multiple of the attribute vector components, ${this._componentCount}`);
    const elementSize = this._bufferType.BYTES_PER_ELEMENT;
    const srcSize = elementSize * v.length;
    const srcFormatSize = this._componentCount * elementSize * this._arraySize;
    const destFormatSize = this._formatSize * this._arraySize;
    const wasm = this._engine.wasm;
    if (v.buffer != wasm.HEAPU8.buffer) {
      const dest = this._tempBufferGetter(v.length);
      dest.set(v);
      v = dest;
    }
    wasm._wl_mesh_set_attribute_values(this._attribute, srcFormatSize, v.byteOffset, srcSize, destFormatSize, this._offset + i * this._stride, this._stride);
    return this;
  }
};
var Material4 = class {
  /**
   * Index of this material in the manager.
   *
   * @hidden
   */
  _index;
  /**
   * Material definition index in the scene.
   *
   * @hidden
   */
  _definition;
  /** Wonderland Engine instance. @hidden */
  _engine;
  /**
   * Create a new Material.
   *
   * @note Creating material is expensive. Please use {@link Material#clone} to clone a material.
   * @note Do not use this constructor directly with an index, this is reserved for internal purposes.
   */
  constructor(engine2, params) {
    this._engine = engine2;
    if (typeof params !== "number") {
      if (!params?.pipeline)
        throw new Error("Missing parameter 'pipeline'");
      const wasm = this._engine.wasm;
      const pipeline = params.pipeline;
      this._index = wasm._wl_material_create(wasm.tempUTF8(pipeline));
      if (this._index < 0)
        throw new Error(`No such pipeline '${pipeline}'`);
    } else {
      this._index = params;
    }
    this._definition = this._engine.wasm._wl_material_get_definition(this._index);
    if (!this._engine.wasm._materialDefinitions[this._definition])
      throw new Error(`Material Definition ${this._definition} not found for material with index ${this._index}`);
    return new Proxy(this, {
      get(target, prop) {
        const wasm = engine2.wasm;
        const definition = wasm._materialDefinitions[target._definition];
        const param = definition.get(prop);
        if (!param)
          return target[prop];
        if (wasm._wl_material_get_param_value(target._index, param.index, wasm._tempMem)) {
          const type = param.type;
          switch (type.type) {
            case MaterialParamType3.UnsignedInt:
              return type.componentCount == 1 ? wasm._tempMemUint32[0] : new Uint32Array(wasm.HEAPU32.buffer, wasm._tempMem, type.componentCount);
            case MaterialParamType3.Int:
              return type.componentCount == 1 ? wasm._tempMemInt[0] : new Int32Array(wasm.HEAP32.buffer, wasm._tempMem, type.componentCount);
            case MaterialParamType3.Float:
              return type.componentCount == 1 ? wasm._tempMemFloat[0] : new Float32Array(wasm.HEAPF32.buffer, wasm._tempMem, type.componentCount);
            case MaterialParamType3.Sampler:
              return engine2.textures.wrap(wasm._tempMemInt[0]);
            default:
              throw new Error(`Invalid type ${type.type} on parameter ${param.index} for material ${target._index}`);
          }
        }
      },
      set(target, prop, value) {
        const wasm = engine2.wasm;
        const definition = wasm._materialDefinitions[target._definition];
        const param = definition.get(prop);
        if (!param) {
          target[prop] = value;
          return true;
        }
        const type = param.type;
        switch (type.type) {
          case MaterialParamType3.UnsignedInt:
          case MaterialParamType3.Int:
          case MaterialParamType3.Sampler:
            const v = value.id ?? value;
            wasm._wl_material_set_param_value_uint(target._index, param.index, v);
            break;
          case MaterialParamType3.Float:
            let count = 1;
            if (typeof value === "number") {
              wasm._tempMemFloat[0] = value;
            } else {
              count = value.length;
              for (let i = 0; i < count; ++i)
                wasm._tempMemFloat[i] = value[i];
            }
            wasm._wl_material_set_param_value_float(target._index, param.index, wasm._tempMem, count);
            break;
          case MaterialParamType3.Font:
            throw new Error("Setting font properties is currently unsupported.");
        }
        return true;
      }
    });
  }
  /** @deprecated Use {@link #pipeline} instead. */
  get shader() {
    return this.pipeline;
  }
  /** Name of the pipeline used by this material. */
  get pipeline() {
    const wasm = this._engine.wasm;
    return wasm.UTF8ToString(wasm._wl_material_get_pipeline(this._index));
  }
  /** Hosting engine instance. */
  get engine() {
    return this._engine;
  }
  /**
   * Create a copy of the underlying native material.
   *
   * @returns Material clone.
   */
  clone() {
    const id = this._engine.wasm._wl_material_clone(this._index);
    return id > 0 ? new Material4(this._engine, id) : null;
  }
  /**
   * Checks equality by comparing whether the wrapped native material ids are
   * equal.
   *
   * @param otherMaterial Material to check equality with.
   * @returns Whether this material equals the given material.
   *
   * @since 1.0.0
   */
  equals(otherMaterial) {
    if (!otherMaterial)
      return false;
    return this._index === otherMaterial._index;
  }
  /**
   * Wrap a native material index.
   *
   * @param engine Engine instance.
   * @param index The index.
   * @returns Material instance or `null` if index <= 0.
   *
   * @deprecated Please use `new Material()` instead.
   */
  static wrap(engine2, index) {
    return index > 0 ? new Material4(engine2, index) : null;
  }
};
var Animation3 = class {
  /** Index of the mesh in the manager. @hidden */
  _index;
  /** Wonderland Engine instance. @hidden */
  _engine;
  /**
   * @param index Index in the manager
   */
  constructor(engine2 = WL, index) {
    this._engine = engine2;
    this._index = index;
  }
  /** Duration of this animation. */
  get duration() {
    return this._engine.wasm._wl_animation_get_duration(this._index);
  }
  /** Number of tracks in this animation. */
  get trackCount() {
    return this._engine.wasm._wl_animation_get_trackCount(this._index);
  }
  /**
   * Clone this animation retargeted to a new set of objects.
   *
   * The clone shares most of the data with the original and is therefore
   * light-weight.
   *
   * **Experimental:** This API might change in upcoming versions.
   *
   * If retargeting to {@link Skin}, the join names will be used to determine a mapping
   * from the previous skin to the new skin. The source skin will be retrieved from
   * the first track in the animation that targets a joint.
   *
   * @param newTargets New targets per track. Expected to have
   *      {@link Animation#trackCount} elements or to be a {@link Skin}.
   * @returns The retargeted clone of this animation.
   */
  retarget(newTargets) {
    const wasm = this._engine.wasm;
    if (newTargets instanceof Skin3) {
      const animId2 = wasm._wl_animation_retargetToSkin(this._index, newTargets._index);
      return new Animation3(this._engine, animId2);
    }
    if (newTargets.length != this.trackCount) {
      throw Error("Expected " + this.trackCount.toString() + " targets, but got " + newTargets.length.toString());
    }
    const ptr = wasm._malloc(2 * newTargets.length);
    for (let i = 0; i < newTargets.length; ++i) {
      wasm.HEAPU16[ptr >> 1 + i] = newTargets[i].objectId;
    }
    const animId = wasm._wl_animation_retarget(this._index, ptr);
    wasm._free(ptr);
    return new Animation3(this._engine, animId);
  }
  /**
   * Checks equality by comparing whether the wrapped native animation ids
   * are equal.
   *
   * @param otherAnimation Animation to check equality with.
   * @returns Whether this animation equals the given animation.
   *
   * @since 1.0.0
   */
  equals(otherAnimation) {
    if (!otherAnimation)
      return false;
    return this._index === otherAnimation._index;
  }
};
var Skin3 = class {
  /**
   * Index of the skin in the manager.
   * @hidden
   */
  _index;
  /** Wonderland Engine instance. @hidden */
  _engine;
  constructor(engine2, index) {
    this._engine = engine2;
    this._index = index;
  }
  /** Amount of joints in this skin. */
  get jointCount() {
    return this._engine.wasm._wl_skin_get_joint_count(this._index);
  }
  /** Joints object ids for this skin */
  get jointIds() {
    const wasm = this._engine.wasm;
    return new Uint16Array(wasm.HEAPU16.buffer, wasm._wl_skin_joint_ids(this._index), this.jointCount);
  }
  /**
   * Dual quaternions in a flat array of size 8 times {@link jointCount}.
   *
   * Inverse bind transforms of the skin.
   */
  get inverseBindTransforms() {
    const wasm = this._engine.wasm;
    return new Float32Array(wasm.HEAPF32.buffer, wasm._wl_skin_inverse_bind_transforms(this._index), 8 * this.jointCount);
  }
  /**
   * Vectors in a flat array of size 3 times {@link jointCount}.
   *
   * Inverse bind scalings of the skin.
   */
  get inverseBindScalings() {
    const wasm = this._engine.wasm;
    return new Float32Array(wasm.HEAPF32.buffer, wasm._wl_skin_inverse_bind_scalings(this._index), 3 * this.jointCount);
  }
  /**
   * Checks equality by comparing whether the wrapped native skin ids are
   * equal.
   *
   * @param otherSkin Skin to check equality with.
   * @returns Whether this skin equals the given skin.
   *
   * @since 1.0.0
   */
  equals(otherSkin) {
    if (!otherSkin)
      return false;
    return this._index === otherSkin._index;
  }
};

// ../../ar-provider-8thwall/node_modules/@wonderlandengine/api/dist/wasm.js
var _componentDefaults3 = /* @__PURE__ */ new Map([
  [Type3.Bool, false],
  [Type3.Int, 0],
  [Type3.Float, 0],
  [Type3.String, ""],
  [Type3.Enum, void 0],
  [Type3.Object, null],
  [Type3.Mesh, null],
  [Type3.Texture, null],
  [Type3.Material, null],
  [Type3.Animation, null],
  [Type3.Skin, null],
  [Type3.Color, [0, 0, 0, 1]]
]);

// ../../ar-provider-8thwall/dist/src/world-tracking-mode-xr8.js
function toImageScanningEvent(event) {
  return {
    imageTargets: event.detail.imageTargets.map((target) => {
      return {
        ...target,
        type: target.type.toLowerCase()
      };
    })
  };
}
function toImageTrackingEvent(event) {
  return {
    ...event.detail,
    type: event.detail.type.toLowerCase()
  };
}
var WorldTracking_XR8 = class extends TrackingMode {
  /**
   * Required by the `XR8.addCameraPipelineModules`
   */
  name = "world-tracking-XR8";
  /**
   * Cache view component
   */
  _view;
  /**
   * Cache 8th Wall cam position
   */
  _cachedPosition = [0, 0, 0];
  /**
   * Cache 8th Wall cam rotation
   */
  _cachedRotation = [0, 0, 0, -1];
  /**
   * ARCamera using this tracking mode might want to request some extra permissions
   */
  _extraPermissions = [];
  onTrackingStatus = new Emitter3();
  onImageScanning = new Emitter3();
  onImageFound = new Emitter3();
  onImageUpdate = new Emitter3();
  onImageLost = new Emitter3();
  onMeshFound = new Emitter3();
  onWaySpotFound = new Emitter3();
  onWaySpotUpdated = new Emitter3();
  onWaySpotLost = new Emitter3();
  /**
   * Consumed by 8th Wall.
   */
  listeners = [
    {
      event: "reality.trackingstatus",
      process: (event) => {
        this.onTrackingStatus.notify(event);
      }
    },
    //////////////////////////
    //// VPS Image Events ///
    ////////////////////////
    {
      event: "reality.imagescanning",
      process: (event) => {
        this.onImageScanning.notify(toImageScanningEvent(event));
      }
    },
    {
      event: "reality.imagefound",
      process: (event) => {
        this.onImageFound.notify(toImageTrackingEvent(event));
      }
    },
    {
      event: "reality.imageupdated",
      process: (event) => {
        this.onImageUpdate.notify(toImageTrackingEvent(event));
      }
    },
    {
      event: "reality.imagelost",
      process: (event) => {
        this.onImageLost.notify(toImageTrackingEvent(event));
      }
    },
    //////////////////////////
    /// VPS Mesh Events /////
    ////////////////////////
    {
      event: "reality.meshfound",
      process: (event) => {
        this.onMeshFound.notify(event.detail);
      }
    },
    // Seems like not implemented by xr8 yet
    {
      event: "reality.meshupdated",
      process: (event) => {
      }
    },
    /*
        // Seems like not implemented by xr8 yet
        {
            event: 'reality.meshlost', process: (event: XR8VPSMeshLostEvent) => { }
        },
    */
    /*
    // TODO - this indicated that xr8 started looking for the feature points
    // However, I feel this is not really informative event since your app logic
    // will naturally expect that the scanning has started.
    {
        event: 'reality.projectwayspotscanning', process: (event: unknown) => {}
    },
    */
    //////////////////////////
    // VPS Waypoint Events //
    ////////////////////////
    {
      event: "reality.projectwayspotfound",
      process: (event) => {
        this.onWaySpotFound.notify(event.detail);
      }
    },
    {
      event: "reality.projectwayspotupdated",
      process: (event) => {
        this.onWaySpotUpdated.notify(event.detail);
      }
    },
    {
      event: "reality.projectwayspotlost",
      process: (event) => {
        this.onWaySpotLost.notify(event.detail);
      }
    }
  ];
  /**
   * Called by any consuming AR camera.
   * Set's up the cached vars.
   *
   * @param extraPermissions
   */
  init(extraPermissions = []) {
    this._extraPermissions = extraPermissions;
    const input = this.component.object.getComponent("input");
    if (input) {
      input.active = false;
    }
    this._view = this.component.object.getComponent("view");
    const rot = this.component.object.getRotationWorld();
    const pos = this.component.object.getPositionWorld();
    this._cachedPosition[0] = pos[0];
    this._cachedPosition[1] = pos[1];
    this._cachedPosition[2] = pos[2];
    this._cachedRotation[0] = rot[0];
    this._cachedRotation[1] = rot[1];
    this._cachedRotation[2] = rot[2];
    this._cachedRotation[3] = rot[3];
    ARSession.getSessionForEngine(this.component.engine).onSessionEnd.add(() => {
      XR8.removeCameraPipelineModules([XR8.XrController.pipelineModule(), this]);
    });
  }
  /**
   * Configures XR8.XrController for the session,
   * sets itself as an XR8 camera pipeline module
   * and tells xr8Provider to start the session
   */
  async startSession() {
    const permissions = await this.provider.checkPermissions(this._extraPermissions);
    if (!permissions) {
      return;
    }
    const componentEnablesSLAM = this.component.enableSLAM;
    const componentUsesAbsoluteScale = this.component.useAbsoluteScale;
    const componentUsesVPS = !!this.component.usesVPS;
    XR8.XrController.configure({
      // enableLighting: true,
      disableWorldTracking: componentEnablesSLAM === void 0 ? false : !componentEnablesSLAM,
      scale: componentUsesAbsoluteScale === void 0 ? "responsive" : componentUsesAbsoluteScale ? "absolute" : "responsive",
      enableVps: componentUsesVPS
    });
    const options = {
      canvas: this.component.engine.canvas,
      allowedDevices: XR8.XrConfig.device().MOBILE,
      ownRunLoop: false,
      cameraConfig: {
        direction: XR8.XrConfig.camera().BACK
      }
    };
    return this.provider.startSession(options, [
      XR8.XrController.pipelineModule(),
      this
    ]);
  }
  endSession() {
    this.provider.endSession();
  }
  /**
   * Called by 8th Wall internally when the tracking is about to start.
   * `XR8.XrController.updateCameraProjectionMatrix` is a method to
   * tell 8th Wall what is our initial camera position.
   */
  onAttach = (_params) => {
    XR8.XrController.updateCameraProjectionMatrix({
      origin: {
        x: this._cachedPosition[0],
        y: this._cachedPosition[1],
        z: this._cachedPosition[2]
      },
      facing: {
        x: this._cachedRotation[0],
        y: this._cachedRotation[1],
        z: this._cachedRotation[2],
        w: this._cachedRotation[3]
      },
      cam: {
        pixelRectWidth: this.component.engine.canvas.width,
        pixelRectHeight: this.component.engine.canvas.height,
        nearClipPlane: 0.01,
        farClipPlane: 100
      }
    });
  };
  /**
   * Called by 8th Wall internally.
   * Updates WL cameras projectionMatrix and pose
   *
   * @param e Camera projection matrix and pose provided by 8th Wall
   */
  onUpdate = (e) => {
    const source = e.processCpuResult.reality;
    if (!source)
      return;
    const { rotation, position, intrinsics } = source;
    this._cachedRotation[0] = rotation.x;
    this._cachedRotation[1] = rotation.y;
    this._cachedRotation[2] = rotation.z;
    this._cachedRotation[3] = rotation.w;
    this._cachedPosition[0] = position.x;
    this._cachedPosition[1] = position.y;
    this._cachedPosition[2] = position.z;
    if (intrinsics) {
      const projectionMatrix = this._view.projectionMatrix;
      for (let i = 0; i < 16; i++) {
        if (Number.isFinite(intrinsics[i])) {
          projectionMatrix[i] = intrinsics[i];
        }
      }
    }
    if (position && rotation) {
      this.component.object.setRotationWorld(this._cachedRotation);
      this.component.object.setPositionWorld(this._cachedPosition);
    }
  };
};

// ../../ar-provider-8thwall/dist/src/xr8-provider.js
var _XR8Provider = class extends ARProvider {
  /**
   * Unique id for this instance
   */
  _id;
  /**
   * Default XR8UIHandler to handle 8th wall UI related events
   */
  uiHandler = new DefaultUIHandler();
  /**
   * We need to set the DRAW_FRAMEBUFFER to null on every frame,
   * So let's cache the WLE canvas WebGL2RenderingContext.
   */
  cachedWebGLContext = null;
  static registerTrackingProviderWithARSession(arSession2) {
    const provider = new _XR8Provider(arSession2.engine);
    arSession2.registerTrackingProvider(provider);
    return provider;
  }
  /** Whether this provider supports given tracking type */
  supports(type) {
    switch (type) {
      case TrackingType.SLAM:
      case TrackingType.Image:
      case TrackingType.Face:
      case TrackingType.VPS:
        return true;
      default:
        return false;
    }
  }
  /** Create a tracking implementation */
  createTracking(type, component) {
    switch (type) {
      case TrackingType.SLAM:
      case TrackingType.Image:
      case TrackingType.VPS:
        return new WorldTracking_XR8(this, component);
      case TrackingType.Face:
        return new FaceTracking_XR8(this, component);
      default:
        throw new Error("Tracking mode " + type + " not supported.");
    }
  }
  constructor(engine2) {
    super(engine2);
    this._id = _XR8Provider._instances++;
    if (typeof document === "undefined") {
      return;
    }
  }
  /**
   * Loads the 8th Wall library from https://apps.8thwall.com by
   * creating a <script src="https://apps.8thwall.com..."> tag.
   *
   * @returns a promise when the library is loaded.
   */
  static loadXR8ExternalLib() {
    if (_XR8Provider.loadingPromise) {
      return _XR8Provider.loadingPromise;
    }
    _XR8Provider.loadingPromise = new Promise((resolve, _reject) => {
      if (window["XR8"]) {
        resolve();
        return;
      }
      if (document.getElementById("__injected-WLE-xr8")) {
        window.addEventListener("xrloaded", () => {
          resolve();
        });
        return;
      }
      if (!API_TOKEN_XR8) {
        throw new Error("8th Wall api is not defined");
      }
      window.addEventListener("xrloaded", () => {
        resolve();
      });
      const s = document.createElement("script");
      s.id = "__injected-WLE-xr8";
      s.crossOrigin = "anonymous";
      s.src = "https://apps.8thwall.com/xrweb?appKey=" + API_TOKEN_XR8;
      document.body.appendChild(s);
    });
    return _XR8Provider.loadingPromise;
  }
  /**
   * Loads an external 8th Wall library.
   *
   * Shows an 8th Wall logo at the bottom of the page and removes it when loading is done.
   *
   * Configures a custom XR8 pipeline module which enables/disables camera feed when the AR session starts/ends.
   *
   * Handles XR8 errors.
   *
   * @returns promise when the 8th Wall has loaded.
   */
  async load() {
    if (!window.document) {
      return;
    }
    this.loaded = false;
    const logo = document.readyState === "complete" ? this.add8thwallLogo() : document.addEventListener("DOMContentLoaded", () => this.add8thwallLogo());
    await _XR8Provider.loadXR8ExternalLib();
    this.loaded = true;
    document.querySelector("#WL-loading-8thwall-logo" + this._id)?.remove();
  }
  /**
   * Starts XR8 session.
   * Notifies all subscribers about this event.
   * Usually will be called by some XR8 tracking implementation with specific options (Face-tracking, image-tracking, etc)
   * @typeParam check XR8.run options parameter
   */
  async startSession(options, cameraModules) {
    if (XR8.WLE_sessionRunning) {
      console.warn("There is an active XR8 session running. Stop it first before starting a new one.");
      return;
    }
    XR8.clearCameraPipelineModules();
    XR8.addCameraPipelineModules([
      XR8.GlTextureRenderer.pipelineModule(),
      {
        name: "WLE-XR8-setup",
        onStart: () => {
          XR8.WLE_sessionRunning = true;
          this.enableCameraFeed();
        },
        onDetach: () => {
          XR8.WLE_sessionRunning = false;
          this.disableCameraFeed();
        },
        onException: (message) => {
          this.uiHandler.handleError(new CustomEvent("8thwall-error", { detail: { message } }));
        }
      },
      ...cameraModules
    ]);
    XR8.run(options);
    this.onSessionStart.notify(this);
  }
  /**
   * Ends XR8 session,
   * Can be called from anywhere.
   */
  async endSession() {
    if (XR8.WLE_sessionRunning) {
      XR8.stop();
      this.onSessionEnd.notify(this);
    }
  }
  /**
   * Sets up scene.onPreRender and scene.onPostRender callback
   * which will handle the drawing of the camera feed.
   */
  enableCameraFeed() {
    this._engine.scene.colorClearEnabled = false;
    if (!this.cachedWebGLContext) {
      this.cachedWebGLContext = this._engine.canvas.getContext("webgl2");
    }
    if (!this._engine.scene.onPreRender.has(this.onWLPreRender)) {
      this._engine.scene.onPreRender.add(this.onWLPreRender);
    }
    if (!this._engine.scene.onPostRender.has(this.onWLPostRender)) {
      this._engine.scene.onPostRender.add(this.onWLPostRender);
    }
  }
  /**
   * Cleans up scene.onPreRender and scene.onPostRender callback
   * which in turn removes the drawing of the camera feed.
   */
  disableCameraFeed() {
    if (this._engine.scene.onPreRender.has(this.onWLPreRender)) {
      this._engine.scene.onPreRender.remove(this.onWLPreRender);
    }
    if (this._engine.scene.onPostRender.has(this.onWLPostRender)) {
      this._engine.scene.onPostRender.remove(this.onWLPostRender);
    }
  }
  /**
   * Called before WLE render call.
   * Tells XR8 to run any necessary work before the WLE does it's rendering.
   * This includes rendering a the camera frame.
   */
  onWLPreRender = () => {
    this.cachedWebGLContext.bindFramebuffer(this.cachedWebGLContext.DRAW_FRAMEBUFFER, null);
    XR8.runPreRender(Date.now());
    XR8.runRender();
  };
  /**
   * Called after WLE render call.
   * Tells XR8 it can do any necessary cleanup
   */
  onWLPostRender() {
    XR8.runPostRender(Date.now());
  }
  /**
   * Renders an 8th Wall logo at the bottom of the canvas element.
   */
  add8thwallLogo() {
    const rect = this._engine.canvas.getBoundingClientRect();
    const a = document.createElement("a");
    a.href = "https://www.8thwall.com/";
    a.target = "_blank";
    a.style.position = "absolute";
    a.style.top = rect.bottom + window.scrollY - 160 + "px";
    a.style.left = "0";
    a.style.right = "0";
    a.style.margin = "0 auto";
    a.style.width = "252px";
    a.style.zIndex = "999";
    a.id = "WL-loading-8thwall-logo" + this._id;
    a.innerHTML = xr8logo;
    document.body.appendChild(a);
    return a;
  }
  /**
   * Notifies the uiHandler it needs user interaction to acquire device motion event.
   * This is a specific iOS case. There is no native browser prompt for this permission,
   * it just need a user interaction to be accessible.
   * @returns motionEvent.
   */
  async promptForDeviceMotion() {
    await this.uiHandler.requestUserInteraction();
    const motionEvent = await DeviceMotionEvent.requestPermission();
    return motionEvent;
  }
  /**
   * @private
   * Tries to get all known and required permissions.
   * Handles permission error events.
   * @param extraPermissions array of strings for extra permissions required by the tracking implementation.
   * Currently only 'location' is supported.
   *
   * @returns promise when all permissions were granted
   */
  async getPermissions(extraPermissions = []) {
    if (DeviceMotionEvent && DeviceMotionEvent.requestPermission) {
      try {
        const result = await DeviceMotionEvent.requestPermission();
        if (result !== "granted") {
          throw new Error("MotionEvent");
        }
      } catch (exception) {
        if (exception.name === "NotAllowedError") {
          const motionEvent = await this.promptForDeviceMotion();
          if (motionEvent !== "granted") {
            throw new Error("MotionEvent");
          }
        } else {
          throw new Error("MotionEvent");
        }
      }
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      stream.getTracks().forEach((track) => {
        track.stop();
      });
    } catch (exception) {
      throw new Error("Camera");
    }
    if (extraPermissions.includes("location")) {
      this.uiHandler.showWaitingForDeviceLocation();
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition((position) => {
          this.uiHandler.hideWaitingForDeviceLocation();
          resolve();
        }, (_error) => {
          this.uiHandler.hideWaitingForDeviceLocation();
          reject(new Error("Location"));
        });
      });
    }
    return true;
  }
  /**
   * Checks if device browser is supported at all
   * and check any required permissions.
   * @param extraPermissions array of strings for extra permissions required by the tracking implementation.
   * Currently only 'location' is supported.
   *
   * @returns promise when all permissions were granted
   */
  async checkPermissions(extraPermissions = []) {
    if (!XR8.XrDevice.isDeviceBrowserCompatible()) {
      this.uiHandler.handleIncompatibleDevice();
      return;
    }
    try {
      await this.getPermissions(extraPermissions);
      return true;
    } catch (error) {
      this.uiHandler.handlePermissionFail(error);
      return false;
    }
  }
};
var XR8Provider = _XR8Provider;
/**
 * Number of XR8Provider instances
 */
__publicField(XR8Provider, "_instances", 0);
/**
 * XR8 currently provides no way to check if the session is running, only if the session is paused (and we never pause, we just XR8.end()). so we track this manually
 */
// private static _running = false;
/**
 * Multiple XR8Provider instances can be created for multiple engines, but we only want to load the 8th Wall library once.
 * loadingPromise will be shared between all XR8Provider instances.
 */
__publicField(XR8Provider, "loadingPromise", null);
var DefaultUIHandler = class {
  requestUserInteraction = () => {
    const overlay = this.showOverlay(requestPermissionOverlay);
    return new Promise((resolve) => {
      const button = document.querySelector("#request-permission-overlay-button");
      button?.addEventListener("click", () => {
        overlay.remove();
        resolve();
      });
    });
  };
  handlePermissionFail(error) {
    console.log("Permission failed", error);
    this.showOverlay(failedPermissionOverlay(error.message));
  }
  handleError = (error) => {
    console.error("XR8 encountered an error", error);
    this.showOverlay(runtimeErrorOverlay(error.detail.message));
  };
  showWaitingForDeviceLocation = () => {
    this.showOverlay(waitingForDeviceLocationOverlay);
  };
  hideWaitingForDeviceLocation = () => {
    const overlay = document.querySelector("#waiting-for-device-location-overlay");
    if (overlay) {
      overlay.remove();
    }
  };
  handleIncompatibleDevice = () => {
    this.showOverlay(deviceIncompatibleOverlay());
  };
  showOverlay = (htmlContent) => {
    const overlay = document.createElement("div");
    overlay.innerHTML = htmlContent;
    document.body.appendChild(overlay);
    return overlay;
  };
};
var overlayStyles = `
<style>
.xr8-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 999;
  color: #fff;
  background-color: rgba(0, 0, 0, 0.5);
  text-align: center;
  font-family: sans-serif;
  display: flex;
  flex-direction: column;
  font-size: 32px;
  padding: 30px;
  box-sizing: border-box;
}

.xr8-overlay-wle-logo {
  height: 100px;
}

.xr8-overlay-wle-logo img {
  width: 300px;
}

.xr8-overlay-description {
  flex-grow: 1;
}

.xr8-overlay-button {
  background-color: #e80086;
  font-size: 22px;
  padding: 10px 30px;
  color: #fff;
  border-radius: 15px;
  border: none;
}
</style>
`;
var overlayLogo = `
  <div class="xr8-overlay-wle-logo">
    <img src="data:image/png;base64,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" />
  </div>
`;
var requestPermissionOverlay = `
${overlayStyles}
<div id="request-permission-overlay" class="xr8-overlay">
   ${overlayLogo}
    <div class="xr8-overlay-description">This app requires to use your camera and motion sensors</div>
    <button class="xr8-overlay-button" id="request-permission-overlay-button">ALLOW</button>
</div>`;
var failedPermissionOverlay = (reason) => `
  ${overlayStyles}
  <div id="failed-permission-overlay" class="xr8-overlay">
  ${overlayLogo}
  <div class="xr8-overlay-description">Failed to grant permissions [${reason}]. Reset the the permissions and
      refresh the page.</div>

  <button class="xr8-overlay-button" onclick="window.location.reload()">Refresh the page</button>
  </div>
`;
var runtimeErrorOverlay = (message) => `
  <div class="xr8-overlay">
  ${overlayLogo}
  <div class="xr8-overlay-description">Error has occurred. Please reload the page<br />${message}</div>
  <button class="xr8-overlay-button" onclick="window.location.reload()">Refresh the page</button>
  </div>
`;
var waitingForDeviceLocationOverlay = `
${overlayStyles}
<style>
.container {
  width: 64px;
  height: 64px;
  perspective: 1000px;
  margin: 64px auto 0;
}

.cube {
  transform-style: preserve-3d;
  width: 100%;
  height: 100%;
  position: relative;
  animation: spin 5s infinite linear;
}

.face {
  position: absolute;
  width: 100%;
  height: 100%;
}

.top {
  transform: rotateX(90deg) translateZ(32px);
  background-color: rgba(255, 0, 183, 255);
}

.right {
  transform: rotateY(90deg) translateZ(32px);
  background-color: rgba(255, 255, 0, 255);
}

.front {
  transform: rotateX(0deg) translateZ(32px);
  background-color: rgba(0, 200, 100, 255);
}


.bottom {
  transform: rotateX(-90deg) translateZ(32px);
  background-color: rgba(255, 0, 183, 255);
}


.left {
  transform: rotateY(-90deg) translateZ(32px);
  background-color: rgba(255, 255, 0, 255);
}

.back {
  transform: rotateX(-180deg) translateZ(32px);
  background-color: rgba(0, 200, 100, 255);
}

@keyframes spin {
  from {
    transform: rotateX(0deg) rotateY(0deg);
  }

  to {
    transform: rotateX(360deg) rotateY(360deg);
  }
}
</style>

<div id="waiting-for-device-location-overlay" class="xr8-overlay">
${overlayLogo}
<div class="xr8-overlay-description"> Waiting for device location...
  <div class="container">
    <div class="cube">
      <div class="face front"></div>
      <div class="face back"></div>
      <div class="face right"></div>
      <div class="face left"></div>
      <div class="face top"></div>
      <div class="face bottom"></div>
    </div>
  </div>
</div>
</div>
`;
var deviceIncompatibleOverlay = () => {
  const svg = new QRCode.default({
    content: window.location.href,
    width: 200,
    height: 200
  }).svg();
  const html = `
    ${overlayStyles}
    <style>
    #xr8-overlay-epxerience-url {
      font-size: 24px;
    }

    #xr8-overlay-qr-code {
      margin: 20px 0;
    }
  </style>
  <div id="failed-permission-overlay" class="xr8-overlay">
  ${overlayLogo}
    <div class="xr8-overlay-description">
      This device is not compatible with 8th Wall. Please open it using your mobile device.<br />
      <div id="xr8-overlay-qr-code">${svg}</div>
      <br />
      <div id="xr8-overlay-epxerience-url">${window.location.href}</div>
    </div>
  </div>`;
  return html;
};
var xr8logo = `
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Layer_1" x="0px" y="0px" width="252px" height="48px" viewBox="0 0 252 48" style="enable-background:new 0 0 252 48;" xml:space="preserve"><script xmlns=""/>
      <style type="text/css">
        .st0{fill:#fff;}
      </style>
      <g id="Logo_-_Shape">
        <path class="st0" d="M8.32466,26.20464c-0.67188-0.42676-1.46289-0.64062-2.37305-0.64062   c-0.92383,0-1.71484,0.23096-2.37305,0.69287c-0.48096,0.33765-0.84302,0.75977-1.0918,1.26208v-0.94714   c0-0.32178-0.08105-0.56299-0.24121-0.72412c-0.16113-0.16113-0.39551-0.2417-0.7041-0.2417   c-0.29395,0-0.52441,0.08057-0.69238,0.2417s-0.25195,0.40234-0.25195,0.72412v12.36914c0,0.30762,0.08398,0.5459,0.25195,0.71387   s0.39844,0.25195,0.69238,0.25195c0.30859,0,0.54688-0.08398,0.71484-0.25195s0.25195-0.40625,0.25195-0.71387v-4.71436   c0.24902,0.4942,0.61108,0.91217,1.0918,1.24951c0.6582,0.46191,1.44141,0.69287,2.35156,0.69287s1.7041-0.21338,2.38379-0.64062   c0.67871-0.42676,1.2041-1.04248,1.5752-1.84766c0.37012-0.80518,0.55664-1.74658,0.55664-2.82471   c0-1.0918-0.18945-2.0332-0.56738-2.82471c-0.37793-0.79053-0.90332-1.39941-1.5752-1.82666L8.32466,26.20464z M8.15669,32.93511   c-0.25195,0.56006-0.60547,0.98682-1.06055,1.28076s-0.9834,0.44092-1.58496,0.44092c-0.92383,0-1.65918-0.3252-2.20508-0.97607   c-0.5459-0.65137-0.81934-1.59277-0.81934-2.82471c0-0.82568,0.12207-1.51904,0.36719-2.0791   c0.24512-0.55957,0.5957-0.9834,1.05078-1.27051c0.4541-0.28662,0.99023-0.43018,1.60645-0.43018   c0.92383,0,1.65918,0.32227,2.20508,0.96582c0.5459,0.64404,0.81836,1.58203,0.81836,2.81396   C8.53462,31.68217,8.40864,32.37504,8.15669,32.93511z"/>
        <path class="st0" d="M19.89595,26.21489c-0.74219-0.43359-1.61719-0.65088-2.625-0.65088   c-0.75586,0-1.43848,0.12256-2.04785,0.36768c-0.6084,0.24512-1.12988,0.59814-1.56445,1.06055   c-0.43359,0.46191-0.76562,1.01807-0.99707,1.66943c-0.23145,0.65088-0.34668,1.38281-0.34668,2.19434   c0,1.07812,0.20312,2.01611,0.60938,2.81396c0.40527,0.79785,0.97949,1.41406,1.72168,1.84814s1.61719,0.65088,2.625,0.65088   c0.75586,0,1.43848-0.12256,2.04785-0.36768c0.6084-0.24463,1.12988-0.59814,1.56445-1.06006   c0.43359-0.4624,0.7666-1.02197,0.99707-1.68018c0.23145-0.65771,0.34668-1.39307,0.34668-2.20508   c0-1.07764-0.20312-2.01221-0.60938-2.80371C21.21138,27.26175,20.63814,26.64896,19.89595,26.21489z M19.9272,32.9351   c-0.24512,0.56006-0.59473,0.98682-1.0498,1.28076s-0.99023,0.44092-1.60645,0.44092c-0.91016,0-1.6416-0.3252-2.19434-0.97607   c-0.55371-0.65137-0.8291-1.59277-0.8291-2.82471c0-0.82568,0.12598-1.51904,0.37793-2.0791   c0.25195-0.55957,0.60547-0.9834,1.06055-1.27051c0.4541-0.28662,0.9834-0.43018,1.58496-0.43018   c0.92383,0,1.65918,0.32227,2.20508,0.96582c0.5459,0.64404,0.81934,1.58203,0.81934,2.81396   C20.29537,31.68217,20.17232,32.37503,19.9272,32.9351z"/>
        <path class="st0" d="M39.13228,25.606c-0.22461,0-0.41309,0.05273-0.56738,0.15771s-0.28027,0.29736-0.37793,0.57715   l-2.65674,7.42999l-2.65674-7.42999c-0.07031-0.25195-0.18848-0.43701-0.35645-0.55615S32.13911,25.606,31.88716,25.606   c-0.23828,0-0.43848,0.05957-0.59863,0.17871c-0.16113,0.11914-0.29102,0.3042-0.38867,0.55615l-2.68506,7.40179l-2.60693-7.3598   c-0.09766-0.29395-0.2168-0.49658-0.35742-0.60889c-0.13965-0.11182-0.3291-0.16797-0.56641-0.16797   c-0.25195,0-0.45508,0.05615-0.60938,0.16797c-0.1543,0.1123-0.25195,0.26611-0.29395,0.46191   c-0.04199,0.19629-0.01367,0.42725,0.08398,0.69336l3.12891,8.33691c0.1123,0.30811,0.26562,0.52832,0.46191,0.66113   c0.19629,0.1333,0.42676,0.19971,0.69336,0.19971c0.28027,0,0.51758-0.07031,0.71387-0.20996s0.34961-0.35693,0.46191-0.65088   l2.52002-6.90814l2.52002,6.90814c0.1123,0.29395,0.26953,0.51123,0.47266,0.65088s0.4375,0.20996,0.70312,0.20996   c0.2666,0,0.50098-0.07031,0.7041-0.20996c0.20215-0.13965,0.35352-0.35693,0.45117-0.65088l3.12891-8.33691   c0.08398-0.22412,0.11523-0.4375,0.09473-0.64062c-0.02148-0.20264-0.09473-0.36768-0.2207-0.49365   S39.38424,25.606,39.13228,25.606z"/>
        <path class="st0" d="M50.71333,31.1187c0.13281-0.11914,0.19922-0.29053,0.19922-0.51465c0-0.78369-0.10156-1.4873-0.30469-2.11035   s-0.50098-1.15137-0.89258-1.58545s-0.86426-0.7666-1.41699-0.99756c-0.55371-0.23096-1.17285-0.34668-1.8584-0.34668   c-0.9668,0-1.82422,0.22412-2.57324,0.67188c-0.74902,0.44824-1.33691,1.07129-1.76367,1.86914s-0.64062,1.729-0.64062,2.79297   c0,1.07812,0.2168,2.0127,0.65137,2.80371c0.43359,0.79102,1.0459,1.3999,1.83691,1.82666   c0.79102,0.42725,1.74023,0.64062,2.8457,0.64062c0.58789,0,1.2002-0.0874,1.83789-0.2627   c0.63672-0.1748,1.18652-0.42285,1.64844-0.74512c0.19531-0.12598,0.3291-0.27295,0.39844-0.44092   c0.07031-0.16846,0.0918-0.32568,0.06348-0.47266s-0.09863-0.27295-0.20996-0.37793   c-0.1123-0.10498-0.25586-0.16113-0.43066-0.16797s-0.36719,0.05225-0.57715,0.17822   c-0.43457,0.29395-0.88574,0.49707-1.35449,0.60889c-0.46973,0.1123-0.92773,0.16797-1.37598,0.16797   c-1.13379,0-2.00195-0.32178-2.60352-0.96582c-0.52417-0.55981-0.80591-1.36755-0.87402-2.39404h6.81641   c0.25195,0,0.44434-0.05908,0.57812-0.17822L50.71333,31.1187z M43.34639,30.07915c0.05298-0.48199,0.14478-0.93707,0.32104-1.3335   c0.25195-0.56689,0.61621-1.0083,1.0918-1.32324c0.47656-0.31494,1.05078-0.47217,1.72266-0.47217   c0.61523,0,1.12988,0.13281,1.54297,0.39893s0.72754,0.6543,0.94531,1.16553c0.1853,0.43689,0.27466,0.96936,0.30151,1.56445   C49.27168,30.07915,43.34639,30.07915,43.34639,30.07915z"/>
        <path class="st0" d="M58.5356,25.54301c-0.93848,0.05615-1.71484,0.30127-2.33105,0.73486   c-0.45923,0.32343-0.80859,0.76044-1.0498,1.3092v-1.01526c0-0.32178-0.08105-0.56299-0.24219-0.72412   s-0.3877-0.2417-0.68262-0.2417c-0.29395,0-0.52441,0.08057-0.69238,0.2417s-0.25195,0.40234-0.25195,0.72412v8.56836   c0,0.32227,0.08398,0.56689,0.25195,0.73486s0.41309,0.25195,0.73438,0.25195c0.30859,0,0.54297-0.08398,0.7041-0.25195   s0.24121-0.4126,0.24121-0.73486v-4.91406c0-0.88232,0.24902-1.5752,0.74609-2.0791   c0.49609-0.50391,1.20703-0.80469,2.13086-0.90283l0.37793-0.021c0.29395-0.02783,0.51074-0.12256,0.65137-0.28369   c0.13965-0.16064,0.20312-0.37451,0.18848-0.64062c-0.01367-0.27979-0.09082-0.479-0.23047-0.59814   c-0.14062-0.11914-0.32227-0.17139-0.5459-0.15771L58.5356,25.54301z"/>
        <path class="st0" d="M69.44575,31.1187c0.13281-0.11914,0.19922-0.29053,0.19922-0.51465c0-0.78369-0.10156-1.4873-0.30469-2.11035   s-0.50098-1.15137-0.89258-1.58545s-0.86426-0.7666-1.41699-0.99756c-0.55371-0.23096-1.17285-0.34668-1.8584-0.34668   c-0.9668,0-1.82422,0.22412-2.57324,0.67188c-0.74902,0.44824-1.33691,1.07129-1.76367,1.86914s-0.64062,1.729-0.64062,2.79297   c0,1.07812,0.2168,2.0127,0.65137,2.80371c0.43359,0.79102,1.0459,1.3999,1.83691,1.82666   c0.79102,0.42725,1.74023,0.64062,2.8457,0.64062c0.58789,0,1.2002-0.0874,1.83789-0.2627   c0.63672-0.1748,1.18652-0.42285,1.64844-0.74512c0.19531-0.12598,0.3291-0.27295,0.39844-0.44092   c0.07031-0.16846,0.0918-0.32568,0.06348-0.47266s-0.09863-0.27295-0.20996-0.37793   c-0.1123-0.10498-0.25586-0.16113-0.43066-0.16797s-0.36719,0.05225-0.57715,0.17822   c-0.43457,0.29395-0.88574,0.49707-1.35449,0.60889c-0.46973,0.1123-0.92773,0.16797-1.37598,0.16797   c-1.13379,0-2.00195-0.32178-2.60352-0.96582c-0.52417-0.55981-0.80591-1.36755-0.87402-2.39404h6.81641   c0.25195,0,0.44434-0.05908,0.57812-0.17822L69.44575,31.1187z M62.07881,30.07915c0.05298-0.48199,0.14478-0.93707,0.32104-1.3335   c0.25195-0.56689,0.61621-1.0083,1.0918-1.32324c0.47656-0.31494,1.05078-0.47217,1.72266-0.47217   c0.61523,0,1.12988,0.13281,1.54297,0.39893s0.72754,0.6543,0.94531,1.16553c0.1853,0.43689,0.27466,0.96936,0.30151,1.56445   C68.0041,30.07915,62.07882,30.07915,62.07881,30.07915z"/>
        <path class="st0" d="M80.31294,21.02788c-0.30859,0-0.54297,0.08105-0.7041,0.2417   c-0.16016,0.16113-0.24121,0.40234-0.24121,0.72461v5.49274c-0.24927-0.49304-0.61084-0.90784-1.0918-1.2403   c-0.6582-0.45508-1.44238-0.68262-2.35156-0.68262c-0.91113,0-1.70508,0.21387-2.38379,0.64062   c-0.67969,0.42725-1.2041,1.03613-1.5752,1.82666c-0.37109,0.7915-0.55664,1.73291-0.55664,2.82471   c0,1.07812,0.18945,2.01953,0.56738,2.82471s0.90625,1.4209,1.58496,1.84766c0.67969,0.42725,1.4668,0.64062,2.36328,0.64062   c0.90918,0,1.69727-0.23096,2.3623-0.69287c0.47998-0.3338,0.83789-0.75476,1.08105-1.2569v0.92096   c0,0.32227,0.08398,0.56689,0.25195,0.73486s0.39941,0.25195,0.69336,0.25195c0.30762,0,0.5459-0.08398,0.71387-0.25195   s0.25195-0.4126,0.25195-0.73486v-13.146c0-0.32227-0.08398-0.56348-0.25195-0.72461   c-0.16797-0.16064-0.40625-0.2417-0.71387-0.2417L80.31294,21.02788z M79.02095,32.93511   c-0.24512,0.56006-0.59473,0.98682-1.0498,1.28076s-0.99023,0.44092-1.60645,0.44092c-0.91016,0-1.6416-0.3252-2.19434-0.97607   c-0.55371-0.65137-0.8291-1.59277-0.8291-2.82471c0-0.82568,0.12598-1.51904,0.37793-2.0791   c0.25195-0.55957,0.60547-0.9834,1.06055-1.27051c0.4541-0.28662,0.9834-0.43018,1.58496-0.43018   c0.92383,0,1.65918,0.32227,2.20508,0.96582c0.5459,0.64404,0.81934,1.58203,0.81934,2.81396   C79.38911,31.68218,79.26607,32.37505,79.02095,32.93511z"/>
        <path class="st0" d="M97.56392,26.20464c-0.67969-0.42676-1.47363-0.64062-2.38379-0.64062s-1.69336,0.22754-2.35156,0.68262   c-0.48071,0.33234-0.84277,0.74695-1.0918,1.23969V21.9942c0-0.32227-0.08398-0.56348-0.25195-0.72461   c-0.16797-0.16064-0.40625-0.2417-0.71484-0.2417c-0.29395,0-0.52441,0.08105-0.69238,0.2417   c-0.16797,0.16113-0.25195,0.40234-0.25195,0.72461v13.146c0,0.32227,0.08398,0.56689,0.25195,0.73486   s0.39844,0.25195,0.69238,0.25195c0.30859,0,0.54297-0.08398,0.7041-0.25195c0.16016-0.16797,0.24121-0.4126,0.24121-0.73486   v-0.93738c0.24878,0.50977,0.61084,0.93567,1.0918,1.27332c0.6582,0.46191,1.44922,0.69287,2.37305,0.69287   c0.91016,0,1.70117-0.21338,2.37305-0.64062c0.67188-0.42676,1.19727-1.04248,1.5752-1.84766s0.56738-1.74658,0.56738-2.82471   c0-1.0918-0.18652-2.0332-0.55664-2.82471C98.76803,27.24077,98.24265,26.63189,97.56392,26.20464z M97.38521,32.93511   c-0.25195,0.56006-0.60547,0.98682-1.06055,1.28076s-0.9834,0.44092-1.58496,0.44092c-0.92383,0-1.65918-0.3252-2.20508-0.97607   c-0.5459-0.65137-0.81934-1.59277-0.81934-2.82471c0-0.82568,0.12207-1.51904,0.36719-2.0791   c0.24512-0.55957,0.5957-0.9834,1.05078-1.27051c0.4541-0.28662,0.99023-0.43018,1.60645-0.43018   c0.92383,0,1.65918,0.32227,2.20508,0.96582c0.5459,0.64404,0.81836,1.58203,0.81836,2.81396   C97.76314,31.68217,97.63716,32.37504,97.38521,32.93511z"/>
        <path class="st0" d="M110.56197,25.79497c-0.13281-0.12598-0.31836-0.18896-0.55664-0.18896   c-0.26562,0-0.47559,0.05615-0.62988,0.16797c-0.1543,0.1123-0.28711,0.30811-0.39844,0.58789l-3.06348,7.4093l-3.00586-7.4093   c-0.12598-0.27979-0.25879-0.47559-0.39941-0.58789c-0.13965-0.11182-0.3291-0.16797-0.56641-0.16797   c-0.28027,0-0.50098,0.06299-0.66211,0.18896s-0.25488,0.28711-0.2832,0.48291c-0.02832,0.19629,0.00684,0.41309,0.10547,0.65137   l3.79492,8.83533l-1.25391,2.84045c-0.09863,0.22363-0.13672,0.4375-0.11621,0.64062   c0.02148,0.20264,0.10547,0.36377,0.25195,0.48291c0.14746,0.11865,0.33301,0.17822,0.55664,0.17822   c0.26562,0,0.47266-0.05225,0.62012-0.15723c0.14648-0.10498,0.29004-0.30469,0.42969-0.59863l5.29199-12.24268   c0.1123-0.22412,0.1543-0.43408,0.12598-0.63037C110.77585,26.08207,110.69479,25.92094,110.56197,25.79497z"/>
        <path class="st0" d="M199.81953,12.86967h48.86694c1.65649,0,2.99902-1.34271,2.99902-2.99896V2.99895   c0-1.65625-1.34253-2.99897-2.99902-2.99897h-48.86694c-1.65625,0-2.99902,1.34271-2.99902,2.99896v6.87177   C196.82051,11.52696,198.16328,12.86967,199.81953,12.86967z M197.0461,2.99894c0-1.52924,1.24438-2.77338,2.77344-2.77338   h48.86694c1.5293,0,2.77344,1.24414,2.77344,2.77338v6.87177c0,1.52924-1.24414,2.77338-2.77344,2.77338h-48.86694   c-1.52905,0-2.77344-1.24414-2.77344-2.77338V2.99895V2.99894z"/>
        <polygon class="st0" points="202.23286,5.93364 205.82661,9.72191 206.41499,9.72191 206.41499,3.15282 205.00337,3.15282    205.00337,6.98357 201.39839,3.18553 201.36958,3.15282 200.81929,3.15282 200.81929,9.72191 202.23286,9.72191  "/>
        <rect x="209.40913" y="3.14769" class="st0" width="1.40796" height="6.57422"/>
        <polygon class="st0" points="223.83028,5.93364 227.42451,9.72191 228.01216,9.72191 228.01216,3.15282 226.60152,3.15282    226.60152,6.98357 222.96529,3.15282 222.41695,3.15282 222.41695,9.72191 223.83028,9.72191  "/>
        <polygon class="st0" points="232.66743,9.72191 234.07954,9.72191 234.07954,4.55247 236.09102,4.55247 236.09102,3.15282    230.65767,3.15282 230.65767,4.55247 232.66743,4.55247  "/>
        <rect x="238.77168" y="3.14769" class="st0" width="1.40698" height="6.57422"/>
        <path class="st0" d="M246.04585,9.72173h0.00024c0.82788,0,1.44165-0.25317,2.11841-0.87372l0.07739-0.07013l-0.93896-1.08508   l-0.07568,0.06543c-0.37427,0.3186-0.65845,0.48047-1.17383,0.48047c-0.51099,0-0.92725-0.16498-1.23706-0.49017   c-0.31128-0.32434-0.47046-0.77271-0.47339-1.33203c0-0.52155,0.15747-0.95312,0.46826-1.28278   c0.30933-0.33093,0.72485-0.49988,1.23486-0.50232c0.50269,0,0.79248,0.16364,1.18188,0.48621l0.07593,0.06165l0.93774-1.08063   l-0.07666-0.07056c-0.67529-0.6217-1.28931-0.87549-2.1189-0.87549c-0.87671,0-1.6228,0.31793-2.21729,0.94495   c-0.59375,0.62854-0.896,1.41162-0.89795,2.32782c0,0.93585,0.30127,1.72711,0.89551,2.35144   c0.59692,0.62372,1.34375,0.94165,2.21948,0.94495V9.72173z"/>
        <path class="st0" d="M215.33199,8.74687h2.59424l0.36157,0.97504l1.50562-0.00549l-2.49023-6.56372h-1.34766l-2.43896,6.42389   l-0.0542,0.14532h1.50854C214.9709,9.72191,215.33199,8.74687,215.33199,8.74687z M216.65889,5.18736l0.76685,2.08191   l-1.57031,0.01886L216.65889,5.18736z"/>
        <path class="st0" d="M210.17964,18.56548c-0.97754,0.00049-1.80859,0.66742-2.01685,1.6059l-4.29419,16.09668l-3.52295-14.42322   c-0.229-0.92432-1.05518-1.57074-2.0083-1.57123h-3.05225c-0.95215,0.00049-1.77808,0.64642-2.00806,1.57269l-3.52026,14.42126   l-4.29004-16.08099c-0.2124-0.95367-1.04321-1.62061-2.02075-1.62109h-3.75513l6.83276,24.40314l0.07739,0.27399h4.58276   c0.93848-0.00391,1.75952-0.63898,1.99536-1.5462c1.02563-3.91199,2.85474-11.60242,3.63281-14.89099   c0.77783,3.28857,2.60889,10.979,3.6333,14.89099c0.23706,0.90723,1.05811,1.5423,1.99658,1.5462h4.58276l6.90991-24.67712   h-3.75488V18.56548z"/>
        <path class="st0" d="M172.43257,24.41563c-1.19971-0.65521-2.59717-0.99677-3.9104-0.96295   c-1.2019-0.00934-2.35962,0.22845-3.45068,0.71436c-0.62329,0.27063-1.24487,0.74719-1.88379,1.44788v-5.02808   c0.01367-0.54462-0.18604-1.06183-0.56177-1.45673c-0.37573-0.39435-0.88281-0.61896-1.48755-0.63312h-3.43872v24.73584h3.43677   c0.51978-0.02545,1.05786-0.20551,1.44556-0.58911c0.38745-0.38263,0.60181-0.89349,0.60571-1.46106l-0.00098-8.57263   c-0.09204-1.19147,0.30835-2.54395,0.97681-3.34442c0.72412-0.74225,1.72217-1.14496,2.81641-1.08087   c1.0293-0.06946,2.04712,0.32831,2.74976,1.05981c0.73193,0.87488,1.09302,1.98364,1.01587,3.14771v8.81097   c0,1.12439,0.91504,2.03937,2.03931,2.03937h3.43799V31.75963c0.04199-1.53741-0.28784-3.08362-0.95923-4.47961   c-0.6311-1.22864-1.6106-2.21948-2.83105-2.86438V24.41563z"/>
        <path class="st0" d="M237.79512,19.18938c-0.37207,0.41296-0.58325,0.95996-0.57935,1.49774v20.50433   c-0.00391,0.54413,0.20532,1.05792,0.58911,1.44543c0.38257,0.38751,0.89331,0.60181,1.4502,0.60571h3.43896V18.50774h-3.44092   C238.70601,18.51116,238.18843,18.75286,237.79512,19.18938z"/>
        <path class="st0" d="M251.71968,18.53368h-3.4397c-0.5481,0.00342-1.06079,0.24072-1.44556,0.66888   c-0.36401,0.40466-0.56958,0.94678-0.56665,1.48456v20.50433c-0.00391,0.54413,0.20557,1.05792,0.58911,1.44543   c0.38281,0.38751,0.89355,0.60181,1.45044,0.60571h3.43774C251.74507,43.24259,251.71968,18.53367,251.71968,18.53368z"/>
        <path class="st0" d="M228.15376,25.50676v0.25983c-0.5686-0.57104-1.22803-1.05591-1.9436-1.4278   c-1.17212-0.59937-2.47681-0.8974-3.79004-0.87439c-3.19043-0.06555-6.24268,1.79187-7.66943,4.67828   c-0.80444,1.59167-1.21338,3.37421-1.18311,5.14258c-0.03345,1.78497,0.36792,3.57391,1.16162,5.1734   c0.71631,1.45129,1.82324,2.67114,3.19897,3.52545c1.31055,0.82404,2.81738,1.25848,4.35303,1.25848h0.24463   c1.27515,0,2.54639-0.30432,3.68433-0.88562c0.72241-0.36993,1.38086-0.86017,1.9436-1.44342v0.29553   c0,1.12048,0.91504,2.03253,2.05029,2.03253h3.43774V23.4644h-3.43774C229.07368,23.4644,228.15376,24.38035,228.15376,25.50676z    M227.16475,36.27562c-0.40308,0.7558-1.00317,1.38788-1.72974,1.82477c-0.72974,0.41913-1.56079,0.64099-2.40308,0.64099h-0.00537   c-0.82349,0-1.63062-0.22705-2.33521-0.6582c-0.75488-0.45355-1.37061-1.10443-1.77881-1.87958   c-0.4646-0.89514-0.70142-1.90094-0.68384-2.92505c-0.02393-0.99799,0.21191-1.99023,0.67969-2.86658   c0.41235-0.75214,1.02002-1.38159,1.75269-1.81689c0.73608-0.41864,1.56177-0.62793,2.38745-0.62793   s1.65161,0.20929,2.38745,0.62738c0.75269,0.43005,1.36548,1.06061,1.76953,1.81799   c0.45825,0.89722,0.68799,1.90308,0.66382,2.92505C227.88496,34.35796,227.6418,35.37419,227.16475,36.27562z"/>
        <path class="st0" d="M149.73091,20.4702c0-1.06805-0.76929-1.90472-1.73901-1.90472h-3.36646v5.23816h-0.01831   c-1.41235,0-2.55713,1.14484-2.55713,2.55713v2.58118h2.57544v8.85065c-0.07642,1.67682,0.56665,3.23621,1.55396,4.27911   c0.85132,0.8988,2.01978,1.37341,3.38013,1.37341c1.47363,0,2.61694-0.43219,3.39575-1.28461   c1.20386-1.31818,1.07056-3.14349,1.0647-3.22095l-0.02832-0.34778h-2.49854c-0.58594,0.02466-1.04297-0.12036-1.32886-0.40991   c-0.47266-0.47906-0.44507-1.30536-0.43335-1.65808v-7.58185h1.84814c1.41235,0,2.55713-1.1449,2.55713-2.55713v-2.58118h-4.40527   v-3.33344V20.4702z"/>
        <path class="st0" d="M137.373,14.73643l-6.49268-3.47089c-1.19629-0.63947-2.63281-0.63947-3.8291,0l-6.49292,3.47089   c-1.32129,0.70636-2.14648,2.08307-2.14648,3.58142v6.41565c0,1.49841,0.8252,2.87506,2.14648,3.58142l2.0166,1.07806   l-2.0166,1.078c-1.32129,0.70642-2.14648,2.08307-2.14648,3.58142v6.41565c0,1.49841,0.8252,2.87506,2.14648,3.58142   l6.49292,3.47089c1.19629,0.63947,2.63281,0.63947,3.8291,0l6.49268-3.47089c1.32153-0.70636,2.14648-2.08301,2.14648-3.58142   V34.0524c0-1.49835-0.82495-2.875-2.14648-3.58142l-2.0166-1.078l2.0166-1.07806c1.32153-0.70636,2.14648-2.08301,2.14648-3.58142   v-6.41565C139.51949,16.8195,138.69453,15.44279,137.373,14.73643z M133.87373,38.75199c0,0.69678-0.38379,1.33698-0.99829,1.66547   l-3.01929,1.61407c-0.5564,0.29736-1.22437,0.29736-1.78076,0l-3.01929-1.61407c-0.6145-0.32849-0.99805-0.96869-0.99805-1.66547   v-2.98352c0-0.69678,0.38354-1.33691,0.99805-1.66547l3.01929-1.61407c0.5564-0.29736,1.22437-0.29736,1.78076,0l3.01929,1.61407   c0.6145,0.32855,0.99829,0.96869,0.99829,1.66547V38.75199z M133.87373,23.01743c0,0.69678-0.38379,1.33698-0.99829,1.66547   l-3.01929,1.61407c-0.5564,0.29736-1.22437,0.29736-1.78076,0l-3.01929-1.61407c-0.6145-0.32849-0.99805-0.96869-0.99805-1.66547   v-2.98352c0-0.69678,0.38354-1.33698,0.99805-1.66547l3.01929-1.61407c0.5564-0.29736,1.22437-0.29736,1.78076,0l3.01929,1.61407   c0.6145,0.32849,0.99829,0.96869,0.99829,1.66547V23.01743z"/>
      </g>
      </svg>
`;

// ../../ar-provider-8thwall/dist/src/face-tracking-mode-xr8.js
var AttachmentPointsMapping = {
  leftCheek: FaceAttachmentPoint.CheekLeft,
  rightCheek: FaceAttachmentPoint.CheekRight,
  chin: FaceAttachmentPoint.Chin,
  leftEar: FaceAttachmentPoint.EarLeft,
  rightEar: FaceAttachmentPoint.EarRight,
  leftEye: FaceAttachmentPoint.EyeLeft,
  leftEyeOuterCorner: FaceAttachmentPoint.EyeOuterCornerLeft,
  rightEyeOuterCorner: FaceAttachmentPoint.EyeOuterCornerRight,
  rightEye: FaceAttachmentPoint.EyeRight,
  leftEyebrowInner: FaceAttachmentPoint.EyeBrowInnerLeft,
  rightEyebrowInner: FaceAttachmentPoint.EyeBrowInnerRight,
  leftEyebrowMiddle: FaceAttachmentPoint.EyeBrowCenterLeft,
  rightEyebrowMiddle: FaceAttachmentPoint.EyeBrowCenterRight,
  leftEyebrowOuter: FaceAttachmentPoint.EyeBrowOuterLeft,
  rightEyebrowOuter: FaceAttachmentPoint.EyeBrowOuterRight,
  forehead: FaceAttachmentPoint.Forehead,
  lowerLip: FaceAttachmentPoint.LowerLip,
  mouth: FaceAttachmentPoint.Mouth,
  mouthLeftCorner: FaceAttachmentPoint.MouthCornerLeft,
  mouthRightCorner: FaceAttachmentPoint.MouthCornerRight,
  noseBridge: FaceAttachmentPoint.NoseBridge,
  noseTip: FaceAttachmentPoint.NoseTip,
  upperLip: FaceAttachmentPoint.UpperLip
};
function toFaceFoundEvent(event) {
  const attachmentPoints = Object.fromEntries(Object.entries(event.detail.attachmentPoints).map((v) => {
    const remapped = AttachmentPointsMapping[v[0]];
    return [remapped, v[1]];
  }));
  const d = event.detail;
  d.attachmentPoints = attachmentPoints;
  return d;
}
var FaceTracking_XR8 = class extends TrackingMode {
  /* Required by the `XR8.addCameraPipelineModules` */
  name = "face-tracking-XR8";
  /* Cache view component */
  _view;
  /* Cache 8th Wall cam position */
  _cachedPosition = [0, 0, 0];
  /* Cache 8th Wall cam rotation */
  _cachedRotation = [0, 0, 0, -1];
  onFaceScanning = new Emitter3();
  onFaceLoading = new Emitter3();
  onFaceFound = new Emitter3();
  onFaceUpdate = new Emitter3();
  onFaceLost = new Emitter3();
  /** Consumed by 8th Wall. */
  listeners = [
    {
      /**
       * Fires when loading begins for additional face AR resources.
       */
      event: "facecontroller.faceloading",
      process: (event) => {
        this.onFaceLoading.notify(event.detail);
      }
    },
    {
      /**
       * Fires when all face AR resources have been loaded and scanning has begun.
       */
      event: "facecontroller.facescanning",
      process: (event) => {
        this.onFaceLoading.notify(event.detail);
      }
    },
    {
      event: "facecontroller.facefound",
      process: (event) => {
        this.onFaceFound.notify(toFaceFoundEvent(event));
      }
    },
    {
      event: "facecontroller.faceupdated",
      process: (event) => {
        this.onFaceUpdate.notify(toFaceFoundEvent(event));
      }
    },
    {
      event: "facecontroller.facelost",
      process: (event) => {
        this.onFaceLost.notify(event.detail);
      }
    }
  ];
  /**
   * Called by any consuming AR camera.
   * Set's up the cached vars.
   */
  init() {
    const input = this.component.object.getComponent("input");
    if (input) {
      input.active = false;
    }
    this._view = this.component.object.getComponent("view");
    this.provider.onSessionEnd.add(() => {
      XR8.removeCameraPipelineModules([XR8.FaceController.pipelineModule(), this]);
    });
  }
  /**
   * Configures XR8.XrController for the session,
   * sets itself as an XR8 camera pipeline module
   * and tells xr8Provider to start the session
   */
  async startSession() {
    const permissions = await this.provider.checkPermissions();
    if (!permissions) {
      return;
    }
    XR8.FaceController.configure({
      meshGeometry: [
        XR8.FaceController.MeshGeometry.FACE,
        XR8.FaceController.MeshGeometry.EYES,
        XR8.FaceController.MeshGeometry.MOUTH
      ],
      coordinates: { mirroredDisplay: false }
    });
    const options = {
      canvas: this.component.engine.canvas,
      allowedDevices: XR8.XrConfig.device().ANY,
      ownRunLoop: false,
      cameraConfig: {
        direction: ARFaceTrackingCamera.Properties.cameraDirection.values[this.component.cameraDirection]
      }
    };
    return this.provider.startSession(options, [
      XR8.FaceController.pipelineModule(),
      this
    ]);
  }
  endSession() {
    this.provider.endSession();
  }
  /**
   * Called by 8th Wall internally.
   * Updates WL cameras projectionMatrix and pose
   *
   * @param e Camera projection matrix and pose provided by 8th Wall
   */
  onUpdate = (e) => {
    const source = e.processCpuResult.facecontroller;
    if (!source)
      return;
    const { rotation, position, intrinsics } = source;
    this._cachedRotation[0] = rotation.x;
    this._cachedRotation[1] = rotation.y;
    this._cachedRotation[2] = rotation.z;
    this._cachedRotation[3] = rotation.w;
    this._cachedPosition[0] = position.x;
    this._cachedPosition[1] = position.y;
    this._cachedPosition[2] = position.z;
    if (intrinsics) {
      const projectionMatrix = this._view.projectionMatrix;
      for (let i = 0; i < 16; i++) {
        if (Number.isFinite(intrinsics[i])) {
          projectionMatrix[i] = intrinsics[i];
        }
      }
    }
    if (position && rotation) {
      this.component.object.setRotationWorld(this._cachedRotation);
      this.component.object.setPositionWorld(this._cachedPosition);
    }
  };
};

// ../../ar-provider-8thwall/dist/src/components/AR-XR8-SLAM-camera.js
var __decorate6 = function(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
    r = Reflect.decorate(decorators, target, key, desc);
  else
    for (var i = decorators.length - 1; i >= 0; i--)
      if (d = decorators[i])
        r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ARXR8SLAMCamera = class extends ARCamera {
  useAbsoluteScale;
  _trackingImpl;
  get onTrackingStatus() {
    return this._trackingImpl.onTrackingStatus;
  }
  init() {
    const provider = XR8Provider.registerTrackingProviderWithARSession(ARSession.getSessionForEngine(this.engine));
    this._trackingImpl = new WorldTracking_XR8(provider, this);
  }
  start() {
    if (!this.object.getComponent("view")) {
      throw new Error("AR-camera requires a view component");
    }
    this._trackingImpl.init();
  }
  startSession = async () => {
    if (this.active) {
      this._trackingImpl.startSession();
    }
  };
  endSession = async () => {
    if (this.active) {
      this._trackingImpl.endSession();
    }
  };
  onDeactivate() {
    this._trackingImpl.endSession();
  }
};
__publicField(ARXR8SLAMCamera, "TypeName", "ar-xr8-slam-camera");
__decorate6([
  property3.bool(false)
], ARXR8SLAMCamera.prototype, "useAbsoluteScale", void 0);

// js/index.js
var RuntimeOptions = {
  physx: false,
  loader: false,
  xrFramebufferScaleFactor: 1,
  canvas: "canvas"
};
var Constants = {
  ProjectName: "FaceTracking",
  RuntimeBaseName: "WonderlandRuntime",
  WebXRRequiredFeatures: ["local"],
  WebXROptionalFeatures: ["local", "hand-tracking", "hit-test"]
};
window.API_TOKEN_XR8 = "sU7eX52Oe2ZL8qUKBWD5naUlu1ZrnuRrtM1pQ7ukMz8rkOEG8mb63YlYTuiOrsQZTiXKRe";
window.WEBXR_REQUIRED_FEATURES = Constants.WebXRRequiredFeatures;
window.WEBXR_OPTIONAL_FEATURES = Constants.WebXROptionalFeatures;
var engine = await loadRuntime(Constants.RuntimeBaseName, RuntimeOptions);
engine.onSceneLoaded.once(() => {
  const el = document.getElementById("version");
  if (el)
    setTimeout(() => el.remove(), 2e3);
});
function requestSession(mode) {
  engine.requestXRSession(mode, WebXRRequiredFeatures, WebXROptionalFeatures).catch((e) => console.error(e));
}
function setupButtonsXR() {
  const vrButton = document.getElementById("vr-button");
  if (vrButton) {
    vrButton.dataset.supported = engine.vrSupported;
    vrButton.addEventListener("click", () => requestSession("immersive-vr"));
  }
}
if (document.readyState === "loading") {
  window.addEventListener("load", setupButtonsXR);
} else {
  setupButtonsXR();
}
var arSession = ARSession.getSessionForEngine(engine);
WebXRProvider.registerTrackingProviderWithARSession(arSession);
XR8Provider.registerTrackingProviderWithARSession(arSession);
engine.registerComponent(ARFaceTrackingCamera);
engine.registerComponent(ButtonEndARSession);
engine.registerComponent(ButtonStartARSession);
engine.registerComponent(FaceAttachmentPointExample);
engine.registerComponent(FaceMaskExample);
engine.scene.load(`${Constants.ProjectName}.bin`);
//# sourceMappingURL=FaceTracking-bundle.js.map
