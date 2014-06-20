
// process an array of objects from a form to be a proper object
var process_form_results = function(raw_results)
{
    var results = {};
    $.each(raw_results, function(i, v)
    {
        var nym = v.name,
			val = v.value;
        if (results[nym] && results[nym] instanceof Array) {
            results[nym].push(val);
        } else if (results[nym]) {
            results[nym] = [results[nym], val];
        } else {
            results[nym] = val;
        }
    });
    return results;
};

var process_form = function(frm)
{
    var tasks = [];
    var locations = [];
    $('#location-task-list li', frm).each(function()
    {
        tasks.push($(this).text());
    });
    $('#tour-location-list li', frm).each(function()
    {
        locations.push($(this).get(0).id);
    });
    //    console.log("Raw results: ", tasks);
    var results = process_form_results($(frm).serializeArray());
    if (tasks.length > 0) {
        results.tasks = tasks.join(",");
    }
    if (locations.length > 0) {
        results.locations = locations.join(",");
    }
    console.log("Form results for ", frm, ": ", results);
    return results;
};

var now = function()
{
    return +new Date;
};

var dummy_image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAAB4CAIAAAC2BqGFAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBNYWNpbnRvc2giIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NTRDRjkxM0Q0NTkxMTFFMkJCQUVDRjRFNTE1QjQ0QzQiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6NTRDRjkxM0U0NTkxMTFFMkJCQUVDRjRFNTE1QjQ0QzQiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo1NENGOTEzQjQ1OTExMUUyQkJBRUNGNEU1MTVCNDRDNCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo1NENGOTEzQzQ1OTExMUUyQkJBRUNGNEU1MTVCNDRDNCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PufUyK0AAAEzSURBVHja7N0xCoMwFIBhLYLb29x6EO9/CE/QE3TIFEjFFqGr1SD2+5eM4oe8IUjSllIaHd8NAehL1b2XnHNKCcfuRcQX9Kw8TROX3RvH0egwo0ELNGiBBg1aoEELNGjQAg1azbofvaH70l9hPZZ80UaHQIMGLdCgBRo0aIEGLdCgr1VX7UnPpVO9/DAMfd9fEHrzZu5BRUQ1aKPDjAYt0KBBIwANWqBBgxZo0AINGrRAgxZo0KAFGrRAgwYt0KAFGjRogQYt0KBBCzRogQYNWqBBCzRo0Dq2esdIRMTZjkGudoZEbej1FkWjQ6BBCzRo0AINWqBBgxZo0AJ9mrZvk/5y55wvWqBBCzRo0AINWqBBgxZo0AIN+t9qSynzknNOKeHYvfVP5Q+0jA7QAn3CXgIMAMnZNAG/sW+aAAAAAElFTkSuQmCC";


function populate(frm, data)
{
    $(frm)[0].reset();
    $("#photo", frm).val('');
    $("#search-location-list-edit").empty(); // reset location list

    if (typeof data.photo !== "undefined") {
        $('#photo-preview', frm).attr('src', data.photo);
        $("#photo", frm).val(data.photo);
    }

    if (data.tasks) {
        console.log("Filling tasks for ", frm);
        $('.tasks', frm).empty();  // make sure the list isn't filled with stuff from prior use
        jQuery.each(data.tasks, function(nym, val)
        {
            add_one_task(nym, val, frm);
        });
        $('#location-task-list', frm).listview().listview('refresh');
    }

    if (data.locations) {
        console.log("Filling locations for ", frm);
        $('#tour-location-list', frm).empty();  // make sure the list isn't filled with stuff from prior use
        jQuery.each(data.locations, function(nym, val)
        {
            add_one_location(nym, val, frm);
        });
    }

    if (!Gtour.tags_updating) {
        if (data.tags) {
            $('#tag').html(data.tags.slice(-1)[0]);
        } else {
            $('#tag').html('no tag assigned');
        }
    }

    $.each(data, function(key, value)
    {
        var $ctrl = $('[name=' + key + ']', frm);
        //      console.log("Seeing "+ $ctrl.attr("type") + " ## " + key + " ## " + $ctrl.prop("type"));
        switch ($ctrl.prop("type")) {
            case "text":
            case "range":
            case "number":
            case "hidden":
            case "textarea": $ctrl.val(value);
                break;
            case "radio":
            case "checkbox": $ctrl.each(function() { if ($(this).attr('value') == value) { $(this).attr("checked", value); } });
                break;
        }
    });
}

