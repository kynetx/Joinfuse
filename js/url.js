/*!
	Created 2006-2013 @wasatchwizard (thewizard@wasatchwizard.com)
	Released under the MIT License.
*/

function Url(url)
{
    this.parse = function(url)
    {
        /// <summary>
        /// Parses the specified string <paramref name="url"/> and stores its values in the current object.
        /// </summary>
        /// <param name="url" type="String">The url to parse.</param>

        if (util.type(url) === "url") {
            url = url.toString();
        }

        var i, pos, vals, len, pair;

        this.originalUrl = url;
        this.href = url;
        this.protocol = "";
        this.host = "";
        this.path = "";
        this.file = "";
        this.extension = "";
        this.query = "";
        this.qs = {};
        this.length = 0;
        this.hash = "";

        // Trim the hash off the url
        pos = url.lastIndexOf("#");
        if (pos > -1) {
            this.hash = url.substring(pos + 1);
            url = url.substring(0, pos);
        }

        // Trim the querystring off the url
        pos = url.indexOf('?');
        if (pos > -1) {
            this.query = url.substring(pos + 1);
            url = util.trim(url.substring(0, pos));
        }

        if (url !== "") {
            pos = url.indexOf(':');
            if (pos > -1) {
                this.protocol = url.substring(0, pos);
                url = util.trim(url.substring(pos + 1));
                while (url.charAt(0) === "/" || url.charAt(0) === "\\") {
                    url = url.substring(1);
                }
                pos = url.indexOf('/');
                if (pos > -1) {
                    this.host = url.substring(0, pos);
                    url = url.substring(pos);
                }
            } else {
                this.protocol = "";
                this.host = "";
                // If there isn't a colon, assume that there is no protocol, nor host..
            }
            pos = url.lastIndexOf('/');
            if (pos > -1) {
                this.path = url.substring(0, pos);
                url = url.substring(pos + 1);
            }
            if (url !== "") {
                this.file = url;
                pos = url.lastIndexOf('.');
                if (pos > -1) {
                    this.extension = url.substring(pos);
                }
            }
        }

        vals = this.query.split('&');
        len = 0;
        for (i = 0; i < vals.length; i++) {
            pair = vals[i].split('=');
            if (pair[0] !== "") {
                this.qs[pair[0]] = decodeURIComponent(pair[1]);
                len++;
            }
        }
        this.length = len;
    };

    this.reload = function()
    {
        /// <summary>
        /// Updates the Url object's __t property.
        /// This value is used in addresses to ensure a unique version of the page is retreived.
        /// </summary>

        this.qs.__t = Math.floor(Math.random() * 1000000);
        return this;
    };

    this.update = function(key, value)
    {
        /// <summary>
        /// Updates the querystring value specified in <paramref name="key"/> with <paramref name="value"/>.
        /// </summary>
        /// <param name="key" type="String"></param>
        /// <param name="value" type="Object"></param>

        this.qs[key] = value;
        return this;
    };

    this.apply = function(params)
    {
        /// <summary>
        /// Applies all items of <paramref name="params"/> into the Url's querystring.
        /// Only simple values are supported, and no nesting.
        /// </summary>
        /// <param name="params" type="Object"></param>
        var t, name, qsName;

        if (typeof params !== "undefined") {
            for (name in params) {
                t = util.type(params[name]);
                if (name && name.length > 0 && t !== "function" && t !== "object" && params[name]) {
                    qsName = (name[0] === "_") ? name.substring(1) : name; // Hack..
                    // NOTE we do not encode/escape values that are stored in the Url object.
                    //      those values must be encoded/escaped whenever used in output.
                    this.qs[qsName] = params[name];
                }
            }
        }
        return this;
    };

    this.getHash = function()
    {
        /// <summary>
        /// Returns the has portion of the url, starting with '#'.
        /// </summary>

        return this.hash;
    };

    this.getQueryString = function()
    {
        /// <summary>
        /// Returns the querystring portion of the url, starting with '?'.
        /// This does not include a trailing #hash.
        /// </summary>

        var x, str = "";
        for (x in this.qs) {
            if (str !== "") {
                str += '&';
            }
            str += encodeURIComponent(x) + '=' + encodeURIComponent(this.qs[x]);
        }
        return '?' + str.replace(/%3c/g, '%253c');
    };

    this.getFile = function()
    {
        /// <summary>
        /// Returns the file name portion of the url, does NOT start with '/'.
        /// Examples: Default.aspx, index.html, etc.
        /// </summary>

        return this.file;
    };

    this.getFileExtension = function()
    {
        /// <summary>
        /// Returns only the file's extension.
        /// Examples: .aspx, .html, etc.
        /// </summary>

        var i = this.file.lastIndexOf('.');
        if (i > -1) {
            return this.file.substring(i);
        } else {
            return this.file;
        }
    };

    this.getPath = function()
    {
        /// <summary>
        /// Returns the path and file portion of the url, starting with '/'.
        /// </summary>

        return this.path + '/' + this.file;
    };

    this.getPathAndQuery = function()
    {
        /// <summary>
        /// Returns the path, file, and querystring portion of the url, starting with '/'.
        /// </summary>

        return this.getPath() + this.getQueryString();
    };

    this.getUrlWithoutQueryString = function()
    {
        /// <summary>
        /// Returns the url without the querystring, (without a trailing '?').
        /// </summary>

        return this.protocol + '://' + (this.protocol === 'file' ? '/' : "") + this.host + this.getPath();
    };

    this.getType = function()
    {
        /// <summary>
        /// Returns the type, 'url'.
        /// </summary>

        return "url";
    };

    this.toString = function()
    {
        /// <summary>
        /// Returns the full url as a String.
        /// </summary>

        var u;

        if (this.protocol) {
            u = this.protocol + "://";
            if (this.protocol === "file") {
                u += "/";
            }
        }
        if (this.host) {
            u += this.host;
        }
        if (this.path) {
            u += this.path;
        }
        if (this.file) {
            u += "/" + this.file;
        }
        if (this.getQueryString().length > 1) {
            u += this.getQueryString();
        }
        if (this.hash.length > 0) {
            u += "#" + this.hash;
        }

        return u;
    };

    // init
    if (!url) {
        url = window.location.href;
    }

    this.parse(url);
}

