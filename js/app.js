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

}
