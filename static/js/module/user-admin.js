let $ = layui.$
let layer = layui.layer
let util = layui.util
let table = layui.table
let form = layui.form
let dropdown = layui.dropdown

let infoLayer = (o) => {
  const { id, name, email, phone, gender, birthday, created, updated } = o
  let content = `
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
      <!-- <tr>
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
      </tr> -->
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
  layer.open({
    type: 1, // page 层类型
    area: ['700px', 'auto'],
    title: `用户详细 - ${o.name}`,
    shade: 0.6, // 遮罩透明度
    shadeClose: true, // 点击遮罩区域，关闭弹层
    maxmin: true, // 允许全屏最小化
    anim: 0, // 0-6 的动画形式，-1 不开启
    content: content
  })
}

let addiLayer = () => {
  let content = `
<div class="layui-panel h-100">
<div class="pa2">
  <form class="layui-form" action="/user/" method="post" lay-filter="form">
    <div class="layui-form-item">
      <label class="layui-form-label">邮箱</label>
      <div class="layui-input-block">
        <input type="text" name="email" required 
          lay-verify="required" autocomplete="off" placeholder="请输入邮箱" 
          class="layui-input" lay-filter="admin-email-input">
      </div>
    </div>
    <div class="layui-form-item">
      <label class="layui-form-label">管理员角色</label>
      <div class="layui-input-block">
        <select name="role" lay-filter="admin-role-selector" id="role-selector" >
          <option value="rootadmin">根管理员</option>
          <option value="useradmin">用户管理员</option>
          <option value="parkadmin">停车场管理员</option>
        </select>
      </div>
    </div>
    <div class="layui-form-item layui-hide" id="admin-park-input">
      <label class="layui-form-label">负责停车场</label>
      <div class="layui-input-block">
        <input name="park-name" autocomplete="on" placeholder="负责停车场" class="layui-input" 
          id="parkmanager-autocompleted" lay-filter="parkmanager-autocompleted" />
      </div>
    </div>
    <div class="layui-form-item layui-hide" >
      <label class="layui-form-label">负责停车场编号</label>
      <div class="layui-input-block">
        <input name="park" autocomplete="on" placeholder="负责停车场" class="layui-input" 
          id="park-id" lay-filter="park-id" />
      </div>
    </div>
    <div class="layui-form-item" id="admin-password">
      <label class="layui-form-label">密码</label>
      <div class="layui-input-block">
        <input type="text" name="password" disabled class="layui-input" value="123456#!@">
      </div>
    </div>
    <div class="layui-form-item">
      <div class="layui-input-block">
        <button type="submit" class="layui-btn" lay-submit lay-filter="submit">立即提交</button>
        <!-- <button type="reset" class="layui-btn layui-btn-primary">重置</button> -->
      </div>
    </div>
  </form>
</div>
</div>
`
layer.open({
  type: 1, // page 层类型
  area: ['700px', '500px'],
  title: `添加管理员`,
  shade: 0.6, // 遮罩透明度
  shadeClose: true, // 点击遮罩区域，关闭弹层
  maxmin: true, // 允许全屏最小化
  anim: 0, // 0-6 的动画形式，-1 不开启
  content: content,
  success: function (layero, index) {
    let parkmangerAutocompleted = layero.find('input[lay-filter="parkmanager-autocompleted"]')
    let parkmanagerBaseInput = layero.find('input[lay-filter="admin-email-input"]')
    let parkmanagerId = layero.find('input[lay-filter="park-id"]')
    let parkmangerAutocompletedLength = parkmanagerBaseInput.outerWidth()
    console.debug('width of parkmanager autocompleted is ' + parkmangerAutocompletedLength)
    let dropdownInst = dropdown.render({
      elem: `#parkmanager-autocompleted`,
      data: [],
      style: `min-width: ${parkmangerAutocompletedLength}px;`,
      closeOnClick: true,
      click: function (o) {
        parkmangerAutocompleted.val(o.title)
        parkmanagerId.val(o.id)
      }
    })
    parkmangerAutocompleted.on('input', function () {
      let value = $(this).val()
      $.ajax({
        url: '/park/all/ids',
        method: 'get',
        data: { keyword: value },
        success: function (res) {
          if (!res.attached || !res.data) {
            layer.msg('获取停车场列表失败')
            return
          }
          console.debug(res.data)
          dropdown.reloadData(dropdownInst.config.id, {
            data: res.data.map(rs => ({
              id: rs.id,
              title: rs.name,
              name: rs.name,
              address: rs.address,
            }))
          })
        }
      })
    })

    form.on('select(admin-role-selector)', function (o) {
      if (o.value === 'parkadmin') {
        $('#admin-park-input').removeClass('layui-hide')
      } else {
        $('#admin-park-input').addClass('layui-hide')
      }
    })

    form.on('submit(submit)', function (o) {
      let data = o.field
      data.password = md5(data.password)
      data.name = data.email
      if (data.role !== 'parkadmin') {
        delete data.park
      } 
      $.post('/user/', data, function(res) {
        if (res.attached) {
          layer.closeAll()
          layer.msg('添加成功')
          setTimeout(() => table.reload('user-admin-table', { url: '/user/all?role=admin' }), 1000)
        } else {
          layer.msg('添加失败')
        }
      })
      return false
    })

    form.render()
  },
})
}

