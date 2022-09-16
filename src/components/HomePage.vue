<template>
  <div id="main">

    <a-button class="editable-add-btn" style="margin-bottom: 8px" @click="handleAdd">Add</a-button>
    <a-table :dataSource="dataSource" :columns="columns" bordered :pagination="false">
      <template #bodyCell="{ column, text, record}">
        <template v-if="column.key === 'link'">
          <a @click="openUrl(text)">{{ text }}</a>
        </template>
        <template v-else-if="column.key === 'status'">
          <div>
            <a-tag :color="status[text]">{{ text }}</a-tag>
          </div>
        </template>
        <template v-else-if="column.dataIndex === 'operation'">
          <a-button type="link" @click="seeDetail(record)">查看详情</a-button>
          <a-button type="link" @click="edit(record)">编辑</a-button>
          <a-popconfirm
              v-if="dataSource.length"
              title="确定删除？"
              ok-text="确定"
              cancel-text="取消"
              @confirm="onDelete(record.key)"
          >
            <a>删除</a>
          </a-popconfirm>
        </template>
      </template>

      <template
          #customFilterDropdown="{ setSelectedKeys, selectedKeys, confirm, clearFilters, column }"
      >
        <div style="padding: 8px">
          <a-input
              ref="searchInput"
              :placeholder="`Search ${column.dataIndex}`"
              :value="selectedKeys[0]"
              style="width: 188px; margin-bottom: 8px; display: block"
              @change="e => setSelectedKeys(e.target.value ? [e.target.value] : [])"
              @pressEnter="handleSearch(selectedKeys, confirm, column.dataIndex)"
          />
          <a-button
              type="primary"
              size="small"
              style="width: 90px; margin-right: 8px"
              @click="handleSearch(selectedKeys, confirm, column.dataIndex)"
          >
            <template #icon>
              <SearchOutlined/>
            </template>
            Search
          </a-button>
          <a-button size="small" style="width: 90px" @click="handleReset(clearFilters)">
            Reset
          </a-button>
        </div>
      </template>
    </a-table>

    <a-modal v-model:visible="showAdd" title="新增数据" @ok="handleAddOk" style="width: 50vw">
      <a-form
          :model="newRow"
          name="basic"
          :label-col="{ span: 6 }"
          :wrapper-col="{ span: 16 }"
          autocomplete="off"
      >
        <a-form-item label="公司">
          <a-input v-model:value="newRow.company"/>
        </a-form-item>
        <a-form-item label="岗位">
          <a-input v-model:value="newRow.job"/>
        </a-form-item>
        <a-form-item label="投递地址">
          <a-input v-model:value="newRow.link"/>
        </a-form-item>
        <a-form-item label="投递时间">
          <a-date-picker
              v-model:value="newRow.submitTime"
              format="YYYY-MM-DD HH:mm:ss"
              valueFormat="YYYY-MM-DD HH:mm:ss"
              :show-time="{ defaultValue: dayjs('00:00:00', 'HH:mm:ss') }"
          />
        </a-form-item>
        <a-form-item label="状态">
          <a-radio-group v-model:value="newRow.status">
            <a-radio v-for="(value, key) in status" :key="key" :value="key">{{ key }}</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="岗位描述">
          <a-textarea v-model:value="newRow.jd" placeholder="请输入岗位详情" :rows="20"/>
        </a-form-item>
        <a-form-item label="备注">
          <a-textarea v-model:value="newRow.comment" placeholder="备注" :rows="5"/>
        </a-form-item>
      </a-form>
    </a-modal>
    <a-modal v-model:visible="showDetail" title="详情" @ok="handleDetailOk" style="width: 50vw">
      <a-descriptions bordered :column="1">
        <a-descriptions-item class="descriptions-item" v-for="(value, key) in rowInfo" :key="key" :label="key">
          {{ value }}
        </a-descriptions-item>
      </a-descriptions>
    </a-modal>
    <a-modal v-model:visible="showEdit" title="编辑" @ok="handleEditOk" style="width: 50vw">
      <a-form
          :model="editData"
          name="basic"
          :label-col="{ span: 6 }"
          :wrapper-col="{ span: 16 }"
          autocomplete="off"
      >
        <a-form-item label="公司" name="公司">
          <a-input v-model:value="editData.company"/>
        </a-form-item>
        <a-form-item label="岗位" name="job">
          <a-input v-model:value="editData.job"/>
        </a-form-item>
        <a-form-item label="投递地址" name="link">
          <a-input v-model:value="editData.link"/>
        </a-form-item>
        <a-form-item label="投递时间" name="submitTime">
          <a-date-picker
              v-model:value="editData.submitTime"
              format="YYYY-MM-DD HH:mm:ss"
              valueFormat="YYYY-MM-DD HH:mm:ss"
              :show-time="{ defaultValue: dayjs('00:00:00', 'HH:mm:ss') }"
          />
        </a-form-item>
        <a-form-item label="状态">
          <a-radio-group v-model:value="editData.status">
            <a-radio v-for="(value, key) in status" :key="key" :value="key">{{ key }}</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="岗位描述" name="jd">
          <a-textarea v-model:value="editData.jd" placeholder="请输入岗位详情" :rows="20"/>
        </a-form-item>
        <a-form-item label="备注" name="jd">
          <a-textarea v-model:value="editData.comment" placeholder="备注" :rows="5"/>
        </a-form-item>
      </a-form>
    </a-modal>

  </div>
