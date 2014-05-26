/*!
	Created 2012-2013 Kody Brown (kody@bricksoft.com).
*/

var util = {};

util.isArray = function(value)
{
    /// <summary>
    /// Returns whether the specified <paramref name="value"/> is a javascript [] (Array) or not.
    /// </summary>
    /// <param name="value" type="Object"></parameter>

    return Object.prototype.toString.call(value) === "[object Array]" || (value.push && value.pop && value.join);
};

util.isNumeric = function(value)
{
    /// <summary>
    /// Returns whether the specified <paramref name="value"/> is numeric or not.
    /// </summary>
    /// <param name="value" type="Object"></parameter>

    return !isNaN(parseFloat(value)) && isFinite(value);
};

util.trim = function(value, char)
{
    /// <summary>
    /// Trims all <paramref name="char"/> characters off the start and end of the specified string <paramref name="value"/>.
    /// If <paramref name="char"/> is not specified, whitspace is assumed.
    /// </summary>
    /// <param name="value" type="String">The string value to trim.</parameter>
    /// <param name="char" type="String">The character to trim off of the specified <paramref name="value"/>. If char is not specified, whitspace is assumed.</parameter>

    if (value && value !== "") {
        if (char) {
            var regEx = new RegExp("^" + char + "+|" + char + "+$");
            return value.replace(regEx, "");
        } else {
            return value.replace(/^\s+|\s+$/g, "");
        }
    }

    return "";
};

util.trimStart = function(value, char)
{
    /// <summary>
    /// Trims all <paramref name="char"/> characters off the start of the specified string <paramref name="value"/>.
    /// If <paramref name="char"/> is not specified, whitspace is assumed.
    /// </summary>
    /// <param name="value" type="String">The string value to trim.</parameter>
    /// <param name="char" type="String">The character to trim off of the specified <paramref name="value"/>. If char is not specified, whitspace is assumed.</parameter>
    /// <returns>empty string if the string <paramref name="value"/> is not provided.</returns>

    if (value && value !== "") {
        if (char) {
            var regEx = new RegExp("^" + char + "+");
            return value.replace(regEx, "");
        } else {
            return value.replace(/^\s+/, "");
        }
    }

    return "";
}

util.trimEnd = function(value, char)
{
    /// <summary>
    /// Trims all <paramref name="char"/> characters off the end of the specified string <paramref name="value"/>.
    /// If <paramref name="char"/> is not specified, whitspace is assumed.
    /// </summary>
    /// <param name="value" type="String">The string value to trim.</parameter>
    /// <param name="char" type="String">The character to trim off of the specified <paramref name="value"/>. If char is not specified, whitspace is assumed.</parameter>

    if (value && value !== "") {
        if (char) {
            var regEx = new RegExp(char + "+$");
            return value.replace(regEx, "");
        } else {
            return value.replace(/\s+$/, "");
        }
    }
    return "";
}

util.getInfo = function(name, a, indent)
{
    var i, t, n,
	tab = "       ",
	pad = "",
	str = "";

    if (typeof a === "undefined") {
        return "";
    }

    for (i = 0; i < indent; i++) {
        pad += tab;
    }

    t = util.type(a);

    if (t === "arguments") {
        str += pad + "[" + t + "][length:" + a.length + "]\n";
        for (i = 0; i < a.length; i++) {
            str += util.trimEnd(util.getInfo("", a[i], indent + 1)) + "\n";
        }
        str = util.trimEnd(str) + "\n";
    } else if (t === "array") {
        str += pad + "[" + t + "][length:" + a.length + "]\n";
        for (i = 0; i < a.length; i++) {
            str += util.trimEnd(util.getInfo("", a[i], indent + 1)) + "\n";
        }
        str = util.trimEnd(str) + "\n";
    } else if (t === "object") {
        str += pad;
        if (name) {
            str += "'" + name + "': ";
        }
        str += "[" + t + "] {\n";
        for (n in a) {
            str += util.trimEnd(util.getInfo(n, a[n], indent + 1)) + "\n";
        }
        str = util.trimEnd(str) + "\n" + pad + "}\n";
    } else if (t === "function") {
        str += pad;
        if (name) {
            str += "'" + name + "': ";
        }
        str += "[" + t + "]";
        if (util.showFunctionAlert) {
            str += a;
        }
        str += "\n";
    } else if (t === "jquery") {
        str += pad;
        if (name) {
            str += "'" + name + "': ";
        }
        str += "[" + t + "][id:" + a.attr("id") + "]\n";
    } else { //if (t === "string") {
        str += pad;
        if (name) {
            str += "'" + name + "': ";
        }
        if (t !== "string" && t !== "number" && t !== "boolean") {
            str += "[" + t + "] ";
        }

        if (t === "string") {
            str += "'"
        }
        str += a;
        if (t === "string") {
            str += "'"
        }
        str += "\n";
    }

    return str;
};

util.extend = function()
{
    /// <summary>
    /// Combines all specified <paramref name="arguments"/> (which must be of type object) into the first argument and returns it.
    /// There must be at least two arguments. The first one will be modified.
    /// </summary>
    /// <param name="arguments" type="Array"></param>
    /// <tests>
    ///   <exists>false</exists>
    ///   <updated>false</updated>
    /// </tests>

    var i, o,
		c = {};

    if (arguments.length < 2) {
        throw "util.extend() requires at least two objects.";
    }

    for (i = 0; i < arguments.length; i++) {
        if (typeof arguments[i] !== "undefined" && typeof arguments[i] !== "object") {
            throw "util.extend() requires all paramters to be an object.";
        }
    }

    c = arguments[0];

    for (i = 1; i < arguments.length; i++) {
        for (o in arguments[i]) {
            c[o] = arguments[i][o];
        }
    }

    return c;
};

