/* jshint undef: true, unused: true */
/* globals console:false, CloudOS:false  */
/* globals console, setTimeout, CloudOS, Fuse */

(function($)
{
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


    /////////////////////////////////////////////////////////////////////
    // this is the actual code that runs and sets everything off
    // pull the session out of the cookie.
    CloudOS.retrieveSession();
    plant_authorize_button();

    var router=new $.mobile.Router([
        { "#page-manage-fuse": "pageManageFuse" }
    ],
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

    
    if(! CloudOS.authenticatedSession()) {
	console.log("We're not authorized...");
	$.mobile.changePage('', {
	    transition: 'slide'
	}); 
    } else {
	console.log("We're authorized...")
	$.mobile.changePage('#page-manage-fuse', {
	    transition: 'slide'
	}); 
    }

   

})(jQuery);
