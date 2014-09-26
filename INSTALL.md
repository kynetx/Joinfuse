If you've forked this repo and want to use it to connect to Fuse, you'll have to do the following:

Follow the [general instructions for registering your app (i.e. your copy of Joinfuse) for OAuth](http://developer.kynetx.com/display/docs/Registering+an+App+to+Work+with+Kynetx+Login).

If you've not been a Kynetx developer before, you'll need to create a SquareTag account and set your preferences to be a developer as outlined in the [Quickstart](http://developer.kynetx.com/display/docs/Quickstart) guide. 

You should create a separate account for SquareTag (the site the Quickstart will take you to to register the app) rather than using your Fuse account. 

You’ll want to use ```v1_fuse_bootstrap``` as the bootstrap RID. 

You should point the OAuth Callback URL to the URL for the ```code.html``` file in your copy of Joinfuse. 

In general, a ```BAD REQUEST``` response from Kynetx is an indication that the OAuth configuration is wrong. 

