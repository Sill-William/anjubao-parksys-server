let $ = layui.$
let layer = layui.layer
let table = layui.table

let statusFormater = `
<div>
{{# if(parseInt(d.order_status) === 0){ }}
  等待支付定金
{{# } else if(parseInt(d.order_status) === 1) { }}
  已预约
{{# } else if(parseInt(d.order_status) === 2) { }}
  进行中
{{# } else if(parseInt(d.order_status) === 3) { }}
  待支付
{{# } else if(parseInt(d.order_status) === 4) { }}
  已完成
{{# } else if(parseInt(d.order_status) === 5) { }}
  已取消/作废
{{# } else { }}
  未知
{{# } }}
</div>
`
let nullDateFormatter = (field) => `
<div>
{{# if(d.${field} === null) { }}
  -
{{# } else { }}
  {{= new Date(d.${field}).toLocaleString('zh-cn') }}
{{# } }}
</div>
`
let nullMsgFormatter = (field) => `
<div>
{{# if(d.${field} === null) { }}
  已移除
{{# } else { }}
  {{= d.${field} }}
{{# } }}
</div>
`

let invalidLayer = (records) => {
  layer.confirm(
    '确认作废吗？',
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
          url: `/order/update`,
          method: 'patch',
          data: {
            id: item.order_id,
            status: 5
          },
          error: function (res) {
            cnt -= 1
          }
        })
      })
      layer.closeAll()
      setTimeout(() => {
        layer.msg('作废成功'+ cnt +'条数据')
        table.reload('order-table', { url: '/order/all' })
      }, 1500)
    },
    () => {}
  )
}

layui.use(['table'], function () {
  
  table.render({
    elem: '#order-table',
    url: '/order/all',
    toolbar: '#table-toolbar',
    defaultToolbar: ['filter', 'exports', 'print'],
    height: 'full-50',
    css: [
    ].join(''),
    cellMinWidth: 80,
    cols: [[
      {type: 'checkbox', fixed: 'left'},
      {field: 'order_id', fixed: 'left', title: 'ID'},
      {field: 'user_name', title: '用户'},
      {field: 'park_name', title: '停车场', templet: nullMsgFormatter('park_name') },
      {field: 'car_sign', title: '车牌号', templet: nullMsgFormatter('car_sign') },
      {field: 'order_created', title: '订单创建时间', width: 150, templet: nullDateFormatter('order_created') },
      {field: 'order_bookedAt', title: '定金支付时间', width: 150, templet: nullDateFormatter('order_payForBookAt')},
      {field: 'order_created', title: '预约时间', width: 150, templet: nullDateFormatter('order_bookedAt') },
      {field: 'order_applyEnterAt', title: '预约入场时间', width: 150, templet: nullDateFormatter('order_applyEnterAt')},
      {field: 'order_inAt', title: '入场时间', width: 150, templet: nullDateFormatter('order_inAt')},
      {field: 'order_outAt', title: '出场时间', width: 150, templet: nullDateFormatter('order_outAt')},
      {field: 'order_paiedAt', title: '订单支付时间', width: 150, templet: nullDateFormatter('order_paiedAt')},
      {field: 'order_endAt', title: '订单结束时间', width: 150, templet: nullDateFormatter('order_endAt')},
      {field: 'order_cost', title: '订单支付金额', width: 150, templet: nullDateFormatter('order_cost')},
      {field: 'order_status', title: '状态', templet: statusFormater},
      // {fixed: 'right', title:'操作', templet: '#line-operations'}
    ]],
    page: true,
    even: true,
    done: function () {
      console.log('table done')
      $('#table-toolbar-btn-add').addClass('layui-btn-disabled')
      $('#table-toolbar-btn-edit').addClass('layui-btn-disabled')
      $('#table-toolbar-btn-delete').addClass('layui-btn-disabled')
      $('#table-toolbar-btn-info').addClass('layui-btn-disabled')
      if ($('#table-toolbar-btn-invalid').length === 0) {
        $('<button class="layui-btn" id="table-toolbar-btn-invalid" lay-event="invaild">作废</button>').appendTo('#table-toolbar-container')
      }
      // $('#operations-inline').empty()
      // $('#operations-inline').append(`
      //   {{# if(parseInt(d.order_status) === 5){ }}
      //     <button class="layui-btn layui-btn-danger layui-btn-xs layui-disabled" disabled lay-event="info">作废</button>
      //   {{# } else { }}
      //     <button class="layui-btn layui-btn-danger layui-btn-xs" lay-event="info">作废</button>
      //   {{# } }}
      // `)
    }
  })

  table.on('toolbar(order-table)', function (o) {
    let id = o.config.id 
    let checkStatus = table.checkStatus(id)
    let data = checkStatus.dataCache
    let dataC = table.cache['order-table']
    switch (o.event) {
      case 'add':
				console.debug('addi')
				break
      case 'dele':
        console.debug('dele')
        break
			case 'edit':
        console.debug('edit')
				break
      case 'info':
        console.debug('info')
        break
      case 'invaild':
        if (checkStatus.data.length < 1) {
          layer.msg('请至少选择一条记录')
          return
        }
        invalidLayer(checkStatus.data)
        break
      default:
        break
    }
  })
})