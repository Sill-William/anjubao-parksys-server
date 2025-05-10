let $ = layui.$
let form = layui.form 

form.on('submit(submit)', function (o) {
  let data = o.field
  data.password = md5(data.password)
  // $.post('/auth/in', {
  //   ...data,
  // }).then(res => {
  //   if (res.status && res.status === 'failed') {
  //     return layer.msg(res.message)
  //   }
  //   layer.msg('登录成功')
  //   setTimeout(() => {
  //     window.location.href = '/background/tg'
  //   }, 1000)
  // })
  $.ajax({
    url: '/auth/in',
    type: 'post',
    headers: {
      'X-Role': 'admin'
    },
    data: {
      ...data,
    },
    success: function (res) {
      console.debug(res)
      if (res.status && res.status === 'failed') {
        return layer.msg(res.message)
      }
      layer.msg('登录成功')
      setTimeout(() => {
        window.location.href = '/background/tg'
      }, 1000) 
    }
  })
  return false
})
form.render()