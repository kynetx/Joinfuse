/* jshint undef: true, unused: true */
/* globals console:false, CloudOS:false  */
/* globals console, setTimeout, CloudOS, Fuse */

(function($)
{

    var router=new $.mobile.Router( [
       {"#page-authorize": {handler: "pageAuthorize",
				 events: "s", // do when we show the page
				 argsre: true
				} },
       {"#page-manage-fuse": {handler: "pageManageFuse",
			      events: "c", // just do when we create the page
			      argsre: true
			     } },
       {"#page-manage-fuse": {handler: "pageManageFuseUpdate",
			      events: "s",
			      argsre: true
			     } },
       {"#page-add-vehicle": {handler: "pageAddVehicle",
			      events: "s", 
			      argsre: true
			     } },
       {"#page-show-vehicle": {handler: "pageShowVehicle",
			       events: "s", 
			       argsre: true
			      } },
       {"#page-update-vehicle": {handler: "pageUpdateVehicle",
				 events: "s", 
				 argsre: true
				} },
       {"#page-vehicle-confirm-delete": {handler: "pageVehicleConfirmDelete",
					 events: "s", 
					 argsre: true
					} },
       {"#page-export-vehicle-data": {handler: "pageExportVehicleData",
					 events: "s", 
					 argsre: true
					} },
       {"#page-update-profile": {handler: "pageUpdateProfile",
					 events: "c", // just do when we create the page
					 argsre: true
					} },
       {"#page-update-preferences": {handler: "pageUpdatePreferences",
					 events: "c", // just do when we create the page
					 argsre: true
					} }  
    ],
    {
	pageAuthorize: function(type, match, ui, page) {
	    console.log("manage fuse: authorize page");
	    $.mobile.loading("hide");
	},
	pageManageFuse: function(type, match, ui, page) {
	    console.log("manage fuse: main page");
	    Fuse.init(function() {
		console.log("Using version: ", Fuse.fuse_version);
		console.log("Using fleet channel: ", Fuse.fleet_eci);
		// Fuse.isAuthorizedWithCarvoyant(function(authd) {
		//     console.log("Is Carvoyant auth'd?", authd);
		//     if(authd.authorized) {
		// 	$('#carvoyant_item').html("Carvoyant is Linked");
		// 	$('#carvoyant_item').parent().listview().listview('refresh');
		// 	Fuse.carvoyant = true;
		//     } else {
		// 	Fuse.carvoyantOauthUrl(function(json) {
		// 	    $('#carvoyant_item').remove();
		// 	    $("#manage-fuse li:nth-child(2)" ).before("<li><a id='carvoyant_url' data-transition='slide' href='#'>Connect Carvoyant Account</a></li>");
		// 	    $('#manage-fuse').listview('refresh');
		// 	    $('#carvoyant_url').attr('href', json.url);
		// 	});
		//     }
		// });
	    },
            {force:true} // force update when we paint the page
           );

	},
	pageManageFuseUpdate: function(type,  match, ui, page) {
	    console.log("main page update");
	    $("#manage-fleet").html(snippets.fleet_template());
	    $('#manage-fleet').listview('refresh');
	    Fuse.init(function() {
		console.log("Updating vehicles");
		Fuse.isAuthorizedWithCarvoyant(function(authd) {
		    console.log("Is Carvoyant auth'd?", authd);
		    if(! authd.authorized) {
			Fuse.carvoyantOauthUrl(function(json) {
			    $('#carvoyant_item').html("<a id='carvoyant_url' data-transition='slide' href='#'>Connect Carvoyant Account <img class='ui-li-icon' src='img/stop_sign_16.png'></a>  ");
			    $("#carvoyant_item").removeClass("ui-li-static");  
			    $('#manage-fuse').listview('refresh');
			    $('#carvoyant_url').attr('href', json.url);
			});
		    } else {

			$('#carvoyant_item').html("<img class='ui-li-icon' src='img/ok_16.png'/> Carvoyant is Linked");
			$('#manage-fuse').listview('refresh');

		    }
			
		    Fuse.vehicleSummary(function(json) {
			// sort so we get a consistent order
			console.log("Displaying items...", json);
			

			var keys = json.sort(sortBy("profileName"));
			$.each(keys, paint_item);

			$('#manage-fleet').listview('refresh');
		    });
		});
	    });
	}, 
	pageAddVehicle: function(type,  match, ui, page) {
	    console.log("add vehicle");
            var frm = "#form-add-vehicle";
            $(frm)[0].reset();
	    clear_error_msg(frm);
	    $("#photo", frm).val("");
            $("#photo-preview", frm).attr("src", dummy_image);

	    $("#deviceId", frm).on("blur", function(event){
		$("#deviceId", frm).val(function () {
		    return this.value.toUpperCase();
		});
	    }),
	    $("#vin", frm).on("blur", function(event){
		$("#vin", frm).val(function () {
		    return this.value.toUpperCase();
		});
		check_vin($("#vin", frm).val(), frm);
	    }),
	    $(".save", frm).off('tap').on('tap', function(event)
            {
                var vehicle_data = process_form(frm);

		if( check_vin(vehicle_data.vin, frm) ) {
		    return;
		} else {
		    clear_error_msg(frm);
		}

                console.log(">>>>>>>>> Saving new vehicle ", vehicle_data);
		$.mobile.loading("show", {
                    text: "Saving vehicle data...",
                    textVisible: true
		});	
		Fuse.createVehicle(vehicle_data.name,
				   vehicle_data.photo,
				   vehicle_data.vin,
				   vehicle_data.deviceId,
				   vehicle_data.mileage,
				   function(directives) {
				       $.mobile.loading("hide");

				       var error_directive = $.grep(directives.directives, 
						       function(obj, i){
							   return obj["name"] === "vehicle_error";
						       });

				       if(error_directive.length > 0) {

					   console.log("Vehicle not saved ", directives);

					   show_error_msg(error_directive[0].options.error.error_type, 
							  frm, 
							  {"msg": error_directive[0].options.error.error_msg}
							 );
					   

				       } else {

					   console.log("Vehicle saved ", directives);

					   var profile = {
					       deviceId: vehicle_data.deviceId,
					       vin: vehicle_data.vin,
					       mileage: vehicle_data.mileage,
					       license: vehicle_data.license,
					       myProfileName: vehicle_data.name,
					       myProfilePhoto: vehicle_data.photo
					   };
					   console.log("Created profile ", profile);
					   var id = $.grep(directives.directives, 
							   function(obj, i){
							       return obj["name"] === "vehicle_created";
							   })[0].options.id;
					   Fuse.updateVehicleSummary(id, profile);
					   
					   $.mobile.changePage("#page-manage-fuse", {
					       transition: 'slide'
					   });

				       }

				   },
				   {license: vehicle_data.license}
				  );
            });
	    $(".cancel", frm).off('tap').on('tap', function(event)
            {
		console.log("Cancelling add vehicle");
		$(frm)[0].reset();
		clear_error_msg(frm);
		$('#photo-preview').attr('src', dummy_image);
	    });

	},
	pageShowVehicle: function(type,  match, ui, page) {
	    console.log("show vehicle");
	    var vlist = "#show-vehicle-list";
	    var params = router.getParams(match[1]);
	    console.log("ID: ", params.id);


	    $("#update_vehicle_link").attr("href", "#page-update-vehicle?id="+params.id);
	    
	    Fuse.vehicleSummary(function(json){
		console.log("Show json ", json, params.id);
		var vehicle = json[params.id];

		$("#name", vlist).html(vehicle.profileName);
		$("#vin", vlist).html(vehicle.vin);
		$("#deviceId", vlist).html(vehicle.deviceId);
		$("#license", vlist).html(vehicle.license);
		$("#mileage", vlist).html(vehicle.mileage);
		$("#photo", vlist).html(vehicle.profilePhoto);
		$("#id", vlist).html(vehicle.picoId);
		$("#photo-preview", vlist).attr("src", vehicle.profilePhoto);

	        var export_item = $("#export-link", vlist);
		export_item.attr("href", export_item.attr("href") + "?id=" + params.id);

		// reset status area
		if ($("li#vehicle_missing").length > 0) { 
		    $(vlist, "li:last-child").remove();
		}
		if ($("a#vehicle-location-link").length > 1) { // there's one in the template, so two if present in form
		    // we add two, get rid of two
		    $(vlist + " li:last-child").remove();
		    $(vlist + " li:last-child").remove();
		}

		if( ! isEmpty(vehicle.vehicleId) 
		 && ! isEmpty(vehicle.lastWaypoint) 
		  ) {

		    var running = "not running";

		    if(! isEmpty(vehicle.running) && vehicle.running == "1") {
			running = "running";
		    }
		    var fuel = "";
		    if(typeof vehicle.fuellevel === "string") {
			fuel = "Fuel level: " + vehicle.fuellevel + "%";
		    } 

		    var snip = snippets.vehicle_location_template(
			{"lat": vehicle.lastWaypoint.latitude,
			 "long": vehicle.lastWaypoint.longitude,
			 "address": vehicle.address,
			 "current_location": "Current location: " + vehicle.address,
			 "running": "Vehicle is " + running,
			 "fuel": fuel,
			 "heading": "Heading: " + vehicle.heading + " degrees"
			});

		    $(vlist).append(snip);
		 } else {
		    $(vlist).append(
			'<li id="vehicle_missing" class="ui-field-contain">No vehicle data yet.</li>'
		    );
		}

		$(vlist).listview('refresh');

	    });
	},
	pageUpdateVehicle: function(type,  match, ui, page) {
	    console.log("update vehicle");
            var frm = "#form-update-vehicle";
            $(frm)[0].reset();
	    clear_error_msg(frm);
	    var params = router.getParams(match[1]);
	    console.log("ID: ", params.id);
	    Fuse.vehicleSummary(function(json){
		console.log("Update json ", json, params.id);
		var vehicle = json[params.id];
		$("#name", frm).val(vehicle.profileName);
		$("#vin", frm).val(vehicle.vin);
		$("#deviceId", frm).val(vehicle.deviceId);
		$("#license", frm).val(vehicle.license);
		$("#mileage", frm).val(vehicle.mileage);
		$("#photo", frm).val(vehicle.profilePhoto);
		$("#id", frm).val(vehicle.picoId);
		$("#photo-preview", frm).attr("src", vehicle.profilePhoto);

		// reset status area
		if ($("li#vehicle_missing").length > 0) { 
		    $("#form-update-vehicle-list li:last-child").remove();
		}
		if ($("a#vehicle-location-link").length > 1) { // there's one in the template, so two if present in form
		    // we add two, get rid of two
		    $("#form-update-vehicle-list li:last-child").remove();
		    $("#form-update-vehicle-list li:last-child").remove();
		}

		if( ! isEmpty(vehicle.vehicleId) 
		 && ! isEmpty(vehicle.lastWaypoint) 
		  ) {

		    var running = "not running";

		    if(! isEmpty(vehicle.running) && vehicle.running == "1") {
			running = "running";
		    }
		    var fuel = "";
		    if(typeof vehicle.fuellevel === "string") {
			fuel = "Fuel level: " + vehicle.fuellevel + "%";
		    } 

		    var snip = snippets.vehicle_location_template(
			{"lat": vehicle.lastWaypoint.latitude,
			 "long": vehicle.lastWaypoint.longitude,
			 "address": vehicle.address,
			 "current_location": "Current location: " + vehicle.address,
			 "running": "Vehicle is " + running,
			 "fuel": fuel,
			 "heading": "Heading: " + vehicle.heading + " degrees"
			});

		    $("#form-update-vehicle-list").append(snip);
		 } else {
		    $("#form-update-vehicle-list").append(
			'<li id="vehicle_missing" class="ui-field-contain">No vehicle data yet.</li>'
		    );
		}

		$('#form-update-vehicle-list').listview('refresh');

	    });
	    $("#deviceId", frm).on("blur", function(event){
		$("#deviceId", frm).val(function () {
		    return this.value.toUpperCase();
		});
	    }),
	    $("#vin", frm).on("blur", function(event){
		$("#vin", frm).val(function () {
		    return this.value.toUpperCase();
		});
	    }),
            // show jQuery mobile's built in loady spinner.
	    $(".save", frm).off('tap').on('tap', function(event)
            {
		
                var vehicle_data = process_form(frm);

		if( check_vin(vehicle_data.vin, frm) ) {
		    return;
		} else {
		    clear_error_msg(frm);
		}

		$.mobile.loading("show", {
                    text: "Updating vehicle data...",
                    textVisible: true
		});

                console.log(">>>>>>>>> Updating vehicle ", vehicle_data);
		var id = vehicle_data.id;

		Fuse.vehicleChannels(function(chan_array){
		    var channel = $.grep(chan_array, function(obj, i){return obj["picoId"] === id;})[0]["channel"];
		    var profile = {
			deviceId: vehicle_data.deviceId,
			vin: vehicle_data.vin,
			mileage: vehicle_data.mileage,
			myProfileName: vehicle_data.name,
			myProfilePhoto: vehicle_data.photo,
			license: vehicle_data.license
		    };
		    Fuse.updateVehicleSummary(id, profile);
		    Fuse.saveProfile(channel, profile,
				     function(directives) {
					 $.mobile.loading("hide");
					 $.mobile.changePage("#page-manage-fuse", {
					     transition: 'slide'
					 });
				     });
		});
            });
	    $(".cancel", frm).off('tap').on('tap', function(event)
            {
		console.log("Cancelling update vehicle");
		$(frm)[0].reset();
		clear_error_msg(frm);
		$('#photo-preview').attr('src', dummy_image);
		$.mobile.loading("hide");
		$.mobile.changePage("#page-manage-fuse", {
		    transition: 'slide'
		});
	    });
	    $(".delete", frm).attr("href","#page-vehicle-confirm-delete?id=" + params.id);
	},
	pageVehicleConfirmDelete: function(type,  match, ui, page) {
	    var id = router.getParams(match[1])["id"];
            console.log("Deleting vehicle ", id);

	    $('#delete-vehicle').off('tap').on('tap', function(event)
            {
		$.mobile.loading("show", {
                    text: "Deleting vehicle...",
                    textVisible: true
		});
		Fuse.vehicleSummary(function(json){
		    var vehicle = json[id] || {};
		    var pid = vehicle.picoId;
		    console.log("Deleting vehicle with ID ", pid);
		    if(typeof id !== "undefined") {
			Fuse.deleteVehicle(pid, function(directives) {
			    // deletion is simple, so the return indicates completion; thus invalidation works
			    Fuse.invalidateVehicleSummary();
			    console.log("Deleted ", pid, directives);
			    $.mobile.loading("hide");
			    $.mobile.changePage("#page-manage-fuse", {
				transition: 'slide'
			    });
			});
		    }
                });
            });
	},
	pageExportVehicleData: function(type,  match, ui, page) {
	    console.log("export vehicle data");
	    var vlist = "#export-vehicle-list";
	    var frm = "#form-export-vehicle-data";
	    var params = router.getParams(match[1]);
	    console.log("ID: ", params.id);


	    Fuse.vehicleSummary(function(json){
		console.log("Show json ", json, params.id);
		var vehicle = json[params.id];

		$("#name", vlist).html(vehicle.profileName);
		$("#vin", vlist).html(vehicle.vin);
		$("#deviceId", vlist).html(vehicle.deviceId);
		$("#license", vlist).html(vehicle.license);
		$("#mileage", vlist).html(vehicle.mileage);
		$("#photo", vlist).html(vehicle.profilePhoto);
		$("#photo-preview", vlist).attr("src", vehicle.profilePhoto);

		$("#id", frm).html(vehicle.picoId);
            });

	    $("#export", vlist).off('tap').on('tap', function(event)
            {
		
                var vehicle_data = process_form(frm);
                console.log(">>>>>>>>> Exporting vehicle data ", vehicle_data);
		var id = vehicle_data.id;

		Fuse.vehicleChannels(function(chan_array){
		    var channel = $.grep(chan_array, function(obj, i){return obj["picoId"] === id;})[0]["channel"];
		    var end_date = vehicle_data.year + vehicle_data.month + "31T115959+0000";
		    var start_date = vehicle_data.year + vehicle_data.month + "01T000000+0000";

		    var args = {"start": start_date,
				"end": end_date
			       };
		    return Fuse.ask_vehicle(channel, "exportTrips", args, null, function(csv) {
			return csv;
		      },
                      {rid: "trips"}
		    );

		});
	    });
	},
	pageUpdateProfile: function(type,  match, ui, page) {
	    console.log("update profile");
            var frm = "#form-update-profile";
	    clear_error_msg(frm);
            $("#eci-eci", frm).html("").hide();
            $(frm)[0].reset();
	    var owner_eci = CloudOS.defaultECI;
	    Fuse.getProfile(owner_eci,function(json){
		$("#name", frm).val(json.myProfileName);
		$("#email", frm).val(json.myProfileEmail);
		$("#phone", frm).val(json.myProfilePhone);
		$("#notify option", frm).each(function(){
		    if($(this).val() == json.notificationPreferences) 
			$(this).attr("selected", "selected");
		});
		$( "#notify" ).selectmenu( "refresh" );
		$("#photo", frm).val(json.myProfilePhoto);
		$("#photo-preview", frm).attr("src", json.myProfilePhoto);
		$('#show-eci', frm).parent().parent().listview('refresh');
	    });
	    
            // show jQuery mobile's built in loady spinner.
	    $(".save", frm).off('tap').on('tap', function(event)
            {
		$.mobile.loading("show", {
                    text: "Updating owner profile...",
                    textVisible: true
		});
                var owner_data = process_form(frm);
                console.log(">>>>>>>>> Updating owner ", owner_data);

		var profile = { 
		    myProfileName: owner_data.name,
		    myProfilePhoto: owner_data.photo,
		    myProfileEmail: owner_data.email,
		    myProfilePhone: owner_data.phone,
		    notificationPreferences: owner_data.notify
		};
		
		Fuse.saveProfile(owner_eci, profile,
				 function(directives) {
				     $.mobile.loading("hide");
				     $.mobile.changePage("#page-manage-fuse", {
					 transition: 'slide'
				     });
				 });
	    });
	    $(".cancel", frm).off('tap').on('tap', function(event)
            {
		console.log("Cancelling update profile");
	    });	
	    $("#show-eci", frm).off('tap').on('tap', function(event)
            {
		var eci_message = "Fuse ECI (keep secret): " + owner_eci;
		$("#reveal-eci", frm).html(eci_message).toggle('slow', function(){
		    $('#show-eci', frm).parent().parent().listview('refresh');
   	        });
	    });
	},
	pageUpdatePreferences: function(type,  match, ui, page) {
	    console.log("update preferences");
            var frm = "#form-update-preferences";
	    var owner_eci = CloudOS.defaultECI;
	    Fuse.getPreferences(owner_eci,function(json){
		$("#report option", frm).each(function(){
		    if($(this).val() == json.reportPreference) {
			$(this).attr("selected", "selected");
		    } else {
			$(this).removeAttr("selected");
		    }
		});
		$( "#report", frm ).slider().slider("refresh");
		$("#debug option", frm).each(function(){
		    if($(this).val() == json.debugPreference) {
			$(this).attr("selected", "selected");
		    } else {
			$(this).removeAttr("selected");
		    }
		});
		$( "#debug", frm ).slider().slider("refresh");
		$("#timezone").val(jstz.determine().name());
	    });
            // show jQuery mobile's built in loady spinner.
	    $(".save", frm).off('tap').on('tap', function(event)
            {
		$.mobile.loading("show", {
                    text: "Updating Fuse preferences...",
                    textVisible: true
		});
                var preference_data = process_form(frm);
                console.log(">>>>>>>>> Updating preferences ", preference_data);

		var settings = { 
		    reportPreference: preference_data.report,
		    debugPreference: preference_data.debug,
		    timezonePreference: preference_data.timezone
		};

		Fuse.set_host(preference_data.debug);
		
		Fuse.savePreferences(owner_eci, settings,
				 function(directives) {
				     $.mobile.loading("hide");
				     $.mobile.changePage("#page-manage-fuse", {
					 transition: 'slide'
				     });
				 });
	    });
	    $(".cancel", frm).off('tap').on('tap', function(event)
            {
		console.log("Cancelling update preferences");
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
        vehicle_update_item_template: Handlebars.compile($("#vehicle-update-item-template").html() || ""),
        fleet_template: Handlebars.compile($("#fleet-template").html() || ""),
	vehicle_location_template: Handlebars.compile($("#vehicle-location-template").html() || ""),
    };

    function show_error_msg(msg_key, frm, options) {
	options = options || {};
	var error_msgs = {
	    "vin_length": "Bad VIN; must be 17 chars long, alphanumeric (except I, O, or Q), and last 5 chars must by numbers",
	    "vehicle_create": "Vehicle cannot be created"
	};


	function format_error_item(key, msg) {
	    msg = options.msg ? msg + ":" + options.msg 
		              : msg;
	    return  "<li id='"+key+"' style='color:red;background:#FCC' class='wrap ui-field-contain'>"+msg+"</li>";
	};

	var error_message = format_error_item(msg_key, error_msgs[msg_key]);
	if($("#"+msg_key)) {
	    $("#error-msg", frm).html(error_message).show('slow');
	} else {
	    $("#error-msg", frm).append(error_message).show('slow');
	}
	$('#error-msg', frm).listview('refresh');
    };

    function clear_error_msg(frm) {
       $("#error-msg", frm).html("").hide();
    }

    function check_vin(vin, frm) {
	valid_vin = vin.length === 0 // empty is OK
	         || vin.match(/^[A-HJ-NPR-Za-hj-npr-z0-9]{12}\d{5}$/) // 17 char long, alphanumeric w/o IOQ, last 5 digits
	          ;

	if( ! valid_vin ) {
	    console.log("Bad VIN; must be 17 characters long, alphanumeric (except I, O, or Q), and last 5 characters must by numbers");
	    show_error_msg("vin_length", frm);
	    return 1;
	} else {
	    clear_error_msg(frm);
	    return 0;
	}
    };

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
	var results = process_form_results($(frm).serializeArray());
	console.log("Form results for ", frm, ": ", results);
	return results;
    };

    var dummy_image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAAB4CAIAAAC2BqGFAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMC1jMDYwIDYxLjEzNDc3NywgMjAxMC8wMi8xMi0xNzozMjowMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNSBNYWNpbnRvc2giIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NTRDRjkxM0Q0NTkxMTFFMkJCQUVDRjRFNTE1QjQ0QzQiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6NTRDRjkxM0U0NTkxMTFFMkJCQUVDRjRFNTE1QjQ0QzQiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo1NENGOTEzQjQ1OTExMUUyQkJBRUNGNEU1MTVCNDRDNCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo1NENGOTEzQzQ1OTExMUUyQkJBRUNGNEU1MTVCNDRDNCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PufUyK0AAAEzSURBVHja7N0xCoMwFIBhLYLb29x6EO9/CE/QE3TIFEjFFqGr1SD2+5eM4oe8IUjSllIaHd8NAehL1b2XnHNKCcfuRcQX9Kw8TROX3RvH0egwo0ELNGiBBg1aoEELNGjQAg1azbofvaH70l9hPZZ80UaHQIMGLdCgBRo0aIEGLdCgr1VX7UnPpVO9/DAMfd9fEHrzZu5BRUQ1aKPDjAYt0KBBIwANWqBBgxZo0AINGrRAgxZo0KAFGrRAgwYt0KAFGjRogQYt0KBBCzRogQYNWqBBCzRo0Dq2esdIRMTZjkGudoZEbej1FkWjQ6BBCzRo0AINWqBBgxZo0AJ9mrZvk/5y55wvWqBBCzRo0AINWqBBgxZo0AIN+t9qSynzknNOKeHYvfVP5Q+0jA7QAn3CXgIMAMnZNAG/sW+aAAAAAElFTkSuQmCC";

    function plant_authorize_button()
    {
        //Oauth through kynetx
        var OAuth_kynetx_URL = CloudOS.getOAuthURL();
        $('#authorize-link').attr('href', OAuth_kynetx_URL);
        var OAuth_kynetx_newuser_URL = CloudOS.getOAuthNewAccountURL();
        $('#create-link').attr('href', OAuth_kynetx_newuser_URL);

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
	    $.mobile.loading("hide");
	}

    }

    /////////////////////////////////////////////////////////////////////
    // this is the actual code that runs and sets everything off
    // pull the session out of the cookie.
    $(document).bind("mobileinit", onMobileInit);
    $(document).ready(onPageLoad);

})(jQuery);

function paint_item(id, vehicle) {

			    if (typeof vehicle === "undefined") {
				return;
			    }

			    var last_running = ! Fuse.carvoyant.authorized          ? "Link Carvoyant" 
    	                                     : isEmpty(vehicle.deviceId)            ? "Add Device Id"
                                             :                                        "Start Vehicle"
                            ;
			    
			    // console.log("Painting " + id);
			    if(! isEmpty(vehicle.vehicleId)) {
				var running = "Vehicle is ";
				if (! isEmpty(vehicle.running) && vehicle.running == "1") {
				    running += "driving";
				} else {
				    running += "parked";
				}
	    			if( ! isEmpty(vehicle.address) ) {
				    running += " at " + vehicle.address;
				}

				var speed = "";
				if(typeof vehicle.speed === "string" && vehicle.speed != "0") {
				    speed = "(" + vehicle.speed + " mph)";
				} 

				var fuel = "";
				if(typeof vehicle.fuellevel === "string") {
				    fuel = "Fuel level: " + vehicle.fuellevel + "%";
				} 

				var status = (! isEmpty(vehicle.lastRunningTimestamp)) ? "img/ok_16.png" 
                                           : "img/warning_16.png";
				if(typeof vehicle.lastRunningTimestamp === "string") {
				    // can't use Date.parse() cause of Safari
				    function parse_date(date_string) {
					var splitable_string = date_string
      	                                                          .splice(13,0,":")
	                                                          .splice(11,0,":")
                                                                  .splice(6,0,"-")
	                                                          .splice(4,0,"-");
					
					var a = splitable_string.split(/[^0-9]/);
					// warning, this just assumes incoming date is UTC!!!
					var u=Date.UTC (a[0],a[1]-1,a[2],a[3],a[4],a[5]);
					return new Date(u);
				    };

				    last_running = "Updated " + timeAgo(parse_date(vehicle.lastRunningTimestamp), 2); // two most significant fuzzy times
				}

				var lat = vehicle.lastWaypoint && vehicle.lastWaypoint.latitude;
				var long = vehicle.lastWaypoint && vehicle.lastWaypoint.longitude;

				$("#manage-fleet li:nth-child(1)" ).after(
				    snippets.vehicle_update_item_template(
					{"name": vehicle.profileName,
					 "id": id,
					 "status_icon": status,
					 "running": running,
					 "fuel": fuel,
					 "heading": "Heading: " + vehicle.heading + " degrees",
					 "last_running": last_running
					}));
			    } else {
				$("#manage-fleet li:nth-child(1)" ).after(
				    snippets.vehicle_update_item_template(
					{"name": vehicle.profileName,
					 "id": id,
					 "status_icon": "img/stop_sign_16.png",
					 "last_running" : last_running
					}));
			    }
			}

			function sortBy(prop){
			    return function(a,b){
				if( a[prop] < b[prop]){
				    return 1;
				}else if( a[prop] > b[prop] ){
				    return -1;
				}
				return 0;
			    };
			};

// this stuff needs to be in the window...
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


String.prototype.splice = function( idx, rem, s ) {
    return (this.slice(0,idx) + s + this.slice(idx + Math.abs(rem)));
};

function isEmpty(obj) {

    // null and undefined are "empty"
    if (obj == null) return true;
    if (typeof obj === "undefined") return true;

    // Assume if it has a length property with a non-zero value
    // that that property is correct.
    if (obj.length > 0)    return false;
    if (obj.length === 0)  return true;

    // Otherwise, does it have any properties of its own?
    // Note that this doesn't handle
    // toString and valueOf enumeration bugs in IE < 9
    for (var key in obj) {
        if (hasOwnProperty.call(obj, key)) return false;
    }

    return true;


};


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