</template>

<script>
import {computed, onMounted, reactive, ref} from "vue"
import dayjs from 'dayjs'

export default {
  setup() {
    const key2title = {
      company: '公司',
      job: '岗位',
      link: '投递连接',
      submitTime: '投递时间',
      status: '状态',
      jd: '岗位详情',
      comment: '备注',
    }
    const status = {
      '筛选中': 'blue',
      '流程中': 'green',
      '已终止': 'red',
      'OC': 'purple',
      '无回应': 'pink'
    }
    const columns = [
      {
        dataIndex: 'number',
        key: 'number',
        title: '序号',
        width: 70,
        align: 'center',
        customRender: (value) => value.index + 1
      },
      {
        title: key2title.company,
        dataIndex: 'company',
        key: 'company',
        customFilterDropdown: true,
        onFilter: (value, record) =>
            record.company.toString().toLowerCase().includes(value.toLowerCase()),
        onFilterDropdownVisibleChange: visible => {
          if (visible) {
            setTimeout(() => {
              searchInput.value.focus();
            }, 100);
          }
        },
      },
      {
        title: key2title.job,
        dataIndex: 'job',
        key: 'job',
      },
      {
        title: key2title.link,
        dataIndex: 'link',
        key: 'link',
        ellipsis: true
      },
      {
        title: key2title.submitTime,
        dataIndex: 'submitTime',
        key: 'submitTime',
        sorter: (a, b) => {
          return a.submitTime < b.submitTime ? 1 : -1
        }
      },
      {
        title: key2title.status,
        dataIndex: 'status',
        key: 'status',
        filters: [
          {
            text: '筛选中',
            value: '筛选中',
          },
          {
            text: '流程中',
            value: '流程中',
          },
          {
            text: '已终止',
            value: '已终止',
          },
          {
            text: 'OC',
            value: 'OC',
          },
          {
            text: '无回应',
            value: '无回应',
          }
        ],
        onFilter: (value, record) => record.status.indexOf(value) === 0,
      },
      {
        title: '操作',
        dataIndex: 'operation',
      }
    ]
    const dataSource = ref([])
    const count = computed(() => dataSource.value.length + 1)

    let showAdd = ref(false)
    let newRow = reactive({})

    let showDetail = ref(false)
    let rowInfo = ref({})

    let showEdit = ref(false)
    let editData = ref({})

    let searchInput = ref();
    let state = reactive({
      searchText: '',
      searchedColumn: '',
    });

    onMounted(() => {
      window.ipcRenderer.on("dataSource", (e, arg) => {
        dataSource.value = JSON.parse(arg)
      })

      read()
    })

    const handleAdd = () => {
      showAdd.value = true
    }
    const handleAddOk = () => {
      const newData = JSON.parse(JSON.stringify(newRow))
      newData.key = `${count.value}`
      dataSource.value.push(newData)

      save()

      showAdd.value = false
      resetNewRow()
    }
    const resetNewRow = () => {
      for (let key in newRow) {
        newRow[key] = ''
      }
    }

    const seeDetail = (recorde) => {
      rowInfo.value = {}
      for (let key in key2title) {
        rowInfo.value[key2title[key]] = recorde[key]
      }
      showDetail.value = true
    }
    const handleDetailOk = () => {
      showDetail.value = false
    }

    const edit = (recorde) => {
      editData.value = JSON.parse(JSON.stringify(recorde))
      showEdit.value = true
    }
    const handleEditOk = () => {
      dataSource.value[editData.value['key'] - 1] = editData.value
      save()
      showEdit.value = false
    }

    const onDelete = key => {
      dataSource.value = dataSource.value.filter(item => item.key !== key)
      save()
    }

    const handleSearch = (selectedKeys, confirm, dataIndex) => {
      confirm();

      state.searchText = selectedKeys[0];
      state.searchedColumn = dataIndex;
    };

    const handleReset = clearFilters => {
      clearFilters({confirm: true});
      state.searchText = '';
    };

    const read = () => {
      window.ipcRenderer.send("read")
    }
    const save = () => {
      window.ipcRenderer.send("write", JSON.stringify(dataSource.value))
    }

    const openUrl = (url) => {
      window.ipcRenderer.send("openUrl", url)
    }

    return {
      dayjs,

      status,
      dataSource,
      columns,
      showAdd,
      newRow,
      showDetail,
      rowInfo,
      showEdit,
      editData,
      searchInput,
      state,

      handleAddOk,
      handleAdd,

      handleSearch,
      handleReset,

      seeDetail,
      handleDetailOk,

      edit,
      handleEditOk,

      onDelete,

      openUrl
    }
  },

}
</script>

<style>
#main {
  padding: 30px
}

.descriptions-item {
  white-space: pre-line
}
</style>