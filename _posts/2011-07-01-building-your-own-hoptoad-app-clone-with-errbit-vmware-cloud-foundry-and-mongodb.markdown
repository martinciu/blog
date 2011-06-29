---
layout: post
title: Building your own Hoptoad app clone with Errbit, VMware Cloud Foundry and MongoDB. 
excerpt: Tutorial how to set up Rails 3 app on VMware Cloud Foundry. Sample app is Errbit with MongoDB as data store.
keywords: rails, ruby, errbit, vmware, cloud foundry, mongoid, rails 3.1
short_url: http://dd.erc
---

#### Disclaimer

Please note that [VMware Cloud Foundry][cloudfoundry.com] is under heavy [development][cloudfoundry-github] right now. It means that some of the things written below might not be valid at time you are reading it. Please leave a comment if you find any outdated stuff.

#### Errbit

> [Errbit][errbit] is an open source, self-hosted error catcher. It is [Hoptoad][hoptoad] API compliant so you can just point the [Hoptoad][hoptoad] notifier at your Errbit server if you are already using [Hoptoad][hoptoad].

Because Errbit is self-hosted solution you need to have a decent server to run it. You can run it on you own server, you can run it on [heroku][heroku] - details in Errbit's [Readme][errbit-readme] or you can use Cloud Foundry. This post is a simple tutorial how to do it. 

#### What is VMware Cloud Foundry

> Cloud Foundry is the open platform as a service project initiated by VMware. It can support multiple frameworks, multiple cloud providers, and multiple application services all on a cloud scale platform.

You can download from Cloud Foundry from GitHub [repository][cloudfoundry-github] and set up your own cloud infrastructure or you can use hosted by VMware one. In this tutorial we use hosted one.

#### Cloud Foundry account and VMC tools

At first we need a [Cloud Foundry account][cloudfoundry-signup]. They was at closed beta at the time I sign up. I had to wait a few days to get an account. I don't know if it still apply. After you get an account install Cloud Foundry [VMC tools][vmc]. VMC is a command line client for Cloud Foundry.

{% highlight bash %}
$ gem install vmc
{% endhighlight %}

Then log in to Cloud Foundry using credentials.

{% highlight bash %}
$ vmc login  
Email: marcin.ciunelis@gmail.com
Password: ******
Successfully logged into [http://api.cloudfoundry.com]
{% endhighlight %}

You may want to change automatically generated password. You can do that using VMC tools:
 
{% highlight bash %}
$ vmc passwd  
Changing password for 'marcin.ciunelis@gmail.com'
New Password: ******
Verify Password: ******

Successfully changed password
{% endhighlight %}

#### Errbit

[Errbit][errbit] will not work out of the box on Cloud Foundry. We need to modify it a little. I won't write here how to set up Errbit on your local box. You can find it on project [README][errbit-readme] file. I'm going to focus on Cloud Foundry specific issues mainly. First, clone it from GitHub repository.

{% highlight bash %}
$ git clone git://github.com/jdpace/errbit.git
{% endhighlight %}

When you open `Gemfile` you will notice that `redmine_client` gem is taken from git repository, not from official gem release because official one does not work with Rails3. If you are not going to use [Redmine][redmine] integration you can safely comment that line out. If want to use [Redmine][redmine] you we will need to figure out something smarter :)

{% highlight ruby %}
# Gemfile
gem 'lighthouse-api'
# gem 'redmine_client', :git => "git://github.com/oruen/redmine_client.git"
gem 'mongoid_rails_migrations'
#...
{% endhighlight %}

The other thing that Cloud Foundry currently does not support is running `rake` task. Errbit requires running `rake errbit:bootstrap` which copy `config/config.yml`, `config/mongoid.yml` files and seed the database. You can run this task on your local box to create config files.

{% highlight bash %}
$ rake errbit:bootstrap
Copying example config files...
-- Copying config/config.example.yml to config/config.yml
-- Copying config/deploy.example.rb to config/deploy.rb
-- Copying config/mongoid.example.yml to config/mongoid.yml

Seeding database
-------------------------------
Creating an initial admin user:
-- email:    errbit@errbit.example.com
-- password: password

Be sure to change these credentials ASAP!

Generating indexes for App
Generating indexes for Err
Generating indexes for Notice
Generating indexes for User
{% endhighlight %}

Edit `config/config.yml` file amending `host` (it must be uniqe) and `email_from` lines. Also production section in your `config/mongoid.yml` file should looks like this:

{% highlight erb %}
production:
  host: <%= JSON.parse( ENV['VCAP_SERVICES'] )['mongodb-1.8'].first['credentials']['hostname'] rescue 'localhost' %>
  port: <%= JSON.parse( ENV['VCAP_SERVICES'] )['mongodb-1.8'].first['credentials']['port'] rescue 27017 %>
  database:  <%= JSON.parse( ENV['VCAP_SERVICES'] )['mongodb-1.8'].first['credentials']['db'] rescue 'errbit_development' %>
  username: <%= JSON.parse( ENV['VCAP_SERVICES'] )['mongodb-1.8'].first['credentials']['username'] rescue '' %>
  password: <%= JSON.parse( ENV['VCAP_SERVICES'] )['mongodb-1.8'].first['credentials']['password'] rescue '' %>
  
{% endhighlight %}

Because we use JSON here to decode mongodb configuration, you will add the following line to your `Gemfile`
{% highlight ruby %}
gem 'json'
{% endhighlight %}
and run `bundle install` command

To seed database we need to use a little trick. Errbit already use `mongoid_rails_migrations` so we can use rails migration to do this. Generate migration:

{% highlight bash %}
$ rails generate migration seed_database
{% endhighlight %}

and modify to look like this:

{% highlight ruby %}
class SeedDatabase < Mongoid::Migration
  def self.up
    Rake::Task['db:seed'].invoke
    Rake::Task['db:mongoid:create_indexes'].invoke
  end

  def self.down
  end
end
{% endhighlight %}

One more thing before deploying. Errbit will send an email when error occur in your app. So you should have an valid delivery_method configured. It may be your own SMTP server, [Amazon SES][ses] or email app like [Sendgrid][sendgrid] or [PostmarkApp][postmarkapp]

#### Deploy

To run Errbit we need two servers. One for web-server and one for MongoDB database. Setting this up is really simple. To setup the app and database server type:

{% highlight bash %}
$ vmc push errbit --path=. --url=martinciu-errbit.cloudfoundry.com --mem=128M --runtime=ruby19
Detected a Rails Application, is this correct? [Yn]: 
Creating Application: OK
Would you like to bind any services to 'errbit'? [yN]: y
The following system services are available::
1. mongodb
2. mysql
3. redis
Please select one you wish to provision: 1
Specify the name of the service [mongodb-e776e]: 
Creating Service: OK
Binding Service: OK
Uploading Application:
  Checking for available resources: OK
  Processing resources: OK
  Packing application: OK
  Uploading (9K): OK   
Push Status: OK
Staging Application: OK                                                         
Starting Application: OK
{% endhighlight %}

`--url` should be same as the one you entered in `config/config.yml` file and it should be unique. That's it you should have now a working application. You can check working apps by

{% highlight bash %}
$ vmc apps

+-------------+----+---------+-----------------------------------+---------------+
| Application | #  | Health  | URLS                              | Services      |
+-------------+----+---------+-----------------------------------+---------------+
| errbit      | 1  | RUNNING | martinciu-errbit.cloudfoundry.com | mongodb-e776e |
+-------------+----+---------+-----------------------------------+---------------+

{% endhighlight %}

It also shows connected services - mongodb here. You can now visit your errbit app in your browser. You should see a log in screen, but you can not log in because migrations was not run. Cloud Foundry runs migration only if `config/database.yml` exists. We don't have such file because mongoid uses `config/mongid.yml` file by default. To force running migration just create an empty `database.yml` file and update app:

{% highlight bash %}
$ touch config/database.yml
$ vmc update errbit
Uploading Application:
  Checking for available resources: OK
  Processing resources: OK
  Packing application: OK
  Uploading (9K): OK   
Push Status: OK
Stopping Application: OK
Staging Application: OK                                                         
Starting Application: OK
{% endhighlight %}

Sometimes update doesn't success. In that case stopping and starting service may help.

{% highlight bash %}
$ vmc stop errbit  
Stopping Application: OK

$ vmc start errbit  
Staging Application: OK                                                         
Starting Application: OK
{% endhighlight %}

Alright you should be able to log in to your own error catcher app. Just visit chosen URL (http://martinciu-errbit.cloudfoundry.com/ in my case) and log in with default credentials which are email: `errbit@your-app-url.cloudfoundry.com` and password: `password`. You may want to change these default. You can do this by clicking `Edit profile` button.

#### Configuration

You can now configure your production app that you want be monitored by Errbit. Errbit is compatible with [hoptoad_notifier][hoptoad-gem] gem, so if you are familiar with this it should be pretty obvious to you. If you don't use hoptoad you should add it to your `Gemgile`

{% highlight ruby %}
gem "hoptoad_notifier"
{% endhighlight %}

and run `bundle install` command

You can create new app on the homepage, define who should receive notifications and create a `config/errbit.rb` file from the code provided by Errbit. In my case this file looks like this:

{% highlight ruby %}
HoptoadNotifier.configure do |config|
  config.api_key = '3aa6c74ccabaf61295c1d10813575705'
  config.host    = 'martinciu-errbit.cloudfoundry.com'
  config.port    = 80
  config.secure  = config.port == 443
end
{% endhighlight %}

Unfortunately Errbit overwrites default [hoptoad_notifier][hoptoad-gem] settings, so you can not use both error catchers at same time. Alright you should now be able to send a test error notification. Just go to you app folder and run:

{% highlight bash %}
$ rake hoptoad:test
{% endhighlight %}
 
You should a lot of dumped XML data and a while later you should receive email notification from Errbit. You can also review the test error on your errbit app. And that it! You have up and running your own Hoptoad clone!

#### Something went wrong?

If something went wrong (it probably will :P) you can find these tools and resources useful:
1. `vmc logs errbit`
2. `vmc files errbit logs`
3. `vmc help`
4. Cloud Foundry [Forum][cloudfoundry-forum]
5. Cloud Foundry [source code][cloudfoundry-github] on GitHub
6. Errbit [source code][errbit] on GitHub


[cloudfoundry.com]: http://cloudfoundry.com/ "Cloud Foundry website"
[cloudfoundry-github]: https://github.com/cloudfoundry
[cloudfoundry-signup]: http://cloudfoundry.com/signup
[mongodb]: http://www.mongodb.org/display/DOCS/Quickstart
[bundler]: http://gembundler.com/
[rvm]: https://rvm.beginrescueend.com/
[vmc]: http://support.cloudfoundry.com/entries/20012337-getting-started-guide-command-line-vmc-users
[errbit]: https://github.com/jdpace/errbit
[errbit-readme]: https://github.com/relevance/errbit/blob/master/README.md
[hoptoad-gem]: https://github.com/thoughtbot/hoptoad_notifier
[sendgrid]: http://sendgrid.com/
[ses]: http://aws.amazon.com/ses/
[postmarkapp]: http://postmarkapp.com/
[cloudfoundry-forum]: http://support.cloudfoundry.com/home
[redmine]: http://www.redmine.org/
[hoptoad]: http://hoptoadapp.com/pages/home
[heroku]: http://www.heroku.com/