Url.create = function()
{
    /// <summary>
    /// Creates and returns a new (empty) Url object.
    /// </summary>

    return new Url("");
};

Url.reload = function(url)
{
    /// <summary>
    /// Returns the <paramref name="url"/> with a random number added to the 
    /// querystring to ensure getting a full page refresh.
    /// Use &lt;a href="javascript:alert(Url.reload(top.document.location.href));"&gt;reload url&lt;/a&gt; to test this method.
    /// </summary>
    /// <param name="url" type="Object"></param>

    if (url instanceof Url) {
        return url.reload();
    } else {
        if (util.type(url) === "undefined") {
            url = document.location.href;
        }
        return Url.update(url, "__t", Math.floor(Math.random() * 1000000));
    }
};

Url.update = function(url, key, value)
{
    /// <summary>
    /// Updates the querystring value specified in <paramref name="key"/> with <paramref name="value"/>.
    /// </summary>
    /// <param name="url" type="Object"></param>
    /// <param name="key" type="String"></param>
    /// <param name="value" type="Object"></param>

    if (!url) {
        return "";
    }
    if (!key) {
        return url;
    }

    if (url instanceof Url) {
        return url.update(key, value);
    } else {
        return new Url(url).update(key, value).toString();

        // all of this commented-out code works..
        // if (false) {
        //var t, v, pos, pos2, sep, startUrl, endUrl;

        //// Just in case..
        //if (key[key.length - 1] === '=') {
        //	key = key.substring(0, key.length - 1);
        //}

        //pos = url.indexOf("&" + key + "=");
        //if (pos === -1) {
        //	pos = url.indexOf("?" + key + "=");
        //}

        //// Prepare the value to be put onto the url.
        //v = undefined;

        //if (value !== "undefined" && typeof value !== "function") {
        //	t = typeof value;
        //	if (t === "object") {
        //		// TODO I'm not sure how best to handle putting
        //		//      an object into a querystring.
        //		v = value;
        //	} else if (util.isArray(value)) {
        //		if (value.length > 0) {
        //			v = value.join(UrlData.SEPARATOR);
        //		}
        //	} else {
        //		v = value;
        //	}
        //}

        //if (pos > -1) {
        //	// The key is already in the url,
        //	// it will be overwritten.

        //	pos++; // Skip the '&' or '?'.

        //	// Remove the 'key=' from the url.
        //	startUrl = url.substring(0, pos);
        //	endUrl = "";
        //	pos2 = url.indexOf('&', pos);

        //	if (pos2 > -1) {
        //		endUrl = url.substring(pos2);
        //	}

        //	if (typeof v !== "undefined" && v !== null) {
        //		url = startUrl + encodeURIComponent(key) + "=" + encodeURIComponent(v) + endUrl;
        //	} else {
        //		url = startUrl + endUrl;
        //	}
        //} else {
        //	// Append the key+v at the end of the url.
        //	if (typeof v !== "undefined" && v !== null) {
        //		if (url[url.length - 1] !== "?" && url[url.length - 1] !== "&") {
        //			sep = url.indexOf("?") > -1 ? "&" : "?";
        //		} else {
        //			sep = "";
        //		}
        //		url = url + sep + encodeURIComponent(key) + "=" + encodeURIComponent(v);
        //	}
        //}

        //return url;
        //}
    }
};

