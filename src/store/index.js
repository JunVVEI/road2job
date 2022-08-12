// 引入vuex
import {createStore} from 'vuex'

// 引入持久化
import createPersistedState from 'vuex-persistedstate'

const store = createStore({

    // 定义数据
    state: {
        info: '',
    },

    //同步方法
    mutations: {
        updateInfo(state, payload) {
            state.info = payload;

        }
    },

    //异步方法
    actions: {

        updateInfoSaync(context, payload) {

            //               同步方法	  内容
            context.commit('updateInfo', payload);

        }
    },

    //计算属性
    getters: {},

    //模块
    modules: {},

    //持久化数据
    plugins: [

        createPersistedState({

            key: 'vuex', // 存储是的名字

            // 也可以是sessionstorage

            storage: window.localStorage

        })]

})

// 抛出
export default store