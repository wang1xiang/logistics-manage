// eslint-disable-next-line
import { UserLayout, BasicLayout, RouteView } from '@/layouts'

/**
 * 基础路由
 * @type { *[] }
 */
export const constantRouterMap = [
  {
    path: '/user',
    component: UserLayout,
    redirect: '/user/login',
    hidden: true,
    children: [
      {
        path: 'login',
        name: 'login',
        component: () => import(/* webpackChunkName: "user" */ '@/views/user/Login')
      }
    ]
  }, {
    path: '/',
    name: 'index',
    component: BasicLayout,
    redirect: '/batchrManage',
    children: [
      // batchr
      {
        path: '/batchrManage',
        name: 'BatchrManage',
        component: () => import('@/views/batchManage'),
        meta: { title: '批次管理', icon: 'profile' }
      }, {
        path: '/orderManage',
        name: 'OrderManage',
        component: () => import('@/views/orderManage'),
        meta: { title: '订单管理', icon: 'profile' }
      }, {
        path: '/OrderDetail',
        name: 'OrderDetail',
        component: () => import('@/views/orderManage/form/OrderDetail'),
        meta: { title: '订单详情', icon: 'profile' }
      }, {
        path: '/userManage',
        name: 'UserManage',
        component: () => import('@/views/userManage'),
        meta: { title: '用户管理', icon: 'user' }
      },
      {
        name: 'refresh',
        path: '/refresh',
        hidden: true,
        component: () => import('@/views/Refresh')
      }
    ]
  },
  {
    path: '*', redirect: '/404', hidden: true
  },
  {
    path: '/404',
    component: () => import(/* webpackChunkName: "fail" */ '@/views/exception/404')
  }

]
