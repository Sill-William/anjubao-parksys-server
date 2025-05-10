let $ = layui.$
let util = layui.util
let layer = layui.layer

let restrictedFormatter = `
<div>
{{# if(parseInt(d.car_restricted) === 0){ }}
  否
{{# } else{ }}
  是
{{# } }}
</div>
`

let infoLayer = (o) => {
  const { car_id, car_sign, user_name } = o
  let content = `
  <div>
    <table class="layui-table"> 
      <tr>
        <td>ID</td>
        <td>${car_id}</td>
      </tr>
      <tr>
        <td>用户名</td>
        <td>${user_name}</td>
      </tr>
      <tr>
        <td>车牌号</td>
        <td>${car_sign}</td>
      </tr>
    </table>
  </div>
  `
  layer.open({
    type: 1,
    title: '汽车信息',
    area: ['700px', 'auto'],
    content: content,
    shade: 0.6, // 遮罩透明度
    shadeClose: true, // 点击遮罩区域，关闭弹层
    maxmin: true, // 允许全屏最小化
    anim: 0, // 0-6 的动画形式，-1 不开启
  })
}

let deleteConfirm = (records) => {
  layer.confirm(
    '确认删除吗？',
    {
      btn: ['确认', '取消'],
      title: '提示',
      closeBtn: 0,
      move: false, 
    },
    () => {
      let cnt = records.length
      records.forEach((item) => {
        $.ajax({
          url: `/car/${item.id}`,
          method: 'delete',
          error: function (res) {
            cnt -= 1
          }
        })
      })
      setTimeout(() => {
        layer.closeAll()
        layer.msg('删除成功'+ cnt +'条数据')
        table.reload('car-table', { url: '/car/all' })
      }, 1000)
    },
    () => {}
  )
}

layui.use(['table'], function () {
  let table = layui.table
  
  table.render({
    elem: '#car-table',
    url: '/car/all',
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
      {field: 'car_id', minWidth: 290, title: 'ID', totalRow: '合计：'},
      {field: 'car_sign', title: '车牌号'},
      {field: 'user_name', title: '用户'},
      {field: 'car_restricted', title: '封禁状态', templet: restrictedFormatter},
      {fixed: 'right', title:'操作', minWidth: 175, templet: '#line-operations'},
    ]],
    done: function () {
      console.log('table done')
      $('#table-toolbar-btn-add').addClass('layui-btn-disabled')
      $('#table-toolbar-btn-delete').addClass('layui-btn-disabled')
      $('#table-toolbar-btn-edit').addClass('layui-btn-disabled')
      $('.line-edit').addClass('layui-btn-disabled')
      $('.line-delete').addClass('layui-btn-disabled')
      if ($('#table-toolbar-btn-restrict').length === 0) {
        $('<button class="layui-btn" id="table-toolbar-btn-restrict" lay-event="restrict">封禁</button>').appendTo('#table-toolbar-container')
      }
      if ($('#table-toolbar-btn-unrestrict').length === 0) {
        $('<button class="layui-btn" id="table-toolbar-btn-unrestrict" lay-event="unrestrict">解封</button>').appendTo('#table-toolbar-container')        
      }
    }
  })

  table.on('toolbar(car-table)', function (o) {
    let id = o.config.id
    let checkStatus = table.checkStatus(id)
    let data = checkStatus.dataCache
    let dataC = table.cache['car-table']
    console.debug('check status', checkStatus)
    switch (o.event) {
      case 'dele':
        console.debug('dele')
        if (checkStatus.data.length === 0) {
          layer.msg('请选择至少一条记录')
          return
        }
        deleteConfirm(checkStatus.data)
        break
      case 'info':
        if (checkStatus.data.length !== 1) {
          layer.msg('请选择且最多选择一条记录')
          return
        }
        infoLayer(checkStatus.data[0])
        break
        case 'restrict':
        data.forEach(ele => {
          $.ajax({
            url: '/car/lock/' + ele.car_id,
            method: 'PATCH',
            success: function (data) {
              if (data.attached) {
                layer.msg('封禁成功')
                console.debug(dataC[ele.LAY_INDEX])
                dataC[ele.LAY_INDEX].car_restricted = 1
                // 更新渲染
                return
              }
              layer.msg('封禁失败')
            }
          })
        })
        setTimeout(() => {
          table.reload('car-table', {
            data: dataC
          })
        }, 1500)
        break
      case 'unrestrict':
        data.forEach(ele => {
          console.debug(ele)
          $.ajax({
            url: '/car/release/' + ele.car_id,
            method: 'PATCH',
            success: function (data) {
              if (data.attached) {
                layer.msg('解封成功')
                console.debug(dataC[ele.LAY_INDEX])
                dataC[ele.LAY_INDEX].car_restricted = 0
                // 更新渲染
                return
              }
              layer.msg('解封失败')
            }
          })
        })
        setTimeout(() => {
          table.reload('car-table', {
            data: dataC
          })
        }, 1500)
        break
      default:
        break
    }
  })

  table.on('tool(car-table)', function (o) {
    let id = o.config.id
    let data = o.data
    switch (o.event) {
      case 'info':
        infoLayer(data)
        break
      default:
        break 
    }
  })
})