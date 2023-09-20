"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.KodMQAdapterError = exports.KodMQError = void 0;
var KodMQError = /** @class */ (function (_super) {
    __extends(KodMQError, _super);
    function KodMQError(message, originalError) {
        var _this = this;
        if (originalError)
            message += ": ".concat(originalError.message);
        _this = _super.call(this, message) || this;
        _this.name = "KodMQError";
        _this.stack = originalError === null || originalError === void 0 ? void 0 : originalError.stack;
        _this.originalError = originalError;
        return _this;
    }
    return KodMQError;
}(Error));
exports.KodMQError = KodMQError;
var KodMQAdapterError = /** @class */ (function (_super) {
    __extends(KodMQAdapterError, _super);
    function KodMQAdapterError(message, originalError) {
        var _this = _super.call(this, message, originalError) || this;
        _this.name = "KodMQAdapterError";
        return _this;
    }
    return KodMQAdapterError;
}(KodMQError));
exports.KodMQAdapterError = KodMQAdapterError;
