let $ = layui.$

let infoLayer = function (o) {
  const { evaluate_id, user_name, evaluate_score, evaluate_comment, time } = o 
  let content = `
  <div>
    <table class="layui-table"> 
      <tr>
        <td>ID</td>
        <td>${evaluate_id}</td>
      </tr>
      <tr>
        <td>用户名</td>
        <td>${user_name}</td>
      </tr>
      <tr>
        <td>评分</td>
        <td>${evaluate_score}</td>
      </tr>
      <tr>
        <td>评价</td>
        <td>${evaluate_comment}</td>
      </tr>
      <tr>
        <td>时间</td>
        <td>${time}</td>
      </tr>
    </table>
  </div>
  `
  layer.open({
    type: 1,
    title: '停车场信息',
    area: ['700px', 'auto'],
    content: content,
    shade: 0.6, // 遮罩透明度
    shadeClose: true, // 点击遮罩区域，关闭弹层
    maxmin: true, // 允许全屏最小化
    anim: 0, // 0-6 的动画形式，-1 不开启
  })
}

layui.use(['table'], function () {
  let table = layui.table
  
  table.render({
    elem: '#evaluate-table',
    url: '/evaluate/all',
    toolbar: '#table-toolbar',
    defaultToolbar: ['filter', 'exports', 'print'],
    height: 'full-50',
    css: [
    ].join(''),
    cellMinWidth: 80,
    page: true,
    even: true,
    cols: [[
      {type: 'checkbox', fixed: 'left'},
      {field: 'evaluate_id', fixed: 'left', title: 'ID', },
      {field: 'user_name', title: '用户名', },
      {field: 'park_name', title: '停车场名称', },
      {field: 'evaluate_score', title: '评分', },
      {field: 'evaluate_comment', title: '评价', },
      {field: 'evaluate_created', title: '评价时间', },
      {fixed: 'right', title:'操作', minWidth: 155, templet: '#line-operations'}
    ]],
    done: function () {
      console.log('table done')
      $('#table-toolbar-btn-add').addClass('layui-btn-disabled')
      $('#table-toolbar-btn-delete').addClass('layui-btn-disabled')
      $('#table-toolbar-btn-edit').addClass('layui-btn-disabled')
      $('.line-edit').addClass('layui-btn-disabled')
      $('.line-delete').addClass('layui-btn-disabled')
    }
  })

  table.on('toolbar(evaluate-table)', function (o) {
    let id = o.config.id
    let checkStatus = table.checkStatus(id)
    let data = checkStatus.dataCache
    let dataC = table.cache['evaluate-table']
    switch (o.event) {
      case 'info':
        console.debug('info')
        infoLayer(data[0])
        break;
      default:
        break;
    }
  })
})