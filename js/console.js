/*!
	Created 2008-2013 @wasatchwizard (thewizard@wasatchwizard.com)
	Released under the MIT License.
*/

(function()
{
    //
    // Console extensions.
    //

    if (console) {
        console.__clear = (typeof console.clear === "function") ? console.clear : undefined;
        console.__debug = (typeof console.debug === "function") ? console.debug : undefined;
        console.__log = (typeof console.log === "function") ? console.log : undefined;
        console.__info = (typeof console.info === "function") ? console.info : undefined;
        console.__warn = (typeof console.warn === "function") ? console.warn : undefined;
        console.__error = (typeof console.error === "function") ? console.error : undefined;
        console.__group = (typeof console.group === "function") ? console.group : undefined;
        console.__groupEnd = (typeof console.groupEnd === "function") ? console.groupEnd : undefined;
    } else {
        console = {};
    }

    console.__allow_console = (document.location.host.indexOf("localhost") > -1);
    console.__allow_alert = (document.location.host.indexOf("localhost") > -1);
    console.__allow_examine = true;
    console.__groupDepth = 0;

    console.__count = 0;

    console.clear = function()
    {
        if (console.__allow_console) {
            if (typeof console.__clear === "function") {
                console.__clear();
            } else {
                console.getConsole().innerHTML = "";
            }
            console.__count = 0;
        }
    }

    console.debug = function()
    {
        if (console.__allow_console) {
            if (typeof console.__debug === "function") {
                console.__debug(arguments);
            } else {
                console.write(arguments);
            }
            console.__count++;
        }
    };

    console.log = function()
    {
        if (console.__allow_console) {
            if (typeof console.__log === "function") {
                console.__log(arguments);
            } else {
                console.write(arguments);
            }
            console.__count++;
        }
    };

    console.info = function()
    {
        if (console.__allow_console) {
            if (typeof console.__info === "function") {
                console.__info(arguments);
            } else {
                console.write(arguments);
            }
            console.__count++;
        }
    };

    console.warn = function()
    {
        if (console.__allow_console) {
            if (typeof console.__warn === "function") {
                console.__warn(arguments);
            } else {
                console.write(arguments);
            }
            console.__count++;
        }
    };

    console.error = function()
    {
        if (console.__allow_console) {
            if (typeof console.__error === "function") {
                console.__error(arguments);
            } else {
                console.write(arguments);
            }
            console.__count++;
        }
    };

    console.group = function()
    {
        if (console.__allow_console) {
            if (typeof console.__group === "function") {
                console.__group(arguments);
            } else {
                var i, msg = "";
                for (i = 0; i < arguments.length; ++i) {
                    if (msg.length > 0) {
                        msg += ",";
                    }
                    msg += arguments[i];
                }
                console.__groupDepth++;
                console.write("<div style='border:solid 1px;margin-left:" + (console.__groupDepth * 20) + "px;'>" + msg + " {");
            }
            console.__count++;
        }
    };

    console.groupEnd = function()
    {
        if (!console.__allow_console) { return; }
        if (typeof console.__groupEnd === "function") {
            console.__groupEnd(arguments);
        } else {
            var i, msg = "";
            for (i = 0; i < arguments.length; ++i) {
                if (msg.length > 0) {
                    msg += ",";
                }
                msg += arguments[i];
            }
            console.__groupDepth--;
            console.write("" + msg + "<br/>}</div>");
            console.__count++;
        }
    };

    console.examine = function()
    {
        /// <summary>
        /// Clever way to leave hundreds of debug output messages in the code
        /// but not see _everything_ when you only want to see _some_ of the
        /// debugging messages.
        /// </summary>
        /// <remarks>
        /// To enable __examine_() statements for sections of (or grouped) code
        /// type the following in your browser's console:
        ///       top.__examine_ABC = true;
        /// This will enable only the console.examine("ABC", ... ) statements
        /// in the code.
        /// </remarks>
        if (!console.__allow_examine) {
            return;
        }
        if (arguments.length > 0) {
            var obj = top["__examine_" + arguments[0]];
            if (obj && obj === true) {
                console.log(arguments.splice(0, 1));
            }
        }
    };

    console.alert = function()
    {
        if (!console.__allow_alert) {
            return;
        }

        var i, ar,
            str = "",
            count = 0;

        //str = JSON.stringify(arguments);
        //str = str.replace(/,/g, ",\n");
        //str = str.replace(/\{/g, "{\n");
        //str = str.replace(/\}/g, "\n}");
        //window.alert(str);

        if (arguments.length > 0) {
            //str += util.getInfo("", arguments, 0) + "\n";
            for (i = 0; i < arguments.length; i++) {
                //try {
                str += util.trimEnd(util.getInfo("", arguments[i], 0)) + "\n";
                //} catch (e) { }
            }
            str = util.trimEnd(str) + "\n";

            ar = str.split('\n');
            for (i = 0; i < ar.length; i++) {
                count = Math.max(count, ar[1].length);
            }
            for (i = 0; i < count + 10; i++) {
                str += "_";
            }

            window.alert(str);
        }
    };

    console.write = function()
    {
        if (!console.__allow_console) { return; }

        var i, arg,
            div = console.getConsole();

        if (arguments.length > 0) {
            for (i = 0; i < arguments.length; ++i) {
                if (util.type(arguments[i]) === "array") {
                    arg = "[" + arguments[i] + "]";
                } else {
                    arg = arguments[i];
                }
                div.innerHTML += arg + "<br/>";
            }
        }

        div.scrollTop = 999999;
    }

    console.getConsole = function()
    {
        if (!console.__allow_console) { return; }

        var di = "__tempi_console_div",
            d = document.getElementById(di),
            h = document.getElementById(di + ":handle");

        if (!d) {
            d = document.createElement("div");

            d.id = di;
            d.style.zIndex = 9999999;

            d.style.position = "absolute";
            d.style.display = "block";
            d.style.visibility = "visible";
            d.style.overflow = "auto";

            d.style.height = "200px";
            d.style.left = 0;
            d.style.right = 0;
            d.style.bottom = 0;

            d.style.border = "outset thin black";
            d.style.color = "white";
            d.style.backgroundColor = "#333";
            d.style.margin = 0;
            d.style.padding = "2px 4px 2px 4px";

            d.style.filter = "alpha(opacity=50);";
            d.style.MozOpacity = 0.50;
            d.style.opacity = 0.50;
            d.style.KhtmlOpacity = 0.50;

            document.body.appendChild(d);

            console.clear();

            h = document.createElement("div");

            h.id = di;
            h.style.zIndex = 9999999;

            h.style.position = "absolute";
            h.style.display = "block";
            h.style.visibility = "visible";
            h.style.overflow = "auto";

            //h.style.width = "300px";
            h.style.height = "20px";
            h.style.marginLeft = "auto";
            h.style.marginTop = "auto";
            h.style.right = "24px";
            h.style.bottom = "206px";

            //h.style.border = "solid thin silver";
            h.style.color = "white";
            h.style.backgroundColor = "#333";
            h.style.margin = 0;
            h.style.padding = "3px 10px 4px 10px";

            //h.style.filter = "alpha(opacity=50);";
            //h.style.MozOpacity = 0.50;
            //h.style.opacity = 0.50;
            //h.style.KhtmlOpacity = 0.50;

            h.style.cursor = "default";
            h.title = "Click to show/hide";

            h.innerHTML = "console:";
            document.body.appendChild(h);

            h.onclick = function()
            {
                if (d.style.display === "none") {
                    d.style.display = "block";
                    h.style.bottom = "206px";
                } else {
                    d.style.display = "none";
                    h.style.bottom = "0px";
                }
            }

            d.style.display = "none";
            h.style.bottom = "0px";
        }

        return d;
    }

})();