// populates a profile form for a given type of user.
function populate_profile_form(ptype)
{
    console.log("Populating profile form for a ", ptype);
    $("#" + ptype + "-profile-name").val(Gtour.user.name);
    $("#" + ptype + "-profile-email").val(Gtour.user.email);
    $("#" + ptype + "-profile-phone").val(Gtour.user.phone);

    return true;
}

function add_one_task(tid, name, frm)
{
    // task ID may be superfolous with new list struct...
    var task_id = "task_" + tid;
    // console.log("Appending task for task id: " + task_id);
    $('#location-task-list:eq(0)', frm).append('<li><a href="#" id="' +
					      task_id +
					      '">' +
					      name +
					      '</a><a class="location-delete-task" id="' +
					      task_id +
					      '"></a></li>');

    $('#location-task-list', frm).listview('refresh');
    $('.new-task:eq(0)', frm).val('');
}


function add_one_location(index, obj, frm)
{
    // location ID may be superfolous with new list struct...
    var location_id = "location_" + obj.id;
    console.log("Appending location for location id: " + location_id, obj, frm);

    var location_item = snippets.location_item_template({ id: obj.id, name: obj.name });
    $('#tour-location-list:eq(0)', frm).append(location_item);
    $('#tour-location-list', frm).listview('refresh');
    $('.new-location:eq(0)', frm).val('');
}


