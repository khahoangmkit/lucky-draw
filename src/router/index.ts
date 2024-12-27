import { createRouter, createWebHistory } from 'vue-router';
import Layout from '@/layout/index.vue';
import Home from '@/views/Home/index.vue';
export const configRoutes={
    path: '/log-lottery/config',
    name: 'Config',
    component: () => import('@/views/Config/index.vue'),
    children: [
        {
        path: '',
        redirect: '/log-lottery/config/person',
      },
      {
        path: '/log-lottery/config/person',
        name: 'PersonConfig',
        component: () => import('@/views/Config/Person/PersonConfig.vue'),
        meta: {
          title: 'Employee',
          icon: 'person',
        },
        children:[
            {
                path:'',
                redirect: '/log-lottery/config/person/all',
            },
            {
                path:'/log-lottery/config/person/all',
                name:'AllPersonConfig',
                component:()=>import('@/views/Config/Person/PersonAll.vue'),
                meta:{
                    title:'All Employees',
                    icon:'all'
                }
            },
            {
                path:'/log-lottery/config/person/already',
                name:'AlreadyPerson',
                component:()=>import('@/views/Config/Person/PersonAlready.vue'),
                meta:{
                    title:'Already Person',
                    icon:'already'
                }
            },
            // {
            //     path:'other',
            //     name:'OtherPersonConfig',
            //     component:()=>import('@/views/Config/Person/OtherPersonConfig.vue'),
            //     meta:{
            //         title:'其他配置',
            //         icon:'other'
            //     }
            // }
        ]
      },
      {
        path: '/log-lottery/config/prize',
        name: 'PrizeConfig',
        component: () => import('@/views/Config/Prize/PrizeConfig.vue'),
        meta:{
            title: 'Prize',
            icon: 'prize'
        }
      },
      {
        path:'/log-lottery/config/global',
        name:'GlobalConfig',
        redirect: '/log-lottery/config/global/all',
        meta:{
            title:'Global',
            icon:'global'
        },
        children:[
            {
                path:'/log-lottery/config/global/face',
                name:'FaceConfig',
                component:()=>import('@/views/Config/Global/FaceConfig.vue'),
                meta:{
                    title:'Home',
                    icon:'face'
                }
            },
            {
                path:'/log-lottery/config/global/image',
                name:'ImageConfig',
                component:()=>import('@/views/Config/Global/ImageConfig.vue'),
                meta:{
                    title:'Image',
                    icon:'image'
                }
            },
            // {
            //     path:'/log-lottery/config/global/music',
            //     name:'MusicConfig',
            //     component:()=>import('@/views/Config/Global/MusicConfig.vue'),
            //     meta:{
            //         title:'music',
            //         icon:'music'
            //     }
            // }
        ]
      },
      // {
      //   path: '/log-lottery/config/readme',
      //   name: 'Readme',
      //   component: () => import('@/views/Config/Readme/index.vue'),
      //   meta:{
      //       title: '操作说明',
      //       icon: 'readme'
      //   }
      // },
    ]
  }
const routes = [
  {
    path: '/log-lottery',
    component: Layout,
    redirect: '/log-lottery/home',
    children: [
      {
        path: '/log-lottery/home',
        name: 'Home',
        component: Home,
      },
      {
        path:'/log-lottery/demo',
        name:'Demo',
        component:()=>import('@/views/Demo/index.vue')
      },
      configRoutes,
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
