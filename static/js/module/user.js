let $ = layui.$
let util = layui.util
let layer = layui.layer

let genderFormatter = `
<div>
{{# if(parseInt(d.gender) === 0){ }}
  女
{{# } else{ }}
  男
{{# } }}
</div>
`
let restrictedFormatter = `
<div>
{{# if(parseInt(d.restricted) === 0){ }}
  否
{{# } else{ }}
  是
{{# } }}
</div>
`
let nullFormatter = (field) => `
<div>
{{# if(d.${field} === null) { }}
  用户未填写
{{# } else { }}
  {{= d.${field} }}
{{# } }}
</div>
`

let infoFactory = function ({ id, name, email, phone, gender, birthday, created, updated } = {}) {
  return `
  <div>
    <table class="layui-table">
      <tr>
        <td>ID</td>
        <td>${id}</td>
      </tr>
      <tr>
        <td>用户名</td>
        <td>${name}</td>
      </tr>
      <tr>
        <td>邮箱</td>
        <td>${email}</td>
      </tr>
      <tr>
        <td>手机号码</td>
        <td>${phone}</td>
      </tr>
      <tr>
        <td>性别</td>
        <td>${gender == 0 ? '女' : '男'}</td>
      </tr>
      <tr>
        <td>出生日期</td>
        <td>${new Date(birthday).toLocaleString('zh-cn')}</td>
      </tr>
      <tr>
        <td>创建时间</td>
        <td>${new Date(created).toLocaleString('zh-cn')}</td>
      </tr>
      <tr>
        <td>更新时间</td>
        <td>${new Date(updated).toLocaleString('zh-cn')}</td>
      </tr>
    </table>
  </div>
  `
}

let info = function (record) {
  layer.open({
    type: 1, // page 层类型
    area: ['700px', 'auto'],
    title: `用户详细 - ${record.name}`,
    shade: 0.6, // 遮罩透明度
    shadeClose: true, // 点击遮罩区域，关闭弹层
    maxmin: true, // 允许全屏最小化
    anim: 0, // 0-6 的动画形式，-1 不开启
    content: infoFactory(record)
  })
}

layui.use(['table'], function () {
  let table = layui.table
  
  table.render({
    elem: '#user-table',
    url: '/user/all?role=user',
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
      {field: 'id', minWidth: 290, title: 'ID', totalRow: '合计：'},
      {field: 'name', minWidth: 80, title: '用户'},
      // {field: 'email', title: '邮箱', hide: 0, width: 150 },
      {field: 'phone', title: '手机号码', hide: 0, width: 150, templet: nullFormatter('phone') },
      {field: 'gender', title: '性别', width: 80, templet: genderFormatter },
      {field: 'restricted', title:'封禁', width:80, templet: restrictedFormatter },
      {field: 'birthday', title: '出生日期', minWidth: 150, templet: `<div>{{= new Date(d.birthday).toLocaleString('zh-cn') }}</div>` },
      {field: 'created', title: '创建时间', minWidth: 150, templet: `<div>{{= new Date(d.created).toLocaleString('zh-cn') }}</div>` },
      {field: 'updated', title: '更新时间', sort: true, minWidth: 150, templet: `<div>{{= new Date(d.created).toLocaleString('zh-cn') }}</div>` },
      {fixed: 'right', title:'操作', minWidth: 175, templet: '#line-operations'},
    ]],
    done: function () {
      console.log('table done')
      $('#table-toolbar-btn-add').addClass('layui-btn-disabled')
      $('#table-toolbar-btn-delete').addClass('layui-btn-disabled')
      $('#table-toolbar-btn-edit').addClass('layui-btn-disabled')
      $('.line-edit').addClass('layui-btn-disabled')
      $('.line-delete').addClass('layui-btn-disabled')
      // $('#table-toolbar-container')
      if ($('#table-toolbar-btn-restrict').length === 0) {
        $('<button class="layui-btn" id="table-toolbar-btn-restrict" lay-event="restrict">封禁</button>').appendTo('#table-toolbar-container')
      }
      if ($('#table-toolbar-btn-unrestrict').length === 0) {
        $('<button class="layui-btn" id="table-toolbar-btn-unrestrict" lay-event="unrestrict">解封</button>').appendTo('#table-toolbar-container')        
      }
    }
  })

  table.on('toolbar(user-table)', function (o) {
    let id = o.config.id
    let checkStatus = table.checkStatus(id)
    let data = checkStatus.dataCache
    let dataC = table.cache['user-table']
    console.debug('check status', checkStatus)
    switch (o.event) {
      case 'dele':
        console.debug('dele')
        break
      case 'info':
        if (checkStatus.data.length !== 1) {
          layer.msg('请选择且最多选择一条记录')
          return
        } 
        info(checkStatus.data[0])
        break
      case 'restrict':
        data.forEach(ele => {
          $.ajax({
            url: '/user/lock/' + ele.id,
            method: 'PATCH',
            success: function (data) {
              if (data.attached) {
                layer.msg('封禁成功')
                dataC[ele.LAY_INDEX].restricted = 1
                // 更新渲染
                return
              }
              layer.msg('封禁失败')
            }
          })
        });
        setTimeout(() => {
          table.reload('user-table', {
            data: dataC
          })
        }, 1500)
        break
      case 'unrestrict':
        data.forEach(ele => {
          $.ajax({
            url: '/user/release/' + ele.id,
            method: 'PATCH',
            success: function (data) {
              if (data.attached) {
                layer.msg('解封成功')
                dataC[ele.LAY_INDEX].restricted = 0
                // 更新渲染
                return
              }
              layer.msg('解封失败')
            }
          })
        });
        setTimeout(() => {
          table.reload('user-table', {
            data: dataC
          })
        }, 1500)
        break
      default:
        break
    }
  })

  table.on('tool(user-table)', function (o) {
    let id = o.config.id
    let data = o.data
    switch (o.event) {
      case 'info':
        info(data)
        break
      default:
        break 
    }
  })
})