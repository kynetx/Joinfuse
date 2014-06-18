/* jshint undef: true, unused: true */
/* globals console:false, CloudOS:false  */
/* globals console, setTimeout, CloudOS, Fuse */

(function($)
{

    var router=new $.mobile.Router( {
       "#page-manage-fuse": {handler: "pageManageFuse",
			     events: "c", // just do when we create the page
			     argsre: true
			    },
       "#page-add-vehicle": {handler: "pageAddVehicle",
			     events: "c", // just do when we create the page
			     argsre: true
			    }
    },
    {
	pageManageFuse: function(type, ui, page) {
	    console.log("manage fuse: main page");
	    Fuse.isAuthorizedWithCarvoyant(function(authd) {
		console.log("Is Carvoyant auth'd?", authd);
		if(authd.authorized) {
		    $('#carvoyant_item').html("Carvoyant is Linked");
		    $('#carvoyant_item').parent().listview().listview('refresh')
		} else {
		    Fuse.carvoyantOauthUrl(function(json) {
			$('#carvoyant_item').remove();
			$("#manage-fuse li:nth-child(2)" ).before("<li><a id='carvoyant_url' data-transition='slide' href='#'>Connect Carvoyant Account</a></li>");
			$('#manage-fuse').listview('refresh');
			$('#carvoyant_url').attr('href', json.url);
		    });
		}
	    });

	},
	pageAddVehicle: function(type, ui, page) {
	    console.log("add vehicle");
            var frm = "#form-add-vehicle";
            $(frm)[0].reset();
            $("#photo", frm).val("");
            $("#photo-preview", frm).attr("src", dummy_image);

            // show jQuery mobile's built in loady spinner.
            $.mobile.loading("show", {
                text: "getting location...",
                textVisible: true
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

    var dummy_image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAAB4CAIAAAC2BqGFAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBNYWNpbnRvc2giIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NTRDRjkxM0Q0NTkxMTFFMkJCQUVDRjRFNTE1QjQ0QzQiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6NTRDRjkxM0U0NTkxMTFFMkJCQUVDRjRFNTE1QjQ0QzQiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo1NENGOTEzQjQ1OTExMUUyQkJBRUNGNEU1MTVCNDRDNCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo1NENGOTEzQzQ1OTExMUUyQkJBRUNGNEU1MTVCNDRDNCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PufUyK0AAAEzSURBVHja7N0xCoMwFIBhLYLb29x6EO9/CE/QE3TIFEjFFqGr1SD2+5eM4oe8IUjSllIaHd8NAehL1b2XnHNKCcfuRcQX9Kw8TROX3RvH0egwo0ELNGiBBg1aoEELNGjQAg1azbofvaH70l9hPZZ80UaHQIMGLdCgBRo0aIEGLdCgr1VX7UnPpVO9/DAMfd9fEHrzZu5BRUQ1aKPDjAYt0KBBIwANWqBBgxZo0AINGrRAgxZo0KAFGrRAgwYt0KAFGjRogQYt0KBBCzRogQYNWqBBCzRo0Dq2esdIRMTZjkGudoZEbej1FkWjQ6BBCzRo0AINWqBBgxZo0AJ9mrZvk/5y55wvWqBBCzRo0AINWqBBgxZo0AIN+t9qSynzknNOKeHYvfVP5Q+0jA7QAn3CXgIMAMnZNAG/sW+aAAAAAElFTkSuQmCC";

    function plant_authorize_button()
    {
        //Oauth through kynetx
        var OAuth_kynetx_URL = CloudOS.getOAuthURL();
        $('#authorize-link').attr('href', OAuth_kynetx_URL);
    };

    function previewPhoto(input, frm)
        {
            var eleID = $(input).attr("elid");

            var showError = function(errorMessage)
            {
                var errorSelector = '#' + eleID + '-error';
                $(errorSelector).html(errorMessage).show('slow').delay(3000).hide('slow');
            };

            var showSuccess = function(successMessage)
            {
                var successSelector = '#' + eleID + '-success';
                $(successSelector).html(successMessage).show('slow').delay(3000).hide('slow');
            };

            function resampled(data, width, height)
            {
                showSuccess("Your image was resized successfully...");

                $('#' + eleID + '-preview', frm).attr('src', data);
                $('#' + eleID, frm).val(data);
            }


            var
            // set the width in pixel
            width = 120,
            // set the height in pixels, 0 lets if float
            height = 0,
            // temporary variable, different purposes
            file;

            if (
                // there is a files property
                // and this has a length greater than 0
                (input.files || []).length &&
                // the first file in this list
                // has an image type, hopefully
                // compatible with canvas and drawImage
                // not strictly filtered in this example
                    /^image\//.test((file = input.files[0]).type)) {
                jQuery.canvasResize(file,
				    {
				        width: width,
				        height: height,
				        crop: true,
				        quality: 80,
				        callback: resampled
				    });
            } else if (file) {
                // if file variable has been created
                // during precedent checks, there is a file
                // but the type is not the expected one
                // wrong file type notification
                showError("Please choose an image...");
            }

            //console.debug("file: ", input.files[0]);
            //console.debug("elID: ", $(input).attr("elid"));
            //console.debug("input: ", input);
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
