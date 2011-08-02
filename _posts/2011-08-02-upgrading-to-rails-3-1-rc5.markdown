---
layout: post
title: Upgrading to Rails 3.1.0.rc5 (from rc4)
excerpt: Upgrading from Rails 3.1.0.rc4 to 3.1.0.rc5 don't have to be simple
keywords: rails, ruby, rails 3.1, rc4, rc5, upgrade, upgrading, assets, bundler, assets pipeline
---

#### Rails 3.1.0.rc5

Rails 3.1.0.rc5 is [out][rc5-announcement]. If your app doesn't use rails 3.1 yet you may want to read [this][rails-31-upgrade] and probably [this][rails-31-slow-assets]. If you have balls and you already use version 3.1, you probably would like to use rc5 ASAP. 

#### Surpise

Alright RC releases could not be much different from each other. You may think that simple change in `Gemfile` make you even more cool.

{% highlight ruby %}
gem 'rails', '3.1.0.rc5'
{% endhighlight %}

Not this time :). After changing `Gemfile` and running

{% highlight bash %}
$ bundle update rails
{% endhighlight %}

this line of my template:

{% highlight ruby %}
# app/views/layouts/application.html.haml
= stylesheet_link_tag :contents, :media => "screen,print"
{% endhighlight %}

throws this error:

{% highlight %}
No expansion found for :contents
{% endhighlight %}

#### What has been changed?

After each major rails upgrade it is always good to generate dummy app and look around what has been changed. I did it and found two little things.

There is a new group in `Gemfile` called `assets`. 

{% highlight ruby %}
# Gems used only for assets and not required
# in production environments by default.
group :assets do
  gem 'sass-rails', "~> 3.1.0.rc"
  gem 'coffee-rails', "~> 3.1.0.rc"
  gem 'uglifier'
end
{% endhighlight %}

And `config/application.rb` file has been changed in the way how [bundler][bundler] require gems:

{% highlight ruby %}
# config/application.rb
Bundler.require *Rails.groups(:assets) if defined?(Bundler)
{% endhighlight %}

After implementing these changes my app is working under rails 3.1.0.rc5. Hooray!

There may be other differences but none of them breaks my app.

[rc5-announcement]: http://groups.google.com/group/rubyonrails-talk/browse_thread/thread/ae3139e531b970a2
[rails-31-upgrade]:http://davidjrice.co.uk/2011/05/25/how-to-upgrade-a-rails-application-to-version-3-1-0.html
[rails-31-slow-assets]: http://martinciu.com/2011/06/rails-3-1-and-slow-asset-pipeline.html
[bundler]: http://gembundler.com/
