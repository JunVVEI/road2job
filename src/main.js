// import { createApp } from 'vue'
// import App from './App.vue'
//
// createApp(App).mount('#app')

import {createApp} from 'vue';
import Antd from 'ant-design-vue';
import App from './App';
import 'ant-design-vue/dist/antd.css';

// 引入store/index.js 文件
import store from './store'

const app = createApp(App);

app.use(Antd).mount('#app');

app.use(store) //注册vuex

