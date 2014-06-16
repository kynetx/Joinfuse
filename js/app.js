/* jshint undef: true, unused: true */
/* globals console:false, CloudOS:false  */
/* globals console, setTimeout, CloudOS, Fuse */

(function()
{
    // Handlebar templates compiled at load time to create functions
    // templates are in index.html where they should be
    window['snippets'] = {
    };


    // Listen for any attempts to call changePage().
    $(document).on("pagebeforechange", function(e, data)
    {
        console.log("before page change", data);
    });


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
    this.plant_authorize_button();


});