let edit = function (data) {
  layer.open({
    type: 1, // page 层类型
    area: ['auto', 'auto'],
    title: `编辑管理员`,
    resize: false,
    move: false,
    content: `
      <div class="layui-panel h-100 w-100 flex align-center justify-center">
        <div class="pa2">
          <button class="layui-btn" lay-on="reset-password">
            重置密码
          </button>
        </div>
      </div>
    `,
    success: function (layero, index) {
      // 为按钮绑定事件
      layero.find('button[lay-on="reset-password"]').on('click', function () {
        $.ajax({
          url: `/user/`,
          method: 'PUT',
          data: {
            id: data.id,
            name: data.name,
            password: md5('123456#!@')
          }
        }).then((res) => {
          if (res.attached) {
            layer.closeAll() 
            layer.msg('重置成功')
          } else {
            layer.msg('重置失败')
          }
        })
      });
    }
  })
}

let dele = function (records) {
  layer.confirm(
    '确认删除吗？', 
    {
      btn: ['确认', '取消'],
      title: '提示',
      closeBtn: 0,
      move: false,
    }, 
    () => {
      console.debug("confirm")
      let cnt = records.length
      records.forEach((item) => {
        $.ajax({
          url: `/user/${item.id}`,
          method: 'DELETE',
          error: function (res) {
            cnt -= 1
          }
        })
      })
      setTimeout(() => {
        layer.closeAll()
        layer.msg('删除成功 ' + cnt + ' 条数据')
        table.reload('user-admin-table', { url: '/user/all?role=admin' })
      }, 1000)
    },
    () => {}
  )
}

layui.use(['table'], function () {

  table.render({
    elem: '#user-admin-table',
    url: '/user/all?role=admin',
    toolbar: '#table-toolbar',
    defaultToolbar: ['filter', 'exports', 'print'],
    height: 'full-50',
    css: [
    ].join(''),
    page: true,
    even: true,
    cellMinWidth: 80,
    cols: [[
      {type: 'checkbox', fixed: 'left'},
      {field: 'id', minWidth: 290, title: 'ID', totalRow: '合计：'},
      {field: 'name', minWidth: 80, title: '用户'},
      {field: 'email', title: '邮箱', hide: 0, width: 150 },
      // {field: 'phone', title: '手机号码', hide: 0, width: 150 },
      {field: 'created', title: '创建时间', minWidth: 150, templet: `<div>{{= new Date(d.created).toLocaleString('zh-cn') }}</div>` },
      {field: 'updated', title: '更新时间', sort: true, minWidth: 150, templet: `<div>{{= new Date(d.created).toLocaleString('zh-cn') }}</div>` },
      {fixed: 'right', title:'操作', minWidth: 175, templet: '#line-operations'},
    ]],
    done: function () {
      console.log('table done')
      $('#table-toolbar-btn-edit').addClass('layui-btn-disabled')
    }
  })

  table.on('toolbar(user-admin-table)', function (o) {
    let id = o.config.id
    let checkStatus = table.checkStatus(id)
    let data = checkStatus.dataCache
    let dataC = table.cache['user-admin-table']
    switch (o.event) {
      case 'addi':
        addiLayer()
				break;
      case 'dele':
        console.debug('dele')
        if (checkStatus.data.length < 1) {
          layer.msg('请至少选择一条记录')
          return
        }
        dele(checkStatus.data)
        break;
			case 'edit':
        console.debug('edit')
				break;
      case 'info':
        if (checkStatus.data.length !== 1) {
          layer.msg('请选择且最多选择一条记录')
          return
        }
        infoLayer(checkStatus.data[0])
        break;
      default:
        break;
    }
  })

  table.on('tool(user-admin-table)', function (o) {
    let id = o.config.id
    let data = o.data
    switch (o.event) {
      case 'info':
        infoLayer(data)
        break
      case 'edit':
        edit(data)
        break
      case 'dele':
        dele([data])
        break
      default:
        break
    }
  })
})