Url.apply = function(url, params)
{
    /// <summary>
    /// Applies all items of <paramref name="params"/> into the <paramref name="url"/>'s querystring.
    /// Only simple values are supported, and no nesting.
    /// </summary>
    /// <param name="url" type="Object"></param>
    /// <param name="params" type="Object"></param>

    if (url instanceof Url) {
        return url.apply(params);
    } else {
        return new Url(url).apply(params).toString();

        // all of this commented-out code works..
        // if (false) {
        //util.console.group("Url.apply()");
        //util.console.log(url, params);

        //var name, t;

        //url = url || "";
        //params = params || urlData;

        //// Add everything from params.
        //if (typeof params !== "undefined") {
        //	//util.console.group("name in params");
        //	for (name in params) {
        //		t = util.type(params[name]);
        //		if (name && name.length > 0 && t !== "function" && t !== "object" && params[name]) {
        //			//util.console.log(name, params[name]);
        //			name = (name[0] === "_") ? name.substring(1) : name; // Hack..
        //			url = Url.update(url, name, params[name]);
        //		}
        //	}
        //	//util.console.groupEnd();
        //}

        ////util.console.groupEnd();
        //return url;
        //}
    }
};

Url.parse = function(url)
{
    /// <summary>
    /// Returns an Object representing the <paramref name="url"/> passed in.
    /// </summary>
    /// <param name="url" type="Object"></param>
    /// <example>
    ///     var url = Url.parse("http://www.google.com/search?hl=en&q=my+search&btnG=Google+Search&aq=f&oq=");
    ///     util.console.log(url);
    ///     url.file === "search"
    ///     url.qs.length === 5
    ///     url.qs["hl"] === "en"
    ///     url.qs.q === "my search"
    ///     url.getQueryString() === "hl=en&q=my+search&btnG=Google+Search&aq=f&oq="
    /// <example>

    return new Url(url);
};

Url.toJSON = function(querystring)
{
    /// <summary>
    /// Parses and returns the specified string <paramref name="querystring"/> into an Object.
    /// </summary>
    /// <param name="querystring" type="Object"></param>

    if (url instanceof Url) {
        return url.apply(params);
    } else {
        var i, ar, sub,
			opts = {};

        if (typeof querystring === "string") {
            i = querystring.indexOf("?");
            if (i > -1) {
                querystring = querystring.substring(i) + 1;
            }

            ar = querystring.split("&");

            for (i = 0; i < ar.length; i++) {
                if (ar[i].length > 0) {
                    sub = ar[i].split("=");
                    if (sub.length === 2) {
                        opts[sub[0]] = sub[1];
                    }
                }
            }
        }

        return opts;
    }
};