// get query string from hash part
function getQueryVariables(hash)
{
    var query = hash.replace(/^#.*\?/, "");
    //  console.log("Query: ", query);
    var vars = query.split('&'),
        result = {};
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        result[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
    }
    return result;
}

function getQueryVariableByName(name)
{
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(window.location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function check_directive(name, response, dname)
{
    var directive = response.directives[0];
    var status = true;
    if (typeof directive !== "undefined" &&
       directive.name == dname
      ) {
        Gtour.log(name + " updated");
    } else {
        console.error(name + " not updated. Unexpected directive ", response);
        status = false;
    }
    return status;
}


/*
 * Binary Ajax 0.1.10
 * Copyright (c) 2008 Jacob Seidelin, jseidelin@nihilogic.dk, http://blog.nihilogic.dk/
 * Licensed under the MPL License [http://www.nihilogic.dk/licenses/mpl-license.txt]
 */
var BinaryFile = function(e, t, n) { var r = e; var i = t || 0; var s = 0; this.getRawData = function() { return r }; if (typeof e == "string") { s = n || r.length; this.getByteAt = function(e) { return r.charCodeAt(e + i) & 255 }; this.getBytesAt = function(e, t) { var n = []; for (var s = 0; s < t; s++) { n[s] = r.charCodeAt(e + s + i) & 255 } return n } } else if (typeof e == "unknown") { s = n || IEBinary_getLength(r); this.getByteAt = function(e) { return IEBinary_getByteAt(r, e + i) }; this.getBytesAt = function(e, t) { return (new VBArray(IEBinary_getBytesAt(r, e + i, t))).toArray() } } this.getLength = function() { return s }; this.getSByteAt = function(e) { var t = this.getByteAt(e); if (t > 127) return t - 256; else return t }; this.getShortAt = function(e, t) { var n = t ? (this.getByteAt(e) << 8) + this.getByteAt(e + 1) : (this.getByteAt(e + 1) << 8) + this.getByteAt(e); if (n < 0) n += 65536; return n }; this.getSShortAt = function(e, t) { var n = this.getShortAt(e, t); if (n > 32767) return n - 65536; else return n }; this.getLongAt = function(e, t) { var n = this.getByteAt(e), r = this.getByteAt(e + 1), i = this.getByteAt(e + 2), s = this.getByteAt(e + 3); var o = t ? (((n << 8) + r << 8) + i << 8) + s : (((s << 8) + i << 8) + r << 8) + n; if (o < 0) o += 4294967296; return o }; this.getSLongAt = function(e, t) { var n = this.getLongAt(e, t); if (n > 2147483647) return n - 4294967296; else return n }; this.getStringAt = function(e, t) { var n = []; var r = this.getBytesAt(e, t); for (var i = 0; i < t; i++) { n[i] = String.fromCharCode(r[i]) } return n.join("") }; this.getCharAt = function(e) { return String.fromCharCode(this.getByteAt(e)) }; this.toBase64 = function() { return window.btoa(r) }; this.fromBase64 = function(e) { r = window.atob(e) } }; var BinaryAjax = function() { function e() { var e = null; if (window.ActiveXObject) { e = new ActiveXObject("Microsoft.XMLHTTP") } else if (window.XMLHttpRequest) { e = new XMLHttpRequest } return e } function t(t, n, r) { var i = e(); if (i) { if (n) { if (typeof i.onload != "undefined") { i.onload = function() { if (i.status == "200") { n(this) } else { if (r) r() } i = null } } else { i.onreadystatechange = function() { if (i.readyState == 4) { if (i.status == "200") { n(this) } else { if (r) r() } i = null } } } } i.open("HEAD", t, true); i.send(null) } else { if (r) r() } } function n(t, n, r, i, s, o) { var u = e(); if (u) { var a = 0; if (i && !s) { a = i[0] } var f = 0; if (i) { f = i[1] - i[0] + 1 } if (n) { if (typeof u.onload != "undefined") { u.onload = function() { if (u.status == "200" || u.status == "206" || u.status == "0") { u.binaryResponse = new BinaryFile(u.responseText, a, f); u.fileSize = o || u.getResponseHeader("Content-Length"); n(u) } else { if (r) r() } u = null } } else { u.onreadystatechange = function() { if (u.readyState == 4) { if (u.status == "200" || u.status == "206" || u.status == "0") { var e = { status: u.status, binaryResponse: new BinaryFile(typeof u.responseBody == "unknown" ? u.responseBody : u.responseText, a, f), fileSize: o || u.getResponseHeader("Content-Length") }; n(e) } else { if (r) r() } u = null } } } } u.open("GET", t, true); if (u.overrideMimeType) u.overrideMimeType("text/plain; charset=x-user-defined"); if (i && s) { u.setRequestHeader("Range", "bytes=" + i[0] + "-" + i[1]) } u.setRequestHeader("If-Modified-Since", "Sat, 1 Jan 1970 00:00:00 GMT"); u.send(null) } else { if (r) r() } } return function(e, r, i, s) { if (s) { t(e, function(t) { var o = parseInt(t.getResponseHeader("Content-Length"), 10); var u = t.getResponseHeader("Accept-Ranges"); var a, f; a = s[0]; if (s[0] < 0) a += o; f = a + s[1] - 1; n(e, r, i, [a, f], u == "bytes", o) }) } else { n(e, r, i) } } }(); document.write("<script type='text/vbscript'>\r\n" + "Function IEBinary_getByteAt(strBinary, iOffset)\r\n" + "	IEBinary_getByteAt = AscB(MidB(strBinary, iOffset + 1, 1))\r\n" + "End Function\r\n" + "Function IEBinary_getBytesAt(strBinary, iOffset, iLength)\r\n" + "  Dim aBytes()\r\n" + "  ReDim aBytes(iLength - 1)\r\n" + "  For i = 0 To iLength - 1\r\n" + "   aBytes(i) = IEBinary_getByteAt(strBinary, iOffset + i)\r\n" + "  Next\r\n" + "  IEBinary_getBytesAt = aBytes\r\n" + "End Function\r\n" + "Function IEBinary_getLength(strBinary)\r\n" + "	IEBinary_getLength = LenB(strBinary)\r\n" + "End Function\r\n" + "</script>\r\n");

/*
 * Javascript EXIF Reader 0.1.6
 * Copyright (c) 2008 Jacob Seidelin, jseidelin@nihilogic.dk, http://blog.nihilogic.dk/
 * Licensed under the MPL License [http://www.nihilogic.dk/licenses/mpl-license.txt]
 */
var EXIF = function() { function s(e, t, n) { if (e.addEventListener) { e.addEventListener(t, n, false) } else if (e.attachEvent) { e.attachEvent("on" + t, n) } } function o(e) { return !!e.exifdata } function u(e, t) { BinaryAjax(e.src, function(n) { var r = a(n.binaryResponse); e.exifdata = r || {}; if (t) { t.call(e) } }) } function a(t) { if (t.getByteAt(0) != 255 || t.getByteAt(1) != 216) { return false } var n = 2, r = t.getLength(), i; while (n < r) { if (t.getByteAt(n) != 255) { if (e) console.log("Not a valid marker at offset " + n + ", found: " + t.getByteAt(n)); return false } i = t.getByteAt(n + 1); if (i == 22400) { if (e) console.log("Found 0xFFE1 marker"); return c(t, n + 4, t.getShortAt(n + 2, true) - 2) } else if (i == 225) { if (e) console.log("Found 0xFFE1 marker"); return c(t, n + 4, t.getShortAt(n + 2, true) - 2) } else { n += 2 + t.getShortAt(n + 2, true) } } } function f(t, n, r, i, s) { var o = t.getShortAt(r, s), u = {}, a, f, c; for (c = 0; c < o; c++) { a = r + c * 12 + 2; f = i[t.getShortAt(a, s)]; if (!f && e) console.log("Unknown tag: " + t.getShortAt(a, s)); u[f] = l(t, a, n, r, s) } return u } function l(e, t, n, r, i) { var s = e.getShortAt(t + 2, i), o = e.getLongAt(t + 4, i), u = e.getLongAt(t + 8, i) + n, a, f, l, c, h, p; switch (s) { case 1: case 7: if (o == 1) { return e.getByteAt(t + 8, i) } else { a = o > 4 ? u : t + 8; f = []; for (c = 0; c < o; c++) { f[c] = e.getByteAt(a + c) } return f }; case 2: a = o > 4 ? u : t + 8; return e.getStringAt(a, o - 1); case 3: if (o == 1) { return e.getShortAt(t + 8, i) } else { a = o > 2 ? u : t + 8; f = []; for (c = 0; c < o; c++) { f[c] = e.getShortAt(a + 2 * c, i) } return f }; case 4: if (o == 1) { return e.getLongAt(t + 8, i) } else { f = []; for (var c = 0; c < o; c++) { f[c] = e.getLongAt(u + 4 * c, i) } return f }; case 5: if (o == 1) { h = e.getLongAt(u, i); p = e.getLongAt(u + 4, i); l = new Number(h / p); l.numerator = h; l.denominator = p; return l } else { f = []; for (c = 0; c < o; c++) { h = e.getLongAt(u + 8 * c, i); p = e.getLongAt(u + 4 + 8 * c, i); f[c] = new Number(h / p); f[c].numerator = h; f[c].denominator = p } return f }; case 9: if (o == 1) { return e.getSLongAt(t + 8, i) } else { f = []; for (c = 0; c < o; c++) { f[c] = e.getSLongAt(u + 4 * c, i) } return f }; case 10: if (o == 1) { return e.getSLongAt(u, i) / e.getSLongAt(u + 4, i) } else { f = []; for (c = 0; c < o; c++) { f[c] = e.getSLongAt(u + 8 * c, i) / e.getSLongAt(u + 4 + 8 * c, i) } return f } } } function c(s, o) { if (s.getStringAt(o, 4) != "Exif") { if (e) console.log("Not valid EXIF data! " + s.getStringAt(o, 4)); return false } var u, a, l, c, h, p = o + 6; if (s.getShortAt(p) == 18761) { u = false } else if (s.getShortAt(p) == 19789) { u = true } else { if (e) console.log("Not valid TIFF data! (no 0x4949 or 0x4D4D)"); return false } if (s.getShortAt(p + 2, u) != 42) { if (e) console.log("Not valid TIFF data! (no 0x002A)"); return false } if (s.getLongAt(p + 4, u) != 8) { if (e) console.log("Not valid TIFF data! (First offset not 8)", s.getShortAt(p + 4, u)); return false } a = f(s, p, p + 8, n, u); if (a.ExifIFDPointer) { c = f(s, p, p + a.ExifIFDPointer, t, u); for (l in c) { switch (l) { case "LightSource": case "Flash": case "MeteringMode": case "ExposureProgram": case "SensingMethod": case "SceneCaptureType": case "SceneType": case "CustomRendered": case "WhiteBalance": case "GainControl": case "Contrast": case "Saturation": case "Sharpness": case "SubjectDistanceRange": case "FileSource": c[l] = i[l][c[l]]; break; case "ExifVersion": case "FlashpixVersion": c[l] = String.fromCharCode(c[l][0], c[l][1], c[l][2], c[l][3]); break; case "ComponentsConfiguration": c[l] = i.Components[c[l][0]] + i.Components[c[l][1]] + i.Components[c[l][2]] + i.Components[c[l][3]]; break } a[l] = c[l] } } if (a.GPSInfoIFDPointer) { h = f(s, p, p + a.GPSInfoIFDPointer, r, u); for (l in h) { switch (l) { case "GPSVersionID": h[l] = h[l][0] + "." + h[l][1] + "." + h[l][2] + "." + h[l][3]; break } a[l] = h[l] } } return a } function h(e, t) { if (!e.complete) return false; if (!o(e)) { u(e, t) } else { if (t) { t.call(e) } } return true } function p(e, t) { if (!o(e)) return; return e.exifdata[t] } function d(e) { if (!o(e)) return {}; var t, n = e.exifdata, r = {}; for (t in n) { if (n.hasOwnProperty(t)) { r[t] = n[t] } } return r } function v(e) { if (!o(e)) return ""; var t, n = e.exifdata, r = ""; for (t in n) { if (n.hasOwnProperty(t)) { if (typeof n[t] == "object") { if (n[t] instanceof Number) { r += t + " : " + n[t] + " [" + n[t].numerator + "/" + n[t].denominator + "]\r\n" } else { r += t + " : [" + n[t].length + " values]\r\n" } } else { r += t + " : " + n[t] + "\r\n" } } } return r } function m(e) { return a(e) } var e = false; var t = { 36864: "ExifVersion", 40960: "FlashpixVersion", 40961: "ColorSpace", 40962: "PixelXDimension", 40963: "PixelYDimension", 37121: "ComponentsConfiguration", 37122: "CompressedBitsPerPixel", 37500: "MakerNote", 37510: "UserComment", 40964: "RelatedSoundFile", 36867: "DateTimeOriginal", 36868: "DateTimeDigitized", 37520: "SubsecTime", 37521: "SubsecTimeOriginal", 37522: "SubsecTimeDigitized", 33434: "ExposureTime", 33437: "FNumber", 34850: "ExposureProgram", 34852: "SpectralSensitivity", 34855: "ISOSpeedRatings", 34856: "OECF", 37377: "ShutterSpeedValue", 37378: "ApertureValue", 37379: "BrightnessValue", 37380: "ExposureBias", 37381: "MaxApertureValue", 37382: "SubjectDistance", 37383: "MeteringMode", 37384: "LightSource", 37385: "Flash", 37396: "SubjectArea", 37386: "FocalLength", 41483: "FlashEnergy", 41484: "SpatialFrequencyResponse", 41486: "FocalPlaneXResolution", 41487: "FocalPlaneYResolution", 41488: "FocalPlaneResolutionUnit", 41492: "SubjectLocation", 41493: "ExposureIndex", 41495: "SensingMethod", 41728: "FileSource", 41729: "SceneType", 41730: "CFAPattern", 41985: "CustomRendered", 41986: "ExposureMode", 41987: "WhiteBalance", 41988: "DigitalZoomRation", 41989: "FocalLengthIn35mmFilm", 41990: "SceneCaptureType", 41991: "GainControl", 41992: "Contrast", 41993: "Saturation", 41994: "Sharpness", 41995: "DeviceSettingDescription", 41996: "SubjectDistanceRange", 40965: "InteroperabilityIFDPointer", 42016: "ImageUniqueID" }; var n = { 256: "ImageWidth", 257: "ImageHeight", 34665: "ExifIFDPointer", 34853: "GPSInfoIFDPointer", 40965: "InteroperabilityIFDPointer", 258: "BitsPerSample", 259: "Compression", 262: "PhotometricInterpretation", 274: "Orientation", 277: "SamplesPerPixel", 284: "PlanarConfiguration", 530: "YCbCrSubSampling", 531: "YCbCrPositioning", 282: "XResolution", 283: "YResolution", 296: "ResolutionUnit", 273: "StripOffsets", 278: "RowsPerStrip", 279: "StripByteCounts", 513: "JPEGInterchangeFormat", 514: "JPEGInterchangeFormatLength", 301: "TransferFunction", 318: "WhitePoint", 319: "PrimaryChromaticities", 529: "YCbCrCoefficients", 532: "ReferenceBlackWhite", 306: "DateTime", 270: "ImageDescription", 271: "Make", 272: "Model", 305: "Software", 315: "Artist", 33432: "Copyright" }; var r = { 0: "GPSVersionID", 1: "GPSLatitudeRef", 2: "GPSLatitude", 3: "GPSLongitudeRef", 4: "GPSLongitude", 5: "GPSAltitudeRef", 6: "GPSAltitude", 7: "GPSTimeStamp", 8: "GPSSatellites", 9: "GPSStatus", 10: "GPSMeasureMode", 11: "GPSDOP", 12: "GPSSpeedRef", 13: "GPSSpeed", 14: "GPSTrackRef", 15: "GPSTrack", 16: "GPSImgDirectionRef", 17: "GPSImgDirection", 18: "GPSMapDatum", 19: "GPSDestLatitudeRef", 20: "GPSDestLatitude", 21: "GPSDestLongitudeRef", 22: "GPSDestLongitude", 23: "GPSDestBearingRef", 24: "GPSDestBearing", 25: "GPSDestDistanceRef", 26: "GPSDestDistance", 27: "GPSProcessingMethod", 28: "GPSAreaInformation", 29: "GPSDateStamp", 30: "GPSDifferential" }; var i = { ExposureProgram: { 0: "Not defined", 1: "Manual", 2: "Normal program", 3: "Aperture priority", 4: "Shutter priority", 5: "Creative program", 6: "Action program", 7: "Portrait mode", 8: "Landscape mode" }, MeteringMode: { 0: "Unknown", 1: "Average", 2: "CenterWeightedAverage", 3: "Spot", 4: "MultiSpot", 5: "Pattern", 6: "Partial", 255: "Other" }, LightSource: { 0: "Unknown", 1: "Daylight", 2: "Fluorescent", 3: "Tungsten (incandescent light)", 4: "Flash", 9: "Fine weather", 10: "Cloudy weather", 11: "Shade", 12: "Daylight fluorescent (D 5700 - 7100K)", 13: "Day white fluorescent (N 4600 - 5400K)", 14: "Cool white fluorescent (W 3900 - 4500K)", 15: "White fluorescent (WW 3200 - 3700K)", 17: "Standard light A", 18: "Standard light B", 19: "Standard light C", 20: "D55", 21: "D65", 22: "D75", 23: "D50", 24: "ISO studio tungsten", 255: "Other" }, Flash: { 0: "Flash did not fire", 1: "Flash fired", 5: "Strobe return light not detected", 7: "Strobe return light detected", 9: "Flash fired, compulsory flash mode", 13: "Flash fired, compulsory flash mode, return light not detected", 15: "Flash fired, compulsory flash mode, return light detected", 16: "Flash did not fire, compulsory flash mode", 24: "Flash did not fire, auto mode", 25: "Flash fired, auto mode", 29: "Flash fired, auto mode, return light not detected", 31: "Flash fired, auto mode, return light detected", 32: "No flash function", 65: "Flash fired, red-eye reduction mode", 69: "Flash fired, red-eye reduction mode, return light not detected", 71: "Flash fired, red-eye reduction mode, return light detected", 73: "Flash fired, compulsory flash mode, red-eye reduction mode", 77: "Flash fired, compulsory flash mode, red-eye reduction mode, return light not detected", 79: "Flash fired, compulsory flash mode, red-eye reduction mode, return light detected", 89: "Flash fired, auto mode, red-eye reduction mode", 93: "Flash fired, auto mode, return light not detected, red-eye reduction mode", 95: "Flash fired, auto mode, return light detected, red-eye reduction mode" }, SensingMethod: { 1: "Not defined", 2: "One-chip color area sensor", 3: "Two-chip color area sensor", 4: "Three-chip color area sensor", 5: "Color sequential area sensor", 7: "Trilinear sensor", 8: "Color sequential linear sensor" }, SceneCaptureType: { 0: "Standard", 1: "Landscape", 2: "Portrait", 3: "Night scene" }, SceneType: { 1: "Directly photographed" }, CustomRendered: { 0: "Normal process", 1: "Custom process" }, WhiteBalance: { 0: "Auto white balance", 1: "Manual white balance" }, GainControl: { 0: "None", 1: "Low gain up", 2: "High gain up", 3: "Low gain down", 4: "High gain down" }, Contrast: { 0: "Normal", 1: "Soft", 2: "Hard" }, Saturation: { 0: "Normal", 1: "Low saturation", 2: "High saturation" }, Sharpness: { 0: "Normal", 1: "Soft", 2: "Hard" }, SubjectDistanceRange: { 0: "Unknown", 1: "Macro", 2: "Close view", 3: "Distant view" }, FileSource: { 3: "DSC" }, Components: { 0: "", 1: "Y", 2: "Cb", 3: "Cr", 4: "R", 5: "G", 6: "B" } }; return { readFromBinaryFile: m, pretty: v, getTag: p, getAllTags: d, getData: h, Tags: t, TiffTags: n, GPSTags: r, StringValues: i } }();


/*
*
* canvasResize
*
* Version: 1.0.0
* Date (d/m/y): 02/10/12
* Original author: @gokercebeci
* Licensed under the MIT license
*/
(function(q) { function m(a, b) { this.file = a; this.options = h.extend({}, n, b); this._defaults = n; this._name = p; this.init() } var p = "canvasResize", h = { newsize: function(a, b, c, e, d) { if (c && a > c || e && b > e) b = a / b, (1 <= b || 0 == e) && c && !d ? (a = c, b = c / b >> 0) : d && b <= c / e ? (a = c, b = c / b >> 0) : (a = e * b >> 0, b = e); return { width: a, height: b } }, dataURLtoBlob: function(a) { var b = a.split(",")[0].split(":")[1].split(";")[0], c = atob(a.split(",")[1]); a = new ArrayBuffer(c.length); for (var e = new Uint8Array(a), d = 0; d < c.length; d++) e[d] = c.charCodeAt(d); return (c = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder) ? (c = new (window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder), c.append(a), c.getBlob(b)) : c = new Blob([a], { type: b }) }, detectSubsampling: function(a) { var b = a.width; if (1048576 < b * a.height) { var c = document.createElement("canvas"); c.width = c.height = 1; c = c.getContext("2d"); c.drawImage(a, -b + 1, 0); return 0 === c.getImageData(0, 0, 1, 1).data[3] } return !1 }, transformCoordinate: function(a, b, c, e) { switch (e) { case 5: case 6: case 7: case 8: a.width = c; a.height = b; break; default: a.width = b, a.height = c } a = a.getContext("2d"); switch (e) { case 2: a.translate(b, 0); a.scale(-1, 1); break; case 3: a.translate(b, c); a.rotate(Math.PI); break; case 4: a.translate(0, c); a.scale(1, -1); break; case 5: a.rotate(0.5 * Math.PI); a.scale(1, -1); break; case 6: a.rotate(0.5 * Math.PI); a.translate(0, -c); break; case 7: a.rotate(0.5 * Math.PI); a.translate(b, -c); a.scale(-1, 1); break; case 8: a.rotate(-0.5 * Math.PI), a.translate(-b, 0) } }, detectVerticalSquash: function(a, b, c) { b = document.createElement("canvas"); b.width = 1; b.height = c; b = b.getContext("2d"); b.drawImage(a, 0, 0); a = b.getImageData(0, 0, 1, c).data; b = 0; for (var e = c, d = c; d > b;) 0 === a[4 * (d - 1) + 3] ? e = d : b = d, d = e + b >> 1; c = d / c; 0 === c && (c = 1); return c }, callback: function(a) { return a }, extend: function() { var a = arguments[0] || {}, b = 1, c = arguments.length, e = !1; a.constructor == Boolean && (e = a, a = arguments[1] || {}); 1 == c && (a = this, b = 0); for (var d; b < c; b++) if (null != (d = arguments[b])) for (var g in d) a != d[g] && (e && "object" == typeof d[g] && a[g] ? h.extend(a[g], d[g]) : void 0 != d[g] && (a[g] = d[g])); return a } }, n = { width: 300, height: 0, crop: !1, quality: 80, callback: h.callback }; m.prototype = { init: function() { var a = this, b = this.file, c = new FileReader; c.onloadend = function(b) { b = b.target.result; var c = atob(b.split(",")[1]), c = new BinaryFile(c, 0, c.length), g = EXIF.readFromBinaryFile(c), f = new Image; f.onload = function() { var b = g.Orientation, c = 5 <= b && 8 >= b ? h.newsize(f.height, f.width, a.options.width, a.options.height, a.options.crop) : h.newsize(f.width, f.height, a.options.width, a.options.height, a.options.crop), d = f.width, e = f.height, l = c.width, c = c.height, r = document.createElement("canvas"), s = r.getContext("2d"); s.save(); h.transformCoordinate(r, l, c, b); h.detectSubsampling(f) && (d /= 2, e /= 2); b = document.createElement("canvas"); b.width = b.height = 1024; for (var m = b.getContext("2d"), n = h.detectVerticalSquash(f, d, e), j = 0; j < e;) { for (var p = j + 1024 > e ? e - j : 1024, k = 0; k < d;) { var t = k + 1024 > d ? d - k : 1024; m.clearRect(0, 0, 1024, 1024); m.drawImage(f, -k, -j); var q = Math.floor(k * l / d), u = Math.ceil(t * l / d), v = Math.floor(j * c / e / n), w = Math.ceil(p * c / e / n); s.drawImage(b, 0, 0, t, p, q, v, u, w); k += 1024 } j += 1024 } s.restore(); d = document.createElement("canvas"); d.width = l; d.height = c; newctx = d.getContext("2d"); newctx.drawImage(r, 0, 0, l, c); d = d.toDataURL("image/jpeg", 0.01 * a.options.quality); a.options.callback(d, l, c) }; f.src = b }; c.readAsDataURL(b) } }; q[p] = function(a, b) { if ("string" == typeof a) return h[a](b); new m(a, b) } })(jQuery);


;;
