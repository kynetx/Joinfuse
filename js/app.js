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
	    Fuse.isAuthorizedWithCarvoyant(function(authd) {
		if(authd) {
		    $('#carvoyant_item').html("Carvoyant is Linked");
		    $('#carvoyant_item').parent().listview().listview('refresh')
		} else {
		    Fuse.carvoyantOauthUrl(function(json) {
			$('#carvoyant_item').html("<a id='carvoyant_url' href='#'>Connect Carvoyant Account</a>");
			$('#carvoyant_item').parent().listview().listview('refresh')
			$('#carvoyant_url').attr('href', json.url);
		    });
		}
	    });

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

	// only put static stuff here...
	plant_authorize_button();

	$('.logout').off("tap").on("tap", function(event)
        {
            CloudOS.removeSession(true); // true for hard reset (log out of login server too)
            $.mobile.changePage('#page-authorize', {
		transition: 'slide'
        }); // this will go to the authorization page.


    });

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
