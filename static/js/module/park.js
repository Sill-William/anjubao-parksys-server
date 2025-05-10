let $ = layui.$
let form = layui.form
let layer = layui.layer
let table = layui.table
let dropdown = layui.dropdown 

let formLayer = (o) => {
   let content = `
<div class="pa3">
  <form class="layui-form" layui-filter="park-${o ? 'edit' : 'addi'}-form">
    <div class="layui-form-item">
      <label class="layui-form-label">名称</label>
      <div class="layui-input-block">
        <input type="text" name="name" required lay-verify="required" placeholder="请输入停车场名称" autocomplete="off" class="layui-input" value="${o ? o.name : ''}" />
      </div>
    </div>
    <div class="layui-form-item">
      <label class="layui-form-label">地址</label>
      <div class="layui-input-block">
        <input type="text" name="address" required lay-verify="required" placeholder="请输入停车场地址" autocomplete="off" class="layui-input" value="${o ? o.address : ''}"
          id="address-autocompleted" lay-filter="address-autocompleted" />
      </div>
    </div>
    <div class="layui-form-item">
      <label class="layui-form-label">负责人</label>
      <div class="layui-input-block">
        <input type="text" name="responsible" required lay-verify="required" placeholder="请输入停车场负责人姓名" autocomplete="off" class="layui-input" value="${o ? o.responsible : ''}" />
      </div>
    </div>
    <div class="layui-form-item">
      <label class="layui-form-label">联系电话</label>
      <div class="layui-input-block">
        <input type="text" name="phone" required lay-verify="required|phone" placeholder="请输入停车场联系电话" autocomplete="off" class="layui-input" value="${o ? o.phone : ''}" />
      </div>
    </div>
    <div class="layui-form-item">
      <label class="layui-form-label">邮箱</label>
      <div class="layui-input-block">
        <input type="text" name="email" required lay-verify="required|email" placeholder="请输入停车场邮箱" autocomplete="off" class="layui-input" value="${o ? o.email : ''}" />
      </div>
    </div>
    <div class="layui-form-item">
      <label class="layui-form-label">最大车容量</label>
      <div class="layui-input-block">
        <input type="number" name="capacity" required lay-verify="required" placeholder="请输入停车场最大车容量" min="0" autocomplete="off" class="layui-input" value="${o ? o.capacity : 0}" />
      </div>
    </div>
    <div class="layui-form-item">
      <label class="layui-form-label">预定价格</label>
      <div class="layui-input-block">
        <input type="number" name="bookingFee" required lay-verify="required" placeholder="请输入停车场预定价格" min="0" autocomplete="off" class="layui-input" value="${o ? o.bookingFee : 0}" />
      </div>
    </div>
    <div class="layui-form-item">
      <label class="layui-form-label">描述</label>
      <div class="layui-input-block">
        <textarea type="text" name="description" required autocomplete="off" class="layui-textarea" placeholder="请输入停车场描述" 
          height="80" lay-filter="form-description" />
      </div>
    </div>
    <div class="layui-form-item layui-hide">
      <label class="layui-form-label">经度</label>
      <div class="layui-input-block">
        <input type="text" name="lat" autocomplete="off" lay-verify="select" class="layui-input" lay-filter="lat-auto-input" />
      </div>
    </div>
    <div class="layui-form-item layui-hide">
      <label class="layui-form-label">纬度</label>
      <div class="layui-input-block">
        <input type="text" name="lng" autocomplete="off" lay-verify="select" class="layui-input" lay-filter="lng-auto-input" />
      </div>
    </div>
    <div class="layui-form-item">
      <div class="layui-input-block">
        <button class="layui-btn" lay-submit lay-filter="${o ? 'park-edit-form-submit' : 'park-addi-form-submit'}">提交</button>
        <button type="reset" class="layui-btn layui-btn-primary">重置</button>
      </div>
    </div>
    <div class="layui-form-item">
      <label class="layui-form-label">位置预览</label>
      <div class="layui-input-block">
        <img lay-filter="form-map-shown" width="100%" />
      </div>
    </div>
  </form>
  <!-- <div class="w-100 h-100">
    <img lay-filter="form-map-shown" width="100%" /> 
  </div> -->
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
    let addressCompleted = layero.find('input[lay-filter="address-autocompleted"]')
    let lngAutoInput = layero.find('input[lay-filter="lng-auto-input"]')
    let latAutoInput = layero.find('input[lay-filter="lat-auto-input"]')
    let addressDropdownLength = addressCompleted.outerWidth()
    if (!!o) {
      // the textarea is not support the value property so we use script to set the value 
      let description = layero.find('textarea[lay-filter="form-description"]')
      description.val(o.description)
      // initial the static map
      $.ajax({
        url: `/park/location/image?lng=${o.lng}&lat=${o.lat}`,
        method: 'get', 
        success: function (res) {
          if (!res.attached) {
            layer.msg('获取地址失败')
            return
          }
          let img = layero.find('img[lay-filter="form-map-shown"]')
          img.attr('src', res.data) 
        }
      })
    }
    let dropdownInst = dropdown.render({
      elem: '#address-autocompleted',
      data: [],
      style: `min-width: ${addressDropdownLength}px;`,
      closeOnClick: true,
      click: function (o) {
        addressCompleted.val(o.title)
        lngAutoInput.val(o.data.location.lng)
        latAutoInput.val(o.data.location.lat)
        $.ajax({
          url: `/park/location/image?lng=${o.data.location.lng}&lat=${o.data.location.lat}`,
          method: 'get',
          success: function (res) {
            if (!res.attached) {
              layer.msg('获取地址失败')
              return
            }
            console.debug(res.data)
            let img = layero.find('img[lay-filter="form-map-shown"]')
            img.attr('src', res.data)
          }
        })
      }
    })
    layero.find('input[lay-filter="address-autocompleted"]').on('input', function () {
      let value = $(this).val()
      if (value === '') {
        return
      }
      $.ajax({
        url: `/park/associate/${value}`,
        method: 'get',
        success: function (res) {
          if (!res.attached || !res.data) {
            layer.msg('获取地址失败')
            return
          }
          dropdown.reloadData(dropdownInst.config.id, {
            data: res.data.map(rs => ({ title: rs.address, id: rs.id, data: rs })),
          })
        }
      })
    })
    form.verify({
      phone: function (v) {
        if (!/^1[3456789]\d{9}$/.test(v)) {
          return '请输入正确的手机号' 
        }
      },
      email: function (v) {
        if (!/^[a-zA-Z0-9_.-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(v)) {
          return '请输入正确的邮箱地址'
        } 
      },
      select: function (v) {
        if (!o && !v) {
          return '请选择系统提供的地址信息'
        }
      }
    })
    const submitFunc = function (fo) {
      if (!!o) {
        fo.field.id = o.id
        fo.field.lat = o.lat
        fo.field.lng = o.lng
      }
      console.debug(fo.field)
      $.ajax({
        url: '/park/',
        method: o ? 'PUT' : 'POST',
        data: fo.field,
        success: function (res) {
          if (!res.attached) {
            layer.msg(o ? '修改失败' : '添加失败')
            return
          }
          layer.closeAll()
          layer.msg(o? '修改成功' : '添加成功')
          table.reload('park-table')
        }
      })
      return false
    }
    form.on('submit(park-addi-form-submit)', submitFunc)
    form.on('submit(park-edit-form-submit)', submitFunc)
    form.render()
  }
})
}

let infoLayer = (o) => {
  const { id, name, address, responsible, phone, email, description } = o 
  let content = `
  <div>
    <table class="layui-table"> 
      <tr>
        <td>ID</td>
        <td>${id}</td>
      </tr>
      <tr>
        <td>名称</td>
        <td>${name}</td>
      </tr>
      <tr>
        <td>地址</td>
        <td>${address}</td>
      </tr>
      <tr>
        <td>负责人</td>
        <td>${responsible}</td>
      </tr>
      <tr>
        <td>联系方式</td>
        <td>${phone}</td>
      </tr>
      <tr>
        <td>邮箱</td>
        <td>${email}</td>
      </tr>
      <tr>
        <td>描述</td>
        <td>${description}</td>
      </tr>
      <tr>
        <td>最大车容量</td>
        <td>${o.capacity}</td>
      </tr>
      <tr>
        <td>剩余车位</td>
        <td>${o.rest}</td>
      </tr>
      <tr>
        <td>预定价格</td>
        <td>${o.bookingFee}</td>
      </tr>
      <tr>
        <td>地图预览</td>
        <td style="height: 300px;">
          <img lay-filter="info-map-shown" style="min-width: 100%; height: auto; object-fit: cover;" />
        </td>
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
    success: function (layero, index) {
      $.ajax({
        url: `/park/location/image?lng=${o.lng}&lat=${o.lat}`,
        method: 'get',
        success: function (res) {
          if (!res.attached) {
            layer.msg('获取地址失败')
            return
          }
          let img = layero.find('img[lay-filter="info-map-shown"]')
          img.attr('src', res.data)
        } 
      })    
    }
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
          url: `/park/${item.id}`,
          method: 'delete',
          error: function (res) {
            cnt -= 1
          }
        })
      })
      setTimeout(() => {
        layer.closeAll()
        layer.msg('删除成功'+ cnt +'条数据')
        table.reload('park-table', { url: '/park/all' })
      }, 1000)
    },
    () => {}
  )
}

