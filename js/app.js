/* jshint undef: true, unused: true */
/* globals console:false, CloudOS:false  */
/* globals console, setTimeout, CloudOS, Fuse */

(function($)
{

    var router=new $.mobile.Router( {
       "#page-manage-fuse": {handler: "pageManageFuse",
			     events: "bs,bh",
			     argsre: true
			    }
    },
    {
	pageManageFuse: function(type, ui, page) {
	    console.log("manage fuse: main page");
	}
    }, 
    { 
        defaultHandler: function(type, ui, page) {
            console.log("Default handler called due to unknown route (" + type + ", " + ui + ", " + page + ")");
        },
        defaultHandlerEvents: "s",
	defaultArgsRe: true
    });


    // Handlebar templates compiled at load time to create functions
    // templates are in index.html where they should be
    window['snippets'] = {
    };

    function plant_authorize_button()
    {
        //Oauth through kynetx
        var OAuth_kynetx_URL = CloudOS.getOAuthURL();
        $('#authorize-link').attr('href', OAuth_kynetx_URL);
    };

    function onMobileInit() {
	console.log("mobile init");
	$.mobile.autoInitialize = false;
    }

    function onPageLoad() {// Document.Ready
	console.log("document ready");
	CloudOS.retrieveSession();
	plant_authorize_button();
	try {
	    var authd = CloudOS.authenticatedSession();
            if(authd) {
		console.log("Authorized");
		document.location.hash = "#page-manage-fuse";
            } else {	
		console.log("Asking for authorization");
		document.location.hash = "#page-authorize";
            }
	} catch (exception) {
	    
	} finally {
            $.mobile.initializePage();
	}

    }

    /////////////////////////////////////////////////////////////////////
    // this is the actual code that runs and sets everything off
    // pull the session out of the cookie.
    $(document).bind("mobileinit", onMobileInit);
    $(document).ready(onPageLoad);

})(jQuery);
