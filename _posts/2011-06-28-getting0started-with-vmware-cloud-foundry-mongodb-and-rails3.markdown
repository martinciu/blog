---
layout: post
title: Getting started with VMware Cloud Foundry MongoDB and Rails3
excerpt: Tutorial how to set up Rails 3 app on VMware Cloud. Sample app is Errbit with MongoDB as data store.
keywords: rails, ruby, errbit, vmware, cloud foundry, mongoid, rails 3.1
---

#### What is VMware Cloud Foundry

Cloud Foundry, a VMware-led project is the world’s first open Platform as a Service (PaaS) offering. Cloud Foundry provides a platform for building, deploying, and running cloud apps using Spring for Java developers, Rails and Sinatra for Ruby developers, Node.js and other JVM frameworks including Grails.

{% highlight ruby linenos linenostart=14 %}
def load_models(app)
  return unless ::Mongoid.preload_models
  app.config.paths["app/models"].each do |path|
    Dir.glob("#{path}/**/*.rb").sort.each do |file|
      load_model(file.gsub("#{path}/" , "").gsub(".rb", ""))
    end
  end
end
{% endhighlight %}