---
layout: post
title: How to add API throttle to your rails app
excerpt: Simple API throttling with Rack::Throttle and Redis
keywords: rails, ruby, api, throttle, rate limit, redis, rack-throttle, rack
---

#### Does your app have API?

Yes? That's awesome! But are you sure that it is safe? And I don't mean if you secured access with api_key, Basic HTTP or anything like this. I mean if it is safe for your severs? At [zubibu][zubibu] we are going to add API for updating items in customer shops. It is pretty simple and obvious method. But if some API client use it in bad way it can harm us. For example, if an online store with 400 thousands items decided to decrease all prices by 2% for each item, and if they implemented [zubibu][zubibu] API call after each item update - it could harm us. 400k requests in a very short period of time could be dangerous for many apps.

#### How to protect your API?

You can educate your clients :), you can implement queue for handling API calls on your side. But in most cases (or at least in case described above) queue should be done on the client side. To force implementing queue on the client side you could use API throttling. It should as light as possible and invoked as soon as possible in request processing. So the [Rack][rack] app sound perfect for this task. You can write your own api throttling app or you can use [rack-throttle][rack-throttle] gem. It is simple but has almost all required features and is pretty easy to extend. We at [zubibu][zubibu] needed some custom features, so we decided to extend `Rack::Throttle::Limiter`. This is our implementation of API throttle. I home comments in code are enough to understand it.

{% highlight ruby %}
# lib/api_defender.rb
require 'rack/throttle'
# we limit daily API usage
class ApiDefender < Rack::Throttle::Daily

  def initialize(app)
    host, port, db = YAML.load_file(File.dirname(__FILE__) + '/../config/redis.yml')[Rails.env].split(':')
    options = {
      # we already use Redis in our app, so we reuse it's 
      # config file here
      :cache => Redis.new(:host => host, :port => port, :thread_safe => true, :db => db),
      # if you use staging environment on the same redis server
      # it is good to have separete key prefix for this
      :key_prefix => "zubibu:#{Rails.env}:api_defender",
      # only 5000 request per day
      :max => 5000
    }
    @app, @options = app, options
  end

  # this method checks if request needs throttling. 
  # If so, it increases usage counter and compare it with maximum 
  # allowed API calls. Returns true if a request can be handled.
  def allowed?(request)
    need_defense?(request) ? cache_incr(request) <= max_per_window : true
  end

  def call(env)
    status, heders, body = super
    request = Rack::Request.new(env)
    # just to be nice for our clients we inform them how many
    # requests remaining does they have
    if need_defense?(request)
      heders['X-RateLimit-Limit']     = max_per_window.to_s
      heders['X-RateLimit-Remaining'] = ([0, max_per_window - (cache_get(cache_key(request)).to_i rescue 1)].max).to_s
    end
    [status, heders, body]
  end

  # rack-throttle can use many backends for storing request counter.
  # We use Redis only so we can use it's features. In this case 
  # key increase and key expiration
  def cache_incr(request)
    key = cache_key(request)
    count = cache.incr(key)
    cache.expire(key, 1.day) if count == 1
    count
  end

  protected
    # only API calls should be throttled
    def need_defense?(request)
      request.host == API_HOST
    end

end

{% endhighlight %}

To add this to your application you to add [rack-throttle][rack-throttle] to your `Gemfile`

{% highlight ruby %}
# Gemfile
#...
gem 'rack-throttle'
{% endhighlight %}

and run `bundle install`

after that add, `ApiDefender` middleware to your app's rack stack. It should go as high in the stock as possible:

{% highlight ruby %}
# config/applicaiton.rb
require 'lib/api_defender'
module SomeAwesomeApp
  class Application < Rails::Application
    # ...
    config.middleware.insert_after Rack::Lock, ApiDefender
  end
end
{% endhighlight %}

And thats it! Now, when you access your API you should get response like this:

{% highlight bash %}
$ curl -I http://api.someawesomeapp.com/whatever 
{% endhighlight %}

{% highlight bash %}
HTTP/1.1 200 OK
X-RateLimit-Limit: 5000
X-RateLimit-Remaining: 4999
{% endhighlight %}

but if you exceed 5000 API calls you will get this response:

{% highlight bash %}
HTTP/1.1 403 Forbidden
X-RateLimit-Limit: 5000
X-RateLimit-Remaining: 0

{% endhighlight %}

And voilà, your API is more safe now!

#### More modifications

I suggest you reading rack-throttle's [README][rack-throttle-readme] file as well as it's [source code][rack-throttle] to find out what else you could easily modify for your needs. For example your `ApiDefence` middleware could extend `Rack::Throttle::Hourly` instead of `Rack::Throttle::Daily`. Your could use different counter store, or identify your clients differently by overriding `client_identifier` method.

[zubibu]: http://zubibu.com/
[rack]: http://rack.rubyforge.org/
[rack-throttle]: https://github.com/datagraph/rack-throttle
[rack-throttle-readme]: https://github.com/datagraph/rack-throttle/blob/master/README.md


 