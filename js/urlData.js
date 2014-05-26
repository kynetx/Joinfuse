/*!
	Created 2008-2013 @wasatchwizard (thewizard@wasatchwizard.com)
	Released under the MIT License.
*/

var urlData;

var __isArray = function(value)
{
    return Object.prototype.toString.call(value) === "[object Array]" || (value.push && value.pop && value.join);
};

var UrlData = function()
{
    /* built-in properties */

    this.tourid = function(value)
    {
        if (typeof value !== "undefined") {
            urlData._tourid = value;
        }
        return urlData._tourid;
    };
    this._tourid = "";

    //this.filter = function(value) {
    //	if (value) {
    //		return urlData.filters(value.split(UrlData.SEPARATOR)).join(UrlData.SEPARATOR);
    //	}
    //	var f = urlData.filters();
    //	if (Object.prototype.toString.call(f) === "[object Array]" && (f.push && f.pop && f.join) && f.length > 0) {
    //		return f.join(UrlData.SEPARATOR);
    //	} else {
    //		return "";
    //	}
    //};
    //this.filters = function() {
    //	var i, a, t;
    //	if (arguments.length > 0) {
    //		urlData._filters = [];
    //		for (i = 0; i < arguments.length; i++) {
    //			a = arguments[i];
    //			t = typeof (a);
    //			// Yes, I am testing the string value of 'a' against the _string_ value "undefined"..
    //			if (t !== "undefined" && t !== "function" && a !== null && a !== "undefined") {
    //				if (__isArray(a)) {
    //					for (j = 0; j < a.length; j++) {
    //						urlData._filters.push(a[j]);
    //					}
    //				} else {
    //					urlData._filters.push(a);
    //				}
    //			}
    //		}
    //	}
    //	return urlData._filters;
    //};
    //this._filters = [];

    /* functions */

    this.init = function()
    {
        var qs, q, qLower, name, val, t,
		    qstring = "",
		    query = {},
		    found = false;

        // Get all of the name/value pairs from the url.
        if (arguments.length > 0 && typeof arguments[0] === "string") {
            qstring = arguments[0];
        } else if (document.location.search.length > 1) {
            qstring = document.location.search;
        }

        if (qstring.length > 0) {
            qs = qstring.substr(1).split("&");
            for (q = 0; q < qs.length; q++) {
                pos = qs[q].indexOf("=");
                if (pos > -1) {
                    name = qs[q].substr(0, pos);
                    val = qs[q].substr(pos + 1);
                    query[name] = decodeURIComponent(val);
                } else {
                    query[qs[q]] = "";
                }
            }
        }

        // First, clear out all of the member variables.
        this.clear();

        // Are any items from the querystring in the urlData object?
        // If not, add them automagically..
        // NOTE: I am doing this manually, because I am ignoring
        // the case while comparing the names.
        // So, Filter on the url is assigned to urlData.filter, etc..
        for (q in query) {
            qLower = q.toLowerCase();
            found = false;
            for (a in urlData) {
                if (qLower === a.toLowerCase()) {
                    urlData.attr(a, query[q]);
                    found = true;
                    break;
                } else {
                    // TODO Hack this so that the old variable names (sel, act, etc.)
                    //      will be dumped into the correct property..
                }
            }
            if (!found) {
                urlData.attr(q, query[q]);
            }
        }
    };

    // urlData.clear() clears all values (does not remove any properties).
    // urlData.clear("attr") sets the member variable to undefined (does not touch the properties).
    this.clear = function()
    {
        var a, t, i;

        if (arguments.length == 0) {
            for (a in urlData) {
                if (a.length > 0 && a[0] === "_") {
                    t = typeof urlData[a];
                    if (t == "function") {
                        continue;
                    }
                    if (t === "object") {
                        urlData[a] = {};
                    } else if (__isArray(urlData[a])) {
                        urlData[a] = [];
                    } else if (t === "boolean") {
                        urlData[a] = false;
                    } else if (t === "number") {
                        urlData[a] = 0;
                    } else if (t === "string") {
                        urlData[a] = "";
                    } else {
                        util.console.log(["urlData.clear()", "unknown type", a, t, urlData[a]]);
                        urlData[a] = "";
                    }
                }
            }
        } else {
            //for (i = 0; i < arguments.length; i++) {
            //	urlData["_" + arguments[i]] = undefined;
            //}
        }
    };

    this.copy = function()
    {
        var id,
		    c = {};

        for (id in urlData) {
            c[id] = urlData[id];
        }

        return c;
    };

    this.props = function()
    {
        var id, newId,
		    c = {};

        for (id in urlData) {
            if (typeof urlData[id] !== "function") {
                if (id[0] == "_") {
                    newId = id.substring(1);
                } else {
                    newId = id;
                }
                c[newId] = urlData[id];
            }
        }

        return c;
    };

    this.attr = function(property, value)
    {
        /// <summary>
        /// Gets and sets the value for the specified property.
        /// </summary>

        if (typeof property === "undefined") {
            throw "property is required for urlData.attr()";
        }
        if (typeof value !== "undefined") {
            if (typeof urlData[property] !== "function") {
                urlData[property] = function(value)
                {
                    if (typeof value !== "undefined") {
                        urlData["_" + property] = value;
                    }
                    return urlData["_" + property];
                };
            }
            //urlData["_" + property] = value;
            return urlData[property](value);
        }
        //return urlData["_" + property];
        if (typeof urlData[property] === "function") {
            return urlData[property]();
        } else {
            return "";
        }
    };

    this.toQueryString = function(params)
    {
        /// <summary>
        /// Returns a string of all the current page (possibly an iframe) is
        /// loaded within a popup window or not.
        /// </summary>

        var a, p, t,
		    url = params.root || "";

        // Put all values from 'this' into the url querystring.
        for (a in urlData) {
            if (a.length > 0 && a[0] === "_") {
                // TODO what about dumping an Array on the url?
                url = Url.update(url, a.substr(1), urlData[a]);
            }
        }

        // Overwrite values from any that were passed in.
        for (p in params) {
            if (p !== "" && p !== "root") {
                // TODO what about dumping an Array on the url?
                url = Url.update(url, p, params[p]);
            }
        }

        return url;
    };

    //this.hasFilter = function(filter) {
    //	var i, f, filters;
    //	if (!filter || filter === "") {
    //		return false;
    //	}
    //	filters = urlData.filters();
    //	for (i = 0; i < filters.length; i++) {
    //		f = filters[i];
    //		if (f && f === filter) {
    //			return true;
    //		}
    //	}
    //	return false;
    //};
};

UrlData.SEPARATOR = "|{SEP}|";

// The urlData is mocking an inheritance model.
// Do not change the name of the 'urlData' variable!
urlData = new UrlData();
urlData.init();
