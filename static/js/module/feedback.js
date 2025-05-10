let $ = layui.$

let infoLayer = function (o) {
  const { id, content, created } = o 
  let _content = `
  <div>
    <table class="layui-table"> 
      <tr>
        <td>ID</td>
        <td>${id}</td>
      </tr>
      <tr>
        <td>反馈内容</td>
        <td>${content}</td>
      </tr>
      <tr>
        <td>反馈内容</td>
        <td>${new Date(created).toLocaleString('zh-cn')}</td>
      </tr>
    </table>
  </div>
  `
  layer.open({
    type: 1,
    title: '反馈详细',
    area: ['700px', 'auto'],
    content: _content,
    shade: 0.6, // 遮罩透明度
    shadeClose: true, // 点击遮罩区域，关闭弹层
    maxmin: true, // 允许全屏最小化
    anim: 0, // 0-6 的动画形式，-1 不开启
  })
}

layui.use(['table'], function () {
  let table = layui.table
  
  table.render({
    elem: '#feedback-table',
    url: '/feedback/all',
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
      {field: 'id', fixed: 'left', title: 'ID', },
      {field: 'content', title: '评价', },
      {field: 'created', title: '时间', minWidth: 150, templet: `<div>{{= new Date(d.created).toLocaleString('zh-cn') }}</div>` },
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

  table.on('toolbar(feedback-table)', function (o) {
    let id = o.config.id
    let checkStatus = table.checkStatus(id)
    let data = checkStatus.dataCache
    let dataC = table.cache['feedback-table']
    switch (o.event) {
      case 'info':
        if (data.length !== 1) {
          layer.msg('请选择且最多选择一条记录')
          return
        }
        console.debug('info')
        infoLayer(data[0])
        break
      default:
        break
    }
  })

  table.on('tool(feedback-table)', function (o) {
    let id = o.config.id
    let data = o.data
    switch (o.event) {
      case 'info':
        infoLayer(data)
        break
    }
  })
})