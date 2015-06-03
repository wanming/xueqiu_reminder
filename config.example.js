
module.exports = {

  email: [
    'yourmail@xxxxxx.com'
  ],

  errorEmail: 'yourmail@xxxxxx.com',

  stock: [
    'ZH010389'
  ],

  sender: {
    user: 'yourmail@xxxxxx.com', 
    password: 'xxxxxxxx', 
    host: 'smtp.xxxxx.com', 
    ssl: true
  },

  url: {
    base: 'http://xueqiu.com/P/{stock}',
    json: 'http://xueqiu.com/cubes/rebalancing/history.json?cube_symbol={stock}&count=20&page=1'
  },

  template: {
    title: 'XQ:<%= stock_name %> REBALCANCED!',
    content: 
      '<h3><a href="<%= html_url %>"><%= stock_name %>(<%= stock_symbol %>)</a></h3>' +
      '<p><%= updated_at %></p>' +
      '<ul>' +
      '<% list.forEach(function (item, idx) { %>' +
        '<li><%= idx + 1 %>.<%= item.stock_name %>(<%= item.stock_symbol %>): <%= +item.prev_weight %>%  ->  <%= +item.weight %>%</li>' +
      '<% }) %>' +
      '</ul>'
  },

  log: './log.txt'
}