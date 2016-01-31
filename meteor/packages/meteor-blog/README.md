# Meteor Blog

This Meteor package gives you a basic, out-of-the-box blog at `/blog` (or where
ever). 

This blog is very much a work in progress. To help decide what gets added next,
vote with your [Github issues](https://github.com/meteor-blog/meteor-blog/issues)!

**NEW REPO**: We have moved `meteor-blog` to a Github org. Please update your
remotes with `git remote set-url origin https://github.com/meteor-blog/meteor-blog.git`.

[![Meteor Icon](http://icon.meteor.com/package/ryw:blog)](https://atmospherejs.com/ryw/blog)

## Table of Contents

* [Introduction](#introduction)
  * [Why?](#why)
  * [Example App](#example-app)
  * [Installation](#installation)
  * [Features](#features)
  * [Roadmap](#roadmap)
  * [Changelog](#changelog)
* [Concepts](#concepts)
  * [Routing](#routing)
    * [Custom Base Paths](#custom-base-paths)
    * [pathFor](#pathfor)
  * [Roles](#roles)
  * [Admin Templates](#admin-templates)
  * [Custom Templates](#custom-templates)
    * [Custom Layout](#custom-layout)
    * [Custom notFound](#custom-notfound)
  * [Comments](#comments)
    * [DISQUS](#disqus)
    * [SideComments.js](#sidecommentsjs)
  * [Images](#images)
    * [S3 Images](#s3-images)
  * [Blog Post Modes](#blog-post-modes)
  * [Blog Post Excerpt](#blog-post-excerpt)
  * [Pagination](#pagination)
  * [Code Highlighting](#code-highlighting)
  * [Social Sharing](#social-sharing)
  * [Recent Posts Widget](#recent-posts-widget)
  * [RSS](#rss)
  * [Language Support](#language-support)
* [License](#license)

## Introduction

### Why?

We wanted a way to add a meteor-based blog within an existing project without
running another app.

### Example App

You can view an example application (without customization) at
http://blog-example.meteor.com ([repo](https://github.com/meteor-blog/example-blog-app)).

### Installation

```bash
$ meteor add ryw:blog
```

You will by default get routes for:

```
/blog
/admin/blog
```

These paths are customizable (see below). `/admin/blog` requires that `Meteor.user()` return a user.

### Features

* Medium-style editor
* Slug-based URLs (editable)
* Add blog post images (store in database or upload to S3)
* Add featured, "hero" image for a post
* Support DISQUS comments
* Blog post tags and tag view
* Widget to embed recent posts on another (e.g. home) page
* Customizable layouts & templates
* Custom base paths
* SEO best practices (OpenGraph, Twitter Cards, share buttons, Google+ author attribution)
* Autosave
* Pagination
* Code syntax highlighting
* Multiple roles (admin/author)
* Have Public, Private & Draft modes
* Support for both Iron Router and Flow Router
* RSS feed

### Roadmap

Check out the [enhancements tracker](https://github.com/meteor-blog/meteor-blog/issues?q=is%3Aopen+is%3Aissue+label%3Aenhancement)

### Changelog

Changes between releases can be found in [`CHANGES.md`](CHANGES.md)

## Concepts

You do not need any configuration at all, if you are happy with the defaults. To
configure your blog, create a file shared on client/server, probably in
`lib/blog.js`. 

### Routing

Meteor blog works with both Iron Router and Flow Router. If your app and the
blog have conflicting routes, your app will get priority.

If you use Flow Router, you must add `kadira:blaze-layout` to your app, as that is how Meteor blog renders its templates in a Flow Router route.

##### Custom Base Paths

You can customize the base path for the blog and for the blog admin area.

```javascript
Blog.config({
  basePath: '/myBlog', // '/myBlog', '/myBlog/my-post', '/myBlog/tag/whatever', etc.
  adminBasePath: '/myBlogAdmin'
});
```

If you set the `basepath` to `'/'`, blog posts will appear at the root path of
your app (e.g. http://myapp.com/my-post). This means that the blog index page
will be your home page, unless you override the route. This also means that
Meteor Blog can function as a crude CMS. For more CMS-like features, create a
[Github issue](https://github.com/meteor-blog/meteor-blog/issues)!

##### pathFor

If you need a `pathFor`-like way to generate URLs, you can use `blogPathFor` for either router (e.g. `{{blogPathFor 'blogIndex'}}`).

### Roles

By default, _any_ logged-in user can administer the blog. To ensure that only
select users can edit the blog, the package supports two roles:

- `adminRole` - Can create, and modify or delete any post.
- `authorRole` - Can create, and modify or delete only my own posts.

In addition, if using groups from the alanning:roles package, set the associated group using

- `adminGroup` - Group associated with `adminRole`.
- `authorGroup` - Group associated with `authorRole`.

To enable either or both roles, specify values in the blog config:

```javascript
Blog.config({
  adminRole: 'blogAdmin',
  authorRole: 'blogAuthor'
});
```

Then, you need to give blog users that role. Currently, you're on your own to
add these roles somehow:

* Add these directly to admin users in the database (`"roles": ["blogAdmin"]`), or
* Roll your own admin page using the methods provided by [meteor-roles](https://atmosphere.meteor.com/package/roles), or
* Use an accounts admin package like [accounts-admin-ui-bootstrap-3](https://atmosphere.meteor.com/package/accounts-admin-ui-bootstrap-3).

### Admin Templates

The admin templates are designed for use with Bootstrap. To use the admin area, 
you should add the meteor `bootstrap-3` package.

```bash
$ meteor add mrt:bootstrap-3
```

### Custom Templates

The admin templates are designed for use with Bootstrap. However, the front-end
is bare markup, ready to by styled, and does not depend on any CSS framework at
all. If the default templates aren't doing it for you, you can override the
default templates with your own by setting configuration variables:

```javascript
Blog.config({
  blogIndexTemplate: 'myBlogIndexTemplate', // '/blog' route
  blogShowTemplate: 'myShowBlogTemplate'    // '/blog/:slug' route
});
```

In your templates, you can use these Spacebars helpers provided by the package
to display blog posts with some basic, semantic markup:

* `{{> blogIndex}}` - Renders list of blog posts (`/blog` route)
* `{{> blogShow}}` - Renders single blog post (`/blog/:slug` route)

Example:

```html
<template name="myBlogIndexTemplate">
  <h1>Welcome to my Blog</h1>
  <div>{{> blogIndex}}</div>
</template>
```

If you don't want any of our markup, use the blog data provided in the template
context directly:

* `blogReady` - Flag that is true when blog data is ready
* `posts` - List of [`minimongoid`](https://github.com/Exygy/minimongoid) blog post objects (`/blog` route)
* `post` - [`minimongoid`](https://github.com/Exygy/minimongoid) blog post object (`/blog/:slug` route)

Example:

```html
<template name="myBlogIndexTemplate">
  <h1>Welcome to my Blog</h1>
  <ul>
    {{#if blogReady}}
      {{#each posts}}
        <li>
          <h2>{{title}}</h2>
          <p>Published on {{publishedAt}}</p>
          <p>Excerpt: {{excerpt}}</p>
        </li>
      {{else}}
        <li>No posts found.</li>
      {{/each}}
    {{else}}
      <li>Loading...</li>
    {{/if}}
  </ul>
</template>
```

##### Custom Layout

By default, the layout configured for your app is used. To specify a layout for
only the blog pages:

```javascript
Blog.config({
  blogLayoutTemplate: 'myBlogLayout'
});
```

##### Custom notFound

By default, if the browser loads a non-existent blog post, it will use your
app's `notFound` handling. You can provide a custom `notFoundTemplate` to use
when a blog post slug is not found.

```javascript
Blog.config({
  blogNotFoundTemplate: 'myNotFoundTemplate'
});
```

### Comments

Meteor Blog has no built-in commenting feature.

##### DISQUS

This package supports [DISQUS](http://disqus.com) comments. Configure your
DISQUS short name in the client and comments will render below all your blog
posts. If you use your own `blogShowTemplate` template, include `{{> disqus this}}` to
display comments.

```javascript
Blog.config({
  comments: {
    disqusShortname: 'myshortname'
  }
});
```

##### SideComments.js

This package has experimental integration with [SideComments.js](http://aroc.github.io/side-comments-demo/).
Enable side comments in your blog settings. Currently, side comments uses the
Meteor accounts for your Meteor site as comment users, which is probably not
what you want. You can also allow anonymous comments, which lets anyone type in
anything without even a name. Also, probably not what you want.

```javascript
Blog.config({
  comments: {
    useSideComments: true, // default is false
    allowAnonymous: true   // default is false
  }
});
```

### Images

Adding images to your blog posts works out of the box and saves the images to
gridFS in your Mongo database.

##### S3 Images

You can optionally have these images to an Amazon S3 bucket that you configure.
To setup S3 for file storage, add the following in `/settings.json` (or any
other location of your choice).

```json
{
  "public": {
    "blog": {
      "useS3": true
    }
  },
  "private": {
    "blog": {
      "s3Config": {
        "bucket": "your-bucket-name",
        "s3ACL": "public-read",
        "s3MaxTries": 2,
        "accessKeyId": "XXXXXXXXXXXXX",
        "secretAccessKey": "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
        "region": "(OPTIONAL most of the time)"
      }
    }
  }
}
```

### Blog Post Modes

When creating a blog post in the admin, you can set one of three modes:

* `Public` - Listed in the blog and viewable by anyone
* `Private` - Not listed in the blog, but viewable by anyone with the link
* `Draft` - Unpublished and only viewable in the blog admin area

### Blog Post Excerpt

By default, blog summaries or excerpts are generated by taking the 1st paragraph
from the blog post. You can override this function by configuring a custom
`excerptFunction`. For example, if you wanted to create an excerpt from the 1st
sentence:

```javascript
Blog.config({
  excerptFunction: function(body) {
    return body.split('.')[0] + '.';
  }
});
```

### Pagination

By default, blog posts are paged in 20 at a time.  You can modify this value in
settings. Set to `null` to turn off paging entirely.

```javascript
Blog.config({
  pageSize: 10
});
```

The default `blogIndexTemplate` template displays a `Load More` button. If you
use your own template, include the `{{blogPager}}` helper to display the button.

### Code Highlighting

If you fancy a coding blog, the blog package supports syntax highlighting using
[highlight.js](http://highlightjs.org/). If enabled, any content within `<pre>`
tags will get modified for syntax highlighting. You can specify any
[`highlight.js` style file](https://github.com/isagalaev/highlight.js/tree/master/src/styles).
Example config:

```javascript
Blog.config({
  syntaxHighlighting: true, // default is false
  syntaxHighlightingTheme: 'atelier-dune.dark' // default is 'github'
});
```

### Social Sharing

This package depends on the [`liberation:shareit` package](https://atmospherejs.com/liberation/shareit)
for powering social sharing.  If you use your own `blogShowTemplate` template,
include `{{> shareit}}` to display share buttons.

### Recent Posts Widget

You can include a basic snippet of HTML displaying recent blog posts (e.g. on
your home page). Insert the inclusion helper where you want the recent posts to
appear.

```html
{{> blogLatest}}
```

Or you can specify the # of posts to show:

```html
{{> blogLatest num=5}}
```

There are classes in the template for styling, but you can use your own widget
template as well.

```javascript
Blog.config({
  blogLatestTemplate: 'myLatestWidgetTemplate'
});
```

And then include `{{> myLatestWidgetTemplate}}` anywhere you want. It will
receive the following data context variables:

* `latest` - List of most recent `num` blog posts
* `date` - Date format helper

### RSS

An RSS feed is automatically generated at `/rss/posts`. To set the title and
description in the feed, configure RSS:

```javascript
Blog.config({
  rss: {
    title: 'My blog title',
    description: 'My blog description'
  }
});
```

Add a head tag somewhere in your `.html` files so your RSS feed can be discovered:

```html
<head>
  <link rel="alternate" type="application/rss+xml" title="My blog title" href="/rss/posts">
</head>
```

### Language support
You can change the text of the labels the blog uses in the Blog.config.  
The following are the default labels used:

```javascript
Blog.config({
  language: {
    blogEmpty: 'This blog is looking pretty empty...',
    backToBlogIndex: 'Back to the Blog',
    tags: 'Tags',
    slug: 'Slug',
    metaDescription: 'Meta Description',
    body: 'Body',
    showAsVisual: 'Visual',
    showAsHtml: 'HTML',
    save: 'Save',
    cancel: 'Cancel',
    "delete": 'Delete',
    metaAuthorBy: 'By',
    metaAuthorOn: 'on',
    edit: 'Edit',
    areYouSure: 'Are you sure?',
    disqusPoweredBy: 'comments powered by',
    adminHeader: 'Blog Admin',
    addPost: 'Add Blog Post',
    allPosts: 'All Posts',
    myPosts: 'My Posts',
    editPost: 'Edit Post',
    title: 'Title',
    author: 'Author',
    updatedAt: 'Updated At',
    publishedAt: 'Published At',
    visibleTo: 'Visible To',
    featuredImage: 'Featured Image',
    selectFile: 'Select File',
    imageAsBackground: 'Use as background for title',
    enterTag: 'Type in a tag & hit enter',
    postCreateFirst: 'Create the first blog',
    postVisibilityAdmins: 'Me & Admins only',
    postVisibilityLink: 'Anyone with link',
    postVisibilityAnyone: 'The world',
    saved: 'Saved',
    editFeaturedImageSaved: 'Featured image saved',
    editErrorSlugExists: 'Blog with this slug already exists',
    editErrorBodyRequired: 'Blog body is required'
  }
});
```

## License

MIT
