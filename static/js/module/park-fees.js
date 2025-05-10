let $ = layui.$
let util = layui.util
let layer = layui.layer
let form = layui.form

const parkId = $('#park-id').text().trim()

let formLayer = (pid, o) => {
  let start = ''
  let end = ''
  if (o) {
    const s = new Date(o.start)
    const e = new Date(o.end)
    start = `${s.getHours().toString().padStart(2, '0')}:${s.getMinutes().toString().padStart(2, '0')}`
    end = `${e.getHours().toString().padStart(2, '0')}:${e.getMinutes().toString().padStart(2, '0')}`
  }
  let content = `
<div class="pa3">
  <form class="layui-form" action="/park-fee/" layui-filter="park-${o ? 'edit' : 'addi'}-form">
    <div class="layui-form-item">
      <label class="layui-form-label">停车场编号</label>
      <div class="layui-input-block">
        <input type="text" name="park" required layui-verify="required" autocomplete="off" class="layui-input" value="${pid}" disabled />
      </div>
    </div>
    <div class="layui-form-item">
      <label class="layui-form-label">费率</label>
      <div class="layui-input-block">
        <input type="number" name="fee" required layui-verify="required" placeholder="请输入时段小时费率" autocomplete="off" class="layui-input" value="${o ? o.fee : 0}" />
      </div>
    </div>
    <div class="layui-form-item">
      <label class="layui-form-label">开始时间</label>
      <div class="layui-input-block">
        <input type="time" name="start" required layui-verify="required" autocomplete="off" class="layui-input" value="${start}" />
      </div>
    </div>
    <div class="layui-form-item">
      <label class="layui-form-label">结束时间</label>
      <div class="layui-input-block">
        <input type="time" name="end" required layui-verify="required" autocomplete="off" class="layui-input" value="${end}" />
      </div>
    </div>
    <div class="layui-form-item">
      <div class="layui-input-block">
        <button type="submit" class="layui-btn" lay-submit lay-filter="${o ? 'park-edit-form-submit' : 'park-addi-form-submit'}">提交</button>
        <button type="reset" class="layui-btn layui-btn-primary">重置</button>
      </div>
    </div>
  </form>
</div>
  `
  layer.open({
    type: 1,
    title: '添加停车场',
    area: ['60%', '100%'],
    offset: 'rt', // 右上角
    anim: 'slideLeft', // 从右侧抽屉滑出
    shadeClose: true,
    scrollbar: false,
    content: content, 
    success: function (layero, index) {
      
      const s2d = function (s) {
        let [h, m] = s.split(':')
        return new Date(0, 0, 0, h, m)
      }

      form.on('submit(park-addi-form-submit)', function (o) {
        let data = o.field
        data.park = pid
        data.start = s2d(data.start)
        data.end = s2d(data.end)
        console.debug(data)
        
        $.post('/park-fee/', data, function (res) {
          if (!res.attached) {
            layer.msg('添加失败')
            return
          } 
          layer.closeAll()
          layer.msg('添加成功') 
          setTimeout(() => table.reload('park-fees-table', { url: `/park-fee/all?park=${parkId}` }), 1000)
        })
        return false
      })

      form.on('submit(park-edit-form-submit)', function (o) {
        let data = o.field
        data.park = pid
        data.start = s2d(data.start)
        data.end = s2d(data.end)
        $.put('/park-fee/', data, function (res) {
          if (!res.attached) {
            layer.msg('修改失败')
            return
          }
          layer.closeAll()
          layer.msg('修改成功')
        })
        return false
      })

      form.render()
    }
  })
}

let infoLayer = (o) => {
  const { id, park, fee, start, end } = o
  let content = `
  <div>
    <table class="layui-table"> 
      <tr>
        <td>ID</td>
        <td>${id}</td>
      </tr>
      <tr>
        <td>所属停车场编号</td>
        <td>${park}</td>
      </tr>
      <tr>
        <td>费率（元/小时）</td>
        <td>${fee}</td>
      </tr>
      <tr>
        <td>开始时间</td>
        <td>${new Date(start).toLocaleString('zh-cn')}</td>
      </tr>
      <tr>
        <td>结束时间</td>
        <td>${new Date(end).toLocaleString('zh-cn')}</td>
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

let deleLayer = (o) => {
  layer.confirm(
    '确认删除吗？',
    {
      btn: ['确认', '取消'],
      title: '提示',
      closeBtn: 0,
      move: false,
    },
    () => {
      let cnt = o.length
      o.forEach((i) => {
        $.ajax({
          url: `/park-fee/${i.id}`,
          method: 'DELETE',
          error: function (err) {
            cnt -= 1
          }
        })
        setTimeout(() => {
          layer.closeAll()
          layer.msg('删除成功 ' + cnt + ' 条数据')
          table.reload('park-fees-table', { url: `/park-fee/all?park=${parkId}` })
        }, 1000)
      })
    }
  )
}

layui.use(['table'], function () {
  let table = layui.table
  
  table.render({
    elem: '#park-fees-table',
    // url: '/park-fee/all?park=95d306da-490f-4ea8-9348-0635bc9b46b5',
    url: `/park-fee/all?park=${parkId}`,
    toolbar: '#table-toolbar',
    defaultToolbar: ['filter', 'exports', 'print'],
    height: 'full-100',
    css: [
    ].join(''),
    cellMinWidth: 80,
    page: true,
    even: true,
    cols: [[
      {type: 'checkbox', fixed: 'left'},
      {field: 'id', minWidth: 290, title: 'ID', totalRow: '合计：'},
      {field: 'park', title: '所属停车场编号', },
      {field: 'fee', title: '费率（元/小时）' },
      {field: 'start', title: '开始时间', templet: `<div>{{= new Date(d.created).toLocaleString('zh-cn') }}</div>` },
      {field: 'end', title: '结束时间', templet: `<div>{{= new Date(d.created).toLocaleString('zh-cn') }}</div>` },
      {fixed: 'right', title:'操作', minWidth: 175, templet: '#line-operations'},
    ]],
    done: function () {
      console.log('table done')
      
    }
  })

  table.on('toolbar(park-fees-table)', function (o) {
    let id = o.config.id
    let checkStatus = table.checkStatus(id)
    let data = checkStatus.dataCache
    let dataC = table.cache['park-fees-table']
    console.debug('check status', checkStatus)
    switch (o.event) {
      case 'addi':
        formLayer(parkId)
        break
      case 'dele':
        console.debug('dele')
        deleLayer(data)
        break
      case 'edit':
        if (checkStatus.data.length !== 1) {
          layer.msg('请选择且最多选择一条记录')
          return
        }
        formLayer(parkId, data[0])
        break
      case 'info':
        if (checkStatus.data.length !== 1) {
          layer.msg('请选择且最多选择一条记录')
          return
        }
        infoLayer(checkStatus.data[0])
        break
      default:
        break
    }
  })

  table.on('tool(park-fees-table)', function (o) {
    let id = o.config.id
    let data = o.data
    switch (o.event) {
      case 'edit':
        formLayer(parkId, data)
        break
      case 'dele': 
        deleLayer([data])
        break
      case 'info':
        infoLayer(data)
        break
      default:
        break 
    }
  })
})