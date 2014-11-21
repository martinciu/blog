---
layout: page
title: "My Open Source projects"
date: 2014-11-21 00:48
comments: true
sharing: true
footer: true
---
<div id="content">
  <div id="projects">
    <h4>
      <a href="https://github.com/martinciu">GitHub</a> |
      <a href="https://rubygems.org/profiles/martinciu">RubyGems</a> |
      <a href="http://www.coderwall.com/martinciu/">coderwall</a> |
      <a href="http://codebrawl.com/users/martinciu">codebrawl</a>
    </h4>
  </div>
</div>

<script id="projectTemplate" type="text/x-jquery-tmpl">
  <h3>${name}</h3>
  <h6><strong>${watchers}</strong> watchers and <strong>${forks}</strong> forks on <a href="${github_url}">GitHub</a>, <strong>${downloads}</strong> downloads from <a href="${rubygems_url}">RubyGems</a></h6>
  <p>${description}</p>
</script>
