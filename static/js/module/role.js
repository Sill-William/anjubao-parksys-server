let $ = layui.$

layui.use(['table'], function () {
  let table = layui.table
  
  table.render({
    elem: '#role-table',
    url: '/role/all',
    toolbar: '#table-toolbar',
    defaultToolbar: ['filter', 'exports', 'print'],
    height: 'full-50',
    even: true,
    css: [
    ].join(''),
    cellMinWidth: 80,
    cols: [[
      {type: 'checkbox', fixed: 'left'},
      {field: 'id', fixed: 'left', title: 'ID',},
      {field: 'name', title: '名称', },
      {field: 'description', title: '描述'},
      // {fixed: 'right', title:'操作', width: 134, minWidth: 125, templet: '#toolDemo'}
    ]],
    done: function () {
      console.log('table done')
      $('#table-toolbar-btn-add').addClass('layui-btn-disabled')
      $('#table-toolbar-btn-delete').addClass('layui-btn-disabled')
      $('#table-toolbar-btn-edit').addClass('layui-btn-disabled')
      $('#table-toolbar-btn-info').addClass('layui-btn-disabled')
    }
  })

  table.on('toolbar(role-table)', function (o) {
    switch (o.event) {
      case 'add':
				console.debug('addi')
				break;
      case 'dele':
        console.debug('dele')
        break;
			case 'edit':
        console.debug('edit')
				break;
      case 'info':
        console.debug('info')
        break;
      default:
        break;
    }
  })
})