let $ = layui.$
let util = layui.util
let layer = layui.layer
let element = layui.element

let tabMap = new Map()

util.event('lay-header-event', {
	menuLeft: function (t) {
		let b = $('#leftCollapseBtn')
		if (b.hasClass('layui-icon-spread-left')) {
			menuLeftCollapse()
		} else {
			menuLeftSpread()
		}

		function menuLeftCollapse() {
			b.removeClass('layui-icon-spread-left').addClass('layui-icon-shrink-right')
			$('.layui-logo').animate({width: '0'})
			$('.layui-side').animate({width: '0'})
			$('.layui-layout-left').animate({left: '0'})
			$('.layui-body').animate({left: '0'})
			$('.layui-footer').animate({left: '0'})
			$('.layui-logo').addClass('layui-hide')
		}

		function menuLeftSpread() {
			b.removeClass('layui-icon-shrink-right').addClass('layui-icon-spread-left')
			$('.layui-logo').animate({width: '200px'})
			$('.layui-side').animate({width: '200px'})
			$('.layui-layout-left').animate({left: '200px'})
			$('.layui-body').animate({left: '200px'})
			$('.layui-footer').animate({left: '200px'})
			$('.layui-logo').removeClass('layui-hide')
		}
	}
})

// lay tab
layui.use(function () {
	util.on('lay-on', {
		toTab: function (othis) {
			// if (tabMap.has())
			console.debug(othis)
			let label = othis.attr('id')
			if (tabMap.has(label)) {
				element.tabChange('tab-handler', `tab-${label}`)
				return
			}
			let forUrl = othis.attr('for')
			element.tabAdd('tab-handler', {
				title: othis.text(),
				content: `<iframe class="w-100 h-100 bw0" title="submodule" id="ifr-${label}" src="${forUrl}"></iframe>`,
				id: `tab-${label}`,
				change: true,
			})
			tabMap.set(label, true)
			$('.layui-tab-item').addClass('w-100 h-100 bw0')
		},
	})
})

element.on('tabDelete(tab-handler)', function (othis) {
	console.debug(othis.id.replace('tab-', ''))
	tabMap.delete(othis.id.replace('tab-', ''))
})
element.on('tab(tab-handler)', function (othis) {
	let thisId = othis.id.replace('tab-', '')
	let menuList = $('#menu-nav').children('li')
	for (let i = 0; i < menuList.length; i += 1) {
		let menu = $(menuList[i])
		if ($(menu.children()[0]).attr('id') === othis.id.replace('tab-', '')) {
			menu.addClass('layui-this')
		} else {
			menu.removeClass('layui-this')
		}
	}
})

let openProfile = function () {
	$.ajax({
		url: '/auth/info',
		type: 'get',
		success: function (res) {
			if (res.status && res.status === 'failed') {
				return layer.msg('个人信息获取失败')
			}
			layer.open({
				type: 1,
				title: '个人信息',
				area: ['400px', 'auto'],
				resize: false,
				content: `
				<div class="layui-panel h-100 flex flex-column justify-between">
					<form>
					<div class="w-100 mv2 flex items-center justify-center">
						<div class="layui-circle" style="width: 80px; height: 80px; cursor: pointer;" lay-filter="hover-area">
							<img src="${res.data.avator}" class="layui-circle" style="width: 80px; user-select: none; " />
							<div class="relative layui-hide" style="top: -50px; left: 26px;" lay-filter="hide-icon" >
								<i class="layui-icon layui-icon-edit" style="font-size: 26px; color: #FFFFFF;"></i> 
							</div>
						</div>
					</div>
					<table border="0" class="w-100 tc collapse ph1" style="border-spacing: 0 10px; border-collapse: separate;">
						<tr class="layui-hide">
							<td class="b">编号</td>
							<td>
								<input class="layui-input" value="${res.data.sub}" lay-filter="edit-id" disabled />
							</td>
						</tr>
						<tr >
							<td class="b">用户名</td>
							<td>
								<input class="layui-input" value="${res.data.name}" disabled />
							</td>
						</tr>
						<tr>
							<td class="b">角色</td>
							<td>
								<input class="layui-input" value="${res.data.role}" disabled />
							</td>
						</tr>
						<tr>
							<td class="b">原密码</td>
							<td>
								<input type="password" class="layui-input" value="123456" placeholder="请输入原密码" lay-filter="edit-password" />
							</td>
						</tr>
						<tr>
							<td class="b">新密码</td>
							<td>
								<input type="password" class="layui-input" value="" placeholder="请输入新密码" lay-filter="edit-password" />
							</td>
						</tr>
						<tr>
							<td class="b">重复密码</td>
							<td>
								<input type="password" class="layui-input" value="" placeholder="请重复新密码" lay-filter="edit-password" />
							</td>
						</tr>
					</table>
					</form>
					<div class="flex items-center justify-end ph1 mv1">
						<button class="layui-btn" lay-on="save">保存更改</button>
					</div>
				</div>
				`,
				success: function (layero, index) {
					console.debug(layero)
					layero.find('div[lay-filter="hover-area"]').on('mouseenter', function () {
						layero.find('div[lay-filter="hide-icon"]').removeClass('layui-hide')
					})
					layero.find('div[lay-filter="hover-area"]').on('mouseleave', function () {
						layero.find('div[lay-filter="hide-icon"]').addClass('layui-hide')
					})
					layero.find('button[lay-on="save"]').on('click', function () {
						let oldPassword = layero.find('input[lay-filter="edit-password"]')[0].value
						let newPassword = layero.find('input[lay-filter="edit-password"]')[1].value
						let repeatPassword = layero.find('input[lay-filter="edit-password"]')[2].value
						console.debug(layero.find('input[lay-filter="edit-id"]')[0].value)
						if (newPassword.length < 6) {
							return layer.msg('密码长度不能小于6位')
						}
						if (newPassword !== repeatPassword) {
							return layer.msg('两次密码不一致')
						}
						$.ajax({
							url: '/auth/set-password',
							method: 'post',
							data: {
								id: layero.find('input[lay-filter="edit-id"]')[0].value,
								password: md5(oldPassword),
								newPassword: md5(newPassword)
							},
							success: function (res) {
								if (res.status && res.status === 'failed') {
									return layer.msg('密码更新失败')
								}	
								layer.closeAll()
								layer.msg('密码更新成功')
							}
						})
					})
				}
			})
		}
	})
}

let logOut = function () {
	$.ajax({
		url: '/auth/out',
		method: 'delete',
		success: function (res) {
			if (res.status && res.status === 'success') {
				window.location.href = '/auth/in'
				return
			}
			layer.msg('退出失败')
		}
	})
}