util.type = function(obj)
{
    /// <summary>
    /// </summary>
    /// <param name="obj" type="Object"></param>

    try {
        if (obj instanceof jQuery) {
            return "jquery";
        }
    } catch (e) { }

    if (obj instanceof Array) {
        return "array";
    } else if (Object.prototype.toString.call(obj) === "[object Arguments]") {
        return "arguments";
    } else if (typeof jQuery !== "undefined") {
        return jQuery.type(obj);
    } else {
        return typeof (obj);
    }
};

util.extendType = function()
{
    /// <summary>
    /// Combines all specified <paramref name="arguments"/> (which must be of type object) into the first argument and returns it.
    /// There must be at least two arguments. The first one will be modified.
    /// </summary>
    /// <param name="arguments" type="Array"></param>
    /// <tests>
    ///   <exists>false</exists>
    ///   <updated>false</updated>
    /// </tests>

    var i, o,
		type = "",
		c = {};

    if (arguments.length < 3) {
        throw "util.extend() requires a type (string) and at least two objects.";
    }

    type = arguments[0];

    for (i = 1; i < arguments.length; i++) {
        if (typeof arguments[i] !== "object") {
            throw "util.extend() requires all paramters to be an object.";
        }
    }

    c = arguments[1];

    for (i = 2; i < arguments.length; i++) {
        for (o in arguments[i]) {
            if (util.type(o) === type) {
                c[o] = arguments[i][o];
            }
        }
    }

    return c;
};

util.getParams = function(p)
{
    /// <summary>
    /// </summary>
    /// <param name="p" type="Object"></param>

    if (util.type(p) === "undefined") {
        return { __error: "missing arguments (p)" };
    }

    if (p.debug) {
        util.console.group("getParams()");
        util.console.log(p);
    }

    if (util.type(p.args) === "undefined") {
        if (p.defaults) {
            if (p.debug) {
                util.console.log("no args; returning defaults");
                util.console.groupEnd();
            }
            return jQuery.extend({}, p.defaults);
        } else {
            if (p.debug) {
                util.console.log("no args, no defaults; returning error");
                util.console.groupEnd();
            }
            return jQuery.extend({}, { __error: "missing function arguments (p.args) and no defaults were specified (p.defaults)" });
        }
    }

    if (p.debug) {
        util.console.info("p.args");
        util.console.log(p.args);
    }

    if (util.type(p.args[0]) === "object") {
        if (p.debug) {
            util.console.log("args[0] is an object; returning args[0]");
            util.console.groupEnd();
        }
        return jQuery.extend({}, p.defaults || {}, p.args[0]);
    }

    if (util.type(p.params) !== "array" || p.params.length === 0) {
        if (p.defaults) {
            if (p.debug) {
                util.console.log("missing params[]; returning defaults + __error");
                util.console.groupEnd();
            }
            return jQuery.extend({}, p.defaults, { __error: "missing or invalid parameter sets (p.params[])" });
        } else {
            if (p.debug) {
                util.console.log("missing params[], no defaults; returning __error");
                util.console.groupEnd();
            }
            return { __error: "missing or invalid parameter sets (p.params[])" };
        }
    }

    if (p.debug) {
        util.console.info("p.params");
        util.console.log(p.params);
    }

    if (p.defaults && util.type(p.defaults) !== "object") {
        if (p.debug) {
            util.console.log("defaults exists but not an object; returning __error");
            util.console.groupEnd();
        }
        return { __error: "invalid defaults (p.defaults must be {})" };
    }
    p.defaults = p.defaults || {};

    if (p.debug) {
        util.console.info("p.defaults");
        util.console.log(p.defaults);
    }

    var result, i, ptype, m,
		matches = p.params ? p.params.slice() : [];

    // Loop through each item in the arguments,
    // matching up the parameter set types along the way.
    for (i = 0; i < p.args.length; i++) {
        ptype = util.type(p.args[i]);

        for (j = 0; j < matches.length; j++) {
            if (matches[j] && (matches[j].length <= i || ptype !== matches[j][i].type)) {
                matches.splice(j--, 1);
                continue;
            }
        }

        if (matches.length === 0) {
            break;
        }
    }

    if (matches.length === 0) {
        if (p.debug) {
            util.console.log("no matching parameter sets were found; returning __error");
            util.console.groupEnd();
        }
        return { __error: "no matching parameter sets were found in p.params" };
    }

    // Build up the results
    result = jQuery.extend({}, p.defaults);

    if (matches[0] && matches[0].length) {
        for (i = 0; i < matches[0].length; i++) {
            m = matches[0][i];
            result[m.name] = p.args[i];
        }
    }

    if (p.debug) {
        util.console.log("found matching parameter set; returning result");
        util.console.groupEnd();
    }
    return result;
};

util.isAlpha = function(value)
{
    /// <summary>
    /// </summary>
    /// <param name="value" type="String"></param>

    var a, z, A, Z;
    var ch;

    a = 'a'.charCodeAt(0);
    z = 'z'.charCodeAt(0);
    A = 'A'.charCodeAt(0);
    Z = 'Z'.charCodeAt(0);

    for (var i = 0; i < value.length; i++) {
        ch = value[i].charCodeAt(0);
        if ((ch >= a && ch <= z) || (ch >= A && ch <= Z)) {
            continue;
        } else {
            return false;
        }
    }

    return true;
};

util.endsWith = function(str, pattern)
{
    /// <summary>
    /// Returns whether the specified string ends with pattern.
    /// </summary>
    /// <param name="str" type="string"></param>
    /// <param name="pattern" type="string"></param>

    return str.substr(str.length - pattern.length) === pattern;
};

