---
layout: post
title: Deploying Hubot to Heroku like a boss
excerpt: How to get running Hubot on heroku in the right way
keywords: hubot, heroku, npm, nodejs, node, coffeescript, javascript, deploying, git, github, homebrew, redis
---

#### What is Hubot?

[Hubot][hubot] was an almost mythical GitHub [campfire][campfire] bot. They use it for deploying, automate a lot of tasks, and to be a source of fun in the company. Was, because they [open sourced][hubot-released] it some time age.

#### Hubot & Heroku

When I decided to give hubot a try on [Heroku][heroku] I googled for it and found [a few][tutorial-1] [tutorials][tutorial-2] and [blog posts][tutorial-3]. All of them advise to download (or clone) main [hubot repository][hubot-repo] and deploy it to heroku. In may opinion this is not the best way to do it. This post describes how to create separated deployable hubot application.

#### Tools needed

You will need a [ruby][ruby], [git][git], [node.js][nodejs], [npm][npm] and a heroku gem installed. Ruby and git is pretty common. You will install heroku gem by:

``` bash
$ gem install heroku
```

then node.js with Homebrew

``` bash
$ brew install node
```

and npm

``` bash
$ curl http://npmjs.org/install.sh | sh
```

#### Things done locally

Clone [hubot repository][hubot-repo] and create a new directory that will deployed to heroku.

``` bash
$ git clone git://github.com/github/hubot.git
$ cd hubot
$ npm install    # install all required dependencies
$ bin/hubot --create ../acmebot
```

If you go to the created directory you should see file structure similar to this:
``` bash
$ cd ../acmebot
$ ls -l
~/www/blog/hubot/acmebot  
total 32
-rw-r--r--   1 martinciu  staff    36 31 paź 21:28 Procfile
-rw-r--r--   1 martinciu  staff  3411 31 paź 21:28 README.md
drwxr-xr-x   3 martinciu  staff   102 31 paź 21:28 bin
-rw-r--r--   1 martinciu  staff    56 31 paź 21:28 hubot-scripts.json
-rw-r--r--   1 martinciu  staff   518 31 paź 21:28 package.json
drwxr-xr-x  12 martinciu  staff   408 31 paź 21:28 scripts
```

This will be your hubot application that you will deploy to heroku. First create a new git repository.
``` bash
$ git init .
$ git add .
$ git commit -m "initial commit"
```

Now you can create a new heroku app.

``` bash
$ heroku create acmebot --stack cedar
```

And now you can deploy your own hubot to heroku. 

``` bash
$ git push heroku
```

#### Heroku configuration

It is deployed, but hubot won't join any [campfire][campfire] room because it doesn't know anything about it. You have to tell him what room(s) should he go to. You can do it by heroku configuration variables.

``` bash
# Campfire user's token. You can find it on user's profile pages.
# You should probably have additional campfire user for a hubot 
$ heroku config:add HUBOT_CAMPFIRE_TOKEN=secret
# room ids coma-separated (you can find room id in room URL)
$ heroku config:add HUBOT_CAMPFIRE_ROOMS=123 
# your campfire account subdoamin
$ heroku config:add HUBOT_CAMPFIRE_ACCOUNT="acme"
```

For some scripts [Redis][redis] is required. You can add a free [RedisToGo][redistogo] service by typing:

``` bash
$ heroku addons:add redistogo:nano
```

All is set up. Now you can start hubot:

``` bash
$ heroku ps:scale app=1 
```

#### It's alive!

Now if you go to you campfire room and type

``` bash
$ Hubot help 
```

you should get a list of commands that your Hubot is familiar with. 

#### When it is not alive :/

If hubot doesn't speak to you, it means that something went wrong. In that case you can check heroku logs by typing in console:

``` bash
$ heroku logs 
```

You can also check application status by typing:

``` bash
$ heroku ps 
```


#### More scripts
You have just deployed a basic hubot set up. If you want to add more commands you can find them on the [hubot-scripts  repository][hubot-scripts]. It is already added to you your copy of hubot. To turn it on you should edit `hubot-scripts.json` file. It is simple JSON file with list of custom scripts that should be loaded. At the time of writing some of the scripts that are available in the hubot-scripts repository are not yet available on the npm. So if your hubot doesn't start after adding some custom scripts, check it's log files to see what scripts can't be found.

#### Robot's name

Hubot only talks to you if you call him by name. And it is a new of the user who's token hubot uses. You can specify that name in the `Procfile`

``` ruby
app: bin/hubot --adapter campfire --name acmebot --enable-slash
```

And if you don't want to talk to hubot by name you can add `--enable-slash` option. It will allow to replace robot's name with `/`. Example:

``` bash
/mustache me lady gaga 
```

[tutorial-1]: https://github.com/github/hubot/wiki/Hubot-on-Heroku
[tutorial-2]: http://apocryph.org/2011/10/29/how-i-got-hubot-deployed-to-heroku/
[tutorial-3]: http://jonmagic.com/blog/archives/2011/10/28/hipchat-hubot-and-me
[hubot]: http://hubot.github.com/
[hubot-repo]: https://github.com/github/hubot
[hubot-scripts]: https://github.com/github/hubot-scripts
[campfire]: http://campfirenow.com/
[heroku]: http://www.heroku.com/
[github]: https://github.com/
[npm]: http://npmjs.org/
[git]: http://git-scm.com/
[ruby]: http://www.ruby-lang.org
[nodejs]: http://nodejs.org/
[homebrew]: http://mxcl.github.com/homebrew/
[redis]: http://redis.io/
[redistogo]: https://redistogo.com/
[hubot-released]: https://github.com/blog/968-say-hello-to-hubot