layui.use(['table'], function () {
  table.render({
    elem: '#park-table',
    url: '/park/all',
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
      {field: 'name', title: '名称', minWidth: 200 },
      {field: 'address', title: '地址', minWidth: 350 },
      {field: 'responsible', title: '负责人'},
      {field: 'phone', title: '电话' },
      // {field: 'email', title: '邮箱' },
      {field: 'capacity', title: '最大车容量' },
      {field: 'rest', title: '剩余车位'},
      {field: 'bookingFee', title: '预定价格' },
      {field: 'description', title: '描述', width: 150 },
      {fixed: 'right', title:'操作', minWidth: 150, templet: '#line-operations'}
    ]],
    done: function () {
      console.log('table done')
    }
  })

  table.on('toolbar(park-table)', function (o) {
    let id = o.config.id
    let checkStatus = table.checkStatus(id)
    let data = checkStatus.dataCache
    let dataC = table.cache['park-table']
    switch (o.event) {
      case 'addi':
				console.debug('addi')
        formLayer()
				break
      case 'dele':
        if (checkStatus.data.length < 1) {
          layer.msg('请至少选择一条记录')
          return
        }
        console.debug('dele')
        deleteConfirm(checkStatus.data)
        break
			case 'edit':
        if (checkStatus.data.length !== 1) {
          layer.msg('请选择且最多选择一条记录')
          return
        }
        formLayer(checkStatus.data[0])
        console.debug('edit')
				break
      case 'info':
        if (checkStatus.data.length !== 1) {
          layer.msg('请选择且最多选择一条记录')
          return 
        }
        infoLayer(checkStatus.data[0])
        console.debug('info')
        break
      default:
        break
    }
  })

  table.on('tool(park-table)', function (o) {
    let data = o.data
    switch (o.event) {
      case 'info':
        infoLayer(data)
        break
      case 'edit':
        formLayer(data)
        break
      case 'dele':
        deleteConfirm([data])
        break
      default:
        break
    }
  })
})

