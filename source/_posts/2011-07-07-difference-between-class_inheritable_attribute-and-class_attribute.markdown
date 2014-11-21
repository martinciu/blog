---
layout: post
title: Difference between class_inheritable_attribute and class_attribute
excerpt: What is the difference beetween between class_inheritable_attribute and class_attribute methods and how to get rid of rails 3.1 depracation warning
keywords: rails, ruby, rails 3.1, deprecation, class_attibute, deprecation, warning, class_inheritable_attribute, class_inheritable_hash, class_inheritable_array
---

#### Deprecation warning

After you upgrade to Rails 3.1 you may be attacked by deprecation warnings similar to this one:

> DEPRECATION WARNING: class_inheritable_attribute is deprecated, please use class_attribute method instead. Notice their behavior are slightly different, so refer to class_attribute documentation first. (called from included at base.rb:2)

In most case it will probably be all right to replace your all `class_inheritable_hash`, `class_inheritable_array`, etc method with `class_attribute`. Unfortunately it won't always work. There is a "slight" difference mentioned by warning above.

#### What is the difference?

With `class_inheritable_hash` (the old way):

{% highlight ruby %}
class Base
  class_inheritable_hash :mappings
  self.mappings = {}
end

class FirstChild < Base
  self.mappings[:foo] = :bar
end

class SecondChild < Base
  self.mappings[:bar] = :baz
end

Base.mappings           # {}
FirstChild.mappings     # {:foo=>:bar}
SecondChild.mappings    # {:bar=>:baz}

{% endhighlight %}

Alright, this is the expected behavior. How does this code works with `class_attribute`? Let's see!

{% highlight ruby %}
class Base
  class_attribute :mappings
  self.mappings = {}
end

class FirstChild < Base
  self.mappings[:foo] = :bar
end

class SecondChild < Base
  self.mappings[:bar] = :baz
end

Base.mappings           # {:foo=>:bar, :bar=>:baz}
FirstChild.mappings     # {:foo=>:bar, :bar=>:baz}
SecondChild.mappings    # {:foo=>:bar, :bar=>:baz}

{% endhighlight %}

It is far from the how it supposed to work. I would't say that `class_attribute` behavior is "slightly" different than "class_inheritable_hash". It is completely different method! But there is no place for complaining. We have to deal with it. How can we do it? Actually quite simple. Just call `dup` method on an inheritable attribute:

{% highlight ruby %}
class Base
  class_attribute :mappings
  self.mappings = {}
end

class FirstChild < Base
  self.mappings = self.mappings.dup
  self.mappings[:foo] = :bar
end

class SecondChild < Base
  self.mappings = self.mappings.dup
  self.mappings[:bar] = :baz
end

Base.mappings           # {}
FirstChild.mappings     # {:foo=>:bar}
SecondChild.mappings    # {:bar=>:baz}

{% endhighlight %}

Exactly as expected! Hooray!


