Meteor.methods

  serveRSS: () ->
    RSS = Npm.require('rss')
    host = Meteor.absoluteUrl()
    host = host.slice(0, host.length - 1)

    feed = new RSS
      title: Blog.settings.rss.title
      description: Blog.settings.rss.description
      feed_url: host + '/rss/posts'
      site_url: host
      image_url: host + '/favicon.ico'

    posts = Blog.Post.where
      mode: 'public'
    ,
      sort:
        publishedAt: -1
      limit: 20

    posts.forEach (post) ->
      feed.item
       title: post.title
       description: post.excerpt
       author: post.authorName()
       date: post.publishedAt
       url: "#{host}/blog/#{post.slug}"
       guid: post._id

    return feed.xml()
